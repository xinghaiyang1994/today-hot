const Channel = require('../models/channel')

module.exports = {
  // 获取所有已经开启的渠道
  findChannelAll() {
    return Channel.forge().where('is_open', '=', 1).orderBy('sort', 'DESC').fetchAll()
  },
  // 根据 id 获取单个渠道详情
  findChannelDetailById(id) {
    return Channel.forge().where({ id }).fetch({ require: false })
  },
  // 获取渠道列表(翻页)
  findChannelPage({ page, pageSize }) {
    return Channel.forge().fetchPage({ page, pageSize })
  },
  // 获取渠道总数
  findChannelCount() {
    return Channel.forge().count()
  },
  // 是否开启单个渠道
  updateChannelOpenCtrl({ id, isOpen }) {
    return Channel.forge({ id }).save({ isOpen }, { method: 'update' })
  },
  // 新增单个渠道
  addChannel({ name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort }) {
    return Channel.forge({ name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort }).save(null, { method: 'insert' })
  },
  // 修改单个渠道
  updateChannel({ id, name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort }) {
    return Channel.forge({ id }).save({ name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort }, { method: 'update',
  debug: true })
  },
  // 删除单个渠道
  deleteChannel(id) {
    return Channel.forge({ id }).destroy({ require: false }) 
  },
  // 获取指定数组中的开启的渠道的列表
  findOpenChannelListInArray(channelList) {
    return Channel.query(function (qb) {
      qb.where('id', 'in', channelList)
        .andWhere('is_open', '=', 1) 
    }).fetchAll()
  }
}
