<script>
  import Icon from '@utils/Icon2.svelte';

  export let img = undefined;
  export let icon = undefined;
  export let label = '';
  export let tiptext = undefined;
  export let visible = false;
  export let overlay = '';
  export let iconStyle = '';
  export let onClick = undefined;
</script>

{#if visible}
  <button
    class={($$props.class ?? '') + ' button'}
    on:click={onClick}
    aria-label={tiptext}
    type="button"
    style={$$props.style ?? ''}
    title={tiptext}
  >
    {#if icon}
      <Icon name={icon} style={iconStyle} />
    {/if}
    {#if img}<img src={img} alt="" style={iconStyle} />{/if}
    {label}
    <slot />
    <span class="overlay">{overlay}</span>
  </button>
{/if}

<style>
  button {
    color: #333;
    background-color: #e6e6e6;
    border: 1px solid #adadad;
    padding: 5px 8px;
    border-radius: 4px;
    position: relative;
    cursor: pointer;

    /*  boxShadow: inset 0 3px 5px rgb(0,0,0,.125);*/
    margin-left: 5;
  }

  .overlay {
    position: absolute;
    top: -2px;
    left: 0;
    font-size: 1.2em;
    font-weight: bold;
  }
</style>
