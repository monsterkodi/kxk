// koffee 1.14.0

/*
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000
 */
var App, about, args, childp, electron, empty, fs, klog, os, post, prefs, ref, ref1, slash, srcmap, valid, watch,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

process.env.NODE_NO_WARNINGS = 1;

ref = require('./kxk'), about = ref.about, args = ref.args, childp = ref.childp, empty = ref.empty, fs = ref.fs, klog = ref.klog, os = ref.os, post = ref.post, prefs = ref.prefs, slash = ref.slash, srcmap = ref.srcmap, valid = ref.valid, watch = ref.watch;

if (process.type === 'browser') {
    electron = require('electron');
    post.onGet('appName', function() {
        return electron.app.getName();
    });
    post.onGet('userData', function() {
        return electron.app.getPath('userData');
    });
    post.on('openFileDialog', function(options) {
        var winID;
        winID = post.senderWinID;
        return electron.dialog.showOpenDialog(options).then(function(result) {
            return post.toWin(winID, 'openFileDialogResult', result);
        });
    });
    post.on('saveFileDialog', function(options) {
        var winID;
        winID = post.senderWinID;
        return electron.dialog.showSaveDialog(options).then(function(result) {
            return post.toWin(winID, 'saveFileDialogResult', result);
        });
    });
    post.on('messageBox', function(options) {
        var winID;
        winID = post.senderWinID;
        return electron.dialog.showMessageBox(options).then(function(result) {
            return post.toWin(winID, 'messageBoxResult', result.response);
        });
    });
} else {
    console.error("this should be used in main process only! process.type: " + process.type + " grandpa: " + ((ref1 = module.parent.parent) != null ? ref1.filename : void 0) + " parent: " + module.parent.filename + " module: " + module.filename);
}

