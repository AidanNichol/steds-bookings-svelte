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
} from './fundsManager';
import { format, addDays } from 'date-fns';
import { currentMemberId } from './memberCurrent';
import { addToQueue as addToPatchesQueue } from './patches';
// import { prepareUserTransactionData } from './prepareUserTransactionData';

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
// ! from endDate to startDate goes forward in time
export const endDate = writable('9999-99-99');

export const startDate = writable('0000-00-00');

export const isLoading = writable(false);

export const accountId = derived(
  [currentMemberId, nameIndex],
  async ([$memberId, $nameIndex], set) => {
    logit('seting accountId', $memberId, $nameIndex?.get($memberId));
    endDate.set('9999-99-99');

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
    if (!$accountId) return;
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
  if (refAccountId !== currAccountId) return;
  getAccountData(currAccountId);
};

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      Thunks                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

export const getStartDate = async () => {
  const res = await fetchData(`walk/firstBooking`);
  logit('getStartDate fetchData returned', res);
  let { firstBooking } = res || {};
  if (!firstBooking) firstBooking = format(addDays(new Date(), -45), 'yyyy-MM-dd');
  startDate.set(firstBooking);
  return firstBooking;
};
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃             Get Bookings/Payment Data             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

const getAccountData = async (accountId) => {
  const sDate = get(startDate);
  logit('getting account data', accountId, sDate);
  if (!accountId || !sDate) return;
  if (sDate === '0000-00-00') return;
  // const accountId = $nameIndex?.get($memberId)?.accountId;
  isLoading.set(true);

  let [accountBookings, accountPayments] = await Promise.all([
    fetchData(`account/activeBookings/${accountId}/${sDate}`),
    fetchData(`account/activePayments/${accountId}/${sDate}`),
  ]);
  let bookings = flattenBookings(accountBookings);
  let payments = accountPayments.Payments;
  const fm = initalizeFundsManagment(bookings, payments);
  logit('new FundsManager', fm);
  fundsManager.set(fm);
  reAllocateFunds(fm);
  isLoading.set(false);

  return { bookings, payments };
};

function flattenBookings(acc) {
  let bookings = acc.Members.map((member) => member.Bookings ?? []).flat();
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
  [startDate, endDate, accountId],
  async ([$startDate, $endDate, $accountId], set) => {
    if ($endDate === '9999-99-99' || !$accountId) {
      set([]);
      return;
    }
    if (historicBookingsAccount !== $accountId) set([]);
    historicBookingsAccount = $accountId;

    const res = await fetchData(
      `account/bookingsData/${$accountId}/${$startDate}/${$endDate}`,
    );
    logit('fetch bookingsData returned', `${$accountId}/${$startDate}/${$endDate}`, res);
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
    logit('bookingLogData', $historicBookings, activeBookings);

    let bookings = [...$historicBookings, ...activeBookings];
    // logit('bookingLogs pre setLogs', { pLogs, bLogs, $historicLogs: $historicBookings, logs: bookings });
    bookings = _.uniqBy(bookings, 'bookingId');
    bookings = _.groupBy(bookings, 'walkId');
    bookings = _.toPairs(bookings);
    bookings = _.sortBy(bookings, (b) => b[0]);
    // bookings = _.map(bookings, b=>b[1])
    logit('bookingLogs post effect', { bookings });
    return bookings;
  },
);
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             userTransactionData                   ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
// export const activityLogData = derived(
//   [historicBookings, fundsManager],
//   ([$historicBookings, $fundsManager]) => {
//     const activeBookings = _.values($fundsManager.bookings) ?? [];
//     const activePayments = _.values($fundsManager.payments) ?? [];
//     logit('bookingLogData', $historicBookings, activeBookings);

//     let bookings = [...$historicBookings, ...activeBookings];
//     return prepareUserTransactionData(bookings, activePayments);
//   },
// );
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
    if (patches[0].length === 0) return;
    patches[2] = accountId;
    addToPatchesQueue(patches);
    logit(name + ' nextState', nextState, patches);
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
/* 
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             funds manager functions               ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

export const balance = derived(fundsManager, ($fundsManager) => $fundsManager.balance);
function initalizeFundsManagment(activeBookings, activePayments) {
  logit('activeBookings', activeBookings);
  // activeBookings.Members.forEach((m) => bookingsData.push(...m.Bookings));
  const payments = _.keyBy(activePayments, 'paymentId');
  const bookings = _.keyBy(activeBookings, 'bookingId');
  // const [bookings, payments] = buildBookingData(activeBookings, paymentsData);
  logit('activeBookings', activeBookings);
  const bookingsStack = activeBookings
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
    bookingsStack,
    paymentsStack,
    balance,
    lastAction: '',
  };
}
