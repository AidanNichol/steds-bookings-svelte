<script>
  export let text = '';
  let h;
  let w;
  export let wd = 300;
  export let fSize = 14;
  // export let size = 14;
  $: if (h > 35 || w > wd) fSize = fSize - 0.5;
  // $: console.log('DataCell', name, wd, w, h, fSize);
</script>

<div bind:clientHeight={h} bind:clientWidth={w}>
  <span style="font-size: {fSize}px">{text}</span>
</div>

<style lang="postcss">
</style>
