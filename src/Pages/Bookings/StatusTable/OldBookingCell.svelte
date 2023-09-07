<script>
  import { applyBookingChange } from '@store/accountStatus';
  import { nameIndex } from '@store/nameIndex';
  import { openAnnotations } from '../AnnotateBooking.svelte';
  import Marquee from './Marquee.svelte';
  // import Icon from '@utils/Icon2.svelte';
  import { svgMap } from '@utils/iconMap.js';

  import { now } from '@utils/dateFns';
  import Logit from '@utils/logit';
  var logit = Logit('pages/bookings/OldBookingCell');

  export let booking;
  // const { booking, i, fee, lastCancel, openAnno } = props;
  let status, cancel;
  let annotation;

  $: {
    logit('booking', booking);
  }
  const bookMe = (req) => {
    logit('change Bookings', req, booking);
    let { walkId, memberId } = booking;
    let fee = $nameIndex.get(walkId).fee;
    applyBookingChange({ walkId, memberId, req, fee });
  };
  $: {
    status = booking.status;
    annotation = booking.annotation;
    let lastCancel = $nameIndex.get(booking?.walkId)?.lastCancel;
    cancel = status + 'X';
    if (now() > lastCancel && status === 'B') cancel = 'BL';
    logit('cancel?', annotation, booking, lastCancel, now(), status, cancel);
  }
</script>

<div class={'bookingcell'}>
  <div class="normal">
    <div style="font-size:1.7em;">{@html svgMap[status]}</div>
    <Marquee text={annotation} />
  </div>
  <div class="hotRow">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => bookMe(cancel)}>{@html svgMap[cancel]}</div>
    {#if status === 'W'}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div on:click={() => bookMe('B')}>{@html svgMap.B}</div>
    {/if}
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="hotRow" on:click={() => openAnnotations(booking)}>
    <div title={annotation} on:click={() => openAnnotations(booking)}>
      {@html svgMap.A}
    </div>
  </div>
</div>

<style lang="postcss">
  .bookingcell {
    display: flex;
    flex-direction: column;
    transition: all 200ms ease-in;
    position: relative;
    overflow: hidden;
  }
  .bookingcell:hover {
    z-index: 200;
    transform: scale(1.4);
    background-color: #f5edc3;
    border: thin black solid;
    position: relative;
    top: -4px;
  }

  .bookingcell:hover .normal {
    display: none;
  }
  .bookingcell .normal {
    display: block;
    flex-direction: column;
    justify-content: space-around;
    height: 50%;
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
