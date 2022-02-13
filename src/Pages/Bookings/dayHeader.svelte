<script>
  // import { format, parseISO } from 'date-fns';

  export let x;
  export let y;
  export let width;
  export let height;
  export let title;

  let vPad = 0.15;
  let rx = 0.3;
  let center = width / 2;
  let headBg = 'blueBg';
  let align;
  $: if (/^\d/.test(title)) {
    center = 0;
    headBg = 'biegeBg';
    align = { 'dominant-baseline': 'middle', 'text-anchor': 'start' };
  } else {
    center = width / 2;
    align = { 'dominant-baseline': 'middle', 'text-anchor': 'middle' };
    headBg = 'blueBg';
  }
  // $: center = ? 0: width / 2;
  // $: text = /^W/.test(title)
  //   ? title.substr(1)
  //   : format(parseISO(title), `EEE dd MMM ''yy`);
  // $: headBg = /^W/.test(title) ? 'biegeBg' : 'blueBg';
  // const align = { 'dominant-baseline': 'middle', 'text-anchor': 'middle' };
</script>

<svg {x} {y} {width} {height}>
  <style>
    .blueBg {
      fill: #daf4f7;
      stroke: none;
    }
    .biegeBg {
      fill: #f5f5dc;
      stroke: none;
    }
    .blank {
      fill: #ffffff;
      stroke: none;
    }
    .line {
      stroke: black;
      stroke-width: 0.1;
      fill: none;
    }
    .text {
      font-size: 0.8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans,
        Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    }
  </style>
  <g viewbox={`0 0 1 ${width}`}>
    <rect x="0" y={vPad} {width} height={1 + vPad} {rx} class={headBg} />
    <rect x="0" y={1} {width} height={vPad + 0.1} class="blank" />
    <rect x="0" y={vPad} {width} height={height - vPad} {rx} class="line" />
    <text x={center} y={0.6} style="font-size:0.8;" {...align}>{title}</text>
    <line x1={0} y1={1} x2={width} y2={1} class="line" />
  </g>
</svg>
