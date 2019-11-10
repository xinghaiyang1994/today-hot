const Router = require('koa-router')
const router = new Router()

// 获取列表(翻页)
router.get('/list', require('../controller/channel').getList)
// 获取单个渠道详情
router.get('/detail', require('../controller/channel').getDetail)
// 新增单个渠道
router.post('/add', require('../controller/channel').postAdd)
// 修改单个渠道
router.post('/modify', require('../controller/channel').postModify)
// 单个渠道开启与关闭
router.post('/openCtrl', require('../controller/channel').postOpenCtrl)
// 删除单个渠道
router.post('/delete', require('../controller/channel').postDelete)
// 多个渠道重新抓取
router.post('/mutiUpdate', require('../controller/channel').postMutiUpdate)


module.exports = router