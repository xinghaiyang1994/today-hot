const db = require('../middlewares/mysql')

module.exports = db.Model.extend({
  tableName: 'suggest',     // 表名
  hidden: ['gmtCreate', 'gmtModified']
})
