(function() {
  /*
  00     00   0000000   000  000   000
  000   000  000   000  000  0000  000
  000000000  000000000  000  000 0 000
  000 0 000  000   000  000  000  0000
  000   000  000   000  000  000   000
  */
  var BrowserWindow, Menu, Tray, _, about, app, args, childp, createWindow, debug, electron, empty, error, fs, karg, log, onSrcChange, pkg, post, prefs, quitApp, saveBounds, sel, showAbout, showWindow, slash, startWatcher, stopWatcher, toggleWindow, tray, watch, watcher, win;

  ({args, prefs, empty, slash, about, karg, post, watch, childp, fs, log, error, _} = require('kxk'));

  electron = require('electron');

  pkg = require('../package.json');

  app = electron.app;

  BrowserWindow = electron.BrowserWindow;

  Tray = electron.Tray;

  Menu = electron.Menu;

  sel = null;

  win = null;

  tray = null;

  debug = false;

  //  0000000   00000000    0000000    0000000
  // 000   000  000   000  000        000
  // 000000000  0000000    000  0000  0000000
  // 000   000  000   000  000   000       000
  // 000   000  000   000   0000000   0000000
  args = args.init("\nnoprefs         don't load preferences      false\nDevTools        open developer tools        false\nwatch           watch sources for changes   false\n");

  if (args == null) {
    app.exit(0);
  }

  // 00000000    0000000    0000000  000000000  
  // 000   000  000   000  000          000     
  // 00000000   000   000  0000000      000     
  // 000        000   000       000     000     
  // 000         0000000   0000000      000     
  post.on('showAbout', function() {
    return showAbout();
  });

  post.on('quitApp', function() {
    return quitApp();
  });

  //000   000  000  000   000  0000000     0000000   000   000
  //000 0 000  000  0000  000  000   000  000   000  000 0 000
  //000000000  000  000 0 000  000   000  000   000  000000000
  //000   000  000  000  0000  000   000  000   000  000   000
  //00     00  000  000   000  0000000     0000000   00     00
  toggleWindow = function() {
    var ref;
    if (win != null ? win.isVisible() : void 0) {
      win.hide();
      return (ref = app.dock) != null ? ref.hide() : void 0;
    } else {
      return showWindow();
    }
  };

  showWindow = function() {
    var ref;
    if (win != null) {
      win.show();
    } else {
      createWindow();
    }
    return (ref = app.dock) != null ? ref.show() : void 0;
  };

  createWindow = function() {
    var bounds, ref;
    win = new BrowserWindow({
      width: 474,
      height: 900,
      minWidth: 474,
      minHeight: 600,
      backgroundColor: '#181818',
      fullscreen: false,
      show: false,
      frame: false,
      resizable: true, // false
      maximizable: true,
      minimizable: true,
      transparent: true,
      autoHideMenuBar: true,
      icon: slash.path(__dirname + '/../img/app.ico')
    });
    bounds = prefs.get('bounds');
    if (bounds != null) {
      win.setPosition(bounds.x, bounds.y);
    }
    win.loadURL(`file://${__dirname}/index.html`);
    if (args.DevTools) {
      win.webContents.openDevTools();
    }
    win.on('closed', function() {
      return win = null;
    });
    win.on('resize', saveBounds);
    win.on('move', saveBounds);
    win.on('close', function() {
      var ref;
      return (ref = app.dock) != null ? ref.hide() : void 0;
    });
    win.on('ready-to-show', function() {
      return win.show();
    });
    if ((ref = app.dock) != null) {
      ref.show();
    }
    return win;
  };

  saveBounds = function() {
    if (win != null) {
      return prefs.set('bounds', win.getBounds());
    }
  };

  showAbout = function() {
    var dark;
    dark = 'dark' === prefs.get('scheme', 'dark');
    return about({
      img: `${__dirname}/../img/about.png`,
      color: dark && '#383838' || '#ddd',
      background: dark && '#282828' || '#fff',
      highlight: dark && '#fff' || '#000',
      pkg: pkg
    });
  };

  quitApp = function() {
    stopWatcher();
    saveBounds();
    app.exit(0);
    return process.exit(0);
  };

  app.on('window-all-closed', function(event) {
    return event.preventDefault();
  });

  // 000   000   0000000   000000000   0000000  000   000  00000000  00000000     
  // 000 0 000  000   000     000     000       000   000  000       000   000    
  // 000000000  000000000     000     000       000000000  0000000   0000000      
  // 000   000  000   000     000     000       000   000  000       000   000    
  // 00     00  000   000     000      0000000  000   000  00000000  000   000    
  watcher = null;

  startWatcher = function() {
    watcher = watch.watch(__dirname);
    watcher.on('change', onSrcChange);
    return watcher.on('error', function(err) {
      return error(err);
    });
  };

  stopWatcher = function() {
    if (watcher != null) {
      watcher.close();
      return watcher = null;
    }
  };

  onSrcChange = function(path) {
    if (path === __filename) {
      stopWatcher();
      app.exit(0);
      childp.execSync(`${__dirname}/../node_modules/.bin/electron . -w`, {
        cwd: `${__dirname}/..`,
        encoding: 'utf8',
        stdio: 'inherit',
        shell: true
      });
      return process.exit(0);
    } else {
      return post.toWins('reload');
    }
  };

  
  //00000000   00000000   0000000   0000000    000   000
  //000   000  000       000   000  000   000   000 000
  //0000000    0000000   000000000  000   000    00000
  //000   000  000       000   000  000   000     000
  //000   000  00000000  000   000  0000000       000
  app.on('ready', function() {
    var ref;
    tray = new Tray(`${__dirname}/../img/menu.png`);
    tray.on('click', toggleWindow);
    tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: "Quit",
        click: function() {
          app.exit(0);
          return process.exit(0);
        }
      },
      {
        label: "About",
        click: showAbout
      }
    ]));
    if ((ref = app.dock) != null) {
      ref.hide();
    }
    app.setName(pkg.name);
    if (!args.noprefs) {
      prefs.init({
        shortcut: 'CmdOrCtrl+Alt+C'
      });
    }
    electron.globalShortcut.register(prefs.get('shortcut'), showWindow);
    showWindow();
    if (args.watch) {
      return startWatcher();
    }
  });

  app.setName(pkg.name);

  if (app.makeSingleInstance(showWindow)) {
    app.quit();
    return;
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXMiOlsiY29mZmVlL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLElBQUYsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixFQUE2QixLQUE3QixFQUFvQyxJQUFwQyxFQUEwQyxJQUExQyxFQUFnRCxLQUFoRCxFQUF1RCxNQUF2RCxFQUErRCxFQUEvRCxFQUFtRSxHQUFuRSxFQUF3RSxLQUF4RSxFQUErRSxDQUEvRSxDQUFBLEdBQXFGLE9BQUEsQ0FBUSxLQUFSLENBQXJGOztFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLEdBQUEsR0FBZ0IsUUFBUSxDQUFDOztFQUN6QixhQUFBLEdBQWdCLFFBQVEsQ0FBQzs7RUFDekIsSUFBQSxHQUFnQixRQUFRLENBQUM7O0VBQ3pCLElBQUEsR0FBZ0IsUUFBUSxDQUFDOztFQUN6QixHQUFBLEdBQWdCOztFQUNoQixHQUFBLEdBQWdCOztFQUNoQixJQUFBLEdBQWdCOztFQUNoQixLQUFBLEdBQWdCLE1BcEJoQjs7Ozs7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QUlBLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBeEIsQ0FBaUMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFWLENBQWpDLEVBQXdELFVBQXhEO0lBRUEsVUFBQSxDQUFBO0lBRUEsSUFBRyxJQUFJLENBQUMsS0FBUjthQUNJLFlBQUEsQ0FBQSxFQURKOztFQXpCWSxDQUFoQjs7RUE0QkEsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUFHLENBQUMsSUFBaEI7O0VBRUEsSUFBRyxHQUFHLENBQUMsa0JBQUosQ0FBdUIsVUFBdkIsQ0FBSDtJQUNJLEdBQUcsQ0FBQyxJQUFKLENBQUE7QUFDQSxXQUZKOztBQS9MQSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGFyZ3MsIHByZWZzLCBlbXB0eSwgc2xhc2gsIGFib3V0LCBrYXJnLCBwb3N0LCB3YXRjaCwgY2hpbGRwLCBmcywgbG9nLCBlcnJvciwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xucGtnICAgICAgPSByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG5cbmFwcCAgICAgICAgICAgPSBlbGVjdHJvbi5hcHBcbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5UcmF5ICAgICAgICAgID0gZWxlY3Ryb24uVHJheVxuTWVudSAgICAgICAgICA9IGVsZWN0cm9uLk1lbnVcbnNlbCAgICAgICAgICAgPSBudWxsXG53aW4gICAgICAgICAgID0gbnVsbFxudHJheSAgICAgICAgICA9IG51bGxcbmRlYnVnICAgICAgICAgPSBmYWxzZVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuYXJncyAgPSBhcmdzLmluaXQgXCJcIlwiXG5cbiAgICBub3ByZWZzICAgICAgICAgZG9uJ3QgbG9hZCBwcmVmZXJlbmNlcyAgICAgIGZhbHNlXG4gICAgRGV2VG9vbHMgICAgICAgIG9wZW4gZGV2ZWxvcGVyIHRvb2xzICAgICAgICBmYWxzZVxuICAgIHdhdGNoICAgICAgICAgICB3YXRjaCBzb3VyY2VzIGZvciBjaGFuZ2VzICAgZmFsc2VcblxuXCJcIlwiXG5cbmFwcC5leGl0IDAgaWYgbm90IGFyZ3M/XG5cbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG5cbnBvc3Qub24gJ3Nob3dBYm91dCcsICAgICAgICAgICAgLT4gc2hvd0Fib3V0KClcbnBvc3Qub24gJ3F1aXRBcHAnLCAgICAgICAgICAgICAgLT4gcXVpdEFwcCgpXG5cbiMwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIzAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuXG50b2dnbGVXaW5kb3cgPSAtPlxuICAgIFxuICAgIGlmIHdpbj8uaXNWaXNpYmxlKClcbiAgICAgICAgd2luLmhpZGUoKVxuICAgICAgICBhcHAuZG9jaz8uaGlkZSgpXG4gICAgZWxzZVxuICAgICAgICBzaG93V2luZG93KClcblxuc2hvd1dpbmRvdyA9IC0+XG4gICAgXG4gICAgaWYgd2luP1xuICAgICAgICB3aW4uc2hvdygpXG4gICAgZWxzZVxuICAgICAgICBjcmVhdGVXaW5kb3coKVxuICAgIGFwcC5kb2NrPy5zaG93KClcblxuY3JlYXRlV2luZG93ID0gLT5cblxuICAgIHdpbiA9IG5ldyBCcm93c2VyV2luZG93XG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgNDc0XG4gICAgICAgIGhlaWdodDogICAgICAgICAgOTAwXG4gICAgICAgIG1pbldpZHRoOiAgICAgICAgNDc0XG4gICAgICAgIG1pbkhlaWdodDogICAgICAgNjAwXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMxODE4MTgnXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgc2hvdzogICAgICAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgdHJ1ZSAjIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgdHJ1ZVxuICAgICAgICBtaW5pbWl6YWJsZTogICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogdHJ1ZVxuICAgICAgICBpY29uOiAgICAgICAgICAgIHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9pbWcvYXBwLmljbydcblxuICAgIGJvdW5kcyA9IHByZWZzLmdldCAnYm91bmRzJ1xuICAgIHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgaWYgYm91bmRzP1xuXG4gICAgd2luLmxvYWRVUkwgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9L2luZGV4Lmh0bWxcIlxuICAgIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKSBpZiBhcmdzLkRldlRvb2xzXG4gICAgd2luLm9uICdjbG9zZWQnLCAtPiB3aW4gPSBudWxsXG4gICAgd2luLm9uICdyZXNpemUnLCBzYXZlQm91bmRzXG4gICAgd2luLm9uICdtb3ZlJywgc2F2ZUJvdW5kc1xuICAgIHdpbi5vbiAnY2xvc2UnLCAgLT4gYXBwLmRvY2s/LmhpZGUoKVxuICAgIHdpbi5vbiAncmVhZHktdG8tc2hvdycsIC0+IHdpbi5zaG93KClcbiAgICBhcHAuZG9jaz8uc2hvdygpXG4gICAgd2luXG5cbnNhdmVCb3VuZHMgPSAtPiBpZiB3aW4/IHRoZW4gcHJlZnMuc2V0ICdib3VuZHMnLCB3aW4uZ2V0Qm91bmRzKClcblxuc2hvd0Fib3V0ID0gLT5cbiAgICBcbiAgICBkYXJrID0gJ2RhcmsnID09IHByZWZzLmdldCAnc2NoZW1lJywgJ2RhcmsnXG4gICAgYWJvdXRcbiAgICAgICAgaW1nOiAgICAgICAgXCIje19fZGlybmFtZX0vLi4vaW1nL2Fib3V0LnBuZ1wiXG4gICAgICAgIGNvbG9yOiAgICAgIGRhcmsgYW5kICcjMzgzODM4JyBvciAnI2RkZCdcbiAgICAgICAgYmFja2dyb3VuZDogZGFyayBhbmQgJyMyODI4MjgnIG9yICcjZmZmJ1xuICAgICAgICBoaWdobGlnaHQ6ICBkYXJrIGFuZCAnI2ZmZicgICAgb3IgJyMwMDAnXG4gICAgICAgIHBrZzogICAgICAgIHBrZ1xuXG5xdWl0QXBwID0gLT5cbiAgICBcbiAgICBzdG9wV2F0Y2hlcigpXG4gICAgc2F2ZUJvdW5kcygpXG4gICAgYXBwLmV4aXQgMFxuICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgICAgIFxuYXBwLm9uICd3aW5kb3ctYWxsLWNsb3NlZCcsIChldmVudCkgLT4gZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4jIDAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgXG5cbndhdGNoZXIgPSBudWxsXG5cbnN0YXJ0V2F0Y2hlciA9IC0+XG4gICAgXG4gICAgd2F0Y2hlciA9IHdhdGNoLndhdGNoIF9fZGlybmFtZVxuICAgIHdhdGNoZXIub24gJ2NoYW5nZScsIG9uU3JjQ2hhbmdlXG4gICAgd2F0Y2hlci5vbiAnZXJyb3InLCAoZXJyKSAtPiBlcnJvciBlcnJcblxuc3RvcFdhdGNoZXIgPSAtPiBcbiAgICBcbiAgICBpZiB3YXRjaGVyP1xuICAgICAgICB3YXRjaGVyLmNsb3NlKClcbiAgICAgICAgd2F0Y2hlciA9IG51bGxcblxub25TcmNDaGFuZ2UgPSAocGF0aCkgLT5cblxuICAgIGlmIHBhdGggPT0gX19maWxlbmFtZVxuICAgICAgICBzdG9wV2F0Y2hlcigpXG4gICAgICAgIGFwcC5leGl0IDBcbiAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiI3tfX2Rpcm5hbWV9Ly4uL25vZGVfbW9kdWxlcy8uYmluL2VsZWN0cm9uIC4gLXdcIixcbiAgICAgICAgICAgIGN3ZDogICAgICBcIiN7X19kaXJuYW1lfS8uLlwiXG4gICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnXG4gICAgICAgICAgICBzdGRpbzogICAgJ2luaGVyaXQnXG4gICAgICAgICAgICBzaGVsbDogICAgdHJ1ZVxuICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgIGVsc2VcbiAgICAgICAgcG9zdC50b1dpbnMgJ3JlbG9hZCdcbiAgICAgICAgXG4jMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuIzAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuIzAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwXG4jMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIzAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcblxuYXBwLm9uICdyZWFkeScsIC0+XG5cbiAgICB0cmF5ID0gbmV3IFRyYXkgXCIje19fZGlybmFtZX0vLi4vaW1nL21lbnUucG5nXCJcbiAgICB0cmF5Lm9uICdjbGljaycsIHRvZ2dsZVdpbmRvd1xuICAgICAgICBcbiAgICB0cmF5LnNldENvbnRleHRNZW51IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgW1xuICAgICAgICBsYWJlbDogXCJRdWl0XCJcbiAgICAgICAgY2xpY2s6IC0+IGFwcC5leGl0IDA7IHByb2Nlc3MuZXhpdCAwXG4gICAgLFxuICAgICAgICBsYWJlbDogXCJBYm91dFwiXG4gICAgICAgIGNsaWNrOiBzaG93QWJvdXRcbiAgICBdXG4gICAgXG4gICAgYXBwLmRvY2s/LmhpZGUoKVxuICAgIFxuICAgIGFwcC5zZXROYW1lIHBrZy5uYW1lXG5cbiAgICBpZiBub3QgYXJncy5ub3ByZWZzXG4gICAgICAgIHByZWZzLmluaXRcbiAgICAgICAgICAgIHNob3J0Y3V0OiAnQ21kT3JDdHJsK0FsdCtDJ1xuXG4gICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KCdzaG9ydGN1dCcpLCBzaG93V2luZG93XG5cbiAgICBzaG93V2luZG93KClcbiAgICBcbiAgICBpZiBhcmdzLndhdGNoXG4gICAgICAgIHN0YXJ0V2F0Y2hlcigpXG5cbmFwcC5zZXROYW1lIHBrZy5uYW1lXHIgICAgICAgIFxuICAgICAgICBcbmlmIGFwcC5tYWtlU2luZ2xlSW5zdGFuY2Ugc2hvd1dpbmRvd1xuICAgIGFwcC5xdWl0KClcbiAgICByZXR1cm5cbiJdfQ==
//# sourceURL=C:/Users/kodi/s/kxk/coffee/main.coffee