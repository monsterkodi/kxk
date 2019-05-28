// koffee 0.50.0

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
                console.error("paths:", paths);
                console.error("opt:", opt);
            }
        }
    }
    return files;
};

module.exports = fileList;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpc3QuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJCQUFBO0lBQUE7O0FBUUEsTUFBbUIsT0FBQSxDQUFRLE9BQVIsQ0FBbkIsRUFBRSxpQkFBRixFQUFTLFdBQVQsRUFBYTs7O0FBT2I7Ozs7Ozs7O0FBUUEsUUFBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFUCxRQUFBOztRQUFBOztRQUFBLE1BQU87OztRQUNQLEdBQUcsQ0FBQzs7UUFBSixHQUFHLENBQUMsZUFBZ0I7OztRQUNwQixHQUFHLENBQUM7O1FBQUosR0FBRyxDQUFDLFdBQWdCOztJQUNwQixLQUFBLEdBQVE7SUFDUixJQUFtQixDQUFDLENBQUMsUUFBRixDQUFXLEtBQVgsQ0FBbkI7UUFBQSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBQVI7O0lBRUEsTUFBQSxHQUFTLFNBQUMsQ0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFhLENBQUMsV0FBZCxDQUFBLENBQUEsS0FBK0IsUUFBbEM7QUFBZ0QsbUJBQU8sS0FBdkQ7O1FBRUEsSUFBRyxHQUFHLENBQUMsWUFBSixJQUFxQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBYSxDQUFDLFVBQWQsQ0FBeUIsR0FBekIsQ0FBeEI7QUFDSSxtQkFBTyxLQURYO1NBQUEsTUFFSyxJQUFHLG9CQUFIO1lBQ0QsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxRQUFmLENBQUEsSUFBNkIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQUEsS0FBZ0IsR0FBRyxDQUFDLFFBQXBEO0FBQ0ksdUJBQU8sS0FEWDthQUFBLE1BRUssSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLEdBQUcsQ0FBQyxRQUFkLENBQUEsSUFBNEIsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBQSxFQUFBLGFBQW9CLEdBQUcsQ0FBQyxRQUF4QixFQUFBLElBQUEsS0FBQSxDQUEvQjtBQUNELHVCQUFPLEtBRE47YUFISjs7ZUFLTDtJQVhLO0FBYVQsU0FBQSx1Q0FBQTs7QUFDSTtZQUNJLE9BQVUsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsQ0FBbkIsQ0FBVixFQUFDLFdBQUQsRUFBRztZQUNILElBQUEsR0FBTyxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVo7WUFFUCxJQUFHLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBSDtnQkFFSSxRQUFBLEdBQVcsRUFBRSxDQUFDLFdBQUgsQ0FBZSxDQUFmO2dCQUNYLFFBQUE7O0FBQVk7eUJBQUEsNENBQUE7O3FDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFhLENBQWI7QUFBQTs7O2dCQUNaLFNBQUEsR0FBWTtBQUNaLHFCQUFBLDRDQUFBOztvQkFDSSxFQUFBLEdBQUssRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaO29CQUNMLElBQUcsRUFBRSxDQUFDLFdBQUgsQ0FBQSxDQUFIO3dCQUF5QixTQUFTLENBQUMsSUFBVixDQUFlLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQWYsRUFBekI7cUJBQUEsTUFDSyxJQUFHLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBSDt3QkFDRCxJQUFHLENBQUksTUFBQSxDQUFPLENBQVAsQ0FBUDs0QkFDSSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQWpCLENBQUg7Z0NBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBWCxFQURKOzZCQUFBLE1BQUE7Z0NBR0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFoQixDQUFYLEVBSEo7NkJBREo7eUJBREM7O0FBSFQ7Z0JBVUEsSUFBRyxtQkFBQSxJQUFlLENBQUMsQ0FBQyxTQUFGLENBQVksR0FBRyxDQUFDLEtBQWhCLENBQWYsSUFBMEMsR0FBRyxDQUFDLEtBQUosR0FBWSxDQUF6RDtvQkFDSSxJQUFBLEdBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxHQUFSO29CQUNQLElBQUksQ0FBQyxLQUFMLElBQWM7QUFDZCx5QkFBQSw2Q0FBQTs7d0JBQ0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBQSxDQUFTLENBQVQsRUFBWSxJQUFaLENBQWI7QUFEWixxQkFISjtpQkFmSjthQUFBLE1BcUJLLElBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFIO2dCQUVELElBQVksTUFBQSxDQUFPLENBQVAsQ0FBWjtBQUFBLDZCQUFBOztnQkFFQSxDQUFBLEdBQUksS0FBSyxDQUFDLFdBQU4sQ0FBa0IsQ0FBbEIsRUFBcUIsR0FBckI7Z0JBQ0osS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBTEM7YUF6QlQ7U0FBQSxhQUFBO1lBZ0NNO1lBQ0YsSUFBRyxHQUFHLENBQUMsUUFBUDtnQkFDRyxPQUFBLENBQUMsS0FBRCxDQUFPLHdCQUFBLEdBQXlCLEdBQWhDO2dCQUFxQyxPQUFBLENBQ3BDLEtBRG9DLENBQzlCLFFBRDhCLEVBQ3BCLEtBRG9CO2dCQUNmLE9BQUEsQ0FDckIsS0FEcUIsQ0FDZixNQURlLEVBQ1AsR0FETyxFQUZ6QjthQWpDSjs7QUFESjtXQXVDQTtBQTVETzs7QUE4RFgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4wMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbjAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jIyNcblxueyBzbGFzaCwgZnMsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG4jICAgc3luY2hyb25vdXMgZmlsZSBsaXN0XG4jXG4jICAgcGF0aHMgIHN0cmluZyBvciBhIGxpc3Qgb2Ygc3RyaW5nc1xuIyAgICAgICAgICBpZiBwYXRoIGlzIHJlbGF0aXZlLCByZXR1cm5lZCBmaWxlcyBhcmUgYWxzbyByZWxhdGl2ZVxuIyAgICAgICAgICBpZiBwYXRoIGlzIGFic29sdXRlLCByZXR1cm5lZCBmaWxlcyBhcmUgYWxzbyBhYnNvbHV0ZVxuIyMjICAgICAgICAgICBcbiAgICBvcHQ6ICBcbiAgICAgICAgICBpZ25vcmVIaWRkZW46IHRydWUgIyBza2lwIGZpbGVzIHRoYXQgc3RhcnRzIHdpdGggYSBkb3RcbiAgICAgICAgICBsb2dFcnJvcjogICAgIHRydWUgIyBwcmludCBtZXNzYWdlIHRvIGNvbnNvbGUubG9nIGlmIGEgcGF0aCBkb2Vzbid0IGV4aXRzXG4gICAgICAgICAgZGVwdGg6ICAgICAgICAwICAgICMgcmVjdXJzZSBpbnRvIHN1YmRpcmVjdG9yaWVzIGlmID4gMFxuICAgICAgICAgIG1hdGNoRXh0OiAgICAgbnVsbCAjIHN0cmluZyBvciBsaXN0IG9mIHN0cmluZ3MgdG8gbWF0Y2hcbiMjI1xuXG5maWxlTGlzdCA9IChwYXRocywgb3B0KSAtPlxuICAgIFxuICAgIG9wdCA/PSB7fVxuICAgIG9wdC5pZ25vcmVIaWRkZW4gPz0gdHJ1ZVxuICAgIG9wdC5sb2dFcnJvciAgICAgPz0gdHJ1ZVxuICAgIGZpbGVzID0gW11cbiAgICBwYXRocyA9IFtwYXRoc10gaWYgXy5pc1N0cmluZyBwYXRoc1xuICAgIFxuICAgIGZpbHRlciA9IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guYmFzZShwKS50b0xvd2VyQ2FzZSgpID09ICdudHVzZXInIHRoZW4gcmV0dXJuIHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5pZ25vcmVIaWRkZW4gYW5kIHNsYXNoLmZpbGUocCkuc3RhcnRzV2l0aCAnLidcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGVsc2UgaWYgb3B0Lm1hdGNoRXh0PyBcbiAgICAgICAgICAgIGlmIF8uaXNTdHJpbmcob3B0Lm1hdGNoRXh0KSBhbmQgc2xhc2guZXh0KHApICE9IG9wdC5tYXRjaEV4dFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBlbHNlIGlmIF8uaXNBcnJheShvcHQubWF0Y2hFeHQpIGFuZCBzbGFzaC5leHQocCkgbm90IGluIG9wdC5tYXRjaEV4dFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGZhbHNlXG4gICAgXG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbcCxwb3NdID0gc2xhc2guc3BsaXRGaWxlUG9zIHBcbiAgICAgICAgICAgIHN0YXQgPSBmcy5zdGF0U3luYyBwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gZnMucmVhZGRpclN5bmMgcFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gKHNsYXNoLmpvaW4ocCxmKSBmb3IgZiBpbiBjaGlsZHJlbilcbiAgICAgICAgICAgICAgICBjaGlsZGRpcnMgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBwIGluIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgIHBzID0gZnMuc3RhdFN5bmMgcCBcbiAgICAgICAgICAgICAgICAgICAgaWYgcHMuaXNEaXJlY3RvcnkoKSB0aGVuIGNoaWxkZGlycy5wdXNoIHNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcHMuaXNGaWxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBmaWx0ZXIgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaCBzbGFzaC5ub3JtYWxpemUgcCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9wdC5kZXB0aD8gYW5kIF8uaXNJbnRlZ2VyKG9wdC5kZXB0aCkgYW5kIG9wdC5kZXB0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgY29wdCA9IF8uY2xvbmUgb3B0XG4gICAgICAgICAgICAgICAgICAgIGNvcHQuZGVwdGggLT0gMVxuICAgICAgICAgICAgICAgICAgICBmb3IgZCBpbiBjaGlsZGRpcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gZmlsZXMuY29uY2F0IGZpbGVMaXN0IGQsIGNvcHQgXG5cbiAgICAgICAgICAgIGVsc2UgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb250aW51ZSBpZiBmaWx0ZXIgcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHAgPSBzbGFzaC5qb2luRmlsZVBvcyBwLCBwb3NcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIHBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBpZiBvcHQubG9nRXJyb3JcbiAgICAgICAgICAgICAgICBlcnJvciBcIltFUlJPUl0ga3hrLmZpbGVMaXN0OiAje2Vycn1cIlxuICAgICAgICAgICAgICAgIGVycm9yIFwicGF0aHM6XCIsIHBhdGhzXG4gICAgICAgICAgICAgICAgZXJyb3IgXCJvcHQ6XCIsIG9wdFxuXG4gICAgZmlsZXNcblxubW9kdWxlLmV4cG9ydHMgPSBmaWxlTGlzdFxuIl19
//# sourceURL=../coffee/filelist.coffee