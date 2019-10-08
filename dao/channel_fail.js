const ChannelFail = require('../models/channel_fail')
const db = require('../middlewares/db')

module.exports = {
  // 批量添加渠道失败列表
  insertChannelFail(arrModel) {
    return ChannelFail.collection(arrModel).invokeThen('save')
  },
  // 删除多个渠道失败列表
  deleteChannelFailByChannelIdList(arrChannelId) {
    return ChannelFail.forge().where('channel_id', 'in', arrChannelId).destroy({require: false})
  },
  // 统计失败次数大于预定值并且在抓取数组中的渠道并与渠道表关联
  findCountGtTimesGroupByChannelId(times, arrChannelId) {
    return ChannelFail.query(function (qb) {
      qb.groupBy('channel_id')
        .where('channel_id', 'in', arrChannelId)
        .count('channel_id as num')
        .select('channel_id', 'channel.name')
        .having('num', '>=', times)
        .leftJoin('channel', function() {
          this.on('channel.id', '=', 'channel_fail.channel_id')
        })
    }).fetchAll() 
  },
  // 统计所有有失败的已经开启的渠道列表
  findCountGroupByChannelId() {
    return ChannelFail.query(function (qb) {
      qb.groupBy('channel_id')
        .where('channel.is_open', '=', 1)
        .count('channel_id as num')
        .select('channel_id', 'channel.*')
        .leftJoin('channel', function() {
          this.on('channel.id', '=', 'channel_fail.channel_id')
        })
    }).fetchAll() 
  }
}
