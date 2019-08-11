const Channel = require('../models/channel')

module.exports = {
  // 获取所有渠道
  findChannelAll() {
    return Channel.forge().orderBy('sort', 'DESC').fetchAll()
  },
  // 根据 id 获取单个渠道详情
  findChannelDetailById(id) {
    return Channel.forge().where({id}).fetch()
  }
}
