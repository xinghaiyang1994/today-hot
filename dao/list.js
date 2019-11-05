const List = require('../models/list')
const db = require('../middlewares/mysql')

module.exports = {
  // 获取单个渠道下的所有列表
  findListAllByChannelId(channelId) {
    return List.where({'channel_id': channelId}).orderBy('sort').fetchAll()
  },
  // 批量添加列表
  insertList(arrModel) {
    return List.collection(arrModel).invokeThen('save')
  },
  // 删除所有列表
  deleteListAll() {
    return db.knex('list').truncate()
  },
  // 删除单个渠道下的所有列表
  deleteListByChannelId(channelId) {
    return List.forge().where({'channel_id': channelId}).destroy({require: false})
  },
  // 删除指定列表
  deleteListList(channelList) {
    return List.forge().where('channel_id', 'in', channelList).destroy({require: false})
  }
}