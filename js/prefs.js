// koffee 1.19.0

/*
00000000   00000000   00000000  00000000   0000000
000   000  000   000  000       000       000     
00000000   0000000    0000000   000000    0000000 
000        000   000  000       000            000
000        000   000  00000000  000       0000000
 */
var Prefs, _, fs, kerror, klog, ref, slash, store;

ref = require('./kxk'), store = ref.store, slash = ref.slash, klog = ref.klog, kerror = ref.kerror, fs = ref.fs, _ = ref._;

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
        slash.error = klog;
        if (slash.touch(Prefs.store.file)) {
            Prefs.unwatch();
            Prefs.watcher = fs.watch(Prefs.store.file);
            return Prefs.watcher.on('change', Prefs.onFileChange).on('rename', Prefs.onFileUnlink).on('error', function(err) {
                return kerror('Prefs watch error', err);
            });
        } else {
            return kerror("can't touch prefs file " + Prefs.store.file);
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZnMuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcmVmcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBd0MsT0FBQSxDQUFRLE9BQVIsQ0FBeEMsRUFBRSxpQkFBRixFQUFTLGlCQUFULEVBQWdCLGVBQWhCLEVBQXNCLG1CQUF0QixFQUE4QixXQUE5QixFQUFrQzs7QUFFNUI7OztJQUVGLEtBQUMsQ0FBQSxLQUFELEdBQVc7O0lBQ1gsS0FBQyxDQUFBLE9BQUQsR0FBVzs7SUFFWCxLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsR0FBRDs7WUFBQyxNQUFJOztRQUVSLElBQWtELGtCQUFsRDtBQUFBLG1CQUFLLE9BQUEsQ0FBRSxLQUFGLENBQVEsaUNBQVIsRUFBTDs7UUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksS0FBSixDQUFVLE9BQVYsRUFBa0IsR0FBbEI7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxVQUFWLEVBQXFCLElBQUMsQ0FBQSxPQUF0QjtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFNBQVYsRUFBcUIsSUFBQyxDQUFBLEtBQXRCO2VBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQU5HOztJQVFQLEtBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxJQUFjLHVCQUFkO0FBQUEsbUJBQUE7OztnQkFFUSxDQUFFLEtBQVYsQ0FBQTs7ZUFDQSxLQUFDLENBQUEsT0FBRCxHQUFXO0lBTEw7O0lBT1YsS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFBO1FBRUosSUFBYyx1QkFBZDtBQUFBLG1CQUFBOztRQUVBLEtBQUssQ0FBQyxLQUFOLEdBQWM7UUFDZCxJQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFuQixDQUFIO1lBRUksS0FBQyxDQUFBLE9BQUQsQ0FBQTtZQUNBLEtBQUMsQ0FBQSxPQUFELEdBQVcsRUFBRSxDQUFDLEtBQUgsQ0FBUyxLQUFDLENBQUEsS0FBSyxDQUFDLElBQWhCO21CQUNYLEtBQUMsQ0FBQSxPQUNHLENBQUMsRUFETCxDQUNRLFFBRFIsRUFDaUIsS0FBQyxDQUFBLFlBRGxCLENBRUksQ0FBQyxFQUZMLENBRVEsUUFGUixFQUVpQixLQUFDLENBQUEsWUFGbEIsQ0FHSSxDQUFDLEVBSEwsQ0FHUSxPQUhSLEVBR2lCLFNBQUMsR0FBRDt1QkFBUyxNQUFBLENBQU8sbUJBQVAsRUFBMkIsR0FBM0I7WUFBVCxDQUhqQixFQUpKO1NBQUEsTUFBQTttQkFVSSxNQUFBLENBQU8seUJBQUEsR0FBMEIsS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUF4QyxFQVZKOztJQUxJOztJQWlCUixLQUFDLENBQUEsWUFBRCxHQUFlLFNBQUE7ZUFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQTtJQUFIOztJQUNmLEtBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQTtRQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7ZUFBWSxLQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQUFmOztJQUVmLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxHQUFELEVBQU0sS0FBTjtRQUFnQixJQUFHLElBQUMsQ0FBQSxLQUFKO21CQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLEdBQVgsRUFBZ0IsS0FBaEIsRUFBZjtTQUFBLE1BQUE7bUJBQTJDLENBQUMsQ0FBQyxTQUFGLENBQVksS0FBWixFQUEzQzs7SUFBaEI7O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQWdCLElBQUMsQ0FBQSxPQUFELENBQUE7UUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEtBQWhCO2VBQXdCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFBcEQ7O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQWdCLElBQUMsQ0FBQSxPQUFELENBQUE7UUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYO2VBQWlCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFBN0M7O0lBQ1AsS0FBQyxDQUFBLElBQUQsR0FBb0IsU0FBQTtBQUFHLFlBQUE7aURBQU0sQ0FBRSxJQUFSLENBQUE7SUFBSDs7SUFFcEIsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLEdBQUQsRUFBTSxFQUFOO0FBQ0wsWUFBQTtRQUFBLEdBQUEsR0FBTSxDQUFJLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxFQUFVLEtBQVY7UUFDVixJQUFDLENBQUEsR0FBRCxDQUFLLEdBQUwsRUFBVSxHQUFWOzBDQUNBLEdBQUk7SUFIQzs7SUFLVCxLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBbUIsRUFBbkI7O1lBQU0sUUFBTTs7UUFDaEIsSUFBTyxZQUFKLElBQVksS0FBQSxLQUFTLEtBQXhCO1lBQ0ksRUFBQSxHQUFLLE1BRFQ7OzBDQUVBLEdBQUksSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEVBQVUsS0FBVjtJQUhBOzs7Ozs7QUFLWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgXG4jIyNcblxueyBzdG9yZSwgc2xhc2gsIGtsb2csIGtlcnJvciwgZnMsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBQcmVmc1xuICAgIFxuICAgIEBzdG9yZSAgID0gbnVsbFxuICAgIEB3YXRjaGVyID0gbnVsbFxuICAgIFxuICAgIEBpbml0OiAob3B0PXt9KSAtPlxuXG4gICAgICAgIHJldHVybiBlcnJvciAncHJlZnMuaW5pdCAtLSBkdXBsaWNhdGUgc3RvcmVzPycgaWYgQHN0b3JlP1xuICAgICAgICBAc3RvcmUgPSBuZXcgc3RvcmUgJ3ByZWZzJyBvcHRcbiAgICAgICAgQHN0b3JlLm9uICd3aWxsU2F2ZScgQHVud2F0Y2hcbiAgICAgICAgQHN0b3JlLm9uICdkaWRTYXZlJyAgQHdhdGNoXG4gICAgICAgIEB3YXRjaCgpIFxuICAgICAgXG4gICAgQHVud2F0Y2g6ID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBzdG9yZS5hcHA/XG4gICAgICAgIFxuICAgICAgICBAd2F0Y2hlcj8uY2xvc2UoKVxuICAgICAgICBAd2F0Y2hlciA9IG51bGxcbiAgICAgICAgXG4gICAgQHdhdGNoOiA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAc3RvcmUuYXBwP1xuICAgICAgICBcbiAgICAgICAgc2xhc2guZXJyb3IgPSBrbG9nXG4gICAgICAgIGlmIHNsYXNoLnRvdWNoIEBzdG9yZS5maWxlXG4gICAgICAgIFxuICAgICAgICAgICAgQHVud2F0Y2goKVxuICAgICAgICAgICAgQHdhdGNoZXIgPSBmcy53YXRjaCBAc3RvcmUuZmlsZVxuICAgICAgICAgICAgQHdhdGNoZXJcbiAgICAgICAgICAgICAgICAub24gJ2NoYW5nZScgQG9uRmlsZUNoYW5nZVxuICAgICAgICAgICAgICAgIC5vbiAncmVuYW1lJyBAb25GaWxlVW5saW5rXG4gICAgICAgICAgICAgICAgLm9uICdlcnJvcicgIChlcnIpIC0+IGtlcnJvciAnUHJlZnMgd2F0Y2ggZXJyb3InIGVyclxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBrZXJyb3IgXCJjYW4ndCB0b3VjaCBwcmVmcyBmaWxlICN7QHN0b3JlLmZpbGV9XCJcbiAgICAgICAgXG4gICAgQG9uRmlsZUNoYW5nZTogPT4gQHN0b3JlLnJlbG9hZCgpXG4gICAgQG9uRmlsZVVubGluazogPT4gQHVud2F0Y2goKTsgQHN0b3JlLmNsZWFyKClcbiAgICAgICAgICAgIFxuICAgIEBnZXQ6ICAoa2V5LCB2YWx1ZSkgLT4gaWYgQHN0b3JlIHRoZW4gQHN0b3JlLmdldChrZXksIHZhbHVlKSBlbHNlIF8uY2xvbmVEZWVwIHZhbHVlXG4gICAgQHNldDogIChrZXksIHZhbHVlKSAtPiBAdW53YXRjaCgpOyBAc3RvcmUuc2V0KGtleSwgdmFsdWUpOyBAd2F0Y2goKVxuICAgIEBkZWw6ICAoa2V5LCB2YWx1ZSkgLT4gQHVud2F0Y2goKTsgQHN0b3JlLmRlbChrZXkpOyBAd2F0Y2goKVxuICAgIEBzYXZlOiAgICAgICAgICAgICAgLT4gQHN0b3JlPy5zYXZlKClcbiAgICBcbiAgICBAdG9nZ2xlOiAoa2V5LCBjYikgLT4gXG4gICAgICAgIHZhbCA9IG5vdCBAZ2V0IGtleSwgZmFsc2VcbiAgICAgICAgQHNldCBrZXksIHZhbFxuICAgICAgICBjYj8gdmFsXG4gICAgICAgIFxuICAgIEBhcHBseTogKGtleSwgZGVmbHQ9ZmFsc2UsIGNiKSAtPlxuICAgICAgICBpZiBub3QgY2I/IGFuZCBkZWZsdCAhPSBmYWxzZVxuICAgICAgICAgICAgY2IgPSBkZWZsdFxuICAgICAgICBjYj8gQGdldCBrZXksIGRlZmx0XG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQcmVmc1xuIl19
//# sourceURL=../coffee/prefs.coffee