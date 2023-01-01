import { writable, derived, get } from 'svelte/store';
import { fetchData } from '@utils/use-data-api';
import { produceWithPatches, enablePatches } from 'immer';
import { nameIndex } from './nameIndex.js';
import {
  bookingChange,
  annotateBooking,
  paymentReceived,
  allocateFunds,
  processDeletePayment,
  processDeleteRefund,
} from './fundsManager';
import { format, addDays } from 'date-fns';
import { currentMemberId } from './memberCurrent';
import { addToQueue as addToPatchesQueue } from './patches';
// import { prepareUserTransactionData } from './prepareUserTransactionData';
import { prepareUserTransactionDataByWalkId } from './prepareUserTransactionDataByWalkId';

import _ from 'lodash';
import Logit from '@utils/logit';

var logit = Logit('store/accountStatus');
enablePatches();
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    stores                         ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const sortFn = writable('byDate');
// ! from newStartDate to startDate goes forward in time
export const newStartDate = writable(null);

export const startDate = writable('0000-00-00');

export const isLoading = writable(false);

export const sortByWalk = writable(true);

export const showByWalk = writable(true);

export const accountId = derived(
  [currentMemberId, nameIndex],
  async ([$memberId, $nameIndex], set) => {
    logit('seting accountId', $memberId, $nameIndex?.get($memberId));
    newStartDate.set(get(startDate));

    const accountId = $nameIndex?.get($memberId)?.accountId;
    logit('setting accountId', $memberId, accountId);

    set(accountId);
    await getAccountData(accountId);
    return;
  },
);
// export const bookings = writable();
export const name = derived(
  [accountId, nameIndex],
  ([$accountId, $nameIndex]) => $nameIndex.get($accountId)?.name,
);
export const accountMembers = derived(
  [accountId, nameIndex],
  ([$accountId, $nameIndex], set) => {
    if (!$accountId) {
      return;
    }
    let mems = $nameIndex.get($accountId)?.Members;
    logit('accountMembers', mems);
    set(mems);
  },
  [],
);
let fmData = {
  balance: 0,
  status: [],
  Members: [],
  bookings: {},
  payments: {},
  refunds: {},
  bookingsStack: [],
  paymentsStack: [],
  lastAction: '',
};

export const fundsManager = writable(fmData);

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     Actions                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const refreshAccountBookings = (data) => {
  let refAccountId = data.accountId;
  if (data.memberId) {
    refAccountId = get(nameIndex)?.get(data.memberId)?.accountId;
  }
  const currAccountId = get(accountId);
  logit('refreshAccountBooking', data, currAccountId, refAccountId);
  if (refAccountId !== currAccountId) {
    return;
  }
  getAccountData(currAccountId);
};

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      Thunks                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const setNewStartDate = async (newDate) => {
  newStartDate.set(newDate);
  const currAccountId = get(accountId);
  getAccountData(currAccountId);
};
export const getStartDate = async () => {
  const res = await fetchData('walk/firstBooking');
  logit('getStartDate fetchData returned', res);
  let { firstBooking } = res || {};
  if (!firstBooking) {
    firstBooking = format(addDays(new Date(), -45), 'yyyy-MM-dd');
  }
  startDate.set(firstBooking);
  return firstBooking;
};
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃             Get Bookings/Payment Data             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

const getAccountData = async (accountId) => {
  const sDate = get(newStartDate);

  logit('getting account data', accountId, sDate);
  if (!(accountId && sDate)) {
    return;
  }
  if (sDate === '0000-00-00') {
    return;
  }
  // const accountId = $nameIndex?.get($memberId)?.accountId;
  isLoading.set(true);

  let data = await fetchData(`account/activeData/${accountId}/${sDate}`);
  let { bookings, payments, refunds } = data;
  const fm = initalizeFundsManagment(bookings, payments, refunds);
  logit('new FundsManager', fm);
  fundsManager.set(fm);
  reAllocateFunds(fm);
  isLoading.set(false);

  return { bookings, payments, refunds };
};

function flattenBookings(acc) {
  let bookings = acc.Members.flatMap((member) => member.Bookings ?? []);
  bookings = _.sortBy(bookings, 'walkId');
  return bookings;
}

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃               historicBookingsAccount             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
let historicBookingsAccount = null;

const historicBookings = derived(
  [startDate, newStartDate, accountId],
  async ([$startDate, $newStartDate, $accountId], set) => {
    if ($newStartDate === '9999-99-99' || !$accountId) {
      set([]);
      return;
    }
    if (historicBookingsAccount !== $accountId) {
      set([]);
    }
    historicBookingsAccount = $accountId;

    const res = await fetchData(
      `account/bookingsData/${$accountId}/${$startDate}/${$newStartDate}`,
    );
    logit(
      'fetch bookingsData returned',
      `${$accountId}/${$startDate}/${$newStartDate}`,
      res,
    );
    let bookings = flattenBookings(res);
    set(bookings);
  },
  [],
);

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             bookingLogData                        ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const bookingLogData = derived(
  [historicBookings, fundsManager],
  ([$historicBookings, $fundsManager]) => {
    const activeBookings = _.values($fundsManager.bookings) ?? [];
    const refunds = _.values($fundsManager.refunds) ?? [];
    logit('bookingLogData', $historicBookings, activeBookings);

    let bookings = [...$historicBookings, ...activeBookings];
    // logit('bookingLogs pre setLogs', { pLogs, bLogs, $historicLogs: $historicBookings, logs: bookings });
    bookings = _.uniqBy(bookings, 'bookingId');
    bookings = _.groupBy(bookings, 'walkId');
    bookings = _.toPairs(bookings);
    // bookings = refunds.map((r) => ['W' + r.refundId, [r]]);
    bookings = _.sortBy(bookings, (b) => b[0]);
    // bookings = _.map(bookings, b=>b[1])
    logit('bookingLogs post effect', { bookings, refunds });
    return [bookings, refunds];
  },
);
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             userTransactionData                   ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
// export const activityLogData = derived(
//   [fundsManager],
//   ([$fundsManager]) => {
//     const activeBookings = _.cloneDeep(_.values($fundsManager.bookings) ?? []);
//     const activePayments = _.cloneDeep(_.values($fundsManager.payments) ?? []);
//     const activeRefunds = _.cloneDeep(_.values($fundsManager.refunds) ?? []);
//     logit('activeLogData', activeBookings, activePayments, activeRefunds);

