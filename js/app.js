(function() {
  /*
   0000000   00000000   00000000   
  000   000  000   000  000   000  
  000000000  00000000   00000000   
  000   000  000        000        
  000   000  000        000        
  */
  var App, _, about, args, childp, empty, error, fs, log, post, prefs, slash, valid, watch;

  ({args, prefs, empty, valid, slash, about, post, watch, childp, fs, error, log, _} = require('./kxk'));

  App = class App {
    constructor(opt) {
      var argl, electron, ref;
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
        var ref, stack, stackTrace, sutil;
        error((ref = err.message) != null ? ref : err);
        // try
        sutil = require('stack-utils');
        stack = new sutil({
          cwd: process.cwd(),
          internals: sutil.nodeInternals()
        });
        stackTrace = stack.captureString();
        // console.log 'stackTrace', stackTrace.split('\n').length, stackTrace
        return log(stackTrace);
      });
      
      // catch err
      // error err.message ? err
      this.watcher = null;
      electron = require('electron');
      this.app = electron.app;
      this.userData = this.app.getPath('userData');
      if (this.opt.tray) {
        log.slog.icon = slash.fileUrl(this.resolve(this.opt.tray));
      }
      argl = "noprefs     don't load preferences      false\ndevtools    open developer tools        false  -D\nwatch       watch sources for changes   false";
      if (this.opt.args) {
        argl = this.opt.args + '\n' + argl;
      }
      args = args.init(argl);
      log('app.args', args);
      if (this.opt.single !== false) {
        if (this.app.makeSingleInstance((ref = this.opt.onOtherInstance) != null ? ref : this.showWindow)) {
          log('app.quit single');
          this.app.quit();
          return;
        }
      }
      post.on('showAbout', this.showAbout);
      post.on('quitApp', this.quitApp);
      this.app.setName(this.opt.pkg.name);
      this.app.on('ready', this.onReady);
      this.app.on('window-all-closed', function(event) {
        return event.preventDefault();
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
        log('App.onReady apply shortcut', prefs.get('shortcut'));
        electron = require('electron');
        electron.globalShortcut.register(prefs.get('shortcut'), this.showWindow);
      }
      log('App.onReady init watch');
      if (args.watch) {
        this.startWatcher();
      }
      if (this.opt.onShow) {
        this.opt.onShow();
      } else {
        this.showWindow();
      }
      post.emit('appReady');
      return log('App.onReady done');
    }

    initTray() {
      var electron, trayImg;
      electron = require('electron');
      trayImg = this.resolve(this.opt.tray);
      this.tray = new electron.Tray(trayImg);
      this.tray.on('click', this.toggleWindowFromTray);
      return this.tray.setContextMenu(electron.Menu.buildFromTemplate([
        {
          label: "Quit",
          click: this.quitApp
        },
        {
          label: "About",
          click: this.showAbout
        }
      ]));
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
      if (this.win != null) {
        this.win.show();
      } else {
        this.createWindow();
      }
      return this.showDock();
    }

    createWindow(onReadyToShow) {
      var bounds, electron, height, ref, ref1, ref2, ref3, ref4, ref5, width;
      log('App.createWindow');
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
        icon: this.resolve(this.opt.icon)
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
      log('App.createWindow done');
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
      this.watcher = watch.watch(this.opt.dir);
      this.watcher.on('change', this.onSrcChange);
      return this.watcher.on('error', function(err) {
        return error(err);
      });
    }

    stopWatcher() {
      if (this.watcher != null) {
        this.watcher.close();
        return this.watcher = null;
      }
    }

    onSrcChange(path) {
      log('onSrcChange', path, this.opt.dir, path.startsWith(this.opt.dir));
      if (slash.file(path) === 'main') {
        this.stopWatcher();
        this.app.exit(0);
        childp.execSync(`${this.opt.dir}/../node_modules/.bin/electron . -w`, {
          cwd: `${this.opt.dir}/..`,
          encoding: 'utf8',
          stdio: 'inherit',
          shell: true
        });
        return process.exit(0);
      } else {
        return post.toWins('menuAction', 'Reload');
      }
    }

  };

  module.exports = App;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9hcHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTs7RUFRQSxDQUFBLENBQUUsSUFBRixFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLEtBQXRCLEVBQTZCLEtBQTdCLEVBQW9DLEtBQXBDLEVBQTJDLElBQTNDLEVBQWlELEtBQWpELEVBQXdELE1BQXhELEVBQWdFLEVBQWhFLEVBQW9FLEtBQXBFLEVBQTJFLEdBQTNFLEVBQWdGLENBQWhGLENBQUEsR0FBc0YsT0FBQSxDQUFRLE9BQVIsQ0FBdEY7O0VBRU0sTUFBTixNQUFBLElBQUE7SUFFSSxXQUFhLElBQUEsQ0FBQTtBQUVULFVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQTtVQTRDSixDQUFBLGNBQUEsQ0FBQSxtQkE1Q0k7Ozs7Ozs7VUFvREosQ0FBQSxjQUFBLENBQUEsbUJBcERJOzs7Ozs7VUEyRkosQ0FBQSxlQUFBLENBQUEsb0JBM0ZJOzs7Ozs7O1VBZ0hKLENBQUEsZ0JBQUEsQ0FBQSxxQkFoSEk7Ozs7Ozs7VUFpSUosQ0FBQSxjQUFBLENBQUE7VUFRQSxDQUFBLGNBQUEsQ0FBQSxtQkF6SUk7Ozs7Ozs7VUFvSkosQ0FBQSxlQUFBLENBQUE7VUFDQSxDQUFBLGVBQUEsQ0FBQSxvQkFySkk7Ozs7Ozs7VUE2SkosQ0FBQSxtQkFBQSxDQUFBO1VBUUEsQ0FBQSwyQkFBQSxDQUFBO1VBRUEsQ0FBQSxpQkFBQSxDQUFBLHNCQXZLSTs7Ozs7OztVQXNMSixDQUFBLG1CQUFBLENBQUE7VUE2Q0EsQ0FBQSxpQkFBQSxDQUFBLHNCQW5PSTs7Ozs7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RyxDQUFDLEdBQXJCLENBQW5DO01BQ0EsSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBQSxLQUFvQixNQUF2QjtRQUNJLElBQUMsQ0FBQSxXQUFELENBQUE7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxDQUFWO1FBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBQSxDQUFBLENBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFSLENBQVksbUNBQVosQ0FBaEIsRUFDSTtVQUFBLEdBQUEsRUFBVSxDQUFBLENBQUEsQ0FBRyxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQVIsQ0FBWSxHQUFaLENBQVY7VUFDQSxRQUFBLEVBQVUsTUFEVjtVQUVBLEtBQUEsRUFBVSxTQUZWO1VBR0EsS0FBQSxFQUFVO1FBSFYsQ0FESjtlQUtBLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYixFQVJKO09BQUEsTUFBQTtlQVVJLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUEwQixRQUExQixFQVZKOztJQUhTOztFQTlQakI7O0VBNlFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdlJqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMjI1xuXG57IGFyZ3MsIHByZWZzLCBlbXB0eSwgdmFsaWQsIHNsYXNoLCBhYm91dCwgcG9zdCwgd2F0Y2gsIGNoaWxkcCwgZnMsIGVycm9yLCBsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBBcHBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwcm9jZXNzLm9uICd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnIpIC0+XHJcbiAgICAgICAgICAgIGVycm9yIGVyci5tZXNzYWdlID8gZXJyXG4gICAgICAgICAgICAjIHRyeVxuICAgICAgICAgICAgc3V0aWwgPSByZXF1aXJlICdzdGFjay11dGlscydcbiAgICAgICAgICAgIHN0YWNrID0gbmV3IHN1dGlsIGN3ZDogcHJvY2Vzcy5jd2QoKSwgaW50ZXJuYWxzOiBzdXRpbC5ub2RlSW50ZXJuYWxzKClcbiAgICAgICAgICAgIHN0YWNrVHJhY2UgPSBzdGFjay5jYXB0dXJlU3RyaW5nKClcbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgJ3N0YWNrVHJhY2UnLCBzdGFja1RyYWNlLnNwbGl0KCdcXG4nKS5sZW5ndGgsIHN0YWNrVHJhY2VcbiAgICAgICAgICAgIGxvZyBzdGFja1RyYWNlIFxuICAgICAgICAgICAgIyBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAjIGVycm9yIGVyci5tZXNzYWdlID8gZXJyXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2hlciA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBAYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgICAgIEB1c2VyRGF0YSA9IEBhcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXlcbiAgICAgICAgICAgIGxvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIEByZXNvbHZlIEBvcHQudHJheSAgXG4gICAgICAgICAgICBcbiAgICAgICAgYXJnbCA9IFwiXCJcIlxuICAgICAgICAgICAgbm9wcmVmcyAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgICAgICAgICBkZXZ0b29scyAgICBvcGVuIGRldmVsb3BlciB0b29scyAgICAgICAgZmFsc2UgIC1EXG4gICAgICAgICAgICB3YXRjaCAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ2wgPSBAb3B0LmFyZ3MgKyAnXFxuJyArIGFyZ2wgaWYgQG9wdC5hcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmluaXQgYXJnbFxuICAgICAgICBcbiAgICAgICAgbG9nICdhcHAuYXJncycsIGFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2luZ2xlICE9IGZhbHNlXG4gICAgICAgICAgICBpZiBAYXBwLm1ha2VTaW5nbGVJbnN0YW5jZSBAb3B0Lm9uT3RoZXJJbnN0YW5jZSA/IEBzaG93V2luZG93XG4gICAgICAgICAgICAgICAgbG9nICdhcHAucXVpdCBzaW5nbGUnXG4gICAgICAgICAgICAgICAgQGFwcC5xdWl0KClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3Nob3dBYm91dCcsIEBzaG93QWJvdXRcbiAgICAgICAgcG9zdC5vbiAncXVpdEFwcCcsICAgQHF1aXRBcHBcblxuICAgICAgICBAYXBwLnNldE5hbWUgQG9wdC5wa2cubmFtZVxuICAgICAgICBAYXBwLm9uICdyZWFkeScsIEBvblJlYWR5XG4gICAgICAgIEBhcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJywgKGV2ZW50KSAtPiBldmVudC5wcmV2ZW50RGVmYXVsdCgpICAgICAgICBcbiAgICAgICAgXG4gICAgcmVzb2x2ZTogKGZpbGUpID0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgZmlsZVxuICAgIFxuICAgICMwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAwMDAwMFxuICAgICMwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiAgICBcbiAgICBvblJlYWR5OiA9PlxuICAgIFxuICAgICAgICBpZiBAb3B0LnRyYXkgdGhlbiBAaW5pdFRyYXkoKVxuICAgICAgICAgXG4gICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgICBcbiAgICAgICAgQGFwcC5zZXROYW1lIEBvcHQucGtnLm5hbWVcbiAgICBcbiAgICAgICAgaWYgbm90IGFyZ3Mubm9wcmVmc1xuICAgICAgICAgICAgaWYgQG9wdC5zaG9ydGN1dFxuICAgICAgICAgICAgICAgIHByZWZzLmluaXQgc2hvcnRjdXQ6IEBvcHQuc2hvcnRjdXRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmVmcy5pbml0KClcbiAgICBcbiAgICAgICAgaWYgdmFsaWQgcHJlZnMuZ2V0ICdzaG9ydGN1dCdcbiAgICAgICAgICAgIGxvZyAnQXBwLm9uUmVhZHkgYXBwbHkgc2hvcnRjdXQnLCBwcmVmcy5nZXQoJ3Nob3J0Y3V0JylcbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBwcmVmcy5nZXQoJ3Nob3J0Y3V0JyksIEBzaG93V2luZG93XG4gICAgICAgICAgICAgXG4gICAgICAgIGxvZyAnQXBwLm9uUmVhZHkgaW5pdCB3YXRjaCdcbiAgICAgICAgXG4gICAgICAgIGlmIGFyZ3Mud2F0Y2hcbiAgICAgICAgICAgIEBzdGFydFdhdGNoZXIoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vblNob3dcbiAgICAgICAgICAgIEBvcHQub25TaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dXaW5kb3coKVxuXG4gICAgICAgIHBvc3QuZW1pdCAnYXBwUmVhZHknXG4gICAgICAgIFxuICAgICAgICBsb2cgJ0FwcC5vblJlYWR5IGRvbmUnXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluaXRUcmF5OiA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgdHJheUltZyA9IEByZXNvbHZlIEBvcHQudHJheVxuICAgICAgICBAdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IHRyYXlJbWdcbiAgICAgICAgQHRyYXkub24gJ2NsaWNrJywgQHRvZ2dsZVdpbmRvd0Zyb21UcmF5XG4gICAgICAgICAgICAgXG4gICAgICAgIEB0cmF5LnNldENvbnRleHRNZW51IGVsZWN0cm9uLk1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgW1xuICAgICAgICAgICAgbGFiZWw6IFwiUXVpdFwiXG4gICAgICAgICAgICBjbGljazogQHF1aXRBcHBcbiAgICAgICAgLFxuICAgICAgICAgICAgbGFiZWw6IFwiQWJvdXRcIlxuICAgICAgICAgICAgY2xpY2s6IEBzaG93QWJvdXRcbiAgICAgICAgXVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2hvd0Fib3V0OiA9PlxuICAgICAgICBcbiAgICAgICAgZGFyayA9ICdkYXJrJyA9PSBwcmVmcy5nZXQgJ3NjaGVtZScsICdkYXJrJ1xuICAgICAgICBhYm91dFxuICAgICAgICAgICAgaW1nOiAgICAgICAgQHJlc29sdmUgQG9wdC5hYm91dFxuICAgICAgICAgICAgY29sb3I6ICAgICAgZGFyayBhbmQgJyMzODM4MzgnIG9yICcjZGRkJ1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMyODI4MjgnIG9yICcjZmZmJ1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiAgZGFyayBhbmQgJyNmZmYnICAgIG9yICcjMDAwJ1xuICAgICAgICAgICAgcGtnOiAgICAgICAgQG9wdC5wa2dcbiAgICAgICAgICAgIGRlYnVnOiAgICAgIEBvcHQuYWJvdXREZWJ1Z1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcXVpdEFwcDogPT5cbiAgICAgICAgXG4gICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgIEBzYXZlQm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIGlmICdkZWxheScgIT0gQG9wdC5vblF1aXQ/KClcbiAgICAgICAgICAgIEBleGl0QXBwKClcbiAgICAgICAgICAgIFxuICAgIGV4aXRBcHA6ID0+XG4gICAgICAgIFxuICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBoaWRlRG9jazogPT4gQGFwcC5kb2NrPy5oaWRlKClcbiAgICBzaG93RG9jazogPT4gQGFwcC5kb2NrPy5zaG93KClcbiAgICAgICAgXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIzAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuICAgIFxuICAgIHRvZ2dsZVdpbmRvdzogPT5cbiAgICAgICAgIFxuICAgICAgICBpZiBAd2luPy5pc1Zpc2libGUoKVxuICAgICAgICAgICAgQHdpbi5oaWRlKClcbiAgICAgICAgICAgIEBoaWRlRG9jaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzaG93V2luZG93KClcblxuICAgIHRvZ2dsZVdpbmRvd0Zyb21UcmF5OiA9PiBAc2hvd1dpbmRvdygpXG4gICAgICAgICAgICBcbiAgICBzaG93V2luZG93OiA9PlxuICAgICAgICAgXG4gICAgICAgIGlmIEB3aW4/XG4gICAgICAgICAgICBAd2luLnNob3coKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY3JlYXRlV2luZG93KClcbiAgICAgICAgICAgIFxuICAgICAgICBAc2hvd0RvY2soKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY3JlYXRlV2luZG93OiAob25SZWFkeVRvU2hvdykgPT5cbiAgICBcbiAgICAgICAgbG9nICdBcHAuY3JlYXRlV2luZG93J1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCAnYm91bmRzJ1xuICAgICAgICB3aWR0aCAgPSBib3VuZHM/LndpZHRoICA/IEBvcHQud2lkdGggID8gNTAwXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcz8uaGVpZ2h0ID8gQG9wdC5oZWlnaHQgPyA1MDBcbiAgICAgICAgXG4gICAgICAgIEB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgIG1pbldpZHRoOiAgICAgICAgQG9wdC5taW5XaWR0aCAgPyAyNTBcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAgQG9wdC5taW5IZWlnaHQgPyAyNTBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMxODE4MTgnXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgIHRydWVcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgdHJ1ZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICB0cnVlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgIHRydWVcbiAgICAgICAgICAgIGF1dG9IaWRlTWVudUJhcjogdHJ1ZVxuICAgICAgICAgICAgaWNvbjogICAgICAgICAgICBAcmVzb2x2ZSBAb3B0Lmljb24gXG4gICAgXG4gICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55IGlmIGJvdW5kcz9cbiAgICBcbiAgICAgICAgQHdpbi5sb2FkVVJMIHNsYXNoLmZpbGVVcmwgQHJlc29sdmUgQG9wdC5pbmRleFxuICAgICAgICBAd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpIGlmIGFyZ3MuZGV2dG9vbHNcbiAgICAgICAgQHdpbi5vbiAncmVzaXplJywgQHNhdmVCb3VuZHNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScsICAgQHNhdmVCb3VuZHNcbiAgICAgICAgQHdpbi5vbiAnY2xvc2VkJywgPT4gQHdpbiA9IG51bGxcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnLCAgPT4gQGhpZGVEb2NrKClcbiAgICAgICAgQHdpbi5vbiAncmVhZHktdG8tc2hvdycsIChldmVudCkgPT4gXG4gICAgICAgICAgICB3aW4gPSBldmVudC5zZW5kZXJcbiAgICAgICAgICAgIG9uUmVhZHlUb1Nob3c/IHdpbiBcbiAgICAgICAgICAgIHdpbi5zaG93KCkgXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ3dpblJlYWR5Jywgd2luLmlkXG4gICAgICAgIEBzaG93RG9jaygpXG4gICAgICAgIFxuICAgICAgICBsb2cgJ0FwcC5jcmVhdGVXaW5kb3cgZG9uZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpblxuXG4gICAgc2F2ZUJvdW5kczogPT4gaWYgQHdpbj8gdGhlbiBwcmVmcy5zZXQgJ2JvdW5kcycsIEB3aW4uZ2V0Qm91bmRzKClcbiAgICBzY3JlZW5TaXplOiAtPiBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAgICAgXG4gICAgc3RhcnRXYXRjaGVyOiA9PlxuICAgICAgICAgXG4gICAgICAgIEB3YXRjaGVyID0gd2F0Y2gud2F0Y2ggQG9wdC5kaXJcbiAgICAgICAgQHdhdGNoZXIub24gJ2NoYW5nZScsIEBvblNyY0NoYW5nZVxuICAgICAgICBAd2F0Y2hlci5vbiAnZXJyb3InLCAoZXJyKSAtPiBlcnJvciBlcnJcbiAgICBcbiAgICBzdG9wV2F0Y2hlcjogPT5cbiAgICAgICAgIFxuICAgICAgICBpZiBAd2F0Y2hlcj9cbiAgICAgICAgICAgIEB3YXRjaGVyLmNsb3NlKClcbiAgICAgICAgICAgIEB3YXRjaGVyID0gbnVsbFxuICAgIFxuICAgIG9uU3JjQ2hhbmdlOiAocGF0aCkgPT5cbiAgICBcbiAgICAgICAgbG9nICdvblNyY0NoYW5nZScsIHBhdGgsIEBvcHQuZGlyLCBwYXRoLnN0YXJ0c1dpdGggQG9wdC5kaXJcbiAgICAgICAgaWYgc2xhc2guZmlsZShwYXRoKSA9PSAnbWFpbidcbiAgICAgICAgICAgIEBzdG9wV2F0Y2hlcigpXG4gICAgICAgICAgICBAYXBwLmV4aXQgMFxuICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiI3tAb3B0LmRpcn0vLi4vbm9kZV9tb2R1bGVzLy5iaW4vZWxlY3Ryb24gLiAtd1wiLFxuICAgICAgICAgICAgICAgIGN3ZDogICAgICBcIiN7QG9wdC5kaXJ9Ly4uXCJcbiAgICAgICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnXG4gICAgICAgICAgICAgICAgc3RkaW86ICAgICdpbmhlcml0J1xuICAgICAgICAgICAgICAgIHNoZWxsOiAgICB0cnVlXG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvV2lucyAnbWVudUFjdGlvbicsICdSZWxvYWQnXG4gICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFxuICAgICJdfQ==
//# sourceURL=../coffee/app.coffee