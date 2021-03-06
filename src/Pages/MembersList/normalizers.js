// import Logit from '@utils/logit';
const titleize = (string) =>
  string.toLowerCase().replace(/(^|\s)[a-z]/g, function (f) {
    return f.toUpperCase();
  });

// var logit = Logit('pages/Members/normalizers');

export function properCaseName(name) {
  const lowerCaseNames = ['van', 'de', 'de la', 'de le', 'von', 'van der'];
  var pcexp, pre, result;
  pcexp = /^(Mac|Mc|.+[ '])?(\w)$/;

  result = pcexp.exec(name);
  if (result) {
    pre = result[1];
    // logit('properCaseName', result);
    if (pre) {
      if (lowerCaseNames.includes(pre.trim().toLowerCase())) pre = pre.toLowerCase();
    } else pre = '';
    name = pre + result[2].toUpperCase();
  }
  return name;
}
const addressShortcuts = {
  Wb: 'Whitley Bay',
  'W/b': 'Whitley Bay',
  Ns: 'North Shields',
  'N/s': 'North Shields',
  Nut: 'Newcastle upon Tyne',
  'N/t': 'Newcastle upon Tyne',
  'N/c': 'Newcastle upon Tyne',
  Wal: 'Wallsend',
  Cul: 'Cullercoats',
  'M/s': 'Monkseaton',
  Mon: 'Monkseaton',
  Mnk: 'Monkseaton',
  Tyn: 'Tynemouth',
  Tm: 'Tynemouth',
  TN: 'Tynemouth',
  'T/m': 'Tynemouth',
};
export const pcexp = /^([^]*)([a-pr-uwyz]{1}[a-hk-y]?[0-9]{1,2})(\s*)([0-9]{1}[abd-jlnp-uw-z]{2})$/i;

export function properCaseAddress(address) {
  let result,
    addrLines = address.split('\n');
  //Post Code validation
  addrLines.forEach((line, index) => {
    if ((result = pcexp.exec(line)))
      line =
        titleize(result[1]) + result[2].toUpperCase() + ' ' + result[4].toUpperCase();
    else {
      line = titleize(line);
      if (addressShortcuts[line]) line = addressShortcuts[line];
    }
    addrLines[index] = line;
  });
  return addrLines.join('\n');
}

export function normalizePhone(number) {
  if (!number) return '';
  // logit('normalizePhone', number);
  var onlyNums = number.replace(/[^\d]/g, '');
  if (onlyNums.length > 0 && onlyNums[0] !== '0') onlyNums = '0191' + onlyNums;

  const rg = /^(\d{0,4})(\d{0,3})?(\d*)?$/;
  let result = onlyNums.match(rg);
  if (!result) return '';

  return result
    .slice(1)
    .filter((b) => b)
    .join('-');
}
export function normalizeMobile(number) {
  if (!number) return '';
  var onlyNums = number.replace(/[^\d]/g, '');
  const rg = /^(\d{0,5})(\d{0,3})?(\d*)?$/;
  let result = onlyNums.match(rg);
  if (!result) return;

  return result
    .slice(1)
    .filter((b) => b)
    .join('-');
}

export default normalizePhone;
