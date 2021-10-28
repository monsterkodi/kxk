// koffee 1.14.0

/*
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000
 */
var App, about, args, childp, electron, empty, fs, klog, os, post, prefs, ref, slash, srcmap, valid, watch, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

process.env.NODE_NO_WARNINGS = 1;

ref = require('./kxk'), about = ref.about, args = ref.args, childp = ref.childp, empty = ref.empty, fs = ref.fs, klog = ref.klog, os = ref.os, post = ref.post, prefs = ref.prefs, slash = ref.slash, srcmap = ref.srcmap, valid = ref.valid, watch = ref.watch, win = ref.win;

if (process.type === 'browser') {
    electron = require('electron');
    post.onGet('appName', function() {
        return electron.app.getName();
    });
    post.onGet('userData', function() {
        return electron.app.getPath('userData');
    });
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
        var ref1, ref2, sep;
        if (this.opt.tray) {
            this.initTray();
        }
        this.hideDock();
        this.app.setName(this.opt.pkg.name);
        if (!args.noprefs) {
            sep = (ref1 = this.opt.prefsSeperator) != null ? ref1 : '▸';
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
            electron.globalShortcut.register(prefs.get('shortcut'), (ref2 = this.opt.onShortcut) != null ? ref2 : this.showWindow);
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
        var ref1;
        return (ref1 = this.app.dock) != null ? ref1.hide() : void 0;
    };

    App.prototype.showDock = function() {
        var ref1;
        return (ref1 = this.app.dock) != null ? ref1.show() : void 0;
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
        var bounds, height, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, width;
        if (onReadyToShow != null) {
            onReadyToShow;
        } else {
            onReadyToShow = this.opt.onWinReady;
        }
        if (this.opt.saveBounds !== false) {
            bounds = prefs.get('bounds');
        }
        width = (ref1 = (ref2 = bounds != null ? bounds.width : void 0) != null ? ref2 : this.opt.width) != null ? ref1 : 500;
        height = (ref3 = (ref4 = bounds != null ? bounds.height : void 0) != null ? ref4 : this.opt.height) != null ? ref3 : 500;
        this.win = new electron.BrowserWindow({
            width: width,
            height: height,
            minWidth: (ref5 = this.opt.minWidth) != null ? ref5 : 250,
            minHeight: (ref6 = this.opt.minHeight) != null ? ref6 : 250,
            maxWidth: (ref7 = this.opt.maxWidth) != null ? ref7 : 100000,
            maxHeight: (ref8 = this.opt.maxHeight) != null ? ref8 : 100000,
            backgroundColor: (ref9 = this.opt.backgroundColor) != null ? ref9 : '#181818',
            frame: (ref10 = this.opt.frame) != null ? ref10 : false,
            transparent: (ref11 = this.opt.transparent) != null ? ref11 : false,
            fullscreen: (ref12 = this.opt.fullscreen) != null ? ref12 : false,
            fullscreenable: (ref13 = this.opt.fullscreenable) != null ? ref13 : true,
            acceptFirstMouse: (ref14 = this.opt.acceptFirstMouse) != null ? ref14 : true,
            resizable: (ref15 = this.opt.resizable) != null ? ref15 : true,
            maximizable: (ref16 = this.opt.maximizable) != null ? ref16 : true,
            minimizable: (ref17 = this.opt.minimizable) != null ? ref17 : true,
            closable: (ref18 = this.opt.closable) != null ? ref18 : true,
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
        var ref1;
        return (ref1 = this.winForEvent(event)) != null ? ref1.setBounds(bounds) : void 0;
    };

    App.prototype.onGetWinBounds = function(event) {
        var ref1;
        return event.returnValue = (ref1 = this.winForEvent(event)) != null ? ref1.getBounds() : void 0;
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
        var i, len, ref1, w;
        win = electron.BrowserWindow.fromWebContents(event.sender);
        if (!win) {
            klog('no win?', event.sender.id);
            ref1 = this.allWins();
            for (i = 0, len = ref1.length; i < len; i++) {
                w = ref1[i];
                klog('win', w.id, w.webContents.id);
            }
        }
        return win;
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
                    return w.webContents.toggleDevTools();
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
        var dir, i, len, ref1, results, toWatch, watcher;
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
        ref1 = this.opt.dirs;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            dir = ref1[i];
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
        var i, len, ref1, watcher;
        if (empty(this.watchers)) {
            return;
        }
        ref1 = this.watchers;
        for (i = 0, len = ref1.length; i < len; i++) {
            watcher = ref1[i];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiYXBwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyR0FBQTtJQUFBOztBQVFBLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQzs7QUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBWixHQUFpRDs7QUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBWixHQUErQjs7QUFFL0IsTUFBOEYsT0FBQSxDQUFRLE9BQVIsQ0FBOUYsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxtQkFBZixFQUF1QixpQkFBdkIsRUFBOEIsV0FBOUIsRUFBa0MsZUFBbEMsRUFBd0MsV0FBeEMsRUFBNEMsZUFBNUMsRUFBa0QsaUJBQWxELEVBQXlELGlCQUF6RCxFQUFnRSxtQkFBaEUsRUFBd0UsaUJBQXhFLEVBQStFLGlCQUEvRSxFQUFzRjs7QUFFdEYsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixTQUFuQjtJQUNJLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtJQUVYLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxFQUFzQixTQUFBO2VBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFiLENBQUE7SUFBSCxDQUF0QjtJQUNBLElBQUksQ0FBQyxLQUFMLENBQVcsVUFBWCxFQUFzQixTQUFBO2VBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFiLENBQXFCLFVBQXJCO0lBQUgsQ0FBdEIsRUFKSjs7O0FBTU07SUFFQyxhQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE1BQUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFQSxPQUFPLENBQUMsRUFBUixDQUFXLG1CQUFYLEVBQStCLFNBQUMsR0FBRDtZQUMzQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7WUFDVCxNQUFNLENBQUMsTUFBUCxDQUFjLEdBQWQsRUFBbUIsSUFBbkI7bUJBQ0E7UUFI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QUQsR0FBWTtJQUxIOztrQkFPYixXQUFBLEdBQWEsU0FBQyxJQUFEO0FBR1QsWUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEIsQ0FBQSxLQUF5QixNQUE1QjtZQUNJLElBQUMsQ0FBQSxXQUFELENBQUE7WUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxDQUFWO1lBQ0EsSUFBRyxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQWYsQ0FBVDtnQkFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLGNBQWhCLENBQVosQ0FBSDtvQkFDSSxNQUFNLENBQUMsUUFBUCxDQUFtQixHQUFELEdBQUssa0NBQXZCLEVBQ0k7d0JBQUEsR0FBQSxFQUFVLEdBQVY7d0JBQ0EsUUFBQSxFQUFVLE1BRFY7d0JBRUEsS0FBQSxFQUFVLFNBRlY7d0JBR0EsS0FBQSxFQUFVLElBSFY7cUJBREo7b0JBS0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0FBQ0EsMkJBUEo7aUJBREo7YUFISjs7ZUFZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsUUFBekI7SUFmUzs7Ozs7O0FBaUJqQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG5kZWxldGUgcHJvY2Vzcy5lbnYuRUxFQ1RST05fRU5BQkxFX1NFQ1VSSVRZX1dBUk5JTkdTXG5wcm9jZXNzLmVudi5FTEVDVFJPTl9ESVNBQkxFX1NFQ1VSSVRZX1dBUk5JTkdTID0gdHJ1ZVxucHJvY2Vzcy5lbnYuTk9ERV9OT19XQVJOSU5HUyA9IDFcblxueyBhYm91dCwgYXJncywgY2hpbGRwLCBlbXB0eSwgZnMsIGtsb2csIG9zLCBwb3N0LCBwcmVmcywgc2xhc2gsIHNyY21hcCwgdmFsaWQsIHdhdGNoLCB3aW4gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5pZiBwcm9jZXNzLnR5cGUgPT0gJ2Jyb3dzZXInXG4gICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICBcbiAgICBwb3N0Lm9uR2V0ICdhcHBOYW1lJyAgLT4gZWxlY3Ryb24uYXBwLmdldE5hbWUoKVxuICAgIHBvc3Qub25HZXQgJ3VzZXJEYXRhJyAtPiBlbGVjdHJvbi5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgXG5jbGFzcyBBcHBcbiAgICBcbiAgICBAOiAoQG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJvY2Vzcy5vbiAndW5jYXVnaHRFeGNlcHRpb24nIChlcnIpIC0+XG4gICAgICAgICAgICBzcmNtYXAgPSByZXF1aXJlICcuL3NyY21hcCcgICAgXG4gICAgICAgICAgICBzcmNtYXAubG9nRXJyIGVyciwgJ/CflLsnXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHVzZXJEYXRhID0gQGFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGFwcC5jb21tYW5kTGluZS5hcHBlbmRTd2l0Y2ggJ2Rpc2FibGUtc2l0ZS1pc29sYXRpb24tdHJpYWxzJ1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uTWVudS5zZXRBcHBsaWNhdGlvbk1lbnUgQG9wdC5tZW51XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQudHJheVxuICAgICAgICAgICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgb25PdGhlciA9IChldmVudCwgYXJncywgZGlyKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0Lm9uT3RoZXJJbnN0YW5jZVxuICAgICAgICAgICAgICAgIEBvcHQub25PdGhlckluc3RhbmNlIGFyZ3MsIGRpciBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2hvd1dpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNpbmdsZSAhPSBmYWxzZVxuICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2U/IFxuICAgICAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlIG9uT3RoZXJcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaz8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKClcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5vbiAnc2Vjb25kLWluc3RhbmNlJyBvbk90aGVyXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLmlwY01haW4ub24gJ21lbnVBY3Rpb24nICAgQG9uTWVudUFjdGlvblxuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdnZXRXaW5Cb3VuZHMnIEBvbkdldFdpbkJvdW5kc1xuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdzZXRXaW5Cb3VuZHMnIEBvblNldFdpbkJvdW5kc1xuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdnZXRXaW5JRCcgICAgIEBvbkdldFdpbklEXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScgQG9uUmVhZHlcbiAgICAgICAgQGFwcC5vbiAnYWN0aXZhdGUnIEBvbkFjdGl2YXRlXG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJyAoZXZlbnQpID0+IFxuICAgICAgICAgICAgaWYgQG9wdC50cmF5XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHF1aXRBcHAoKVxuICAgICAgICBcbiAgICByZXNvbHZlOiAoZmlsZSkgPT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBmaWxlXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4gICAgXG4gICAgb25SZWFkeTogPT5cbiAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5IHRoZW4gQGluaXRUcmF5KClcbiAgICAgICAgIFxuICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICAgXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgXG4gICAgICAgIGlmIG5vdCBhcmdzLm5vcHJlZnNcbiAgICAgICAgICAgIHNlcCA9IEBvcHQucHJlZnNTZXBlcmF0b3IgPyAn4pa4J1xuICAgICAgICAgICAgaWYgQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcCwgZGVmYXVsdHM6c2hvcnRjdXQ6QG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcFxuICAgIFxuICAgICAgICBpZiB2YWxpZCBwcmVmcy5nZXQgJ3Nob3J0Y3V0J1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KCdzaG9ydGN1dCcpLCBAb3B0Lm9uU2hvcnRjdXQgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLndhdGNoXG4gICAgICAgICAgICBrbG9nICdBcHAub25SZWFkeSBzdGFydFdhdGNoZXInXG4gICAgICAgICAgICBAc3RhcnRXYXRjaGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25TaG93XG4gICAgICAgICAgICBAb3B0Lm9uU2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgICAgICBwb3N0LmVtaXQgJ2FwcFJlYWR5J1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluaXRUcmF5OiA9PlxuICAgICAgICBcbiAgICAgICAgdHJheUltZyA9IEByZXNvbHZlIEBvcHQudHJheVxuICAgICAgICBAdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IHRyYXlJbWdcbiAgICAgICAgQHRyYXkub24gJ2NsaWNrJyBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ2RhcndpbidcbiAgICAgICAgICAgIHRlbXBsYXRlID0gW1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIlF1aXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAcXVpdEFwcFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFib3V0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHNob3dBYm91dFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjdGl2YXRlXCJcbiAgICAgICAgICAgICAgICBjbGljazogQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBAdHJheS5zZXRDb250ZXh0TWVudSBlbGVjdHJvbi5NZW51LmJ1aWxkRnJvbVRlbXBsYXRlIHRlbXBsYXRlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBzaG93QWJvdXQ6ID0+XG4gICAgICAgIFxuICAgICAgICBkYXJrID0gJ2RhcmsnID09IHByZWZzLmdldCAnc2NoZW1lJyAnZGFyaydcbiAgICAgICAgYWJvdXRcbiAgICAgICAgICAgIGltZzogICAgICAgIEByZXNvbHZlIEBvcHQuYWJvdXRcbiAgICAgICAgICAgIGNvbG9yOiAgICAgIGRhcmsgYW5kICcjMzMzJyBvciAnI2RkZCdcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGRhcmsgYW5kICcjMTExJyBvciAnI2ZmZidcbiAgICAgICAgICAgIGhpZ2hsaWdodDogIGRhcmsgYW5kICcjZmZmJyBvciAnIzAwMCdcbiAgICAgICAgICAgIHBrZzogICAgICAgIEBvcHQucGtnXG4gICAgICAgICAgICBkZWJ1ZzogICAgICBAb3B0LmFib3V0RGVidWdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHF1aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAnZGVsYXknICE9IEBvcHQub25RdWl0PygpXG4gICAgICAgICAgICBAZXhpdEFwcCgpXG4gICAgICAgICAgICBcbiAgICBleGl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBoaWRlRG9jazogPT4gQGFwcC5kb2NrPy5oaWRlKClcbiAgICBzaG93RG9jazogPT4gQGFwcC5kb2NrPy5zaG93KClcbiAgICAgICAgXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgIFxuICAgIHRvZ2dsZVdpbmRvd0Zyb21UcmF5OiA9PiBAc2hvd1dpbmRvdygpXG4gICAgICAgXG4gICAgb25BY3RpdmF0ZTogKGV2ZW50LCBoYXNWaXNpYmxlV2luZG93cykgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25BY3RpdmF0ZVxuICAgICAgICAgICAgaWYgQG9wdC5vbkFjdGl2YXRlIGV2ZW50LCBoYXNWaXNpYmxlV2luZG93c1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgaGFzVmlzaWJsZVdpbmRvd3NcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcbiAgICAgICAgICAgICAgICBcbiAgICBzaG93V2luZG93OiA9PlxuXG4gICAgICAgIEBvcHQub25XaWxsU2hvd1dpbj8oKVxuICAgICAgICBcbiAgICAgICAgaWYgQHdpbj9cbiAgICAgICAgICAgIEB3aW4uc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBjcmVhdGVXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjcmVhdGVXaW5kb3c6IChvblJlYWR5VG9TaG93KSA9PlxuICAgIFxuICAgICAgICBvblJlYWR5VG9TaG93ID89IEBvcHQub25XaW5SZWFkeVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zYXZlQm91bmRzICE9IGZhbHNlXG4gICAgICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgJ2JvdW5kcydcbiAgICAgICAgICAgIFxuICAgICAgICB3aWR0aCAgPSBib3VuZHM/LndpZHRoICA/IEBvcHQud2lkdGggID8gNTAwXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcz8uaGVpZ2h0ID8gQG9wdC5oZWlnaHQgPyA1MDBcbiAgICAgICAgXG4gICAgICAgIEB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgIG1pbldpZHRoOiAgICAgICAgICAgQG9wdC5taW5XaWR0aCAgICAgICAgICAgPyAyNTBcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAgICAgQG9wdC5taW5IZWlnaHQgICAgICAgICAgPyAyNTBcbiAgICAgICAgICAgIG1heFdpZHRoOiAgICAgICAgICAgQG9wdC5tYXhXaWR0aCAgICAgICAgICAgPyAxMDAwMDBcbiAgICAgICAgICAgIG1heEhlaWdodDogICAgICAgICAgQG9wdC5tYXhIZWlnaHQgICAgICAgICAgPyAxMDAwMDBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgQG9wdC5iYWNrZ3JvdW5kQ29sb3IgICAgPyAnIzE4MTgxOCdcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgQG9wdC5mcmFtZSAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICBAb3B0LnRyYW5zcGFyZW50ICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIEBvcHQuZnVsbHNjcmVlbiAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5hYmxlOiAgICAgQG9wdC5mdWxsc2NyZWVuYWJsZSAgICAgPyB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIEBvcHQuYWNjZXB0Rmlyc3RNb3VzZSAgID8gdHJ1ZVxuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBAb3B0LnJlc2l6YWJsZSAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgICAgQG9wdC5tYXhpbWl6YWJsZSAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgIEBvcHQubWluaW1pemFibGUgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgY2xvc2FibGU6ICAgICAgICAgICBAb3B0LmNsb3NhYmxlICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICAgICAgdGhpY2tGcmFtZTogICAgICAgICBmYWxzZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgaWNvbjogICAgICAgICAgICAgICBAcmVzb2x2ZSBAb3B0Lmljb24gXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgY29udGV4dElzb2xhdGlvbjogICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb25JbldvcmtlcjogdHJ1ZVxuICAgXG4gICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55IGlmIGJvdW5kcz9cbiAgICBcbiAgICAgICAgaWYgQG9wdC5pbmRleFVSTFxuICAgICAgICAgICAgQHdpbi5sb2FkVVJMIEBvcHQuaW5kZXgsIGJhc2VVUkxGb3JEYXRhVVJMOkBvcHQuaW5kZXhVUkxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHdpbi5sb2FkVVJMIHNsYXNoLmZpbGVVcmwgQHJlc29sdmUgQG9wdC5pbmRleFxuICAgICAgICBcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vbiAnZGV2dG9vbHMtb3BlbmVkJyAoZXZlbnQpIC0+IHBvc3QudG9XaW4gZXZlbnQuc2VuZGVyLmlkLCAnZGV2VG9vbHMnIHRydWVcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vbiAnZGV2dG9vbHMtY2xvc2VkJyAoZXZlbnQpIC0+IHBvc3QudG9XaW4gZXZlbnQuc2VuZGVyLmlkLCAnZGV2VG9vbHMnIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMobW9kZTonZGV0YWNoJykgaWYgYXJncy5kZXZ0b29sc1xuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55IGlmIGJvdW5kcz9cbiAgICAgICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQHNhdmVCb3VuZHNcbiAgICAgICAgICAgIEB3aW4ub24gJ21vdmUnICAgQHNhdmVCb3VuZHNcbiAgICAgICAgQHdpbi5vbiAnY2xvc2VkJyA9PiBAd2luID0gbnVsbFxuICAgICAgICBAd2luLm9uICdjbG9zZScgID0+IGlmIEBvcHQuc2luZ2xlIHRoZW4gQGhpZGVEb2NrKClcbiAgICAgICAgQHdpbi5vbiAnbW92ZWQnICAoZXZlbnQpID0+IHBvc3QudG9XaW4gZXZlbnQuc2VuZGVyLCAnd2luTW92ZWQnIGV2ZW50LnNlbmRlci5nZXRCb3VuZHMoKVxuICAgICAgICBAd2luLm9uICdyZWFkeS10by1zaG93JyAoKHcsIG9ydHMpIC0+IC0+IFxuICAgICAgICAgICAgb3J0cz8gd1xuICAgICAgICAgICAgdy5zaG93KCkgXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ3dpblJlYWR5JyB3LmlkXG4gICAgICAgICAgICApIEB3aW4sIG9uUmVhZHlUb1Nob3cgXG4gICAgICAgICAgICBcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgQHdpblxuXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvblNldFdpbkJvdW5kczogKGV2ZW50LCBib3VuZHMpID0+XG5cbiAgICAgICAgQHdpbkZvckV2ZW50KGV2ZW50KT8uc2V0Qm91bmRzIGJvdW5kc1xuICAgICAgICBcbiAgICBvbkdldFdpbkJvdW5kczogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSBAd2luRm9yRXZlbnQoZXZlbnQpPy5nZXRCb3VuZHMoKVxuICAgICAgIFxuICAgIG9uR2V0V2luSUQ6IChldmVudCkgPT4gZXZlbnQucmV0dXJuVmFsdWUgPSBldmVudC5zZW5kZXIuaWRcbiBcbiAgICBzYXZlQm91bmRzOiA9PiBpZiBAd2luPyB0aGVuIHByZWZzLnNldCAnYm91bmRzJyBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgIHNjcmVlblNpemU6IC0+IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICBcbiAgICBhbGxXaW5zOiAtPiBlbGVjdHJvbi5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKS5zb3J0IChhLGIpIC0+IGEuaWQgLSBiLmlkXG4gICAgICAgIFxuICAgIHdpbkZvckV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZnJvbVdlYkNvbnRlbnRzIGV2ZW50LnNlbmRlclxuICAgICAgICBpZiBub3Qgd2luXG4gICAgICAgICAgICBrbG9nICdubyB3aW4/JyBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgICAgIGZvciB3IGluIEBhbGxXaW5zKClcbiAgICAgICAgICAgICAgICBrbG9nICd3aW4nIHcuaWQsIHcud2ViQ29udGVudHMuaWRcbiAgICAgICAgd2luXG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGV2ZW50LCBhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdreGsuYXBwLm9uTWVudUFjdGlvbicgYWN0aW9uLCBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgXG4gICAgICAgIGlmIHcgPSBAd2luRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3dpdGNoIGFjdGlvbi50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgd2hlbiAnYWJvdXQnICAgICAgIHRoZW4gQHNob3dBYm91dCgpXG4gICAgICAgICAgICAgICAgd2hlbiAncXVpdCcgICAgICAgIHRoZW4gQHF1aXRBcHAoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ3NjcmVlbnNob3QnICB0aGVuIEBzY3JlZW5zaG90IHdcbiAgICAgICAgICAgICAgICB3aGVuICdmdWxsc2NyZWVuJyAgdGhlbiB3LnNldEZ1bGxTY3JlZW4gIXcuaXNGdWxsU2NyZWVuKClcbiAgICAgICAgICAgICAgICB3aGVuICdkZXZ0b29scycgICAgdGhlbiB3LndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgICAgICB3aGVuICdyZWxvYWQnICAgICAgdGhlbiB3LndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ2Nsb3NlJyAgICAgICB0aGVuIHcuY2xvc2UoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ2hpZGUnICAgICAgICB0aGVuIHcuaGlkZSgpXG4gICAgICAgICAgICAgICAgd2hlbiAnbWluaW1pemUnICAgIHRoZW4gdy5taW5pbWl6ZSgpXG4gICAgICAgICAgICAgICAgd2hlbiAnbWF4aW1pemUnIFxuICAgICAgICAgICAgICAgICAgICB3YSA9IEBzY3JlZW5TaXplKClcbiAgICAgICAgICAgICAgICAgICAgd2IgPSB3LmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgICAgIG1heGltaXplZCA9IHcuaXNNYXhpbWl6ZWQoKSBvciAod2Iud2lkdGggPT0gd2Eud2lkdGggYW5kIHdiLmhlaWdodCA9PSB3YS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIGlmIG1heGltaXplZCB0aGVuIHcudW5tYXhpbWl6ZSgpIGVsc2Ugdy5tYXhpbWl6ZSgpICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2xvZyBcImt4ay5hcHAub25NZW51QWN0aW9uIE5PIFdJTiFcIlxuICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAwMDBcbiAgICBcbiAgICBzY3JlZW5zaG90OiAodykgLT5cbiAgICAgICAgXG4gICAgICAgIHcud2ViQ29udGVudHMuY2FwdHVyZVBhZ2UoKS50aGVuIChpbWcpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC51bnVzZWQgXCJ+L0Rlc2t0b3AvI3tAb3B0LnBrZy5uYW1lfS5wbmdcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmcy53cml0ZUZpbGUgZmlsZSwgaW1nLnRvUE5HKCksIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgaWYgdmFsaWQgZXJyXG4gICAgICAgICAgICAgICAgICAgIGtsb2cgJ3NhdmluZyBzY3JlZW5zaG90IGZhaWxlZCcgZXJyXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrbG9nIFwic2NyZWVuc2hvdCBzYXZlZCB0byAje2ZpbGV9XCJcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgXG4gICAgICAgIFxuICAgIHN0YXJ0V2F0Y2hlcjogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGlyID0gc2xhc2gucmVzb2x2ZSBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlclxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEBvcHQuZGlyc1xuICAgICAgICBcbiAgICAgICAgZm9yIGRpciBpbiBAb3B0LmRpcnNcbiAgICAgICAgICAgIHRvV2F0Y2ggPSBpZiBzbGFzaC5pc1JlbGF0aXZlIGRpclxuICAgICAgICAgICAgICAgIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZGlyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2xhc2gucmVzb2x2ZSBkaXJcbiAgICAgICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgdG9XYXRjaFxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJyBAb25TcmNDaGFuZ2VcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXIgXG4gICAgXG4gICAgc3RvcFdhdGNoZXI6ID0+XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEB3YXRjaGVyc1xuICAgICAgICBmb3Igd2F0Y2hlciBpbiBAd2F0Y2hlcnNcbiAgICAgICAgICAgIHdhdGNoZXIuY2xvc2UoKVxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgIFxuICAgIG9uU3JjQ2hhbmdlOiAoaW5mbykgPT5cbiAgICBcbiAgICAgICAgIyBrbG9nICdvblNyY0NoYW5nZScgaW5mby5jaGFuZ2UsIGluZm8ucGF0aFxuICAgICAgICBpZiBzbGFzaC5iYXNlKGluZm8ucGF0aCkgPT0gJ21haW4nXG4gICAgICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgICAgIGlmIHBrZyA9IHNsYXNoLnBrZyBAb3B0LmRpclxuICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzRGlyIHNsYXNoLmpvaW4gcGtnLCAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIje3BrZ30vbm9kZV9tb2R1bGVzLy5iaW4vZWxlY3Ryb24gLiAtd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiAgICAgIHBrZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RkaW86ICAgICdpbmhlcml0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hlbGw6ICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHBvc3QudG9XaW5zICdtZW51QWN0aW9uJyAnUmVsb2FkJ1xuICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBcbiAgICBcbiJdfQ==
//# sourceURL=../coffee/app.coffee