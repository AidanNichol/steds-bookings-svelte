<script>
  import Logit from '@utils/logit';
  var logit = Logit('pages/bookings/pushupSelect');
  import Icon from '@utils/Icon2.svelte';

  export let options;
  export let value;
  let showOptions;
  let open = ' closed';
  const changedOpt = (option) => {
    logit('changedOpt', value, option);
    value = option;
  };

  const toggleShow = () => {
    showOptions = !showOptions;
    logit('toggle showOptions', showOptions);
  };
  open = showOptions ? ' open' : ' closed';
  logit('PushUpSelect', options, value);
</script>

<div on:click={toggleShow} class="PushUp " class:open={showOptions}>
  <div class="options" class:show={showOptions}>
    {#each options as option}
      <div on:click={() => changedOpt(option)}>
        <Icon name={option.type} />
        {option.label}
      </div>
    {/each}
  </div>
  <div class="valueBox">
    <Icon name={value.type} />
    {value.label}
  </div>
</div>

<style lang="postcss">
  .PushUp {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow-y: visible;
    cursor: pointer;
    max-height: 52px;
    align-self: flex-end;
    margin-right: 8px;
    &.open {
      position: relative;
      bottom: 14px;
    }
    & div.options:not(.show) {
      display: none;
    }
    & div.options.show {
      background-color: #fff;
      border: 1px solid hsl(0, 0%, 90%);
    }
    & .valueBox {
      border: 1px solid hsl(0, 0%, 80%);
      border-radius: 5px;
      height: 38px;
      background-color: #fff;
      min-height: 38px;
      padding-top: 6px;
    }
  }
</style>
