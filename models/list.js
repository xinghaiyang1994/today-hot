const db = require('../middlewares/db')
// const Channel = require('./channel')

module.exports = db.Model.extend({
  tableName: 'list',     // 表名
  hidden: ['gmtCreate', 'gmtModified'],
  // channel() {
  //   return this.belongsTo(Channel)
  //   // 第二个参数为该模型在一对多关联表中作为外键的列名，默认为该模型表名_id
  // }
})
