// 爬虫
const superagent = require('superagent')
const cheerio = require('cheerio')
const log = require('./log')
const email  = require('./email')

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
function fetchHotList(info) {
  const { 
    id,
    name,
    domain,
    hotUrl,
    cookie,
    listDom,
    listTitleDom,
    listUrlDom,
    listUrlRule
  } = info
  let titleDomHasChildren = listTitleDom !== ''
  let urlDomHasChildren = listUrlDom !== ''

  let request = superagent.get(domain + hotUrl)
  if (cookie !== ''){
    request = request.set('cookie', cookie)
  }
  
  request.then(res => {
    let $ = cheerio.load(res.text)
    console.log(9090)
    let list = []
    console.log(111, listDom)

    if ($(listDom).length === 0) {
      throw new Error('未抓取数据！')
    }

    $(listDom).each((index, el) => {
      let titleDom = titleDomHasChildren ? $(el).find(listTitleDom) : $(el) 
      let urlDom = urlDomHasChildren ? $(el).find(listUrlDom) : $(el) 

      list.push({
        channelId: id,
        sort: index,
        title: titleDom.text(),
        url: renderUrl(listUrlRule, {
          domain,
          listUrlDom: urlDom.attr('href')
        })
      })
    })
    // console.log(list)
    insertList(list)
  })
  .catch(err => {
    log.logToFile('crawler.log', `${name}|${(new Date()).toLocaleString()}|${err.message}`)
    email.send({
      subject: '爬虫抓取失败',
      html: `${name}|${(new Date()).toLocaleString()}|${err.message}`
    })
  })
}

module.exports = {
  // 抓取数据
  async fetchAllData() {
    let res = await findChannelAll()
    let list = res.toJSON()

    // 删除所有列表
    await deleteListAll()

    // 遍历抓取插入列表
    list.forEach(el => {
      fetchHotList(el)
    })
    return list
  },
  async fetchSingleData(channelId) {
    // 获取单个渠道详情
    let resDetail = await findChannelDetailById(channelId)
    if (!resDetail) {
      throw new Error('不存在该渠道！')
    }
    let detail = resDetail.toJSON()

    // 删除单个渠道下的所有列表
    // await deleteListByChannelId(channelId)
    
    // 抓取插入新列表
    fetchHotList(detail)
  }
}