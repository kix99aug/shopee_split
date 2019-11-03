// ==UserScript==
// @name          蝦皮出貨單分割
// @version       0.2
// @description   將蝦皮批量輸出的出貨單轉為條碼機能列印的格式
// @author        Kix
// @include       http://blank.org/*
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/MultiplePrintC2CPinCode.aspx
// @match         http://external2.shopee.tw/ext/familymart/OrdersPrint/OrdersPrint.aspx
// @require       https://raw.githack.com/eKoopmans/html2pdf/master/dist/html2pdf.bundle.js
// @require       https://printjs-4de6.kxcdn.com/print.min.js
// @require       https://code.jquery.com/jquery-3.3.1.slim.min.js
// @require       https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js
// @resource      bootstrapCSS https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css
// @grant         GM_getResourceURL
// ==/UserScript==

const seven11 = {
  pagebreak: { mode: 'avoid-all' },
  margin: [6, 6],
  html2canvas: { scale: 5 },
  jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
}
const fami = {
  pagebreak: { mode: 'avoid-all' },
  margin: [8, 3],
  html2canvas: { scale: 5 },
  jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
}

function printDocument(element) {
  //Wait until PDF is ready to print
  if (typeof element.print === 'undefined') {
    setTimeout(function () { printDocument(element); }, 1000);
    console.log('failed')
  } else {
    element.print();
  }
}

function cssElement(url) {
  var link = document.createElement("link");
  link.href = url;
  link.rel="stylesheet";
  link.type="text/css";
  return link;
}

(function () {
  'use strict';
  document.head.appendChild(cssElement(GM_getResourceURL("bootstrapCSS")));
  window.onload = () => {
    let setting = (window.location.href == "https://epayment.7-11.com.tw/C2C/C2CWeb/MultiplePrintC2CPinCode.aspx") ? seven11 : fami
    if (setting == fami) {
      let imgs = document.querySelectorAll('img')
      imgs.forEach(ele => {
        let canvas1 = document.createElement('canvas')
        let ctx1 = canvas1.getContext('2d')
        canvas1.width = ele.width / 2
        canvas1.height = ele.height
        let canvas2 = document.createElement('canvas')
        let ctx2 = canvas2.getContext('2d')
        canvas2.width = ele.width / 2
        canvas2.height = ele.height
        ctx1.drawImage(ele, 0, 0, ele.width / 2, ele.height, 0, 0, ele.width / 2, ele.height)
        ctx2.drawImage(ele, ele.width / 2, 0, ele.width / 2, ele.height, 0, 0, ele.width / 2, ele.height)
        let img = document.createElement('img')
        img.src = canvas1.toDataURL()
        document.body.appendChild(img)
        img = document.createElement('img')
        img.src = canvas2.toDataURL()
        document.body.appendChild(img)
      })
      document.body.removeChild(document.querySelector('form'))
    }
    if (debug) {
      html2pdf().set(setting).from((setting == seven11) ? document.querySelector("table").innerHTML : document.body.innerHTML).save()
    } else html2pdf().set(setting).from((setting == seven11) ? document.querySelector("table").innerHTML : document.body.innerHTML).outputPdf('dataurlstring').then((s) => {
      printJS({
        printable: s.split(',')[1],
        type: 'pdf',
        base64: true
      })
    })
  }
})();