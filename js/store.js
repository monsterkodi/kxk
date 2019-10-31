// koffee 1.4.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHlFQUFBO0lBQUE7Ozs7O0FBUUEsTUFBMkQsT0FBQSxDQUFRLE9BQVIsQ0FBM0QsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLGlCQUF0QixFQUE2QixhQUE3QixFQUFrQyxpQkFBbEMsRUFBeUMsV0FBekMsRUFBNkMsbUJBQTdDLEVBQXFEOztBQUVyRCxPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBS0o7OztJQUVGLEtBQUMsQ0FBQSxNQUFELEdBQVU7O0lBQ1YsS0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEtBQUQ7UUFFUCxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBQyxDQUFBLE1BQVgsQ0FBSDtZQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ2hCLHdCQUFBO0FBQUEsNEJBQU8sTUFBUDtBQUFBLDZCQUNTLE1BRFQ7QUFFUSw2RUFBb0IsQ0FBRTtBQUY5QjtnQkFEZ0I7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLEVBREo7O2VBTUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFSLEdBQXNCO0lBUmY7O0lBVVIsZUFBQyxJQUFELEVBQU8sR0FBUDtBQUVDLFlBQUE7O1lBRk0sTUFBSTs7O1FBRVYscUNBQUE7UUFFQSxJQUFDLENBQUEsSUFBRCxHQUFROztZQUNSLEdBQUcsQ0FBQzs7WUFBSixHQUFHLENBQUMsWUFBYTs7O1lBQ2pCLEdBQUcsQ0FBQzs7WUFBSixHQUFHLENBQUMsVUFBYTs7UUFFakIsSUFBc0MsQ0FBSSxJQUFDLENBQUEsSUFBM0M7QUFBQSxtQkFBTyxNQUFBLENBQU8sb0JBQVAsRUFBUDs7UUFFQSxRQUFBLEdBQVcsT0FBQSxD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RUFoQko7O0lBRkU7Ozs7R0FoSlU7O0FBb0twQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbjAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIyNcblxueyBub29uLCBwb3N0LCBhdG9taWMsIGZpcnN0LCBzZHMsIHNsYXNoLCBmcywga2Vycm9yLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuRW1pdHRlciA9IHJlcXVpcmUgJ2V2ZW50cydcblxuIyBzaW1wbGUga2V5IHZhbHVlIHN0b3JlIHdpdGggZGVsYXllZCBzYXZpbmcgdG8gdXNlckRhdGEgZm9sZGVyXG4jIGRvZXMgc3luYyBjaGFuZ2VzIGJldHdlZW4gcHJvY2Vzc2VzXG5cbmNsYXNzIFN0b3JlIGV4dGVuZHMgRW1pdHRlclxuXG4gICAgQHN0b3JlcyA9IHt9XG4gICAgQGFkZFN0b3JlOiAoc3RvcmUpIC0+XG5cbiAgICAgICAgaWYgXy5pc0VtcHR5IEBzdG9yZXNcbiAgICAgICAgICAgIHBvc3Qub25HZXQgJ3N0b3JlJywgKG5hbWUsIGFjdGlvbikgPT5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2RhdGEnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQHN0b3Jlc1tuYW1lXT8uZGF0YVxuICAgIFxuICAgICAgICBAc3RvcmVzW3N0b3JlLm5hbWVdID0gc3RvcmVcblxuICAgIEA6IChuYW1lLCBvcHQ9e30pIC0+XG5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQG5hbWUgPSBuYW1lXG4gICAgICAgIG9wdC5zZXBhcmF0b3IgPz0gJzonXG4gICAgICAgIG9wdC50aW1lb3V0ICAgPz0gNDAwMFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGtlcnJvciAnbm8gbmFtZSBmb3Igc3RvcmU/JyBpZiBub3QgQG5hbWVcblxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBAYXBwID0gZWxlY3Ryb24uYXBwXG4gICAgICAgIEBzZXAgPSBvcHQuc2VwYXJhdG9yXG4gICAgICAgIFxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFN0b3JlLmFkZFN0b3JlIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRpbWVyICAgPSBudWxsXG4gICAgICAgICAgICBAZmlsZSAgICA9IG9wdC5maWxlID8gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCBcIiN7QG5hbWV9Lm5vb25cIlxuICAgICAgICAgICAgQHRpbWVvdXQgPSBvcHQudGltZW91dFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zdC5vbiAnc3RvcmUnLCAobmFtZSwgYWN0aW9uLCBhcmdzLi4uKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiBAbmFtZSAhPSBuYW1lXG4gICAgICAgICAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgICAgICAgICB3aGVuICdzZXQnICAgdGhlbiBAc2V0LmFwcGx5IEAsIGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZ2V0JyAgIHRoZW4gQGdldC5hcHBseSBALCBhcmdzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2RlbCcgICB0aGVuIEBkZWwuYXBwbHkgQCwgYXJnc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGVhcicgdGhlbiBAY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdzYXZlJyAgdGhlbiBAc2F2ZSgpXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBmaWxlID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCBcIiN7QG5hbWV9Lm5vb25cIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3N0Lm9uICdzdG9yZScsIChuYW1lLCBhY3Rpb24sIGFyZ3MuLi4pID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBuYW1lICE9IG5hbWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2RhdGEnIHRoZW4gQGRhdGEgPSBhcmdzWzBdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NldCcgIHRoZW4gc2RzLnNldCBAZGF0YSwgQGtleXBhdGgoYXJnc1swXSksIGFyZ3NbMV1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZ2V0JyAgdGhlbiBzZHMuZ2V0IEBkYXRhLCBAa2V5cGF0aChhcmdzWzBdKSwgYXJnc1sxXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkZWwnICB0aGVuIHNkcy5kZWwgQGRhdGEsIEBrZXlwYXRoKGFyZ3NbMF0pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBkYXRhID0gQGxvYWQoKVxuICAgICAgICBAZGF0YSA9IF8uZGVmYXVsdHMgQGRhdGEsIG9wdC5kZWZhdWx0cyBpZiBvcHQuZGVmYXVsdHM/XG5cbiAgICBrZXlwYXRoOiAoa2V5KSAtPiBrZXkuc3BsaXQgQHNlcFxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcbiAgICAgICAgXG4gICAgZ2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBfLmNsb25lRGVlcCh2YWx1ZSkgaWYgbm90IGtleT8uc3BsaXQ/XG4gICAgICAgIF8uY2xvbmVEZWVwIHNkcy5nZXQgQGRhdGEsIEBrZXlwYXRoKGtleSksIHZhbHVlXG4gICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBzZXQ6IChrZXksIHZhbHVlKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgcmV0dXJuIGlmIF8uaXNFcXVhbCBAZ2V0KGtleSksIHZhbHVlXG5cbiAgICAgICAgQGRhdGEgPz0ge31cbiAgICAgICAgc2RzLnNldCBAZGF0YSwgQGtleXBhdGgoa2V5KSwgdmFsdWVcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAc2F2ZSwgQHRpbWVvdXRcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdzdG9yZScsIEBuYW1lLCAnc2V0Jywga2V5LCB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnc3RvcmUnLCBAbmFtZSwgJ3NldCcsIGtleSwgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgZGVsOiAoa2V5KSAtPiBcbiAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZGF0YVxuICAgICAgICBzZHMuZGVsIEBkYXRhLCBAa2V5cGF0aCBrZXlcbiAgICAgICAgXG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHNhdmUsIEB0aW1lb3V0XG4gICAgICAgICAgICBwb3N0LnRvV2lucyAnc3RvcmUnLCBAbmFtZSwgJ2RlbCcsIGtleVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnc3RvcmUnLCBAbmFtZSwgJ2RlbCcsIGtleVxuICAgICAgICAgICAgICAgIFxuICAgIGNsZWFyOiAtPlxuICAgICAgICBcbiAgICAgICAgQGRhdGEgPSB7fVxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lciBpZiBAdGltZXJcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdzdG9yZScsIEBuYW1lLCAnZGF0YScsIHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScsIEBuYW1lLCAnY2xlYXInXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICByZWxvYWQ6IC0+XG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIEBkYXRhID0gQGxvYWQoKVxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJywgQG5hbWUsICdkYXRhJywgQGRhdGFcbiAgICBcbiAgICBsb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZCA9IG5vb24ubG9hZCBAZmlsZVxuICAgICAgICAgICAgICAgIGlmIF8uaXNQbGFpbk9iamVjdChkKSB0aGVuIHJldHVybiBkXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QuZ2V0ICdzdG9yZScsIEBuYW1lLCAnZGF0YSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwXG5cbiAgICBzYXZlOiA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBAZmlsZVxuICAgICAgICAgICAgcmV0dXJuIGlmIF8uaXNFbXB0eSBAZGF0YVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnd2lsbFNhdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICAgIEB0aW1lciA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgYXRvbWljLnN5bmMgQGZpbGUsIG5vb24uc3RyaW5naWZ5KEBkYXRhLCB7aW5kZW50OiAyLCBtYXhhbGlnbjogOH0pKydcXG4nXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBrZXJyb3IgXCJzdG9yZS5zYXZlIC0tIGNhbid0IHNhdmUgdG8gJyN7QGZpbGV9OlwiLCBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBlbWl0ICdkaWRTYXZlJ1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3N0b3JlJywgQG5hbWUsICdzYXZlJyBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JlXG4iXX0=
//# sourceURL=../coffee/store.coffee