App = (function() {
    function App(opt) {
        var argl, onOther;
        this.opt = opt;
        this.onSrcChange = bind(this.onSrcChange, this);
        this.stopWatcher = bind(this.stopWatcher, this);
        this.startWatcher = bind(this.startWatcher, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.winForEvent = bind(this.winForEvent, this);
        this.saveBounds = bind(this.saveBounds, this);
        this.onGetWinID = bind(this.onGetWinID, this);
        this.onGetWinBounds = bind(this.onGetWinBounds, this);
        this.onSetWinBounds = bind(this.onSetWinBounds, this);
        this.createWindow = bind(this.createWindow, this);
        this.showWindow = bind(this.showWindow, this);
        this.onActivate = bind(this.onActivate, this);
        this.toggleWindowFromTray = bind(this.toggleWindowFromTray, this);
        this.showDock = bind(this.showDock, this);
        this.hideDock = bind(this.hideDock, this);
        this.exitApp = bind(this.exitApp, this);
        this.quitApp = bind(this.quitApp, this);
        this.showAbout = bind(this.showAbout, this);
        this.initTray = bind(this.initTray, this);
        this.onReady = bind(this.onReady, this);
        this.resolve = bind(this.resolve, this);
        process.on('uncaughtException', function(err) {
            srcmap = require('./srcmap');
            srcmap.logErr(err, '🔻');
            return true;
        });
        this.watchers = [];
        this.app = electron.app;
        this.userData = this.app.getPath('userData');
        this.app.commandLine.appendSwitch('disable-site-isolation-trials');
        electron.Menu.setApplicationMenu(this.opt.menu);
        if (this.opt.tray) {
            klog.slog.icon = slash.fileUrl(this.resolve(this.opt.tray));
        }
        argl = "noprefs     don't load preferences      false\ndevtools    open developer tools        false  -D\nwatch       watch sources for changes   false";
        if (this.opt.args) {
            argl = this.opt.args + '\n' + argl;
        }
        args = args.init(argl);
        onOther = (function(_this) {
            return function(event, args, dir) {
                if (_this.opt.onOtherInstance) {
                    return _this.opt.onOtherInstance(args, dir);
                } else {
                    return _this.showWindow();
                }
            };
        })(this);
        if (this.opt.single !== false) {
            if (this.app.makeSingleInstance != null) {
                if (this.app.makeSingleInstance(onOther)) {
                    this.app.quit();
                    return;
                }
            } else if (this.app.requestSingleInstanceLock != null) {
                if (this.app.requestSingleInstanceLock()) {
                    this.app.on('second-instance', onOther);
                } else {
                    this.app.quit();
                    return;
                }
            }
        }
        electron.ipcMain.on('menuAction', this.onMenuAction);
        electron.ipcMain.on('getWinBounds', this.onGetWinBounds);
        electron.ipcMain.on('setWinBounds', this.onSetWinBounds);
        electron.ipcMain.on('getWinID', this.onGetWinID);
        this.app.setName(this.opt.pkg.name);
        this.app.on('ready', this.onReady);
        this.app.on('activate', this.onActivate);
        this.app.on('window-all-closed', (function(_this) {
            return function(event) {
                if (_this.opt.tray) {
                    return event.preventDefault();
                } else {
                    return _this.quitApp();
                }
            };
        })(this));
    }

    App.prototype.resolve = function(file) {
        return slash.resolve(slash.join(this.opt.dir, file));
    };

    App.prototype.onReady = function() {
        var ref2, ref3, sep;
        if (this.opt.tray) {
            this.initTray();
        }
        this.hideDock();
        this.app.setName(this.opt.pkg.name);
        if (!args.noprefs) {
            sep = (ref2 = this.opt.prefsSeperator) != null ? ref2 : '▸';
            if (this.opt.shortcut) {
                prefs.init({
                    separator: sep,
                    defaults: {
                        shortcut: this.opt.shortcut
                    }
                });
            } else {
                prefs.init({
                    separator: sep
                });
            }
        }
        if (valid(prefs.get('shortcut'))) {
            electron.globalShortcut.register(prefs.get('shortcut'), (ref3 = this.opt.onShortcut) != null ? ref3 : this.showWindow);
        }
        if (args.watch) {
            klog('App.onReady startWatcher');
            this.startWatcher();
        }
        if (this.opt.onShow) {
            this.opt.onShow();
        } else {
            this.showWindow();
        }
        return post.emit('appReady');
    };

    App.prototype.initTray = function() {
        var template, trayImg;
        trayImg = this.resolve(this.opt.tray);
        this.tray = new electron.Tray(trayImg);
        this.tray.on('click', this.toggleWindowFromTray);
        if (os.platform() !== 'darwin') {
            template = [
                {
                    label: "Quit",
                    click: this.quitApp
                }, {
                    label: "About",
                    click: this.showAbout
                }, {
                    label: "Activate",
                    click: this.toggleWindowFromTray
                }
            ];
            return this.tray.setContextMenu(electron.Menu.buildFromTemplate(template));
        }
    };

    App.prototype.showAbout = function() {
        var dark;
        dark = 'dark' === prefs.get('scheme', 'dark');
        return about({
            img: this.resolve(this.opt.about),
            color: dark && '#333' || '#ddd',
            background: dark && '#111' || '#fff',
            highlight: dark && '#fff' || '#000',
            pkg: this.opt.pkg,
            debug: this.opt.aboutDebug
        });
    };

    App.prototype.quitApp = function() {
        var base;
        this.stopWatcher();
        if (this.opt.saveBounds !== false) {
            this.saveBounds();
        }
        prefs.save();
        if ('delay' !== (typeof (base = this.opt).onQuit === "function" ? base.onQuit() : void 0)) {
            return this.exitApp();
        }
    };

    App.prototype.exitApp = function() {
        this.app.exit(0);
        return process.exit(0);
    };

    App.prototype.hideDock = function() {
        var ref2;
        return (ref2 = this.app.dock) != null ? ref2.hide() : void 0;
    };

    App.prototype.showDock = function() {
        var ref2;
        return (ref2 = this.app.dock) != null ? ref2.show() : void 0;
    };

    App.prototype.toggleWindowFromTray = function() {
        return this.showWindow();
    };

    App.prototype.onActivate = function(event, hasVisibleWindows) {
        if (this.opt.onActivate) {
            if (this.opt.onActivate(event, hasVisibleWindows)) {
                return;
            }
        }
        if (!hasVisibleWindows) {
            return this.showWindow();
        }
    };

    App.prototype.showWindow = function() {
        var base;
        if (typeof (base = this.opt).onWillShowWin === "function") {
            base.onWillShowWin();
        }
        if (this.win != null) {
            this.win.show();
        } else {
            this.createWindow();
        }
        return this.showDock();
    };

    App.prototype.createWindow = function(onReadyToShow) {
        var bounds, height, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, width;
        if (onReadyToShow != null) {
            onReadyToShow;
        } else {
            onReadyToShow = this.opt.onWinReady;
        }
        if (this.opt.saveBounds !== false) {
            bounds = prefs.get('bounds');
        }
        width = (ref2 = (ref3 = bounds != null ? bounds.width : void 0) != null ? ref3 : this.opt.width) != null ? ref2 : 500;
        height = (ref4 = (ref5 = bounds != null ? bounds.height : void 0) != null ? ref5 : this.opt.height) != null ? ref4 : 500;
        this.win = new electron.BrowserWindow({
            width: width,
            height: height,
            minWidth: (ref6 = this.opt.minWidth) != null ? ref6 : 250,
            minHeight: (ref7 = this.opt.minHeight) != null ? ref7 : 250,
            maxWidth: (ref8 = this.opt.maxWidth) != null ? ref8 : 100000,
            maxHeight: (ref9 = this.opt.maxHeight) != null ? ref9 : 100000,
            backgroundColor: (ref10 = this.opt.backgroundColor) != null ? ref10 : '#181818',
            frame: (ref11 = this.opt.frame) != null ? ref11 : false,
            transparent: (ref12 = this.opt.transparent) != null ? ref12 : false,
            fullscreen: (ref13 = this.opt.fullscreen) != null ? ref13 : false,
            fullscreenable: (ref14 = this.opt.fullscreenable) != null ? ref14 : true,
            acceptFirstMouse: (ref15 = this.opt.acceptFirstMouse) != null ? ref15 : true,
            resizable: (ref16 = this.opt.resizable) != null ? ref16 : true,
            maximizable: (ref17 = this.opt.maximizable) != null ? ref17 : true,
            minimizable: (ref18 = this.opt.minimizable) != null ? ref18 : true,
            closable: (ref19 = this.opt.closable) != null ? ref19 : true,
            autoHideMenuBar: true,
            thickFrame: false,
            show: false,
            icon: this.resolve(this.opt.icon),
            webPreferences: {
                webSecurity: false,
                contextIsolation: false,
                nodeIntegration: true,
                nodeIntegrationInWorker: true
            }
        });
        if (bounds != null) {
            this.win.setPosition(bounds.x, bounds.y);
        }
        if (this.opt.indexURL) {
            this.win.loadURL(this.opt.index, {
                baseURLForDataURL: this.opt.indexURL
            });
        } else {
            this.win.loadURL(slash.fileUrl(this.resolve(this.opt.index)));
        }
        this.win.webContents.on('devtools-opened', function(event) {
            return post.toWin(event.sender.id, 'devTools', true);
        });
        this.win.webContents.on('devtools-closed', function(event) {
            return post.toWin(event.sender.id, 'devTools', false);
        });
        if (args.devtools) {
            this.win.webContents.openDevTools({
                mode: 'detach'
            });
        }
        if (this.opt.saveBounds !== false) {
            if (bounds != null) {
                this.win.setPosition(bounds.x, bounds.y);
            }
            this.win.on('resize', this.saveBounds);
            this.win.on('move', this.saveBounds);
        }
        this.win.on('closed', (function(_this) {
            return function() {
                return _this.win = null;
            };
        })(this));
        this.win.on('close', (function(_this) {
            return function() {
                if (_this.opt.single) {
                    return _this.hideDock();
                }
            };
        })(this));
        this.win.on('moved', (function(_this) {
            return function(event) {
                return post.toWin(event.sender, 'winMoved', event.sender.getBounds());
            };
        })(this));
        this.win.on('ready-to-show', (function(w, orts) {
            return function() {
                if (typeof orts === "function") {
                    orts(w);
                }
                w.show();
                return post.emit('winReady', w.id);
            };
        })(this.win, onReadyToShow));
        this.showDock();
        return this.win;
    };

    App.prototype.onSetWinBounds = function(event, bounds) {
        var ref2;
        return (ref2 = this.winForEvent(event)) != null ? ref2.setBounds(bounds) : void 0;
    };

    App.prototype.onGetWinBounds = function(event) {
        var ref2;
        return event.returnValue = (ref2 = this.winForEvent(event)) != null ? ref2.getBounds() : void 0;
    };

    App.prototype.onGetWinID = function(event) {
        return event.returnValue = event.sender.id;
    };

    App.prototype.saveBounds = function() {
        if (this.win != null) {
            return prefs.set('bounds', this.win.getBounds());
        }
    };

    App.prototype.screenSize = function() {
        return electron.screen.getPrimaryDisplay().workAreaSize;
    };

    App.prototype.allWins = function() {
        return electron.BrowserWindow.getAllWindows().sort(function(a, b) {
            return a.id - b.id;
        });
    };

    App.prototype.winForEvent = function(event) {
        var i, len, ref2, w;
        w = electron.BrowserWindow.fromWebContents(event.sender);
        if (!w) {
            klog('no win?', event.sender.id);
            ref2 = this.allWins();
            for (i = 0, len = ref2.length; i < len; i++) {
                w = ref2[i];
                klog('win', w.id, w.webContents.id);
            }
        }
        return w;
    };

    App.prototype.toggleDevTools = function(wc) {
        if (wc.isDevToolsOpened()) {
            return wc.closeDevTools();
        } else {
            return wc.openDevTools({
                mode: 'detach'
            });
        }
    };

    App.prototype.onMenuAction = function(event, action) {
        var maximized, w, wa, wb;
        klog('kxk.app.onMenuAction', action, event.sender.id);
        if (w = this.winForEvent(event)) {
            switch (action.toLowerCase()) {
                case 'about':
                    return this.showAbout();
                case 'quit':
                    return this.quitApp();
                case 'screenshot':
                    return this.screenshot(w);
                case 'fullscreen':
                    return w.setFullScreen(!w.isFullScreen());
                case 'devtools':
                    return this.toggleDevTools(w.webContents);
                case 'reload':
                    return w.webContents.reloadIgnoringCache();
                case 'close':
                    return w.close();
                case 'hide':
                    return w.hide();
                case 'minimize':
                    return w.minimize();
                case 'maximize':
                    wa = this.screenSize();
                    wb = w.getBounds();
                    maximized = w.isMaximized() || (wb.width === wa.width && wb.height === wa.height);
                    if (maximized) {
                        return w.unmaximize();
                    } else {
                        return w.maximize();
                    }
            }
        } else {
            return klog("kxk.app.onMenuAction NO WIN!");
        }
    };

    App.prototype.screenshot = function(w) {
        return w.webContents.capturePage().then((function(_this) {
            return function(img) {
                var file;
                file = slash.unused("~/Desktop/" + _this.opt.pkg.name + ".png");
                return fs.writeFile(file, img.toPNG(), function(err) {
                    if (valid(err)) {
                        return klog('saving screenshot failed', err);
                    } else {
                        return klog("screenshot saved to " + file);
                    }
                });
            };
        })(this));
    };

    App.prototype.startWatcher = function() {
        var dir, i, len, ref2, results, toWatch, watcher;
        this.opt.dir = slash.resolve(this.opt.dir);
        watcher = watch.dir(this.opt.dir);
        watcher.on('change', this.onSrcChange);
        watcher.on('error', function(err) {
            return console.error(err);
        });
        this.watchers.push(watcher);
        if (empty(this.opt.dirs)) {
            return;
        }
        ref2 = this.opt.dirs;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
            dir = ref2[i];
            toWatch = slash.isRelative(dir) ? slash.resolve(slash.join(this.opt.dir, dir)) : slash.resolve(dir);
            watcher = watch.dir(toWatch);
            watcher.on('change', this.onSrcChange);
            watcher.on('error', function(err) {
                return console.error(err);
            });
            results.push(this.watchers.push(watcher));
        }
        return results;
    };

    App.prototype.stopWatcher = function() {
        var i, len, ref2, watcher;
        if (empty(this.watchers)) {
            return;
        }
        ref2 = this.watchers;
        for (i = 0, len = ref2.length; i < len; i++) {
            watcher = ref2[i];
            watcher.close();
        }
        return this.watchers = [];
    };

    App.prototype.onSrcChange = function(info) {
        var pkg;
        if (slash.base(info.path) === 'main') {
            this.stopWatcher();
            this.app.exit(0);
            if (pkg = slash.pkg(this.opt.dir)) {
                if (slash.isDir(slash.join(pkg, 'node_modules'))) {
                    childp.execSync(pkg + "/node_modules/.bin/electron . -w", {
                        cwd: pkg,
                        encoding: 'utf8',
                        stdio: 'inherit',
                        shell: true
                    });
                    process.exit(0);
                    return;
                }
            }
        }
        return post.toWins('menuAction', 'Reload');
    };

    return App;

})();

