// todo convert to svelte
//@ts-check
import _, { cloneDeep } from 'lodash';
import { writable, derived, get } from 'svelte/store';
import { logitEnabledState } from '@utils/logitEnabledState.js';
export { save } from '@utils/logitEnabledState.js';
import Logit from '@utils/logit.js';
let logBuild = Logit(`debug/buildTree`);
let logmeC = Logit(`debug/setCurrentValues`);
let logmeP = Logit(`debug/setParentState`);
let logmeE = Logit(`debug/enableString*`);

// type select= true|false|undefined;

export const select = {
  YES: true,
  NO: false,
  SOME: null,
  '???': 'SOME',
  [true]: 'YES',
  [false]: 'NO',
  [undefined]: 'undef',
  [null]: 'SOME',
};
export const debugSettings = writable([], () => {
  // force a subscription to "enabledState" so that logitEnabledState gets updated.
  // derived stores only get updated if someone is watching via a subscription
  const unsubscribe = enabledState.subscribe(() => {});
  return () => {
    unsubscribe();
  };
});
let timeoutId;

export const enabledState = derived(
  debugSettings,
  ($debugSettings, set) => {
    logmeE('pre', $debugSettings, get(logitEnabledState));
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      logmeE('prePost', $debugSettings, get(logitEnabledState));
      const active = [];
      const inactive = [];
      getEnableString($debugSettings, select.NO, active, inactive);
      logitEnabledState.set({ active, inactive });
      console.warn('enableState', { active, inactive }, get(logitEnabledState));
      set({ active, inactive });
    }, 500);
  },
  { active: [], inactive: [] },
);

export function getEnableString(node, inheritedState, active, inactive) {
  if (node === undefined) return;
  let selCode = node?.id?.replaceAll('.', ':') + (node?.leaf ? '' : ':*');
  if (inheritedState === node.state) return;
  logmeE(
    'called',
    node.id,
    select[inheritedState],
    selCode,
    select[node?.state],
    select[node?.dervidedState] ?? '',
  );
  if (node.state === select.YES) active.push(selCode);
  else if (node.state === select.NO) inactive.push(selCode);
  else {
    // node.state must be SOME
    if (node.derivedState !== inheritedState) {
      if (node.derivedState === select.YES) active.push(selCode);
      if (node.derivedState === select.NO) inactive.push(selCode);
    }
    inheritedState = node.derivedState ?? inheritedState;

    (node.branches ?? []).forEach((child) =>
      getEnableString(node[child], inheritedState, active, inactive),
    );
  }
  logmeE('string 2', node.id, { active, inactive });
  return;
}
const branchMap = (node) => (node.branches ?? []).map((n) => node[n]);

// eslint-disable-next-line no-unused-vars
export function setParentState({ derivedState, diff, ...node }) {
  const len = (arr) => (arr ?? []).length;
  const showCount = (c) => _.fromPairs(_.map(c, (v, k) => [select[k], len(v)]));

  let count = _.groupBy(branchMap(node), (n) => n.state);
  logmeP('count ' + node.id, showCount(count));

  // all set to YES
  if (!count[false] && !count[null]) node.state = select.YES;
  // all set to NO
  else if (!count[true] && !count[null]) node.state = select.NO;
  else {
    // mix of values so state must be SOME
    node.state = select.SOME;
    // deduce derviedState. State by redoing count using known derivedState
    count = _.groupBy(branchMap(node), (n) => n.state ?? n.derivedState);
    let someDiff = (count[null] ?? []).reduce((tot, n) => tot + n.diff, 0);
    let diff = len(count[true]) - len(count[false]) + someDiff;
    logmeP('count2 ' + node.id, showCount(count), diff);

    const min = len(count[null]) > 0 ? 1 : 0;
    if (diff > min) node.derivedState = select.YES;
    else if (diff < -min) node.derivedState = select.NO;
    else {
      // no preference for dervideState. Return the diff to help our parent to decide
      node.derivedState = select.SOME;
      node.diff = diff;
    }
  }

  return node;
}

/* 
get table of current logit codes and built the data hierarchy

 */
