// koffee 1.4.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpc3QuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJCQUFBO0lBQUE7O0FBUUEsTUFBbUIsT0FBQSxDQUFRLE9BQVIsQ0FBbkIsRUFBRSxpQkFBRixFQUFTLFdBQVQsRUFBYTs7O0FBT2I7Ozs7Ozs7O0FBUUEsUUFBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFUCxRQUFBOztRQUFBOztRQUFBLE1BQU87OztRQUNQLEdBQUcsQ0FBQzs7UUFBSixHQUFHLENBQUMsZUFBZ0I7OztRQUNwQixHQUFHLENBQUM7O1FBQUosR0FBRyxDQUFDLFdBQWdCOztJQUNwQixLQUFBLEdBQVE7SUFDUixJQUFtQixDQUFDLENBQUMsUUFBRixDQUFXLEtBQVgsQ0FBbkI7UUFBQSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBQVI7O0lBRUEsTUFBQSxHQUFTLFNBQUMsQ0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFhLENBQUMsV0FBZCxDQUFBLENBQUEsS0FBK0IsUUFBbEM7QUFBZ0QsbUJBQU8sS0FBdkQ7O1FBRUEsSUFBRyxHQUFHLENBQUMsWUFBSixJQUFxQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFVBQWQsQ0FBeUIsR0FBekIsQ0FBeEI7QUFDSSxtQkFBTyxLQURYO1NBQUEsTUFFSyxJQUFHLG9CQUFIO1lBQ0QsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxRQUFmLENBQUEsSUFBNkIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQUEsS0FBZ0IsR0FBRyxDQUFDLFFBQXBEO0FBQ0ksdUJBQU8sS0FEWDthQUFBLE1BRUssSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLEdBQUcsQ0FBQyxRQUFkLENBQUEsSUFBNEIsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBQSxFQUFBLGFBQW9CLEdBQUcsQ0FBQyxRQUF4QixFQUFBLElBQUEsS0FBQSxDQUEvQjtBQUNELHVCQUFPLEtBRE47YUFISjs7ZUFLTDtJQVhLO0FBYVQsU0FBQSx1Q0FBQTs7UUFDSSxJQUFZLGNBQUksQ0FBQyxDQUFFLGdCQUFuQjtBQUFBLHFCQUFBOztBQUNBO1lBQ0ksT0FBVSxLQUFLLENBQUMsWUFBTixDQUFtQixDQUFuQixDQUFWLEVBQUMsV0FBRCxFQUFHO1lBQ0gsSUFBQSxHQUFPLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWjtZQUVQLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFIO2dCQUVJLFFBQUEsR0FBVyxFQUFFLENBQUMsV0FBSCxDQUFlLENBQWY7Z0JBQ1gsUUFBQTs7QUFBWTt5QkFBQSw0Q0FBQTs7cUNBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWEsQ0FBYjtBQUFBOzs7Z0JBQ1osU0FBQSxHQUFZO0FBQ1oscUJBQUEsNENBQUE7O29CQUNJLEVBQUEsR0FBSyxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVo7b0JBQ0wsSUFBRyxFQUFFLENBQUMsV0FBSCxDQUFBLENBQUg7d0JBQXlCLFNBQVMsQ0FBQyxJQUFWLENBQWUsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBZixFQUF6QjtxQkFBQSxNQUNLLElBQUcsRUFBRSxDQUFDLE1BQUgsQ0FBQSxDQUFIO3dCQUNELElBQUcsQ0FBSSxNQUFBLENBQU8sQ0FBUCxDQUFQOzRCQUNJLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FBakIsQ0FBSDtnQ0FDSSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFYLEVBREo7NkJBQUEsTUFBQTtnQ0FHSSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQVgsRUFISjs2QkFESjt5QkFEQzs7QUFIVDtnQkFVQSxJQUFHLG1CQUFBLElBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxHQUFHLENBQUMsS0FBaEIsQ0FBZixJQUEwQyxHQUFHLENBQUMsS0FBSixHQUFZLENBQXpEO29CQUNJLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBRixDQUFRLEdBQVI7b0JBQ1AsSUFBSSxDQUFDLEtBQUwsSUFBYztBQUNkLHlCQUFBLDZDQUFBOzt3QkFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVosQ0FBYjtBQURaLHFCQUhKO2lCQWZKO2FBQUEsTUFxQkssSUFBRyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUg7Z0JBRUQsSUFBWSxNQUFBLENBQU8sQ0FBUCxDQUFaO0FBQUEsNkJBQUE7O2dCQUVBLENBQUEsR0FBSSxLQUFLLENBQUMsV0FBTixDQUFrQixDQUFsQixFQUFxQixHQUFyQjtnQkFDSixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFMQzthQXpCVDtTQUFBLGFBQUE7WUFnQ007WUFDRixJQUFHLEdBQUcsQ0FBQyxRQUFQO2dCQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8sd0JBQUEsR0FBeUIsR0FBaEM7Z0JBQXFDLE9BQUEsQ0FDcEMsS0FEb0MsQ0FDOUIsUUFEOEIsRUFDcEIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmLENBRG9CO2dCQUNBLE9BQUEsQ0FDcEMsS0FEb0MsQ0FDOUIsTUFEOEIsRUFDdEIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLENBRHNCLEVBRnhDO2FBakNKOztBQUZKO1dBdUNBO0FBNURPOztBQThEWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbjAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4wMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMjI1xuXG57IHNsYXNoLCBmcywgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbiMgICBzeW5jaHJvbm91cyBmaWxlIGxpc3RcbiNcbiMgICBwYXRocyAgc3RyaW5nIG9yIGEgbGlzdCBvZiBzdHJpbmdzXG4jICAgICAgICAgIGlmIHBhdGggaXMgcmVsYXRpdmUsIHJldHVybmVkIGZpbGVzIGFyZSBhbHNvIHJlbGF0aXZlXG4jICAgICAgICAgIGlmIHBhdGggaXMgYWJzb2x1dGUsIHJldHVybmVkIGZpbGVzIGFyZSBhbHNvIGFic29sdXRlXG4jIyMgICAgICAgICAgIFxuICAgIG9wdDogIFxuICAgICAgICAgIGlnbm9yZUhpZGRlbjogdHJ1ZSAjIHNraXAgZmlsZXMgdGhhdCBzdGFydHMgd2l0aCBhIGRvdFxuICAgICAgICAgIGxvZ0Vycm9yOiAgICAgdHJ1ZSAjIHByaW50IG1lc3NhZ2UgdG8gY29uc29sZS5sb2cgaWYgYSBwYXRoIGRvZXNuJ3QgZXhpdHNcbiAgICAgICAgICBkZXB0aDogICAgICAgIDAgICAgIyByZWN1cnNlIGludG8gc3ViZGlyZWN0b3JpZXMgaWYgPiAwXG4gICAgICAgICAgbWF0Y2hFeHQ6ICAgICBudWxsICMgc3RyaW5nIG9yIGxpc3Qgb2Ygc3RyaW5ncyB0byBtYXRjaFxuIyMjXG5cbmZpbGVMaXN0ID0gKHBhdGhzLCBvcHQpIC0+XG4gICAgXG4gICAgb3B0ID89IHt9XG4gICAgb3B0Lmlnbm9yZUhpZGRlbiA/PSB0cnVlXG4gICAgb3B0LmxvZ0Vycm9yICAgICA/PSB0cnVlXG4gICAgZmlsZXMgPSBbXVxuICAgIHBhdGhzID0gW3BhdGhzXSBpZiBfLmlzU3RyaW5nIHBhdGhzXG4gICAgXG4gICAgZmlsdGVyID0gKHApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5iYXNlKHApLnRvTG93ZXJDYXNlKCkgPT0gJ250dXNlcicgdGhlbiByZXR1cm4gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgaWYgb3B0Lmlnbm9yZUhpZGRlbiBhbmQgc2xhc2guZmlsZShwKS5zdGFydHNXaXRoICcuJ1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgZWxzZSBpZiBvcHQubWF0Y2hFeHQ/IFxuICAgICAgICAgICAgaWYgXy5pc1N0cmluZyhvcHQubWF0Y2hFeHQpIGFuZCBzbGFzaC5leHQocCkgIT0gb3B0Lm1hdGNoRXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIGVsc2UgaWYgXy5pc0FycmF5KG9wdC5tYXRjaEV4dCkgYW5kIHNsYXNoLmV4dChwKSBub3QgaW4gb3B0Lm1hdGNoRXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgZmFsc2VcbiAgICBcbiAgICBmb3IgcCBpbiBwYXRoc1xuICAgICAgICBjb250aW51ZSBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgW3AscG9zXSA9IHNsYXNoLnNwbGl0RmlsZVBvcyBwXG4gICAgICAgICAgICBzdGF0ID0gZnMuc3RhdFN5bmMgcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGZzLnJlYWRkaXJTeW5jIHBcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IChzbGFzaC5qb2luKHAsZikgZm9yIGYgaW4gY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgY2hpbGRkaXJzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgcCBpbiBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBwcyA9IGZzLnN0YXRTeW5jIHAgXG4gICAgICAgICAgICAgICAgICAgIGlmIHBzLmlzRGlyZWN0b3J5KCkgdGhlbiBjaGlsZGRpcnMucHVzaCBzbGFzaC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHBzLmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgZmlsdGVyIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaCBzbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2ggc2xhc2gubm9ybWFsaXplIHAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvcHQuZGVwdGg/IGFuZCBfLmlzSW50ZWdlcihvcHQuZGVwdGgpIGFuZCBvcHQuZGVwdGggPiAwXG4gICAgICAgICAgICAgICAgICAgIGNvcHQgPSBfLmNsb25lIG9wdFxuICAgICAgICAgICAgICAgICAgICBjb3B0LmRlcHRoIC09IDFcbiAgICAgICAgICAgICAgICAgICAgZm9yIGQgaW4gY2hpbGRkaXJzXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdCBmaWxlTGlzdCBkLCBjb3B0IFxuXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29udGludWUgaWYgZmlsdGVyIHBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwID0gc2xhc2guam9pbkZpbGVQb3MgcCwgcG9zXG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaCBwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgaWYgb3B0LmxvZ0Vycm9yXG4gICAgICAgICAgICAgICAgZXJyb3IgXCJbRVJST1JdIGt4ay5maWxlTGlzdDogI3tlcnJ9XCJcbiAgICAgICAgICAgICAgICBlcnJvciBcInBhdGhzOlwiLCBKU09OLnN0cmluZ2lmeSBwYXRoc1xuICAgICAgICAgICAgICAgIGVycm9yIFwib3B0OlwiLCBKU09OLnN0cmluZ2lmeSBvcHRcbiAgICBmaWxlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbGVMaXN0XG4iXX0=
//# sourceURL=../coffee/filelist.coffee