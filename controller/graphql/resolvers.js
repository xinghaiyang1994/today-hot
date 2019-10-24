const { 
  findChannelPage,
  findChannelCount,
  findChannelDetailById,
  updateChannelOpenCtrl,
  addChannel,
  updateChannel
} = require('../../dao/channel')

const resolvers = {
  Query: {
    async channelList(obj, { current, pageSize }) {
      // console.log({ current,pageSize })
      let list = await findChannelPage({ current, pageSize })
      let total = await findChannelCount()
      return {
        list: list.toJSON(),
        total
      }
    },
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
    async channelOpenCtrl(obj, { id, isOpen }) {
      const resDao = await updateChannelOpenCtrl({ id, isOpen })
      const res = resDao.toJSON()
      return {
        id: res.id,
        isOpen: res.isOpen,
      }
    },
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
    }
  }
}

module.exports = resolvers