export function buildTree(logitCodes) {
  let codes = Object.keys(logitCodes);
  codes.sort();
  logBuild('logitCodes', logitCodes);

  let root = {};
  codes.forEach((codeA, i) => {
    let tokens = codeA.replace(/:\*/g, '').split(/[.:]/);
    const code = tokens.join('.');
    logBuild('code', code, codeA);

    _.set(root, code, {
      i,
      id: code,
      name: _.last(tokens),
      leaf: true,
      state: select.NO,
      logit: logitCodes[codeA],
    });
  });
  logBuild('---- data1 -----', root);
  root = setupTreeRoot(root, '', '');

  root.root = true;
  root.name = '*';
  root.id = '*';

  root = setCurrentValues(root);

  // root = { ...root, ...getCount(root) };

  logBuild('---- data4 -----', _.cloneDeep(root));
  const active = [],
    inactive = [];
  getEnableString(root, select.NO, active, inactive);
  logBuild('new enableState', { active, inactive });
  // logmeE.active = false;
  // root = updateTree(root, (tree) => ({ ...tree, ...getCount(tree) }));
  debugSettings.set(root);
}
/* 
override the default values with the current setting
 */
export function setCurrentValues(root) {
  const { active, inactive } = get(logitEnabledState);
  let values = [
    ...active.map((v) => [v.replace(/:\*/g, '').replace(/:/g, '.'), select.YES]),
    ...inactive.map((v) => [v.replace(/:\*/g, '').replace(/:/g, '.'), select.NO]),
  ];
  values = _.sortBy(values, (v) => v[0]);
  logmeC('savedEnableState read', active, inactive, values);
  // values = values.slice(0, 2);
  values.forEach(([name, value]) => {
    root = setCurrentValue(root, name, value);
  });
  return root;
}
export function setNodeState(path, val) {
  debugSettings.update((root) => {
    return setCurrentValue(root, path, val);
  });
}
function setCurrentValue(root, path, val) {
  logmeC('Processing', path, val, cloneDeep(root));

  let tree = path && path !== '*' ? _.get(root, path) : root;
  logmeC('setIndex', select[val], path, cloneDeep(tree));
  tree = setChildrenState(tree, val);
  logmeC('setIndex2', select[val], path, cloneDeep(tree));
  if (path === '*') return tree;
  _.set(root, path, tree);
  while (path) {
    path = path.match(/(.*)[.]/)?.[1];
    let tree = path ? _.get(root, path) : root;
    logmeC('setCount--', path, cloneDeep(tree));
    tree = setParentState(tree);
    root = path ? _.set(root, path, tree) : tree;
    logmeC('setCount-2', path, cloneDeep(root));
  }
  return root;
}
let bbj = 0;
export function setupTreeRoot(tree, path, name) {
  if (bbj++ > 100) return tree;
  if (tree.leaf) return tree;
  const branches = _.keys(tree);
  path = name && path ? `${path}.${name}` : path + name;
  logBuild('setupTreeRoot 1', { path, name }, tree, branches);
  branches.forEach((key) => (tree[key] = setupTreeRoot(tree[key], path, key)));
  logBuild('setupTreeRoot 2', { path, name }, tree, branches);
  const ret = {
    ...tree,
    branches,
    state: select.NO,
    name: name,
    id: path,
  };
  logBuild('setupTreeRoot 3', { path, name }, _.cloneDeep(ret));
  return ret;
}
export function walkTree(tree, fn) {
  if (tree.leaf) return fn(tree);
  let nodes = {};
  (tree?.branches ?? []).forEach((key) => (nodes[key] = walkTree(tree[key], fn)));
  return { ...fn(tree), ...nodes };
}

export function setChildrenState(tree, state) {
  const setState = ({ ...tree }) => {
    if (tree.leaf && !tree.logit) console.warn('mismatch', tree.id, tree);
    if (tree.leaf && tree.logit) tree.logit.active = state;
    tree.state = state;
    delete tree.derivedState, tree.diff;
    return tree;
  };

  return walkTree(tree, setState);
}
