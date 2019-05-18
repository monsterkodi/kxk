// koffee 0.43.0

/*
 0000000  000000000   0000000   00000000   00000000  
000          000     000   000  000   000  000       
0000000      000     000   000  0000000    0000000   
     000     000     000   000  000   000  000       
0000000      000      0000000   000   000  00000000
 */
var Emitter, Store, _, atomic, first, fs, kerror, noon, post, ref, sds, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

ref = require('./kxk'), noon = ref.noon, post = ref.post, atomic = ref.atomic, first = ref.first, sds = ref.sds, slash = ref.slash, fs = ref.fs, kerror = ref.kerror, _ = ref._;

Emitter = require('events');

Store = (function(superClass) {
    extend(Store, superClass);

    Store.stores = {};

    Store.addStore = function(store) {
        if (_.isEmpty(this.stores)) {
            post.onGet('store', (function(_this) {
                return function(name, action) {
                    var ref1;
                    switch (action) {
                        case 'data':
                            return (ref1 = _this.stores[name]) != null ? ref1.data : void 0;
                    }
                };
            })(this));
        }
        return this.stores[store.name] = store;
    };

    function Store(name, opt) {
        var electron, ref1;
        if (opt == null) {
            opt = {};
        }
        this.save = bind(this.save, this);
        Store.__super__.constructor.call(this);
        this.name = name;
        if (opt.separator != null) {
            opt.separator;
        } else {
            opt.separator = ':';
        }
        if (opt.timeout != null) {
            opt.timeout;
        } else {
            opt.timeout = 4000;
        }
        if (!this.name) {
            return kerror('no name for store?');
        }
        electron = require('electron');
        this.app = electron.app;
        this.sep = opt.separator;
        if (this.app) {
            Store.addStore(this);
            this.timer = null;
            this.file = (ref1 = opt.file) != null ? ref1 : slash.join(slash.userData(), this.name + ".noon");
            this.timeout = opt.timeout;
            post.on('store', (function(_this) {
                return function() {
                    var action, args, name;
                    name = arguments[0], action = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
                    if (_this.name !== name) {
                        return;
                    }
                    switch (action) {
                        case 'set':
                            _this.set.apply(_this, args);
                            break;
                        case 'get':
                            _this.get.apply(_this, args);
                            break;
                        case 'del':
                            _this.del.apply(_this, args);
                            break;
                        case 'clear':
                            _this.clear();
                            break;
                        case 'save':
                            _this.save();
                    }
                    return _this;
                };
            })(this));
        } else {
            this.file = slash.join(slash.userData(), this.name + ".noon");
            post.on('store', (function(_this) {
                return function() {
                    var action, args, name;
                    name = arguments[0], action = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
                    if (_this.name !== name) {
                        return;
                    }
                    switch (action) {
                        case 'data':
                            return _this.data = args[0];
                        case 'set':
                            return sds.set(_this.data, _this.keypath(args[0]), args[1]);
                        case 'get':
                            return sds.get(_this.data, _this.keypath(args[0]), args[1]);
                        case 'del':
                            return sds.set(_this.data, _this.keypath(args[0]));
                    }
                };
            })(this));
        }
        this.data = this.load();
        if (opt.defaults != null) {
            this.data = _.defaults(this.data, opt.defaults);
        }
    }

    Store.prototype.keypath = function(key) {
        return key.split(this.sep);
    };

    Store.prototype.get = function(key, value) {
        if ((key != null ? key.split : void 0) == null) {
            return value;
        }
        return _.clone(sds.get(this.data, this.keypath(key), value));
    };

    Store.prototype.set = function(key, value) {
        if ((key != null ? key.split : void 0) == null) {
            return;
        }
        if (_.isEqual(this.get(key), value)) {
            return;
        }
        sds.set(this.data, this.keypath(key), value);
        if (this.app) {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.save, this.timeout);
            return post.toWins('store', this.name, 'set', key, value);
        } else {
            return post.toMain('store', this.name, 'set', key, value);
        }
    };

    Store.prototype.del = function(key) {
        return this.set(key);
    };

    Store.prototype.clear = function() {
        this.data = {};
        if (this.app) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            return post.toWins('store', this.name, 'data', {});
        } else {
            return post.toMain('store', this.name, 'clear');
        }
    };

    Store.prototype.reload = function() {
        if (this.app) {
            this.data = this.load();
            return post.toWins('store', this.name, 'data', this.data);
        }
    };

    Store.prototype.load = function() {
        var err;
        if (this.app) {
            try {
                return noon.load(this.file);
            } catch (error) {
                err = error;
                return {};
            }
        } else {
            return post.get('store', this.name, 'data');
        }
    };

    Store.prototype.save = function() {
        var err;
        if (this.app) {
            if (!this.file) {
                return;
            }
            if (_.isEmpty(this.data)) {
                return;
            }
            this.emit('willSave');
            clearTimeout(this.timer);
            this.timer = null;
            try {
                atomic.sync(this.file, noon.stringify(this.data, {
                    indent: 2,
                    maxalign: 8
                }) + '\n');
            } catch (error) {
                err = error;
                kerror("store.save -- can't save to '" + this.file + ":", err);
            }
            return this.emit('didSave');
        } else {
            return post.toMain('store', this.name, 'save');
        }
    };

    return Store;

})(Emitter);

