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
        electron.Menu.setApplicationMenu(this.opt.menu);
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
        var bounds, electron, height, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, width;
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
            autoHideMenuBar: true,
            thickFrame: false,
            show: false,
            minimizable: false,
            maximizable: false,
            closable: false,
            icon: this.resolve(this.opt.icon),
            webPreferences: {
                nodeIntegration: true
            }
        });
        if (bounds != null) {
            this.win.setPosition(bounds.x, bounds.y);
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOztBQVFBLE1BQTRGLE9BQUEsQ0FBUSxPQUFSLENBQTVGLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsaUJBQTNDLEVBQWtELGVBQWxELEVBQXdELG1CQUF4RCxFQUFnRSxXQUFoRSxFQUFvRSxXQUFwRSxFQUF3RSxtQkFBeEUsRUFBZ0YsZUFBaEYsRUFBc0Y7O0FBRWhGO0lBRVcsYUFBQyxHQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7OztRQUVWLE9BQU8sQ0FBQyxFQUFSLENBQVcsbUJBQVgsRUFBZ0MsU0FBQyxHQUFEO0FBQzVCLGdCQUFBO1lBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO1lBQ1QsTUFBTSxDQUFDLE1BQVAsQ0FBYyxHQUFkLEVBQW1CLElBQW5CO21CQUNBO1FBSDRCLENBQWhDO1FBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtRQUVaLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLFFBQU4sQ0FBQTtRQUVaLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWQsQ0FBaUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUF0QztRQUVBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFWLEdBQWlCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWQsQ0FBZCxFQURyQjs7UUFHQSxJQUFBLEdBQU87UUFNUCxJ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QSxtQkFBQTs7QUFDQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksT0FBTyxDQUFDLEtBQVIsQ0FBQTtBQURKO2VBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUxIOztrQkFPYixXQUFBLEdBQWEsU0FBQyxJQUFEO0FBRVQsWUFBQTtRQUFBLElBQUEsQ0FBSyxlQUFBLEdBQWdCLElBQUksQ0FBQyxNQUFyQixHQUE0QixHQUFqQyxFQUFxQyxJQUFJLENBQUMsSUFBMUM7UUFDQSxJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLElBQWhCLENBQUEsS0FBeUIsTUFBNUI7WUFDSSxJQUFDLENBQUEsV0FBRCxDQUFBO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsQ0FBVjtZQUNBLElBQUcsR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFmLENBQVQ7Z0JBQ0ksSUFBRyxLQUFLLENBQUMsS0FBTixDQUFZLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUFnQixjQUFoQixDQUFaLENBQUg7b0JBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBbUIsR0FBRCxHQUFLLGtDQUF2QixFQUNJO3dCQUFBLEdBQUEsRUFBVSxHQUFWO3dCQUNBLFFBQUEsRUFBVSxNQURWO3dCQUVBLEtBQUEsRUFBVSxTQUZWO3dCQUdBLEtBQUEsRUFBVSxJQUhWO3FCQURKO29CQUtBLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYjtBQUNBLDJCQVBKO2lCQURKO2FBSEo7O2VBWUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQTBCLFFBQTFCO0lBZlM7Ozs7OztBQWlCakIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIyNcblxueyBhcmdzLCBwcmVmcywgd2F0Y2gsIGVtcHR5LCB2YWxpZCwgc2xhc2gsIGFib3V0LCBwb3N0LCBjaGlsZHAsIG9zLCBmcywga2Vycm9yLCBrbG9nLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgQXBwXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuXG4gICAgICAgIHByb2Nlc3Mub24gJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGVycikgLT5cbiAgICAgICAgICAgIHNyY21hcCA9IHJlcXVpcmUgJy4vc3JjbWFwJyAgICBcbiAgICAgICAgICAgIHNyY21hcC5sb2dFcnIgZXJyLCAn8J+UuydcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgQGFwcCA9IGVsZWN0cm9uLmFwcFxuICAgICAgICBAdXNlckRhdGEgPSBzbGFzaC51c2VyRGF0YSgpICNAYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uTWVudS5zZXRBcHBsaWNhdGlvbk1lbnUgQG9wdC5tZW51XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQudHJheVxuICAgICAgICAgICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICdhcHAuYXJncycsIGFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2luZ2xlICE9IGZhbHNlXG4gICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZT8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2UgQG9wdC5vbk90aGVySW5zdGFuY2UgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2UgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2soKVxuICAgICAgICAgICAgICAgICAgICBpZiBAb3B0Lm9uT3RoZXJJbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSAoZXZlbnQsIGFyZ3MsIGRpcikgPT4gQG9wdC5vbk90aGVySW5zdGFuY2UgYXJncywgZGlyIFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IEBzaG93V2luZG93XG4gICAgICAgICAgICAgICAgICAgIEBhcHAub24gJ3NlY29uZC1pbnN0YW5jZScsIGNiICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3Nob3dBYm91dCcsIEBzaG93QWJvdXRcbiAgICAgICAgcG9zdC5vbiAncXVpdEFwcCcsICAgQHF1aXRBcHBcblxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScsIEBvblJlYWR5XG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJywgKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIGlmIG5vdCBAb3B0LnNpbmdsZVdpbmRvd1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBxdWl0QXBwKClcbiAgICAgICAgXG4gICAgcmVzb2x2ZTogKGZpbGUpID0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZmlsZVxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuICAgIFxuICAgIG9uUmVhZHk6ID0+XG4gICAgXG4gICAgICAgIGlmIEBvcHQudHJheSB0aGVuIEBpbml0VHJheSgpXG4gICAgICAgICBcbiAgICAgICAgQGhpZGVEb2NrKClcbiAgICAgICAgIFxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgIFxuICAgICAgICBpZiBub3QgYXJncy5ub3ByZWZzXG4gICAgICAgICAgICBzZXAgPSBAb3B0LnByZWZzU2VwZXJhdG9yID8gJzonXG4gICAgICAgICAgICBpZiBAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzZXBhcmF0b3I6c2VwLCBkZWZhdWx0czpzaG9ydGN1dDpAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzZXBhcmF0b3I6c2VwXG4gICAgXG4gICAgICAgIGlmIHZhbGlkIHByZWZzLmdldCAnc2hvcnRjdXQnXG4gICAgICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KCdzaG9ydGN1dCcpLCBAb3B0Lm9uU2hvcnRjdXQgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLndhdGNoXG4gICAgICAgICAgICBrbG9nICdBcHAub25SZWFkeSBzdGFydFdhdGNoZXInXG4gICAgICAgICAgICBAc3RhcnRXYXRjaGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25TaG93XG4gICAgICAgICAgICBAb3B0Lm9uU2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgICAgICBwb3N0LmVtaXQgJ2FwcFJlYWR5J1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluaXRUcmF5OiA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgdHJheUltZyA9IEByZXNvbHZlIEBvcHQudHJheVxuICAgICAgICBAdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IHRyYXlJbWdcbiAgICAgICAgQHRyYXkub24gJ2NsaWNrJywgQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpICE9ICdkYXJ3aW4nXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJRdWl0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHF1aXRBcHBcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBYm91dFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBzaG93QWJvdXRcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY3RpdmF0ZVwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgQHRyYXkuc2V0Q29udGV4dE1lbnUgZWxlY3Ryb24uTWVudS5idWlsZEZyb21UZW1wbGF0ZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2hvd0Fib3V0OiA9PlxuICAgICAgICBcbiAgICAgICAgZGFyayA9ICdkYXJrJyA9PSBwcmVmcy5nZXQgJ3NjaGVtZScsICdkYXJrJ1xuICAgICAgICBhYm91dFxuICAgICAgICAgICAgaW1nOiAgICAgICAgQHJlc29sdmUgQG9wdC5hYm91dFxuICAgICAgICAgICAgY29sb3I6ICAgICAgZGFyayBhbmQgJyMzODM4MzgnIG9yICcjZGRkJ1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMyODI4MjgnIG9yICcjZmZmJ1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiAgZGFyayBhbmQgJyNmZmYnICAgIG9yICcjMDAwJ1xuICAgICAgICAgICAgcGtnOiAgICAgICAgQG9wdC5wa2dcbiAgICAgICAgICAgIGRlYnVnOiAgICAgIEBvcHQuYWJvdXREZWJ1Z1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcXVpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHNhdmVCb3VuZHMoKVxuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdkZWxheScgIT0gQG9wdC5vblF1aXQ/KClcbiAgICAgICAgICAgIEBleGl0QXBwKClcbiAgICAgICAgICAgIFxuICAgIGV4aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBoaWRlRG9jazogPT4gQGFwcC5kb2NrPy5oaWRlKClcbiAgICBzaG93RG9jazogPT4gQGFwcC5kb2NrPy5zaG93KClcbiAgICAgICAgXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgIFxuICAgIHRvZ2dsZVdpbmRvdzogPT5cbiAgICAgICAgIFxuICAgICAgICBpZiBAd2luPy5pc1Zpc2libGUoKVxuICAgICAgICAgICAgQHdpbi5oaWRlKClcbiAgICAgICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgIHRvZ2dsZVdpbmRvd0Zyb21UcmF5OiA9PiBAc2hvd1dpbmRvdygpXG4gICAgICAgICAgICBcbiAgICBzaG93V2luZG93OiA9PlxuXG4gICAgICAgIEBvcHQub25XaWxsU2hvd1dpbj8oKVxuICAgICAgICBcbiAgICAgICAgaWYgQHdpbj9cbiAgICAgICAgICAgIEB3aW4uc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBjcmVhdGVXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjcmVhdGVXaW5kb3c6IChvblJlYWR5VG9TaG93KSA9PlxuICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBcbiAgICAgICAgb25SZWFkeVRvU2hvdyA/PSBAb3B0Lm9uV2luUmVhZHlcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0ICdib3VuZHMnXG4gICAgICAgICAgICBcbiAgICAgICAgd2lkdGggID0gYm91bmRzPy53aWR0aCAgPyBAb3B0LndpZHRoICA/IDUwMFxuICAgICAgICBoZWlnaHQgPSBib3VuZHM/LmhlaWdodCA/IEBvcHQuaGVpZ2h0ID8gNTAwXG4gICAgICAgIFxuICAgICAgICBAd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgICAgIEBvcHQubWluV2lkdGggICAgICAgICAgID8gMjUwXG4gICAgICAgICAgICBtaW5IZWlnaHQ6ICAgICAgICAgIEBvcHQubWluSGVpZ2h0ICAgICAgICAgID8gMjUwXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgIEBvcHQuYmFja2dyb3VuZENvbG9yICAgID8gJyMxODE4MTgnXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgIEBvcHQuZnJhbWUgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgQG9wdC50cmFuc3BhcmVudCAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBAb3B0LmZ1bGxzY3JlZW4gICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgIEBvcHQuZnVsbHNjcmVlbmVuYWJsZSAgID8gdHJ1ZVxuICAgICAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICBAb3B0LmFjY2VwdEZpcnN0TW91c2UgICA/IHRydWVcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgQG9wdC5yZXNpemFibGUgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIEBvcHQubWF4aW1pemFibGUgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBAb3B0Lm1pbmltaXphYmxlICAgICAgICA/IHRydWVcbiAgICAgICAgICAgICMgdGl0bGVCYXJTdHlsZTogICAgICAnY3VzdG9tQnV0dG9uc09uSG92ZXInXG4gICAgICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGNsb3NhYmxlOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGljb246ICAgICAgICAgICAgICAgQHJlc29sdmUgQG9wdC5pY29uIFxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgIFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueSBpZiBib3VuZHM/XG4gICAgICAgICMgQHdpbi5zZXRDbG9zYWJsZSB0cnVlXG4gICAgXG4gICAgICAgIEB3aW4ubG9hZFVSTCBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQuaW5kZXhcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKSBpZiBhcmdzLmRldnRvb2xzXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAc2F2ZUJvdW5kc1xuICAgICAgICAgICAgQHdpbi5vbiAnbW92ZScgICBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdjbG9zZWQnID0+IEB3aW4gPSBudWxsXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyAgPT4gQGhpZGVEb2NrKClcbiAgICAgICAgQHdpbi5vbiAncmVhZHktdG8tc2hvdycsIChldmVudCkgPT4gXG4gICAgICAgICAgICB3aW4gPSBldmVudC5zZW5kZXJcbiAgICAgICAgICAgIG9uUmVhZHlUb1Nob3c/IHdpbiBcbiAgICAgICAgICAgIHdpbi5zaG93KCkgXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ3dpblJlYWR5JyB3aW4uaWRcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpblxuXG4gICAgc2F2ZUJvdW5kczogPT4gaWYgQHdpbj8gdGhlbiBwcmVmcy5zZXQgJ2JvdW5kcycgQHdpbi5nZXRCb3VuZHMoKVxuICAgIHNjcmVlblNpemU6IC0+IFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuICAgICAgICBcbiAgICBzdGFydFdhdGNoZXI6ID0+XG4gICAgICAgIFxuICAgICAgICBAb3B0LmRpciA9IHNsYXNoLnJlc29sdmUgQG9wdC5kaXJcbiAgICAgICAga2xvZyAnc3RhcnRXYXRjaGVyJywgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnLCBAb25TcmNDaGFuZ2VcbiAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InLCAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlclxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEBvcHQuZGlyc1xuICAgICAgICBcbiAgICAgICAga2xvZyAnc3RhcnRXYXRjaGVycycsIEBvcHQuZGlyc1xuICAgICAgICBmb3IgZGlyIGluIEBvcHQuZGlyc1xuICAgICAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGRpclxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJywgQG9uU3JjQ2hhbmdlXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicsIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlciBcbiAgICBcbiAgICBzdG9wV2F0Y2hlcjogPT5cbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQHdhdGNoZXJzXG4gICAgICAgIGZvciB3YXRjaGVyIGluIEB3YXRjaGVyc1xuICAgICAgICAgICAgd2F0Y2hlci5jbG9zZSgpXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgXG4gICAgb25TcmNDaGFuZ2U6IChpbmZvKSA9PlxuICAgIFxuICAgICAgICBrbG9nIFwib25TcmNDaGFuZ2UgJyN7aW5mby5jaGFuZ2V9J1wiLCBpbmZvLnBhdGhcbiAgICAgICAgaWYgc2xhc2guYmFzZShpbmZvLnBhdGgpID09ICdtYWluJ1xuICAgICAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgICAgIEBhcHAuZXhpdCAwXG4gICAgICAgICAgICBpZiBwa2cgPSBzbGFzaC5wa2cgQG9wdC5kaXJcbiAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHBrZywgJ25vZGVfbW9kdWxlcydcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiI3twa2d9L25vZGVfbW9kdWxlcy8uYmluL2VsZWN0cm9uIC4gLXdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGN3ZDogICAgICBwa2dcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGlvOiAgICAnaW5oZXJpdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsOiAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBwb3N0LnRvV2lucyAnbWVudUFjdGlvbicsICdSZWxvYWQnXG4gICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFxuICAgICJdfQ==
//# sourceURL=../coffee/app.coffee