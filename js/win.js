// monsterkodi/kode 0.223.0

var _k_ = {dbg: function (f,l,c,m,...a) { console.log(f + ':' + l + ':' + c + (m ? ' ' + m + '\n' : '\n') + a.map(function (a) { return _k_.noon(a) }).join(' '))}, clone: function (o,v) { v ??= new Map(); if (o instanceof Array) { if (!v.has(o)) {var r = []; v.set(o,r); for (var i=0; i < o.length; i++) {if (!v.has(o[i])) { v.set(o[i],_k_.clone(o[i],v)) }; r.push(v.get(o[i]))}}; return v.get(o) } else if (typeof o == 'string') { if (!v.has(o)) {v.set(o,''+o)}; return v.get(o) } else if (typeof o == 'object' && o.constructor.name == 'Object') { if (!v.has(o)) { var k, r = {}; v.set(o,r); for (k in o) { if (!v.has(o[k])) { v.set(o[k],_k_.clone(o[k],v)) }; r[k] = v.get(o[k]) }; }; return v.get(o) } else {return o} }, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined, noon: function (obj) { var pad = function (s, l) { while (s.length < l) { s += ' ' }; return s }; var esc = function (k, arry) { var es, sp; if (0 <= k.indexOf('\n')) { sp = k.split('\n'); es = sp.map(function (s) { return esc(s,arry) }); es.unshift('...'); es.push('...'); return es.join('\n') } if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|'])) { k = '|' + k + '|' } else if (arry && /  /.test(k)) { k = '|' + k + '|' }; return k }; var pretty = function (o, ind, seen) { var k, kl, l, v, mk = 4; if (Object.keys(o).length > 1) { for (k in o) { if (Object.hasOwn(o,k)) { kl = parseInt(Math.ceil((k.length + 2) / 4) * 4); mk = Math.max(mk,kl); if (mk > 32) { mk = 32; break } } } }; l = []; var keyValue = function (k, v) { var i, ks, s, vs; s = ind; k = esc(k,true); if (k.indexOf('  ') > 0 && k[0] !== '|') { k = `|${k}|` } else if (k[0] !== '|' && k[k.length - 1] === '|') { k = '|' + k } else if (k[0] === '|' && k[k.length - 1] !== '|') { k += '|' }; ks = pad(k,Math.max(mk,k.length + 2)); i = pad(ind + '    ',mk); s += ks; vs = toStr(v,i,false,seen); if (vs[0] === '\n') { while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) } }; s += vs; while (s[s.length - 1] === ' ') { s = s.substr(0,s.length - 1) }; return s }; for (k in o) { if (Object.hasOwn(o,k)) { l.push(keyValue(k,o[k])) } }; return l.join('\n') }; var toStr = function (o, ind = '', arry = false, seen = []) { var s, t, v; if (!(o != null)) { if (o === null) { return 'null' }; if (o === undefined) { return 'undefined' }; return '<?>' }; switch (t = typeof(o)) { case 'string': {return esc(o,arry)}; case 'object': { if (_k_.in(o,seen)) { return '<v>' }; seen.push(o); if ((o.constructor != null ? o.constructor.name : undefined) === 'Array') { s = ind !== '' && arry && '.' || ''; if (o.length && ind !== '') { s += '\n' }; s += (function () { var result = []; var list = _k_.list(o); for (var li = 0; li < list.length; li++)  { v = list[li];result.push(ind + toStr(v,ind + '    ',true,seen))  } return result }).bind(this)().join('\n') } else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp') { return o.source } else { s = (arry && '.\n') || ((ind !== '') && '\n' || ''); s += pretty(o,ind,seen) }; return s } default: return String(o) }; return '<???>' }; return toStr(obj) }, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var $, electron, keyinfo, klog, kpos, kxk, open, popup, post, prefs, scheme, slash, stopEvent, title, Win, _, _1_20_

kxk = require('./kxk')
$ = kxk.$
_ = kxk._
keyinfo = kxk.keyinfo
klog = kxk.klog
kpos = kxk.kpos
open = kxk.open
popup = kxk.popup
post = kxk.post
prefs = kxk.prefs
scheme = kxk.scheme
slash = kxk.slash
stopEvent = kxk.stopEvent
title = kxk.title

if (process.type === 'renderer')
{
    electron = require('electron')
}
else
{
    console.error(`this should be used in renderer process only! process.type: ${process.type} grandpa: ${(module.parent.parent != null ? module.parent.parent.filename : undefined)} parent: ${module.parent.filename} module: ${module.filename}`)
}

