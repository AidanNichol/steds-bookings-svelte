<script>
  export let text;
  let annStyle;
  $: {
    const len = text?.length ?? 0;
    annStyle = `--tw: ${len}ch; --ad: ${len / 4}s;`;
  }
</script>

<span class="marquee" style={annStyle}>
  <span>
    {text}
  </span>
</span>

<style lang="postcss">
  span.marquee {
    overflow: hidden;
    padding: 0;
    height: auto;
    display: inline-block;
    font-size: 0.6em;
    position: relative;
    bottom: 11px;
    z-index: 100;
  }

  span span {
    display: inline-block;
    white-space: nowrap;
    color: #00112c;
    width: var(--tw);
    text-shadow: var(--tw) 0 currentColor, calc(var(--tw) * 2) 0 currentColor,
      calc(var(--tw) * 3) 0 currentColor, calc(var(--tw) * 4) 0 currentColor;
    /* font-size: 0.6em; */
    will-change: transform;
    animation: marquee var(--ad) linear infinite;
    animation-play-state: running;
    padding: 0;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  /*  
* on MacOs: System Preferences > 
*           Accessibility > 
*           Display > Reduce motion
*/

  @media (prefers-reduced-motion: reduce) {
    span {
      animation: none;
      text-shadow: none;
      width: auto;
      display: block;
      line-height: 1.5;
      text-align: center;
      white-space: normal;
    }
  }
</style>
