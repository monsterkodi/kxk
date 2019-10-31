// koffee 1.4.0

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
            var err, ipc;
            PostMain.__super__.constructor.call(this);
            this.getCallbacks = {};
            try {
                ipc = require('electron').ipcMain;
                if (ipc != null) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBEQUFBO0lBQUE7Ozs7OztBQVFBLENBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsSUFBQSxHQUFVOztBQUVWLElBQUcsT0FBTyxDQUFDLElBQVIsS0FBZ0IsVUFBbkI7SUFFSSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7SUFDWCxNQUFBLEdBQVcsUUFBUSxDQUFDO0lBUWQ7OztRQUVXLHNCQUFBOztZQUNULDRDQUFBO1lBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTztZQUNQLElBQUMsQ0FBQSxFQUFELEdBQU8sTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBeUIsQ0FBQztZQUNqQyxJQUFDLENBQUEsR0FBRCxHQUFPLFFBQVEsQ0FBQztZQUNoQixJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxJQUFSLEVBQWMsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLElBQWQ7MkJBQXVCLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLEtBQVosRUFBZSxDQUFDLElBQUQsQ0FBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkLENBQWY7Z0JBQXZCO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO1lBQ0EsTUFBTSxDQUFDLGdCQUFQLENBQXdCLGNBQXhCLEVBQXVDLElBQUMsQ0FBQSxPQUF4QztRQU5TOzsrQkFRYixPQUFBLEdBQVMsU0FBQTtZQUNMLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixjQUEzQixFQUEwQyxJQUFDLENBQUEsT0FBM0M7WUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGtCQUFMLENBQXdCLElBQXhCO21CQUNBLElBQUMsQ0FBQSxHQUFELEdBQU87UUFIRjs7K0JBS1QsS0FBQSxHQUFhLFNBQUE7QUFB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QyxDQUFBLFlBQWEsQ0FBQSxJQUFBLENBQWQsR0FBc0I7bUJBQ3RCO1FBRkc7OzJCQUlQLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxJQUFQO1lBQ1IsSUFBRyxJQUFDLENBQUEsR0FBSjtnQkFBTSxPQUFBLENBQU8sR0FBUCxDQUFXLGNBQVgsRUFBMEIsSUFBMUIsRUFBZ0MsSUFBaEMsRUFBTjs7WUFDQSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWI7WUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxJQUFaLEVBQWUsSUFBZjttQkFDQTtRQUpROzsyQkFNWixVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE1BQWI7QUFDUixnQkFBQTtBQUFBO0FBQUEsaUJBQUEscUNBQUE7O2dCQUNJLElBQUcsR0FBRyxDQUFDLEVBQUosS0FBVSxNQUFiO29CQUNJLElBQUcsSUFBQyxDQUFBLEdBQUo7d0JBQU0sT0FBQSxDQUFPLEdBQVAsQ0FBVyxVQUFBLEdBQVcsR0FBRyxDQUFDLEVBQWYsR0FBa0IsR0FBbEIsR0FBcUIsSUFBaEMsRUFBTjs7b0JBQ0EsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixFQUEyQixJQUEzQixFQUFpQyxJQUFqQyxFQUZKOztBQURKO21CQUlBO1FBTFE7OzJCQU9aLEtBQUEsR0FBTyxTQUFDLEdBQUQ7WUFBQyxJQUFDLENBQUEsb0JBQUQsTUFBSzttQkFDVixPQUFBLENBQUMsR0FBRCxDQUFLLFlBQUwsRUFBa0IsSUFBQyxDQUFBLEdBQW5CO1FBREk7Ozs7T0FoRFk7SUFtRHZCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUksUUFBSixDQUFBLEVBM0dyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICBcbiMjI1xuXG5fICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuRW1pdHRlciA9IHJlcXVpcmUgJ2V2ZW50cydcblBPU1QgICAgPSAnX19QT1NUX18nXG5cbmlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG5cbiAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgIHJlbW90ZSAgID0gZWxlY3Ryb24ucmVtb3RlXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgICBcblxuICAgIGNsYXNzIFBvc3RSZW5kZXJlciBleHRlbmRzIEVtaXR0ZXJcblxuICAgICAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgICAgIHN1cGVyKClcbiAgICAgICAgICAgIEBkYmcgPSBmYWxzZVxuICAgICAgICAgICAgQGlkICA9IHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkuaWRcbiAgICAgICAgICAgIEBpcGMgPSBlbGVjdHJvbi5pcGNSZW5kZXJlclxuICAgICAgICAgICAgQGlwYy5vbiBQT1NULCAoZXZlbnQsIHR5cGUsIGFyZ2wpID0+IEBlbWl0LmFwcGx5IEAsIFt0eXBlXS5jb25jYXQgYXJnbFxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2JlZm9yZXVubG9hZCcgQGRpc3Bvc2VcblxuICAgICAgICBkaXNwb3NlOiAoKSA9PlxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2JlZm9yZXVubG9hZCcgQGRpc3Bvc2VcbiAgICAgICAgICAgIEBpcGMucmVtb3ZlQWxsTGlzdGVuZXJzIFBPU1RcbiAgICAgICAgICAgIEBpcGMgPSBudWxsXG5cbiAgICAgICAgdG9BbGw6ICAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9BbGwnICAgICAgIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9PdGhlcnM6ICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9PdGhlcnMnICAgIHR5cGUsIGFyZ3MsIEBpZFxuICAgICAgICB0b01haW46ICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b01haW4nICAgICAgdHlwZSwgYXJnc1xuICAgICAgICB0b090aGVyV2luczogKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b090aGVyV2lucycgdHlwZSwgYXJncywgQGlkXG4gICAgICAgIHRvV2luczogICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvV2lucycgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luOiAgIChpZCwgdHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvV2luJyAgICAgICB0eXBlLCBhcmdzLCBpZFxuICAgICAgICBcbiAgICAgICAgZ2V0OiAgICAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAaXBjLnNlbmRTeW5jIFBPU1QsICdnZXQnIHR5cGUsIGFyZ3NcblxuICAgICAgICBkZWJ1ZzogKEBkYmc9WydlbWl0JyAndG9BbGwnICd0b090aGVycycgJ3RvTWFpbicgJ3RvT3RoZXJXaW5zJyAndG9XaW5zJyAndG9XaW4nXSkgLT5cbiAgICAgICAgICAgIGxvZyBcInBvc3QuZGVidWcgaWQ6I3tAaWR9XCIgQGRiZ1xuXG4gICAgICAgIGVtaXQ6ICh0eXBlLCBhcmdzLi4uKSAtPiBcbiAgICAgICAgICAgIGlmICdlbWl0JyBpbiBAZGJnIHRoZW4gbG9nIFwicG9zdC5lbWl0ICN7dHlwZX1cIiBhcmdzLm1hcCgoYSkgLT4gbmV3IFN0cmluZyhhKSkuam9pbiAnICdcbiAgICAgICAgICAgIHN1cGVyIGFyZ3VtZW50cy4uLlxuICAgICAgICAgICAgXG4gICAgICAgIHNlbmQ6IChyZWNlaXZlcnMsIHR5cGUsIGFyZ3MsIGlkKSAtPlxuICAgICAgICAgICAgaWYgcmVjZWl2ZXJzIGluIEBkYmcgdGhlbiBsb2cgXCJwb3N0LiN7cmVjZWl2ZXJzfSAje3R5cGV9XCIgYXJncy5tYXAoKGEpIC0+IG5ldyBTdHJpbmcoYSkpLmpvaW4gJyAnXG4gICAgICAgICAgICBAaXBjLnNlbmQgUE9TVCwgcmVjZWl2ZXJzLCB0eXBlLCBhcmdzLCBpZFxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBuZXcgUG9zdFJlbmRlcmVyKClcblxuZWxzZVxuXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBjbGFzcyBQb3N0TWFpbiBleHRlbmRzIEVtaXR0ZXJcblxuICAgICAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgICAgIHN1cGVyKClcbiAgICAgICAgICAgIEBnZXRDYWxsYmFja3MgPSB7fVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgaXBjID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5pcGNNYWluXG4gICAgICAgICAgICAgICAgaXBjPy5vbiBQT1NULCAoZXZlbnQsIGtpbmQsIHR5cGUsIGFyZ2wsIGlkKSA9PlxuICAgICAgICAgICAgICAgICAgICBpZCA9IGlkIG9yIGV2ZW50LnNlbmRlci5pZFxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gga2luZFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9NYWluJyAgICAgIHRoZW4gQHNlbmRUb01haW4gdHlwZSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9BbGwnICAgICAgIHRoZW4gQHNlbmRUb1dpbnModHlwZSwgYXJnbCkuc2VuZFRvTWFpbih0eXBlLCBhcmdsKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9PdGhlcnMnICAgIHRoZW4gQHNlbmRUb1dpbnModHlwZSwgYXJnbCwgaWQpLnNlbmRUb01haW4odHlwZSwgYXJnbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvT3RoZXJXaW5zJyB0aGVuIEBzZW5kVG9XaW5zIHR5cGUsIGFyZ2wsIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b1dpbnMnICAgICAgdGhlbiBAc2VuZFRvV2lucyB0eXBlLCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b1dpbicgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyAndG8gd2luJyBpZCwgdHlwZSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEB0b1dpbi5hcHBseSBALCBbaWQsIHR5cGVdLmNvbmNhdCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyAncG9zdCBnZXQnIHR5cGUsIGFyZ2wsIEBnZXRDYWxsYmFja3NbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBfLmlzRnVuY3Rpb24gQGdldENhbGxiYWNrc1t0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR2YWwgPSBAZ2V0Q2FsbGJhY2tzW3R5cGVdLmFwcGx5IEBnZXRDYWxsYmFja3NbdHlwZV0sIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSByZXR2YWwgPyBbXVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgbnVsbCAjIGRvbid0IGxvZyBlcnJvciBoZXJlICh0aGlzIGdldHMgY2FsbGVkIGZvciBub24tZWxlY3Ryb24gc2NyaXB0cyBhcyB3ZWxsKVxuXG4gICAgICAgIHRvQWxsOiAgKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvV2lucyh0eXBlLCBhcmdzKS5zZW5kVG9NYWluKHR5cGUsIGFyZ3MpXG4gICAgICAgIHRvTWFpbjogKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvTWFpbiB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luczogKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvV2lucyB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luOiAgKGlkLCB0eXBlLCBhcmdzLi4uKSAtPiByZXF1aXJlKCdlbGVjdHJvbicpLkJyb3dzZXJXaW5kb3cuZnJvbUlkKGlkKT8ud2ViQ29udGVudHMuc2VuZCBQT1NULCB0eXBlLCBhcmdzXG5cbiAgICAgICAgb25HZXQ6ICh0eXBlLCBjYikgLT5cbiAgICAgICAgICAgIEBnZXRDYWxsYmFja3NbdHlwZV0gPSBjYlxuICAgICAgICAgICAgQFxuXG4gICAgICAgIHNlbmRUb01haW46ICh0eXBlLCBhcmdsKSAtPlxuICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyBcInBvc3QgdG8gbWFpblwiIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgIGFyZ2wudW5zaGlmdCB0eXBlXG4gICAgICAgICAgICBAZW1pdC5hcHBseSBALCBhcmdsXG4gICAgICAgICAgICBAXG5cbiAgICAgICAgc2VuZFRvV2luczogKHR5cGUsIGFyZ2wsIGV4Y2VwdCkgLT5cbiAgICAgICAgICAgIGZvciB3aW4gaW4gcmVxdWlyZSgnZWxlY3Ryb24nKS5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuICAgICAgICAgICAgICAgIGlmIHdpbi5pZCAhPSBleGNlcHRcbiAgICAgICAgICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyBcInBvc3QgdG8gI3t3aW4uaWR9ICN7dHlwZX1cIiAjIGFyZ2wubWFwKChhKSAtPiBuZXcgU3RyaW5nKGEpKS5qb2luICcgJ1xuICAgICAgICAgICAgICAgICAgICB3aW4ud2ViQ29udGVudHMuc2VuZChQT1NULCB0eXBlLCBhcmdsKSBcbiAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICBkZWJ1ZzogKEBkYmc9dHJ1ZSkgLT5cbiAgICAgICAgICAgIGxvZyBcInBvc3QuZGVidWdcIiBAZGJnXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IG5ldyBQb3N0TWFpbigpXG4gICAgIl19
//# sourceURL=../coffee/ppost.coffee