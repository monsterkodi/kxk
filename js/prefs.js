// koffee 0.56.0

/*
00000000   00000000   00000000  00000000   0000000
000   000  000   000  000       000       000     
00000000   0000000    0000000   000000    0000000 
000        000   000  000       000            000
000        000   000  00000000  000       0000000
 */
var Prefs, fs, ref, slash, store;

ref = require('./kxk'), store = ref.store, slash = ref.slash, fs = ref.fs;

Prefs = (function() {
    function Prefs() {}

    Prefs.store = null;

    Prefs.watcher = null;

    Prefs.init = function(defs) {
        if (defs == null) {
            defs = {};
        }
        if (this.store != null) {
            return console.error('prefs.init -- duplicate stores?');
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
        slash.touch(Prefs.store.file);
        Prefs.unwatch();
        Prefs.watcher = fs.watch(Prefs.store.file);
        return Prefs.watcher.on('change', Prefs.onFileChange).on('rename', Prefs.onFileUnlink).on('error', function(err) {
            return console.error('Prefs watch error', err);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZnMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXVCLE9BQUEsQ0FBUSxPQUFSLENBQXZCLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQjs7QUFFVjs7O0lBRUYsS0FBQyxDQUFBLEtBQUQsR0FBVzs7SUFDWCxLQUFDLENBQUEsT0FBRCxHQUFXOztJQUVYLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxJQUFEOztZQUFDLE9BQUs7O1FBRVQsSUFBa0Qsa0JBQWxEO0FBQUEsbUJBQUssT0FBQSxDQUFFLEtBQUYsQ0FBUSxpQ0FBUixFQUFMOztRQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxLQUFKLENBQVUsT0FBVixFQUFtQjtZQUFBLFFBQUEsRUFBUyxJQUFUO1NBQW5CO1FBQ1QsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsVUFBVixFQUFzQixJQUFDLENBQUEsT0FBdkI7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQXNCLElBQUMsQ0FBQSxLQUF2QjtlQUNBLElBQUMsQ0FBQSxLQUFELENBQUE7SUFORzs7SUFRUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsSUFBYyx1QkFBZDtBQUFBLG1CQUFBOzs7Z0JBRVEsQ0FBRSxLQUFWLENBQUE7O2VBQ0EsS0FBQyxDQUFBLE9BQUQsR0FBVztJQUxMOztJQU9WLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQTtRQUVKLElBQWMsdUJBQWQ7QUFBQSxtQkFBQTs7UUFFQSxLQUFLLENBQUMsS0FBTixDQUFZLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBbkI7UUFFQSxLQUFDLENBQUEsT0FBRCxDQUFBO1FBQ0EsS0FBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsS0FBSCxDQUFTLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBaEI7ZUFDWCxLQUFDLENBQUEsT0FDRyxDQUFDLEVBREwsQ0FDUSxRQURSLEVBQ2tCLEtBQUMsQ0FBQSxZQURuQixDQUVJLENBQUMsRUFGTCxDQUVRLFFBRlIsRUFFa0IsS0FBQyxDQUFBLFlBRm5CLENBR0ksQ0FBQyxFQUhMLENBR1EsT0FIUixFQUdrQixTQUFDLEdBQUQ7bUJBQU8sT0FBQSxDQUFFLEtBQUYsQ0FBUSxtQkFBUixFQUE2QixHQUE3QjtRQUFQLENBSGxCO0lBUkk7O0lBYVIsS0FBQyxDQUFBLFlBQUQsR0FBZSxTQUFBO2VBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUE7SUFBSDs7SUFDZixLQUFDLENBQUEsWUFBRCxHQUFlLFNBQUE7UUFBRyxLQUFDLENBQUEsT0FBRCxDQUFBO2VBQVksS0FBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUE7SUFBZjs7SUFFZixLQUFDLENBQUEsR0FBRCxHQUFPLFNBQUMsR0FBRCxFQUFNLEtBQU47UUFBZ0IsSUFBRyxJQUFDLENBQUEsS0FBSjttQkFBZSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEtBQWhCLEVBQWY7U0FBQSxNQUFBO21CQUEwQyxNQUExQzs7SUFBaEI7O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQWdCLElBQUMsQ0FBQSxPQUFELENBQUE7UUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEtBQWhCO2VBQXdCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFBcEQ7O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQWdCLElBQUMsQ0FBQSxPQUFELENBQUE7UUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYO2VBQWlCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFBN0M7O0lBQ1AsS0FBQyxDQUFBLElBQUQsR0FBb0IsU0FBQTtBQUFHLFlBQUE7aURBQU0sQ0FBRSxJQUFSLENBQUE7SUFBSDs7Ozs7O0FBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCBcbiMjI1xuXG57IHN0b3JlLCBzbGFzaCwgZnMgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBQcmVmc1xuICAgIFxuICAgIEBzdG9yZSAgID0gbnVsbFxuICAgIEB3YXRjaGVyID0gbnVsbFxuICAgIFxuICAgIEBpbml0OiAoZGVmcz17fSkgLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZXJyb3IgJ3ByZWZzLmluaXQgLS0gZHVwbGljYXRlIHN0b3Jlcz8nIGlmIEBzdG9yZT9cbiAgICAgICAgQHN0b3JlID0gbmV3IHN0b3JlICdwcmVmcycsIGRlZmF1bHRzOmRlZnNcbiAgICAgICAgQHN0b3JlLm9uICd3aWxsU2F2ZScsIEB1bndhdGNoXG4gICAgICAgIEBzdG9yZS5vbiAnZGlkU2F2ZScsICBAd2F0Y2hcbiAgICAgICAgQHdhdGNoKCkgXG4gICAgICBcbiAgICBAdW53YXRjaDogPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQHN0b3JlLmFwcD9cbiAgICAgICAgXG4gICAgICAgIEB3YXRjaGVyPy5jbG9zZSgpXG4gICAgICAgIEB3YXRjaGVyID0gbnVsbFxuICAgICAgICBcbiAgICBAd2F0Y2g6ID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBzdG9yZS5hcHA/XG4gICAgICAgIFxuICAgICAgICBzbGFzaC50b3VjaCBAc3RvcmUuZmlsZVxuICAgICAgICBcbiAgICAgICAgQHVud2F0Y2goKVxuICAgICAgICBAd2F0Y2hlciA9IGZzLndhdGNoIEBzdG9yZS5maWxlXG4gICAgICAgIEB3YXRjaGVyXG4gICAgICAgICAgICAub24gJ2NoYW5nZScsIEBvbkZpbGVDaGFuZ2VcbiAgICAgICAgICAgIC5vbiAncmVuYW1lJywgQG9uRmlsZVVubGlua1xuICAgICAgICAgICAgLm9uICdlcnJvcicgLCAoZXJyKSAtPiBlcnJvciAnUHJlZnMgd2F0Y2ggZXJyb3InLCBlcnJcbiAgICAgICAgXG4gICAgQG9uRmlsZUNoYW5nZTogPT4gQHN0b3JlLnJlbG9hZCgpXG4gICAgQG9uRmlsZVVubGluazogPT4gQHVud2F0Y2goKTsgQHN0b3JlLmNsZWFyKClcbiAgICAgICAgICAgIFxuICAgIEBnZXQ6ICAoa2V5LCB2YWx1ZSkgLT4gaWYgQHN0b3JlIHRoZW4gQHN0b3JlLmdldCBrZXksIHZhbHVlIGVsc2UgdmFsdWVcbiAgICBAc2V0OiAgKGtleSwgdmFsdWUpIC0+IEB1bndhdGNoKCk7IEBzdG9yZS5zZXQoa2V5LCB2YWx1ZSk7IEB3YXRjaCgpXG4gICAgQGRlbDogIChrZXksIHZhbHVlKSAtPiBAdW53YXRjaCgpOyBAc3RvcmUuZGVsKGtleSk7IEB3YXRjaCgpXG4gICAgQHNhdmU6ICAgICAgICAgICAgICAtPiBAc3RvcmU/LnNhdmUoKVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUHJlZnNcbiJdfQ==
//# sourceURL=../coffee/prefs.coffee