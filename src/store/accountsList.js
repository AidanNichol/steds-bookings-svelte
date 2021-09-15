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
  let accounts = await fetchData('account/index');
  accounts.forEach((a) => {
    const noMems = a.Members.length;
    a.shortNames = {};
    a.Members.forEach((m) => {
      m.shortName = noMems === 1 ? '' : `[${m.firstName}]`;
      a.shortNames[m.memberId] = m.shortName;
    });
  });
  logit('accounts fetchdata returned', accounts?.length, accounts);
  accountsList.set(accounts);
  // accountsList.setList(accounts);
  logit('accountslist', get(accountsList));
};
