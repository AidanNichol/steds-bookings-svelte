// import { writable } from 'svelte/store';

// import { fetchData } from '@utils/use-data-api';
import { now } from '@utils/dateFns';
import { refreshAccountBookings } from './accountStatus.js';
import { refreshedBookingStatus } from './walkBookingStatus';
import { updateMemberIndex } from './membersList';
import { refreshMemberData } from './memberCurrent.js';
import { loadMembers } from '@store/membersList';
import { loadAccounts } from '@store/accountsList';
import { setStale } from './payments.js';
import Logit from '@utils/logit';

var logit = Logit('store/monitorChanges');

let startDay = now().substr(0, 10);
setInterval(() => {
  let currentDay = now().substr(0, 10);
  console.log('reload?', startDay, currentDay);
  if (startDay !== currentDay) {
    logit('reload', startDay, currentDay);
    location.reload();
  }
}, 1000 * 60 * 60);
let retry = 0;
const createEvents = () => {
  // let events = new EventSource();
  // `localhost:4444/bookingsServer/monitorChanges?who=app${retry++}`,
  const host = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4444';
  let events = new EventSource(`${host}/bookingsServer/monitorChanges?who=app${retry++}`);
  events.onerror = (error) => {
    logit('Monitor Changes error', now(), error);
  };
  events.onmessage = (e) => {
    let { lastEventId: id, data, type } = e;
    data = JSON.parse(data);
    logit('monitorChanges event', { id, data, type }, e);
  };
  events.addEventListener('test', (e) =>
    console.log('test event', e.lastEventId, e.data),
  );
  const genListener = (fn) => {
    return (e) => {
      let data = JSON.parse(e.data);
      logit('event', e.type, data);
      fn(data);
    };
  };
  events.addEventListener('bookingChange', genListener(refreshAccountBookings));
  events.addEventListener('memberChange', genListener(refreshMemberData));
  events.addEventListener('refreshMemberIndex', genListener(updateMemberIndex));
  events.addEventListener('refreshMemberList', genListener(loadMembers));
  events.addEventListener('refreshAccountList', genListener(loadAccounts));
  events.addEventListener('refreshBookingCount', genListener(refreshedBookingStatus));
  events.addEventListener('refreshBanking', genListener(setStale));
  events.addEventListener('reload', () => location.reload());
  return events;
};
createEvents();
// setInterval(() => {
//   if (events.readyState === 2) createEvents();
// }, 10000);
