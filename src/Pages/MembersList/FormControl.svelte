<script>
  import _ from 'lodash';

  export let name = '';
  export let label = name;
  $: label = _.startCase(name);
</script>

<div class={$$props.class ?? ''} style={$$props.style ?? ''} {label}>
  <slot />
</div>

<style>
  div {
    position: relative;
  }
  [label]:after {
    content: attr(label);
    position: absolute;
    display: inline-block;
    left: 1em;
    top: -8px;
    background-color: white;
    font-size: 0.7em;
    color: slategray;
  }
</style>
