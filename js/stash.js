// monsterkodi/kode 0.187.0

var _k_

var fs, kerror, post, sds, slash, _

_ = require('./kxk')._
fs = require('./kxk').fs
kerror = require('./kxk').kerror
noon = require('./kxk').noon
post = require('./kxk').post
sds = require('./kxk').sds
slash = require('./kxk').slash

class Stash
{
    constructor (name, opt)
    {
        var _20_30_, _22_40_, _23_32_, _29_63_

        this.name = name
        this.save = this.save.bind(this)
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

    keypath (key)
    {
        return key.split(this.sep)
    }

    get (key, value)
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

    set (key, value)
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

    del (key)
    {
        return this.set(key)
    }

    clear ()
    {
        this.data = {}
        clearTimeout(this.timer)
        this.timer = null
        return fs.removeSync(this.file)
    }

    load ()
    {
        try
        {
            return noon.load(this.file)
        }
        catch (err)
        {
            return {}
        }
    }

    save ()
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
            if (!err)
            {
                text = noon.stringify(this.data,{indent:2,maxalign:8})
                return slash.writeText(this.file,text,function (p)
                {
                    return post.toMain('stashSaved')
                })
            }
        }
        catch (err)
        {
            return kerror(`stash.save -- can't save to '${this.file}': ${err}`)
        }
    }
}

module.exports = Stash