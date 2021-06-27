import { writable, get } from 'svelte/store';
// imrt _ from 'lodash';

import { fetchData } from '@utils/use-data-api';
import Logit from '@utils/logit';
var logit = Logit('store/walksList');

export const walksList = writable([]);
export const walksListStore = walksList;
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    Thunks                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/

export const loadWalks = async () => {
  const walks = await fetchData('walk/index');

  logit('walks fetchdata returned', walks?.length, walks);
  walksList.set(walks);
  // walksList.setList(walks);
  logit('walkslist', get(walksList));
};
