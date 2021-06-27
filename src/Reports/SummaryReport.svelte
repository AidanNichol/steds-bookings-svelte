<script>
  import BusListRpt from './BusListRpt.svelte';
  import PaymentsDueRpt from './PaymentsDueRpt.svelte';
  import CreditsOwedRpt from './CreditsOwedRpt.svelte';
  import WalkDayBookingSheet from './WalkDayBookingSheet.svelte';

  // import Logit from '@utils/logit';
  // var logit = Logit('Reports/summaryReport');
</script>

<div class="document">
  <WalkDayBookingSheet />
  <BusListRpt />
  <CreditsOwedRpt />
  <PaymentsDueRpt />
</div>

<style>
  .document {
    width: 210mm;
    height: 297mm;
    box-sizing: border-box;
    padding-right: 10px;
    counter-reset: pageNo;
  }
</style>
