// koffee 1.12.0

/*
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000
 */
var App, about, args, childp, empty, klog, os, post, prefs, ref, slash, srcmap, valid, watch, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), about = ref.about, args = ref.args, childp = ref.childp, empty = ref.empty, klog = ref.klog, os = ref.os, post = ref.post, prefs = ref.prefs, slash = ref.slash, srcmap = ref.srcmap, valid = ref.valid, watch = ref.watch, win = ref.win;

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
        process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
        process.on('uncaughtException', function(err) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiYXBwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2RkFBQTtJQUFBOztBQVFBLE1BQTBGLE9BQUEsQ0FBUSxPQUFSLENBQTFGLEVBQUUsaUJBQUYsRUFBUyxlQUFULEVBQWUsbUJBQWYsRUFBdUIsaUJBQXZCLEVBQThCLGVBQTlCLEVBQW9DLFdBQXBDLEVBQXdDLGVBQXhDLEVBQThDLGlCQUE5QyxFQUFxRCxpQkFBckQsRUFBNEQsbUJBQTVELEVBQW9FLGlCQUFwRSxFQUEyRSxpQkFBM0UsRUFBa0Y7O0FBRTVFO0lBRUMsYUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFQSxPQUFPLENBQUMsR0FBSSxDQUFBLG9DQUFBLENBQVosR0FBb0Q7UUFFcEQsT0FBTyxDQUFDLEVBQVIsQ0FBVyxtQkFBWCxFQUErQixTQUFDLEdBQUQ7WUFDM0IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO1lBQ1QsTUFBTSxDQUFDLE1BQVAsQ0FBYyxHQUFkLEVBQW1CLElBQW5CO21CQUNBO1FBSDJCLENBQS9CO1FBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtRQUVaLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLFFBQU4sQ0FBQTtRQUVaLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWQsQ0FBaUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUF0QztRQUVBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFWLEdBQWlCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFD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QUFELEdBQUssa0NBQXZCLEVBQ0k7d0JBQUEsR0FBQSxFQUFVLEdBQVY7d0JBQ0EsUUFBQSxFQUFVLE1BRFY7d0JBRUEsS0FBQSxFQUFVLFNBRlY7d0JBR0EsS0FBQSxFQUFVLElBSFY7cUJBREo7b0JBS0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0FBQ0EsMkJBUEo7aUJBREo7YUFISjs7ZUFZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsUUFBekI7SUFkUzs7Ozs7O0FBZ0JqQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG57IGFib3V0LCBhcmdzLCBjaGlsZHAsIGVtcHR5LCBrbG9nLCBvcywgcG9zdCwgcHJlZnMsIHNsYXNoLCBzcmNtYXAsIHZhbGlkLCB3YXRjaCwgd2luIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgQXBwXG4gICAgXG4gICAgQDogKEBvcHQpIC0+XG5cbiAgICAgICAgcHJvY2Vzcy5lbnZbJ0VMRUNUUk9OX0RJU0FCTEVfU0VDVVJJVFlfV0FSTklOR1MnXSA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIHByb2Nlc3Mub24gJ3VuY2F1Z2h0RXhjZXB0aW9uJyAoZXJyKSAtPlxuICAgICAgICAgICAgc3JjbWFwID0gcmVxdWlyZSAnLi9zcmNtYXAnICAgIFxuICAgICAgICAgICAgc3JjbWFwLmxvZ0VyciBlcnIsICfwn5S7J1xuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBAYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgICAgIEB1c2VyRGF0YSA9IHNsYXNoLnVzZXJEYXRhKClcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLk1lbnUuc2V0QXBwbGljYXRpb25NZW51IEBvcHQubWVudVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXlcbiAgICAgICAgICAgIGtsb2cuc2xvZy5pY29uID0gc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LnRyYXkgIFxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBcIlwiXCJcbiAgICAgICAgICAgIG5vcHJlZnMgICAgIGRvbid0IGxvYWQgcHJlZmVyZW5jZXMgICAgICBmYWxzZVxuICAgICAgICAgICAgZGV2dG9vbHMgICAgb3BlbiBkZXZlbG9wZXIgdG9vbHMgICAgICAgIGZhbHNlICAtRFxuICAgICAgICAgICAgd2F0Y2ggICAgICAgd2F0Y2ggc291cmNlcyBmb3IgY2hhbmdlcyAgIGZhbHNlXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdsID0gQG9wdC5hcmdzICsgJ1xcbicgKyBhcmdsIGlmIEBvcHQuYXJnc1xuICAgICAgICBhcmdzID0gYXJncy5pbml0IGFyZ2xcbiAgICAgICAgXG4gICAgICAgIG9uT3RoZXIgPSAoZXZlbnQsIGFyZ3MsIGRpcikgPT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5vbk90aGVySW5zdGFuY2VcbiAgICAgICAgICAgICAgICBAb3B0Lm9uT3RoZXJJbnN0YW5jZSBhcmdzLCBkaXIgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zaW5nbGUgIT0gZmFsc2VcbiAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZSBvbk90aGVyXG4gICAgICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgZWxzZSBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2s/IFxuICAgICAgICAgICAgICAgIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaygpXG4gICAgICAgICAgICAgICAgICAgIEBhcHAub24gJ3NlY29uZC1pbnN0YW5jZScgb25PdGhlclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdzaG93QWJvdXQnIEBzaG93QWJvdXRcbiAgICAgICAgcG9zdC5vbiAncXVpdEFwcCcgICBAcXVpdEFwcFxuXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgICAgIEBhcHAub24gJ3JlYWR5JyBAb25SZWFkeVxuICAgICAgICBAYXBwLm9uICdhY3RpdmF0ZScgQG9uQWN0aXZhdGVcbiAgICAgICAgQGFwcC5vbiAnd2luZG93LWFsbC1jbG9zZWQnIChldmVudCkgPT4gXG4gICAgICAgICAgICBpZiBub3QgQG9wdC5zaW5nbGVXaW5kb3dcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcXVpdEFwcCgpXG4gICAgICAgIFxuICAgIHJlc29sdmU6IChmaWxlKSA9PiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGZpbGVcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiAgICBcbiAgICBvblJlYWR5OiA9PlxuICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXkgdGhlbiBAaW5pdFRyYXkoKVxuICAgICAgICAgXG4gICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgICBcbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICBcbiAgICAgICAgaWYgbm90IGFyZ3Mubm9wcmVmc1xuICAgICAgICAgICAgc2VwID0gQG9wdC5wcmVmc1NlcGVyYXRvciA/ICc6J1xuICAgICAgICAgICAgaWYgQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcCwgZGVmYXVsdHM6c2hvcnRjdXQ6QG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcFxuICAgIFxuICAgICAgICBpZiB2YWxpZCBwcmVmcy5nZXQgJ3Nob3J0Y3V0J1xuICAgICAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIHByZWZzLmdldCgnc2hvcnRjdXQnKSwgQG9wdC5vblNob3J0Y3V0ID8gQHNob3dXaW5kb3dcbiAgICAgICAgICAgICBcbiAgICAgICAgaWYgYXJncy53YXRjaFxuICAgICAgICAgICAga2xvZyAnQXBwLm9uUmVhZHkgc3RhcnRXYXRjaGVyJ1xuICAgICAgICAgICAgQHN0YXJ0V2F0Y2hlcigpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm9uU2hvd1xuICAgICAgICAgICAgQG9wdC5vblNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG5cbiAgICAgICAgcG9zdC5lbWl0ICdhcHBSZWFkeSdcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpbml0VHJheTogPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHRyYXlJbWcgPSBAcmVzb2x2ZSBAb3B0LnRyYXlcbiAgICAgICAgQHRyYXkgPSBuZXcgZWxlY3Ryb24uVHJheSB0cmF5SW1nXG4gICAgICAgIEB0cmF5Lm9uICdjbGljaycgQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpICE9ICdkYXJ3aW4nXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJRdWl0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHF1aXRBcHBcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBYm91dFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBzaG93QWJvdXRcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY3RpdmF0ZVwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgQHRyYXkuc2V0Q29udGV4dE1lbnUgZWxlY3Ryb24uTWVudS5idWlsZEZyb21UZW1wbGF0ZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2hvd0Fib3V0OiA9PlxuICAgICAgICBcbiAgICAgICAgZGFyayA9ICdkYXJrJyA9PSBwcmVmcy5nZXQgJ3NjaGVtZScgJ2RhcmsnXG4gICAgICAgIGFib3V0XG4gICAgICAgICAgICBpbWc6ICAgICAgICBAcmVzb2x2ZSBAb3B0LmFib3V0XG4gICAgICAgICAgICBjb2xvcjogICAgICBkYXJrIGFuZCAnIzMzMycgb3IgJyNkZGQnXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBkYXJrIGFuZCAnIzExMScgb3IgJyNmZmYnXG4gICAgICAgICAgICBoaWdobGlnaHQ6ICBkYXJrIGFuZCAnI2ZmZicgb3IgJyMwMDAnXG4gICAgICAgICAgICBwa2c6ICAgICAgICBAb3B0LnBrZ1xuICAgICAgICAgICAgZGVidWc6ICAgICAgQG9wdC5hYm91dERlYnVnXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBxdWl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgaWYgQG9wdC5zYXZlQm91bmRzICE9IGZhbHNlXG4gICAgICAgICAgICBAc2F2ZUJvdW5kcygpXG4gICAgICAgIHByZWZzLnNhdmUoKVxuICAgICAgICBcbiAgICAgICAgaWYgJ2RlbGF5JyAhPSBAb3B0Lm9uUXVpdD8oKVxuICAgICAgICAgICAgQGV4aXRBcHAoKVxuICAgICAgICAgICAgXG4gICAgZXhpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBhcHAuZXhpdCAwXG4gICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGhpZGVEb2NrOiA9PiBAYXBwLmRvY2s/LmhpZGUoKVxuICAgIHNob3dEb2NrOiA9PiBAYXBwLmRvY2s/LnNob3coKVxuICAgICAgICBcbiAgICAjMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIzAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4gICAgXG4gICAgdG9nZ2xlV2luZG93OiA9PlxuICAgICAgICAgXG4gICAgICAgIGlmIEB3aW4/LmlzVmlzaWJsZSgpXG4gICAgICAgICAgICBAd2luLmhpZGUoKVxuICAgICAgICAgICAgQGhpZGVEb2NrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuXG4gICAgdG9nZ2xlV2luZG93RnJvbVRyYXk6ID0+IEBzaG93V2luZG93KClcbiAgICAgICBcbiAgICBvbkFjdGl2YXRlOiAoZXZlbnQsIGhhc1Zpc2libGVXaW5kb3dzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm9uQWN0aXZhdGVcbiAgICAgICAgICAgIGlmIEBvcHQub25BY3RpdmF0ZSBldmVudCwgaGFzVmlzaWJsZVdpbmRvd3NcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IGhhc1Zpc2libGVXaW5kb3dzXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG4gICAgICAgICAgICAgICAgXG4gICAgc2hvd1dpbmRvdzogPT5cblxuICAgICAgICBAb3B0Lm9uV2lsbFNob3dXaW4/KClcbiAgICAgICAgXG4gICAgICAgIGlmIEB3aW4/XG4gICAgICAgICAgICBAd2luLnNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY3JlYXRlV2luZG93KClcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY3JlYXRlV2luZG93OiAob25SZWFkeVRvU2hvdykgPT5cbiAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgXG4gICAgICAgIG9uUmVhZHlUb1Nob3cgPz0gQG9wdC5vbldpblJlYWR5XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCAnYm91bmRzJ1xuICAgICAgICAgICAgXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICBAb3B0Lm1pbldpZHRoICAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICBAb3B0Lm1pbkhlaWdodCAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICBAb3B0LmJhY2tncm91bmRDb2xvciAgICA/ICcjMTgxODE4J1xuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBAb3B0LmZyYW1lICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIEBvcHQudHJhbnNwYXJlbnQgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgQG9wdC5mdWxsc2NyZWVuICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBAb3B0LmZ1bGxzY3JlZW5lbmFibGUgICA/IHRydWVcbiAgICAgICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgQG9wdC5hY2NlcHRGaXJzdE1vdXNlICAgPyB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgIEBvcHQucmVzaXphYmxlICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICBAb3B0Lm1heGltaXphYmxlICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgQG9wdC5taW5pbWl6YWJsZSAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgIEBvcHQuY2xvc2FibGUgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgYXV0b0hpZGVNZW51QmFyOiAgICB0cnVlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBpY29uOiAgICAgICAgICAgICAgIEByZXNvbHZlIEBvcHQuaWNvbiBcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRUaHJvdHRsaW5nOiAgIGZhbHNlXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiAgICAgICAgdHJ1ZVxuICAgIFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueSBpZiBib3VuZHM/XG4gICAgXG4gICAgICAgIGlmIEBvcHQuaW5kZXhVUkxcbiAgICAgICAgICAgIEB3aW4ubG9hZFVSTCBAb3B0LmluZGV4LCBiYXNlVVJMRm9yRGF0YVVSTDpAb3B0LmluZGV4VVJMXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB3aW4ubG9hZFVSTCBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQuaW5kZXhcbiAgICAgICAgXG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKG1vZGU6J2RldGFjaCcpIGlmIGFyZ3MuZGV2dG9vbHNcbiAgICAgICAgaWYgQG9wdC5zYXZlQm91bmRzICE9IGZhbHNlXG4gICAgICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueSBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLm9uICdyZXNpemUnIEBzYXZlQm91bmRzXG4gICAgICAgICAgICBAd2luLm9uICdtb3ZlJyAgIEBzYXZlQm91bmRzXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlZCcgPT4gQHdpbiA9IG51bGxcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnICA9PiBAaGlkZURvY2soKVxuICAgICAgICBAd2luLm9uICdyZWFkeS10by1zaG93JyAoZXZlbnQpID0+IFxuICAgICAgICAgICAgd2luID0gZXZlbnQuc2VuZGVyXG4gICAgICAgICAgICBvblJlYWR5VG9TaG93PyB3aW4gXG4gICAgICAgICAgICB3aW4uc2hvdygpIFxuICAgICAgICAgICAgcG9zdC5lbWl0ICd3aW5SZWFkeScgd2luLmlkXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW5cblxuICAgIHNhdmVCb3VuZHM6ID0+IGlmIEB3aW4/IHRoZW4gcHJlZnMuc2V0ICdib3VuZHMnIEB3aW4uZ2V0Qm91bmRzKClcbiAgICBzY3JlZW5TaXplOiAtPiBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAgICAgXG4gICAgc3RhcnRXYXRjaGVyOiA9PlxuICAgICAgICBcbiAgICAgICAgQG9wdC5kaXIgPSBzbGFzaC5yZXNvbHZlIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJyBAb25TcmNDaGFuZ2VcbiAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaGVyXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQG9wdC5kaXJzXG4gICAgICAgIFxuICAgICAgICBmb3IgZGlyIGluIEBvcHQuZGlyc1xuICAgICAgICAgICAgdG9XYXRjaCA9IGlmIHNsYXNoLmlzUmVsYXRpdmUgZGlyXG4gICAgICAgICAgICAgICAgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBkaXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzbGFzaC5yZXNvbHZlIGRpclxuICAgICAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciB0b1dhdGNoXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnIEBvblNyY0NoYW5nZVxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlciBcbiAgICBcbiAgICBzdG9wV2F0Y2hlcjogPT5cbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQHdhdGNoZXJzXG4gICAgICAgIGZvciB3YXRjaGVyIGluIEB3YXRjaGVyc1xuICAgICAgICAgICAgd2F0Y2hlci5jbG9zZSgpXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgXG4gICAgb25TcmNDaGFuZ2U6IChpbmZvKSA9PlxuICAgIFxuICAgICAgICBpZiBzbGFzaC5iYXNlKGluZm8ucGF0aCkgPT0gJ21haW4nXG4gICAgICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgICAgIGlmIHBrZyA9IHNsYXNoLnBrZyBAb3B0LmRpclxuICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzRGlyIHNsYXNoLmpvaW4gcGtnLCAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIje3BrZ30vbm9kZV9tb2R1bGVzLy5iaW4vZWxlY3Ryb24gLiAtd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiAgICAgIHBrZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RkaW86ICAgICdpbmhlcml0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hlbGw6ICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHBvc3QudG9XaW5zICdtZW51QWN0aW9uJyAnUmVsb2FkJ1xuICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBcbiAgICAiXX0=
//# sourceURL=../coffee/app.coffee