/**
 * @param weiValue long ETH wei number, 1 Ether = 10^18 Wei, function is converting wei number to simple number
 */
export const etherWeiConverter = (weiValue: string | number): number => {
  if (!weiValue) return 0;

  let num: any = weiValue;

  if (typeof weiValue === 'string') {
    num = parseFloat(weiValue);
  }

  const weiPerEther = 10 ** 18;
  return num / weiPerEther;
};
