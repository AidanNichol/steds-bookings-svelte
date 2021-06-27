import { addGettersToStore } from '@utils/createImmerActionStore';
import { writable, get } from 'svelte/store';

import { fetchData } from '@utils/use-data-api';
import Logit from '@utils/logit';
import _ from 'lodash';
var logit = Logit('store/member');

export const membersList = writable([]);

export const loadMembers = async () => {
  const mems = await fetchData('member/index');

  logit('members fetchdata returned', mems?.length, mems);
  membersList.set(mems);
  logit('memberslist', get(membersList));
};
export function updateMemberIndex(data) {
  const { memberId } = data;
  data.id = memberId;
  logit('updating', memberId, data);
  membersList.update((state) => _.uniqBy([data, ...state], 'memberId'));
  logit('membersList new state', get(membersList));
}
const setters = {
  nextMemNo: (store) => {
    const memNo =
      store.list.reduce((max, mem) => Math.max(max, mem.memberId.substr(1)), 0) + 1;
    return memNo;
  },
};
addGettersToStore(membersList, setters, membersList);
