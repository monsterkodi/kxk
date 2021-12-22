// monsterkodi/kode 0.196.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var about, App, args, childp, electron, fs, klog, kxk, os, post, prefs, slash, srcmap, watch, _1_20_

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
process.env.NODE_NO_WARNINGS = 1
kxk = require('./kxk')
about = kxk.about
args = kxk.args
childp = kxk.childp
fs = kxk.fs
klog = kxk.klog
os = kxk.os
post = kxk.post
prefs = kxk.prefs
slash = kxk.slash
srcmap = kxk.srcmap
watch = kxk.watch

if (process.type === 'browser')
{
    electron = require('electron')
    post.onGet('appName',function ()
    {
        return electron.app.getName()
    })
    post.onGet('userData',function ()
    {
        return electron.app.getPath('userData')
    })
    post.on('openFileDialog',function (options)
    {
        var winID

        winID = post.senderWinID
        return electron.dialog.showOpenDialog(options).then(function (result)
        {
            return post.toWin(winID,'openFileDialogResult',result)
        })
    })
    post.on('saveFileDialog',function (options)
    {
        var winID

        winID = post.senderWinID
        return electron.dialog.showSaveDialog(options).then(function (result)
        {
            return post.toWin(winID,'saveFileDialogResult',result)
        })
    })
    post.on('messageBox',function (options)
    {
        var winID

        winID = post.senderWinID
        return electron.dialog.showMessageBox(options).then(function (result)
        {
            return post.toWin(winID,'messageBoxResult',result.response)
        })
    })
}
else
{
    console.error(`this should be used in main process only! process.type: ${process.type} grandpa: ${(module.parent.parent != null ? module.parent.parent.filename : undefined)} parent: ${module.parent.filename} module: ${module.filename}`)
}

