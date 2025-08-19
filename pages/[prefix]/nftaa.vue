<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">
        NFTAA Proxy Calls
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Execute blockchain calls through your NFTAA (NFT as an Account) tokens. Select an NFTAA token and choose a pallet and call to execute.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- NFTAA Token Selection -->
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold mb-4">
            Your NFTAA Tokens
          </h2>

          <div
            v-if="isLoadingNftaa"
            class="flex justify-center p-8"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>

          <div
            v-else-if="nftaaTokens.length === 0"
            class="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <p class="text-gray-600 dark:text-gray-300">
              You don't own any NFTAA tokens. NFTAA tokens are NFTs with special proxy capabilities.
            </p>
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="token in nftaaTokens"
              :key="token.id"
              class="p-4 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'border-primary bg-primary/5': selectedNftaa?.id === token.id,
                'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600': selectedNftaa?.id !== token.id,
              }"
              @click="selectedNftaa = token"
            >
              <div class="flex items-center space-x-4">
                <div
                  v-if="token.meta?.image"
                  class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    :src="sanitizeIpfsUrl(token.meta.image)"
                    :alt="token.name || 'NFTAA Token'"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="flex-1">
                  <div class="font-medium">
                    {{ token.name || `Token #${token.sn}` }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    {{ token.collection.name }} #{{ token.sn }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    NFTAA Address: {{ getNftaaAddress(token) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Proxy Call Configuration -->
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold mb-4">
            Execute Proxy Call
          </h2>

          <div
            v-if="!selectedNftaa"
            class="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <p class="text-gray-600 dark:text-gray-300">
              Select an NFTAA token to configure proxy calls
            </p>
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <!-- Pallet Selection -->
            <div>
              <label class="block text-sm font-medium mb-2">Pallet</label>
              <select
                v-model="selectedPallet"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                @change="selectedCall = ''"
              >
                <option value="">
                  Select a pallet
                </option>
                <option
                  v-for="pallet in availablePallets"
                  :key="pallet.name"
                  :value="pallet.name"
                >
                  {{ pallet.displayName }}
                </option>
              </select>
            </div>

            <!-- Call Selection -->
            <div v-if="selectedPallet">
              <label class="block text-sm font-medium mb-2">Call</label>
              <select
                v-model="selectedCall"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                @change="resetCallArgs"
              >
                <option value="">
                  Select a call
                </option>
                <option
                  v-for="call in availableCalls"
                  :key="call.name"
                  :value="call.name"
                >
                  {{ call.displayName }}
                </option>
              </select>
            </div>

            <!-- Call Arguments -->
            <div
              v-if="selectedCall && callArguments.length > 0"
              class="space-y-3"
            >
              <h3 class="text-sm font-medium">
                Arguments
              </h3>
              <div
                v-for="(arg, index) in callArguments"
                :key="index"
                class="space-y-2"
              >
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-300">
                  {{ arg.name }} ({{ arg.type }})
                </label>
                <input
                  v-model="callArgs[index]"
                  type="text"
                  :placeholder="`Enter ${arg.name}`"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
              </div>
            </div>

            <!-- Execute Button -->
            <div class="pt-4">
              <button
                :disabled="!canExecuteCall || isLoading"
                class="cursor-pointer w-full px-4 py-2 bg-k-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                @click="executeProxyCall"
              >
                <span v-if="isLoading">Executing...</span>
                <span v-else>Execute Proxy Call</span>
              </button>
            </div>

            <!-- Call Preview -->
            <div
              v-if="selectedCall"
              class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <h4 class="text-sm font-medium mb-2">
                Call Preview
              </h4>
              <code class="text-xs text-gray-600 bg-gray-50 dark:bg-gray-800  dark:text-gray-300">
                api.tx.nftaa.proxyCall({{ selectedNftaa.collection.id }}, {{ selectedNftaa.sn }}, api.tx.{{ selectedPallet }}.{{ selectedCall }}({{ callArgs.join(', ') }}))
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Pallets Documentation -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">
        Available Pallets &amp; Calls
      </h2>

      <div
        v-if="isLoadingPallets"
        class="flex justify-center p-8"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span class="ml-3 text-gray-600 dark:text-gray-300">Loading pallets from blockchain...</span>
      </div>

      <div
        v-else-if="availablePallets.length === 0"
        class="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <p class="text-gray-600 dark:text-gray-300">
          No pallets available. Make sure the blockchain connection is active.
        </p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="pallet in availablePallets"
          :key="pallet.name"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <h3 class="font-semibold text-lg mb-2">
            {{ pallet.displayName }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {{ pallet.description }}
          </p>
          <div class="space-y-1">
            <div
              v-for="call in pallet.calls"
              :key="call.name"
              class="text-sm"
            >
              <span class="font-medium">{{ call.displayName }}</span>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ call.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import nftaaTokensByOwnerQuery from '@/queries/subsquid/general/nftaaTokensByOwner'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

interface NftaaToken {
  id: string
  sn: string
  name?: string
  collection: {
    id: string
    name: string
  }
  attributes: Array<{
    trait: string
    value: string
  }>
  meta?: {
    image?: string
    name?: string
    description?: string
  }
  currentOwner: string
}

interface CallArgument {
  name: string
  type: string
}

interface PalletCall {
  name: string
  displayName: string
  description: string
  args: CallArgument[]
}

interface Pallet {
  name: string
  displayName: string
  description: string
  calls: PalletCall[]
}

definePageMeta({
  title: 'NFTAA Proxy Calls',
})

const { accountId } = useAuth()
const { apiInstance } = useApi()
const { urlPrefix } = usePrefix()
const { transaction, isLoading } = useTransaction()

// Reactive state
const selectedNftaa = ref<NftaaToken | null>(null)
const selectedPallet = ref('')
const selectedCall = ref('')
const callArgs = ref<string[]>([])
const isLoadingNftaa = ref(false)
const isLoadingPallets = ref(false)
const nftaaTokens = ref<NftaaToken[]>([])
const availablePallets = ref<Pallet[]>([])

// Computed properties
const availableCalls = computed(() => {
  if (!selectedPallet.value) return []
  const pallet = availablePallets.value.find(p => p.name === selectedPallet.value)
  return pallet?.calls || []
})

const callArguments = computed(() => {
  if (!selectedCall.value) return []
  const call = availableCalls.value.find(c => c.name === selectedCall.value)
  return call?.args || []
})

const canExecuteCall = computed(() => {
  return selectedNftaa.value
    && selectedPallet.value
    && selectedCall.value
    && callArgs.value.length === callArguments.value.length
    && callArgs.value.every(arg => arg !== '')
})

// Methods
const fetchNftaaTokens = async () => {
  if (!accountId.value) return

  isLoadingNftaa.value = true
  try {
    const { data } = await useAsyncQuery({
      query: nftaaTokensByOwnerQuery,
      variables: {
        account: accountId.value,
      },
      clientId: urlPrefix.value,
    })

    nftaaTokens.value = (data.value as { nftEntities: NftaaToken[] })?.nftEntities || []
  }
  catch (error) {
    console.error('Error fetching NFTAA tokens:', error)
    nftaaTokens.value = []
  }
  finally {
    isLoadingNftaa.value = false
  }
}

const loadPalletsFromApi = async () => {
  try {
    isLoadingPallets.value = true
    const api = await apiInstance.value

    if (!api.tx) {
      console.error('API transactions not available')
      return
    }

    const pallets: Pallet[] = []

    // Get all available pallets from the runtime metadata
    const metadata = api.runtimeMetadata.asLatest
    const modules = metadata.pallets

    for (const module of modules) {
      const palletName = module.name.toString().toLowerCase()

      // Check if this pallet has transaction calls
      if (!api.tx[palletName] || !module.calls.isSome) {
        continue
      }

      const calls: PalletCall[] = []
      const palletTx = api.tx[palletName]

      // Get all calls for this pallet
      Object.keys(palletTx).forEach((callName) => {
        if (typeof palletTx[callName] === 'function') {
          // Get call metadata
          const callMeta = palletTx[callName].meta
          const args: CallArgument[] = []

          // Extract argument information
          if (callMeta && callMeta.args) {
            callMeta.args.forEach((arg: unknown) => {
              const argObj = arg as { name: { toString: () => string }, type: { toString: () => string } }
              args.push({
                name: argObj.name.toString(),
                type: argObj.type.toString(),
              })
            })
          }

          calls.push({
            name: callName,
            displayName: formatCallName(callName),
            description: getCallDescription(palletName, callName),
            args,
          })
        }
      })

      if (calls.length > 0) {
        pallets.push({
          name: palletName,
          displayName: formatPalletName(palletName),
          description: getPalletDescription(palletName),
          calls: calls.sort((a, b) => a.displayName.localeCompare(b.displayName)),
        })
      }
    }

    availablePallets.value = pallets.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }
  catch (error) {
    console.error('Error loading pallets from API:', error)
    // Fallback to empty array if loading fails
    availablePallets.value = []
  }
  finally {
    isLoadingPallets.value = false
  }
}

const formatPalletName = (name: string): string => {
  return name
    .split(/(?=[A-Z])|_/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const formatCallName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

const getPalletDescription = (palletName: string): string => {
  const descriptions: Record<string, string> = {
    balances: 'Manage token balances and transfers',
    nfts: 'Manage NFT collections and items',
    nftaa: 'Manage NFTAA collections and items',
    uniques: 'Manage unique collectible items',
    assets: 'Manage custom assets and tokens',
    utility: 'Batch and utility functions for combining calls',
  }

  return descriptions[palletName] || `${formatPalletName(palletName)} pallet operations`
}

const getCallDescription = (palletName: string, callName: string): string => {
  const descriptions: Record<string, Record<string, string>> = {
    balances: {
      transferAllowDeath: 'Transfer tokens to another account',
      transferKeepAlive: 'Transfer tokens while keeping account alive',
      forceTransfer: 'Force transfer tokens between accounts',
      transferAll: 'Transfer all free balance to another account',
    },
    nfts: {
      transfer: 'Transfer an NFT to another account',
      setPrice: 'Set the price for an NFT',
      buyItem: 'Buy an NFT that is for sale',
      mint: 'Mint a new NFT',
      burn: 'Burn an existing NFT',
      approve: 'Approve another account to transfer a specific NFT',
    },
    nftaa: {
      mint: 'Mint new NFTAA',
      proxyCall: 'Execute a proxy call as NFTAA',
    },
    utility: {
      batch: 'Execute multiple calls in a single transaction',
      batchAll: 'Execute multiple calls, fail if any fail',
      forceBatch: 'Execute multiple calls, continue on failures',
    },

  }

  return descriptions[palletName]?.[callName] || `Execute ${formatCallName(callName)} operation`
}

const getNftaaAddress = (token: NftaaToken) => {
  const nftaaAttr = token.attributes?.find(attr => attr.trait === 'nftaa_address')
  return nftaaAttr?.value || 'Unknown'
}

const resetCallArgs = () => {
  callArgs.value = new Array(callArguments.value.length).fill('')
}

const executeProxyCall = async () => {
  if (!canExecuteCall.value || !selectedNftaa.value) return

  try {
    const api = await apiInstance.value

    // Build the inner call
    const innerCall = api.tx[selectedPallet.value][selectedCall.value](...callArgs.value)

    // Execute the proxy call
    await transaction({
      interaction: Interaction.NFTAA_PROXY,
      collectionId: selectedNftaa.value.collection.id,
      itemId: selectedNftaa.value.sn,
      call: innerCall,
      urlPrefix: urlPrefix.value,
      successMessage: 'Proxy call executed successfully',
      errorMessage: 'Failed to execute proxy call',
    })
  }
  catch (error) {
    console.error('Error executing proxy call:', error)
  }
}

// Watchers
watch(callArguments, () => {
  resetCallArgs()
}, { immediate: true })

watch(accountId, () => {
  if (accountId.value) {
    fetchNftaaTokens()
  }
  else {
    nftaaTokens.value = []
    selectedNftaa.value = null
  }
}, { immediate: true })

watch(apiInstance, async (newApi) => {
  if (newApi) {
    try {
      await newApi // Wait for the API to be ready
      await loadPalletsFromApi()
    }
    catch (error) {
      console.error('Error waiting for API:', error)
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  if (accountId.value) {
    fetchNftaaTokens()
  }
  try {
    await apiInstance.value // Wait for the API to be ready
    await loadPalletsFromApi()
  }
  catch (error) {
    console.error('Error loading API on mount:', error)
  }
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
