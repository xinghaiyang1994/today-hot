const Joi = require('joi')
const language = require('../config/joi-lang')
/**
 * 按范围生成随机整数（包括 m ，也包括 n）
 * @param  {number} m
 * @param  {number} n
 */
function rnd(m, n) {
  return Math.floor(m + Math.random() * (n - m + 1))
}


/**
 * 返回值
 * @param  {object} option
 */
function dealBody(option) {
  return Object.assign({
    code: 0,
    message: '',
    data: ''
  }, option)
}

// 格式校验
function validateForm(value, schema, options = {}) {
  options.language = language
  return Joi.validate(value, schema, options, err => {
    if (err) {
      console.log('校验格式错误', err.details)
      throw new Error(err.details[0].message)
    }
  })
}

module.exports = {
  dealBody,
  rnd,
  validateForm
}
