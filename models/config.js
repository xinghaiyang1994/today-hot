const db = require('../middlewares/mysql')

module.exports = db.Model.extend({
  tableName: 'config',     // 表名
  hidden: ['gmtCreate', 'gmtModified'],
})
