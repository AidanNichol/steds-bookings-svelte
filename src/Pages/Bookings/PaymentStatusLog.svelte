<script>
  // import TheTable from './PaymentStatusLogTable.svelte';
  import TheTable from './BookingStatusLogTable.svelte';
  import { today, adjustMonths } from '@utils/dateFns';
  import { sortFn, endDate, accountId } from '@store/accountStatus';
  import { firstBookingDate } from '@store/store';

  // import '@utils/logsTable.scss';

  import Logit from '@utils/logit';
  var logit = Logit('pages/bookings/PaymentStatusLog');

  $: logit('account ChangeLogR start', $sortFn, $endDate);
  let historyDate = 'current';
  $: if ($accountId) historyDate = 'current';
  $: if (historyDate) {
    const diff = { current: 0, SixMonths: -6, OneYear: -12, all: -300 }[historyDate];
    logit('selected', diff);
    const newDate = diff === 0 ? firstBookingDate : adjustMonths(today(), diff);
    logit('selected', historyDate, diff);

    endDate.set(newDate);
  }
  const handleChange = (event) => {
    const range = event.target.value;
    logit('selectedHC', event.target.value);
    // return;
    const diff = { current: 0, SixMonths: -6, OneYear: -12, all: -300 }[range];
    logit('selectedHC', diff);
    const newDate = diff === 0 ? firstBookingDate : adjustMonths(today(), diff);
    logit('selectedHC', event.target.value, range, diff);

    endDate.set(newDate);
  };
</script>

<div class={'Table ' + ($$props.class ?? '')}>
  <div class="logHeader">
    <div class="logDate" title="sort by date" on:click={() => sortFn.set('byDate')}>
      Date
    </div>
    <div class="logText">Event</div>
    <!-- <div class='logAmount'>Exp.</div>
        <div class='logAmount'>Inc.</div> -->
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
  <TheTable />
</div>

<style lang="postcss">
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
    grid-template-columns: 150px 180px 70px 120px;
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
