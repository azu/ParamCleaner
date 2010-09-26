// wedata utility for Greasemonkey
// usage
/*
 // ==UserScript==
 // @name           foo bar
 // @namespace      http://baz.com
 // @require        http://gist.github.com/raw/34615/04333b7e307eb029462680e4f4cf961f72f4324c
 // ==/UserScript==

 var DATABASE_URL = 'http://wedata.net/databases/XXX/items.json';
 var database = new Wedata.Database(DATABASE_URL);

 database.get(function(items) {
 items.forEach(function(item) {
 // do something
 });
 });


 */
var requests = require("request");
var simpleStorage = require("simple-storage");
var Wedata = {};

Wedata.Database = function(url) {
    this.items = [];
    this.expires = 24 * 60 * 60 * 1000; // 1 day
    this.url = url;
};

Wedata.Database.prototype.get = function(callback) {
    var self = this;
    var cacheInfo;

    if (cacheInfo = Wedata.Cache.get(self.url)) {
        self.items = cacheInfo;
        callback(self.items);
    } else {
        // Request インスタンスの生成
        var request = requests.Request({
            url: self.url,
            content: { q: "Firefox 4" },
            onComplete: function () {
                self.items = this.response.json;
                callback(self.items);

                Wedata.Cache.set(self.url, self.items, self.expires);
            }
        });
        // GETメソッドで送信
        request.get();
    }
};

Wedata.Database.prototype.clearCache = function() {
    Wedata.Cache.set(this.url, null, 0);
}

Wedata.Cache = {};

Wedata.Cache.set = function(key, value, expire) {
    var expire = new Date().getTime() + expire;
    simpleStorage.storage[key] = { value: value, expire: expire };
};

Wedata.Cache.get = function(key) {
    var cached = simpleStorage.storage[key];
    if (!cached) {
        return;
    }

    if (cached.expire > new Date().getTime()) {
        return cached.value;
    }

    return;
};
exports.Wedata = Wedata;