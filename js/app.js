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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiYXBwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0R0FBQTtJQUFBOztBQVFBLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQzs7QUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBWixHQUFpRDs7QUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBWixHQUErQjs7QUFFL0IsTUFBeUYsT0FBQSxDQUFRLE9BQVIsQ0FBekYsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxtQkFBZixFQUF1QixpQkFBdkIsRUFBOEIsV0FBOUIsRUFBa0MsZUFBbEMsRUFBd0MsV0FBeEMsRUFBNEMsZUFBNUMsRUFBa0QsaUJBQWxELEVBQXlELGlCQUF6RCxFQUFnRSxtQkFBaEUsRUFBd0UsaUJBQXhFLEVBQStFOztBQUUvRSxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFNBQW5CO0lBQ0ksUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO0lBRVgsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLEVBQXNCLFNBQUE7ZUFBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQWIsQ0FBQTtJQUFILENBQXRCO0lBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFYLEVBQXNCLFNBQUE7ZUFBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQWIsQ0FBcUIsVUFBckI7SUFBSCxDQUF0QjtJQUVBLElBQUksQ0FBQyxFQUFMLENBQVEsZ0JBQVIsRUFBeUIsU0FBQyxPQUFEO0FBQ3JCLFlBQUE7UUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDO2VBQ2IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFoQixDQUErQixPQUEvQixDQUF1QyxDQUFDLElBQXhDLENBQTZDLFNBQUMsTUFBRDttQkFBWSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVgsRUFBa0Isc0JBQWxCLEVBQXlDLE1BQXpDO1FBQVos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LElBQVUsS0FBQSxDQUFNLElBQUMsQ0FBQSxRQUFQLENBQVY7QUFBQSxtQkFBQTs7QUFDQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksT0FBTyxDQUFDLEtBQVIsQ0FBQTtBQURKO2VBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUxIOztrQkFPYixXQUFBLEdBQWEsU0FBQyxJQUFEO0FBR1QsWUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEIsQ0FBQSxLQUF5QixNQUE1QjtZQUNJLElBQUMsQ0FBQSxXQUFELENBQUE7WUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxDQUFWO1lBQ0EsSUFBRyxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQWYsQ0FBVDtnQkFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLGNBQWhCLENBQVosQ0FBSDtvQkFDSSxNQUFNLENBQUMsUUFBUCxDQUFtQixHQUFELEdBQUssa0NBQXZCLEVBQ0k7d0JBQUEsR0FBQSxFQUFVLEdBQVY7d0JBQ0EsUUFBQSxFQUFVLE1BRFY7d0JBRUEsS0FBQSxFQUFVLFNBRlY7d0JBR0EsS0FBQSxFQUFVLElBSFY7cUJBREo7b0JBS0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0FBQ0EsMkJBUEo7aUJBREo7YUFISjs7ZUFZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsUUFBekI7SUFmUzs7Ozs7O0FBaUJqQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG5kZWxldGUgcHJvY2Vzcy5lbnYuRUxFQ1RST05fRU5BQkxFX1NFQ1VSSVRZX1dBUk5JTkdTXG5wcm9jZXNzLmVudi5FTEVDVFJPTl9ESVNBQkxFX1NFQ1VSSVRZX1dBUk5JTkdTID0gdHJ1ZVxucHJvY2Vzcy5lbnYuTk9ERV9OT19XQVJOSU5HUyA9IDFcblxueyBhYm91dCwgYXJncywgY2hpbGRwLCBlbXB0eSwgZnMsIGtsb2csIG9zLCBwb3N0LCBwcmVmcywgc2xhc2gsIHNyY21hcCwgdmFsaWQsIHdhdGNoIH0gPSByZXF1aXJlICcuL2t4aydcblxuaWYgcHJvY2Vzcy50eXBlID09ICdicm93c2VyJ1xuICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgXG4gICAgcG9zdC5vbkdldCAnYXBwTmFtZScgIC0+IGVsZWN0cm9uLmFwcC5nZXROYW1lKClcbiAgICBwb3N0Lm9uR2V0ICd1c2VyRGF0YScgLT4gZWxlY3Ryb24uYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgIFxuICAgIHBvc3Qub24gJ29wZW5GaWxlRGlhbG9nJyAob3B0aW9ucykgLT5cbiAgICAgICAgd2luSUQgPSBwb3N0LnNlbmRlcldpbklEXG4gICAgICAgIGVsZWN0cm9uLmRpYWxvZy5zaG93T3BlbkRpYWxvZyhvcHRpb25zKS50aGVuIChyZXN1bHQpIC0+IHBvc3QudG9XaW4gd2luSUQsICdvcGVuRmlsZURpYWxvZ1Jlc3VsdCcgcmVzdWx0XG5cbiAgICBwb3N0Lm9uICdzYXZlRmlsZURpYWxvZycgKG9wdGlvbnMpIC0+XG4gICAgICAgIHdpbklEID0gcG9zdC5zZW5kZXJXaW5JRFxuICAgICAgICBlbGVjdHJvbi5kaWFsb2cuc2hvd1NhdmVEaWFsb2cob3B0aW9ucykudGhlbiAocmVzdWx0KSAtPiBwb3N0LnRvV2luIHdpbklELCAnc2F2ZUZpbGVEaWFsb2dSZXN1bHQnIHJlc3VsdFxuICAgICAgICBcbiAgICBwb3N0Lm9uICdtZXNzYWdlQm94JyAob3B0aW9ucykgLT5cbiAgICAgICAgd2luSUQgPSBwb3N0LnNlbmRlcldpbklEXG4gICAgICAgIGVsZWN0cm9uLmRpYWxvZy5zaG93TWVzc2FnZUJveChvcHRpb25zKS50aGVuIChyZXN1bHQpIC0+IFxuICAgICAgICAgICAgcG9zdC50b1dpbiB3aW5JRCwgJ21lc3NhZ2VCb3hSZXN1bHQnIHJlc3VsdC5yZXNwb25zZVxuZWxzZVxuICAgIGVycm9yIFwidGhpcyBzaG91bGQgYmUgdXNlZCBpbiBtYWluIHByb2Nlc3Mgb25seSEgcHJvY2Vzcy50eXBlOiAje3Byb2Nlc3MudHlwZX0gZ3JhbmRwYTogI3ttb2R1bGUucGFyZW50LnBhcmVudD8uZmlsZW5hbWV9IHBhcmVudDogI3ttb2R1bGUucGFyZW50LmZpbGVuYW1lfSBtb2R1bGU6ICN7bW9kdWxlLmZpbGVuYW1lfVwiXG4gICAgXG5jbGFzcyBBcHBcbiAgICBcbiAgICBAOiAoQG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJvY2Vzcy5vbiAndW5jYXVnaHRFeGNlcHRpb24nIChlcnIpIC0+XG4gICAgICAgICAgICBzcmNtYXAgPSByZXF1aXJlICcuL3NyY21hcCcgICAgXG4gICAgICAgICAgICBzcmNtYXAubG9nRXJyIGVyciwgJ/CflLsnXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHVzZXJEYXRhID0gQGFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGFwcC5jb21tYW5kTGluZS5hcHBlbmRTd2l0Y2ggJ2Rpc2FibGUtc2l0ZS1pc29sYXRpb24tdHJpYWxzJ1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uTWVudS5zZXRBcHBsaWNhdGlvbk1lbnUgQG9wdC5tZW51XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQudHJheVxuICAgICAgICAgICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgb25PdGhlciA9IChldmVudCwgYXJncywgZGlyKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0Lm9uT3RoZXJJbnN0YW5jZVxuICAgICAgICAgICAgICAgIEBvcHQub25PdGhlckluc3RhbmNlIGFyZ3MsIGRpciBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2hvd1dpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNpbmdsZSAhPSBmYWxzZVxuICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2U/IFxuICAgICAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlIG9uT3RoZXJcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaz8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKClcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5vbiAnc2Vjb25kLWluc3RhbmNlJyBvbk90aGVyXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLmlwY01haW4ub24gJ21lbnVBY3Rpb24nICAgQG9uTWVudUFjdGlvblxuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdnZXRXaW5Cb3VuZHMnIEBvbkdldFdpbkJvdW5kc1xuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdzZXRXaW5Cb3VuZHMnIEBvblNldFdpbkJvdW5kc1xuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdnZXRXaW5JRCcgICAgIEBvbkdldFdpbklEXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScgQG9uUmVhZHlcbiAgICAgICAgQGFwcC5vbiAnYWN0aXZhdGUnIEBvbkFjdGl2YXRlXG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJyAoZXZlbnQpID0+IFxuICAgICAgICAgICAgaWYgQG9wdC50cmF5XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHF1aXRBcHAoKVxuICAgICAgICBcbiAgICByZXNvbHZlOiAoZmlsZSkgPT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBmaWxlXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4gICAgXG4gICAgb25SZWFkeTogPT5cbiAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5IHRoZW4gQGluaXRUcmF5KClcbiAgICAgICAgIFxuICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICAgXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgXG4gICAgICAgIGlmIG5vdCBhcmdzLm5vcHJlZnNcbiAgICAgICAgICAgIHNlcCA9IEBvcHQucHJlZnNTZXBlcmF0b3IgPyAn4pa4J1xuICAgICAgICAgICAgaWYgQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcCwgZGVmYXVsdHM6c2hvcnRjdXQ6QG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcFxuICAgIFxuICAgICAgICBpZiB2YWxpZCBwcmVmcy5nZXQgJ3Nob3J0Y3V0J1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KCdzaG9ydGN1dCcpLCBAb3B0Lm9uU2hvcnRjdXQgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLndhdGNoXG4gICAgICAgICAgICBrbG9nICdBcHAub25SZWFkeSBzdGFydFdhdGNoZXInXG4gICAgICAgICAgICBAc3RhcnRXYXRjaGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25TaG93XG4gICAgICAgICAgICBAb3B0Lm9uU2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgICAgICBwb3N0LmVtaXQgJ2FwcFJlYWR5J1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluaXRUcmF5OiA9PlxuICAgICAgICBcbiAgICAgICAgdHJheUltZyA9IEByZXNvbHZlIEBvcHQudHJheVxuICAgICAgICBAdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IHRyYXlJbWdcbiAgICAgICAgQHRyYXkub24gJ2NsaWNrJyBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ2RhcndpbidcbiAgICAgICAgICAgIHRlbXBsYXRlID0gW1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIlF1aXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAcXVpdEFwcFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFib3V0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHNob3dBYm91dFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjdGl2YXRlXCJcbiAgICAgICAgICAgICAgICBjbGljazogQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBAdHJheS5zZXRDb250ZXh0TWVudSBlbGVjdHJvbi5NZW51LmJ1aWxkRnJvbVRlbXBsYXRlIHRlbXBsYXRlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBzaG93QWJvdXQ6ID0+XG4gICAgICAgIFxuICAgICAgICBkYXJrID0gJ2RhcmsnID09IHByZWZzLmdldCAnc2NoZW1lJyAnZGFyaydcbiAgICAgICAgYWJvdXRcbiAgICAgICAgICAgIGltZzogICAgICAgIEByZXNvbHZlIEBvcHQuYWJvdXRcbiAgICAgICAgICAgIGNvbG9yOiAgICAgIGRhcmsgYW5kICcjMzMzJyBvciAnI2RkZCdcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGRhcmsgYW5kICcjMTExJyBvciAnI2ZmZidcbiAgICAgICAgICAgIGhpZ2hsaWdodDogIGRhcmsgYW5kICcjZmZmJyBvciAnIzAwMCdcbiAgICAgICAgICAgIHBrZzogICAgICAgIEBvcHQucGtnXG4gICAgICAgICAgICBkZWJ1ZzogICAgICBAb3B0LmFib3V0RGVidWdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHF1aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAnZGVsYXknICE9IEBvcHQub25RdWl0PygpXG4gICAgICAgICAgICBAZXhpdEFwcCgpXG4gICAgICAgICAgICBcbiAgICBleGl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBoaWRlRG9jazogPT4gQGFwcC5kb2NrPy5oaWRlKClcbiAgICBzaG93RG9jazogPT4gQGFwcC5kb2NrPy5zaG93KClcbiAgICAgICAgXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgIFxuICAgIHRvZ2dsZVdpbmRvd0Zyb21UcmF5OiA9PiBAc2hvd1dpbmRvdygpXG4gICAgICAgXG4gICAgb25BY3RpdmF0ZTogKGV2ZW50LCBoYXNWaXNpYmxlV2luZG93cykgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25BY3RpdmF0ZVxuICAgICAgICAgICAgaWYgQG9wdC5vbkFjdGl2YXRlIGV2ZW50LCBoYXNWaXNpYmxlV2luZG93c1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgaGFzVmlzaWJsZVdpbmRvd3NcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcbiAgICAgICAgICAgICAgICBcbiAgICBzaG93V2luZG93OiA9PlxuXG4gICAgICAgIEBvcHQub25XaWxsU2hvd1dpbj8oKVxuICAgICAgICBcbiAgICAgICAgaWYgQHdpbj9cbiAgICAgICAgICAgIEB3aW4uc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBjcmVhdGVXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjcmVhdGVXaW5kb3c6IChvblJlYWR5VG9TaG93KSA9PlxuICAgIFxuICAgICAgICBvblJlYWR5VG9TaG93ID89IEBvcHQub25XaW5SZWFkeVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zYXZlQm91bmRzICE9IGZhbHNlXG4gICAgICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgJ2JvdW5kcydcbiAgICAgICAgICAgIFxuICAgICAgICB3aWR0aCAgPSBib3VuZHM/LndpZHRoICA/IEBvcHQud2lkdGggID8gNTAwXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcz8uaGVpZ2h0ID8gQG9wdC5oZWlnaHQgPyA1MDBcbiAgICAgICAgXG4gICAgICAgIEB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgIG1pbldpZHRoOiAgICAgICAgICAgQG9wdC5taW5XaWR0aCAgICAgICAgICAgPyAyNTBcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAgICAgQG9wdC5taW5IZWlnaHQgICAgICAgICAgPyAyNTBcbiAgICAgICAgICAgIG1heFdpZHRoOiAgICAgICAgICAgQG9wdC5tYXhXaWR0aCAgICAgICAgICAgPyAxMDAwMDBcbiAgICAgICAgICAgIG1heEhlaWdodDogICAgICAgICAgQG9wdC5tYXhIZWlnaHQgICAgICAgICAgPyAxMDAwMDBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgQG9wdC5iYWNrZ3JvdW5kQ29sb3IgICAgPyAnIzE4MTgxOCdcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgQG9wdC5mcmFtZSAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICBAb3B0LnRyYW5zcGFyZW50ICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIEBvcHQuZnVsbHNjcmVlbiAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5hYmxlOiAgICAgQG9wdC5mdWxsc2NyZWVuYWJsZSAgICAgPyB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIEBvcHQuYWNjZXB0Rmlyc3RNb3VzZSAgID8gdHJ1ZVxuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBAb3B0LnJlc2l6YWJsZSAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgICAgQG9wdC5tYXhpbWl6YWJsZSAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgIEBvcHQubWluaW1pemFibGUgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgY2xvc2FibGU6ICAgICAgICAgICBAb3B0LmNsb3NhYmxlICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICAgICAgdGhpY2tGcmFtZTogICAgICAgICBmYWxzZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgaWNvbjogICAgICAgICAgICAgICBAcmVzb2x2ZSBAb3B0Lmljb24gXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgY29udGV4dElzb2xhdGlvbjogICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb25JbldvcmtlcjogdHJ1ZVxuICAgXG4gICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55IGlmIGJvdW5kcz9cbiAgICBcbiAgICAgICAgaWYgQG9wdC5pbmRleFVSTFxuICAgICAgICAgICAgQHdpbi5sb2FkVVJMIEBvcHQuaW5kZXgsIGJhc2VVUkxGb3JEYXRhVVJMOkBvcHQuaW5kZXhVUkxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHdpbi5sb2FkVVJMIHNsYXNoLmZpbGVVcmwgQHJlc29sdmUgQG9wdC5pbmRleFxuICAgICAgICBcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vbiAnZGV2dG9vbHMtb3BlbmVkJyAoZXZlbnQpIC0+IHBvc3QudG9XaW4gZXZlbnQuc2VuZGVyLmlkLCAnZGV2VG9vbHMnIHRydWVcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vbiAnZGV2dG9vbHMtY2xvc2VkJyAoZXZlbnQpIC0+IHBvc3QudG9XaW4gZXZlbnQuc2VuZGVyLmlkLCAnZGV2VG9vbHMnIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMobW9kZTonZGV0YWNoJykgaWYgYXJncy5kZXZ0b29sc1xuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55IGlmIGJvdW5kcz9cbiAgICAgICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQHNhdmVCb3VuZHNcbiAgICAgICAgICAgIEB3aW4ub24gJ21vdmUnICAgQHNhdmVCb3VuZHNcbiAgICAgICAgQHdpbi5vbiAnY2xvc2VkJyA9PiBAd2luID0gbnVsbFxuICAgICAgICBAd2luLm9uICdjbG9zZScgID0+IGlmIEBvcHQuc2luZ2xlIHRoZW4gQGhpZGVEb2NrKClcbiAgICAgICAgQHdpbi5vbiAnbW92ZWQnICAoZXZlbnQpID0+IHBvc3QudG9XaW4gZXZlbnQuc2VuZGVyLCAnd2luTW92ZWQnIGV2ZW50LnNlbmRlci5nZXRCb3VuZHMoKVxuICAgICAgICBAd2luLm9uICdyZWFkeS10by1zaG93JyAoKHcsIG9ydHMpIC0+IC0+IFxuICAgICAgICAgICAgb3J0cz8gd1xuICAgICAgICAgICAgdy5zaG93KCkgXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ3dpblJlYWR5JyB3LmlkXG4gICAgICAgICAgICApIEB3aW4sIG9uUmVhZHlUb1Nob3cgXG4gICAgICAgICAgICBcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgQHdpblxuXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvblNldFdpbkJvdW5kczogKGV2ZW50LCBib3VuZHMpID0+XG5cbiAgICAgICAgQHdpbkZvckV2ZW50KGV2ZW50KT8uc2V0Qm91bmRzIGJvdW5kc1xuICAgICAgICBcbiAgICBvbkdldFdpbkJvdW5kczogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSBAd2luRm9yRXZlbnQoZXZlbnQpPy5nZXRCb3VuZHMoKVxuICAgICAgIFxuICAgIG9uR2V0V2luSUQ6IChldmVudCkgPT4gZXZlbnQucmV0dXJuVmFsdWUgPSBldmVudC5zZW5kZXIuaWRcbiBcbiAgICBzYXZlQm91bmRzOiA9PiBpZiBAd2luPyB0aGVuIHByZWZzLnNldCAnYm91bmRzJyBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgIHNjcmVlblNpemU6IC0+IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICBcbiAgICBhbGxXaW5zOiAtPiBlbGVjdHJvbi5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKS5zb3J0IChhLGIpIC0+IGEuaWQgLSBiLmlkXG4gICAgICAgIFxuICAgIHdpbkZvckV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHcgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93LmZyb21XZWJDb250ZW50cyBldmVudC5zZW5kZXJcbiAgICAgICAgaWYgbm90IHdcbiAgICAgICAgICAgIGtsb2cgJ25vIHdpbj8nIGV2ZW50LnNlbmRlci5pZFxuICAgICAgICAgICAgZm9yIHcgaW4gQGFsbFdpbnMoKVxuICAgICAgICAgICAgICAgIGtsb2cgJ3dpbicgdy5pZCwgdy53ZWJDb250ZW50cy5pZFxuICAgICAgICB3XG5cbiAgICB0b2dnbGVEZXZUb29sczogKHdjKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgd2MuaXNEZXZUb29sc09wZW5lZCgpXG4gICAgICAgICAgICB3Yy5jbG9zZURldlRvb2xzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2Mub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGV2ZW50LCBhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2t4ay5hcHAub25NZW51QWN0aW9uJyBhY3Rpb24sIGV2ZW50LnNlbmRlci5pZFxuICAgICAgICBcbiAgICAgICAgaWYgdyA9IEB3aW5Gb3JFdmVudCBldmVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzd2l0Y2ggYWN0aW9uLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICB3aGVuICdhYm91dCcgICAgICAgdGhlbiBAc2hvd0Fib3V0KClcbiAgICAgICAgICAgICAgICB3aGVuICdxdWl0JyAgICAgICAgdGhlbiBAcXVpdEFwcCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnc2NyZWVuc2hvdCcgIHRoZW4gQHNjcmVlbnNob3Qgd1xuICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bGxzY3JlZW4nICB0aGVuIHcuc2V0RnVsbFNjcmVlbiAhdy5pc0Z1bGxTY3JlZW4oKVxuICAgICAgICAgICAgICAgIHdoZW4gJ2RldnRvb2xzJyAgICB0aGVuIEB0b2dnbGVEZXZUb29scyB3LndlYkNvbnRlbnRzXG4gICAgICAgICAgICAgICAgd2hlbiAncmVsb2FkJyAgICAgIHRoZW4gdy53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgICAgICB3aGVuICdjbG9zZScgICAgICAgdGhlbiB3LmNsb3NlKClcbiAgICAgICAgICAgICAgICB3aGVuICdoaWRlJyAgICAgICAgdGhlbiB3LmhpZGUoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ21pbmltaXplJyAgICB0aGVuIHcubWluaW1pemUoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ21heGltaXplJyBcbiAgICAgICAgICAgICAgICAgICAgd2EgPSBAc2NyZWVuU2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIHdiID0gdy5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3LmlzTWF4aW1pemVkKCkgb3IgKHdiLndpZHRoID09IHdhLndpZHRoIGFuZCB3Yi5oZWlnaHQgPT0gd2EuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBpZiBtYXhpbWl6ZWQgdGhlbiB3LnVubWF4aW1pemUoKSBlbHNlIHcubWF4aW1pemUoKSAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGtsb2cgXCJreGsuYXBwLm9uTWVudUFjdGlvbiBOTyBXSU4hXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgMDAwXG4gICAgXG4gICAgc2NyZWVuc2hvdDogKHcpIC0+XG4gICAgICAgIFxuICAgICAgICB3LndlYkNvbnRlbnRzLmNhcHR1cmVQYWdlKCkudGhlbiAoaW1nKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gudW51c2VkIFwifi9EZXNrdG9wLyN7QG9wdC5wa2cubmFtZX0ucG5nXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZnMud3JpdGVGaWxlIGZpbGUsIGltZy50b1BORygpLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgICAgICAgICBrbG9nICdzYXZpbmcgc2NyZWVuc2hvdCBmYWlsZWQnIGVyclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2xvZyBcInNjcmVlbnNob3Qgc2F2ZWQgdG8gI3tmaWxlfVwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuICAgICAgICBcbiAgICBzdGFydFdhdGNoZXI6ID0+XG4gICAgICAgIFxuICAgICAgICBAb3B0LmRpciA9IHNsYXNoLnJlc29sdmUgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnIEBvblNyY0NoYW5nZVxuICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXJcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAb3B0LmRpcnNcbiAgICAgICAgXG4gICAgICAgIGZvciBkaXIgaW4gQG9wdC5kaXJzXG4gICAgICAgICAgICB0b1dhdGNoID0gaWYgc2xhc2guaXNSZWxhdGl2ZSBkaXJcbiAgICAgICAgICAgICAgICBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGRpclxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNsYXNoLnJlc29sdmUgZGlyXG4gICAgICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIHRvV2F0Y2hcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyIFxuICAgIFxuICAgIHN0b3BXYXRjaGVyOiA9PlxuICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAd2F0Y2hlcnNcbiAgICAgICAgZm9yIHdhdGNoZXIgaW4gQHdhdGNoZXJzXG4gICAgICAgICAgICB3YXRjaGVyLmNsb3NlKClcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICBcbiAgICBvblNyY0NoYW5nZTogKGluZm8pID0+XG4gICAgXG4gICAgICAgICMga2xvZyAnb25TcmNDaGFuZ2UnIGluZm8uY2hhbmdlLCBpbmZvLnBhdGhcbiAgICAgICAgaWYgc2xhc2guYmFzZShpbmZvLnBhdGgpID09ICdtYWluJ1xuICAgICAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgICAgIEBhcHAuZXhpdCAwXG4gICAgICAgICAgICBpZiBwa2cgPSBzbGFzaC5wa2cgQG9wdC5kaXJcbiAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHBrZywgJ25vZGVfbW9kdWxlcydcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiI3twa2d9L25vZGVfbW9kdWxlcy8uYmluL2VsZWN0cm9uIC4gLXdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGN3ZDogICAgICBwa2dcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGlvOiAgICAnaW5oZXJpdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsOiAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBwb3N0LnRvV2lucyAnbWVudUFjdGlvbicgJ1JlbG9hZCdcbiAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwXG4gICAgXG4iXX0=
//# sourceURL=../coffee/app.coffee