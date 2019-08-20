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
  }

  let oBody = document.body
  let oSuggest = document.querySelector('#suggest')
  let oSubmitWrap = document.querySelector('.suggest-wrap')
  let oSubmitWrapClose = document.querySelector('.suggest-wrap-close')
  let oSubmit = document.querySelector('#submit')
  let oCaptcha = document.querySelector('#captcha')
  
  let x = parseInt(getStyle(oSuggest, 'left'), 10)
  let y = parseInt(getStyle(oSuggest, 'top'), 10)
  
  // pc 端拖拽
  oSuggest.addEventListener('mousedown', function (e) {
    function move(e) {
      x = (e.clientX - disX)
      y = (e.clientY - disY)
      setStyle(oSuggest, {
        left: x + 'px',
        top: y + 'px',
      })
    }
    function up(e) {
      oSuggest.removeEventListener('mousemove', move)
      oSuggest.removeEventListener('mouseup', up)

      // click 打开反馈建议弹框
      if ((Date.now() - clickStartTime) < 300) {
        openSuggest()
      }
    }
    let clickStartTime = Date.now()
    let disX = e.clientX - x
    let disY = e.clientY - y

    oSuggest.addEventListener('mousemove', move)
    oSuggest.addEventListener('mouseup', up)
  })

  // m 端拖拽
  oSuggest.addEventListener('touchstart', function (e) {
    function move(e) {
      let target = e.touches[0]
      x = (target.clientX - disX)
      y = (target.clientY - disY)
      setStyle(oSuggest, {
        left: x + 'px',
        top: y + 'px',
      })
      e.preventDefault()
    }
    function up() {
      oSuggest.removeEventListener('touchmove', move)
      oSuggest.removeEventListener('touchend', up)
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
    let contact = document.querySelector('[name=contact]').value
    let content = document.querySelector('[name=content]').value
    let captcha = document.querySelector('[name=captcha]').value
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