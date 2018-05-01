#url2pdf3
---
Render URLs or HTML to a PDF.

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

## Getting started ##

    node examples.js

#### PDF from URL

```javascript
    const fs = require("mz/fs");
    const url2pdf3 = require("url2pdf3");

    url2pdf3.renderURL("https://www.google.com")
    	.then(pdf => {
            fs.writeFile("mypdf.pdf").then(() =>
                console.log("See mypdf.pdf!")
            )
    	});
```

#### PDF From HTML String

Note that loading external resources from the HTML is possible.

```javascript
    const url2pdf3 = require("url2pdf3");
    url2pdf3.renderHTML("<html><body><h1>HELLO WORLD</h1></body></html>")
    	.then(function(path){
	    	console.log("Rendered pdf @", path);
    	});
```

## Options

 * format: e.g. 'A4'
 * scale: Scale factor. Default 1.5 for approximate PhantomJS compatibility
 * waitUntil: A puppetter wait specification. Usually, the default 'networkidle2' is the right choice.
 * margin: Either a string ('1cm') => same on all sides or an object containing left, right, top & bottom keys

## Joining PDFs.

`url2pdf-plus` also supported joining PDFs but this functionality has now been
rewritten and is now available in the [pdf-toolz](https://github.com/Rapidfacture/pdf-toolz) package.