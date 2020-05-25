// ==UserScript==
// @name          蝦皮出貨單分割
// @version       1.14
// @description   將蝦皮批量輸出的出貨單轉為條碼機能列印的格式
// @author        Kix
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/PrintC2CPinCode.aspx
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/MultiplePrintC2CPinCode.aspx
// @match         http://external2.shopee.tw/ext/familymart/*
// @match         https://seller.shopee.tw/api/v2/orders/waybill/*
// @require       http://html2canvas.hertzen.com/dist/html2canvas.min.js
// ==/UserScript==

(() => {
  console.log('歡迎使用蝦皮出貨單分割系統')
  let host = (window.location.href.search("7-11")>0) ? "7-11" : (window.location.href.search("familymart")>0) ? "familymart" : "express"
  let frame = document.createElement('iframe')
  frame.setAttribute('name', 'printFrame')
  frame.setAttribute('style', 'display:none;')
  document.body.appendChild(frame)

  let frameHead = "<style>@page{size: 100mm 150mm;margin:5mm;} img {width:90mm;height:140mm;page-break-inside:avoid;}</style>" ,
      frameBody = ""

  let performed = 0, goal = -1, data = null
  switch (host) {
    case "7-11":
      data = document.querySelectorAll('.div_frame')
      goal = data.length
      data.forEach(ele=> {
        html2canvas(ele,{scale:5}).then(canvas => {
          frameBody += `<img src="${canvas.toDataURL()}">`
          performed++
        })
      })
      break
    case "familymart":
      data = document.querySelectorAll('img')
      goal = data.length * 4
      data.forEach(ele=> {
        ele.onload = () => {
          let canvas = document.createElement('canvas')
          let ctx = canvas.getContext('2d')
          canvas.width = ele.naturalWidth / 2
          canvas.height = ele.naturalHeight / 2
          for (let x = 0; x <= canvas.width; x += canvas.width) {
            for (let y = 0; y <= canvas.height; y += canvas.height) {
              ctx.drawImage(ele, x+10, y+10, canvas.width-20, canvas.height-20, 0, 0, canvas.width, canvas.height)
              let c = ctx.getImageData(300, 1220, 1, 1).data;
              if (c[0] != 255) frameBody += `<img src="${canvas.toDataURL()}">`
              performed++
            }
          }
        }
        if (ele.complete) ele.onload()
      })
      break
  }

  let interval = window.setInterval(() => {
    if (typeof unsafeWindow.frames.printFrame === 'undefined' || performed != goal) return
    else {
      unsafeWindow.frames.printFrame.document.write(`<head>${frameHead}</head><body onload="window.print()">${frameBody}</body>`)
      unsafeWindow.frames.printFrame.document.close()
      window.clearInterval(interval)
    }
  }, 100)
})()