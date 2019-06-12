// koffee 0.56.0

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
        var bounds, electron, height, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, width;
        electron = require('electron');
        if (onReadyToShow != null) {
            onReadyToShow;
        } else {
            onReadyToShow = this.opt.onWinReady;
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOztBQVFBLE1BQTRGLE9BQUEsQ0FBUSxPQUFSLENBQTVGLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsaUJBQTNDLEVBQWtELGVBQWxELEVBQXdELG1CQUF4RCxFQUFnRSxXQUFoRSxFQUFvRSxXQUFwRSxFQUF3RSxtQkFBeEUsRUFBZ0YsZUFBaEYsRUFBc0Y7O0FBRWhGO0lBRVcsYUFBQyxHQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7Ozs7Ozs7OztRQUVWLE9BQU8sQ0FBQyxFQUFSLENBQVcsbUJBQVgsRUFBZ0MsU0FBQyxHQUFEO0FBQzVCLGdCQUFBO1lBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO1lBQ1QsTUFBTSxDQUFDLE1BQVAsQ0FBYyxHQUFkLEVBQW1CLElBQW5CO21CQUNBO1FBSDRCLENBQWhDO1FBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtRQUVaLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLFFBQU4sQ0FBQTtRQUVaLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFWLEdBQWlCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWQsQ0FBZCxFQURyQjs7UUFHQSxJQUFBLEdBQU87UUFNUCxJQUFrQyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQXZDO1lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFHLENB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QVY7d0JBQ0EsUUFBQSxFQUFVLE1BRFY7d0JBRUEsS0FBQSxFQUFVLFNBRlY7d0JBR0EsS0FBQSxFQUFVLElBSFY7cUJBREo7b0JBS0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0FBQ0EsMkJBUEo7aUJBREo7YUFISjs7ZUFZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBMEIsUUFBMUI7SUFmUzs7Ozs7O0FBaUJqQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG57IGFyZ3MsIHByZWZzLCB3YXRjaCwgZW1wdHksIHZhbGlkLCBzbGFzaCwgYWJvdXQsIHBvc3QsIGNoaWxkcCwgb3MsIGZzLCBrZXJyb3IsIGtsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBBcHBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG5cbiAgICAgICAgcHJvY2Vzcy5vbiAndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyKSAtPlxuICAgICAgICAgICAgc3JjbWFwID0gcmVxdWlyZSAnLi9zcmNtYXAnICAgIFxuICAgICAgICAgICAgc3JjbWFwLmxvZ0VyciBlcnIsICfwn5S7J1xuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBAYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgICAgIEB1c2VyRGF0YSA9IHNsYXNoLnVzZXJEYXRhKCkgI0BhcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXlcbiAgICAgICAgICAgIGtsb2cuc2xvZy5pY29uID0gc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LnRyYXkgIFxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBcIlwiXCJcbiAgICAgICAgICAgIG5vcHJlZnMgICAgIGRvbid0IGxvYWQgcHJlZmVyZW5jZXMgICAgICBmYWxzZVxuICAgICAgICAgICAgZGV2dG9vbHMgICAgb3BlbiBkZXZlbG9wZXIgdG9vbHMgICAgICAgIGZhbHNlICAtRFxuICAgICAgICAgICAgd2F0Y2ggICAgICAgd2F0Y2ggc291cmNlcyBmb3IgY2hhbmdlcyAgIGZhbHNlXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdsID0gQG9wdC5hcmdzICsgJ1xcbicgKyBhcmdsIGlmIEBvcHQuYXJnc1xuICAgICAgICBhcmdzID0gYXJncy5pbml0IGFyZ2xcbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnYXBwLmFyZ3MnLCBhcmdzXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNpbmdsZSAhPSBmYWxzZSAjYW5kIG9zLnBsYXRmb3JtKCkgIT0gJ2RhcndpbidcbiAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlPyBhbmQgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2UgQG9wdC5vbk90aGVySW5zdGFuY2UgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgICAgICMga2xvZyAnYXBwLnF1aXQgc2luZ2xlJ1xuICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaz8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKClcbiAgICAgICAgICAgICAgICAgICAgaWYgQG9wdC5vbk90aGVySW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gKGV2ZW50LCBhcmdzLCBkaXIpID0+IEBvcHQub25PdGhlckluc3RhbmNlIGFyZ3MsIGRpciBcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgICAgICAgICBAYXBwLm9uICdzZWNvbmQtaW5zdGFuY2UnLCBjYiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdzaG93QWJvdXQnLCBAc2hvd0Fib3V0XG4gICAgICAgIHBvc3Qub24gJ3F1aXRBcHAnLCAgIEBxdWl0QXBwXG5cbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICAgICAgQGFwcC5vbiAncmVhZHknLCBAb25SZWFkeVxuICAgICAgICBAYXBwLm9uICd3aW5kb3ctYWxsLWNsb3NlZCcsIChldmVudCkgPT4gXG4gICAgICAgICAgICBpZiBub3QgQG9wdC5zaW5nbGVXaW5kb3dcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcXVpdEFwcCgpXG4gICAgICAgIFxuICAgIHJlc29sdmU6IChmaWxlKSA9PiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGZpbGVcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiAgICBcbiAgICBvblJlYWR5OiA9PlxuICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXkgdGhlbiBAaW5pdFRyYXkoKVxuICAgICAgICAgXG4gICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgICBcbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICBcbiAgICAgICAgaWYgbm90IGFyZ3Mubm9wcmVmc1xuICAgICAgICAgICAgaWYgQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2hvcnRjdXQ6IEBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0KClcbiAgICBcbiAgICAgICAgaWYgdmFsaWQgcHJlZnMuZ2V0ICdzaG9ydGN1dCdcbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBwcmVmcy5nZXQoJ3Nob3J0Y3V0JyksIEBzaG93V2luZG93XG4gICAgICAgICAgICAgXG4gICAgICAgIGlmIGFyZ3Mud2F0Y2hcbiAgICAgICAgICAgIGtsb2cgJ0FwcC5vblJlYWR5IHN0YXJ0V2F0Y2hlcidcbiAgICAgICAgICAgIEBzdGFydFdhdGNoZXIoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vblNob3dcbiAgICAgICAgICAgIEBvcHQub25TaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuXG4gICAgICAgIHBvc3QuZW1pdCAnYXBwUmVhZHknXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5pdFRyYXk6ID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB0cmF5SW1nID0gQHJlc29sdmUgQG9wdC50cmF5XG4gICAgICAgIEB0cmF5ID0gbmV3IGVsZWN0cm9uLlRyYXkgdHJheUltZ1xuICAgICAgICBAdHJheS5vbiAnY2xpY2snLCBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ2RhcndpbidcbiAgICAgICAgICAgIHRlbXBsYXRlID0gW1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIlF1aXRcIlxuICAgICAgICAgICAgICAgIGNsaWNrOiBAcXVpdEFwcFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFib3V0XCJcbiAgICAgICAgICAgICAgICBjbGljazogQHNob3dBYm91dFxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjdGl2YXRlXCJcbiAgICAgICAgICAgICAgICBjbGljazogQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBAdHJheS5zZXRDb250ZXh0TWVudSBlbGVjdHJvbi5NZW51LmJ1aWxkRnJvbVRlbXBsYXRlIHRlbXBsYXRlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBzaG93QWJvdXQ6ID0+XG4gICAgICAgIFxuICAgICAgICBkYXJrID0gJ2RhcmsnID09IHByZWZzLmdldCAnc2NoZW1lJywgJ2RhcmsnXG4gICAgICAgIGFib3V0XG4gICAgICAgICAgICBpbWc6ICAgICAgICBAcmVzb2x2ZSBAb3B0LmFib3V0XG4gICAgICAgICAgICBjb2xvcjogICAgICBkYXJrIGFuZCAnIzM4MzgzOCcgb3IgJyNkZGQnXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBkYXJrIGFuZCAnIzI4MjgyOCcgb3IgJyNmZmYnXG4gICAgICAgICAgICBoaWdobGlnaHQ6ICBkYXJrIGFuZCAnI2ZmZicgICAgb3IgJyMwMDAnXG4gICAgICAgICAgICBwa2c6ICAgICAgICBAb3B0LnBrZ1xuICAgICAgICAgICAgZGVidWc6ICAgICAgQG9wdC5hYm91dERlYnVnXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBxdWl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgQHNhdmVCb3VuZHMoKVxuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdkZWxheScgIT0gQG9wdC5vblF1aXQ/KClcbiAgICAgICAgICAgIEBleGl0QXBwKClcbiAgICAgICAgICAgIFxuICAgIGV4aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBoaWRlRG9jazogPT4gQGFwcC5kb2NrPy5oaWRlKClcbiAgICBzaG93RG9jazogPT4gQGFwcC5kb2NrPy5zaG93KClcbiAgICAgICAgXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgIFxuICAgIHRvZ2dsZVdpbmRvdzogPT5cbiAgICAgICAgIFxuICAgICAgICBpZiBAd2luPy5pc1Zpc2libGUoKVxuICAgICAgICAgICAgQHdpbi5oaWRlKClcbiAgICAgICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgIHRvZ2dsZVdpbmRvd0Zyb21UcmF5OiA9PiBAc2hvd1dpbmRvdygpXG4gICAgICAgICAgICBcbiAgICBzaG93V2luZG93OiA9PlxuICAgICAgICBcbiAgICAgICAgQG9wdC5vbldpbGxTaG93V2luPygpXG4gICAgICAgIFxuICAgICAgICBpZiBAd2luP1xuICAgICAgICAgICAgQHdpbi5zaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNyZWF0ZVdpbmRvdygpXG4gICAgICAgICAgICBcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNyZWF0ZVdpbmRvdzogKG9uUmVhZHlUb1Nob3cpID0+XG4gICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIFxuICAgICAgICBvblJlYWR5VG9TaG93ID89IEBvcHQub25XaW5SZWFkeVxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0ICdib3VuZHMnXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICBAb3B0Lm1pbldpZHRoICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICBAb3B0Lm1pbkhlaWdodCA/IDI1MFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzE4MTgxOCdcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6IHRydWVcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgQG9wdC5yZXNpemFibGUgICA/IHRydWVcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgQG9wdC5tYXhpbWl6YWJsZSA/IHRydWVcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgQG9wdC5taW5pbWl6YWJsZSA/IHRydWVcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgQG9wdC50cmFuc3BhcmVudCA/IGZhbHNlXG4gICAgICAgICAgICBhdXRvSGlkZU1lbnVCYXI6IHRydWVcbiAgICAgICAgICAgIGljb246ICAgICAgICAgICAgQHJlc29sdmUgQG9wdC5pY29uIFxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgIFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueSBpZiBib3VuZHM/XG4gICAgXG4gICAgICAgIEB3aW4ubG9hZFVSTCBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQuaW5kZXhcbiAgICAgICAgQHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKSBpZiBhcmdzLmRldnRvb2xzXG4gICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScsIEBzYXZlQm91bmRzXG4gICAgICAgIEB3aW4ub24gJ21vdmUnLCAgIEBzYXZlQm91bmRzXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlZCcsID0+IEB3aW4gPSBudWxsXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJywgID0+IEBoaWRlRG9jaygpXG4gICAgICAgIEB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAoZXZlbnQpID0+IFxuICAgICAgICAgICAgd2luID0gZXZlbnQuc2VuZGVyXG4gICAgICAgICAgICBvblJlYWR5VG9TaG93PyB3aW4gXG4gICAgICAgICAgICB3aW4uc2hvdygpIFxuICAgICAgICAgICAgcG9zdC5lbWl0ICd3aW5SZWFkeScsIHdpbi5pZFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBcbiAgICAgICAgQHdpblxuXG4gICAgc2F2ZUJvdW5kczogPT4gaWYgQHdpbj8gdGhlbiBwcmVmcy5zZXQgJ2JvdW5kcycsIEB3aW4uZ2V0Qm91bmRzKClcbiAgICBzY3JlZW5TaXplOiAtPiBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAgICAgXG4gICAgc3RhcnRXYXRjaGVyOiA9PlxuICAgICAgICBcbiAgICAgICAgQG9wdC5kaXIgPSBzbGFzaC5yZXNvbHZlIEBvcHQuZGlyXG4gICAgICAgIGtsb2cgJ3N0YXJ0V2F0Y2hlcicsIEBvcHQuZGlyXG4gICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlci5vbiAnY2hhbmdlJywgQG9uU3JjQ2hhbmdlXG4gICAgICAgIHdhdGNoZXIub24gJ2Vycm9yJywgKGVycikgLT4gZXJyb3IgZXJyXG4gICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXJcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBAb3B0LmRpcnNcbiAgICAgICAgXG4gICAgICAgIGtsb2cgJ3N0YXJ0V2F0Y2hlcnMnLCBAb3B0LmRpcnNcbiAgICAgICAgZm9yIGRpciBpbiBAb3B0LmRpcnNcbiAgICAgICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBkaXJcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScsIEBvblNyY0NoYW5nZVxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InLCAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXIgXG4gICAgXG4gICAgc3RvcFdhdGNoZXI6ID0+XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEB3YXRjaGVyc1xuICAgICAgICBmb3Igd2F0Y2hlciBpbiBAd2F0Y2hlcnNcbiAgICAgICAgICAgIHdhdGNoZXIuY2xvc2UoKVxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgIFxuICAgIG9uU3JjQ2hhbmdlOiAoaW5mbykgPT5cbiAgICBcbiAgICAgICAga2xvZyBcIm9uU3JjQ2hhbmdlICcje2luZm8uY2hhbmdlfSdcIiwgaW5mby5wYXRoXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaW5mby5wYXRoKSA9PSAnbWFpbidcbiAgICAgICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICAgICAgaWYgcGtnID0gc2xhc2gucGtnIEBvcHQuZGlyXG4gICAgICAgICAgICAgICAgaWYgc2xhc2guaXNEaXIgc2xhc2guam9pbiBwa2csICdub2RlX21vZHVsZXMnXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcIiN7cGtnfS9ub2RlX21vZHVsZXMvLmJpbi9lbGVjdHJvbiAuIC13XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjd2Q6ICAgICAgcGtnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRpbzogICAgJ2luaGVyaXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVsbDogICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgcG9zdC50b1dpbnMgJ21lbnVBY3Rpb24nLCAnUmVsb2FkJ1xuICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBcbiAgICAiXX0=
//# sourceURL=../coffee/app.coffee