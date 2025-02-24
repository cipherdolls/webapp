/**
 * @param number any number and also 2e17 etc, if number is already decimal function will return this number
 */
export const scientificNumConvert = (number: number | string) => {
  if (!number) {
    return 0;
  }
  let numberStr = number.toString();

  if (!numberStr.includes('e')) {
    return numberStr;
  }

  let [base, exponent]: any[] = numberStr.split('e');
  base = parseFloat(base);
  exponent = parseInt(exponent, 10);

  if (exponent > 0) {
    let decimalPart = base.toString().replace('.', '');
    let zerosToAdd = exponent - (decimalPart.length - 1);
    return decimalPart + '0'.repeat(zerosToAdd);
  } else {
    let decimalPlaces = Math.abs(exponent);
    let baseStr = base.toString().replace('.', '');
    let zerosToAdd = decimalPlaces - baseStr.length + 1;
    return '0.' + '0'.repeat(zerosToAdd) + baseStr;
  }
};