module.exports = Store;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHlFQUFBO0lBQUE7Ozs7O0FBUUEsTUFBMkQsT0FBQSxDQUFRLE9BQVIsQ0FBM0QsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLGlCQUF0QixFQUE2QixhQUE3QixFQUFrQyxpQkFBbEMsRUFBeUMsV0FBekMsRUFBNkMsbUJBQTdDLEVBQXFEOztBQUVyRCxPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBS0o7OztJQUVGLEtBQUMsQ0FBQSxNQUFELEdBQVU7O0lBQ1YsS0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEtBQUQ7UUFFUCxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBQyxDQUFBLE1BQVgsQ0FBSDtZQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ2hCLHdCQUFBO0FBQUEsNEJBQU8sTUFBUDtBQUFBLDZCQUNTLE1BRFQ7QUFFUSw2RUFBb0IsQ0FBRTtBQUY5QjtnQkFEZ0I7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLEVBREo7O2VBTUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFSLEdBQXNCO0lBUmY7O0lBVUUsZUFBQyxJQUFELEVBQU8sR0FBUDtBQUVULFlBQUE7O1lBRmdCLE1BQUk7OztRQUVwQixxQ0FBQTtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQVE7O1lBQ1IsR0FBRyxDQUFDOztZQUFKLEdBQUcsQ0FBQyxZQUFhOzs7WUFDakIsR0FBRyxDQUFDOztZQUFKLEdBQUcsQ0FBQyxVQUFhOztRQUVqQixJQUFzQyxDQUFJLElBQUMsQ0FBQSxJQUEzQztBQUFBLG1CQUFPLE1BQUEsQ0FBTyxvQkFBUCxFQUFQOztRQUVBLFFBQUEsR0FBVyxPQUFB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QUFTO0FBRVQ7Z0JBQ0ksTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsSUFBYixFQUFtQixJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxJQUFoQixFQUFzQjtvQkFBQyxNQUFBLEVBQVEsQ0FBVDtvQkFBWSxRQUFBLEVBQVUsQ0FBdEI7aUJBQXRCLENBQUEsR0FBZ0QsSUFBbkUsRUFESjthQUFBLGFBQUE7Z0JBRU07Z0JBQ0YsTUFBQSxDQUFPLCtCQUFBLEdBQWdDLElBQUMsQ0FBQSxJQUFqQyxHQUFzQyxHQUE3QyxFQUFpRCxHQUFqRCxFQUhKOzttQkFLQSxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFkSjtTQUFBLE1BQUE7bUJBZ0JJLElBQUksQ0FBQyxNQUFMLENBQVksT0FBWixFQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsTUFBNUIsRUFoQko7O0lBRkU7Ozs7R0FuSVU7O0FBdUpwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbjAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIyNcblxueyBub29uLCBwb3N0LCBhdG9taWMsIGZpcnN0LCBzZHMsIHNsYXNoLCBmcywga2Vycm9yLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuRW1pdHRlciA9IHJlcXVpcmUgJ2V2ZW50cydcblxuIyBzaW1wbGUga2V5IHZhbHVlIHN0b3JlIHdpdGggZGVsYXllZCBzYXZpbmcgdG8gdXNlckRhdGEgZm9sZGVyXG4jIGRvZXMgc3luYyBjaGFuZ2VzIGJldHdlZW4gcHJvY2Vzc2VzXG5cbmNsYXNzIFN0b3JlIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgQHN0b3JlcyA9IHt9XG4gICAgQGFkZFN0b3JlOiAoc3RvcmUpIC0+XG5cbiAgICAgICAgaWYgXy5pc0VtcHR5IEBzdG9yZXNcbiAgICAgICAgICAgIHBvc3Qub25HZXQgJ3N0b3JlJywgKG5hbWUsIGFjdGlvbikgPT5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2RhdGEnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQHN0b3Jlc1tuYW1lXT8uZGF0YVxuICAgIFxuICAgICAgICBAc3RvcmVzW3N0b3JlLm5hbWVdID0gc3RvcmVcblxuICAgIGNvbnN0cnVjdG9yOiAobmFtZSwgb3B0PXt9KSAtPlxuXG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIEBuYW1lID0gbmFtZVxuICAgICAgICBvcHQuc2VwYXJhdG9yID89ICc6J1xuICAgICAgICBvcHQudGltZW91dCAgID89IDQwMDBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBrZXJyb3IgJ25vIG5hbWUgZm9yIHN0b3JlPycgaWYgbm90IEBuYW1lXG5cbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgQGFwcCA9IGVsZWN0cm9uLmFwcFxuICAgICAgICBAc2VwID0gb3B0LnNlcGFyYXRvclxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTdG9yZS5hZGRTdG9yZSBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEB0aW1lciAgID0gbnVsbFxuICAgICAgICAgICAgQGZpbGUgICAgPSBvcHQuZmlsZSA/IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgXCIje0BuYW1lfS5ub29uXCJcbiAgICAgICAgICAgIEB0aW1lb3V0ID0gb3B0LnRpbWVvdXRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBvc3Qub24gJ3N0b3JlJywgKG5hbWUsIGFjdGlvbiwgYXJncy4uLikgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgQG5hbWUgIT0gbmFtZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc2V0JyAgIHRoZW4gQHNldC5hcHBseSBALCBhcmdzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2dldCcgICB0aGVuIEBnZXQuYXBwbHkgQCwgYXJnc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdkZWwnICAgdGhlbiBAZGVsLmFwcGx5IEAsIGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xlYXInIHRoZW4gQGNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc2F2ZScgIHRoZW4gQHNhdmUoKVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAZmlsZSA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgXCIje0BuYW1lfS5ub29uXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zdC5vbiAnc3RvcmUnLCAobmFtZSwgYWN0aW9uLCBhcmdzLi4uKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiBAbmFtZSAhPSBuYW1lXG4gICAgICAgICAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkYXRhJyB0aGVuIEBkYXRhID0gYXJnc1swXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdzZXQnICB0aGVuIHNkcy5zZXQgQGRhdGEsIEBrZXlwYXRoKGFyZ3NbMF0pLCBhcmdzWzFdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2dldCcgIHRoZW4gc2RzLmdldCBAZGF0YSwgQGtleXBhdGgoYXJnc1swXSksIGFyZ3NbMV1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGVsJyAgdGhlbiBzZHMuc2V0IEBkYXRhLCBAa2V5cGF0aChhcmdzWzBdKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAZGF0YSA9IEBsb2FkKClcbiAgICAgICAgQGRhdGEgPSBfLmRlZmF1bHRzIEBkYXRhLCBvcHQuZGVmYXVsdHMgaWYgb3B0LmRlZmF1bHRzP1xuXG4gICAga2V5cGF0aDogKGtleSkgLT4ga2V5LnNwbGl0IEBzZXBcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG4gICAgICAgIFxuICAgIGdldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdmFsdWUgaWYgbm90IGtleT8uc3BsaXQ/XG4gICAgICAgIF8uY2xvbmUgc2RzLmdldCBAZGF0YSwgQGtleXBhdGgoa2V5KSwgdmFsdWVcbiAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNldDogKGtleSwgdmFsdWUpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBrZXk/LnNwbGl0P1xuICAgICAgICByZXR1cm4gaWYgXy5pc0VxdWFsIEBnZXQoa2V5KSwgdmFsdWVcblxuICAgICAgICBzZHMuc2V0IEBkYXRhLCBAa2V5cGF0aChrZXkpLCB2YWx1ZVxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBzYXZlLCBAdGltZW91dFxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJywgQG5hbWUsICdzZXQnLCBrZXksIHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScsIEBuYW1lLCAnc2V0Jywga2V5LCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICBkZWw6IChrZXkpIC0+IEBzZXQga2V5XG4gICAgXG4gICAgY2xlYXI6IC0+XG4gICAgICAgIFxuICAgICAgICBAZGF0YSA9IHt9XG4gICAgICAgIFxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyIGlmIEB0aW1lclxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJywgQG5hbWUsICdkYXRhJywge31cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3N0b3JlJywgQG5hbWUsICdjbGVhcidcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIHJlbG9hZDogLT5cbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgQGRhdGEgPSBAbG9hZCgpXG4gICAgICAgICAgICBwb3N0LnRvV2lucyAnc3RvcmUnLCBAbmFtZSwgJ2RhdGEnLCBAZGF0YVxuICAgIFxuICAgIGxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBub29uLmxvYWQgQGZpbGVcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QuZ2V0ICdzdG9yZScsIEBuYW1lLCAnZGF0YSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwXG5cbiAgICBzYXZlOiA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBAZmlsZVxuICAgICAgICAgICAgcmV0dXJuIGlmIF8uaXNFbXB0eSBAZGF0YVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnd2lsbFNhdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICAgIEB0aW1lciA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgYXRvbWljLnN5bmMgQGZpbGUsIG5vb24uc3RyaW5naWZ5KEBkYXRhLCB7aW5kZW50OiAyLCBtYXhhbGlnbjogOH0pKydcXG4nXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBrZXJyb3IgXCJzdG9yZS5zYXZlIC0tIGNhbid0IHNhdmUgdG8gJyN7QGZpbGV9OlwiLCBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBlbWl0ICdkaWRTYXZlJ1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3N0b3JlJywgQG5hbWUsICdzYXZlJyBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JlXG4iXX0=
//# sourceURL=../coffee/store.coffee