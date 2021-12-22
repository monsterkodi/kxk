// monsterkodi/kode 0.187.0

var _k_ = {noon: function (obj) { var pad = function (s, l) { while (s.length < l) { s += ' ' }; return s }; var esc = function (k, arry) { var es, sp; if (0 <= k.indexOf('\n')) { sp = k.split('\n'); es = sp.map(function (s) { return esc(s,arry) }); es.unshift('...'); es.push('...'); return es.join('\n') } if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|'])) { k = '|' + k + '|' } else if (arry && /  /.test(k)) { k = '|' + k + '|' }; return k }; var pretty = function (o, ind, seen) { var k, kl, l, v, mk = 4; if (Object.keys(o).length > 1) { for (k in o) { v = o[k]; if (o.hasOwnProperty(k)) { kl = parseInt(Math.ceil((k.length + 2) / 4) * 4); mk = Math.max(mk,kl); if (mk > 32) { mk = 32; break } } } }; l = []; var keyValue = function (k, v) { var i, ks, s, vs; s = ind; k = esc(k,true); if (k.indexOf('  ') > 0 && k[0] !== '|') { k = `|${k}|` } else if (k[0] !== '|' && k[k.length - 1] === '|') { k = '|' + k } else if (k[0] === '|' && k[k.length - 1] !== '|') { k += '|' }; ks = pad(k,Math.max(mk,k.length + 2)); i = pad(ind + '    ',mk); s += ks; vs = toStr(v,i,false,seen); if (vs[0] === '\n') { while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) } }; s += vs; while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) }; return s }; for (k in o) { v = o[k]; if (o.hasOwnProperty(k)) { l.push(keyValue(k,v)) } }; return l.join('\n') }; var toStr = function (o, ind = '', arry = false, seen = []) { var s, t, v; if (!(o != null)) { if (o === null) { return 'null' }; if (o === undefined) { return 'undefined' }; return '<?>' }; switch (t = typeof(o)) { case 'string': {return esc(o,arry)}; case 'object': { if (_k_.in(o,seen)) { return '<v>' }; seen.push(o); if ((o.constructor != null ? o.constructor.name : undefined) === 'Array') { s = ind !== '' && arry && '.' || ''; if (o.length && ind !== '') { s += '\n' }; s += (function () { var result = []; var list = _k_.list(o); for (var li = 0; li < list.length; li++)  { v = list[li];result.push(ind + toStr(v,ind + '    ',true,seen))  } return result }).bind(this)().join('\n') } else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp') { return o.source } else { s = (arry && '.\n') || ((ind !== '') && '\n' || ''); s += pretty(o,ind,seen) }; return s } default: return String(o) }; return '<???>' }; return toStr(obj) }, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var atomic, childp, crypto, fs, k, karg, klor, kstr, noon, open, os, post, sds, slash, walkdir, _

