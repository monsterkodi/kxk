// monsterkodi/kode 0.208.0

var _k_ = {clone: function (o,v) { v ??= new Map(); if (o instanceof Array) { if (!v.has(o)) {var r = []; v.set(o,r); for (var i=0; i < o.length; i++) {if (!v.has(o[i])) { v.set(o[i],_k_.clone(o[i],v)) }; r.push(v.get(o[i]))}}; return v.get(o) } else if (typeof o == 'string') { if (!v.has(o)) {v.set(o,''+o);}; return v.get(o) } else if (typeof o == 'object' && o.constructor.name == 'Object') { if (!v.has(o)) {var r = {}; v.set(o,r); for (k in o) {if (!v.has(o[k])) { v.set(o[k],_k_.clone(o[k],v)) }; r[k] = v.get(o[k])}; }; return v.get(o) } else {return o} }}

var fs, kerror, klog, Prefs, slash, store

fs = require('./kxk').fs
kerror = require('./kxk').kerror
klog = require('./kxk').klog
slash = require('./kxk').slash
store = require('./kxk').store


Prefs = (function ()
{
    function Prefs ()
    {}

    Prefs["store"] = null
    Prefs["watcher"] = null
    Prefs["init"] = function (opt = {})
    {
        var _18_64_

        if ((this.store != null))
        {
            return console.error('prefs.init -- duplicate stores?')
        }
        this.store = new store('prefs',opt)
        this.store.on('willSave',this.unwatch)
        this.store.on('didSave',this.watch)
        return this.watch()
    }

    Prefs["unwatch"] = function ()
    {
        var _28_28_, _28_33_, _30_16_

        if (!((this.store != null ? this.store.app : undefined) != null))
        {
            return
        }
        ;(this.watcher != null ? this.watcher.close() : undefined)
        return this.watcher = null
    }

    Prefs["watch"] = function ()
    {
        var _35_28_, _35_33_

        if (!((this.store != null ? this.store.app : undefined) != null))
        {
            return
        }
        slash.error = klog
        if (slash.touch(this.store.file))
        {
            this.unwatch()
            this.watcher = fs.watch(this.store.file)
            this.watcher.on('change',this.onFileChange)
            this.watcher.on('rename',this.onFileUnlink)
            this.watcher.on('error',function (err)
            {
                return kerror('Prefs watch error',err)
            })
        }
        else
        {
            kerror(`can't touch prefs file ${this.store.file}`)
        }
        return this.watcher
    }

    Prefs["onFileChange"] = function ()
    {
        var _50_28_

        return (this.store != null ? this.store.reload() : undefined)
    }

    Prefs["onFileUnlink"] = function ()
    {
        var _51_40_

        this.unwatch()
        return (this.store != null ? this.store.clear() : undefined)
    }

    Prefs["get"] = function (key, value)
    {
        if (this.store)
        {
            return this.store.get(key,value)
        }
        else
        {
            return _k_.clone(value)
        }
    }

    Prefs["set"] = function (key, value)
    {
        var _54_45_

        this.unwatch()
        ;(this.store != null ? this.store.set(key,value) : undefined)
        return this.watch()
    }

    Prefs["del"] = function (key, value)
    {
        var _55_45_

        this.unwatch()
        ;(this.store != null ? this.store.del(key) : undefined)
        return this.watch()
    }

    Prefs["save"] = function ()
    {
        var _56_33_

        return (this.store != null ? this.store.save() : undefined)
    }

    Prefs["toggle"] = function (key, cb)
    {
        var val

        val = !this.get(key,false)
        this.set(key,val)
        return (typeof cb === "function" ? cb(val) : undefined)
    }

    Prefs["apply"] = function (key, deflt = false, cb)
    {
        if (!(cb != null) && deflt !== false)
        {
            cb = deflt
        }
        return (typeof cb === "function" ? cb(this.get(key,deflt)) : undefined)
    }

    return Prefs
})()

module.exports = Prefs