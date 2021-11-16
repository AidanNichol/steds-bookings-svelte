import { findIconDefinition, icon, layer } from '@fortawesome/fontawesome-svg-core';
import _ from 'lodash';
import Logit from '@utils/logit';
const logit = Logit('utilities/Icon');

const X = [
  { icon: ['fas', 'slash'], color: 'white', transform: { size: 13, y: -0.5, x: -2 } },
  { icon: ['fas', 'slash'], color: 'white', transform: { size: 13, y: +0.5, x: -2 } },
  { icon: ['fas', 'slash'], color: 'red', transform: { size: 13, x: -2 } },
];
const afIcons = {
  B: { icon: ['fad', 'bus-alt'], color: 'green' },
  C: { icon: ['fad', 'car-side'], color: 'blue' },
  W: { icon: ['fad', 'clock'] },
  T: { icon: ['ajn', 'treasurer'] },
  P: { icon: ['fas', 'pound-sign'], transform: { size: 19, x: 2 } },
  // '+': {icon:['ajn', 'credit']},
  BL: [{ icon: ['fad', 'bus-alt'], color: 'orange' }, ...X],
  '+': { icon: ['ajn', 'credit'] },

  A: { icon: ['fad', 'edit'] },
  Bank: [
    { icon: ['fad', 'sack'] },
    {
      icon: ['fas', 'pound-sign'],
      color: 'green',
      transform: { size: 8, y: 2 },
    },
  ],
  Blank: { icon: ['far', 'circle'], color: 'blue' },
  Cancel: { icon: ['fas', 'times'] },
  Printer: { icon: ['fad', 'print'] },
  trash: { icon: ['fad', 'trash-alt'] },
  spinner: { icon: ['fad', 'spinner'], color: 'blue', classes: ['fa-spin'] },
  spinner_third: { icon: ['fad', 'spinner-third'], classes: ['fa-spin'] },
  info_square: { icon: ['far', 'info-square'] },
  square: { icon: ['far', 'square'] },
  square_full: { icon: ['far', 'square-full'] },
  long_arrow_down: { icon: ['far', 'long-arrow-down'] },
  long_arrow_right: { icon: ['fad', 'long-arrow-right'] },
  // fasLongArrowRight: { icon: ['fas', 'long-arrow-right'] },
  // farLongArrowRight: { icon: ['far', 'long-arrow-right'] },
  page_up: { icon: ['fad', 'arrow-alt-up'] },
  page_down: { icon: ['fad', 'arrow-alt-down'] },
  thumbs_up: { icon: ['fad', 'thumbs-up'] },
  thumbs_down: { icon: ['fad', 'thumbs-down'] },
  user_add: [
    { icon: ['fad', 'user'] },
    {
      icon: ['fas', 'plus'],
      color: 'green',
      transform: { size: 8, y: -5, x: 7 },
    },
  ],
  user_enable: [
    { icon: ['fad', 'user'], color: 'orange' },
    {
      icon: ['fas', 'check'],
      color: 'green',
      transform: { size: 8, y: -5, x: 7 },
    },
  ],
  user_disable: [
    { icon: ['fad', 'user'], color: 'green' },
    {
      icon: ['fas', 'ban'],
      color: 'red',
      transform: { size: 8, y: -5, x: 7 },
    },
  ],
  user_delete: [
    { icon: ['fad', 'user'], color: 'orange' },
    { icon: ['fas', 'times'], color: 'red', transform: { size: 17 } },
  ],
  user_deceased: [
    { icon: ['fad', 'user'], color: 'orange' },
    {
      icon: ['fad', 'tombstone'],
      color: 'black',
      transform: { size: 8, y: -5, x: 7 },
    },
  ],
  user_undelete: [
    { icon: ['fad', 'user'], color: 'red' },
    { icon: ['fas', 'check'], color: 'green', transform: { size: 17 } },
  ],
  Delete_Member: [
    { icon: ['fad', 'user'], color: 'red' },
    { icon: ['fas', 'times'], transform: { size: 17 } },
  ],
  userWait: [
    { icon: ['fad', 'spinner'], classes: ['fa-spin'] },
    { icon: ['fad', 'user'], transform: { size: 8 } },
  ],
};
['B', 'C', 'W', 'T', 'P', '+'].forEach(
  (ky) => (afIcons[ky + 'X'] = _.flatten([afIcons[ky], X])),
);
// afIcons['+X'] = [...afIcons['+'], ...X];

export const buildIcon = (name, parts = afIcons[name]) => {
  // let parts = afIcons[name];
  if (!parts) console.log('not found', name, iconMap);
  // console.log({ name, parts });
  if (!_.isArray(parts)) parts = [parts];
  const raw = layer((push) => {
    parts.forEach((part) => {
      const {
        icon: [prefix, iconName],
        color = 'currentColor',
        ...rest
      } = part;
      rest.styles = { color };
      const def = findIconDefinition({ prefix, iconName });
      // console.log(name, { lay: part, prefix, iconName, rest, def });
      push(icon(def, rest));
    });
  });
  return raw.html;
};
{
  /* <svg><use xlink:href="#edit"></use></svg> */
}
const svgMap1 = _.keys(afIcons).map((name) => [name, buildIcon(name)]);
export const svgMap = _.fromPairs(svgMap1);
logit('svgMap', svgMap);
export const iconMap = afIcons;
