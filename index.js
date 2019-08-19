const Koa = require('koa')
const views = require('koa-views')
const path = require('path')
const staticCache = require('koa-static-cache')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const helmet = require('koa-helmet')
const session = require('koa-session-minimal')
const MysqlSession = require('koa-mysql-session')

const routes = require('./routes')
const { database, port } = require('./config/default')
const { logError } = require('./middlewares/log')

// 定时任务
require('./common/time')

const app = new Koa()
let store = new MysqlSession(database)

// 提供安全 headers 
app.use(helmet())

// 支持跨域
app.use(cors({
    'credentials': true
}))

// 错误处理
app.use(async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        ctx.status = 200
        ctx.body = {
            'code': -1,
            'message': err.message,
            'data': ''
        }
        let errMsg = `${ctx.url} | ${err.message}`
        console.log(errMsg)
        logError.error(errMsg)
    }
})

// 静态资源
app.use(staticCache(path.join(__dirname, './static'), { dynamic: true }))


// session 存入 mysql 
app.use(session({
    key: 'SESSION_ID',
    store      
}))

// 模板
app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))

// 解析 post
app.use(bodyParser({
    formLimit: '1mb'
}))

// 路由
routes(app)

// 无效 url 处理
app.use(ctx => {
    ctx.body = '无效的 url'
    app.emit('error', '无效的 url', ctx)
})

app.listen(port, () => {
    console.log('http://localhost:' + port)
})