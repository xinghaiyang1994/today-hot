const md5 = require('md5')
const moment = require('moment')
const svgCaptcha = require('svg-captcha')

const tools = require('../utils/tools')
const { checkLogin } = require('../middlewares/check')
const { 
    findUserByName,
    insertUser
} = require('../models')

module.exports = {
    async postRegister (ctx) {
        const { name, password, repeat } = ctx.request.body
        if ((name + '').trim() === '' || (password + '').trim() === '' || (repeat + '').trim() === '') {
            throw new Error('用户名或密码不能为空!')
        }
        if (password !== repeat) {
            throw new Error('两次密码应该相同!')
        }
        await findUserByName(name).then(res => {
            if (res.length > 0) {
                throw new Error('用户存在!')
            }
        })
        await insertUser([name, md5(password), moment().format('YYYY-MM-DD HH:mm:ss')]).then(res => {
            if (res) {
                ctx.body = tools.dealBody({
                    message: '注册成功。'
                })
            } else {
                throw new Error('后台服务错误!')
            }
        })
    },
    async postLogin (ctx) {
        const { name, password, captcha } = ctx.request.body, sCaptcha = ctx.session.captcha
        if ((name + '').trim() === '' || (password + '').trim() === '' || (captcha + '').trim() === '') {
            throw new Error('用户名或密码或验证码不能为空!')
        }
        if (captcha.toLowerCase() !== sCaptcha) {
            throw new Error('验证码错误!')
        }
        await findUserByName(name).then(res => {
            if (res.length === 0) {
                throw new Error('用户不存在!')
            }
            if (md5(password) !== res[0].password) {
                throw new Error('密码不正确!')
            } else {
                ctx.session = {
                    id: res[0].id,
                    name: res[0].name
                }
                ctx.body = tools.dealBody({
                    message: '登录成功。'
                })
            }
        })

    },
    async getCaptcha (ctx) {
        const captcha = svgCaptcha.create()
        ctx.session.captcha = captcha.text.toLowerCase()
        ctx.response.set('Content-Type', 'image/svg+xml')
        ctx.body = String(captcha.data)
    },
    async getInfo (ctx) {
        checkLogin(ctx)
        const { name } = ctx.session
        await findUserByName(name).then(res => {
            if (res.length > 0) {
                ctx.body = tools.dealBody({
                    data: res[0]
                })
            } else {
                throw new Error('用户不存在!')
            }
        })
    },
    async getLogout (ctx) {
        ctx.session = null
        ctx.body = tools.dealBody({
            data: '退出成功。'
        })
    }
}