module.exports = App;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiYXBwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0R0FBQTtJQUFBOztBQVFBLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQzs7QUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBWixHQUFpRDs7QUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBWixHQUErQjs7QUFFL0IsTUFBeUYsT0FBQSxDQUFRLE9BQVIsQ0FBekYsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxtQkFBZixFQUF1QixpQkFBdkIsRUFBOEIsV0FBOUIsRUFBa0MsZUFBbEMsRUFBd0MsV0FBeEMsRUFBNEMsZUFBNUMsRUFBa0QsaUJBQWxELEVBQXlELGlCQUF6RCxFQUFnRSxtQkFBaEUsRUFBd0UsaUJBQXhFLEVBQStFOztBQUUvRSxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFNBQW5CO0lBQ0ksUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO0lBRVgsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLEVBQXNCLFNBQUE7ZUFBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQWIsQ0FBQTtJQUFILENBQXRCO0lBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFYLEVBQXNCLFNBQUE7ZUFBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQWIsQ0FBcUIsVUFBckI7SUFBSCxDQUF0QjtJQUVBLElBQUksQ0FBQyxFQUFMLENBQVEsZ0JBQVIsRUFBeUIsU0FBQyxPQUFEO0FBQ3JCLFlBQUE7UUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDO2VBQ2IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFoQixDQUErQixPQUEvQixDQUF1QyxDQUFDLElBQXhDLENBQTZDLFNBQUMsTUFBRDttQkFBWSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVgsRUFBa0Isc0JBQWxCLEVBQXlDLE1BQXpDO1FBQVos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QyxJQUFWLENBQWUsT0FBZjtBQVJKOztJQVZVOztrQkFvQmQsV0FBQSxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsSUFBVSxLQUFBLENBQU0sSUFBQyxDQUFBLFFBQVAsQ0FBVjtBQUFBLG1CQUFBOztBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxPQUFPLENBQUMsS0FBUixDQUFBO0FBREo7ZUFFQSxJQUFDLENBQUEsUUFBRCxHQUFZO0lBTEg7O2tCQU9iLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFHVCxZQUFBO1FBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQixDQUFBLEtBQXlCLE1BQTVCO1lBQ0ksSUFBQyxDQUFBLFdBQUQsQ0FBQTtZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLENBQVY7WUFDQSxJQUFHLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBZixDQUFUO2dCQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsY0FBaEIsQ0FBWixDQUFIO29CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQW1CLEdBQUQsR0FBSyxrQ0FBdkIsRUFDSTt3QkFBQSxHQUFBLEVBQVUsR0FBVjt3QkFDQSxRQUFBLEVBQVUsTUFEVjt3QkFFQSxLQUFBLEVBQVUsU0FGVjt3QkFHQSxLQUFBLEVBQVUsSUFIVjtxQkFESjtvQkFLQSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7QUFDQSwyQkFQSjtpQkFESjthQUhKOztlQVlBLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixRQUF6QjtJQWZTOzs7Ozs7QUFpQmpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyMjXG5cbmRlbGV0ZSBwcm9jZXNzLmVudi5FTEVDVFJPTl9FTkFCTEVfU0VDVVJJVFlfV0FSTklOR1NcbnByb2Nlc3MuZW52LkVMRUNUUk9OX0RJU0FCTEVfU0VDVVJJVFlfV0FSTklOR1MgPSB0cnVlXG5wcm9jZXNzLmVudi5OT0RFX05PX1dBUk5JTkdTID0gMVxuXG57IGFib3V0LCBhcmdzLCBjaGlsZHAsIGVtcHR5LCBmcywga2xvZywgb3MsIHBvc3QsIHByZWZzLCBzbGFzaCwgc3JjbWFwLCB2YWxpZCwgd2F0Y2ggfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5pZiBwcm9jZXNzLnR5cGUgPT0gJ2Jyb3dzZXInXG4gICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICBcbiAgICBwb3N0Lm9uR2V0ICdhcHBOYW1lJyAgLT4gZWxlY3Ryb24uYXBwLmdldE5hbWUoKVxuICAgIHBvc3Qub25HZXQgJ3VzZXJEYXRhJyAtPiBlbGVjdHJvbi5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgXG4gICAgcG9zdC5vbiAnb3BlbkZpbGVEaWFsb2cnIChvcHRpb25zKSAtPlxuICAgICAgICB3aW5JRCA9IHBvc3Quc2VuZGVyV2luSURcbiAgICAgICAgZWxlY3Ryb24uZGlhbG9nLnNob3dPcGVuRGlhbG9nKG9wdGlvbnMpLnRoZW4gKHJlc3VsdCkgLT4gcG9zdC50b1dpbiB3aW5JRCwgJ29wZW5GaWxlRGlhbG9nUmVzdWx0JyByZXN1bHRcblxuICAgIHBvc3Qub24gJ3NhdmVGaWxlRGlhbG9nJyAob3B0aW9ucykgLT5cbiAgICAgICAgd2luSUQgPSBwb3N0LnNlbmRlcldpbklEXG4gICAgICAgIGVsZWN0cm9uLmRpYWxvZy5zaG93U2F2ZURpYWxvZyhvcHRpb25zKS50aGVuIChyZXN1bHQpIC0+IHBvc3QudG9XaW4gd2luSUQsICdzYXZlRmlsZURpYWxvZ1Jlc3VsdCcgcmVzdWx0XG4gICAgICAgIFxuICAgIHBvc3Qub24gJ21lc3NhZ2VCb3gnIChvcHRpb25zKSAtPlxuICAgICAgICB3aW5JRCA9IHBvc3Quc2VuZGVyV2luSURcbiAgICAgICAgZWxlY3Ryb24uZGlhbG9nLnNob3dNZXNzYWdlQm94KG9wdGlvbnMpLnRoZW4gKHJlc3VsdCkgLT4gXG4gICAgICAgICAgICBwb3N0LnRvV2luIHdpbklELCAnbWVzc2FnZUJveFJlc3VsdCcgcmVzdWx0LnJlc3BvbnNlXG5lbHNlXG4gICAgZXJyb3IgXCJ0aGlzIHNob3VsZCBiZSB1c2VkIGluIG1haW4gcHJvY2VzcyBvbmx5ISBwcm9jZXNzLnR5cGU6ICN7cHJvY2Vzcy50eXBlfSBncmFuZHBhOiAje21vZHVsZS5wYXJlbnQucGFyZW50Py5maWxlbmFtZX0gcGFyZW50OiAje21vZHVsZS5wYXJlbnQuZmlsZW5hbWV9IG1vZHVsZTogI3ttb2R1bGUuZmlsZW5hbWV9XCJcbiAgICBcbmNsYXNzIEFwcFxuICAgIFxuICAgIEA6IChAb3B0KSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwcm9jZXNzLm9uICd1bmNhdWdodEV4Y2VwdGlvbicgKGVycikgLT5cbiAgICAgICAgICAgIHNyY21hcCA9IHJlcXVpcmUgJy4vc3JjbWFwJyAgICBcbiAgICAgICAgICAgIHNyY21hcC5sb2dFcnIgZXJyLCAn8J+UuydcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgQGFwcCA9IGVsZWN0cm9uLmFwcFxuICAgICAgICBAdXNlckRhdGEgPSBAYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAYXBwLmNvbW1hbmRMaW5lLmFwcGVuZFN3aXRjaCAnZGlzYWJsZS1zaXRlLWlzb2xhdGlvbi10cmlhbHMnXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5NZW51LnNldEFwcGxpY2F0aW9uTWVudSBAb3B0Lm1lbnVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5XG4gICAgICAgICAgICBrbG9nLnNsb2cuaWNvbiA9IHNsYXNoLmZpbGVVcmwgQHJlc29sdmUgQG9wdC50cmF5ICBcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdsID0gXCJcIlwiXG4gICAgICAgICAgICBub3ByZWZzICAgICBkb24ndCBsb2FkIHByZWZlcmVuY2VzICAgICAgZmFsc2VcbiAgICAgICAgICAgIGRldnRvb2xzICAgIG9wZW4gZGV2ZWxvcGVyIHRvb2xzICAgICAgICBmYWxzZSAgLURcbiAgICAgICAgICAgIHdhdGNoICAgICAgIHdhdGNoIHNvdXJjZXMgZm9yIGNoYW5nZXMgICBmYWxzZVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IEBvcHQuYXJncyArICdcXG4nICsgYXJnbCBpZiBAb3B0LmFyZ3NcbiAgICAgICAgYXJncyA9IGFyZ3MuaW5pdCBhcmdsXG4gICAgICAgIFxuICAgICAgICBvbk90aGVyID0gKGV2ZW50LCBhcmdzLCBkaXIpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQub25PdGhlckluc3RhbmNlXG4gICAgICAgICAgICAgICAgQG9wdC5vbk90aGVySW5zdGFuY2UgYXJncywgZGlyIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBzaG93V2luZG93KClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2luZ2xlICE9IGZhbHNlXG4gICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZT8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2Ugb25PdGhlclxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2UgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2soKVxuICAgICAgICAgICAgICAgICAgICBAYXBwLm9uICdzZWNvbmQtaW5zdGFuY2UnIG9uT3RoZXJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uaXBjTWFpbi5vbiAnbWVudUFjdGlvbicgICBAb25NZW51QWN0aW9uXG4gICAgICAgIGVsZWN0cm9uLmlwY01haW4ub24gJ2dldFdpbkJvdW5kcycgQG9uR2V0V2luQm91bmRzXG4gICAgICAgIGVsZWN0cm9uLmlwY01haW4ub24gJ3NldFdpbkJvdW5kcycgQG9uU2V0V2luQm91bmRzXG4gICAgICAgIGVsZWN0cm9uLmlwY01haW4ub24gJ2dldFdpbklEJyAgICAgQG9uR2V0V2luSURcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgICAgIEBhcHAub24gJ3JlYWR5JyBAb25SZWFkeVxuICAgICAgICBAYXBwLm9uICdhY3RpdmF0ZScgQG9uQWN0aXZhdGVcbiAgICAgICAgQGFwcC5vbiAnd2luZG93LWFsbC1jbG9zZWQnIChldmVudCkgPT4gXG4gICAgICAgICAgICBpZiBAb3B0LnRyYXlcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcXVpdEFwcCgpXG4gICAgICAgIFxuICAgIHJlc29sdmU6IChmaWxlKSA9PiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGZpbGVcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiAgICBcbiAgICBvblJlYWR5OiA9PlxuICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXkgdGhlbiBAaW5pdFRyYXkoKVxuICAgICAgICAgXG4gICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgICBcbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICBcbiAgICAgICAgaWYgbm90IGFyZ3Mubm9wcmVmc1xuICAgICAgICAgICAgc2VwID0gQG9wdC5wcmVmc1NlcGVyYXRvciA/ICfilrgnXG4gICAgICAgICAgICBpZiBAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzZXBhcmF0b3I6c2VwLCBkZWZhdWx0czpzaG9ydGN1dDpAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzZXBhcmF0b3I6c2VwXG4gICAgXG4gICAgICAgIGlmIHZhbGlkIHByZWZzLmdldCAnc2hvcnRjdXQnXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBwcmVmcy5nZXQoJ3Nob3J0Y3V0JyksIEBvcHQub25TaG9ydGN1dCA/IEBzaG93V2luZG93XG4gICAgICAgICAgICAgXG4gICAgICAgIGlmIGFyZ3Mud2F0Y2hcbiAgICAgICAgICAgIGtsb2cgJ0FwcC5vblJlYWR5IHN0YXJ0V2F0Y2hlcidcbiAgICAgICAgICAgIEBzdGFydFdhdGNoZXIoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vblNob3dcbiAgICAgICAgICAgIEBvcHQub25TaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuXG4gICAgICAgIHBvc3QuZW1pdCAnYXBwUmVhZHknXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5pdFRyYXk6ID0+XG4gICAgICAgIFxuICAgICAgICB0cmF5SW1nID0gQHJlc29sdmUgQG9wdC50cmF5XG4gICAgICAgIEB0cmF5ID0gbmV3IGVsZWN0cm9uLlRyYXkgdHJheUltZ1xuICAgICAgICBAdHJheS5vbiAnY2xpY2snIEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSAhPSAnZGFyd2luJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBbXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiUXVpdFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBxdWl0QXBwXG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWJvdXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAc2hvd0Fib3V0XG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWN0aXZhdGVcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIEB0cmF5LnNldENvbnRleHRNZW51IGVsZWN0cm9uLk1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgdGVtcGxhdGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNob3dBYm91dDogPT5cbiAgICAgICAgXG4gICAgICAgIGRhcmsgPSAnZGFyaycgPT0gcHJlZnMuZ2V0ICdzY2hlbWUnICdkYXJrJ1xuICAgICAgICBhYm91dFxuICAgICAgICAgICAgaW1nOiAgICAgICAgQHJlc29sdmUgQG9wdC5hYm91dFxuICAgICAgICAgICAgY29sb3I6ICAgICAgZGFyayBhbmQgJyMzMzMnIG9yICcjZGRkJ1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMxMTEnIG9yICcjZmZmJ1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiAgZGFyayBhbmQgJyNmZmYnIG9yICcjMDAwJ1xuICAgICAgICAgICAgcGtnOiAgICAgICAgQG9wdC5wa2dcbiAgICAgICAgICAgIGRlYnVnOiAgICAgIEBvcHQuYWJvdXREZWJ1Z1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcXVpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHNhdmVCb3VuZHMoKVxuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdkZWxheScgIT0gQG9wdC5vblF1aXQ/KClcbiAgICAgICAgICAgIEBleGl0QXBwKClcbiAgICAgICAgICAgIFxuICAgIGV4aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGhpZGVEb2NrOiA9PiBAYXBwLmRvY2s/LmhpZGUoKVxuICAgIHNob3dEb2NrOiA9PiBAYXBwLmRvY2s/LnNob3coKVxuICAgICAgICBcbiAgICAjMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIzAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgXG4gICAgdG9nZ2xlV2luZG93RnJvbVRyYXk6ID0+IEBzaG93V2luZG93KClcbiAgICAgICBcbiAgICBvbkFjdGl2YXRlOiAoZXZlbnQsIGhhc1Zpc2libGVXaW5kb3dzKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vbkFjdGl2YXRlXG4gICAgICAgICAgICBpZiBAb3B0Lm9uQWN0aXZhdGUgZXZlbnQsIGhhc1Zpc2libGVXaW5kb3dzXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBoYXNWaXNpYmxlV2luZG93c1xuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuICAgICAgICAgICAgICAgIFxuICAgIHNob3dXaW5kb3c6ID0+XG5cbiAgICAgICAgQG9wdC5vbldpbGxTaG93V2luPygpXG4gICAgICAgIFxuICAgICAgICBpZiBAd2luP1xuICAgICAgICAgICAgQHdpbi5zaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNyZWF0ZVdpbmRvdygpXG4gICAgICAgICAgICBcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNyZWF0ZVdpbmRvdzogKG9uUmVhZHlUb1Nob3cpID0+XG4gICAgXG4gICAgICAgIG9uUmVhZHlUb1Nob3cgPz0gQG9wdC5vbldpblJlYWR5XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCAnYm91bmRzJ1xuICAgICAgICAgICAgXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICBAb3B0Lm1pbldpZHRoICAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICBAb3B0Lm1pbkhlaWdodCAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgbWF4V2lkdGg6ICAgICAgICAgICBAb3B0Lm1heFdpZHRoICAgICAgICAgICA/IDEwMDAwMFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiAgICAgICAgICBAb3B0Lm1heEhlaWdodCAgICAgICAgICA/IDEwMDAwMFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICBAb3B0LmJhY2tncm91bmRDb2xvciAgICA/ICcjMTgxODE4J1xuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBAb3B0LmZyYW1lICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIEBvcHQudHJhbnNwYXJlbnQgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgQG9wdC5mdWxsc2NyZWVuICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmFibGU6ICAgICBAb3B0LmZ1bGxzY3JlZW5hYmxlICAgICA/IHRydWVcbiAgICAgICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgQG9wdC5hY2NlcHRGaXJzdE1vdXNlICAgPyB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgIEBvcHQucmVzaXphYmxlICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICBAb3B0Lm1heGltaXphYmxlICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgQG9wdC5taW5pbWl6YWJsZSAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgIEBvcHQuY2xvc2FibGUgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgYXV0b0hpZGVNZW51QmFyOiAgICB0cnVlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBpY29uOiAgICAgICAgICAgICAgIEByZXNvbHZlIEBvcHQuaWNvbiBcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBjb250ZXh0SXNvbGF0aW9uOiAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246ICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbkluV29ya2VyOiB0cnVlXG4gICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgIFxuICAgICAgICBpZiBAb3B0LmluZGV4VVJMXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgQG9wdC5pbmRleCwgYmFzZVVSTEZvckRhdGFVUkw6QG9wdC5pbmRleFVSTFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIFxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9uICdkZXZ0b29scy1vcGVuZWQnIChldmVudCkgLT4gcG9zdC50b1dpbiBldmVudC5zZW5kZXIuaWQsICdkZXZUb29scycgdHJ1ZVxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9uICdkZXZ0b29scy1jbG9zZWQnIChldmVudCkgLT4gcG9zdC50b1dpbiBldmVudC5zZW5kZXIuaWQsICdkZXZUb29scycgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyhtb2RlOidkZXRhY2gnKSBpZiBhcmdzLmRldnRvb2xzXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAc2F2ZUJvdW5kc1xuICAgICAgICAgICAgQHdpbi5vbiAnbW92ZScgICBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdjbG9zZWQnID0+IEB3aW4gPSBudWxsXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyAgPT4gaWYgQG9wdC5zaW5nbGUgdGhlbiBAaGlkZURvY2soKVxuICAgICAgICBAd2luLm9uICdtb3ZlZCcgIChldmVudCkgPT4gcG9zdC50b1dpbiBldmVudC5zZW5kZXIsICd3aW5Nb3ZlZCcgZXZlbnQuc2VuZGVyLmdldEJvdW5kcygpXG4gICAgICAgIEB3aW4ub24gJ3JlYWR5LXRvLXNob3cnICgodywgb3J0cykgLT4gLT4gXG4gICAgICAgICAgICBvcnRzPyB3XG4gICAgICAgICAgICB3LnNob3coKSBcbiAgICAgICAgICAgIHBvc3QuZW1pdCAnd2luUmVhZHknIHcuaWRcbiAgICAgICAgICAgICkgQHdpbiwgb25SZWFkeVRvU2hvdyBcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBAd2luXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uU2V0V2luQm91bmRzOiAoZXZlbnQsIGJvdW5kcykgPT5cblxuICAgICAgICBAd2luRm9yRXZlbnQoZXZlbnQpPy5zZXRCb3VuZHMgYm91bmRzXG4gICAgICAgIFxuICAgIG9uR2V0V2luQm91bmRzOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IEB3aW5Gb3JFdmVudChldmVudCk/LmdldEJvdW5kcygpXG4gICAgICAgXG4gICAgb25HZXRXaW5JRDogKGV2ZW50KSA9PiBldmVudC5yZXR1cm5WYWx1ZSA9IGV2ZW50LnNlbmRlci5pZFxuIFxuICAgIHNhdmVCb3VuZHM6ID0+IGlmIEB3aW4/IHRoZW4gcHJlZnMuc2V0ICdib3VuZHMnIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgc2NyZWVuU2l6ZTogLT4gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgIFxuICAgIGFsbFdpbnM6IC0+IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLnNvcnQgKGEsYikgLT4gYS5pZCAtIGIuaWRcbiAgICAgICAgXG4gICAgd2luRm9yRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZnJvbVdlYkNvbnRlbnRzIGV2ZW50LnNlbmRlclxuICAgICAgICBpZiBub3Qgd1xuICAgICAgICAgICAga2xvZyAnbm8gd2luPycgZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgICAgICBmb3IgdyBpbiBAYWxsV2lucygpXG4gICAgICAgICAgICAgICAga2xvZyAnd2luJyB3LmlkLCB3LndlYkNvbnRlbnRzLmlkXG4gICAgICAgIHdcblxuICAgIHRvZ2dsZURldlRvb2xzOiAod2MpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB3Yy5pc0RldlRvb2xzT3BlbmVkKClcbiAgICAgICAgICAgIHdjLmNsb3NlRGV2VG9vbHMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3Yy5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoZXZlbnQsIGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIGtsb2cgJ2t4ay5hcHAub25NZW51QWN0aW9uJyBhY3Rpb24sIGV2ZW50LnNlbmRlci5pZFxuICAgICAgICBcbiAgICAgICAgaWYgdyA9IEB3aW5Gb3JFdmVudCBldmVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzd2l0Y2ggYWN0aW9uLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICB3aGVuICdhYm91dCcgICAgICAgdGhlbiBAc2hvd0Fib3V0KClcbiAgICAgICAgICAgICAgICB3aGVuICdxdWl0JyAgICAgICAgdGhlbiBAcXVpdEFwcCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnc2NyZWVuc2hvdCcgIHRoZW4gQHNjcmVlbnNob3Qgd1xuICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bGxzY3JlZW4nICB0aGVuIHcuc2V0RnVsbFNjcmVlbiAhdy5pc0Z1bGxTY3JlZW4oKVxuICAgICAgICAgICAgICAgIHdoZW4gJ2RldnRvb2xzJyAgICB0aGVuIEB0b2dnbGVEZXZUb29scyB3LndlYkNvbnRlbnRzXG4gICAgICAgICAgICAgICAgd2hlbiAncmVsb2FkJyAgICAgIHRoZW4gdy53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgICAgICB3aGVuICdjbG9zZScgICAgICAgdGhlbiB3LmNsb3NlKClcbiAgICAgICAgICAgICAgICB3aGVuICdoaWRlJyAgICAgICAgdGhlbiB3LmhpZGUoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ21pbmltaXplJyAgICB0aGVuIHcubWluaW1pemUoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ21heGltaXplJyBcbiAgICAgICAgICAgICAgICAgICAgd2EgPSBAc2NyZWVuU2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIHdiID0gdy5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3LmlzTWF4aW1pemVkKCkgb3IgKHdiLndpZHRoID09IHdhLndpZHRoIGFuZCB3Yi5oZWlnaHQgPT0gd2EuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBpZiBtYXhpbWl6ZWQgdGhlbiB3LnVubWF4aW1pemUoKSBlbHNlIHcubWF4aW1pemUoKSAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGtsb2cgXCJreGsuYXBwLm9uTWVudUFjdGlvbiBOTyBXSU4hXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgMDAwXG4gICAgXG4gICAgc2NyZWVuc2hvdDogKHcpIC0+XG4gICAgICAgIFxuICAgICAgICB3LndlYkNvbnRlbnRzLmNhcHR1cmVQYWdlKCkudGhlbiAoaW1nKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gudW51c2VkIFwifi9EZXNrdG9wLyN7QG9wdC5wa2cubmFtZX0ucG5nXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZnMud3JpdGVGaWxlIGZpbGUsIGltZy50b1BORygpLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgICAgICAgICBrbG9nICdzYXZpbmcgc2NyZWVuc2hvdCBmYWlsZWQnIGVyclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2xvZyBcInNjcmVlbnNob3Qgc2F2ZWQgdG8gI3tmaWxlfVwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuICAgICAgICBcbiAgICBzdGFydFdhdGNoZXI6ID0+XG4gICAgICAgIFxuICAgICAgICBAb3B0LmRpciA9IHNsYXNoLnJlc29sdmUgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnIEBvblNyY0NoYW5nZVxuICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXJcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAb3B0LmRpcnNcbiAgICAgICAgXG4gICAgICAgIGZvciBkaXIgaW4gQG9wdC5kaXJzXG4gICAgICAgICAgICB0b1dhdGNoID0gaWYgc2xhc2guaXNSZWxhdGl2ZSBkaXJcbiAgICAgICAgICAgICAgICBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGRpclxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNsYXNoLnJlc29sdmUgZGlyXG4gICAgICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIHRvV2F0Y2hcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyIFxuICAgIFxuICAgIHN0b3BXYXRjaGVyOiA9PlxuICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAd2F0Y2hlcnNcbiAgICAgICAgZm9yIHdhdGNoZXIgaW4gQHdhdGNoZXJzXG4gICAgICAgICAgICB3YXRjaGVyLmNsb3NlKClcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICBcbiAgICBvblNyY0NoYW5nZTogKGluZm8pID0+XG4gICAgXG4gICAgICAgICMga2xvZyAnb25TcmNDaGFuZ2UnIGluZm8uY2hhbmdlLCBpbmZvLnBhdGhcbiAgICAgICAgaWYgc2xhc2guYmFzZShpbmZvLnBhdGgpID09ICdtYWluJ1xuICAgICAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgICAgIEBhcHAuZXhpdCAwXG4gICAgICAgICAgICBpZiBwa2cgPSBzbGFzaC5wa2cgQG9wdC5kaXJcbiAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHBrZywgJ25vZGVfbW9kdWxlcydcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiI3twa2d9L25vZGVfbW9kdWxlcy8uYmluL2VsZWN0cm9uIC4gLXdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGN3ZDogICAgICBwa2dcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGlvOiAgICAnaW5oZXJpdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsOiAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBwb3N0LnRvV2lucyAnbWVudUFjdGlvbicgJ1JlbG9hZCdcbiAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwXG4gICAgXG4iXX0=
//# sourceURL=../coffee/app.coffee