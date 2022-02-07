<script>
  import LoadIcon from './LoadIcon.svelte';
  // import carSide from './faCarSide.js';
  import car from './images/faCarSide.js';
  import bus from './images/faBus.js';
  import clock from './images/faClock.js';
  import pound from './images/faPoundSign.js';
  import circle from './images/faCircle.js';
  import square from './images/faSquare.js';
  import trash from './images/faTrashAlt.js';
  import credit from './images/ajnCredit.js';
  import treasurer from './images/ajnTreasurer.js';

  // const slash = require('./images/faSlash.js');
</script>

<defs>
  <LoadIcon icon={bus} color="#008000" name={'B'} />
  <LoadIcon icon={bus} color="#008000" name={'BX'} />
  <LoadIcon icon={bus} color="#FFA500" name={'BL'} />
  <LoadIcon icon={car} color="#0000ff" name={'C'} />
  <LoadIcon icon={car} color="#0000ff" name={'CX'} />
  <LoadIcon icon={clock} color="#444444" name={'W'} />
  <LoadIcon icon={clock} color="#444444" name={'WX'} />
  <LoadIcon icon={pound} color="#000000" name={'P'} />
  <LoadIcon icon={pound} color="#000000" name={'PX'} />
  <LoadIcon icon={square} color="#000000" name={'square'} />
  <LoadIcon icon={trash} color="#444444" name={'trash'} />
  <LoadIcon icon={circle} color="#000000" name={'circle'} />
  <LoadIcon icon={credit} color="#000000" name={'+'} />
  <LoadIcon icon={credit} color="#000000" name={'+X'} />
  <LoadIcon icon={treasurer} color="#000000" name={'T'} />
  <LoadIcon icon={treasurer} color="#000000" name={'TX'} />

  <g id="octagon" style="stroke: black;">
    <desc>Octagon as group</desc>
    <polygon
      points="
36 25, 25 36, 11 36, 0 25,
0 11, 11 0, 25 0, 36 11"
    />
  </g>
  <symbol
    id="sym-octagon"
    style="stroke: black;"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 40 40"
  >
    <desc>Octagon as symbol</desc>
    <polygon
      points="
36 25, 25 36, 11 36, 0 25,
0 11, 11 0, 25 0, 36 11"
    />
  </symbol>
</defs>
