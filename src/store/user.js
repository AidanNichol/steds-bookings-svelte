import _ from 'lodash';
import { get, writable } from 'svelte/store';
import { page } from './router.js';
import { loaded, hydrate } from './store.js';
import { postAuth, fetchAuth } from '@utils/use-data-api';

// import { thunk, computed, action, debug } from 'easy-peasy'; // 👈 import the hook

import Logit from '@utils/logit';
const logit = Logit('store/user');
const defState = {
  username: '',
  password: '',
  authError: '',
  ok: false,
  roles: [],
  hasBookingsRole: false,
  hasMembersRole: false,
};

export const userStore = writable(defState);

const extendSessonData = (res) => {
  if (!res.ok) return res;

  const roles = res.roles;
  res.hasBookingsRole = roles.includes('admin') || roles.includes('bookings');
  res.hasMembersRole = res.hasBookingsRole || roles.includes('members');

  logit('extendSessonData', res, get(loaded));
  setPageFromRoles(res);
  if (get(loaded)) return res;
  logit('********* load store data ***************');
  hydrate();
  return res;
};

export const login = async function (payload) {
  try {
    logit('loging in', payload);
    // var res = await postAuth('login', payload);
    var res = await postAuth(payload);
    logit('login returning', res);
    res = extendSessonData(res);
    userStore.set(res);
  } catch (error) {
    logit('signin error: ', error);
    userStore.set({
      ok: false,
      authError: `(${error.name}) ${error.message}`,
    });
  }
};

export const logout = async function () {
  logit('logging out');
  await fetchAuth('logout');

  // await getAuth('logoutX', '');
  // localStorage.removeItem('stEdsSignin');
  userStore.set(defState);
};

export const load = async function () {
  try {
    var res = await fetchAuth('logCheck');

    logit('getSession', res);
    if (res.ok) {
      res = extendSessonData(res);
      userStore.set(res);
    }
  } catch (error) {
    console.error('Failed to fetch walks', error);
    userStore.set({
      ok: false,
      authError: `(${error.name}) ${error.message}`,
    });
  }
};
export const setPageFromRoles = (res) => {
  if (get(page) !== null && get(page) !== 'none') return;
  let toPage = null;
  if (res.hasBookingsRole) toPage = 'bookings';
  else if (res.hasMembersRole) toPage = 'membersList';
  // toPage = 'membersList';
  page.set(toPage);
};
userStore.isRole = (role) => {
  if (role === 'bookings') return userStore.hasBookingsRole;
  if (role === 'members') return userStore.hasMembersRole;
  return false;
};
export const hasRole = (roles) => {
  let ok = _.intersection(get(userStore).roles, ['admin', ...roles]).length > 0;
  return ok;
};

// for testing
export const preLoad = async () => {
  userStore.set({
    username: 'aidan',
    password: 'admin',
    authError: '',
    ok: true,
    roles: ['admin'],
    hasBookingsRole: true,
    hasMembersRole: true,
  });
  setPageFromRoles();
  logit('preload status', userStore);
  logit('preload loaded', page, loaded);
  if (get(loaded)) return;
  logit('********* load store data ***************');
  await hydrate();
};
