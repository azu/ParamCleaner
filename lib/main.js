var error = require("error-console");
var observerService = require('observer-service');
var requests = require("request");
var Wedata = require('Wedata').Wedata;
var paramsRemover = require('params-remover');
var tabs = require("tabs");
var Cc = require("chrome").Cc;
var Ci = require("chrome").Ci;
var Cr = require("chrome").Cr;
exports.main = function(options, callbacks) {
    var DATABASE_URL = "http://wedata.net/databases/UrlCleaner/items.json";
    var database = new Wedata.Database(DATABASE_URL);
    database.get(function(items) {
        filterQuery(items);
    });
}

function filterQuery(items) {
    var reAccept = /html/;
    var targetURLs = [];
    for (var i = 0,len = items.length; i < len; i++) {
        var item = items[i];
        targetURLs.push(item.data.url);
        item.data.reurl = new RegExp(item.data.url);// 先に正規表現オブジェクトしておく
    }
    var reTartgetURL = new RegExp(targetURLs.join("|"));// test用の正規表現集合

    var observer = {
        observe : function(aSubject, aTopic, aData) {
            if (aTopic == 'http-on-modify-request') {
                var httpChannel = aSubject.QueryInterface(Ci.nsIHttpChannel)
                var url = aSubject.URI.spec;
                if (url.indexOf("?") !== -1 && reTartgetURL.test(url)) {
                    var acceptHeader = httpChannel.getRequestHeader("Accept")
                    if (acceptHeader && reAccept.test(acceptHeader)) {
                        // console.log(url + "<< URL")
                        // ここでキャンセル
                        var request = httpChannel.QueryInterface(Ci.nsIRequest);
                        request.cancel(Cr.NS_ERROR_FAILURE);
                        // observerService.remove('http-on-modify-request', observer);// リスナーを消す
                        var filteredURL = paramsRemover.removeUtmParams(url, items)
                        if (url != filteredURL) {
                            // リクエストし直し
                            request.notificationCallbacks
                                    .getInterface(Ci.nsIWebNavigation)
                                    .loadURI(filteredURL, Ci.nsIWebNavigation.LOAD_FLAGS_NONE, null, null, null);
                        }
                    }
                }

            }
        }
    }
    observerService.add('http-on-modify-request', observer)
}