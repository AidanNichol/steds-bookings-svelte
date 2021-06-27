<script>
  export let bkng = {};
</script>

<style lang="postcss">
  .annotation {
    display: inline-block;
    color: red;
    font-weight: bold;
    font-size: 0.7em;
    /* top: -5px; */
    width: 1.5em;
    height: 1.5em;
    text-align: center;
    border: solid thin red;
    border-radius: 50%;
    position: relative;
    left: -10px;
    top: -10px;
  }

  .guest {
    color: blue;
    border-color: blue;
  }
</style>

{#if bkng?.annNo}
  <div class="annotation" style={$$props.style ?? ''}>{bkng.annNo}</div>
{/if}
{#if bkng?.Member?.memberStatus === 'Guest'}
  <div class="annotation guest">G</div>
{/if}
