const Router = require('koa-router')

module.exports = function (app) {

  const router = new Router()

  router.get('/', require('../controller/index').getIndex)

  // 子路由
  router.use('/list', require('./list').routes())
  router.use('/suggest', require('./suggest').routes())
  router.use('/graphql', require('./graphql').routes())

  app.use(router.routes())
  app.use(router.allowedMethods())

}