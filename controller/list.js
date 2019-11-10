const { dealBody } = require('../utils/tools')
const crawler = require('../common/crawler')

module.exports = {
  // 重新抓取所有
  async refreshListAll(ctx) {
    const { isTrue, message } = await crawler.fetchAllData()

    // console.log('所有结果', isTrue)
    ctx.body = dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message
    })
  },
  // 重新抓取单个
  async refreshSingle(ctx) {
    const { channelId } = ctx.query
    console.log(ctx.session)

    if (typeof channelId === 'undefined') {
      throw new Error('渠道名称不正确！')
    }

    const { isTrue, message } = await crawler.fetchSingleData(channelId)

    // console.log('单个结果', isTrue, message)
    ctx.body = dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message
    })
  },
  // 重新抓取失败
  async refreshFail(ctx) {
    const { isTrue, message } = await crawler.refetchFailData()
    
    return ctx.body = dealBody({
      code: isTrue ? 0 : -1,
      data: {},
      message
    })
  }
}