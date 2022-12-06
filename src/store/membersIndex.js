// import { addGettersSettersToStore } from '@utils/createImmerActionStore';
import { writable, derived, get } from 'svelte/store';
import { currentSubsYear } from '@utils/dateFns';
import { membersList as list } from './membersList';
import _ from 'lodash';

// import { produceWithPatches, enablePatches } from 'immer';
// import { fetchData } from '@utils/use-data-api';
import Logit from '@utils/logit';
var logit = Logit('store/member');
// enablePatches();
const subsYear = currentSubsYear();

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                   Stores                                 ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/

export const showAll = writable(false);
export const sortBy = writable('sortName');
export const dispStart = writable(0);
export const dispLength = writable(23);
export const listLength = writable(23);
export const newMember = writable(false);

export const currentMemberId = writable('');

export const toggleShowAll = () => {
  showAll.update((state) => !state);
  logit('ShowAll', get(showAll));
};
// export const setShowAll = (bool) => {
//   showAll.set(bool);
//   logit('ShowAll', bool);
// };
export const setSortBy = (bool) => {
  sortBy.set(bool);
  logit('SortBy', bool);
};

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    Member Index                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const isPaidUp = (m) =>
  m?.memberStatus !== 'Member' || m?.subscription >= subsYear;

const sortedBy = (list, showAll, sortBy) => {
  logit('sortedBy', sortBy, list);
  return _.sortBy(
    list?.filter((m) => showAll || isPaidUp(m)),
    [sortBy],
  );
};
export const sortedList = derived(
  [list, sortBy, showAll],
  ([$list, $sortBy, $showAll]) => {
    const sList = sortedBy($list, $showAll, $sortBy);
    logit('sList', sList);
    listLength.set(sList.length);
    return sList;
  },
);
export const sortedByNameList = derived([list, showAll], ([$list, $showAll]) => {
  const sList = sortedBy($list, $showAll, 'sortName');
  logit('sList', list);
  return sList;
});
export const sortedListSlice = derived(
  [sortedList, dispStart, dispLength],
  ([$sortedList, $dispStart, $dispLength]) => {
    return $sortedList.slice($dispStart, $dispStart + $dispLength);
  },
);
export const index = derived([sortedList, sortBy], ([$sortedList, $sortBy]) => {
  logit('sortedList', $sortedList);
  logit('sortBy', $sortBy);
  const index =
    $sortBy === 'sortName' ? indexByName($sortedList) : indexByNumber($sortedList);
  return index;
});
// addGettersSettersToStore(membersIndexStore, initialState, members);

const indexByName = (members = []) => {
  let key = [],
    index = {},
    lastKey = '';
  (members || []).forEach((mem, i) => {
    let c = mem.lastName[0];
    if (c !== lastKey) {
      lastKey = c;
      key.push({ display: c, key: c, start: i, end: members.length - 1 });
      index[c] = 0;
    }
    index[c]++;
  });
  for (let i = 0; i < key.length - 1; i++) {
    key[i].end = key[i + 1].start - 1;
  }

  return { key, index };
};
const indexByNumber = (members = []) => {
  let key = [],
    index = {};
  let bsize = Math.ceil(members.length / 24);
  for (var i = 0; i < members.length; i = i + bsize) {
    let c = members[i].memberId;
    key.push({ display: '○', key: c, start: i, end: members.length - 1 });
    index[c] = i;
  }
  for (let i = 0; i < key.length - 1; i++) {
    key[i].end = key[i + 1].start - 1;
  }
  return {
    key,
    index,
  };
};

/*
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃                    Member Utilities                      ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
  */

export const getSubsStatus = (mem) => {
  if (!mem) return { due: false, status: '?', showSubsButton: false };
  let _today = new Date();
  // DS.todaysDate;
  let status = 'ok';
  if (mem.memberStatus === 'HLM') {
    return { due: false, status, showSubsButton: false };
  }
  if (mem.memberStatus === 'Guest') {
    return { due: false, status: 'guest', showSubsButton: false };
  }

  const currentUserSubs = parseInt(mem.subscription || 0);

  let fee = 15;
  // const _today = new Date();
  let thisYear = _today.getFullYear();
  // year - all new subs will be ok until the end of thie 'year'
  let year = _today >= new Date(`${thisYear}-10-01`) ? thisYear + 1 : thisYear;
  // dueSubsYear - we are collecting subs for this year
  let dueSubsYear = _today >= new Date(`${thisYear}-12-31`) ? thisYear + 1 : thisYear;
  // okSubsYear - if current value is this then you get the reduced rate.
  let okSubsYear = _today < new Date(`${thisYear}-02-01`) ? thisYear - 1 : thisYear;
  let showSubsButton = _today >= new Date(`${thisYear}-12-01`) && currentUserSubs < year;
  if (currentUserSubs >= okSubsYear) fee = 15;
  // console.log({currentUserSubs, year, thisYear, dueSubsYear,  okSubsYear, showSubsButton})
  if (currentUserSubs >= year || currentUserSubs >= dueSubsYear) {
    if (showSubsButton) {
      return { due: false, status, year, fee, showSubsButton };
    } else return { due: false, status, showSubsButton };
  }
  status = 'due';
  if (currentUserSubs >= okSubsYear) fee = 15;
  else status = 'late';
  showSubsButton = true;
  return { due: true, year, fee, status, showSubsButton };
};
