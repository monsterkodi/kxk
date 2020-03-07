// koffee 1.12.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHBvc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcG9zdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMERBQUE7SUFBQTs7Ozs7O0FBUUEsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixJQUFBLEdBQVU7O0FBRVYsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixVQUFuQjtJQUVJLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtJQUNYLE1BQUEsR0FBVyxRQUFRLENBQUM7SUFRZDs7O1FBRUMsc0JBQUE7O1lBQ0MsNENBQUE7WUFDQSxJQUFDLENBQUEsR0FBRCxHQUFPO1lBQ1AsSUFBQyxDQUFBLEVBQUQsR0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDO1lBQ2pDLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO1lBQ2hCLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLElBQVIsRUFBYyxDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsSUFBZDsyQkFBdUIsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksS0FBWixFQUFlLENBQUMsSUFBRCxDQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsQ0FBZjtnQkFBdkI7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7WUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsY0FBeEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDO1FBTkQ7OytCQVFILE9BQUEsR0FBUyxTQUFBO1lBQ0wsTUFBTSxDQUFDLG1CQUFQLENBQTJCLGNBQTNCLEVBQTBDLElBQUMsQ0FBQSxPQUEzQztZQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsa0JBQUwsQ0FBd0IsSUFBeEI7bUJBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTztRQUhGOzsrQkFLVCxLQUFBLEdBQWEsU0FBQTtBQUFtQixnQkFBQTtZQUFsQixxQkFBTTttQkFBWSxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQU4sRUFBb0IsSUFBcEIsRUFBMEIsSUFBMUI7UUFBbkI7OytCQUNiLFFBQUEsR0FBYSxTQUFBO0FBQW1CLGdCQUFBO1lBQWxCLHFCQUFNO21CQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sVUFBTixFQUFvQixJQUFwQixFQUEwQixJQUExQixFQUFnQyxJQUFDLENBQUEsRUFBakM7UUFBbkI7OytCQUNiLE1BQUEsR0FBYSxTQUFBO0FBQW1CLGdCQUFBO1lBQWxCLHFCQUFNO21CQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUFvQixJQUFwQixFQUEwQixJQUExQjtRQUFuQjs7K0JBQ2IsV0FBQSxHQUFhLFNBQUE7QUFBbUIsZ0JBQUE7WUFBbEIscUJBQU07bUJBQVksSUFBQyxDQUFBLElBQUQsQ0FBTSxhQUFOLEVBQW9CLElBQXBCLEVBQTBCLElBQTFCLEVBQWdDLElBQUMsQ0FBQSxFQUFqQztRQUFuQjs7K0JBQ2IsTUFBQSxHQUFhLFNBQUE7QUFBbUIsZ0JBQUE7WUFBbEIscUJBQU07bUJBQVksSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQW9CLElBQXBCLEVBQTBCLElBQTFCO1FBQW5COzsrQkFDYixLQUFBLEdBQVMsU0FBQTtBQUF1QixnQkFBQTtZQUF0QixtQkFBSSxxQkFBTTttQkFBWSxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQU4sRUFBb0IsSUFBcEIsRUFBMEIsSUFBMUIsRUFBZ0MsRUFBaEM7UUFBdkI7OytCQUVULEdBQUEsR0FBYSxTQUFBO0FBQW1CLGdCQUFBO1lBQWxCLHFCQUFNO21CQUFZLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLElBQWQsRUFBb0IsS0FBcEIsRUFBMEIsSUFBMUIsRUFBZ0MsSUFBaEM7UUFBbkI7OytCQUViLEtBQUEsR0FBTyxTQUFDLEdBQUQ7WUFBQyxJQUFDLENBQUEsb0JBQUQsTUFBSyxDQUFDLE1BQUQsRUFBUSxPQUFSLEVBQWdCLFVBQWhCLEVBQTJCLFFBQTNCLEVBQW9DLGFBQXBDLEVBQWtELFFBQWxELEVBQTJELE9BQTNEO21CQUNWLE9BQUEsQ0FBQyxHQUFELENBQUssZ0JBQUEsR0FBaUIsSUFBQyxDQUFBLEVBQXZCLEVBQTRCLElBQUMsQ0FBQSxHQUE3QjtRQURJOzsrQkFHUCxJQUFBLEdBQU0sU0FBQTtBQUNGLGdCQUFBO1lBREcscUJBQU07WUFDVCxJQUFHLGFBQVUsSUFBQyxDQUFBLEdBQVgsRUFBQSxNQUFBLE1BQUg7Z0JBQWdCLE9BQUEsQ0FBTyxHQUFQLENBQVcsWUFBQSxHQUFhLElBQXhCLEVBQStCLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBQyxDQUFEOzJCQUFPLElBQUksTUFBSixDQUFXLENBQVg7Z0JBQVAsQ0FBVCxDQUE4QixDQUFDLElBQS9CLENBQW9DLEdBQXBDLENBQS9CLEVBQWhCOzttQkFDQSx3Q0FBTSxTQUFOO1FBRkU7OytCQUlOLElBQUEsR0FBTSxTQUFDLFNBQUQsRUFBWSxJQUFaLEVBQWtCLElBQWxCLEVBQXdCLEVBQXhCO0FBQ0YsZ0JBQUE7WUFBQSxJQUFHLGFBQWEsSUFBQyxDQUFBLEdBQWQsRUFBQSxTQUFBLE1BQUg7Z0JBQW1CLE9BQUEsQ0FBTyxHQUFQLENBQVcsT0FBQSxHQUFRLFNBQVIsR0FBa0IsR0FBbEIsR0FBcUIsSUFBaEMsRUFBdUMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLENBQUQ7MkJBQU8sSUFBSSxNQUFKLENBQVcsQ0FBWDtnQkFBUCxDQUFULENBQThCLENBQUMsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBdkMsRUFBbkI7O2lEQUNJLENBQUUsSUFBTixDQUFXLElBQVgsRUFBaUIsU0FBakIsRUFBNEIsSUFBNUIsRUFBa0MsSUFBbEMsRUFBd0MsRUFBeEM7UUFGRTs7OztPQS9CaUI7SUFtQzNCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUksWUFBSixDQUFBLEVBOUNyQjtDQUFBLE1BQUE7SUF3RFU7OztRQUVDLGtCQUFBO0FBQ0MsZ0JBQUE7WUFBQSx3Q0FBQTtZQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCO0FBQ2hCO2dCQUNJLEdBQUEsR0FBTSxPQUFBLENBQVEsVUFBUixDQUFtQixDQUFDOztvQkFDMUIsR0FBRyxDQUFFLEVBQUwsQ0FBUSxJQUFSLEVBQWMsQ0FBQSxTQUFBLEtBQUE7K0JBQUEsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLElBQWQsRUFBb0IsSUFBcEIsRUFBMEIsRUFBMUI7QUFDVixnQ0FBQTs0QkFBQSxFQUFBLEdBQUssRUFBQSxJQUFNLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDeEIsb0NBQU8sSUFBUDtBQUFBLHFDQUNTLFFBRFQ7MkNBQzRCLEtBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixJQUFsQjtBQUQ1QixxQ0FFUyxPQUZUOzJDQUU0QixLQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsSUFBbEIsQ0FBdUIsQ0FBQyxVQUF4QixDQUFtQyxJQUFuQyxFQUF5QyxJQUF6QztBQUY1QixxQ0FHUyxVQUhUOzJDQUc0QixLQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsSUFBbEIsRUFBd0IsRUFBeEIsQ0FBMkIsQ0FBQyxVQUE1QixDQUF1QyxJQUF2QyxFQUE2QyxJQUE3QztBQUg1QixxQ0FJUyxhQUpUOzJDQUk0QixLQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsSUFBbEIsRUFBd0IsRUFBeEI7QUFKNUIscUNBS1MsUUFMVDsyQ0FLNEIsS0FBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO0FBTDVCLHFDQU1TLE9BTlQ7b0NBT1EsSUFBRyxLQUFDLENBQUEsR0FBSjt3Q0FBTSxPQUFBLENBQU8sR0FBUCxDQUFXLFFBQVgsRUFBb0IsRUFBcEIsRUFBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBTjs7MkNBQ0EsS0FBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQWEsS0FBYixFQUFnQixDQUFDLEVBQUQsRUFBSyxJQUFMLENBQVUsQ0FBQyxNQUFYLENBQWtCLElBQWxCLENBQWhCO0FBUlIscUNBU1MsS0FUVDtvQ0FVUSxJQUFHLEtBQUMsQ0FBQSxHQUFKO3dDQUFNLE9BQUEsQ0FBTyxHQUFQLENBQVcsVUFBWCxFQUFzQixJQUF0QixFQUE0QixJQUE1QixFQUFrQyxLQUFDLENBQUEsWUFBYSxDQUFBLElBQUEsQ0FBaEQsRUFBTjs7b0NBQ0EsSUFBRyxDQUFDLENBQUMsVUFBRixDQUFhLEtBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQSxDQUEzQixDQUFIO3dDQUNJLE1BQUEsR0FBUyxLQUFDLENBQUEsWUFBYSxDQUFBLElBQUEsQ0FBSyxDQUFDLEtBQXBCLENBQTBCLEtBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQSxDQUF4QyxFQUErQyxJQUEvQzsrQ0FDVCxLQUFLLENBQUMsV0FBTixvQkFBb0IsU0FBUyxHQUZqQzs7QUFYUjt3QkFGVTtvQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7aUJBRko7YUFBQSxhQUFBO2dCQWtCTTtnQkFDRixLQW5CSjs7UUFIRDs7MkJBd0JILEtBQUEsR0FBUSxTQUFBO0FBQXVCLGdCQUFBO1lBQWxCLHFCQUFNO21CQUFZLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixJQUFsQixDQUF1QixDQUFDLFVBQXhCLENBQW1DLElBQW5DLEVBQXlDLElBQXpDO1FBQXZCOzsyQkFDUixNQUFBLEdBQVEsU0FBQTtBQUF1QixnQkFBQTtZQUFsQixxQkFBTTttQkFBWSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsSUFBbEI7UUFBdkI7OzJCQUNSLE1BQUEsR0FBUSxTQUFBO0FBQXVCLGdCQUFBO1lBQWxCLHFCQUFNO21CQUFZLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixJQUFsQjtRQUF2Qjs7MkJBQ1IsS0FBQSxHQUFRLFNBQUE7QUFBdUIsZ0JBQUE7WUFBdEIsbUJBQUkscUJBQU07cUZBQXdELENBQUUsV0FBVyxDQUFDLElBQTFELENBQStELElBQS9ELEVBQXFFLElBQXJFLEVBQTJFLElBQTNFO1FBQXZCOzsyQkFFUixLQUFBLEdBQU8sU0FBQyxJQUFELEVBQU8sRUFBUDtZQUNILElBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQSxDQUFkLEdBQXNCO21CQUN0QjtRQUZHOzsyQkFJUCxVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sSUFBUDtZQUNSLElBQUcsSUFBQyxDQUFBLEdBQUo7Z0JBQU0sT0FBQSxDQUFPLEdBQVAsQ0FBVyxjQUFYLEVBQTBCLElBQTFCLEVBQWdDLElBQWhDLEVBQU47O1lBQ0EsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiO1lBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWixFQUFlLElBQWY7bUJBQ0E7UUFKUTs7MkJBTVosVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxNQUFiO0FBQ1IsZ0JBQUE7QUFBQTtBQUFBLGlCQUFBLHFDQUFBOztnQkFDSSxJQUFHLEdBQUcsQ0FBQyxFQUFKLEtBQVUsTUFBYjtvQkFDSSxJQUFHLElBQUMsQ0FBQSxHQUFKO3dCQUFNLE9BQUEsQ0FBTyxHQUFQLENBQVcsVUFBQSxHQUFXLEdBQUcsQ0FBQyxFQUFmLEdBQWtCLEdBQWxCLEdBQXFCLElBQWhDLEVBQU47O29CQUNBLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsSUFBM0IsRUFBaUMsSUFBakMsRUFGSjs7QUFESjttQkFJQTtRQUxROzsyQkFPWixLQUFBLEdBQU8sU0FBQyxHQUFEO1lBQUMsSUFBQyxDQUFBLG9CQUFELE1BQUs7bUJBQ1YsT0FBQSxDQUFDLEdBQUQsQ0FBSyxZQUFMLEVBQWtCLElBQUMsQ0FBQSxHQUFuQjtRQURJOzs7O09BaERZO0lBbUR2QixNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFJLFFBQUosQ0FBQSxFQTNHckIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgXG4jIyNcblxuXyAgICAgICA9IHJlcXVpcmUgJ2xvZGFzaCdcbkVtaXR0ZXIgPSByZXF1aXJlICdldmVudHMnXG5QT1NUICAgID0gJ19fUE9TVF9fJ1xuXG5pZiBwcm9jZXNzLnR5cGUgPT0gJ3JlbmRlcmVyJ1xuXG4gICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICByZW1vdGUgICA9IGVsZWN0cm9uLnJlbW90ZVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgICAgXG5cbiAgICBjbGFzcyBQb3N0UmVuZGVyZXIgZXh0ZW5kcyBFbWl0dGVyXG5cbiAgICAgICAgQDogLT5cbiAgICAgICAgICAgIHN1cGVyKClcbiAgICAgICAgICAgIEBkYmcgPSBmYWxzZVxuICAgICAgICAgICAgQGlkICA9IHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkuaWRcbiAgICAgICAgICAgIEBpcGMgPSBlbGVjdHJvbi5pcGNSZW5kZXJlclxuICAgICAgICAgICAgQGlwYy5vbiBQT1NULCAoZXZlbnQsIHR5cGUsIGFyZ2wpID0+IEBlbWl0LmFwcGx5IEAsIFt0eXBlXS5jb25jYXQgYXJnbFxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2JlZm9yZXVubG9hZCcgQGRpc3Bvc2VcblxuICAgICAgICBkaXNwb3NlOiA9PlxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2JlZm9yZXVubG9hZCcgQGRpc3Bvc2VcbiAgICAgICAgICAgIEBpcGMucmVtb3ZlQWxsTGlzdGVuZXJzIFBPU1RcbiAgICAgICAgICAgIEBpcGMgPSBudWxsXG5cbiAgICAgICAgdG9BbGw6ICAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9BbGwnICAgICAgIHR5cGUsIGFyZ3NcbiAgICAgICAgdG9PdGhlcnM6ICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZCAndG9PdGhlcnMnICAgIHR5cGUsIGFyZ3MsIEBpZFxuICAgICAgICB0b01haW46ICAgICAgKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b01haW4nICAgICAgdHlwZSwgYXJnc1xuICAgICAgICB0b090aGVyV2luczogKHR5cGUsIGFyZ3MuLi4pIC0+IEBzZW5kICd0b090aGVyV2lucycgdHlwZSwgYXJncywgQGlkXG4gICAgICAgIHRvV2luczogICAgICAodHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvV2lucycgICAgICB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luOiAgIChpZCwgdHlwZSwgYXJncy4uLikgLT4gQHNlbmQgJ3RvV2luJyAgICAgICB0eXBlLCBhcmdzLCBpZFxuICAgICAgICBcbiAgICAgICAgZ2V0OiAgICAgICAgICh0eXBlLCBhcmdzLi4uKSAtPiBAaXBjLnNlbmRTeW5jIFBPU1QsICdnZXQnIHR5cGUsIGFyZ3NcblxuICAgICAgICBkZWJ1ZzogKEBkYmc9WydlbWl0JyAndG9BbGwnICd0b090aGVycycgJ3RvTWFpbicgJ3RvT3RoZXJXaW5zJyAndG9XaW5zJyAndG9XaW4nXSkgLT5cbiAgICAgICAgICAgIGxvZyBcInBvc3QuZGVidWcgaWQ6I3tAaWR9XCIgQGRiZ1xuXG4gICAgICAgIGVtaXQ6ICh0eXBlLCBhcmdzLi4uKSAtPiBcbiAgICAgICAgICAgIGlmICdlbWl0JyBpbiBAZGJnIHRoZW4gbG9nIFwicG9zdC5lbWl0ICN7dHlwZX1cIiBhcmdzLm1hcCgoYSkgLT4gbmV3IFN0cmluZyhhKSkuam9pbiAnICdcbiAgICAgICAgICAgIHN1cGVyIGFyZ3VtZW50cy4uLlxuICAgICAgICAgICAgXG4gICAgICAgIHNlbmQ6IChyZWNlaXZlcnMsIHR5cGUsIGFyZ3MsIGlkKSAtPlxuICAgICAgICAgICAgaWYgcmVjZWl2ZXJzIGluIEBkYmcgdGhlbiBsb2cgXCJwb3N0LiN7cmVjZWl2ZXJzfSAje3R5cGV9XCIgYXJncy5tYXAoKGEpIC0+IG5ldyBTdHJpbmcoYSkpLmpvaW4gJyAnXG4gICAgICAgICAgICBAaXBjPy5zZW5kIFBPU1QsIHJlY2VpdmVycywgdHlwZSwgYXJncywgaWRcblxuICAgIG1vZHVsZS5leHBvcnRzID0gbmV3IFBvc3RSZW5kZXJlcigpXG5cbmVsc2VcblxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgY2xhc3MgUG9zdE1haW4gZXh0ZW5kcyBFbWl0dGVyXG5cbiAgICAgICAgQDogLT5cbiAgICAgICAgICAgIHN1cGVyKClcbiAgICAgICAgICAgIEBnZXRDYWxsYmFja3MgPSB7fVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgaXBjID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5pcGNNYWluXG4gICAgICAgICAgICAgICAgaXBjPy5vbiBQT1NULCAoZXZlbnQsIGtpbmQsIHR5cGUsIGFyZ2wsIGlkKSA9PlxuICAgICAgICAgICAgICAgICAgICBpZCA9IGlkIG9yIGV2ZW50LnNlbmRlci5pZFxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gga2luZFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9NYWluJyAgICAgIHRoZW4gQHNlbmRUb01haW4gdHlwZSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9BbGwnICAgICAgIHRoZW4gQHNlbmRUb1dpbnModHlwZSwgYXJnbCkuc2VuZFRvTWFpbih0eXBlLCBhcmdsKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndG9PdGhlcnMnICAgIHRoZW4gQHNlbmRUb1dpbnModHlwZSwgYXJnbCwgaWQpLnNlbmRUb01haW4odHlwZSwgYXJnbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RvT3RoZXJXaW5zJyB0aGVuIEBzZW5kVG9XaW5zIHR5cGUsIGFyZ2wsIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b1dpbnMnICAgICAgdGhlbiBAc2VuZFRvV2lucyB0eXBlLCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0b1dpbicgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyAndG8gd2luJyBpZCwgdHlwZSwgYXJnbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEB0b1dpbi5hcHBseSBALCBbaWQsIHR5cGVdLmNvbmNhdCBhcmdsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyAncG9zdCBnZXQnIHR5cGUsIGFyZ2wsIEBnZXRDYWxsYmFja3NbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBfLmlzRnVuY3Rpb24gQGdldENhbGxiYWNrc1t0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR2YWwgPSBAZ2V0Q2FsbGJhY2tzW3R5cGVdLmFwcGx5IEBnZXRDYWxsYmFja3NbdHlwZV0sIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSByZXR2YWwgPyBbXVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgbnVsbCAjIGRvbid0IGxvZyBlcnJvciBoZXJlICh0aGlzIGdldHMgY2FsbGVkIGZvciBub24tZWxlY3Ryb24gc2NyaXB0cyBhcyB3ZWxsKVxuXG4gICAgICAgIHRvQWxsOiAgKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvV2lucyh0eXBlLCBhcmdzKS5zZW5kVG9NYWluKHR5cGUsIGFyZ3MpXG4gICAgICAgIHRvTWFpbjogKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvTWFpbiB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luczogKCAgICB0eXBlLCBhcmdzLi4uKSAtPiBAc2VuZFRvV2lucyB0eXBlLCBhcmdzXG4gICAgICAgIHRvV2luOiAgKGlkLCB0eXBlLCBhcmdzLi4uKSAtPiByZXF1aXJlKCdlbGVjdHJvbicpLkJyb3dzZXJXaW5kb3cuZnJvbUlkKGlkKT8ud2ViQ29udGVudHMuc2VuZCBQT1NULCB0eXBlLCBhcmdzXG5cbiAgICAgICAgb25HZXQ6ICh0eXBlLCBjYikgLT5cbiAgICAgICAgICAgIEBnZXRDYWxsYmFja3NbdHlwZV0gPSBjYlxuICAgICAgICAgICAgQFxuXG4gICAgICAgIHNlbmRUb01haW46ICh0eXBlLCBhcmdsKSAtPlxuICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyBcInBvc3QgdG8gbWFpblwiIHR5cGUsIGFyZ2xcbiAgICAgICAgICAgIGFyZ2wudW5zaGlmdCB0eXBlXG4gICAgICAgICAgICBAZW1pdC5hcHBseSBALCBhcmdsXG4gICAgICAgICAgICBAXG5cbiAgICAgICAgc2VuZFRvV2luczogKHR5cGUsIGFyZ2wsIGV4Y2VwdCkgLT5cbiAgICAgICAgICAgIGZvciB3aW4gaW4gcmVxdWlyZSgnZWxlY3Ryb24nKS5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuICAgICAgICAgICAgICAgIGlmIHdpbi5pZCAhPSBleGNlcHRcbiAgICAgICAgICAgICAgICAgICAgaWYgQGRiZyB0aGVuIGxvZyBcInBvc3QgdG8gI3t3aW4uaWR9ICN7dHlwZX1cIiAjIGFyZ2wubWFwKChhKSAtPiBuZXcgU3RyaW5nKGEpKS5qb2luICcgJ1xuICAgICAgICAgICAgICAgICAgICB3aW4ud2ViQ29udGVudHMuc2VuZChQT1NULCB0eXBlLCBhcmdsKSBcbiAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICBkZWJ1ZzogKEBkYmc9dHJ1ZSkgLT5cbiAgICAgICAgICAgIGxvZyBcInBvc3QuZGVidWdcIiBAZGJnXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IG5ldyBQb3N0TWFpbigpXG4gICAgIl19
//# sourceURL=../coffee/ppost.coffee