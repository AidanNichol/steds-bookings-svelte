<script>
  import TheTable2 from './TransactionsStatusLogTable2.svelte';
  import { printTransactionReport } from './TransactionsStatusLogTable2.svelte';
  import TheTable3 from './TransactionsStatusLogTable.svelte';
  import TheTable1 from './BookingStatusLogTable.svelte';
  import { today, adjustMonths } from '@utils/dateFns';
  import { sortFn, accountId, name, setNewStartDate } from '@store/accountStatus';
  import { firstBookingDate } from '@store/store';
  import { svgMap } from '@utils/iconMap';

  // import '@utils/logsTable.scss';

  import Logit from '@utils/logit';
  var logit = Logit('pages/bookings/PaymentStatusLog');
  let TheTable = TheTable1;

  $: logit('account ChangeLogR start', $sortFn);
  let historyDate = 'current';
  $: if ($accountId) historyDate = 'current';
  $: if (historyDate) {
    const diff = { current: 0, SixMonths: -6, OneYear: -12, all: -300 }[historyDate];
    logit('selected', diff);
    const newDate = diff === 0 ? firstBookingDate : adjustMonths(today(), diff);
    logit('selected', historyDate, diff);
    setNewStartDate(newDate);

    // endDate.set(newDate);
  }
  let reportNo = 1;
  $: TheTable = [TheTable1, TheTable2, TheTable3][reportNo];
  const cycleReport = () => {
    reportNo = (reportNo + 1) % 3;
    logit('ReportNo', reportNo);
    TheTable = [TheTable1, TheTable2, TheTable3][reportNo];
  };
  const handleChange = (event) => {
    const range = event.target.value;
    logit('selectedHC', event.target.value);
    // return;
    const diff = { current: 0, SixMonths: -6, OneYear: -12, all: -300 }[range];
    logit('selectedHC', diff);
    const newDate = diff === 0 ? firstBookingDate : adjustMonths(today(), diff);
    logit('selectedHC', event.target.value, range, diff);
    setNewStartDate(newDate);
    // startDate.set(newDate);
  };
  const onPrint = () => {
    printTransactionReport($accountId, $name);
  };
</script>

<div class={'Table ' + ($$props.class ?? '')}>
  <div class="logHeader">
    <div on:click={cycleReport} class="clickable">
      {@html svgMap.file_alt}
    </div>
    <div class="logDate" title="sort by date" on:click={() => sortFn.set('byDate')}>
      Date
    </div>
    <div class="logText">Event</div>
    <!-- <div class='logAmount'>Exp.</div>
        <div class='logAmount'>Inc.</div> -->
    {#if reportNo === 1}
      <span class="print clickable" on:click={onPrint} title="Print Activity Report">
        {@html svgMap.Printer}
      </span>
    {:else}
      <div>&nbsp</div>
    {/if}
    <!-- <a
      class="print clickable"
      href={`/bookingsServer/bookings/account/userTransactionsRpt/${$accountId}/${$startDate}/${'2021-01-01'}`}
      title="Print Activity Report"
      target="_blank"
      ><span>
        {@html svgMap.Printer}
      </span>
    </a> -->
    <div class="logBal" title="sort by payment" on:click={() => sortFn.set('byPymt')}>
      Balance
    </div>

    <select class="range" bind:value={historyDate} on:select={handleChange}>
      <option value="current">Current</option>
      <option value="SixMonths">6 Months</option>
      <option value="OneYear">1 year</option>
      <option value="all">All</option>
    </select>
  </div>
  <svelte:component this={TheTable} />
</div>

<style lang="postcss">
  .clickable {
    cursor: pointer;
  }
  div.Btitle {
    justify-self: flex-end;
    font-weight: bold;
    font-size: 1.1em;
  }
  div.Table {
    border: #bce8f1 solid thin;
    display: grid;
    flex-direction: column;
    grid-template-rows: 30px max-content;
    overflow: auto;
  }
  .logHeader {
    color: #31708f;
    background-color: #d9edf7;
    border-bottom: #bce8f1 solid thin;
    min-height: 30px;
    height: 30px;
    display: grid;
    grid-template-columns: 20px 130px 100px 80px 70px 120px;
    align-items: center;
    padding: 0 4px;
  }
  .range {
    font-size: 0.9em;
    margin: 0;
    padding: 0;
  }
  .icon {
    display: inline-block;
    min-width: 1.25em;
  }

  .scrollBox {
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
    max-height: calc(99vh - 230px);
  }
</style>
