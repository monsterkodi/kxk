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
            return kerror("watch dir:'" + this.dir + "' error: " + err);
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
                    watch.on('change', change(path));
                    return watch.on('error', function(err) {
                        return kerror("watch subdir:'" + dir + "' error: " + err);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHdDQUFBO0lBQUE7Ozs7QUFRQSxNQUFtQixPQUFBLENBQVEsT0FBUixDQUFuQixFQUFFLGlCQUFGLEVBQVMsV0FBVCxFQUFhOztBQUViLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVDLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRUMscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNSLElBQUMsQ0FBQSxHQUFELGlCQUFRLE1BQU07UUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBRVIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Z0JBQVUsSUFBRyxJQUFIOzJCQUFhLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBYjs7WUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFSRDs7SUFVSCxLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsSUFBRCxFQUFPLEdBQVA7UUFFSixJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBWixDQUFIO21CQUNJLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixFQUFnQixHQUFoQixFQURKO1NBQUEsTUFBQTttQkFHSSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFBaUIsR0FBakIsRUFISjs7SUFGSTs7SUFPUixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFFSCxZQUFBO1FBQUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQVYsRUFBMkIsR0FBM0I7UUFDSixDQUFD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LENBQVcsS0FBWCxDQUFpQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBQUg7QUFDSSwyQkFBTyxLQURYOztBQURKLGFBREo7O0lBRkk7O29CQU9SLFFBQUEsR0FBVSxTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsR0FBZjtBQUVOLFlBQUE7O1lBRnFCLE1BQUksSUFBQyxDQUFBOztRQUUxQixJQUFVLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBUixDQUFWO0FBQUEsbUJBQUE7O1FBRUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUFnQixJQUFoQjtRQUNQLElBQUcsSUFBQyxDQUFBLElBQUQsSUFBVSxJQUFDLENBQUEsSUFBRCxLQUFTLElBQXRCO0FBQ0ksbUJBREo7O1FBR0EsSUFBRyxLQUFLLENBQUMsS0FBTixDQUFZLElBQVosQ0FBSDtBQUNJLG1CQURKOztRQUdBLElBQUcsSUFBQSxHQUFPLEtBQUssQ0FBQyxVQUFOLENBQWlCLElBQWpCLENBQVY7WUFFSSxJQUFHLElBQUEsdUNBQWEsQ0FBRSxjQUFmLElBQXdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFBLENBQUEscUVBQW9DLENBQUUsT0FBZCxDQUFBLG9CQUFuRDtBQUNJLHVCQURKOztZQUdBLElBQUMsQ0FBQSxJQUFELEdBQVE7Z0JBQUEsS0FBQSxFQUFNLElBQUksQ0FBQyxLQUFYO2dCQUFrQixJQUFBLEVBQUssSUFBdkI7O21CQUVSLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUFlO2dCQUFBLEdBQUEsRUFBSSxHQUFKO2dCQUFTLElBQUEsRUFBSyxJQUFkO2dCQUFvQixNQUFBLEVBQU8sTUFBM0I7Z0JBQW1DLEtBQUEsRUFBTSxJQUF6QzthQUFmLEVBUEo7O0lBWE07Ozs7R0ExRU07O0FBOEZwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAgICAgIDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgc2xhc2gsIGZzLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuZXZlbnQgICA9IHJlcXVpcmUgJ2V2ZW50cydcbndhbGtkaXIgPSByZXF1aXJlICd3YWxrZGlyJ1xuXG5jbGFzcyBXYXRjaCBleHRlbmRzIGV2ZW50XG5cbiAgICBAOiAocGF0aCwgb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQGRpciAgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgQG9wdCAgPSBvcHQgPyB7fVxuICAgICAgICBAbGFzdCA9IHt9XG4gICAgICAgIFxuICAgICAgICBzbGFzaC5leGlzdHMgQGRpciwgKHN0YXQpID0+IGlmIHN0YXQgdGhlbiBAd2F0Y2hEaXIoKVxuICAgICAgIFxuICAgIEB3YXRjaDogKHBhdGgsIG9wdCkgLT5cbiAgICBcbiAgICAgICAgaWYgc2xhc2guaXNEaXIgcGF0aFxuICAgICAgICAgICAgV2F0Y2guZGlyIHBhdGgsIG9wdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBXYXRjaC5maWxlIHBhdGgsIG9wdFxuICAgIFxuICAgIEBmaWxlOiAocGF0aCwgb3B0KSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIHcgPSBXYXRjaC5kaXIgc2xhc2guZGlyKHBhdGgpLCBvcHRcbiAgICAgICAgdy5maWxlID0gc2xhc2gucmVzb2x2ZSBwYXRoXG4gICAgICAgIHdcbiAgICAgICAgXG4gICAgQGRpcjogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIG5ldyBXYXRjaCBwYXRoLCBvcHRcblxuICAgIGNsb3NlOiAtPlxuICAgICAgICBcbiAgICAgICAgQHdhdGNoPy5jbG9zZSgpXG4gICAgICAgIGRlbGV0ZSBAd2F0Y2hcbiAgICAgICAgZGVsZXRlIEBkaXJcbiAgICAgICAgaWYgQG9wdC5yZWN1cnNpdmVcbiAgICAgICAgICAgIGZvciB3YXRjaCBpbiBAd2F0Y2hlcnMgXG4gICAgICAgICAgICAgICAgd2F0Y2guY2xvc2UoKVxuICAgICAgICAgICAgZGVsZXRlIEB3YXRjaGVyc1xuICAgICAgICBcbiAgICB3YXRjaERpcjogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGRpclxuICAgICAgICBcbiAgICAgICAgQHdhdGNoID0gZnMud2F0Y2ggQGRpclxuICAgICAgICBAd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSAtPiBrZXJyb3IgXCJ3YXRjaCBkaXI6JyN7QGRpcn0nIGVycm9yOiAje2Vycn1cIlxuICAgICAgICBAd2F0Y2gub24gJ2NoYW5nZScgQG9uQ2hhbmdlXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgQHdhdGNoZXJzID0gW11cbiAgICAgICAgICAgIEB3YWxrZXIgPSB3YWxrZGlyIEBkaXJcbiAgICAgICAgICAgIG9uUGF0aCA9IChpZ25vcmUpIC0+IChwYXRoKSAtPiBcbiAgICAgICAgICAgICAgICBmb3IgcmVnZXggaW4gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBAd2Fsa2VyLm9uICdwYXRoJyBvblBhdGggQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB3YWxrZXIub24gJ2RpcmVjdG9yeScgKHBhdGgpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBpZ25vcmUgcGF0aFxuICAgICAgICAgICAgICAgIHdhdGNoID0gZnMud2F0Y2ggcGF0aFxuICAgICAgICAgICAgICAgIEB3YXRjaGVycy5wdXNoIHdhdGNoXG4gICAgICAgICAgICAgICAgY2hhbmdlID0gKGRpcikgPT4gKGNoZywgcHRoKSA9PiBAb25DaGFuZ2UgY2hnLCBwdGgsIGRpclxuICAgICAgICAgICAgICAgIHdhdGNoLm9uICdjaGFuZ2UnIGNoYW5nZSBwYXRoXG4gICAgICAgICAgICAgICAgd2F0Y2gub24gJ2Vycm9yJyAoZXJyKSAtPiBrZXJyb3IgXCJ3YXRjaCBzdWJkaXI6JyN7ZGlyfScgZXJyb3I6ICN7ZXJyfVwiXG5cbiAgICBpZ25vcmU6IChwYXRoKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgIGZvciByZWdleCBpbiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIG5ldyBSZWdFeHAocmVnZXgpLnRlc3QgcGF0aFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgIG9uQ2hhbmdlOiAoY2hhbmdlLCBwYXRoLCBkaXI9QGRpcikgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBAaWdub3JlIHBhdGhcbiAgICAgICAgXG4gICAgICAgIHBhdGggPSBzbGFzaC5qb2luIGRpciwgcGF0aFxuICAgICAgICBpZiBAZmlsZSBhbmQgQGZpbGUgIT0gcGF0aFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0RpciBwYXRoXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBzdGF0ID0gc2xhc2guZmlsZUV4aXN0cyBwYXRoXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgcGF0aCA9PSBAbGFzdD8ucGF0aCBhbmQgc3RhdC5tdGltZS5nZXRUaW1lKCkgPT0gQGxhc3Q/Lm10aW1lPy5nZXRUaW1lKClcbiAgICAgICAgICAgICAgICByZXR1cm4gIyB1bmNoYW5nZWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3QgPSBtdGltZTpzdGF0Lm10aW1lLCBwYXRoOnBhdGhcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnY2hhbmdlJyBkaXI6ZGlyLCBwYXRoOnBhdGgsIGNoYW5nZTpjaGFuZ2UsIHdhdGNoOkBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFdhdGNoXG4iXX0=
//# sourceURL=../coffee/watch.coffee