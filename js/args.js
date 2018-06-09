(function() {
  /*
   0000000   00000000    0000000    0000000
  000   000  000   000  000        000     
  000000000  0000000    000  0000  0000000 
  000   000  000   000  000   000       000
  000   000  000   000   0000000   0000000 
  */
  var _, args, empty, error, fs, karg, log, noon, post, slash, valid;

  ({karg, post, slash, noon, empty, valid, fs, error, log, _} = require('./kxk'));

  if (process.type === 'renderer') {
    module.exports = post.get('args');
  } else {
    args = {};
    args.init = function(cfg, kargOpt) {
      var k, kargConfig, kk, o, pkg, pkgDir, pkgJson, ref, ref1, ref2, s, v, vv;
      pkg = kargOpt != null ? kargOpt.pkg : void 0;
      if (pkg == null) {
        pkgDir = slash.pkg(__dirname);
        while (valid(pkgDir) && slash.file(slash.dir(pkgDir)) === 'node_modules') {
          pkgDir = slash.pkg(slash.dir(pkgDir));
        }
        if (valid(pkgDir)) {
          pkgJson = slash.join(pkgDir, 'package.json');
          pkg = require(pkgJson);
          if (empty(pkg)) {
            return error(`args -- no pkg in '${pkgJson}'!`);
          }
        } else {
          return error('args -- no pkg dir!');
        }
      }
      kargConfig = {};
      kargConfig[pkg.name] = {};
      kargConfig.version = pkg.version;
      ref = noon.parse(cfg);
      for (kk in ref) {
        vv = ref[kk];
        o = {};
        s = vv.split(/\s\s+/);
        if (s.length > 0) {
          if (!empty(s[0])) {
            o['?'] = s[0];
          }
        }
        if (s.length > 1) {
          if ((ref1 = s[1]) === '*' || ref1 === '**') {
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
      ref2 = karg(kargConfig, kargOpt);
      for (k in ref2) {
        v = ref2[k];
        args[k] = v;
      }
      return args;
    };
    post.onGet('args', () => {
      return args;
    });
    module.exports = args;
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJncy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIuLi9jb2ZmZWUvYXJncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxJQUFGLEVBQVEsSUFBUixFQUFjLEtBQWQsRUFBcUIsSUFBckIsRUFBMkIsS0FBM0IsRUFBa0MsS0FBbEMsRUFBeUMsRUFBekMsRUFBNkMsS0FBN0MsRUFBb0QsR0FBcEQsRUFBeUQsQ0FBekQsQ0FBQSxHQUErRCxPQUFBLENBQVEsT0FBUixDQUEvRDs7RUFFQSxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0lBRUksTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFULEVBRnJCO0dBQUEsTUFBQTtJQU1JLElBQUEsR0FBTyxDQUFBO0lBRVAsSUFBSSxDQUFDLElBQUwsR0FBWSxRQUFBLENBQUMsR0FBRCxFQUFNLE9BQU4sQ0FBQTtBQUVSLFVBQUEsQ0FBQSxFQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7TUFBQSxHQUFBLHFCQUFNLE9BQU8sQ0FBRTtNQUVmLElBQU8sV0FBUDtRQUNJLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQVY7QUFDVCxlQUFNLEtBQUEsQ0FBTSxNQUFOLENBQUEsSUFBa0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FBWCxDQUFBLEtBQWdDLGNBQXhEO1VBQ0ksTUFBQSxHQUFTLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLENBQVY7UUFEYjtRQUVBLElBQUcsS0FBQSxDQUFNLE1BQU4sQ0FBSDtVQUNJLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLE1BQVgsRUFBbUIsY0FBbkI7VUFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7VUFDTixJQUFrRCxLQUFBLENBQU0sR0FBTixDQUFsRDtBQUFBLG1CQUFPLEtBQUEsQ0FBTSxDQUFBLG1CQUFBLENBQUEsQ0FBc0IsT0FBdEIsQ0FBOEIsRUFBOUIsQ0FBTixFQUFQO1dBSEo7U0FBQSxNQUFBO0FBS0ksaUJBQU8sS0FBQSxDQUFNLHFCQUFOLEVBTFg7U0FKSjs7TUFXQSxVQUFBLEdBQWEsQ0FBQTtNQUNiLFVBQVcsQ0FBQSxHQUFHLENBQUMsSUFBSixDQUFYLEdBQXVCLENBQUE7TUFDdkIsVUFBVSxDQUFDLE9BQVgsR0FBcUIsR0FBRyxDQUFDO0FBRXpCO01BQUEsS0FBQSxTQUFBOztRQUNJLENBQUEsR0FBSSxDQUFBO1FBQ0osQ0FBQSxHQUFJLEVBQUUsQ0FBQyxLQUFILENBQVMsT0FBVDtRQUVKLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFkO1VBQ0ksSUFBaUIsQ0FBSSxLQUFBLENBQU0sQ0FBRSxDQUFBLENBQUEsQ0FBUixDQUFyQjtZQUFBLENBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUyxDQUFFLENBQUEsQ0FBQSxFQUFYO1dBREo7O1FBRUEsSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLENBQWQ7VUFDSSxZQUFHLENBQUUsQ0FBQSxDQUFBLEVBQUYsS0FBUyxHQUFULElBQUEsSUFBQSxLQUFjLElBQWpCO1lBQ0ksQ0FBRSxDQUFBLENBQUUsQ0FBQSxDQUFBLENBQUYsQ0FBRixHQUFVLEtBRGQ7V0FBQSxNQUFBO1lBR0ksQ0FBRSxDQUFBLEdBQUEsQ0FBRixHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBRSxDQUFBLENBQUEsQ0FBYixDQUFpQixDQUFBLENBQUEsRUFIOUI7V0FESjs7UUFLQSxJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsQ0FBZDtVQUNJLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBSDtZQUNJLENBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTCxDQUFZLENBQVosRUFEYjtXQURKOztRQUlBLFVBQVcsQ0FBQSxHQUFHLENBQUMsSUFBSixDQUFVLENBQUEsRUFBQSxDQUFyQixHQUEyQjtNQWYvQjtNQWlCQSxPQUFPLElBQUksQ0FBQztBQUVaO01BQUEsS0FBQSxTQUFBOztRQUNJLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVTtNQURkO2FBR0E7SUF6Q1E7SUEyQ1osSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFYLEVBQW1CLENBQUEsQ0FBQSxHQUFBO2FBQUc7SUFBSCxDQUFuQjtJQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBckRyQjs7QUFWQSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIyNcblxueyBrYXJnLCBwb3N0LCBzbGFzaCwgbm9vbiwgZW1wdHksIHZhbGlkLCBmcywgZXJyb3IsIGxvZywgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBwb3N0LmdldCAnYXJncydcbiAgICBcbmVsc2VcbiAgICAgICAgXG4gICAgYXJncyA9IHt9IFxuICAgICAgICBcbiAgICBhcmdzLmluaXQgPSAoY2ZnLCBrYXJnT3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgcGtnID0ga2FyZ09wdD8ucGtnXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgcGtnP1xuICAgICAgICAgICAgcGtnRGlyID0gc2xhc2gucGtnIF9fZGlybmFtZVxuICAgICAgICAgICAgd2hpbGUgdmFsaWQocGtnRGlyKSBhbmQgc2xhc2guZmlsZShzbGFzaC5kaXIgcGtnRGlyKSA9PSAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICAgICAgICAgIHBrZ0RpciA9IHNsYXNoLnBrZyBzbGFzaC5kaXIgcGtnRGlyXG4gICAgICAgICAgICBpZiB2YWxpZCBwa2dEaXJcbiAgICAgICAgICAgICAgICBwa2dKc29uID0gc2xhc2guam9pbiBwa2dEaXIsICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICAgICAgcGtnID0gcmVxdWlyZSBwa2dKc29uXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yIFwiYXJncyAtLSBubyBwa2cgaW4gJyN7cGtnSnNvbn0nIVwiIGlmIGVtcHR5IHBrZ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvciAnYXJncyAtLSBubyBwa2cgZGlyISdcbiAgICAgICAgICAgIFxuICAgICAgICBrYXJnQ29uZmlnID0ge31cbiAgICAgICAga2FyZ0NvbmZpZ1twa2cubmFtZV0gPSB7fVxuICAgICAgICBrYXJnQ29uZmlnLnZlcnNpb24gPSBwa2cudmVyc2lvblxuICAgICAgICBcbiAgICAgICAgZm9yIGtrLHZ2IG9mIG5vb24ucGFyc2UgY2ZnXG4gICAgICAgICAgICBvID0ge31cbiAgICAgICAgICAgIHMgPSB2di5zcGxpdCgvXFxzXFxzKy8pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHMubGVuZ3RoID4gMCBcbiAgICAgICAgICAgICAgICBvWyc/J10gPSBzWzBdIGlmIG5vdCBlbXB0eSBzWzBdXG4gICAgICAgICAgICBpZiBzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBpZiBzWzFdIGluIFsnKicsICcqKiddXG4gICAgICAgICAgICAgICAgICAgIG9bc1sxXV0gPSBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvWyc9J10gPSBub29uLnBhcnNlKHNbMV0pWzBdIFxuICAgICAgICAgICAgaWYgcy5sZW5ndGggPiAyXG4gICAgICAgICAgICAgICAgaWYgc1syXS5zdGFydHNXaXRoICctJ1xuICAgICAgICAgICAgICAgICAgICBvWyctJ10gPSBzWzJdLnN1YnN0ciAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGthcmdDb25maWdbcGtnLm5hbWVdW2trXSA9IG9cbiAgICAgICAgICAgIFxuICAgICAgICBkZWxldGUgYXJncy5pbml0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciBrLHYgb2Yga2FyZyBrYXJnQ29uZmlnLCBrYXJnT3B0XG4gICAgICAgICAgICBhcmdzW2tdID0gdlxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ3NcbiAgICBcbiAgICBwb3N0Lm9uR2V0ICdhcmdzJywgPT4gYXJnc1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gYXJnc1xuIl19
//# sourceURL=../coffee/args.coffee