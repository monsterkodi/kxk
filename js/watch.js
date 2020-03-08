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
            if (this.opt.skipSave && path === ((ref1 = this.remove) != null ? ref1.path : void 0)) {
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
            if (this.opt.skipSave) {
                return this.remove = {
                    path: path,
                    timer: setTimeout((function(d, p, w) {
                        return function() {
                            delete w.remove;
                            return w.emit('change', {
                                dir: d,
                                path: p,
                                change: 'remove',
                                watch: w
                            });
                        };
                    })(dir, path, this), 100)
                };
            } else if (this.opt.emitRemove) {
                return this.emit('change', {
                    dir: dir,
                    path: path,
                    change: 'remove',
                    watch: this
                });
            }
        }
    };

    return Watch;

})(event);

module.exports = Watch;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ3YXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbURBQUE7SUFBQTs7OztBQVFBLE1BQXVDLE9BQUEsQ0FBUSxPQUFSLENBQXZDLEVBQUUsV0FBRixFQUFNLG1CQUFOLEVBQWMsZUFBZCxFQUFvQixpQkFBcEIsRUFBMkI7O0FBRTNCLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVDLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRUMscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNSLElBQUMsQ0FBQSxHQUFELGlCQUFRLE1BQU07UUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBRVIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Z0JBQVUsSUFBRyxJQUFIOzJCQUFhLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBYjs7WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFSRDs7SUFVSCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsSUFBRCxFQUFPLEdBQVA7ZUFBZSxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEdBQWhCO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQO1FBRUosSUFBRyxLQUFLLENBQUMsS0FBTixDQUFZLElBQVosQ0FBSDttQkFDSSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFBZ0IsR0FBaEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEdBQWpCLEVBSEo7O0lBRkk7O0lBT1IsS0FB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b250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAgICAgIDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgZnMsIGtlcnJvciwga2xvZywgc2xhc2gsIHdhbGtkaXIgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5ldmVudCAgID0gcmVxdWlyZSAnZXZlbnRzJ1xud2Fsa2RpciA9IHJlcXVpcmUgJ3dhbGtkaXInXG5cbmNsYXNzIFdhdGNoIGV4dGVuZHMgZXZlbnRcblxuICAgIEA6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBAZGlyICA9IHNsYXNoLnJlc29sdmUgcGF0aFxuICAgICAgICBAb3B0ICA9IG9wdCA/IHt9XG4gICAgICAgIEBsYXN0ID0ge31cbiAgICAgICAgXG4gICAgICAgIHNsYXNoLmV4aXN0cyBAZGlyLCAoc3RhdCkgPT4gaWYgc3RhdCB0aGVuIEB3YXRjaERpcigpXG4gICAgICAgXG4gICAgQGRpcjogKHBhdGgsIG9wdCkgLT4gbmV3IFdhdGNoIHBhdGgsIG9wdFxuICAgIFxuICAgIEB3YXRjaDogKHBhdGgsIG9wdCkgLT5cbiAgICBcbiAgICAgICAgaWYgc2xhc2guaXNEaXIgcGF0aFxuICAgICAgICAgICAgV2F0Y2guZGlyIHBhdGgsIG9wdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBXYXRjaC5maWxlIHBhdGgsIG9wdFxuICAgIFxuICAgIEBmaWxlOiAocGF0aCwgb3B0KSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIHcgPSBXYXRjaC5kaXIgc2xhc2guZGlyKHBhdGgpLCBvcHRcbiAgICAgICAgdy5maWxlID0gc2xhc2gucmVzb2x2ZSBwYXRoXG4gICAgICAgIHdcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdhdGNoRGlyOiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZGlyXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2ggPSBmcy53YXRjaCBAZGlyXG4gICAgICAgIEB3YXRjaC5vbiAnZXJyb3InIChlcnIpID0+IGtlcnJvciBcIndhdGNoIGRpcjonI3tAZGlyfScgZXJyb3I6ICN7ZXJyfVwiXG4gICAgICAgIEB3YXRjaC5vbiAnY2hhbmdlJyBAb25DaGFuZ2VcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQucmVjdXJzaXZlXG4gICAgICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgICAgICAgICAgQHdhbGtlciA9IHdhbGtkaXIgQGRpclxuICAgICAgICAgICAgb25QYXRoID0gKGlnbm9yZSkgLT4gKHBhdGgpIC0+IFxuICAgICAgICAgICAgICAgIGZvciByZWdleCBpbiBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgaWYgbmV3IFJlZ0V4cChyZWdleCkudGVzdCBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBAaWdub3JlIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIEB3YWxrZXIub24gJ3BhdGgnIG9uUGF0aCBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQHdhbGtlci5vbiAnZGlyZWN0b3J5JyAocGF0aCkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgd2F0Y2ggPSBmcy53YXRjaCBwYXRoXG4gICAgICAgICAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSAoZGlyKSA9PiAoY2hnLCBwdGgpID0+IEBvbkNoYW5nZSBjaGcsIHB0aCwgZGlyXG4gICAgICAgICAgICAgICAgd2F0Y2gub24gJ2NoYW5nZScgY2hhbmdlIHBhdGhcbiAgICAgICAgICAgICAgICB3YXRjaC5vbiAnZXJyb3InIChlcnIpIC0+IGtlcnJvciBcIndhdGNoIHN1YmRpcjonI3twYXRofScgZXJyb3I6ICN7ZXJyfVwiXG5cbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGlnbm9yZTogKHBhdGgpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgZm9yIHJlZ2V4IGluIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgbmV3IFJlZ0V4cChyZWdleCkudGVzdCBwYXRoXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjbG9zZTogLT5cbiAgICAgICAgXG4gICAgICAgIEB3YXRjaD8uY2xvc2UoKVxuICAgICAgICBkZWxldGUgQHdhdGNoXG4gICAgICAgIGRlbGV0ZSBAZGlyXG4gICAgICAgIGlmIEBvcHQucmVjdXJzaXZlXG4gICAgICAgICAgICBmb3Igd2F0Y2ggaW4gQHdhdGNoZXJzIFxuICAgICAgICAgICAgICAgIHdhdGNoLmNsb3NlKClcbiAgICAgICAgICAgIGRlbGV0ZSBAd2F0Y2hlcnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvbkNoYW5nZTogKGNoYW5nZSwgcGF0aCwgZGlyPUBkaXIpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgQGlnbm9yZSBwYXRoXG4gICAgICAgIFxuICAgICAgICBwYXRoID0gc2xhc2guam9pbiBkaXIsIHBhdGhcbiAgICAgICAgXG4gICAgICAgIGlmIEBmaWxlIGFuZCBAZmlsZSAhPSBwYXRoXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzRGlyIHBhdGhcbiAgICAgICAgICAgIGlmIEBmaWxlXG4gICAgICAgICAgICAgICAga2xvZyAnaWdub3JlIGRpcicgcGF0aFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHN0YXQgPSBzbGFzaC5leGlzdHMgcGF0aFxuICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQuc2tpcFNhdmUgYW5kIHBhdGggPT0gQHJlbW92ZT8ucGF0aCAjIGFuZCBjaGFuZ2UgPT0gJ3JlbmFtZSdcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQgQHJlbW92ZS50aW1lclxuICAgICAgICAgICAgICAgIGNsZWFyUmVtb3ZlID0gPT4gZGVsZXRlIEByZW1vdmVcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0IGNsZWFyUmVtb3ZlLCAxMDBcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcGF0aCA9PSBAbGFzdD8ucGF0aCBhbmQgc3RhdC5tdGltZS5nZXRUaW1lKCkgPT0gQGxhc3Q/Lm10aW1lPy5nZXRUaW1lKClcbiAgICAgICAgICAgICAgICByZXR1cm4gIyB1bmNoYW5nZWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3QgPSBtdGltZTpzdGF0Lm10aW1lLCBwYXRoOnBhdGhcbiAgICAgICAgICAgIEBlbWl0ICdjaGFuZ2UnIGRpcjpkaXIsIHBhdGg6cGF0aCwgY2hhbmdlOmNoYW5nZSwgd2F0Y2g6QFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5za2lwU2F2ZVxuICAgICAgICAgICAgICAgIEByZW1vdmUgPVxuICAgICAgICAgICAgICAgICAgICBwYXRoOiAgcGF0aFxuICAgICAgICAgICAgICAgICAgICB0aW1lcjogc2V0VGltZW91dCAoKGQscCx3KS0+LT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3LnJlbW92ZTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB3LmVtaXQgJ2NoYW5nZScgZGlyOmQsIHBhdGg6cCwgY2hhbmdlOidyZW1vdmUnLCB3YXRjaDp3KShkaXIscGF0aCxAKSwgMTAwXG4gICAgICAgICAgICBlbHNlIGlmIEBvcHQuZW1pdFJlbW92ZVxuICAgICAgICAgICAgICAgIEBlbWl0ICdjaGFuZ2UnIGRpcjpkaXIsIHBhdGg6cGF0aCwgY2hhbmdlOidyZW1vdmUnLCB3YXRjaDpAXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXYXRjaFxuIl19
//# sourceURL=../coffee/watch.coffee