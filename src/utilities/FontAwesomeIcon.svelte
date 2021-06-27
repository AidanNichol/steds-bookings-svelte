<script>
  import { findIconDefinition, icon as getIcon } from '@fortawesome/fontawesome-svg-core';
  // import Logit from '@utils/logit.js';
  // var logit = Logit('utils/FontAwesomeIcon');

  export let icon;
  export let color = 'currentColor';
  export let transform = {};
  export let classes = '';
  let prefix, iconName;
  let iconD;
  $: {
    // console.log('glyph', icon, transform);
    [prefix, iconName] = icon ?? ['', ''];
    const iconD1 = findIconDefinition({ prefix, iconName });
    iconD = getIcon(iconD1, { transform, classes })?.html;
    // logit('glyph', icon, prefix, iconName, iconD);
  }
</script>

<span class="fa=fw" style={`color:${color};`}>{@html iconD}</span>

<style>
  /* .fa-svelte {
    width: 1em;
    height: 1em;
    overflow: visible;
    display: inline-block;
  } */
</style>
