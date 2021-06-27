<script>
  import Icon from './Icon2.svelte';
  let styleI = $$props.style ?? '';
</script>

<span class="centered">
  <Icon name="spinner" style={` width: 5em; height: 5em;  color:#877031; ${styleI}`} />
</span>

<style>
  .centered {
    justify-self: center;
    align-self: center;
    margin: auto;
  }
</style>
