// monsterkodi/kode 0.196.0

var _k_ = {extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var atomic, Emitter, kerror, post, sds, slash, Store, _

_ = require('./kxk')._
atomic = require('./kxk').atomic
kerror = require('./kxk').kerror
noon = require('./kxk').noon
post = require('./kxk').post
sds = require('./kxk').sds
slash = require('./kxk').slash

Emitter = require('events')

Store = (function ()
{
    _k_.extend(Store, Emitter);

    Store["addStore"] = function (store)
    {
        if (_.isEmpty(this.stores))
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
        var electron, _34_22_, _35_22_, _48_32_, _74_62_

        this["save"] = this["save"].bind(this)
        Store.__super__.constructor.call(this)
        this.name = name
        opt.separator = ((_34_22_=opt.separator) != null ? _34_22_ : ':')
        opt.timeout = ((_35_22_=opt.timeout) != null ? _35_22_ : 4000)
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
            this.file = ((_48_32_=opt.file) != null ? _48_32_ : slash.join(post.get('userData'),`${this.name}.noon`))
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
        return Store.__super__.constructor.apply(this, arguments)
    }

    Store.prototype["keypath"] = function (key)
    {
        return key.split(this.sep)
    }

    Store.prototype["get"] = function (key, value)
    {
        var _86_51_

        if (!((key != null ? key.split : undefined) != null))
        {
            return _.cloneDeep(value)
        }
        return _.cloneDeep(sds.get(this.data,this.keypath(key),value))
    }

    Store.prototype["set"] = function (key, value)
    {
        var _100_14_, _97_32_

        if (!((key != null ? key.split : undefined) != null))
        {
            return
        }
        if (_.isEqual(this.get(key),value))
        {
            return
        }
        this.data = ((_100_14_=this.data) != null ? _100_14_ : {})
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
                if (_.isPlainObject(d))
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
            if (_.isEmpty(this.data))
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