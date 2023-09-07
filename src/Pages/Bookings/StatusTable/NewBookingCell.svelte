<script>
  import { applyBookingChange } from '@store/accountStatus';
  import Logit from '@utils/logit';
  import { svgMap } from '@utils/iconMap.js';

  var logit = Logit('pages/bookings/newBookingCell');

  export let walk;
  export let memberId;

  let full;
  let reqType;

  $: logit('newBookings', { walk, memberId, full });
  $: reqType = walk.full ? 'W' : 'B';

  const bookMe = (req) => {
    logit('bookme', walk, req);
    applyBookingChange({
      type: 'BOOK',
      walkId: walk.walkId,
      fee: walk.fee,
      memberId,
      req,
    });
  };
  const ht = 'height: 100%;';
</script>

<div class="bookingcell">
  <div class="hotRow">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => bookMe(reqType)}>
      {@html svgMap[reqType]}
    </div>
  </div>
  <div class="hotRow">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div style={ht} on:click={() => bookMe('W')}>{@html svgMap.W}</div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div style={ht} on:click={() => bookMe('C')}>{@html svgMap.C}</div>
  </div>
</div>

<style lang="postcss">
  .bookingcell {
    display: flex;
    flex-direction: column;
    transition: all 200ms ease-in;
  }
  .bookingcell:hover {
    z-index: 200;
    transform: scale(1.4);
    background-color: #f5edc3;
    border: thin black solid;
    position: relative;
    top: -4px;
  }

  .bookingcell:hover .hotRow {
    visibility: visible;
  }
  .bookingcell .hotRow {
    visibility: hidden;

    display: flex;
    flex-direction: row;
    justify-content: space-around;
    height: 50%;
  }
</style>
