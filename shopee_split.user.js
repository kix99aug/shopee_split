// ==UserScript==
// @name          蝦皮出貨單分割
// @version       1.5
// @description   將蝦皮批量輸出的出貨單轉為條碼機能列印的格式
// @author        Kix
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/MultiplePrintC2CPinCode.aspx
// @match         http://external2.shopee.tw/ext/familymart/OrdersPrint/OrdersPrint.aspx
// @match         https://seller.shopee.tw/api/v2/orders/waybill/*
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
  html2canvas: { scale: 10 },
  jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
}
const fami = {
  pagebreak: { mode: 'css', after: 'img' },
  margin: [8, 3],
  html2canvas: { scale: 10 },
  jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
}
const express = {
  pagebreak: { mode: 'css', after: '.page-breaker' },
  margin: [5.5, 11],
  html2canvas: { scale: 10 },
  jsPDF: { unit: 'mm', format: [100, 150], orientation: 'landscape' }
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
  link.rel = "stylesheet";
  link.type = "text/css";
  return link;
}

(function () {
  'use strict';
  $(document).ready(() => {
    let setting = (window.location.host == "epayment.7-11.com.tw") ? seven11 : (window.location.host == "seller.shopee.tw") ? express : fami
    console.log(setting)
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
        var c1 = ctx1.getImageData(1, 1, 1, 1).data;
        var c2 = ctx2.getImageData(1, 1, 1, 1).data;
        if (c1[0] != 255) {
          let img = document.createElement('img')
          img.src = canvas1.toDataURL()
          document.body.appendChild(img)
        }
        if (c2[0] != 255) {
          let img = document.createElement('img')
          img.src = canvas2.toDataURL()
          document.body.appendChild(img)
        }
      })
      document.body.removeChild(document.querySelector('form'))
    } else if (setting == seven11) {
      var table = document.createElement('table')
      var HTML = ""
      document.querySelectorAll("#Panel1 > table > tbody > tr > td").forEach(ele => {
        ele.style = ""
        HTML += '<tr>' + ele.outerHTML + '</tr>'
      })
      table.innerHTML = HTML
      table.cellpadding = 0
      table.cellspacing = 0
      document.body.innerHTML = ""
      document.body.appendChild(table)
    } else {
      document.querySelector(".container").style = "display: table-row"
      document.querySelector("body > table").remove()
      document.querySelectorAll('.cut-line').forEach(ele => {
        ele.remove()
      })
      document.querySelectorAll('.page').forEach(ele => {
        ele.style = "border: 0 !important; padding: 0 !important;"
      })
      document.querySelectorAll('.address-label__title').forEach(ele => {
        ele.style = "color : black !important;"
      })
    }
    let pdf = html2pdf().set(setting).from((setting == seven11) ? table : (setting == express) ? document.body.innerHTML : document.body.innerHTML)
    var modalHtml = `
    <!-- Modal -->
    <div class="modal fade" id="sel" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-body align-self-center">
          <button id="print" type="button" class="btn btn-success">🖨️列印</button>
          <button id="download" type="button" class="btn btn-primary">📥下載</button>
          </div>
        </div>
      </div>
    </div>
    `
    pdf.outputPdf('dataurlstring').then(s => {
      document.head.appendChild(cssElement(GM_getResourceURL("bootstrapCSS")));
      $("body").prepend(modalHtml);
      $('#sel').modal('show')
      $('button#download').click(() => pdf.save())
      $('button#print').click(() => printJS({
        printable: s.split(',')[1],
        type: 'pdf',
        base64: true
      }))
    })
  })
})();