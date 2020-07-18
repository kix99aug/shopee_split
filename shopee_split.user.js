// ==UserScript==
// @name          蝦皮出貨單分割
// @version       2.2
// @description   將蝦皮批量輸出的出貨單轉為條碼機能列印的格式
// @author        Kix
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/PrintC2CPinCode.aspx
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/MultiplePrintC2CPinCode.aspx
// @match         http://external2.shopee.tw/ext/familymart/*
// @match         https://seller.shopee.tw/api/v2/orders/waybill/*
// @require       https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/pdfmake.min.js
// @require       http://html2canvas.hertzen.com/dist/html2canvas.min.js
// ==/UserScript==

(() => {
  console.log('歡迎使用蝦皮出貨單分割系統')
  let host = (window.location.href.search("7-11") > 0) ? "7-11" : (window.location.href.search("familymart") > 0) ? "familymart" : "express"
  let goal, data, dd = {
      info:{title:`${document.title} ${new Date().toLocaleString()}`},
    pageSize: { width: 283, height: 425 },
    pageMargins: [0, 0, 0, 0],
    content: []
  }
  switch (host) {
    case "7-11":
      document.head.innerHTML += "<style>img{max-width: 4.5cm;}</style>"
      data = document.querySelectorAll('.div_frame')
      goal = data.length
      data.forEach(ele => {
        if (ele.innerText.search("無法列印服務單") > 0) {
          goal--
          return
        }
        html2canvas(ele, { scale: 5 }).then(canvas => {
          dd.content.push({
            image: canvas.toDataURL(),
            height: 425,
            width: 283
          })
          goal--
        })
      })
      break
    case "familymart":
      data = document.querySelectorAll('img')
      goal = data.length * 4
      data.forEach(ele => {
        let int = window.setInterval(()=>{
          if(!ele.complete) return
          window.clearInterval(int)
          let canvas = document.createElement('canvas')
          let ctx = canvas.getContext('2d')
          canvas.width = ele.naturalWidth / 2
          canvas.height = ele.naturalHeight / 2
          for (let x = 0; x <= canvas.width; x += canvas.width) {
            for (let y = 0; y <= canvas.height; y += canvas.height,goal--) {
              ctx.drawImage(ele, x + 10, y + 10, canvas.width - 20, canvas.height - 20, 0, 0, canvas.width, canvas.height)
              let c = ctx.getImageData(300, 1220, 1, 1).data;
              if (c[0] != 255) {
                dd.content.push({
                  image: canvas.toDataURL(),
                  height: 425,
                  width: 283
                })
              }
            }
          }
        },500)
      })
      break
  }

  let interval = window.setInterval(() => {
    if (goal != 0) return
    pdfMake.createPdf(dd,{},{},{}).getBlob(blob=>{
      document.head.innerHTML += "<style>.hide{display:none;animation-name:out;animation-duration:.5s}.modal{display:none;align-items:center;justify-content:center;position:fixed;z-index:1;left:0;top:0;width:100%;height:100%;background-color:#000;background-color:rgba(0,0,0,.4);animation-name:ani;animation-duration:.5s}.modal.hide{display:flex!important}.modal-content{background-color:#fefefe;padding:20px;border:1px solid #888;width:90vw;height:90vh}.modal-content iframe{width:100%;height:100%}@keyframes ani{from{opacity:0}to{opacity:1}}</style>"
      document.body.innerHTML += `<div class="modal"><div class="modal-content"><iframe id="pdf" src="${URL.createObjectURL(blob)}"></iframe></div></div>`
      Array.from(document.body.children).forEach(ele=>ele.classList.add("hide"))
      document.querySelector(".modal").onclick = ()=> Array.from(document.body.children).forEach(ele=>ele.classList.remove("hide"))
    })
    window.clearInterval(interval)
  }, 500)
})()