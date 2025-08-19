import type { ApiPromise } from '@polkadot/api'
import type { ActionNftaaProxyCall, ExecuteTransaction } from './types'

export function execNftaaProxyCall(
  item: ActionNftaaProxyCall,
  api: ApiPromise,
  executeTransaction: ExecuteTransaction,
) {
  const arg = [
    Number(item.collectionId),
    Number(item.itemId),
    item.call,
  ]

  executeTransaction({
    cb: api.tx.nftaa.proxyCall,
    arg,
    successMessage: item.successMessage,
    errorMessage: item.errorMessage,
  })
}
