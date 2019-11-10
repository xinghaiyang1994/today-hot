const { dealBody } = require('../utils/tools')

module.exports = {
  // 登录用户信息
  async getInfo(ctx) {
    console.log(ctx.session)
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