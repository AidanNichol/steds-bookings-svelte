<script>
  import Logo from '@images/St.EdwardsLogoSimple.svg';
  import { format } from 'date-fns';
  // import { displayReport } from '@utils/PrintButton.svelte';
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
  export let title = '';
</script>

<div class="header" style={$$props.style ?? ''}>
  <img class="logo" src={Logo} width="40px" alt="" />

  <div class="center">
    <slot>St.Edwards Fellwalkers: {title}</slot>
  </div>
  <div class="right">
    <div>{timestamp}</div>
    <slot name="right"><div class="pageNo" /></slot>
  </div>
</div>

<style lang="postcss">
  .center {
    font-weight: bold;
    justify-self: center;
    font-size: 20px;
  }
  .right {
    display: flex;
    flex-direction: column;
    font-size: 9;
  }
  .logo {
    padding: 3px;
    height: 30px;
    width: 30px;
  }
  .header {
    padding-top: 8px;
    justify-content: space-between;
    font-size: 10px;
    display: grid;
    grid-template-columns: 95px 1fr 95px;
    align-items: center;
    page-break-before: always;
  }
  .pageNo::before {
    counter-increment: pageNo; /* Increment the value of PageNo counter by 1 */
    content: 'Page ' counter(pageNo);
  }
</style>
