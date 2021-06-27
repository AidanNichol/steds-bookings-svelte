<script>
  import { userStore as user, login, logout, preLoad, load } from '@store/user';
  import { onMount } from 'svelte';
  import Logit from '@utils/logit';
  const logit = Logit('pages/layouts/loginForm');

  let state = { username: '', password: '' };
  let error = '';
  onMount(async () => {
    logit('loading user');
    await load();
    // await preLoad();
  });
  $: logit('state Changed', state);
  $: {
    logit('userChanged', $user.ok, $user.roles, $user.username);
  }
  // const handleInputChange = (event) => {
  //   const target = event.target;

  // };
  const detectEnter = (event) => {
    error = '';
    if ((event.keyCode || event.which) === 13) {
      logMeIn();
      return false;
    }
  };

  const logMeIn = () => {
    logit('logmeIn', state.username, state.password);
    if (state.username === '') {
      error = 'Name Required';
      return;
    }
    if (state.password === '') {
      error = 'Password Required';
      return;
    }
    login(state);
    return;
  };
</script>

<div class="signin">
  {#if $user?.ok}
    <div style={{ textAlign: 'right' }}>
      Logged in:
      {$user.username}
      ({($user.roles || []).join(', ')})
      <button on:click={logout}>Sign Out</button>
    </div>
  {:else}
    <div>
      <form onsubmit="return false;">
        <input
          placeholder="username"
          name="username"
          type="text"
          autocomplete="off"
          bind:value={state.username}
          on:keydown={detectEnter}
          onFocus={state.resetUser}
        />

        <input
          placeholder="password"
          name="password"
          type="password"
          autocomplete="off"
          bind:value={state.password}
          on:keydown={detectEnter}
        />
        <button on:click={() => logMeIn()}>Sign In</button>
      </form>
      <span class="error">{error || (user?.authError ?? '')}&nbsp;</span>
    </div>
  {/if}
</div>

<style>
  form {
    display: flex;
    flex-direction: row;
  }
  .error {
    font-weight: 700;
    color: #700;
  }
</style>
