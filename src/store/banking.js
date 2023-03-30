import { fetchData } from "@utils/use-data-api";
import { getTimestamp } from "@utils/dateFns";
import { writable, get } from "svelte/store";
import { clearPaymentsMade } from "./payments";

import { addToQueue } from "./patches.js";

import Logit from "@utils/logit";
const logit = Logit("store/banking");
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useLatestBanking                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const showBanking = writable(false);
export const latestBanking = writable(null);
export const getLatestBanking = async () => {
	const res = await fetchData("banking/latest");
	logit("fetchData returned", res);
	latestBanking.set(res);
	logit("latestBanking", get(latestBanking));
};
export const bankMoney = async (paid, paidTotal, totalDebt, totalCredit) => {
	const latest = get(latestBanking);
	const timeS = getTimestamp();
	const newBanking = {
		bankingId: `BP${timeS}`,
		bankedAmount: paidTotal,
		closingDebt: totalDebt,
		closingCredit: totalCredit ?? 0,
		openingCredit: latest.closingCredit ?? 0,
		openingDebt: latest.closingDebt,
		endDate: timeS,
		startDate: latest.endDate,
	};
	const patch = { op: "add", path: ["Banking"], value: newBanking };
	const patches = [patch];
	paid.forEach((a) => {
		a.payments.forEach((p) =>
			patches.push({
				op: "update",
				path: ["Payment", p.paymentId, "bankingId"],
				value: `BP${timeS}`,
			}),
		);
	});

	logit("bankMoney patches", patches);
	addToQueue([patches, [{}]]);
	latestBanking.set(newBanking);
	clearPaymentsMade();
};
getLatestBanking();
