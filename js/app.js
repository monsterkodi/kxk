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
        this.onGetUserData = bind(this.onGetUserData, this);
        this.onGetAppName = bind(this.onGetAppName, this);
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
        post.onGet('appName', this.onGetAppName);
        post.onGet('userData', this.onGetUserData);
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

    App.prototype.onGetAppName = function() {
        return this.app.getName();
    };

    App.prototype.onGetUserData = function() {
        return this.userData;
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
        win = electron.BrowserWindow.fromId(event.sender.id);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiYXBwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyR0FBQTtJQUFBOztBQVFBLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQzs7QUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBWixHQUFpRDs7QUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBWixHQUErQjs7QUFFL0IsTUFBOEYsT0FBQSxDQUFRLE9BQVIsQ0FBOUYsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxtQkFBZixFQUF1QixpQkFBdkIsRUFBOEIsV0FBOUIsRUFBa0MsZUFBbEMsRUFBd0MsV0FBeEMsRUFBNEMsZUFBNUMsRUFBa0QsaUJBQWxELEVBQXlELGlCQUF6RCxFQUFnRSxtQkFBaEUsRUFBd0UsaUJBQXhFLEVBQStFLGlCQUEvRSxFQUFzRjs7QUFFdEYsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixTQUFuQjtJQUNJLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUixFQURmOzs7QUFHTTtJQUVDLGFBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsTUFBRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBRUEsT0FBTyxDQUFDLEVBQVIsQ0FBVyxtQkFBWCxFQUErQixTQUFDLEdBQUQ7WUFDM0IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO1lBQ1QsTUFBTSxDQUFDLE1BQVAsQ0FBYyxHQUFkLEVBQW1CLElBQW5CO21CQUNBO1FBSDJCLENBQS9CO1FBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtRQUVaLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFMLENBQWEsVUFBYjtRQUVaLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxFQUFzQixJQUFDLENBQUEsWUFB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TyxDQUFDLEtBQVIsQ0FBQTtBQURKO2VBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUxIOztrQkFPYixXQUFBLEdBQWEsU0FBQyxJQUFEO0FBR1QsWUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEIsQ0FBQSxLQUF5QixNQUE1QjtZQUNJLElBQUMsQ0FBQSxXQUFELENBQUE7WUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxDQUFWO1lBQ0EsSUFBRyxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQWYsQ0FBVDtnQkFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLGNBQWhCLENBQVosQ0FBSDtvQkFDSSxNQUFNLENBQUMsUUFBUCxDQUFtQixHQUFELEdBQUssa0NBQXZCLEVBQ0k7d0JBQUEsR0FBQSxFQUFVLEdBQVY7d0JBQ0EsUUFBQSxFQUFVLE1BRFY7d0JBRUEsS0FBQSxFQUFVLFNBRlY7d0JBR0EsS0FBQSxFQUFVLElBSFY7cUJBREo7b0JBS0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0FBQ0EsMkJBUEo7aUJBREo7YUFISjs7ZUFZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsUUFBekI7SUFmUzs7Ozs7O0FBaUJqQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG5kZWxldGUgcHJvY2Vzcy5lbnYuRUxFQ1RST05fRU5BQkxFX1NFQ1VSSVRZX1dBUk5JTkdTXG5wcm9jZXNzLmVudi5FTEVDVFJPTl9ESVNBQkxFX1NFQ1VSSVRZX1dBUk5JTkdTID0gdHJ1ZVxucHJvY2Vzcy5lbnYuTk9ERV9OT19XQVJOSU5HUyA9IDFcblxueyBhYm91dCwgYXJncywgY2hpbGRwLCBlbXB0eSwgZnMsIGtsb2csIG9zLCBwb3N0LCBwcmVmcywgc2xhc2gsIHNyY21hcCwgdmFsaWQsIHdhdGNoLCB3aW4gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5pZiBwcm9jZXNzLnR5cGUgPT0gJ2Jyb3dzZXInXG4gICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgXG5jbGFzcyBBcHBcbiAgICBcbiAgICBAOiAoQG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJvY2Vzcy5vbiAndW5jYXVnaHRFeGNlcHRpb24nIChlcnIpIC0+XG4gICAgICAgICAgICBzcmNtYXAgPSByZXF1aXJlICcuL3NyY21hcCcgICAgXG4gICAgICAgICAgICBzcmNtYXAubG9nRXJyIGVyciwgJ/CflLsnXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHVzZXJEYXRhID0gQGFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub25HZXQgJ2FwcE5hbWUnICBAb25HZXRBcHBOYW1lXG4gICAgICAgIHBvc3Qub25HZXQgJ3VzZXJEYXRhJyBAb25HZXRVc2VyRGF0YVxuICAgICAgICBcbiAgICAgICAgQGFwcC5jb21tYW5kTGluZS5hcHBlbmRTd2l0Y2ggJ2Rpc2FibGUtc2l0ZS1pc29sYXRpb24tdHJpYWxzJ1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uTWVudS5zZXRBcHBsaWNhdGlvbk1lbnUgQG9wdC5tZW51XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQudHJheVxuICAgICAgICAgICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgb25PdGhlciA9IChldmVudCwgYXJncywgZGlyKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0Lm9uT3RoZXJJbnN0YW5jZVxuICAgICAgICAgICAgICAgIEBvcHQub25PdGhlckluc3RhbmNlIGFyZ3MsIGRpciBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2hvd1dpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNpbmdsZSAhPSBmYWxzZVxuICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2U/IFxuICAgICAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlIG9uT3RoZXJcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaz8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKClcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5vbiAnc2Vjb25kLWluc3RhbmNlJyBvbk90aGVyXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLmlwY01haW4ub24gJ21lbnVBY3Rpb24nICAgQG9uTWVudUFjdGlvblxuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdnZXRXaW5Cb3VuZHMnIEBvbkdldFdpbkJvdW5kc1xuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdzZXRXaW5Cb3VuZHMnIEBvblNldFdpbkJvdW5kc1xuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdnZXRXaW5JRCcgICAgIEBvbkdldFdpbklEXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScgQG9uUmVhZHlcbiAgICAgICAgQGFwcC5vbiAnYWN0aXZhdGUnIEBvbkFjdGl2YXRlXG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJyAoZXZlbnQpID0+IFxuICAgICAgICAgICAgaWYgQG9wdC50cmF5XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHF1aXRBcHAoKVxuICAgICAgICBcbiAgICByZXNvbHZlOiAoZmlsZSkgPT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBmaWxlXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4gICAgXG4gICAgb25SZWFkeTogPT5cbiAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5IHRoZW4gQGluaXRUcmF5KClcbiAgICAgICAgIFxuICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICAgXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgXG4gICAgICAgIGlmIG5vdCBhcmdzLm5vcHJlZnNcbiAgICAgICAgICAgIHNlcCA9IEBvcHQucHJlZnNTZXBlcmF0b3IgPyAn4pa4J1xuICAgICAgICAgICAgaWYgQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcCwgZGVmYXVsdHM6c2hvcnRjdXQ6QG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcFxuICAgIFxuICAgICAgICBpZiB2YWxpZCBwcmVmcy5nZXQgJ3Nob3J0Y3V0J1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KCdzaG9ydGN1dCcpLCBAb3B0Lm9uU2hvcnRjdXQgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLndhdGNoXG4gICAgICAgICAgICBrbG9nICdBcHAub25SZWFkeSBzdGFydFdhdGNoZXInXG4gICAgICAgICAgICBAc3RhcnRXYXRjaGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25TaG93XG4gICAgICAgICAgICBAb3B0Lm9uU2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgICAgICBwb3N0LmVtaXQgJ2FwcFJlYWR5J1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluaXRUcmF5OiA9PlxuICAgICAgICBcbiAgICAgICAgdHJheUltZyA9IEByZXNvbHZlIEBvcHQudHJheVxuICAgICAgICBAdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IHRyYXlJbWdcbiAgICAgICAgQHRyYXkub24gJ2NsaWNrJyBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ2RhcndpbidcbiAgICAgICAgICAgIHRlbXBsYXRlID0gW1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIlF1aXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAcXVpdEFwcFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFib3V0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHNob3dBYm91dFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjdGl2YXRlXCJcbiAgICAgICAgICAgICAgICBjbGljazogQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBAdHJheS5zZXRDb250ZXh0TWVudSBlbGVjdHJvbi5NZW51LmJ1aWxkRnJvbVRlbXBsYXRlIHRlbXBsYXRlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBzaG93QWJvdXQ6ID0+XG4gICAgICAgIFxuICAgICAgICBkYXJrID0gJ2RhcmsnID09IHByZWZzLmdldCAnc2NoZW1lJyAnZGFyaydcbiAgICAgICAgYWJvdXRcbiAgICAgICAgICAgIGltZzogICAgICAgIEByZXNvbHZlIEBvcHQuYWJvdXRcbiAgICAgICAgICAgIGNvbG9yOiAgICAgIGRhcmsgYW5kICcjMzMzJyBvciAnI2RkZCdcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGRhcmsgYW5kICcjMTExJyBvciAnI2ZmZidcbiAgICAgICAgICAgIGhpZ2hsaWdodDogIGRhcmsgYW5kICcjZmZmJyBvciAnIzAwMCdcbiAgICAgICAgICAgIHBrZzogICAgICAgIEBvcHQucGtnXG4gICAgICAgICAgICBkZWJ1ZzogICAgICBAb3B0LmFib3V0RGVidWdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHF1aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAnZGVsYXknICE9IEBvcHQub25RdWl0PygpXG4gICAgICAgICAgICBAZXhpdEFwcCgpXG4gICAgICAgICAgICBcbiAgICBleGl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgXG4gICAgb25HZXRBcHBOYW1lOiAgPT4gQGFwcC5nZXROYW1lKClcbiAgICBvbkdldFVzZXJEYXRhOiA9PiBAdXNlckRhdGFcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaGlkZURvY2s6ID0+IEBhcHAuZG9jaz8uaGlkZSgpXG4gICAgc2hvd0RvY2s6ID0+IEBhcHAuZG9jaz8uc2hvdygpXG4gICAgICAgIFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIzAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIzAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiAgICBcbiAgICB0b2dnbGVXaW5kb3dGcm9tVHJheTogPT4gQHNob3dXaW5kb3coKVxuICAgICAgIFxuICAgIG9uQWN0aXZhdGU6IChldmVudCwgaGFzVmlzaWJsZVdpbmRvd3MpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm9uQWN0aXZhdGVcbiAgICAgICAgICAgIGlmIEBvcHQub25BY3RpdmF0ZSBldmVudCwgaGFzVmlzaWJsZVdpbmRvd3NcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IGhhc1Zpc2libGVXaW5kb3dzXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG4gICAgICAgICAgICAgICAgXG4gICAgc2hvd1dpbmRvdzogPT5cblxuICAgICAgICBAb3B0Lm9uV2lsbFNob3dXaW4/KClcbiAgICAgICAgXG4gICAgICAgIGlmIEB3aW4/XG4gICAgICAgICAgICBAd2luLnNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY3JlYXRlV2luZG93KClcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY3JlYXRlV2luZG93OiAob25SZWFkeVRvU2hvdykgPT5cbiAgICBcbiAgICAgICAgb25SZWFkeVRvU2hvdyA/PSBAb3B0Lm9uV2luUmVhZHlcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0ICdib3VuZHMnXG4gICAgICAgICAgICBcbiAgICAgICAgd2lkdGggID0gYm91bmRzPy53aWR0aCAgPyBAb3B0LndpZHRoICA/IDUwMFxuICAgICAgICBoZWlnaHQgPSBib3VuZHM/LmhlaWdodCA/IEBvcHQuaGVpZ2h0ID8gNTAwXG4gICAgICAgIFxuICAgICAgICBAd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgICAgIEBvcHQubWluV2lkdGggICAgICAgICAgID8gMjUwXG4gICAgICAgICAgICBtaW5IZWlnaHQ6ICAgICAgICAgIEBvcHQubWluSGVpZ2h0ICAgICAgICAgID8gMjUwXG4gICAgICAgICAgICBtYXhXaWR0aDogICAgICAgICAgIEBvcHQubWF4V2lkdGggICAgICAgICAgID8gMTAwMDAwXG4gICAgICAgICAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEBvcHQubWF4SGVpZ2h0ICAgICAgICAgID8gMTAwMDAwXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgIEBvcHQuYmFja2dyb3VuZENvbG9yICAgID8gJyMxODE4MTgnXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgIEBvcHQuZnJhbWUgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgQG9wdC50cmFuc3BhcmVudCAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBAb3B0LmZ1bGxzY3JlZW4gICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuYWJsZTogICAgIEBvcHQuZnVsbHNjcmVlbmFibGUgICAgID8gdHJ1ZVxuICAgICAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICBAb3B0LmFjY2VwdEZpcnN0TW91c2UgICA/IHRydWVcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgQG9wdC5yZXNpemFibGUgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIEBvcHQubWF4aW1pemFibGUgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBAb3B0Lm1pbmltaXphYmxlICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIGNsb3NhYmxlOiAgICAgICAgICAgQG9wdC5jbG9zYWJsZSAgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGljb246ICAgICAgICAgICAgICAgQHJlc29sdmUgQG9wdC5pY29uIFxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnRleHRJc29sYXRpb246ICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uSW5Xb3JrZXI6IHRydWVcbiAgIFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueSBpZiBib3VuZHM/XG4gICAgXG4gICAgICAgIGlmIEBvcHQuaW5kZXhVUkxcbiAgICAgICAgICAgIEB3aW4ubG9hZFVSTCBAb3B0LmluZGV4LCBiYXNlVVJMRm9yRGF0YVVSTDpAb3B0LmluZGV4VVJMXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB3aW4ubG9hZFVSTCBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQuaW5kZXhcbiAgICAgICAgXG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub24gJ2RldnRvb2xzLW9wZW5lZCcgKGV2ZW50KSAtPiBwb3N0LnRvV2luIGV2ZW50LnNlbmRlci5pZCwgJ2RldlRvb2xzJyB0cnVlXG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub24gJ2RldnRvb2xzLWNsb3NlZCcgKGV2ZW50KSAtPiBwb3N0LnRvV2luIGV2ZW50LnNlbmRlci5pZCwgJ2RldlRvb2xzJyBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKG1vZGU6J2RldGFjaCcpIGlmIGFyZ3MuZGV2dG9vbHNcbiAgICAgICAgaWYgQG9wdC5zYXZlQm91bmRzICE9IGZhbHNlXG4gICAgICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueSBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLm9uICdyZXNpemUnIEBzYXZlQm91bmRzXG4gICAgICAgICAgICBAd2luLm9uICdtb3ZlJyAgIEBzYXZlQm91bmRzXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlZCcgPT4gQHdpbiA9IG51bGxcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnICA9PiBpZiBAb3B0LnNpbmdsZSB0aGVuIEBoaWRlRG9jaygpXG4gICAgICAgIEB3aW4ub24gJ21vdmVkJyAgKGV2ZW50KSA9PiBwb3N0LnRvV2luIGV2ZW50LnNlbmRlciwgJ3dpbk1vdmVkJyBldmVudC5zZW5kZXIuZ2V0Qm91bmRzKClcbiAgICAgICAgQHdpbi5vbiAncmVhZHktdG8tc2hvdycgKCh3LCBvcnRzKSAtPiAtPiBcbiAgICAgICAgICAgIG9ydHM/IHdcbiAgICAgICAgICAgIHcuc2hvdygpIFxuICAgICAgICAgICAgcG9zdC5lbWl0ICd3aW5SZWFkeScgdy5pZFxuICAgICAgICAgICAgKSBAd2luLCBvblJlYWR5VG9TaG93IFxuICAgICAgICAgICAgXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIEB3aW5cblxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25TZXRXaW5Cb3VuZHM6IChldmVudCwgYm91bmRzKSA9PlxuXG4gICAgICAgIEB3aW5Gb3JFdmVudChldmVudCk/LnNldEJvdW5kcyBib3VuZHNcbiAgICAgICAgXG4gICAgb25HZXRXaW5Cb3VuZHM6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gQHdpbkZvckV2ZW50KGV2ZW50KT8uZ2V0Qm91bmRzKClcbiAgICAgICBcbiAgICBvbkdldFdpbklEOiAoZXZlbnQpID0+IGV2ZW50LnJldHVyblZhbHVlID0gZXZlbnQuc2VuZGVyLmlkXG4gXG4gICAgc2F2ZUJvdW5kczogPT4gaWYgQHdpbj8gdGhlbiBwcmVmcy5zZXQgJ2JvdW5kcycgQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICBzY3JlZW5TaXplOiAtPiBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICAgICAgXG4gICAgYWxsV2luczogLT4gZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkuc29ydCAoYSxiKSAtPiBhLmlkIC0gYi5pZFxuICAgICAgICBcbiAgICB3aW5Gb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICB3aW4gPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93LmZyb21JZCBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgaWYgbm90IHdpblxuICAgICAgICAgICAga2xvZyAnbm8gd2luPycgZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgICAgICBmb3IgdyBpbiBAYWxsV2lucygpXG4gICAgICAgICAgICAgICAga2xvZyAnd2luJyB3LmlkLCB3LndlYkNvbnRlbnRzLmlkXG4gICAgICAgIHdpblxuICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChldmVudCwgYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAga2xvZyAna3hrLmFwcC5vbk1lbnVBY3Rpb24nIGFjdGlvbiwgZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIFxuICAgICAgICBpZiB3ID0gQHdpbkZvckV2ZW50IGV2ZW50XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN3aXRjaCBhY3Rpb24udG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ2Fib3V0JyAgICAgICB0aGVuIEBzaG93QWJvdXQoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ3F1aXQnICAgICAgICB0aGVuIEBxdWl0QXBwKClcbiAgICAgICAgICAgICAgICB3aGVuICdzY3JlZW5zaG90JyAgdGhlbiBAc2NyZWVuc2hvdCB3XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVsbHNjcmVlbicgIHRoZW4gdy5zZXRGdWxsU2NyZWVuICF3LmlzRnVsbFNjcmVlbigpXG4gICAgICAgICAgICAgICAgd2hlbiAnZGV2dG9vbHMnICAgIHRoZW4gdy53ZWJDb250ZW50cy50b2dnbGVEZXZUb29scygpXG4gICAgICAgICAgICAgICAgd2hlbiAncmVsb2FkJyAgICAgIHRoZW4gdy53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgICAgICB3aGVuICdjbG9zZScgICAgICAgdGhlbiB3LmNsb3NlKClcbiAgICAgICAgICAgICAgICB3aGVuICdoaWRlJyAgICAgICAgdGhlbiB3LmhpZGUoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ21pbmltaXplJyAgICB0aGVuIHcubWluaW1pemUoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ21heGltaXplJyBcbiAgICAgICAgICAgICAgICAgICAgd2EgPSBAc2NyZWVuU2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIHdiID0gdy5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3LmlzTWF4aW1pemVkKCkgb3IgKHdiLndpZHRoID09IHdhLndpZHRoIGFuZCB3Yi5oZWlnaHQgPT0gd2EuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBpZiBtYXhpbWl6ZWQgdGhlbiB3LnVubWF4aW1pemUoKSBlbHNlIHcubWF4aW1pemUoKSAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGtsb2cgXCJreGsuYXBwLm9uTWVudUFjdGlvbiBOTyBXSU4hXCJcbiAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgMDAwXG4gICAgXG4gICAgc2NyZWVuc2hvdDogKHcpIC0+XG4gICAgICAgIFxuICAgICAgICB3LndlYkNvbnRlbnRzLmNhcHR1cmVQYWdlKCkudGhlbiAoaW1nKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gudW51c2VkIFwifi9EZXNrdG9wLyN7QG9wdC5wa2cubmFtZX0ucG5nXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZnMud3JpdGVGaWxlIGZpbGUsIGltZy50b1BORygpLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgICAgICAgICBrbG9nICdzYXZpbmcgc2NyZWVuc2hvdCBmYWlsZWQnIGVyclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2xvZyBcInNjcmVlbnNob3Qgc2F2ZWQgdG8gI3tmaWxlfVwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuICAgICAgICBcbiAgICBzdGFydFdhdGNoZXI6ID0+XG4gICAgICAgIFxuICAgICAgICBAb3B0LmRpciA9IHNsYXNoLnJlc29sdmUgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnIEBvblNyY0NoYW5nZVxuICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXJcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAb3B0LmRpcnNcbiAgICAgICAgXG4gICAgICAgIGZvciBkaXIgaW4gQG9wdC5kaXJzXG4gICAgICAgICAgICB0b1dhdGNoID0gaWYgc2xhc2guaXNSZWxhdGl2ZSBkaXJcbiAgICAgICAgICAgICAgICBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGRpclxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNsYXNoLnJlc29sdmUgZGlyXG4gICAgICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIHRvV2F0Y2hcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyIFxuICAgIFxuICAgIHN0b3BXYXRjaGVyOiA9PlxuICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAd2F0Y2hlcnNcbiAgICAgICAgZm9yIHdhdGNoZXIgaW4gQHdhdGNoZXJzXG4gICAgICAgICAgICB3YXRjaGVyLmNsb3NlKClcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICBcbiAgICBvblNyY0NoYW5nZTogKGluZm8pID0+XG4gICAgXG4gICAgICAgICMga2xvZyAnb25TcmNDaGFuZ2UnIGluZm8uY2hhbmdlLCBpbmZvLnBhdGhcbiAgICAgICAgaWYgc2xhc2guYmFzZShpbmZvLnBhdGgpID09ICdtYWluJ1xuICAgICAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgICAgIEBhcHAuZXhpdCAwXG4gICAgICAgICAgICBpZiBwa2cgPSBzbGFzaC5wa2cgQG9wdC5kaXJcbiAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHBrZywgJ25vZGVfbW9kdWxlcydcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiI3twa2d9L25vZGVfbW9kdWxlcy8uYmluL2VsZWN0cm9uIC4gLXdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGN3ZDogICAgICBwa2dcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGlvOiAgICAnaW5oZXJpdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsOiAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBwb3N0LnRvV2lucyAnbWVudUFjdGlvbicgJ1JlbG9hZCdcbiAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwXG4gICAgXG4iXX0=
//# sourceURL=../coffee/app.coffee