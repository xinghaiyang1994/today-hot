const Config = require('../models/config')

module.exports = {
  // 获取所有列表
  findAll() {
    return Config.forge().fetchAll() 
  },
  // 根据 key 查找 value
  findValueByKey(key) {
    return Config.forge().where({ key }).fetch({ 
      require: false,
      columns: ['value'] 
    }) 
  },
  // 插入所有列表
  insertAll(list) {
    return Config.collection(list).invokeThen('save')
  }
}