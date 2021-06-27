<script>
  import { dispDate } from '@utils/dateFns';
  import PageHeader from './PageHeader.svelte';
  import { paid } from '@store/payments';
  import { latestBanking as banking } from '@store/banking';
  import Logit from '@utils/logit';
  var logit = Logit('Reports/PaymentSummaryReport');
  let totalPaymentsMade;
  // $: banking= $latestBanking;
  $: logit('props', $banking, $paid);
  $: {
    const start = dispDate($banking?.startDate ?? '2000-01-01')
      .substr(0, 16)
      .replace(/:/g, '.');
    document.name = `paymentSummary-${start}`;
    totalPaymentsMade = $paid?.reduce((sum, acct) => sum + acct.balance, 0);
  }
</script>

{#if $banking}
  <div class="page">
    <PageHeader title="Bus Lists" />
    <div>
      <h3 class="title">
        {`${dispDate($banking.startDate)} to ${dispDate($banking.endDate)}`}
      </h3>
      <div class="columns">
        {#each $paid as account}
          <div class="line spread" key={account.accountId}>
            <span class="who">{account.sortName}</span>
            <span class="momey">£{account.balance}</span>
          </div>
        {/each}
      </div>
      <h3 class="total spread">
        <span>Cash &amp; Cheques to Bank</span>
        <span class="money">£{totalPaymentsMade}</span>
      </h3>
    </div>
  </div>
{/if}

<style>
  .page {
    flex-direction: column;
    background-color: #ffffff;
    justify-content: flex-start;
    font-size: 18px;
    break-before: page;
    width: 210mm;
    height: 297mm;
    box-sizing: border-box;
    padding-right: 10px;
    border: thin solid green;
    /* background-color: yellow; */
  }

  .spread {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .columns {
    column-count: 2;
  }
  .line {
    font-weight: 1.5em;
    padding-left: 3em;
    padding-right: 3em;
  }
  .money {
    display: inline-block;
    width: 3em;
  }
  .title {
    text-align: center;
  }
  .total {
    padding-left: 15em;
    padding-right: 5em;
  }
</style>
