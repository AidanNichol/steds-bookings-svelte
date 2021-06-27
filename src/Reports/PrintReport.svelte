<script>
  import {
    reportComponent,
    reportProps,
    reportTitle,
    displayReport,
  } from '@utils/PrintButton.svelte';
  $: document.title = $reportTitle;
</script>

{#if $displayReport && $reportComponent}
  <!-- <section class="printHeader buttons">
    <button on:click={() => window.print()} class="print">print</button>
    <div class="closeContainer">
      <button on:click={() => displayReport.set(false)} class="close" />
    </div>
  </section> -->
  <!-- <section class="printWindow"> -->
  <svelte:component this={$reportComponent} {...$reportProps} />
  <!-- </section> -->
{/if}

<style>
  @page {
    margin: 1cm;
    size: A4;
  }
  /* .printHeader {
    position: sticky;
    display: none;
    top: 0;
  }
  @media print {
    .printHeader {
      display: none;
    }
  }
  .printFooter {
    position: sticky;
    bottom: 0;
  }
  .buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: #ffffff;
    z-index: 100;
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
  } */
</style>
