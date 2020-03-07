// koffee 1.12.0

/*
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
 */
var Watch, event, fs, kerror, klog, ref, slash, walkdir,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('./kxk'), fs = ref.fs, kerror = ref.kerror, klog = ref.klog, slash = ref.slash, walkdir = ref.walkdir;

event = require('events');

walkdir = require('walkdir');

Watch = (function(superClass) {
    extend(Watch, superClass);

    function Watch(path, opt) {
        this.onChange = bind(this.onChange, this);
        Watch.__super__.constructor.call(this);
        this.dir = slash.resolve(path);
        this.opt = opt != null ? opt : {};
        this.last = {};
        slash.exists(this.dir, (function(_this) {
            return function(stat) {
                if (stat) {
                    return _this.watchDir();
                }
            };
        })(this));
    }

    Watch.dir = function(path, opt) {
        return new Watch(path, opt);
    };

    Watch.watch = function(path, opt) {
        if (slash.isDir(path)) {
            return Watch.dir(path, opt);
        } else {
            return Watch.file(path, opt);
        }
    };

    Watch.file = function(path, opt) {
        var w;
        w = Watch.dir(slash.dir(path), opt);
        w.file = slash.resolve(path);
        return w;
    };

    Watch.prototype.watchDir = function() {
        var onPath;
        if (!this.dir) {
            return;
        }
        this.watch = fs.watch(this.dir);
        this.watch.on('error', (function(_this) {
            return function(err) {
                return kerror("watch dir:'" + _this.dir + "' error: " + err);
            };
        })(this));
        this.watch.on('change', this.onChange);
        if (this.opt.recursive) {
            this.watchers = [];
            this.walker = walkdir(this.dir);
            onPath = function(ignore) {
                return function(path) {
                    var i, len, regex;
                    for (i = 0, len = ignore.length; i < len; i++) {
                        regex = ignore[i];
                        if (new RegExp(regex).test(path)) {
                            this.ignore(path);
                            return;
                        }
                    }
                };
            };
            if (this.opt.ignore) {
                this.walker.on('path', onPath(this.opt.ignore));
            }
            return this.walker.on('directory', (function(_this) {
                return function(path) {
                    var change, watch;
                    if (_this.ignore(path)) {
                        return;
                    }
                    watch = fs.watch(path);
                    _this.watchers.push(watch);
                    change = function(dir) {
                        return function(chg, pth) {
                            return _this.onChange(chg, pth, dir);
                        };
                    };
                    watch.on('change', change(path));
                    return watch.on('error', function(err) {
                        return kerror("watch subdir:'" + path + "' error: " + err);
                    });
                };
            })(this));
        }
    };

    Watch.prototype.ignore = function(path) {
        var i, len, ref1, regex;
        if (this.opt.ignore) {
            ref1 = this.opt.ignore;
            for (i = 0, len = ref1.length; i < len; i++) {
                regex = ref1[i];
                if (new RegExp(regex).test(path)) {
                    return true;
                }
            }
        }
    };

    Watch.prototype.close = function() {
        var i, len, ref1, ref2, watch;
        if ((ref1 = this.watch) != null) {
            ref1.close();
        }
        delete this.watch;
        delete this.dir;
        if (this.opt.recursive) {
            ref2 = this.watchers;
            for (i = 0, len = ref2.length; i < len; i++) {
                watch = ref2[i];
                watch.close();
            }
            return delete this.watchers;
        }
    };

    Watch.prototype.onChange = function(change, path, dir) {
        var clearRemove, ref1, ref2, ref3, ref4, stat;
        if (dir == null) {
            dir = this.dir;
        }
        if (this.ignore(path)) {
            return;
        }
        path = slash.join(dir, path);
        if (this.file && this.file !== path) {
            return;
        }
        if (slash.isDir(path)) {
            if (this.file) {
                klog('ignore dir', path);
                return;
            }
        }
        if (stat = slash.exists(path)) {
            if (path === ((ref1 = this.remove) != null ? ref1.path : void 0)) {
                clearTimeout(this.remove.timer);
                clearRemove = (function(_this) {
                    return function() {
                        return delete _this.remove;
                    };
                })(this);
                setTimeout(clearRemove, 100);
                return;
            }
            if (path === ((ref2 = this.last) != null ? ref2.path : void 0) && stat.mtime.getTime() === ((ref3 = this.last) != null ? (ref4 = ref3.mtime) != null ? ref4.getTime() : void 0 : void 0)) {
                return;
            }
            this.last = {
                mtime: stat.mtime,
                path: path
            };
            return this.emit('change', {
                dir: dir,
                path: path,
                change: change,
                watch: this
            });
        } else {
            return this.remove = {
                path: path,
                timer: setTimeout((function(d, p, w) {
                    return function() {
                        delete w.remove;
                        klog('emit REMOVE', path, d, w.dir);
                        return w.emit('change', {
                            dir: d,
                            path: p,
                            change: 'remove',
                            watch: w
                        });
                    };
                })(dir, path, this), 100)
            };
        }
    };

    return Watch;

})(event);

