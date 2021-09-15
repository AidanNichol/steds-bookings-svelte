import { writable, derived, get } from 'svelte/store';
import { fetchData } from '@utils/use-data-api';
import { produceWithPatches, enablePatches } from 'immer';
import { nameIndex } from './nameIndex.js';
import {
  bookingChange,
  annotateBooking,
  paymentReceived,
  allocateFunds,
} from './fundsManager';
import { format, addDays } from 'date-fns';
import { currentMemberId } from './memberCurrent';
import { addToQueue as addToPatchesQueue } from './patches';

import _ from 'lodash';
import Logit from '@utils/logit';
// import { listenerCount } from 'process';

var logit = Logit('store/accountStatus');
enablePatches();
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    stores                         ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 \                               startDate &
 \                               accountId                endDate
 \                               ┃  ┃   ┃                    ┃
 \                     ┏━━━━━━━━━┛  ┃   ┗━━━━━━━━━━━━━━┓     ┃
 \   nextPaymentState  ┃            ┃ nextBookingState ┃     ┃ 
 \           ┃  pStale ┃  bStale    ┃    ┃             ┃     ┃ 
 \           ┃     ┃   ┃      ┃     ┃    ┃             ┃     ┃ 
 \        activePayments     activeBookings      historicBookings
 \               ┃               ┃    ┃              ┃
 \               ┃     ┏━━━━━━━━━┛    ┃        ┏━━━━━┛
 \               ┃     ┃              ┃        ┃ 
 \           fundsManager           BookingLogData
*/
export const sortFn = writable('byDate');
// ! from endDate to startDate goes forward in time
export const endDate = writable('9999-99-99');
// const startDate = readable('0000-00-00', async (set) => {
//   const res = await fetchData(`walk/firstBooking`);
//   logit('getStartDate fetchData returned', res);
//   const { firstBooking } = res?.[0];
//   set(firstBooking);
// });
export const startDate = writable('0000-00-00');
export const bStale = writable(true);
export const pStale = writable(true);

