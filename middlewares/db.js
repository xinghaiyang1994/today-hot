const config = require('../config/default')

const knex = require('knex')({
  client: 'mysql',
  debug: config.ENV === 'local',
  connection: config.database,
  pool: { min: 10, max: 30 }
})

const db = require('bookshelf')(knex)

db.plugin(['pagination', 'virtuals', 'visibility', 'bookshelf-camelcase'])

module.exports = db