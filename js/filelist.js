(function() {
  /*
  00000000  000  000      00000000  000      000   0000000  000000000  
  000       000  000      000       000      000  000          000     
  000000    000  000      0000000   000      000  0000000      000     
  000       000  000      000       000      000       000     000     
  000       000  0000000  00000000  0000000  000  0000000      000     
  */
  var _, fileList, fs, log, slash,
    indexOf = [].indexOf;

  ({slash, fs, log, _} = require('./kxk'));

  //   synchronous file list

  //   paths  string or a list of strings
  //          if path is relative, returned files are also relative
  //          if path is absolute, returned files are also absolute
  /*           
      opt:  
            ignoreHidden: true # skip files that starts with a dot
            logError:     true # print message to console.log if a path doesn't exits
            depth:        0    # recurse into subdirectories if > 0
            matchExt:     null # string or list of strings to match
  */
  fileList = function(paths, opt) {
    var childdirs, children, copt, d, err, f, files, filter, i, j, k, len, len1, len2, p, pos, ps, stat;
    if (opt == null) {
      opt = {};
    }
    if (opt.ignoreHidden == null) {
      opt.ignoreHidden = true;
    }
    if (opt.logError == null) {
      opt.logError = true;
    }
    files = [];
    if (_.isString(paths)) {
      paths = [paths];
    }
    filter = function(p) {
      var ref;
      if (slash.base(p).toLowerCase() === 'ntuser') {
        return true;
      }
      if (opt.ignoreHidden && slash.file(p).startsWith('.')) {
        return true;
      } else if (opt.matchExt != null) {
        if (_.isString(opt.matchExt) && slash.ext(p) !== opt.matchExt) {
          return true;
        } else if (_.isArray(opt.matchExt) && (ref = slash.ext(p), indexOf.call(opt.matchExt, ref) < 0)) {
          return true;
        }
      }
      return false;
    };
    for (i = 0, len = paths.length; i < len; i++) {
      p = paths[i];
      try {
        [p, pos] = slash.splitFilePos(p);
        stat = fs.statSync(p);
        if (stat.isDirectory()) {
          children = fs.readdirSync(p);
          children = (function() {
            var j, len1, results;
            results = [];
            for (j = 0, len1 = children.length; j < len1; j++) {
              f = children[j];
              results.push(slash.join(p, f));
            }
            return results;
          })();
          childdirs = [];
          for (j = 0, len1 = children.length; j < len1; j++) {
            p = children[j];
            ps = fs.statSync(p);
            if (ps.isDirectory()) {
              childdirs.push(slash.normalize(p));
            } else if (ps.isFile()) {
              if (!filter(p)) {
                if (slash.isAbsolute(p)) {
                  files.push(slash.resolve(p));
                } else {
                  files.push(slash.normalize(p));
                }
              }
            }
          }
          if ((opt.depth != null) && _.isInteger(opt.depth) && opt.depth > 0) {
            copt = _.clone(opt);
            copt.depth -= 1;
            for (k = 0, len2 = childdirs.length; k < len2; k++) {
              d = childdirs[k];
              files = files.concat(fileList(d, copt));
            }
          }
        } else if (stat.isFile()) {
          if (filter(p)) {
            continue;
          }
          p = slash.joinFilePos(p, pos);
          files.push(p);
        }
      } catch (error) {
        err = error;
        if (opt.logError) {
          log(`[ERROR] kxk.fileList: ${err}`);
          log("paths:", paths);
          log("opt:", opt);
        }
      }
    }
    return files;
  };

  module.exports = fileList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpc3QuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9maWxlbGlzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUE7SUFBQTs7RUFRQSxDQUFBLENBQUUsS0FBRixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQWtCLENBQWxCLENBQUEsR0FBd0IsT0FBQSxDQUFRLE9BQVIsQ0FBeEIsRUFSQTs7Ozs7Ozs7Ozs7Ozs7RUF1QkEsUUFBQSxHQUFXLFFBQUEsQ0FBQyxLQUFELEVBQVEsR0FBUixDQUFBO0FBRVAsUUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBOztNQUFBLE1BQU8sQ0FBQTs7O01BQ1AsR0FBRyxDQUFDLGVBQWdCOzs7TUFDcEIsR0FBRyxDQUFDLFdBQWdCOztJQUNwQixLQUFBLEdBQVE7SUFDUixJQUFtQixDQUFDLENBQUMsUUFBRixDQUFXLEtBQVgsQ0FBbkI7TUFBQSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBQVI7O0lBRUEsTUFBQSxHQUFTLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFFTCxVQUFBO01BQUEsSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFdBQWQsQ0FBQSxDQUFBLEtBQStCLFFBQWxDO0FBQWdELGVBQU8sS0FBdkQ7O01BRUEsSUFBRyxHQUFHLENBQUMsWUFBSixJQUFxQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFVBQWQsQ0FBeUIsR0FBekIsQ0FBeEI7QUFDSSxlQUFPLEtBRFg7T0FBQSxNQUVLLElBQUcsb0JBQUg7UUFDRCxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLFFBQWYsQ0FBQSxJQUE2QixLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBQSxLQUFnQixHQUFHLENBQUMsUUFBcEQ7QUFDSSxpQkFBTyxLQURYO1NBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBRyxDQUFDLFFBQWQsQ0FBQSxJQUE0QixPQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLEVBQUEsYUFBb0IsR0FBRyxDQUFDLFFBQXhCLEVBQUEsR0FBQSxLQUFBLENBQS9CO0FBQ0QsaUJBQU8sS0FETjtTQUhKOzthQUtMO0lBWEs7SUFhVCxLQUFBLHVDQUFBOztBQUNJO1FBQ0ksQ0FBQyxDQUFELEVBQUcsR0FBSCxDQUFBLEdBQVUsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsQ0FBbkI7UUFDVixJQUFBLEdBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO1FBRVAsSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQUg7VUFFSSxRQUFBLEdBQVcsRUFBRSxDQUFDLFdBQUgsQ0FBZSxDQUFmO1VBQ1gsUUFBQTs7QUFBNEI7WUFBQSxLQUFBLDRDQUFBOzsyQkFBaEIsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWEsQ0FBYjtZQUFnQixDQUFBOzs7VUFDNUIsU0FBQSxHQUFZO1VBQ1osS0FBQSw0Q0FBQTs7WUFDSSxFQUFBLEdBQUssRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO1lBQ0wsSUFBRyxFQUFFLENBQUMsV0FBSCxDQUFBLENBQUg7Y0FBeUIsU0FBUyxDQUFDLElBQVYsQ0FBZSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFoQixDQUFmLEVBQXpCO2FBQUEsTUFDSyxJQUFHLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBSDtjQUNELElBQUcsQ0FBSSxNQUFBLENBQU8sQ0FBUCxDQUFQO2dCQUNJLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FBakIsQ0FBSDtrQkFDSSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFYLEVBREo7aUJBQUEsTUFBQTtrQkFHSSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQVgsRUFISjtpQkFESjtlQURDOztVQUhUO1VBVUEsSUFBRyxtQkFBQSxJQUFlLENBQUMsQ0FBQyxTQUFGLENBQVksR0FBRyxDQUFDLEtBQWhCLENBQWYsSUFBMEMsR0FBRyxDQUFDLEtBQUosR0FBWSxDQUF6RDtZQUNJLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBRixDQUFRLEdBQVI7WUFDUCxJQUFJLENBQUMsS0FBTCxJQUFjO1lBQ2QsS0FBQSw2Q0FBQTs7Y0FDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVosQ0FBYjtZQURaLENBSEo7V0FmSjtTQUFBLE1BcUJLLElBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFIO1VBRUQsSUFBWSxNQUFBLENBQU8sQ0FBUCxDQUFaO0FBQUEscUJBQUE7O1VBRUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxXQUFOLENBQWtCLENBQWxCLEVBQXFCLEdBQXJCO1VBQ0osS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBTEM7U0F6QlQ7T0FBQSxhQUFBO1FBZ0NNO1FBQ0YsSUFBRyxHQUFHLENBQUMsUUFBUDtVQUNJLEdBQUEsQ0FBSSxDQUFBLHNCQUFBLENBQUEsQ0FBeUIsR0FBekIsQ0FBQSxDQUFKO1VBQ0EsR0FBQSxDQUFJLFFBQUosRUFBYyxLQUFkO1VBQ0EsR0FBQSxDQUFJLE1BQUosRUFBWSxHQUFaLEVBSEo7U0FqQ0o7O0lBREo7V0F1Q0E7RUE1RE87O0VBOERYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBckZqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG4wMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcclxuMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXHJcbjAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxyXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcclxuMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXHJcbiMjI1xyXG5cclxueyBzbGFzaCwgZnMsIGxvZywgXyB9ID0gcmVxdWlyZSAnLi9reGsnXHJcblxyXG4jICAgc3luY2hyb25vdXMgZmlsZSBsaXN0XHJcbiNcclxuIyAgIHBhdGhzICBzdHJpbmcgb3IgYSBsaXN0IG9mIHN0cmluZ3NcclxuIyAgICAgICAgICBpZiBwYXRoIGlzIHJlbGF0aXZlLCByZXR1cm5lZCBmaWxlcyBhcmUgYWxzbyByZWxhdGl2ZVxyXG4jICAgICAgICAgIGlmIHBhdGggaXMgYWJzb2x1dGUsIHJldHVybmVkIGZpbGVzIGFyZSBhbHNvIGFic29sdXRlXHJcbiMjIyAgICAgICAgICAgXHJcbiAgICBvcHQ6ICBcclxuICAgICAgICAgIGlnbm9yZUhpZGRlbjogdHJ1ZSAjIHNraXAgZmlsZXMgdGhhdCBzdGFydHMgd2l0aCBhIGRvdFxyXG4gICAgICAgICAgbG9nRXJyb3I6ICAgICB0cnVlICMgcHJpbnQgbWVzc2FnZSB0byBjb25zb2xlLmxvZyBpZiBhIHBhdGggZG9lc24ndCBleGl0c1xyXG4gICAgICAgICAgZGVwdGg6ICAgICAgICAwICAgICMgcmVjdXJzZSBpbnRvIHN1YmRpcmVjdG9yaWVzIGlmID4gMFxyXG4gICAgICAgICAgbWF0Y2hFeHQ6ICAgICBudWxsICMgc3RyaW5nIG9yIGxpc3Qgb2Ygc3RyaW5ncyB0byBtYXRjaFxyXG4jIyNcclxuXHJcbmZpbGVMaXN0ID0gKHBhdGhzLCBvcHQpIC0+XHJcbiAgICBcclxuICAgIG9wdCA/PSB7fVxyXG4gICAgb3B0Lmlnbm9yZUhpZGRlbiA/PSB0cnVlXHJcbiAgICBvcHQubG9nRXJyb3IgICAgID89IHRydWVcclxuICAgIGZpbGVzID0gW11cclxuICAgIHBhdGhzID0gW3BhdGhzXSBpZiBfLmlzU3RyaW5nIHBhdGhzXHJcbiAgICBcclxuICAgIGZpbHRlciA9IChwKSAtPlxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIHNsYXNoLmJhc2UocCkudG9Mb3dlckNhc2UoKSA9PSAnbnR1c2VyJyB0aGVuIHJldHVybiB0cnVlXHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgb3B0Lmlnbm9yZUhpZGRlbiBhbmQgc2xhc2guZmlsZShwKS5zdGFydHNXaXRoICcuJ1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgb3B0Lm1hdGNoRXh0PyBcclxuICAgICAgICAgICAgaWYgXy5pc1N0cmluZyhvcHQubWF0Y2hFeHQpIGFuZCBzbGFzaC5leHQocCkgIT0gb3B0Lm1hdGNoRXh0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICBlbHNlIGlmIF8uaXNBcnJheShvcHQubWF0Y2hFeHQpIGFuZCBzbGFzaC5leHQocCkgbm90IGluIG9wdC5tYXRjaEV4dFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBmYWxzZVxyXG4gICAgXHJcbiAgICBmb3IgcCBpbiBwYXRoc1xyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgICBbcCxwb3NdID0gc2xhc2guc3BsaXRGaWxlUG9zIHBcclxuICAgICAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jIHBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGZzLnJlYWRkaXJTeW5jIHBcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gKHNsYXNoLmpvaW4ocCxmKSBmb3IgZiBpbiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIGNoaWxkZGlycyA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgcCBpbiBjaGlsZHJlblxyXG4gICAgICAgICAgICAgICAgICAgIHBzID0gZnMuc3RhdFN5bmMgcCBcclxuICAgICAgICAgICAgICAgICAgICBpZiBwcy5pc0RpcmVjdG9yeSgpIHRoZW4gY2hpbGRkaXJzLnB1c2ggc2xhc2gubm9ybWFsaXplIHBcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHBzLmlzRmlsZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBmaWx0ZXIgcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaCBzbGFzaC5yZXNvbHZlIHBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHNsYXNoLm5vcm1hbGl6ZSBwIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIG9wdC5kZXB0aD8gYW5kIF8uaXNJbnRlZ2VyKG9wdC5kZXB0aCkgYW5kIG9wdC5kZXB0aCA+IDBcclxuICAgICAgICAgICAgICAgICAgICBjb3B0ID0gXy5jbG9uZSBvcHRcclxuICAgICAgICAgICAgICAgICAgICBjb3B0LmRlcHRoIC09IDFcclxuICAgICAgICAgICAgICAgICAgICBmb3IgZCBpbiBjaGlsZGRpcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSBmaWxlcy5jb25jYXQgZmlsZUxpc3QgZCwgY29wdCBcclxuXHJcbiAgICAgICAgICAgIGVsc2UgaWYgc3RhdC5pc0ZpbGUoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgY29udGludWUgaWYgZmlsdGVyIHBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcCA9IHNsYXNoLmpvaW5GaWxlUG9zIHAsIHBvc1xyXG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaCBwXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBjYXRjaCBlcnJcclxuICAgICAgICAgICAgaWYgb3B0LmxvZ0Vycm9yXHJcbiAgICAgICAgICAgICAgICBsb2cgXCJbRVJST1JdIGt4ay5maWxlTGlzdDogI3tlcnJ9XCJcclxuICAgICAgICAgICAgICAgIGxvZyBcInBhdGhzOlwiLCBwYXRoc1xyXG4gICAgICAgICAgICAgICAgbG9nIFwib3B0OlwiLCBvcHRcclxuXHJcbiAgICBmaWxlc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmaWxlTGlzdCJdfQ==
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/filelist.coffee