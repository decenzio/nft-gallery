import { graphql } from '@/queries/clients/graphqlClients'

export default graphql(`
query nftaaTokensByOwner($account: String!) {
  nftEntities(
    where: {
      currentOwner_eq: $account
      burned_eq: false
      nftaa_isNull: false
    }
    orderBy: [blockNumber_DESC]
  ) {
    id
    sn
    name
    collection {
      id
      name
    }
    attributes {
      trait
      value
    }
    meta {
      image
      name
      description
    }
    currentOwner
    nftaa {
      id
      address
    }
  }
}
`)
