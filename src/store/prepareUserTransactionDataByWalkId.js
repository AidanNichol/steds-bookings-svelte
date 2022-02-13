import _ from 'lodash';
import { addDays, format, parseISO } from 'date-fns';
import { nameIndex } from './nameIndex.js';
import { get } from 'svelte/store';
import Logit from '@utils/logit';
import { showByWalk } from './accountStatus.js';
// import { sprintf } from 'sprintf-js';

var logit = Logit('pages/bookings/PrepareTransactionsData');
const maxString = (a, b) => (a > b ? a : b);
const minString = (a, b) => (a <= b ? a : b);
let expendIndex = {};
// let createdAtTable = [];

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
    alloc.paidFor = alloc.bookingId || alloc.refundId;
    alloc.sortSeq = item.sortSeq + alloc.paidFor;
  });
  allocs = _.sortBy(allocs, 'sortSeq');
  lastBooking = maxString(lastBooking, _.last(allocs).paidFor.substr(0, 11));

  return { Allocations: allocs, lastBooking };
}
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     add Entry                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/
function addEntry(entries, day, type, item, title) {
  // const day = createdAt.substr(0, 10);

  const last = type === 'income' ? 'lastBooking' : 'lastPayment';
  if (!entries[day]) entries[day] = { day, expenditure: [], income: [] };
  const entry = entries[day];
  if (_.isArray(item)) entry[type].push(...item);
  else entry[type].push(item);
  entry[last] = maxString(entry[last], item[last]);
  if (type === 'income') entry.incTitle = title;
  else entry.expTitle = title;
  return entries[day];
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
  sortByWalk,
  showByWalk,
) {
  let totalOwing = 0;
  let totalAvailable = 0;
  let lastPayment = '';
  const today = format(new Date(), 'yyyy-MM-dd');
  const recent = format(addDays(new Date(), -14), 'yyyy-MM-dd');

  let entries = {};
  expendIndex = {};
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
    b.createdDay = b.createdAt.substr(0, 10);
    if (b.owing) {
      b.Allocations.push({ amount: b.owing });
      totalOwing += b.owing;
    }
    // console.log(b);
    expendIndex[b.bookingId] = b;
    return b;
  });
  let sortBy, groupBy;
  if (showByWalk) {
    if (sortByWalk) {
      sortBy = ['walkId', 'createdDay', 'bookingId'];
      groupBy = 'walkId';
    } else {
      sortBy = ['createdDay', 'bookingId'];
      groupBy = (b) => `${b.createdDay}:${b.walkId}`;
    }
  } else {
    sortBy = ['createdDay', 'bookingId'];
    groupBy = 'createdDay';
  }
  const sortedWalks = _.sortBy(bookingsRaw, sortBy);
  const groupedWalks = _.groupBy(sortedWalks, groupBy);
  let createdDay2 = '0000-00-00:0';
  const showDate = (dat) => {
    let [day] = dat.split(':');
    return format(parseISO(day), `E dd MMM`);
  };
  const incCreatedAt = (dat) => {
    let bits = dat.split(':');
    bits[1] = parseInt(bits[1] ?? 0) + 1;
    return bits.join(':');
  };
  logit('sortedWalks', sortedWalks);
  logit('groupedWalks', groupedWalks);
  Object.values(groupedWalks).forEach((walks) => {
    // const walks = groupedWalks[walkId];
    createdDay2 = incCreatedAt(createdDay2);
    let createdAt1 =
      walks.reduce((acc, w) => minString(acc, w.createdDay), '999999') + ':0';

    if (createdAt1 > createdDay2) createdDay2 = createdAt1;
    let title, sortSeq;
    if (showByWalk) {
      title = walks[0].walkId.substr(1) + ' ' + walks[0].venue;
      sortSeq = createdDay2;
    } else {
      title = showDate(createdAt1);
      sortSeq = createdAt1;
    }
    // if (sortByWalk) createdAt1 = createdAt2;
    walks.forEach((b) => {
      b.sortSeq = sortSeq;
      b.text = showByWalk
        ? `${showDate(b.createdAt)} ${b.name} `
        : `${b.walkId.substr(1)} ${b.name} ${b.venue}`;
    });
    logit('addEntry', createdAt1, createdDay2, sortSeq, walks);
    addEntry(entries, sortSeq, 'expenditure', walks, title);
  });

  // - Refunds
  let lastBooking = '';
  refundsRaw.forEach((p) => {
    if (!p.refundId) p.refundId = p.paymentId;
    let createdDay = p.refundId.substr(0, 10) + ':0';
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
    p = { ...p, ...allocs, createdDay };
    p.historic = p.refundId < recent;
    p.Allocations.forEach((a) => (a.historic = p.historic));
    addEntry(entries, createdDay, 'expenditure', p, 'Refund');
    expendIndex[p.refundId] = p;
  });

  // - payments
  _.sortBy(paymentsRaw, 'paymentId').forEach((p) => {
    let createdDay = p.paymentId.substr(0, 10) + ':0';
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
    p = { ...p, ...allocs, createdDay };
    if (p.available) {
      p.Allocations.push({ amount: p.available });
      totalAvailable += p.available;
    }
    addEntry(entries, createdDay, 'income', p, showDate(createdDay));
  });
  const sEntries = _.sortBy(_.toPairs(entries), (d) => d[0]);
  return { ...mapEntries(sEntries, showByWalk), totalAvailable, totalOwing };
}
// -
// - Map Entries
function mapEntries(entries, showByWalk) {
  const unit = 18;
  let pageHt = ((297 - 2 * 7) * 3.7795275591) / unit; // A4 mm->px->units
  pageHt = Math.floor(pageHt);
  let pageEnd = pageHt - 5.5;
  let pageEnds = [];
  let footnotes = [];
  let eY = 0;
  let iY = 0;
  const lines = {};
  logit('mapEntries start', entries);

  // - calculate sizes

  const twoLines = (exp) => {
    let max = 5;
    if (showByWalk) {
      if (exp.name?.length ?? 0) max -= 1;
    } else {
      max -= Math.floor((exp.name?.length ?? 0) / 4) + 1;
    }
    return (exp.log2?.length ?? 0) > max;
  };
  for (const [, entry] of entries) {
    entry.expSz = entry.expenditure.length ? 1 : 0;
    entry.incSz = entry.income.length ? 1 : 0;
    for (const exp of entry.expenditure) {
      if (!exp.Allocations) logit('BadExp', exp);
      exp.sz = Math.max(exp.Allocations?.length ?? 0, 1);
      if (exp.sz === 1 && twoLines(exp)) exp.sz += 1;
      entry.expSz += exp.sz;
      if (exp.note) exp.footNo = footnotes.push(exp.note);
    }
    for (const inc of entry.income) {
      if (!inc.Allocations) logit('BadExp', inc);
      inc.sz = Math.max(inc.Allocations?.length ?? 0, 1);
      if (inc.note) {
        inc.footNo = footnotes.push(inc.note);
        if (inc.sz === 1) inc.sz += 1;
      }
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
    let [createdAt, { expenditure, income, expSz, incSz, ...rest }] = entries[i];
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
        exp.adjust = 0;
        if (twoLines(exp)) {
          exp.adjust = 0.5;
        }
        exp.y1 = exp.sz / 2 - exp.adjust;
        exp.y2 = exp.sz / 2 + exp.adjust;
        exp.y3 = exp.sz > exp.Allocations?.length ?? 0 ? 1 : 0;

        exp.Allocations?.forEach(({ id, historic }, i) => {
          if (id)
            lines[id] = { ...(lines[id] || {}), end: exp.y + exp.y3 + i + 0.5, historic };
        });
        eY += exp.sz;
      }
    } else y = setY(iY, expSz, incSz, i);
    if (income.length > 0) {
      iY = y + 1;
      for (const inc of income) {
        let allocs = _.sortBy(inc.Allocations, 'paidfor');

        inc.y = iY;
        allocs.forEach(({ id, amount, historic }, i) => {
          if (id) {
            lines[id] = { ...(lines[id] || {}), start: iY + i + 0.5, amount };
            lines[id].historic = lines[id].historic && historic;
          }
        });
        iY += inc.sz;
      }
    }
    entries[i] = {
      createdAt,
      y,
      expSz,
      incSz,
      expenditure,
      income,
      newPage,
      ...rest,
    };
  }
  const bot = Math.max(eY, iY);
  pageEnds.push(bot + 1);
  return { bot, lines, entries, pageEnds, unit, footnotes };
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
