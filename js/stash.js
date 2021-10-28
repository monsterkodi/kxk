// koffee 1.14.0

/*
 0000000  000000000   0000000    0000000  000   000  
000          000     000   000  000       000   000  
0000000      000     000000000  0000000   000000000  
     000     000     000   000       000  000   000  
0000000      000     000   000  0000000   000   000
 */
var Stash, _, fs, kerror, noon, post, ref, sds, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), _ = ref._, fs = ref.fs, kerror = ref.kerror, noon = ref.noon, post = ref.post, sds = ref.sds, slash = ref.slash;

Stash = (function() {
    function Stash(name, opt) {
        var ref1, ref2, ref3;
        this.name = name;
        this.save = bind(this.save, this);
        if (!this.name) {
            return kerror('stash.constructor -- no name?');
        }
        this.sep = (ref1 = opt != null ? opt.separator : void 0) != null ? ref1 : ':';
        this.timer = null;
        this.file = slash.path((ref2 = opt != null ? opt.file : void 0) != null ? ref2 : (post.get('userData')) + "/" + this.name + ".noon");
        this.timeout = (ref3 = opt != null ? opt.timeout : void 0) != null ? ref3 : 4000;
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
            return fs.ensureDir(slash.dir(this.file), (function(_this) {
                return function(err) {
                    var text;
                    if (!err) {
                        text = noon.stringify(_this.data, {
                            indent: 2,
                            maxalign: 8
                        });
                        return slash.writeText(_this.file, text, function(p) {
                            return post.toMain('stashSaved');
                        });
                    }
                };
            })(this));
        } catch (error) {
            err = error;
            return kerror("stash.save -- can't save to '" + this.file + "': " + err);
        }
    };

    return Stash;

})();

