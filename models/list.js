const db = require('../middlewares/mysql')

module.exports = db.Model.extend({
  tableName: 'list',     // 表名
  hidden: ['gmtCreate', 'gmtModified'],
})
