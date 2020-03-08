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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ3YXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbURBQUE7SUFBQTs7OztBQVFBLE1BQXVDLE9BQUEsQ0FBUSxPQUFSLENBQXZDLEVBQUUsV0FBRixFQUFNLG1CQUFOLEVBQWMsZUFBZCxFQUFvQixpQkFBcEIsRUFBMkI7O0FBRTNCLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVDLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRUMscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNSLElBQUMsQ0FBQSxHQUFELGlCQUFRLE1BQU07UUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBRVIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Z0JBQVUsSUFBRyxJQUFIOzJCQUFhLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBYjs7WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFSRDs7SUFVSCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsSUFBRCxFQUFPLEdBQVA7ZUFBZSxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEdBQWhCO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQO1FBRUosSUFBRyxLQUFLLENBQUMsS0FBTixDQUFZLElBQVosQ0FBSDttQkFDSSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFBZ0IsR0FBaEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEdBQWpCLEVBSEo7O0lBRkk7O0lBT1IsS0FB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bkQ7QUFDSSx1QkFESjs7WUFHQSxJQUFDLENBQUEsSUFBRCxHQUFRO2dCQUFBLEtBQUEsRUFBTSxJQUFJLENBQUMsS0FBWDtnQkFBa0IsSUFBQSxFQUFLLElBQXZCOzttQkFDUixJQUFDLENBQUEsSUFBRCxDQUFNLFFBQU4sRUFBZTtnQkFBQSxHQUFBLEVBQUksR0FBSjtnQkFBUyxJQUFBLEVBQUssSUFBZDtnQkFBb0IsTUFBQSxFQUFPLE1BQTNCO2dCQUFtQyxLQUFBLEVBQU0sSUFBekM7YUFBZixFQVpKO1NBQUEsTUFBQTttQkFnQkksSUFBQyxDQUFBLE1BQUQsR0FDSTtnQkFBQSxJQUFBLEVBQU8sSUFBUDtnQkFDQSxLQUFBLEVBQU8sVUFBQSxDQUFXLENBQUMsU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7MkJBQVMsU0FBQTt3QkFDeEIsT0FBTyxDQUFDLENBQUM7K0JBQ1QsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFQLEVBQWdCOzRCQUFBLEdBQUEsRUFBSSxDQUFKOzRCQUFPLElBQUEsRUFBSyxDQUFaOzRCQUFlLE1BQUEsRUFBTyxRQUF0Qjs0QkFBZ0MsS0FBQSxFQUFNLENBQXRDO3lCQUFoQjtvQkFGd0I7Z0JBQVQsQ0FBRCxDQUFBLENBRTJDLEdBRjNDLEVBRStDLElBRi9DLEVBRW9ELElBRnBELENBQVgsRUFFbUUsR0FGbkUsQ0FEUDtjQWpCUjs7SUFkTTs7OztHQWhHTTs7QUFvSXBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBmcywga2Vycm9yLCBrbG9nLCBzbGFzaCwgd2Fsa2RpciB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmV2ZW50ICAgPSByZXF1aXJlICdldmVudHMnXG53YWxrZGlyID0gcmVxdWlyZSAnd2Fsa2RpcidcblxuY2xhc3MgV2F0Y2ggZXh0ZW5kcyBldmVudFxuXG4gICAgQDogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIEBkaXIgID0gc2xhc2gucmVzb2x2ZSBwYXRoXG4gICAgICAgIEBvcHQgID0gb3B0ID8ge31cbiAgICAgICAgQGxhc3QgPSB7fVxuICAgICAgICBcbiAgICAgICAgc2xhc2guZXhpc3RzIEBkaXIsIChzdGF0KSA9PiBpZiBzdGF0IHRoZW4gQHdhdGNoRGlyKClcbiAgICAgICBcbiAgICBAZGlyOiAocGF0aCwgb3B0KSAtPiBuZXcgV2F0Y2ggcGF0aCwgb3B0XG4gICAgXG4gICAgQHdhdGNoOiAocGF0aCwgb3B0KSAtPlxuICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0RpciBwYXRoXG4gICAgICAgICAgICBXYXRjaC5kaXIgcGF0aCwgb3B0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFdhdGNoLmZpbGUgcGF0aCwgb3B0XG4gICAgXG4gICAgQGZpbGU6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgdyA9IFdhdGNoLmRpciBzbGFzaC5kaXIocGF0aCksIG9wdFxuICAgICAgICB3LmZpbGUgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgd1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2F0Y2hEaXI6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBkaXJcbiAgICAgICAgXG4gICAgICAgIEB3YXRjaCA9IGZzLndhdGNoIEBkaXJcbiAgICAgICAgQHdhdGNoLm9uICdlcnJvcicgKGVycikgPT4ga2Vycm9yIFwid2F0Y2ggZGlyOicje0BkaXJ9JyBlcnJvcjogI3tlcnJ9XCJcbiAgICAgICAgQHdhdGNoLm9uICdjaGFuZ2UnIEBvbkNoYW5nZVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5yZWN1cnNpdmVcbiAgICAgICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgICAgICAgICBAd2Fsa2VyID0gd2Fsa2RpciBAZGlyXG4gICAgICAgICAgICBvblBhdGggPSAoaWdub3JlKSAtPiAocGF0aCkgLT4gXG4gICAgICAgICAgICAgICAgZm9yIHJlZ2V4IGluIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBpZiBuZXcgUmVnRXhwKHJlZ2V4KS50ZXN0IHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpZ25vcmUgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgQHdhbGtlci5vbiAncGF0aCcgb25QYXRoIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAd2Fsa2VyLm9uICdkaXJlY3RvcnknIChwYXRoKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiBAaWdub3JlIHBhdGhcbiAgICAgICAgICAgICAgICB3YXRjaCA9IGZzLndhdGNoIHBhdGhcbiAgICAgICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaFxuICAgICAgICAgICAgICAgIGNoYW5nZSA9IChkaXIpID0+IChjaGcsIHB0aCkgPT4gQG9uQ2hhbmdlIGNoZywgcHRoLCBkaXJcbiAgICAgICAgICAgICAgICB3YXRjaC5vbiAnY2hhbmdlJyBjaGFuZ2UgcGF0aFxuICAgICAgICAgICAgICAgIHdhdGNoLm9uICdlcnJvcicgKGVycikgLT4ga2Vycm9yIFwid2F0Y2ggc3ViZGlyOicje3BhdGh9JyBlcnJvcjogI3tlcnJ9XCJcblxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaWdub3JlOiAocGF0aCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuaWdub3JlXG4gICAgICAgICAgICBmb3IgcmVnZXggaW4gQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBpZiBuZXcgUmVnRXhwKHJlZ2V4KS50ZXN0IHBhdGhcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNsb3NlOiAtPlxuICAgICAgICBcbiAgICAgICAgQHdhdGNoPy5jbG9zZSgpXG4gICAgICAgIGRlbGV0ZSBAd2F0Y2hcbiAgICAgICAgZGVsZXRlIEBkaXJcbiAgICAgICAgaWYgQG9wdC5yZWN1cnNpdmVcbiAgICAgICAgICAgIGZvciB3YXRjaCBpbiBAd2F0Y2hlcnMgXG4gICAgICAgICAgICAgICAgd2F0Y2guY2xvc2UoKVxuICAgICAgICAgICAgZGVsZXRlIEB3YXRjaGVyc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uQ2hhbmdlOiAoY2hhbmdlLCBwYXRoLCBkaXI9QGRpcikgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBAaWdub3JlIHBhdGhcbiAgICAgICAgXG4gICAgICAgIHBhdGggPSBzbGFzaC5qb2luIGRpciwgcGF0aFxuICAgICAgICBcbiAgICAgICAgaWYgQGZpbGUgYW5kIEBmaWxlICE9IHBhdGhcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNEaXIgcGF0aFxuICAgICAgICAgICAgaWYgQGZpbGVcbiAgICAgICAgICAgICAgICBrbG9nICdpZ25vcmUgZGlyJyBwYXRoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgc3RhdCA9IHNsYXNoLmV4aXN0cyBwYXRoXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgcGF0aCA9PSBAcmVtb3ZlPy5wYXRoICMgYW5kIGNoYW5nZSA9PSAncmVuYW1lJ1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCBAcmVtb3ZlLnRpbWVyXG4gICAgICAgICAgICAgICAgY2xlYXJSZW1vdmUgPSA9PiBkZWxldGUgQHJlbW92ZVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgY2xlYXJSZW1vdmUsIDEwMFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwYXRoID09IEBsYXN0Py5wYXRoIGFuZCBzdGF0Lm10aW1lLmdldFRpbWUoKSA9PSBAbGFzdD8ubXRpbWU/LmdldFRpbWUoKVxuICAgICAgICAgICAgICAgIHJldHVybiAjIHVuY2hhbmdlZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAbGFzdCA9IG10aW1lOnN0YXQubXRpbWUsIHBhdGg6cGF0aFxuICAgICAgICAgICAgQGVtaXQgJ2NoYW5nZScgZGlyOmRpciwgcGF0aDpwYXRoLCBjaGFuZ2U6Y2hhbmdlLCB3YXRjaDpAXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcmVtb3ZlID1cbiAgICAgICAgICAgICAgICBwYXRoOiAgcGF0aFxuICAgICAgICAgICAgICAgIHRpbWVyOiBzZXRUaW1lb3V0ICgoZCxwLHcpLT4tPlxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdy5yZW1vdmU7IFxuICAgICAgICAgICAgICAgICAgICB3LmVtaXQgJ2NoYW5nZScgZGlyOmQsIHBhdGg6cCwgY2hhbmdlOidyZW1vdmUnLCB3YXRjaDp3KShkaXIscGF0aCxAKSwgMTAwXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXYXRjaFxuIl19
//# sourceURL=../coffee/watch.coffee