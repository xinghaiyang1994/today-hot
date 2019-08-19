const Suggest = require('../models/suggest')

module.exports = {
  // 插入单条建议
  insertSuggest(model) {
    return Suggest.forge(model).save()
  },
}