// koffee 0.42.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHdDQUFBO0lBQUE7Ozs7QUFRQSxNQUFtQixPQUFBLENBQVEsT0FBUixDQUFuQixFQUFFLGlCQUFGLEVBQVMsV0FBVCxFQUFhOztBQUViLEtBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBRUo7OztJQUVXLGVBQUMsSUFBRCxFQUFPLEdBQVA7O1FBRVQscUNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtRQUNQLElBQUMsQ0FBQSxHQUFELGlCQUFPLE1BQU07UUFFYixLQUFLLENBQUMsTUFBTixDQUFhLElBQUMsQ0FBQSxHQUFkLEVBQW1CLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsSUFBRDtnQkFBVSxJQUFHLElBQUg7MkJBQWEsS0FBQyxDQUFBLFFBQUQsQ0FBQSxFQUFiOztZQUFWO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtJQVBTOztJQVNiLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxJQUFELEVBQU8sR0FBUDtRQUVKLElBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaLENBQUg7bUJBQ0ksS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLEVBQWdCLEdBQWhCLEVBREo7U0FBQSxNQUFBO21CQUdJLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQUFpQixHQUFqQixFQUhKOztJQUZJOztJQU9SLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxJQUFELEVBQU8sR0FBUDtBQUVILFlBQUE7UUFBQSxDQUFBLEdBQUksS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsQ0FBVixFQUEyQixHQUEzQjtRQUNKLENBQUMsQ0FBQyxJQUFGLEdBQVMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO2VBQ1Q7SUFKRzs7SUFNUCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsSUFBRCxFQUFPLEdBQVA7ZUFFRixJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEdBQWhCO0lBRkU7O29CQUlOLEtBQUEsR0FBTyxTQUFBO0FBRUgsWUFBQTs7Z0JBQU0sQ0FBRSxLQUFSLENBQUE7O1FBQ0EsT0FBTyxJQUFDLENBQUE7UUFFUixJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBUjtBQUNJO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUNJLEtBQUssQ0FBQyxLQUFOLENBQUE7QUFESjttQkFFQSxPQUFPLElBQUMsQ0FBQSxTQUhaOztJQUxHOztvQkFVUCxRQUFBLEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLEdBQVY7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQW1CLFNBQUMsR0FBRDttQkFBTyxPQUFBLENBQUUsS0FBRixDQUFRLGdCQUFBLEdBQWlCLElBQUMsQ0FBQSxHQUFsQixHQUFzQixXQUF0QixHQUFpQyxHQUFHLENBQUMsS0FBN0M7UUFBUCxDQUFuQjtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFFBQVYsRUFBb0IsSUFBQyxDQUFBLFFBQXJCO1FBRUEsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLFNBQVI7WUFFSSxJQUFDLENBQUEsUUFBRCxHQUFZO1lBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFBLENBQVEsSUFBQyxDQUFBLEdBQVQ7WUFDVixNQUFBLEdBQVMsU0FBQyxNQUFEO3VCQUFZLFNBQUMsSUFBRDtBQUNqQix3QkFBQTtBQUFBLHlCQUFBLHdDQUFBOzt3QkFDSSxJQUFHLElBQUksTUFBSixDQUFXLEtBQVgsQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUFIOzRCQUVJLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBUjtBQUNBLG1DQUhKOztBQURKO2dCQURpQjtZQUFaO1lBT1QsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQVI7Z0JBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLENBQVcsTUFBWCxFQUFtQixNQUFBLENBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFaLENBQW5CLEVBREo7O21CQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFXLFdBQVgsRUFBd0IsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxJQUFEO0FBQ3BCLHdCQUFBO29CQUFBLElBQVUsS0FBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLENBQVY7QUFBQSwrQkFBQTs7b0JBRUEsS0FBQSxHQUFRLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBVDtvQkFDUixLQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxLQUFmO29CQUNBLE1BQUEsR0FBUyxTQUFDLEdBQUQ7K0JBQVMsU0FBQyxHQUFELEVBQU0sR0FBTjttQ0FBYyxLQUFDLENBQUEsUUFBRCxDQUFVLEdBQVYsRUFBZSxHQUFmLEVBQW9CLEdBQXBCO3dCQUFkO29CQUFUOzJCQUNULEtBQUssQ0FBQyxFQUFOLENBQVMsUUFBVCxFQUFtQixNQUFBLENBQU8sSUFBUCxDQUFuQjtnQkFOb0I7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLEVBZEo7O0lBTk07O29CQTRCVixNQUFBLEdBQVEsU0FBQyxJQUFEO0FBRUosWUFBQTtRQUFBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFSO0FBQ0k7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQ0ksSUFBRyxJQUFJLE1BQUosQ0FBVyxLQUFYLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBSDtBQUVJLDJCQUFPLEtBRlg7O0FBREosYUFESjs7SUFGSTs7b0JBUVIsUUFBQSxHQUFVLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxHQUFmOztZQUFlLE1BQUksSUFBQyxDQUFBOztRQUUxQixJQUFVLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBUixDQUFWO0FBQUEsbUJBQUE7O1FBR0EsSUFBRyx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsQ0FBN0IsQ0FBSDtBQUNJLG1CQURKOztRQUdBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsSUFBaEI7UUFFUCxJQUFHLElBQUMsQ0FBQSxJQUFELElBQVUsSUFBQyxDQUFBLElBQUQsS0FBUyxJQUF0QjtBQUNJLG1CQURKOztlQUdBLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUFnQjtZQUFBLEdBQUEsRUFBSSxHQUFKO1lBQVMsSUFBQSxFQUFLLElBQWQ7WUFBb0IsTUFBQSxFQUFPLE1BQTNCO1lBQW1DLEtBQUEsRUFBTSxJQUF6QztTQUFoQjtJQWJNOzs7O0dBMUVNOztBQXlGcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHNsYXNoLCBmcywgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmV2ZW50ICAgPSByZXF1aXJlICdldmVudHMnXG53YWxrZGlyID0gcmVxdWlyZSAnd2Fsa2RpcidcblxuY2xhc3MgV2F0Y2ggZXh0ZW5kcyBldmVudFxuXG4gICAgY29uc3RydWN0b3I6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBAZGlyID0gc2xhc2gucmVzb2x2ZSBwYXRoXG4gICAgICAgIEBvcHQgPSBvcHQgPyB7fVxuICAgICAgICBcbiAgICAgICAgc2xhc2guZXhpc3RzIEBkaXIsIChzdGF0KSA9PiBpZiBzdGF0IHRoZW4gQHdhdGNoRGlyKCkgXG4gICAgICAgXG4gICAgQHdhdGNoOiAocGF0aCwgb3B0KSAtPlxuICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0RpciBwYXRoXG4gICAgICAgICAgICBXYXRjaC5kaXIgcGF0aCwgb3B0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFdhdGNoLmZpbGUgcGF0aCwgb3B0XG4gICAgXG4gICAgQGZpbGU6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgdyA9IFdhdGNoLmRpciBzbGFzaC5kaXIocGF0aCksIG9wdFxuICAgICAgICB3LmZpbGUgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgd1xuICAgICAgICBcbiAgICBAZGlyOiAocGF0aCwgb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgbmV3IFdhdGNoIHBhdGgsIG9wdFxuXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAd2F0Y2g/LmNsb3NlKClcbiAgICAgICAgZGVsZXRlIEB3YXRjaFxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5yZWN1cnNpdmVcbiAgICAgICAgICAgIGZvciB3YXRjaCBpbiBAd2F0Y2hlcnMgXG4gICAgICAgICAgICAgICAgd2F0Y2guY2xvc2UoKVxuICAgICAgICAgICAgZGVsZXRlIEB3YXRjaGVyc1xuICAgICAgICBcbiAgICB3YXRjaERpcjogLT5cbiAgICAgICAgXG4gICAgICAgIEB3YXRjaCA9IGZzLndhdGNoIEBkaXJcbiAgICAgICAgQHdhdGNoLm9uICdlcnJvcicsIChlcnIpIC0+IGVycm9yIFwiZnMud2F0Y2ggZGlyOicje0BkaXJ9JyBlcnJvcjogI3tlcnIuc3RhY2t9XCJcbiAgICAgICAgQHdhdGNoLm9uICdjaGFuZ2UnLCBAb25DaGFuZ2VcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQucmVjdXJzaXZlXG4gICAgICAgICAgICAjIGxvZyAnaWdub3JlJywgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgICAgICAgICBAd2Fsa2VyID0gd2Fsa2RpciBAZGlyXG4gICAgICAgICAgICBvblBhdGggPSAoaWdub3JlKSAtPiAocGF0aCkgLT4gXG4gICAgICAgICAgICAgICAgZm9yIHJlZ2V4IGluIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBpZiBuZXcgUmVnRXhwKHJlZ2V4KS50ZXN0IHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICMgbG9nIFwiaWdub3JlICN7cmVnZXh9ICN7cGF0aH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBAd2Fsa2VyLm9uICdwYXRoJywgb25QYXRoIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAd2Fsa2VyLm9uICdkaXJlY3RvcnknLCAocGF0aCkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgIyBsb2cgXCJ3YXRjaCAje3BhdGh9XCJcbiAgICAgICAgICAgICAgICB3YXRjaCA9IGZzLndhdGNoIHBhdGhcbiAgICAgICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaFxuICAgICAgICAgICAgICAgIGNoYW5nZSA9IChkaXIpID0+IChjaGcsIHB0aCkgPT4gQG9uQ2hhbmdlIGNoZywgcHRoLCBkaXJcbiAgICAgICAgICAgICAgICB3YXRjaC5vbiAnY2hhbmdlJywgY2hhbmdlIHBhdGhcblxuICAgIGlnbm9yZTogKHBhdGgpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgZm9yIHJlZ2V4IGluIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgbmV3IFJlZ0V4cChyZWdleCkudGVzdCBwYXRoXG4gICAgICAgICAgICAgICAgICAgICMgbG9nIFwiaWdub3JlISAje3JlZ2V4fSAje3BhdGh9XCJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICBvbkNoYW5nZTogKGNoYW5nZSwgcGF0aCwgZGlyPUBkaXIpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgQGlnbm9yZSBwYXRoXG4gICAgICAgIFxuICAgICAgICAjIGxvZyAnb25DaGFuZ2UnLCBjaGFuZ2UsIHBhdGgsIGRpclxuICAgICAgICBpZiAvXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkP1xcZD8kLy50ZXN0IHNsYXNoLmV4dCBwYXRoXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBwYXRoID0gc2xhc2guam9pbiBkaXIsIHBhdGhcbiAgICAgICAgIyBsb2cgJ29uQ2hhbmdlLS0tJywgcGF0aFxuICAgICAgICBpZiBAZmlsZSBhbmQgQGZpbGUgIT0gcGF0aFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgQGVtaXQgJ2NoYW5nZScsIGRpcjpkaXIsIHBhdGg6cGF0aCwgY2hhbmdlOmNoYW5nZSwgd2F0Y2g6QFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gV2F0Y2hcbiJdfQ==
//# sourceURL=../coffee/watch.coffee