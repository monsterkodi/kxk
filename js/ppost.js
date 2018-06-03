// Generated by CoffeeScript 1.12.7

/*
00000000    0000000    0000000  000000000    
000   000  000   000  000          000       
00000000   000   000  0000000      000       
000        000   000       000     000       
000         0000000   0000000      000
 */

(function() {
  var Emitter, POST, PostMain, PostRenderer, _, electron, remote,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  Emitter = require('events');

  POST = '__POST__';

  if (process.type === 'renderer') {
    electron = require('electron');
    remote = electron.remote;
    PostRenderer = (function(superClass) {
      extend(PostRenderer, superClass);

      function PostRenderer() {
        this.dispose = bind(this.dispose, this);
        PostRenderer.__super__.constructor.call(this);
        this.dbg = false;
        this.id = remote.getCurrentWindow().id;
        this.ipc = electron.ipcRenderer;
        this.ipc.on(POST, (function(_this) {
          return function(event, type, argl) {
            return _this.emit.apply(_this, [type].concat(argl));
          };
        })(this));
        window.addEventListener('beforeunload', this.dispose);
      }

      PostRenderer.prototype.dispose = function() {
        window.removeEventListener('beforeunload', this.dispose);
        this.ipc.removeAllListeners(POST);
        return this.ipc = null;
      };

      PostRenderer.prototype.toAll = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.send('toAll', type, args);
      };

      PostRenderer.prototype.toOthers = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.send('toOthers', type, args, this.id);
      };

      PostRenderer.prototype.toMain = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.send('toMain', type, args);
      };

      PostRenderer.prototype.toOtherWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.send('toOtherWins', type, args, this.id);
      };

      PostRenderer.prototype.toWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.send('toWins', type, args);
      };

      PostRenderer.prototype.toWin = function() {
        var args, id, type;
        id = arguments[0], type = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return this.send('toWin', type, args, id);
      };

      PostRenderer.prototype.get = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.sendSync(POST, 'get', type, args);
      };

      PostRenderer.prototype.debug = function(dbg) {
        this.dbg = dbg != null ? dbg : ['emit', 'toAll', 'toOthers', 'toMain', 'toOtherWins', 'toWins', 'toWin'];
        return console.log("post.debug id:" + this.id, this.dbg);
      };

      PostRenderer.prototype.emit = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if (indexOf.call(this.dbg, 'emit') >= 0) {
          console.log("post.emit " + type, args.map(function(a) {
            return new String(a);
          }).join(' '));
        }
        return PostRenderer.__super__.emit.apply(this, arguments);
      };

      PostRenderer.prototype.send = function(receivers, type, args, id) {
        if (indexOf.call(this.dbg, receivers) >= 0) {
          console.log("post." + receivers + " " + type, args.map(function(a) {
            return new String(a);
          }).join(' '));
        }
        return this.ipc.send(POST, receivers, type, args, id);
      };

      return PostRenderer;

    })(Emitter);
    module.exports = new PostRenderer();
  } else {
    PostMain = (function(superClass) {
      extend(PostMain, superClass);

      function PostMain() {
        var ipc;
        PostMain.__super__.constructor.call(this);
        this.getCallbacks = {};
        try {
          ipc = require('electron').ipcMain;
          ipc.on(POST, (function(_this) {
            return function(event, kind, type, argl, id) {
              var retval;
              id = id || event.sender.id;
              switch (kind) {
                case 'toMain':
                  return _this.sendToMain(type, argl);
                case 'toAll':
                  return _this.sendToWins(type, argl).sendToMain(type, argl);
                case 'toOthers':
                  return _this.sendToWins(type, argl, id).sendToMain(type, argl);
                case 'toOtherWins':
                  return _this.sendToWins(type, argl, id);
                case 'toWins':
                  return _this.sendToWins(type, argl);
                case 'toWin':
                  if (_this.dbg) {
                    console.log('to win', id, type, argl);
                  }
                  return _this.toWin.apply(_this, [id, type].concat(argl));
                case 'get':
                  if (_this.dbg) {
                    console.log('post get', type, argl, _this.getCallbacks[type]);
                  }
                  if (_.isFunction(_this.getCallbacks[type])) {
                    retval = _this.getCallbacks[type].apply(_this.getCallbacks[type], argl);
                    return event.returnValue = retval != null ? retval : [];
                  }
              }
            };
          })(this));
        } catch (error) {}
      }

      PostMain.prototype.toAll = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToWins(type, args).sendToMain(type, args);
      };

      PostMain.prototype.toMain = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToMain(type, args);
      };

      PostMain.prototype.toWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToWins(type, args);
      };

      PostMain.prototype.toWin = function() {
        var args, id, ref, type;
        id = arguments[0], type = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return (ref = require('electron').BrowserWindow.fromId(id)) != null ? ref.webContents.send(POST, type, args) : void 0;
      };

      PostMain.prototype.onGet = function(type, cb) {
        this.getCallbacks[type] = cb;
        return this;
      };

      PostMain.prototype.sendToMain = function(type, argl) {
        if (this.dbg) {
          console.log("post to main", type, argl);
        }
        argl.unshift(type);
        this.emit.apply(this, argl);
        return this;
      };

      PostMain.prototype.sendToWins = function(type, argl, except) {
        var i, len, ref, win;
        ref = require('electron').BrowserWindow.getAllWindows();
        for (i = 0, len = ref.length; i < len; i++) {
          win = ref[i];
          if (win.id !== except) {
            if (this.dbg) {
              console.log("post to " + win.id + " " + type);
            }
            win.webContents.send(POST, type, argl);
          }
        }
        return this;
      };

      PostMain.prototype.debug = function(dbg) {
        this.dbg = dbg != null ? dbg : true;
        return console.log("post.debug", this.dbg);
      };

      return PostMain;

    })(Emitter);
    module.exports = new PostMain();
  }

}).call(this);
