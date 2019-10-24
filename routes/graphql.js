const Router = require('koa-router')
const router = new Router()

router.all('/', require('../controller/graphql/index'))

module.exports = router