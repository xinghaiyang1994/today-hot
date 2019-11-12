const { dealBody } = require('../utils/tools')
module.exports = {
  // 检查是否登录
  checkLogin(ctx) {
    if (!ctx.session.user) {
      return {
        status: false,
        data: dealBody({
          code: -2,
          message: '用户未登录，请登录后再试！'
        })
      }
    }

    return {
      status: true,
      data: ''
    }
  },
  // 检查是否是管理员(包含检查登录)
  checkAdmin(ctx) {
    if (!ctx.session.user) {
      return {
        status: false,
        data: dealBody({
          code: -2,
          message: '用户未登录，请登录后再试！'
        })
      }
    }
    if (ctx.session.user.isAdmin !== 1) {
      return {
        status: false,
        data: dealBody({
          code: -3,
          message: '暂无权限！'
        })
      }
    }

    return {
      status: true,
      data: ''
    }
  },
}