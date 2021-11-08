// koffee 1.19.0

/*
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000
 */
var args, empty, karg, kerror, noon, ref, slash, valid;

if (process.type === 'renderer') {
    module.exports = function() {
        return require('./kxk').post.get('args');
    };
} else {
    ref = require('./kxk'), empty = ref.empty, karg = ref.karg, kerror = ref.kerror, noon = ref.noon, slash = ref.slash, valid = ref.valid;
    args = {};
    args.init = function(cfg, kargOpt) {
        var k, kargConfig, kk, o, pkg, pkgDir, pkgJson, ref1, ref2, ref3, s, v, vv;
        if (kargOpt != null) {
            kargOpt;
        } else {
            kargOpt = {};
        }
        pkg = kargOpt.pkg;
        if (pkg == null) {
            pkgDir = slash.pkg(__dirname);
            while (valid(pkgDir) && slash.file(slash.dir(pkgDir)) === 'node_modules') {
                pkgDir = slash.pkg(slash.dir(pkgDir));
            }
            if (valid(pkgDir)) {
                pkgJson = slash.join(pkgDir, 'package.json');
                pkg = require(pkgJson);
                if (empty(pkg)) {
                    return kerror("args -- no pkg in '" + pkgJson + "'!");
                }
            } else {
                return kerror('args -- no pkg dir!');
            }
        }
        kargConfig = {};
        kargConfig[pkg.name] = {};
        kargConfig.version = pkg.version;
        ref1 = noon.parse(cfg);
        for (kk in ref1) {
            vv = ref1[kk];
            o = {};
            s = vv.split(/\s\s+/);
            if (s.length > 0) {
                if (!empty(s[0])) {
                    o['?'] = s[0];
                }
            }
            if (s.length > 1) {
                if ((ref2 = s[1]) === '*' || ref2 === '**') {
                    o[s[1]] = null;
                } else {
                    o['='] = noon.parse(s[1])[0];
                }
            }
            if (s.length > 2) {
                if (s[2].startsWith('-')) {
                    o['-'] = s[2].substr(1);
                }
            }
            kargConfig[pkg.name][kk] = o;
        }
        delete args.init;
        if (empty(kargOpt.ignoreArgs)) {
            if (slash.win() && slash.file(process.argv[0]) === (pkg.name + ".exe")) {
                kargOpt.ignoreArgs = 1;
            } else {
                kargOpt.ignoreArgs = 2;
            }
        }
        ref3 = karg(kargConfig, kargOpt);
        for (k in ref3) {
            v = ref3[k];
            args[k] = v;
        }
        return args;
    };
    if (typeof post !== "undefined" && post !== null) {
        post.onGet('args', (function(_this) {
            return function() {
                return args;
            };
        })(this));
    }
    module.exports = args;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJncy5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImFyZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLElBQUcsT0FBTyxDQUFDLElBQVIsS0FBZ0IsVUFBbkI7SUFFSSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO2VBQUcsT0FBQSxDQUFRLE9BQVIsQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBdEIsQ0FBMEIsTUFBMUI7SUFBSCxFQUZyQjtDQUFBLE1BQUE7SUFNSSxNQUE4QyxPQUFBLENBQVEsT0FBUixDQUE5QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLG1CQUFmLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQztJQUVwQyxJQUFBLEdBQU87SUFFUCxJQUFJLENBQUMsSUFBTCxHQUFZLFNBQUMsR0FBRCxFQUFNLE9BQU47QUFFUixZQUFBOztZQUFBOztZQUFBLFVBQVc7O1FBQ1gsR0FBQSxHQUFNLE9BQU8sQ0FBQztRQUVkLElBQU8sV0FBUDtZQUNJLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQVY7QUFDVCxtQkFBTSxLQUFBLENBQU0sTUFBTixDQUFBLElBQWtCLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLENBQVgsQ0FBQSxLQUFnQyxjQUF4RDtnQkFDSSxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FBVjtZQURiO1lBRUEsSUFBRyxLQUFBLENBQU0sTUFBTixDQUFIO2dCQUNJLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLE1BQVgsRUFBbUIsY0FBbkI7Z0JBQ1YsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSO2dCQUNOLElBQW1ELEtBQUEsQ0FBTSxHQUFOLENBQW5EO0FBQUEsMkJBQU8sTUFBQSxDQUFPLHFCQUFBLEdBQXNCLE9BQXRCLEdBQThCLElBQXJDLEVBQVA7aUJBSEo7YUFBQSxNQUFBO0FBS0ksdUJBQU8sTUFBQSxDQUFPLHFCQUFQLEVBTFg7YUFKSjs7UUFXQSxVQUFBLEdBQWE7UUFDYixVQUFXLENBQUEsR0FBRyxDQUFDLElBQUosQ0FBWCxHQUF1QjtRQUN2QixVQUFVLENBQUMsT0FBWCxHQUFxQixHQUFHLENBQUM7QUFFekI7QUFBQSxhQUFBLFVBQUE7O1lBQ0ksQ0FBQSxHQUFJO1lBQ0osQ0FBQSxHQUFJLEVBQUUsQ0FBQyxLQUFILENBQVMsT0FBVDtZQUVKLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFkO2dCQUNJLElBQWlCLENBQUksS0FBQSxDQUFNLENBQUUsQ0FBQSxDQUFBLENBQVIsQ0FBckI7b0JBQUEsQ0FBRSxDQUFBLEdBQUEsQ0FBRixHQUFTLENBQUUsQ0FBQSxDQUFBLEVBQVg7aUJBREo7O1lBRUEsSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLENBQWQ7Z0JBQ0ksWUFBRyxDQUFFLENBQUEsQ0FBQSxFQUFGLEtBQVMsR0FBVCxJQUFBLElBQUEsS0FBYyxJQUFqQjtvQkFDSSxDQUFFLENBQUEsQ0FBRSxDQUFBLENBQUEsQ0FBRixDQUFGLEdBQVUsS0FEZDtpQkFBQSxNQUFBO29CQUdJLENBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUUsQ0FBQSxDQUFBLENBQWIsQ0FBaUIsQ0FBQSxDQUFBLEVBSDlCO2lCQURKOztZQUtBLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFkO2dCQUNJLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBSDtvQkFDSSxDQUFFLENBQUEsR0FBQSxDQUFGLEdBQVMsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQUwsQ0FBWSxDQUFaLEVBRGI7aUJBREo7O1lBSUEsVUFBVyxDQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVUsQ0FBQSxFQUFBLENBQXJCLEdBQTJCO0FBZi9CO1FBaUJBLE9BQU8sSUFBSSxDQUFDO1FBRVosSUFBRyxLQUFBLENBQU0sT0FBTyxDQUFDLFVBQWQsQ0FBSDtZQUNJLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBTyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXhCLENBQUEsS0FBK0IsQ0FBRyxHQUFHLENBQUMsSUFBTCxHQUFVLE1BQVosQ0FBbEQ7Z0JBQ0ksT0FBTyxDQUFDLFVBQVIsR0FBbUIsRUFEdkI7YUFBQSxNQUFBO2dCQUdJLE9BQU8sQ0FBQyxVQUFSLEdBQW1CLEVBSHZCO2FBREo7O0FBTUE7QUFBQSxhQUFBLFNBQUE7O1lBQ0ksSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVO0FBRGQ7ZUFHQTtJQWhEUTs7UUFrRFosSUFBSSxDQUFFLEtBQU4sQ0FBWSxNQUFaLEVBQW1CLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7dUJBQUc7WUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7O0lBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0E5RHJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCBcbiMjI1xuXG5pZiBwcm9jZXNzLnR5cGUgPT0gJ3JlbmRlcmVyJ1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gLT4gcmVxdWlyZSgnLi9reGsnKS5wb3N0LmdldCAnYXJncydcbiAgICBcbmVsc2VcblxuICAgIHsgZW1wdHksIGthcmcsIGtlcnJvciwgbm9vbiwgc2xhc2gsIHZhbGlkIH0gPSByZXF1aXJlICcuL2t4aydcbiAgICBcbiAgICBhcmdzID0ge30gXG4gICAgICAgIFxuICAgIGFyZ3MuaW5pdCA9IChjZmcsIGthcmdPcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBrYXJnT3B0ID89IHt9XG4gICAgICAgIHBrZyA9IGthcmdPcHQucGtnXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgcGtnP1xuICAgICAgICAgICAgcGtnRGlyID0gc2xhc2gucGtnIF9fZGlybmFtZVxuICAgICAgICAgICAgd2hpbGUgdmFsaWQocGtnRGlyKSBhbmQgc2xhc2guZmlsZShzbGFzaC5kaXIgcGtnRGlyKSA9PSAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgIHBrZ0RpciA9IHNsYXNoLnBrZyBzbGFzaC5kaXIgcGtnRGlyXG4gICAgICAgICAgICBpZiB2YWxpZCBwa2dEaXJcbiAgICAgICAgICAgICAgICBwa2dKc29uID0gc2xhc2guam9pbiBwa2dEaXIsICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICAgICAgcGtnID0gcmVxdWlyZSBwa2dKc29uXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtlcnJvciBcImFyZ3MgLS0gbm8gcGtnIGluICcje3BrZ0pzb259JyFcIiBpZiBlbXB0eSBwa2dcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4ga2Vycm9yICdhcmdzIC0tIG5vIHBrZyBkaXIhJ1xuICAgICAgICAgICAgXG4gICAgICAgIGthcmdDb25maWcgPSB7fVxuICAgICAgICBrYXJnQ29uZmlnW3BrZy5uYW1lXSA9IHt9XG4gICAgICAgIGthcmdDb25maWcudmVyc2lvbiA9IHBrZy52ZXJzaW9uXG4gICAgICAgIFxuICAgICAgICBmb3Iga2ssdnYgb2Ygbm9vbi5wYXJzZSBjZmdcbiAgICAgICAgICAgIG8gPSB7fVxuICAgICAgICAgICAgcyA9IHZ2LnNwbGl0KC9cXHNcXHMrLylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcy5sZW5ndGggPiAwIFxuICAgICAgICAgICAgICAgIG9bJz8nXSA9IHNbMF0gaWYgbm90IGVtcHR5IHNbMF1cbiAgICAgICAgICAgIGlmIHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIGlmIHNbMV0gaW4gWycqJywgJyoqJ11cbiAgICAgICAgICAgICAgICAgICAgb1tzWzFdXSA9IG51bGxcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9bJz0nXSA9IG5vb24ucGFyc2Uoc1sxXSlbMF0gXG4gICAgICAgICAgICBpZiBzLmxlbmd0aCA+IDJcbiAgICAgICAgICAgICAgICBpZiBzWzJdLnN0YXJ0c1dpdGggJy0nXG4gICAgICAgICAgICAgICAgICAgIG9bJy0nXSA9IHNbMl0uc3Vic3RyIDFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAga2FyZ0NvbmZpZ1twa2cubmFtZV1ba2tdID0gb1xuICAgICAgICAgICAgXG4gICAgICAgIGRlbGV0ZSBhcmdzLmluaXRcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IGthcmdPcHQuaWdub3JlQXJnc1xuICAgICAgICAgICAgaWYgc2xhc2gud2luKCkgYW5kIHNsYXNoLmZpbGUocHJvY2Vzcy5hcmd2WzBdKSA9PSBcIiN7cGtnLm5hbWV9LmV4ZVwiXG4gICAgICAgICAgICAgICAga2FyZ09wdC5pZ25vcmVBcmdzPTFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrYXJnT3B0Lmlnbm9yZUFyZ3M9MlxuICAgICAgICBcbiAgICAgICAgZm9yIGssdiBvZiBrYXJnIGthcmdDb25maWcsIGthcmdPcHRcbiAgICAgICAgICAgIGFyZ3Nba10gPSB2XG4gICAgICAgICAgICBcbiAgICAgICAgYXJnc1xuICAgIFxuICAgIHBvc3Q/Lm9uR2V0ICdhcmdzJyA9PiBhcmdzXG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhcmdzXG4iXX0=
//# sourceURL=../coffee/args.coffee