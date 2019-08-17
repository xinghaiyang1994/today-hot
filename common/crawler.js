// 爬虫
const superagent = require('superagent')
require('superagent-charset')(superagent)
const phantom = require('phantom') 
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

// 普通页面抓取
function fetchPage(info) {
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

// SPA 页面抓取
function fetchSpa(info) {
  return new Promise(function (resolve, reject) {
    const { 
      domain,
      hotUrl
    } = info
    let sitepage
    let phInstance

    phantom.create().then(instance => {
      phInstance = instance
      return instance.createPage()
    }).then(page => {
      sitepage = page
      return page.open(domain + hotUrl)
    }).then(() => {
      return sitepage.property('content')
    }).then(content => {
      sitepage.close()
      phInstance.exit()
      resolve(content)
    }).catch(err => {
      phInstance.exit()
      reject(err)
    })
  })
}

// 抓取单个页面中的列表
async function fetchHotList(info) {
  let result
  const { 
    id,
    name,
    domain,
    isSpa,
    listSpecialMethod,
    listDom,
    listTitleDom,
    listUrlDom,
    listUrlRule
  } = info
  let titleDomHasChildren = listTitleDom !== ''
  let urlDomHasChildren = listUrlDom !== ''

  try {
    let resHtml
    if (isSpa === 0) {
      // 不是单页
      resHtml = await fetchPage(info) 
    } else {
      // 单页
      resHtml = await fetchSpa(info) 
    }
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
  } catch (err) {
    log.logToFile('crawler.log', `${name}|${(new Date()).toLocaleString()}|${err.message}`)
    email.send({
      subject: '爬虫抓取失败',
      html: `${name}|${(new Date()).toLocaleString()}|${err.message}`
    })
  }
  // logCrawler('res', result)
  return (Object.assign([], result)).length > 0
}

module.exports = {
  // 抓取数据
  async fetchAllData() {
    let result = await findChannelAll()
    let list = result.toJSON()

    // 删除所有列表
    await deleteListAll()
    
    // 遍历抓取插入列表
    let arrIsOkPromise = list.map(async el => {
      let isOk = await fetchHotList(el)
      return isOk
    })
    let arrIsOk = await Promise.all(arrIsOkPromise)

    // logCrawler('arrIsOk', arrIsOk)
    return arrIsOk.every(el => el)
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