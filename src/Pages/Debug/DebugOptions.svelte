<script>
  import Logit, { logitCodes } from '@utils/logit';
  import _ from 'lodash';
  //@ts-check

  import { debugSettings as root, buildTree } from './debugSettings'; // 👈 import our model type
  import {
    logitEnabledString,
    logitEnabledState,
    save,
  } from '@utils/logitEnabledState.js';
  import ObjectTree from './ObjectTree.svelte';
  let logme = Logit(`debug/debugOptions`);

  $: buildTree($logitCodes);
  // $: logme('children', $root);
  $: logme('render', _.cloneDeep($root));
  $: logme('logitEnabledState', $logitEnabledState);
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
  <ObjectTree id="*" bind:obj={$root} bind:state={$root.state} indent={1} {logme} />

  <button on:click={save}>Save</button>
</div>
<div>enable: {$logitEnabledString}</div>

<style>
</style>
