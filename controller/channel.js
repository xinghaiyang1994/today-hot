const { dealBody } = require('../utils/tools')
const crawler = require('../common/crawler')
const { 
  findChannelPage,
  findChannelCount,
  findChannelDetailById,
  updateChannelOpenCtrl,
  addChannel,
  updateChannel,
  deleteChannel
} = require('../dao/channel')

module.exports = {
  // 获取列表(翻页)
  async getList(ctx) {
    const { page = 1, pageSize = 10} = ctx.query

    let list = await findChannelPage({ page, pageSize })
    let total = await findChannelCount()

    return ctx.body = dealBody({
      data: {
        list: list.toJSON(),
        total
      }
    })
  },
  // 获取单个渠道详情
  async getDetail(ctx) {
    const { id } = ctx.query

    let detailDao = await findChannelDetailById(id)
    if (!detailDao) {
      throw new Error('不存在该渠道 id !')
    }
    
    return ctx.body = dealBody({
      data: detailDao.toJSON()
    })
  },
  // 新增单个渠道
  async postAdd(ctx) {
    let { 
      name,
      domain,
      isOpen,
      isSpa,
      cookie,
      isUseUserAgent,
      charset,
      hotUrl,
      listSpecialMethod,
      listDom,
      listTitleDom,
      listUrlDom,
      listUrlRule,
      sort
    } = ctx.request.body
    if (sort === '') {
      sort = 1
    }
    console.log(ctx.request.body) 

    const detailDao = await addChannel({ name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort })
    const detail = detailDao.toJSON()
    return ctx.body = dealBody({
      data: {
        id: detail.id
      }
    })
  },
  // 修改单个渠道
  async postModify(ctx) {
    const { 
      id,
      name,
      domain,
      isOpen,
      isSpa,
      cookie,
      isUseUserAgent,
      charset,
      hotUrl,
      listSpecialMethod,
      listDom,
      listTitleDom,
      listUrlDom,
      listUrlRule,
      sort
    } = ctx.request.body

    const detailDao = await updateChannel({ id, name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort })
    const detail = detailDao.toJSON()
    return ctx.body = dealBody({
      data: {
        id: detail.id
      }
    })
  },
  // 单个渠道开启与关闭
  async postOpenCtrl(ctx) {
    const { id, isOpen } = ctx.request.body
    // TODO 是否需要验证 id 在列表中，及下面会不会报错
    const resDao = await updateChannelOpenCtrl({ id, isOpen })
    const res = resDao.toJSON()

    return ctx.body = dealBody({
      data: {
        id: res.id,
        isOpen: res.isOpen
      }
    })
  },
  // 删除单个渠道
  async postDelete(ctx) {
    const { id } = ctx.request.body
    await deleteChannel(id)
    
    return ctx.body = dealBody()
  },
  // 多个渠道重新抓取
  async postMutiUpdate(ctx) {
    const { type, list } = ctx.request.body

    // 多个渠道
    if (type === 'muti') {
      const { isTrue, message } = await crawler.fetchArrayData(list)

      return ctx.body = dealBody({
        code: isTrue ? 0 : -1,
        message
      })
    }

    // 所有渠道
    if (type === 'all') {
      const { isTrue, message } = await crawler.fetchAllData()

      return ctx.body = dealBody({
        code: isTrue ? 0 : -1,
        message
      })
    }
  }
}