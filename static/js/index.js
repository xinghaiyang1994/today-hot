function json2url(json) {
  var arr = [];
  json.t = Math.random();
  for (var name in json) {
    arr.push(name + '=' + encodeURIComponent(json[name]));
  }
  return arr.join('&');
}
/*url,data,type,success,error*/
function ajax(json) {
  json = json || {};
  json.data = json.data || {};
  json.type = json.type || 'GET';
  json.timeout = json.timeout || 10000;

  if (!json.url) {
    return;
  }

  /*1.创建ajax对象*/
  if (window.XMLHttpRequest) {
    var oAjax = new XMLHttpRequest();
  } else {
    var oAjax = new ActiveXObject('Microsoft.XMLHTTP');
  }

  switch (json.type.toLowerCase()) {
    case 'get':
      /*2.建立连接*/
      oAjax.open('GET', json.url + '?' + json2url(json.data), true);
      /*3.发送*/
      oAjax.send();
      break;
    case 'post':
      /*2.建立连接*/
      oAjax.open('POST', json.url, true);
      /*3.发送*/
      oAjax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      oAjax.send(json2url(json.data));
      break;
  }

  json.loading && json.loading();
  clearTimeout(timer);

  var timer = setTimeout(function () {
    json.complete && json.complete();
    json.error && json.error('网络异常，请稍后重试');
    oAjax.onreadystatechange = null;
  }, json.timeout);

  /*4.接收  监控网络*/
  oAjax.onreadystatechange = function () {

    /*网络状态*/
    if (oAjax.readyState == 4) {

      /*http状态*/
      if (oAjax.status >= 200 && oAjax.status < 300 || oAjax.status == 304) {

        clearTimeout(timer);
        json.complete && json.complete();
        json.success && json.success(JSON.parse(oAjax.responseText))

      } else {

        clearTimeout(timer);
        json.error && json.error('网络异常，请稍后重试');

      }

    }

  };
}
function getStyle(dom, name) {
  return dom.currentStyle ? dom.currentStyle[name] : getComputedStyle(dom, false)[name]
}
function setStyle() {
  if (arguments.length == 2) {
    for (var i in arguments[1]) {
      arguments[0].style[i] = arguments[1][i]
    }
  } else {
    arguments[0].style[arguments[1]] = arguments[2]
  }
}
function setCookie (name, value, iDay) {
  let aDomain = location.hostname.split('.')
  let domain = aDomain[aDomain.length - 2] + '.' + aDomain[aDomain.length - 1]
  if (iDay) {
      let oDate = new Date()
      oDate.setTime(oDate.getTime() + iDay * 24 * 60 * 60 * 1000)
      document.cookie = `${name}=${value}; expires=${oDate.toGMTString()}; path=/; domain=${domain}`        // expires 、path 不区分大小写
  } else {
      document.cookie = `${name}=${value}; path=/; domain=${domain}`
  }
}
function getCookie (name) {
  var str = document.cookie
  var arr = str.split('; ')
  for(let i = 0; i < arr.length; i ++){
      if(arr[i].split('=')[0] == name){
          return arr[i].split('=')[1]
      }
  }
  return ''
}
function show(dom, isShow) {
  setStyle(dom, {
    display: isShow ? 'block' : 'none'
  })
}
function overflowHidden(dom, isTrue) {
  setStyle(dom, {
    overflow: isTrue ? 'hidden' : 'auto'
  })
}

