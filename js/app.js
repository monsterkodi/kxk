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

    App.prototype.onActivate = function(event, hasVisibleWindows) {
        if (!hasVisibleWindows) {
            klog('onActivate');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOztBQVFBLE1BQTRGLE9BQUEsQ0FBUSxPQUFSLENBQTVGLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsaUJBQTNDLEVBQWtELGVBQWxELEVBQXdELG1CQUF4RCxFQUFnRSxXQUFoRSxFQUFvRSxXQUFwRSxFQUF3RSxtQkFBeEUsRUFBZ0YsZUFBaEYsRUFBc0Y7O0FBRWhGO0lBRVcsYUFBQyxHQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFVixPQUFPLENBQUMsRUFBUixDQUFXLG1CQUFYLEVBQStCLFNBQUMsR0FBRDtBQUMzQixnQkFBQTtZQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjtZQUNULE1BQU0sQ0FBQyxNQUFQLENBQWMsR0FBZCxFQUFtQixJQUFuQjttQkFDQTtRQUgyQixDQUEvQjtRQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7UUFFWixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7UUFDWCxJQUFDLENBQUEsR0FBRCxHQUFPLFFBQVEsQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLEtBQUssQ0FBQyxRQUFOLENBQUE7UUFFWixRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFkLENBQWlDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBdEM7UUFFQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBUjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBVixHQUFpQixLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFkLENBQWQsRUFEckI7O1FBR0EsSUFBQSxHQUFPO1FBTVAsSUFBa0MsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUF2QztZQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsR0FBWSxJQUFaLEdBQW1CLEtBQTFCOztRQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7UUFFUCxPQUFBLEdBQVUsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLEdBQWQ7Z0JBRU4sSUFBRyxLQUFDLENBQUEsR0FBRyxDQUFDLGVBQVI7MkJBQ0ksS0FBQyxDQUFBLEdBQUcsQ0FBQyxlQUFMLENBQXFCLElBQXJCLEVBQTJCLEdBQTNCLEVBREo7aUJBQUEsTUFBQTsyQkFHSSxLQUFDLENBQUEsVUFBRCxDQUFBLEVBSEo7O1lBRk07UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO1FBT1YsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsS0FBZSxLQUFsQjtZQUNJLElBQUcsbUNBQUg7Z0JBQ0ksSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLGtCQUFMLENBQXdCLE9BQXhCLENBQUg7b0JBQ0ksSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQUE7QUFDQSwyQkFGSjtpQkFESjthQUFBLE1BSUssSUFBRywwQ0FBSDtnQkFDRCxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMseUJBQUwsQ0FBQSxDQUFIO29CQUNJLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLGlCQUFSLEVBQTBCLE9BQTFCLEVBREo7aUJBQUEsTUFBQTtvQkFHSSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBQTtBQUNBLDJCQUpKO2lCQURDO2FBTFQ7O1FBWUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxXQUFSLEVBQW9CLElBQUMsQ0FBQSxTQUFyQjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsU0FBUixFQUFvQixJQUFDLENBQUEsT0FBckI7UUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLE9BQUwsQ0FBYSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUF0QjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLE9BQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsVUFBUixFQUFtQixJQUFDLENBQUEsVUFBcEI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxtQkFBUixFQUE0QixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLEtBQUQ7Z0JBQ3hCLElBQUcsQ0FBSSxLQUFDLENBQUEsR0FBRyxDQUFDLFlBQVo7MkJBQ0ksS0FBSyxDQUFDLGNBQU4sQ0FBQSxFQURKO2lCQUFBLE1BQUE7MkJBR0ksS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUhKOztZQUR3QjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7SUFwRFM7O2tCQTBEYixPQUFBLEdBQVMsU0FBQyxJQUFEO2VBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBaEIsRUFBcUIsSUFBckIsQ0FBZDtJQUFWOztrQkFRVCxPQUFBLEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBUjtZQUFrQixJQUFDLENBQUEsUUFBRCxDQUFBLEVBQWxCOztRQUVBLElBQUMsQ0FBQSxRQUFELENBQUE7UUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLE9BQUwsQ0FBYSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUF0QjtRQUVBLElBQUcsQ0FBSSxJQUFJLENBQUMsT0FBWjtZQUNJLEdBQUEscURBQTRCO1lBQzVCLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFSO2dCQUNJLEtBQUssQ0FBQyxJQUFOLENBQVc7b0JBQUEsU0FBQSxFQUFVLEdBQVY7b0JBQWUsUUFBQSxFQUFTO3dCQUFBLFFBQUEsRUFBUyxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQWQ7cUJBQXhCO2lCQUFYLEVBREo7YUFBQSxNQUFBO2dCQUdJLEtBQUssQ0FBQyxJQUFOLENBQVc7b0JBQUEsU0FBQSxFQUFVLEdBQVY7aUJBQVgsRUFISjthQUZKOztRQU9BLElBQUcsS0FBQSxDQUFNLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVixDQUFOLENBQUg7WUFDSSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7WUFDWCxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQXhCLENBQWlDLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVixDQUFqQyxnREFBMEUsSUFBQyxDQUFBLFVBQTNFLEVBRko7O1FBSUEsSUFBRyxJQUFJLENBQUMsS0FBUjtZQUNJLElBQUEsQ0FBSywwQkFBTDtZQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFGSjs7UUFJQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBUjtZQUNJLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFBLEVBREo7U0FBQSxNQUFBO1lBR0ksSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQUhKOztlQUtBLElBQUksQ0FBQyxJQUFMLENBQVUsVUFBVjtJQTVCSzs7a0JBb0NULFFBQUEsR0FBVSxTQUFBO0FBRU4sWUFBQTtRQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBRCxDQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBZDtRQUNWLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxRQUFRLENBQUMsSUFBYixDQUFrQixPQUFsQjtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLE9BQVQsRUFBaUIsSUFBQyxDQUFBLG9CQUFsQjtRQUVBLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQXBCO1lBQ0ksUUFBQSxHQUFXO2dCQUNQO29CQUFBLEtBQUEsRUFBTyxNQUFQO29CQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsT0FEUjtpQkFETyxFQUlQO29CQUFBLEtBQUEsRUFBTyxPQUFQO29CQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsU0FEUjtpQkFKTyxFQU9QO29CQUFBLEtBQUEsRUFBTyxVQUFQO29CQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsb0JBRFI7aUJBUE87O21CQVVYLElBQUMsQ0FBQSxJQUFJLENBQUMsY0FBTixDQUFxQixRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFkLENBQWdDLFFBQWhDLENBQXJCLEVBWEo7O0lBUE07O2tCQTBCVixTQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxJQUFBLEdBQU8sTUFBQSxLQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixFQUFtQixNQUFuQjtlQUNqQixLQUFBLENBQ0k7WUFBQSxHQUFBLEVBQVksSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQWQsQ0FBWjtZQUNBLEtBQUEsRUFBWSxJQUFBLElBQVMsU0FBVCxJQUFzQixNQURsQztZQUVBLFVBQUEsRUFBWSxJQUFBLElBQVMsU0FBVCxJQUFzQixNQUZsQztZQUdBLFNBQUEsRUFBWSxJQUFBLElBQVMsTUFBVCxJQUFzQixNQUhsQztZQUlBLEdBQUEsRUFBWSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBSmpCO1lBS0EsS0FBQSxFQUFZLElBQUMsQ0FBQSxHQUFHLENBQUMsVUFMakI7U0FESjtJQUhPOztrQkFpQlgsT0FBQSxHQUFTLFNBQUE7QUFFTCxZQUFBO1FBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQTtRQUNBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLEtBQW1CLEtBQXRCO1lBQ0ksSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQURKOztRQUVBLEtBQUssQ0FBQyxJQUFOLENBQUE7UUFFQSxJQUFHLE9BQUEsMkRBQWUsQ0FBQyxrQkFBbkI7bUJBQ0ksSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQURKOztJQVBLOztrQkFVVCxPQUFBLEdBQVMsU0FBQTtRQUVMLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLENBQVY7ZUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7SUFISzs7a0JBV1QsUUFBQSxHQUFVLFNBQUE7QUFBRyxZQUFBO29EQUFTLENBQUUsSUFBWCxDQUFBO0lBQUg7O2tCQUNWLFFBQUEsR0FBVSxTQUFBO0FBQUcsWUFBQTtvREFBUyxDQUFFLElBQVgsQ0FBQTtJQUFIOztrQkFRVixZQUFBLEdBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxvQ0FBTyxDQUFFLFNBQU4sQ0FBQSxVQUFIO1lBQ0ksSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQUE7bUJBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUZKO1NBQUEsTUFBQTttQkFJSSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBSko7O0lBRlU7O2tCQVFkLG9CQUFBLEdBQXNCLFNBQUE7ZUFBRyxJQUFDLENBQUEsVUFBRCxDQUFBO0lBQUg7O2tCQUV0QixVQUFBLEdBQVksU0FBQyxLQUFELEVBQVEsaUJBQVI7UUFFUixJQUFHLENBQUksaUJBQVA7WUFDSSxJQUFBLENBQUssWUFBTDttQkFDQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBRko7O0lBRlE7O2tCQU1aLFVBQUEsR0FBWSxTQUFBO0FBRVIsWUFBQTs7Z0JBQUksQ0FBQzs7UUFFTCxJQUFHLGdCQUFIO1lBQ0ksSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQUEsRUFESjtTQUFBLE1BQUE7WUFHSSxJQUFDLENBQUEsWUFBRCxDQUFBLEVBSEo7O2VBS0EsSUFBQyxDQUFBLFFBQUQsQ0FBQTtJQVRROztrQkFpQlosWUFBQSxHQUFjLFNBQUMsYUFBRDtBQUVWLFlBQUE7UUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O1lBRVg7O1lBQUEsZ0JBQWlCLElBQUMsQ0FBQSxHQUFHLENBQUM7O1FBRXRCLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLEtBQW1CLEtBQXRCO1lBQ0ksTUFBQSxHQUFTLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixFQURiOztRQUdBLEtBQUEsNkdBQXdDO1FBQ3hDLE1BQUEsK0dBQXdDO1FBRXhDLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBSSxRQUFRLENBQUMsYUFBYixDQUNIO1lBQUEsS0FBQSxFQUFvQixLQUFwQjtZQUNBLE1BQUEsRUFBb0IsTUFEcEI7WUFFQSxRQUFBLDhDQUE4QyxHQUY5QztZQUdBLFNBQUEsK0NBQThDLEdBSDlDO1lBSUEsZUFBQSxxREFBOEMsU0FKOUM7WUFLQSxLQUFBLDJDQUE4QyxLQUw5QztZQU1BLFdBQUEsaURBQThDLEtBTjlDO1lBT0EsVUFBQSxrREFBOEMsS0FQOUM7WUFRQSxnQkFBQSx3REFBOEMsSUFSOUM7WUFTQSxnQkFBQSx3REFBOEMsSUFUOUM7WUFVQSxTQUFBLGlEQUE4QyxJQVY5QztZQVdBLFdBQUEsbURBQThDLElBWDlDO1lBWUEsV0FBQSxtREFBOEMsSUFaOUM7WUFhQSxRQUFBLGdEQUE4QyxJQWI5QztZQWNBLGVBQUEsRUFBb0IsSUFkcEI7WUFlQSxVQUFBLEVBQW9CLEtBZnBCO1lBZ0JBLElBQUEsRUFBb0IsS0FoQnBCO1lBaUJBLElBQUEsRUFBb0IsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWQsQ0FqQnBCO1lBa0JBLGNBQUEsRUFDSTtnQkFBQSxlQUFBLEVBQWlCLElBQWpCO2FBbkJKO1NBREc7UUFzQlAsSUFBdUMsY0FBdkM7WUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsTUFBTSxDQUFDLENBQXhCLEVBQTJCLE1BQU0sQ0FBQyxDQUFsQyxFQUFBOztRQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsT0FBTCxDQUFhLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQWQsQ0FBZCxDQUFiO1FBQ0EsSUFBbUMsSUFBSSxDQUFDLFFBQXhDO1lBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBakIsQ0FBQSxFQUFBOztRQUNBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLEtBQW1CLEtBQXRCO1lBQ0ksSUFBdUMsY0FBdkM7Z0JBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLE1BQU0sQ0FBQyxDQUF4QixFQUEyQixNQUFNLENBQUMsQ0FBbEMsRUFBQTs7WUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxVQUFsQjtZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBaUIsSUFBQyxDQUFBLFVBQWxCLEVBSEo7O1FBSUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFpQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFBO3VCQUFHLEtBQUMsQ0FBQSxHQUFELEdBQU87WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWlCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7dUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBQTtZQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLGVBQVIsRUFBd0IsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxLQUFEO0FBQ3BCLG9CQUFBO2dCQUFBLEdBQUEsR0FBTSxLQUFLLENBQUM7O29CQUNaLGNBQWU7O2dCQUNmLEdBQUcsQ0FBQyxJQUFKLENBQUE7dUJBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWLEVBQXFCLEdBQUcsQ0FBQyxFQUF6QjtZQUpvQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7UUFLQSxJQUFDLENBQUEsUUFBRCxDQUFBO2VBRUEsSUFBQyxDQUFBO0lBbkRTOztrQkFxRGQsVUFBQSxHQUFZLFNBQUE7UUFBRyxJQUFHLGdCQUFIO21CQUFjLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixFQUFtQixJQUFDLENBQUEsR0FBRyxDQUFDLFNBQUwsQ0FBQSxDQUFuQixFQUFkOztJQUFIOztrQkFDWixVQUFBLEdBQVksU0FBQTtBQUNSLFlBQUE7UUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7ZUFDWCxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENBQW1DLENBQUM7SUFGNUI7O2tCQVVaLFlBQUEsR0FBYyxTQUFBO0FBRVYsWUFBQTtRQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxHQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFuQjtRQUNYLElBQUEsQ0FBSyxjQUFMLEVBQW9CLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBekI7UUFDQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQWY7UUFDVixPQUFPLENBQUMsRUFBUixDQUFXLFFBQVgsRUFBb0IsSUFBQyxDQUFBLFdBQXJCO1FBQ0EsT0FBTyxDQUFDLEVBQVIsQ0FBVyxPQUFYLEVBQW1CLFNBQUMsR0FBRDttQkFBTyxPQUFBLENBQUUsS0FBRixDQUFRLEdBQVI7UUFBUCxDQUFuQjtRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLE9BQWY7UUFFQSxJQUFVLEtBQUEsQ0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQVgsQ0FBVjtBQUFBLG1CQUFBOztRQUVBLElBQUEsQ0FBSyxlQUFMLEVBQXFCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBMUI7QUFDQTtBQUFBO2FBQUEsc0NBQUE7O1lBQ0ksT0FBQSxHQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBaEIsRUFBcUIsR0FBckIsQ0FBZCxDQUFWO1lBQ1YsT0FBTyxDQUFDLEVBQVIsQ0FBVyxRQUFYLEVBQW9CLElBQUMsQ0FBQSxXQUFyQjtZQUNBLE9BQU8sQ0FBQyxFQUFSLENBQVcsT0FBWCxFQUFtQixTQUFDLEdBQUQ7dUJBQU8sT0FBQSxDQUFFLEtBQUYsQ0FBUSxHQUFSO1lBQVAsQ0FBbkI7eUJBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsT0FBZjtBQUpKOztJQVpVOztrQkFrQmQsV0FBQSxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsSUFBVSxLQUFBLENBQU0sSUFBQyxDQUFBLFFBQVAsQ0FBVjtBQUFBLG1CQUFBOztBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxPQUFPLENBQUMsS0FBUixDQUFBO0FBREo7ZUFFQSxJQUFDLENBQUEsUUFBRCxHQUFZO0lBTEg7O2tCQU9iLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFFVCxZQUFBO1FBQUEsSUFBQSxDQUFLLGVBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQXJCLEdBQTRCLEdBQWpDLEVBQW9DLElBQUksQ0FBQyxJQUF6QztRQUNBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEIsQ0FBQSxLQUF5QixNQUE1QjtZQUNJLElBQUMsQ0FBQSxXQUFELENBQUE7WUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxDQUFWO1lBQ0EsSUFBRyxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQWYsQ0FBVDtnQkFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLGNBQWhCLENBQVosQ0FBSDtvQkFDSSxNQUFNLENBQUMsUUFBUCxDQUFtQixHQUFELEdBQUssa0NBQXZCLEVBQ0k7d0JBQUEsR0FBQSxFQUFVLEdBQVY7d0JBQ0EsUUFBQSxFQUFVLE1BRFY7d0JBRUEsS0FBQSxFQUFVLFNBRlY7d0JBR0EsS0FBQSxFQUFVLElBSFY7cUJBREo7b0JBS0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0FBQ0EsMkJBUEo7aUJBREo7YUFISjs7ZUFZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsUUFBekI7SUFmUzs7Ozs7O0FBaUJqQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG57IGFyZ3MsIHByZWZzLCB3YXRjaCwgZW1wdHksIHZhbGlkLCBzbGFzaCwgYWJvdXQsIHBvc3QsIGNoaWxkcCwgb3MsIGZzLCBrZXJyb3IsIGtsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBBcHBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG5cbiAgICAgICAgcHJvY2Vzcy5vbiAndW5jYXVnaHRFeGNlcHRpb24nIChlcnIpIC0+XG4gICAgICAgICAgICBzcmNtYXAgPSByZXF1aXJlICcuL3NyY21hcCcgICAgXG4gICAgICAgICAgICBzcmNtYXAubG9nRXJyIGVyciwgJ/CflLsnXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHVzZXJEYXRhID0gc2xhc2gudXNlckRhdGEoKVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uTWVudS5zZXRBcHBsaWNhdGlvbk1lbnUgQG9wdC5tZW51XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQudHJheVxuICAgICAgICAgICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgb25PdGhlciA9IChldmVudCwgYXJncywgZGlyKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0Lm9uT3RoZXJJbnN0YW5jZVxuICAgICAgICAgICAgICAgIEBvcHQub25PdGhlckluc3RhbmNlIGFyZ3MsIGRpciBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2hvd1dpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNpbmdsZSAhPSBmYWxzZVxuICAgICAgICAgICAgaWYgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2U/IFxuICAgICAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlIG9uT3RoZXJcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaz8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKClcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5vbiAnc2Vjb25kLWluc3RhbmNlJyBvbk90aGVyICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnc2hvd0Fib3V0JyBAc2hvd0Fib3V0XG4gICAgICAgIHBvc3Qub24gJ3F1aXRBcHAnICAgQHF1aXRBcHBcblxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScgQG9uUmVhZHlcbiAgICAgICAgQGFwcC5vbiAnYWN0aXZhdGUnIEBvbkFjdGl2YXRlXG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJyAoZXZlbnQpID0+IFxuICAgICAgICAgICAgaWYgbm90IEBvcHQuc2luZ2xlV2luZG93XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHF1aXRBcHAoKVxuICAgICAgICBcbiAgICByZXNvbHZlOiAoZmlsZSkgPT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBmaWxlXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4gICAgXG4gICAgb25SZWFkeTogPT5cbiAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5IHRoZW4gQGluaXRUcmF5KClcbiAgICAgICAgIFxuICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICAgXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgXG4gICAgICAgIGlmIG5vdCBhcmdzLm5vcHJlZnNcbiAgICAgICAgICAgIHNlcCA9IEBvcHQucHJlZnNTZXBlcmF0b3IgPyAnOidcbiAgICAgICAgICAgIGlmIEBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0IHNlcGFyYXRvcjpzZXAsIGRlZmF1bHRzOnNob3J0Y3V0OkBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0IHNlcGFyYXRvcjpzZXBcbiAgICBcbiAgICAgICAgaWYgdmFsaWQgcHJlZnMuZ2V0ICdzaG9ydGN1dCdcbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBwcmVmcy5nZXQoJ3Nob3J0Y3V0JyksIEBvcHQub25TaG9ydGN1dCA/IEBzaG93V2luZG93XG4gICAgICAgICAgICAgXG4gICAgICAgIGlmIGFyZ3Mud2F0Y2hcbiAgICAgICAgICAgIGtsb2cgJ0FwcC5vblJlYWR5IHN0YXJ0V2F0Y2hlcidcbiAgICAgICAgICAgIEBzdGFydFdhdGNoZXIoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vblNob3dcbiAgICAgICAgICAgIEBvcHQub25TaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuXG4gICAgICAgIHBvc3QuZW1pdCAnYXBwUmVhZHknXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5pdFRyYXk6ID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB0cmF5SW1nID0gQHJlc29sdmUgQG9wdC50cmF5XG4gICAgICAgIEB0cmF5ID0gbmV3IGVsZWN0cm9uLlRyYXkgdHJheUltZ1xuICAgICAgICBAdHJheS5vbiAnY2xpY2snIEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSAhPSAnZGFyd2luJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBbXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiUXVpdFwiXG4gICAgICAgICAgICAgICAgY2xpY2s6IEBxdWl0QXBwXG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWJvdXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAc2hvd0Fib3V0XG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWN0aXZhdGVcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIEB0cmF5LnNldENvbnRleHRNZW51IGVsZWN0cm9uLk1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgdGVtcGxhdGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNob3dBYm91dDogPT5cbiAgICAgICAgXG4gICAgICAgIGRhcmsgPSAnZGFyaycgPT0gcHJlZnMuZ2V0ICdzY2hlbWUnICdkYXJrJ1xuICAgICAgICBhYm91dFxuICAgICAgICAgICAgaW1nOiAgICAgICAgQHJlc29sdmUgQG9wdC5hYm91dFxuICAgICAgICAgICAgY29sb3I6ICAgICAgZGFyayBhbmQgJyMzODM4MzgnIG9yICcjZGRkJ1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMyODI4MjgnIG9yICcjZmZmJ1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiAgZGFyayBhbmQgJyNmZmYnICAgIG9yICcjMDAwJ1xuICAgICAgICAgICAgcGtnOiAgICAgICAgQG9wdC5wa2dcbiAgICAgICAgICAgIGRlYnVnOiAgICAgIEBvcHQuYWJvdXREZWJ1Z1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcXVpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgIGlmIEBvcHQuc2F2ZUJvdW5kcyAhPSBmYWxzZVxuICAgICAgICAgICAgQHNhdmVCb3VuZHMoKVxuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdkZWxheScgIT0gQG9wdC5vblF1aXQ/KClcbiAgICAgICAgICAgIEBleGl0QXBwKClcbiAgICAgICAgICAgIFxuICAgIGV4aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBoaWRlRG9jazogPT4gQGFwcC5kb2NrPy5oaWRlKClcbiAgICBzaG93RG9jazogPT4gQGFwcC5kb2NrPy5zaG93KClcbiAgICAgICAgXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgIFxuICAgIHRvZ2dsZVdpbmRvdzogPT5cbiAgICAgICAgIFxuICAgICAgICBpZiBAd2luPy5pc1Zpc2libGUoKVxuICAgICAgICAgICAgQHdpbi5oaWRlKClcbiAgICAgICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgIHRvZ2dsZVdpbmRvd0Zyb21UcmF5OiA9PiBAc2hvd1dpbmRvdygpXG4gICAgICAgXG4gICAgb25BY3RpdmF0ZTogKGV2ZW50LCBoYXNWaXNpYmxlV2luZG93cykgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgaGFzVmlzaWJsZVdpbmRvd3NcbiAgICAgICAgICAgIGtsb2cgJ29uQWN0aXZhdGUnXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG4gICAgXG4gICAgc2hvd1dpbmRvdzogPT5cblxuICAgICAgICBAb3B0Lm9uV2lsbFNob3dXaW4/KClcbiAgICAgICAgXG4gICAgICAgIGlmIEB3aW4/XG4gICAgICAgICAgICBAd2luLnNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY3JlYXRlV2luZG93KClcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY3JlYXRlV2luZG93OiAob25SZWFkeVRvU2hvdykgPT5cbiAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgXG4gICAgICAgIG9uUmVhZHlUb1Nob3cgPz0gQG9wdC5vbldpblJlYWR5XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCAnYm91bmRzJ1xuICAgICAgICAgICAgXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICBAb3B0Lm1pbldpZHRoICAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICBAb3B0Lm1pbkhlaWdodCAgICAgICAgICA/IDI1MFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICBAb3B0LmJhY2tncm91bmRDb2xvciAgICA/ICcjMTgxODE4J1xuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBAb3B0LmZyYW1lICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIEBvcHQudHJhbnNwYXJlbnQgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgQG9wdC5mdWxsc2NyZWVuICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBAb3B0LmZ1bGxzY3JlZW5lbmFibGUgICA/IHRydWVcbiAgICAgICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgQG9wdC5hY2NlcHRGaXJzdE1vdXNlICAgPyB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgIEBvcHQucmVzaXphYmxlICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICBAb3B0Lm1heGltaXphYmxlICAgICAgICA/IHRydWVcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgQG9wdC5taW5pbWl6YWJsZSAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgIEBvcHQuY2xvc2FibGUgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgYXV0b0hpZGVNZW51QmFyOiAgICB0cnVlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBpY29uOiAgICAgICAgICAgICAgIEByZXNvbHZlIEBvcHQuaWNvbiBcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgIFxuICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCkgaWYgYXJncy5kZXZ0b29sc1xuICAgICAgICBpZiBAb3B0LnNhdmVCb3VuZHMgIT0gZmFsc2VcbiAgICAgICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55IGlmIGJvdW5kcz9cbiAgICAgICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQHNhdmVCb3VuZHNcbiAgICAgICAgICAgIEB3aW4ub24gJ21vdmUnICAgQHNhdmVCb3VuZHNcbiAgICAgICAgQHdpbi5vbiAnY2xvc2VkJyA9PiBAd2luID0gbnVsbFxuICAgICAgICBAd2luLm9uICdjbG9zZScgID0+IEBoaWRlRG9jaygpXG4gICAgICAgIEB3aW4ub24gJ3JlYWR5LXRvLXNob3cnIChldmVudCkgPT4gXG4gICAgICAgICAgICB3aW4gPSBldmVudC5zZW5kZXJcbiAgICAgICAgICAgIG9uUmVhZHlUb1Nob3c/IHdpbiBcbiAgICAgICAgICAgIHdpbi5zaG93KCkgXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ3dpblJlYWR5JyB3aW4uaWRcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpblxuXG4gICAgc2F2ZUJvdW5kczogPT4gaWYgQHdpbj8gdGhlbiBwcmVmcy5zZXQgJ2JvdW5kcycgQHdpbi5nZXRCb3VuZHMoKVxuICAgIHNjcmVlblNpemU6IC0+IFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuICAgICAgICBcbiAgICBzdGFydFdhdGNoZXI6ID0+XG4gICAgICAgIFxuICAgICAgICBAb3B0LmRpciA9IHNsYXNoLnJlc29sdmUgQG9wdC5kaXJcbiAgICAgICAga2xvZyAnc3RhcnRXYXRjaGVyJyBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScgQG9uU3JjQ2hhbmdlXG4gICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlclxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEBvcHQuZGlyc1xuICAgICAgICBcbiAgICAgICAga2xvZyAnc3RhcnRXYXRjaGVycycgQG9wdC5kaXJzXG4gICAgICAgIGZvciBkaXIgaW4gQG9wdC5kaXJzXG4gICAgICAgICAgICB3YXRjaGVyID0gd2F0Y2guZGlyIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZGlyXG4gICAgICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnIEBvblNyY0NoYW5nZVxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIGVyclxuICAgICAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlciBcbiAgICBcbiAgICBzdG9wV2F0Y2hlcjogPT5cbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgQHdhdGNoZXJzXG4gICAgICAgIGZvciB3YXRjaGVyIGluIEB3YXRjaGVyc1xuICAgICAgICAgICAgd2F0Y2hlci5jbG9zZSgpXG4gICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgXG4gICAgb25TcmNDaGFuZ2U6IChpbmZvKSA9PlxuICAgIFxuICAgICAgICBrbG9nIFwib25TcmNDaGFuZ2UgJyN7aW5mby5jaGFuZ2V9J1wiIGluZm8ucGF0aFxuICAgICAgICBpZiBzbGFzaC5iYXNlKGluZm8ucGF0aCkgPT0gJ21haW4nXG4gICAgICAgICAgICBAc3RvcFdhdGNoZXIoKVxuICAgICAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgICAgIGlmIHBrZyA9IHNsYXNoLnBrZyBAb3B0LmRpclxuICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzRGlyIHNsYXNoLmpvaW4gcGtnLCAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIje3BrZ30vbm9kZV9tb2R1bGVzLy5iaW4vZWxlY3Ryb24gLiAtd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiAgICAgIHBrZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RkaW86ICAgICdpbmhlcml0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hlbGw6ICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHBvc3QudG9XaW5zICdtZW51QWN0aW9uJyAnUmVsb2FkJ1xuICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBcbiAgICAiXX0=
//# sourceURL=../coffee/app.coffee