<script>
  import { svgMap } from '@utils/iconMap.js';
  import { dispDate, todaysDate } from '@utils/dateFns';
  import { nameIndex as index } from '@store/nameIndex';
  import {
    bookingLogData as bookings,
    fundsManager,
    applyBookingChange,
  } from '@store/accountStatus';
  import { latestBanking } from '@store/banking';
  import _ from 'lodash';

  import Logit from '@utils/logit';
  // import { sprintf } from 'sprintf-js';

  var logit = Logit('pages/bookings/PaymentStatusLog');

  let balance;
  let lastBanking;
  let highlightPayment = null;
  const setHighlightDate = (dat) => (highlightPayment = dat);

  $: lastBanking = $latestBanking?.bankingId.substr(2);
  // $: balance = $bookings
  //   .filter((l) => (l?.balance ?? 0) !== 0)
  //   .reduce((t, l) => t + l.balance, 0);
  $: balance = $fundsManager.balance;
  $: credits = $fundsManager.paymentsStack.map((p) => $fundsManager.payments[p]);
  $: console.log('credits', credits);
  $: logit('TheTable', { logs: $bookings, props: $$props, lastBanking });
  $: console.table(
    $bookings.map((l) =>
      _.pick(l, [
        'id',
        'walkId',
        'venue',
        'req',
        'fee',
        'balance',
        'owing',
        'late',
        'name',
        'amount',
        'ruleAfter',
      ]),
    ),
  );

  // const logClasses = (log) =>
  //   ['ruleAfter', 'historic', 'balance'].filter((n) => log[n]).join(' ');

  // const amount = (log) => {
  //   const refund = log.refundId && log.req.length === 1 ? '*' : ' ';
  //   return sprintf(`%2d%s`, log.amount, refund);
  // };
  const resetLate = (booking) => {
    const { memberId, walkId } = booking;
    applyBookingChange({ walkId, memberId, req: 'BX' });
  };
  const preparePayments = (mBookings) => {
    let allocations = mBookings.map((b) => b.Allocations).flat();
    logit('myAllocs', allocations);
    allocations = _.groupBy(allocations, (a) => a.paymentId);
    logit('myAllocs2', allocations);
    allocations = Object.values(allocations).map((as) => {
      let amount = as.reduce((acc, all) => acc + all.amount, 0);
      return {
        paymentId: as[0].paymentId,

        req: as[0]?.Payment?.req ?? 'P',
        tot: as[0]?.Payment?.amount ?? '?',
        amount,
      };
    });
    logit('myAllocs3', allocations);
    return allocations;
  };
  // import { datetimePrevSec, todaysDate } from '@utils/dateFns';
  const today = todaysDate();
  const isHistoric = (mBooking) =>
    mBooking[0].walkId < 'W' + today && mBooking.every((b) => b.owing === 0);
  const owing = (mBookings) => mBookings.reduce((tot, b) => tot + b.owing, 0);
</script>

