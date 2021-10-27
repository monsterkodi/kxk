// koffee 1.14.0

/*
00000000    0000000    0000000  000000000    
000   000  000   000  000          000       
00000000   000   000  0000000      000       
000        000   000       000     000       
000         0000000   0000000      000
 */
var Emitter, POST, PostMain, PostRenderer, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf;

_ = require('lodash');

Emitter = require('events');

POST = '__POST__';

if (process.type === 'renderer') {
    PostRenderer = (function(superClass) {
        extend(PostRenderer, superClass);

        function PostRenderer() {
            this.dispose = bind(this.dispose, this);
            PostRenderer.__super__.constructor.call(this);
            this.dbg = true;
            this.ipc = require('electron').ipcRenderer;
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

        PostRenderer.prototype.toMain = function() {
            var args, type;
            type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return this.send('toMain', type, args);
        };

        PostRenderer.prototype.toOtherWins = function() {
            var args, type;
            type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return this.send('toOtherWins', type, args);
        };

        PostRenderer.prototype.get = function() {
            var args, type;
            type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return this.ipc.sendSync(POST, 'get', type, args);
        };

        PostRenderer.prototype.debug = function(dbg) {
            this.dbg = dbg != null ? dbg : ['emit', 'toAll', 'toMain', 'toOtherWins'];
            return console.log("post.debug id:" + (this.winid()), this.dbg);
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
            var ref;
            if (indexOf.call(this.dbg, receivers) >= 0) {
                console.log("post." + receivers + " " + type, args.map(function(a) {
                    return new String(a);
                }).join(' '));
            }
            return (ref = this.ipc) != null ? ref.send(POST, receivers, type, args, id) : void 0;
        };

        return PostRenderer;

    })(Emitter);
    module.exports = new PostRenderer();
} else {
    PostMain = (function(superClass) {
        extend(PostMain, superClass);

        function PostMain() {
            var err, ipc;
            PostMain.__super__.constructor.call(this);
            this.getCallbacks = {};
            try {
                ipc = require('electron').ipcMain;
                if (ipc != null) {
                    ipc.on(POST, (function(_this) {
                        return function(event, kind, type, argl) {
                            var id, ref, retval;
                            id = event != null ? (ref = event.sender) != null ? ref.id : void 0 : void 0;
                            switch (kind) {
                                case 'toAll':
                                    return _this.sendToWins(type, argl).sendToMain(type, argl);
                                case 'toMain':
                                    return _this.sendToMain(type, argl);
                                case 'toOtherWins':
                                    return _this.sendToWins(type, argl, id);
                                case 'get':
                                    if (_this.dbg) {
                                        console.log('post get', type, argl, _this.getCallbacks[type]);
                                    }
                                    if (type === 'winID') {
                                        return event.returnValue = id;
                                    } else if (_.isFunction(_this.getCallbacks[type])) {
                                        retval = _this.getCallbacks[type].apply(_this.getCallbacks[type], argl);
                                        return event.returnValue = retval != null ? retval : [];
                                    }
                            }
                        };
                    })(this));
                }
            } catch (error) {
                err = error;
                null;
            }
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

        PostMain.prototype.get = function(type) {
            return this.getCallbacks[type]();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcG9zdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsd0NBQUE7SUFBQTs7Ozs7O0FBUUEsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixJQUFBLEdBQVU7O0FBRVYsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixVQUFuQjtJQVFVOzs7UUFFQyxzQkFBQTs7WUFDQyw0Q0FBQTtZQUNBLElBQUMsQ0FBQSxHQUFELEdBQU87WUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPLE9BQUEsQ0FBUSxVQUFSLENBQW1CLENBQUM7WUFDM0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsSUFBUixFQUFjLENBQUEsU0FBQSxLQUFBO3VCQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxJQUFkOzJCQUF1QixLQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxLQUFaLEVBQWUsQ0FBQyxJQUFELENBQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxDQUFmO2dCQUF2QjtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDtZQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixjQUF4QixFQUF1QyxJQUFDLENBQUEsT0FBeEM7UUFMRDs7K0JBT0gsT0FBQSxHQUFTLFNBQUE7WUFDTCxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsY0FBM0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxrQkFBTCxDQUF3QixJQUF4QjttQkFDQSxJQUFDLENBQUEsR0FBRCxHQUFPO1FBSEY7OytCQUtULEtBQUEsR0FBYSxTQUFBO0FBQW1CLGdCQUFBO1lBQWxCLHFCQUFNO21CQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sT0FBTixFQUFvQixJQUFwQixFQUEwQixJQUExQjtR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MDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICBcbjAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgIFxuIyMjXG5cbl8gICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5FbWl0dGVyID0gcmVxdWlyZSAnZXZlbnRzJ1xuUE9TVCAgICA9ICdfX1BPU1RfXydcblxuaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcblxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgICAgXG5cbiAgICBjbGFzcyBQb3N0UmVuZGVyZXIgZXh0ZW5kcyBFbWl0dGVyXG5cbiAgICAgICAgQDogLT5cbiAgICAgICAgICAgIHN1cGVyKClcbiAgICAgICAgICAgIEBkYmcgPSB0cnVlXG4gICAgICAgICAgICBAaXBjID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5pcGNSZW5kZXJlclxuICAgICAgICAgICAgQGlwYy5vbiBQT1NULCAoZXZlbnQsIHR5cGUsIGFyZ2wpID0+IEBlbWl0LmFwcGx5IEAsIFt0eXBlXS5jb25jYXQgYXJnbFxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2JlZm9yZXVubG9hZCcgQGRpc3Bvc2VcblxuICAgICAgICBkaXNwb3NlOiA9PlxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2JlZm9yZXVubG9hZCcgQGRpc3Bvc2VcbiAgICAgICAgICAgIEBpcGMucmVtb3ZlQWxsTGlzdGVuZXJzIFBPU1RcbiAgICAgICAgICAgIEBpcGMgPSBudWxsXG5cbiAgICAgICAgdG9BbGw6ICAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9BbGwnICAgICAgIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9NYWluOiAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9NYWluJyAgICAgIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9PdGhlcldpbnM6ICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9PdGhlcldpbnMnIHR5cGUsIGFyZ3NcbiAgICAgICAgXG4gICAgICAgIGdldDogICAgICAgICAodHlwZSwgYXJncy4uLikgLT4gQGlwYy5zZW5kU3luYyBQT1NULCAnZ2V0JyB0eXBlLCBhcmdzXG5cbiAgICAgICAgZGVidWc6IChAZGJnPVsnZW1pdCcgJ3RvQWxsJyAndG9NYWluJyAndG9PdGhlcldpbnMnXSkgLT5cbiAgICAgICAgICAgIGxvZyBcInBvc3QuZGVidWcgaWQ6I3tAd2luaWQoKX1cIiBAZGJnXG5cbiAgICAgICAgZW1pdDogKHR5cGUsIGFyZ3MuLi4pIC0+IFxuICAgICAgICAgICAgaWYgJ2VtaXQnIGluIEBkYmcgdGhlbiBsb2cgXCJwb3N0LmVtaXQgI3t0eXBlfVwiIGFyZ3MubWFwKChhKSAtPiBuZXcgU3RyaW5nKGEpKS5qb2luICcgJ1xuICAgICAgICAgICAgc3VwZXIgYXJndW1lbnRzLi4uXG4gICAgICAgICAgICBcbiAgICAgICAgc2VuZDogKHJlY2VpdmVycywgdHlwZSwgYXJncywgaWQpIC0+XG4gICAgICAgICAgICBpZiByZWNlaXZlcnMgaW4gQGRiZyB0aGVuIGxvZyBcInBvc3QuI3tyZWNlaXZlcnN9ICN7dHlwZX1cIiBhcmdzLm1hcCgoYSkgLT4gbmV3IFN0cmluZyhhKSkuam9pbiAnICdcbiAgICAgICAgICAgIEBpcGM/LnNlbmQgUE9TVCwgcmVjZWl2ZXJzLCB0eXBlLCBhcmdzLCBpZFxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBuZXcgUG9zdFJlbmRlcmVyKClcblxuZWxzZVxuXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBjbGFzcyBQb3N0TWFpbiBleHRlbmRzIEVtaXR0ZXJcblxuICAgICAgICBAOiAtPlxuICAgICAgICAgICAgc3VwZXIoKVxuICAgICAgICAgICAgQGdldENhbGxiYWNrcyA9IHt9XG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpcGMgPSByZXF1aXJlKCdlbGVjdHJvbicpLmlwY01haW5cbiAgICAgICAgICAgICAgICBpcGM/Lm9uIFBPU1QsIChldmVudCwga2luZCwgdHlwZSwgYXJnbCkgPT5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSBldmVudD8uc2VuZGVyPy5pZFxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gga2luZFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9BbGwnICAgICAgIHRoZW4gQHNlbmRUb1dpbnModHlwZSwgYXJnbCkuc2VuZFRvTWFpbih0eXBlLCBhcmdsKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9NYWluJyAgICAgIHRoZW4gQHNlbmRUb01haW4gdHlwZSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9PdGhlcldpbnMnIHRoZW4gQHNlbmRUb1dpbnMgdHlwZSwgYXJnbCwgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2dldCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBAZGJnIHRoZW4gbG9nICdwb3N0IGdldCcgdHlwZSwgYXJnbCwgQGdldENhbGxiYWNrc1t0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGUgPT0gJ3dpbklEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBfLmlzRnVuY3Rpb24gQGdldENhbGxiYWNrc1t0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR2YWwgPSBAZ2V0Q2FsbGJhY2tzW3R5cGVdLmFwcGx5IEBnZXRDYWxsYmFja3NbdHlwZV0sIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSByZXR2YWwgPyBbXVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgbnVsbCAjIGRvbid0IGxvZyBlcnJvciBoZXJlICh0aGlzIGdldHMgY2FsbGVkIGZvciBub24tZWxlY3Ryb24gc2NyaXB0cyBhcyB3ZWxsKVxuXG4gICAgICAgIHRvQWxsOiAgKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvV2lucyh0eXBlLCBhcmdzKS5zZW5kVG9NYWluKHR5cGUsIGFyZ3MpXG4gICAgICAgIHRvTWFpbjogKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvTWFpbiB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luczogKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvV2lucyB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luOiAgKGlkLCB0eXBlLCBhcmdzLi4uKSAtPiByZXF1aXJlKCdlbGVjdHJvbicpLkJyb3dzZXJXaW5kb3cuZnJvbUlkKGlkKT8ud2ViQ29udGVudHMuc2VuZCBQT1NULCB0eXBlLCBhcmdzXG5cbiAgICAgICAgb25HZXQ6ICh0eXBlLCBjYikgLT5cbiAgICAgICAgICAgIEBnZXRDYWxsYmFja3NbdHlwZV0gPSBjYlxuICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgIGdldDogKHR5cGUpIC0+IEBnZXRDYWxsYmFja3NbdHlwZV0oKVxuXG4gICAgICAgIHNlbmRUb01haW46ICh0eXBlLCBhcmdsKSAtPlxuICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyBcInBvc3QgdG8gbWFpblwiIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgIGFyZ2wudW5zaGlmdCB0eXBlXG4gICAgICAgICAgICBAZW1pdC5hcHBseSBALCBhcmdsXG4gICAgICAgICAgICBAXG5cbiAgICAgICAgc2VuZFRvV2luczogKHR5cGUsIGFyZ2wsIGV4Y2VwdCkgLT5cbiAgICAgICAgICAgIGZvciB3aW4gaW4gcmVxdWlyZSgnZWxlY3Ryb24nKS5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuICAgICAgICAgICAgICAgIGlmIHdpbi5pZCAhPSBleGNlcHRcbiAgICAgICAgICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyBcInBvc3QgdG8gI3t3aW4uaWR9ICN7dHlwZX1cIiAjIGFyZ2wubWFwKChhKSAtPiBuZXcgU3RyaW5nKGEpKS5qb2luICcgJ1xuICAgICAgICAgICAgICAgICAgICB3aW4ud2ViQ29udGVudHMuc2VuZChQT1NULCB0eXBlLCBhcmdsKSBcbiAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICBkZWJ1ZzogKEBkYmc9dHJ1ZSkgLT5cbiAgICAgICAgICAgIGxvZyBcInBvc3QuZGVidWdcIiBAZGJnXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IG5ldyBQb3N0TWFpbigpXG4gICAgXG4iXX0=
//# sourceURL=../coffee/ppost.coffee