module.exports = Watch;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ3YXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbURBQUE7SUFBQTs7OztBQVFBLE1BQXVDLE9BQUEsQ0FBUSxPQUFSLENBQXZDLEVBQUUsV0FBRixFQUFNLG1CQUFOLEVBQWMsZUFBZCxFQUFvQixpQkFBcEIsRUFBMkI7O0FBRTNCLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVDLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRUMscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNSLElBQUMsQ0FBQSxHQUFELGlCQUFRLE1BQU07UUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBRVIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Z0JBQVUsSUFBRyxJQUFIOzJCQUFhLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBYjs7WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFSRDs7SUFVSCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsSUFBRCxFQUFPLEdBQVA7ZUFBZSxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEdBQWhCO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQO1FBRUosSUFBRyxLQUFLLENBQUMsS0FBTixDQUFZLElBQVosQ0FBSDttQkFDSSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFBZ0IsR0FBaEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEdBQWpCLEVBSEo7O0lBRkk7O0lBT1IsS0FB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bkQ7QUFFSSx1QkFGSjs7WUFJQSxJQUFDLENBQUEsSUFBRCxHQUFRO2dCQUFBLEtBQUEsRUFBTSxJQUFJLENBQUMsS0FBWDtnQkFBa0IsSUFBQSxFQUFLLElBQXZCOzttQkFFUixJQUFDLENBQUEsSUFBRCxDQUFNLFFBQU4sRUFBZTtnQkFBQSxHQUFBLEVBQUksR0FBSjtnQkFBUyxJQUFBLEVBQUssSUFBZDtnQkFBb0IsTUFBQSxFQUFPLE1BQTNCO2dCQUFtQyxLQUFBLEVBQU0sSUFBekM7YUFBZixFQWZKO1NBQUEsTUFBQTttQkFtQkksSUFBQyxDQUFBLE1BQUQsR0FDSTtnQkFBQSxJQUFBLEVBQU8sSUFBUDtnQkFDQSxLQUFBLEVBQU8sVUFBQSxDQUFXLENBQUMsU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7MkJBQVMsU0FBQTt3QkFDeEIsT0FBTyxDQUFDLENBQUM7d0JBQ1QsSUFBQSxDQUFLLGFBQUwsRUFBbUIsSUFBbkIsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBQyxDQUFDLEdBQTlCOytCQUNBLENBQUMsQ0FBQyxJQUFGLENBQU8sUUFBUCxFQUFnQjs0QkFBQSxHQUFBLEVBQUksQ0FBSjs0QkFBTyxJQUFBLEVBQUssQ0FBWjs0QkFBZSxNQUFBLEVBQU8sUUFBdEI7NEJBQWdDLEtBQUEsRUFBTSxDQUF0Qzt5QkFBaEI7b0JBSHdCO2dCQUFULENBQUQsQ0FBQSxDQUcyQyxHQUgzQyxFQUcrQyxJQUgvQyxFQUdvRCxJQUhwRCxDQUFYLEVBR21FLEdBSG5FLENBRFA7Y0FwQlI7O0lBaEJNOzs7O0dBaEdNOztBQTJJcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGZzLCBrZXJyb3IsIGtsb2csIHNsYXNoLCB3YWxrZGlyIH0gPSByZXF1aXJlICcuL2t4aydcblxuZXZlbnQgICA9IHJlcXVpcmUgJ2V2ZW50cydcbndhbGtkaXIgPSByZXF1aXJlICd3YWxrZGlyJ1xuXG5jbGFzcyBXYXRjaCBleHRlbmRzIGV2ZW50XG5cbiAgICBAOiAocGF0aCwgb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQGRpciAgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgQG9wdCAgPSBvcHQgPyB7fVxuICAgICAgICBAbGFzdCA9IHt9XG4gICAgICAgIFxuICAgICAgICBzbGFzaC5leGlzdHMgQGRpciwgKHN0YXQpID0+IGlmIHN0YXQgdGhlbiBAd2F0Y2hEaXIoKVxuICAgICAgIFxuICAgIEBkaXI6IChwYXRoLCBvcHQpIC0+IG5ldyBXYXRjaCBwYXRoLCBvcHRcbiAgICBcbiAgICBAd2F0Y2g6IChwYXRoLCBvcHQpIC0+XG4gICAgXG4gICAgICAgIGlmIHNsYXNoLmlzRGlyIHBhdGhcbiAgICAgICAgICAgIFdhdGNoLmRpciBwYXRoLCBvcHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgV2F0Y2guZmlsZSBwYXRoLCBvcHRcbiAgICBcbiAgICBAZmlsZTogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICB3ID0gV2F0Y2guZGlyIHNsYXNoLmRpcihwYXRoKSwgb3B0XG4gICAgICAgIHcuZmlsZSA9IHNsYXNoLnJlc29sdmUgcGF0aFxuICAgICAgICB3XG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3YXRjaERpcjogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGRpclxuICAgICAgICBcbiAgICAgICAgQHdhdGNoID0gZnMud2F0Y2ggQGRpclxuICAgICAgICBAd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSA9PiBrZXJyb3IgXCJ3YXRjaCBkaXI6JyN7QGRpcn0nIGVycm9yOiAje2Vycn1cIlxuICAgICAgICBAd2F0Y2gub24gJ2NoYW5nZScgQG9uQ2hhbmdlXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIEB3YWxrZXIgPSB3YWxrZGlyIEBkaXJcbiAgICAgICAgICAgIG9uUGF0aCA9IChpZ25vcmUpIC0+IChwYXRoKSAtPiBcbiAgICAgICAgICAgICAgICBmb3IgcmVnZXggaW4gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBAd2Fsa2VyLm9uICdwYXRoJyBvblBhdGggQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB3YWxrZXIub24gJ2RpcmVjdG9yeScgKHBhdGgpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICAgICAgICAgIHdhdGNoID0gZnMud2F0Y2ggcGF0aFxuICAgICAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoXG4gICAgICAgICAgICAgICAgY2hhbmdlID0gKGRpcikgPT4gKGNoZywgcHRoKSA9PiBAb25DaGFuZ2UgY2hnLCBwdGgsIGRpclxuICAgICAgICAgICAgICAgIHdhdGNoLm9uICdjaGFuZ2UnIGNoYW5nZSBwYXRoXG4gICAgICAgICAgICAgICAgd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSAtPiBrZXJyb3IgXCJ3YXRjaCBzdWJkaXI6JyN7cGF0aH0nIGVycm9yOiAje2Vycn1cIlxuXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpZ25vcmU6IChwYXRoKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgIGZvciByZWdleCBpbiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAd2F0Y2g/LmNsb3NlKClcbiAgICAgICAgZGVsZXRlIEB3YXRjaFxuICAgICAgICBkZWxldGUgQGRpclxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgZm9yIHdhdGNoIGluIEB3YXRjaGVycyBcbiAgICAgICAgICAgICAgICB3YXRjaC5jbG9zZSgpXG4gICAgICAgICAgICBkZWxldGUgQHdhdGNoZXJzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25DaGFuZ2U6IChjaGFuZ2UsIHBhdGgsIGRpcj1AZGlyKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICBcbiAgICAgICAgcGF0aCA9IHNsYXNoLmpvaW4gZGlyLCBwYXRoXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ29uQ2hhbmdlJyBwYXRoLCBAZmlsZVxuICAgICAgICBcbiAgICAgICAgaWYgQGZpbGUgYW5kIEBmaWxlICE9IHBhdGhcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNEaXIgcGF0aFxuICAgICAgICAgICAgaWYgQGZpbGVcbiAgICAgICAgICAgICAgICBrbG9nICdpZ25vcmUgZGlyJyBwYXRoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgc3RhdCA9IHNsYXNoLmV4aXN0cyBwYXRoXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgcGF0aCA9PSBAcmVtb3ZlPy5wYXRoICMgYW5kIGNoYW5nZSA9PSAncmVuYW1lJ1xuICAgICAgICAgICAgICAgICMga2xvZyAncmVtb3ZlLT5yZW5hbWUnIGNoYW5nZSwgcGF0aFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCBAcmVtb3ZlLnRpbWVyXG4gICAgICAgICAgICAgICAgY2xlYXJSZW1vdmUgPSA9PiBkZWxldGUgQHJlbW92ZVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgY2xlYXJSZW1vdmUsIDEwMFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwYXRoID09IEBsYXN0Py5wYXRoIGFuZCBzdGF0Lm10aW1lLmdldFRpbWUoKSA9PSBAbGFzdD8ubXRpbWU/LmdldFRpbWUoKVxuICAgICAgICAgICAgICAgICMga2xvZyAndW5jaGFuZ2VkJyBwYXRoXG4gICAgICAgICAgICAgICAgcmV0dXJuICMgdW5jaGFuZ2VkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBsYXN0ID0gbXRpbWU6c3RhdC5tdGltZSwgcGF0aDpwYXRoXG4gICAgICAgICAgICAjIGtsb2cgJ2VtaXQnIGNoYW5nZSwgcGF0aCAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZTpjaGFuZ2UsIHdhdGNoOkBcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEByZW1vdmUgPVxuICAgICAgICAgICAgICAgIHBhdGg6ICBwYXRoXG4gICAgICAgICAgICAgICAgdGltZXI6IHNldFRpbWVvdXQgKChkLHAsdyktPi0+XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3LnJlbW92ZTsgXG4gICAgICAgICAgICAgICAgICAgIGtsb2cgJ2VtaXQgUkVNT1ZFJyBwYXRoLCBkLCB3LmRpcjtcbiAgICAgICAgICAgICAgICAgICAgdy5lbWl0ICdjaGFuZ2UnIGRpcjpkLCBwYXRoOnAsIGNoYW5nZToncmVtb3ZlJywgd2F0Y2g6dykoZGlyLHBhdGgsQCksIDEwMFxuICAgICAgICAgICAgIyBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZToncmVtb3ZlJyB3YXRjaDpAXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXYXRjaFxuIl19
//# sourceURL=../coffee/watch.coffee