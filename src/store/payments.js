import { writable, derived } from "svelte/store";
import { fetchData } from "@utils/use-data-api";
import { dispDate } from "@utils/dateFns";
import { nameIndex as names } from "@store/nameIndex.js";
import { loaded } from "@store/store";
// import { page } from '@store/router.js';

import _ from "lodash";
import Logit from "@utils/logit";
const logit = Logit("store/payments");
const staleCredits = writable(true);
const staleDebts = writable(true);
const stalePayments = writable(true);

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    Actions                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const displayDebts = writable(true);
// const display = writable('Debts');
// export const setDisplayDebts = () => {
//   display.set('Debts');
//   // logit('Display:', state.display);
// };
// export const setDisplayPaymentsMade = () => {
//   display.set('PaymentsMade');
//   // logit('Display:', state.display);
// };

export const setStale = () => {
	staleCredits.set(true);
	staleDebts.set(true);
	stalePayments.set(true);
};
// payments.onChanges = thunkOn(
//   (actions, storeActions) => [
//     storeActions.accountStatus.bookingChange,
//     storeActions.accountStatus.paymentReceived,
//   ],
//   (actions) => actions.setStale(),
// );
// const onSetPage = derived(page, $page => {
//   if ($page === 'payments' ) {
//     staleDebts.set(true);
//     display.set('Debts');

// }});
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    debts store                           ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
    */

let debtsDue = [];
export const debts = derived(
	[staleDebts, names, loaded],
	async ([$staleDebts, $names, $loaded], set) => {
		if (!$staleDebts || !$loaded) {
			set(debtsDue);
			return;
		}

		const debtsData = await fetchData("booking/owing");
		logit("fetchData  Booking/owing returned", debtsData);

		let dMap = debtsData.map((b) => {
			const { accountId, shortName: name } = $names?.get(b.memberId) ?? {};
			const { sortName } = $names?.get(accountId) ?? {};
			// logit('test b', b, $names?.get(b.memberId), accountId, $names?.get(accountId));
			const { venue } = $names?.get(b.walkId) ?? {};
			const displayDate = dispDate(b.BookingLogs[0].id);
			return { ...b, name, venue, displayDate, accountId, sortName };
		});
		dMap = _.groupBy(dMap, (b) => b.sortName);
		const pairs = _.sortBy(_.toPairs(dMap), (item) => item[0]);
		debtsDue = pairs.map(([sortName, bookings]) => {
			bookings.forEach(b=>{
				let totalPaid = (b.Allocations??[]).reduce((total, a)=>total+a.amount,0);
				b.owing=b.fee-totalPaid;
			})
			const balance = bookings.reduce((tot, b) => tot + b.owing, 0);
			const accountId = bookings[0].accountId;
			return { sortName, accountId, balance, bookings };
		});
		logit("debts", debtsDue);
		set(debtsDue);
		staleDebts.set(false);
	},
);
export const totalDebt = derived(debts, ($payload) =>
	$payload.reduce((tot, a) => tot + a.balance, 0),
);
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    PaymentsMade                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/

let paymentsData = [];
export const clearPaymentsMade = () => {
	paymentsData = [];
	stalePayments.set(true);
};
export const paid = derived(
	[stalePayments, names, loaded],
	async ([$stalePayments, $names, $loaded], set) => {
		if (!$stalePayments || !$loaded) return set(paymentsData);

		paymentsData = await fetchData("payment/paymentsMade");
		logit("fetchData returned", paymentsData);

		let dMap = paymentsData.map((p) => {
			p.displayDate = dispDate(p.paymentId);
			p.Bookings = p.Allocations.map((a) => {
				const booking = a.Booking;
				const { shortName: name } = $names.get(booking.memberId);
				const { venue } = $names.get(booking.walkId);
				const displayDate = dispDate(booking.BookingLogs[0].id);
				return { ...booking, name, venue, amount: a.amount, displayDate };
			}).filter((p) => p.fee !== 0);
			const { sortName } = $names.get(p.accountId);
			return { ...p, sortName };
		});
		dMap = _.groupBy(dMap, (p) => p.sortName);
		const pairs = _.sortBy(_.toPairs(dMap), (item) => item[0]);
		const paymentsMade = pairs.map(([sortName, payments]) => {
			const balance = payments.reduce((tot, p) => tot + p.amount, 0);
			const accountId = payments[0].accountId;
			return { sortName, accountId, balance, payments };
		});
		logit("paymentsMade", paymentsMade);
		paymentsData = paymentsMade;
		set(paymentsMade);
		stalePayments.set(false);
	},
	[],
);

export const totalPaid = derived(paid, ($payload) =>
	$payload.reduce((tot, a) => tot + a.balance, 0),
);
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    CreditsOwing                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
let creditsData = [];
export const credits = derived(
	staleCredits,
	async ($staleCredits, set) => {
		if (!$staleCredits) return set(creditsData);
		creditsData = await fetchData("account/creditsOwed");
		logit("fetchData returned", creditsData);
		set(creditsData);
		$staleCredits = false;
	},
	[],
);

export const totalCredit = derived(
	credits,
	($credits) => $credits.reduce((tot, a) => tot + a.available ?? 0, 0),
	0,
);
