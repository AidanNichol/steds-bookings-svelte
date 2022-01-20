import _ from '_';

const maxString = (a, b) => (a > b ? a : b);
const expendIndex = {};

// const imReady = useStoreActions((a) => a.reports.imReady);
export async function prepareUserTransactionData(bookingsRaw, paymentsRaw) {
  let lastPayment = '';
  let entries = {};
  _.flatMap(bookingsRaw.Members, (m) => {
    return m.Bookings.map((b) => {
      let createdAt = b.BookingLogs[0].id;
      const allocs = reducedExpenditureAllocations(b.Allocations, lastPayment);
      b = { ...b, ...allocs, name: m.shortName, createdAt };
      addEntry(entries, createdAt, 'expenditure', b);
      expendIndex[b.bookingId] = b;
      return b;
    });
  });

  let lastBooking = '';
  let [refunds, payments] = _.partition(paymentsRaw.Payments, (p) => !!p.refundId);
  refunds.forEach((p) => {
    let createdAt = p.refundId;
    p.Allocations = _.flatMap(payments, (pp) =>
      pp.Allocations.filter((a) => a.refundId !== null && a.refundId === p.refundId),
    );
    const allocs = reducedExpenditureAllocations(p.Allocations, lastPayment);
    const spent = allocs.Allocations.reduce((acc, a) => acc + a.amount, 0);

    if (spent !== p.amount - p.available) {
      console.log('refund spend error', spent, p.amount, p.available, p.paymentId);
      p.available = p.amount - spent;
    }
    p = { ...p, ...allocs, createdAt };
    addEntry(entries, createdAt, 'expenditure', p);
    expendIndex[p.refundId] = p;
  });
  payments.forEach((p) => {
    let createdAt = p.paymentId.substr(0, 10);
    const allocs = reducedIncomeAllocations(p.Allocations, lastBooking);
    const spent = allocs.Allocations.reduce((acc, a) => acc + a.amount, 0);
    if (spent !== p.amount - p.available) {
      console.log('spend error', spent, p.amount, p.available, p.paymentId);
      p.available = p.amount - spent;
    }
    p = { ...p, ...allocs, createdAt };
    addEntry(entries, createdAt, 'income', p);
  });
  return _.sortBy(_.toPairs(entries), (d) => d[0]);
}

function reducedExpenditureAllocations(allocations, lastPayment) {
  if (allocations.length === 0) return { Allocations: allocations, lastPayment };
  let allocs = _.groupBy(allocations, 'paymentId');
  allocs = _.values(allocs).map((allocs) => {
    allocs = _.sortBy(allocs, 'id');
    let amount = allocs.reduce((acc, all) => acc + all.amount, 0);
    return { ..._.last(allocs), amount };
  });
  allocs = _.sortBy(allocs, 'paymentId');
  const lastAlloc = _.last(allocs);
  let id = lastAlloc.id.toString().padStart(5, '0');
  let paidBy = `${lastAlloc.paymentId}.${lastAlloc.bookingId}.${id}`;
  lastPayment = maxString(lastPayment, lastAlloc);

  return { Allocations: allocs, lastPayment, paidBy };
}
function reducedIncomeAllocations(allocations, lastBooking) {
  let allocs = allocations.filter((a) => a.refundId || a.bookingId);
  if (allocs.length === 0) return { Allocations: allocs, lastBooking };
  allocs = _.groupBy(allocs, 'bookingId');
  allocs = _.values(allocs).map((allocs) => {
    const sAllocs = _.sortBy(allocs, 'id');
    let amount = allocs.reduce((acc, all) => acc + all.amount, 0);
    const sAlloc = _.last(sAllocs);
    const bookingCreatedAt = expendIndex[sAlloc.bookingId || sAlloc.refundId].createdAt;
    let id = sAlloc.id.toString().padStart(5, '0');
    let paidFor = `${bookingCreatedAt.substr(0, 10)}.${sAlloc.bookingId}.${id}`;

    return { ...sAlloc, amount, paidFor };
  });
  allocs = _.sortBy(allocs, 'paidFor');
  lastBooking = maxString(lastBooking, _.last(allocs).bookingId);

  return { Allocations: allocs, lastBooking };
}
function addEntry(entries, createdAt, type, item) {
  const day = createdAt.substr(0, 10);
  if (!entries[day]) entries[day] = { day, expenditure: [], income: [] };
  entries[day][type].push(item);
}
