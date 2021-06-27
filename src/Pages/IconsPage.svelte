<script>
  import { postAuth } from '../utilities/use-data-api';
  import { fetchAuth } from '@utils/use-data-api';

  // import { library } from "@fortawesome/fontawesome-svg-core";
  import FontAwesomeIcon from '@utils/FontAwesomeIcon.svelte';
  // import _ from 'lodash';

  import Icon from '@utils/Icon2.svelte';
  import { iconMap, buildIcon } from '@utils/iconMap';
  import { fad } from '@images/fontawesome-subset/js-packages/@fortawesome/pro-duotone-svg-icons';
  import { far } from '@images/fontawesome-subset/js-packages/@fortawesome/pro-regular-svg-icons';
  import { fas } from '@images/fontawesome-subset/js-packages/@fortawesome/pro-solid-svg-icons';
  import { findIconDefinition, icon, layer } from '@fortawesome/fontawesome-svg-core';
  import Logit from '@utils/logit';
  var logit = Logit('pages/IconPage');

  const fadlist = Object.entries(fad).map(([name, { prefix, iconName }]) => [
    name,
    [prefix, iconName],
  ]);
  const farlist = Object.entries(far).map(([name, { prefix, iconName }]) => [
    name,
    [prefix, iconName],
  ]);
  const faslist = Object.entries(fas).map(([name, { prefix, iconName }]) => [
    name,
    [prefix, iconName],
  ]);
  const bus = iconMap.BX;
  console.log('BXXX', bus);

  // const prepIcon = (name) => {
  //   let bus = iconMap[name];
  //   if (!bus) console.log('not found', name, iconMap);
  //   if (!_.isArray(bus)) bus = [bus];
  //   const testIcon = layer((push) => {
  //     bus.forEach((lay) => {
  //       const {
  //         icon: [prefix, iconName],
  //         color = 'currentColor',
  //         ...rest
  //       } = lay;
  //       rest.styles = { color };
  //       const def = findIconDefinition({ prefix, iconName });
  //       console.log({ lay, prefix, iconName, rest, def });
  //       push(icon(def, rest));
  //     });
  //   });
  //   return testIcon.html;
  // };
  const buz = buildIcon('B');
  const BX = buildIcon('BX');

  const userWait = [
    { icon: ['fad', 'spinner'], classes: ['fa-spin'] },
    { icon: ['fad', 'user'], transform: { size: 8 } },
  ];
  const testIcon = buildIcon('userWait', userWait);
  const testIcon2 = layer((push) => {
    push(
      icon(findIconDefinition({ prefix: 'fad', iconName: 'spinner' }), {
        classes: ['fa-spin'],
      }),
    );
    push(
      icon(findIconDefinition({ prefix: 'fad', iconName: 'user' }), {
        transform: { size: 8 },
      }),
    );
  }).html;
  let loginData = {};
  const login = async () => {
    var res = await postAuth('login', { username: 'aidan', password: 'admin' });
    logit('postlogin', res);
    loginData = res;
  };
  let logCheckData = {};
  const logCheck = async () => {
    var res = await fetchAuth('logCheck');

    logCheckData = res;
  };
  let logoutData = {};
  const logout = async () => {
    var res = await fetchAuth('logout');
    logoutData = res;
  };
</script>

<button on:click={login}>login</button>{JSON.stringify(loginData)}
<button on:click={logCheck}>logCheck</button>{JSON.stringify(logCheckData)}
<button on:click={logout}>logout</button>{JSON.stringify(logoutData)}
<div style={`font-size: 4em;`}>{@html testIcon}</div>
<div style={`font-size: 4em;`}>{@html testIcon2}</div>
<div style={`font-size: 4em;`}>{@html buz}</div>
<div style={`font-size: 4em;`}>{@html BX}</div>

<div class="grid">
  {#each [1, 2, 3, 4] as sz}
    <div class="" style={`font-size: ${sz}em;`}><Icon name={'BX'} /></div>
  {/each}
</div>
<div class="grid">
  {#each Object.keys(iconMap) as item}
    <div class="icon"><Icon name={item} /><span>{item}</span></div>
  {/each}
</div>
<h3>FAD</h3>
<div class="grid">
  {#each fadlist as [name, icon]}
    <div class="icon">
      <FontAwesomeIcon {icon} /><span>{name}</span>
    </div>
  {/each}
</div>
<h3>FAR</h3>
<div class="grid">
  {#each farlist as [name, icon]}
    <div class="icon">
      <FontAwesomeIcon {icon} /><span>{name}</span>
    </div>
  {/each}
</div>
<h3>FAS</h3>
<div class="grid">
  {#each faslist as [name, icon]}
    <div class="icon">
      <FontAwesomeIcon {icon} /><span>{name}</span>
    </div>
  {/each}
</div>

<style>
  button {
    display: block;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-auto-rows: 80px;
  }
  .icon {
    display: flex;
    flex-direction: column;
    border: thin solid black;
    font-size: 2em;
  }
  .icon span {
    margin-top: 10px;
    font-size: 0.5em;
  }
</style>
