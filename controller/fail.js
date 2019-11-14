const { dealBody } = require('../utils/tools')
const crawler = require('../common/crawler')

const { 
  findPageGroupByChannelId,
  findCountGroupByChannelId
} = require('../dao/channel_fail')

module.exports = {
  // 获取所有失败列表(翻页)
  async getList(ctx) {
    const { page, pageSize } = ctx.query
    // 获取列表
    const daoList = await findPageGroupByChannelId({page, pageSize})
    const dataList = daoList.toJSON()

    // 获取总数
    const aNum = await findCountGroupByChannelId()
    const total = aNum[0].num

    return ctx.body = dealBody({
      data: {
        list: dataList,
        total
      }
    })
  },
  // 重新抓取所有失败
  async postRefreshAll(ctx) {
    const { isTrue, message } = await crawler.fetchFailData()
    
    return ctx.body = dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message
    })
  }
}