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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpc3QuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9maWxlbGlzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUE7SUFBQTs7RUFRQSxDQUFBLENBQUUsS0FBRixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQWtCLENBQWxCLENBQUEsR0FBd0IsT0FBQSxDQUFRLE9BQVIsQ0FBeEIsRUFSQTs7Ozs7Ozs7Ozs7Ozs7RUF1QkEsUUFBQSxHQUFXLFFBQUEsQ0FBQyxLQUFELEVBQVEsR0FBUixDQUFBO0FBRVAsUUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBOztNQUFBLE1BQU8sQ0FBQTs7O01BQ1AsR0FBRyxDQUFDLGVBQWdCOzs7TUFDcEIsR0FBRyxDQUFDLFdBQWdCOztJQUNwQixLQUFBLEdBQVE7SUFDUixJQUFtQixDQUFDLENBQUMsUUFBRixDQUFXLEtBQVgsQ0FBbkI7TUFBQSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBQVI7O0lBRUEsTUFBQSxHQUFTLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFFTCxVQUFBO01BQUEsSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFdBQWQsQ0FBQSxDQUFBLEtBQStCLFFBQWxDO0FBQWdELGVBQU8sS0FBdkQ7O01BRUEsSUFBRyxHQUFHLENBQUMsWUFBSixJQUFxQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFVBQWQsQ0FBeUIsR0FBekIsQ0FBeEI7QUFDSSxlQUFPLEtBRFg7T0FBQSxNQUVLLElBQUcsb0JBQUg7UUFDRCxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLFFBQWYsQ0FBQSxJQUE2QixLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBQSxLQUFnQixHQUFHLENBQUMsUUFBcEQ7QUFDSSxpQkFBTyxLQURYO1NBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBRyxDQUFDLFFBQWQsQ0FBQSxJQUE0QixPQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLEVBQUEsYUFBb0IsR0FBRyxDQUFDLFFBQXhCLEVBQUEsR0FBQSxLQUFBLENBQS9CO0FBQ0QsaUJBQU8sS0FETjtTQUhKOzthQUtMO0lBWEs7SUFhVCxLQUFBLHVDQUFBOztBQUNJO1FBQ0ksQ0FBQyxDQUFELEVBQUcsR0FBSCxDQUFBLEdBQVUsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsQ0FBbkI7UUFDVixJQUFBLEdBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO1FBRVAsSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQUg7VUFFSSxRQUFBLEdBQVcsRUFBRSxDQUFDLFdBQUgsQ0FBZSxDQUFmO1VBQ1gsUUFBQTs7QUFBWTtZQUFBLEtBQUEsNENBQUE7OzJCQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFhLENBQWI7WUFBQSxDQUFBOzs7VUFDWixTQUFBLEdBQVk7VUFDWixLQUFBLDRDQUFBOztZQUNJLEVBQUEsR0FBSyxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVo7WUFDTCxJQUFHLEVBQUUsQ0FBQyxXQUFILENBQUEsQ0FBSDtjQUF5QixTQUFTLENBQUMsSUFBVixDQUFlLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQWYsRUFBekI7YUFBQSxNQUNLLElBQUcsRUFBRSxDQUFDLE1BQUgsQ0FBQSxDQUFIO2NBQ0QsSUFBRyxDQUFJLE1BQUEsQ0FBTyxDQUFQLENBQVA7Z0JBQ0ksSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixDQUFIO2tCQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQVgsRUFESjtpQkFBQSxNQUFBO2tCQUdJLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBWCxFQUhKO2lCQURKO2VBREM7O1VBSFQ7VUFVQSxJQUFHLG1CQUFBLElBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxHQUFHLENBQUMsS0FBaEIsQ0FBZixJQUEwQyxHQUFHLENBQUMsS0FBSixHQUFZLENBQXpEO1lBQ0ksSUFBQSxHQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBUjtZQUNQLElBQUksQ0FBQyxLQUFMLElBQWM7WUFDZCxLQUFBLDZDQUFBOztjQUNJLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixDQUFhLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWixDQUFiO1lBRFosQ0FISjtXQWZKO1NBQUEsTUFxQkssSUFBRyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUg7VUFFRCxJQUFZLE1BQUEsQ0FBTyxDQUFQLENBQVo7QUFBQSxxQkFBQTs7VUFFQSxDQUFBLEdBQUksS0FBSyxDQUFDLFdBQU4sQ0FBa0IsQ0FBbEIsRUFBcUIsR0FBckI7VUFDSixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFMQztTQXpCVDtPQUFBLGFBQUE7UUFnQ007UUFDRixJQUFHLEdBQUcsQ0FBQyxRQUFQO1VBQ0ksR0FBQSxDQUFJLENBQUEsc0JBQUEsQ0FBQSxDQUF5QixHQUF6QixDQUFBLENBQUo7VUFDQSxHQUFBLENBQUksUUFBSixFQUFjLEtBQWQ7VUFDQSxHQUFBLENBQUksTUFBSixFQUFZLEdBQVosRUFISjtTQWpDSjs7SUFESjtXQXVDQTtFQTVETzs7RUE4RFgsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFyRmpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbjAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbjAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyMjXG5cbnsgc2xhc2gsIGZzLCBsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG4jICAgc3luY2hyb25vdXMgZmlsZSBsaXN0XG4jXG4jICAgcGF0aHMgIHN0cmluZyBvciBhIGxpc3Qgb2Ygc3RyaW5nc1xuIyAgICAgICAgICBpZiBwYXRoIGlzIHJlbGF0aXZlLCByZXR1cm5lZCBmaWxlcyBhcmUgYWxzbyByZWxhdGl2ZVxuIyAgICAgICAgICBpZiBwYXRoIGlzIGFic29sdXRlLCByZXR1cm5lZCBmaWxlcyBhcmUgYWxzbyBhYnNvbHV0ZVxuIyMjICAgICAgICAgICBcbiAgICBvcHQ6ICBcbiAgICAgICAgICBpZ25vcmVIaWRkZW46IHRydWUgIyBza2lwIGZpbGVzIHRoYXQgc3RhcnRzIHdpdGggYSBkb3RcbiAgICAgICAgICBsb2dFcnJvcjogICAgIHRydWUgIyBwcmludCBtZXNzYWdlIHRvIGNvbnNvbGUubG9nIGlmIGEgcGF0aCBkb2Vzbid0IGV4aXRzXG4gICAgICAgICAgZGVwdGg6ICAgICAgICAwICAgICMgcmVjdXJzZSBpbnRvIHN1YmRpcmVjdG9yaWVzIGlmID4gMFxuICAgICAgICAgIG1hdGNoRXh0OiAgICAgbnVsbCAjIHN0cmluZyBvciBsaXN0IG9mIHN0cmluZ3MgdG8gbWF0Y2hcbiMjI1xuXG5maWxlTGlzdCA9IChwYXRocywgb3B0KSAtPlxuICAgIFxuICAgIG9wdCA/PSB7fVxuICAgIG9wdC5pZ25vcmVIaWRkZW4gPz0gdHJ1ZVxuICAgIG9wdC5sb2dFcnJvciAgICAgPz0gdHJ1ZVxuICAgIGZpbGVzID0gW11cbiAgICBwYXRocyA9IFtwYXRoc10gaWYgXy5pc1N0cmluZyBwYXRoc1xuICAgIFxuICAgIGZpbHRlciA9IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guYmFzZShwKS50b0xvd2VyQ2FzZSgpID09ICdudHVzZXInIHRoZW4gcmV0dXJuIHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5pZ25vcmVIaWRkZW4gYW5kIHNsYXNoLmZpbGUocCkuc3RhcnRzV2l0aCAnLidcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGVsc2UgaWYgb3B0Lm1hdGNoRXh0PyBcbiAgICAgICAgICAgIGlmIF8uaXNTdHJpbmcob3B0Lm1hdGNoRXh0KSBhbmQgc2xhc2guZXh0KHApICE9IG9wdC5tYXRjaEV4dFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBlbHNlIGlmIF8uaXNBcnJheShvcHQubWF0Y2hFeHQpIGFuZCBzbGFzaC5leHQocCkgbm90IGluIG9wdC5tYXRjaEV4dFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGZhbHNlXG4gICAgXG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbcCxwb3NdID0gc2xhc2guc3BsaXRGaWxlUG9zIHBcbiAgICAgICAgICAgIHN0YXQgPSBmcy5zdGF0U3luYyBwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gZnMucmVhZGRpclN5bmMgcFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gKHNsYXNoLmpvaW4ocCxmKSBmb3IgZiBpbiBjaGlsZHJlbilcbiAgICAgICAgICAgICAgICBjaGlsZGRpcnMgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBwIGluIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgIHBzID0gZnMuc3RhdFN5bmMgcCBcbiAgICAgICAgICAgICAgICAgICAgaWYgcHMuaXNEaXJlY3RvcnkoKSB0aGVuIGNoaWxkZGlycy5wdXNoIHNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcHMuaXNGaWxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBmaWx0ZXIgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaCBzbGFzaC5ub3JtYWxpemUgcCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9wdC5kZXB0aD8gYW5kIF8uaXNJbnRlZ2VyKG9wdC5kZXB0aCkgYW5kIG9wdC5kZXB0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgY29wdCA9IF8uY2xvbmUgb3B0XG4gICAgICAgICAgICAgICAgICAgIGNvcHQuZGVwdGggLT0gMVxuICAgICAgICAgICAgICAgICAgICBmb3IgZCBpbiBjaGlsZGRpcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gZmlsZXMuY29uY2F0IGZpbGVMaXN0IGQsIGNvcHQgXG5cbiAgICAgICAgICAgIGVsc2UgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb250aW51ZSBpZiBmaWx0ZXIgcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHAgPSBzbGFzaC5qb2luRmlsZVBvcyBwLCBwb3NcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBpZiBvcHQubG9nRXJyb3JcbiAgICAgICAgICAgICAgICBsb2cgXCJbRVJST1JdIGt4ay5maWxlTGlzdDogI3tlcnJ9XCJcbiAgICAgICAgICAgICAgICBsb2cgXCJwYXRoczpcIiwgcGF0aHNcbiAgICAgICAgICAgICAgICBsb2cgXCJvcHQ6XCIsIG9wdFxuXG4gICAgZmlsZXNcblxubW9kdWxlLmV4cG9ydHMgPSBmaWxlTGlzdCJdfQ==
//# sourceURL=C:/Users/kodi/s/kxk/coffee/filelist.coffee