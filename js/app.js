// koffee 1.4.0

/*
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000
 */
var App, _, about, args, childp, empty, fs, kerror, klog, os, post, prefs, ref, slash, valid, watch,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), args = ref.args, prefs = ref.prefs, watch = ref.watch, empty = ref.empty, valid = ref.valid, slash = ref.slash, about = ref.about, post = ref.post, childp = ref.childp, os = ref.os, fs = ref.fs, kerror = ref.kerror, klog = ref.klog, _ = ref._;

App = (function() {
    function App(opt) {
        var argl, electron, onOther;
        this.opt = opt;
        this.onSrcChange = bind(this.onSrcChange, this);
        this.stopWatcher = bind(this.stopWatcher, this);
        this.startWatcher = bind(this.startWatcher, this);
        this.saveBounds = bind(this.saveBounds, this);
        this.createWindow = bind(this.createWindow, this);
        this.showWindow = bind(this.showWindow, this);
        this.onActivate = bind(this.onActivate, this);
        this.toggleWindowFromTray = bind(this.toggleWindowFromTray, this);
        this.toggleWindow = bind(this.toggleWindow, this);
        this.showDock = bind(this.showDock, this);
        this.hideDock = bind(this.hideDock, this);
        this.exitApp = bind(this.exitApp, this);
        this.quitApp = bind(this.quitApp, this);
        this.showAbout = bind(this.showAbout, this);
        this.initTray = bind(this.initTray, this);
        this.onReady = bind(this.onReady, this);
        this.resolve = bind(this.resolve, this);
        process.on('uncaughtException', function(err) {
            var srcmap;
            srcmap = require('./srcmap');
            srcmap.logErr(err, '🔻');
            return true;
        });
        this.watchers = [];
        electron = require('electron');
        this.app = electron.app;
        this.userData = slash.userData();
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
        post.on('showAbout', this.showAbout);
        post.on('quitApp', this.quitApp);
        this.app.setName(this.opt.pkg.name);
        this.app.on('ready', this.onReady);
        this.app.on('activate', this.onActivate);
        this.app.on('window-all-closed', (function(_this) {
            return function(event) {
                if (!_this.opt.singleWindow) {
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
        var electron, ref1, ref2, sep;
        if (this.opt.tray) {
            this.initTray();
        }
        this.hideDock();
        this.app.setName(this.opt.pkg.name);
        if (!args.noprefs) {
            sep = (ref1 = this.opt.prefsSeperator) != null ? ref1 : ':';
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
            electron = require('electron');
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
        var electron, template, trayImg;
        electron = require('electron');
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

    App.prototype.toggleWindow = function() {
        var ref1;
        if ((ref1 = this.win) != null ? ref1.isVisible() : void 0) {
            this.win.hide();
            return this.hideDock();
        } else {
            return this.showWindow();
        }
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
        var bounds, electron, height, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, width;
        electron = require('electron');
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
            backgroundColor: (ref7 = this.opt.backgroundColor) != null ? ref7 : '#181818',
            frame: (ref8 = this.opt.frame) != null ? ref8 : false,
            transparent: (ref9 = this.opt.transparent) != null ? ref9 : false,
            fullscreen: (ref10 = this.opt.fullscreen) != null ? ref10 : false,
            fullscreenenable: (ref11 = this.opt.fullscreenenable) != null ? ref11 : true,
            acceptFirstMouse: (ref12 = this.opt.acceptFirstMouse) != null ? ref12 : true,
            resizable: (ref13 = this.opt.resizable) != null ? ref13 : true,
            maximizable: (ref14 = this.opt.maximizable) != null ? ref14 : true,
            minimizable: (ref15 = this.opt.minimizable) != null ? ref15 : true,
            closable: (ref16 = this.opt.closable) != null ? ref16 : true,
            autoHideMenuBar: true,
            thickFrame: false,
            show: false,
            icon: this.resolve(this.opt.icon),
            webPreferences: {
                webSecurity: false,
                backgroundThrottling: false,
                nodeIntegration: true
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
                return _this.hideDock();
            };
        })(this));
        this.win.on('ready-to-show', (function(_this) {
            return function(event) {
                var win;
                win = event.sender;
                if (typeof onReadyToShow === "function") {
                    onReadyToShow(win);
                }
                win.show();
                return post.emit('winReady', win.id);
            };
        })(this));
        this.showDock();
        return this.win;
    };

    App.prototype.saveBounds = function() {
        if (this.win != null) {
            return prefs.set('bounds', this.win.getBounds());
        }
    };

    App.prototype.screenSize = function() {
        var electron;
        electron = require('electron');
        return electron.screen.getPrimaryDisplay().workAreaSize;
    };

    App.prototype.startWatcher = function() {
        var dir, i, len, ref1, results, watcher;
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
            watcher = watch.dir(slash.resolve(slash.join(this.opt.dir, dir)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOztBQVFBLE1BQTRGLE9BQUEsQ0FBUSxPQUFSLENBQTVGLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsaUJBQTNDLEVBQWtELGVBQWxELEVBQXdELG1CQUF4RCxFQUFnRSxXQUFoRSxFQUFvRSxXQUFwRSxFQUF3RSxtQkFBeEUsRUFBZ0YsZUFBaEYsRUFBc0Y7O0FBRWhGO0lBRUMsYUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFQSxPQUFPLENBQUMsRUFBUixDQUFXLG1CQUFYLEVBQStCLFNBQUMsR0FBRDtBQUMzQixnQkFBQTtZQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjtZQUNULE1BQU0sQ0FBQyxNQUFQLENBQWMsR0FBZCxFQUFtQixJQUFuQjttQkFDQTtRQUgyQixDQUEvQjtRQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7UUFFWixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7UUFDWCxJQUFDLENBQUEsR0FBRCxHQUFPLFFBQVEsQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLEtBQUssQ0FBQyxRQUFOLENBQUE7UUFFWixRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFkLENBQWlDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBdEM7UUFFQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBUjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBVixHQUFpQixLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFkLENBQWQsRUFEckI7O1FBR0EsSUFBQSxHQUFPO1FBTVAs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S0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0FBQ0EsMkJBUEo7aUJBREo7YUFISjs7ZUFZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsUUFBekI7SUFkUzs7Ozs7O0FBZ0JqQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG57IGFyZ3MsIHByZWZzLCB3YXRjaCwgZW1wdHksIHZhbGlkLCBzbGFzaCwgYWJvdXQsIHBvc3QsIGNoaWxkcCwgb3MsIGZzLCBrZXJyb3IsIGtsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBBcHBcbiAgICBcbiAgICBAOiAoQG9wdCkgLT5cblxuICAgICAgICBwcm9jZXNzLm9uICd1bmNhdWdodEV4Y2VwdGlvbicgKGVycikgLT5cbiAgICAgICAgICAgIHNyY21hcCA9IHJlcXVpcmUgJy4vc3JjbWFwJyAgICBcbiAgICAgICAgICAgIHNyY21hcC5sb2dFcnIgZXJyLCAn8J+UuydcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgQGFwcCA9IGVsZWN0cm9uLmFwcFxuICAgICAgICBAdXNlckRhdGEgPSBzbGFzaC51c2VyRGF0YSgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5NZW51LnNldEFwcGxpY2F0aW9uTWVudSBAb3B0Lm1lbnVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5XG4gICAgICAgICAgICBrbG9nLnNsb2cuaWNvbiA9IHNsYXNoLmZpbGVVcmwgQHJlc29sdmUgQG9wdC50cmF5ICBcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdsID0gXCJcIlwiXG4gICAgICAgICAgICBub3ByZWZzICAgICBkb24ndCBsb2FkIHByZWZlcmVuY2VzICAgICAgZmFsc2VcbiAgICAgICAgICAgIGRldnRvb2xzICAgIG9wZW4gZGV2ZWxvcGVyIHRvb2xzICAgICAgICBmYWxzZSAgLURcbiAgICAgICAgICAgIHdhdGNoICAgICAgIHdhdGNoIHNvdXJjZXMgZm9yIGNoYW5nZXMgICBmYWxzZVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IEBvcHQuYXJncyArICdcXG4nICsgYXJnbCBpZiBAb3B0LmFyZ3NcbiAgICAgICAgYXJncyA9IGFyZ3MuaW5pdCBhcmdsXG4gICAgICAgIFxuICAgICAgICBvbk90aGVyID0gKGV2ZW50LCBhcmdzLCBkaXIpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQub25PdGhlckluc3RhbmNlXG4gICAgICAgICAgICAgICAgQG9wdC5vbk90aGVySW5zdGFuY2UgYXJncywgZGlyIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBzaG93V2luZG93KClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2luZ2xlICE9IGZhbHNlXG4gICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZT8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2Ugb25PdGhlclxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2UgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2soKVxuICAgICAgICAgICAgICAgICAgICBAYXBwLm9uICdzZWNvbmQtaW5zdGFuY2UnIG9uT3RoZXJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnc2hvd0Fib3V0JyBAc2hvd0Fib3V0XG4gICAgICAgIHBvc3Qub24gJ3F1aXRBcHAnICAgQHF1aXRBcHBcblxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScgQG9uUmVhZHlcbiAgICAgICAgQGFwcC5vbiAnYWN0aXZhdGUnIEBvbkFjdGl2YXRlXG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJyAoZXZlbnQpID0+IFxuICAgICAgICAgICAgaWYgbm90IEBvcHQuc2luZ2xlV2luZG93XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHF1aXRBcHAoKVxuICAgICAgICBcbiAgICByZXNvbHZlOiAoZmlsZSkgPT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBmaWxlXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4gICAgXG4gICAgb25SZWFkeTogPT5cbiAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5IHRoZW4gQGluaXRUcmF5KClcbiAgICAgICAgIFxuICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICAgXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgXG4gICAgICAgIGlmIG5vdCBhcmdzLm5vcHJlZnNcbiAgICAgICAgICAgIHNlcCA9IEBvcHQucHJlZnNTZXBlcmF0b3IgPyAnOidcbiAgICAgICAgICAgIGlmIEBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0IHNlcGFyYXRvcjpzZXAsIGRlZmF1bHRzOnNob3J0Y3V0OkBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0IHNlcGFyYXRvcjpzZXBcbiAgICBcbiAgICAgICAgaWYgdmFsaWQgcHJlZnMuZ2V0ICdzaG9ydGN1dCdcbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBwcmVmcy5nZXQoJ3Nob3J0Y3V0JyksIEBvcHQub25TaG9ydGN1dCA/IEBzaG93V2luZG93XG4gICAgICAgICAgICAgXG4gICAgICAgIGlmIGFyZ3Mud2F0Y2hcbiAgICAgICAgICAgIGtsb2cgJ0FwcC5vblJlYWR5IHN0YXJ0V2F0Y2hlcidcbiAgICAgICAgICAgIEBzdGFydFdhdGNoZXIoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vblNob3dcbiAgICAgICAgICAgIEBvcHQub25TaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuXG4gICAgICAgIHBvc3QuZW1pdCAnYXBwUmVhZHknXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5pdFRyYXk6ID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB0cmF5SW1nID0gQHJlc29sdmUgQG9wdC50cmF5XG4gICAgICAgIEB0cmF5ID0gbmV3IGVsZWN0cm9uLlRyYXkgdHJheUltZ1xuICAgICAgICBAdHJheS5vbiAnY2xpY2snIEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSAhPSAnZGFyd2luJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBbXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiUXVpdFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBxdWl0QXBwXG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWJvdXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAc2hvd0Fib3V0XG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWN0aXZhdGVcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIEB0cmF5LnNldENvbnRleHRNZW51IGVsZWN0cm9uLk1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgdGVtcGxhdGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNob3dBYm91dDogPT5cbiAgICAgICAgXG4gICAgICAgIGRhcmsgPSAnZGFyaycgPT0gcHJlZnMuZ2V0ICdzY2hlbWUnICdkYXJrJ1xuICAgICAgICBhYm91dFxuICAgICAgICAgICAgaW1nOiAgICAgICAgQHJlc29sdmUgQG9wdC5hYm91dFxuICAgICAgICAgICAgY29sb3I6ICAgICAgZGFyayBhbmQgJyMzMzMnIG9yICcjZGRkJ1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMxMTEnIG9yICcjZmZmJ1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiAgZGFyayBhbmQgJyNmZmYnIG9yICcjMDAwJ1xuICAgICAgICAgICAgcGtnOiAgICAgICAgQG9wdC5wa2dcbiAgICAgICAgICAgIGRlYnVnOiAgICAgIEBvcHQuYWJvdXREZWJ1Z1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcXVpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHNhdmVCb3VuZHMoKVxuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdkZWxheScgIT0gQG9wdC5vblF1aXQ/KClcbiAgICAgICAgICAgIEBleGl0QXBwKClcbiAgICAgICAgICAgIFxuICAgIGV4aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBoaWRlRG9jazogPT4gQGFwcC5kb2NrPy5oaWRlKClcbiAgICBzaG93RG9jazogPT4gQGFwcC5kb2NrPy5zaG93KClcbiAgICAgICAgXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgIFxuICAgIHRvZ2dsZVdpbmRvdzogPT5cbiAgICAgICAgIFxuICAgICAgICBpZiBAd2luPy5pc1Zpc2libGUoKVxuICAgICAgICAgICAgQHdpbi5oaWRlKClcbiAgICAgICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgIHRvZ2dsZVdpbmRvd0Zyb21UcmF5OiA9PiBAc2hvd1dpbmRvdygpXG4gICAgICAgXG4gICAgb25BY3RpdmF0ZTogKGV2ZW50LCBoYXNWaXNpYmxlV2luZG93cykgPT4gXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vbkFjdGl2YXRlXG4gICAgICAgICAgICBpZiBAb3B0Lm9uQWN0aXZhdGUgZXZlbnQsIGhhc1Zpc2libGVXaW5kb3dzXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBoYXNWaXNpYmxlV2luZG93c1xuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuICAgICAgICAgICAgICAgIFxuICAgIHNob3dXaW5kb3c6ID0+XG5cbiAgICAgICAgQG9wdC5vbldpbGxTaG93V2luPygpXG4gICAgICAgIFxuICAgICAgICBpZiBAd2luP1xuICAgICAgICAgICAgQHdpbi5zaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNyZWF0ZVdpbmRvdygpXG4gICAgICAgICAgICBcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNyZWF0ZVdpbmRvdzogKG9uUmVhZHlUb1Nob3cpID0+XG4gICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIFxuICAgICAgICBvblJlYWR5VG9TaG93ID89IEBvcHQub25XaW5SZWFkeVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zYXZlQm91bmRzICE9IGZhbHNlXG4gICAgICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgJ2JvdW5kcydcbiAgICAgICAgICAgIFxuICAgICAgICB3aWR0aCAgPSBib3VuZHM/LndpZHRoICA/IEBvcHQud2lkdGggID8gNTAwXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcz8uaGVpZ2h0ID8gQG9wdC5oZWlnaHQgPyA1MDBcbiAgICAgICAgXG4gICAgICAgIEB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgIG1pbldpZHRoOiAgICAgICAgICAgQG9wdC5taW5XaWR0aCAgICAgICAgICAgPyAyNTBcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAgICAgQG9wdC5taW5IZWlnaHQgICAgICAgICAgPyAyNTBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgQG9wdC5iYWNrZ3JvdW5kQ29sb3IgICAgPyAnIzE4MTgxOCdcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgQG9wdC5mcmFtZSAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICBAb3B0LnRyYW5zcGFyZW50ICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIEBvcHQuZnVsbHNjcmVlbiAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgQG9wdC5mdWxsc2NyZWVuZW5hYmxlICAgPyB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIEBvcHQuYWNjZXB0Rmlyc3RNb3VzZSAgID8gdHJ1ZVxuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBAb3B0LnJlc2l6YWJsZSAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgICAgQG9wdC5tYXhpbWl6YWJsZSAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgIEBvcHQubWluaW1pemFibGUgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgY2xvc2FibGU6ICAgICAgICAgICBAb3B0LmNsb3NhYmxlICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICAgICAgdGhpY2tGcmFtZTogICAgICAgICBmYWxzZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgaWNvbjogICAgICAgICAgICAgICBAcmVzb2x2ZSBAb3B0Lmljb24gXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kVGhyb3R0bGluZzogICBmYWxzZVxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogICAgICAgIHRydWVcbiAgICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgIFxuICAgICAgICBpZiBAb3B0LmluZGV4VVJMXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgQG9wdC5pbmRleCwgYmFzZVVSTEZvckRhdGFVUkw6QG9wdC5pbmRleFVSTFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIFxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyhtb2RlOidkZXRhY2gnKSBpZiBhcmdzLmRldnRvb2xzXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAc2F2ZUJvdW5kc1xuICAgICAgICAgICAgQHdpbi5vbiAnbW92ZScgICBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdjbG9zZWQnID0+IEB3aW4gPSBudWxsXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyAgPT4gQGhpZGVEb2NrKClcbiAgICAgICAgQHdpbi5vbiAncmVhZHktdG8tc2hvdycgKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIHdpbiA9IGV2ZW50LnNlbmRlclxuICAgICAgICAgICAgb25SZWFkeVRvU2hvdz8gd2luIFxuICAgICAgICAgICAgd2luLnNob3coKSBcbiAgICAgICAgICAgIHBvc3QuZW1pdCAnd2luUmVhZHknIHdpbi5pZFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2luXG5cbiAgICBzYXZlQm91bmRzOiA9PiBpZiBAd2luPyB0aGVuIHByZWZzLnNldCAnYm91bmRzJyBAd2luLmdldEJvdW5kcygpXG4gICAgc2NyZWVuU2l6ZTogLT4gXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgXG4gICAgICAgIFxuICAgIHN0YXJ0V2F0Y2hlcjogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGlyID0gc2xhc2gucmVzb2x2ZSBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlclxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEBvcHQuZGlyc1xuICAgICAgICBcbiAgICAgICAgZm9yIGRpciBpbiBAb3B0LmRpcnNcbiAgICAgICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBkaXJcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyIFxuICAgIFxuICAgIHN0b3BXYXRjaGVyOiA9PlxuICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAd2F0Y2hlcnNcbiAgICAgICAgZm9yIHdhdGNoZXIgaW4gQHdhdGNoZXJzXG4gICAgICAgICAgICB3YXRjaGVyLmNsb3NlKClcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICBcbiAgICBvblNyY0NoYW5nZTogKGluZm8pID0+XG4gICAgXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaW5mby5wYXRoKSA9PSAnbWFpbidcbiAgICAgICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICAgICAgaWYgcGtnID0gc2xhc2gucGtnIEBvcHQuZGlyXG4gICAgICAgICAgICAgICAgaWYgc2xhc2guaXNEaXIgc2xhc2guam9pbiBwa2csICdub2RlX21vZHVsZXMnXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcIiN7cGtnfS9ub2RlX21vZHVsZXMvLmJpbi9lbGVjdHJvbiAuIC13XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjd2Q6ICAgICAgcGtnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRpbzogICAgJ2luaGVyaXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVsbDogICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgcG9zdC50b1dpbnMgJ21lbnVBY3Rpb24nICdSZWxvYWQnXG4gICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFxuICAgICJdfQ==
//# sourceURL=../coffee/app.coffee