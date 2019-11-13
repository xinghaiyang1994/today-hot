// 所有格式校验
const Joi = require('joi')

module.exports = {
  // 配置
  config: {
    minCountSend: Joi.number().min(0).max(100).required(),
    maxCountSend: Joi.number().min(0).max(100).required()
  },
}