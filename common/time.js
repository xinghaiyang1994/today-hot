// 定时任务
const schedule = require('node-schedule')
const crawler = require('./crawler')

// 每个小时抓取更新所有列表
schedule.scheduleJob('0 0 * * * *', async () => {
  const { isTrue, startTime } = await crawler.fetchAllData()
  let log = isTrue ? `成功，耗时 ${Date.now() - startTime} ms` : '失败！'
  log =  '每小时抓取：' + log
  console.log(log)
})

// 每个小时抓取更新所有列表
schedule.scheduleJob('0 10,20,30,40,50 * * * *', async () => {
  let { message } = await crawler.refetchFailData()
  let log = '失败列表重新抓取：' + message
  console.log(log)
})