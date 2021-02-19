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
                            var ref, retval;
                            id = id || (event != null ? (ref = event.sender) != null ? ref.id : void 0 : void 0);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcG9zdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMERBQUE7SUFBQTs7Ozs7O0FBUUEsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixJQUFBLEdBQVU7O0FBRVYsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixVQUFuQjtJQUVJLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtJQUNYLE1BQUEsR0FBVyxRQUFRLENBQUM7SUFRZDs7O1FBRUMsc0JBQUE7O1lBQ0MsNENBQUE7WUFDQSxJQUFDLENBQUEsR0FBRCxHQUFPO1lBQ1AsSUFBQyxDQUFBLEVBQUQsR0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDO1lBQ2pDLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1lBQ2hCLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLElBQVIsRUFBYyxDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsSUFBZDsyQkFBdUIsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksS0FBWixFQUFlLENBQUMsSUFBRCxDQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsQ0FBZjtnQkFBdkI7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7WUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsY0FBeEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDO1FBTkQ7OytCQVFILE9BQUEsR0FBUyxTQUFBO1lBQ0wsTUFBTSxDQUFDLG1CQUFQLENBQTJCLGNBQTNCLEVBQTBDLElBQUMsQ0FBQSxPQUEzQztZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsa0JBQUwsQ0FBd0IsSUFBeEI7bUJBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTztRQUhGOzsrQkFL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SUFBQyxDQUFBLFlBQWEsQ0FBQSxJQUFBLENBQWQsR0FBc0I7bUJBQ3RCO1FBRkc7OzJCQUlQLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxJQUFQO1lBQ1IsSUFBRyxJQUFDLENBQUEsR0FBSjtnQkFBTSxPQUFBLENBQU8sR0FBUCxDQUFXLGNBQVgsRUFBMEIsSUFBMUIsRUFBZ0MsSUFBaEMsRUFBTjs7WUFDQSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWI7WUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxJQUFaLEVBQWUsSUFBZjttQkFDQTtRQUpROzsyQkFNWixVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE1BQWI7QUFDUixnQkFBQTtBQUFBO0FBQUEsaUJBQUEscUNBQUE7O2dCQUNJLElBQUcsR0FBRyxDQUFDLEVBQUosS0FBVSxNQUFiO29CQUNJLElBQUcsSUFBQyxDQUFBLEdBQUo7d0JBQU0sT0FBQSxDQUFPLEdBQVAsQ0FBVyxVQUFBLEdBQVcsR0FBRyxDQUFDLEVBQWYsR0FBa0IsR0FBbEIsR0FBcUIsSUFBaEMsRUFBTjs7b0JBQ0EsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixFQUEyQixJQUEzQixFQUFpQyxJQUFqQyxFQUZKOztBQURKO21CQUlBO1FBTFE7OzJCQU9aLEtBQUEsR0FBTyxTQUFDLEdBQUQ7WUFBQyxJQUFDLENBQUEsb0JBQUQsTUFBSzttQkFDVixPQUFBLENBQUMsR0FBRCxDQUFLLFlBQUwsRUFBa0IsSUFBQyxDQUFBLEdBQW5CO1FBREk7Ozs7T0FoRFk7SUFtRHZCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUksUUFBSixDQUFBLEVBM0dyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICBcbiMjI1xuXG5fICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuRW1pdHRlciA9IHJlcXVpcmUgJ2V2ZW50cydcblBPU1QgICAgPSAnX19QT1NUX18nXG5cbmlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG5cbiAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgIHJlbW90ZSAgID0gZWxlY3Ryb24ucmVtb3RlXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgICBcblxuICAgIGNsYXNzIFBvc3RSZW5kZXJlciBleHRlbmRzIEVtaXR0ZXJcblxuICAgICAgICBAOiAtPlxuICAgICAgICAgICAgc3VwZXIoKVxuICAgICAgICAgICAgQGRiZyA9IGZhbHNlXG4gICAgICAgICAgICBAaWQgID0gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5pZFxuICAgICAgICAgICAgQGlwYyA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyXG4gICAgICAgICAgICBAaXBjLm9uIFBPU1QsIChldmVudCwgdHlwZSwgYXJnbCkgPT4gQGVtaXQuYXBwbHkgQCwgW3R5cGVdLmNvbmNhdCBhcmdsXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnYmVmb3JldW5sb2FkJyBAZGlzcG9zZVxuXG4gICAgICAgIGRpc3Bvc2U6ID0+XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnYmVmb3JldW5sb2FkJyBAZGlzcG9zZVxuICAgICAgICAgICAgQGlwYy5yZW1vdmVBbGxMaXN0ZW5lcnMgUE9TVFxuICAgICAgICAgICAgQGlwYyA9IG51bGxcblxuICAgICAgICB0b0FsbDogICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b0FsbCcgICAgICAgdHlwZSwgYXJnc1xuICAgICAgICB0b090aGVyczogICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b090aGVycycgICAgdHlwZSwgYXJncywgQGlkXG4gICAgICAgIHRvTWFpbjogICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvTWFpbicgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvT3RoZXJXaW5zOiAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvT3RoZXJXaW5zJyB0eXBlLCBhcmdzLCBAaWRcbiAgICAgICAgdG9XaW5zOiAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9XaW5zJyAgICAgIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9XaW46ICAgKGlkLCB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9XaW4nICAgICAgIHR5cGUsIGFyZ3MsIGlkXG4gICAgICAgIFxuICAgICAgICBnZXQ6ICAgICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBpcGMuc2VuZFN5bmMgUE9TVCwgJ2dldCcgdHlwZSwgYXJnc1xuXG4gICAgICAgIGRlYnVnOiAoQGRiZz1bJ2VtaXQnICd0b0FsbCcgJ3RvT3RoZXJzJyAndG9NYWluJyAndG9PdGhlcldpbnMnICd0b1dpbnMnICd0b1dpbiddKSAtPlxuICAgICAgICAgICAgbG9nIFwicG9zdC5kZWJ1ZyBpZDoje0BpZH1cIiBAZGJnXG5cbiAgICAgICAgZW1pdDogKHR5cGUsIGFyZ3MuLi4pIC0+IFxuICAgICAgICAgICAgaWYgJ2VtaXQnIGluIEBkYmcgdGhlbiBsb2cgXCJwb3N0LmVtaXQgI3t0eXBlfVwiIGFyZ3MubWFwKChhKSAtPiBuZXcgU3RyaW5nKGEpKS5qb2luICcgJ1xuICAgICAgICAgICAgc3VwZXIgYXJndW1lbnRzLi4uXG4gICAgICAgICAgICBcbiAgICAgICAgc2VuZDogKHJlY2VpdmVycywgdHlwZSwgYXJncywgaWQpIC0+XG4gICAgICAgICAgICBpZiByZWNlaXZlcnMgaW4gQGRiZyB0aGVuIGxvZyBcInBvc3QuI3tyZWNlaXZlcnN9ICN7dHlwZX1cIiBhcmdzLm1hcCgoYSkgLT4gbmV3IFN0cmluZyhhKSkuam9pbiAnICdcbiAgICAgICAgICAgIEBpcGM/LnNlbmQgUE9TVCwgcmVjZWl2ZXJzLCB0eXBlLCBhcmdzLCBpZFxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBuZXcgUG9zdFJlbmRlcmVyKClcblxuZWxzZVxuXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBjbGFzcyBQb3N0TWFpbiBleHRlbmRzIEVtaXR0ZXJcblxuICAgICAgICBAOiAtPlxuICAgICAgICAgICAgc3VwZXIoKVxuICAgICAgICAgICAgQGdldENhbGxiYWNrcyA9IHt9XG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpcGMgPSByZXF1aXJlKCdlbGVjdHJvbicpLmlwY01haW5cbiAgICAgICAgICAgICAgICBpcGM/Lm9uIFBPU1QsIChldmVudCwga2luZCwgdHlwZSwgYXJnbCwgaWQpID0+XG4gICAgICAgICAgICAgICAgICAgIGlkID0gaWQgb3IgZXZlbnQ/LnNlbmRlcj8uaWRcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGtpbmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvTWFpbicgICAgICB0aGVuIEBzZW5kVG9NYWluIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvQWxsJyAgICAgICB0aGVuIEBzZW5kVG9XaW5zKHR5cGUsIGFyZ2wpLnNlbmRUb01haW4odHlwZSwgYXJnbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvT3RoZXJzJyAgICB0aGVuIEBzZW5kVG9XaW5zKHR5cGUsIGFyZ2wsIGlkKS5zZW5kVG9NYWluKHR5cGUsIGFyZ2wpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b090aGVyV2lucycgdGhlbiBAc2VuZFRvV2lucyB0eXBlLCBhcmdsLCBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9XaW5zJyAgICAgIHRoZW4gQHNlbmRUb1dpbnMgdHlwZSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9XaW4nICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBsb2cgJ3RvIHdpbicgaWQsIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdG9XaW4uYXBwbHkgQCwgW2lkLCB0eXBlXS5jb25jYXQgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZ2V0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBsb2cgJ3Bvc3QgZ2V0JyB0eXBlLCBhcmdsLCBAZ2V0Q2FsbGJhY2tzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIEBnZXRDYWxsYmFja3NbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dmFsID0gQGdldENhbGxiYWNrc1t0eXBlXS5hcHBseSBAZ2V0Q2FsbGJhY2tzW3R5cGVdLCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gcmV0dmFsID8gW11cbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIG51bGwgIyBkb24ndCBsb2cgZXJyb3IgaGVyZSAodGhpcyBnZXRzIGNhbGxlZCBmb3Igbm9uLWVsZWN0cm9uIHNjcmlwdHMgYXMgd2VsbClcblxuICAgICAgICB0b0FsbDogICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb1dpbnModHlwZSwgYXJncykuc2VuZFRvTWFpbih0eXBlLCBhcmdzKVxuICAgICAgICB0b01haW46ICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb01haW4gdHlwZSwgYXJnc1xuICAgICAgICB0b1dpbnM6ICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb1dpbnMgdHlwZSwgYXJnc1xuICAgICAgICB0b1dpbjogIChpZCwgdHlwZSwgYXJncy4uLikgLT4gcmVxdWlyZSgnZWxlY3Ryb24nKS5Ccm93c2VyV2luZG93LmZyb21JZChpZCk/LndlYkNvbnRlbnRzLnNlbmQgUE9TVCwgdHlwZSwgYXJnc1xuXG4gICAgICAgIG9uR2V0OiAodHlwZSwgY2IpIC0+XG4gICAgICAgICAgICBAZ2V0Q2FsbGJhY2tzW3R5cGVdID0gY2JcbiAgICAgICAgICAgIEBcblxuICAgICAgICBzZW5kVG9NYWluOiAodHlwZSwgYXJnbCkgLT5cbiAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBsb2cgXCJwb3N0IHRvIG1haW5cIiB0eXBlLCBhcmdsXG4gICAgICAgICAgICBhcmdsLnVuc2hpZnQgdHlwZVxuICAgICAgICAgICAgQGVtaXQuYXBwbHkgQCwgYXJnbFxuICAgICAgICAgICAgQFxuXG4gICAgICAgIHNlbmRUb1dpbnM6ICh0eXBlLCBhcmdsLCBleGNlcHQpIC0+XG4gICAgICAgICAgICBmb3Igd2luIGluIHJlcXVpcmUoJ2VsZWN0cm9uJykuQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAgICAgICAgICAgICBpZiB3aW4uaWQgIT0gZXhjZXB0XG4gICAgICAgICAgICAgICAgICAgIGlmIEBkYmcgdGhlbiBsb2cgXCJwb3N0IHRvICN7d2luLmlkfSAje3R5cGV9XCIgIyBhcmdsLm1hcCgoYSkgLT4gbmV3IFN0cmluZyhhKSkuam9pbiAnICdcbiAgICAgICAgICAgICAgICAgICAgd2luLndlYkNvbnRlbnRzLnNlbmQoUE9TVCwgdHlwZSwgYXJnbCkgXG4gICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgZGVidWc6IChAZGJnPXRydWUpIC0+XG4gICAgICAgICAgICBsb2cgXCJwb3N0LmRlYnVnXCIgQGRiZ1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBuZXcgUG9zdE1haW4oKVxuICAgICJdfQ==
//# sourceURL=../coffee/ppost.coffee