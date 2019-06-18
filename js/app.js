// koffee 1.3.0

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
        var argl, cb, electron, ref1;
        this.opt = opt;
        this.onSrcChange = bind(this.onSrcChange, this);
        this.stopWatcher = bind(this.stopWatcher, this);
        this.startWatcher = bind(this.startWatcher, this);
        this.saveBounds = bind(this.saveBounds, this);
        this.createWindow = bind(this.createWindow, this);
        this.showWindow = bind(this.showWindow, this);
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
        if (this.opt.tray) {
            klog.slog.icon = slash.fileUrl(this.resolve(this.opt.tray));
        }
        argl = "noprefs     don't load preferences      false\ndevtools    open developer tools        false  -D\nwatch       watch sources for changes   false";
        if (this.opt.args) {
            argl = this.opt.args + '\n' + argl;
        }
        args = args.init(argl);
        if (this.opt.single !== false) {
            if (this.app.makeSingleInstance != null) {
                if (this.app.makeSingleInstance((ref1 = this.opt.onOtherInstance) != null ? ref1 : this.showWindow)) {
                    this.app.quit();
                    return;
                }
            } else if (this.app.requestSingleInstanceLock != null) {
                if (this.app.requestSingleInstanceLock()) {
                    if (this.opt.onOtherInstance) {
                        cb = (function(_this) {
                            return function(event, args, dir) {
                                return _this.opt.onOtherInstance(args, dir);
                            };
                        })(this);
                    } else {
                        cb = this.showWindow;
                    }
                    this.app.on('second-instance', cb);
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
        var electron;
        if (this.opt.tray) {
            this.initTray();
        }
        this.hideDock();
        this.app.setName(this.opt.pkg.name);
        if (!args.noprefs) {
            if (this.opt.shortcut) {
                prefs.init({
                    shortcut: this.opt.shortcut
                });
            } else {
                prefs.init();
            }
        }
        if (valid(prefs.get('shortcut'))) {
            electron = require('electron');
            electron.globalShortcut.register(prefs.get('shortcut'), this.showWindow);
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
            color: dark && '#383838' || '#ddd',
            background: dark && '#282828' || '#fff',
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
        var bounds, electron, height, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, width;
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
            backgroundColor: '#181818',
            fullscreenenable: true,
            fullscreen: false,
            show: false,
            frame: false,
            resizable: (ref7 = this.opt.resizable) != null ? ref7 : true,
            maximizable: (ref8 = this.opt.maximizable) != null ? ref8 : true,
            minimizable: (ref9 = this.opt.minimizable) != null ? ref9 : true,
            transparent: (ref10 = this.opt.transparent) != null ? ref10 : false,
            autoHideMenuBar: true,
            icon: this.resolve(this.opt.icon),
            webPreferences: {
                nodeIntegration: true
            }
        });
        this.win.loadURL(slash.fileUrl(this.resolve(this.opt.index)));
        if (args.devtools) {
            this.win.webContents.openDevTools();
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
        klog('startWatcher', this.opt.dir);
        watcher = watch.dir(this.opt.dir);
        watcher.on('change', this.onSrcChange);
        watcher.on('error', function(err) {
            return console.error(err);
        });
        this.watchers.push(watcher);
        if (empty(this.opt.dirs)) {
            return;
        }
        klog('startWatchers', this.opt.dirs);
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
        klog("onSrcChange '" + info.change + "'", info.path);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOztBQVFBLE1BQTRGLE9BQUEsQ0FBUSxPQUFSLENBQTVGLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsaUJBQTNDLEVBQWtELGVBQWxELEVBQXdELG1CQUF4RCxFQUFnRSxXQUFoRSxFQUFvRSxXQUFwRSxFQUF3RSxtQkFBeEUsRUFBZ0YsZUFBaEYsRUFBc0Y7O0FBRWhGO0lBRVcsYUFBQyxHQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7OztRQUVWLE9BQU8sQ0FBQyxFQUFSLENBQVcsbUJBQVgsRUFBZ0MsU0FBQyxHQUFEO0FBQzVCLGdCQUFBO1lBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO1lBQ1QsTUFBTSxDQUFDLE1BQVAsQ0FBYyxHQUFkLEVBQW1CLElBQW5CO21CQUNBO1FBSDRCLENBQWhDO1FBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtRQUVaLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLFFBQU4sQ0FBQTtRQUVaLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFWLEdBQWlCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWQsQ0FBZCxFQURyQjs7UUFHQSxJQUFBLEdBQU87UUFNUCxJQUFrQyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQXZDO1lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFHLENB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Q0FBQSxHQUFHLENBQUMsR0FBZixDQUFUO2dCQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsY0FBaEIsQ0FBWixDQUFIO29CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQW1CLEdBQUQsR0FBSyxrQ0FBdkIsRUFDSTt3QkFBQSxHQUFBLEVBQVUsR0FBVjt3QkFDQSxRQUFBLEVBQVUsTUFEVjt3QkFFQSxLQUFBLEVBQVUsU0FGVjt3QkFHQSxLQUFBLEVBQVUsSUFIVjtxQkFESjtvQkFLQSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7QUFDQSwyQkFQSjtpQkFESjthQUhKOztlQVlBLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUEwQixRQUExQjtJQWZTOzs7Ozs7QUFpQmpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyMjXG5cbnsgYXJncywgcHJlZnMsIHdhdGNoLCBlbXB0eSwgdmFsaWQsIHNsYXNoLCBhYm91dCwgcG9zdCwgY2hpbGRwLCBvcywgZnMsIGtlcnJvciwga2xvZywgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIEFwcFxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cblxuICAgICAgICBwcm9jZXNzLm9uICd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnIpIC0+XG4gICAgICAgICAgICBzcmNtYXAgPSByZXF1aXJlICcuL3NyY21hcCcgICAgXG4gICAgICAgICAgICBzcmNtYXAubG9nRXJyIGVyciwgJ/CflLsnXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHVzZXJEYXRhID0gc2xhc2gudXNlckRhdGEoKSAjQGFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQudHJheVxuICAgICAgICAgICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICdhcHAuYXJncycsIGFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2luZ2xlICE9IGZhbHNlXG4gICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZT8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2UgQG9wdC5vbk90aGVySW5zdGFuY2UgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2UgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2soKVxuICAgICAgICAgICAgICAgICAgICBpZiBAb3B0Lm9uT3RoZXJJbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSAoZXZlbnQsIGFyZ3MsIGRpcikgPT4gQG9wdC5vbk90aGVySW5zdGFuY2UgYXJncywgZGlyIFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IEBzaG93V2luZG93XG4gICAgICAgICAgICAgICAgICAgIEBhcHAub24gJ3NlY29uZC1pbnN0YW5jZScsIGNiICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3Nob3dBYm91dCcsIEBzaG93QWJvdXRcbiAgICAgICAgcG9zdC5vbiAncXVpdEFwcCcsICAgQHF1aXRBcHBcblxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScsIEBvblJlYWR5XG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJywgKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIGlmIG5vdCBAb3B0LnNpbmdsZVdpbmRvd1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBxdWl0QXBwKClcbiAgICAgICAgXG4gICAgcmVzb2x2ZTogKGZpbGUpID0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZmlsZVxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuICAgIFxuICAgIG9uUmVhZHk6ID0+XG4gICAgXG4gICAgICAgIGlmIEBvcHQudHJheSB0aGVuIEBpbml0VHJheSgpXG4gICAgICAgICBcbiAgICAgICAgQGhpZGVEb2NrKClcbiAgICAgICAgIFxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgIFxuICAgICAgICBpZiBub3QgYXJncy5ub3ByZWZzXG4gICAgICAgICAgICBpZiBAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzaG9ydGN1dDogQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQoKVxuICAgIFxuICAgICAgICBpZiB2YWxpZCBwcmVmcy5nZXQgJ3Nob3J0Y3V0J1xuICAgICAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIHByZWZzLmdldCgnc2hvcnRjdXQnKSwgQHNob3dXaW5kb3dcbiAgICAgICAgICAgICBcbiAgICAgICAgaWYgYXJncy53YXRjaFxuICAgICAgICAgICAga2xvZyAnQXBwLm9uUmVhZHkgc3RhcnRXYXRjaGVyJ1xuICAgICAgICAgICAgQHN0YXJ0V2F0Y2hlcigpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm9uU2hvd1xuICAgICAgICAgICAgQG9wdC5vblNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG5cbiAgICAgICAgcG9zdC5lbWl0ICdhcHBSZWFkeSdcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpbml0VHJheTogPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHRyYXlJbWcgPSBAcmVzb2x2ZSBAb3B0LnRyYXlcbiAgICAgICAgQHRyYXkgPSBuZXcgZWxlY3Ryb24uVHJheSB0cmF5SW1nXG4gICAgICAgIEB0cmF5Lm9uICdjbGljaycsIEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSAhPSAnZGFyd2luJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBbXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiUXVpdFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBxdWl0QXBwXG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWJvdXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAc2hvd0Fib3V0XG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWN0aXZhdGVcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIEB0cmF5LnNldENvbnRleHRNZW51IGVsZWN0cm9uLk1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgdGVtcGxhdGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNob3dBYm91dDogPT5cbiAgICAgICAgXG4gICAgICAgIGRhcmsgPSAnZGFyaycgPT0gcHJlZnMuZ2V0ICdzY2hlbWUnLCAnZGFyaydcbiAgICAgICAgYWJvdXRcbiAgICAgICAgICAgIGltZzogICAgICAgIEByZXNvbHZlIEBvcHQuYWJvdXRcbiAgICAgICAgICAgIGNvbG9yOiAgICAgIGRhcmsgYW5kICcjMzgzODM4JyBvciAnI2RkZCdcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGRhcmsgYW5kICcjMjgyODI4JyBvciAnI2ZmZidcbiAgICAgICAgICAgIGhpZ2hsaWdodDogIGRhcmsgYW5kICcjZmZmJyAgICBvciAnIzAwMCdcbiAgICAgICAgICAgIHBrZzogICAgICAgIEBvcHQucGtnXG4gICAgICAgICAgICBkZWJ1ZzogICAgICBAb3B0LmFib3V0RGVidWdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHF1aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAnZGVsYXknICE9IEBvcHQub25RdWl0PygpXG4gICAgICAgICAgICBAZXhpdEFwcCgpXG4gICAgICAgICAgICBcbiAgICBleGl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaGlkZURvY2s6ID0+IEBhcHAuZG9jaz8uaGlkZSgpXG4gICAgc2hvd0RvY2s6ID0+IEBhcHAuZG9jaz8uc2hvdygpXG4gICAgICAgIFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIzAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIzAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiAgICBcbiAgICB0b2dnbGVXaW5kb3c6ID0+XG4gICAgICAgICBcbiAgICAgICAgaWYgQHdpbj8uaXNWaXNpYmxlKClcbiAgICAgICAgICAgIEB3aW4uaGlkZSgpXG4gICAgICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG5cbiAgICB0b2dnbGVXaW5kb3dGcm9tVHJheTogPT4gQHNob3dXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgc2hvd1dpbmRvdzogPT5cblxuICAgICAgICBAb3B0Lm9uV2lsbFNob3dXaW4/KClcbiAgICAgICAgXG4gICAgICAgIGlmIEB3aW4/XG4gICAgICAgICAgICBAd2luLnNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY3JlYXRlV2luZG93KClcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY3JlYXRlV2luZG93OiAob25SZWFkeVRvU2hvdykgPT5cbiAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgXG4gICAgICAgIG9uUmVhZHlUb1Nob3cgPz0gQG9wdC5vbldpblJlYWR5XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCAnYm91bmRzJ1xuICAgICAgICAgICAgXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICBAb3B0Lm1pbldpZHRoICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICBAb3B0Lm1pbkhlaWdodCA/IDI1MFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzE4MTgxOCdcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6IHRydWVcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgQG9wdC5yZXNpemFibGUgICA/IHRydWVcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgQG9wdC5tYXhpbWl6YWJsZSA/IHRydWVcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgQG9wdC5taW5pbWl6YWJsZSA/IHRydWVcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgQG9wdC50cmFuc3BhcmVudCA/IGZhbHNlXG4gICAgICAgICAgICBhdXRvSGlkZU1lbnVCYXI6IHRydWVcbiAgICAgICAgICAgIGljb246ICAgICAgICAgICAgQHJlc29sdmUgQG9wdC5pY29uIFxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgIFxuICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCkgaWYgYXJncy5kZXZ0b29sc1xuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55IGlmIGJvdW5kcz9cbiAgICAgICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQHNhdmVCb3VuZHNcbiAgICAgICAgICAgIEB3aW4ub24gJ21vdmUnICAgQHNhdmVCb3VuZHNcbiAgICAgICAgQHdpbi5vbiAnY2xvc2VkJyA9PiBAd2luID0gbnVsbFxuICAgICAgICBAd2luLm9uICdjbG9zZScgID0+IEBoaWRlRG9jaygpXG4gICAgICAgIEB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAoZXZlbnQpID0+IFxuICAgICAgICAgICAgd2luID0gZXZlbnQuc2VuZGVyXG4gICAgICAgICAgICBvblJlYWR5VG9TaG93PyB3aW4gXG4gICAgICAgICAgICB3aW4uc2hvdygpIFxuICAgICAgICAgICAgcG9zdC5lbWl0ICd3aW5SZWFkeScgd2luLmlkXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICAgICBAd2luXG5cbiAgICBzYXZlQm91bmRzOiA9PiBpZiBAd2luPyB0aGVuIHByZWZzLnNldCAnYm91bmRzJyBAd2luLmdldEJvdW5kcygpXG4gICAgc2NyZWVuU2l6ZTogLT4gXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgXG4gICAgICAgIFxuICAgIHN0YXJ0V2F0Y2hlcjogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGlyID0gc2xhc2gucmVzb2x2ZSBAb3B0LmRpclxuICAgICAgICBrbG9nICdzdGFydFdhdGNoZXInLCBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScsIEBvblNyY0NoYW5nZVxuICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicsIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQG9wdC5kaXJzXG4gICAgICAgIFxuICAgICAgICBrbG9nICdzdGFydFdhdGNoZXJzJywgQG9wdC5kaXJzXG4gICAgICAgIGZvciBkaXIgaW4gQG9wdC5kaXJzXG4gICAgICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZGlyXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnLCBAb25TcmNDaGFuZ2VcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJywgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyIFxuICAgIFxuICAgIHN0b3BXYXRjaGVyOiA9PlxuICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAd2F0Y2hlcnNcbiAgICAgICAgZm9yIHdhdGNoZXIgaW4gQHdhdGNoZXJzXG4gICAgICAgICAgICB3YXRjaGVyLmNsb3NlKClcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICBcbiAgICBvblNyY0NoYW5nZTogKGluZm8pID0+XG4gICAgXG4gICAgICAgIGtsb2cgXCJvblNyY0NoYW5nZSAnI3tpbmZvLmNoYW5nZX0nXCIsIGluZm8ucGF0aFxuICAgICAgICBpZiBzbGFzaC5iYXNlKGluZm8ucGF0aCkgPT0gJ21haW4nXG4gICAgICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgICAgIGlmIHBrZyA9IHNsYXNoLnBrZyBAb3B0LmRpclxuICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzRGlyIHNsYXNoLmpvaW4gcGtnLCAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIje3BrZ30vbm9kZV9tb2R1bGVzLy5iaW4vZWxlY3Ryb24gLiAtd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiAgICAgIHBrZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RkaW86ICAgICdpbmhlcml0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hlbGw6ICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHBvc3QudG9XaW5zICdtZW51QWN0aW9uJywgJ1JlbG9hZCdcbiAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwXG4gICAgIl19
//# sourceURL=../coffee/app.coffee