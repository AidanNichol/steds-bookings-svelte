<script>
  import PaymentsDue from './PaymentsDue.svelte';
  import PaymentsMade from './PaymentsMade.svelte';
  import { displayDebts } from '@store/payments';
  // import Logit from '@utilments/Payments-mobx');

  const toggleDisplay = () => ($displayDebts = !$displayDebts);
</script>

<div>
  {#if $displayDebts}
    <PaymentsDue {toggleDisplay} />
  {:else}
    <PaymentsMade {toggleDisplay} />
  {/if}
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
