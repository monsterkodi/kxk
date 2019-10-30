// koffee 1.4.0

/*
00000000   00000000   00000000  00000000   0000000
000   000  000   000  000       000       000     
00000000   0000000    0000000   000000    0000000 
000        000   000  000       000            000
000        000   000  00000000  000       0000000
 */
var Prefs, _, fs, klog, ref, slash, store;

ref = require('./kxk'), store = ref.store, slash = ref.slash, klog = ref.klog, fs = ref.fs, _ = ref._;

Prefs = (function() {
    function Prefs() {}

    Prefs.store = null;

    Prefs.watcher = null;

    Prefs.init = function(opt) {
        if (opt == null) {
            opt = {};
        }
        if (this.store != null) {
            return console.error('prefs.init -- duplicate stores?');
        }
        this.store = new store('prefs', opt);
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
            return _.cloneDeep(value);
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

    Prefs.toggle = function(key, cb) {
        var val;
        val = !this.get(key, false);
        this.set(key, val);
        return typeof cb === "function" ? cb(val) : void 0;
    };

    Prefs.apply = function(key, deflt, cb) {
        if (deflt == null) {
            deflt = false;
        }
        if ((cb == null) && deflt !== false) {
            cb = deflt;
        }
        return typeof cb === "function" ? cb(this.get(key, deflt)) : void 0;
    };

    return Prefs;

})();

module.exports = Prefs;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZnMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQWdDLE9BQUEsQ0FBUSxPQUFSLENBQWhDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQixlQUFoQixFQUFzQixXQUF0QixFQUEwQjs7QUFFcEI7OztJQUVGLEtBQUMsQ0FBQSxLQUFELEdBQVc7O0lBQ1gsS0FBQyxDQUFBLE9BQUQsR0FBVzs7SUFFWCxLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsR0FBRDs7WUFBQyxNQUFJOztRQUVSLElBQWtELGtCQUFsRDtBQUFBLG1CQUFLLE9BQUEsQ0FBRSxLQUFGLENBQVEsaUNBQVIsRUFBTDs7UUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksS0FBSixDQUFVLE9BQVYsRUFBa0IsR0FBbEI7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxVQUFWLEVBQXFCLElBQUMsQ0FBQSxPQUF0QjtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFNBQVYsRUFBcUIsSUFBQyxDQUFBLEtBQXRCO2VBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQU5HOztJQVFQLEtBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxJQUFjLHVCQUFkO0FBQUEsbUJBQUE7OztnQkFFUSxDQUFFLEtBQVYsQ0FBQTs7ZUFDQSxLQUFDLENBQUEsT0FBRCxHQUFXO0lBTEw7O0lBT1YsS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFBO1FBRUosSUFBYyx1QkFBZDtBQUFBLG1CQUFBOztRQUVBLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFuQjtRQUVBLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFDQSxLQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxLQUFILENBQVMsS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFoQjtlQUNYLEtBQUMsQ0FBQSxPQUNHLENBQUMsRUFETCxDQUNRLFFBRFIsRUFDaUIsS0FBQyxDQUFBLFlBRGxCLENBRUksQ0FBQyxFQUZMLENBRVEsUUFGUixFQUVpQixLQUFDLENBQUEsWUFGbEIsQ0FHSSxDQUFDLEVBSEwsQ0FHUSxPQUhSLEVBR2lCLFNBQUMsR0FBRDttQkFBTyxPQUFBLENBQUUsS0FBRixDQUFRLG1CQUFSLEVBQTRCLEdBQTVCO1FBQVAsQ0FIakI7SUFSSTs7SUFhUixLQUFDLENBQUEsWUFBRCxHQUFlLFNBQUE7ZUFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQTtJQUFIOztJQUNmLEtBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQTtRQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7ZUFBWSxLQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQUFmOztJQUVmLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxHQUFELEVBQU0sS0FBTjtRQUFnQixJQUFHLElBQUMsQ0FBQSxLQUFKO21CQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLEdBQVgsRUFBZ0IsS0FBaEIsRUFBZjtTQUFBLE1BQUE7bUJBQTJDLENBQUMsQ0FBQyxTQUFGLENBQVksS0FBWixFQUEzQzs7SUFBaEI7O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQWdCLElBQUMsQ0FBQSxPQUFELENBQUE7UUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEtBQWhCO2VBQXdCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFBcEQ7O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQWdCLElBQUMsQ0FBQSxPQUFELENBQUE7UUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYO2VBQWlCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFBN0M7O0lBQ1AsS0FBQyxDQUFBLElBQUQsR0FBb0IsU0FBQTtBQUFHLFlBQUE7aURBQU0sQ0FBRSxJQUFSLENBQUE7SUFBSDs7SUFFcEIsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLEdBQUQsRUFBTSxFQUFOO0FBQ0wsWUFBQTtRQUFBLEdBQUEsR0FBTSxDQUFJLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxFQUFVLEtBQVY7UUFDVixJQUFDLENBQUEsR0FBRCxDQUFLLEdBQUwsRUFBVSxHQUFWOzBDQUNBLEdBQUk7SUFIQzs7SUFLVCxLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBbUIsRUFBbkI7O1lBQU0sUUFBTTs7UUFDaEIsSUFBTyxZQUFKLElBQVksS0FBQSxLQUFTLEtBQXhCO1lBQ0ksRUFBQSxHQUFLLE1BRFQ7OzBDQUVBLEdBQUksSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEVBQVUsS0FBVjtJQUhBOzs7Ozs7QUFLWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgXG4jIyNcblxueyBzdG9yZSwgc2xhc2gsIGtsb2csIGZzLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgUHJlZnNcbiAgICBcbiAgICBAc3RvcmUgICA9IG51bGxcbiAgICBAd2F0Y2hlciA9IG51bGxcbiAgICBcbiAgICBAaW5pdDogKG9wdD17fSkgLT5cblxuICAgICAgICByZXR1cm4gZXJyb3IgJ3ByZWZzLmluaXQgLS0gZHVwbGljYXRlIHN0b3Jlcz8nIGlmIEBzdG9yZT9cbiAgICAgICAgQHN0b3JlID0gbmV3IHN0b3JlICdwcmVmcycgb3B0XG4gICAgICAgIEBzdG9yZS5vbiAnd2lsbFNhdmUnIEB1bndhdGNoXG4gICAgICAgIEBzdG9yZS5vbiAnZGlkU2F2ZScgIEB3YXRjaFxuICAgICAgICBAd2F0Y2goKSBcbiAgICAgIFxuICAgIEB1bndhdGNoOiA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAc3RvcmUuYXBwP1xuICAgICAgICBcbiAgICAgICAgQHdhdGNoZXI/LmNsb3NlKClcbiAgICAgICAgQHdhdGNoZXIgPSBudWxsXG4gICAgICAgIFxuICAgIEB3YXRjaDogPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQHN0b3JlLmFwcD9cbiAgICAgICAgXG4gICAgICAgIHNsYXNoLnRvdWNoIEBzdG9yZS5maWxlXG4gICAgICAgIFxuICAgICAgICBAdW53YXRjaCgpXG4gICAgICAgIEB3YXRjaGVyID0gZnMud2F0Y2ggQHN0b3JlLmZpbGVcbiAgICAgICAgQHdhdGNoZXJcbiAgICAgICAgICAgIC5vbiAnY2hhbmdlJyBAb25GaWxlQ2hhbmdlXG4gICAgICAgICAgICAub24gJ3JlbmFtZScgQG9uRmlsZVVubGlua1xuICAgICAgICAgICAgLm9uICdlcnJvcicgIChlcnIpIC0+IGVycm9yICdQcmVmcyB3YXRjaCBlcnJvcicgZXJyXG4gICAgICAgIFxuICAgIEBvbkZpbGVDaGFuZ2U6ID0+IEBzdG9yZS5yZWxvYWQoKVxuICAgIEBvbkZpbGVVbmxpbms6ID0+IEB1bndhdGNoKCk7IEBzdG9yZS5jbGVhcigpXG4gICAgICAgICAgICBcbiAgICBAZ2V0OiAgKGtleSwgdmFsdWUpIC0+IGlmIEBzdG9yZSB0aGVuIEBzdG9yZS5nZXQoa2V5LCB2YWx1ZSkgZWxzZSBfLmNsb25lRGVlcCB2YWx1ZVxuICAgIEBzZXQ6ICAoa2V5LCB2YWx1ZSkgLT4gQHVud2F0Y2goKTsgQHN0b3JlLnNldChrZXksIHZhbHVlKTsgQHdhdGNoKClcbiAgICBAZGVsOiAgKGtleSwgdmFsdWUpIC0+IEB1bndhdGNoKCk7IEBzdG9yZS5kZWwoa2V5KTsgQHdhdGNoKClcbiAgICBAc2F2ZTogICAgICAgICAgICAgIC0+IEBzdG9yZT8uc2F2ZSgpXG4gICAgXG4gICAgQHRvZ2dsZTogKGtleSwgY2IpIC0+IFxuICAgICAgICB2YWwgPSBub3QgQGdldCBrZXksIGZhbHNlXG4gICAgICAgIEBzZXQga2V5LCB2YWxcbiAgICAgICAgY2I/IHZhbFxuICAgICAgICBcbiAgICBAYXBwbHk6IChrZXksIGRlZmx0PWZhbHNlLCBjYikgLT5cbiAgICAgICAgaWYgbm90IGNiPyBhbmQgZGVmbHQgIT0gZmFsc2VcbiAgICAgICAgICAgIGNiID0gZGVmbHRcbiAgICAgICAgY2I/IEBnZXQga2V5LCBkZWZsdFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUHJlZnNcbiJdfQ==
//# sourceURL=../coffee/prefs.coffee