App = (function ()
{
    function App (opt)
    {
        var argl, onOther, _77_38_, _81_50_

        this.opt = opt
        this["onSrcChange"] = this["onSrcChange"].bind(this)
        this["stopWatcher"] = this["stopWatcher"].bind(this)
        this["startWatcher"] = this["startWatcher"].bind(this)
        this["onMenuAction"] = this["onMenuAction"].bind(this)
        this["winForEvent"] = this["winForEvent"].bind(this)
        this["saveBounds"] = this["saveBounds"].bind(this)
        this["onGetWinID"] = this["onGetWinID"].bind(this)
        this["onGetWinBounds"] = this["onGetWinBounds"].bind(this)
        this["onSetWinBounds"] = this["onSetWinBounds"].bind(this)
        this["createWindow"] = this["createWindow"].bind(this)
        this["showWindow"] = this["showWindow"].bind(this)
        this["onActivate"] = this["onActivate"].bind(this)
        this["toggleWindowFromTray"] = this["toggleWindowFromTray"].bind(this)
        this["showDock"] = this["showDock"].bind(this)
        this["hideDock"] = this["hideDock"].bind(this)
        this["exitApp"] = this["exitApp"].bind(this)
        this["quitApp"] = this["quitApp"].bind(this)
        this["showAbout"] = this["showAbout"].bind(this)
        this["initTray"] = this["initTray"].bind(this)
        this["onReady"] = this["onReady"].bind(this)
        this["resolve"] = this["resolve"].bind(this)
        console.log('App')
        process.on('uncaughtException',function (err)
        {
            srcmap = require('./srcmap')
            srcmap.logErr(err,'🔻')
            return true
        })
        this.watchers = []
        this.app = electron.app
        this.userData = this.app.getPath('userData')
        this.app.commandLine.appendSwitch('disable-site-isolation-trials')
        electron.Menu.setApplicationMenu(this.opt.menu)
        if (this.opt.tray)
        {
            klog.slog.icon = slash.fileUrl(this.resolve(this.opt.tray))
        }
        argl = `noprefs     don't load preferences      false
devtools    open developer tools        false  -D
watch       watch sources for changes   false`
        if (this.opt.args)
        {
            argl = this.opt.args + '\n' + argl
        }
        args = args.init(argl)
        onOther = (function (event, args, dir)
        {
            if (this.opt.onOtherInstance)
            {
                return this.opt.onOtherInstance(args,dir)
            }
            else
            {
                return this.showWindow()
            }
        }).bind(this)
        if (this.opt.single !== false)
        {
            if ((this.app.makeSingleInstance != null))
            {
                if (this.app.makeSingleInstance(onOther))
                {
                    this.app.quit()
                    return
                }
            }
            else if ((this.app.requestSingleInstanceLock != null))
            {
                if (this.app.requestSingleInstanceLock())
                {
                    this.app.on('second-instance',onOther)
                }
                else
                {
                    this.app.quit()
                    return
                }
            }
        }
        electron.ipcMain.on('menuAction',this.onMenuAction)
        electron.ipcMain.on('getWinBounds',this.onGetWinBounds)
        electron.ipcMain.on('setWinBounds',this.onSetWinBounds)
        electron.ipcMain.on('getWinID',this.onGetWinID)
        this.app.setName(this.opt.pkg.name)
        this.app.on('ready',this.onReady)
        this.app.on('activate',this.onActivate)
        this.app.on('window-all-closed',(function (event)
        {
            if (this.opt.tray)
            {
                return event.preventDefault()
            }
            else
            {
                return this.quitApp()
            }
        }).bind(this))
        console.log('App~')
    }

    App.prototype["resolve"] = function (file)
    {
        return slash.resolve(slash.join(this.opt.dir,file))
    }

    App.prototype["onReady"] = function ()
    {
        var sep, _123_38_, _130_84_

        console.log('app.onReady')
        if (this.opt.tray)
        {
            this.initTray()
        }
        this.hideDock()
        this.app.setName(this.opt.pkg.name)
        if (!args.noprefs)
        {
            sep = ((_123_38_=this.opt.prefsSeperator) != null ? _123_38_ : '▸')
            if (this.opt.shortcut)
            {
                prefs.init({separator:sep,defaults:{shortcut:this.opt.shortcut}})
            }
            else
            {
                prefs.init({separator:sep})
            }
        }
        if (!_k_.empty(prefs.get('shortcut')))
        {
            electron.globalShortcut.register(prefs.get('shortcut'),((_130_84_=this.opt.onShortcut) != null ? _130_84_ : this.showWindow))
        }
        if (args.watch)
        {
            klog('App.onReady startWatcher')
            this.startWatcher()
        }
        if (this.opt.onShow)
        {
            this.opt.onShow()
        }
        else
        {
            this.showWindow()
        }
        return post.emit('appReady')
    }

    App.prototype["initTray"] = function ()
    {
        var template, trayImg

        trayImg = this.resolve(this.opt.tray)
        this.tray = new electron.Tray(trayImg)
        this.tray.on('click',this.toggleWindowFromTray)
        if (os.platform() !== 'darwin')
        {
            template = [{label:"Quit",click:this.quitApp},{label:"About",click:this.showAbout},{label:"Activate",click:this.toggleWindowFromTray}]
            return this.tray.setContextMenu(electron.Menu.buildFromTemplate(template))
        }
    }

    App.prototype["showAbout"] = function ()
    {
        var dark

        dark = 'dark' === prefs.get('scheme','dark')
        return about({img:this.resolve(this.opt.about),color:dark && '#333' || '#ddd',background:dark && '#111' || '#fff',highlight:dark && '#fff' || '#000',pkg:this.opt.pkg,debug:this.opt.aboutDebug})
    }

    App.prototype["quitApp"] = function ()
    {
        var _198_33_

        this.stopWatcher()
        if (this.opt.saveBounds !== false)
        {
            this.saveBounds()
        }
        prefs.save()
        if ('delay' !== (typeof this.opt.onQuit === "function" ? this.opt.onQuit() : undefined))
        {
            return this.exitApp()
        }
    }

    App.prototype["exitApp"] = function ()
    {
        this.app.exit(0)
        return process.exit(0)
    }

    App.prototype["hideDock"] = function ()
    {
        var _212_26_

        return (this.app.dock != null ? this.app.dock.hide() : undefined)
    }

    App.prototype["showDock"] = function ()
    {
        var _213_26_

        return (this.app.dock != null ? this.app.dock.show() : undefined)
    }

    App.prototype["toggleWindowFromTray"] = function ()
    {
        return this.showWindow()
    }

    App.prototype["onActivate"] = function (event, hasVisibleWindows)
    {
        console.log('app.onActivate')
        if (this.opt.onActivate)
        {
            if (this.opt.onActivate(event,hasVisibleWindows))
            {
                return
            }
        }
        if (!hasVisibleWindows)
        {
            return this.showWindow()
        }
    }

    App.prototype["showWindow"] = function ()
    {
        var _238_26_, _240_15_

        console.log('app.showWindow')
        ;(typeof this.opt.onWillShowWin === "function" ? this.opt.onWillShowWin() : undefined)
        if ((this.win != null))
        {
            this.win.show()
        }
        else
        {
            this.createWindow()
        }
        return this.showDock()
    }

    App.prototype["createWindow"] = function (onReadyToShow)
    {
        var bounds, height, width, _262_32_, _262_46_, _263_32_, _263_46_, _268_56_, _269_56_, _270_56_, _271_56_, _272_56_, _273_56_, _274_56_, _275_56_, _276_56_, _277_56_, _278_56_, _279_56_, _280_56_, _281_56_

        console.log('app.createWindow')
        onReadyToShow = (onReadyToShow != null ? onReadyToShow : this.opt.onWinReady)
        if (this.opt.saveBounds !== false)
        {
            bounds = prefs.get('bounds')
        }
        width = ((_262_32_=(bounds != null ? bounds.width : undefined)) != null ? _262_32_ : ((_262_46_=this.opt.width) != null ? _262_46_ : 500))
        height = ((_263_32_=(bounds != null ? bounds.height : undefined)) != null ? _263_32_ : ((_263_46_=this.opt.height) != null ? _263_46_ : 500))
        this.win = new electron.BrowserWindow({width:width,height:height,minWidth:((_268_56_=this.opt.minWidth) != null ? _268_56_ : 250),minHeight:((_269_56_=this.opt.minHeight) != null ? _269_56_ : 250),maxWidth:((_270_56_=this.opt.maxWidth) != null ? _270_56_ : 100000),maxHeight:((_271_56_=this.opt.maxHeight) != null ? _271_56_ : 100000),backgroundColor:((_272_56_=this.opt.backgroundColor) != null ? _272_56_ : '#181818'),frame:((_273_56_=this.opt.frame) != null ? _273_56_ : false),transparent:((_274_56_=this.opt.transparent) != null ? _274_56_ : false),fullscreen:((_275_56_=this.opt.fullscreen) != null ? _275_56_ : false),fullscreenable:((_276_56_=this.opt.fullscreenable) != null ? _276_56_ : true),acceptFirstMouse:((_277_56_=this.opt.acceptFirstMouse) != null ? _277_56_ : true),resizable:((_278_56_=this.opt.resizable) != null ? _278_56_ : true),maximizable:((_279_56_=this.opt.maximizable) != null ? _279_56_ : true),minimizable:((_280_56_=this.opt.minimizable) != null ? _280_56_ : true),closable:((_281_56_=this.opt.closable) != null ? _281_56_ : true),autoHideMenuBar:true,thickFrame:false,show:false,icon:this.resolve(this.opt.icon),webPreferences:{webSecurity:false,contextIsolation:false,nodeIntegration:true,nodeIntegrationInWorker:true}})
        if ((bounds != null))
        {
            this.win.setPosition(bounds.x,bounds.y)
        }
        if (this.opt.indexURL)
        {
            this.win.loadURL(this.opt.index,{baseURLForDataURL:this.opt.indexURL})
        }
        else
        {
            this.win.loadURL(slash.fileUrl(this.resolve(this.opt.index)))
        }
        this.win.webContents.on('devtools-opened',function (event)
        {
            return post.toWin(event.sender.id,'devTools',true)
        })
        this.win.webContents.on('devtools-closed',function (event)
        {
            return post.toWin(event.sender.id,'devTools',false)
        })
        if (args.devtools)
        {
            this.win.webContents.openDevTools({mode:'detach'})
        }
        if (this.opt.saveBounds !== false)
        {
            if ((bounds != null))
            {
                this.win.setPosition(bounds.x,bounds.y)
            }
            this.win.on('resize',this.saveBounds)
            this.win.on('move',this.saveBounds)
        }
        this.win.on('closed',(function ()
        {
            return this.win = null
        }).bind(this))
        this.win.on('close',(function ()
        {
            if (this.opt.single)
            {
                return this.hideDock()
            }
        }).bind(this))
        this.win.on('moved',(function (event)
        {
            return post.toWin(event.sender,'winMoved',event.sender.getBounds())
        }).bind(this))
        this.win.on('ready-to-show',(function (w, orts)
        {
            return function ()
            {
                ;(typeof orts === "function" ? orts(w) : undefined)
                w.show()
                return post.emit('winReady',w.id)
            }
        })(this.win,onReadyToShow))
        this.showDock()
        return this.win
    }

    App.prototype["onSetWinBounds"] = function (event, bounds)
    {
        var _327_27_

        return (this.winForEvent(event) != null ? this.winForEvent(event).setBounds(bounds) : undefined)
    }

    App.prototype["onGetWinBounds"] = function (event)
    {
        var _331_47_

        return event.returnValue = (this.winForEvent(event) != null ? this.winForEvent(event).getBounds() : undefined)
    }

    App.prototype["onGetWinID"] = function (event)
    {
        return event.returnValue = event.sender.id
    }

    App.prototype["saveBounds"] = function ()
    {
        var _335_26_

        if ((this.win != null))
        {
            return prefs.set('bounds',this.win.getBounds())
        }
    }

    App.prototype["screenSize"] = function ()
    {
        return electron.screen.getPrimaryDisplay().workAreaSize
    }

    App.prototype["allWins"] = function ()
    {
        return electron.BrowserWindow.getAllWindows().sort(function (a, b)
        {
            return a.id - b.id
        })
    }

    App.prototype["winForEvent"] = function (event)
    {
        var w

        w = electron.BrowserWindow.fromWebContents(event.sender)
        if (!w)
        {
            klog('no win?',event.sender.id)
            var list = _k_.list(this.allWins())
            for (var _346_18_ = 0; _346_18_ < list.length; _346_18_++)
            {
                w = list[_346_18_]
                klog('win',w.id,w.webContents.id)
            }
        }
        return w
    }

    App.prototype["toggleDevTools"] = function (wc)
    {
        if (wc.isDevToolsOpened())
        {
            return wc.closeDevTools()
        }
        else
        {
            return wc.openDevTools({mode:'detach'})
        }
    }

    App.prototype["onMenuAction"] = function (event, action)
    {
        var maximized, w, wa, wb

        if (w = this.winForEvent(event))
        {
            switch (action.toLowerCase())
            {
                case 'about':
                    return this.showAbout()

                case 'quit':
                    return this.quitApp()

                case 'screenshot':
                    return this.screenshot(w)

                case 'fullscreen':
                    w.setFullScreen
                    return !w.isFullScreen()

                case 'devtools':
                    return this.toggleDevTools(w.webContents)

                case 'reload':
                    return w.webContents.reloadIgnoringCache()

                case 'close':
                    return w.close()

                case 'hide':
                    return w.hide()

                case 'minimize':
                    return w.minimize()

                case 'maximize':
                    wa = this.screenSize()
                    wb = w.getBounds()
                    maximized = w.isMaximized() || (wb.width === wa.width && wb.height === wa.height)
                    if (maximized)
                    {
                        return w.unmaximize()
                    }
                    else
                    {
                        return w.maximize()
                    }
                    break
            }

        }
        else
        {
            return klog("kxk.app.onMenuAction NO WIN!")
        }
    }

    App.prototype["screenshot"] = function (w)
    {
        return w.webContents.capturePage().then((function (img)
        {
            var file

            file = slash.unused(`~/Desktop/${this.opt.pkg.name}.png`)
            return fs.writeFile(file,img.toPNG(),function (err)
            {
                if (!_k_.empty(err))
                {
                    return klog('saving screenshot failed',err)
                }
                else
                {
                    return klog(`screenshot saved to ${file}`)
                }
            })
        }).bind(this))
    }

    App.prototype["startWatcher"] = function ()
    {
        var dir, toWatch, watcher

        this.opt.dir = slash.resolve(this.opt.dir)
        watcher = watch.dir(this.opt.dir)
        watcher.on('change',this.onSrcChange)
        watcher.on('error',function (err)
        {
            console.error(err)
        })
        this.watchers.push(watcher)
        if (_k_.empty(this.opt.dirs))
        {
            return
        }
        var list = _k_.list(this.opt.dirs)
        for (var _421_16_ = 0; _421_16_ < list.length; _421_16_++)
        {
            dir = list[_421_16_]
            toWatch = slash.isRelative(dir) ? slash.resolve(slash.join(this.opt.dir,dir)) : slash.resolve(dir)
            watcher = watch.dir(toWatch)
            watcher.on('change',this.onSrcChange)
            watcher.on('error',function (err)
            {
                console.error(err)
            })
            this.watchers.push(watcher)
        }
    }

    App.prototype["stopWatcher"] = function ()
    {
        var watcher

        if (_k_.empty(this.watchers))
        {
            return
        }
        var list = _k_.list(this.watchers)
        for (var _435_20_ = 0; _435_20_ < list.length; _435_20_++)
        {
            watcher = list[_435_20_]
            watcher.close()
        }
        return this.watchers = []
    }

    App.prototype["onSrcChange"] = function (info)
    {
        var pkg

        if (slash.base(info.path) === 'main')
        {
            this.stopWatcher()
            this.app.exit(0)
            if (pkg = slash.pkg(this.opt.dir))
            {
                if (slash.isDir(slash.join(pkg,'node_modules')))
                {
                    childp.execSync(`${pkg}/node_modules/.bin/electron . -w`,{cwd:pkg,encoding:'utf8',stdio:'inherit',shell:true})
                    process.exit(0)
                    return
                }
            }
        }
        return post.toWins('menuAction','Reload')
    }

    return App
})()

module.exports = App