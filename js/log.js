// monsterkodi/kode 0.208.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var klog


klog = function ()
{
    var kstr, s

    kstr = require('./kxk').kstr

    s = (function () { var result = []; var list = _k_.list([].slice.call(arguments,0)); for (var _116_23_ = 0; _116_23_ < list.length; _116_23_++)  { s = list[_116_23_];result.push(kstr(s))  } return result }).bind(this)().join(" ")
    return console.log(s)
}
module.exports = klog