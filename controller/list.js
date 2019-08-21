const tools = require('../utils/tools')
const crawler = require('../common/crawler')

module.exports = {
  async refreshListAll(ctx) {
    const { isTrue, startTime } = await crawler.fetchAllData()

    // console.log('所有结果', isTrue)
    ctx.body = tools.dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message: isTrue ? `抓取成功，耗时 ${Date.now() - startTime} ms` : '抓取失败！'
    })
  },
  async refreshSingle(ctx) {
    const { channelId } = ctx.query

    if (typeof channelId === 'undefined') {
      throw new Error('渠道名称不正确！')
    }

    const { isTrue, startTime } = await crawler.fetchSingleData(channelId)

    // console.log('单个结果', isTrue)
    ctx.body = tools.dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message: isTrue ? `抓取成功，耗时 ${Date.now() - startTime} ms` : '抓取失败！'
    })
  }
}