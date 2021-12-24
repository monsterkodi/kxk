// monsterkodi/kode 0.211.0

var _k_ = {extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, clone: function (o,v) { v ??= new Map(); if (o instanceof Array) { if (!v.has(o)) {var r = []; v.set(o,r); for (var i=0; i < o.length; i++) {if (!v.has(o[i])) { v.set(o[i],_k_.clone(o[i],v)) }; r.push(v.get(o[i]))}}; return v.get(o) } else if (typeof o == 'string') { if (!v.has(o)) {v.set(o,''+o);}; return v.get(o) } else if (typeof o == 'object' && o.constructor.name == 'Object') { if (!v.has(o)) {var r = {}; v.set(o,r); for (k in o) {if (!v.has(o[k])) { v.set(o[k],_k_.clone(o[k],v)) }; r[k] = v.get(o[k])}; }; return v.get(o) } else {return o} }}

var atomic, Emitter, kerror, kxk, post, sds, slash, Store, _

kxk = require('./kxk')
_ = kxk._
atomic = kxk.atomic
kerror = kxk.kerror
noon = kxk.noon
post = kxk.post
sds = kxk.sds
slash = kxk.slash

Emitter = require('events')

Store = (function ()
{
    _k_.extend(Store, Emitter)
    Store["stores"] = {}
    Store["addStore"] = function (store)
    {
        if (_k_.empty(this.stores))
        {
            post.onGet('store',(function (name, action)
            {
                switch (action)
                {
                    case 'data':
                        return (this.stores[name] != null ? this.stores[name].data : undefined)

                }

            }).bind(this))
        }
        return this.stores[store.name] = store
    }

    function Store (name, opt = {})
    {
        var electron, _35_22_, _36_22_, _49_32_, _75_62_

        this["save"] = this["save"].bind(this)
        Store.__super__.constructor.call(this)
        this.name = name
        opt.separator = ((_35_22_=opt.separator) != null ? _35_22_ : ':')
        opt.timeout = ((_36_22_=opt.timeout) != null ? _36_22_ : 4000)
        if (!this.name)
        {
            return kerror('no name for store?')
        }
        electron = require('electron')
        this.app = electron.app
        this.sep = opt.separator
        if (this.app)
        {
            Store.addStore(this)
            this.timer = null
            this.file = ((_49_32_=opt.file) != null ? _49_32_ : slash.join(post.get('userData'),`${this.name}.noon`))
            this.timeout = opt.timeout
            post.on('store',(function (name, action, ...argl)
            {
                if (this.name !== name)
                {
                    return
                }
                switch (action)
                {
                    case 'set':
                        this.set.apply(this,argl)
                        break
                    case 'get':
                        this.get.apply(this,argl)
                        break
                    case 'del':
                        this.del.apply(this,argl)
                        break
                    case 'clear':
                        this.clear()
                        break
                    case 'save':
                        this.save()
                        break
                }

                return this
            }).bind(this))
        }
        else
        {
            this.file = slash.join(post.get('userData'),`${this.name}.noon`)
            post.on('store',(function (name, action, ...argl)
            {
                if (this.name !== name)
                {
                    return
                }
                switch (action)
                {
                    case 'data':
                        return this.data = argl[0]

                    case 'set':
                        return sds.set(this.data,this.keypath(argl[0]),argl[1])

                    case 'get':
                        return sds.get(this.data,this.keypath(argl[0]),argl[1])

                    case 'del':
                        return sds.del(this.data,this.keypath(argl[0]))

                }

            }).bind(this))
        }
        this.data = this.load()
        if ((opt.defaults != null))
        {
            this.data = _.defaults(this.data,opt.defaults)
        }
    }

    Store.prototype["keypath"] = function (key)
    {
        return key.split(this.sep)
    }

    Store.prototype["get"] = function (key, value)
    {
        var _87_45_

        if (!((key != null ? key.split : undefined) != null))
        {
            return _k_.clone((value))
        }
        return _k_.clone(sds.get(this.data,this.keypath(key),value))
    }

    Store.prototype["set"] = function (key, value)
    {
        var _101_14_, _98_32_

        if (!((key != null ? key.split : undefined) != null))
        {
            return
        }
        if (_.isEqual(this.get(key),value))
        {
            return
        }
        this.data = ((_101_14_=this.data) != null ? _101_14_ : {})
        sds.set(this.data,this.keypath(key),value)
        if (this.app)
        {
            clearTimeout(this.timer)
            this.timer = setTimeout(this.save,this.timeout)
            return post.toWins('store',this.name,'set',key,value)
        }
        else
        {
            return post.toMain('store',this.name,'set',key,value)
        }
    }

    Store.prototype["del"] = function (key)
    {
        if (!this.data)
        {
            return
        }
        sds.del(this.data,this.keypath(key))
        if (this.app)
        {
            clearTimeout(this.timer)
            this.timer = setTimeout(this.save,this.timeout)
            return post.toWins('store',this.name,'del',key)
        }
        else
        {
            return post.toMain('store',this.name,'del',key)
        }
    }

    Store.prototype["clear"] = function ()
    {
        this.data = {}
        if (this.app)
        {
            if (this.timer)
            {
                clearTimeout(this.timer)
            }
            return post.toWins('store',this.name,'data',{})
        }
        else
        {
            return post.toMain('store',this.name,'clear')
        }
    }

    Store.prototype["reload"] = function ()
    {
        if (this.app)
        {
            this.data = this.load()
            return post.toWins('store',this.name,'data',this.data)
        }
    }

    Store.prototype["load"] = function ()
    {
        var d

        if (this.app)
        {
            try
            {
                d = noon.load(this.file)
                if ((function(o){return !(o == null || typeof o != 'object' || o.constructor.name !== 'Object')})(d))
                {
                    return d
                }
                return {}
            }
            catch (err)
            {
                return {}
            }
        }
        else
        {
            return post.get('store',this.name,'data')
        }
    }

    Store.prototype["save"] = function ()
    {
        if (this.app)
        {
            if (!this.file)
            {
                return
            }
            if (_k_.empty(this.data))
            {
                return
            }
            this.emit('willSave')
            clearTimeout(this.timer)
            this.timer = null
            try
            {
                atomic.sync(this.file,noon.stringify(this.data,{indent:2,maxalign:8}) + '\n')
            }
            catch (err)
            {
                kerror(`store.save -- can't save to '${this.file}:`,err)
            }
            return this.emit('didSave')
        }
        else
        {
            return post.toMain('store',this.name,'save')
        }
    }

    return Store
})()

module.exports = Store