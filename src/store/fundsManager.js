import Logit from '@utils/logit';
import { getTimestamp } from '@utils/dateFns';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';
import { current } from 'immer';
var logit = Logit('store/fundsManager');

const traceMe = true;
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    fundsManager                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const fundsManager = (draft, action) => {
  logit('recipe', { ...draft.bookings }, { ...draft.payments }, draft, action);
  switch (action.type) {
    case 'BOOK':
      bookingChange(draft, action);
      break;
    case 'ANNOTATE':
      annotateBooking(draft, action);
      break;
    case 'PAYMENT':
      paymentReceived(draft, action);
      break;
    default:
      break;
  }
  logit('repipe after', draft);
};

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    paymentReceived                       ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const paymentReceived = (draft, payload) => {
  logit('paymentReceived', payload);
  if (payload.amount <= 0) {
    throw new Error(`${payload.paymentId} strange amount for payment: ${payload.amount}`);
  }
  if (/^.X$/.test(payload.req)) return processRefund(draft, payload);
  const payment = createPayment(draft, payload);
  const { paymentId } = payment;
  // this.balance = payment.amount;
  draft.paymentsStack.push(paymentId);
  _.sortBy(draft.paymentsStack, _.identity);

  allocateFunds(draft);
  tracePayment(payment);

  return draft;
};
const createPayment = (draft, payload) => {
  const { req, amount, note, accountId } = payload;
  const timeS = getTimestamp();
  const payment = {
    paymentId: timeS,
    accountId,
    req,
    who: '???',
    note,
    amount,
    Allocations: [],
    available: amount,
    updatedAt: timeS,
  };
  draft.lastAction = [timeS, `${accountId}`, 'payment', `${req} £${amount}`];

  draft.payments[timeS] = payment;
  return payment;
};
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃              bookingChange                         ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const bookingChange = (draft, payload) => {
  const booking = upsertBooking(draft, payload);
  if (!booking) return;
  if (/^[BC]X$/.test(booking.status)) {
    return processCancellation(draft, booking);
  }
  if (!/^[BC]$/.test(booking.status)) return traceBooking(draft, booking);
  logit('bookingChange 0', booking);
  const { fee, bookingId } = booking;
  const paid = booking.Allocations.reduce((tot, alloc) => tot + alloc.amount, 0);
  const owing = fee - paid;
  booking.owing = owing;
  if (owing === 0) return traceBooking(booking);
  draft.bookingsStack.push(bookingId);
  _.sortBy(draft.bookingsStack, _.identity);

  logit('bookingChange 1', booking);
  allocateFunds(draft);
  logit('bookingChange 2', booking);
  traceBooking(booking);
  return draft;
};

const factor = { B: 1, C: 0.5, BX: 0, CX: 0, BL: 1 };

