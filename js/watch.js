
/*
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
 */
var Watch, _, event, fs, log, ref, slash, walkdir,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ref = require('./kxk'), slash = ref.slash, log = ref.log, fs = ref.fs, _ = ref._;

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
      return log("fs.watch dir:'" + this.dir + "' error: " + err.stack);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkNBQUE7RUFBQTs7OztBQVFBLE1BQXdCLE9BQUEsQ0FBUSxPQUFSLENBQXhCLEVBQUUsaUJBQUYsRUFBUyxhQUFULEVBQWMsV0FBZCxFQUFrQjs7QUFFbEIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFFSjs7O0VBRVcsZUFBQyxJQUFELEVBQU8sR0FBUDs7SUFFVCxxQ0FBQTtJQUVBLElBQUMsQ0FBQSxHQUFELEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO0lBQ1AsSUFBQyxDQUFBLEdBQUQsaUJBQU8sTUFBTTtJQUViLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBQyxDQUFBLEdBQWQsRUFBbUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLElBQUQ7UUFBVSxJQUFHLElBQUg7aUJBQWEsS0FBQyxDQUFBLFFBQUQsQ0FBQSxFQUFiOztNQUFWO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtFQVBTOztFQVNiLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxJQUFELEVBQU8sR0FBUDtJQUVKLElBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaLENBQUg7YUFDSSxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFBZ0IsR0FBaEIsRUFESjtLQUFBLE1BQUE7YUFHSSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFBaUIsR0FBakIsRUFISjs7RUFGSTs7RUFPUixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFFSCxRQUFBO0lBQUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQVYsRUFBMkIsR0FBM0I7SUFDSixDQUFDLENBQUMsSUFBRixHQUFTLEtB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LHVCQUF1QixDQUFDLElBQXhCLENBQTZCLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixDQUE3QixDQUFIO0FBQ0ksYUFESjs7SUFHQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLElBQWhCO0lBRVAsSUFBRyxJQUFDLENBQUEsSUFBRCxJQUFVLElBQUMsQ0FBQSxJQUFELEtBQVMsSUFBdEI7QUFDSSxhQURKOztXQUdBLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUFnQjtNQUFBLEdBQUEsRUFBSSxHQUFKO01BQVMsSUFBQSxFQUFLLElBQWQ7TUFBb0IsTUFBQSxFQUFPLE1BQTNCO01BQW1DLEtBQUEsRUFBTSxJQUF6QztLQUFoQjtFQWJNOzs7O0dBMUVNOztBQXlGcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwICAgICAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHNsYXNoLCBsb2csIGZzLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuZXZlbnQgICA9IHJlcXVpcmUgJ2V2ZW50cydcbndhbGtkaXIgPSByZXF1aXJlICd3YWxrZGlyJ1xuXG5jbGFzcyBXYXRjaCBleHRlbmRzIGV2ZW50XG5cbiAgICBjb25zdHJ1Y3RvcjogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIEBkaXIgPSBzbGFzaC5yZXNvbHZlIHBhdGhcbiAgICAgICAgQG9wdCA9IG9wdCA/IHt9XG4gICAgICAgIFxuICAgICAgICBzbGFzaC5leGlzdHMgQGRpciwgKHN0YXQpID0+IGlmIHN0YXQgdGhlbiBAd2F0Y2hEaXIoKSBcbiAgICAgICBcbiAgICBAd2F0Y2g6IChwYXRoLCBvcHQpIC0+XG4gICAgXG4gICAgICAgIGlmIHNsYXNoLmlzRGlyIHBhdGhcbiAgICAgICAgICAgIFdhdGNoLmRpciBwYXRoLCBvcHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgV2F0Y2guZmlsZSBwYXRoLCBvcHRcbiAgICBcbiAgICBAZmlsZTogKHBhdGgsIG9wdCkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICB3ID0gV2F0Y2guZGlyIHNsYXNoLmRpcihwYXRoKSwgb3B0XG4gICAgICAgIHcuZmlsZSA9IHNsYXNoLnJlc29sdmUgcGF0aFxuICAgICAgICB3XG4gICAgICAgIFxuICAgIEBkaXI6IChwYXRoLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBuZXcgV2F0Y2ggcGF0aCwgb3B0XG5cbiAgICBjbG9zZTogLT5cbiAgICAgICAgXG4gICAgICAgIEB3YXRjaD8uY2xvc2UoKVxuICAgICAgICBkZWxldGUgQHdhdGNoXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnJlY3Vyc2l2ZVxuICAgICAgICAgICAgZm9yIHdhdGNoIGluIEB3YXRjaGVycyBcbiAgICAgICAgICAgICAgICB3YXRjaC5jbG9zZSgpXG4gICAgICAgICAgICBkZWxldGUgQHdhdGNoZXJzXG4gICAgICAgIFxuICAgIHdhdGNoRGlyOiAtPlxuICAgICAgICBcbiAgICAgICAgQHdhdGNoID0gZnMud2F0Y2ggQGRpclxuICAgICAgICBAd2F0Y2gub24gJ2Vycm9yJywgKGVycikgLT4gbG9nIFwiZnMud2F0Y2ggZGlyOicje0BkaXJ9JyBlcnJvcjogI3tlcnIuc3RhY2t9XCJcbiAgICAgICAgQHdhdGNoLm9uICdjaGFuZ2UnLCBAb25DaGFuZ2VcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQucmVjdXJzaXZlXG4gICAgICAgICAgICAjIGxvZyAnaWdub3JlJywgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgIEB3YXRjaGVycyA9IFtdXG4gICAgICAgICAgICBAd2Fsa2VyID0gd2Fsa2RpciBAZGlyXG4gICAgICAgICAgICBvblBhdGggPSAoaWdub3JlKSAtPiAocGF0aCkgLT4gXG4gICAgICAgICAgICAgICAgZm9yIHJlZ2V4IGluIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBpZiBuZXcgUmVnRXhwKHJlZ2V4KS50ZXN0IHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICMgbG9nIFwiaWdub3JlICN7cmVnZXh9ICN7cGF0aH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5pZ25vcmVcbiAgICAgICAgICAgICAgICBAd2Fsa2VyLm9uICdwYXRoJywgb25QYXRoIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAd2Fsa2VyLm9uICdkaXJlY3RvcnknLCAocGF0aCkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgQGlnbm9yZSBwYXRoXG4gICAgICAgICAgICAgICAgIyBsb2cgXCJ3YXRjaCAje3BhdGh9XCJcbiAgICAgICAgICAgICAgICB3YXRjaCA9IGZzLndhdGNoIHBhdGhcbiAgICAgICAgICAgICAgICBAd2F0Y2hlcnMucHVzaCB3YXRjaFxuICAgICAgICAgICAgICAgIGNoYW5nZSA9IChkaXIpID0+IChjaGcsIHB0aCkgPT4gQG9uQ2hhbmdlIGNoZywgcHRoLCBkaXJcbiAgICAgICAgICAgICAgICB3YXRjaC5vbiAnY2hhbmdlJywgY2hhbmdlIHBhdGhcblxuICAgIGlnbm9yZTogKHBhdGgpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lmlnbm9yZVxuICAgICAgICAgICAgZm9yIHJlZ2V4IGluIEBvcHQuaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgbmV3IFJlZ0V4cChyZWdleCkudGVzdCBwYXRoXG4gICAgICAgICAgICAgICAgICAgICMgbG9nIFwiaWdub3JlISAje3JlZ2V4fSAje3BhdGh9XCJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICBvbkNoYW5nZTogKGNoYW5nZSwgcGF0aCwgZGlyPUBkaXIpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgQGlnbm9yZSBwYXRoXG4gICAgICAgIFxuICAgICAgICAjIGxvZyAnb25DaGFuZ2UnLCBjaGFuZ2UsIHBhdGgsIGRpclxuICAgICAgICBpZiAvXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkP1xcZD8kLy50ZXN0IHNsYXNoLmV4dCBwYXRoXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBwYXRoID0gc2xhc2guam9pbiBkaXIsIHBhdGhcbiAgICAgICAgIyBsb2cgJ29uQ2hhbmdlLS0tJywgcGF0aFxuICAgICAgICBpZiBAZmlsZSBhbmQgQGZpbGUgIT0gcGF0aFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgQGVtaXQgJ2NoYW5nZScsIGRpcjpkaXIsIHBhdGg6cGF0aCwgY2hhbmdlOmNoYW5nZSwgd2F0Y2g6QFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gV2F0Y2hcbiJdfQ==
//# sourceURL=../coffee/watch.coffee