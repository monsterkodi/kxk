(function() {
  /*
  00       0000000    0000000 
  00      000   000  000      
  00      000   000  000  0000
  00      000   000  000   000
  000000   0000000    0000000 
  */
  var _, app, electron, err, fs, log, os, post, ref, ref1, slash, slog, sorcery, stack, str, sutil, udpLog, udpSend, udpStop;

  post = require('./ppost');

  str = require('./str');

  os = require('os');

  fs = require('fs');

  _ = require('lodash');

  sutil = require('stack-utils');

  sorcery = require('sorcery');

  stack = new sutil({
    cwd: process.cwd(),
    internals: sutil.nodeInternals()
  });

  udpSend = null;

  udpLog = function(info) {
    var udp;
    if (!udpSend) {
      udp = require('./udp');
      udpSend = new udp({
        debug: slog.debug
      });
    }
    info.id = slog.id;
    info.icon = slog.icon;
    return udpSend.send(info);
  };

  udpStop = function() {
    if (udpSend) {
      udpSend.close();
      udpSend = null;
      return slog.udp = false;
    }
  };

  slog = function(s) {
    var chain, err, f, file, info, match, meth, slash, source, sourceText;
    slash = require('./slash'); // fancy log with source-mapped files and line numbers
    try {
      f = stack.capture()[slog.depth];
      if (chain = sorcery.loadSync(f.getFileName())) {
        info = chain.trace(f.getLineNumber(), 0);
        source = f.getFileName();
        if (!slash.samePath(f.getScriptNameOrSourceURL(), f.getFileName())) {
          source = slash.path(f.getScriptNameOrSourceURL());
        } else {
          sourceText = fs.readFileSync(f.getFileName(), 'utf8');
          // balancer is broken. below is not a comment. should handle escaped hash signs. 
          match = sourceText.match(/\/\/\# sourceURL=(.+)$/);
          if ((match != null ? match[1] : void 0) != null) {
            source = match != null ? match[1] : void 0;
          }
        }
        info.source = slash.tilde(source);
      } else {
        info = {
          source: slash.tilde(f.getFileName()),
          line: f.getLineNumber()
        };
      }
      file = _.padStart(`${info.source}:${info.line}`, slog.filepad);
      meth = _.padEnd(f.getFunctionName(), slog.methpad);
      info.str = s;
      s = `${file}${slog.filesep}${meth}${slog.methsep}${s}`;
      post.emit('slog', s, info);
      if (slog.udp) {
        return udpLog(info);
      }
    } catch (error) {
      err = error;
      return post.emit('slog', `!${slog.methsep}${s} ${err}`);
    }
  };

  log = function() {
    var s;
    s = ((function() {
      var i, len, ref, results;
      ref = [].slice.call(arguments, 0);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        results.push(str(s));
      }
      return results;
    }).apply(this, arguments)).join(" ");
    post.emit('log', s);
    console.log(s);
    return slog(s);
  };

  slog.udp = true;

  slog.id = '???';

  slog.icon = process.type === 'renderer' ? '●' : '◆';

  slog.depth = 2;

  slog.filesep = ' > '; //' ⦿ '

  slog.methsep = ' >> '; //' ▸ '

  slog.filepad = 30;

  slog.methpad = 15;

  log.slog = slog;

  log.stop = udpStop;

  try {
    electron = require('electron');
    if (process.type === 'renderer') {
      app = electron.remote.app;
    } else {
      app = electron.app;
    }
    slog.id = app.getName();
  } catch (error) {
    err = error;
    try {
      slash = require('./slash');
      if (process.argv[0].length && ((ref = slash.base(process.argv[0])) === 'node' || ref === 'coffee')) {
        if ((ref1 = process.argv[1]) != null ? ref1.length : void 0) {
          slog.id = slash.base(process.argv[1]);
        }
      } else {
        console.log("can't figure out slog.id -- process.argv:", process.argv.join(' '));
      }
    } catch (error) {
      err = error;
      null;
    }
  }

  module.exports = log;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQTs7RUFRQSxJQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBQ1YsR0FBQSxHQUFVLE9BQUEsQ0FBUSxPQUFSOztFQUNWLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7RUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0VBQ1YsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztFQUNWLEtBQUEsR0FBVSxPQUFBLENBQVEsYUFBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBRVYsS0FBQSxHQUFVLElBQUksS0FBSixDQUFVO0lBQUEsR0FBQSxFQUFLLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBTDtJQUFvQixTQUFBLEVBQVcsS0FBSyxDQUFDLGFBQU4sQ0FBQTtFQUEvQixDQUFWOztFQUVWLE9BQUEsR0FBVTs7RUFDVixNQUFBLEdBQVMsUUFBQSxDQUFDLElBQUQsQ0FBQTtBQUNMLFFBQUE7SUFBQSxJQUFHLENBQUksT0FBUDtNQUNJLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjtNQUNOLE9BQUEsR0FBVSxJQUFJLEdBQUosQ0FBUTtRQUFBLEtBQUEsRUFBTSxJQUFJLENBQUM7TUFBWCxDQUFSLEVBRmQ7O0lBR0EsSUFBSSxDQUFDLEVBQUwsR0FBWSxJQUFJLENBQUM7SUFDakIsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUM7V0FD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LENBQUEsQ0FBeEIsRUFBQSxLQUFnQyxNQUFoQyxJQUFBLEdBQUEsS0FBd0MsUUFBeEMsQ0FBOUI7UUFDSSwyQ0FBa0IsQ0FBRSxlQUFwQjtVQUNJLElBQUksQ0FBQyxFQUFMLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFPLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBeEIsRUFEZDtTQURKO09BQUEsTUFBQTtRQUlJLE9BQU8sQ0FBQyxHQUFSLENBQVksMkNBQVosRUFBeUQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFiLENBQWtCLEdBQWxCLENBQXpELEVBSko7T0FGSjtLQUFBLGFBQUE7TUFPTTtNQUNGLEtBUko7S0FSSjs7O0VBa0JBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdEdqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwIFxuMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnBvc3QgICAgPSByZXF1aXJlICcuL3Bwb3N0J1xuc3RyICAgICA9IHJlcXVpcmUgJy4vc3RyJ1xub3MgICAgICA9IHJlcXVpcmUgJ29zJ1xuZnMgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuXyAgICAgICA9IHJlcXVpcmUgJ2xvZGFzaCdcbnN1dGlsICAgPSByZXF1aXJlICdzdGFjay11dGlscydcbnNvcmNlcnkgPSByZXF1aXJlICdzb3JjZXJ5J1xuXG5zdGFjayAgID0gbmV3IHN1dGlsIGN3ZDogcHJvY2Vzcy5jd2QoKSwgaW50ZXJuYWxzOiBzdXRpbC5ub2RlSW50ZXJuYWxzKClcblxudWRwU2VuZCA9IG51bGxcbnVkcExvZyA9IChpbmZvKSAtPlxuICAgIGlmIG5vdCB1ZHBTZW5kXG4gICAgICAgIHVkcCA9IHJlcXVpcmUgJy4vdWRwJ1xuICAgICAgICB1ZHBTZW5kID0gbmV3IHVkcCBkZWJ1ZzpzbG9nLmRlYnVnXG4gICAgaW5mby5pZCAgID0gc2xvZy5pZFxuICAgIGluZm8uaWNvbiA9IHNsb2cuaWNvblxuICAgIHVkcFNlbmQuc2VuZCBpbmZvXG4gICAgXG51ZHBTdG9wID0gLT5cbiAgICBpZiB1ZHBTZW5kXG4gICAgICAgIHVkcFNlbmQuY2xvc2UoKVxuICAgICAgICB1ZHBTZW5kICA9IG51bGxcbiAgICAgICAgc2xvZy51ZHAgPSBmYWxzZVxuXG5zbG9nID0gKHMpIC0+XG4gICAgXG4gICAgc2xhc2ggPSByZXF1aXJlICcuL3NsYXNoJ1xuICAgIFxuICAgIHRyeSAjIGZhbmN5IGxvZyB3aXRoIHNvdXJjZS1tYXBwZWQgZmlsZXMgYW5kIGxpbmUgbnVtYmVyc1xuICAgICAgICBmID0gc3RhY2suY2FwdHVyZSgpW3Nsb2cuZGVwdGhdXG4gICAgICAgIGlmIGNoYWluID0gc29yY2VyeS5sb2FkU3luYyhmLmdldEZpbGVOYW1lKCkpXG4gICAgICAgICAgICBpbmZvICAgPSBjaGFpbi50cmFjZShmLmdldExpbmVOdW1iZXIoKSwgMClcbiAgICAgICAgICAgIHNvdXJjZSA9IGYuZ2V0RmlsZU5hbWUoKVxuICAgICAgICAgICAgaWYgbm90IHNsYXNoLnNhbWVQYXRoIGYuZ2V0U2NyaXB0TmFtZU9yU291cmNlVVJMKCksIGYuZ2V0RmlsZU5hbWUoKVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNsYXNoLnBhdGggZi5nZXRTY3JpcHROYW1lT3JTb3VyY2VVUkwoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNvdXJjZVRleHQgPSBmcy5yZWFkRmlsZVN5bmMgZi5nZXRGaWxlTmFtZSgpLCAndXRmOCdcbiAgICAgICAgICAgICAgICAjIGJhbGFuY2VyIGlzIGJyb2tlbi4gYmVsb3cgaXMgbm90IGEgY29tbWVudC4gc2hvdWxkIGhhbmRsZSBlc2NhcGVkIGhhc2ggc2lnbnMuIFxuICAgICAgICAgICAgICAgIG1hdGNoICA9IHNvdXJjZVRleHQubWF0Y2ggL1xcL1xcL1xcIyBzb3VyY2VVUkw9KC4rKSQvXG4gICAgICAgICAgICAgICAgaWYgbWF0Y2g/WzFdP1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBtYXRjaD9bMV1cbiAgICAgICAgICAgIGluZm8uc291cmNlID0gc2xhc2gudGlsZGUgc291cmNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGluZm8gPSBzb3VyY2U6IHNsYXNoLnRpbGRlKGYuZ2V0RmlsZU5hbWUoKSksIGxpbmU6IGYuZ2V0TGluZU51bWJlcigpXG5cbiAgICAgICAgZmlsZSA9IF8ucGFkU3RhcnQgXCIje2luZm8uc291cmNlfToje2luZm8ubGluZX1cIiwgc2xvZy5maWxlcGFkXG4gICAgICAgIG1ldGggPSBfLnBhZEVuZCBmLmdldEZ1bmN0aW9uTmFtZSgpLCBzbG9nLm1ldGhwYWRcbiAgICAgICAgaW5mby5zdHIgPSBzXG4gICAgICAgIHMgPSBcIiN7ZmlsZX0je3Nsb2cuZmlsZXNlcH0je21ldGh9I3tzbG9nLm1ldGhzZXB9I3tzfVwiXG4gICAgICAgIHBvc3QuZW1pdCAnc2xvZycsIHMsIGluZm9cbiAgICAgICAgaWYgc2xvZy51ZHBcbiAgICAgICAgICAgIHVkcExvZyBpbmZvXG4gICAgICAgICAgICBcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcG9zdC5lbWl0ICdzbG9nJywgXCIhI3tzbG9nLm1ldGhzZXB9I3tzfSAje2Vycn1cIlxuXG5sb2cgPSAtPlxuICAgIFxuICAgIHMgPSAoc3RyKHMpIGZvciBzIGluIFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwKS5qb2luIFwiIFwiIFxuICAgIFxuICAgIHBvc3QuZW1pdCAnbG9nJywgc1xuICAgIGNvbnNvbGUubG9nIHNcbiAgICBzbG9nIHNcblxuc2xvZy51ZHAgICAgID0gdHJ1ZVxuc2xvZy5pZCAgICAgID0gJz8/PydcbnNsb2cuaWNvbiAgICA9IGlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInIHRoZW4gJ+KXjycgZWxzZSAn4peGJ1xuc2xvZy5kZXB0aCAgID0gMlxuc2xvZy5maWxlc2VwID0gJyA+ICcgIycg4qa/ICdcbnNsb2cubWV0aHNlcCA9ICcgPj4gJyAjJyDilrggJ1xuc2xvZy5maWxlcGFkID0gMzBcbnNsb2cubWV0aHBhZCA9IDE1XG5sb2cuc2xvZyAgICAgPSBzbG9nXG5sb2cuc3RvcCAgICAgPSB1ZHBTdG9wXG5cbnRyeVxuICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcbiAgICAgICAgYXBwID0gZWxlY3Ryb24ucmVtb3RlLmFwcFxuICAgIGVsc2VcbiAgICAgICAgYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgc2xvZy5pZCA9IGFwcC5nZXROYW1lKClcbmNhdGNoIGVyclxuICAgIHRyeVxuICAgICAgICBzbGFzaCA9IHJlcXVpcmUgJy4vc2xhc2gnXG4gICAgICAgIGlmIHByb2Nlc3MuYXJndlswXS5sZW5ndGggYW5kIHNsYXNoLmJhc2UocHJvY2Vzcy5hcmd2WzBdKSBpbiBbJ25vZGUnLCAnY29mZmVlJ11cbiAgICAgICAgICAgIGlmIHByb2Nlc3MuYXJndlsxXT8ubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2xvZy5pZCA9IHNsYXNoLmJhc2UgcHJvY2Vzcy5hcmd2WzFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiY2FuJ3QgZmlndXJlIG91dCBzbG9nLmlkIC0tIHByb2Nlc3MuYXJndjpcIiwgcHJvY2Vzcy5hcmd2LmpvaW4gJyAnXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dcblxuIl19
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/log.coffee