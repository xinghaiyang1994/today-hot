const Router = require('koa-router')
const router = new Router()

// 获取所有配置列表
router.get('/all', require('../controller/config').getAll)
// 修改所有配置列表
router.post('/modify', require('../controller/config').postModify)

module.exports = router