exports.removeUtmParams = removeUtmParams

function getParamsStr(url) {
    var re = /\?([^#]+)/
    var matched = url.match(re)
    return matched ? matched[1] : null
}

function getParamsReplaceStr(url, str) {
    var re = /\?([^#]+)/
    return url.replace(re, str)
}

function getParams(url) {
    var r = []
    var paramsStr = getParamsStr(url)
    if (paramsStr) {
        paramsStr.split('&').forEach(function(i) {
            r.push(i.split('='))
        })
    }
    return r
}

function paramsJoin(params) {
    return params.map(function(i) {
        return i.join('=')
    }).join('&')
}

function filterByKeys(key, survivors) {
    if (rescues && rescues.indexOf(key) > -1) {
        survivors.push(v);
        return false;
    }

    return typeof killers.indexOf == "function" && killers.indexOf(key) == -1;
}
// どのSITEINFOを判定する
function matchItem(url, items) {
    for (var i = 0,len = items.length; i < len; i++) {
        var item = items[i];
        if (item.data.reurl.test(url)) {
            return item.data;// 使うSITEINFOを決める
        }
    }
}
function removeUtmParams(url, items) {
    /*
     http://wedata.net/databases/UrlCleaner/items
     live
     URL に残しておきたいパラメーター名を指定します。マッチした場合は指定したパラメーター以外は削除します。
     kill
     URL から消し去りたいパラメーター名を指定します。マッチしなかったパラメーターは残ります。
     live と kill を指定していた場合 live のほうが優先されます。 
     */
    var data = matchItem(url, items);
    var rescues = typeof data.live == "string" && data.live.split(" ");
    var killers = typeof data.kill == "string" && data.kill.split(" ");
    var params = getParams(url);
    if (params.length == 0) {
        return url
    } else {
        var filteredParams = [];
        // liveなパラメーターの検査
        if (rescues && rescues.length > 0 && rescues != "") {
            // console.log(rescues + "<< live");
            filteredParams = params.filter(function(val, index, array) {
                var paramName = val[0];
                // console.log(paramName + " << Name -live");
                for (var i = 0,len = rescues.length; i < len; i++) {
                    // パラーメータ名とliveにするものが一致 -falseは省略
                    if (paramName === rescues[i]) {
                        return true;
                    }
                }
            });
        }
        // liveは合った場合はkillの処理はしない
        if (filteredParams.length === 0) {
            // killなパラメータの検査
            if (killers && killers.length > 0 && killers != "") {
                // killなパラメータの検査
                filteredParams = params.filter(function(val, index, array) {
                    var paramName = val[0];
                    for (var i = 0,len = killers.length; i < len; i++) {
                        // console.log(paramName + " << Name -kill " + killers[i] + " - " + killers.length);
                        // パラーメータ名とkillが違うものは残る
                        if (paramName === killers[i]) {
                            return false;
                        }
                    }
                    return true;// 一個もマッチしなかったら残すパラメーター
                });
            }
        }
        // console.log(filteredParams + "<< filteredParams");
        if (filteredParams.length == 0) {
            return getParamsReplaceStr(url, '')
        } else {
            return getParamsReplaceStr(url, '?' + paramsJoin(filteredParams))
        }
    }
}
