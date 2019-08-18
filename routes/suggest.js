const Router = require('koa-router')
const router = new Router()

router.get('/captcha', require('../controller/suggest').getCaptcha)
router.post('/submit', require('../controller/suggest').postSubmit)

module.exports = router
