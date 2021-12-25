// monsterkodi/kode 0.223.0

var _k_ = {noon: function (obj) { var pad = function (s, l) { while (s.length < l) { s += ' ' }; return s }; var esc = function (k, arry) { var es, sp; if (0 <= k.indexOf('\n')) { sp = k.split('\n'); es = sp.map(function (s) { return esc(s,arry) }); es.unshift('...'); es.push('...'); return es.join('\n') } if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|'])) { k = '|' + k + '|' } else if (arry && /  /.test(k)) { k = '|' + k + '|' }; return k }; var pretty = function (o, ind, seen) { var k, kl, l, v, mk = 4; if (Object.keys(o).length > 1) { for (k in o) { if (Object.hasOwn(o,k)) { kl = parseInt(Math.ceil((k.length + 2) / 4) * 4); mk = Math.max(mk,kl); if (mk > 32) { mk = 32; break } } } }; l = []; var keyValue = function (k, v) { var i, ks, s, vs; s = ind; k = esc(k,true); if (k.indexOf('  ') > 0 && k[0] !== '|') { k = `|${k}|` } else if (k[0] !== '|' && k[k.length - 1] === '|') { k = '|' + k } else if (k[0] === '|' && k[k.length - 1] !== '|') { k += '|' }; ks = pad(k,Math.max(mk,k.length + 2)); i = pad(ind + '    ',mk); s += ks; vs = toStr(v,i,false,seen); if (vs[0] === '\n') { while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) } }; s += vs; while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) }; return s }; for (k in o) { if (Object.hasOwn(o,k)) { l.push(keyValue(k,o[k])) } }; return l.join('\n') }; var toStr = function (o, ind = '', arry = false, seen = []) { var s, t, v; if (!(o != null)) { if (o === null) { return 'null' }; if (o === undefined) { return 'undefined' }; return '<?>' }; switch (t = typeof(o)) { case 'string': {return esc(o,arry)}; case 'object': { if (_k_.in(o,seen)) { return '<v>' }; seen.push(o); if ((o.constructor != null ? o.constructor.name : undefined) === 'Array') { s = ind !== '' && arry && '.' || ''; if (o.length && ind !== '') { s += '\n' }; s += (function () { var result = []; var list = _k_.list(o); for (var li = 0; li < list.length; li++)  { v = list[li];result.push(ind + toStr(v,ind + '    ',true,seen))  } return result }).bind(this)().join('\n') } else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp') { return o.source } else { s = (arry && '.\n') || ((ind !== '') && '\n' || ''); s += pretty(o,ind,seen) }; return s } default: return String(o) }; return '<???>' }; return toStr(obj) }, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var fs, kerror, post, sds, slash, Stash, _

_ = require('./kxk')._
fs = require('./kxk').fs
kerror = require('./kxk').kerror
noon = require('./kxk').noon
post = require('./kxk').post
sds = require('./kxk').sds
slash = require('./kxk').slash


Stash = (function ()
{
    function Stash (name, opt)
    {
        var _20_30_, _22_40_, _23_32_, _29_63_

        this.name = name
    
        this["save"] = this["save"].bind(this)
        if (!this.name)
        {
            return kerror('stash.constructor -- no name?')
        }
        this.sep = ((_20_30_=(opt != null ? opt.separator : undefined)) != null ? _20_30_ : ':')
        this.timer = null
        this.file = slash.path(((_22_40_=(opt != null ? opt.file : undefined)) != null ? _22_40_ : `${post.get('userData')}/${this.name}.noon`))
        this.timeout = ((_23_32_=(opt != null ? opt.timeout : undefined)) != null ? _23_32_ : 4000)
        this.changes = []
        fs.ensureDir(slash.dir(this.file),function ()
        {})
        this.data = this.load()
        if (((opt != null ? opt.defaults : undefined) != null))
        {
            this.data = _.defaults(this.data,opt.defaults)
        }
    }

    Stash.prototype["keypath"] = function (key)
    {
        return key.split(this.sep)
    }

    Stash.prototype["get"] = function (key, value)
    {
        var _40_64_, _41_38_

        if (!((key != null ? key.split : undefined) != null))
        {
            kerror('stash.get -- invalid key',key)
        }
        if (!((key != null ? key.split : undefined) != null))
        {
            return value
        }
        return sds.get(this.data,this.keypath(key),value)
    }

    Stash.prototype["set"] = function (key, value)
    {
        var _52_71_

        if (!((key != null ? key.split : undefined) != null))
        {
            return kerror('stash.set -- invalid key',key)
        }
        sds.set(this.data,this.keypath(key),value)
        if (this.timer)
        {
            clearTimeout(this.timer)
        }
        return this.timer = setTimeout(this.save,this.timeout)
    }

    Stash.prototype["del"] = function (key)
    {
        return this.set(key)
    }

    Stash.prototype["clear"] = function ()
    {
        this.data = {}
        clearTimeout(this.timer)
        this.timer = null
        return fs.removeSync(this.file)
    }

    Stash.prototype["load"] = function ()
    {
        return noon.load(this.file)
    }

    Stash.prototype["save"] = function ()
    {
        var text

        if (!this.file)
        {
            return
        }
        clearTimeout(this.timer)
        this.timer = null
        try
        {
            text = _k_.noon(this.data)
            return slash.writeText(this.file,text,function (p)
            {
                return post.toMain('stashSaved')
            })
        }
        catch (err)
        {
            return kerror(`stash.save -- can't save to '${this.file}': ${err}`)
        }
    }

    return Stash
})()

module.exports = Stash