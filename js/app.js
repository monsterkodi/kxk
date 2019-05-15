// koffee 0.42.0

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
            if ((this.app.makeSingleInstance != null) && this.app.makeSingleInstance((ref1 = this.opt.onOtherInstance) != null ? ref1 : this.showWindow)) {
                klog('app.quit single');
                this.app.quit();
                return;
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
            console.log('App.onReady startWatcher');
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
        this.saveBounds();
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
        var bounds, electron, height, ref1, ref2, ref3, ref4, ref5, ref6, width;
        electron = require('electron');
        bounds = prefs.get('bounds');
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
            resizable: true,
            maximizable: true,
            minimizable: true,
            transparent: true,
            autoHideMenuBar: true,
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
        this.win.on('resize', this.saveBounds);
        this.win.on('move', this.saveBounds);
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
        console.log('startWatcher', this.opt.dir);
        watcher = watch.dir(this.opt.dir);
        watcher.on('change', this.onSrcChange);
        watcher.on('error', function(err) {
            return console.error(err);
        });
        this.watchers.push(watcher);
        if (empty(this.opt.dirs)) {
            return;
        }
        console.log('startWatchers', this.opt.dirs);
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
        console.log("onSrcChange '" + info.change + "'", info.path);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOztBQVFBLE1BQTRGLE9BQUEsQ0FBUSxPQUFSLENBQTVGLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsaUJBQTNDLEVBQWtELGVBQWxELEVBQXdELG1CQUF4RCxFQUFnRSxXQUFoRSxFQUFvRSxXQUFwRSxFQUF3RSxtQkFBeEUsRUFBZ0YsZUFBaEYsRUFBc0Y7O0FBRWhGO0lBRVcsYUFBQyxHQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7OztRQUVWLE9BQU8sQ0FBQyxFQUFSLENBQVcsbUJBQVgsRUFBZ0MsU0FBQyxHQUFEO0FBQzVCLGdCQUFBO1lBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO1lBQ1QsTUFBTSxDQUFDLE1BQVAsQ0FBYyxHQUFkLEVBQW1CLElBQW5CO21CQUNBO1FBSDRCLENBQWhDO1FBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtRQUVaLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLFFBQU4sQ0FBQTtRQUVaLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFWLEdBQWlCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWQsQ0FBZCxFQURyQjs7UUFHQSxJQUFBLEdBQU87UUFNUCxJQUFrQyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQXZDO1lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFHLENB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QixFQUNJO3dCQUFBLEdBQUEsRUFBVSxHQUFWO3dCQUNBLFFBQUEsRUFBVSxNQURWO3dCQUVBLEtBQUEsRUFBVSxTQUZWO3dCQUdBLEtBQUEsRUFBVSxJQUhWO3FCQURKO29CQUtBLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYjtBQUNBLDJCQVBKO2lCQURKO2FBSEo7O2VBWUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQTBCLFFBQTFCO0lBZlM7Ozs7OztBQWlCakIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIyNcblxueyBhcmdzLCBwcmVmcywgd2F0Y2gsIGVtcHR5LCB2YWxpZCwgc2xhc2gsIGFib3V0LCBwb3N0LCBjaGlsZHAsIG9zLCBmcywga2Vycm9yLCBrbG9nLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgQXBwXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuXG4gICAgICAgIHByb2Nlc3Mub24gJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGVycikgLT5cbiAgICAgICAgICAgIHNyY21hcCA9IHJlcXVpcmUgJy4vc3JjbWFwJyAgICBcbiAgICAgICAgICAgIHNyY21hcC5sb2dFcnIgZXJyLCAn8J+UuydcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgQGFwcCA9IGVsZWN0cm9uLmFwcFxuICAgICAgICBAdXNlckRhdGEgPSBzbGFzaC51c2VyRGF0YSgpICNAYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5XG4gICAgICAgICAgICBrbG9nLnNsb2cuaWNvbiA9IHNsYXNoLmZpbGVVcmwgQHJlc29sdmUgQG9wdC50cmF5ICBcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdsID0gXCJcIlwiXG4gICAgICAgICAgICBub3ByZWZzICAgICBkb24ndCBsb2FkIHByZWZlcmVuY2VzICAgICAgZmFsc2VcbiAgICAgICAgICAgIGRldnRvb2xzICAgIG9wZW4gZGV2ZWxvcGVyIHRvb2xzICAgICAgICBmYWxzZSAgLURcbiAgICAgICAgICAgIHdhdGNoICAgICAgIHdhdGNoIHNvdXJjZXMgZm9yIGNoYW5nZXMgICBmYWxzZVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IEBvcHQuYXJncyArICdcXG4nICsgYXJnbCBpZiBAb3B0LmFyZ3NcbiAgICAgICAgYXJncyA9IGFyZ3MuaW5pdCBhcmdsXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2FwcC5hcmdzJywgYXJnc1xuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zaW5nbGUgIT0gZmFsc2UgI2FuZCBvcy5wbGF0Zm9ybSgpICE9ICdkYXJ3aW4nXG4gICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZT8gYW5kIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlIEBvcHQub25PdGhlckluc3RhbmNlID8gQHNob3dXaW5kb3dcbiAgICAgICAgICAgICAgICBrbG9nICdhcHAucXVpdCBzaW5nbGUnXG4gICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2UgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2soKVxuICAgICAgICAgICAgICAgICAgICBpZiBAb3B0Lm9uT3RoZXJJbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSAoZXZlbnQsIGFyZ3MsIGRpcikgPT4gQG9wdC5vbk90aGVySW5zdGFuY2UgYXJncywgZGlyIFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IEBzaG93V2luZG93XG4gICAgICAgICAgICAgICAgICAgIEBhcHAub24gJ3NlY29uZC1pbnN0YW5jZScsIGNiICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAYXBwLnF1aXQoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3Nob3dBYm91dCcsIEBzaG93QWJvdXRcbiAgICAgICAgcG9zdC5vbiAncXVpdEFwcCcsICAgQHF1aXRBcHBcblxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScsIEBvblJlYWR5XG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJywgKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIGlmIG5vdCBAb3B0LnNpbmdsZVdpbmRvd1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBxdWl0QXBwKClcbiAgICAgICAgXG4gICAgcmVzb2x2ZTogKGZpbGUpID0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZmlsZVxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuICAgIFxuICAgIG9uUmVhZHk6ID0+XG4gICAgXG4gICAgICAgIGlmIEBvcHQudHJheSB0aGVuIEBpbml0VHJheSgpXG4gICAgICAgICBcbiAgICAgICAgQGhpZGVEb2NrKClcbiAgICAgICAgIFxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgIFxuICAgICAgICBpZiBub3QgYXJncy5ub3ByZWZzXG4gICAgICAgICAgICBpZiBAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzaG9ydGN1dDogQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQoKVxuICAgIFxuICAgICAgICBpZiB2YWxpZCBwcmVmcy5nZXQgJ3Nob3J0Y3V0J1xuICAgICAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIHByZWZzLmdldCgnc2hvcnRjdXQnKSwgQHNob3dXaW5kb3dcbiAgICAgICAgICAgICBcbiAgICAgICAgaWYgYXJncy53YXRjaFxuICAgICAgICAgICAgbG9nICdBcHAub25SZWFkeSBzdGFydFdhdGNoZXInXG4gICAgICAgICAgICBAc3RhcnRXYXRjaGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25TaG93XG4gICAgICAgICAgICBAb3B0Lm9uU2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgICAgICBwb3N0LmVtaXQgJ2FwcFJlYWR5J1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluaXRUcmF5OiA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgdHJheUltZyA9IEByZXNvbHZlIEBvcHQudHJheVxuICAgICAgICBAdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IHRyYXlJbWdcbiAgICAgICAgQHRyYXkub24gJ2NsaWNrJywgQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpICE9ICdkYXJ3aW4nXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJRdWl0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHF1aXRBcHBcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBYm91dFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBzaG93QWJvdXRcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY3RpdmF0ZVwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgQHRyYXkuc2V0Q29udGV4dE1lbnUgZWxlY3Ryb24uTWVudS5idWlsZEZyb21UZW1wbGF0ZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2hvd0Fib3V0OiA9PlxuICAgICAgICBcbiAgICAgICAgZGFyayA9ICdkYXJrJyA9PSBwcmVmcy5nZXQgJ3NjaGVtZScsICdkYXJrJ1xuICAgICAgICBhYm91dFxuICAgICAgICAgICAgaW1nOiAgICAgICAgQHJlc29sdmUgQG9wdC5hYm91dFxuICAgICAgICAgICAgY29sb3I6ICAgICAgZGFyayBhbmQgJyMzODM4MzgnIG9yICcjZGRkJ1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMyODI4MjgnIG9yICcjZmZmJ1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiAgZGFyayBhbmQgJyNmZmYnICAgIG9yICcjMDAwJ1xuICAgICAgICAgICAgcGtnOiAgICAgICAgQG9wdC5wa2dcbiAgICAgICAgICAgIGRlYnVnOiAgICAgIEBvcHQuYWJvdXREZWJ1Z1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcXVpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAnZGVsYXknICE9IEBvcHQub25RdWl0PygpXG4gICAgICAgICAgICBAZXhpdEFwcCgpXG4gICAgICAgICAgICBcbiAgICBleGl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaGlkZURvY2s6ID0+IEBhcHAuZG9jaz8uaGlkZSgpXG4gICAgc2hvd0RvY2s6ID0+IEBhcHAuZG9jaz8uc2hvdygpXG4gICAgICAgIFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIzAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIzAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiAgICBcbiAgICB0b2dnbGVXaW5kb3c6ID0+XG4gICAgICAgICBcbiAgICAgICAgaWYgQHdpbj8uaXNWaXNpYmxlKClcbiAgICAgICAgICAgIEB3aW4uaGlkZSgpXG4gICAgICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG5cbiAgICB0b2dnbGVXaW5kb3dGcm9tVHJheTogPT4gQHNob3dXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgc2hvd1dpbmRvdzogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQub25XaWxsU2hvd1dpbj8oKVxuICAgICAgICBcbiAgICAgICAgaWYgQHdpbj9cbiAgICAgICAgICAgIEB3aW4uc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBjcmVhdGVXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjcmVhdGVXaW5kb3c6IChvblJlYWR5VG9TaG93KSA9PlxuICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0ICdib3VuZHMnXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICBAb3B0Lm1pbldpZHRoICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICBAb3B0Lm1pbkhlaWdodCA/IDI1MFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzE4MTgxOCdcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6IHRydWVcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgdHJ1ZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICB0cnVlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIHRydWVcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICAgICAgYXV0b0hpZGVNZW51QmFyOiB0cnVlXG4gICAgICAgICAgICBpY29uOiAgICAgICAgICAgIEByZXNvbHZlIEBvcHQuaWNvbiBcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgIFxuICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCkgaWYgYXJncy5kZXZ0b29sc1xuICAgICAgICBAd2luLm9uICdyZXNpemUnLCBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdtb3ZlJywgICBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdjbG9zZWQnLCA9PiBAd2luID0gbnVsbFxuICAgICAgICBAd2luLm9uICdjbG9zZScsICA9PiBAaGlkZURvY2soKVxuICAgICAgICBAd2luLm9uICdyZWFkeS10by1zaG93JywgKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIHdpbiA9IGV2ZW50LnNlbmRlclxuICAgICAgICAgICAgb25SZWFkeVRvU2hvdz8gd2luIFxuICAgICAgICAgICAgd2luLnNob3coKSBcbiAgICAgICAgICAgIHBvc3QuZW1pdCAnd2luUmVhZHknLCB3aW4uaWRcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgXG4gICAgICAgIEB3aW5cblxuICAgIHNhdmVCb3VuZHM6ID0+IGlmIEB3aW4/IHRoZW4gcHJlZnMuc2V0ICdib3VuZHMnLCBAd2luLmdldEJvdW5kcygpXG4gICAgc2NyZWVuU2l6ZTogLT4gXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgXG4gICAgICAgIFxuICAgIHN0YXJ0V2F0Y2hlcjogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGlyID0gc2xhc2gucmVzb2x2ZSBAb3B0LmRpclxuICAgICAgICBsb2cgJ3N0YXJ0V2F0Y2hlcicsIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJywgQG9uU3JjQ2hhbmdlXG4gICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJywgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXJcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAb3B0LmRpcnNcbiAgICAgICAgXG4gICAgICAgIGxvZyAnc3RhcnRXYXRjaGVycycsIEBvcHQuZGlyc1xuICAgICAgICBmb3IgZGlyIGluIEBvcHQuZGlyc1xuICAgICAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGRpclxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJywgQG9uU3JjQ2hhbmdlXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdlcnJvcicsIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlciBcbiAgICBcbiAgICBzdG9wV2F0Y2hlcjogPT5cbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQHdhdGNoZXJzXG4gICAgICAgIGZvciB3YXRjaGVyIGluIEB3YXRjaGVyc1xuICAgICAgICAgICAgd2F0Y2hlci5jbG9zZSgpXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgXG4gICAgb25TcmNDaGFuZ2U6IChpbmZvKSA9PlxuICAgIFxuICAgICAgICBsb2cgXCJvblNyY0NoYW5nZSAnI3tpbmZvLmNoYW5nZX0nXCIsIGluZm8ucGF0aFxuICAgICAgICBpZiBzbGFzaC5iYXNlKGluZm8ucGF0aCkgPT0gJ21haW4nXG4gICAgICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgICAgIGlmIHBrZyA9IHNsYXNoLnBrZyBAb3B0LmRpclxuICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzRGlyIHNsYXNoLmpvaW4gcGtnLCAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIje3BrZ30vbm9kZV9tb2R1bGVzLy5iaW4vZWxlY3Ryb24gLiAtd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiAgICAgIHBrZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RkaW86ICAgICdpbmhlcml0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hlbGw6ICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHBvc3QudG9XaW5zICdtZW51QWN0aW9uJywgJ1JlbG9hZCdcbiAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwXG4gICAgIl19
//# sourceURL=../coffee/app.coffee