const {
  findChannelAll,
} = require('../dao/channel')
const {
  findListAllByChannelId
} = require('../dao/list')

module.exports = {
  getIndex: async ctx => {
    // 获取渠道列表
    let resChannelList = await findChannelAll()
    let arrChannel = resChannelList.toJSON()

    // 设置当前渠道 id
    let { channelId = arrChannel[0].id } = ctx.query
    let channelIdExist = false
    arrChannel.forEach(el => {
      if (el.id == channelId) {
        channelIdExist = true
      }
    })
    if (!channelIdExist) {
      channelId = arrChannel[0].id
    }

    // 获取当前渠道下的所有新闻列表
    let resListList = await findListAllByChannelId(channelId)
    let arrList = resListList.toJSON()
    
    await ctx.render('index', {
      channelId,
      navList: arrChannel,
      list: arrList
    })
  }
}