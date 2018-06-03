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
        debug: slog.udpDebug
      });
    }
    info.id = slog.id;
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

  slog.depth = 2;

  slog.filesep = ' > '; //' ⦿ '

  slog.methsep = ' >> '; //' ▸ '

  slog.filepad = 30;

  slog.methpad = 15;

  log.slog = slog;

  module.exports = log;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBOztFQVFBLElBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLE9BQVI7O0VBQ1YsRUFBQSxHQUFVLE9BQUEsQ0FBUSxJQUFSOztFQUNWLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7RUFDVixDQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0VBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSOztFQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFFVixLQUFBLEdBQVUsSUFBSSxLQUFKLENBQVU7SUFBQSxHQUFBLEVBQUssT0FBTyxDQUFDLEdBQVIsQ0FBQSxDQUFMO0lBQW9CLFNBQUEsRUFBVyxLQUFLLENBQUMsYUFBTixDQUFBO0VBQS9CLENBQVY7O0VBRVYsT0FBQSxHQUFVOztFQUNWLE1BQUEsR0FBUyxRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ0wsUUFBQTtJQUFBLElBQUcsQ0FBSSxPQUFQO01BQ0ksR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSO01BQ04sT0FBQSxHQUFVLElBQUksR0FBSixDQUFRO1FBQUEsS0FBQSxFQUFNLElBQUksQ0FBQztNQUFYLENBQVIsRUFGZDs7SUFHQSxJQUFJLENBQUMsRUFBTCxHQUFVLElBQUksQ0FBQztXQUNmLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYjtFQUxLOztFQU9ULElBQUEsR0FBTyxRQUFBLENBQUMsQ0FBRCxDQUFBO0FBRUgsUUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFB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QUFJLENBQUMsR0FBTCxHQUFlOztFQUNmLElBQUksQ0FBQyxFQUFMLEdBQWU7O0VBQ2YsSUFBSSxDQUFDLEtBQUwsR0FBZTs7RUFDZixJQUFJLENBQUMsT0FBTCxHQUFlLE1BckVmOztFQXNFQSxJQUFJLENBQUMsT0FBTCxHQUFlLE9BdEVmOztFQXVFQSxJQUFJLENBQUMsT0FBTCxHQUFlOztFQUNmLElBQUksQ0FBQyxPQUFMLEdBQWU7O0VBQ2YsR0FBRyxDQUFDLElBQUosR0FBZTs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTNFakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbjAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDBcbjAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbiMjI1xuXG5wb3N0ICAgID0gcmVxdWlyZSAnLi9wcG9zdCcgXG5zdHIgICAgID0gcmVxdWlyZSAnLi9zdHInXG5vcyAgICAgID0gcmVxdWlyZSAnb3MnXG5mcyAgICAgID0gcmVxdWlyZSAnZnMnXG5fICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuc3V0aWwgICA9IHJlcXVpcmUgJ3N0YWNrLXV0aWxzJ1xuc29yY2VyeSA9IHJlcXVpcmUgJ3NvcmNlcnknXG5cbnN0YWNrICAgPSBuZXcgc3V0aWwgY3dkOiBwcm9jZXNzLmN3ZCgpLCBpbnRlcm5hbHM6IHN1dGlsLm5vZGVJbnRlcm5hbHMoKVxuXG51ZHBTZW5kID0gbnVsbFxudWRwTG9nID0gKGluZm8pIC0+XG4gICAgaWYgbm90IHVkcFNlbmRcbiAgICAgICAgdWRwID0gcmVxdWlyZSAnLi91ZHAnXG4gICAgICAgIHVkcFNlbmQgPSBuZXcgdWRwIGRlYnVnOnNsb2cudWRwRGVidWdcbiAgICBpbmZvLmlkID0gc2xvZy5pZFxuICAgIHVkcFNlbmQuc2VuZCBpbmZvXG5cbnNsb2cgPSAocykgLT5cbiAgICBcbiAgICBzbGFzaCA9IHJlcXVpcmUgJy4vc2xhc2gnXG4gICAgXG4gICAgdHJ5ICMgZmFuY3kgbG9nIHdpdGggc291cmNlLW1hcHBlZCBmaWxlcyBhbmQgbGluZSBudW1iZXJzXG4gICAgICAgIGYgPSBzdGFjay5jYXB0dXJlKClbc2xvZy5kZXB0aF1cbiAgICAgICAgaWYgY2hhaW4gPSBzb3JjZXJ5LmxvYWRTeW5jKGYuZ2V0RmlsZU5hbWUoKSlcbiAgICAgICAgICAgIGluZm8gICA9IGNoYWluLnRyYWNlKGYuZ2V0TGluZU51bWJlcigpLCAwKVxuICAgICAgICAgICAgc291cmNlID0gZi5nZXRGaWxlTmFtZSgpXG4gICAgICAgICAgICBpZiBub3Qgc2xhc2guc2FtZVBhdGggZi5nZXRTY3JpcHROYW1lT3JTb3VyY2VVUkwoKSwgZi5nZXRGaWxlTmFtZSgpXG4gICAgICAgICAgICAgICAgc291cmNlID0gc2xhc2gucGF0aCBmLmdldFNjcmlwdE5hbWVPclNvdXJjZVVSTCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc291cmNlVGV4dCA9IGZzLnJlYWRGaWxlU3luYyBmLmdldEZpbGVOYW1lKCksICd1dGY4J1xuICAgICAgICAgICAgICAgICMgYmFsYW5jZXIgaXMgYnJva2VuLiBiZWxvdyBpcyBub3QgYSBjb21tZW50LiBzaG91bGQgaGFuZGxlIGVzY2FwZWQgaGFzaCBzaWducy4gXG4gICAgICAgICAgICAgICAgbWF0Y2ggID0gc291cmNlVGV4dC5tYXRjaCAvXFwvXFwvXFwjIHNvdXJjZVVSTD0oLispJC9cbiAgICAgICAgICAgICAgICBpZiBtYXRjaD9bMV0/XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IG1hdGNoP1sxXVxuICAgICAgICAgICAgaW5mby5zb3VyY2UgPSBzbGFzaC50aWxkZSBzb3VyY2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaW5mbyA9IHNvdXJjZTogc2xhc2gudGlsZGUoZi5nZXRGaWxlTmFtZSgpKSwgbGluZTogZi5nZXRMaW5lTnVtYmVyKClcblxuICAgICAgICBmaWxlID0gXy5wYWRTdGFydCBcIiN7aW5mby5zb3VyY2V9OiN7aW5mby5saW5lfVwiLCBzbG9nLmZpbGVwYWRcbiAgICAgICAgbWV0aCA9IF8ucGFkRW5kIGYuZ2V0RnVuY3Rpb25OYW1lKCksIHNsb2cubWV0aHBhZFxuICAgICAgICBpbmZvLnN0ciA9IHNcbiAgICAgICAgcyA9IFwiI3tmaWxlfSN7c2xvZy5maWxlc2VwfSN7bWV0aH0je3Nsb2cubWV0aHNlcH0je3N9XCJcbiAgICAgICAgcG9zdC5lbWl0ICdzbG9nJywgcywgaW5mb1xuICAgICAgICBpZiBzbG9nLnVkcFxuICAgICAgICAgICAgdWRwTG9nIGluZm9cbiAgICAgICAgICAgIFxuICAgIGNhdGNoIGVyclxuICAgICAgICBwb3N0LmVtaXQgJ3Nsb2cnLCBcIiEje3Nsb2cubWV0aHNlcH0je3N9ICN7ZXJyfVwiXG5cbmxvZyA9IC0+XG4gICAgXG4gICAgcyA9IChzdHIocykgZm9yIHMgaW4gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDApLmpvaW4gXCIgXCIgXG4gICAgXG4gICAgcG9zdC5lbWl0ICdsb2cnLCBzXG4gICAgY29uc29sZS5sb2cgc1xuICAgIHNsb2cgc1xuXG5zbG9nLnVkcCAgICAgPSB0cnVlXG5zbG9nLmlkICAgICAgPSAna3hrJ1xuc2xvZy5kZXB0aCAgID0gMlxuc2xvZy5maWxlc2VwID0gJyA+ICcgIycg4qa/ICdcbnNsb2cubWV0aHNlcCA9ICcgPj4gJyAjJyDilrggJ1xuc2xvZy5maWxlcGFkID0gMzBcbnNsb2cubWV0aHBhZCA9IDE1XG5sb2cuc2xvZyAgICAgPSBzbG9nXG5cbm1vZHVsZS5leHBvcnRzID0gbG9nXG5cbiJdfQ==
//# sourceURL=C:/Users/kodi/s/kxk/coffee/log.coffee