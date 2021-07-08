import { writable, derived, get } from 'svelte/store';
import _ from 'lodash';
var savedEnableState = JSON.parse(
  localStorage.getItem('stedsPWAdebug') || '{"active":[],"inactive":["*:*"]}',
);

console.warn('Restored logit enable state', savedEnableState);
export const logitEnabledState = writable(savedEnableState);
export const logitEnabledString = derived(logitEnabledState, ($logitEnabledState) => {
  const { active, inactive } = $logitEnabledState;
  let values = [...active.map((v) => [v, '']), ...inactive.map((v) => [v, '-'])];
  values = _.sortBy(values, (v) => v[0]);
  return values.map(([v, s]) => s + v).join(' ');
});
export const logitEnabledStringTrace = derived(
  logitEnabledString,
  ($logitEnabledString) => {
    console.warn('logitEnableString', $logitEnabledString);
    return false;
  },
);
export function save() {
  let { active, inactive } = get(logitEnabledState);

  active = _.sortBy(active, (value) => value.length);
  inactive = _.sortBy(
    inactive,

    (value) => value.length,
  );
  localStorage.setItem('stedsPWAdebug', JSON.stringify({ active, inactive }));
  console.warn('Saved logit enable state', { active, inactive });
}
