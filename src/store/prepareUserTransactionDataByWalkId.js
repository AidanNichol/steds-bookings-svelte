import _ from 'lodash';
import { addDays, format, parseISO } from 'date-fns';
import { nameIndex } from './nameIndex.js';
import { get } from 'svelte/store';
import Logit from '@utils/logit';
// import { sprintf } from 'sprintf-js';

var logit = Logit('pages/bookings/PrepareTransactionsData');
const maxString = (a, b) => (a > b ? a : b);
const minString = (a, b) => (a <= b ? a : b);
let expendIndex = {};
let createdAtTable = [];

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
    alloc.paidFor = alloc.bookingId || 'W' + alloc.refundId;
  });
  allocs = _.sortBy(allocs, 'paidFor');
  lastBooking = maxString(lastBooking, _.last(allocs).paidFor.substr(0, 11));

  return { Allocations: allocs, lastBooking };
}
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     add Entry                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
function addEntry(entries, createdAt, type, item) {
  let walkId;
  createdAt = createdAt.substr(0, 10);
  const i = createdAtTable.findIndex((e) => createdAt <= e[0]);

  if (createdAtTable[i]?.[0] === createdAt) {
    walkId = createdAtTable[i][1];
  } else {
    if (i === 0) {
      walkId = 'W2021-01-01';
    } else {
      if (i < 0) walkId = _.last(createdAtTable)[1];
      else walkId = createdAtTable[i - 1][1];
      walkId = 'W' + format(addDays(parseISO(walkId.substr(1)), 1), `yyyy-MM-dd`);
    }
    logit('addEntry1', i, type, createdAt, walkId);
    if (!entries[walkId]) {
      entries[walkId] = { createdAt, walkId, expenditure: [], income: [] };
      createdAtTable.push([createdAt, walkId]);
      createdAtTable = _.sortBy(createdAtTable, (a) => a[0]);
    }
    console.table(createdAtTable);
    logit('addEntry1', entries, createdAtTable);
  }
  const last = type === 'income' ? 'lastBooking' : 'lastPayment';
  if (!entries?.[walkId]?.[type]) {
    logit('bad', walkId, type, createdAt, createdAtTable, entries);
  }
  entries[walkId][type].push(item);
  entries[walkId][last] = maxString(entries[walkId][last], item[last]);
}
// const imReady = useStoreActions((a) => a.reports.imReady);
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            prepare User Transaction Data          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
export function prepareUserTransactionDataByWalkId(
  accountId,
  bookingsRaw,
  paymentsRaw,
  refundsRaw,
) {
  let totalOwing = 0;
  let totalAvailable = 0;
  let lastPayment = '';
  const today = format(new Date(), 'yyyy-MM-dd');
  const recent = format(addDays(new Date(), -14), 'yyyy-MM-dd');

  let entries = {};
  expendIndex = {};
  createdAtTable = [];
  // let bookings = _.flatMap(bookingsRaw.Members, (m) => m.Bookings);
  // bookings = _.sortBy(bookings, 'createdAt');
  // - Bookings
  bookingsRaw = bookingsRaw.map((b) => {
    const index = get(nameIndex);
    let venue = index?.get(b.walkId).venue;
    let name = index?.get(b.memberId).shortName;
    const allocs = reducedExpenditureAllocations(
      b.Allocations2 || b.Allocations || [],
      lastPayment,
    );
    lastPayment = allocs.lastPayment;
    let historic = b.walkId < 'W' + today;
    b = { ...b, ...allocs, name, venue, ...prepLogs(b.BookingLogs) };
    b.Allocations.forEach((a) => (a.historic = historic));
    b.historic = historic && b.owing === 0;
    if (b.owing) {
      b.Allocations.push({ amount: b.owing });
      totalOwing += b.owing;
    }
    // console.log(b);
    expendIndex[b.bookingId] = b;
    return b;
  });
  entries = _.groupBy(_.sortBy(bookingsRaw, 'bookingId'), 'walkId');
  let curCreatedAt = '';
  Object.keys(entries).forEach((walkId) => {
    const walks = entries[walkId];
    let createdAt = walks.reduce(
      (acc, w) => minString(acc, w.createdAt.substr(0, 10)),
      '999999',
    );
    curCreatedAt = maxString(curCreatedAt, createdAt);
    createdAtTable.push([curCreatedAt, walkId, 0]);
    entries[walkId] = {
      createdAt,
      walkId,
      venue: walks[0].venue,
      expenditure: walks,
      income: [],
    };
  });

  // addEntry(entries, b.createdAt, 'expenditure', b);
  // - Refunds
  let lastBooking = '';
  // let [refunds, payments] = _.partition(paymentsRaw, (p) => /^.X/.test(p.req));
  refundsRaw.forEach((p) => {
    if (!p.refundId) p.refundId = p.paymentId;
    let createdAt = p.refundId.substr(0, 10);
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
    const walkId = 'W' + createdAt;
    createdAtTable.push([createdAt, walkId, 0]);
    entries[walkId] = {
      createdAt,
      walkId,
      venue: 'Refund',
      expenditure: [p],
      income: [],
    };
    // addEntry(entries, createdAt, 'expenditure', p);
    expendIndex[p.refundId] = p;
  });

  // - payments
  _.sortBy(paymentsRaw, 'paymentId').forEach((p) => {
    let createdAt = p.paymentId.substr(0, 10);
    const allocs = reducedIncomeAllocations(
      p.Allocations2 || p.Allocations || [],
      lastBooking,
    );
    lastBooking = allocs.lastBooking;
    p.historic = _.every(allocs.Allocations, 'historic') && p.available === 0;
    const spent = allocs.Allocations.reduce((acc, a) => acc + a.amount, 0);
    if (spent !== p.amount - p.available) {
      console.log('spend error', spent, p.amount, p.available, p.paymentId);
      p.available = p.amount - spent;
    }
    p = { ...p, ...allocs, createdAt };
    if (p.available) {
      p.Allocations.push({ amount: p.available });
      totalAvailable += p.available;
    }
    addEntry(entries, createdAt, 'income', p);
  });
  const sEntries = _.sortBy(_.toPairs(entries), (d) => d[1].walkId);
  return { ...mapEntries(sEntries), totalAvailable, totalOwing };
}
// -
// - Map Entries
function mapEntries(entries) {
  const unit = 18;
  let pageHt = ((297 - 2 * 7) * 3.7795275591) / unit; // A4 mm->px->units
  pageHt = Math.floor(pageHt);
  let pageEnd = pageHt - 5.5;
  let pageEnds = [];
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
  // @ calculate sizes

  const twoLines = (exp) =>
    exp.log2.length > 4 || (exp.log2.length === 4 && exp.name.length > 6);
  for (const [, entry] of entries) {
    entry.expSz = entry.expenditure.length ? 1 : 0;
    entry.incSz = entry.income.length ? 1 : 0;
    for (const exp of entry.expenditure) {
      exp.sz = Math.max(exp.Allocations.length, 1);
      if (exp.sz === 1 && twoLines(exp)) exp.sz += 1;
      entry.expSz += exp.sz;
    }
    for (const inc of entry.income) {
      inc.sz = Math.max(inc.Allocations.length, 1);
      entry.incSz += inc.sz;
    }
  }
  let y;
  for (let i = 0; i < entries.length; i++) {
    let newPage = false;
    const setY = (y, expSz, incSz) => {
      if (y + expSz < pageEnd || y + incSz < pageEnd) return y;
      y = Math.max(eY, iY);
      eY = y;
      iY = y;
      pageEnds.push(y);
      pageEnd = y + pageHt;
      newPage = true;
      return y;
    };
    let [walkId, { createdAt, expenditure, income, breakNo, expSz, incSz, ...rest }] =
      entries[i];
    expenditure = _.sortBy(expenditure, 'paidBy');
    if (expenditure.length > 0) {
      if (income.length > 0) {
        y = setY(Math.max(eY, iY), expSz, incSz, i);
      } else {
        y = setY(eY, expSz, incSz, i);
        iY = Math.max(iY, y + 1);
      }
      // expSz = 1;
      eY = y + 1;
      for (const exp of expenditure) {
        exp.y = eY;
        const adjust = twoLines(exp) ? 0.5 : 0;
        exp.y1 = eY + exp.sz / 2 - adjust;
        exp.y2 = eY + exp.sz / 2 + adjust;
        exp.y3 = eY + (exp.sz > exp.Allocations.length ? 1 : 0);

        exp.Allocations.forEach(({ id, historic }, i) => {
          if (id) lines[id] = { ...(lines[id] || {}), end: exp.y3 + i + 0.5, historic };
        });
        // expSz += exp.sz;
        eY += exp.sz;
      }
      let brk = _.findIndex(breaks, (b) => b[2] === walkId);
      if (brk >= 0) {
        breaks[brk][0] = eY;
      }
    } else y = setY(iY, expSz, incSz, i);
    if (income.length > 0) {
      // if (expenditure.length === 0) y = Math.max(iY, eY + 1);
      iY = y + 1;
      // incSz = 1;
      for (const inc of income) {
        let allocs = _.sortBy(inc.Allocations, 'paidfor');

        inc.y = iY;
        allocs.forEach(({ id, amount, historic }, i) => {
          if (id) {
            lines[id] = { ...(lines[id] || {}), start: iY + i + 0.5, amount };
            lines[id].historic = lines[id].historic && historic;
          }
        });
        // incSz += inc.sz;
        iY += inc.sz;
      }
      let brk = _.findIndex(breaks, (b) => b[3] === walkId);
      if (brk >= 0) {
        breaks[brk][1] = iY;
      }
    }
    entries[i] = {
      walkId,
      createdAt,
      y,
      expSz,
      incSz,
      expenditure,
      income,
      breakNo,
      newPage,
      ...rest,
    };
    logit('mapped entry', entries[i]);
  }
  const bot = Math.max(eY, iY);
  pageEnds.push(bot + 1);
  return { bot, lines, entries, breaks, pageEnds, unit };
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
