var {Cc, Ci} = require("chrome");
var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService)

exports.log = function(msg) {
    consoleService.logStringMessage(msg)
}
