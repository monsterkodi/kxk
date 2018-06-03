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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpc3QuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9maWxlbGlzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUE7SUFBQTs7RUFRQSxDQUFBLENBQUUsS0FBRixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQWtCLENBQWxCLENBQUEsR0FBd0IsT0FBQSxDQUFRLE9BQVIsQ0FBeEIsRUFSQTs7Ozs7Ozs7Ozs7Ozs7RUF1QkEsUUFBQSxHQUFXLFFBQUEsQ0FBQyxLQUFELEVBQVEsR0FBUixDQUFBO0FBRVAsUUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBOztNQUFBLE1BQU8sQ0FBQTs7O01BQ1AsR0FBRyxDQUFDLGVBQWdCOzs7TUFDcEIsR0FBRyxDQUFDLFdBQWdCOztJQUNwQixLQUFBLEdBQVE7SUFDUixJQUFtQixDQUFDLENBQUMsUUFBRixDQUFXLEtBQVgsQ0FBbkI7TUFBQSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBQVI7O0lBRUEsTUFBQSxHQUFTLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFFTCxVQUFBO01BQUEsSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFdBQWQsQ0FBQSxDQUFBLEtBQStCLFFBQWxDO0FBQWdELGVBQU8sS0FBdkQ7O01BRUEsSUFBRyxHQUFHLENBQUMsWUFBSixJQUFxQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFVBQWQsQ0FBeUIsR0FBekIsQ0FBeEI7QUFDSSxlQUFPLEtBRFg7T0FBQSxNQUVLLElBQUcsb0JBQUg7UUFDRCxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLFFBQWYsQ0FBQSxJQUE2QixLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBQSxLQUFnQixHQUFHLENBQUMsUUFBcEQ7QUFDSSxpQkFBTyxLQURYO1NBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBRyxDQUFDLFFBQWQsQ0FBQSxJQUE0QixPQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLEVBQUEsYUFBb0IsR0FBRyxDQUFDLFFBQXhCLEVBQUEsR0FBQSxLQUFBLENBQS9CO0FBQ0QsaUJBQU8sS0FETjtTQUhKOzthQUtMO0lBWEs7SUFhVCxLQUFBLHVDQUFBOztBQUNJO1FBQ0ksQ0FBQyxDQUFELEVBQUcsR0FBSCxDQUFBLEdBQVUsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsQ0FBbkI7UUFDVixJQUFBLEdBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO1FBRVAsSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQUg7VUFFSSxRQUFBLEdBQVcsRUFBRSxDQUFDLFdBQUgsQ0FBZSxDQUFmO1VBQ1gsUUFBQTs7QUFBNEI7WUFBQSxLQUFBLDRDQUFBOzsyQkFBaEIsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWEsQ0FBYjtZQUFnQixDQUFBOzs7VUFDNUIsU0FBQSxHQUFZO1VBQ1osS0FBQSw0Q0FBQTs7WUFDSSxFQUFBLEdBQUssRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO1lBQ0wsSUFBRyxFQUFFLENBQUMsV0FBSCxDQUFBLENBQUg7Y0FBeUIsU0FBUyxDQUFDLElBQVYsQ0FBZSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFoQixDQUFmLEVBQXpCO2FBQUEsTUFDSyxJQUFHLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBSDtjQUNELElBQUcsQ0FBSSxNQUFBLENBQU8sQ0FBUCxDQUFQO2dCQUNJLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FBakIsQ0FBSDtrQkFDSSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFYLEVBREo7aUJBQUEsTUFBQTtrQkFHSSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQVgsRUFISjtpQkFESjtlQURDOztVQUhUO1VBVUEsSUFBRyxtQkFBQSxJQUFlLENBQUMsQ0FBQyxTQUFGLENBQVksR0FBRyxDQUFDLEtBQWhCLENBQWYsSUFBMEMsR0FBRyxDQUFDLEtBQUosR0FBWSxDQUF6RDtZQUNJLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBRixDQUFRLEdBQVI7WUFDUCxJQUFJLENBQUMsS0FBTCxJQUFjO1lBQ2QsS0FBQSw2Q0FBQTs7Y0FDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVosQ0FBYjtZQURaLENBSEo7V0FmSjtTQUFBLE1BcUJLLElBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFIO1VBRUQsSUFBWSxNQUFBLENBQU8sQ0FBUCxDQUFaO0FBQUEscUJBQUE7O1VBRUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxXQUFOLENBQWtCLENBQWxCLEVBQXFCLEdBQXJCO1VBQ0osS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBTEM7U0F6QlQ7T0FBQSxhQUFBO1FBZ0NNO1FBQ0YsSUFBRyxHQUFHLENBQUMsUUFBUDtVQUNJLEdBQUEsQ0FBSSxDQUFBLHNCQUFBLENBQUEsQ0FBeUIsR0FBekIsQ0FBQSxDQUFKO1VBQ0EsR0FBQSxDQUFJLFFBQUosRUFBYyxLQUFkO1VBQ0EsR0FBQSxDQUFJLE1BQUosRUFBWSxHQUFaLEVBSEo7U0FqQ0o7O0lBREo7V0F1Q0E7RUE1RE87O0VBOERYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBckZqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbjAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4wMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMjI1xuXG57IHNsYXNoLCBmcywgbG9nLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuIyAgIHN5bmNocm9ub3VzIGZpbGUgbGlzdFxuI1xuIyAgIHBhdGhzICBzdHJpbmcgb3IgYSBsaXN0IG9mIHN0cmluZ3NcbiMgICAgICAgICAgaWYgcGF0aCBpcyByZWxhdGl2ZSwgcmV0dXJuZWQgZmlsZXMgYXJlIGFsc28gcmVsYXRpdmVcbiMgICAgICAgICAgaWYgcGF0aCBpcyBhYnNvbHV0ZSwgcmV0dXJuZWQgZmlsZXMgYXJlIGFsc28gYWJzb2x1dGVcbiMjIyAgICAgICAgICAgXG4gICAgb3B0OiAgXG4gICAgICAgICAgaWdub3JlSGlkZGVuOiB0cnVlICMgc2tpcCBmaWxlcyB0aGF0IHN0YXJ0cyB3aXRoIGEgZG90XG4gICAgICAgICAgbG9nRXJyb3I6ICAgICB0cnVlICMgcHJpbnQgbWVzc2FnZSB0byBjb25zb2xlLmxvZyBpZiBhIHBhdGggZG9lc24ndCBleGl0c1xuICAgICAgICAgIGRlcHRoOiAgICAgICAgMCAgICAjIHJlY3Vyc2UgaW50byBzdWJkaXJlY3RvcmllcyBpZiA+IDBcbiAgICAgICAgICBtYXRjaEV4dDogICAgIG51bGwgIyBzdHJpbmcgb3IgbGlzdCBvZiBzdHJpbmdzIHRvIG1hdGNoXG4jIyNcblxuZmlsZUxpc3QgPSAocGF0aHMsIG9wdCkgLT5cbiAgICBcbiAgICBvcHQgPz0ge31cbiAgICBvcHQuaWdub3JlSGlkZGVuID89IHRydWVcbiAgICBvcHQubG9nRXJyb3IgICAgID89IHRydWVcbiAgICBmaWxlcyA9IFtdXG4gICAgcGF0aHMgPSBbcGF0aHNdIGlmIF8uaXNTdHJpbmcgcGF0aHNcbiAgICBcbiAgICBmaWx0ZXIgPSAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmJhc2UocCkudG9Mb3dlckNhc2UoKSA9PSAnbnR1c2VyJyB0aGVuIHJldHVybiB0cnVlXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQuaWdub3JlSGlkZGVuIGFuZCBzbGFzaC5maWxlKHApLnN0YXJ0c1dpdGggJy4nXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBlbHNlIGlmIG9wdC5tYXRjaEV4dD8gXG4gICAgICAgICAgICBpZiBfLmlzU3RyaW5nKG9wdC5tYXRjaEV4dCkgYW5kIHNsYXNoLmV4dChwKSAhPSBvcHQubWF0Y2hFeHRcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgZWxzZSBpZiBfLmlzQXJyYXkob3B0Lm1hdGNoRXh0KSBhbmQgc2xhc2guZXh0KHApIG5vdCBpbiBvcHQubWF0Y2hFeHRcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBmYWxzZVxuICAgIFxuICAgIGZvciBwIGluIHBhdGhzXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgW3AscG9zXSA9IHNsYXNoLnNwbGl0RmlsZVBvcyBwXG4gICAgICAgICAgICBzdGF0ID0gZnMuc3RhdFN5bmMgcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGZzLnJlYWRkaXJTeW5jIHBcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IChzbGFzaC5qb2luKHAsZikgZm9yIGYgaW4gY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgY2hpbGRkaXJzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgcCBpbiBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBwcyA9IGZzLnN0YXRTeW5jIHAgXG4gICAgICAgICAgICAgICAgICAgIGlmIHBzLmlzRGlyZWN0b3J5KCkgdGhlbiBjaGlsZGRpcnMucHVzaCBzbGFzaC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHBzLmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgZmlsdGVyIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaCBzbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2ggc2xhc2gubm9ybWFsaXplIHAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvcHQuZGVwdGg/IGFuZCBfLmlzSW50ZWdlcihvcHQuZGVwdGgpIGFuZCBvcHQuZGVwdGggPiAwXG4gICAgICAgICAgICAgICAgICAgIGNvcHQgPSBfLmNsb25lIG9wdFxuICAgICAgICAgICAgICAgICAgICBjb3B0LmRlcHRoIC09IDFcbiAgICAgICAgICAgICAgICAgICAgZm9yIGQgaW4gY2hpbGRkaXJzXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdCBmaWxlTGlzdCBkLCBjb3B0IFxuXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29udGludWUgaWYgZmlsdGVyIHBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwID0gc2xhc2guam9pbkZpbGVQb3MgcCwgcG9zXG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaCBwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgaWYgb3B0LmxvZ0Vycm9yXG4gICAgICAgICAgICAgICAgbG9nIFwiW0VSUk9SXSBreGsuZmlsZUxpc3Q6ICN7ZXJyfVwiXG4gICAgICAgICAgICAgICAgbG9nIFwicGF0aHM6XCIsIHBhdGhzXG4gICAgICAgICAgICAgICAgbG9nIFwib3B0OlwiLCBvcHRcblxuICAgIGZpbGVzXG5cbm1vZHVsZS5leHBvcnRzID0gZmlsZUxpc3QiXX0=
//# sourceURL=C:/Users/kodi/s/kxk/coffee/filelist.coffee