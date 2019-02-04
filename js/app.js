/*
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000        
*/
var App, _, about, args, childp, empty, error, fs, log, post, prefs, slash, valid, watch;

({args, prefs, watch, empty, valid, slash, about, post, childp, fs, error, log, _} = require('./kxk'));

App = class App {
  constructor(opt) {
    var argl, electron, ref, ref1;
    this.resolve = this.resolve.bind(this);
    
    //00000000   00000000   0000000   0000000    000   000
    //000   000  000       000   000  000   000   000 000
    //0000000    0000000   000000000  000   000    00000
    //000   000  000       000   000  000   000     000
    //000   000  00000000  000   000  0000000       000
    this.onReady = this.onReady.bind(this);
    
    // 000000000  00000000    0000000   000   000  
    //    000     000   000  000   000   000 000   
    //    000     0000000    000000000    00000    
    //    000     000   000  000   000     000     
    //    000     000   000  000   000     000     
    this.initTray = this.initTray.bind(this);
    
    //  0000000   0000000     0000000   000   000  000000000  
    // 000   000  000   000  000   000  000   000     000     
    // 000000000  0000000    000   000  000   000     000     
    // 000   000  000   000  000   000  000   000     000     
    // 000   000  0000000     0000000    0000000      000     
    this.showAbout = this.showAbout.bind(this);
    
    //  0000000   000   000  000  000000000  
    // 000   000  000   000  000     000     
    // 000 00 00  000   000  000     000     
    // 000 0000   000   000  000     000     
    //  00000 00   0000000   000     000     
    this.quitApp = this.quitApp.bind(this);
    this.exitApp = this.exitApp.bind(this);
    
    // 0000000     0000000    0000000  000   000  
    // 000   000  000   000  000       000  000   
    // 000   000  000   000  000       0000000    
    // 000   000  000   000  000       000  000   
    // 0000000     0000000    0000000  000   000  
    this.hideDock = this.hideDock.bind(this);
    this.showDock = this.showDock.bind(this);
    
    //000   000  000  000   000  0000000     0000000   000   000
    //000 0 000  000  0000  000  000   000  000   000  000 0 000
    //000000000  000  000 0 000  000   000  000   000  000000000
    //000   000  000  000  0000  000   000  000   000  000   000
    //00     00  000  000   000  0000000     0000000   00     00
    this.toggleWindow = this.toggleWindow.bind(this);
    this.toggleWindowFromTray = this.toggleWindowFromTray.bind(this);
    this.showWindow = this.showWindow.bind(this);
    
    //  0000000  00000000   00000000   0000000   000000000  00000000  
    // 000       000   000  000       000   000     000     000       
    // 000       0000000    0000000   000000000     000     0000000   
    // 000       000   000  000       000   000     000     000       
    //  0000000  000   000  00000000  000   000     000     00000000  
    this.createWindow = this.createWindow.bind(this);
    this.saveBounds = this.saveBounds.bind(this);
    
    // 000   000   0000000   000000000   0000000  000   000  00000000  00000000     
    // 000 0 000  000   000     000     000       000   000  000       000   000    
    // 000000000  000000000     000     000       000000000  0000000   0000000      
    // 000   000  000   000     000     000       000   000  000       000   000    
    // 00     00  000   000     000      0000000  000   000  00000000  000   000    
    this.startWatcher = this.startWatcher.bind(this);
    this.stopWatcher = this.stopWatcher.bind(this);
    this.onSrcChange = this.onSrcChange.bind(this);
    this.opt = opt;
    process.on('uncaughtException', function(err) {
      var srcmap;
      srcmap = require('./srcmap');
      srcmap.logErr(err, '🔻');
      return true;
    });
    this.watchers = [];
    electron = require('electron');
    this.app = electron.app;
    this.userData = slash.userData(); //@app.getPath 'userData'
    if (this.opt.tray) {
      log.slog.icon = slash.fileUrl(this.resolve(this.opt.tray));
    }
    argl = "noprefs     don't load preferences      false\ndevtools    open developer tools        false  -D\nwatch       watch sources for changes   false";
    if (this.opt.args) {
      argl = this.opt.args + '\n' + argl;
    }
    args = args.init(argl);
    
    // log 'app.args', args
    if (this.opt.single !== false) {
      if ((this.app.makeSingleInstance != null) && this.app.makeSingleInstance((ref = this.opt.onOtherInstance) != null ? ref : this.showWindow)) {
        log('app.quit single');
        this.app.quit();
        return;
      } else if (this.app.requestSingleInstanceLock != null) {
        if (this.app.requestSingleInstanceLock()) {
          this.app.on('second-instance', (ref1 = this.opt.onOtherInstance) != null ? ref1 : this.showWindow);
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
    this.app.on('window-all-closed', (event) => {
      if (!this.opt.singleWindow) {
        return event.preventDefault();
      } else {
        return this.quitApp();
      }
    });
  }

  resolve(file) {
    return slash.resolve(slash.join(this.opt.dir, file));
  }

  onReady() {
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
      log('App.onReady startWatcher');
      this.startWatcher();
    }
    if (this.opt.onShow) {
      this.opt.onShow();
    } else {
      this.showWindow();
    }
    return post.emit('appReady');
  }

  initTray() {
    var electron, template, trayImg;
    electron = require('electron');
    trayImg = this.resolve(this.opt.tray);
    this.tray = new electron.Tray(trayImg);
    this.tray.on('click', this.toggleWindowFromTray);
    template = [
      {
        label: "Quit",
        click: this.quitApp
      },
      {
        label: "About",
        click: this.showAbout
      },
      {
        label: "Activate",
        click: this.toggleWindowFromTray
      }
    ];
    return this.tray.setContextMenu(electron.Menu.buildFromTemplate(template));
  }

  showAbout() {
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
  }

  quitApp() {
    var base;
    this.stopWatcher();
    this.saveBounds();
    prefs.save();
    if ('delay' !== (typeof (base = this.opt).onQuit === "function" ? base.onQuit() : void 0)) {
      return this.exitApp();
    }
  }

  exitApp() {
    this.app.exit(0);
    return process.exit(0);
  }

  hideDock() {
    var ref;
    return (ref = this.app.dock) != null ? ref.hide() : void 0;
  }

  showDock() {
    var ref;
    return (ref = this.app.dock) != null ? ref.show() : void 0;
  }

  toggleWindow() {
    var ref;
    if ((ref = this.win) != null ? ref.isVisible() : void 0) {
      this.win.hide();
      return this.hideDock();
    } else {
      return this.showWindow();
    }
  }

  toggleWindowFromTray() {
    return this.showWindow();
  }

  showWindow() {
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
  }

  createWindow(onReadyToShow) {
    var bounds, electron, height, ref, ref1, ref2, ref3, ref4, ref5, width;
    electron = require('electron');
    bounds = prefs.get('bounds');
    width = (ref = (ref1 = bounds != null ? bounds.width : void 0) != null ? ref1 : this.opt.width) != null ? ref : 500;
    height = (ref2 = (ref3 = bounds != null ? bounds.height : void 0) != null ? ref3 : this.opt.height) != null ? ref2 : 500;
    this.win = new electron.BrowserWindow({
      width: width,
      height: height,
      minWidth: (ref4 = this.opt.minWidth) != null ? ref4 : 250,
      minHeight: (ref5 = this.opt.minHeight) != null ? ref5 : 250,
      backgroundColor: '#181818',
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
    this.win.on('closed', () => {
      return this.win = null;
    });
    this.win.on('close', () => {
      return this.hideDock();
    });
    this.win.on('ready-to-show', (event) => {
      var win;
      win = event.sender;
      if (typeof onReadyToShow === "function") {
        onReadyToShow(win);
      }
      win.show();
      return post.emit('winReady', win.id);
    });
    this.showDock();
    return this.win;
  }

  saveBounds() {
    if (this.win != null) {
      return prefs.set('bounds', this.win.getBounds());
    }
  }

  screenSize() {
    var electron;
    electron = require('electron');
    return electron.screen.getPrimaryDisplay().workAreaSize;
  }

  startWatcher() {
    var dir, i, len, ref, results, watcher;
    this.opt.dir = slash.resolve(this.opt.dir);
    console.log('startWatcher', this.opt.dir);
    watcher = watch.dir(this.opt.dir);
    watcher.on('change', this.onSrcChange);
    watcher.on('error', function(err) {
      return error(err);
    });
    this.watchers.push(watcher);
    if (empty(this.opt.dirs)) {
      return;
    }
    console.log('startWatchers', this.opt.dirs);
    ref = this.opt.dirs;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      dir = ref[i];
      watcher = watch.dir(slash.resolve(slash.join(this.opt.dir, dir)));
      watcher.on('change', this.onSrcChange);
      watcher.on('error', function(err) {
        return error(err);
      });
      results.push(this.watchers.push(watcher));
    }
    return results;
  }

  stopWatcher() {
    var i, len, ref, watcher;
    if (empty(this.watchers)) {
      return;
    }
    ref = this.watchers;
    for (i = 0, len = ref.length; i < len; i++) {
      watcher = ref[i];
      watcher.close();
    }
    return this.watchers = [];
  }

  onSrcChange(info) {
    var pkg;
    log(`onSrcChange '${info.change}'`, info.path);
    if (slash.base(info.path) === 'main') {
      this.stopWatcher();
      this.app.exit(0);
      if (pkg = slash.pkg(this.opt.dir)) {
        if (slash.isDir(slash.join(pkg, 'node_modules'))) {
          childp.execSync(`${pkg}/node_modules/.bin/electron . -w`, {
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
  }

};

module.exports = App;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9hcHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUE7O0FBUUEsQ0FBQSxDQUFFLElBQUYsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixFQUE2QixLQUE3QixFQUFvQyxLQUFwQyxFQUEyQyxLQUEzQyxFQUFrRCxJQUFsRCxFQUF3RCxNQUF4RCxFQUFnRSxFQUFoRSxFQUFvRSxLQUFwRSxFQUEyRSxHQUEzRSxFQUFnRixDQUFoRixDQUFBLEdBQXNGLE9BQUEsQ0FBUSxPQUFSLENBQXRGOztBQUVNLE1BQU4sTUFBQSxJQUFBO0VBRUksV0FBYSxJQUFBLENBQUE7QUFFVCxRQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBO1FBZ0RKLENBQUEsY0FBQSxDQUFBLG1CQWhESTs7Ozs7OztRQXdESixDQUFBLGNBQUEsQ0FBQSxtQkF4REk7Ozs7Ozs7UUEyRkosQ0FBQSxlQUFBLENBQUEsb0JBM0ZJOzs7Ozs7O1FBc0hKLENBQUEsZ0JBQUEsQ0FBQSxxQkF0SEk7Ozs7Ozs7UUF1SUosQ0FBQSxjQUFBLENBQUE7UUFTQSxDQUFBLGNBQUEsQ0FBQSxtQkFoSkk7Ozs7Ozs7UUEySkosQ0FBQSxlQUFBLENBQUE7UUFDQSxDQUFBLGVBQUEsQ0FBQSxvQkE1Skk7Ozs7Ozs7UUFvS0osQ0FBQSxtQkFBQSxDQUFBO1FBUUEsQ0FBQSwyQkFBQSxDQUFBO1FBRUEsQ0FBQSxpQkFBQSxDQUFBLHNCQTlLSTs7Ozs7OztRQStMSixDQUFBLG1CQUFBLENBQUE7UUEyQ0EsQ0FBQSxpQkFBQSxDQUFBLHNCQTFP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Q0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLElBQWhCLENBQUEsS0FBeUIsTUFBNUI7TUFDSSxJQUFDLENBQUEsV0FBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsQ0FBVjtNQUNBLElBQUcsR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFmLENBQVQ7UUFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLGNBQWhCLENBQVosQ0FBSDtVQUNJLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQUEsQ0FBQSxDQUFHLEdBQUgsQ0FBTyxnQ0FBUCxDQUFoQixFQUNJO1lBQUEsR0FBQSxFQUFVLEdBQVY7WUFDQSxRQUFBLEVBQVUsTUFEVjtZQUVBLEtBQUEsRUFBVSxTQUZWO1lBR0EsS0FBQSxFQUFVO1VBSFYsQ0FESjtVQUtBLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYjtBQUNBLGlCQVBKO1NBREo7T0FISjs7V0FZQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBMEIsUUFBMUI7RUFmUzs7QUFsUmpCOztBQW1TQSxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG57IGFyZ3MsIHByZWZzLCB3YXRjaCwgZW1wdHksIHZhbGlkLCBzbGFzaCwgYWJvdXQsIHBvc3QsIGNoaWxkcCwgZnMsIGVycm9yLCBsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBBcHBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG5cbiAgICAgICAgcHJvY2Vzcy5vbiAndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyKSAtPlxuICAgICAgICAgICAgc3JjbWFwID0gcmVxdWlyZSAnLi9zcmNtYXAnICAgIFxuICAgICAgICAgICAgc3JjbWFwLmxvZ0VyciBlcnIsICfwn5S7J1xuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBAYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgICAgIEB1c2VyRGF0YSA9IHNsYXNoLnVzZXJEYXRhKCkgI0BhcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXlcbiAgICAgICAgICAgIGxvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgIyBsb2cgJ2FwcC5hcmdzJywgYXJnc1xuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5zaW5nbGUgIT0gZmFsc2VcbiAgICAgICAgICAgIGlmIEBhcHAubWFrZVNpbmdsZUluc3RhbmNlPyBhbmQgQGFwcC5tYWtlU2luZ2xlSW5zdGFuY2UgQG9wdC5vbk90aGVySW5zdGFuY2UgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgICAgIGxvZyAnYXBwLnF1aXQgc2luZ2xlJ1xuICAgICAgICAgICAgICAgIEBhcHAucXVpdCgpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlIGlmIEBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaz8gXG4gICAgICAgICAgICAgICAgaWYgQGFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKClcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5vbiAnc2Vjb25kLWluc3RhbmNlJywgQG9wdC5vbk90aGVySW5zdGFuY2UgPyBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdzaG93QWJvdXQnLCBAc2hvd0Fib3V0XG4gICAgICAgIHBvc3Qub24gJ3F1aXRBcHAnLCAgIEBxdWl0QXBwXG5cbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICAgICAgQGFwcC5vbiAncmVhZHknLCBAb25SZWFkeVxuICAgICAgICBAYXBwLm9uICd3aW5kb3ctYWxsLWNsb3NlZCcsIChldmVudCkgPT4gXG4gICAgICAgICAgICBpZiBub3QgQG9wdC5zaW5nbGVXaW5kb3dcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcXVpdEFwcCgpXG4gICAgICAgIFxuICAgIHJlc29sdmU6IChmaWxlKSA9PiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIGZpbGVcbiAgICBcbiAgICAjMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuICAgICMwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgMDAwMDBcbiAgICAjMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4gICAgXG4gICAgb25SZWFkeTogPT5cbiAgICBcbiAgICAgICAgaWYgQG9wdC50cmF5IHRoZW4gQGluaXRUcmF5KClcbiAgICAgICAgIFxuICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICAgXG4gICAgICAgIEBhcHAuc2V0TmFtZSBAb3B0LnBrZy5uYW1lXG4gICAgXG4gICAgICAgIGlmIG5vdCBhcmdzLm5vcHJlZnNcbiAgICAgICAgICAgIGlmIEBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0IHNob3J0Y3V0OiBAb3B0LnNob3J0Y3V0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJlZnMuaW5pdCgpXG4gICAgXG4gICAgICAgIGlmIHZhbGlkIHByZWZzLmdldCAnc2hvcnRjdXQnXG4gICAgICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KCdzaG9ydGN1dCcpLCBAc2hvd1dpbmRvd1xuICAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLndhdGNoXG4gICAgICAgICAgICBsb2cgJ0FwcC5vblJlYWR5IHN0YXJ0V2F0Y2hlcidcbiAgICAgICAgICAgIEBzdGFydFdhdGNoZXIoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vblNob3dcbiAgICAgICAgICAgIEBvcHQub25TaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuXG4gICAgICAgIHBvc3QuZW1pdCAnYXBwUmVhZHknXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5pdFRyYXk6ID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB0cmF5SW1nID0gQHJlc29sdmUgQG9wdC50cmF5XG4gICAgICAgIEB0cmF5ID0gbmV3IGVsZWN0cm9uLlRyYXkgdHJheUltZ1xuICAgICAgICBAdHJheS5vbiAnY2xpY2snLCBAdG9nZ2xlV2luZG93RnJvbVRyYXlcbiAgICAgICAgXG4gICAgICAgIHRlbXBsYXRlID0gW1xuICAgICAgICAgICAgbGFiZWw6IFwiUXVpdFwiXG4gICAgICAgICAgICBjbGljazogQHF1aXRBcHBcbiAgICAgICAgLFxuICAgICAgICAgICAgbGFiZWw6IFwiQWJvdXRcIlxuICAgICAgICAgICAgY2xpY2s6IEBzaG93QWJvdXRcbiAgICAgICAgLFxuICAgICAgICAgICAgbGFiZWw6IFwiQWN0aXZhdGVcIlxuICAgICAgICAgICAgY2xpY2s6IEB0b2dnbGVXaW5kb3dGcm9tVHJheVxuICAgICAgICBdXG4gICAgICAgICAgICAgXG4gICAgICAgIEB0cmF5LnNldENvbnRleHRNZW51IGVsZWN0cm9uLk1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgdGVtcGxhdGVcblxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2hvd0Fib3V0OiA9PlxuICAgICAgICBcbiAgICAgICAgZGFyayA9ICdkYXJrJyA9PSBwcmVmcy5nZXQgJ3NjaGVtZScsICdkYXJrJ1xuICAgICAgICBhYm91dFxuICAgICAgICAgICAgaW1nOiAgICAgICAgQHJlc29sdmUgQG9wdC5hYm91dFxuICAgICAgICAgICAgY29sb3I6ICAgICAgZGFyayBhbmQgJyMzODM4MzgnIG9yICcjZGRkJ1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMyODI4MjgnIG9yICcjZmZmJ1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiAgZGFyayBhbmQgJyNmZmYnICAgIG9yICcjMDAwJ1xuICAgICAgICAgICAgcGtnOiAgICAgICAgQG9wdC5wa2dcbiAgICAgICAgICAgIGRlYnVnOiAgICAgIEBvcHQuYWJvdXREZWJ1Z1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcXVpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiAnZGVsYXknICE9IEBvcHQub25RdWl0PygpXG4gICAgICAgICAgICBAZXhpdEFwcCgpXG4gICAgICAgICAgICBcbiAgICBleGl0QXBwOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcC5leGl0IDBcbiAgICAgICAgcHJvY2Vzcy5leGl0IDBcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaGlkZURvY2s6ID0+IEBhcHAuZG9jaz8uaGlkZSgpXG4gICAgc2hvd0RvY2s6ID0+IEBhcHAuZG9jaz8uc2hvdygpXG4gICAgICAgIFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIzAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIzAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiAgICBcbiAgICB0b2dnbGVXaW5kb3c6ID0+XG4gICAgICAgICBcbiAgICAgICAgaWYgQHdpbj8uaXNWaXNpYmxlKClcbiAgICAgICAgICAgIEB3aW4uaGlkZSgpXG4gICAgICAgICAgICBAaGlkZURvY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvd1dpbmRvdygpXG5cbiAgICB0b2dnbGVXaW5kb3dGcm9tVHJheTogPT4gQHNob3dXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgc2hvd1dpbmRvdzogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQub25XaWxsU2hvd1dpbj8oKVxuICAgICAgICBcbiAgICAgICAgaWYgQHdpbj9cbiAgICAgICAgICAgIEB3aW4uc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBjcmVhdGVXaW5kb3coKVxuICAgICAgICAgICAgXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjcmVhdGVXaW5kb3c6IChvblJlYWR5VG9TaG93KSA9PlxuICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0ICdib3VuZHMnXG4gICAgICAgIHdpZHRoICA9IGJvdW5kcz8ud2lkdGggID8gQG9wdC53aWR0aCAgPyA1MDBcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzPy5oZWlnaHQgPyBAb3B0LmhlaWdodCA/IDUwMFxuICAgICAgICBcbiAgICAgICAgQHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICBAb3B0Lm1pbldpZHRoICA/IDI1MFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICBAb3B0Lm1pbkhlaWdodCA/IDI1MFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzE4MTgxOCdcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgdHJ1ZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICB0cnVlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIHRydWVcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICAgICAgYXV0b0hpZGVNZW51QmFyOiB0cnVlXG4gICAgICAgICAgICBpY29uOiAgICAgICAgICAgIEByZXNvbHZlIEBvcHQuaWNvbiBcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuICAgIFxuICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBAcmVzb2x2ZSBAb3B0LmluZGV4XG4gICAgICAgIEB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCkgaWYgYXJncy5kZXZ0b29sc1xuICAgICAgICBAd2luLm9uICdyZXNpemUnLCBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdtb3ZlJywgICBAc2F2ZUJvdW5kc1xuICAgICAgICBAd2luLm9uICdjbG9zZWQnLCA9PiBAd2luID0gbnVsbFxuICAgICAgICBAd2luLm9uICdjbG9zZScsICA9PiBAaGlkZURvY2soKVxuICAgICAgICBAd2luLm9uICdyZWFkeS10by1zaG93JywgKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIHdpbiA9IGV2ZW50LnNlbmRlclxuICAgICAgICAgICAgb25SZWFkeVRvU2hvdz8gd2luIFxuICAgICAgICAgICAgd2luLnNob3coKSBcbiAgICAgICAgICAgIHBvc3QuZW1pdCAnd2luUmVhZHknLCB3aW4uaWRcbiAgICAgICAgQHNob3dEb2NrKClcbiAgICAgICAgXG4gICAgICAgIEB3aW5cblxuICAgIHNhdmVCb3VuZHM6ID0+IGlmIEB3aW4/IHRoZW4gcHJlZnMuc2V0ICdib3VuZHMnLCBAd2luLmdldEJvdW5kcygpXG4gICAgc2NyZWVuU2l6ZTogLT4gXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgXG4gICAgICAgIFxuICAgIHN0YXJ0V2F0Y2hlcjogPT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGlyID0gc2xhc2gucmVzb2x2ZSBAb3B0LmRpclxuICAgICAgICBjb25zb2xlLmxvZyAnc3RhcnRXYXRjaGVyJywgQG9wdC5kaXJcbiAgICAgICAgd2F0Y2hlciA9IHdhdGNoLmRpciBAb3B0LmRpclxuICAgICAgICB3YXRjaGVyLm9uICdjaGFuZ2UnLCBAb25TcmNDaGFuZ2VcbiAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InLCAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hlclxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEBvcHQuZGlyc1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2cgJ3N0YXJ0V2F0Y2hlcnMnLCBAb3B0LmRpcnNcbiAgICAgICAgZm9yIGRpciBpbiBAb3B0LmRpcnNcbiAgICAgICAgICAgIHdhdGNoZXIgPSB3YXRjaC5kaXIgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBkaXJcbiAgICAgICAgICAgIHdhdGNoZXIub24gJ2NoYW5nZScsIEBvblNyY0NoYW5nZVxuICAgICAgICAgICAgd2F0Y2hlci5vbiAnZXJyb3InLCAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoZXIgXG4gICAgXG4gICAgc3RvcFdhdGNoZXI6ID0+XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IEB3YXRjaGVyc1xuICAgICAgICBmb3Igd2F0Y2hlciBpbiBAd2F0Y2hlcnNcbiAgICAgICAgICAgIHdhdGNoZXIuY2xvc2UoKVxuICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgIFxuICAgIG9uU3JjQ2hhbmdlOiAoaW5mbykgPT5cbiAgICBcbiAgICAgICAgbG9nIFwib25TcmNDaGFuZ2UgJyN7aW5mby5jaGFuZ2V9J1wiLCBpbmZvLnBhdGhcbiAgICAgICAgaWYgc2xhc2guYmFzZShpbmZvLnBhdGgpID09ICdtYWluJ1xuICAgICAgICAgICAgQHN0b3BXYXRjaGVyKClcbiAgICAgICAgICAgIEBhcHAuZXhpdCAwXG4gICAgICAgICAgICBpZiBwa2cgPSBzbGFzaC5wa2cgQG9wdC5kaXJcbiAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHBrZywgJ25vZGVfbW9kdWxlcydcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiI3twa2d9L25vZGVfbW9kdWxlcy8uYmluL2VsZWN0cm9uIC4gLXdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGN3ZDogICAgICBwa2dcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGlvOiAgICAnaW5oZXJpdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsOiAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBwb3N0LnRvV2lucyAnbWVudUFjdGlvbicsICdSZWxvYWQnXG4gICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFxuICAgICJdfQ==
//# sourceURL=../coffee/app.coffee