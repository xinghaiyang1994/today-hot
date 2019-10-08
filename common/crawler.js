// 爬虫
const superagent = require('superagent')
require('superagent-charset')(superagent)
const puppeteer = require('puppeteer') 
const cheerio = require('cheerio')
const { logCrawler } = require('../middlewares/log')
const email  = require('./email')
const specialChannelMethod = require('./special_channel_method')
const { userAgents } = require('../utils/const')
const { rnd } = require('../utils/tools')
const { env } = require('../config/default')
const debug = require('debug')
const debugCrawler = debug('crawler')

const {
  findChannelAll,
  findChannelDetailById
}  = require('../dao/channel')
const {
  insertList,
  deleteListAll,
  deleteListByChannelId
}  = require('../dao/list')
const {
  insertChannelFail,
  deleteChannelFailByChannelIdList,
  findCountGtTimesGroupByChannelId,
  findCountGroupByChannelId
}  = require('../dao/channel_fail')

let startTime   // 统计抓取耗时

// 统一抓取错误处理
function dealFetchError(info, err) {
  const { 
    name
  } = info
  logCrawler.error(`${name} | ${err}`)
}

// 根据 listUrlRule 生成 url
function renderUrl(listUrlRule, info) {
  // 提取 {} 中的变量字符串
  let arr = Object.assign([], listUrlRule.match(/\{.*?\}/g)).map(el => {
    return el.replace(/(\{)|(\})/g, '')
  })

  let res = listUrlRule
  // console.log(listUrlRule)
  arr.forEach(el => {
    res = res.replace(`{${el}}`, info[el])
  })
  return res
}

// 获取数组并插入
async function htmlToList (info, resHtml) {
  const { 
    id,
    domain,
    listSpecialMethod,
    listDom,
    listTitleDom,
    listUrlDom,
    listUrlRule
  } = info
  let result
  let titleDomHasChildren = listTitleDom !== ''
  let urlDomHasChildren = listUrlDom !== ''

  let $ = cheerio.load(resHtml)
  let originList = []

  if (listSpecialMethod !== '') {
    // 按特殊方法获取列表
    originList = specialChannelMethod[listSpecialMethod]($, info)
  } else {
    // 按常规
    $(listDom).each((index, el) => {
      let titleDom = titleDomHasChildren ? $(el).find(listTitleDom) : $(el) 
      let urlDom = urlDomHasChildren ? $(el).find(listUrlDom) : $(el) 

      originList.push({
        title: titleDom.text().replace(/\s/g, ''),
        domOriginUrl: urlDom.attr('href')
      })
    })
    originList = originList.filter(el => el.title)
  }

  if (originList.length === 0) {
    throw new Error('未抓取数据！')
  }
  let list = originList.map(({ title, domOriginUrl }, index) => {
    return {
      channelId: id,
      sort: index,
      title,
      url: renderUrl(listUrlRule, {
        domain,
        listUrlDom: domOriginUrl
      })
    }
  })

  // return debugCrawler(list)
  result = await insertList(list)
  return (Object.assign([], result)).length > 0 
}

// 抓取单个 SPA 页面
async function fetchSpaPage(info, browser) {
  const { 
    domain,
    hotUrl,
    listDom
  } = info
  let resIsTrue = false
  try {
    // 获取内容
    const page = await browser.newPage()    // 创建一个 Page 实例
    await page.goto(domain + hotUrl, {
      timeout: 120000
    })   // 进入网址
    await page.waitFor(listDom)    // 等待目标元素出现，用于客户端渲染页面
    let resHtml = await page.content()
    await page.close()

    // 处理数据并入库
    resIsTrue = await htmlToList(info, resHtml)
  } catch (err) {
    dealFetchError(info, err)
  }
  return {
    id: info.id,
    status: resIsTrue
  }
}

// 获取单个普通页面内容
function fetchCommonePageContent(info) {
  return new Promise(function (resolve, reject) {
    const { 
      domain,
      hotUrl,
      cookie,
      useUserAgent,
      charset
    } = info
    let request = superagent.get(domain + hotUrl)

    // 设置 cookie
    if (cookie !== '') {
      request = request.set('cookie', cookie)
    }

    // 设置 userAgent
    if (useUserAgent !== 0) {
      request = request.set('User-Agent', userAgents[rnd(0, userAgents.length - 1)])
    }

    // 设置 字符集
    if (charset !== '') {
      request = request.charset(charset).buffer(true)
    } 

    request.end((err, res) => {
      if (err) {
        return reject(err)
      }
      resolve(res.text)
    })
  })
}

// 抓取单个普通页面
async function fetchCommonPage(info) {
  let resIsTrue = false
  // debugCrawler('fetchCommonPage', info)
  try {
    // 获取内容
    let resHtml = await fetchCommonePageContent(info) 

    // 处理数据并入库
    resIsTrue = await htmlToList(info, resHtml)
  } catch (err) {
    dealFetchError(info, err)
  }
  // debugCrawler('res', result)
  return {
    id: info.id,
    status: resIsTrue
  }
}

