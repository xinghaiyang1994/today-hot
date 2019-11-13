const Router = require('koa-router')

module.exports = function (app) {

  const router = new Router()

  router.get('/', require('../controller/index').getIndex)

  // 子路由
  router.use('/list', require('./list').routes())
  router.use('/suggest', require('./suggest').routes())
  router.use('/channel', require('./channel').routes())
  router.use('/user', require('./user').routes())
  router.use('/config', require('./config').routes())

  app.use(router.routes())
  app.use(router.allowedMethods())

}