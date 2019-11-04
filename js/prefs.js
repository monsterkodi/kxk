// koffee 1.4.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZnMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXdDLE9BQUEsQ0FBUSxPQUFSLENBQXhDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQixlQUFoQixFQUFzQixtQkFBdEIsRUFBOEIsV0FBOUIsRUFBa0M7O0FBRTVCOzs7SUFFRixLQUFDLENBQUEsS0FBRCxHQUFXOztJQUNYLEtBQUMsQ0FBQSxPQUFELEdBQVc7O0lBRVgsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLEdBQUQ7O1lBQUMsTUFBSTs7UUFFUixJQUFrRCxrQkFBbEQ7QUFBQSxtQkFBSyxPQUFBLENBQUUsS0FBRixDQUFRLGlDQUFSLEVBQUw7O1FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLEtBQUosQ0FBVSxPQUFWLEVBQWtCLEdBQWxCO1FBQ1QsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsVUFBVixFQUFxQixJQUFDLENBQUEsT0FBdEI7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLElBQUMsQ0FBQSxLQUF0QjtlQUNBLElBQUMsQ0FBQSxLQUFELENBQUE7SUFORzs7SUFRUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsSUFBYyx1QkFBZDtBQUFBLG1CQUFBOzs7Z0JBRVEsQ0FBRSxLQUFWLENBQUE7O2VBQ0EsS0FBQyxDQUFBLE9BQUQsR0FBVztJQUxMOztJQU9WLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQTtRQUVKLElBQWMsdUJBQWQ7QUFBQSxtQkFBQTs7UUFFQSxLQUFLLENBQUMsS0FBTixHQUFjO1FBQ2QsSUFBRyxLQUFLLENBQUMsS0FBTixDQUFZLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBbkIsQ0FBSDtZQUVJLEtBQUMsQ0FBQSxPQUFELENBQUE7WUFDQSxLQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxLQUFILENBQVMsS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFoQjttQkFDWCxLQUFDLENBQUEsT0FDRyxDQUFDLEVBREwsQ0FDUSxRQURSLEVBQ2lCLEtBQUMsQ0FBQSxZQURsQixDQUVJLENBQUMsRUFGTCxDQUVRLFFBRlIsRUFFaUIsS0FBQyxDQUFBLFlBRmxCLENBR0ksQ0FBQyxFQUhMLENBR1EsT0FIUixFQUdpQixTQUFDLEdBQUQ7dUJBQVMsTUFBQSxDQUFPLG1CQUFQLEVBQTJCLEdBQTNCO1lBQVQsQ0FIakIsRUFKSjtTQUFBLE1BQUE7bUJBVUksTUFBQSxDQUFPLHlCQUFBLEdBQTBCLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBeEMsRUFWSjs7SUFMSTs7SUFpQlIsS0FBQyxDQUFBLFlBQUQsR0FBZSxTQUFBO2VBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUE7SUFBSDs7SUFDZixLQUFDLENBQUEsWUFBRCxHQUFlLFNBQUE7UUFBRyxLQUFDLENBQUEsT0FBRCxDQUFBO2VBQVksS0FBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUE7SUFBZjs7SUFFZixLQUFDLENBQUEsR0FBRCxHQUFPLFNBQUMsR0FBRCxFQUFNLEtBQU47UUFBZ0IsSUFBRyxJQUFDLENBQUEsS0FBSjttQkFBZSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEtBQWhCLEVBQWY7U0FBQSxNQUFBO21CQUEyQyxDQUFDLENBQUMsU0FBRixDQUFZLEtBQVosRUFBM0M7O0lBQWhCOztJQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxHQUFELEVBQU0sS0FBTjtRQUFnQixJQUFDLENBQUEsT0FBRCxDQUFBO1FBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsR0FBWCxFQUFnQixLQUFoQjtlQUF3QixJQUFDLENBQUEsS0FBRCxDQUFBO0lBQXBEOztJQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxHQUFELEVBQU0sS0FBTjtRQUFnQixJQUFDLENBQUEsT0FBRCxDQUFBO1FBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsR0FBWDtlQUFpQixJQUFDLENBQUEsS0FBRCxDQUFBO0lBQTdDOztJQUNQLEtBQUMsQ0FBQSxJQUFELEdBQW9CLFNBQUE7QUFBRyxZQUFBO2lEQUFNLENBQUUsSUFBUixDQUFBO0lBQUg7O0lBRXBCLEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxHQUFELEVBQU0sRUFBTjtBQUNMLFlBQUE7UUFBQSxHQUFBLEdBQU0sQ0FBSSxJQUFDLENBQUEsR0FBRCxDQUFLLEdBQUwsRUFBVSxLQUFWO1FBQ1YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEVBQVUsR0FBVjswQ0FDQSxHQUFJO0lBSEM7O0lBS1QsS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQW1CLEVBQW5COztZQUFNLFFBQU07O1FBQ2hCLElBQU8sWUFBSixJQUFZLEtBQUEsS0FBUyxLQUF4QjtZQUNJLEVBQUEsR0FBSyxNQURUOzswQ0FFQSxHQUFJLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxFQUFVLEtBQVY7SUFIQTs7Ozs7O0FBS1osTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMCBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwIFxuIyMjXG5cbnsgc3RvcmUsIHNsYXNoLCBrbG9nLCBrZXJyb3IsIGZzLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgUHJlZnNcbiAgICBcbiAgICBAc3RvcmUgICA9IG51bGxcbiAgICBAd2F0Y2hlciA9IG51bGxcbiAgICBcbiAgICBAaW5pdDogKG9wdD17fSkgLT5cblxuICAgICAgICByZXR1cm4gZXJyb3IgJ3ByZWZzLmluaXQgLS0gZHVwbGljYXRlIHN0b3Jlcz8nIGlmIEBzdG9yZT9cbiAgICAgICAgQHN0b3JlID0gbmV3IHN0b3JlICdwcmVmcycgb3B0XG4gICAgICAgIEBzdG9yZS5vbiAnd2lsbFNhdmUnIEB1bndhdGNoXG4gICAgICAgIEBzdG9yZS5vbiAnZGlkU2F2ZScgIEB3YXRjaFxuICAgICAgICBAd2F0Y2goKSBcbiAgICAgIFxuICAgIEB1bndhdGNoOiA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAc3RvcmUuYXBwP1xuICAgICAgICBcbiAgICAgICAgQHdhdGNoZXI/LmNsb3NlKClcbiAgICAgICAgQHdhdGNoZXIgPSBudWxsXG4gICAgICAgIFxuICAgIEB3YXRjaDogPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQHN0b3JlLmFwcD9cbiAgICAgICAgXG4gICAgICAgIHNsYXNoLmVycm9yID0ga2xvZ1xuICAgICAgICBpZiBzbGFzaC50b3VjaCBAc3RvcmUuZmlsZVxuICAgICAgICBcbiAgICAgICAgICAgIEB1bndhdGNoKClcbiAgICAgICAgICAgIEB3YXRjaGVyID0gZnMud2F0Y2ggQHN0b3JlLmZpbGVcbiAgICAgICAgICAgIEB3YXRjaGVyXG4gICAgICAgICAgICAgICAgLm9uICdjaGFuZ2UnIEBvbkZpbGVDaGFuZ2VcbiAgICAgICAgICAgICAgICAub24gJ3JlbmFtZScgQG9uRmlsZVVubGlua1xuICAgICAgICAgICAgICAgIC5vbiAnZXJyb3InICAoZXJyKSAtPiBrZXJyb3IgJ1ByZWZzIHdhdGNoIGVycm9yJyBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2Vycm9yIFwiY2FuJ3QgdG91Y2ggcHJlZnMgZmlsZSAje0BzdG9yZS5maWxlfVwiXG4gICAgICAgIFxuICAgIEBvbkZpbGVDaGFuZ2U6ID0+IEBzdG9yZS5yZWxvYWQoKVxuICAgIEBvbkZpbGVVbmxpbms6ID0+IEB1bndhdGNoKCk7IEBzdG9yZS5jbGVhcigpXG4gICAgICAgICAgICBcbiAgICBAZ2V0OiAgKGtleSwgdmFsdWUpIC0+IGlmIEBzdG9yZSB0aGVuIEBzdG9yZS5nZXQoa2V5LCB2YWx1ZSkgZWxzZSBfLmNsb25lRGVlcCB2YWx1ZVxuICAgIEBzZXQ6ICAoa2V5LCB2YWx1ZSkgLT4gQHVud2F0Y2goKTsgQHN0b3JlLnNldChrZXksIHZhbHVlKTsgQHdhdGNoKClcbiAgICBAZGVsOiAgKGtleSwgdmFsdWUpIC0+IEB1bndhdGNoKCk7IEBzdG9yZS5kZWwoa2V5KTsgQHdhdGNoKClcbiAgICBAc2F2ZTogICAgICAgICAgICAgIC0+IEBzdG9yZT8uc2F2ZSgpXG4gICAgXG4gICAgQHRvZ2dsZTogKGtleSwgY2IpIC0+IFxuICAgICAgICB2YWwgPSBub3QgQGdldCBrZXksIGZhbHNlXG4gICAgICAgIEBzZXQga2V5LCB2YWxcbiAgICAgICAgY2I/IHZhbFxuICAgICAgICBcbiAgICBAYXBwbHk6IChrZXksIGRlZmx0PWZhbHNlLCBjYikgLT5cbiAgICAgICAgaWYgbm90IGNiPyBhbmQgZGVmbHQgIT0gZmFsc2VcbiAgICAgICAgICAgIGNiID0gZGVmbHRcbiAgICAgICAgY2I/IEBnZXQga2V5LCBkZWZsdFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUHJlZnNcbiJdfQ==
//# sourceURL=../coffee/prefs.coffee