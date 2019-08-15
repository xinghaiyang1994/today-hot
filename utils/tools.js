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

module.exports = {
  dealBody,
  rnd
}
