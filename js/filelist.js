// koffee 1.19.0

/*
00000000  000  000      00000000  000      000   0000000  000000000  
000       000  000      000       000      000  000          000     
000000    000  000      0000000   000      000  0000000      000     
000       000  000      000       000      000       000     000     
000       000  0000000  00000000  0000000  000  0000000      000
 */
var _, fileList, filter, fs, ref, slash,
    indexOf = [].indexOf;

ref = require('./kxk'), _ = ref._, filter = ref.filter, fs = ref.fs, slash = ref.slash;


/*           
    opt:  
          ignoreHidden: true # skip files that starts with a dot
          logError:     true # print message to console.log if a path doesn't exits
          depth:        0    # recurse into subdirectories if > 0
          matchExt:     null # string or list of strings to match
 */

fileList = function(paths, opt) {
    var childdirs, children, copt, d, err, f, files, i, j, k, len, len1, len2, p, pos, ps, ref1, stat;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJmaWxlbGlzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUNBQUE7SUFBQTs7QUFRQSxNQUEyQixPQUFBLENBQVEsT0FBUixDQUEzQixFQUFFLFNBQUYsRUFBSyxtQkFBTCxFQUFhLFdBQWIsRUFBaUI7OztBQU9qQjs7Ozs7Ozs7QUFRQSxRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVQLFFBQUE7O1FBQUE7O1FBQUEsTUFBTzs7O1FBQ1AsR0FBRyxDQUFDOztRQUFKLEdBQUcsQ0FBQyxlQUFnQjs7O1FBQ3BCLEdBQUcsQ0FBQzs7UUFBSixHQUFHLENBQUMsV0FBZ0I7O0lBQ3BCLEtBQUEsR0FBUTtJQUNSLElBQW1CLENBQUMsQ0FBQyxRQUFGLENBQVcsS0FBWCxDQUFuQjtRQUFBLEtBQUEsR0FBUSxDQUFDLEtBQUQsRUFBUjs7SUFFQSxNQUFBLEdBQVMsU0FBQyxDQUFEO0FBRUwsWUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQWEsQ0FBQyxXQUFkLENBQUEsQ0FBQSxLQUErQixRQUFsQztBQUFnRCxtQkFBTyxLQUF2RDs7UUFFQSxJQUFHLEdBQUcsQ0FBQyxZQUFKLElBQXFCLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFhLENBQUMsVUFBZCxDQUF5QixHQUF6QixDQUF4QjtBQUNJLG1CQUFPLEtBRFg7U0FBQSxNQUVLLElBQUcsb0JBQUg7WUFDRCxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLFFBQWYsQ0FBQSxJQUE2QixLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBQSxLQUFnQixHQUFHLENBQUMsUUFBcEQ7QUFDSSx1QkFBTyxLQURYO2FBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBRyxDQUFDLFFBQWQsQ0FBQSxJQUE0QixRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLEVBQUEsYUFBb0IsR0FBRyxDQUFDLFFBQXhCLEVBQUEsSUFBQSxLQUFBLENBQS9CO0FBQ0QsdUJBQU8sS0FETjthQUhKOztlQUtMO0lBWEs7QUFhVCxTQUFBLHVDQUFBOztRQUNJLElBQVksY0FBSSxDQUFDLENBQUUsZ0JBQW5CO0FBQUEscUJBQUE7O0FBQ0E7WUFDSSxPQUFVLEtBQUssQ0FBQyxZQUFOLENBQW1CLENBQW5CLENBQVYsRUFBQyxXQUFELEVBQUc7WUFDSCxJQUFBLEdBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO1lBRVAsSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQUg7Z0JBRUksUUFBQSxHQUFXLEVBQUUsQ0FBQyxXQUFILENBQWUsQ0FBZjtnQkFDWCxRQUFBOztBQUFZO3lCQUFBLDRDQUFBOztxQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYSxDQUFiO0FBQUE7OztnQkFDWixTQUFBLEdBQVk7QUFDWixxQkFBQSw0Q0FBQTs7b0JBQ0ksRUFBQSxHQUFLLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWjtvQkFDTCxJQUFHLEVBQUUsQ0FBQyxXQUFILENBQUEsQ0FBSDt3QkFBeUIsU0FBUyxDQUFDLElBQVYsQ0FBZSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFoQixDQUFmLEVBQXpCO3FCQUFBLE1BQ0ssSUFBRyxFQUFFLENBQUMsTUFBSCxDQUFBLENBQUg7d0JBQ0QsSUFBRyxDQUFJLE1BQUEsQ0FBTyxDQUFQLENBQVA7NEJBQ0ksSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixDQUFIO2dDQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQVgsRUFESjs2QkFBQSxNQUFBO2dDQUdJLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBWCxFQUhKOzZCQURKO3lCQURDOztBQUhUO2dCQVVBLElBQUcsbUJBQUEsSUFBZSxDQUFDLENBQUMsU0FBRixDQUFZLEdBQUcsQ0FBQyxLQUFoQixDQUFmLElBQTBDLEdBQUcsQ0FBQyxLQUFKLEdBQVksQ0FBekQ7b0JBQ0ksSUFBQSxHQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBUjtvQkFDUCxJQUFJLENBQUMsS0FBTCxJQUFjO0FBQ2QseUJBQUEsNkNBQUE7O3dCQUNJLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixDQUFhLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWixDQUFiO0FBRFoscUJBSEo7aUJBZko7YUFBQSxNQXFCSyxJQUFHLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBSDtnQkFFRCxJQUFZLE1BQUEsQ0FBTyxDQUFQLENBQVo7QUFBQSw2QkFBQTs7Z0JBRUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxXQUFOLENBQWtCLENBQWxCLEVBQXFCLEdBQXJCO2dCQUNKLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUxDO2FBekJUO1NBQUEsYUFBQTtZQWdDTTtZQUNGLElBQUcsR0FBRyxDQUFDLFFBQVA7Z0JBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyx3QkFBQSxHQUF5QixHQUFoQztnQkFBcUMsT0FBQSxDQUNwQyxLQURvQyxDQUM5QixRQUQ4QixFQUNwQixJQUFJLENBQUMsU0FBTCxDQUFlLEtBQWYsQ0FEb0I7Z0JBQ0EsT0FBQSxDQUNwQyxLQURvQyxDQUM5QixNQUQ4QixFQUN0QixJQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsQ0FEc0IsRUFGeEM7YUFqQ0o7O0FBRko7V0F1Q0E7QUE1RE87O0FBOERYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbjAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbjAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyMjXG5cbnsgXywgZmlsdGVyLCBmcywgc2xhc2ggfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG4jICAgc3luY2hyb25vdXMgZmlsZSBsaXN0XG4jXG4jICAgcGF0aHMgIHN0cmluZyBvciBhIGxpc3Qgb2Ygc3RyaW5nc1xuIyAgICAgICAgICBpZiBwYXRoIGlzIHJlbGF0aXZlLCByZXR1cm5lZCBmaWxlcyBhcmUgYWxzbyByZWxhdGl2ZVxuIyAgICAgICAgICBpZiBwYXRoIGlzIGFic29sdXRlLCByZXR1cm5lZCBmaWxlcyBhcmUgYWxzbyBhYnNvbHV0ZVxuIyMjICAgICAgICAgICBcbiAgICBvcHQ6ICBcbiAgICAgICAgICBpZ25vcmVIaWRkZW46IHRydWUgIyBza2lwIGZpbGVzIHRoYXQgc3RhcnRzIHdpdGggYSBkb3RcbiAgICAgICAgICBsb2dFcnJvcjogICAgIHRydWUgIyBwcmludCBtZXNzYWdlIHRvIGNvbnNvbGUubG9nIGlmIGEgcGF0aCBkb2Vzbid0IGV4aXRzXG4gICAgICAgICAgZGVwdGg6ICAgICAgICAwICAgICMgcmVjdXJzZSBpbnRvIHN1YmRpcmVjdG9yaWVzIGlmID4gMFxuICAgICAgICAgIG1hdGNoRXh0OiAgICAgbnVsbCAjIHN0cmluZyBvciBsaXN0IG9mIHN0cmluZ3MgdG8gbWF0Y2hcbiMjI1xuXG5maWxlTGlzdCA9IChwYXRocywgb3B0KSAtPlxuICAgIFxuICAgIG9wdCA/PSB7fVxuICAgIG9wdC5pZ25vcmVIaWRkZW4gPz0gdHJ1ZVxuICAgIG9wdC5sb2dFcnJvciAgICAgPz0gdHJ1ZVxuICAgIGZpbGVzID0gW11cbiAgICBwYXRocyA9IFtwYXRoc10gaWYgXy5pc1N0cmluZyBwYXRoc1xuICAgIFxuICAgIGZpbHRlciA9IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guYmFzZShwKS50b0xvd2VyQ2FzZSgpID09ICdudHVzZXInIHRoZW4gcmV0dXJuIHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5pZ25vcmVIaWRkZW4gYW5kIHNsYXNoLmZpbGUocCkuc3RhcnRzV2l0aCAnLidcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGVsc2UgaWYgb3B0Lm1hdGNoRXh0PyBcbiAgICAgICAgICAgIGlmIF8uaXNTdHJpbmcob3B0Lm1hdGNoRXh0KSBhbmQgc2xhc2guZXh0KHApICE9IG9wdC5tYXRjaEV4dFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBlbHNlIGlmIF8uaXNBcnJheShvcHQubWF0Y2hFeHQpIGFuZCBzbGFzaC5leHQocCkgbm90IGluIG9wdC5tYXRjaEV4dFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGZhbHNlXG4gICAgXG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgICAgY29udGludWUgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIFtwLHBvc10gPSBzbGFzaC5zcGxpdEZpbGVQb3MgcFxuICAgICAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jIHBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBmcy5yZWFkZGlyU3luYyBwXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSAoc2xhc2guam9pbihwLGYpIGZvciBmIGluIGNoaWxkcmVuKVxuICAgICAgICAgICAgICAgIGNoaWxkZGlycyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIHAgaW4gY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgcHMgPSBmcy5zdGF0U3luYyBwIFxuICAgICAgICAgICAgICAgICAgICBpZiBwcy5pc0RpcmVjdG9yeSgpIHRoZW4gY2hpbGRkaXJzLnB1c2ggc2xhc2gubm9ybWFsaXplIHBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBwcy5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IGZpbHRlciBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2ggc2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHNsYXNoLm5vcm1hbGl6ZSBwIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb3B0LmRlcHRoPyBhbmQgXy5pc0ludGVnZXIob3B0LmRlcHRoKSBhbmQgb3B0LmRlcHRoID4gMFxuICAgICAgICAgICAgICAgICAgICBjb3B0ID0gXy5jbG9uZSBvcHRcbiAgICAgICAgICAgICAgICAgICAgY29wdC5kZXB0aCAtPSAxXG4gICAgICAgICAgICAgICAgICAgIGZvciBkIGluIGNoaWxkZGlyc1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSBmaWxlcy5jb25jYXQgZmlsZUxpc3QgZCwgY29wdCBcblxuICAgICAgICAgICAgZWxzZSBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIGlmIGZpbHRlciBwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcCA9IHNsYXNoLmpvaW5GaWxlUG9zIHAsIHBvc1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2ggcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGlmIG9wdC5sb2dFcnJvclxuICAgICAgICAgICAgICAgIGVycm9yIFwiW0VSUk9SXSBreGsuZmlsZUxpc3Q6ICN7ZXJyfVwiXG4gICAgICAgICAgICAgICAgZXJyb3IgXCJwYXRoczpcIiwgSlNPTi5zdHJpbmdpZnkgcGF0aHNcbiAgICAgICAgICAgICAgICBlcnJvciBcIm9wdDpcIiwgSlNPTi5zdHJpbmdpZnkgb3B0XG4gICAgZmlsZXNcblxubW9kdWxlLmV4cG9ydHMgPSBmaWxlTGlzdFxuIl19
//# sourceURL=../coffee/filelist.coffee