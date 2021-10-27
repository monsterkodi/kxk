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

electron = require('electron');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiYXBwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyR0FBQTtJQUFBOztBQVFBLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQzs7QUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBWixHQUFpRDs7QUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBWixHQUErQjs7QUFFL0IsTUFBOEYsT0FBQSxDQUFRLE9BQVIsQ0FBOUYsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxtQkFBZixFQUF1QixpQkFBdkIsRUFBOEIsV0FBOUIsRUFBa0MsZUFBbEMsRUFBd0MsV0FBeEMsRUFBNEMsZUFBNUMsRUFBa0QsaUJBQWxELEVBQXlELGlCQUF6RCxFQUFnRSxtQkFBaEUsRUFBd0UsaUJBQXhFLEVBQStFLGlCQUEvRSxFQUFzRjs7QUFFdEYsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMO0lBRUMsYUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFQSxPQUFPLENBQUMsRUFBUixDQUFXLG1CQUFYLEVBQStCLFNBQUMsR0FBRDtZQUMzQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7WUFDVCxNQUFNLENBQUMsTUFBUCxDQUFjLEdBQWQsRUFBbUIsSUFBbkI7bUJBQ0E7UUFIMkIsQ0FBL0I7UUFLQSxJQUFDLENBQUEsUUFBRCxHQUFZO1FBRVosSUFBQyxDQUFBLEdBQUQsR0FBTyxRQUFRLENBQUM7UUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsR0FBRyxDQUFDLE9BQUwsQ0FBYSxVQUFiO1FBRVosSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLEVBQXNCLElBQUMsQ0FBQSxZQUF2QjtRQUNBLElBQUksQ0FBQyxLQUFMLENBQVcsVUFBWCxFQUFzQixJQUFD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QUFZO0lBTEg7O2tCQU9iLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFHVCxZQUFBO1FBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQixDQUFBLEtBQXlCLE1BQTVCO1lBQ0ksSUFBQyxDQUFBLFdBQUQsQ0FBQTtZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLENBQVY7WUFDQSxJQUFHLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBZixDQUFUO2dCQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsY0FBaEIsQ0FBWixDQUFIO29CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQW1CLEdBQUQsR0FBSyxrQ0FBdkIsRUFDSTt3QkFBQSxHQUFBLEVBQVUsR0FBVjt3QkFDQSxRQUFBLEVBQVUsTUFEVjt3QkFFQSxLQUFBLEVBQVUsU0FGVjt3QkFHQSxLQUFBLEVBQVUsSUFIVjtxQkFESjtvQkFLQSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7QUFDQSwyQkFQSjtpQkFESjthQUhKOztlQVlBLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixRQUF6QjtJQWZTOzs7Ozs7QUFpQmpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyMjXG5cbmRlbGV0ZSBwcm9jZXNzLmVudi5FTEVDVFJPTl9FTkFCTEVfU0VDVVJJVFlfV0FSTklOR1NcbnByb2Nlc3MuZW52LkVMRUNUUk9OX0RJU0FCTEVfU0VDVVJJVFlfV0FSTklOR1MgPSB0cnVlXG5wcm9jZXNzLmVudi5OT0RFX05PX1dBUk5JTkdTID0gMVxuXG57IGFib3V0LCBhcmdzLCBjaGlsZHAsIGVtcHR5LCBmcywga2xvZywgb3MsIHBvc3QsIHByZWZzLCBzbGFzaCwgc3JjbWFwLCB2YWxpZCwgd2F0Y2gsIHdpbiB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIFxuY2xhc3MgQXBwXG4gICAgXG4gICAgQDogKEBvcHQpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHByb2Nlc3Mub24gJ3VuY2F1Z2h0RXhjZXB0aW9uJyAoZXJyKSAtPlxuICAgICAgICAgICAgc3JjbWFwID0gcmVxdWlyZSAnLi9zcmNtYXAnICAgIFxuICAgICAgICAgICAgc3JjbWFwLmxvZ0VyciBlcnIsICfwn5S7J1xuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBAYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgICAgIEB1c2VyRGF0YSA9IEBhcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uR2V0ICdhcHBOYW1lJyAgQG9uR2V0QXBwTmFtZVxuICAgICAgICBwb3N0Lm9uR2V0ICd1c2VyRGF0YScgQG9uR2V0VXNlckRhdGFcbiAgICAgICAgXG4gICAgICAgIEBhcHAuY29tbWFuZExpbmUuYXBwZW5kU3dpdGNoICdkaXNhYmxlLXNpdGUtaXNvbGF0aW9uLXRyaWFscydcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLk1lbnUuc2V0QXBwbGljYXRpb25NZW51IEBvcHQubWVudVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXlcbiAgICAgICAgICAgIGtsb2cuc2xvZy5pY29uID0gc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LnRyYXkgIFxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBcIlwiXCJcbiAgICAgICAgICAgIG5vcHJlZnMgICAgIGRvbid0IGxvYWQgcHJlZmVyZW5jZXMgICAgICBmYWxzZVxuICAgICAgICAgICAgZGV2dG9vbHMgICAgb3BlbiBkZXZlbG9wZXIgdG9vbHMgICAgICAgIGZhbHNlICAtRFxuICAgICAgICAgICAgd2F0Y2ggICAgICAgd2F0Y2ggc291cmNlcyBmb3IgY2hhbmdlcyAgIGZhbHNlXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdsID0gQG9wdC5hcmdzICsgJ1xcbicgKyBhcmdsIGlmIEBvcHQuYXJnc1xuICAgICAgICBhcmdzID0gYXJncy5pbml0IGFyZ2xcbiAgICAgICAgXG4gICAgICAgIG9uT3RoZXIgPSAoZXZlbnQsIGFyZ3MsIGRpcikgPT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5vbk90aGVySW5zdGFuY2VcbiAgICAgICAgICAgICAgICBAb3B0Lm9uT3RoZXJJbnN0YW5jZSBhcmdzLCBkaXIgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zaW5nbGUgIT0gZmFsc2VcbiAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZSBvbk90aGVyXG4gICAgICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgZWxzZSBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2s/IFxuICAgICAgICAgICAgICAgIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaygpXG4gICAgICAgICAgICAgICAgICAgIEBhcHAub24gJ3NlY29uZC1pbnN0YW5jZScgb25PdGhlclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5pcGNNYWluLm9uICdtZW51QWN0aW9uJyAgIEBvbk1lbnVBY3Rpb25cbiAgICAgICAgZWxlY3Ryb24uaXBjTWFpbi5vbiAnZ2V0V2luQm91bmRzJyBAb25HZXRXaW5Cb3VuZHNcbiAgICAgICAgZWxlY3Ryb24uaXBjTWFpbi5vbiAnc2V0V2luQm91bmRzJyBAb25TZXRXaW5Cb3VuZHNcbiAgICAgICAgZWxlY3Ryb24uaXBjTWFpbi5vbiAnZ2V0V2luSUQnICAgICBAb25HZXRXaW5JRFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICAgICAgQGFwcC5vbiAncmVhZHknIEBvblJlYWR5XG4gICAgICAgIEBhcHAub24gJ2FjdGl2YXRlJyBAb25BY3RpdmF0ZVxuICAgICAgICBAYXBwLm9uICd3aW5kb3ctYWxsLWNsb3NlZCcgKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIGlmIEBvcHQudHJheVxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBxdWl0QXBwKClcbiAgICAgICAgXG4gICAgcmVzb2x2ZTogKGZpbGUpID0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZmlsZVxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuICAgIFxuICAgIG9uUmVhZHk6ID0+XG4gICAgXG4gICAgICAgIGlmIEBvcHQudHJheSB0aGVuIEBpbml0VHJheSgpXG4gICAgICAgICBcbiAgICAgICAgQGhpZGVEb2NrKClcbiAgICAgICAgIFxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgIFxuICAgICAgICBpZiBub3QgYXJncy5ub3ByZWZzXG4gICAgICAgICAgICBzZXAgPSBAb3B0LnByZWZzU2VwZXJhdG9yID8gJ+KWuCdcbiAgICAgICAgICAgIGlmIEBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0IHNlcGFyYXRvcjpzZXAsIGRlZmF1bHRzOnNob3J0Y3V0OkBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0IHNlcGFyYXRvcjpzZXBcbiAgICBcbiAgICAgICAgaWYgdmFsaWQgcHJlZnMuZ2V0ICdzaG9ydGN1dCdcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIHByZWZzLmdldCgnc2hvcnRjdXQnKSwgQG9wdC5vblNob3J0Y3V0ID8gQHNob3dXaW5kb3dcbiAgICAgICAgICAgICBcbiAgICAgICAgaWYgYXJncy53YXRjaFxuICAgICAgICAgICAga2xvZyAnQXBwLm9uUmVhZHkgc3RhcnRXYXRjaGVyJ1xuICAgICAgICAgICAgQHN0YXJ0V2F0Y2hlcigpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm9uU2hvd1xuICAgICAgICAgICAgQG9wdC5vblNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG5cbiAgICAgICAgcG9zdC5lbWl0ICdhcHBSZWFkeSdcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpbml0VHJheTogPT5cbiAgICAgICAgXG4gICAgICAgIHRyYXlJbWcgPSBAcmVzb2x2ZSBAb3B0LnRyYXlcbiAgICAgICAgQHRyYXkgPSBuZXcgZWxlY3Ryb24uVHJheSB0cmF5SW1nXG4gICAgICAgIEB0cmF5Lm9uICdjbGljaycgQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpICE9ICdkYXJ3aW4nXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJRdWl0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHF1aXRBcHBcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBYm91dFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBzaG93QWJvdXRcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY3RpdmF0ZVwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgQHRyYXkuc2V0Q29udGV4dE1lbnUgZWxlY3Ryb24uTWVudS5idWlsZEZyb21UZW1wbGF0ZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2hvd0Fib3V0OiA9PlxuICAgICAgICBcbiAgICAgICAgZGFyayA9ICdkYXJrJyA9PSBwcmVmcy5nZXQgJ3NjaGVtZScgJ2RhcmsnXG4gICAgICAgIGFib3V0XG4gICAgICAgICAgICBpbWc6ICAgICAgICBAcmVzb2x2ZSBAb3B0LmFib3V0XG4gICAgICAgICAgICBjb2xvcjogICAgICBkYXJrIGFuZCAnIzMzMycgb3IgJyNkZGQnXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBkYXJrIGFuZCAnIzExMScgb3IgJyNmZmYnXG4gICAgICAgICAgICBoaWdobGlnaHQ6ICBkYXJrIGFuZCAnI2ZmZicgb3IgJyMwMDAnXG4gICAgICAgICAgICBwa2c6ICAgICAgICBAb3B0LnBrZ1xuICAgICAgICAgICAgZGVidWc6ICAgICAgQG9wdC5hYm91dERlYnVnXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBxdWl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgaWYgQG9wdC5zYXZlQm91bmRzICE9IGZhbHNlXG4gICAgICAgICAgICBAc2F2ZUJvdW5kcygpXG4gICAgICAgIHByZWZzLnNhdmUoKVxuICAgICAgICBcbiAgICAgICAgaWYgJ2RlbGF5JyAhPSBAb3B0Lm9uUXVpdD8oKVxuICAgICAgICAgICAgQGV4aXRBcHAoKVxuICAgICAgICAgICAgXG4gICAgZXhpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBhcHAuZXhpdCAwXG4gICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgIFxuICAgIG9uR2V0QXBwTmFtZTogID0+IEBhcHAuZ2V0TmFtZSgpXG4gICAgb25HZXRVc2VyRGF0YTogPT4gQHVzZXJEYXRhXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGhpZGVEb2NrOiA9PiBAYXBwLmRvY2s/LmhpZGUoKVxuICAgIHNob3dEb2NrOiA9PiBAYXBwLmRvY2s/LnNob3coKVxuICAgICAgICBcbiAgICAjMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIzAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgXG4gICAgdG9nZ2xlV2luZG93RnJvbVRyYXk6ID0+IEBzaG93V2luZG93KClcbiAgICAgICBcbiAgICBvbkFjdGl2YXRlOiAoZXZlbnQsIGhhc1Zpc2libGVXaW5kb3dzKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vbkFjdGl2YXRlXG4gICAgICAgICAgICBpZiBAb3B0Lm9uQWN0aXZhdGUgZXZlbnQsIGhhc1Zpc2libGVXaW5kb3dzXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBoYXNWaXNpYmxlV2luZG93c1xuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuICAgICAgICAgICAgICAgIFxuICAgIHNob3dXaW5kb3c6ID0+XG5cbiAgICAgICAgQG9wdC5vbldpbGxTaG93V2luPygpXG4gICAgICAgIFxuICAgICAgICBpZiBAd2luP1xuICAgICAgICAgICAgQHdpbi5zaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNyZWF0ZVdpbmRvdygpXG4gICAgICAgICAgICBcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNyZWF0ZVdpbmRvdzogKG9uUmVhZHlUb1Nob3cpID0+XG4gICAgXG4gICAgICAgIG9uUmVhZHlUb1Nob3cgPz0gQG9wdC5vbldpblJlYWR5XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCAnYm91bmRzJ1xuICAgICAgICAgICAgXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICBAb3B0Lm1pbldpZHRoICAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICBAb3B0Lm1pbkhlaWdodCAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgbWF4V2lkdGg6ICAgICAgICAgICBAb3B0Lm1heFdpZHRoICAgICAgICAgICA/IDEwMDAwMFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiAgICAgICAgICBAb3B0Lm1heEhlaWdodCAgICAgICAgICA/IDEwMDAwMFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICBAb3B0LmJhY2tncm91bmRDb2xvciAgICA/ICcjMTgxODE4J1xuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBAb3B0LmZyYW1lICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIEBvcHQudHJhbnNwYXJlbnQgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgQG9wdC5mdWxsc2NyZWVuICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmFibGU6ICAgICBAb3B0LmZ1bGxzY3JlZW5hYmxlICAgICA/IHRydWVcbiAgICAgICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgQG9wdC5hY2NlcHRGaXJzdE1vdXNlICAgPyB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgIEBvcHQucmVzaXphYmxlICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICBAb3B0Lm1heGltaXphYmxlICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgQG9wdC5taW5pbWl6YWJsZSAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgIEBvcHQuY2xvc2FibGUgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgYXV0b0hpZGVNZW51QmFyOiAgICB0cnVlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBpY29uOiAgICAgICAgICAgICAgIEByZXNvbHZlIEBvcHQuaWNvbiBcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBjb250ZXh0SXNvbGF0aW9uOiAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246ICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbkluV29ya2VyOiB0cnVlXG4gICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgIFxuICAgICAgICBpZiBAb3B0LmluZGV4VVJMXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgQG9wdC5pbmRleCwgYmFzZVVSTEZvckRhdGFVUkw6QG9wdC5pbmRleFVSTFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIFxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9uICdkZXZ0b29scy1vcGVuZWQnIChldmVudCkgLT4gcG9zdC50b1dpbiBldmVudC5zZW5kZXIuaWQsICdkZXZUb29scycgdHJ1ZVxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9uICdkZXZ0b29scy1jbG9zZWQnIChldmVudCkgLT4gcG9zdC50b1dpbiBldmVudC5zZW5kZXIuaWQsICdkZXZUb29scycgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyhtb2RlOidkZXRhY2gnKSBpZiBhcmdzLmRldnRvb2xzXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAc2F2ZUJvdW5kc1xuICAgICAgICAgICAgQHdpbi5vbiAnbW92ZScgICBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdjbG9zZWQnID0+IEB3aW4gPSBudWxsXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyAgPT4gaWYgQG9wdC5zaW5nbGUgdGhlbiBAaGlkZURvY2soKVxuICAgICAgICBAd2luLm9uICdtb3ZlZCcgIChldmVudCkgPT4gcG9zdC50b1dpbiBldmVudC5zZW5kZXIsICd3aW5Nb3ZlZCcgZXZlbnQuc2VuZGVyLmdldEJvdW5kcygpXG4gICAgICAgIEB3aW4ub24gJ3JlYWR5LXRvLXNob3cnICgodywgb3J0cykgLT4gLT4gXG4gICAgICAgICAgICBvcnRzPyB3XG4gICAgICAgICAgICB3LnNob3coKSBcbiAgICAgICAgICAgIHBvc3QuZW1pdCAnd2luUmVhZHknIHcuaWRcbiAgICAgICAgICAgICkgQHdpbiwgb25SZWFkeVRvU2hvdyBcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBAd2luXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uU2V0V2luQm91bmRzOiAoZXZlbnQsIGJvdW5kcykgPT5cblxuICAgICAgICBAd2luRm9yRXZlbnQoZXZlbnQpPy5zZXRCb3VuZHMgYm91bmRzXG4gICAgICAgIFxuICAgIG9uR2V0V2luQm91bmRzOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IEB3aW5Gb3JFdmVudChldmVudCk/LmdldEJvdW5kcygpXG4gICAgICAgXG4gICAgb25HZXRXaW5JRDogKGV2ZW50KSA9PiBldmVudC5yZXR1cm5WYWx1ZSA9IGV2ZW50LnNlbmRlci5pZFxuIFxuICAgIHNhdmVCb3VuZHM6ID0+IGlmIEB3aW4/IHRoZW4gcHJlZnMuc2V0ICdib3VuZHMnIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgc2NyZWVuU2l6ZTogLT4gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgIFxuICAgIGFsbFdpbnM6IC0+IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLnNvcnQgKGEsYikgLT4gYS5pZCAtIGIuaWRcbiAgICAgICAgXG4gICAgd2luRm9yRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgd2luID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5mcm9tSWQgZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIGlmIG5vdCB3aW5cbiAgICAgICAgICAgIGtsb2cgJ25vIHdpbj8nIGV2ZW50LnNlbmRlci5pZFxuICAgICAgICAgICAgZm9yIHcgaW4gQGFsbFdpbnMoKVxuICAgICAgICAgICAgICAgIGtsb2cgJ3dpbicgdy5pZCwgdy53ZWJDb250ZW50cy5pZFxuICAgICAgICB3aW5cbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoZXZlbnQsIGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIGtsb2cgJ2t4ay5hcHAub25NZW51QWN0aW9uJyBhY3Rpb24sIGV2ZW50LnNlbmRlci5pZFxuICAgICAgICBcbiAgICAgICAgaWYgdyA9IEB3aW5Gb3JFdmVudCBldmVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzd2l0Y2ggYWN0aW9uLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICB3aGVuICdhYm91dCcgICAgICAgdGhlbiBAc2hvd0Fib3V0KClcbiAgICAgICAgICAgICAgICB3aGVuICdxdWl0JyAgICAgICAgdGhlbiBAcXVpdEFwcCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnc2NyZWVuc2hvdCcgIHRoZW4gQHNjcmVlbnNob3Qgd1xuICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bGxzY3JlZW4nICB0aGVuIHcuc2V0RnVsbFNjcmVlbiAhdy5pc0Z1bGxTY3JlZW4oKVxuICAgICAgICAgICAgICAgIHdoZW4gJ2RldnRvb2xzJyAgICB0aGVuIHcud2ViQ29udGVudHMudG9nZ2xlRGV2VG9vbHMoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ3JlbG9hZCcgICAgICB0aGVuIHcud2ViQ29udGVudHMucmVsb2FkSWdub3JpbmdDYWNoZSgpXG4gICAgICAgICAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgIHRoZW4gdy5jbG9zZSgpXG4gICAgICAgICAgICAgICAgd2hlbiAnaGlkZScgICAgICAgIHRoZW4gdy5oaWRlKClcbiAgICAgICAgICAgICAgICB3aGVuICdtaW5pbWl6ZScgICAgdGhlbiB3Lm1pbmltaXplKClcbiAgICAgICAgICAgICAgICB3aGVuICdtYXhpbWl6ZScgXG4gICAgICAgICAgICAgICAgICAgIHdhID0gQHNjcmVlblNpemUoKVxuICAgICAgICAgICAgICAgICAgICB3YiA9IHcuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICAgICAgbWF4aW1pemVkID0gdy5pc01heGltaXplZCgpIG9yICh3Yi53aWR0aCA9PSB3YS53aWR0aCBhbmQgd2IuaGVpZ2h0ID09IHdhLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgaWYgbWF4aW1pemVkIHRoZW4gdy51bm1heGltaXplKCkgZWxzZSB3Lm1heGltaXplKCkgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBrbG9nIFwia3hrLmFwcC5vbk1lbnVBY3Rpb24gTk8gV0lOIVwiXG4gICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgIDAwMFxuICAgIFxuICAgIHNjcmVlbnNob3Q6ICh3KSAtPlxuICAgICAgICBcbiAgICAgICAgdy53ZWJDb250ZW50cy5jYXB0dXJlUGFnZSgpLnRoZW4gKGltZykgPT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnVudXNlZCBcIn4vRGVza3RvcC8je0BvcHQucGtnLm5hbWV9LnBuZ1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZSBmaWxlLCBpbWcudG9QTkcoKSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICBpZiB2YWxpZCBlcnJcbiAgICAgICAgICAgICAgICAgICAga2xvZyAnc2F2aW5nIHNjcmVlbnNob3QgZmFpbGVkJyBlcnJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGtsb2cgXCJzY3JlZW5zaG90IHNhdmVkIHRvICN7ZmlsZX1cIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAgICAgXG4gICAgc3RhcnRXYXRjaGVyOiA9PlxuICAgICAgICBcbiAgICAgICAgQG9wdC5kaXIgPSBzbGFzaC5yZXNvbHZlIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJyBAb25TcmNDaGFuZ2VcbiAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQG9wdC5kaXJzXG4gICAgICAgIFxuICAgICAgICBmb3IgZGlyIGluIEBvcHQuZGlyc1xuICAgICAgICAgICAgdG9XYXRjaCA9IGlmIHNsYXNoLmlzUmVsYXRpdmUgZGlyXG4gICAgICAgICAgICAgICAgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBkaXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzbGFzaC5yZXNvbHZlIGRpclxuICAgICAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciB0b1dhdGNoXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnIEBvblNyY0NoYW5nZVxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlciBcbiAgICBcbiAgICBzdG9wV2F0Y2hlcjogPT5cbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQHdhdGNoZXJzXG4gICAgICAgIGZvciB3YXRjaGVyIGluIEB3YXRjaGVyc1xuICAgICAgICAgICAgd2F0Y2hlci5jbG9zZSgpXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgXG4gICAgb25TcmNDaGFuZ2U6IChpbmZvKSA9PlxuICAgIFxuICAgICAgICAjIGtsb2cgJ29uU3JjQ2hhbmdlJyBpbmZvLmNoYW5nZSwgaW5mby5wYXRoXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaW5mby5wYXRoKSA9PSAnbWFpbidcbiAgICAgICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICAgICAgaWYgcGtnID0gc2xhc2gucGtnIEBvcHQuZGlyXG4gICAgICAgICAgICAgICAgaWYgc2xhc2guaXNEaXIgc2xhc2guam9pbiBwa2csICdub2RlX21vZHVsZXMnXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcIiN7cGtnfS9ub2RlX21vZHVsZXMvLmJpbi9lbGVjdHJvbiAuIC13XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjd2Q6ICAgICAgcGtnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRpbzogICAgJ2luaGVyaXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVsbDogICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgcG9zdC50b1dpbnMgJ21lbnVBY3Rpb24nICdSZWxvYWQnXG4gICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFxuICAgIFxuIl19
//# sourceURL=../coffee/app.coffee