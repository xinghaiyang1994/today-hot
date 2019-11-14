// 定时任务
const schedule = require('node-schedule')
const crawler = require('./crawler')

// TODO 调试
// // 每个小时抓取更新所有列表
// schedule.scheduleJob('0 0 * * * *', async () => {
//   const { message } = await crawler.fetchAllData()
//   let log =  '每小时抓取：' + message
//   console.log(log)
// })

// // 每个小时抓取更新所有列表
// schedule.scheduleJob('0 10,20,30,40,50 * * * *', async () => {
//   let { message } = await crawler.fetchFailData()
//   let log = '失败列表重新抓取：' + message
//   console.log(log)
// })