// koffee 1.14.0

/*
00000000    0000000    0000000  000000000    
000   000  000   000  000          000       
00000000   000   000  0000000      000       
000        000   000       000     000       
000         0000000   0000000      000
 */
var Emitter, POST, PostMain, PostRenderer, _, electron, remote,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf;

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
                        return function(event, kind, type, argl, id) {
                            var retval;
                            id = id || (event != null ? event.sender.id : void 0);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcG9zdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMERBQUE7SUFBQTs7Ozs7O0FBUUEsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixJQUFBLEdBQVU7O0FBRVYsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixVQUFuQjtJQUVJLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtJQUNYLE1BQUEsR0FBVyxRQUFRLENBQUM7SUFRZDs7O1FBRUMsc0JBQUE7O1lBQ0MsNENBQUE7WUFDQSxJQUFDLENBQUEsR0FBRCxHQUFPO1lBQ1AsSUFBQyxDQUFBLEVBQUQsR0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDO1lBQ2pDLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1lBQ2hCLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLElBQVIsRUFBYyxDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsSUFBZDsyQkFBdUIsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksS0FBWixFQUFlLENBQUMsSUFBRCxDQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsQ0FBZjtnQkFBdkI7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7WUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsY0FBeEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDO1FBTkQ7OytCQVFILE9BQUEsR0FBUyxTQUFBO1lBQ0wsTUFBTSxDQUFDLG1CQUFQLENBQTJCLGNBQTNCLEVBQTBDLElBQUMsQ0FBQSxPQUEzQztZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsa0JBQUwsQ0FBd0IsSUFBeEI7bUJBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTztRQUhGOzsrQkFL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QUFPLEVBQVA7WUFDSCxJQUFDLENBQUEsWUFBYSxDQUFBLElBQUEsQ0FBZCxHQUFzQjttQkFDdEI7UUFGRzs7MkJBSVAsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLElBQVA7WUFDUixJQUFHLElBQUMsQ0FBQSxHQUFKO2dCQUFNLE9BQUEsQ0FBTyxHQUFQLENBQVcsY0FBWCxFQUEwQixJQUExQixFQUFnQyxJQUFoQyxFQUFOOztZQUNBLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYjtZQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVosRUFBZSxJQUFmO21CQUNBO1FBSlE7OzJCQU1aLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsTUFBYjtBQUNSLGdCQUFBO0FBQUE7QUFBQSxpQkFBQSxxQ0FBQTs7Z0JBQ0ksSUFBRyxHQUFHLENBQUMsRUFBSixLQUFVLE1BQWI7b0JBQ0ksSUFBRyxJQUFDLENBQUEsR0FBSjt3QkFBTSxPQUFBLENBQU8sR0FBUCxDQUFXLFVBQUEsR0FBVyxHQUFHLENBQUMsRUFBZixHQUFrQixHQUFsQixHQUFxQixJQUFoQyxFQUFOOztvQkFDQSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQWhCLENBQXFCLElBQXJCLEVBQTJCLElBQTNCLEVBQWlDLElBQWpDLEVBRko7O0FBREo7bUJBSUE7UUFMUTs7MkJBT1osS0FBQSxHQUFPLFNBQUMsR0FBRDtZQUFDLElBQUMsQ0FBQSxvQkFBRCxNQUFLO21CQUNWLE9BQUEsQ0FBQyxHQUFELENBQUssWUFBTCxFQUFrQixJQUFDLENBQUEsR0FBbkI7UUFESTs7OztPQWhEWTtJQW1EdkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBSSxRQUFKLENBQUEsRUEzR3JCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICBcbjAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgIFxuIyMjXG5cbl8gICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5FbWl0dGVyID0gcmVxdWlyZSAnZXZlbnRzJ1xuUE9TVCAgICA9ICdfX1BPU1RfXydcblxuaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcblxuICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgcmVtb3RlICAgPSBlbGVjdHJvbi5yZW1vdGVcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgIFxuXG4gICAgY2xhc3MgUG9zdFJlbmRlcmVyIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgICAgIEA6IC0+XG4gICAgICAgICAgICBzdXBlcigpXG4gICAgICAgICAgICBAZGJnID0gZmFsc2VcbiAgICAgICAgICAgIEBpZCAgPSByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmlkXG4gICAgICAgICAgICBAaXBjID0gZWxlY3Ryb24uaXBjUmVuZGVyZXJcbiAgICAgICAgICAgIEBpcGMub24gUE9TVCwgKGV2ZW50LCB0eXBlLCBhcmdsKSA9PiBAZW1pdC5hcHBseSBALCBbdHlwZV0uY29uY2F0IGFyZ2xcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdiZWZvcmV1bmxvYWQnIEBkaXNwb3NlXG5cbiAgICAgICAgZGlzcG9zZTogPT5cbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdiZWZvcmV1bmxvYWQnIEBkaXNwb3NlXG4gICAgICAgICAgICBAaXBjLnJlbW92ZUFsbExpc3RlbmVycyBQT1NUXG4gICAgICAgICAgICBAaXBjID0gbnVsbFxuXG4gICAgICAgIHRvQWxsOiAgICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvQWxsJyAgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvT3RoZXJzOiAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvT3RoZXJzJyAgICB0eXBlLCBhcmdzLCBAaWRcbiAgICAgICAgdG9NYWluOiAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9NYWluJyAgICAgIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9PdGhlcldpbnM6ICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9PdGhlcldpbnMnIHR5cGUsIGFyZ3MsIEBpZFxuICAgICAgICB0b1dpbnM6ICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b1dpbnMnICAgICAgdHlwZSwgYXJnc1xuICAgICAgICB0b1dpbjogICAoaWQsIHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b1dpbicgICAgICAgdHlwZSwgYXJncywgaWRcbiAgICAgICAgXG4gICAgICAgIGdldDogICAgICAgICAodHlwZSwgYXJncy4uLikgLT4gQGlwYy5zZW5kU3luYyBQT1NULCAnZ2V0JyB0eXBlLCBhcmdzXG5cbiAgICAgICAgZGVidWc6IChAZGJnPVsnZW1pdCcgJ3RvQWxsJyAndG9PdGhlcnMnICd0b01haW4nICd0b090aGVyV2lucycgJ3RvV2lucycgJ3RvV2luJ10pIC0+XG4gICAgICAgICAgICBsb2cgXCJwb3N0LmRlYnVnIGlkOiN7QGlkfVwiIEBkYmdcblxuICAgICAgICBlbWl0OiAodHlwZSwgYXJncy4uLikgLT4gXG4gICAgICAgICAgICBpZiAnZW1pdCcgaW4gQGRiZyB0aGVuIGxvZyBcInBvc3QuZW1pdCAje3R5cGV9XCIgYXJncy5tYXAoKGEpIC0+IG5ldyBTdHJpbmcoYSkpLmpvaW4gJyAnXG4gICAgICAgICAgICBzdXBlciBhcmd1bWVudHMuLi5cbiAgICAgICAgICAgIFxuICAgICAgICBzZW5kOiAocmVjZWl2ZXJzLCB0eXBlLCBhcmdzLCBpZCkgLT5cbiAgICAgICAgICAgIGlmIHJlY2VpdmVycyBpbiBAZGJnIHRoZW4gbG9nIFwicG9zdC4je3JlY2VpdmVyc30gI3t0eXBlfVwiIGFyZ3MubWFwKChhKSAtPiBuZXcgU3RyaW5nKGEpKS5qb2luICcgJ1xuICAgICAgICAgICAgQGlwYz8uc2VuZCBQT1NULCByZWNlaXZlcnMsIHR5cGUsIGFyZ3MsIGlkXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IG5ldyBQb3N0UmVuZGVyZXIoKVxuXG5lbHNlXG5cbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGNsYXNzIFBvc3RNYWluIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgICAgIEA6IC0+XG4gICAgICAgICAgICBzdXBlcigpXG4gICAgICAgICAgICBAZ2V0Q2FsbGJhY2tzID0ge31cbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGlwYyA9IHJlcXVpcmUoJ2VsZWN0cm9uJykuaXBjTWFpblxuICAgICAgICAgICAgICAgIGlwYz8ub24gUE9TVCwgKGV2ZW50LCBraW5kLCB0eXBlLCBhcmdsLCBpZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSBpZCBvciBldmVudD8uc2VuZGVyLmlkXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBraW5kXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b01haW4nICAgICAgdGhlbiBAc2VuZFRvTWFpbiB0eXBlLCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b0FsbCcgICAgICAgdGhlbiBAc2VuZFRvV2lucyh0eXBlLCBhcmdsKS5zZW5kVG9NYWluKHR5cGUsIGFyZ2wpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b090aGVycycgICAgdGhlbiBAc2VuZFRvV2lucyh0eXBlLCBhcmdsLCBpZCkuc2VuZFRvTWFpbih0eXBlLCBhcmdsKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9PdGhlcldpbnMnIHRoZW4gQHNlbmRUb1dpbnMgdHlwZSwgYXJnbCwgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvV2lucycgICAgICB0aGVuIEBzZW5kVG9XaW5zIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvV2luJyAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBAZGJnIHRoZW4gbG9nICd0byB3aW4nIGlkLCB0eXBlLCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHRvV2luLmFwcGx5IEAsIFtpZCwgdHlwZV0uY29uY2F0IGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2dldCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBAZGJnIHRoZW4gbG9nICdwb3N0IGdldCcgdHlwZSwgYXJnbCwgQGdldENhbGxiYWNrc1t0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIF8uaXNGdW5jdGlvbiBAZ2V0Q2FsbGJhY2tzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHZhbCA9IEBnZXRDYWxsYmFja3NbdHlwZV0uYXBwbHkgQGdldENhbGxiYWNrc1t0eXBlXSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IHJldHZhbCA/IFtdXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBudWxsICMgZG9uJ3QgbG9nIGVycm9yIGhlcmUgKHRoaXMgZ2V0cyBjYWxsZWQgZm9yIG5vbi1lbGVjdHJvbiBzY3JpcHRzIGFzIHdlbGwpXG5cbiAgICAgICAgdG9BbGw6ICAoICAgIHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kVG9XaW5zKHR5cGUsIGFyZ3MpLnNlbmRUb01haW4odHlwZSwgYXJncylcbiAgICAgICAgdG9NYWluOiAoICAgIHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kVG9NYWluIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9XaW5zOiAoICAgIHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kVG9XaW5zIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9XaW46ICAoaWQsIHR5cGUsIGFyZ3MuLi4pIC0+IHJlcXVpcmUoJ2VsZWN0cm9uJykuQnJvd3NlcldpbmRvdy5mcm9tSWQoaWQpPy53ZWJDb250ZW50cy5zZW5kIFBPU1QsIHR5cGUsIGFyZ3NcblxuICAgICAgICBvbkdldDogKHR5cGUsIGNiKSAtPlxuICAgICAgICAgICAgQGdldENhbGxiYWNrc1t0eXBlXSA9IGNiXG4gICAgICAgICAgICBAXG5cbiAgICAgICAgc2VuZFRvTWFpbjogKHR5cGUsIGFyZ2wpIC0+XG4gICAgICAgICAgICBpZiBAZGJnIHRoZW4gbG9nIFwicG9zdCB0byBtYWluXCIgdHlwZSwgYXJnbFxuICAgICAgICAgICAgYXJnbC51bnNoaWZ0IHR5cGVcbiAgICAgICAgICAgIEBlbWl0LmFwcGx5IEAsIGFyZ2xcbiAgICAgICAgICAgIEBcblxuICAgICAgICBzZW5kVG9XaW5zOiAodHlwZSwgYXJnbCwgZXhjZXB0KSAtPlxuICAgICAgICAgICAgZm9yIHdpbiBpbiByZXF1aXJlKCdlbGVjdHJvbicpLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgICAgICAgICAgaWYgd2luLmlkICE9IGV4Y2VwdFxuICAgICAgICAgICAgICAgICAgICBpZiBAZGJnIHRoZW4gbG9nIFwicG9zdCB0byAje3dpbi5pZH0gI3t0eXBlfVwiICMgYXJnbC5tYXAoKGEpIC0+IG5ldyBTdHJpbmcoYSkpLmpvaW4gJyAnXG4gICAgICAgICAgICAgICAgICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKFBPU1QsIHR5cGUsIGFyZ2wpIFxuICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgIGRlYnVnOiAoQGRiZz10cnVlKSAtPlxuICAgICAgICAgICAgbG9nIFwicG9zdC5kZWJ1Z1wiIEBkYmdcblxuICAgIG1vZHVsZS5leHBvcnRzID0gbmV3IFBvc3RNYWluKClcbiAgICAiXX0=
//# sourceURL=../coffee/ppost.coffee