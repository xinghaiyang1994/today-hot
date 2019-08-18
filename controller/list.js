const tools = require('../utils/tools')
const crawler = require('../common/crawler')

module.exports = {
  async refreshListAll(ctx) {
    let { isTrue, StartTime } = await crawler.fetchAllData()

    // console.log('所有结果', isTrue)
    ctx.body = tools.dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message: isTrue ? `抓取成功，耗时 ${StartTime} ms` : '抓取失败！'
    })
  },
  async refisTruehSingle(ctx) {
    const { channelId } = ctx.query
    let { isTrue, StartTime } = await crawler.fetchSingleData(channelId)

    // console.log('单个结果', isTrue)
    ctx.body = tools.dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message: isTrue ? `抓取成功，耗时 ${StartTime} ms` : '抓取失败！'
    })
  }
}