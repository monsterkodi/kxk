// koffee 1.4.0

/*
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
 */
var Watch, _, event, fs, ref, slash, walkdir,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('./kxk'), slash = ref.slash, fs = ref.fs, _ = ref._;

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

    Watch.dir = function(path, opt) {
        return new Watch(path, opt);
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

    Watch.prototype.watchDir = function() {
        var onPath;
        if (!this.dir) {
            return;
        }
        this.watch = fs.watch(this.dir);
        this.watch.on('error', function(err) {
            return console.error("fs.watch dir:'" + this.dir + "' error: " + err.stack);
        });
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
                    return watch.on('change', change(path));
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

    Watch.prototype.onChange = function(change, path, dir) {
        var ref1, ref2, ref3, stat;
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
            return;
        }
        if (stat = slash.fileExists(path)) {
            if (path === ((ref1 = this.last) != null ? ref1.path : void 0) && stat.mtime.getTime() === ((ref2 = this.last) != null ? (ref3 = ref2.mtime) != null ? ref3.getTime() : void 0 : void 0)) {
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
        }
    };

    return Watch;

})(event);

module.exports = Watch;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHdDQUFBO0lBQUE7Ozs7QUFRQSxNQUFtQixPQUFBLENBQVEsT0FBUixDQUFuQixFQUFFLGlCQUFGLEVBQVMsV0FBVCxFQUFhOztBQUViLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVDLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRUMscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNSLElBQUMsQ0FBQSxHQUFELGlCQUFRLE1BQU07UUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBRVIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Z0JBQVUsSUFBRyxJQUFIOzJCQUFhLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBYjs7WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFSRDs7SUFVSCxLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsSUFBRCxFQUFPLEdBQVA7UUFFSixJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBWixDQUFIO21CQUNJLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixFQUFnQixHQUFoQixFQURKO1NBQUEsTUFBQTttQkFHSSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFBaUIsR0FBakIsRUFISjs7SUFGSTs7SUFPUixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFFSCxZQUFBO1FBQUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQVYsRUFBMkIsR0FBM0I7UUFDSixDQUFD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LFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxHQUFmO0FBRU4sWUFBQTs7WUFGcUIsTUFBSSxJQUFDLENBQUE7O1FBRTFCLElBQVUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLENBQVY7QUFBQSxtQkFBQTs7UUFFQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLElBQWhCO1FBQ1AsSUFBRyxJQUFDLENBQUEsSUFBRCxJQUFVLElBQUMsQ0FBQSxJQUFELEtBQVMsSUFBdEI7QUFDSSxtQkFESjs7UUFHQSxJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBWixDQUFIO0FBQ0ksbUJBREo7O1FBR0EsSUFBRyxJQUFBLEdBQU8sS0FBSyxDQUFDLFVBQU4sQ0FBaUIsSUFBakIsQ0FBVjtZQUVJLElBQUcsSUFBQSx1Q0FBYSxDQUFFLGNBQWYsSUFBd0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQUEsQ0FBQSxxRUFBb0MsQ0FBRSxPQUFkLENBQUEsb0JBQW5EO0FBQ0ksdUJBREo7O1lBR0EsSUFBQyxDQUFBLElBQUQsR0FBUTtnQkFBQSxLQUFBLEVBQU0sSUFBSSxDQUFDLEtBQVg7Z0JBQWtCLElBQUEsRUFBSyxJQUF2Qjs7bUJBRVIsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQWU7Z0JBQUEsR0FBQSxFQUFJLEdBQUo7Z0JBQVMsSUFBQSxFQUFLLElBQWQ7Z0JBQW9CLE1BQUEsRUFBTyxNQUEzQjtnQkFBbUMsS0FBQSxFQUFNLElBQXpDO2FBQWYsRUFQSjs7SUFYTTs7OztHQXpFTTs7QUE2RnBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBzbGFzaCwgZnMsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5ldmVudCAgID0gcmVxdWlyZSAnZXZlbnRzJ1xud2Fsa2RpciA9IHJlcXVpcmUgJ3dhbGtkaXInXG5cbmNsYXNzIFdhdGNoIGV4dGVuZHMgZXZlbnRcblxuICAgIEA6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBAZGlyICA9IHNsYXNoLnJlc29sdmUgcGF0aFxuICAgICAgICBAb3B0ICA9IG9wdCA/IHt9XG4gICAgICAgIEBsYXN0ID0ge31cbiAgICAgICAgXG4gICAgICAgIHNsYXNoLmV4aXN0cyBAZGlyLCAoc3RhdCkgPT4gaWYgc3RhdCB0aGVuIEB3YXRjaERpcigpXG4gICAgICAgXG4gICAgQHdhdGNoOiAocGF0aCwgb3B0KSAtPlxuICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0RpciBwYXRoXG4gICAgICAgICAgICBXYXRjaC5kaXIgcGF0aCwgb3B0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFdhdGNoLmZpbGUgcGF0aCwgb3B0XG4gICAgXG4gICAgQGZpbGU6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgdyA9IFdhdGNoLmRpciBzbGFzaC5kaXIocGF0aCksIG9wdFxuICAgICAgICB3LmZpbGUgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgd1xuICAgICAgICBcbiAgICBAZGlyOiAocGF0aCwgb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgbmV3IFdhdGNoIHBhdGgsIG9wdFxuXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAd2F0Y2g/LmNsb3NlKClcbiAgICAgICAgZGVsZXRlIEB3YXRjaFxuICAgICAgICBkZWxldGUgQGRpclxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgZm9yIHdhdGNoIGluIEB3YXRjaGVycyBcbiAgICAgICAgICAgICAgICB3YXRjaC5jbG9zZSgpXG4gICAgICAgICAgICBkZWxldGUgQHdhdGNoZXJzXG4gICAgICAgIFxuICAgIHdhdGNoRGlyOiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZGlyXG4gICAgICAgIFxuICAgICAgICBAd2F0Y2ggPSBmcy53YXRjaCBAZGlyXG4gICAgICAgIEB3YXRjaC5vbiAnZXJyb3InLCAoZXJyKSAtPiBlcnJvciBcImZzLndhdGNoIGRpcjonI3tAZGlyfScgZXJyb3I6ICN7ZXJyLnN0YWNrfVwiXG4gICAgICAgIEB3YXRjaC5vbiAnY2hhbmdlJywgQG9uQ2hhbmdlXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIEB3YWxrZXIgPSB3YWxrZGlyIEBkaXJcbiAgICAgICAgICAgIG9uUGF0aCA9IChpZ25vcmUpIC0+IChwYXRoKSAtPiBcbiAgICAgICAgICAgICAgICBmb3IgcmVnZXggaW4gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBAd2Fsa2VyLm9uICdwYXRoJywgb25QYXRoIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAd2Fsa2VyLm9uICdkaXJlY3RvcnknLCAocGF0aCkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgd2F0Y2ggPSBmcy53YXRjaCBwYXRoXG4gICAgICAgICAgICAgICAgQHdhdGNoZXJzLnB1c2ggd2F0Y2hcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSAoZGlyKSA9PiAoY2hnLCBwdGgpID0+IEBvbkNoYW5nZSBjaGcsIHB0aCwgZGlyXG4gICAgICAgICAgICAgICAgd2F0Y2gub24gJ2NoYW5nZScsIGNoYW5nZSBwYXRoXG5cbiAgICBpZ25vcmU6IChwYXRoKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgIGZvciByZWdleCBpbiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgIG9uQ2hhbmdlOiAoY2hhbmdlLCBwYXRoLCBkaXI9QGRpcikgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBAaWdub3JlIHBhdGhcbiAgICAgICAgXG4gICAgICAgIHBhdGggPSBzbGFzaC5qb2luIGRpciwgcGF0aFxuICAgICAgICBpZiBAZmlsZSBhbmQgQGZpbGUgIT0gcGF0aFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0RpciBwYXRoXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBzdGF0ID0gc2xhc2guZmlsZUV4aXN0cyBwYXRoXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgcGF0aCA9PSBAbGFzdD8ucGF0aCBhbmQgc3RhdC5tdGltZS5nZXRUaW1lKCkgPT0gQGxhc3Q/Lm10aW1lPy5nZXRUaW1lKClcbiAgICAgICAgICAgICAgICByZXR1cm4gIyB1bmNoYW5nZWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3QgPSBtdGltZTpzdGF0Lm10aW1lLCBwYXRoOnBhdGhcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZTpjaGFuZ2UsIHdhdGNoOkBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFdhdGNoXG4iXX0=
//# sourceURL=../coffee/watch.coffee