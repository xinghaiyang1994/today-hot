const Router = require('koa-router')
const router = new Router()

router.all('/', async (ctx, next) => {
  // 登录拦截
  return ctx.body = {
    code: 111
  }
  await next()
}, require('../controller/graphql/index'))

module.exports = router