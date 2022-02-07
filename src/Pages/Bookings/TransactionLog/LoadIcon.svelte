<script>
  // import Logo from '../images/St.EdwardsLogoSimple.svg';
  import _ from 'lodash';

  export let icon;
  export let color;
  export let name;
  let slash = /^.[LX]$/.test(name);
  let { svgPathData: paths, width, height } = icon;

  // console.log({ color, name, slash });
  if (!_.isArray(paths)) paths = [null, paths];
  let c1 = 0.02 * height;
  let c2 = 0.98 * height;
  const slashStyles = [
    ` stroke: white;stroke-width: ${0.2 * height};`,
    ` stroke: red;stroke-width: ${0.1 * height};`,
  ];
  const pathStyle = [` fill: ${color};opacity:0.4;`, ` fill: ${color};`];
</script>

<symbol id={`Sym-${name}`} viewBox={`0 0 ${width} ${height}`}>
  {#each paths as path, i}
    {#if path}
      <path d={path} style={pathStyle[i]} />
    {/if}
  {/each}

  {#if slash}
    {#each slashStyles as style}
      <line x1={c1} y1={c1} x2={c2} y2={c2} {style} />
    {/each}
  {/if}
</symbol>
