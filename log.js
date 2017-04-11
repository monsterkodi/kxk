(function() {
  var log, post, process, ref, sorcery, stack, str, sutil, unresolve;

  ref = require('./kxk'), unresolve = ref.unresolve, str = ref.str, post = ref.post;

  sutil = require('stack-utils');

  process = require('process');

  sorcery = require('sorcery');

  stack = new sutil({
    cwd: process.cwd(),
    internals: sutil.nodeInternals()
  });

  log = function() {
    var err, f, l, m, n, p, ref1, ref2, s;
    s = ((function() {
      var i, len, ref1, results;
      ref1 = [].slice.call(arguments, 0);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        s = ref1[i];
        results.push(str(s));
      }
      return results;
    }).apply(this, arguments)).join(" ");
    post.emit('log', s);
    console.log(s);
    try {
      f = stack.capture(2)[1];
      l = sorcery.loadSync(f.getFileName()).trace(f.getLineNumber(), f.getFunctionName());
      p = unresolve((ref1 = l != null ? l.source : void 0) != null ? ref1 : f.getFileName());
      n = (ref2 = l != null ? l.line : void 0) != null ? ref2 : f.getLineNumber();
      m = f.getFunctionName();
      s = p + ":" + n + " ⦿ " + m + " ▸ " + s;
      return post.emit('slog', s);
    } catch (error) {
      err = error;
      return post.emit('slog', " ▸ " + s + " " + err);
    }
  };

  module.exports = log;

}).call(this);