const upsertBooking = (draft, payload) => {
  const { req, memberId, walkId, fee: walkFee } = payload;
  const dat = getTimestamp();
  const bookingId = walkId + memberId;
  let booking = draft.bookings[bookingId];
  if (!booking) {
    booking = {
      bookingId,
      walkId,
      memberId,
      BookingLogs: [],
      Allocations: [],
      createdAt: dat,
    };
    logit('booking 1', booking, dat);
  } else {
    logit('booking 1', current(booking), dat);
  }
  if (req === booking.status) return null;
  let late = booking.late || req === 'BL';
  const fee = walkFee * factor[req];
  draft.lastAction = [dat, `${memberId} ${walkId}`, 'booking', req];
  logit('lastAction', draft.lastAction);
  let log = { id: dat, bookingId, dat, req, who: '???', fee, late };
  if (booking.status === 'BL' && req === 'BX') {
    // log = booking.BookingLogs.pop();
    // log.req = req;
    log.late = false;
    late = false;
  }
  booking = { ...booking, fee, late, status: req, updatedAt: dat };
  booking.BookingLogs.push(log);
  draft.bookings[bookingId] = booking;
  logit('booking 2', booking, dat);
  return booking;
};

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             allocateFunds                        ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const allocateFunds = (draft) => {
  logit('allocate funds pre:', [...draft.bookingsStack], [...draft.paymentsStack]);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let bookingId = _.first(draft.bookingsStack);
    let paymentId = _.first(draft.paymentsStack);
    if (!(bookingId && paymentId)) break;
    const booking = draft.bookings[bookingId];
    const payment = draft.payments[paymentId];

    const amount = Math.min(booking.owing, payment.available);
    booking.owing -= amount;
    payment.available -= amount;
    const updatedAt = latestOf(booking.updatedAt, payment.updatedAt);
    booking.updatedAt = updatedAt;
    payment.updatedAt = updatedAt;
    const allocation = {
      bookingId,
      // bookingTransactionDate: booking.updatedAt,
      paymentId,
      amount,
      updatedAt,
      // Payment: payment,
    };
    // ToDo: get the real booking and payment objects
    booking.Allocations.push(allocation);
    payment.Allocations.push(allocation);
    // allocs.push(allocation);
    if (booking.owing === 0) {
      draft.bookingsStack.shift();
    }
    if (payment.available === 0) {
      draft.paymentsStack.shift();
    }
  }
  const debt = draft.bookingsStack.reduce((tot, id) => tot + draft.bookings[id].owing, 0);
  const credit = draft.paymentsStack.reduce(
    (tot, id) => tot + draft.payments[id].available,
    0,
  );
  draft.balance = credit - debt;

  logit('allocate funds post:', [...draft.bookingsStack], [...draft.paymentsStack]);
  return;
};
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    processRefund               ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const processRefund = (draft, payload) => {
  // money return to user.
  // need to find equivalent amount in used payments and remove them
  const refund = createRefund(draft, payload);
  let refundAmount = refund.amount;
  while (refundAmount > 0) {
    logit('process refund', refund, [...draft.paymentsStack]);
    const paymentId = _.first(draft.paymentsStack);
    const payment = draft.payments[paymentId];
    const amount = Math.min(refundAmount, payment.available);
    payment.available -= amount;
    refundAmount -= amount;
    refund.available -= amount;
    payment.updatedAt = refund.updatedAt;
    const allocation = {
      paymentId,
      refundId: refund.refundId,
      amount,
      updatedAt: refund.refundId,
      // Payment: payment,
    };
    refund.Allocations.push(allocation);
    payment.Allocations.push(allocation);

    if (payment.available === 0) draft.paymentsStack.shift();
  }

  tracePayment(refund);
  if (refundAmount > 0) {
    throw new Error(`${refund.refundId} over repayment by: ${refundAmount}`);
  }
};
const createRefund = (draft, payload) => {
  const { req, amount, note, accountId } = payload;
  const timeS = getTimestamp();
  const refund = {
    refundId: timeS,
    accountId,
    req,
    who: '???',
    note,
    amount,
    Allocations: [],
    available: amount,
  };
  draft.refunds[timeS] = refund;
  return refund;
};
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃          processDeletePayment                  ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const processDeletePayment = (draft, paymentId) => {
  const payment = draft.payments[paymentId];
  logit('deleteing payment', current(draft).payments[paymentId]);
  for (const alloc of payment.Allocations || []) {
    const bkng = draft.bookings[alloc.bookingId];
    bkng.owing += alloc.amount;
  }
  draft.paymentsStack = draft.paymentsStack.filter((pymntId) => pymntId !== paymentId);

  // rome-ignore lint/performance/noDelete: <explanation>
  delete draft.payments[paymentId];
};

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃          processDeleteRefund                   ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const processDeleteRefund = (draft, refundId) => {
  const refund = draft.refunds[refundId];
  logit('deleteing refund', current(draft).refunds[refundId]);
  for (const alloc of refund.Allocations || []) {
    const payment = draft.payments[alloc.paymentId];
    payment.available += alloc.amount;
    draft.paymentsStack = [...draft.paymentsStack, payment.paymentId];
  }
  draft.paymentsStack = _.sortedUniq(draft.paymentsStack);

  // rome-ignore lint/performance/noDelete: <explanation>
  delete draft.refunds[refundId];
};

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃          processCancellation                   ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const processCancellation = (draft, booking) => {
  // return any funds allocated to this booking
  logit('cancelation', booking);
  let allocs = _.groupBy(booking.Allocations, (a) => a.paymentId);
  allocs = Object.values(allocs)
    .map((p) =>
      p.reduce(
        (res, a) => {
          const amount = res.amount + a.amount;
          return { ...a, amount };
        },
        { amount: 0 },
      ),
    )
    .filter((a) => a.amount > 0);
  logit('grouped allocs', allocs);
  allocs.forEach((alloc) => {
    let { paymentId, amount } = alloc;
    const payment = draft.payments[paymentId];
    let pymt = draft.paymentsStack.find((pymntId) => pymntId === paymentId);

    if (!pymt) {
      // put payment back on the available payments stack
      draft.paymentsStack.push(paymentId);
      _.sortBy(draft.paymentsStack, _.identity);
      paymentId = _.first(draft.paymentStack);
    }
    if (amount <= 0) return;
    payment.available += alloc.amount;
    amount = -1 * amount;
    payment.updatedAt = booking.updatedAt;
    const reverse = {
      ...alloc,
      amount,
      updatedAt: payment.updatedAt,
    };
    delete reverse.id;
    booking.Allocations.push(reverse);
    // eslint-disable-next-line no-unused-vars
    const { Walk, Allocations, ...bkng } = booking;
    reverse.Booking = bkng;
    payment.Allocations.push(reverse);
    logit('cancellation', reverse, payment, booking);
  });
  booking.owing = 0;
  booking.fee = 0;
  // remove booking if it's still in the outstanding Stack
  draft.bookingsStack = draft.bookingsStack.filter(
    (bkng) => bkng.bookingId !== booking.bookingId,
  );
  // reallocate any unused funds
  allocateFunds(draft);
  traceBooking(booking);
  return;
};
export const annotateBooking = (draft, payload) => {
  const { bookingId, annotation } = payload;
  logit('in action', payload, Object.keys(draft.bookings));
  const booking = draft.bookings[bookingId];
  const dat = getTimestamp();

  draft.lastAction = [
    dat,
    `${booking.memberId} ${booking.walkId}`,
    'annotate',
    annotation,
  ];

  booking.annotation = annotation;
  return draft;
};

const traceBooking = (booking) => {
  if (!traceMe) return;
  const { updatedAt: at, owing, status } = booking;
  const venue = booking.Walk?.venue ?? '???';
  const what = sprintf('%-2s  £%2d', status, owing || 0);
  console.log(`${at} ${venue} `.padEnd(40).substr(0, 40), what, StackStatus);
};
const tracePayment = (payment) => {
  if (!traceMe) return;
  const { paymentId, refundId, amount, req } = payment;
  const what = sprintf('%-2s  £%2d', req, amount);
  console.log(`${paymentId || refundId} payment`.padEnd(40), what, StackStatus);
};
const StackStatus = '';

function latestOf(au, bu) {
  return au.localeCompare(bu) > 0 ? au : bu;
}
// export default new FundsManager();
