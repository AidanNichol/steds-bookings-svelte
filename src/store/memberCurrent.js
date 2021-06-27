// import { createImmerActionStore } from '@utils/createImmerActionStore';
import { writable, derived, get } from 'svelte/store';
import { produceWithPatches, enablePatches } from 'immer';
import { addToQueue as addToPatchesQueue } from './patches';
import { membersList } from './membersList';

import { currentSubsYear, getTimestamp } from '@utils/dateFns';
// import _ from 'lodash';

// import { produceWithPatches, enablePatches } from 'immer';
import { fetchData } from '@utils/use-data-api';
import Logit from '@utils/logit';
var logit = Logit('store/memberCurrent');
enablePatches();
const subsYear = currentSubsYear();

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    Model                                 ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
const initialState = {
  accountId: '',
  address: '',
  deceased: false,
  deleteState: '',
  email: '',
  firstName: '',
  joined: '',
  lastName: '',
  medical: '',
  memberId: '',
  memberStatus: '',
  mobile: '',
  nextOfKin: '',
  phone: '',
  roles: '',
  subscription: '',
  suspended: false,
};

export const editMode = writable(false);
export const newMember = writable(false);
export const viewCount = writable(0);
export const currentMemberId = writable('');
const nextMemberState = writable(null);
let newMemberData = {};
export const createNewMember = () => {
  newMemberData = buildNewMember();
  newMember.set(true);
  currentMemberId.set(newMemberData.memberId);
  editMode.set(true);
};
const memberStale = writable(true);
export const currentMemberData = derived(
  [currentMemberId, nextMemberState, newMember],
  async ([$currentMemberId, $nextMemberState, $newMember], set) => {
    if ($nextMemberState && $nextMemberState.memberId === $currentMemberId) {
      set($nextMemberState);
      return;
    }
    if ($newMember) {
      set(newMemberData);
      return;
    }
    if ($currentMemberId) {
      const res = await fetchData('member/memberData/' + $currentMemberId);
      logit('member fetchdata returned', $currentMemberId, res);
      nextMemberState.set(res);
      set(res);
    } else logit('no member');
  },
  {},
);
export const editChange = derived(editMode, ($editMode) => {
  logit('editMode Now', $editMode);
  return $editMode;
});
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    Form Fields Related                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const formFields = writable(initialState);
export const dirtyFields = derived(
  [currentMemberData, formFields],
  ([$member, $formFields]) => {
    return Object.keys(initialState).filter((ky) => $member[ky] !== $formFields[ky]);
  },
);
export const isDirty = derived(dirtyFields, ($dirtyFields) => $dirtyFields.length > 0);
export const fieldsChange = derived(formFields, ($formFields) => {
  logit('formFields Now', $formFields);
  return $formFields;
});

/*
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃              Member Subscription Status                  ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
  */
export const isPaidUp = (m) =>
  m?.memberStatus !== 'Member' || m?.subscription >= subsYear;
export const memberSubsStatus = derived(formFields, ($mem) => getSubsStatus($mem));
export const getSubsStatus = (mem) => {
  const subsStatus = getSubsStatusBasic(mem);
  const deleteState = mem.deleteState;
  let showState = subsStatus.status === 'ok' ? '' : subsStatus.status.toUpperCase()[0];
  if (deleteState >= 'S') showState = deleteState;
  if (!isPaidUp(mem)) showState = 'lapsed';
  if (deleteState === 'D') showState = 'died';
  subsStatus.showState = showState;
  // susbsStatus.paidUp=m?.memberStatus !== 'Member' || m?.subscription >= subsYear;
  subsStatus.paidUp = !subsStatus.showSubsButton;
  return subsStatus;
};

const getSubsStatusBasic = (mem) => {
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
  if (currentUserSubs >= okSubsYear) fee = 13;
  // console.log({currentUserSubs, year, thisYear, dueSubsYear,  okSubsYear, showSubsButton})
  if (currentUserSubs >= year || currentUserSubs >= dueSubsYear) {
    if (showSubsButton) {
      return { due: false, status, year, fee, showSubsButton };
    } else return { due: false, status, showSubsButton };
  }
  status = 'due';
  if (currentUserSubs >= okSubsYear) fee = 13;
  else status = 'late';
  showSubsButton = true;
  return { due: true, year, fee, status, showSubsButton };
};

// members.onSetPage = thunkOn(
//   (actions, storeActions) => storeActions.router.setPage,
//   (actions, { payload: page, getStoreState }) => {
//     logit('detected setPage  :', page);
//     if (page === 'membersList') actions.getMemberFromAccount();
//   },
// );
// members.getMemberFromAccount = thunk((actions, payload, { getStoreState }) => {
//   const id = getStoreState().accountStatus.bookings?.Members[0]?.memberId;
//   if (id) {
//     logit('seting memberId :', id);
//     actions.setCurrentId(id);
//     const { sorted, dispStart, dispLength } = getStoreState().members;
//     let i = sorted.findIndex((mem) => mem?.memberId === id);
//     logit('sync index', i, id, members);
//     if (i > dispStart || i > dispStart + dispLength - 1) {
//       actions.setDispStart(Math.max(i - 11, 0)); // postion in middle of page
//     }
//   }
// });
// members.setCurrentAccount = thunk(
//   (actions, memberId, { getStoreActions, getStoreState }) => {
//     const index = getStoreState().names;
//     const accountId = index.get(memberId).accountId;
//     getStoreActions().accountStatus.setAccount(accountId);
//   },
// );

// members.loadMembers = thunk(async (actions, payload, { getState }) => {
//   const mems = await fetchData('member/index');

//   logit('members fetchdata returned', mems?.length, mems);
//   actions.setList(mems);
//   logit('memberslist', getState().list);
// });
/* ( ͡° ͜ʖ ͡°)  ヽ(͡◕ ͜ʖ ͡◕)ﾉ  ( ͡ಠ ʖ̯ ͡ಠ)
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useActiveData                         ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const getDirty = () => {
  let dirty = get(dirtyFields);
  let allFields = Object.entries(get(formFields));
  const diffs = allFields.filter(([key]) => dirty.find((d) => d === key));
  logit('getDirty', { dirty, allFields, diffs });
  return diffs;
};
export const updateMember = (payload) => {
  logit('dispatchPayload', payload);
  const memberData = get(currentMemberData);
  const memberId = memberData.memberId;
  const [nextState, ...patches] = produceWithPatches(memberData, (draft) => {
    const newMember = memberData.newMember;
    const when = getTimestamp();
    const why = newMember ? 'Create' : 'Update';
    draft.lastAction = [when, memberId, why, JSON.stringify(payload)];

    Object.values(payload).forEach(([field, value]) => {
      draft[field] = value;
    });
  });
  // if (newMember) return payload;
  logit('patches', nextState, patches);
  patches.forEach((g) =>
    g.forEach((p) => {
      if (p.path[0] !== 'lastAction') {
        p.path = ['Member', memberId, ...p.path];
      }
    }),
  );
  editMode.set(false);
  newMember.set(false);
  if (patches[0].length === 0) return;
  logit('nextState', nextState, patches);
  addToPatchesQueue(patches);
  nextMemberState.set(nextState);
};
const buildNewMember = () => {
  const memNo =
    get(membersList).reduce((max, mem) => Math.max(max, mem.memberId.substr(1)), 0) + 1;
  const memberId = 'M' + memNo;
  const newMem = {
    memberId: memberId,
    accountId: 'A' + memNo,
    firstName: '',
    lastName: '',
    newMember: true,
    memberStatus: 'Guest',
  };
  return newMem;
};
