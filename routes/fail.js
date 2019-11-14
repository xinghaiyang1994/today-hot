const Router = require('koa-router')
const router = new Router()

// 获取所有失败列表(翻页)
router.get('/list', require('../controller/fail').getList)
// 重新抓取所有
router.post('/refreshAll', require('../controller/fail').postRefreshAll)


module.exports = router