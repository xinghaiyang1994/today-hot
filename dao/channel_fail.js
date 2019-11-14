const ChannelFail = require('../models/channel_fail')
const db = require('../middlewares/mysql')

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
  findCountGtTimesGroupByChannelId({min, max, list}) {
    return ChannelFail.query(function (qb) {
      qb.groupBy('channel_id')
        .where('channel_id', 'in', list)
        .count('channel_id as num')
        .select('channel_id', 'channel.name')
        .having('num', '>=', min)
        .having('num', '<', max)
        .leftJoin('channel', function() {
          this.on('channel.id', '=', 'channel_fail.channel_id')
        })
    }).fetchAll() 
  },
  // 统计所有有失败的已经开启的渠道列表
  findAllGroupByChannelId() {
    return ChannelFail.query(function (qb) {
      qb.groupBy('channel_id')
        .where('channel.is_open', '=', 1)
        .count('channel_id as num')
        .select('channel_id', 'channel.*')
        .leftJoin('channel', function() {
          this.on('channel.id', '=', 'channel_fail.channel_id')
        })
    }).fetchAll() 
  },
  // 统计所有有失败的已经开启的渠道的个数
  findCountGroupByChannelId() {
    return db.knex.count('*', { as: 'num' }).from(function () {
      this.select('channel.*', db.knex.raw('count(*)')).from('channel_fail').where('channel.is_open', '=', 1).groupBy('channel_id'). leftJoin('channel',function() {
        this.on('channel.id', '=', 'channel_fail.channel_id')
      }).as('failList')
    })
  },
  // 有失败的已经开启的渠道列表(翻页)
  findPageGroupByChannelId({ page, pageSize }) {
    return ChannelFail.query(function (qb) {
      qb.groupBy('channel_id')
        .where('channel.is_open', '=', 1)
        .count('channel_id as num')
        .select('channel_id', 'channel.*')
        .leftJoin('channel', function() {
          this.on('channel.id', '=', 'channel_fail.channel_id')
        })
        .orderBy('num', 'DESC')
    }).fetchPage({ page, pageSize }) 
  }
}
