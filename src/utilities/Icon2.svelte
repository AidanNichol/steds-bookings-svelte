<script>
  import { svgMap } from './iconMap.js';
  export let name;
  // export let size = '';
  let icon;
  $: {
    icon = svgMap[name];
    if (!icon) console.log('Icon not found', name, svgMap);
    // console.log('ICON2', $$props);
  }
</script>

<span class={$$props.class ?? ''} style={$$props.style ?? ''}>
  {@html icon}
</span>
