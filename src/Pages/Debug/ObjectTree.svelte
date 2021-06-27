<script>
  // import svelte from 'svelte';
  import { select, getCount } from './debugSettings.js';
  import ShowBool from './ShowBool.svelte';
  import { createEventDispatcher } from 'svelte';

  // import Logit from '@utils/logit.js';
  // let logme = Logit(`debug/ObjectTree`);
  const dispatch = createEventDispatcher();

  export let obj;
  export let state;
  export let indent = 0;
  export let logme = () => {};
  const childChanged = (event) => {
    const { id, state } = event.detail;
    logme('childChanged', id, state);

    obj = { ...obj, ...getCount(obj, state) };
    dispatch('childChanged', { id: obj.id, state: obj.state });
  };
  // $: logme('children', obj.id, obj, indent);
</script>

<div class={'obj ' + $$props.class}>
  {#if !obj?.leaf}
    <h4 class={`${select[state]} ${select[obj.derivedState]}`}>
      <ShowBool bind:obj bind:state={obj.state} on:childChanged={childChanged} {logme} />
    </h4>
  {/if}
  <div key={'obj:' + obj.name} class="objContent">
    {#each obj.children as child}
      {#if child.leaf}
        <ShowBool
          class="bool"
          bind:obj={child}
          bind:state={child.state}
          on:childChanged={childChanged}
          {logme}
        />
      {:else if indent < 10}
        <svelte:self
          bind:obj={child}
          bind:state={child.state}
          indent={indent + 1}
          on:childChanged={childChanged}
          {logme}
        />
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

    &.SOME {
      background-color: yellow;
    }
    &.YES {
      background-color: #00ff00;
      &.SOME {
        /* opacity: 50%; */
        background-color: #88ff88;
      }
    }
    &.NO {
      background-color: #ff0000;
      &.SOME {
        /* opacity: 50%; */
        background-color: #ff8888;
      }
    }
  }

  div {
    padding-left: 10px;
    & .objContent {
      padding-left: 40px;
    }
  }
  /* & .bool {
    padding-left: 25px;
  }

  border: #000000 solid thin;
  max-width: 620px;

  .base {
    display: none;
  }
  .YES {
    font-weight: bold;
    color: green;
  }
  .NO > span {
    text-decoration: line-through;
  }
  .SOME {
    opacity: 0.7;
  } */
</style>
