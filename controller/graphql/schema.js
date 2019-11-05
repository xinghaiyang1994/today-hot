const { gql } = require('apollo-server-koa')

const typeDefs = gql`
  type ChannelDetail {
    id: Int
    name: String
    domain: String
    isOpen: Int
    isSpa: Int
    cookie: String
    isUseUserAgent: Int
    charset: String
    hotUrl: String
    listSpecialMethod: String
    listDom: String
    listTitleDom: String
    listUrlDom: String
    listUrlRule: String
    sort: Int
  }

  type channelListPage {
    list: [ChannelDetail],
    total: Int!
  }

  input channelInput {
    id: Int
    name: String
    domain: String
    isOpen: Int
    isSpa: Int
    cookie: String
    isUseUserAgent: Int
    charset: String
    hotUrl: String
    listSpecialMethod: String
    listDom: String
    listTitleDom: String
    listUrlDom: String
    listUrlRule: String
    sort: Int
  }

  type CommonRes {
    code: Int
    message: String
  }

  type Query {
    channelList(pageSize: Int = 10, current: Int = 1): channelListPage
    channelDetail(id: Int): ChannelDetail
  }

  type Mutation {
    channelOpenCtrl(id: Int, isOpen: Int): ChannelDetail
    channelOperate(form: channelInput, type: String!): ChannelDetail
    channelDelete(id: Int!): ChannelDetail
    channelMutiRefresh(type: String!, channelList: [Int]): CommonRes
  }
`

module.exports = typeDefs