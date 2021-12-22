// monsterkodi/kode 0.196.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}


module.exports = function ()
{
    var kxk, s, _16_12_

    kxk = require('./kxk')
    s = '[ERROR] ' + (function () { var result = []; var list = _k_.list([].slice.call(arguments,0)); for (var _13_40_ = 0; _13_40_ < list.length; _13_40_++)  { s = list[_13_40_];result.push(kxk.kstr(s))  } return result }).bind(this)().join(" ")
    console.error(s)
    return (kxk.klog != null ? kxk.klog.slog(s) : undefined)
}