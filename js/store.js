// koffee 1.3.0

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
                            return sds.del(_this.data, _this.keypath(args[0]));
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
        if (this.data != null) {
            this.data;
        } else {
            this.data = {};
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
        if (!this.data) {
            return;
        }
        sds.del(this.data, this.keypath(key));
        if (this.app) {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.save, this.timeout);
            return post.toWins('store', this.name, 'del', key);
        } else {
            return post.toMain('store', this.name, 'del', key);
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHlFQUFBO0lBQUE7Ozs7O0FBUUEsTUFBMkQsT0FBQSxDQUFRLE9BQVIsQ0FBM0QsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLGlCQUF0QixFQUE2QixhQUE3QixFQUFrQyxpQkFBbEMsRUFBeUMsV0FBekMsRUFBNkMsbUJBQTdDLEVBQXFEOztBQUVyRCxPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBS0o7OztJQUVGLEtBQUMsQ0FBQSxNQUFELEdBQVU7O0lBQ1YsS0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEtBQUQ7UUFFUCxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBQyxDQUFBLE1BQVgsQ0FBSDtZQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ2hCLHdCQUFBO0FBQUEsNEJBQU8sTUFBUDtBQUFBLDZCQUNTLE1BRFQ7QUFFUSw2RUFBb0IsQ0FBRTtBQUY5QjtnQkFEZ0I7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLEVBREo7O2VBTUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFSLEdBQXNCO0lBUmY7O0lBVUUsZUFBQyxJQUFELEVBQU8sR0FBUDtBQUVULFlBQUE7O1lBRmdCLE1BQUk7OztRQUVwQixxQ0FBQTtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQVE7O1lBQ1IsR0FBRyxDQUFDOztZQUFKLEdBQUcsQ0FBQyxZQUFhOzs7WUFDakIsR0FBRyxDQUFDOztZQUFKLEdBQUcsQ0FBQyxVQUFhOztRQUVqQixJQUFzQyxDQUFJLElBQUMsQ0FBQSxJQUEzQztBQUFBLG1CQUFPLE1BQUEsQ0FBTyxvQkFBUCxFQUFQOztRQUVBLFFBQUEsR0FBVyxPQUFB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MDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyMjXG5cbnsgbm9vbiwgcG9zdCwgYXRvbWljLCBmaXJzdCwgc2RzLCBzbGFzaCwgZnMsIGtlcnJvciwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbkVtaXR0ZXIgPSByZXF1aXJlICdldmVudHMnXG5cbiMgc2ltcGxlIGtleSB2YWx1ZSBzdG9yZSB3aXRoIGRlbGF5ZWQgc2F2aW5nIHRvIHVzZXJEYXRhIGZvbGRlclxuIyBkb2VzIHN5bmMgY2hhbmdlcyBiZXR3ZWVuIHByb2Nlc3Nlc1xuXG5jbGFzcyBTdG9yZSBleHRlbmRzIEVtaXR0ZXJcblxuICAgIEBzdG9yZXMgPSB7fVxuICAgIEBhZGRTdG9yZTogKHN0b3JlKSAtPlxuXG4gICAgICAgIGlmIF8uaXNFbXB0eSBAc3RvcmVzXG4gICAgICAgICAgICBwb3N0Lm9uR2V0ICdzdG9yZScsIChuYW1lLCBhY3Rpb24pID0+XG4gICAgICAgICAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkYXRhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBzdG9yZXNbbmFtZV0/LmRhdGFcbiAgICBcbiAgICAgICAgQHN0b3Jlc1tzdG9yZS5uYW1lXSA9IHN0b3JlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG5hbWUsIG9wdD17fSkgLT5cblxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBAbmFtZSA9IG5hbWVcbiAgICAgICAgb3B0LnNlcGFyYXRvciA/PSAnOidcbiAgICAgICAgb3B0LnRpbWVvdXQgICA/PSA0MDAwXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ga2Vycm9yICdubyBuYW1lIGZvciBzdG9yZT8nIGlmIG5vdCBAbmFtZVxuXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHNlcCA9IG9wdC5zZXBhcmF0b3JcbiAgICAgICAgXG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3RvcmUuYWRkU3RvcmUgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAdGltZXIgICA9IG51bGxcbiAgICAgICAgICAgIEBmaWxlICAgID0gb3B0LmZpbGUgPyBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksIFwiI3tAbmFtZX0ubm9vblwiXG4gICAgICAgICAgICBAdGltZW91dCA9IG9wdC50aW1lb3V0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3N0Lm9uICdzdG9yZScsIChuYW1lLCBhY3Rpb24sIGFyZ3MuLi4pID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBuYW1lICE9IG5hbWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NldCcgICB0aGVuIEBzZXQuYXBwbHkgQCwgYXJnc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnICAgdGhlbiBAZ2V0LmFwcGx5IEAsIGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGVsJyAgIHRoZW4gQGRlbC5hcHBseSBALCBhcmdzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsZWFyJyB0aGVuIEBjbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NhdmUnICB0aGVuIEBzYXZlKClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGZpbGUgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksIFwiI3tAbmFtZX0ubm9vblwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBvc3Qub24gJ3N0b3JlJywgKG5hbWUsIGFjdGlvbiwgYXJncy4uLikgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgQG5hbWUgIT0gbmFtZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGF0YScgdGhlbiBAZGF0YSA9IGFyZ3NbMF1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc2V0JyAgdGhlbiBzZHMuc2V0IEBkYXRhLCBAa2V5cGF0aChhcmdzWzBdKSwgYXJnc1sxXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnICB0aGVuIHNkcy5nZXQgQGRhdGEsIEBrZXlwYXRoKGFyZ3NbMF0pLCBhcmdzWzFdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2RlbCcgIHRoZW4gc2RzLmRlbCBAZGF0YSwgQGtleXBhdGgoYXJnc1swXSlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGRhdGEgPSBAbG9hZCgpXG4gICAgICAgIEBkYXRhID0gXy5kZWZhdWx0cyBAZGF0YSwgb3B0LmRlZmF1bHRzIGlmIG9wdC5kZWZhdWx0cz9cblxuICAgIGtleXBhdGg6IChrZXkpIC0+IGtleS5zcGxpdCBAc2VwXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgIFxuICAgICAgICBcbiAgICBnZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHZhbHVlIGlmIG5vdCBrZXk/LnNwbGl0P1xuICAgICAgICBfLmNsb25lIHNkcy5nZXQgQGRhdGEsIEBrZXlwYXRoKGtleSksIHZhbHVlXG4gICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBzZXQ6IChrZXksIHZhbHVlKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgcmV0dXJuIGlmIF8uaXNFcXVhbCBAZ2V0KGtleSksIHZhbHVlXG5cbiAgICAgICAgQGRhdGEgPz0ge31cbiAgICAgICAgc2RzLnNldCBAZGF0YSwgQGtleXBhdGgoa2V5KSwgdmFsdWVcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAc2F2ZSwgQHRpbWVvdXRcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdzdG9yZScsIEBuYW1lLCAnc2V0Jywga2V5LCB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnc3RvcmUnLCBAbmFtZSwgJ3NldCcsIGtleSwgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgZGVsOiAoa2V5KSAtPiBcbiAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZGF0YVxuICAgICAgICBzZHMuZGVsIEBkYXRhLCBAa2V5cGF0aCBrZXlcbiAgICAgICAgXG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHNhdmUsIEB0aW1lb3V0XG4gICAgICAgICAgICBwb3N0LnRvV2lucyAnc3RvcmUnLCBAbmFtZSwgJ2RlbCcsIGtleVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnc3RvcmUnLCBAbmFtZSwgJ2RlbCcsIGtleVxuICAgICAgICAgICAgICAgIFxuICAgIGNsZWFyOiAtPlxuICAgICAgICBcbiAgICAgICAgQGRhdGEgPSB7fVxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lciBpZiBAdGltZXJcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdzdG9yZScsIEBuYW1lLCAnZGF0YScsIHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScsIEBuYW1lLCAnY2xlYXInXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICByZWxvYWQ6IC0+XG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIEBkYXRhID0gQGxvYWQoKVxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJywgQG5hbWUsICdkYXRhJywgQGRhdGFcbiAgICBcbiAgICBsb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgbm9vbi5sb2FkIEBmaWxlXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LmdldCAnc3RvcmUnLCBAbmFtZSwgJ2RhdGEnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMFxuXG4gICAgc2F2ZTogPT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3QgQGZpbGVcbiAgICAgICAgICAgIHJldHVybiBpZiBfLmlzRW1wdHkgQGRhdGFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGVtaXQgJ3dpbGxTYXZlJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgICAgICBAdGltZXIgPSBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGF0b21pYy5zeW5jIEBmaWxlLCBub29uLnN0cmluZ2lmeShAZGF0YSwge2luZGVudDogMiwgbWF4YWxpZ246IDh9KSsnXFxuJ1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAga2Vycm9yIFwic3RvcmUuc2F2ZSAtLSBjYW4ndCBzYXZlIHRvICcje0BmaWxlfTpcIiwgZXJyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnZGlkU2F2ZSdcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScsIEBuYW1lLCAnc2F2ZScgXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTdG9yZVxuIl19
//# sourceURL=../coffee/store.coffee