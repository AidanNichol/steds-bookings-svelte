<script>
  /* jshint quotmark: false */
  import { onMount } from 'svelte';
  import Panel from '@utils/AJNPanel.svelte';
  import TooltipButton from '@utils/TooltipButton.svelte';
  // import PaymentsSummaryReport from '@reports/PaymentsSummaryReport.svelte';
  // import PrintButton from '@utils/PrintButton.svelte';
  import Icon from '@utils/Icon2.svelte';
  import { dispDate } from '@utils/dateFns';
  import { svgMap } from '@utils/iconMap';

  // import Notes20 from '../../images/poundSterling.jpg';
  // eslint-disable-next-line no-unused-vars
  import Notes20a from '@images/pound-banknote_1f4b7.png';
  import Notes20 from '@images/banknote-with-pound-sign_1f4b7.png';
  import {
    paid as paymentsMade,
    totalPaid,
    totalDebt,
    totalCredit,
    credits,
    setStale,
  } from '@store/payments';
  import { latestBanking as banking, bankMoney, showBanking } from '@store/banking';
  import { page } from '@store/router';
  import { currentMemberId } from '@store/memberCurrent';

  import Logit from '@utils/logit';
  var logit = Logit('pages/payments/PaymentsReceived');
  const newBkng = (booking) =>
    booking.activeThisPeriod && !(booking.paid && booking.paid.P > 0);

  export let toggleDisplay;
  logit('loaded', true);

  $: logit('hooky stuff', $paymentsMade, $banking, $showBanking);
  // if (!banking) return null;
  let startDate, closingDebt, closingCredit, allCredits;
  $: if ($banking) startDate = dispDate($banking?.endDate);
  $: {
    closingDebt = $totalDebt;
    closingCredit = $totalCredit;
    allCredits = $credits;
    logit('closing', { closingCredit, closingDebt, allCredits });
  }
  $: logit('filtered accounts', $paymentsMade);

  $: logit('accs', $paymentsMade);
  const showMemberBookings = (memberId) => {
    currentMemberId.set(memberId);
    page.set('bookings');
  };
  onMount(async () => {
    setStale(true);
  });
</script>

<Panel class="paymentsMade " style="max-height: 100%;">
  <h4 slot="header">
    Payments Made &nbsp; &nbsp; — &nbsp; &nbsp; Total Payments Received
    <span class="startDate" style={{ fontSize: '0.8em', fontStyle: 'italic' }}>
      (since {startDate})
    </span>
    : &nbsp; £{$totalPaid}
  </h4>
  {#if $paymentsMade}
    <div class="all-payments">
      <div class="buttons">
        <TooltipButton
          label="Show Payments Due"
          onClick={toggleDisplay}
          tiptext="Show Payments Due"
          class="tab-select"
          visible />
        <TooltipButton
          placement="bottom"
          onClick={() => {
            bankMoney($paymentsMade, $totalPaid, closingDebt, closingCredit);
          }}
          tiptext="Bank the money and start new period"
          visible={$showBanking}
          style={{ maxHeight: 54, padding: '2px 5px' }}
          img={Notes20}
          iconStyle="height: 40px;" />
        <a
          class="print"
          href="/bookingsServer/bookings/payment/paymentsReceivedRpt"
          title="Print Summary Report"
          on:click={() => ($showBanking = true)}
          target="_blank"
          ><span>
            {@html svgMap.Printer}
          </span>
        </a>
      </div>
      {#each $paymentsMade as account}
        <div class={' member-rcpt'}>
          <div class="overview">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span class="who" on:click={() => showMemberBookings(account.members[0]._id)}>
              {' '}
              {account.sortName}
            </span>
            <span class="paid">{`£${account.balance}`}</span>
          </div>
          {#each account.payments as payment}
            <div>
              {#each payment.Bookings as booking}
                <div class="detail" class:newBkng={newBkng(booking)}>
                  {booking.displayDate}
                  <Icon name={booking.status} width="16" />
                  <span class="text">
                    <span class="name">{booking.name}</span>
                    {booking.venue}
                  </span>
                  <span>£{booking.amount}</span>
                </div>
              {/each}
              {#if payment.available > 0}
                <div class="detail">
                  {payment.displayDate}
                  <Icon name={payment.req} width="16" />
                  <span class="text" />
                  <span>£{payment.available}</span>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</Panel>

<style type="postcss">
  .all-payments {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    height: 100%;
    flex: 0 0 300px;
    min-width: 0;
    overflow: scroll;
  }
  .all-payments .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 250px;
    min-height: 45px;
    margin: 0;
  }

  .member-rcpt {
    color: #31708f;
    margin-bottom: 5px;
    margin-right: 5px;
    padding-bottom: 4px;
    border: #bce8f1 thin solid;
    border-radius: 5px;
    flex: 0 0 auto;
    width: 245px;
    /*max-width: 300px;*/
  }
  .member-rcpt span {
    display: inline-block;
  }

  .member-rcpt .overview {
    background-color: #d9edf7;
    border-radius: 5px;
    border-bottom: #bce8f1 thin solid;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 2px 5px;
    display: flex;
    justify-content: space-between;
    width: 243px;
  }
  .member-rcpt .overview .who {
    /* width: 190px; */
    /* font-size: 1.1em; */
    font-weight: bold;
    padding-right: 5px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-basis: 1 1 190px;
  }

  .member-rcpt .overview .paid {
    width: 40px;
    text-align: center;
    font-size: 0.85em;
    padding: 2px;
    color: #333;
    background-color: #e6e6e6;
    border: 1px solid #adadad;
    border-radius: 4px;
  }

  .detail {
    position: relative;
    padding-left: 3px;
    padding-bottom: 0px;
    margin-bottom: 0px;
    font-size: 13px;
    display: grid;
    grid-template-columns: 85px 16px minmax(0, 1fr) auto;
    align-items: center;
  }
  .detail span {
    display: inline-block;
    padding: 0px;
  }

  .detail .text {
    /* display: inline-block;
      position: relative;
      top: 5px;
      min-width: 115px;
      max-width: 115px; */
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .detail.newBkng {
    background-color: rgb(233, 251, 239);
  }

  .detail .name {
    font-size: 0.9em;
    font-style: italic;
  }
  .print {
    display: inline-block;
    text-align: center;
    color: #333;
    background-color: #e6e6e6;
    border: 1px solid #adadad;
    border-radius: 4px;
    position: relative;
    cursor: pointer;
    margin: 0;
    width: 55px;

    font-size: 1.7em;
  }
</style>
