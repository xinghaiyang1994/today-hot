const db = require('../middlewares/db')

module.exports = db.Model.extend({
  tableName: 'channel_fail',     // 表名
  hidden: ['gmtCreate', 'gmtModified']
})
