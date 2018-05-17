/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import BigNumber from 'bignumber.js';
import Web3Service from '../services/Web3Service';

export function formatEth(inWei) {
  return new BigNumber(inWei).dividedBy(oneEthInWei()).toString();
}

export function oneEthInWei() {
  return new BigNumber(1e18);
}

export function ethToWei(inEth) {
  return new BigNumber(inEth * oneEthInWei());
}

export function weiToEth(inWei) {
  return inWei / oneEthInWei();
}

export function formatToken(inWei, dec = 0) {
  if (dec === 0)
    return inWei;
  return new BigNumber(inWei).dividedBy((new BigNumber(10)).toPower(dec)).toString();
}

export function getBytes32(str) {
  return Web3Service.web3.utils.fromAscii(str)
}

export function getStr(bytes32) {
  return Web3Service.web3.utils.hexToAscii(bytes32)
}
