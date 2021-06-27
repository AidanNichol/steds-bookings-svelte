import { fetchData } from '@utils/use-data-api';
import { getTimestamp } from '@utils/dateFns';
import { writable, get } from 'svelte/store';
import {
  paid,
  clearPaymentsMade,
  totalCredit as closingCredit,
  totalDebt as closingDebt,
  totalPaid as bankedAmount,
} from './payments';
import { addToQueue } from './patches.js';

import Logit from '@utils/logit';
var logit = Logit('store/banking');
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useLatestBanking                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const showBanking = writable(false);
export const latestBanking = writable(null);
export const getLatestBanking = async () => {
  const res = await fetchData(`banking/latest`);
  logit('fetchData returned', res);
  latestBanking.set(res);
  logit('latestBanking', get(latestBanking));
};
export const bankMoney = async () => {
  const latest = get(latestBanking);
  const timeS = getTimestamp();
  const newBanking = {
    bankingId: 'BP' + timeS,
    bankedAmount,
    closingDebt,
    closingCredit,
    openingCredit: latest.closingCredit,
    openingDebt: latest.closingDebt,
    endDate: timeS,
    startDate: latest.endDate,
  };
  const patch = { op: 'add', path: ['Banking'], value: newBanking };
  const patches = [patch];
  paid.forEach((a) => {
    a.payments.forEach((p) =>
      patches.push({
        op: 'update',
        path: ['Payment', p.paymentId, 'bankingId'],
        value: timeS,
      }),
    );
  });

  addToQueue([patches, [{}]]);
  logit('bankMoney', patches);
  latestBanking.set(newBanking);
  clearPaymentsMade();
};
getLatestBanking();
