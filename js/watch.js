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
        return slash.isDir(path, function(stat) {
            if (stat) {
                return Watch.dir(path, opt);
            } else {
                return Watch.file(path, opt);
            }
        });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ3YXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbURBQUE7SUFBQTs7OztBQVFBLE1BQXVDLE9BQUEsQ0FBUSxPQUFSLENBQXZDLEVBQUUsV0FBRixFQUFNLG1CQUFOLEVBQWMsZUFBZCxFQUFvQixpQkFBcEIsRUFBMkI7O0FBRTNCLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVDLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRUMscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNSLElBQUMsQ0FBQSxHQUFELGlCQUFRLE1BQU07UUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBRVIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Z0JBQVUsSUFBRyxJQUFIOzJCQUFhLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBYjs7WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFSRDs7SUFVSCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsSUFBRCxFQUFPLEdBQVA7ZUFBZSxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEdBQWhCO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQO2VBRUosS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaLEVBQWtCLFNBQUMsSUFBRDtZQUNkLElBQUcsSUFBSDt1QkFDSSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFBZ0IsR0FBaEIsRUFESjthQUFBLE1BQUE7dUJBR0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEdBQWpC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LE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBmcywga2Vycm9yLCBrbG9nLCBzbGFzaCwgd2Fsa2RpciB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmV2ZW50ICAgPSByZXF1aXJlICdldmVudHMnXG53YWxrZGlyID0gcmVxdWlyZSAnd2Fsa2RpcidcblxuY2xhc3MgV2F0Y2ggZXh0ZW5kcyBldmVudFxuXG4gICAgQDogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIEBkaXIgID0gc2xhc2gucmVzb2x2ZSBwYXRoXG4gICAgICAgIEBvcHQgID0gb3B0ID8ge31cbiAgICAgICAgQGxhc3QgPSB7fVxuICAgICAgICBcbiAgICAgICAgc2xhc2guZXhpc3RzIEBkaXIsIChzdGF0KSA9PiBpZiBzdGF0IHRoZW4gQHdhdGNoRGlyKClcbiAgICAgICBcbiAgICBAZGlyOiAocGF0aCwgb3B0KSAtPiBuZXcgV2F0Y2ggcGF0aCwgb3B0XG4gICAgXG4gICAgQHdhdGNoOiAocGF0aCwgb3B0KSAtPlxuICAgIFxuICAgICAgICBzbGFzaC5pc0RpciBwYXRoLCAoc3RhdCkgLT5cbiAgICAgICAgICAgIGlmIHN0YXRcbiAgICAgICAgICAgICAgICBXYXRjaC5kaXIgcGF0aCwgb3B0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgV2F0Y2guZmlsZSBwYXRoLCBvcHRcbiAgICBcbiAgICBAZmlsZTogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICB3ID0gV2F0Y2guZGlyIHNsYXNoLmRpcihwYXRoKSwgb3B0XG4gICAgICAgIHcuZmlsZSA9IHNsYXNoLnJlc29sdmUgcGF0aFxuICAgICAgICB3XG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3YXRjaERpcjogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGRpclxuICAgICAgICBcbiAgICAgICAgQHdhdGNoID0gZnMud2F0Y2ggQGRpclxuICAgICAgICBAd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSA9PiBrZXJyb3IgXCJ3YXRjaCBkaXI6JyN7QGRpcn0nIGVycm9yOiAje2Vycn1cIlxuICAgICAgICBAd2F0Y2gub24gJ2NoYW5nZScgQG9uQ2hhbmdlXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIEB3YWxrZXIgPSB3YWxrZGlyIEBkaXJcbiAgICAgICAgICAgIG9uUGF0aCA9IChpZ25vcmUpIC0+IChwYXRoKSAtPiBcbiAgICAgICAgICAgICAgICBmb3IgcmVnZXggaW4gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBAd2Fsa2VyLm9uICdwYXRoJyBvblBhdGggQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB3YWxrZXIub24gJ2RpcmVjdG9yeScgKHBhdGgpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICAgICAgICAgIHdhdGNoID0gZnMud2F0Y2ggcGF0aFxuICAgICAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoXG4gICAgICAgICAgICAgICAgY2hhbmdlID0gKGRpcikgPT4gKGNoZywgcHRoKSA9PiBAb25DaGFuZ2UgY2hnLCBwdGgsIGRpclxuICAgICAgICAgICAgICAgIHdhdGNoLm9uICdjaGFuZ2UnIGNoYW5nZSBwYXRoXG4gICAgICAgICAgICAgICAgd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSAtPiBrZXJyb3IgXCJ3YXRjaCBzdWJkaXI6JyN7cGF0aH0nIGVycm9yOiAje2Vycn1cIlxuXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpZ25vcmU6IChwYXRoKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgIGZvciByZWdleCBpbiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAd2F0Y2g/LmNsb3NlKClcbiAgICAgICAgZGVsZXRlIEB3YXRjaFxuICAgICAgICBkZWxldGUgQGRpclxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgZm9yIHdhdGNoIGluIEB3YXRjaGVycyBcbiAgICAgICAgICAgICAgICB3YXRjaC5jbG9zZSgpXG4gICAgICAgICAgICBkZWxldGUgQHdhdGNoZXJzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25DaGFuZ2U6IChjaGFuZ2UsIHBhdGgsIGRpcj1AZGlyKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICBcbiAgICAgICAgcGF0aCA9IHNsYXNoLmpvaW4gZGlyLCBwYXRoXG4gICAgICAgIFxuICAgICAgICBpZiBAZmlsZSBhbmQgQGZpbGUgIT0gcGF0aFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0RpciBwYXRoXG4gICAgICAgICAgICBpZiBAZmlsZVxuICAgICAgICAgICAgICAgIGtsb2cgJ2lnbm9yZSBkaXInIHBhdGhcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBzdGF0ID0gc2xhc2guZXhpc3RzIHBhdGhcbiAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0LnNraXBTYXZlIGFuZCBwYXRoID09IEByZW1vdmU/LnBhdGggIyBhbmQgY2hhbmdlID09ICdyZW5hbWUnXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEByZW1vdmUudGltZXJcbiAgICAgICAgICAgICAgICBjbGVhclJlbW92ZSA9ID0+IGRlbGV0ZSBAcmVtb3ZlXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCBjbGVhclJlbW92ZSwgMTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHBhdGggPT0gQGxhc3Q/LnBhdGggYW5kIHN0YXQubXRpbWUuZ2V0VGltZSgpID09IEBsYXN0Py5tdGltZT8uZ2V0VGltZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuICMgdW5jaGFuZ2VkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBsYXN0ID0gbXRpbWU6c3RhdC5tdGltZSwgcGF0aDpwYXRoXG4gICAgICAgICAgICBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZTpjaGFuZ2UsIHdhdGNoOkBcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQuc2tpcFNhdmVcbiAgICAgICAgICAgICAgICBAcmVtb3ZlID1cbiAgICAgICAgICAgICAgICAgICAgcGF0aDogIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgdGltZXI6IHNldFRpbWVvdXQgKChkLHAsdyktPi0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdy5yZW1vdmU7IFxuICAgICAgICAgICAgICAgICAgICAgICAgdy5lbWl0ICdjaGFuZ2UnIGRpcjpkLCBwYXRoOnAsIGNoYW5nZToncmVtb3ZlJywgd2F0Y2g6dykoZGlyLHBhdGgsQCksIDEwMFxuICAgICAgICAgICAgZWxzZSBpZiBAb3B0LmVtaXRSZW1vdmVcbiAgICAgICAgICAgICAgICBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZToncmVtb3ZlJywgd2F0Y2g6QFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gV2F0Y2hcbiJdfQ==
//# sourceURL=../coffee/watch.coffee