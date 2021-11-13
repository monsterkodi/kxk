// koffee 1.19.0

/*
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
 */
var Watch, event, fs, kerror, klog, ref, slash, walkdir,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = Object.hasOwn;

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
        if (opt.cb) {
            return slash.isDir(path, function(stat) {
                if (stat) {
                    return opt.cb(Watch.dir(path, opt));
                } else {
                    return opt.cb(Watch.file(path, opt));
                }
            });
        } else {
            if (slash.isDir(path)) {
                return Watch.dir(path, opt);
            } else {
                return Watch.file(path, opt);
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ3YXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbURBQUE7SUFBQTs7OztBQVFBLE1BQXVDLE9BQUEsQ0FBUSxPQUFSLENBQXZDLEVBQUUsV0FBRixFQUFNLG1CQUFOLEVBQWMsZUFBZCxFQUFvQixpQkFBcEIsRUFBMkI7O0FBRTNCLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVDLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRUMscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNSLElBQUMsQ0FBQSxHQUFELGlCQUFRLE1BQU07UUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBRVIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Z0JBQVUsSUFBRyxJQUFIOzJCQUFhLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBYjs7WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFSRDs7SUFVSCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsSUFBRCxFQUFPLEdBQVA7ZUFBZSxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEdBQWhCO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQO1FBRUosSUFBRyxHQUFHLENBQUMsRUFBUDttQkFDSSxLQUFLLENBQUMsS0FBTixDQUFZLElBQVosRUFBa0IsU0FBQyxJQUFEO2dCQUNkLElBQUcsSUFBSDsyQkFDSSxHQUFHLENBQUMsRUFBSixDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixFQUFnQixHQUFoQixDQUFQLEVBREo7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QyxFQUVvRCxJQUZwRCxDQUFYLEVBRW1FLEdBRm5FLENBRFA7a0JBRlI7YUFBQSxNQU1LLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFSO3VCQUNELElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUFlO29CQUFBLEdBQUEsRUFBSSxHQUFKO29CQUFTLElBQUEsRUFBSyxJQUFkO29CQUFvQixNQUFBLEVBQU8sUUFBM0I7b0JBQXFDLEtBQUEsRUFBTSxJQUEzQztpQkFBZixFQURDO2FBdEJUOztJQWRNOzs7O0dBdkdNOztBQThJcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGZzLCBrZXJyb3IsIGtsb2csIHNsYXNoLCB3YWxrZGlyIH0gPSByZXF1aXJlICcuL2t4aydcblxuZXZlbnQgICA9IHJlcXVpcmUgJ2V2ZW50cydcbndhbGtkaXIgPSByZXF1aXJlICd3YWxrZGlyJ1xuXG5jbGFzcyBXYXRjaCBleHRlbmRzIGV2ZW50XG5cbiAgICBAOiAocGF0aCwgb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQGRpciAgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgQG9wdCAgPSBvcHQgPyB7fVxuICAgICAgICBAbGFzdCA9IHt9XG4gICAgICAgIFxuICAgICAgICBzbGFzaC5leGlzdHMgQGRpciwgKHN0YXQpID0+IGlmIHN0YXQgdGhlbiBAd2F0Y2hEaXIoKVxuICAgICAgIFxuICAgIEBkaXI6IChwYXRoLCBvcHQpIC0+IG5ldyBXYXRjaCBwYXRoLCBvcHRcbiAgICBcbiAgICBAd2F0Y2g6IChwYXRoLCBvcHQpIC0+XG4gICAgXG4gICAgICAgIGlmIG9wdC5jYlxuICAgICAgICAgICAgc2xhc2guaXNEaXIgcGF0aCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdFxuICAgICAgICAgICAgICAgICAgICBvcHQuY2IgV2F0Y2guZGlyIHBhdGgsIG9wdFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb3B0LmNiIFdhdGNoLmZpbGUgcGF0aCwgb3B0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHNsYXNoLmlzRGlyIHBhdGhcbiAgICAgICAgICAgICAgICBXYXRjaC5kaXIgcGF0aCwgb3B0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgV2F0Y2guZmlsZSBwYXRoLCBvcHRcbiAgICBcbiAgICBAZmlsZTogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICB3ID0gV2F0Y2guZGlyIHNsYXNoLmRpcihwYXRoKSwgb3B0XG4gICAgICAgIHcuZmlsZSA9IHNsYXNoLnJlc29sdmUgcGF0aFxuICAgICAgICB3XG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3YXRjaERpcjogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGRpclxuICAgICAgICBcbiAgICAgICAgQHdhdGNoID0gZnMud2F0Y2ggQGRpclxuICAgICAgICBAd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSA9PiBrZXJyb3IgXCJ3YXRjaCBkaXI6JyN7QGRpcn0nIGVycm9yOiAje2Vycn1cIlxuICAgICAgICBAd2F0Y2gub24gJ2NoYW5nZScgQG9uQ2hhbmdlXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIEB3YWxrZXIgPSB3YWxrZGlyIEBkaXJcbiAgICAgICAgICAgIG9uUGF0aCA9IChpZ25vcmUpIC0+IChwYXRoKSAtPiBcbiAgICAgICAgICAgICAgICBmb3IgcmVnZXggaW4gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBAd2Fsa2VyLm9uICdwYXRoJyBvblBhdGggQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB3YWxrZXIub24gJ2RpcmVjdG9yeScgKHBhdGgpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICAgICAgICAgIHdhdGNoID0gZnMud2F0Y2ggcGF0aFxuICAgICAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoXG4gICAgICAgICAgICAgICAgY2hhbmdlID0gKGRpcikgPT4gKGNoZywgcHRoKSA9PiBAb25DaGFuZ2UgY2hnLCBwdGgsIGRpclxuICAgICAgICAgICAgICAgIHdhdGNoLm9uICdjaGFuZ2UnIGNoYW5nZSBwYXRoXG4gICAgICAgICAgICAgICAgd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSAtPiBrZXJyb3IgXCJ3YXRjaCBzdWJkaXI6JyN7cGF0aH0nIGVycm9yOiAje2Vycn1cIlxuXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpZ25vcmU6IChwYXRoKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgIGZvciByZWdleCBpbiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAd2F0Y2g/LmNsb3NlKClcbiAgICAgICAgZGVsZXRlIEB3YXRjaFxuICAgICAgICBkZWxldGUgQGRpclxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgZm9yIHdhdGNoIGluIEB3YXRjaGVycyBcbiAgICAgICAgICAgICAgICB3YXRjaC5jbG9zZSgpXG4gICAgICAgICAgICBkZWxldGUgQHdhdGNoZXJzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25DaGFuZ2U6IChjaGFuZ2UsIHBhdGgsIGRpcj1AZGlyKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICBcbiAgICAgICAgcGF0aCA9IHNsYXNoLmpvaW4gZGlyLCBwYXRoXG4gICAgICAgIFxuICAgICAgICBpZiBAZmlsZSBhbmQgQGZpbGUgIT0gcGF0aFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0RpciBwYXRoXG4gICAgICAgICAgICBpZiBAZmlsZVxuICAgICAgICAgICAgICAgIGtsb2cgJ2lnbm9yZSBkaXInIHBhdGhcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBzdGF0ID0gc2xhc2guZXhpc3RzIHBhdGhcbiAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0LnNraXBTYXZlIGFuZCBwYXRoID09IEByZW1vdmU/LnBhdGggIyBhbmQgY2hhbmdlID09ICdyZW5hbWUnXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEByZW1vdmUudGltZXJcbiAgICAgICAgICAgICAgICBjbGVhclJlbW92ZSA9ID0+IGRlbGV0ZSBAcmVtb3ZlXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCBjbGVhclJlbW92ZSwgMTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHBhdGggPT0gQGxhc3Q/LnBhdGggYW5kIHN0YXQubXRpbWUuZ2V0VGltZSgpID09IEBsYXN0Py5tdGltZT8uZ2V0VGltZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuICMgdW5jaGFuZ2VkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBsYXN0ID0gbXRpbWU6c3RhdC5tdGltZSwgcGF0aDpwYXRoXG4gICAgICAgICAgICBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZTpjaGFuZ2UsIHdhdGNoOkBcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQuc2tpcFNhdmVcbiAgICAgICAgICAgICAgICBAcmVtb3ZlID1cbiAgICAgICAgICAgICAgICAgICAgcGF0aDogIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgdGltZXI6IHNldFRpbWVvdXQgKChkLHAsdyktPi0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdy5yZW1vdmU7IFxuICAgICAgICAgICAgICAgICAgICAgICAgdy5lbWl0ICdjaGFuZ2UnIGRpcjpkLCBwYXRoOnAsIGNoYW5nZToncmVtb3ZlJywgd2F0Y2g6dykoZGlyLHBhdGgsQCksIDEwMFxuICAgICAgICAgICAgZWxzZSBpZiBAb3B0LmVtaXRSZW1vdmVcbiAgICAgICAgICAgICAgICBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZToncmVtb3ZlJywgd2F0Y2g6QFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gV2F0Y2hcbiJdfQ==
//# sourceURL=../coffee/watch.coffee