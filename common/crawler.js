// 爬虫
const superagent = require('superagent')
const cheerio = require('cheerio')
const log = require('./log')
const email  = require('./email')
const specialChannelMethod = require('./special_channel_method')
const { userAgents } = require('../utils/const')
const { rnd } = require('../utils/tools')
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

let str = '{domain}{listUrlDom}'
str.match(/\{.*\}/g)

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

// 抓取单个页面中的列表
async function fetchHotList(info) {
  let result
  const { 
    id,
    name,
    domain,
    hotUrl,
    cookie,
    useUserAgent,
    listSpecialMethod,
    listDom,
    listTitleDom,
    listUrlDom,
    listUrlRule
  } = info
  let userAgent = userAgents[rnd(0, userAgents.length - 1)]
  let titleDomHasChildren = listTitleDom !== ''
  let urlDomHasChildren = listUrlDom !== ''
  
  // logCrawler(useUserAgent)

  try {
    let res 
    if (cookie === ''){
      // 不携带 cookie
      if (useUserAgent === 0) {
        res = await superagent
          .get(domain + hotUrl)
      } else {
        res = await superagent
        .get(domain + hotUrl)
        .set('User-Agent', userAgent)
      }
    } else {
      // 携带 cookie
      if (useUserAgent === 0) {
        res = await superagent
          .get(domain + hotUrl)
          .set('cookie', cookie)
      } else {
        res = await superagent
          .get(domain + hotUrl)
          .set('cookie', cookie)
          .set('User-Agent', userAgent)
      }
    }

    let $ = cheerio.load(res.text)
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
  } catch (err) {
    log.logToFile('crawler.log', `${name}|${(new Date()).toLocaleString()}|${err.message}`)
    email.send({
      subject: '爬虫抓取失败',
      html: `${name}|${(new Date()).toLocaleString()}|${err.message}`
    })
  }
  // logCrawler('res', result.length)
  return (Object.assign([], result)).length > 0
}

module.exports = {
  // 抓取数据
  async fetchAllData() {
    let res = true
    let result = await findChannelAll()
    let list = result.toJSON()

    // 删除所有列表
    await deleteListAll()
    
    // 遍历抓取插入列表
    list.forEach(el => {
      if (!fetchHotList(el)) {
        res = false
      }
    })
    return res
  },
  async fetchSingleData(channelId) {
    // 获取单个渠道详情
    let resDetail = await findChannelDetailById(channelId)
    if (!resDetail) {
      throw new Error('不存在该渠道！')
    }
    let detail = resDetail.toJSON()

    // 删除单个渠道下的所有列表
    await deleteListByChannelId(channelId)
    
    // 抓取插入新列表
    return fetchHotList(detail)
  }
}