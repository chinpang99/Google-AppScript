/**
 * @name keyboard
 *
 * @desc types into a text editor
 *
 * @see {@link https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagehoverselector}
 */
 const puppeteer = require('puppeteer');

 (async () => {
   const browser = await puppeteer.launch({headless:false})
   const page = await browser.newPage()
   await page.goto('https://lazada.com.my',{waitUntil:'networkidle2'})
//    await page.focus('trix-editor') //html class element
//    await page.keyboard.type('Just adding a title')
   await page.screenshot({ path: 'lazada.png' })
   await browser.close()
 })()

 app.get("/scrapeWebsiteData2", (req, res) => {
  puppeteer.launch({
      headless: false
  }).then((browser) => {
      browser.newPage().then((page) => {
          page.goto('http://lazada.com.my/', {
              waitUntil: 'networkidle2'
          }).then(() => {

              let process = Promise.resolve()

              // process = process.then(() => {
              //     return page.type("[type='search']", "nvidia")
              // })

              process = process.then(() => {
                  console.log("click on the search")
                  return Promise.all([
                      page.evaluate(() => {
                          $("[type='search']").val("nvidia apple")
                          $("button[class*='search-box__button']").click()
                      }),
                      page.waitForNavigation({
                          waitUntil: 'networkidle2'
                      })
                  ])
              })

              process = process.then(() => {
                  console.log("load complete")
                  return page.$$eval('div[data-tracking="product-card"]', (links) => {
                      // Make sure the book to be scraped is in stock
                      //    return links;
                      links = links.map(el => {
                          let xel = {}
                          xel['text'] = el.querySelector('img').alt
                          xel['img_src'] = el.querySelector('img').src
                          xel['price'] = el.querySelector('span').innerText
                          return xel
                      })
                      console.log(links)
                      return links;
                  })


              })

              process = process.then((value) => {
                  browser.close()
                  console.log("done", value)
                  res.json(value)
              })




          })

      })
  })
})