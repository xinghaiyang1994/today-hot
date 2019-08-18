const svgCaptcha = require('svg-captcha')

const tools = require('../utils/tools')

module.exports = {
  async getCaptcha(ctx) {
    const captcha = svgCaptcha.create({
      ignoreChars: '0o1il'
    })
    ctx.session.suggest = captcha.text.toLowerCase()
    ctx.response.set('Content-Type', 'image/svg+xml')
    ctx.body = String(captcha.data)
  },
  async postSubmit(ctx) {
    const { name, content, captcha } = ctx.request.body
    const sCaptcha = ctx.session.suggest
    console.log(name, content, captcha)
    if ((name + '').trim() === '' || (captcha + '').trim() === '') {
      throw new Error('内容或验证码不能为空！')
    }
    if (captcha.toLowerCase() !== sCaptcha) {
      throw new Error('验证码错误！')
    }
    ctx.body = tools.dealBody({
      message: 'ok'
    })
  }
}