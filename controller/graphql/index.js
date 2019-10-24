const { ApolloServer } = require('apollo-server-koa')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const server = new ApolloServer({ typeDefs, resolvers })

module.exports = server.getMiddleware()