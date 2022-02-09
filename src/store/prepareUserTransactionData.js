import _ from 'lodash';
import { addDays, format, parseISO } from 'date-fns';
import { nameIndex } from './nameIndex.js';
import { get } from 'svelte/store';
const maxString = (a, b) => (a > b ? a : b);
const expendIndex = {};
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃             reduced Expenditure Allocations       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
function reducedExpenditureAllocations(allocs, lastPayment) {
  if (allocs.length === 0) return { Allocations: allocs, lastPayment };

  allocs = _.sortBy(allocs, 'paymentId');
  const lastAlloc = _.last(allocs);
  // let id = lastAlloc.id.toString().padStart(5, '0');
  let paidBy = `${lastAlloc.paymentId}.${lastAlloc.bookingId}`;
  lastPayment = maxString(lastPayment, lastAlloc.paymentId.substr(0, 10));

  return { Allocations: allocs, lastPayment, paidBy };
}
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃             reduced Income Allocations            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
function reducedIncomeAllocations(allocs, lastBooking) {
  if (allocs.length === 0) return { Allocations: allocs, lastBooking };

  allocs.forEach((alloc) => {
    const item = expendIndex[alloc.bookingId || alloc.refundId];
    alloc.historic = item?.Allocations.find((a) => a.id === alloc.id)?.historic;
    const itemCreatedAt = (item || {}).createdAt || alloc.refundId;
    // let id = alloc.id.toString().padStart(5, '0');
    alloc.paidFor = `${itemCreatedAt.substr(0, 10)}.${alloc.bookingId}`;
  });
  allocs = _.sortBy(allocs, 'paidFor');
  lastBooking = maxString(lastBooking, _.last(allocs).paidFor.substr(0, 10));

  return { Allocations: allocs, lastBooking };
}
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     add Entry                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
function addEntry(entries, createdAt, type, item) {
  const day = createdAt.substr(0, 10);
  const last = type === 'income' ? 'lastBooking' : 'lastPayment';

  if (!entries[day]) entries[day] = { day, expenditure: [], income: [] };
  entries[day][type].push(item);
  entries[day][last] = maxString(entries[day][last], item[last]);
}
// const imReady = useStoreActions((a) => a.reports.imReady);
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            prepare User Transaction Data          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export function prepareUserTransactionData(
  accountId,
  bookingsRaw,
  paymentsRaw,
  refundsRaw,
) {
  let totalOwing = 0;
  let totalAvailable = 0;
  let lastPayment = '';
  let entries = {};
  const today = format(new Date(), 'yyyy-MM-dd');
  const recent = format(addDays(new Date(), -14), 'yyyy-MM-dd');
  // let bookings = _.flatMap(bookingsRaw.Members, (m) => m.Bookings);
  // bookings = _.sortBy(bookings, 'createdAt');
  // - Bookings
  bookingsRaw.map((b) => {
    const index = get(nameIndex);
    let venue = index?.get(b.walkId).venue;
    let name = index?.get(b.memberId).shortName;
    const allocs = reducedExpenditureAllocations(
      b.Allocations2 || b.Allocations || [],
      lastPayment,
    );
    lastPayment = allocs.lastPayment;
    b = { ...b, ...allocs, name, venue, ...prepLogs(b.BookingLogs) };
    const historic = b.walkId < 'W' + today;
    b.Allocations.forEach((a) => (a.historic = historic));
    b.historic = historic && b.owing === 0;
    if (b.owing) {
      b.Allocations.push({ amount: b.owing });
      totalOwing += b.owing;
    }
    // console.log(b);
    addEntry(entries, b.createdAt, 'expenditure', b);
    expendIndex[b.bookingId] = b;
    return b;
  });
  // - Refunds -------------------------------------------
  let lastBooking = '';
  // let [refunds, payments] = _.partition(paymentsRaw, (p) => /^.X/.test(p.req));
  refundsRaw.forEach((p) => {
    if (!p.refundId) p.refundId = p.paymentId;
    let createdAt = p.refundId;
    // p.Allocations = _.flatMap(paymentsRaw, (pp) =>
    //   pp.Allocations.filter((a) => a.refundId !== null && a.refundId === p.refundId),
    // );
    const allocs = reducedExpenditureAllocations(
      p.Allocations2 || p.Allocations || [],
      lastPayment,
    );
    lastPayment = allocs.lastPayment;
    const spent = allocs.Allocations.reduce((acc, a) => acc + a.amount, 0);

    if (spent !== p.amount - p.available) {
      console.log('refund spend error', spent, p.amount, p.available, p.paymentId);
      p.available = p.amount - spent;
    }
    p = { ...p, ...allocs, createdAt };
    p.historic = p.refundId < recent;
    p.Allocations.forEach((a) => (a.historic = p.historic));

    addEntry(entries, createdAt, 'expenditure', p);
    expendIndex[p.refundId] = p;
  });
  // - Payments ---------------------------------
  paymentsRaw.forEach((p) => {
    let createdAt = p.paymentId.substr(0, 10);
    const allocs = reducedIncomeAllocations(
      p.Allocations2 || p.Allocations || [],
      lastBooking,
    );
    lastBooking = allocs.lastBooking;
    const spent = allocs.Allocations.reduce((acc, a) => acc + a.amount, 0);
    if (spent !== p.amount - p.available) {
      console.log('spend error', spent, p.amount, p.available, p.paymentId);
      p.available = p.amount - spent;
    }
    p.historic = _.every(allocs.Allocations, 'historic') && p.available === 0;
    p = { ...p, ...allocs, createdAt };
    if (p.available) {
      p.Allocations.push({ amount: p.available });
      totalAvailable += p.available;
    }
    addEntry(entries, createdAt, 'income', p);
  });
  const sEntries = _.sortBy(_.toPairs(entries), (d) => d[0]);
  return { ...mapEntries(sEntries), totalAvailable, totalOwing };
}
function mapEntries(entries) {
  let y = 0;
  let eY = 0;
  let iY = 0;
  const lines = {};
  let breakNo = 0;
  const breaks = [];
  const entryIndex = _.fromPairs(entries);

  for (let [day, { lastPayment }] of entries) {
    if (lastPayment && entryIndex[lastPayment]?.lastBooking === day) {
      entryIndex[day].breakNo = breakNo;
      entryIndex[lastPayment].breakNo = breakNo;
      breaks[breakNo] = [0, 0, day, lastPayment];
      breakNo++;
    }
  }
  for (let i = 0; i < entries.length; i++) {
    let [day, { expenditure, income, breakNo, ...rest }] = entries[i];
    let expSz = 0;
    let incSz = 0;
    expenditure = _.sortBy(expenditure, 'paidBy');
    if (expenditure.length > 0) {
      if (income.length > 0) {
        y = Math.max(eY, iY);
      } else {
        y = eY;
        iY = Math.max(iY, y + 1);
      }
      expSz = 1;
      eY = y + 1;
      for (const exp of expenditure) {
        exp.y = eY;
        exp.sz = Math.max(exp.Allocations.length, 1);
        exp.Allocations.forEach(({ id, historic }, i) => {
          if (id)
            lines[id] = {
              ...(lines[id] || {}),
              end: eY + i + 0.5,
              historic,
            };
        });
        expSz += exp.sz;
        eY += exp.sz;
      }
      let brk = _.findIndex(breaks, (b) => b[2] === day);
      if (brk >= 0) {
        breaks[brk][0] = eY;
      }
    } else y = iY;
    if (income.length > 0) {
      // if (expenditure.length === 0) y = Math.max(iY, eY + 1);
      iY = y + 1;
      incSz = 1;
      for (const inc of income) {
        let allocs = _.sortBy(inc.Allocations, 'paidfor');

        inc.y = iY;
        inc.sz = Math.max(allocs.length, 1);
        allocs.forEach(({ id, amount, historic }, i) => {
          if (id) {
            lines[id] = {
              ...(lines[id] || {}),
              start: iY + i + 0.5,
              amount,
            };
            lines[id].historic = lines[id].historic && historic;
          }
        });
        incSz += inc.sz;
        iY += inc.sz;
      }
      let brk = _.findIndex(breaks, (b) => b[3] === day);
      if (brk >= 0) {
        breaks[brk][1] = iY;
      }
    }
    entries[i] = { day, y, expSz, incSz, expenditure, income, breakNo, ...rest };
  }
  const bot = Math.max(eY, iY);
  return { bot, lines, entries, breaks };
}
function prepLogs(logs) {
  let txt = '';
  const step = 2.4;
  let dX = 2.6 - step;
  logs = logs.filter((l, i) => l.req !== (logs[i - 1] || {}).req);
  const log2 = logs.reverse().map((log) => {
    dX += step;
    txt = format(parseISO(log.id), 'd/MM');

    return { txt, dX, req: log.req };
  });
  _.last(log2).txt = '';
  return { log2, maxX: dX };
}
