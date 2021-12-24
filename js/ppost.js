// monsterkodi/kode 0.218.0

var _k_ = {extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var electron, Emitter, POST, PostMain, PostRenderer, _

_ = require('lodash')
Emitter = require('events')
POST = '__POST__'
if (process.type === 'renderer')
{
    electron = require('electron')
    
PostRenderer = (function ()
{
    _k_.extend(PostRenderer, Emitter)
    function PostRenderer ()
    {
        this["dispose"] = this["dispose"].bind(this)
        PostRenderer.__super__.constructor.call(this)
        this.ipc = electron.ipcRenderer
        this.ipc.on(POST,(function (event, type, argl)
        {
            return this.emit.apply(this,[type].concat(argl))
        }).bind(this))
        window.addEventListener('beforeunload',this.dispose)
    }

    PostRenderer.prototype["dispose"] = function ()
    {
        window.removeEventListener('beforeunload',this.dispose)
        this.ipc.removeAllListeners(POST)
        return this.ipc = null
    }

    PostRenderer.prototype["toAll"] = function (type, ...args)
    {
        return this.send('toAll',type,args)
    }

    PostRenderer.prototype["toMain"] = function (type, ...args)
    {
        return this.send('toMain',type,args)
    }

    PostRenderer.prototype["toOtherWins"] = function (type, ...args)
    {
        return this.send('toOtherWins',type,args)
    }

    PostRenderer.prototype["get"] = function (type, ...args)
    {
        return this.ipc.sendSync(POST,'get',type,args)
    }

    PostRenderer.prototype["send"] = function (receivers, type, args, id)
    {
        var _41_49_

        return (this.ipc != null ? this.ipc.send(POST,receivers,type,args,id) : undefined)
    }

    return PostRenderer
})()

    module.exports = new PostRenderer()
}
else if (process.type === 'browser')
{
electron = require('electron')

PostMain = (function ()
{
    _k_.extend(PostMain, Emitter)
    function PostMain ()
    {
        PostMain.__super__.constructor.call(this)
    
        var ipc

        this.getCallbacks = {}
        try
        {
            ipc = electron.ipcMain
            ipc.on(POST,(function (event, kind, type, argl)
            {
                var id, retval

                id = electron.BrowserWindow.fromWebContents(event.sender).id
                switch (kind)
                {
                    case 'toAll':
                        return this.sendToWins(type,argl).sendToMain(type,argl,id)

                    case 'toMain':
                        return this.sendToMain(type,argl,id)

                    case 'toOtherWins':
                        return this.sendToWins(type,argl,id)

                    case 'get':
                        if (type === 'winID')
                        {
                            return event.returnValue = id
                        }
                        else if (_.isFunction(this.getCallbacks[type]))
                        {
                            retval = this.getCallbacks[type].apply(this.getCallbacks[type],argl)
                            return event.returnValue = (retval != null ? retval : [])
                        }
                        break
                }

            }).bind(this))
        }
        catch (err)
        {
            kerror(err)
        }
    }

    PostMain.prototype["toAll"] = function (type, ...args)
    {
        this.sendToWins(type,args)
        return this.sendToMain(type,args)
    }

    PostMain.prototype["toMain"] = function (type, ...args)
    {
        return this.sendToMain(type,args)
    }

    PostMain.prototype["toWins"] = function (type, ...args)
    {
        return this.sendToWins(type,args)
    }

    PostMain.prototype["toWin"] = function (id, type, ...args)
    {
        var w, _83_26_

        if ((function(o){return !isNaN(o) && !isNaN(parseFloat(o)) && isFinite(o)})(id))
        {
            w = electron.BrowserWindow.fromId(id)
        }
        else
        {
            w = id
        }
        return (w != null ? (_83_26_=w.webContents) != null ? _83_26_.send(POST,type,args) : undefined : undefined)
    }

    PostMain.prototype["onGet"] = function (type, cb)
    {
        return this.getCallbacks[type] = cb
    }

    PostMain.prototype["get"] = function (type)
    {
        return this.getCallbacks[type]()
    }

    PostMain.prototype["sendToMain"] = function (type, argl, id)
    {
        this.senderWinID = id
        argl.unshift(type)
        this.emit.apply(this,argl)
        return delete this.senderWinID
    }

    PostMain.prototype["sendToWins"] = function (type, argl, except)
    {
        var win

        var list = _k_.list(electron.BrowserWindow.getAllWindows())
        for (var _97_20_ = 0; _97_20_ < list.length; _97_20_++)
        {
            win = list[_97_20_]
            if (win.id !== except)
            {
                win.webContents.send(POST,type,argl)
            }
        }
    }

    return PostMain
})()

module.exports = new PostMain()
}