//     const result = prepareUserTransactionData(
//       accountId,
//       activeBookings,
//       activePayments,
//       activeRefunds,
//     );
//     logit('activeLogData2', { result });
//     return result;
//   },
//   {},
// );
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             userTransactionDataByWalkId           ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const activityLogDataByWalkId = derived(
  [fundsManager, sortByWalk, showByWalk],
  ([$fundsManager, $sortByWalk, $showByWalk]) => {
    const activeBookings = _.cloneDeep(_.values($fundsManager.bookings) ?? []);
    const activePayments = _.cloneDeep(_.values($fundsManager.payments) ?? []);
    const activeRefunds = _.cloneDeep(_.values($fundsManager.refunds) ?? []);
    logit('activeLogData', activeBookings, activePayments, activeRefunds);

    const result = prepareUserTransactionDataByWalkId(
      activeBookings,
      activePayments,
      activeRefunds,
      $sortByWalk,
      $showByWalk,
    );
    logit('activeLogData2', { result });
    return result;
  },
  {},
);

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             paymentLogData                        ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const paymentLogData = derived(
  [historicBookings, fundsManager],
  ([$historicBookings, $fundsManager]) => {
    const activePayments = _.values($fundsManager.bookings) ?? [];
    logit('bookingLogData', $historicBookings, activePayments);

    let payments = [...$historicBookings, ...activePayments];
    // logit('bookingLogs pre setLogs', { pLogs, bLogs, $historicLogs: $historicBookings, logs: bookings });
    payments = _.uniqBy(payments, 'paymentId');
    payments = _.groupBy(payments, 'walkId');
    payments = _.toPairs(payments);
    payments = _.sortBy(payments, 'paymentId');
    // bookings = _.map(bookings, b=>b[1])
    logit('paymentLogs post effect', { payments: payments });
    return payments;
  },
);
/* 
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             update functions                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
const createUpdateFunction = (process, name) => {
  return (payload) => {
    logit(name, payload);
    let fm = get(fundsManager);
    const [nextState, ...patches] = produceWithPatches(fm, (draft) =>
      process(draft, payload),
    );
    logit('patches', patches);
    if (patches[0].length === 0) {
      return;
    }
    patches[2] = accountId;
    addToPatchesQueue(patches);
    logit(`${name} nextState`, nextState, patches);
    fm = initalizeFundsManagment(
      _.values(nextState.bookings),
      _.values(nextState.payments),
    );

    fundsManager.set(fm);
  };
};
export const applyBookingChange = createUpdateFunction(
  bookingChange,
  'applyBookingChange',
);
export const applyAnnotateBooking = createUpdateFunction(
  annotateBooking,
  'applyAnnotateBooking',
);
export const applyPaymentReceived = createUpdateFunction(
  paymentReceived,
  'applyPaymentReceived',
);
const reAllocateFunds = createUpdateFunction(allocateFunds, 'reAllocateFunds');
export const deletePayment = createUpdateFunction(processDeletePayment, 'deletePayment');
export const deleteRefund = createUpdateFunction(processDeleteRefund, 'deleteRefund');
/* 
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             funds manager functions               ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

export const balance = derived(fundsManager, ($fundsManager) => $fundsManager.balance);
function initalizeFundsManagment(activeBookings, activePayments, activeRefunds) {
  logit('activeBookings', activeBookings);
  // activeBookings.Members.forEach((m) => bookingsData.push(...m.Bookings));
  const payments = _.keyBy(activePayments, 'paymentId');
  const bookings = _.keyBy(activeBookings, 'bookingId');
  const refunds = _.keyBy(activeRefunds, 'refundId');
  // const [bookings, payments] = buildBookingData(activeBookings, paymentsData);
  logit('activeBookings', activeBookings);
  const bookingsStack = _.sortBy(activeBookings, 'bookingId')
    ?.filter((b) => b.owing > 0)
    .map((b) => b.bookingId);
  const paymentsStack = activePayments
    ?.filter((p) => p.available > 0)
    .map((p) => p.paymentId);
  const debt = bookingsStack.reduce((tot, id) => tot + bookings[id].owing, 0);
  const credit = paymentsStack.reduce((tot, id) => tot + payments[id].available, 0);
  const balance = credit - debt;
  const Members = get(accountMembers);
  logit('setting funds', { bookings, payments, bookingsStack, paymentsStack });
  logit('setting account', { debt, credit, balance });
  return {
    Members,
    bookings,
    payments,
    refunds,
    bookingsStack,
    paymentsStack,
    balance,
    lastAction: '',
  };
}
