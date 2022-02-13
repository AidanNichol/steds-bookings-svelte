<script>
  export let width;
  export let text;
  export let x;
  export let y;
  var c = document.createElement('canvas');
  var ctx = c.getContext('2d');
  ctx.font = `0.7px Roboto`;
  $: textWidth = Math.ceil(ctx.measureText(text).width) + 1;
  $: from = `${Math.ceil((100 * width) / textWidth)}%`;
  $: dur = `${Math.ceil(textWidth * 0.7)}s`;
  $: console.log('Marquee', text, width, textWidth, from, dur);
</script>

<svg {width} {x} {y} height="1">
  <style>
    text {
      font-size: 0.7px;
      font-family: 'Open-sans', Roboto, sans-serif;
    }
  </style>

  <symbol id={`s${textWidth}`}>
    <path id={`p${textWidth}`} d={`M 0.5 0.5 l ${textWidth} 0`} />
  </symbol>

  <!-- <use href="#s1" stroke="silver" stroke-width="10" fill="none" /> -->

  <text dominant-baseline="middle">
    <textPath href={`#p${textWidth}`} startOffset={from}>
      {text}
      <!-- <animate
        attributeName="startOffset"
        from="0%"
        to="-200%"
        {dur}
        repeatCount="freeze"
      /> -->
      <animate
        attributeName="startOffset"
        {from}
        to="-100%"
        {dur}
        repeatCount="indefinite"
      />
    </textPath>
  </text>

  <!-- <text dominant-baseline="middle">
    <textPath href="#p1" startOffset="100%">
      Text 1, text 2, text 3, text 3, text 4
      <animate
        attributeName="startOffset"
        from="100%"
        to="-100%"
        dur="10s"
        begin="5s"
        repeatCount="indefinite"
      />
    </textPath>
  </text> -->
</svg>
