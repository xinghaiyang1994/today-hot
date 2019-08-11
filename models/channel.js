const db = require('../middlewares/db')

module.exports = db.Model.extend({
  tableName: 'channel',     // 表名
  hidden: ['gmtCreate', 'gmtModified']
})
