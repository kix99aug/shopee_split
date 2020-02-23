// ==UserScript==
// @name          蝦皮出貨單分割
// @version       1.12
// @description   將蝦皮批量輸出的出貨單轉為條碼機能列印的格式
// @author        Kix
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/PrintC2CPinCode.aspx
// @match         https://epayment.7-11.com.tw/C2C/C2CWeb/MultiplePrintC2CPinCode.aspx
// @match         http://external2.shopee.tw/ext/familymart/*
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
  filename: null,
  margin: [6, 6],
  html2canvas: { scale: 10 },
  jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
}
const fami = {
  pagebreak: { mode: 'css', after: 'br' },
  filename: null,
  margin: [2, 5],
  html2canvas: { scale: 5 },
  jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
}
const express = {
  pagebreak: { mode: 'css', after: '.page-breaker' },
  filename: null,
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
  console.log('start')
  let imglength = Number.MAX_VALUE
  let setting = (window.location.host == "epayment.7-11.com.tw") ? seven11 : (window.location.host == "seller.shopee.tw") ? express : fami
  if (setting == fami) {
    let imgs = document.querySelectorAll('img')
    imglength = imgs.length * 4
    imgs.forEach(ele => {
      $(ele).on('load', () => {
        ele.style = ""
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        canvas.width = ele.width / 2
        canvas.height = ele.height / 2
        ctx.drawImage(ele, 0, 0, ele.width / 2, ele.height / 2, 0, 0, ele.width / 2, ele.height / 2)
        let c = ctx.getImageData(300, 1220, 1, 1).data;
        imglength--
        if (c[0] != 255) {
          let img = document.createElement('img')
          img.src = canvas.toDataURL()
          document.body.appendChild(img)
          img.after(document.createElement('br'))
        }
        ctx.drawImage(ele, ele.width / 2, 0, ele.width / 2, ele.height / 2, 0, 0, ele.width / 2, ele.height / 2)
        c = ctx.getImageData(300, 1220, 1, 1).data;
        imglength--
        if (c[0] != 255) {
          let img = document.createElement('img')
          img.src = canvas.toDataURL()
          document.body.appendChild(img)
          img.after(document.createElement('br'))
        }
        ctx.drawImage(ele, 0, ele.height / 2, ele.width / 2, ele.height / 2, 0, 0, ele.width / 2, ele.height / 2)
        c = ctx.getImageData(300, 1220, 1, 1).data;
        imglength--
        if (c[0] != 255) {
          let img = document.createElement('img')
          img.src = canvas.toDataURL()
          document.body.appendChild(img)
          img.after(document.createElement('br'))
        }
        ctx.drawImage(ele, ele.width / 2, ele.height / 2, ele.width / 2, ele.height / 2, 0, 0, ele.width / 2, ele.height / 2)
        c = ctx.getImageData(300, 1220, 1, 1).data;
        imglength--
        if (c[0] != 255) {
          let img = document.createElement('img')
          img.src = canvas.toDataURL()
          document.body.appendChild(img)
          img.after(document.createElement('br'))
        }
      })
      if (ele.complete) $(ele).trigger('load')
    })
  } else if (setting == seven11) {
    var table
    if (window.location.pathname == "/C2C/C2CWeb/PrintC2CPinCode.aspx") {
      table = document.querySelector("table")
    }
    else {
      table = document.createElement('table')
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
    }

    imglength = 0
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
    imglength = 0
  }
  setting.filename = new Date().toLocaleString()
  let printed = false
  let intfun = setInterval(() => {
    console.log(imglength)
    if (!printed && imglength == 0) {
      if (setting == fami) {
        let css = document.createElement('style')
        css.innerHTML = "img{max-height:14.5cm;}"
        document.body.appendChild(css)
        document.querySelector('form').remove()
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
      printed = true
      clearInterval(intfun)
    }
  }, 1000)
})();
