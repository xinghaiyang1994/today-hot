// 手工日志
const path = require('path')
const fs = require('fs')

// 日志文件是否存在
let existFile = {}

// 日志写入文件
function logToFile (filename, log) {
  let fPath = path.join(__dirname, `../log/${filename}`)
  if (!existFile[fPath]) {
    const fileExist = fs.existsSync(fPath)
    if (!fileExist) {
      fs.writeFileSync(fPath, log + '\n')
      return existFile[fPath] = true
    } 
    existFile[fPath] = true
  }
  fs.appendFileSync(fPath, log + '\n')
}

module.exports = {
  logToFile
}