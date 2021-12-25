// monsterkodi/kode 0.223.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var klog


klog = function ()
{
    var kstr, s

    kstr = require('./kxk').kstr

    s = (function () { var _116__23_ = []; var list = _k_.list([].slice.call(arguments,0)); for (var _116_23_ = 0; _116_23_ < list.length; _116_23_++)  { s = list[_116_23_];_116__23_.push(kstr(s))  } return _116__23_ }).bind(this)().join(" ")
    return console.log(s)
}
module.exports = klog