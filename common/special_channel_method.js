// 特殊网站的获取列表的方法，入参都为 $ 和单个渠道信息，返回值为数组，单项包含 title 和 domOriginUrl 
function deal36Kr($, info) {
  let arrRes = []

  // 前两个
  $('.hotlist-main .hotlist-item-toptwo').each((index, el) => {
    arrRes.push({
      title: $(el).find('.hotlist-item-toptwo-title p').text().replace(/\s/g, ''),
      domOriginUrl: $(el).find('.hotlist-item-toptwo-title').attr('href')
    })
  })
  // 后面列表
  $('.hotlist-main .hotlist-item-other').each((index, el) => {
    arrRes.push({
      title: $(el).find('.hotlist-item-other-title').text().replace(/\s/g, ''),
      domOriginUrl: $(el).find('.hotlist-item-other-title').attr('href')
    })
  })

  return arrRes
}

function dealTianYa($, info) {
  let arrRes = []
  
  $('.js-bbs-hot-list').eq(1).find('.bbs-list-box .curr li:not(.li-line, .ads-loc-holder)').each((index, el) => {
    arrRes.push({
      title: $(el).find('.title a').text().replace(/\s/g, ''),
      domOriginUrl: $(el).find('.title a').attr('href')
    })
  })

  return arrRes
}

module.exports = {
  deal36Kr,
  dealTianYa
}