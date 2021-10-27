// koffee 1.14.0

/*
00000000    0000000    0000000  000000000    
000   000  000   000  000          000       
00000000   000   000  0000000      000       
000        000   000       000     000       
000         0000000   0000000      000
 */
var Emitter, POST, PostMain, PostRenderer, _, electron,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

_ = require('lodash');

Emitter = require('events');

electron = require('electron');

POST = '__POST__';

if (process.type === 'renderer') {
    PostRenderer = (function(superClass) {
        extend(PostRenderer, superClass);

        function PostRenderer() {
            this.dispose = bind(this.dispose, this);
            PostRenderer.__super__.constructor.call(this);
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

        PostRenderer.prototype.send = function(receivers, type, args, id) {
            var ref;
            return (ref = this.ipc) != null ? ref.send(POST, receivers, type, args, id) : void 0;
        };

        return PostRenderer;

    })(Emitter);
    module.exports = new PostRenderer();
} else if (process.type === 'browser') {
    PostMain = (function(superClass) {
        extend(PostMain, superClass);

        function PostMain() {
            var err, ipc;
            PostMain.__super__.constructor.call(this);
            this.getCallbacks = {};
            try {
                ipc = electron.ipcMain;
                ipc.on(POST, (function(_this) {
                    return function(event, kind, type, argl) {
                        var id, retval;
                        id = electron.BrowserWindow.fromWebContents(event.sender).id;
                        switch (kind) {
                            case 'toAll':
                                return _this.sendToWins(type, argl).sendToMain(type, argl);
                            case 'toMain':
                                return _this.sendToMain(type, argl);
                            case 'toOtherWins':
                                return _this.sendToWins(type, argl, id);
                            case 'get':
                                if (type === 'winID') {
                                    return event.returnValue = id;
                                } else if (_.isFunction(_this.getCallbacks[type])) {
                                    retval = _this.getCallbacks[type].apply(_this.getCallbacks[type], argl);
                                    return event.returnValue = retval != null ? retval : [];
                                }
                        }
                    };
                })(this));
            } catch (error) {
                err = error;
                kerror(err);
            }
        }

        PostMain.prototype.toAll = function() {
            var args, type;
            type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            this.sendToWins(type, args);
            return this.sendToMain(type, args);
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
            var args, id, ref, type, w;
            id = arguments[0], type = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
            if (_.isNumber(id)) {
                w = electron.BrowserWindow.fromId(id);
            } else {
                w = id;
            }
            return w != null ? (ref = w.webContents) != null ? ref.send(POST, type, args) : void 0 : void 0;
        };

        PostMain.prototype.onGet = function(type, cb) {
            return this.getCallbacks[type] = cb;
        };

        PostMain.prototype.get = function(type) {
            return this.getCallbacks[type]();
        };

        PostMain.prototype.sendToMain = function(type, argl) {
            argl.unshift(type);
            return this.emit.apply(this, argl);
        };

        PostMain.prototype.sendToWins = function(type, argl, except) {
            var i, len, ref, results, win;
            ref = electron.BrowserWindow.getAllWindows();
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
                win = ref[i];
                if (win.id !== except) {
                    results.push(win.webContents.send(POST, type, argl));
                } else {
                    results.push(void 0);
                }
            }
            return results;
        };

        return PostMain;

    })(Emitter);
    module.exports = new PostMain();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcG9zdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0RBQUE7SUFBQTs7Ozs7QUFPQSxDQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxJQUFBLEdBQVc7O0FBRVgsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixVQUFuQjtJQVFVOzs7UUFFQyxzQkFBQTs7WUFDQyw0Q0FBQTtZQUNBLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1lBQ2hCLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLElBQVIsRUFBYyxDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsSUFBZDsyQkFBdUIsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksS0FBWixFQUFlLENBQUMsSUFBRCxDQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsQ0FBZjtnQkFBdkI7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7WUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsY0FBeEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDO1FBSkQ7OytCQU1ILE9BQUEsR0FBUyxTQUFBO1lBQ0wsTUFBTSxDQUFDLG1CQUFQLENBQTJCLGNBQTNCLEVBQTBDLElBQUMsQ0FBQSxPQUEzQztZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsa0JBQUwsQ0FBd0IsSUFBeEI7bUJBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTztRQUhGOzsrQkFLVCxLQUFBLEdBQWEsU0FBQTtBQUFtQixnQkFBQTtZQUFsQixxQkFBTTttQkFBWSxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQU4sRUFBb0IsSUFBcEIsRUFBMEIsSUFBMUI7UUFBbkI7OytCQUNi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MCAgMDAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgXG4jIyNcbl8gICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuRW1pdHRlciAgPSByZXF1aXJlICdldmVudHMnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuUE9TVCAgICAgPSAnX19QT1NUX18nXG5cbmlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgIFxuXG4gICAgY2xhc3MgUG9zdFJlbmRlcmVyIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgICAgIEA6IC0+XG4gICAgICAgICAgICBzdXBlcigpXG4gICAgICAgICAgICBAaXBjID0gZWxlY3Ryb24uaXBjUmVuZGVyZXJcbiAgICAgICAgICAgIEBpcGMub24gUE9TVCwgKGV2ZW50LCB0eXBlLCBhcmdsKSA9PiBAZW1pdC5hcHBseSBALCBbdHlwZV0uY29uY2F0IGFyZ2xcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdiZWZvcmV1bmxvYWQnIEBkaXNwb3NlXG5cbiAgICAgICAgZGlzcG9zZTogPT5cbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdiZWZvcmV1bmxvYWQnIEBkaXNwb3NlXG4gICAgICAgICAgICBAaXBjLnJlbW92ZUFsbExpc3RlbmVycyBQT1NUXG4gICAgICAgICAgICBAaXBjID0gbnVsbFxuXG4gICAgICAgIHRvQWxsOiAgICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvQWxsJyAgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvTWFpbjogICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvTWFpbicgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvT3RoZXJXaW5zOiAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvT3RoZXJXaW5zJyB0eXBlLCBhcmdzXG4gICAgICAgIFxuICAgICAgICBnZXQ6ICAgICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBpcGMuc2VuZFN5bmMgUE9TVCwgJ2dldCcgdHlwZSwgYXJnc1xuICAgICAgICAgICAgXG4gICAgICAgIHNlbmQ6IChyZWNlaXZlcnMsIHR5cGUsIGFyZ3MsIGlkKSAtPiBAaXBjPy5zZW5kIFBPU1QsIHJlY2VpdmVycywgdHlwZSwgYXJncywgaWRcblxuICAgIG1vZHVsZS5leHBvcnRzID0gbmV3IFBvc3RSZW5kZXJlcigpXG5cbmVsc2UgaWYgcHJvY2Vzcy50eXBlID09ICdicm93c2VyJ1xuXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBjbGFzcyBQb3N0TWFpbiBleHRlbmRzIEVtaXR0ZXJcblxuICAgICAgICBAOiAtPlxuICAgICAgICAgICAgc3VwZXIoKVxuICAgICAgICAgICAgQGdldENhbGxiYWNrcyA9IHt9XG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpcGMgPSBlbGVjdHJvbi5pcGNNYWluXG4gICAgICAgICAgICAgICAgaXBjLm9uIFBPU1QsIChldmVudCwga2luZCwgdHlwZSwgYXJnbCkgPT5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93LmZyb21XZWJDb250ZW50cyhldmVudC5zZW5kZXIpLmlkXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBraW5kXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b0FsbCcgICAgICAgdGhlbiBAc2VuZFRvV2lucyh0eXBlLCBhcmdsKS5zZW5kVG9NYWluKHR5cGUsIGFyZ2wpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b01haW4nICAgICAgdGhlbiBAc2VuZFRvTWFpbiB0eXBlLCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b090aGVyV2lucycgdGhlbiBAc2VuZFRvV2lucyB0eXBlLCBhcmdsLCBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZ2V0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGUgPT0gJ3dpbklEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBfLmlzRnVuY3Rpb24gQGdldENhbGxiYWNrc1t0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR2YWwgPSBAZ2V0Q2FsbGJhY2tzW3R5cGVdLmFwcGx5IEBnZXRDYWxsYmFja3NbdHlwZV0sIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSByZXR2YWwgPyBbXVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAga2Vycm9yIGVyciAjIHRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgdXNlZCB3aXRob3V0IGVsZWN0cm9uIVxuXG4gICAgICAgIHRvQWxsOiAgKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvV2lucyh0eXBlLCBhcmdzKTsgQHNlbmRUb01haW4odHlwZSwgYXJncylcbiAgICAgICAgdG9NYWluOiAoICAgIHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kVG9NYWluIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9XaW5zOiAoICAgIHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kVG9XaW5zIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9XaW46ICAoaWQsIHR5cGUsIGFyZ3MuLi4pIC0+IFxuICAgICAgICAgICAgaWYgXy5pc051bWJlcihpZCkgdGhlbiB3ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcbiAgICAgICAgICAgIGVsc2UgdyA9IGlkXG4gICAgICAgICAgICB3Py53ZWJDb250ZW50cz8uc2VuZCBQT1NULCB0eXBlLCBhcmdzXG5cbiAgICAgICAgb25HZXQ6ICh0eXBlLCBjYikgLT4gQGdldENhbGxiYWNrc1t0eXBlXSA9IGNiXG4gICAgICAgICAgICBcbiAgICAgICAgZ2V0OiAodHlwZSkgLT4gQGdldENhbGxiYWNrc1t0eXBlXSgpXG5cbiAgICAgICAgc2VuZFRvTWFpbjogKHR5cGUsIGFyZ2wpIC0+XG4gICAgICAgICAgICBhcmdsLnVuc2hpZnQgdHlwZVxuICAgICAgICAgICAgQGVtaXQuYXBwbHkgQCwgYXJnbFxuXG4gICAgICAgIHNlbmRUb1dpbnM6ICh0eXBlLCBhcmdsLCBleGNlcHQpIC0+XG4gICAgICAgICAgICBmb3Igd2luIGluIGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgICAgICAgICAgaWYgd2luLmlkICE9IGV4Y2VwdFxuICAgICAgICAgICAgICAgICAgICB3aW4ud2ViQ29udGVudHMuc2VuZChQT1NULCB0eXBlLCBhcmdsKSBcbiAgICAgICAgICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gbmV3IFBvc3RNYWluKClcbiAgICBcbiJdfQ==
//# sourceURL=../coffee/ppost.coffee