export const accountId = derived(
  [currentMemberId, nameIndex],
  ([$memberId, $nameIndex], set) => {
    logit('seting accountId', $memberId, $nameIndex?.get($memberId));
    endDate.set('9999-99-99');
    nextBookingState.set(null);
    const accountId = $nameIndex?.get($memberId)?.accountId;
    logit('setting accountId', $memberId, accountId);
    bStale.set(true);
    pStale.set(true);
    set(accountId);
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
export const refreshAccountBookings = (data) => {
  const memAccountId = get(nameIndex)?.get(data.memberId)?.accountId;
  const currAccountId = get(accountId);
  logit('refreshAccountBooking', data, currAccountId, memAccountId);
  const thisAccount = data.accountId === currAccountId || memAccountId === currAccountId;
  if (!thisAccount) return;
  if (data.memberId || data.payments) {
    bStale.set(true);
    logit('bStale now', get(bStale));
  }
  if (data.accountId || data.payments) {
    pStale.set(true);
    logit('pStale now', get(pStale));
  }
};

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     Actions                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

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
let bookingData = {
  balance: 0,
  status: [],
  Members: [],
  bookings: {},
  payments: {},
  bookingsStack: [],
  paymentsStack: [],
  lastAction: '',
};
export const nextBookingState = writable(null);

export const activeBookings = derived(
  [accountId, bStale, startDate, nextBookingState],
  async ([$accountId, $bStale, $startDate, $nextBookingState], set) => {
    logit('activeBookings', $nextBookingState, $bStale, $startDate);
    if ($nextBookingState) {
      set($nextBookingState);
      nextBookingState.set(null);
      // $nextBookingState = null;
      return;
    }
    if ($bStale === false) return;
    if ($startDate === '0000-00-00') return;
    if (!$accountId || !$startDate) return;
    let account = await fetchData(`account/activeBookings/${$accountId}/${$startDate}`);
    let bookings = flattenBookings(account);

    logit('activeBookings fetchData returned', bookings);
    // const fm = initalizeFundsManagment(bookings);

    bStale.set(false);
    set(bookings);
  },
  [],
);
export const nextPaymentState = writable(null);
export const activePayments = derived(
  [accountId, pStale, startDate, nextPaymentState],
  async ([$accountId, $pStale, $startDate, $nextPaymentState], set) => {
    logit('activePayments', $nextPaymentState, $pStale, $startDate);
    if ($nextPaymentState) {
      set($nextPaymentState);
      nextPaymentState.set(null);
      // $nextPaymentState = null;
      return;
    }
    if ($pStale === false) return;

    if (!$accountId || !$startDate) return;
    let account = await fetchData(`account/activePayments/${$accountId}/${$startDate}`);
    let payments = account.Payments;

    pStale.set(false);
    set(payments);
  },
  [],
);
function flattenBookings(acc) {
  let bookings = acc.Members.map((member) => member.Bookings ?? []).flat();
  bookings = _.sortBy(bookings, 'walkId');
  return bookings;
}
// export const historicData = derived(
//   [startDate, endDate, accountId],
//   async ([$startDate, $endDate, $accountId], set) => {
//     if ($endDate === '9999-99-99' || !$accountId) {
//       set([]);
//       return;
//     }

//     let res = await fetchData(
//       `account/bookingsData/${$accountId}/${$startDate}/${$endDate}`,
//     );
//     res = flattenBookings(res);
//     logit('fetch bookings Data returned', `${$accountId}/${$startDate}/${$endDate}`, res);
//     set(res);
//   },
//   [],
// );
export const historicBookings = derived(
  [startDate, endDate, accountId],
  async ([$startDate, $endDate, $accountId], set) => {
    if ($endDate === '9999-99-99' || !$accountId) {
      set([]);
      return;
    }

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
┃               historicLogs                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
// export const historicLogs = derived([historicData, sortFn], ([$data, $sortFn]) => {
//   const pymts = preparePayments($data.Payments, $sortFn, true);
//   const rfnds = prepareRefunds($data.Refunds, $sortFn, true);
//   logit('effect2', pymts, rfnds);
//   return [...pymts, ...rfnds];
// });

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             bookingLogData                        ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const bookingLogData = derived(
  [historicBookings, activeBookings],
  ([$historicBookings, $activeBookings]) => {
    logit('bookingLogData', $historicBookings, $activeBookings);

    let bookings = [...$historicBookings, ...$activeBookings];
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
    ┃             update functions                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
const createUpdateFunction = (process) => {
  return (payload) => {
    logit('dispatchPayload', payload);
    const fm = get(fundsManager);
    const [nextState, ...patches] = produceWithPatches(fm, (draft) =>
      process(draft, payload),
    );
    logit('patches', patches);
    if (patches[0].length === 0) return;
    patches[2] = accountId;
    addToPatchesQueue(patches);
    logit('nextState', nextState, patches);
    nextBookingState.set(Object.values(nextState.bookings));
    nextPaymentState.set(Object.values(nextState.payments));
  };
};
export const applyBookingChange = createUpdateFunction(bookingChange);
export const applyAnnotateBooking = createUpdateFunction(annotateBooking);
export const applyPaymentReceived = createUpdateFunction(paymentReceived);
export const reAllocateFunds = createUpdateFunction(allocateFunds);
/* 
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃             funds manager functions               ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export const fundsManager = derived(
  [accountId, activeBookings, activePayments, accountMembers],
  async ([$accountId, $activeBookings, $activePayments, $accountMembers], set) => {
    if (!$accountId) return;
    logit('fundsManger', $activeBookings, $activePayments);
    const fm = initalizeFundsManagment($activeBookings, $activePayments);
    fm.Members = $accountMembers;
    logit('funds manager object', fm);
    set(fm);
    reAllocateFunds(fm);
  },
  bookingData,
);
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
  logit('setting account', { bookings, payments, bookingsStack, paymentsStack });
  logit('setting account', { debt, credit, balance });
  return {
    bookings,
    payments,
    bookingsStack,
    paymentsStack,
    balance,
    lastAction: '',
  };
}

// function buildBookingData(bookings, payments) {
//   let bookingsMap = {};
//   const paymentsMap = _.keyBy(payments, (p) => p.paymentId);
//   (payments || []).forEach((p) => {
//     p.Allocations.forEach((alloc) => {
//       const booking = alloc.Booking;
//       if (!booking.Walk.bookable) return;
//       const { bookingId } = booking;
//       const myAllocs = p.Allocations.filter((a) => a.bookingId === bookingId);
//       logit('myAllocs', bookingId, p.Allocations, myAllocs);
//       bookings.Allocations = [
//         ...(bookings.Allocations || []),
//         ...p.Allocations.filter((a) => a.bookingId === bookingId),
//       ];
//       bookings[booking.bookingId] = booking;
//     });
//   });
//   bookings.forEach((booking) => {
//     logit('booking', booking);
//     if (!booking.Walk.bookable && booking.owing === 0) return;
//     bookings[booking.bookingId] = booking;
//   });
//   logit('bookingData1', bookings);
//   return [bookingsMap, paymentsMap];
// }
