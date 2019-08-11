const Router = require('koa-router')
const router = new Router()

// 注册
router.post('/register', require('../controller/user').postRegister)
// 登录
router.post('/login', require('../controller/user').postLogin)
// 验证码
router.get('/captcha', require('../controller/user').getCaptcha)
// 获取登录信息
router.get('/info', require('../controller/user').getInfo)
// 退出
router.get('/logout', require('../controller/user').getLogout)

module.exports = router