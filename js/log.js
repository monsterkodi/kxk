(function() {
  /*
  00       0000000    0000000 
  00      000   000  000      
  00      000   000  000  0000
  00      000   000  000   000
  000000   0000000    0000000 
  */
  var _, fs, log, os, post, slog, sorcery, stack, str, sutil, udpLog, udpSend;

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

  slog.id = 'kxk';

  slog.icon = process.type === 'renderer' ? '🞇' : '⬢';

  slog.depth = 2;

  slog.filesep = ' > '; //' ⦿ '

  slog.methsep = ' >> '; //' ▸ '

  slog.filepad = 30;

  slog.methpad = 15;

  log.slog = slog;

  module.exports = log;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBOztFQVFBLElBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLE9BQVI7O0VBQ1YsRUFBQSxHQUFVLE9BQUEsQ0FBUSxJQUFSOztFQUNWLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7RUFDVixDQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0VBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSOztFQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFFVixLQUFBLEdBQVUsSUFBSSxLQUFKLENBQVU7SUFBQSxHQUFBLEVBQUssT0FBTyxDQUFDLEdBQVIsQ0FBQSxDQUFMO0lBQW9CLFNBQUEsRUFBVyxLQUFLLENBQUMsYUFBTixDQUFBO0VBQS9CLENBQVY7O0VBRVYsT0FBQSxHQUFVOztFQUNWLE1BQUEsR0FBUyxRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ0wsUUFBQTtJQUFBLElBQUcsQ0FBSSxPQUFQO01BQ0ksR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSO01BQ04sT0FBQSxHQUFVLElBQUksR0FBSixDQUFRO1FBQUEsS0FBQSxFQUFNLElBQUksQ0FBQztNQUFYLENBQVIsRUFGZDs7SUFHQSxJQUFJLENBQUMsRUFBTCxHQUFZLElBQUksQ0FBQztJQUNqQixJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQztXQUNqQixPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7RUFOSzs7RUFRVCxJQUFBLEdBQU8sUUFBQSxDQUFDLENBQUQsQ0FBQTtB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Q0FBWjtXQUNBLElBQUEsQ0FBSyxDQUFMO0VBTkU7O0VBUU4sSUFBSSxDQUFDLEdBQUwsR0FBZTs7RUFDZixJQUFJLENBQUMsRUFBTCxHQUFlOztFQUNmLElBQUksQ0FBQyxJQUFMLEdBQWtCLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CLEdBQW1DLElBQW5DLEdBQTZDOztFQUM1RCxJQUFJLENBQUMsS0FBTCxHQUFlOztFQUNmLElBQUksQ0FBQyxPQUFMLEdBQWUsTUF2RWY7O0VBd0VBLElBQUksQ0FBQyxPQUFMLEdBQWUsT0F4RWY7O0VBeUVBLElBQUksQ0FBQyxPQUFMLEdBQWU7O0VBQ2YsSUFBSSxDQUFDLE9BQUwsR0FBZTs7RUFDZixHQUFHLENBQUMsSUFBSixHQUFlOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBN0VqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwIFxuMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnBvc3QgICAgPSByZXF1aXJlICcuL3Bwb3N0JyBcbnN0ciAgICAgPSByZXF1aXJlICcuL3N0cidcbm9zICAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICAgPSByZXF1aXJlICdmcydcbl8gICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5zdXRpbCAgID0gcmVxdWlyZSAnc3RhY2stdXRpbHMnXG5zb3JjZXJ5ID0gcmVxdWlyZSAnc29yY2VyeSdcblxuc3RhY2sgICA9IG5ldyBzdXRpbCBjd2Q6IHByb2Nlc3MuY3dkKCksIGludGVybmFsczogc3V0aWwubm9kZUludGVybmFscygpXG5cbnVkcFNlbmQgPSBudWxsXG51ZHBMb2cgPSAoaW5mbykgLT5cbiAgICBpZiBub3QgdWRwU2VuZFxuICAgICAgICB1ZHAgPSByZXF1aXJlICcuL3VkcCdcbiAgICAgICAgdWRwU2VuZCA9IG5ldyB1ZHAgZGVidWc6c2xvZy5kZWJ1Z1xuICAgIGluZm8uaWQgICA9IHNsb2cuaWRcbiAgICBpbmZvLmljb24gPSBzbG9nLmljb25cbiAgICB1ZHBTZW5kLnNlbmQgaW5mb1xuXG5zbG9nID0gKHMpIC0+XG4gICAgXG4gICAgc2xhc2ggPSByZXF1aXJlICcuL3NsYXNoJ1xuICAgIFxuICAgIHRyeSAjIGZhbmN5IGxvZyB3aXRoIHNvdXJjZS1tYXBwZWQgZmlsZXMgYW5kIGxpbmUgbnVtYmVyc1xuICAgICAgICBmID0gc3RhY2suY2FwdHVyZSgpW3Nsb2cuZGVwdGhdXG4gICAgICAgIGlmIGNoYWluID0gc29yY2VyeS5sb2FkU3luYyhmLmdldEZpbGVOYW1lKCkpXG4gICAgICAgICAgICBpbmZvICAgPSBjaGFpbi50cmFjZShmLmdldExpbmVOdW1iZXIoKSwgMClcbiAgICAgICAgICAgIHNvdXJjZSA9IGYuZ2V0RmlsZU5hbWUoKVxuICAgICAgICAgICAgaWYgbm90IHNsYXNoLnNhbWVQYXRoIGYuZ2V0U2NyaXB0TmFtZU9yU291cmNlVVJMKCksIGYuZ2V0RmlsZU5hbWUoKVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNsYXNoLnBhdGggZi5nZXRTY3JpcHROYW1lT3JTb3VyY2VVUkwoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNvdXJjZVRleHQgPSBmcy5yZWFkRmlsZVN5bmMgZi5nZXRGaWxlTmFtZSgpLCAndXRmOCdcbiAgICAgICAgICAgICAgICAjIGJhbGFuY2VyIGlzIGJyb2tlbi4gYmVsb3cgaXMgbm90IGEgY29tbWVudC4gc2hvdWxkIGhhbmRsZSBlc2NhcGVkIGhhc2ggc2lnbnMuIFxuICAgICAgICAgICAgICAgIG1hdGNoICA9IHNvdXJjZVRleHQubWF0Y2ggL1xcL1xcL1xcIyBzb3VyY2VVUkw9KC4rKSQvXG4gICAgICAgICAgICAgICAgaWYgbWF0Y2g/WzFdP1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBtYXRjaD9bMV1cbiAgICAgICAgICAgIGluZm8uc291cmNlID0gc2xhc2gudGlsZGUgc291cmNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGluZm8gPSBzb3VyY2U6IHNsYXNoLnRpbGRlKGYuZ2V0RmlsZU5hbWUoKSksIGxpbmU6IGYuZ2V0TGluZU51bWJlcigpXG5cbiAgICAgICAgZmlsZSA9IF8ucGFkU3RhcnQgXCIje2luZm8uc291cmNlfToje2luZm8ubGluZX1cIiwgc2xvZy5maWxlcGFkXG4gICAgICAgIG1ldGggPSBfLnBhZEVuZCBmLmdldEZ1bmN0aW9uTmFtZSgpLCBzbG9nLm1ldGhwYWRcbiAgICAgICAgaW5mby5zdHIgPSBzXG4gICAgICAgIHMgPSBcIiN7ZmlsZX0je3Nsb2cuZmlsZXNlcH0je21ldGh9I3tzbG9nLm1ldGhzZXB9I3tzfVwiXG4gICAgICAgIHBvc3QuZW1pdCAnc2xvZycsIHMsIGluZm9cbiAgICAgICAgaWYgc2xvZy51ZHBcbiAgICAgICAgICAgIHVkcExvZyBpbmZvXG4gICAgICAgICAgICBcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcG9zdC5lbWl0ICdzbG9nJywgXCIhI3tzbG9nLm1ldGhzZXB9I3tzfSAje2Vycn1cIlxuXG5sb2cgPSAtPlxuICAgIFxuICAgIHMgPSAoc3RyKHMpIGZvciBzIGluIFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwKS5qb2luIFwiIFwiIFxuICAgIFxuICAgIHBvc3QuZW1pdCAnbG9nJywgc1xuICAgIGNvbnNvbGUubG9nIHNcbiAgICBzbG9nIHNcblxuc2xvZy51ZHAgICAgID0gdHJ1ZVxuc2xvZy5pZCAgICAgID0gJ2t4aydcbnNsb2cuaWNvbiAgICA9IGlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInIHRoZW4gJ/CfnocnIGVsc2UgJ+KsoidcbnNsb2cuZGVwdGggICA9IDJcbnNsb2cuZmlsZXNlcCA9ICcgPiAnICMnIOKmvyAnXG5zbG9nLm1ldGhzZXAgPSAnID4+ICcgIycg4pa4ICdcbnNsb2cuZmlsZXBhZCA9IDMwXG5zbG9nLm1ldGhwYWQgPSAxNVxubG9nLnNsb2cgICAgID0gc2xvZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ1xuXG4iXX0=
//# sourceURL=C:/Users/kodi/s/kxk/coffee/log.coffee