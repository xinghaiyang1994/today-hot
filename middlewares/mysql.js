const { mysqlDebug, mysqlConfig} = require('../config/default')

const knex = require('knex')({
  client: 'mysql',
  debug: mysqlDebug,
  connection: mysqlConfig,
  pool: { min: 10, max: 30 }
})

const db = require('bookshelf')(knex)

db.plugin(['bookshelf-virtuals-plugin', 'bookshelf-camelcase'])

module.exports = db