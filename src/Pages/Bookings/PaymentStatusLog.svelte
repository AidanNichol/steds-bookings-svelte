<script>
  /* cSpell: disable */
  /* svelte-ignore a11y-click-events-have-key-events */
  import TheTable2 from './TransactionsStatusLogTable2.svelte';
  import { printTransactionReport } from './TransactionsStatusLogTable2.svelte';
  // import TheTable3 from './TransactionsStatusLogTable.svelte';
  import TheTable1 from './BookingStatusLogTable.svelte';
  import { today, adjustMonths } from '@utils/dateFns';
  import {
    sortFn,
    accountId,
    name,
    setNewStartDate,
    showByWalk,
    sortByWalk,
  } from '@store/accountStatus';
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

  $: TheTable = [TheTable1, TheTable2][reportNo];
  const cycleReport = () => {
    reportNo = (reportNo + 1) % 2;
    logit('ReportNo', reportNo);
    // TheTable = [TheTable1, TheTable2, TheTable3][reportNo];
  };
  const toggleSortByWalk = () => ($sortByWalk = !$sortByWalk);
  const toggleShowByWalk = () => ($showByWalk = !$showByWalk);
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

{#if $accountId}
  <div class={'Table ' + ($$props.class ?? '')}>
    <div class="logHeader">
      <div class="rptButtons">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={cycleReport} class="clickable file">{@html svgMap.file_alt}</span>
        {#if reportNo > 0}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            on:click={toggleShowByWalk}
            class="clickable"
            title={`change to group by ${$showByWalk ? 'Booking' : 'Walk'} Date`}>
            <div>Grouped By</div>
            <div>
              {$showByWalk ? 'Walk Date' : 'Booking Date'}
            </div>
          </div>
          {#if $showByWalk}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              on:click={toggleSortByWalk}
              class="clickable"
              title={`change to sort by ${$sortByWalk ? 'Booking' : 'Walk'} Date`}>
              <div>Sorted By</div>
              <div>
                {$sortByWalk ? 'Walk Date' : 'Booking Date'}
              </div>
            </div>
          {/if}
        {/if}
      </div>

      {#if reportNo === 1}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span class="print clickable" on:click={onPrint} title="Print Activity Report">
          {@html svgMap.Printer}
        </span>
      {:else}
        <div>&nbsp</div>
      {/if}

      <select class="range" bind:value={historyDate} on:select={handleChange}>
        <option value="current">Current</option>
        <option value="SixMonths">6 Months</option>
        <option value="OneYear">1 year</option>
        <option value="all">All</option>
      </select>
    </div>
    <svelte:component this={TheTable} {showByWalk} {sortByWalk} />
  </div>
{/if}

<style lang="postcss">
  .file {
    fill: white;
    height: 120%;
  }
  .rptButtons {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    width: 30%;
    & > div {
      padding: 0 3px;
      text-align: center;
      font-size: 0.5em;
      display: flex;
      flex-direction: column;
      border: thin solid black;
      border-radius: 4px;
      background-color: white;
    }
  }
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
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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
