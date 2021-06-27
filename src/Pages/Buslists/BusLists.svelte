<script>
  /* jshint quotmark: false, jquery: true */
  // import Loading from "@utils/Loading.svelte";
  import PrintButton from '@utils/PrintButton.svelte';
  import SummaryReport from '@reports/SummaryReport.svelte';
  import { status as walkBookingStatus } from '@store/walkBookingStatus.js';
  import BusListSelectedWalk from './BusListSelectedWalk.svelte';

  // import { useFetchData } from "@util/use-data-api";

  import SelectWalk from './SelectWalk.svelte';

  import Panel from '@utils/AJNPanel.svelte';

  import Logit from '@utils/logit';
  var logit = Logit('Pages/buslists/buslists');

  logit('walkBookingStatus', walkBookingStatus);
  const bookingStatus = $walkBookingStatus;
  logit('bookingStatus', bookingStatus);
  let currentWalk = bookingStatus?.[0];
  let setCurrentWalk = (walkId) => {
    currentWalk = walkId;
  };
  logit('currentWalk', currentWalk);

  var title = 'Bus List';
</script>

<Panel header={title}>
  <div class="bus-list">
    <div class="walk-select">
      <SelectWalk {...{ walks: bookingStatus, setCurrentWalk, currentWalk }} />
    </div>
    <div class="buttons">
      <PrintButton
        rcomp={SummaryReport}
        title="St.Eds - Bus Summary"
        tiptext="Print Bus Lists"
        visible
      />
    </div>
    <div class="lists">
      <BusListSelectedWalk {currentWalk} />
    </div>
  </div>
</Panel>

<style lang="postcss">
  :focus {
    outline: -webkit-focus-ring-color auto 5px;
    outline-style: none;
  }

  .bus-list {
    display: grid;
    grid-template-rows: 60px;
    grid-template-columns: 4fr 20px 2fr;
    grid-template-areas:
      'select xx buttons'
      'lists lists lists ';
  }
  .lists {
    grid-area: lists;
  }
  .walk-select {
    grid-area: select;
  }

  .buttons {
    grid-area: buttons;
    display: flex;
    flex-direction: row;
    font-size: 2em;
    margin: 0;
    padding-bottom: 8px;
  }
</style>
