// 定时任务
const schedule = require('node-schedule')
const crawler = require('./crawler')

// 每个小时抓取更新所有列表
schedule.scheduleJob('0 0 * * * *', () => {
  crawler.fetchAllData()
})