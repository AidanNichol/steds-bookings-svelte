<script context="module">
  import { writable } from 'svelte/store';
  export const reportComponent = writable(null);
  export const reportProps = writable({});
  export const displayReport = writable(false);
  export const reportTitle = writable('');
</script>

<script>
  import { svgMap } from './iconMap';
  import Logit from '@utils/logit';
  var logit = Logit('utilities/PrintButton');

  //----------------------------------------------------------
  //      components
  //----------------------------------------------------------

  export let tiptext = '';
  export let rTiptext = tiptext;
  export let rcomp = null;
  export let report = rcomp;
  export let rprops = null;
  export let props = rprops;
  export let title;
  export let onClick = null;

  let printRunning = false;

  $: tiptext = printRunning ? 'Processing Request' : rTiptext;
  $: logit('runReport', { report, props, title });
  const runReport = () => {
    if (onClick) onClick();
    reportComponent.set(report);
    reportProps.set(props);
    reportTitle.set(title);
    displayReport.set(true);
  };
</script>

<button on:click={runReport} style={`padding: 2px; width: 75px;${$$props.style ?? ''}`}>
  <span>
    {@html svgMap.Printer}
  </span></button
>

<style>
  button {
    color: #333;
    background-color: #e6e6e6;
    border: 1px solid #adadad;
    padding: 5px 8px;
    border-radius: 4px;
    position: relative;
    cursor: pointer;
    margin: 0;
  }
</style>
