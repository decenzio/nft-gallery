import { defineStore } from 'pinia'
import type { TokenName } from '~/utils/coinprice'

type FiatPrice = string | number | null

interface State {
  fiatPrice: Record<TokenName, {
    usd: FiatPrice
  }>
}

const AVAILABLE_TOKENS = ['kusama', 'polkadot', 'ethereum', 'substrate'] as const

export const useFiatStore = defineStore('fiat', {
  state: (): State => ({
    fiatPrice: {
      kusama: {
        usd: null,
      },
      polkadot: {
        usd: null,
      },
      ethereum: {
        usd: null,
      },
      substrate: {
        usd: null,
      },
    },
  }),
  getters: {
    incompleteFiatValues(): boolean {
      return (
        this.getCurrentKSMValue === null || this.getCurrentDOTValue === null
      )
    },
    getCurrentKSMValue: (state): FiatPrice => state.fiatPrice.kusama.usd,
    getCurrentDOTValue: (state): FiatPrice => state.fiatPrice.polkadot.usd,
    getCurrentROCValue: (_state): FiatPrice => 0,
    getCurrentTokenValue:
      state =>
        (token: Token): FiatPrice => {
          switch (token) {
            case 'KSM':
              return state.fiatPrice.kusama.usd
            case 'DOT':
              return state.fiatPrice.polkadot.usd
            case 'UNIT':
              return state.fiatPrice.substrate.usd
            case 'ETH':
              return state.fiatPrice.ethereum.usd
            default:
              return 0
          }
        },
  },
  actions: {
    async fetchFiatPrice(force = false) {
      if (!this.incompleteFiatValues && !force) {
        return
      }

      const prices = await Promise.all(AVAILABLE_TOKENS.map(getPrice))
      prices.forEach((price) => {
        this.fiatPrice = Object.assign({}, this.fiatPrice, price)
      })
    },
    setFiatPrice(payload) {
      this.fiatPrice = Object.assign({}, this.fiatPrice, payload)
    },
  },
})