Win = (function ()
{
    function Win (opt)
    {
        var sep, _30_34_, _48_19_

        this.opt = opt
    
        this["onKeyUp"] = this["onKeyUp"].bind(this)
        this["onKeyDown"] = this["onKeyDown"].bind(this)
        this["onContextMenu"] = this["onContextMenu"].bind(this)
        this["onMenuAction"] = this["onMenuAction"].bind(this)
        this["onMoved"] = this["onMoved"].bind(this)
        sep = ((_30_34_=this.opt.prefsSeperator) != null ? _30_34_ : '▸')
        prefs.init({separator:sep})
        this.id = window.winID = electron.ipcRenderer.sendSync('getWinID')
        window.win = this
        this.modifiers = ''
        this.userData = post.get('userData')
        post.on('menuAction',this.onMenuAction)
        post.on('winMoved',this.onMoved)
        this.opt.title = ((_48_19_=this.opt.title) != null ? _48_19_ : process.argv[0].endsWith('Electron Helper') && ['version'] || [])
        window.titlebar = new title(this.opt)
        if (this.opt.context !== false)
        {
            document.body.addEventListener('contextmenu',this.onContextMenu)
        }
        if (!this.opt.nokeys)
        {
            document.addEventListener('keydown',this.onKeyDown)
            document.addEventListener('keyup',this.onKeyUp)
        }
        if (this.opt.scheme !== false)
        {
            scheme.set(prefs.get('scheme','dark'))
        }
    }

    Win.prototype["getBounds"] = function ()
    {
        return electron.ipcRenderer.sendSync('getWinBounds')
    }

    Win.prototype["setBounds"] = function (b)
    {
        return electron.ipcRenderer.send('setWinBounds',b)
    }

    Win.prototype["onMoved"] = function ()
    {}

    Win.prototype["onMenuAction"] = function (action, args)
    {
        _k_.dbg("kode/win.kode", 84, 8, null, 'win onMenuAction',action,args)
        switch (action.toLowerCase())
        {
            case 'preferences':
                return open(prefs.store.file)

        }

        electron.ipcRenderer.send('menuAction',action)
        return 'unhandled'
    }

    Win.prototype["onContextMenu"] = function (event)
    {
        var absPos, items, _100_12_

        ;(this.win != null ? this.win.focus() : undefined)
        absPos = kpos(event)
        if (!(absPos != null))
        {
            absPos = kpos($("#main").getBoundingClientRect().left,$("#main").getBoundingClientRect().top)
        }
        items = _k_.clone(window.titlebar.menuTemplate())
        if (typeof(this.opt.context) === 'function')
        {
            items = this.opt.context(items)
            if (_k_.empty(items))
            {
                return
            }
        }
        else
        {
            items.unshift({text:'Clear',accel:'cmdctrl+k'})
        }
        return popup.menu({items:items,x:absPos.x,y:absPos.y,onClose:function ()
        {
            return post.emit('contextClosed')
        }})
    }

    Win.prototype["openFileDialog"] = function (options)
    {
        var cb, _123_22_

        options.title = ((_123_22_=options.title) != null ? _123_22_ : 'Open File')
        cb = options.cb
        delete options.cb
        post.toMain('openFileDialog',options)
        if (typeof(cb) === 'function')
        {
            return post.once('openFileDialogResult',function (r)
            {
                if (!r.cancelled && !_k_.empty(r.filePaths))
                {
                    return cb(r.filePaths)
                }
            })
        }
    }

    Win.prototype["saveFileDialog"] = function (options)
    {
        var cb, _132_22_

        options.title = ((_132_22_=options.title) != null ? _132_22_ : 'Save File')
        cb = options.cb
        delete options.cb
        post.toMain('saveFileDialog',options)
        if (typeof(cb) === 'function')
        {
            return post.once('saveFileDialogResult',function (r)
            {
                if (!r.cancelled && !_k_.empty(r.filePath))
                {
                    return cb(r.filePath)
                }
            })
        }
    }

    Win.prototype["messageBox"] = function (options)
    {
        var cb, _141_26_, _142_26_, _143_26_, _144_26_, _145_26_, _146_26_, _147_26_

        options.type = ((_141_26_=options.type) != null ? _141_26_ : 'warning')
        options.buttons = ((_142_26_=options.buttons) != null ? _142_26_ : ['Ok'])
        options.defaultId = ((_143_26_=options.defaultId) != null ? _143_26_ : 0)
        options.cancelId = ((_144_26_=options.cancelId) != null ? _144_26_ : 0)
        options.title = ((_145_26_=options.title) != null ? _145_26_ : '')
        options.message = ((_146_26_=options.message) != null ? _146_26_ : 'no message!')
        options.detail = ((_147_26_=options.detail) != null ? _147_26_ : 'no details!')
        cb = options.cb
        delete options.cb
        post.toMain('messageBox',options)
        if (typeof(cb) === 'function')
        {
            return post.once('messageBoxResult',function (r)
            {
                return cb(r)
            })
        }
    }

    Win.prototype["onKeyDown"] = function (event)
    {
        var info

        if ('unhandled' !== window.titlebar.handleKey(event,true))
        {
            return stopEvent(event)
        }
        info = keyinfo.forEvent(event)
        this.modifiers = info.mod
        info.event = event
        return post.emit('combo',info.combo,info)
    }

    Win.prototype["onKeyUp"] = function (event)
    {
        var info

        info = keyinfo.forEvent(event)
        return this.modifiers = info.mod
    }

    return Win
})()

module.exports = Win