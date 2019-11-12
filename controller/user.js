const { dealBody } = require('../utils/tools')
const { checkAdmin } = require('../middlewares/check')

module.exports = {
  // 登录用户信息
  async getInfo(ctx) {
    console.log(ctx.session)
    // 检查是否是管理员
    const { status, data } = checkAdmin(ctx)
    if (!status) {
      return ctx.body = data
    }

    const { id, name } = ctx.session.user

    return ctx.body = dealBody({
      data: {
        id, 
        name
      }
    })
  },
  // 退出
  async postLogout(ctx) {
    ctx.session.user = null

    return ctx.body = dealBody()
  }
}