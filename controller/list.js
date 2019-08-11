const tools = require('../utils/tools')
const crawler = require('../common/crawler')

module.exports = {
  async refreshListAll(ctx) {
    await crawler.fetchAllData()
    ctx.body = tools.dealBody({
      code: 0,
      data: {},
      message: ''
    })
  },
  async refreshSingle(ctx) {
    const { channelId } = ctx.query
    await crawler.fetchSingleData(channelId)
    ctx.body = tools.dealBody({
      code: 0,
      data: {},
      message: ''
    })
  }
}