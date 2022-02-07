<script>
  import { svgMap } from '@utils/iconMap.js';
  import Marquee from './StatusTable/Marquee.svelte';

  import { dispDate, todaysDate } from '@utils/dateFns';
  import { nameIndex as index } from '@store/nameIndex';
  import {
    bookingLogData,
    fundsManager,
    accountId,
    applyBookingChange,
    deletePayment,
    isLoading,
  } from '@store/accountStatus';
  import { latestBanking } from '@store/banking';
  import _ from 'lodash';

  import Logit from '@utils/logit';
  // import { sprintf } from 'sprintf-js';

  var logit = Logit('pages/bookings/PaymentStatusLog');

  let balance;
  let lastBanking;
  let shortNames;
  let highlight = null;
  const setHighlightDate = (pay = null) => {
    highlight = pay;
  };
  $: [bookings, refunds] = $bookingLogData || [];
  $: shortNames = $index.get($accountId)?.shortNames ?? {};
  $: highlight = $accountId ? null : null;
  $: lastBanking = $latestBanking?.bankingId.substr(2);
  // $: balance = bookings
  //   .filter((l) => (l?.balance ?? 0) !== 0)
  //   .reduce((t, l) => t + l.balance, 0);
  $: logit('isLoading', $isLoading);
  $: balance = $fundsManager.balance;
  $: credits = $fundsManager.paymentsStack.map((p) => $fundsManager.payments[p]);
  // $: refunds = prepareRefunds($fundsManager);
  $: console.log('credits', credits, balance);
  $: logit('TheTable', { logs: bookings, props: $$props, lastBanking, shortNames });
  $: console.table(bookings, [
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
  ]);

  const resetLate = (booking) => {
    const { memberId, walkId } = booking;
    applyBookingChange({ walkId, memberId, req: 'BX' });
  };
  const onDeletePayment = () => {
    if (
      window.confirm(
        `Do really want to remove the payment of £${
          highlight.amount
        } \n entered at ${dispDate(highlight.paymentId)}`,
      )
    ) {
      deletePayment(highlight.paymentId);
    }
  };
  // const prepareRefunds = ({ payments }) => {
  //   const isRefund = (p) => /.X$/.test(p.req);
  //   let refunds = _.keyBy(_.filter(payments, isRefund), 'paymentId');
  //   logit('refunds', refunds, payments);

  //   let refundAllocs = _.flatMap(payments, (o) => o.Allocations);
  //   logit('refundAllocs 1', refundAllocs);
  //   refundAllocs = _.filter(refundAllocs, (a) => !!a.refundId);
  //   logit('refundAllocs 2', refundAllocs);
  //   refundAllocs = _.groupBy(refundAllocs, 'refundId');
  //   logit('refundAllocs 3', refundAllocs);
  //   for (const [refundId, allocs] of _.toPairs(refundAllocs)) {
  //     logit('add allocations', refundId, allocs, refunds[refundId]);
  //     refunds[refundId] = { ...refunds[refundId], Allocations: allocs };
  //   }

  //   return _.values(refunds);
  // };
  const preparePayments = (mBookings) => {
    let allocations = mBookings.map((b) => b.Allocations).flat();
    logit('myAllocs', allocations);
    allocations = _.groupBy(allocations, (a) => a.paymentId);
    logit('myAllocs2', allocations);
    allocations = Object.values(allocations).map((as) => {
      let amount = as.reduce((acc, all) => acc + all.amount, 0);
      const { paymentId } = as[0] ?? {};
      const { req = 'P', amount: tot = '?', bankingId } = as[0]?.Payment ?? {};
      const deletable = !bankingId;
      return { paymentId, req, tot, amount, deletable };
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
  {#if highlight}
    <div class="highlight-container" on:click={() => setHighlightDate(null)}>
      {#if highlight?.deletable}
        <div
          class="delPayment"
          on:click={() => onDeletePayment()}
          title="remove this payment"
        >
          {@html svgMap[highlight.req]}{@html svgMap.long_arrow_right}{@html svgMap.trash}
        </div>
      {/if}
      <div class="highlight">
        {dispDate(highlight.paymentId)}
      </div>
    </div>
  {/if}
  {#if $accountId && $isLoading}
    <div class="loading">{@html svgMap.userWait}loading</div>
  {:else}
    {#each bookings as [walkId, mBookings], i}
      <div class=" bookingBlock" class:historic={isHistoric(mBookings)}>
        <div class="head">
          <span>{walkId.substr(1)}</span><span>{$index.get(walkId)?.venue}</span>
        </div>

        <div class="bookings">
          {#each mBookings as booking}
            <div class="booking" class:hoverable={booking.BookingLogs.length > 1}>
              {#if booking.BookingLogs.length > 1}
                <div class="fullBookings">
                  {#each booking.BookingLogs.slice(0, -1) as log}
                    <div>
                      <span>{dispDate(log.id)}</span>
                      <span class="icon">{@html svgMap[log.req]}</span>
                      {shortNames[booking.bookingId.substr(11)]}
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
              {shortNames[booking.bookingId.substr(11)]}
            </div>
          {/each}
        </div>
        <div class="payments">
          {#each preparePayments(mBookings) as pay}
            <div
              class:highlight={highlight?.paymentId === pay.paymentId}
              on:click={() => setHighlightDate(pay)}
            >
              <span class="payDate">{dispDate(pay.paymentId)}</span>
              <span class="icon">{@html svgMap[pay.req]}</span>

              <!-- <Icon name={pay.req} class="icon" /> -->
              <span>{pay.amount}</span>
              {#if pay.amount !== pay.tot}
                <span>(*{pay.tot})</span>
              {/if}
              {#if pay.note}
                <div class="note">
                  <Marquee text={pay.note} />
                </div>
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
            <div class:highlight={highlight?.paymentId === pay.paymentId}>
              <span
                class="payDate"
                on:click={() => setHighlightDate({ ...pay, deletable: true })}
                >{dispDate(pay.paymentId)}</span
              >
              <span class="icon">{@html svgMap[pay.req]}</span>

              <!-- <Icon name={pay.req} class="icon" /> -->
              <span>{pay.available}</span>
              {#if pay.amount !== pay.available}
                <span>(*{pay.amount})</span>
              {/if}
              {#if pay.note}
                <div class="note">
                  <Marquee text={pay.note} />
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
    {#each refunds as refund}
      <div class="bookingBlock">
        <div class="head">
          <span>{dispDate(refund.refundId)} Refund £{refund.amount}</span>
          <span class="icon">{@html svgMap[refund.req]} </span>
        </div>
        <div class="payments">
          {#each refund.Allocations as pay}
            <div class:highlight={highlight?.paymentId === pay.paymentId}>
              <span
                class="payDate"
                on:click={() => setHighlightDate({ ...pay, deletable: true })}
                >{dispDate(pay.paymentId)}</span
              >
              <span class="icon">{@html svgMap[refund.req]}</span>

              <!-- <Icon name={pay.req} class="icon" /> -->
              <span>{pay.amount}</span>
              {#if refund.amount !== refund.available}
                <span>(*{refund.amount})</span>
              {/if}
              {#if refund.note}
                <div class="note">
                  <Marquee text={refund.note} />
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
    {#if balance !== 0}
      <div class=" bookingBlock">
        <div class="payments total">
          <div class="Btitle">{balance < 0 ? 'Owing ' : 'Credit '}</div>
          <div class="Balance" class:debt={balance < 0}>{` £${Math.abs(balance)}`}</div>
        </div>
      </div>
    {/if}
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
  .booking.hoverable:hover .uparrow {
    opacity: 0;
  }
  .booking {
    position: relative;
  }
  .booking .fullBookings {
    display: none;
  }
  .booking.hoverable:hover {
    border: thin black double;
  }
  .booking.hoverable:hover .fullBookings {
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
    font-weight: bold;
    background-color: khaki;
  }
  .highlight-container {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 15;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  .highlight-container div {
    border: thin solid black;
    border-radius: 4px;
  }

  .delPayment {
    background-color: lightsalmon;
    padding: 2px;
    margin-right: 6px;
    border-radius: 10px;
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
  .note {
    max-width: 200px;
    height: 10px;
    overflow: hidden;
    padding-top: 5px;
  }
  .loading {
    font-size: 4em;
    text-align: center;
  }
</style>