window.onload = function () {
  function openSuggest() {
    overflowHidden(oBody, true)
    show(oSubmitWrap, true)
    show(oSuggest, false)
  }
  function closeSuggest() {
    overflowHidden(oBody, false)
    show(oSubmitWrap, false)
    show(oSuggest, true)
    oInputContact.value = ''
    oInputContent.value = ''
    oInputCaptcha.value = ''
  }
  function setSuggestPosition(position) {
    setStyle(oSuggest, {
      left: position.x + 'px',
      top: position.y + 'px',
    })
  }

  let oBody = document.body
  let oSuggest = document.querySelector('#suggest')
  let oSubmitWrap = document.querySelector('.suggest-wrap')
  let oSubmitWrapClose = document.querySelector('.suggest-wrap-close')
  let oSubmit = document.querySelector('#submit')
  let oCaptcha = document.querySelector('#captcha')
  let oInputContact = document.querySelector('[name=contact]')
  let oInputContent = document.querySelector('[name=content]')
  let oInputCaptcha = document.querySelector('[name=captcha]')
  let cookieName = location.host
  
  const widthSuggest = oSuggest.offsetWidth
  const heightSuggest = oSuggest.offsetHeight
  const widthBody = oBody.offsetWidth
  const heightBody = oBody.offsetHeight
  // 拖动范围
  const distance = {
    x: {
      start: 0,
      end: widthBody - widthSuggest
    },
    y: {
      start: heightSuggest / 2,
      end: heightBody - heightSuggest + heightSuggest / 2
    }
  }

  let x = 0
  let y = 0

  // 读取之前拖拽的位置
  let position = getCookie(cookieName)
  if (position) {
    console.log(position)
    position = JSON.parse(position)
    setSuggestPosition(position)
    x = position.x
    y = position.y
  } else {
    x = parseInt(getStyle(oSuggest, 'left'), 10)
    y = parseInt(getStyle(oSuggest, 'top'), 10)
  }
  
  // pc 端拖拽
  oSuggest.addEventListener('mousedown', function (e) {
    function move(e) {
      x = (e.clientX - disX)
      y = (e.clientY - disY)
      if (x < distance.x.start) {
        x = distance.x.start
      } else if (x > distance.x.end) {
        x = distance.x.end
      }
      if (y < distance.y.start) {
        y = distance.y.start
      } else if (y > distance.y.end) {
        y = distance.y.end
      }
      setSuggestPosition({x, y})
    }
    function up(e) {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)

      setCookie(cookieName, JSON.stringify({x, y}), 7)
      // click 打开反馈建议弹框
      if ((Date.now() - clickStartTime) < 300) {
        openSuggest()
      }
    }
    let clickStartTime = Date.now()
    let disX = e.clientX - x
    let disY = e.clientY - y

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  })

  // m 端拖拽
  oSuggest.addEventListener('touchstart', function (e) {
    function move(e) {
      let target = e.touches[0]
      x = (target.clientX - disX)
      y = (target.clientY - disY)
      if (x < distance.x.start) {
        x = distance.x.start
      } else if (x > distance.x.end) {
        x = distance.x.end
      }
      if (y < distance.y.start) {
        y = distance.y.start
      } else if (y > distance.y.end) {
        y = distance.y.end
      }
      setSuggestPosition({x, y})
      e.preventDefault()
    }
    function up() {
      oSuggest.removeEventListener('touchmove', move)
      oSuggest.removeEventListener('touchend', up)

      setCookie(cookieName, JSON.stringify({x, y}), 7)
    }
    let target = e.touches[0]
    let disX = target.clientX - x
    let disY = target.clientY - y

    oSuggest.addEventListener('touchmove', move)
    oSuggest.addEventListener('touchend', up)
    console.log('touch')
  })

  // 关闭反馈建议弹框
  oSubmitWrapClose.addEventListener('click', closeSuggest)

  // 刷新验证码
  oCaptcha.addEventListener('click', function () {
    let src = '/suggest/captcha?t=' + Date.now()
    oCaptcha.src = src
  })

  // 提交
  let canSubmit = true
  oSubmit.addEventListener('click', function () {
    let contact = oInputContact.value
    let content = oInputContent.value
    let captcha = oInputCaptcha.value
    console.log(contact, content, captcha)

    if ((content + '').trim() === '' || (captcha + '').trim() === '') {
      return alert('内容或验证码不能为空!')
    }

    if (!canSubmit) {
      return
    }
    canSubmit = false

    let data = {
      name,
      content,
      captcha
    }
    ajax({
      url: '/suggest/submit',
      type: 'post',
      data,
      success(res) {
        alert(res.message)
        closeSuggest()
        canSubmit = true
      },
      error(err) {
        canSubmit = true
        console.log(err)
      }
    })
  })

  // m 端防止滚动穿透
  oSubmitWrap.addEventListener('touchmove', function (e) {
    e.preventDefault()
  })
}