const Router = require('koa-router')
const router = new Router()

// TODO 后期改为 post
router.get('/refreshall', require('../controller/list').refreshListAll)
router.get('/refreshsingle', require('../controller/list').refreshSingle)

module.exports = router