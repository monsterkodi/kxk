// koffee 0.50.0

/*
 0000000  000000000   0000000    0000000  000   000  
000          000     000   000  000       000   000  
0000000      000     000000000  0000000   000000000  
     000     000     000   000       000  000   000  
0000000      000     000   000  0000000   000   000
 */
var Stash, _, atomic, fs, kerror, noon, ref, sds, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), noon = ref.noon, atomic = ref.atomic, slash = ref.slash, fs = ref.fs, sds = ref.sds, kerror = ref.kerror, _ = ref._;

Stash = (function() {
    function Stash(name, opt) {
        var app, electron, ref1, ref2, ref3, ref4;
        this.name = name;
        this.save = bind(this.save, this);
        if (!this.name) {
            return kerror('stash.constructor -- no name?');
        }
        electron = require('electron');
        app = (ref1 = electron.app) != null ? ref1 : electron.remote.app;
        this.sep = (ref2 = opt != null ? opt.separator : void 0) != null ? ref2 : ':';
        this.timer = null;
        this.file = slash.path((ref3 = opt != null ? opt.file : void 0) != null ? ref3 : (slash.userData()) + "/" + this.name + ".noon");
        this.timeout = (ref4 = opt != null ? opt.timeout : void 0) != null ? ref4 : 4000;
        this.changes = [];
        fs.ensureDirSync(slash.dirname(this.file));
        this.data = this.load();
        if ((opt != null ? opt.defaults : void 0) != null) {
            this.data = _.defaults(this.data, opt.defaults);
        }
    }

    Stash.prototype.keypath = function(key) {
        return key.split(this.sep);
    };

    Stash.prototype.get = function(key, value) {
        if ((key != null ? key.split : void 0) == null) {
            kerror('stash.get -- invalid key', key);
        }
        if ((key != null ? key.split : void 0) == null) {
            return value;
        }
        return sds.get(this.data, this.keypath(key), value);
    };

    Stash.prototype.set = function(key, value) {
        if ((key != null ? key.split : void 0) == null) {
            return kerror('stash.set -- invalid key', key);
        }
        sds.set(this.data, this.keypath(key), value);
        if (this.timer) {
            clearTimeout(this.timer);
        }
        return this.timer = setTimeout(this.save, this.timeout);
    };

    Stash.prototype.del = function(key) {
        return this.set(key);
    };

    Stash.prototype.clear = function() {
        this.data = {};
        clearTimeout(this.timer);
        this.timer = null;
        return fs.removeSync(this.file);
    };

    Stash.prototype.load = function() {
        var err;
        try {
            return noon.load(this.file);
        } catch (error) {
            err = error;
            return {};
        }
    };

    Stash.prototype.save = function() {
        var err;
        if (!this.file) {
            return;
        }
        clearTimeout(this.timer);
        this.timer = null;
        try {
            fs.ensureDirSync(slash.dir(this.file));
            return atomic.sync(this.file, noon.stringify(this.data, {
                indent: 2,
                maxalign: 8
            }));
        } catch (error) {
            err = error;
            return kerror("stash.save -- can't save to '" + this.file + "': " + err);
        }
    };

    return Stash;

})();

