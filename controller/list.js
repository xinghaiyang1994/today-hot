const tools = require('../utils/tools')
const crawler = require('../common/crawler')

module.exports = {
  async refreshListAll(ctx) {
    const { isTrue, message } = await crawler.fetchAllData()

    // console.log('所有结果', isTrue)
    ctx.body = tools.dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message
    })
  },
  async refreshSingle(ctx) {
    const { channelId } = ctx.query
    console.log(ctx.session)

    if (typeof channelId === 'undefined') {
      throw new Error('渠道名称不正确！')
    }

    const { isTrue, message } = await crawler.fetchSingleData(channelId)

    // console.log('单个结果', isTrue, message)
    ctx.body = tools.dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message
    })
  },
  async refreshFail(ctx) {
    const { isTrue, message } = await crawler.refetchFailData()
    
    return ctx.body = tools.dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message
    })
  }
}