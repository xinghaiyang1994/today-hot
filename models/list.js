const db = require('../middlewares/db')

module.exports = db.Model.extend({
  tableName: 'list',     // 表名
  hidden: ['gmtCreate', 'gmtModified'],
})
