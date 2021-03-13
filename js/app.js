// koffee 1.14.0

/*
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000
 */
var App, about, args, childp, empty, klog, os, post, prefs, ref, slash, srcmap, valid, watch,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

process.env.NODE_NO_WARNINGS = 1;

ref = require('./kxk'), about = ref.about, args = ref.args, childp = ref.childp, empty = ref.empty, klog = ref.klog, os = ref.os, post = ref.post, prefs = ref.prefs, slash = ref.slash, srcmap = ref.srcmap, valid = ref.valid, watch = ref.watch;

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
        var bounds, electron, height, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, width;
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
                nodeIntegrationInWorker: true,
                enableRemoteModule: true
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
            return function() {
                if (typeof onReadyToShow === "function") {
                    onReadyToShow(_this.win);
                }
                _this.win.show();
                return post.emit('winReady', _this.win.id);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiYXBwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx3RkFBQTtJQUFBOztBQVFBLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQzs7QUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBWixHQUFpRDs7QUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBWixHQUErQjs7QUFFL0IsTUFBcUYsT0FBQSxDQUFRLE9BQVIsQ0FBckYsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxtQkFBZixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsV0FBcEMsRUFBd0MsZUFBeEMsRUFBOEMsaUJBQTlDLEVBQXFELGlCQUFyRCxFQUE0RCxtQkFBNUQsRUFBb0UsaUJBQXBFLEVBQTJFOztBQUVyRTtJQUVDLGFBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsTUFBRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBRUEsT0FBTyxDQUFDLEdBQUksQ0FBQSxvQ0FBQSxDQUFaLEdBQW9EO1FBRXBELE9BQU8sQ0FBQyxFQUFSLENBQVcsbUJBQVgsRUFBK0IsU0FBQyxHQUFEO1lBQzNCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjtZQUNULE1BQU0sQ0FBQyxNQUFQLENBQWMsR0FBZCxFQUFtQixJQUFuQjttQkFDQTtRQUgyQixDQUEvQjtRQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7UUFFWixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7UUFDWCxJQUFDLENBQUEsR0FBRCxHQUFPLFFBQVEsQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLEtBQUssQ0FBQyxRQUFOLENBQUE7UUFFWixJQUFDLENBQUEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFqQixDQUE4QiwrQkFBOUI7UUFFQSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFkLENBQWlDLElBQUMs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LE1BQTVCO1lBQ0ksSUFBQyxDQUFBLFdBQUQsQ0FBQTtZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLENBQVY7WUFDQSxJQUFHLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBZixDQUFUO2dCQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsY0FBaEIsQ0FBWixDQUFIO29CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQW1CLEdBQUQsR0FBSyxrQ0FBdkIsRUFDSTt3QkFBQSxHQUFBLEVBQVUsR0FBVjt3QkFDQSxRQUFBLEVBQVUsTUFEVjt3QkFFQSxLQUFBLEVBQVUsU0FGVjt3QkFHQSxLQUFBLEVBQVUsSUFIVjtxQkFESjtvQkFLQSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7QUFDQSwyQkFQSjtpQkFESjthQUhKOztlQVlBLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixRQUF6QjtJQWZTOzs7Ozs7QUFpQmpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyMjXG5cbmRlbGV0ZSBwcm9jZXNzLmVudi5FTEVDVFJPTl9FTkFCTEVfU0VDVVJJVFlfV0FSTklOR1NcbnByb2Nlc3MuZW52LkVMRUNUUk9OX0RJU0FCTEVfU0VDVVJJVFlfV0FSTklOR1MgPSB0cnVlXG5wcm9jZXNzLmVudi5OT0RFX05PX1dBUk5JTkdTID0gMVxuXG57IGFib3V0LCBhcmdzLCBjaGlsZHAsIGVtcHR5LCBrbG9nLCBvcywgcG9zdCwgcHJlZnMsIHNsYXNoLCBzcmNtYXAsIHZhbGlkLCB3YXRjaCB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIEFwcFxuICAgIFxuICAgIEA6IChAb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgcHJvY2Vzcy5lbnZbJ0VMRUNUUk9OX0RJU0FCTEVfU0VDVVJJVFlfV0FSTklOR1MnXSA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIHByb2Nlc3Mub24gJ3VuY2F1Z2h0RXhjZXB0aW9uJyAoZXJyKSAtPlxuICAgICAgICAgICAgc3JjbWFwID0gcmVxdWlyZSAnLi9zcmNtYXAnICAgIFxuICAgICAgICAgICAgc3JjbWFwLmxvZ0VyciBlcnIsICfwn5S7J1xuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBAYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgICAgIEB1c2VyRGF0YSA9IHNsYXNoLnVzZXJEYXRhKClcbiAgICAgICAgXG4gICAgICAgIEBhcHAuY29tbWFuZExpbmUuYXBwZW5kU3dpdGNoICdkaXNhYmxlLXNpdGUtaXNvbGF0aW9uLXRyaWFscydcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLk1lbnUuc2V0QXBwbGljYXRpb25NZW51IEBvcHQubWVudVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXlcbiAgICAgICAgICAgIGtsb2cuc2xvZy5pY29uID0gc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LnRyYXkgIFxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBcIlwiXCJcbiAgICAgICAgICAgIG5vcHJlZnMgICAgIGRvbid0IGxvYWQgcHJlZmVyZW5jZXMgICAgICBmYWxzZVxuICAgICAgICAgICAgZGV2dG9vbHMgICAgb3BlbiBkZXZlbG9wZXIgdG9vbHMgICAgICAgIGZhbHNlICAtRFxuICAgICAgICAgICAgd2F0Y2ggICAgICAgd2F0Y2ggc291cmNlcyBmb3IgY2hhbmdlcyAgIGZhbHNlXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdsID0gQG9wdC5hcmdzICsgJ1xcbicgKyBhcmdsIGlmIEBvcHQuYXJnc1xuICAgICAgICBhcmdzID0gYXJncy5pbml0IGFyZ2xcbiAgICAgICAgXG4gICAgICAgIG9uT3RoZXIgPSAoZXZlbnQsIGFyZ3MsIGRpcikgPT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5vbk90aGVySW5zdGFuY2VcbiAgICAgICAgICAgICAgICBAb3B0Lm9uT3RoZXJJbnN0YW5jZSBhcmdzLCBkaXIgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zaW5nbGUgIT0gZmFsc2VcbiAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlPyBcbiAgICAgICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZSBvbk90aGVyXG4gICAgICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgZWxzZSBpZiBAYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2s/IFxuICAgICAgICAgICAgICAgIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaygpXG4gICAgICAgICAgICAgICAgICAgIEBhcHAub24gJ3NlY29uZC1pbnN0YW5jZScgb25PdGhlclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdzaG93QWJvdXQnIEBzaG93QWJvdXRcbiAgICAgICAgcG9zdC5vbiAncXVpdEFwcCcgICBAcXVpdEFwcFxuXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgICAgIEBhcHAub24gJ3JlYWR5JyBAb25SZWFkeVxuICAgICAgICBAYXBwLm9uICdhY3RpdmF0ZScgQG9uQWN0aXZhdGVcbiAgICAgICAgQGFwcC5vbiAnd2luZG93LWFsbC1jbG9zZWQnIChldmVudCkgPT4gXG4gICAgICAgICAgICBpZiBub3QgQG9wdC5zaW5nbGVXaW5kb3dcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcXVpdEFwcCgpXG4gICAgICAgIFxuICAgIHJlc29sdmU6IChmaWxlKSA9PiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGZpbGVcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiAgICBcbiAgICBvblJlYWR5OiA9PlxuICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXkgdGhlbiBAaW5pdFRyYXkoKVxuICAgICAgICAgXG4gICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgICBcbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICBcbiAgICAgICAgaWYgbm90IGFyZ3Mubm9wcmVmc1xuICAgICAgICAgICAgc2VwID0gQG9wdC5wcmVmc1NlcGVyYXRvciA/ICfilrgnXG4gICAgICAgICAgICBpZiBAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzZXBhcmF0b3I6c2VwLCBkZWZhdWx0czpzaG9ydGN1dDpAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCBzZXBhcmF0b3I6c2VwXG4gICAgXG4gICAgICAgIGlmIHZhbGlkIHByZWZzLmdldCAnc2hvcnRjdXQnXG4gICAgICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KCdzaG9ydGN1dCcpLCBAb3B0Lm9uU2hvcnRjdXQgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLndhdGNoXG4gICAgICAgICAgICBrbG9nICdBcHAub25SZWFkeSBzdGFydFdhdGNoZXInXG4gICAgICAgICAgICBAc3RhcnRXYXRjaGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25TaG93XG4gICAgICAgICAgICBAb3B0Lm9uU2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgICAgICBwb3N0LmVtaXQgJ2FwcFJlYWR5J1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluaXRUcmF5OiA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgdHJheUltZyA9IEByZXNvbHZlIEBvcHQudHJheVxuICAgICAgICBAdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IHRyYXlJbWdcbiAgICAgICAgQHRyYXkub24gJ2NsaWNrJyBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ2RhcndpbidcbiAgICAgICAgICAgIHRlbXBsYXRlID0gW1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIlF1aXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAcXVpdEFwcFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFib3V0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHNob3dBYm91dFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjdGl2YXRlXCJcbiAgICAgICAgICAgICAgICBjbGljazogQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBAdHJheS5zZXRDb250ZXh0TWVudSBlbGVjdHJvbi5NZW51LmJ1aWxkRnJvbVRlbXBsYXRlIHRlbXBsYXRlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBzaG93QWJvdXQ6ID0+XG4gICAgICAgIFxuICAgICAgICBkYXJrID0gJ2RhcmsnID09IHByZWZzLmdldCAnc2NoZW1lJyAnZGFyaydcbiAgICAgICAgYWJvdXRcbiAgICAgICAgICAgIGltZzogICAgICAgIEByZXNvbHZlIEBvcHQuYWJvdXRcbiAgICAgICAgICAgIGNvbG9yOiAgICAgIGRhcmsgYW5kICcjMzMzJyBvciAnI2RkZCdcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGRhcmsgYW5kICcjMTExJyBvciAnI2ZmZidcbiAgICAgICAgICAgIGhpZ2hsaWdodDogIGRhcmsgYW5kICcjZmZmJyBvciAnIzAwMCdcbiAgICAgICAgICAgIHBrZzogICAgICAgIEBvcHQucGtnXG4gICAgICAgICAgICBkZWJ1ZzogICAgICBAb3B0LmFib3V0RGVidWdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHF1aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAnZGVsYXknICE9IEBvcHQub25RdWl0PygpXG4gICAgICAgICAgICBAZXhpdEFwcCgpXG4gICAgICAgICAgICBcbiAgICBleGl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaGlkZURvY2s6ID0+IEBhcHAuZG9jaz8uaGlkZSgpXG4gICAgc2hvd0RvY2s6ID0+IEBhcHAuZG9jaz8uc2hvdygpXG4gICAgICAgIFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIzAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIzAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiAgICBcbiAgICB0b2dnbGVXaW5kb3c6ID0+XG4gICAgICAgICBcbiAgICAgICAgaWYgQHdpbj8uaXNWaXNpYmxlKClcbiAgICAgICAgICAgIEB3aW4uaGlkZSgpXG4gICAgICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG5cbiAgICB0b2dnbGVXaW5kb3dGcm9tVHJheTogPT4gQHNob3dXaW5kb3coKVxuICAgICAgIFxuICAgIG9uQWN0aXZhdGU6IChldmVudCwgaGFzVmlzaWJsZVdpbmRvd3MpID0+IFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25BY3RpdmF0ZVxuICAgICAgICAgICAgaWYgQG9wdC5vbkFjdGl2YXRlIGV2ZW50LCBoYXNWaXNpYmxlV2luZG93c1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgaGFzVmlzaWJsZVdpbmRvd3NcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcbiAgICAgICAgICAgICAgICBcbiAgICBzaG93V2luZG93OiA9PlxuXG4gICAgICAgIEBvcHQub25XaWxsU2hvd1dpbj8oKVxuICAgICAgICBcbiAgICAgICAgaWYgQHdpbj9cbiAgICAgICAgICAgIEB3aW4uc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBjcmVhdGVXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjcmVhdGVXaW5kb3c6IChvblJlYWR5VG9TaG93KSA9PlxuICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBcbiAgICAgICAgb25SZWFkeVRvU2hvdyA/PSBAb3B0Lm9uV2luUmVhZHlcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0ICdib3VuZHMnXG4gICAgICAgICAgICBcbiAgICAgICAgd2lkdGggID0gYm91bmRzPy53aWR0aCAgPyBAb3B0LndpZHRoICA/IDUwMFxuICAgICAgICBoZWlnaHQgPSBib3VuZHM/LmhlaWdodCA/IEBvcHQuaGVpZ2h0ID8gNTAwXG4gICAgICAgIFxuICAgICAgICBAd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgICAgIEBvcHQubWluV2lkdGggICAgICAgICAgID8gMjUwXG4gICAgICAgICAgICBtaW5IZWlnaHQ6ICAgICAgICAgIEBvcHQubWluSGVpZ2h0ICAgICAgICAgID8gMjUwXG4gICAgICAgICAgICBtYXhXaWR0aDogICAgICAgICAgIEBvcHQubWF4V2lkdGggICAgICAgICAgID8gMTAwMDAwXG4gICAgICAgICAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEBvcHQubWF4SGVpZ2h0ICAgICAgICAgID8gMTAwMDAwXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgIEBvcHQuYmFja2dyb3VuZENvbG9yICAgID8gJyMxODE4MTgnXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgIEBvcHQuZnJhbWUgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgQG9wdC50cmFuc3BhcmVudCAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBAb3B0LmZ1bGxzY3JlZW4gICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuYWJsZTogICAgIEBvcHQuZnVsbHNjcmVlbmFibGUgICAgID8gdHJ1ZVxuICAgICAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICBAb3B0LmFjY2VwdEZpcnN0TW91c2UgICA/IHRydWVcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgQG9wdC5yZXNpemFibGUgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIEBvcHQubWF4aW1pemFibGUgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBAb3B0Lm1pbmltaXphYmxlICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIGNsb3NhYmxlOiAgICAgICAgICAgQG9wdC5jbG9zYWJsZSAgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGljb246ICAgICAgICAgICAgICAgQHJlc29sdmUgQG9wdC5pY29uIFxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgIyBiYWNrZ3JvdW5kVGhyb3R0bGluZzogICBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnRleHRJc29sYXRpb246ICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbkluV29ya2VyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVuYWJsZVJlbW90ZU1vZHVsZTogICAgIHRydWVcbiAgICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgIFxuICAgICAgICBpZiBAb3B0LmluZGV4VVJMXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgQG9wdC5pbmRleCwgYmFzZVVSTEZvckRhdGFVUkw6QG9wdC5pbmRleFVSTFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIFxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyhtb2RlOidkZXRhY2gnKSBpZiBhcmdzLmRldnRvb2xzXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAc2F2ZUJvdW5kc1xuICAgICAgICAgICAgQHdpbi5vbiAnbW92ZScgICBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdjbG9zZWQnID0+IEB3aW4gPSBudWxsXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyAgPT4gQGhpZGVEb2NrKClcbiAgICAgICAgQHdpbi5vbiAncmVhZHktdG8tc2hvdycgKCkgPT4gXG4gICAgICAgICAgICBvblJlYWR5VG9TaG93PyBAd2luXG4gICAgICAgICAgICBAd2luLnNob3coKSBcbiAgICAgICAgICAgIHBvc3QuZW1pdCAnd2luUmVhZHknIEB3aW4uaWRcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBAd2luXG5cbiAgICBzYXZlQm91bmRzOiA9PiBpZiBAd2luPyB0aGVuIHByZWZzLnNldCAnYm91bmRzJyBAd2luLmdldEJvdW5kcygpXG4gICAgc2NyZWVuU2l6ZTogLT4gXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgXG4gICAgICAgIFxuICAgIHN0YXJ0V2F0Y2hlcjogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGlyID0gc2xhc2gucmVzb2x2ZSBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlclxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEBvcHQuZGlyc1xuICAgICAgICBcbiAgICAgICAgZm9yIGRpciBpbiBAb3B0LmRpcnNcbiAgICAgICAgICAgIHRvV2F0Y2ggPSBpZiBzbGFzaC5pc1JlbGF0aXZlIGRpclxuICAgICAgICAgICAgICAgIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZGlyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2xhc2gucmVzb2x2ZSBkaXJcbiAgICAgICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgdG9XYXRjaFxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJyBAb25TcmNDaGFuZ2VcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXIgXG4gICAgXG4gICAgc3RvcFdhdGNoZXI6ID0+XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEB3YXRjaGVyc1xuICAgICAgICBmb3Igd2F0Y2hlciBpbiBAd2F0Y2hlcnNcbiAgICAgICAgICAgIHdhdGNoZXIuY2xvc2UoKVxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgIFxuICAgIG9uU3JjQ2hhbmdlOiAoaW5mbykgPT5cbiAgICBcbiAgICAgICAgIyBrbG9nICdvblNyY0NoYW5nZScgaW5mby5jaGFuZ2UsIGluZm8ucGF0aFxuICAgICAgICBpZiBzbGFzaC5iYXNlKGluZm8ucGF0aCkgPT0gJ21haW4nXG4gICAgICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgICAgIGlmIHBrZyA9IHNsYXNoLnBrZyBAb3B0LmRpclxuICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzRGlyIHNsYXNoLmpvaW4gcGtnLCAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIje3BrZ30vbm9kZV9tb2R1bGVzLy5iaW4vZWxlY3Ryb24gLiAtd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiAgICAgIHBrZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RkaW86ICAgICdpbmhlcml0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hlbGw6ICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHBvc3QudG9XaW5zICdtZW51QWN0aW9uJyAnUmVsb2FkJ1xuICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBcbiAgICAiXX0=
//# sourceURL=../coffee/app.coffee