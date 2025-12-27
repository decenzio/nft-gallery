export function useStatemineNewCollectionId() {
  const { apiInstance } = useApi()
  const { $consola } = useNuxtApp()

  const getCollectionId = async () => {
    try {
      const api = await apiInstance.value
      const result = await api.query.nfts.nextCollectionId()

      return result.isSome ? result.unwrap().toNumber() : 1
    }
    catch (error) {
      $consola.error('Error getting collection id', error)
      return undefined
    }
  }

  return {
    nextCollectionId: getCollectionId,
  }
}
