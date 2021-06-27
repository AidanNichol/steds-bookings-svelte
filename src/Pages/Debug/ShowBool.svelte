<script>
  import { select, setChildrenState, getCount } from './debugSettings';
  // import Logit from '@utils/logit.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let obj;
  export let state;
  export let logme = () => {};
  // let logme = Logit(`debug/showBool`);
  let className = $$props ?? '';
  // const root = useStoreState((state) => state.debugSettings.nodes) as NodeMap;

  // const changeSelect = useStoreActions(
  //   (actions) => (actions.debugSettings as any).changeSelect,
  // );
  let stateName;
  $: stateName = select[state] + ' ' + select[obj.derivedState];
  const onClick = () => {
    state = state === select.YES ? select.NO : select.YES;
    if (obj.leaf) obj.logit.active = state;

    logme('changeState', obj.id, select[state]);

    obj = { ...setChildrenState(obj, state), ...getCount(obj, state) };
    dispatch('childChanged', { id: obj.id, state });
  };

  // $: logme('showBool', obj.id, obj.state, stateName, obj);
</script>

<div class={'bool ' + stateName + ' ' + className} on:click={onClick}>
  <span>
    <input
      type="checkbox"
      indeterminate={state === select.SOME}
      checked={state}
      readOnly
    />{' '}
    {obj.name}
  </span>
  <span>
    {obj.diff ?? '???'}
    &nbsp;{select[obj.state]}
    {#if !obj.leaf}
      {obj.diff0 ?? '?'}
      &nbsp;{select[obj.derivedState]}
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
