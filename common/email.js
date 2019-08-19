const nodemailer = require('nodemailer')
const { logEmail } = require('../middlewares/log')
const { email } = require('../config/default')

const transporter = nodemailer.createTransport({
  service: 'qq',    /*使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/ */
  port: 465,    /* SMTP 端口 */
  secureConnection: true,   /*使用了 SSL */
  auth: {
    user: email.user,
    pass: email.pass    /* SMTP 授权码 */
  }
})

module.exports = {
  send({ name, subject, html}) {
    const mailOptions = {
      from: email.from,
      to: email.to,
      subject,
      html,
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return logEmail.error(`${name} | ${err}`)
      }
      console.log('email sent: %s', info.response)
    })
  }
}