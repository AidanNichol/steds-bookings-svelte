<script>
  // import svelte from 'svelte';
  import { select } from './debugSettings.js';
  import ShowBool from './ShowBool.svelte';

  export let obj;
  export let indent = 0;
  export let logme = () => {};

  const mapObj = (obj) => (obj.branches ?? []).map((b) => obj[b]);
</script>

<div class={'obj ' + $$props.class}>
  {#if !obj?.leaf}
    <h4 class={`${select[obj.state]} ${select[obj.derivedState]}`}>
      <ShowBool {obj} {logme} />
    </h4>
  {/if}
  <div key={'obj:' + obj.name} class="objContent">
    {#each mapObj(obj) as child}
      {#if child.leaf}
        <ShowBool class="bool" obj={child} {logme} />
      {:else if indent < 10}
        <svelte:self obj={child} indent={indent + 1} {logme} />
      {:else}
        too much content {child.id}
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss">
  .obj {
    margin: 10px;
    margin-left: 0px;
    border: #000000 solid thin;
  }

  h4 {
    /* background-color: cyan; */
    border-bottom: black solid thin;
    font-size: 1.1em;
    font-weight: normal;
    margin: 0;
    padding-left: 10px;
  }
  .SOME {
    background-color: yellow;
  }
  .YES {
    background-color: #00ff00;
  }
  .YES.SOME {
    /* opacity: 50%; */
    background-color: #88ff88;
  }

  .NO {
    background-color: #ff0000;
  }
  .NO.SOME {
    /* opacity: 50%; */
    background-color: #ff8888;
  }

  div {
    padding-left: 10px;
  }
  div .objContent {
    padding-left: 40px;
  }
</style>
