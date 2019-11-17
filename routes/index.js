const Router = require('koa-router')
const { checkAdmin } = require('../middlewares/check')

async function middleCheckAdmin(ctx, next) {
  // 检查是否是管理员(包含检查登录)
  let adminData = checkAdmin(ctx)
  if (!adminData.status) {
    return ctx.body = adminData.data
  }
  
  await next()
}

module.exports = function (app) {

  const router = new Router()

  router.get('/', require('../controller/index').getIndex)

  // 子路由
  router.use('/suggest', require('./suggest').routes())
  router.use('/channel', middleCheckAdmin, require('./channel').routes())
  router.use('/user', require('./user').routes())
  router.use('/config', middleCheckAdmin, require('./config').routes())
  router.use('/fail', middleCheckAdmin, require('./fail').routes())

  app.use(router.routes())
  app.use(router.allowedMethods())

}