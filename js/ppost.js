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

POST = '__POST__';

if (process.type === 'renderer') {
    electron = require('electron');
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
    electron = require('electron');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcG9zdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0RBQUE7SUFBQTs7Ozs7QUFPQSxDQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUNYLElBQUEsR0FBVzs7QUFFWCxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0lBRUksUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO0lBUUw7OztRQUVDLHNCQUFBOztZQUNDLDRDQUFBO1lBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxRQUFRLENBQUM7WUFDaEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsSUFBUixFQUFjLENBQUEsU0FBQSxLQUFBO3VCQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxJQUFkOzJCQUF1QixLQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxLQUFaLEVBQWUsQ0FBQyxJQUFELENBQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxDQUFmO2dCQUF2QjtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDtZQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixjQUF4QixFQUF1QyxJQUFDLENBQUEsT0FBeEM7UUFKRDs7K0JBTUgsT0FBQSxHQUFTLFNBQUE7WUFDTCxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsY0FBM0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxrQkFBTCxDQUF3QixJQUF4QjttQkFDQSxJQUFDLENBQUEsR0FBRCxHQUFPO1FBSEY7OytCQUtULEtBQUEsR0FBYSxTQUFBO0FBQW1CLGdCQUFBO1lBQWxCLHFCQUFNO21CQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sT0FBTixFQUFvQixJQUFwQixFQUEwQixJQUExQjtRQUFuQjs7K0JBQ2Is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MDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICBcbiMjI1xuXyAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5FbWl0dGVyICA9IHJlcXVpcmUgJ2V2ZW50cydcblBPU1QgICAgID0gJ19fUE9TVF9fJ1xuXG5pZiBwcm9jZXNzLnR5cGUgPT0gJ3JlbmRlcmVyJ1xuICAgIFxuICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgIFxuXG4gICAgY2xhc3MgUG9zdFJlbmRlcmVyIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgICAgIEA6IC0+XG4gICAgICAgICAgICBzdXBlcigpXG4gICAgICAgICAgICBAaXBjID0gZWxlY3Ryb24uaXBjUmVuZGVyZXJcbiAgICAgICAgICAgIEBpcGMub24gUE9TVCwgKGV2ZW50LCB0eXBlLCBhcmdsKSA9PiBAZW1pdC5hcHBseSBALCBbdHlwZV0uY29uY2F0IGFyZ2xcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdiZWZvcmV1bmxvYWQnIEBkaXNwb3NlXG5cbiAgICAgICAgZGlzcG9zZTogPT5cbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdiZWZvcmV1bmxvYWQnIEBkaXNwb3NlXG4gICAgICAgICAgICBAaXBjLnJlbW92ZUFsbExpc3RlbmVycyBQT1NUXG4gICAgICAgICAgICBAaXBjID0gbnVsbFxuXG4gICAgICAgIHRvQWxsOiAgICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvQWxsJyAgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvTWFpbjogICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvTWFpbicgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvT3RoZXJXaW5zOiAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvT3RoZXJXaW5zJyB0eXBlLCBhcmdzXG4gICAgICAgIFxuICAgICAgICBnZXQ6ICAgICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBpcGMuc2VuZFN5bmMgUE9TVCwgJ2dldCcgdHlwZSwgYXJnc1xuICAgICAgICAgICAgXG4gICAgICAgIHNlbmQ6IChyZWNlaXZlcnMsIHR5cGUsIGFyZ3MsIGlkKSAtPiBAaXBjPy5zZW5kIFBPU1QsIHJlY2VpdmVycywgdHlwZSwgYXJncywgaWRcblxuICAgIG1vZHVsZS5leHBvcnRzID0gbmV3IFBvc3RSZW5kZXJlcigpXG5cbmVsc2UgaWYgcHJvY2Vzcy50eXBlID09ICdicm93c2VyJ1xuXG4gICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGNsYXNzIFBvc3RNYWluIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgICAgIEA6IC0+XG4gICAgICAgICAgICBzdXBlcigpXG4gICAgICAgICAgICBAZ2V0Q2FsbGJhY2tzID0ge31cbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGlwYyA9IGVsZWN0cm9uLmlwY01haW5cbiAgICAgICAgICAgICAgICBpcGMub24gUE9TVCwgKGV2ZW50LCBraW5kLCB0eXBlLCBhcmdsKSA9PlxuICAgICAgICAgICAgICAgICAgICBpZCA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZnJvbVdlYkNvbnRlbnRzKGV2ZW50LnNlbmRlcikuaWRcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGtpbmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvQWxsJyAgICAgICB0aGVuIEBzZW5kVG9XaW5zKHR5cGUsIGFyZ2wpLnNlbmRUb01haW4odHlwZSwgYXJnbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvTWFpbicgICAgICB0aGVuIEBzZW5kVG9NYWluIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvT3RoZXJXaW5zJyB0aGVuIEBzZW5kVG9XaW5zIHR5cGUsIGFyZ2wsIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZSA9PSAnd2luSUQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIF8uaXNGdW5jdGlvbiBAZ2V0Q2FsbGJhY2tzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHZhbCA9IEBnZXRDYWxsYmFja3NbdHlwZV0uYXBwbHkgQGdldENhbGxiYWNrc1t0eXBlXSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IHJldHZhbCA/IFtdXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBrZXJyb3IgZXJyICMgdGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSB1c2VkIHdpdGhvdXQgZWxlY3Ryb24hXG5cbiAgICAgICAgdG9BbGw6ICAoICAgIHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kVG9XaW5zKHR5cGUsIGFyZ3MpOyBAc2VuZFRvTWFpbih0eXBlLCBhcmdzKVxuICAgICAgICB0b01haW46ICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb01haW4gdHlwZSwgYXJnc1xuICAgICAgICB0b1dpbnM6ICggICAgdHlwZSwgYXJncy4uLikgLT4gQHNlbmRUb1dpbnMgdHlwZSwgYXJnc1xuICAgICAgICB0b1dpbjogIChpZCwgdHlwZSwgYXJncy4uLikgLT4gXG4gICAgICAgICAgICBpZiBfLmlzTnVtYmVyKGlkKSB0aGVuIHcgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93LmZyb21JZCBpZFxuICAgICAgICAgICAgZWxzZSB3ID0gaWRcbiAgICAgICAgICAgIHc/LndlYkNvbnRlbnRzPy5zZW5kIFBPU1QsIHR5cGUsIGFyZ3NcblxuICAgICAgICBvbkdldDogKHR5cGUsIGNiKSAtPiBAZ2V0Q2FsbGJhY2tzW3R5cGVdID0gY2JcbiAgICAgICAgICAgIFxuICAgICAgICBnZXQ6ICh0eXBlKSAtPiBAZ2V0Q2FsbGJhY2tzW3R5cGVdKClcblxuICAgICAgICBzZW5kVG9NYWluOiAodHlwZSwgYXJnbCkgLT5cbiAgICAgICAgICAgIGFyZ2wudW5zaGlmdCB0eXBlXG4gICAgICAgICAgICBAZW1pdC5hcHBseSBALCBhcmdsXG5cbiAgICAgICAgc2VuZFRvV2luczogKHR5cGUsIGFyZ2wsIGV4Y2VwdCkgLT5cbiAgICAgICAgICAgIGZvciB3aW4gaW4gZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAgICAgICAgICAgICBpZiB3aW4uaWQgIT0gZXhjZXB0XG4gICAgICAgICAgICAgICAgICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKFBPU1QsIHR5cGUsIGFyZ2wpIFxuICAgICAgICAgICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBuZXcgUG9zdE1haW4oKVxuICAgIFxuIl19
//# sourceURL=../coffee/ppost.coffee