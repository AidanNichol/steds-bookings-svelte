<script>
  import Icon from '@utils/Icon2.svelte';
  import { debts as accounts } from '@store/payments';
  import { nameIndex as index } from '@store/nameIndex.js';
  import PageHeader from './PageHeader.svelte';

  import Logit from '@utils/logit';
  var logit = Logit('Reports/PaymentsDueRpt');
  let totalDue = 0;

  // const imReady = useStoreActions((a) => a.reports.imReady);

  $: logit('debting accounts', $accounts);
  $: totalDue = $accounts?.reduce((sum, account) => sum + account.balance, 0);

  // if (accounts.length > 0) imReady('debts');
</script>

{#if $accounts?.length > 0}
  <PageHeader title="Payments Due" />
  <div class="report">
    {#each $accounts as account}
      <div class="account">
        <div class="title">
          <span>{account.sortName}</span>
          <span>{`£${account.balance}`}</span>
        </div>
        {#each account.bookings.filter((bkng) => bkng.owing > 0) as bkng}
          <div class="item">
            {bkng.displayDate}
            <span class="icon">
              <Icon name={bkng.status} />
            </span>
            <span class="text">
              {$index.get(bkng.walkId)?.venue ?? ''}
              {bkng.name}
            </span>
          </div>
        {/each}
      </div>
    {/each}
    <div class="total">Total Due £{totalDue}</div>
  </div>
{/if}

<style lang="postcss">
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
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 16px;
    border-bottom: black thin solid;
    background-color: thistle;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
  .icon {
    padding-right: 4px;
    padding-left: 4px;
    width: 16px;
    height: 16px;
  }
  .item {
    padding-left: 5px;
  }
  .total {
    font-weight: bold;
    font-size: 18px;
  }
</style>
