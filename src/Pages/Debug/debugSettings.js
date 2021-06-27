// todo convert to svelte
//@ts-check
import _ from 'lodash';
import { writable, derived, get } from 'svelte/store';
import { logitEnabledState } from '@utils/logitEnabledState.js';
export { save } from '@utils/logitEnabledState.js';
import Logit from '@utils/logit.js';
let logBuild = Logit(`debug/buildTree`);
let logmeC = Logit(`debug/setCurrentValues`);
let logmeP = Logit(`debug/getCount`);
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
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      const active = [];
      const inactive = [];
      getEnableString($debugSettings, select.NO, active, inactive);
      logitEnabledState.set({ active, inactive });
      console.warn('enableState', { active, inactive }, get(logitEnabledState));
      set({ active, inactive });
    }, 1000);
  },
  { active: [], inactive: [] },
);

export function getEnableString(node, inheritedState, active, inactive) {
  logmeE('called', select[inheritedState], node.id, select[node?.state], node, {
    active,
    inactive,
  });
  if (node === undefined) return;
  if (inheritedState === node.state) return;
  let selCode = node.id + (node.leaf ? '' : ':*');
  if (node.state === select.YES) return active.push(selCode);
  if (node.state === select.NO) return inactive.push(selCode);
  // node.state must be SOME
  if (node.derivedState !== inheritedState && node.derivedState !== select.SOME) {
    if (node.derivedState === select.YES) active.push(selCode);
    else inactive.push(selCode);
  }
  inheritedState = node.derivedState ?? inheritedState;
  logmeE(
    'string 1b',
    selCode,
    node.id,
    select[inheritedState],
    select[node.state],
    select[node.derivedState],
    { active, inactive },
  );

  (node.children ?? []).forEach((child) =>
    getEnableString(child, inheritedState, active, inactive),
  );
  logmeE('string 2', selCode, node.id, node.derivedState, { active, inactive });
  return;
}
// export function getEnableString(node, inheritedState) {
//   let enableString = '';
//   // if (!root) return '';
//   logmeE('called', select[inheritedState], node.id, select[node?.state], node);
//   if (node === undefined) return '';
//   if (inheritedState === node.state) return '';
//   const generic = node.leaf ? '' : node.root ? '' : ':*';
//   if (node.state === select.YES) return ' ' + node.id + generic;
//   if (node.state === select.NO) return ' -' + node.id + generic;
//   // node.state must be SOME
//   if (node.derivedState !== inheritedState && node.derivedState !== select.SOME) {
//     enableString = (node.derivedState === select.YES ? ' ' : ' -') + node.id + generic;
//   } else enableString = '';
//   // if (node.derivedState!==select.SOME && )
//   inheritedState = node.derivedState ?? inheritedState;
//   // parentDerivedState = parentDerivedState === select.YES ? select.NO : select.YES;
//   logmeE(
//     'string 1b',
//     node.id,
//     select[inheritedState],
//     select[node.state],
//     select[node.derivedState],
//     enableString,
//   );

//   enableString = (node.children ?? []).reduce(
//     (str, child) => str + getEnableString(child, inheritedState),
//     enableString,
//   );
//   logmeE('string 2', node.id, node.derivedState, enableString);
//   return enableString;
// }

export function getCount(node, newState) {
  let diff = 0;
  let diff0 = null;
  logmeP('count -1', node, newState);
  let state = (node.children || []).every((item) => item.state === newState)
    ? newState
    : select.SOME;
  let derivedState = state;
  logmeP('count 0', node.name, state, select[state], diff);
  if (state !== select.SOME) {
    diff = state === select.YES ? 1 : -1;
    logmeP('count 1a', node.name, select[state], diff);
  } else {
    diff = node.children.reduce(
      (res, child) => res + child.diff ?? (child.state ? 1 : -1),
      0,
    );
    const someCount = node.children.filter((ch) => ch.state === select.SOME);
    if (someCount === 0) {
      if (node.children.length === diff) state = select.YES;
      else if (node.children.length === -1 * diff) state = select.NO;
      else state = select.SOME;
    }

    logmeP('count 1b', node.name, state, diff);
    diff0 = diff;
    if (Math.abs(diff) > 0) {
      [derivedState, diff] = diff > 0 ? [select.YES, 1] : [select.NO, -1];
    } else derivedState = select.SOME;
  }
  logmeP('count 2', node.name, { state, diff, diff0, derivedState });
  return { state, diff, diff0, derivedState };
}

