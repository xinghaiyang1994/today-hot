const { dealBody, validateForm } = require('../utils/tools')
const { config } = require('../utils/joiSchema')

const { 
  findAll,
  insertAll
} = require('../dao/config')

module.exports = {
  // 获取所有配置列表
  async getAll(ctx) {
    // 获取发送邮件的最小失败次数
    const daoAll = await findAll()
    const dataAll = daoAll.toJSON()

    return ctx.body = dealBody({
      data: dataAll
    })
  },
  // 修改所有配置列表
  async postModify(ctx) {
    const { list } = ctx.request.body

    // 校验
    let minCountSend 
    let maxCountSend
    list.forEach(el => {
      if (el.key === 'minCountSend') {
        el.value = Number(el.value)
        minCountSend = Number(el.value)
      }
      if (el.key === 'maxCountSend') {
        el.value = Number(el.value)
        maxCountSend = Number(el.value)
      }
    })
    validateForm({ minCountSend, maxCountSend }, config)
    if (minCountSend >= maxCountSend) {
      throw new Error('maxCountSend 必须大于 minCountSend !')
    }

    // 更新所有
    await insertAll(list)

    return ctx.body = dealBody()
  }
}