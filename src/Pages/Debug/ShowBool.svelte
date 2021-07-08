<script>
  import { select, setNodeState } from './debugSettings';
  export let obj;

  export let logme = () => {};
  let className = $$props ?? '';

  $: stateName = select[obj.state] + ' ' + select[obj.derivedState];
  const onClick = () => {
    let state = obj.state === select.YES ? select.NO : select.YES;
    if (obj.leaf) obj.logit.active = state;

    logme('changeState', obj.id, select[state]);

    setNodeState(obj.id, state);
  };
</script>

<div class={'bool ' + stateName + ' ' + className} on:click={onClick}>
  <span>
    <input
      type="checkbox"
      indeterminate={obj.state === select.SOME}
      checked={obj.state}
      readOnly
    />{' '}
    {obj.name}
  </span>
  <span>
    {select[obj.state]}
    {#if obj.state === select.SOME}
      &nbsp;{select[obj.derivedState]}
      {#if obj.derivedState === select.SOME}
        &nbsp;{obj.diff}
      {/if}
    {/if}
  </span>
</div>

<style lang="postcss">
  .bool {
    padding-left: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .YES {
    font-weight: bold;
    color: green;
  }
  .NO > span {
    text-decoration: none;
  }
  .SOME {
    opacity: 0.7;
  }
</style>