module.exports = Stash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Rhc2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1EQUFBO0lBQUE7O0FBUUEsTUFBOEMsT0FBQSxDQUFRLE9BQVIsQ0FBOUMsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLFdBQXZCLEVBQTJCLGFBQTNCLEVBQWdDLG1CQUFoQyxFQUF3Qzs7QUFLbEM7SUFFVyxlQUFDLElBQUQsRUFBUSxHQUFSO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxPQUFEOztRQUVWLElBQWlELENBQUksSUFBQyxDQUFBLElBQXREO0FBQUEsbUJBQU8sTUFBQSxDQUFPLCtCQUFQLEVBQVA7O1FBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO1FBQ1gsR0FBQSwwQ0FBc0IsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUV0QyxJQUFDLENBQUEsR0FBRCxrRUFBd0I7UUFDeEIsSUFBQyxDQUFBLEtBQUQsR0FBVztRQUNYLElBQUMsQ0FBQSxJQUFELEdBQVcsS0FBSyxDQUFDLElBQU4sMkRBQXlCLENBQUMsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFELENBQUEsR0FBa0IsR0FBbEIsR0FBcUIsSUFBQyxDQUFBLElBQXRCLEdBQTJCLE9BQXBEO1FBQ1gsSUFBQyxDQUFBLE9BQUQsZ0VBQTBCO1FBQzFCLElBQUMsQ0FBQSxPQUFELEdBQVc7UUFFWCxFQUFFLENBQUMsYUFBSCxDQUFpQixLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxJQUFmLENBQWpCO1FBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsSUFBRCxDQUFBO1FBQ1IsSUFBMEMsNkNBQTFDO1lBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxDQUFDLENBQUMsUUFBRixDQUFXLElBQUMsQ0FBQSxJQUFaLEVBQWtCLEdBQUcsQ0FBQyxRQUF0QixFQUFSOztJQWZTOztvQkFpQmIsT0FBQSxHQUFTLFNBQUMsR0FBRDtlQUFTLEdBQUcsQ0FBQyxLQUFKLENBQVUsSUFBQyxDQUFBLEdBQVg7SUFBVDs7b0JBUVQsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47UUFDRCxJQUE4QywwQ0FBOUM7WUFBQSxNQUFBLENBQU8sMEJBQVAsRUFBbUMsR0FBbkMsRUFBQTs7UUFDQSxJQUFvQiwwQ0FBcEI7QUFBQSxtQkFBTyxNQUFQOztlQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBQyxDQUFBLElBQVQsRUFBZSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsQ0FBZixFQUE4QixLQUE5QjtJQUhDOztvQkFXTCxHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sS0FBTjtRQUVELElBQXFELDBDQUFyRDtBQUFBLG1CQUFPLE1BQUEsQ0FBTywwQkFBUCxFQUFtQyxHQUFuQyxFQUFQOztRQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBQyxDQUFBLElBQVQsRUFBZSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsQ0FBZixFQUE4QixLQUE5QjtRQUVBLElBQXVCLElBQUMsQ0FBQSxLQUF4QjtZQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsS0FBZCxFQUFBOztlQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxJQUFaLEVBQWtCLElBQUMsQ0FBQSxPQUFuQjtJQU5SOztvQkFRTCxHQUFBLEdBQUssU0FBQyxHQUFEO2VBQVMsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMO0lBQVQ7O29CQUVMLEtBQUEsR0FBTyxTQUFBO1FBRUgsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLFlBQUEsQ0FBYSxJQUFDLENBQUEsS0FBZDtRQUNBLElBQUMsQ0FBQSxLQUFELEdBQVM7ZUFDVCxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUMsQ0FBQSxJQUFmO0lBTEc7O29CQWFQLElBQUEsR0FBTSxTQUFBO0FBQ0YsWUFBQTtBQUFBO21CQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLElBQVgsRUFESjtTQUFBLGFBQUE7WUFFTTttQkFDRixHQUhKOztJQURFOztvQkFZTixJQUFBLEdBQU0sU0FBQTtBQUVGLFlBQUE7UUFBQSxJQUFVLENBQUksSUFBQyxDQUFBLElBQWY7QUFBQSxtQkFBQTs7UUFFQSxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7UUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTO0FBQ1Q7WUFFSSxFQUFFLENBQUMsYUFBSCxDQUFpQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxJQUFYLENBQWpCO21CQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLElBQWIsRUFBbUIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsSUFBaEIsRUFBc0I7Z0JBQUUsTUFBQSxFQUFRLENBQVY7Z0JBQWEsUUFBQSxFQUFVLENBQXZCO2FBQXRCLENBQW5CLEVBSEo7U0FBQSxhQUFBO1lBSU07bUJBQ0YsTUFBQSxDQUFPLCtCQUFBLEdBQWdDLElBQUMsQ0FBQSxJQUFqQyxHQUFzQyxLQUF0QyxHQUEyQyxHQUFsRCxFQUxKOztJQU5FOzs7Ozs7QUFhVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBub29uLCBhdG9taWMsIHNsYXNoLCBmcywgc2RzLCBrZXJyb3IsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG4jIHNpbXBsZSBrZXkgdmFsdWUgc3RvcmUgd2l0aCBkZWxheWVkIHNhdmluZyB0byB1c2VyRGF0YSBmb2xkZXJcbiMgZG9lcyBub3Qgc3luYyBiZXR3ZWVuIHByb2Nlc3Nlc1xuIFxuY2xhc3MgU3Rhc2hcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBvcHQpIC0+XG5cbiAgICAgICAgcmV0dXJuIGtlcnJvciAnc3Rhc2guY29uc3RydWN0b3IgLS0gbm8gbmFtZT8nIGlmIG5vdCBAbmFtZVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgYXBwICA9IGVsZWN0cm9uLmFwcCA/IGVsZWN0cm9uLnJlbW90ZS5hcHBcblxuICAgICAgICBAc2VwID0gb3B0Py5zZXBhcmF0b3IgPyAnOidcbiAgICAgICAgQHRpbWVyICAgPSBudWxsXG4gICAgICAgIEBmaWxlICAgID0gc2xhc2gucGF0aCBvcHQ/LmZpbGUgPyBcIiN7c2xhc2gudXNlckRhdGEoKX0vI3tAbmFtZX0ubm9vblwiXG4gICAgICAgIEB0aW1lb3V0ID0gb3B0Py50aW1lb3V0ID8gNDAwMFxuICAgICAgICBAY2hhbmdlcyA9IFtdXG4gICAgICAgIFxuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jIHNsYXNoLmRpcm5hbWUgQGZpbGVcbiAgICAgICAgQGRhdGEgPSBAbG9hZCgpXG4gICAgICAgIEBkYXRhID0gXy5kZWZhdWx0cyBAZGF0YSwgb3B0LmRlZmF1bHRzIGlmIG9wdD8uZGVmYXVsdHM/XG5cbiAgICBrZXlwYXRoOiAoa2V5KSAtPiBrZXkuc3BsaXQgQHNlcFxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcbiAgICAgICAgXG4gICAgZ2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAga2Vycm9yICdzdGFzaC5nZXQgLS0gaW52YWxpZCBrZXknLCBrZXkgaWYgbm90IGtleT8uc3BsaXQ/XG4gICAgICAgIHJldHVybiB2YWx1ZSBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgc2RzLmdldCBAZGF0YSwgQGtleXBhdGgoa2V5KSwgdmFsdWVcbiAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ga2Vycm9yICdzdGFzaC5zZXQgLS0gaW52YWxpZCBrZXknLCBrZXkgaWYgbm90IGtleT8uc3BsaXQ/XG4gICAgICAgIHNkcy5zZXQgQGRhdGEsIEBrZXlwYXRoKGtleSksIHZhbHVlXG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyIGlmIEB0aW1lclxuICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBzYXZlLCBAdGltZW91dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICBkZWw6IChrZXkpIC0+IEBzZXQga2V5XG4gICAgXG4gICAgY2xlYXI6IC0+XG4gICAgICAgIFxuICAgICAgICBAZGF0YSA9IHt9XG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgQHRpbWVyID0gbnVsbFxuICAgICAgICBmcy5yZW1vdmVTeW5jIEBmaWxlXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBsb2FkOiAtPlxuICAgICAgICB0cnlcbiAgICAgICAgICAgIG5vb24ubG9hZCBAZmlsZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIHt9XG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMFxuXG4gICAgc2F2ZTogPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGZpbGVcbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgQHRpbWVyID0gbnVsbFxuICAgICAgICB0cnlcbiAgICAgICAgICAgICMgbG9nICdzYXZlIHN0YXNoJywgQGZpbGVcbiAgICAgICAgICAgIGZzLmVuc3VyZURpclN5bmMgc2xhc2guZGlyIEBmaWxlXG4gICAgICAgICAgICBhdG9taWMuc3luYyBAZmlsZSwgbm9vbi5zdHJpbmdpZnkgQGRhdGEsIHsgaW5kZW50OiAyLCBtYXhhbGlnbjogOCB9XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAga2Vycm9yIFwic3Rhc2guc2F2ZSAtLSBjYW4ndCBzYXZlIHRvICcje0BmaWxlfSc6ICN7ZXJyfVwiXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTdGFzaFxuIl19
//# sourceURL=../coffee/stash.coffee