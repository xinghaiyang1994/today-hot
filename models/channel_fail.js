const db = require('../middlewares/mysql')

module.exports = db.Model.extend({
  tableName: 'channel_fail',     // 表名
  hidden: ['gmtCreate', 'gmtModified']
})
