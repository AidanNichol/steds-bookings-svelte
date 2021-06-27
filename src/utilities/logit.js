import { writable, get } from 'svelte/store';
import { logitEnabledState } from './logitEnabledState';

import debug from 'debug';
import _ from 'lodash';
// export var opts = {};
// export var logitCodes = [];
// var opts = {};
let enableStr = '';
enableStr = window?.localStorage?.getItem('debug') ?? '';
export const logitCodes = writable({});
let debugme;
// logitCodes.update((store) => ({ ...store, [`logit:setup`]: debugme }));
// Object.defineProperty(debugme, 'active', {
//   get() {
//     return this.actVal ?? false;
//   },

//   set(value) {
//     this.actVal = !!value;
//   },
// });
// enableStr = (enableStr || '')
//   .replace(/"/g, '')
//   .split(',')
//   // .filter(str => !str.includes('logit'))
//   .filter((str) => !str.includes('logit') && !str.includes('pouchdb'))
//   .join(',');
// enableStr += ',⨁:*,steds:*,-logit:setup';
console.log('Logit', enableStr);

debug.enable('*');
// debug.enable(enableStr + ',steds:logit,-logit:setup, -pouchdb*');
// export default function Logit(source) {
export const Logit = (source1, active) => {
  if (/^(color|backg)/.test(source1)) console.error('logit old style', source1);
  const parts = source1.split(/[\\/](app|node_modules|packages)[\\/]/i);
  const goodBit = parts.pop();

  let source = goodBit
    .split(/[:.\\/]/)
    .map((tk) => _.upperFirst(tk))
    .join(':');
  const code = `⨁:${source}`;
  let debb = debug(code);

  debugme?.(source, debb.enabled);
  // _.set(opts, source.split(':'), true);

  // let backgroundColor = debb.color;
  // let textColor = getContrastYIQ(backgroundColor);
  // let colorFormat = `color:${textColor}; background:${backgroundColor}; font-weight:bold`;
  let colorFormat = getColorFormat(debb);
  const logit = (...Y) => logit.actVal && debb('%c %s ', colorFormat, ...Y);
  logitCodes.update((store) => ({ ...store, [code]: logit }));

  logit.actVal = active ?? intitallyActive(code);
  Object.defineProperty(logit, 'active', {
    get() {
      return this.actVal ?? true;
    },

    set(value) {
      // if ((this.actVal ?? true) === value) return;
      logit('Activated?', `${this.actVal} => ${value}`);
      // debb('%c %s ', colorFormat, 'Activated?', `${this.actVal} => ${value}`);
      this.actVal = !!value;
    },
  });

  logit.table = (Y) => logit.actVal && debb.enabled && console.table(Y);

  return logit;
};
debugme = Logit('logit:setup', true);
debugme.active = true;

function getColorFormat(debb) {
  let backgroundColor = debb.color;
  let textColor = getContrastYIQ(backgroundColor);
  return `color:${textColor}; background:${backgroundColor}; font-weight:bold`;
}

function getContrastYIQ(hexcolor) {
  if (typeof hexcolor !== 'string') return 'black';
  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 120 ? 'black' : 'white';
  // return yiq > 120 ? '#000000' : '#ffffff';
}
export default Logit;
export function intitallyActive(source) {
  const { active, inactive } = get(logitEnabledState);
  const defAct = active[0]?.startsWith('*') ? '*' : '';
  debugme?.('xxx', { enableStr, active, inactive });
  const actMatch = _.findLast(active, (val) => _.startsWith(source, val)) ?? defAct;
  const inactMatch = _.findLast(inactive, (val) => _.startsWith(source, val)) ?? '';
  const res = actMatch.length > inactMatch.length;
  debugme?.('result', source, res, { actMatch, inactMatch });
  return res;
}
