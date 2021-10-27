// koffee 1.14.0

/*
00000000  000  000      00000000  000      000   0000000  000000000  
000       000  000      000       000      000  000          000     
000000    000  000      0000000   000      000  0000000      000     
000       000  000      000       000      000       000     000     
000       000  0000000  00000000  0000000  000  0000000      000
 */
var _, fileList, fs, ref, slash,
    indexOf = [].indexOf;

ref = require('./kxk'), slash = ref.slash, fs = ref.fs, _ = ref._;


/*           
    opt:  
          ignoreHidden: true # skip files that starts with a dot
          logError:     true # print message to console.log if a path doesn't exits
          depth:        0    # recurse into subdirectories if > 0
          matchExt:     null # string or list of strings to match
 */

fileList = function(paths, opt) {
    var childdirs, children, copt, d, err, f, files, filter, i, j, k, len, len1, len2, p, pos, ps, ref1, stat;
    if (opt != null) {
        opt;
    } else {
        opt = {};
    }
    if (opt.ignoreHidden != null) {
        opt.ignoreHidden;
    } else {
        opt.ignoreHidden = true;
    }
    if (opt.logError != null) {
        opt.logError;
    } else {
        opt.logError = true;
    }
    files = [];
    if (_.isString(paths)) {
        paths = [paths];
    }
    filter = function(p) {
        var ref1;
        if (slash.base(p).toLowerCase() === 'ntuser') {
            return true;
        }
        if (opt.ignoreHidden && slash.file(p).startsWith('.')) {
            return true;
        } else if (opt.matchExt != null) {
            if (_.isString(opt.matchExt) && slash.ext(p) !== opt.matchExt) {
                return true;
            } else if (_.isArray(opt.matchExt) && (ref1 = slash.ext(p), indexOf.call(opt.matchExt, ref1) < 0)) {
                return true;
            }
        }
        return false;
    };
    for (i = 0, len = paths.length; i < len; i++) {
        p = paths[i];
        if (!(p != null ? p.length : void 0)) {
            continue;
        }
        try {
            ref1 = slash.splitFilePos(p), p = ref1[0], pos = ref1[1];
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
                console.error("[ERROR] kxk.fileList: " + err);
                console.error("paths:", JSON.stringify(paths));
                console.error("opt:", JSON.stringify(opt));
            }
        }
    }
    return files;
};

