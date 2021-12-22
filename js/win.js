// monsterkodi/kode 0.195.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined}

var $, electron, keyinfo, klog, kpos, kxk, open, popup, post, prefs, scheme, slash, stopEvent, title, _, _1_20_

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
class Win
{
    constructor (opt)
    {
        var sep, _30_34_, _48_19_

        this.opt = opt
        this.onKeyUp = this.onKeyUp.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onContextMenu = this.onContextMenu.bind(this)
        this.onMenuAction = this.onMenuAction.bind(this)
        this.onMoved = this.onMoved.bind(this)
        window.onerror = function (msg, source, line, col, error)
        {
            try
            {
                console.error('window.onerror',msg,source,line,col)
            }
            catch (err)
            {
                console.log('dafuk?',err)
            }
            return true
        }
        sep = ((_30_34_=this.opt.prefsSeperator) != null ? _30_34_ : '▸')
        prefs.init({separator:sep})
        if (this.opt.icon)
        {
            klog.slog.icon = slash.fileUrl(slash.join(this.opt.dir,this.opt.icon))
        }
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

    getBounds ()
    {
        return electron.ipcRenderer.sendSync('getWinBounds')
    }

    setBounds (b)
    {
        return electron.ipcRenderer.send('setWinBounds',b)
    }

    onMoved ()
    {}

    onMenuAction (action, args)
    {
        switch (action.toLowerCase())
        {
            case 'preferences':
                return open(prefs.store.file)

        }

        electron.ipcRenderer.send('menuAction',action)
        return 'unhandled'
    }

    onContextMenu (event)
    {
        var absPos, items, _98_12_

        ;(this.win != null ? this.win.focus() : undefined)
        absPos = kpos(event)
        if (!(absPos != null))
        {
            absPos = kpos($("#main").getBoundingClientRect().left,$("#main").getBoundingClientRect().top)
        }
        items = _.clone(window.titlebar.menuTemplate())
        if (_.isFunction(this.opt.context))
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

    openFileDialog (options)
    {
        var cb, _121_22_

        options.title = ((_121_22_=options.title) != null ? _121_22_ : 'Open File')
        cb = options.cb
        delete options.cb
        post.toMain('openFileDialog',options)
        if (_.isFunction(cb))
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

    saveFileDialog (options)
    {
        var cb, _130_22_

        options.title = ((_130_22_=options.title) != null ? _130_22_ : 'Save File')
        cb = options.cb
        delete options.cb
        post.toMain('saveFileDialog',options)
        if (_.isFunction(cb))
        {
            return post.once('saveFileDialogResult',function (r)
            {
                klog('r',r)
                if (!r.cancelled && !_k_.empty(r.filePath))
                {
                    return cb(r.filePath)
                }
            })
        }
    }

    messageBox (options)
    {
        var cb, _139_28_, _140_28_, _141_28_, _142_28_, _143_28_, _144_28_, _145_28_

        options.type = ((_139_28_=options.type) != null ? _139_28_ : 'warning')
        options.buttons = ((_140_28_=options.buttons) != null ? _140_28_ : ['Ok'])
        options.defaultId = ((_141_28_=options.defaultId) != null ? _141_28_ : 0)
        options.cancelId = ((_142_28_=options.cancelId) != null ? _142_28_ : 0)
        options.title = ((_143_28_=options.title) != null ? _143_28_ : '')
        options.message = ((_144_28_=options.message) != null ? _144_28_ : 'no message!')
        options.detail = ((_145_28_=options.detail) != null ? _145_28_ : 'no details!')
        cb = options.cb
        delete options.cb
        post.toMain('messageBox',options)
        if (_.isFunction(cb))
        {
            return post.once('messageBoxResult',function (r)
            {
                return cb(r)
            })
        }
    }

    onKeyDown (event)
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

    onKeyUp (event)
    {
        var info

        info = keyinfo.forEvent(event)
        return this.modifiers = info.mod
    }
}

module.exports = Win