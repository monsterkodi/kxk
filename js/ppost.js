// monsterkodi/kode 0.190.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var electron, Emitter, POST, _

_ = require('lodash')
Emitter = require('events')
POST = '__POST__'
if (process.type === 'renderer')
{
    electron = require('electron')
    class PostRenderer extends Emitter
{
    constructor ()
    {
        this.dispose = this.dispose.bind(this)
        super.constructor()
        this.ipc = electron.ipcRenderer
        this.ipc.on(POST,(function (event, type, argl)
        {
            return this.emit.apply(this,[type].concat(argl))
        }).bind(this))
        window.addEventListener('beforeunload',this.dispose)
    }

    dispose ()
    {
        window.removeEventListener('beforeunload',this.dispose)
        this.ipc.removeAllListeners(POST)
        return this.ipc = null
    }

    toAll (type, ...args)
    {
        return this.send('toAll',type,args)
    }

    toMain (type, ...args)
    {
        return this.send('toMain',type,args)
    }

    toOtherWins (type, ...args)
    {
        return this.send('toOtherWins',type,args)
    }

    get (type, ...args)
    {
        return this.ipc.sendSync(POST,'get',type,args)
    }

    send (receivers, type, args, id)
    {
        var _41_49_

        return (this.ipc != null ? this.ipc.send(POST,receivers,type,args,id) : undefined)
    }
}

module.exports = new PostRenderer()
}
else if (process.type === 'browser')
{
electron = require('electron')
class PostMain extends Emitter
{
    constructor ()
    {
        var ipc

        super.constructor()
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

    toAll (type, ...args)
    {
        this.sendToWins(type,args)
        return this.sendToMain(type,args)
    }

    toMain (type, ...args)
    {
        return this.sendToMain(type,args)
    }

    toWins (type, ...args)
    {
        return this.sendToWins(type,args)
    }

    toWin (id, type, ...args)
    {
        var w, _83_26_

        if (_.isNumber(id))
        {
            w = electron.BrowserWindow.fromId(id)
        }
        else
        {
            w = id
        }
        return (w != null ? (_83_26_=w.webContents) != null ? _83_26_.send(POST,type,args) : undefined : undefined)
    }

    onGet (type, cb)
    {
        return this.getCallbacks[type] = cb
    }

    get (type)
    {
        return this.getCallbacks[type]()
    }

    sendToMain (type, argl, id)
    {
        this.senderWinID = id
        argl.unshift(type)
        this.emit.apply(this,argl)
        return delete this.senderWinID
    }

    sendToWins (type, argl, except)
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
}

module.exports = new PostMain()
}