const { 
  findChannelPage,
  findChannelCount,
  findChannelDetailById,
  updateChannelOpenCtrl,
  addChannel,
  updateChannel,
  deleteChannel
} = require('../../dao/channel')
const crawler = require('../../common/crawler')
const { dealBody } = require('../../utils/tools')


const resolvers = {
  Query: {
    // 获取渠道列表（翻页）
    async channelList(obj, { current, pageSize }) {
      // console.log({ current,pageSize })
      let list = await findChannelPage({ current, pageSize })
      let total = await findChannelCount()
      return {
        list: list.toJSON(),
        total
      }
    },
    // 获取单个渠道详情
    async channelDetail(obj, { id }) {
      let detailDao = await findChannelDetailById(id)
      // console.log(detailDao)
      if (!detailDao) {
        return {}
      }
      return detailDao.toJSON()
    }
  },
  Mutation: {
    // 是否开启渠道
    async channelOpenCtrl(obj, { id, isOpen }) {
      const resDao = await updateChannelOpenCtrl({ id, isOpen })
      const res = resDao.toJSON()
      return {
        id: res.id,
        isOpen: res.isOpen,
      }
    },
    // 新增或修改单个渠道
    async channelOperate(obj, { form, type }) {
      let { 
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
      } = form
      if (sort === '') {
        sort = 1
      }

      console.log(type, id)
      let detailDao
      if (type === 'add') {
        detailDao = await addChannel({ name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort })
      } else {
        detailDao = await updateChannel({ id, name, domain, isOpen, isSpa, cookie, isUseUserAgent, charset, hotUrl, listSpecialMethod, listDom, listTitleDom, listUrlDom, listUrlRule, sort })
      }

      const detail = detailDao.toJSON()
      return {
        id: detail.id
      }
    },
    // 删除单个渠道
    async channelDelete(obj, { id }) {
      await deleteChannel(id)
      return {
        id
      }
    },
    // 重新抓取多个或全部
    async channelMutiRefresh(obj, { type, channelList = []}) {
      if (type === 'muti') {
        console.log(channelList)

        const { isTrue, message } = await crawler.fetchArrayData(channelList)

        // console.log('所有结果', isTrue)
        console.log(channelList)
        return dealBody({
          code: isTrue ? 0 : -1,
          message
        })
      }

      if (type === 'all') {
        const { isTrue, message } = await crawler.fetchAllData()
        return dealBody({
          code: isTrue ? 0 : -1,
          message
        })
      }
    }
  }
}

module.exports = resolvers