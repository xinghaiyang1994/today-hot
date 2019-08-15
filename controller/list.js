const tools = require('../utils/tools')
const crawler = require('../common/crawler')

module.exports = {
  async refreshListAll(ctx) {
    let res = await crawler.fetchAllData()

    // console.log('所有结果', res)
    ctx.body = tools.dealBody({
      code: res ? 0 : -1,
      data: {},
      message: res ? '抓取成功' : '抓取失败！'
    })
  },
  async refreshSingle(ctx) {
    const { channelId } = ctx.query
    let res = await crawler.fetchSingleData(channelId)

    // console.log('单个结果', res)
    ctx.body = tools.dealBody({
      code: res ? 0 : -1,
      data: {},
      message: res ? '抓取成功' : '抓取失败！'
    })
  }
}