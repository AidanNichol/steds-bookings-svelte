import _ from 'lodash';
import { postData } from '@utils/use-data-api';
import { writable, get } from 'svelte/store';
import { nameIndex } from '@store/nameIndex.js';

// import { dispDate } from '../dateFns';

import Logit from '@utils/logit';
var logit = Logit('store/patches');
const debug = (x) => x;
const names = get(nameIndex);
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    processQueue                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

export const patchQueue = writable([]);
export const processing = writable(false);
export const setProcessing = (bool) => processing.set(bool);

const processQueue = async () => {
  if (get(processing)) return;
  processing.set(true);

  let queue = get(patchQueue);
  logit('queue changed', queue.length, debug(queue));
  while (queue.length > 0) {
    const [patch /*unpatch*/, ,] = queue[0];
    logit('process patch', debug(patch));
    const res = await postData(patch);
    logit('appliedPatches', debug(patch), res);
    patchQueue.update((state) => {
      queue = state.slice(1);
      return queue;
    });
  }
  processing.set(false);
};

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    addToQueue                  ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
*/

export const addToQueue = (patches) => {
  logit('AddPatches', patches, get(patchQueue), nameIndex);
  let xpatches = expandPatch(patches);
  if (xpatches[2]) xpatches[2] = names.get(xpatches[2])?.accountId;
  patchQueue.update((queue) => [...queue, xpatches]);
  logit('AddPatches - queue', get(patchQueue));
  processQueue();
};
const expandPatch = (arr) => {
  let [patches, unpatches] = arr;
  if (patches[0].path[0] === 'Banking') return arr;
  const newPatches = [];
  logit('patches.in', debug(patches));
  let memberId;

  patches.forEach((p) => {
    if (/Stack$/i.test(p.path[0])) return;
    if (p.path[0] === 'balance') return;
    if (p.path[0] === 'lastAction') return;
    let { op, path, value } = _.cloneDeep(p);
    value = debug(value);
    p = { op, path, value };

    if (path[0] === 'bookings') {
      if (path[2] === 'Allocations') return;
      memberId = value.memberId;
      let log = _.last(value.BookingLogs);
      if (log) {
        const patch = { op: 'add', path: ['BookingLog'], value: log };
        newPatches.push(patch);
      }

      delete value.Walk;
      delete value.BookingLogs;
      delete value.Allocations;
      path[0] = 'Booking';
      return newPatches.push(p);
    }

    if (path[0] === 'payments' && path[2] === 'Allocations') {
      p.path = ['Allocation'];
      if (!_.isArray(p.value)) p.value = [value];
      p.value.forEach((v) => delete v.Booking);

      return newPatches.push(p);
    }
    if (path[0] === 'payments') path[0] = 'Payment';
    if (path[0] === 'Payment' && path.length < 3 && value) {
      logit('payments', p);
      let allocs = (value.Allocations || []).filter((v) => !v.id);
      if (allocs.length > 0) {
        allocs.forEach((a) => delete a.Booking);
        const patch = { op, path: ['Allocation'], value: allocs };
        newPatches.push(patch);
      }
      delete value.Walk;
      delete value.Allocations;
    }

    if (path[0] === 'refunds' && path[2] === 'Allocations') return;
    // if (path[0] === 'refunds' && path[2] === 'Allocations') {
    //   p.path = ['Allocation'];
    //   if (!_.isArray(p.value)) p.value = [value];
    //   p.value.forEach((v) => delete v.Payment);

    //   return newPatches.push(p);
    // }
    if (path[0] === 'refunds') path[0] = 'Refund';
    if (path[0] === 'Refund' && path.length < 3 && value) {
      logit('refunds', p);

      delete value.Allocations;
    }

    newPatches.push(p);
  });
  logit('patches.out', debug(newPatches));
  newPatches.forEach((p, i) => logit('new ' + i, p.op, p.path.join('.'), p.value));
  return [newPatches, unpatches, memberId];
};
