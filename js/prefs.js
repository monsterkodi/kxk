// monsterkodi/kode 0.195.0

var _k_

var fs, kerror, klog, slash, store, _

_ = require('./kxk')._
fs = require('./kxk').fs
kerror = require('./kxk').kerror
klog = require('./kxk').klog
slash = require('./kxk').slash
store = require('./kxk').store

class Prefs
{
    static store = null

    static watcher = null

    static init (opt = {})
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

    static unwatch ()
    {
        var _26_32_, _28_16_

        if (!(this.store.app != null))
        {
            return
        }
        ;(this.watcher != null ? this.watcher.close() : undefined)
        return this.watcher = null
    }

    static watch ()
    {
        var _33_32_

        if (!(this.store.app != null))
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

    static onFileChange ()
    {
        return this.store.reload()
    }

    static onFileUnlink ()
    {
        this.unwatch()
        return this.store.clear()
    }

    static get (key, value)
    {
        if (this.store)
        {
            return this.store.get(key,value)
        }
        else
        {
            return _.cloneDeep(value)
        }
    }

    static set (key, value)
    {
        this.unwatch()
        this.store.set(key,value)
        return this.watch()
    }

    static del (key, value)
    {
        this.unwatch()
        this.store.del(key)
        return this.watch()
    }

    static save ()
    {
        var _54_33_

        return (this.store != null ? this.store.save() : undefined)
    }

    static toggle (key, cb)
    {
        var val

        val = !this.get(key,false)
        this.set(key,val)
        return (typeof cb === "function" ? cb(val) : undefined)
    }

    static apply (key, deflt = false, cb)
    {
        if (!(cb != null) && deflt !== false)
        {
            cb = deflt
        }
        return (typeof cb === "function" ? cb(this.get(key,deflt)) : undefined)
    }
}

module.exports = Prefs