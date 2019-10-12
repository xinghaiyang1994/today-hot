const Channel = require('../models/channel')

module.exports = {
  // 获取所有已经开启的渠道
  findChannelAll() {
    return Channel.forge().where('is_open', '=', 1).orderBy('sort', 'DESC').fetchAll()
  },
  // 根据 id 获取单个已经开启的渠道详情
  findChannelDetailById(id) {
    return Channel.forge().where({id, 'is_open': 1}).fetch({ require: false })
  }
}
