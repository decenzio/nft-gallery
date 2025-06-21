import { type Prefix } from '@kodadot1/static'
import { useFiatStore } from '@/stores/fiat'
import { defaultTokenChain } from '@/utils/config/chain.config'
import type { Token } from '@/utils/coinprice'

export interface TokenDetails {
  symbol: string
  value: number | string | null
  icon: string
  defaultChain: Prefix
}

const getAssetToken = asset => asset?.token || 'KSM'
const getUniqueArrayItems = (items: string[]) => [...new Set(items)]

export default function useToken() {
  const { getCurrentTokenValue } = useFiatStore()
  const { getTokenIconBySymbol } = useIcon()
  const { vm } = useChain()

  const availableTokensAcrossAllChains = computed(() =>
    getUniqueArrayItems(
      Object.values(getVmAssets(vm.value)).map(getAssetToken),
    ) as Token[],
  )

  const tokens = computed<TokenDetails[]>(() => {
    return availableTokensAcrossAllChains.value.map((tokenSymbol) => {
      return {
        symbol: tokenSymbol as string,
        value: getCurrentTokenValue(tokenSymbol),
        icon: getTokenIconBySymbol(tokenSymbol),
        defaultChain: defaultTokenChain[tokenSymbol],
      }
    })
  })

  return {
    tokens,
  }
}
