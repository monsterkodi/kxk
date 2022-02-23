// monsterkodi/kode 0.211.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var klog


klog = function ()
{
    var a, kstr, s

    kstr = require('kstr')
    a = [].slice.call(arguments,0)
    s = (function () { var result = []; var list = _k_.list(a); for (var _117_23_ = 0; _117_23_ < list.length; _117_23_++)  { s = list[_117_23_];result.push(kstr(s))  } return result }).bind(this)().join(" ")
    console.log(s)
}
module.exports = klog