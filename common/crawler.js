// 爬虫
const superagent = require('superagent')
require('superagent-charset')(superagent)
const puppeteer = require('puppeteer') 
const cheerio = require('cheerio')
const log = require('./log')
const email  = require('./email')
const specialChannelMethod = require('./special_channel_method')
const { userAgents } = require('../utils/const')
const { rnd } = require('../utils/tools')
const { env } = require('../config/default')
const debug = require('debug')
const logCrawler = debug('crawler')

const {
  findChannelAll,
  findChannelDetailById
}  = require('../dao/channel')
const {
  insertList,
  deleteListAll,
  deleteListByChannelId
}  = require('../dao/list')

let startTime   // 统计抓取耗时

// 统一抓取错误处理
function dealFetchError(info, err) {
  const { 
    name
  } = info
  log.logToFile('crawler.log', `${name}|${(new Date()).toLocaleString()}|${err.message}`)
  // 正式环境发邮件
  if (env !== 'local') {
    email.send({
      subject: '爬虫抓取失败',
      html: `${name}|${(new Date()).toLocaleString()}|${err.message}`
    })
  }
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

  // return logCrawler(list)
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
  let wrapDom = listDom.split(/\s/)[0]
  console.log(wrapDom)
  try {
    // 获取内容
    const page = await browser.newPage()    // 创建一个 Page 实例
    await page.goto(domain + hotUrl)   // 进入网址
    await page.waitFor(listDom)    // 等待目标元素出现，用于客户端渲染页面
    let resHtml = await page.evaluate(dom => {
      return document.querySelector(dom).innerHTML
    }, wrapDom)

    // 处理数据并入库
    resIsTrue = await htmlToList(info, resHtml)
  } catch (err) {
    dealFetchError(info, err)
  }
  return resIsTrue
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
  // logCrawler('fetchCommonPage', info)
  try {
    
    // 获取内容
    let resHtml = await fetchCommonePageContent(info) 

    // 处理数据并入库
    resIsTrue = await htmlToList(info, resHtml)
  } catch (err) {
    dealFetchError(info, err)
  }
  // logCrawler('res', result)
  return resIsTrue
}

// Promise.all 处理动态数组
async function arrPromise(arr = [], type = 'concurrency', fn, ...rest) {
  // logCrawler('fn', rest)
  let arrIsTrue = []
  if (type = 'queue') {
    // 队列
    for (let i = 0; i < arr.length; i ++) {
      let isTrue = await fn(arr[i], ...rest)
      arrIsTrue.push(isTrue)
    }
  } else {
    // 并发
    let arrPromise = arr.map(async el => {
      let isTrue = await fn(el, ...rest)
      return isTrue
    })
    arrIsTrue = await Promise.all(arrPromise)
  }
  return arrIsTrue.every(el => el)
}

// 处理渠道数组并抓取
async function dealAllChannel(arrChannel = []) {
  // 抓取所有 spa 页面
  let arrSpaChannel = arrChannel.filter(el => el.isSpa === 1)
  let spaRes = true
  if (arrSpaChannel.length > 0) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: 60000
    })
    spaRes = await arrPromise(arrSpaChannel, 'queue', fetchSpaPage, browser)
    await browser.close()
  }
  console.log('spa', Date.now() - startTime)

  // 遍历抓取普通页面插入列表
  let arrCommonChannel = arrChannel.filter(el => el.isSpa === 0)
  let commonRes = await arrPromise(arrCommonChannel, 'concurrency', fetchCommonPage)

  // logCrawler('dealAllChannel', commonRes)
  return commonRes && spaRes
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

    return {
      isTrue,
      startTime
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

    return {
      isTrue,
      startTime
    }
  }
}