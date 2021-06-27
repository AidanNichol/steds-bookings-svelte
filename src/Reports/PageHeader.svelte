<script>
  import Logo from '@images/St.EdwardsLogoSimple.svg';
  import { format } from 'date-fns';
  import { displayReport } from '@utils/PrintButton.svelte';
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
  export let title = '';
</script>

<section class="printHeader">
  <button on:click={() => window.print()} class="print">print</button>
  <div class="closeContainer">
    <button on:click={() => displayReport.set(false)} class="close" />
  </div>
</section>

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
  .printHeader {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: #ffffff;
    z-index: 100;
  }
  @media print {
    .printHeader {
      display: none;
    }
  }
  .closeContainer {
    position: relative;
  }
  .close {
    display: block;
    box-sizing: border-box;
    position: absolute;
    z-index: 1000;
    top: 1rem;
    right: 1rem;
    margin: 0;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    border: 0;
    color: black;
    border-radius: 1.5rem;
    background: white;
    box-shadow: 0 0 0 1px black;
    transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
      background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    -webkit-appearance: none;
  }

  .close:before,
  .close:after {
    content: '';
    display: block;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    width: 1rem;
    height: 1px;
    background: black;
    transform-origin: center;
    transition: height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
      background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .close:before {
    -webkit-transform: translate(0, -50%) rotate(45deg);
    -moz-transform: translate(0, -50%) rotate(45deg);
    transform: translate(0, -50%) rotate(45deg);
    left: 0.25rem;
  }

  .close:after {
    -webkit-transform: translate(0, -50%) rotate(-45deg);
    -moz-transform: translate(0, -50%) rotate(-45deg);
    transform: translate(0, -50%) rotate(-45deg);
    left: 0.25rem;
  }

  .close:hover {
    background: black;
  }

  .close:hover:before,
  .close:hover:after {
    height: 2px;
    background: white;
  }

  .close:focus {
    border-color: #3399ff;
    box-shadow: 0 0 0 2px #3399ff;
  }

  .close:active {
    transform: scale(0.9);
  }

  .close:hover,
  .close:focus,
  .close:active {
    outline: none;
  }
</style>
