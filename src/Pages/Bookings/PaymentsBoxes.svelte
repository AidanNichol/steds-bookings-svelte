<script>
  import { getContext } from 'svelte';
  import Icon from '@utils/Icon2.svelte';
  import PaymentHelpDialog from './help/PaymentHelp.svelte';
  import { applyPaymentReceived } from '@store/accountStatus';
  import PushUpSelect from './PushupSelect.svelte';

  import TooltipButton from '@utils/TooltipButton.svelte';
  // import TooltipContent from '@utils/TooltipContent.svelte';
  import Logit from '@utils/logit';
  import PaymentHelp from './help/PaymentHelp.svelte';
  var logit = Logit('pages/Bookings/PaymentBoxes');

  const paymentOptions = [
    { type: 'P', label: 'Paid cash' },
    { type: 'PX', label: 'Refund Payment' },
    { type: 'T', label: 'Paid via Treasurer' },
    { type: 'TX', label: 'Refund via Treasurer' },
    { type: '+', label: 'Add Credit' },
    { type: '+X', label: 'Remove Credit' },
  ];

  let paymentType = paymentOptions[0];

  export let accountId;
  export let credit;
  export let owing;

  logit('PaymentsBoxes:props', paymentType, $$props);
  let handleKeydown = (event) => {
    if (event.which === 13 && amount) {
      event.preventDefault();
      amount = parseInt(amount);
      applyPaymentReceived({
        amount,
        note,
        req: paymentType.type,
        accountId,
        Allocations: [],
      });
      amount = '';
      note = '';
      paymentType = paymentOptions[0];
    }
  };
  const setPaymentType = (e) => logit('selectPaymentType', e);
  let amount = '',
    note = '';
  $: logit('amount', amount, note);
  let paidInFull = (event) => {
    logit('paidInFull', owing);
    applyPaymentReceived({
      type: 'PAYMENT',
      amount: owing,
      note,
      accountId,
      req: paymentOptions[0].type,
      Allocations: [],
    });
    event.target.value = '';
  };
  const { open } = getContext('simple-modal');
  const showHelp = () => {
    open(PaymentHelp, {});
  };
</script>

{#if accountId}
  <div class="payments">
    <div>
      {#if credit}
        <span class="credit" class:show={credit}>Credit £ {credit} &nbsp;</span>
      {/if}
      {#if owing > 0}
        <div>
          <button on:click={paidInFull} title="Paid Full Amount"
            >Payment Due £{owing}</button
          >

          &nbsp; or &nbsp;
        </div>
      {/if}
    </div>
    <div class="payment-boxes">
      <PushUpSelect
        options={paymentOptions}
        bind:value={paymentType}
        changed={setPaymentType}
      />
      &nbsp;£
      <div text="Enter paid amount and press enter" visible>
        <input size="3" type="text" on:keydown={handleKeydown} bind:value={amount} />
      </div>
      Note
      <input
        style="margin-left: 8px"
        class="note"
        type="text"
        placeholder="Optionally Enter text and press enter"
        on:keydown={handleKeydown}
        bind:value={note}
      />
      <button
        class="button pt-icon-help"
        on:click={showHelp}
        aria-label="Show help about using the payment boxes"
        style={{ marginLeft: 4, borderWidth: 0, background: 'rgb(238,238,238)' }}
      >
        <Icon name="info_square" width="20" />
      </button>
    </div>
  </div>
{/if}

<style lang="postcss">
  button {
    color: #333;
    background-color: #e6e6e6;
    border: 1px solid #adadad;
    padding: 5px 8px;
    border-radius: 4px;
    position: relative;
    cursor: pointer;

    /*  boxShadow: inset 0 3px 5px rgb(0,0,0,.125);*/
    margin-left: 5;
  }
  .payments {
    grid-column: 1 / span 2;
    grid-row: 3;
    min-height: 1px;
    margin-top: 10px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    margin-left: 10px;

    & .payment-boxes {
      display: grid;
      grid-template-columns: 225px 15px 55px 30px 1fr 50px;
      align-items: baseline;
      background: rgb(238, 238, 238);
      border: rgb(170, 170, 170) solid 2px;
      border-radius: 4px;
      padding: 5px;
      padding-right: 0;
      margin-left: 0;
      margin-top: 5px;
      max-height: 52px;
    }
    & .payment-boxes > div:not(.payment-types) {
      padding-top: 8px;
    }

    & .pt-icon-help {
      cursor: pointer;
      margin-left: 4px;
      border-width: 0;
      background: rgb(238, 238, 238);
    }
  }
</style>
