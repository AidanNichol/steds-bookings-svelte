<script>
  import { onMount } from 'svelte';
  import Logit from '@utils/logit';
  import { fetchData } from '@utils/use-data-api';
  import { dispDate } from '@utils/dateFns';
  import { nameIndex as index } from '@store/nameIndex.js';
  import PageHeader from './PageHeader.svelte';

  import _ from 'lodash';

  import Icon from '@utils/Icon2.svelte';
  // import { Icon } from '../Components/utility/Icon';
  var logit = Logit('Reports/CreditOwedRpt');

  // const balance = (account) => account.Payments.reduce((sum, p) => sum + p.available, 0);
  // const totalCredit = () => credits.reduce((sum, account) => sum + balance(account), 0);
  let totalCredit = 0;

  let accounts = [];
  // const imReady = useStoreActions((a) => a.reports.imReady);
  onMount(async () => {
    const creditsOwed = await fetchData(`account/creditsOwed`);
    _.sortBy(creditsOwed, ['accountId', 'patmentId']);
    let accs = _.groupBy(creditsOwed, (p) => p.accountId);
    logit('creditsOwed fetchData returned', creditsOwed, accs);
    Object.entries(accs).forEach(([accountId, payments]) => {
      let acc = { accountId, name: $index.get(accountId).name, total: 0, credits: [] };
      acc.payments = [];
      for (const p of payments) {
        acc.total += p.available;
        // let allocations=_.groupBy(_.sortBy(p.Allocation, ['bookingId',]), 'bookingId')
        let credits = p.Allocations.map((a) => ({
          ...a,
          ..._.pick(a.Booking, ['status', 'walkId', 'memberId']),
        })).filter((a) => a.status.match(/[BC]X/));

        credits = _.orderBy(credits, ['bookingTransactionDate'], ['desc']);
        credits = _.unionBy(credits, 'bookingId');
        credits = _.orderBy(credits, ['bookingId'], ['desc']);
        for (const credit of credits) {
          let amount = Math.min(p.available, -credit.amount);
          if (amount > 0) {
            p.available -= amount;
            acc.credits.push({
              date: dispDate(credit.updatedAt || credit.paymentId),
              req: credit.status,
              desc: $index.get(credit.walkId)?.venue ?? '',
              name: $index.get(credit.memberId)?.shortName ?? '',
              amount: amount,
            });
          }
        }
        if (p.available > 0)
          acc.credits.push({
            date: dispDate(p.paymentId),
            req: p.req,
            desc: `(*£${p.amount})`,
            name: '',
            amount: p.available,
          });
      }
      totalCredit += acc.total;
      accounts = [...accounts, acc];
    });
    logit('lAccounts', accounts);
  });
  logit('lAccounts', accounts);
  $: logit('xAccounts', accounts);
  // if (credits.length > 0) imReady('credits');
</script>

<PageHeader title="Credits Owed" />
<div class="report">
  {#each accounts as { accountId, credits, available, total }}
    <div class="account">
      <div class="title spread">
        <span>{$index.get(accountId).name}</span>
        <span>{`£${total}`}</span>
      </div>
      {#each credits as { date, desc, req, name, amount }}
        <div class="box spread">
          <div>
            <span class="date">
              {date}
            </span>
            <Icon name={req} class="icon" />
            <span>
              <span class="venue">
                {desc}
              </span>
              <span class="shortname">
                {name}
              </span>
            </span>
          </div>
          <div>£{amount}</div>
        </div>
      {/each}
    </div>
  {/each}
  <div class="total">Total Credit £{totalCredit}</div>
</div>

<style lang="postcss">
  @page {
    margin: 1cm;
    size: A4;
  }
  .report {
    column-count: 3;
    /* column-rule: thin solid black; */
    column-gap: 1em;
  }
  .account {
    margin-top: 5px;
    break-inside: avoid;
    border: black thin solid;
    border-radius: 6px;
  }
  .title {
    font-size: 16px;
    border-bottom: black thin solid;
    background-color: lightsteelblue;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
  .date,
  .shortname {
    font-size: 10px;
  }
  .venue {
    font-size: 14px;
  }

  .spread {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .total {
    font-weight: bold;
    font-size: 18px;
  }
</style>
