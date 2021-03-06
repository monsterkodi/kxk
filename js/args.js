// koffee 1.4.0

/*
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000
 */
var _, args, empty, fs, karg, kerror, noon, post, ref, slash, valid;

ref = require('./kxk'), karg = ref.karg, post = ref.post, slash = ref.slash, noon = ref.noon, empty = ref.empty, valid = ref.valid, fs = ref.fs, kerror = ref.kerror, _ = ref._;

if (process.type === 'renderer') {
    module.exports = post.get('args');
} else {
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
    if (post != null) {
        post.onGet('args', (function(_this) {
            return function() {
                return args;
            };
        })(this));
    }
    module.exports = args;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJncy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBMkQsT0FBQSxDQUFRLE9BQVIsQ0FBM0QsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGlCQUEzQixFQUFrQyxpQkFBbEMsRUFBeUMsV0FBekMsRUFBNkMsbUJBQTdDLEVBQXFEOztBQUVyRCxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0lBRUksTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFULEVBRnJCO0NBQUEsTUFBQTtJQU1JLElBQUEsR0FBTztJQUVQLElBQUksQ0FBQyxJQUFMLEdBQVksU0FBQyxHQUFELEVBQU0sT0FBTjtBQUVSLFlBQUE7O1lBQUE7O1lBQUEsVUFBVzs7UUFDWCxHQUFBLEdBQU0sT0FBTyxDQUFDO1FBRWQsSUFBTyxXQUFQO1lBQ0ksTUFBQSxHQUFTLEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBVjtBQUNULG1CQUFNLEtBQUEsQ0FBTSxNQUFOLENBQUEsSUFBa0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FBWCxDQUFBLEtBQWdDLGNBQXhEO2dCQUNJLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixDQUFWO1lBRGI7WUFFQSxJQUFHLEtBQUEsQ0FBTSxNQUFOLENBQUg7Z0JBQ0ksT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFtQixjQUFuQjtnQkFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7Z0JBQ04sSUFBbUQsS0FBQSxDQUFNLEdBQU4sQ0FBbkQ7QUFBQSwyQkFBTyxNQUFBLENBQU8scUJBQUEsR0FBc0IsT0FBdEIsR0FBOEIsSUFBckMsRUFBUDtpQkFISjthQUFBLE1BQUE7QUFLSSx1QkFBTyxNQUFBLENBQU8scUJBQVAsRUFMWDthQUpKOztRQVdBLFVBQUEsR0FBYTtRQUNiLFVBQVcsQ0FBQSxHQUFHLENBQUMsSUFBSixDQUFYLEdBQXVCO1FBQ3ZCLFVBQVUsQ0FBQyxPQUFYLEdBQXFCLEdBQUcsQ0FBQztBQUV6QjtBQUFBLGFBQUEsVUFBQTs7WUFDSSxDQUFBLEdBQUk7WUFDSixDQUFBLEdBQUksRUFBRSxDQUFDLEtBQUgsQ0FBUyxPQUFUO1lBRUosSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLENBQWQ7Z0JBQ0ksSUFBaUIsQ0FBSSxLQUFBLENBQU0sQ0FBRSxDQUFBLENBQUEsQ0FBUixDQUFyQjtvQkFBQSxDQUFFLENBQUEsR0FBQSxDQUFGLEdBQVMsQ0FBRSxDQUFBLENBQUEsRUFBWDtpQkFESjs7WUFFQSxJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsQ0FBZDtnQkFDSSxZQUFHLENBQUUsQ0FBQSxDQUFBLEVBQUYsS0FBUyxHQUFULElBQUEsSUFBQSxLQUFjLElBQWpCO29CQUNJLENBQUUsQ0FBQSxDQUFFLENBQUEsQ0FBQSxDQUFGLENBQUYsR0FBVSxLQURkO2lCQUFBLE1BQUE7b0JBR0ksQ0FBRSxDQUFBLEdBQUEsQ0FBRixHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBRSxDQUFBLENBQUEsQ0FBYixDQUFpQixDQUFBLENBQUEsRUFIOUI7aUJBREo7O1lBS0EsSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLENBQWQ7Z0JBQ0ksSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBTCxDQUFnQixHQUFoQixDQUFIO29CQUNJLENBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTCxDQUFZLENBQVosRUFEYjtpQkFESjs7WUFJQSxVQUFXLENBQUEsR0FBRyxDQUFDLElBQUosQ0FBVSxDQUFBLEVBQUEsQ0FBckIsR0FBMkI7QUFmL0I7UUFpQkEsT0FBTyxJQUFJLENBQUM7UUFFWixJQUFHLEtBQUEsQ0FBTSxPQUFPLENBQUMsVUFBZCxDQUFIO1lBQ0ksSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFPLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBeEIsQ0FBQSxLQUErQixDQUFHLEdBQUcsQ0FBQyxJQUFMLEdBQVUsTUFBWixDQUFsRDtnQkFDSSxPQUFPLENBQUMsVUFBUixHQUFtQixFQUR2QjthQUFBLE1BQUE7Z0JBR0ksT0FBTyxDQUFDLFVBQVIsR0FBbUIsRUFIdkI7YUFESjs7QUFNQTtBQUFBLGFBQUEsU0FBQTs7WUFDSSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVU7QUFEZDtlQUdBO0lBaERROztRQWtEWixJQUFJLENBQUUsS0FBTixDQUFZLE1BQVosRUFBb0IsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQTt1QkFBRztZQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjs7SUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixLQTVEckIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyMjXG5cbnsga2FyZywgcG9zdCwgc2xhc2gsIG5vb24sIGVtcHR5LCB2YWxpZCwgZnMsIGtlcnJvciwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBwb3N0LmdldCAnYXJncydcbiAgICBcbmVsc2VcbiAgICAgICAgXG4gICAgYXJncyA9IHt9IFxuICAgICAgICBcbiAgICBhcmdzLmluaXQgPSAoY2ZnLCBrYXJnT3B0KSAtPlxuICAgICAgICBcbiAgICAgICAga2FyZ09wdCA/PSB7fVxuICAgICAgICBwa2cgPSBrYXJnT3B0LnBrZ1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IHBrZz9cbiAgICAgICAgICAgIHBrZ0RpciA9IHNsYXNoLnBrZyBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHdoaWxlIHZhbGlkKHBrZ0RpcikgYW5kIHNsYXNoLmZpbGUoc2xhc2guZGlyIHBrZ0RpcikgPT0gJ25vZGVfbW9kdWxlcydcbiAgICAgICAgICAgICAgICBwa2dEaXIgPSBzbGFzaC5wa2cgc2xhc2guZGlyIHBrZ0RpclxuICAgICAgICAgICAgaWYgdmFsaWQgcGtnRGlyXG4gICAgICAgICAgICAgICAgcGtnSnNvbiA9IHNsYXNoLmpvaW4gcGtnRGlyLCAncGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgcGtnSnNvblxuICAgICAgICAgICAgICAgIHJldHVybiBrZXJyb3IgXCJhcmdzIC0tIG5vIHBrZyBpbiAnI3twa2dKc29ufSchXCIgaWYgZW1wdHkgcGtnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtlcnJvciAnYXJncyAtLSBubyBwa2cgZGlyISdcbiAgICAgICAgICAgIFxuICAgICAgICBrYXJnQ29uZmlnID0ge31cbiAgICAgICAga2FyZ0NvbmZpZ1twa2cubmFtZV0gPSB7fVxuICAgICAgICBrYXJnQ29uZmlnLnZlcnNpb24gPSBwa2cudmVyc2lvblxuICAgICAgICBcbiAgICAgICAgZm9yIGtrLHZ2IG9mIG5vb24ucGFyc2UgY2ZnXG4gICAgICAgICAgICBvID0ge31cbiAgICAgICAgICAgIHMgPSB2di5zcGxpdCgvXFxzXFxzKy8pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHMubGVuZ3RoID4gMCBcbiAgICAgICAgICAgICAgICBvWyc/J10gPSBzWzBdIGlmIG5vdCBlbXB0eSBzWzBdXG4gICAgICAgICAgICBpZiBzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBpZiBzWzFdIGluIFsnKicsICcqKiddXG4gICAgICAgICAgICAgICAgICAgIG9bc1sxXV0gPSBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvWyc9J10gPSBub29uLnBhcnNlKHNbMV0pWzBdIFxuICAgICAgICAgICAgaWYgcy5sZW5ndGggPiAyXG4gICAgICAgICAgICAgICAgaWYgc1syXS5zdGFydHNXaXRoICctJ1xuICAgICAgICAgICAgICAgICAgICBvWyctJ10gPSBzWzJdLnN1YnN0ciAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGthcmdDb25maWdbcGtnLm5hbWVdW2trXSA9IG9cbiAgICAgICAgICAgIFxuICAgICAgICBkZWxldGUgYXJncy5pbml0XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBrYXJnT3B0Lmlnbm9yZUFyZ3NcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpIGFuZCBzbGFzaC5maWxlKHByb2Nlc3MuYXJndlswXSkgPT0gXCIje3BrZy5uYW1lfS5leGVcIlxuICAgICAgICAgICAgICAgIGthcmdPcHQuaWdub3JlQXJncz0xXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2FyZ09wdC5pZ25vcmVBcmdzPTJcbiAgICAgICAgXG4gICAgICAgIGZvciBrLHYgb2Yga2FyZyBrYXJnQ29uZmlnLCBrYXJnT3B0XG4gICAgICAgICAgICBhcmdzW2tdID0gdlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ3NcbiAgICBcbiAgICBwb3N0Py5vbkdldCAnYXJncycsID0+IGFyZ3NcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGFyZ3NcbiJdfQ==
//# sourceURL=../coffee/args.coffee