const _ = require('lodash');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('mz/fs');
const {combinePDF} = require('pdf-toolz/SplitCombine');

const {withTempDir} = require('with-tmp-dir-promise');

/**
 * Render HTML to a PDF
 * @param {any} html The HTML to render
 * @param {any} [opts={}] See _render
 */
function renderHTML (html, opts = {}) {
   return _render(html, true /* html */, opts);
}

/**
 * Render multiple URLs independently, joining
 * all resulting PDFs in the given order.
 */
async function renderURLs (urls, opts = {}) {
   const promises = urls.map(url => renderURL(url, opts));
   const pdfs = await Promise.all(promises);
   // Join
   return combinePDF(pdfs);
}

/**
 * Render an URL to a PDF
 * @param {any} url The URL to render
 * @param {any} [opts={}] See _render
 */
function renderURL (url, opts = {}) {
   return _render(url, false /* url */, opts);
}

/**
 * Return true if the current process is run by the root user
 * https://techoverflow.net/2019/11/07/how-to-check-if-nodejs-is-run-by-root/
 */
function isCurrentUserRoot () {
   /* eslint-disable-next-line */
   return process.getuid() == 0; // UID 0 is always root
}


const _defaultRenderOpts = {
   format: 'A4',
   scale: 1.5,
   waitUntil: 'networkidle2',
   margin: {
      top: '1cm',
      left: '1cm',
      right: '1cm',
      bottom: '1cm'
   }
};

/**
 * @param {any} string The HTML or URL parameter, depending on stringIsHTML
 * @param {boolean} [stringIsHTML=true]
 * @param {any} [opts={}]
 * format: e.g. 'A4'
 * scale: Scale factor. Default 1.5 for approximate PhantomJS compatibility7
 * waitUntil: A puppetter wait specification. Usually, the default 'networkidle2' is the right choice.
 * margin: Either a string ('1cm') => same on all sides or an object
 *    containing left, right, top & bottom keys
 * @returns A promise of a binary PDF buffer.
 */
async function _render (string, stringIsHTML = true, opts = {}) {
   // Build render options
   let margin = opts.margin || _defaultRenderOpts.margin;
   if (!_.isObject(margin)) { // Same on all sides
      margin = {
         left: margin, right: margin, top: margin, bottom: margin
      };
   }
   const waitUntil = opts.waitUntil || _defaultRenderOpts.waitUntil;
   const renderOpts = {
      format: opts.format || _defaultRenderOpts.format,
      margin: margin,
      scale: opts.scale || _defaultRenderOpts.scale,
      landscape: opts.landscape
   };
   // Run puppetteer in temporary directory, which is deleted afterwards
   return withTempDir(async (tmpdir) => {
      let puppeteerOpts = {
         headless: true,
         args: isCurrentUserRoot() ? ['--no-sandbox'] : undefined
      };

      opts.puppeteer = opts.puppeteer || {};
      Object.assign(puppeteerOpts, opts.puppeteer);

      const browser = await puppeteer.launch(puppeteerOpts);
      const page = await browser.newPage();
      // Load content
      if (stringIsHTML) {
         await page.setContent(string, {waitUntil: waitUntil}); // string = html doc as string
      } else { // String is an URL
         await page.goto(string, {waitUntil: waitUntil}); // string = url path
      }
      // Create PDF
      let file = null;
      if (opts.screenshot) {
         // Create screenshot
         file = path.join(tmpdir, 'temp.png');
         await page.screenshot({path: file});
      } else { // !opts.screenshot => default mode: PDF
         file = path.join(tmpdir, 'temp.pdf');
         await page.pdf(_.merge(renderOpts, {
            path: file
         }));
      }
      // Return the file as Buffer
      await browser.close();
      return fs.readFile(file);
   }, { unsafeCleanup: true, prefix: 'url2pdf3-' });
}

module.exports = {
   renderHTML: renderHTML,
   renderURL: renderURL,
   renderURLs: renderURLs
};
