const svgCaptcha = require('svg-captcha')
const { insertSuggest } = require('../dao/suggest')
const email = require('../common/email')

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
    const { contact, content, captcha } = ctx.request.body
    const sCaptcha = ctx.session.suggest
    
    // 校验
    if ((content + '').trim() === '' || (captcha + '').trim() === '') {
      throw new Error('内容或验证码不能为空!')
    }
    if (captcha.toLowerCase() !== sCaptcha) {
      throw new Error('验证码错误!')
    }

    // 新增入库
    await insertSuggest({
      contact,
      content
    })

    // 发邮件
    email.send({
      name: '反馈建议',
      subject: '反馈建议',
      html: `${(new Date()).toLocaleString()} | ${contact} | ${content}`
    })

    ctx.body = tools.dealBody({
      message: '提交成功'
    })
  }
}