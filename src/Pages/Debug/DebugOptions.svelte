<script>
  import Logit, { logitCodes } from '@utils/logit';
  //@ts-check

  import {
    debugSettings as root,
    getCount,
    buildTree,
    // enabledState,
  } from './debugSettings'; // 👈 import our model type
  import {
    logitEnabledString,
    logitEnabledState,
    save,
  } from '@utils/logitEnabledState.js';
  import ObjectTree from './ObjectTree.svelte';
  let logme = Logit(`debug/debugOptions`);
  const childChanged = (event) => {
    const { id, state } = event.detail;
    logme('childChanged', id, state);

    $root = { ...$root, ...getCount($root, state) };
  };
  $: buildTree($logitCodes);
  // $: logme('children', $root);
  $: logme('render', $root);
  $: logme('logitEnabledState', $logitEnabledState);
  // $: logme('enabledState', $enabledState);

  // $: getCount($root);
</script>

<div id="settings-page">
  <div class="item">
    <div class="main-text">
      <div>St.Edwards Booking System</div>
      <div>Debug Options</div>
    </div>
  </div>
  <button on:click={save}>Save</button>
  <div>enable: {$logitEnabledString}</div>
  <ObjectTree
    id="*"
    bind:obj={$root}
    bind:state={$root.state}
    indent={1}
    on:childChanged={childChanged}
    {logme}
  />

  <button on:click={save}>Save</button>
</div>
<div>enable: {$logitEnabledString}</div>

<style>
</style>
