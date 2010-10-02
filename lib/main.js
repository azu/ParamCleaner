var error = require("error-console");
var observerService = require('observer-service');
var requests = require("request");
var Wedata = require('Wedata').Wedata;
var paramsRemover = require('params-remover');
var Cc = require("chrome").Cc;
var Ci = require("chrome").Ci;
exports.main = function(options, callbacks) {
    var DATABASE_URL = "http://wedata.net/databases/UrlCleaner/items.json";
    var database = new Wedata.Database(DATABASE_URL);
    database.get(function(items) {
        filterQuery(items);
    });
}

function filterQuery(items) {
    /*
     var reAccept = /html/;
     var targetURLs = [];
     for (var i = 0,len = items.length; i < len; i++) {
     var item = items[i];
     targetURLs.push(item.data.url);
     item.data.reurl = new RegExp(item.data.url);// 先に正規表現オブジェクトしておく
     }
     var reTartgetURL = new RegExp(targetURLs.join("|"));// test用の正規表現集合
     var callback = function(subject) {
     var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel)
     var url = subject.URI.spec
     // errorConsole.log(url + '\n' +  acceptHeader)
     if (url.indexOf("?") > 0 && reTartgetURL.test(url)) {
     var acceptHeader = httpChannel.getRequestHeader("Accept")
     if (acceptHeader && reAccept.test(acceptHeader)) {
     // console.log(url + "<< URL")
     var filteredURL = paramsRemover.removeUtmParams(url, items)
     if (url != filteredURL) {
     // errorConsole.log(['Through utm_:', url, filteredURL].join('\n'))
     try {
     var webNav = subject.notificationCallbacks.getInterface(Ci.nsIWebNavigation)
     subject.loadFlags = Ci.nsICachingChannel.LOAD_ONLY_FROM_CACHE
     webNav.loadURI(filteredURL, Ci.nsIWebNavigation.LOAD_FLAGS_NONE, null, null, null)
     }
     catch(e) {
     console.log(e)
     }
     }
     }
     }
     }
     observerService.add('http-on-modify-request', callback)
     */

    var targetURLs = [];
    for (var i = 0,len = items.length; i < len; i++) {
        var item = items[i];
        targetURLs.push(item.data.url);
        item.data.reurl = new RegExp(item.data.url);// 先に正規表現オブジェクトしておく
    }
    var reTartgetURL = new RegExp(targetURLs.join("|"));// test用の正規表現集合
    // ページ移動時に反応する
    // http://d.hatena.ne.jp/cou929_la/20100301/1267434283
    // http://piro.sakura.ne.jp/latest/blosxom/mozilla/xul/2007-01-21_splitbrowser-subbrowser.htm
    // http://mikanbako.blog.shinobi.jp/Entry/372/
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
            .getService(Ci.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser"); // gBrowserのために
    var nsIWebProgressListener = Ci.nsIWebProgressListener;
    var MyListener = {
        // nsIWebProgressインタフェースの実装
        isBypass :false,
        urlBarListener: {
            QueryInterface: function(aIID) {
                if (aIID.equals(Ci.nsIWebProgressListener) ||
                        aIID.equals(Ci.nsISupportsWeakReference) ||
                        aIID.equals(Ci.nsISupports))
                    return this;
            },
            onStateChange : function(aWebProgress, aRequest, aStateFlags, aStatus) {
                var url = aRequest.name;
                error.log(url + "<< URL -outside")
                if (aStateFlags & nsIWebProgressListener.STATE_START) {
                    // errorConsole.log(url + '\n' +  acceptHeader)
                    if (url.indexOf("?") > 0 && reTartgetURL.test(url)) {
                        var filteredURL = paramsRemover.removeUtmParams(url, items)
                        if (url !== filteredURL) {
                            error.log(url + "<< URL")
                            aWebProgress.DOMWindow.location.replace(filteredURL);
                        }
                    }
                }
            },
            onProgressChange: function() {
            },
            onSecurityChange: function() {
            },
            onLinkIconAvailable: function() {
            }
        },

        // progress listener を追加する
        init: function() {
            console.log("init ")
            mainWindow.gBrowser.addProgressListener(MyListener.urlBarListener, Ci.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
        },

        // progress listener を削除する
        uninit: function() {
            mainWindow.gBrowser.removeProgressListener(MyListener.urlBarListener);
        }
    }
    MyListener.init();
}