<div class="scrollBox">
  {#if highlightPayment}
    <div class="highlight box" on:click={() => setHighlightDate(null)}>
      {dispDate(highlightPayment)}
    </div>
  {/if}
  {#each $bookings as [walkId, mBookings], i}
    <div class=" bookingBlock" class:historic={isHistoric(mBookings)}>
      <div class="head">
        <span>{walkId.substr(1)}</span><span>{$index.get(walkId)?.venue}</span>
      </div>
      <div class="bookings">
        {#each mBookings as booking}
          <div class="booking">
            {#if booking.BookingLogs.length > 1}
              <div class="fullBookings">
                {#each booking.BookingLogs.slice(0, -1) as log}
                  <div>
                    <span>{dispDate(log.id)}</span>
                    <span class="icon">{@html svgMap[log.req]}</span>
                    {$index.get(booking.memberId)?.shortName}
                  </div>
                {/each}
              </div>
            {/if}
            <span class="uparrow">{booking.BookingLogs.length > 1 ? '▲' : ' '}</span>
            <span>{dispDate(_.last(booking.BookingLogs).id)}</span>
            <span class="icon" class:reset={booking.status === 'BL'}
              >{@html svgMap[booking.status]}
              <span class="resetLate" on:click={() => resetLate(booking)}>
                {@html svgMap.BL}{@html svgMap.long_arrow_right}{@html svgMap.BX}
              </span>
            </span>
            <!-- <Icon name={booking.status} class="icon" /> -->
            {$index.get(booking.memberId)?.shortName}
          </div>
        {/each}
      </div>
      <div class="payments">
        {#each preparePayments(mBookings) as pay}
          <div
            class:highlight={highlightPayment === pay.paymentId}
            on:click={() => setHighlightDate(pay.paymentId)}
          >
            <span class="payDate">{dispDate(pay.paymentId)}</span>
            <span class="icon">{@html svgMap[pay.req]}</span>

            <!-- <Icon name={pay.req} class="icon" /> -->
            <span>{pay.amount}</span>
            {#if pay.amount !== pay.tot}
              <span>(*{pay.tot})</span>
            {/if}
          </div>
        {/each}
        {#if owing(mBookings) > 0}
          <div>Owed £{owing(mBookings)}</div>
        {/if}
      </div>
      {#if owing(mBookings) == 0}
        <div class="ok">✔︎</div>
      {/if}
    </div>
  {/each}
  {#if credits.length > 0}
    <div class=" bookingBlock">
      <div class="head right">
        <span>Credits Available</span>
      </div>
    </div>
    <div class=" bookingBlock">
      <div class="payments">
        {#each credits as pay}
          <div class:highlight={highlightPayment === pay.paymentId}>
            <span class="payDate" on:click={() => setHighlightDate(pay.paymentId)}
              >{dispDate(pay.paymentId)}</span
            >
            <span class="icon">{@html svgMap[pay.req]}</span>

            <!-- <Icon name={pay.req} class="icon" /> -->
            <span>{pay.available}</span>
            {#if pay.amount !== pay.available}
              <span>(*{pay.amount})</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if balance !== 0}
    <div class=" bookingBlock">
      <div class="payments total">
        <div class="Btitle">{balance < 0 ? 'Owing ' : 'Credit '}</div>
        <div class="Balance" class:debt={balance < 0}>{` £${Math.abs(balance)}`}</div>
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  span {
    display: inline-block;
  }
  div.bookingBlock {
    font-size: 14px;
    display: grid;
    width: 100%;
    grid-template-areas:
      'head head head head'
      'dum bookings  payments ok';
    grid-template-columns: 50px 1fr 1fr 30px;
    border-bottom: thin black solid;
    /* margin-bottom: 10px; */
  }
  div.bookingBlock.historic {
    opacity: 0.5;
  }
  .head {
    padding-left: 10px;
    grid-area: head;
    background-color: beige;
    font-size: 1.1em;
    border-bottom: thin solid#daa520;
  }
  .head.right {
    grid-area: payment;
  }
  .head span {
    display: inline-block;
    min-width: 90px;
  }
  .bookings {
    grid-area: bookings;
    align-self: flex-end;
  }
  .payments {
    grid-area: payments;
    align-self: flex-end;
    cursor: pointer;
  }
  .ok {
    grid-area: ok;
    align-self: flex-end;
    justify-self: center;
    font-size: 1.5em;
    color: green;
    padding-right: 10px;
  }
  .uparrow {
    position: absolute;
    left: -15px;
    display: inline-block;
  }
  .booking:hover .uparrow {
    display: none;
  }
  .booking {
    position: relative;
  }
  .booking .fullBookings {
    display: none;
  }
  .booking:hover {
    border: thin black double;
  }
  .booking:hover .fullBookings {
    display: block;
    /* position: relative; */
    z-index: 10;
    opacity: 1;
    background-color: antiquewhite;
    /* top: 0px;
    left: 0px; */
  }
  .resetLate {
    display: none;
  }
  .icon.reset:hover .resetLate {
    display: block;
    position: absolute;
    border: thin black double;
    bottom: 0;
    left: 85px;
    padding: 0 3px;
    background-color: #caecfc;
  }
  .payDate {
    cursor: pointer;
  }
  .highlight {
    background-color: khaki;
    font-weight: bold;
  }
  .highlight.box {
    border: thin solid black;
    border-radius: 2px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 15;
  }

  div.total {
    display: flex;
    flex-direction: row;
    font-size: 1.2em;
  }

  div.Balance {
    justify-self: flex-end;
    font-weight: bold;
    color: green;
  }
  div.Balance.debt {
    color: red;
  }
  div.Btitle {
    min-width: 60px;
    justify-self: flex-end;
    font-weight: bold;
    /* font-size: 1.1em; */
  }

  .icon {
    display: inline-block;
    min-width: 1.25em;
  }

  .scrollBox {
    position: relative;
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
    max-height: calc(99vh - 230px);
  }
</style>
