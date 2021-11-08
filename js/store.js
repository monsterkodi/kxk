// koffee 1.19.0

/*
 0000000  000000000   0000000   00000000   00000000  
000          000     000   000  000   000  000       
0000000      000     000   000  0000000    0000000   
     000     000     000   000  000   000  000       
0000000      000      0000000   000   000  00000000
 */
var Emitter, Store, _, atomic, kerror, noon, post, ref, sds, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = Object.hasOwn,
    slice = [].slice;

ref = require('./kxk'), _ = ref._, atomic = ref.atomic, kerror = ref.kerror, noon = ref.noon, post = ref.post, sds = ref.sds, slash = ref.slash;

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
            this.file = (ref1 = opt.file) != null ? ref1 : slash.join(post.get('userData'), this.name + ".noon");
            this.timeout = opt.timeout;
            post.on('store', (function(_this) {
                return function() {
                    var action, argl, name;
                    name = arguments[0], action = arguments[1], argl = 3 <= arguments.length ? slice.call(arguments, 2) : [];
                    if (_this.name !== name) {
                        return;
                    }
                    switch (action) {
                        case 'set':
                            _this.set.apply(_this, argl);
                            break;
                        case 'get':
                            _this.get.apply(_this, argl);
                            break;
                        case 'del':
                            _this.del.apply(_this, argl);
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
            this.file = slash.join(post.get('userData'), this.name + ".noon");
            post.on('store', (function(_this) {
                return function() {
                    var action, argl, name;
                    name = arguments[0], action = arguments[1], argl = 3 <= arguments.length ? slice.call(arguments, 2) : [];
                    if (_this.name !== name) {
                        return;
                    }
                    switch (action) {
                        case 'data':
                            return _this.data = argl[0];
                        case 'set':
                            return sds.set(_this.data, _this.keypath(argl[0]), argl[1]);
                        case 'get':
                            return sds.get(_this.data, _this.keypath(argl[0]), argl[1]);
                        case 'del':
                            return sds.del(_this.data, _this.keypath(argl[0]));
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
            return _.cloneDeep(value);
        }
        return _.cloneDeep(sds.get(this.data, this.keypath(key), value));
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
        var d, err;
        if (this.app) {
            try {
                d = noon.load(this.file);
                if (_.isPlainObject(d)) {
                    return d;
                }
                return {};
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJzdG9yZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7Ozs7QUFRQSxNQUFnRCxPQUFBLENBQVEsT0FBUixDQUFoRCxFQUFFLFNBQUYsRUFBSyxtQkFBTCxFQUFhLG1CQUFiLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGFBQWpDLEVBQXNDOztBQUV0QyxPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBS0o7OztJQUVGLEtBQUMsQ0FBQSxNQUFELEdBQVU7O0lBQ1YsS0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEtBQUQ7UUFFUCxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBQyxDQUFBLE1BQVgsQ0FBSDtZQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFtQixDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ2Ysd0JBQUE7QUFBQSw0QkFBTyxNQUFQO0FBQUEsNkJBQ1MsTUFEVDtBQUVRLDZFQUFvQixDQUFFO0FBRjlCO2dCQURlO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQURKOztlQU1BLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBUixHQUFzQjtJQVJmOztJQVVSLGVBQUMsSUFBRCxFQUFPLEdBQVA7QUFFQyxZQUFBOztZQUZNLE1BQUk7OztRQUVWLHFDQUFBO1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUTs7WUFDUixHQUFHLENBQUM7O1lBQUosR0FBRyxDQUFDLFlBQWE7OztZQUNqQixHQUFHLENBQUM7O1lBQUosR0FBRyxDQUFDLFVBQWE7O1FBRWpCLElBQXNDLENBQUksSUFBQyxDQUFBLElBQTNDO0FBQUEsbUJBQU8sTUFBQSxDQUFPLG9CQUFQLEVBQVA7O1FBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFS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QixFQWhCSjs7SUFGRTs7OztHQWhKVTs7QUFvS3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMjI1xuXG57IF8sIGF0b21pYywga2Vycm9yLCBub29uLCBwb3N0LCBzZHMsIHNsYXNoIH0gPSByZXF1aXJlICcuL2t4aydcblxuRW1pdHRlciA9IHJlcXVpcmUgJ2V2ZW50cydcblxuIyBzaW1wbGUga2V5IHZhbHVlIHN0b3JlIHdpdGggZGVsYXllZCBzYXZpbmcgdG8gdXNlckRhdGEgZm9sZGVyXG4jIGRvZXMgc3luYyBjaGFuZ2VzIGJldHdlZW4gcHJvY2Vzc2VzXG5cbmNsYXNzIFN0b3JlIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgQHN0b3JlcyA9IHt9XG4gICAgQGFkZFN0b3JlOiAoc3RvcmUpIC0+XG5cbiAgICAgICAgaWYgXy5pc0VtcHR5IEBzdG9yZXNcbiAgICAgICAgICAgIHBvc3Qub25HZXQgJ3N0b3JlJyAobmFtZSwgYWN0aW9uKSA9PlxuICAgICAgICAgICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGF0YSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAc3RvcmVzW25hbWVdPy5kYXRhXG4gICAgXG4gICAgICAgIEBzdG9yZXNbc3RvcmUubmFtZV0gPSBzdG9yZVxuXG4gICAgQDogKG5hbWUsIG9wdD17fSkgLT5cblxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBAbmFtZSA9IG5hbWVcbiAgICAgICAgb3B0LnNlcGFyYXRvciA/PSAnOidcbiAgICAgICAgb3B0LnRpbWVvdXQgICA/PSA0MDAwXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ga2Vycm9yICdubyBuYW1lIGZvciBzdG9yZT8nIGlmIG5vdCBAbmFtZVxuXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHNlcCA9IG9wdC5zZXBhcmF0b3JcbiAgICAgICAgXG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3RvcmUuYWRkU3RvcmUgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAdGltZXIgICA9IG51bGxcbiAgICAgICAgICAgIEBmaWxlICAgID0gb3B0LmZpbGUgPyBzbGFzaC5qb2luIHBvc3QuZ2V0KCd1c2VyRGF0YScpLCBcIiN7QG5hbWV9Lm5vb25cIlxuICAgICAgICAgICAgQHRpbWVvdXQgPSBvcHQudGltZW91dFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zdC5vbiAnc3RvcmUnIChuYW1lLCBhY3Rpb24sIGFyZ2wuLi4pID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBuYW1lICE9IG5hbWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NldCcgICB0aGVuIEBzZXQuYXBwbHkgQCwgYXJnbFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnICAgdGhlbiBAZ2V0LmFwcGx5IEAsIGFyZ2xcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGVsJyAgIHRoZW4gQGRlbC5hcHBseSBALCBhcmdsXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsZWFyJyB0aGVuIEBjbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NhdmUnICB0aGVuIEBzYXZlKClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGZpbGUgPSBzbGFzaC5qb2luIHBvc3QuZ2V0KCd1c2VyRGF0YScpLCBcIiN7QG5hbWV9Lm5vb25cIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3N0Lm9uICdzdG9yZScgKG5hbWUsIGFjdGlvbiwgYXJnbC4uLikgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgQG5hbWUgIT0gbmFtZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGF0YScgdGhlbiBAZGF0YSA9IGFyZ2xbMF1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc2V0JyAgdGhlbiBzZHMuc2V0IEBkYXRhLCBAa2V5cGF0aChhcmdsWzBdKSwgYXJnbFsxXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnICB0aGVuIHNkcy5nZXQgQGRhdGEsIEBrZXlwYXRoKGFyZ2xbMF0pLCBhcmdsWzFdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2RlbCcgIHRoZW4gc2RzLmRlbCBAZGF0YSwgQGtleXBhdGgoYXJnbFswXSlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGRhdGEgPSBAbG9hZCgpXG4gICAgICAgIEBkYXRhID0gXy5kZWZhdWx0cyBAZGF0YSwgb3B0LmRlZmF1bHRzIGlmIG9wdC5kZWZhdWx0cz9cblxuICAgIGtleXBhdGg6IChrZXkpIC0+IGtleS5zcGxpdCBAc2VwXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgIFxuICAgICAgICBcbiAgICBnZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIF8uY2xvbmVEZWVwKHZhbHVlKSBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgXy5jbG9uZURlZXAgc2RzLmdldCBAZGF0YSwgQGtleXBhdGgoa2V5KSwgdmFsdWVcbiAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNldDogKGtleSwgdmFsdWUpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBrZXk/LnNwbGl0P1xuICAgICAgICByZXR1cm4gaWYgXy5pc0VxdWFsIEBnZXQoa2V5KSwgdmFsdWVcblxuICAgICAgICBAZGF0YSA/PSB7fVxuICAgICAgICBzZHMuc2V0IEBkYXRhLCBAa2V5cGF0aChrZXkpLCB2YWx1ZVxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBzYXZlLCBAdGltZW91dFxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJyBAbmFtZSwgJ3NldCcga2V5LCB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnc3RvcmUnIEBuYW1lLCAnc2V0JyBrZXksIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIGRlbDogKGtleSkgLT4gXG4gICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGRhdGFcbiAgICAgICAgc2RzLmRlbCBAZGF0YSwgQGtleXBhdGgga2V5XG4gICAgICAgIFxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBzYXZlLCBAdGltZW91dFxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJyBAbmFtZSwgJ2RlbCcga2V5XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScgQG5hbWUsICdkZWwnIGtleVxuICAgICAgICAgICAgICAgIFxuICAgIGNsZWFyOiAtPlxuICAgICAgICBcbiAgICAgICAgQGRhdGEgPSB7fVxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lciBpZiBAdGltZXJcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdzdG9yZScsIEBuYW1lLCAnZGF0YScsIHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScsIEBuYW1lLCAnY2xlYXInXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICByZWxvYWQ6IC0+XG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIEBkYXRhID0gQGxvYWQoKVxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJyBAbmFtZSwgJ2RhdGEnIEBkYXRhXG4gICAgXG4gICAgbG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGQgPSBub29uLmxvYWQgQGZpbGVcbiAgICAgICAgICAgICAgICBpZiBfLmlzUGxhaW5PYmplY3QoZCkgdGhlbiByZXR1cm4gZFxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LmdldCAnc3RvcmUnIEBuYW1lLCAnZGF0YSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwXG5cbiAgICBzYXZlOiA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBAZmlsZVxuICAgICAgICAgICAgcmV0dXJuIGlmIF8uaXNFbXB0eSBAZGF0YVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnd2lsbFNhdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICAgIEB0aW1lciA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgYXRvbWljLnN5bmMgQGZpbGUsIG5vb24uc3RyaW5naWZ5KEBkYXRhLCB7aW5kZW50OiAyLCBtYXhhbGlnbjogOH0pKydcXG4nXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBrZXJyb3IgXCJzdG9yZS5zYXZlIC0tIGNhbid0IHNhdmUgdG8gJyN7QGZpbGV9OlwiLCBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBlbWl0ICdkaWRTYXZlJ1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3N0b3JlJyBAbmFtZSwgJ3NhdmUnIFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3RvcmVcbiJdfQ==
//# sourceURL=../coffee/store.coffee