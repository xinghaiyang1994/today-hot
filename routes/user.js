const Router = require('koa-router')
const router = new Router()

// 登录用户信息
router.get('/info', require('../controller/user').getInfo)
// 退出
router.post('/logout', require('../controller/user').postLogout)

module.exports = router