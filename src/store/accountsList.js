// import { createImmerActionStore, addGettersToStore } from '@utils/createImmerActionStore';
// import _ from 'lodash';
import { writable, get } from 'svelte/store';

import { fetchData } from '@utils/use-data-api';
import Logit from '@utils/logit';
var logit = Logit('store/accountsList');

const actions = {};

actions.setList = (state, list) => {
  state.list = list;
};

export const accountsList = writable([]);
export const accountsListStore = accountsList;
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    Thunks                                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

export const loadAccounts = async () => {
  const accounts = await fetchData('account/index');

  logit('accounts fetchdata returned', accounts?.length, accounts);
  accountsList.set(accounts);
  // accountsList.setList(accounts);
  logit('accountslist', get(accountsList));
};
