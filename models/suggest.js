const db = require('../middlewares/db')

module.exports = db.Model.extend({
  tableName: 'suggest',     // 表名
  hidden: ['gmtCreate', 'gmtModified']
})
