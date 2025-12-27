import type { MintCollectionParams } from './types'
import { execMintCollectionStatemine } from './mintCollection/transactionMintCollectionStatemine'

const SUPPORTED_PREFIXES = ['ahk', 'ahp', 'sub']

export function execMintCollection({
  item,
  api,
  executeTransaction,
  isLoading,
  status,
}: MintCollectionParams) {
  // item.urlPrefix === 'ahr'
  console.log('execMintCollection')
  if (SUPPORTED_PREFIXES.includes(item.urlPrefix)) {
    console.log('Executing mint collection for Ahk/Ahp/Sub')
    return execMintCollectionStatemine({
      item,
      api,
      executeTransaction,
      isLoading,
      status,
    })
  }
}
