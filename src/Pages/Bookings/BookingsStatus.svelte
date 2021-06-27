<script>
  import Panel from '@utils/AJNPanel.svelte';
  import SelectMember from './SelectMember.svelte';
  // import SelectMember from './Dummy.svelte';
  // import { today } from '@utils/dateFns';
  import PaymentsBoxes from './PaymentsBoxes.svelte';
  // import PaymentsBoxes from './Dummy.svelte';
  import ChangeLog from './PaymentStatusLog.svelte';
  // import ChangeLog from './Dummy.svelte';
  import StatusTable from './StatusTable/StatusTable.svelte';
  import AnnotateBooking from './AnnotateBooking.svelte';

  // import StatusTable from './Dummy.svelte';
  import { accountId, name, accountMembers, balance } from '@store/accountStatus';

  // import Logit from '@utils/logit';
  // var logit = Logit('Pages/bookings/BookingStatus');

  var title = 'Bookings';
  var bCl = `bookings mems${$accountMembers?.length}`;

  // var _today = today();
  // const closeit = (walk) => {
  //   return (
  //     walk.walkDate < _today && (
  //       <button onClick={() => closeWalkBookings(walk)} style={{ marginLeft: 3 }}>
  //         X
  //       </button>
  //     )
  //   );
  // };

  var credit;
  var owing;
  $: {
    credit = Math.max($balance, 0);
    owing = Math.max(-$balance, 0);
  }
</script>

{#if true}
  <Panel header={title} body={{ class: bCl }} id="steds_bookingsX">
    <div class="grid">
      <div class="select">
        <SelectMember />
        <h4>{$name ?? ' '}</h4>
      </div>
      <div class="status">
        <StatusTable />
        <div class="anno">
          <AnnotateBooking />
        </div>
      </div>
      <div class="logs">
        <ChangeLog class="logs" {...{ owing }} />
      </div>
      <div class="payments">
        <PaymentsBoxes class="payments" {...{ accountId: $accountId, credit, owing }} />
      </div>
    </div>
  </Panel>
{/if}

<style lang="postcss">
  .grid {
    flex-direction: column;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: auto auto;
    display: grid;
    grid-template-areas:
      'select logs'
      'status logs'
      'pymts pymts';
    height: 100%;
  }
  .select {
    grid-area: select;
    width: 300px;
  }
  .status {
    grid-area: status;
    align-self: start;
  }
  .logs {
    grid-area: logs;
    padding-bottom: 10px;
    max-width: 530px;
  }
  .payments {
    grid-area: pymts;
  }
  .anno {
    align-self: flex-end;
    justify-self: flex-end;
  }
  h4 {
    font-size: 2em;
    color: #31708f;
  }
</style>
