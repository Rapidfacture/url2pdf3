# url2pdf3
---
Render URLs or HTML to a PDF or take a screenshot.

Can be used for generating bills, protocols, lists, etc. from a website.

url2pdf3 is the official successor of [url2pdf-plus](https://github.com/FelixFurtmayr/url2pdf-plus), with the following advantages7
* Uses puppetteer (based on Chromium), not the deprecated PhantomJS
* Actual wait events instead of unreliable timeout approach
* Does not use temporary files you have to read but returns binary buffers
* No temporary file cleanup process required ([with-tmp-dir-promise](https://github.com/Rapidfacture/with-tmp-dir-promise))
* Clean source code due to async/await

## Installation ##

    npm install url2pdf3 --save

Note that url2pdf3 requires NodeJS >= 7.6 due to heavy use of async/await.

In order to avoid experiencing missing native library issues like

> /home/user/erp/node_modules/puppeteer/.local-chromium/linux-555668/chrome-linux/chrome: error while loading shared libraries: libX11-xcb.so.1: cannot open shared object file: No such file or directory

also install the native libraries that chrome needs.

> sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget ghostscript

Credits to [@Coldner](https://github.com/coldner")@ on [the puppetteer issue tracker](href="https://github.com/Googlechrome/puppeteer/issues/290") packages.

## Getting started ##

    node example-pdf.js
    node example-screenshot.js

#### PDF from URL

```javascript
const fs = require("mz/fs");
const url2pdf3 = require("url2pdf3");

url2pdf3.renderURL("https://www.google.com")
    .then(pdf => {
        fs.writeFile("mypdf.pdf", pdf).then(() =>
            console.log("See mypdf.pdf!")
        )
    });
```

#### Screenshot from URL

```javascript
const fs = require("mz/fs");
const url2pdf3 = require("url2pdf3");

url2pdf3.renderURL("https://www.google.com", {screenshot: true})
    .then(pdf => {
        fs.writeFile("myscreenshot.png", pdf).then(() =>
            console.log("See myscreenshot.png!")
        )
    });
```

#### Render multiple URLs & automatically join the resulting pages

```javascript
const fs = require("mz/fs");
const url2pdf3 = require("url2pdf3");

url2pdf3.renderURLs(["https://www.google.com", "https://wikipedia.org"])
    .then(pdf => {
        fs.writeFile("mypdf.pdf", pdf).then(() =>
            console.log("See mypdf.pdf!")
        )
    });
```

#### PDF From HTML String

Note that loading external resources from the HTML is possible.

```javascript
const url2pdf3 = require("url2pdf3");
const fs = require("fs");
url2pdf3.renderHTML("<html><body><h1>HELLO WORLD</h1></body></html>")
    .then(function(pdf){
        fs.writeFile('output.pdf',pdf, function(err){
            if(err) {console.error(err)}
            else {console.log('saved pdf to output.pdf')}
        });
    });
```

## Options

 ```javascript
{
    // defaults
    format: 'A4',
    scale: 1.5,
    waitUntil: 'networkidle2', //
    margin: { // can be also just margin: '1cm'
       top: '1cm',
       left: '1cm',
       right: '1cm',
       bottom: '1cm'
    },
    pageOpts: { timeout: 60000 }, // Increases the timeout for loading page to 60 seconds
    

    // for debugging
    puppeteer:{
      headless: false,
      devtools: true
   }
}
 ```

* url2pdf3 and puppeteer options are passed through
* default options are supplemented and / or replaced with transferred options
* now you can use puppeteerOpts e.g.: headerTemplate and displayHeaderFooter

## Joining PDFs.

`url2pdf-plus` also supported joining PDFs but this functionality has now been
rewritten and is now available in the [pdf-toolz](https://github.com/Rapidfacture/pdf-toolz) package.

Note that rendering multiple URLs and automatically concatenating the PDFs is supported.
