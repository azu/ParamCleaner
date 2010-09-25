var errorConsole = require('error-console')
var observerService = require('observer-service')
var Wedata = require('Wedata').Wedata;
var paramsRemover = require('params-remover')
var {Cc,Ci} = require("chrome");
exports.main = function(options, callbacks) {
    var DATABASE_URL = "http://wedata.net/databases/UrlCleaner/items.json";
    var database = new Wedata.Database(DATABASE_URL);
    database.get(function(items) {
        items.forEach(function(item) {
            filterQuery(item.data);
        });
    });
}

function filterQuery(data) {
    var reAccept = /html/;
    var callback = function(subject) {
        var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel)
        var url = subject.URI.spec
        var acceptHeader = httpChannel.getRequestHeader("Accept")
        // errorConsole.log(url + '\n' +  acceptHeader)

        if (url.indexOf("?") > 0 && (new RegExp(data.url).test(url)) && acceptHeader && reAccept.test(acceptHeader)) {
            // console.log(url + "<< URL")
            var filteredURL = paramsRemover.removeUtmParams(url , data)
            if (url != filteredURL) {
                // errorConsole.log(['Through utm_:', url, filteredURL].join('\n'))
                try {
                    var webNav = subject.notificationCallbacks.getInterface(Ci.nsIWebNavigation)
                    subject.loadFlags = Ci.nsICachingChannel.LOAD_ONLY_FROM_CACHE
                    webNav.loadURI(filteredURL, Ci.nsIWebNavigation.LOAD_FLAGS_NONE, null, null, null)
                }
                catch(e) {
                    errorConsole.log(e)
                }
            }
        }
    }
    observerService.add('http-on-modify-request', callback)
}