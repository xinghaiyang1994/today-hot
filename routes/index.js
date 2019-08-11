const Router = require('koa-router')

module.exports = function (app) {

    const router = new Router()
    
    router.get('/', require('../controller/index').getIndex)

    // 子路由
    router.use('/home', require('./home').routes())
    router.use('/user', require('./user').routes())
    router.use('/list', require('./list').routes())

    app.use(router.routes())
    app.use(router.allowedMethods())

}