childp = require('child_process')
crypto = require('crypto')
_ = require('lodash')
os = require('os')
noon = require('noon')
sds = require('sds')
fs = require('fs-extra')
open = require('opener')
walkdir = require('walkdir')
atomic = require('write-file-atomic')
post = require('./ppost')
slash = require('kslash')
karg = require('karg')
kstr = require('kstr')
klor = require('klor')
module.exports = {_:_,os:os,fs:fs,sds:sds,karg:karg,kstr:kstr,klor:klor,kolor:klor.kolor,atomic:atomic,walkdir:walkdir,open:open,post:post,slash:slash,noon:_k_.noon({childp:childp,def:function (c, d)
{
    if ((c != null))
    {
        return _.defaults(_.clone(c),d)
    }
    else if ((d != null))
    {
        return _.clone(d)
    }
    else
    {
        return {}
    }
},filter:function (o, f)
{
    if (_.isArray(o))
    {
        return _.filter(o,f)
    }
    else if (_.isObject(o))
    {
        return _.pickBy(o,f)
    }
    else
    {
        return o
    }
},clamp:function (r1, r2, v)
{
    var s1, s2

    if (!_.isFinite(v))
    {
        v = r1
    }
    var _81_17_ = [Math.min(r1,r2),Math.max(r1,r2)] ; s1 = _81_17_[0]    ; s2 = _81_17_[1]

    if (v < s1)
    {
        v = s1
    }
    if (v > s2)
    {
        v = s2
    }
    if (!_.isFinite(v))
    {
        v = r1
    }
    return v
},fadeAngles:function (a, b, f)
{
    if (a - b > 180)
    {
        a -= 360
    }
    else if (a - b < -180)
    {
        a += 360
    }
    return (1 - f) * a + f * b
},reduce:function (v, d)
{
    if (v >= 0)
    {
        return Math.max(0,v - d)
    }
    else
    {
        return Math.min(0,v + d)
    }
},fade:function (s, e, v)
{
    return s * (1 - v) + e * (v)
},last:function (a)
{
    return _.last(a)
},first:function (a)
{
    return _.first(a)
},absMax:function (a, b)
{
    if (Math.abs(a) >= Math.abs(b))
    {
        return a
    }
    else
    {
        return b
    }
},absMin:function (a, b)
{
    if (Math.abs(a) < Math.abs(b))
    {
        return a
    }
    else
    {
        return b
    }
},randInt:function (r)
{
    return Math.floor(Math.random() * r)
},randIntRange:function (l, h)
{
    return Math.floor(l + Math.random() * (h - l))
},randRange:function (l, h)
{
    return l + Math.random() * (h - l)
},shortCount:function (v)
{
    v = parseInt(v)
    if (v > 999999)
    {
        return `${Math.floor(v / 1000000)}M`
    }
    else if (v > 999)
    {
        return `${Math.floor(v / 1000)}k`
    }
    else
    {
        return `${v}`
    }
},rad2deg:function (r)
{
    return 180 * r / Math.PI
},deg2rad:function (d)
{
    return Math.PI * d / 180
},reversed:function (a)
{
    return _.clone(a).reverse()
},chai:function ()
{
    var chai

    chai = require('chai')
    chai.should()
    chai.util.getMessage = function (obj, args)
    {
        var msg

        msg = chai.util.flag(obj,'negate') && args[2] || args[1]
        if (typeof(msg) === "function")
        {
            msg = msg()
        }
        msg = (msg != null ? msg : '')
        return msg.replace(/#\{this\}/g,function ()
        {
            return yellow(bold('\n' + noon.stringify(chai.util.flag(obj,'object')) + '\n\n'.replace(/#\{act\}/g,function ()
            {
                return magenta('\n' + noon.stringify(chai.util.getActual(obj,args)) + '\n')
            }).replace(/#\{exp\}/g,function ()
            {
                return green('\n' + noon.stringify(args[3]) + '\n')
            })))
        })
    }
    return chai
},osascript:function (script)
{
    var l

    return (function () { var result = []; var list = _k_.list(script.split("\n")); for (var _136_72_ = 0; _136_72_ < list.length; _136_72_++)  { l = list[_136_72_];result.push(`-e \"${l.replace(/\"/g,"\\\"")}\"`)  } return result }).bind(this)().join(" ")
}})}
if (!String.prototype.splice)
{
    String.prototype.splice = function (start, delCount, newSubStr = '')
    {
        return this.slice(0,start) + newSubStr + this.slice(start + Math.abs(delCount))
    }
}
if (!String.prototype.strip)
{
    String.prototype.strip = String.prototype.trim
}
if (!String.prototype.hash)
{
    String.prototype.hash = function ()
    {
        return crypto.createHash('md5').update(this,.,valueOf(),'utf8').digest('hex')
    }
}
if (!Array.prototype.clone)
{
}
Array.prototype.clone = function ()
{
    this
    .
    return slice(0)
}
if (!Array.prototype.reversed)
{
    Array.prototype.reversed = function ()
    {
        this
        .
        return slice(0).reverse()
    }
}
module.exports.klog = require('./log')
module.exports.kerror = require('./error')
module.exports.kpos = require('./pos')
module.exports.args = require('./args')
var list = _k_.list(Object.keys(require('./dom')))
for (var _173_55_ = 0; _173_55_ < list.length; _173_55_++)
{
    k = list[_173_55_]
    module.exports[k] = require('./dom')[k]
}
module.exports.drag = require('./drag')
module.exports.elem = require('./elem')
module.exports.stash = require('./stash')
module.exports.store = require('./store')
module.exports.prefs = require('./prefs')
module.exports.filelist = require('./filelist')
module.exports.keyinfo = require('./keyinfo')
module.exports.gamepad = require('./gamepad')
module.exports.history = require('./history')
module.exports.scheme = require('./scheme')
module.exports.about = require('./about')
module.exports.popup = require('./popup')
module.exports.menu = require('./menu')
module.exports.title = require('./title')
module.exports.matchr = require('./matchr')
module.exports.tooltip = require('./tooltip')
module.exports.srcmap = require('./srcmap')
module.exports.watch = require('./watch')
module.exports.udp = require('./udp')
if (process.type === 'browser')
{
    module.exports.app = require('./app')
}
else if (process.type === 'renderer')
{
    module.exports.win = require('./win')
}