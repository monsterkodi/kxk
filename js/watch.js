// monsterkodi/kode 0.223.0

var _k_ = {extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var event, fs, kerror, klog, slash, walkdir, Watch

fs = require('./kxk').fs
kerror = require('./kxk').kerror
klog = require('./kxk').klog
slash = require('./kxk').slash
walkdir = require('./kxk').walkdir

event = require('events')
walkdir = require('walkdir')

Watch = (function ()
{
    _k_.extend(Watch, event)
    function Watch (path, opt)
    {
        this["onChange"] = this["onChange"].bind(this)
        Watch.__super__.constructor.call(this)
        this.dir = slash.resolve(path)
        this.opt = (opt != null ? opt : {})
        this.last = {}
        slash.exists(this.dir,(function (stat)
        {
            if (stat)
            {
                return this.watchDir()
            }
        }).bind(this))
    }

    Watch["dir"] = function (path, opt)
    {
        return new Watch(path,opt)
    }

    Watch["watch"] = function (path, opt)
    {
        if (opt.cb)
        {
            return slash.isDir(path,function (stat)
            {
                if (stat)
                {
                    return opt.cb(Watch.dir(path,opt))
                }
                else
                {
                    return opt.cb(Watch.file(path,opt))
                }
            })
        }
        else
        {
            if (slash.isDir(path))
            {
                return Watch.dir(path,opt)
            }
            else
            {
                return Watch.file(path,opt)
            }
        }
    }

    Watch["file"] = function (path, opt)
    {
        var w

        w = Watch.dir(slash.dir(path),opt)
        w.file = slash.resolve(path)
        return w
    }

    Watch.prototype["watchDir"] = function ()
    {
        var onPath

        if (!this.dir)
        {
            return
        }
        this.watch = fs.watch(this.dir)
        this.watch.on('error',(function (err)
        {
            return kerror(`watch dir:'${this.dir}' error: ${err}`)
        }).bind(this))
        this.watch.on('change',this.onChange)
        if (this.opt.recursive)
        {
            this.watchers = []
            this.walker = walkdir(this.dir)
            onPath = function (ignore)
            {
                return function (path)
                {
                    var regex

                    var list = _k_.list(ignore)
                    for (var _66_26_ = 0; _66_26_ < list.length; _66_26_++)
                    {
                        regex = list[_66_26_]
                        if (new RegExp(regex).test(path))
                        {
                            this.ignore(path)
                            return
                        }
                    }
                }
            }
            if (this.opt.ignore)
            {
                this.walker.on('path',onPath(this.opt.ignore))
            }
            return this.walker.on('directory',(function (path)
            {
                var change, watch

                if (this.ignore(path))
                {
                    return
                }
                watch = fs.watch(path)
                this.watchers.push(watch)
                change = (function (dir)
                {
                    return (function (chg, pth)
                    {
                        return this.onChange(chg,pth,dir)
                    }).bind(this)
                }).bind(this)
                watch.on('change',change(path))
                return watch.on('error',function (err)
                {
                    return kerror(`watch subdir:'${path}' error: ${err}`)
                })
            }).bind(this))
        }
    }

    Watch.prototype["ignore"] = function (path)
    {
        var regex

        if (this.opt.ignore)
        {
            var list = _k_.list(this.opt.ignore)
            for (var _91_22_ = 0; _91_22_ < list.length; _91_22_++)
            {
                regex = list[_91_22_]
                if (new RegExp(regex).test(path))
                {
                    return true
                }
            }
        }
    }

    Watch.prototype["close"] = function ()
    {
        var watch, _103_14_

        ;(this.watch != null ? this.watch.close() : undefined)
        delete this.watch
        delete this.dir
        if (this.opt.recursive)
        {
            var list = _k_.list(this.watchers)
            for (var _107_22_ = 0; _107_22_ < list.length; _107_22_++)
            {
                watch = list[_107_22_]
                watch.close()
            }
            return delete this.watchers
        }
    }

    Watch.prototype["onChange"] = function (change, path, dir = this.dir)
    {
        var clearRemove, stat, _133_48_, _139_28_, _139_68_, _139_75_

        if (this.ignore(path))
        {
            return
        }
        path = slash.join(dir,path)
        if (this.file && this.file !== path)
        {
            return
        }
        if (slash.isDir(path))
        {
            if (this.file)
            {
                klog('ignore dir',path)
                return
            }
        }
        if (stat = slash.exists(path))
        {
            if (this.opt.skipSave && path === (this.remove != null ? this.remove.path : undefined))
            {
                clearTimeout(this.remove.timer)
                clearRemove = (function ()
                {
                    return delete this.remove
                }).bind(this)
                setTimeout(clearRemove,100)
                return
            }
            if (path === (this.last != null ? this.last.path : undefined) && stat.mtime.getTime() === ((_139_68_=this.last) != null ? (_139_75_=_139_68_.mtime) != null ? _139_75_.getTime() : undefined : undefined))
            {
                return
            }
            this.last = {mtime:stat.mtime,path:path}
            return this.emit('change',{dir:dir,path:path,change:change,watch:this})
        }
        else
        {
            if (this.opt.skipSave)
            {
                return this.remove = {path:path,timer:setTimeout((function (d, p, w)
                {
                    return function ()
                    {
                        delete w.remove
                        return w.emit('change',{dir:d,path:p,change:'remove',watch:w})
                    }
                })(dir,path,this),100)}
            }
            else if (this.opt.emitRemove)
            {
                return this.emit('change',{dir:dir,path:path,change:'remove',watch:this})
            }
        }
    }

    return Watch
})()

module.exports = Watch