module.exports = fileList;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJmaWxlbGlzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMkJBQUE7SUFBQTs7QUFRQSxNQUFtQixPQUFBLENBQVEsT0FBUixDQUFuQixFQUFFLGlCQUFGLEVBQVMsV0FBVCxFQUFhOzs7QUFPYjs7Ozs7Ozs7QUFRQSxRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVQLFFBQUE7O1FBQUE7O1FBQUEsTUFBTzs7O1FBQ1AsR0FBRyxDQUFDOztRQUFKLEdBQUcsQ0FBQyxlQUFnQjs7O1FBQ3BCLEdBQUcsQ0FBQzs7UUFBSixHQUFHLENBQUMsV0FBZ0I7O0lBQ3BCLEtBQUEsR0FBUTtJQUNSLElBQW1CLENBQUMsQ0FBQyxRQUFGLENBQVcsS0FBWCxDQUFuQjtRQUFBLEtBQUEsR0FBUSxDQUFDLEtBQUQsRUFBUjs7SUFFQSxNQUFBLEdBQVMsU0FBQyxDQUFEO0FBRUwsWUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQWEsQ0FBQyxXQUFkLENBQUEsQ0FBQSxLQUErQixRQUFsQztBQUFnRCxtQkFBTyxLQUF2RDs7UUFFQSxJQUFHLEdBQUcsQ0FBQyxZQUFKLElBQXFCLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFhLENBQUMsVUFBZCxDQUF5QixHQUF6QixDQUF4QjtBQUNJLG1CQUFPLEtBRFg7U0FBQSxNQUVLLElBQUcsb0JBQUg7WUFDRCxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLFFBQWYsQ0FBQSxJQUE2QixLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBQSxLQUFnQixHQUFHLENBQUMsUUFBcEQ7QUFDSSx1QkFBTyxLQURYO2FBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBRyxDQUFDLFFBQWQsQ0FBQSxJQUE0QixRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLEVBQUEsYUFBb0IsR0FBRyxDQUFDLFFBQXhCLEVBQUEsSUFBQSxLQUFBLENBQS9CO0FBQ0QsdUJBQU8sS0FETjthQUhKOztlQUtMO0lBWEs7QUFhVCxTQUFBLHVDQUFBOztRQUNJLElBQVksY0FBSSxDQUFDLENBQUUsZ0JBQW5CO0FBQUEscUJBQUE7O0FBQ0E7WUFDSSxPQUFVLEtBQUssQ0FBQyxZQUFOLENBQW1CLENBQW5CLENBQVYsRUFBQyxXQUFELEVBQUc7WUFDSCxJQUFBLEdBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO1lBRVAsSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQUg7Z0JBRUksUUFBQSxHQUFXLEVBQUUsQ0FBQyxXQUFILENBQWUsQ0FBZjtnQkFDWCxRQUFBOztBQUFZO3lCQUFBLDRDQUFBOztxQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYSxDQUFiO0FBQUE7OztnQkFDWixTQUFBLEdBQVk7QUFDWixxQkFBQSw0Q0FBQTs7b0JBQ0ksRUFBQSxHQUFLLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWjtvQkFDTCxJQUFHLEVBQUUsQ0FBQyxXQUFILENBQUEsQ0FBSDt3QkFBeUIsU0FBUyxDQUFDLElBQVYsQ0FBZSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFoQixDQUFmLEVBQXpCO3FCQUFBLE1BQ0ssSUFBRyxFQUFFLENBQUMsTUFBSCxDQUFBLENBQUg7d0JBQ0QsSUFBRyxDQUFJLE1BQUEsQ0FBTyxDQUFQLENBQVA7NEJBQ0ksSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixDQUFIO2dDQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQVgsRUFESjs2QkFBQSxNQUFBO2dDQUdJLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBWCxFQUhKOzZCQURKO3lCQURDOztBQUhUO2dCQVVBLElBQUcsbUJBQUEsSUFBZSxDQUFDLENBQUMsU0FBRixDQUFZLEdBQUcsQ0FBQyxLQUFoQixDQUFmLElBQTBDLEdBQUcsQ0FBQyxLQUFKLEdBQVksQ0FBekQ7b0JBQ0ksSUFBQSxHQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBUjtvQkFDUCxJQUFJLENBQUMsS0FBTCxJQUFjO0FBQ2QseUJBQUEsNkNBQUE7O3dCQUNJLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixDQUFhLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWixDQUFiO0FBRFoscUJBSEo7aUJBZko7YUFBQSxNQXFCSyxJQUFHLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBSDtnQkFFRCxJQUFZLE1BQUEsQ0FBTyxDQUFQLENBQVo7QUFBQSw2QkFBQTs7Z0JBRUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxXQUFOLENBQWtCLENBQWxCLEVBQXFCLEdBQXJCO2dCQUNKLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUxDO2FBekJUO1NBQUEsYUFBQTtZQWdDTTtZQUNGLElBQUcsR0FBRyxDQUFDLFFBQVA7Z0JBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyx3QkFBQSxHQUF5QixHQUFoQztnQkFBcUMsT0FBQSxDQUNwQyxLQURvQyxDQUM5QixRQUQ4QixFQUNwQixJQUFJLENBQUMsU0FBTCxDQUFlLEtBQWYsQ0FEb0I7Z0JBQ0EsT0FBQSxDQUNwQyxLQURvQyxDQUM5QixNQUQ4QixFQUN0QixJQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsQ0FEc0IsRUFGeEM7YUFqQ0o7O0FBRko7V0F1Q0E7QUE1RE87O0FBOERYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbjAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbjAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyMjXG5cbnsgc2xhc2gsIGZzLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuIyAgIHN5bmNocm9ub3VzIGZpbGUgbGlzdFxuI1xuIyAgIHBhdGhzICBzdHJpbmcgb3IgYSBsaXN0IG9mIHN0cmluZ3NcbiMgICAgICAgICAgaWYgcGF0aCBpcyByZWxhdGl2ZSwgcmV0dXJuZWQgZmlsZXMgYXJlIGFsc28gcmVsYXRpdmVcbiMgICAgICAgICAgaWYgcGF0aCBpcyBhYnNvbHV0ZSwgcmV0dXJuZWQgZmlsZXMgYXJlIGFsc28gYWJzb2x1dGVcbiMjIyAgICAgICAgICAgXG4gICAgb3B0OiAgXG4gICAgICAgICAgaWdub3JlSGlkZGVuOiB0cnVlICMgc2tpcCBmaWxlcyB0aGF0IHN0YXJ0cyB3aXRoIGEgZG90XG4gICAgICAgICAgbG9nRXJyb3I6ICAgICB0cnVlICMgcHJpbnQgbWVzc2FnZSB0byBjb25zb2xlLmxvZyBpZiBhIHBhdGggZG9lc24ndCBleGl0c1xuICAgICAgICAgIGRlcHRoOiAgICAgICAgMCAgICAjIHJlY3Vyc2UgaW50byBzdWJkaXJlY3RvcmllcyBpZiA+IDBcbiAgICAgICAgICBtYXRjaEV4dDogICAgIG51bGwgIyBzdHJpbmcgb3IgbGlzdCBvZiBzdHJpbmdzIHRvIG1hdGNoXG4jIyNcblxuZmlsZUxpc3QgPSAocGF0aHMsIG9wdCkgLT5cbiAgICBcbiAgICBvcHQgPz0ge31cbiAgICBvcHQuaWdub3JlSGlkZGVuID89IHRydWVcbiAgICBvcHQubG9nRXJyb3IgICAgID89IHRydWVcbiAgICBmaWxlcyA9IFtdXG4gICAgcGF0aHMgPSBbcGF0aHNdIGlmIF8uaXNTdHJpbmcgcGF0aHNcbiAgICBcbiAgICBmaWx0ZXIgPSAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmJhc2UocCkudG9Mb3dlckNhc2UoKSA9PSAnbnR1c2VyJyB0aGVuIHJldHVybiB0cnVlXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQuaWdub3JlSGlkZGVuIGFuZCBzbGFzaC5maWxlKHApLnN0YXJ0c1dpdGggJy4nXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBlbHNlIGlmIG9wdC5tYXRjaEV4dD8gXG4gICAgICAgICAgICBpZiBfLmlzU3RyaW5nKG9wdC5tYXRjaEV4dCkgYW5kIHNsYXNoLmV4dChwKSAhPSBvcHQubWF0Y2hFeHRcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgZWxzZSBpZiBfLmlzQXJyYXkob3B0Lm1hdGNoRXh0KSBhbmQgc2xhc2guZXh0KHApIG5vdCBpbiBvcHQubWF0Y2hFeHRcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBmYWxzZVxuICAgIFxuICAgIGZvciBwIGluIHBhdGhzXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbcCxwb3NdID0gc2xhc2guc3BsaXRGaWxlUG9zIHBcbiAgICAgICAgICAgIHN0YXQgPSBmcy5zdGF0U3luYyBwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gZnMucmVhZGRpclN5bmMgcFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gKHNsYXNoLmpvaW4ocCxmKSBmb3IgZiBpbiBjaGlsZHJlbilcbiAgICAgICAgICAgICAgICBjaGlsZGRpcnMgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBwIGluIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgIHBzID0gZnMuc3RhdFN5bmMgcCBcbiAgICAgICAgICAgICAgICAgICAgaWYgcHMuaXNEaXJlY3RvcnkoKSB0aGVuIGNoaWxkZGlycy5wdXNoIHNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcHMuaXNGaWxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBmaWx0ZXIgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaCBzbGFzaC5ub3JtYWxpemUgcCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9wdC5kZXB0aD8gYW5kIF8uaXNJbnRlZ2VyKG9wdC5kZXB0aCkgYW5kIG9wdC5kZXB0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgY29wdCA9IF8uY2xvbmUgb3B0XG4gICAgICAgICAgICAgICAgICAgIGNvcHQuZGVwdGggLT0gMVxuICAgICAgICAgICAgICAgICAgICBmb3IgZCBpbiBjaGlsZGRpcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gZmlsZXMuY29uY2F0IGZpbGVMaXN0IGQsIGNvcHQgXG5cbiAgICAgICAgICAgIGVsc2UgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb250aW51ZSBpZiBmaWx0ZXIgcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHAgPSBzbGFzaC5qb2luRmlsZVBvcyBwLCBwb3NcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBpZiBvcHQubG9nRXJyb3JcbiAgICAgICAgICAgICAgICBlcnJvciBcIltFUlJPUl0ga3hrLmZpbGVMaXN0OiAje2Vycn1cIlxuICAgICAgICAgICAgICAgIGVycm9yIFwicGF0aHM6XCIsIEpTT04uc3RyaW5naWZ5IHBhdGhzXG4gICAgICAgICAgICAgICAgZXJyb3IgXCJvcHQ6XCIsIEpTT04uc3RyaW5naWZ5IG9wdFxuICAgIGZpbGVzXG5cbm1vZHVsZS5leHBvcnRzID0gZmlsZUxpc3RcbiJdfQ==
//# sourceURL=../coffee/filelist.coffee