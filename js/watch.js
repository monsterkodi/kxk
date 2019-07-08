// koffee 1.3.0

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
        if (dir == null) {
            dir = this.dir;
        }
        if (this.ignore(path)) {
            return;
        }
        if (/\d\d\d\d\d\d\d\d?\d?$/.test(slash.ext(path))) {
            return;
        }
        path = slash.join(dir, path);
        if (this.file && this.file !== path) {
            return;
        }
        return this.emit('change', {
            dir: dir,
            path: path,
            change: change,
            watch: this
        });
    };

    return Watch;

})(event);

module.exports = Watch;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHdDQUFBO0lBQUE7Ozs7QUFRQSxNQUFtQixPQUFBLENBQVEsT0FBUixDQUFuQixFQUFFLGlCQUFGLEVBQVMsV0FBVCxFQUFhOztBQUViLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVXLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRVQscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNQLElBQUMsQ0FBQSxHQUFELGlCQUFPLE1BQU07UUFFYixLQUFLLENBQUMsTUFBTixDQUFhLElBQUMsQ0FBQSxHQUFkLEVBQW1CLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsSUFBRDtnQkFBVSxJQUFHLElBQUg7MkJBQWEsS0FBQyxDQUFBLFFBQUQsQ0FBQSxFQUFiOztZQUFWO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtJQVBTOztJQVNiLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxJQUFELEVBQU8sR0FBUDtRQUVKLElBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaLENBQUg7bUJBQ0ksS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLEVBQWdCLEdBQWhCLEVBREo7U0FBQSxNQUFBO21CQUdJLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQUFpQixHQUFqQixFQUhKOztJQUZJOztJQU9SLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxJQUFELEVBQU8sR0FBUDtBQUVILFlBQUE7UUFBQSxDQUFBLEdBQUksS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsQ0FBVixFQUEyQixHQUEzQjtRQUNKLENBQUMsQ0FBQyxJQUFGLEdBQVMsS0FBSyxDQUFD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LEdBQWY7O1lBQWUsTUFBSSxJQUFDLENBQUE7O1FBRTFCLElBQVUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLENBQVY7QUFBQSxtQkFBQTs7UUFFQSxJQUFHLHVCQUF1QixDQUFDLElBQXhCLENBQTZCLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixDQUE3QixDQUFIO0FBQ0ksbUJBREo7O1FBR0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUFnQixJQUFoQjtRQUNQLElBQUcsSUFBQyxDQUFBLElBQUQsSUFBVSxJQUFDLENBQUEsSUFBRCxLQUFTLElBQXRCO0FBQ0ksbUJBREo7O2VBR0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQWdCO1lBQUEsR0FBQSxFQUFJLEdBQUo7WUFBUyxJQUFBLEVBQUssSUFBZDtZQUFvQixNQUFBLEVBQU8sTUFBM0I7WUFBbUMsS0FBQSxFQUFNLElBQXpDO1NBQWhCO0lBWE07Ozs7R0F4RU07O0FBcUZwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAgICAgIDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgc2xhc2gsIGZzLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuZXZlbnQgICA9IHJlcXVpcmUgJ2V2ZW50cydcbndhbGtkaXIgPSByZXF1aXJlICd3YWxrZGlyJ1xuXG5jbGFzcyBXYXRjaCBleHRlbmRzIGV2ZW50XG5cbiAgICBjb25zdHJ1Y3RvcjogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIEBkaXIgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgQG9wdCA9IG9wdCA/IHt9XG4gICAgICAgIFxuICAgICAgICBzbGFzaC5leGlzdHMgQGRpciwgKHN0YXQpID0+IGlmIHN0YXQgdGhlbiBAd2F0Y2hEaXIoKSBcbiAgICAgICBcbiAgICBAd2F0Y2g6IChwYXRoLCBvcHQpIC0+XG4gICAgXG4gICAgICAgIGlmIHNsYXNoLmlzRGlyIHBhdGhcbiAgICAgICAgICAgIFdhdGNoLmRpciBwYXRoLCBvcHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgV2F0Y2guZmlsZSBwYXRoLCBvcHRcbiAgICBcbiAgICBAZmlsZTogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICB3ID0gV2F0Y2guZGlyIHNsYXNoLmRpcihwYXRoKSwgb3B0XG4gICAgICAgIHcuZmlsZSA9IHNsYXNoLnJlc29sdmUgcGF0aFxuICAgICAgICB3XG4gICAgICAgIFxuICAgIEBkaXI6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBuZXcgV2F0Y2ggcGF0aCwgb3B0XG5cbiAgICBjbG9zZTogLT5cbiAgICAgICAgXG4gICAgICAgIEB3YXRjaD8uY2xvc2UoKVxuICAgICAgICBkZWxldGUgQHdhdGNoXG4gICAgICAgIGRlbGV0ZSBAZGlyXG4gICAgICAgIGlmIEBvcHQucmVjdXJzaXZlXG4gICAgICAgICAgICBmb3Igd2F0Y2ggaW4gQHdhdGNoZXJzIFxuICAgICAgICAgICAgICAgIHdhdGNoLmNsb3NlKClcbiAgICAgICAgICAgIGRlbGV0ZSBAd2F0Y2hlcnNcbiAgICAgICAgXG4gICAgd2F0Y2hEaXI6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBkaXJcbiAgICAgICAgXG4gICAgICAgIEB3YXRjaCA9IGZzLndhdGNoIEBkaXJcbiAgICAgICAgQHdhdGNoLm9uICdlcnJvcicsIChlcnIpIC0+IGVycm9yIFwiZnMud2F0Y2ggZGlyOicje0BkaXJ9JyBlcnJvcjogI3tlcnIuc3RhY2t9XCJcbiAgICAgICAgQHdhdGNoLm9uICdjaGFuZ2UnLCBAb25DaGFuZ2VcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQucmVjdXJzaXZlXG4gICAgICAgICAgICBAd2F0Y2hlcnMgPSBbXVxuICAgICAgICAgICAgQHdhbGtlciA9IHdhbGtkaXIgQGRpclxuICAgICAgICAgICAgb25QYXRoID0gKGlnbm9yZSkgLT4gKHBhdGgpIC0+IFxuICAgICAgICAgICAgICAgIGZvciByZWdleCBpbiBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgaWYgbmV3IFJlZ0V4cChyZWdleCkudGVzdCBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBAaWdub3JlIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIEB3YWxrZXIub24gJ3BhdGgnLCBvblBhdGggQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB3YWxrZXIub24gJ2RpcmVjdG9yeScsIChwYXRoKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiBAaWdub3JlIHBhdGhcbiAgICAgICAgICAgICAgICB3YXRjaCA9IGZzLndhdGNoIHBhdGhcbiAgICAgICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaFxuICAgICAgICAgICAgICAgIGNoYW5nZSA9IChkaXIpID0+IChjaGcsIHB0aCkgPT4gQG9uQ2hhbmdlIGNoZywgcHRoLCBkaXJcbiAgICAgICAgICAgICAgICB3YXRjaC5vbiAnY2hhbmdlJywgY2hhbmdlIHBhdGhcblxuICAgIGlnbm9yZTogKHBhdGgpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgZm9yIHJlZ2V4IGluIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgbmV3IFJlZ0V4cChyZWdleCkudGVzdCBwYXRoXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgb25DaGFuZ2U6IChjaGFuZ2UsIHBhdGgsIGRpcj1AZGlyKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICBcbiAgICAgICAgaWYgL1xcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZD9cXGQ/JC8udGVzdCBzbGFzaC5leHQgcGF0aFxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcGF0aCA9IHNsYXNoLmpvaW4gZGlyLCBwYXRoXG4gICAgICAgIGlmIEBmaWxlIGFuZCBAZmlsZSAhPSBwYXRoXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBAZW1pdCAnY2hhbmdlJywgZGlyOmRpciwgcGF0aDpwYXRoLCBjaGFuZ2U6Y2hhbmdlLCB3YXRjaDpAXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXYXRjaFxuIl19
//# sourceURL=../coffee/watch.coffee