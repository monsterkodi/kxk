(function() {
  /*
  00000000    0000000    0000000  000000000    
  000   000  000   000  000          000       
  00000000   000   000  0000000      000       
  000        000   000       000     000       
  000         0000000   0000000      000       
  */
  var Emitter, POST, PostMain, PostRenderer, _, electron, remote,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
    indexOf = [].indexOf;

  _ = require('lodash');

  Emitter = require('events');

  POST = '__POST__';

  if (process.type === 'renderer') {
    electron = require('electron');
    remote = electron.remote;
    
    // 000   000  000  000   000    
    // 000 0 000  000  0000  000    
    // 000000000  000  000 0 000    
    // 000   000  000  000  0000    
    // 00     00  000  000   000    
    PostRenderer = class PostRenderer extends Emitter {
      constructor() {
        super();
        this.dispose = this.dispose.bind(this);
        this.dbg = false;
        this.id = remote.getCurrentWindow().id;
        this.ipc = electron.ipcRenderer;
        this.ipc.on(POST, (event, type, argl) => {
          return this.emit.apply(this, [type].concat(argl));
        });
        window.addEventListener('beforeunload', this.dispose);
      }

      dispose() {
        boundMethodCheck(this, PostRenderer);
        window.removeEventListener('beforeunload', this.dispose);
        this.ipc.removeAllListeners(POST);
        return this.ipc = null;
      }

      toAll(type, ...args) {
        return this.send('toAll', type, args);
      }

      toOthers(type, ...args) {
        return this.send('toOthers', type, args, this.id);
      }

      toMain(type, ...args) {
        return this.send('toMain', type, args);
      }

      toOtherWins(type, ...args) {
        return this.send('toOtherWins', type, args, this.id);
      }

      toWins(type, ...args) {
        return this.send('toWins', type, args);
      }

      toWin(id, type, ...args) {
        return this.send('toWin', type, args, id);
      }

      get(type, ...args) {
        return this.ipc.sendSync(POST, 'get', type, args);
      }

      debug(dbg = ['emit', 'toAll', 'toOthers', 'toMain', 'toOtherWins', 'toWins', 'toWin']) {
        this.dbg = dbg;
        return console.log(`post.debug id:${this.id}`, this.dbg);
      }

      emit(type, ...args) {
        if (indexOf.call(this.dbg, 'emit') >= 0) {
          console.log(`post.emit ${type}`, args.map(function(a) {
            return new String(a);
          }).join(' '));
        }
        return super.emit(...arguments);
      }

      send(receivers, type, args, id) {
        if (indexOf.call(this.dbg, receivers) >= 0) {
          console.log(`post.${receivers} ${type}`, args.map(function(a) {
            return new String(a);
          }).join(' '));
        }
        return this.ipc.send(POST, receivers, type, args, id);
      }

    };
    module.exports = new PostRenderer();
  } else {
    // 00     00   0000000   000  000   000  
    // 000   000  000   000  000  0000  000  
    // 000000000  000000000  000  000 0 000  
    // 000 0 000  000   000  000  000  0000  
    // 000   000  000   000  000  000   000  
    PostMain = class PostMain extends Emitter {
      constructor() {
        var ipc;
        super();
        this.getCallbacks = {};
        try {
          ipc = require('electron').ipcMain;
          ipc.on(POST, (event, kind, type, argl, id) => {
            var retval;
            id = id || event.sender.id;
            switch (kind) {
              case 'toMain':
                return this.sendToMain(type, argl);
              case 'toAll':
                return this.sendToWins(type, argl).sendToMain(type, argl);
              case 'toOthers':
                return this.sendToWins(type, argl, id).sendToMain(type, argl);
              case 'toOtherWins':
                return this.sendToWins(type, argl, id);
              case 'toWins':
                return this.sendToWins(type, argl);
              case 'toWin':
                if (this.dbg) {
                  console.log('to win', id, type, argl);
                }
                return this.toWin.apply(this, [id, type].concat(argl));
              case 'get':
                if (this.dbg) {
                  console.log('post get', type, argl, this.getCallbacks[type]);
                }
                if (_.isFunction(this.getCallbacks[type])) {
                  retval = this.getCallbacks[type].apply(this.getCallbacks[type], argl);
                  return event.returnValue = retval != null ? retval : [];
                }
            }
          });
        } catch (error) {}
      }

      toAll(type, ...args) {
        return this.sendToWins(type, args).sendToMain(type, args);
      }

      toMain(type, ...args) {
        return this.sendToMain(type, args);
      }

      toWins(type, ...args) {
        return this.sendToWins(type, args);
      }

      toWin(id, type, ...args) {
        var ref;
        return (ref = require('electron').BrowserWindow.fromId(id)) != null ? ref.webContents.send(POST, type, args) : void 0;
      }

      onGet(type, cb) {
        this.getCallbacks[type] = cb;
        return this;
      }

      sendToMain(type, argl) {
        if (this.dbg) {
          console.log("post to main", type, argl);
        }
        argl.unshift(type);
        this.emit.apply(this, argl);
        return this;
      }

      sendToWins(type, argl, except) {
        var i, len, ref, win;
        ref = require('electron').BrowserWindow.getAllWindows();
        for (i = 0, len = ref.length; i < len; i++) {
          win = ref[i];
          if (win.id !== except) {
            if (this.dbg) {
              console.log(`post to ${win.id} ${type //, argl.map((a) -> new String(a)).join ' '
}`);
            }
            win.webContents.send(POST, type, argl);
          }
        }
        return this;
      }

      debug(dbg = true) {
        this.dbg = dbg;
        return console.log("post.debug", this.dbg);
      }

    };
    module.exports = new PostMain();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9wcG9zdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQTtJQUFBOzs7RUFRQSxDQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0VBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztFQUNWLElBQUEsR0FBVTs7RUFFVixJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0lBRUksUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO0lBQ1gsTUFBQSxHQUFXLFFBQVEsQ0FBQyxPQURwQjs7Ozs7OztJQVNNLGVBQU4sTUFBQSxhQUFBLFFBQTJCLFFBQTNCO01BRUksV0FBYSxDQUFBLENBQUE7O1lBUWIsQ0FBQSxjQUFBLENBQUE7UUFOSSxJQUFDLENBQUEsR0FBRCxHQUFPO1FBQ1AsSUFBQyxDQUFBLEVBQUQsR0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDO1FBQ2pDLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLElBQVIsRUFBYyxDQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsSUFBZCxDQUFBLEdBQUE7aUJBQXVCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVosRUFBZSxDQUFDLElBQUQsQ0FBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkLENBQWY7UUFBdkIsQ0FBZDtRQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixjQUF4QixFQUF3QyxJQUFDLENBQUEsT0FBekM7TUFOUzs7TUFRYixPQUFTLENBQUEsQ0FBQTsrQkFWUDtRQVdFLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixjQUEzQixFQUEyQyxJQUFDLENBQUEsT0FB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MDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICBcbjAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgIFxuIyMjXG5cbl8gICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5FbWl0dGVyID0gcmVxdWlyZSAnZXZlbnRzJ1xuUE9TVCAgICA9ICdfX1BPU1RfXydcblxuaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcblxuICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgcmVtb3RlICAgPSBlbGVjdHJvbi5yZW1vdGVcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgIFxuXG4gICAgY2xhc3MgUG9zdFJlbmRlcmVyIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICAgICAgc3VwZXIoKVxuICAgICAgICAgICAgQGRiZyA9IGZhbHNlXG4gICAgICAgICAgICBAaWQgID0gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5pZFxuICAgICAgICAgICAgQGlwYyA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyXG4gICAgICAgICAgICBAaXBjLm9uIFBPU1QsIChldmVudCwgdHlwZSwgYXJnbCkgPT4gQGVtaXQuYXBwbHkgQCwgW3R5cGVdLmNvbmNhdCBhcmdsXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnYmVmb3JldW5sb2FkJywgQGRpc3Bvc2VcblxuICAgICAgICBkaXNwb3NlOiAoKSA9PlxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2JlZm9yZXVubG9hZCcsIEBkaXNwb3NlXG4gICAgICAgICAgICBAaXBjLnJlbW92ZUFsbExpc3RlbmVycyBQT1NUXG4gICAgICAgICAgICBAaXBjID0gbnVsbFxuXG4gICAgICAgIHRvQWxsOiAgICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvQWxsJywgICAgICAgdHlwZSwgYXJnc1xuICAgICAgICB0b090aGVyczogICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b090aGVycycsICAgIHR5cGUsIGFyZ3MsIEBpZFxuICAgICAgICB0b01haW46ICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b01haW4nLCAgICAgIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9PdGhlcldpbnM6ICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9PdGhlcldpbnMnLCB0eXBlLCBhcmdzLCBAaWRcbiAgICAgICAgdG9XaW5zOiAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9XaW5zJywgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luOiAgIChpZCwgdHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvV2luJywgICAgICAgdHlwZSwgYXJncywgaWRcbiAgICAgICAgXG4gICAgICAgIGdldDogICAgICAgICAodHlwZSwgYXJncy4uLikgLT4gQGlwYy5zZW5kU3luYyBQT1NULCAnZ2V0JywgdHlwZSwgYXJnc1xuXG4gICAgICAgIGRlYnVnOiAoQGRiZz1bJ2VtaXQnLCAndG9BbGwnLCAndG9PdGhlcnMnLCAndG9NYWluJywgJ3RvT3RoZXJXaW5zJywgJ3RvV2lucycsICd0b1dpbiddKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJwb3N0LmRlYnVnIGlkOiN7QGlkfVwiLCBAZGJnXG5cbiAgICAgICAgZW1pdDogKHR5cGUsIGFyZ3MuLi4pIC0+IFxuICAgICAgICAgICAgaWYgJ2VtaXQnIGluIEBkYmcgdGhlbiBjb25zb2xlLmxvZyBcInBvc3QuZW1pdCAje3R5cGV9XCIsIGFyZ3MubWFwKChhKSAtPiBuZXcgU3RyaW5nKGEpKS5qb2luICcgJ1xuICAgICAgICAgICAgc3VwZXIgYXJndW1lbnRzLi4uXG4gICAgICAgICAgICBcbiAgICAgICAgc2VuZDogKHJlY2VpdmVycywgdHlwZSwgYXJncywgaWQpIC0+XG4gICAgICAgICAgICBpZiByZWNlaXZlcnMgaW4gQGRiZyB0aGVuIGNvbnNvbGUubG9nIFwicG9zdC4je3JlY2VpdmVyc30gI3t0eXBlfVwiLCBhcmdzLm1hcCgoYSkgLT4gbmV3IFN0cmluZyhhKSkuam9pbiAnICdcbiAgICAgICAgICAgIEBpcGMuc2VuZCBQT1NULCByZWNlaXZlcnMsIHR5cGUsIGFyZ3MsIGlkXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IG5ldyBQb3N0UmVuZGVyZXIoKVxuXG5lbHNlXG5cbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGNsYXNzIFBvc3RNYWluIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICAgICAgc3VwZXIoKVxuICAgICAgICAgICAgQGdldENhbGxiYWNrcyA9IHt9XG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpcGMgPSByZXF1aXJlKCdlbGVjdHJvbicpLmlwY01haW5cbiAgICAgICAgICAgICAgICBpcGMub24gUE9TVCwgKGV2ZW50LCBraW5kLCB0eXBlLCBhcmdsLCBpZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSBpZCBvciBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGtpbmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvTWFpbicgICAgICB0aGVuIEBzZW5kVG9NYWluIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvQWxsJyAgICAgICB0aGVuIEBzZW5kVG9XaW5zKHR5cGUsIGFyZ2wpLnNlbmRUb01haW4odHlwZSwgYXJnbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvT3RoZXJzJyAgICB0aGVuIEBzZW5kVG9XaW5zKHR5cGUsIGFyZ2wsIGlkKS5zZW5kVG9NYWluKHR5cGUsIGFyZ2wpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b090aGVyV2lucycgdGhlbiBAc2VuZFRvV2lucyB0eXBlLCBhcmdsLCBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9XaW5zJyAgICAgIHRoZW4gQHNlbmRUb1dpbnMgdHlwZSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9XaW4nICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBjb25zb2xlLmxvZyAndG8gd2luJywgaWQsIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdG9XaW4uYXBwbHkgQCwgW2lkLCB0eXBlXS5jb25jYXQgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZ2V0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBjb25zb2xlLmxvZyAncG9zdCBnZXQnLCB0eXBlLCBhcmdsLCBAZ2V0Q2FsbGJhY2tzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIEBnZXRDYWxsYmFja3NbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dmFsID0gQGdldENhbGxiYWNrc1t0eXBlXS5hcHBseSBAZ2V0Q2FsbGJhY2tzW3R5cGVdLCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gcmV0dmFsID8gW11cblxuICAgICAgICB0b0FsbDogICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb1dpbnModHlwZSwgYXJncykuc2VuZFRvTWFpbih0eXBlLCBhcmdzKVxuICAgICAgICB0b01haW46ICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb01haW4gdHlwZSwgYXJnc1xuICAgICAgICB0b1dpbnM6ICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb1dpbnMgdHlwZSwgYXJnc1xuICAgICAgICB0b1dpbjogIChpZCwgdHlwZSwgYXJncy4uLikgLT4gcmVxdWlyZSgnZWxlY3Ryb24nKS5Ccm93c2VyV2luZG93LmZyb21JZChpZCk/LndlYkNvbnRlbnRzLnNlbmQgUE9TVCwgdHlwZSwgYXJnc1xuXG4gICAgICAgIG9uR2V0OiAodHlwZSwgY2IpIC0+XG4gICAgICAgICAgICBAZ2V0Q2FsbGJhY2tzW3R5cGVdID0gY2JcbiAgICAgICAgICAgIEBcblxuICAgICAgICBzZW5kVG9NYWluOiAodHlwZSwgYXJnbCkgLT5cbiAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBjb25zb2xlLmxvZyBcInBvc3QgdG8gbWFpblwiLCB0eXBlLCBhcmdsXG4gICAgICAgICAgICBhcmdsLnVuc2hpZnQgdHlwZVxuICAgICAgICAgICAgQGVtaXQuYXBwbHkgQCwgYXJnbFxuICAgICAgICAgICAgQFxuXG4gICAgICAgIHNlbmRUb1dpbnM6ICh0eXBlLCBhcmdsLCBleGNlcHQpIC0+XG4gICAgICAgICAgICBmb3Igd2luIGluIHJlcXVpcmUoJ2VsZWN0cm9uJykuQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAgICAgICAgICAgICBpZiB3aW4uaWQgIT0gZXhjZXB0XG4gICAgICAgICAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBjb25zb2xlLmxvZyBcInBvc3QgdG8gI3t3aW4uaWR9ICN7dHlwZX1cIiAjLCBhcmdsLm1hcCgoYSkgLT4gbmV3IFN0cmluZyhhKSkuam9pbiAnICdcbiAgICAgICAgICAgICAgICAgICAgd2luLndlYkNvbnRlbnRzLnNlbmQoUE9TVCwgdHlwZSwgYXJnbCkgXG4gICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgZGVidWc6IChAZGJnPXRydWUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcInBvc3QuZGVidWdcIiwgQGRiZ1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBuZXcgUG9zdE1haW4oKVxuICAgICJdfQ==
//# sourceURL=C:/Users/kodi/s/kxk/coffee/ppost.coffee