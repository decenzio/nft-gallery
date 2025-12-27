import type { MintTokenParams, SubstrateMintTokenParams } from './types'
import { execMintStatemine } from './mintToken/transactionMintStatemine'

const SUPPORTED_PREFIXES = ['ahk', 'ahp', 'sub']

export function execMintToken({ item, ...params }: MintTokenParams) {
  if (SUPPORTED_PREFIXES.includes(item.urlPrefix)) {
    return execMintStatemine({
      item,
      ...params,
    } as SubstrateMintTokenParams)
  }
}
