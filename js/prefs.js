// Generated by CoffeeScript 1.12.7

/*
00000000   00000000   00000000  00000000   0000000
000   000  000   000  000       000       000     
00000000   0000000    0000000   000000    0000000 
000        000   000  000       000            000
000        000   000  00000000  000       0000000
 */

(function() {
  var Prefs, error, log, ref, store, watch;

  ref = require('./kxk'), store = ref.store, watch = ref.watch, error = ref.error, log = ref.log;

  Prefs = (function() {
    function Prefs() {}

    Prefs.store = null;

    Prefs.watcher = null;

    Prefs.init = function(defs) {
      if (defs == null) {
        defs = {};
      }
      if (this.store != null) {
        return error('prefs.init -- duplicate stores?');
      }
      this.store = new store('prefs', {
        defaults: defs
      });
      this.store.on('willSave', this.unwatch);
      this.store.on('didSave', this.watch);
      return this.watch();
    };

    Prefs.unwatch = function() {
      var ref1;
      if (Prefs.store.app == null) {
        return;
      }
      if ((ref1 = Prefs.watcher) != null) {
        ref1.close();
      }
      return Prefs.watcher = null;
    };

    Prefs.watch = function() {
      if (Prefs.store.app == null) {
        return;
      }
      Prefs.unwatch();
      Prefs.watcher = watch.watch(Prefs.store.file, {
        ignoreInitial: true,
        usePolling: false,
        useFsEvents: true
      });
      return Prefs.watcher.on('change', Prefs.onFileChange).on('unlink', Prefs.onFileUnlink).on('error', function(err) {
        return log('Prefs watch error', err);
      });
    };

    Prefs.onFileChange = function() {
      return Prefs.store.reload();
    };

    Prefs.onFileUnlink = function() {
      Prefs.unwatch();
      return Prefs.store.clear();
    };

    Prefs.get = function(key, value) {
      if (this.store) {
        return this.store.get(key, value);
      } else {
        return value;
      }
    };

    Prefs.set = function(key, value) {
      this.unwatch();
      this.store.set(key, value);
      return this.watch();
    };

    Prefs.del = function(key, value) {
      this.unwatch();
      this.store.del(key);
      return this.watch();
    };

    Prefs.save = function() {
      var ref1;
      return (ref1 = this.store) != null ? ref1.save() : void 0;
    };

    return Prefs;

  })();

  module.exports = Prefs;

}).call(this);