/* 
get table of current logit codes and built the data hierarchy

 */
export function buildTree(logitCodes) {
  let codes = Object.keys(logitCodes);
  codes.sort();
  logBuild('logitCodes', logitCodes);

  let root = {};
  codes.forEach((code, i) => {
    logBuild('code', code);
    const tokens = code.split(':');
    _.set(root, tokens.join('.'), {
      i,
      id: code,
      name: _.last(tokens),
      leaf: true,
      state: select.NO,
      diff: -1,
      logit: logitCodes[code],
    });
  });
  logBuild('---- data1 -----', root);
  root = setupTreeRoot(root);
  root.root = true;
  root.name = '*';
  logBuild('---- data2 -----', root);
  setCurrentValues(root);
  root = { ...root, ...getCount(root) };

  logBuild('---- data3 -----', root);
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
  var savedEnableState = get(logitEnabledState);
  logmeC('savedEnableState read', savedEnableState);
  savedEnableState.active.forEach((name) => {
    setCurrentValue(root, name.replace(/:\*/g, ''), select.YES);
  });
  savedEnableState.inactive.forEach((name) => {
    setCurrentValue(root, name.replace(/:\*/g, ''), select.NO);
  });
}
function setCurrentValue(root, name, val) {
  const getBranch = (tree, name) => {
    if (!tree) return [];
    let index = (tree?.children ?? []).findIndex((b) => b.name === name);
    if (index < 0) return [];
    let res = tree.children[index];
    logmeC('findBranch', tree, name, index, res);
    return [res, `children[${index}]`];
  };
  logmeC('Processing', name, val);

  let [res, names] = name.split(/[.:]/).reduce(
    ([node, names], name) => {
      const [res, text] = getBranch(node, name);
      if (!res) {
        logmeC('no-res', text, res);
        return [];
      }
      return [res, [...names, text]];
    },
    [root, []],
  );
  if ((names?.length ?? 0) === 0) {
    logmeC('not Found', res, names, name);
    return;
  }
  let path = names.join('.');
  let tree = _.get(root, path);
  logmeC('setIndex', name, select[val], path, tree);
  tree = setChildrenState(tree, val);
  logmeC('setIndex2', name, select[val], path, tree);
  _.set(root, path, tree);
  while (names.length > 0) {
    let path = names.join('.');
    let tree = _.get(root, path);
    logmeC('setCount--', name, path, tree);
    _.set(root, path, { ...tree, ...getCount(tree, val) });
    names.pop();
  }
}
export function setupTreeRoot(tree, names = []) {
  if (tree.leaf) return tree;
  const children = _.toPairs(tree).map(([key, value]) =>
    setupTreeRoot(value, [...names, key]),
  );
  logBuild('setupTreeRoot', names, tree, children);
  return {
    children,
    state: select.NO,
    diff: -1,
    name: _.last(names) ?? '*',
    id: names.join(':') || '*',
  };
}
export function updateTree({ children, ...tree }, fn) {
  if (tree.leaf) return fn(tree);
  return {
    children: (children ?? []).map((value) => updateTree(value, fn)),
    ...fn(tree),
  };
}

export function setChildrenState(tree, state) {
  const diff = state ? 1 : -1;
  const derivedState = state;
  const setState = (tree) => {
    if (tree.leaf && !tree.logit) console.warn('mismatch', tree.id, tree);
    if (tree.leaf) tree.logit.active = state;
    return tree.state === state ? tree : { ...tree, state, derivedState, diff };
  };

  return updateTree(tree, setState);
}