// Promise.all 处理动态数组
async function arrPromise(arr = [], type = 'concurrency', fn, ...rest) {
  // debugCrawler('fn', rest)
  let arrRes = []
  if (type = 'queue') {
    // 队列
    for (let i = 0; i < arr.length; i ++) {
      let res = await fn(arr[i], ...rest)
      arrRes.push(res)
    }
  } else {
    // 并发
    let arrPromise = arr.map(async el => {
      let res = await fn(el, ...rest)
      return res
    })
    arrRes = await Promise.all(arrPromise)
  }
  return {
    arrRes,   // 抓取渠道数组，单项包含渠道 id 和单项抓取状态 status
    status: arrRes.every(el => el.status)
  }
}

// 处理渠道数组并抓取
async function dealAllChannel(arrChannel = []) {
  // 抓取所有 spa 页面
  let arrSpaChannel = arrChannel.filter(el => el.isSpa === 1)
  let spaRes = {
    status: true,
    arrRes: []
  }
  if (arrSpaChannel.length > 0) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: 60000
    })
    spaRes = await arrPromise(arrSpaChannel, 'queue', fetchSpaPage, browser)
    await browser.close()
  }
  let spaTime = Date.now()

  // 遍历抓取普通页面插入列表
  let arrCommonChannel = arrChannel.filter(el => el.isSpa === 0)
  let commonRes = await arrPromise(arrCommonChannel, 'concurrency', fetchCommonPage)

  console.log('spa %s , common %s', spaTime - startTime, Date.now() - spaTime)

  // debugCrawler('dealAllChannel', commonRes)
  let allStatus = commonRes.status && spaRes.status

  // 抓取成功及错误异步处理
  let arrFetch = spaRes.arrRes.concat(commonRes.arrRes)
  dealFetchArr(arrFetch)

  return allStatus
}

// 处理抓取数组（错误入库，成功删除相关记录）
async function dealFetchArr(arrFetch = []) {
  let arrSuccess = arrFetch.filter(el => el.status)
  let arrFail = arrFetch.filter(el => !el.status)

  // 成功
  if (arrSuccess.length > 0) {
    await deleteChannelFailByChannelIdList(arrSuccess.map(el => el.id))
  }

  if (arrFail.length === 0) {
    return 
  }
  // 失败
  await insertChannelFail(arrFail.map(el => ({ channelId: el.id })))

  // 正式环境下统计大于三次抓取失败的发邮件
  const failTimes = 3
  let res = await findCountGtTimesGroupByChannelId(failTimes, arrFetch.map(el => el.id))
  let arrNeedEmail = res.toJSON()

  if (arrNeedEmail.length === 0) {
    return
  }
  let content = `抓取失败大于 ${failTimes} 次渠道名称：`
  arrNeedEmail.forEach((el, index) => {
    content += el.name
    if (index !== arrNeedEmail.length - 1) {
      content += '、'
    }
  })
  
  // 正式环境发送邮件
  if (env === 'local') {
    return console.log(content)
  }
  email.send({
    name: `抓取失败大于 ${failTimes} 次`,
    subject: '爬虫抓取失败',
    html: `${(new Date()).toLocaleString()} | ${content}`
  })
}

module.exports = {
  // 抓取数据
  async fetchAllData() {
    startTime = Date.now()

    let result = await findChannelAll()
    let list = result.toJSON()

    // 删除所有列表
    await deleteListAll()
   
    // 抓取插入新列表
    let isTrue = await dealAllChannel(list)

    // 信息
    const message = isTrue ? `抓取成功，耗时 ${Date.now() - startTime} ms` : '抓取失败！'

    return {
      isTrue,
      message
    }
  },
  async fetchSingleData(channelId) {
    startTime = Date.now()

    // 获取单个渠道详情
    let resDetail = await findChannelDetailById(channelId)
    if (!resDetail) {
      throw new Error('不存在该渠道！')
    }
    let detail = resDetail.toJSON()

    // 删除单个渠道下的所有列表
    await deleteListByChannelId(channelId)
    
    // 抓取插入新列表
    let isTrue = await dealAllChannel([detail])

    // 信息
    const message = isTrue ? `抓取成功，耗时 ${Date.now() - startTime} ms` : '抓取失败！'

    return {
      isTrue,
      message
    }
  },
  async refetchFailData() {
    startTime = Date.now()
    let isTrue = true
    let message

    // 获取抓取失败的渠道
    let res = await findCountGroupByChannelId()
    let arrNeedFetch = res.toJSON()

    // 重新抓取
    if (arrNeedFetch.length > 0) {
      isTrue = await dealAllChannel(arrNeedFetch)
      message = isTrue ? `重新抓取成功，耗时 ${Date.now() - startTime} ms` : '重新抓取失败'
    } else {
      message = '暂无失败请求'
    }

    return {
      isTrue,
      message
    }
  }
}