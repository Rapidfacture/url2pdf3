/*jslint node: true */
'use strict';


var http = require("http"),
    phantom = require("phantom"),
    fs = require("fs"),
    q = require('q'),
    path = require('path'),
    findRemove = require('find-remove'),
    _ = require('lodash');


var _opts = {
    paperSize: {
        format: "A4",
        orientation: 'portrait',
        margin: '1cm'
    },
    saveDir: path.join(__dirname, "pdfTemp"),
    idLength: 30,
    possibleIdChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    loadTimeout: 500,
    autoCleanFileAgeInSec: 20,
    debug: false
};


module.exports = {
    opts: _opts,
    renderPdf: function renderpdf(url, opts) {
        return render(url, opts, "url");
    },
    renderFromHTML: function renderFromHTML(htmlString, opts) {
        return render(htmlString, opts, "htmlContent");
    },
    cleanup: _cleanup
};


function render(string, opts, renderType) {
        opts = mergeOpts(opts);

    var deferred = q.defer(),
        page, fileName, ph, fullPath,

        // log phantoms output in debugging mode
        phantomOpts = opts.debug ? { logLevel: 'debug' } : {};

    phantom.create(['--ignore-ssl-errors=yes'], phantomOpts)
        .then(function(_ph) {
            ph = _ph;
            return ph.createPage();
        })
        .then(function(_page) {
            page = _page;

            // log messages from phantom browser console in debugging mode
            if(opts.debug){
                page.property('onConsoleMessage', function(msg) {
                    console.log("Phantom console Message:");
                    console.log(msg);
                });
            }

            return page.property("paperSize", opts.paperSize);
        })
        .then(function() {
            if (renderType == "url") {
                return page.open(string); // string = url path
            } else if (renderType == "htmlContent") {
                return page.property("content", string); // string = html doc as string
            } else {
                console.log("wrong render type: " + renderType);
                ph.exit();
            }
        })
        .then(function(status) {
            fileName = makeid(opts.idLength) + ".pdf";
            fullPath = opts.saveDir + "/" + fileName;
            return promiseWithTimeout(opts.loadTimeout);
        })
        .then(function() {
            return page.render(fullPath);
        })
        .then(function() {
            deferred.resolve(fullPath);
        })
        .catch(function(err) {
            deferred.reject(err);
        })
        .then(function() {
            ph.exit();
            if(0 < opts.autoCleanFileAgeInSec){
                _cleanup(opts.autoCleanFileAgeInSec);
            }
        });

    return deferred.promise;
}


function mergeOpts(newOpts) {
    if (newOpts) {
        return _.merge({}, _opts, newOpts);
    } else {
        return _opts;
    }
}


function promiseWithTimeout(duration) {
    var deferred = q.defer();
    setTimeout(deferred.resolve, duration);
    return deferred.promise;
}


function makeid(strLength) {
    if (!strLength) strLength = 30;
    var text = "";
    var possible = _opts.possibleIdChars;

    for (var i = 0; i < strLength; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


function _cleanup(ageInSeconds, opts) {
   opts = mergeOpts(opts);
   return findRemove(opts.saveDir, {
       age: {
           seconds: ageInSeconds
       }
   });
}