module.exports = Stash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Rhc2guanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJzdGFzaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaURBQUE7SUFBQTs7QUFRQSxNQUE0QyxPQUFBLENBQVEsT0FBUixDQUE1QyxFQUFFLFNBQUYsRUFBSyxXQUFMLEVBQVMsbUJBQVQsRUFBaUIsZUFBakIsRUFBdUIsZUFBdkIsRUFBNkIsYUFBN0IsRUFBa0M7O0FBSzVCO0lBRUMsZUFBQyxJQUFELEVBQVEsR0FBUjtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDs7UUFFQSxJQUFpRCxDQUFJLElBQUMsQ0FBQSxJQUF0RDtBQUFBLG1CQUFPLE1BQUEsQ0FBTywrQkFBUCxFQUFQOztRQUVBLElBQUMsQ0FBQSxHQUFELGtFQUF3QjtRQUN4QixJQUFDLENBQUEsS0FBRCxHQUFXO1FBQ1gsSUFBQyxDQUFBLElBQUQsR0FBVyxLQUFLLENBQUMsSUFBTiwyREFBeUIsQ0FBQyxJQUFJLENBQUMsR0FBTCxDQUFTLFVBQVQsQ0FBRCxDQUFBLEdBQXFCLEdBQXJCLEdBQXdCLElBQUMsQ0FBQSxJQUF6QixHQUE4QixPQUF2RDtRQUNYLElBQUMsQ0FBQSxPQUFELGdFQUEwQjtRQUMxQixJQUFDLENBQUEsT0FBRCxHQUFXO1FBRVgsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsSUFBZixDQUFqQjtRQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLElBQUQsQ0FBQTtRQUNSLElBQTBDLDZDQUExQztZQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFDLENBQUEsSUFBWixFQUFrQixHQUFHLENBQUMsUUFBdEIsRUFBUjs7SUFaRDs7b0JBY0gsT0FBQSxHQUFTLFNBQUMsR0FBRDtlQUFTLEdBQUcsQ0FBQyxLQUFKLENBQVUsSUFBQyxDQUFBLEdBQVg7SUFBVDs7b0JBUVQsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47UUFDRCxJQUE4QywwQ0FBOUM7WUFBQSxNQUFBLENBQU8sMEJBQVAsRUFBbUMsR0FBbkMsRUFBQTs7UUFDQSxJQUFvQiwwQ0FBcEI7QUFBQSxtQkFBTyxNQUFQOztlQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBQyxDQUFBLElBQVQsRUFBZSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsQ0FBZixFQUE4QixLQUE5QjtJQUhDOztvQkFXTCxHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sS0FBTjtRQUVELElBQXFELDBDQUFyRDtBQUFBLG1CQUFPLE1BQUEsQ0FBTywwQkFBUCxFQUFtQyxHQUFuQyxFQUFQOztRQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBQyxDQUFBLElBQVQsRUFBZSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsQ0FBZixFQUE4QixLQUE5QjtRQUVBLElBQXVCLElBQUMsQ0FBQSxLQUF4QjtZQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsS0FBZCxFQUFBOztlQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxJQUFaLEVBQWtCLElBQUMsQ0FBQSxPQUFuQjtJQU5SOztvQkFRTCxHQUFBLEdBQUssU0FBQyxHQUFEO2VBQVMsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMO0lBQVQ7O29CQUVMLEtBQUEsR0FBTyxTQUFBO1FBRUgsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLFlBQUEsQ0FBYSxJQUFDLENBQUEsS0FBZDtRQUNBLElBQUMsQ0FBQSxLQUFELEdBQVM7ZUFDVCxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUMsQ0FBQSxJQUFmO0lBTEc7O29CQWFQLElBQUEsR0FBTSxTQUFBO0FBQ0YsWUFBQTtBQUFBO21CQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLElBQVgsRUFESjtTQUFBLGFBQUE7WUFFTTttQkFDRixHQUhKOztJQURFOztvQkFZTixJQUFBLEdBQU0sU0FBQTtBQUVGLFlBQUE7UUFBQSxJQUFVLENBQUksSUFBQyxDQUFBLElBQWY7QUFBQSxtQkFBQTs7UUFFQSxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7UUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTO0FBQ1Q7bUJBQ0ksRUFBRSxDQUFDLFNBQUgsQ0FBYSxLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxJQUFYLENBQWIsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxHQUFEO0FBQzNCLHdCQUFBO29CQUFBLElBQUcsQ0FBSSxHQUFQO3dCQUNJLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBTCxDQUFlLEtBQUMsQ0FBQSxJQUFoQixFQUFzQjs0QkFBRSxNQUFBLEVBQVEsQ0FBVjs0QkFBYSxRQUFBLEVBQVUsQ0FBdkI7eUJBQXRCOytCQUNQLEtBQUssQ0FBQyxTQUFOLENBQWdCLEtBQUMsQ0FBQSxJQUFqQixFQUF1QixJQUF2QixFQUE2QixTQUFDLENBQUQ7bUNBQ3pCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWjt3QkFEeUIsQ0FBN0IsRUFGSjs7Z0JBRDJCO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQixFQURKO1NBQUEsYUFBQTtZQU1NO21CQUNGLE1BQUEsQ0FBTywrQkFBQSxHQUFnQyxJQUFDLENBQUEsSUFBakMsR0FBc0MsS0FBdEMsR0FBMkMsR0FBbEQsRUFQSjs7SUFORTs7Ozs7O0FBZVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgXywgZnMsIGtlcnJvciwgbm9vbiwgcG9zdCwgc2RzLCBzbGFzaCB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbiMgc2ltcGxlIGtleSB2YWx1ZSBzdG9yZSB3aXRoIGRlbGF5ZWQgc2F2aW5nIHRvIHVzZXJEYXRhIGZvbGRlclxuIyBkb2VzIG5vdCBzeW5jIGJldHdlZW4gcHJvY2Vzc2VzXG4gXG5jbGFzcyBTdGFzaFxuICAgIFxuICAgIEA6IChAbmFtZSwgb3B0KSAtPlxuXG4gICAgICAgIHJldHVybiBrZXJyb3IgJ3N0YXNoLmNvbnN0cnVjdG9yIC0tIG5vIG5hbWU/JyBpZiBub3QgQG5hbWVcbiAgICAgICAgXG4gICAgICAgIEBzZXAgPSBvcHQ/LnNlcGFyYXRvciA/ICc6J1xuICAgICAgICBAdGltZXIgICA9IG51bGxcbiAgICAgICAgQGZpbGUgICAgPSBzbGFzaC5wYXRoIG9wdD8uZmlsZSA/IFwiI3twb3N0LmdldCAndXNlckRhdGEnfS8je0BuYW1lfS5ub29uXCJcbiAgICAgICAgQHRpbWVvdXQgPSBvcHQ/LnRpbWVvdXQgPyA0MDAwXG4gICAgICAgIEBjaGFuZ2VzID0gW11cbiAgICAgICAgXG4gICAgICAgIGZzLmVuc3VyZURpclN5bmMgc2xhc2guZGlybmFtZSBAZmlsZVxuICAgICAgICBAZGF0YSA9IEBsb2FkKClcbiAgICAgICAgQGRhdGEgPSBfLmRlZmF1bHRzIEBkYXRhLCBvcHQuZGVmYXVsdHMgaWYgb3B0Py5kZWZhdWx0cz9cblxuICAgIGtleXBhdGg6IChrZXkpIC0+IGtleS5zcGxpdCBAc2VwXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgIFxuICAgICAgICBcbiAgICBnZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICBrZXJyb3IgJ3N0YXNoLmdldCAtLSBpbnZhbGlkIGtleScsIGtleSBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgcmV0dXJuIHZhbHVlIGlmIG5vdCBrZXk/LnNwbGl0P1xuICAgICAgICBzZHMuZ2V0IEBkYXRhLCBAa2V5cGF0aChrZXkpLCB2YWx1ZVxuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBrZXJyb3IgJ3N0YXNoLnNldCAtLSBpbnZhbGlkIGtleScsIGtleSBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgc2RzLnNldCBAZGF0YSwgQGtleXBhdGgoa2V5KSwgdmFsdWVcbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXIgaWYgQHRpbWVyXG4gICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHNhdmUsIEB0aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgIFxuICAgIGRlbDogKGtleSkgLT4gQHNldCBrZXlcbiAgICBcbiAgICBjbGVhcjogLT5cbiAgICAgICAgXG4gICAgICAgIEBkYXRhID0ge31cbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBAdGltZXIgPSBudWxsXG4gICAgICAgIGZzLnJlbW92ZVN5bmMgQGZpbGVcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGxvYWQ6IC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbm9vbi5sb2FkIEBmaWxlXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAge31cbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwXG5cbiAgICBzYXZlOiA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZmlsZVxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBAdGltZXIgPSBudWxsXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMuZW5zdXJlRGlyIHNsYXNoLmRpcihAZmlsZSksIChlcnIpID0+XG4gICAgICAgICAgICAgICAgaWYgbm90IGVyclxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gbm9vbi5zdHJpbmdpZnkgQGRhdGEsIHsgaW5kZW50OiAyLCBtYXhhbGlnbjogOCB9XG4gICAgICAgICAgICAgICAgICAgIHNsYXNoLndyaXRlVGV4dCBAZmlsZSwgdGV4dCwgKHApIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0LnRvTWFpbiAnc3Rhc2hTYXZlZCdcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBrZXJyb3IgXCJzdGFzaC5zYXZlIC0tIGNhbid0IHNhdmUgdG8gJyN7QGZpbGV9JzogI3tlcnJ9XCJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXNoXG4iXX0=
//# sourceURL=../coffee/stash.coffee