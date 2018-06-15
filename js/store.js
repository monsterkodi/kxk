(function() {
  /*
   0000000  000000000   0000000   00000000   00000000  
  000          000     000   000  000   000  000       
  0000000      000     000   000  0000000    0000000   
       000     000     000   000  000   000  000       
  0000000      000      0000000   000   000  00000000  
  */
  var Emitter, Store, _, atomic, error, first, fs, log, noon, post, sds, slash,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({noon, post, atomic, first, sds, slash, fs, log, error, _} = require('./kxk'));

  Emitter = require('events');

  Store = (function() {
    // simple key value store with delayed saving to userData folder
    // does sync changes between processes
    class Store extends Emitter {
      static addStore(store) {
        if (_.isEmpty(this.stores)) {
          post.onGet('store', (name, action) => {
            var ref;
            switch (action) {
              case 'data':
                return (ref = this.stores[name]) != null ? ref.data : void 0;
            }
          });
        }
        return this.stores[store.name] = store;
      }

      constructor(name, opt = {}) {
        var app, electron, ref;
        super();
        
        //  0000000   0000000   000   000  00000000
        // 000       000   000  000   000  000     
        // 0000000   000000000   000 000   0000000 
        //      000  000   000     000     000     
        // 0000000   000   000      0      00000000
        this.save = this.save.bind(this);
        this.name = name;
        if (opt.separator == null) {
          opt.separator = ':';
        }
        if (opt.timeout == null) {
          opt.timeout = 4000;
        }
        if (!this.name) {
          return error('no name for store?');
        }
        electron = require('electron');
        this.app = electron.app;
        this.sep = opt.separator;
        if (this.app) {
          Store.addStore(this);
          this.timer = null;
          this.file = (ref = opt.file) != null ? ref : (this.app != null) && slash.join(this.app.getPath('userData'), `${this.name}.noon`);
          this.timeout = opt.timeout;
          post.on('store', (name, action, ...args) => {
            if (this.name !== name) {
              return;
            }
            switch (action) {
              case 'set':
                this.set.apply(this, args);
                break;
              case 'get':
                this.get.apply(this, args);
                break;
              case 'del':
                this.del.apply(this, args);
                break;
              case 'clear':
                this.clear();
                break;
              case 'save':
                this.save();
            }
            return this;
          });
        } else {
          app = electron.remote.app;
          this.file = slash.join(app.getPath('userData'), `${this.name}.noon`);
          post.on('store', (name, action, ...args) => {
            if (this.name !== name) {
              return;
            }
            switch (action) {
              case 'data':
                return this.data = args[0];
              case 'set':
                return sds.set(this.data, this.keypath(args[0]), args[1]);
              case 'get':
                return sds.get(this.data, this.keypath(args[0]), args[1]);
              case 'del':
                return sds.set(this.data, this.keypath(args[0]));
            }
          });
        }
        this.data = this.load();
        if (opt.defaults != null) {
          this.data = _.defaults(this.data, opt.defaults);
        }
      }

      keypath(key) {
        return key.split(this.sep);
      }

      
      //  0000000   00000000  000000000
      // 000        000          000   
      // 000  0000  0000000      000   
      // 000   000  000          000   
      //  0000000   00000000     000   
      get(key, value) {
        if ((key != null ? key.split : void 0) == null) {
          return value;
        }
        return _.clone(sds.get(this.data, this.keypath(key), value));
      }

      
      //  0000000  00000000  000000000  
      // 000       000          000     
      // 0000000   0000000      000     
      //      000  000          000     
      // 0000000   00000000     000     
      set(key, value) {
        if ((key != null ? key.split : void 0) == null) {
          return;
        }
        // return if _.isEqual @get(key), value
        if (this.get(key) === value) {
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
      }

      del(key) {
        return this.set(key);
      }

      clear() {
        this.data = {};
        if (this.app) {
          if (this.timer) {
            clearTimeout(this.timer);
          }
          return post.toWins('store', this.name, 'data', {});
        } else {
          return post.toMain('store', this.name, 'clear');
        }
      }

      
      // 000       0000000    0000000   0000000    
      // 000      000   000  000   000  000   000  
      // 000      000   000  000000000  000   000  
      // 000      000   000  000   000  000   000  
      // 0000000   0000000   000   000  0000000    
      reload() {
        if (this.app) {
          this.data = this.load();
          return post.toWins('store', this.name, 'data', this.data);
        }
      }

      load() {
        var err;
        if (this.app) {
          try {
            return noon.load(this.file);
          } catch (error1) {
            err = error1;
            return {};
          }
        } else {
          return post.get('store', this.name, 'data');
        }
      }

      save() {
        var err;
        boundMethodCheck(this, Store);
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
          } catch (error1) {
            err = error1;
            error(`store.save -- can't save to '${this.file}:`, err);
          }
          return this.emit('didSave');
        } else {
          return post.toMain('store', this.name, 'save');
        }
      }

    };

    Store.stores = {};

    return Store;

  }).call(this);

  module.exports = Store;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vY29mZmVlL3N0b3JlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUE7SUFBQTs7RUFRQSxDQUFBLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxNQUFkLEVBQXNCLEtBQXRCLEVBQTZCLEdBQTdCLEVBQWtDLEtBQWxDLEVBQXlDLEVBQXpDLEVBQTZDLEdBQTdDLEVBQWtELEtBQWxELEVBQXlELENBQXpELENBQUEsR0FBK0QsT0FBQSxDQUFRLE9BQVIsQ0FBL0Q7O0VBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztFQUtKOzs7SUFBTixNQUFBLE1BQUEsUUFBb0IsUUFBcEI7TUFHZSxPQUFWLFFBQVUsQ0FBQyxLQUFELENBQUE7UUFFUCxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBQyxDQUFBLE1BQVgsQ0FBSDtVQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixDQUFDLElBQUQsRUFBTyxNQUFQLENBQUEsR0FBQTtBQUNoQixnQkFBQTtBQUFBLG9CQUFPLE1BQVA7QUFBQSxtQkFDUyxNQURUO0FBRVEsOERBQW9CLENBQUU7QUFGOUI7VUFEZ0IsQ0FBcEIsRUFESjs7ZUFNQSxJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVIsR0FBc0I7TUFSZjs7TUFVWCxXQUFhLENBQUMsSUFBRCxFQUFPLE1BQUksQ0FBQSxDQUFYLENBQUE7QUFFVCxZQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUE7Ozs7Ozs7O1lBb0hKLENBQUEsV0FBQSxDQUFBO1FBbEhJLElBQUMsQ0FBQSxJQUFELEdBQVE7O1VBQ1Is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QUNJLElBQVUsQ0FBSSxJQUFDLENBQUEsSUFBZjtBQUFBLG1CQUFBOztVQUNBLElBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFDLENBQUEsSUFBWCxDQUFWO0FBQUEsbUJBQUE7O1VBRUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOO1VBRUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxLQUFkO1VBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUztBQUVUO1lBQ0ksTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsSUFBYixFQUFtQixJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxJQUFoQixFQUFzQjtjQUFDLE1BQUEsRUFBUSxDQUFUO2NBQVksUUFBQSxFQUFVO1lBQXRCLENBQXRCLENBQUEsR0FBZ0QsSUFBbkUsRUFESjtXQUFBLGNBQUE7WUFFTTtZQUNGLEtBQUEsQ0FBTSxDQUFBLDZCQUFBLENBQUEsQ0FBZ0MsSUFBQyxDQUFBLElBQWpDLENBQXNDLENBQXRDLENBQU4sRUFBZ0QsR0FBaEQsRUFISjs7aUJBS0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBZEo7U0FBQSxNQUFBO2lCQWdCSSxJQUFJLENBQUMsTUFBTCxDQUFZLE9BQVosRUFBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLE1BQTVCLEVBaEJKOztNQURFOztJQW5JVjs7SUFFSSxLQUFDLENBQUEsTUFBRCxHQUFVLENBQUE7Ozs7OztFQW9KZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXJLakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyMjXG5cbnsgbm9vbiwgcG9zdCwgYXRvbWljLCBmaXJzdCwgc2RzLCBzbGFzaCwgZnMsIGxvZywgZXJyb3IsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5FbWl0dGVyID0gcmVxdWlyZSAnZXZlbnRzJ1xuXG4jIHNpbXBsZSBrZXkgdmFsdWUgc3RvcmUgd2l0aCBkZWxheWVkIHNhdmluZyB0byB1c2VyRGF0YSBmb2xkZXJcbiMgZG9lcyBzeW5jIGNoYW5nZXMgYmV0d2VlbiBwcm9jZXNzZXNcblxuY2xhc3MgU3RvcmUgZXh0ZW5kcyBFbWl0dGVyXG5cbiAgICBAc3RvcmVzID0ge31cbiAgICBAYWRkU3RvcmU6IChzdG9yZSkgLT5cblxuICAgICAgICBpZiBfLmlzRW1wdHkgQHN0b3Jlc1xuICAgICAgICAgICAgcG9zdC5vbkdldCAnc3RvcmUnLCAobmFtZSwgYWN0aW9uKSA9PlxuICAgICAgICAgICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGF0YSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAc3RvcmVzW25hbWVdPy5kYXRhXG4gICAgXG4gICAgICAgIEBzdG9yZXNbc3RvcmUubmFtZV0gPSBzdG9yZVxuXG4gICAgY29uc3RydWN0b3I6IChuYW1lLCBvcHQ9e30pIC0+XG5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgQG5hbWUgPSBuYW1lXG4gICAgICAgIG9wdC5zZXBhcmF0b3IgPz0gJzonXG4gICAgICAgIG9wdC50aW1lb3V0ICAgPz0gNDAwMFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGVycm9yICdubyBuYW1lIGZvciBzdG9yZT8nIGlmIG5vdCBAbmFtZVxuXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEBhcHAgPSBlbGVjdHJvbi5hcHBcbiAgICAgICAgQHNlcCA9IG9wdC5zZXBhcmF0b3JcbiAgICAgICAgXG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3RvcmUuYWRkU3RvcmUgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAdGltZXIgICA9IG51bGxcbiAgICAgICAgICAgIEBmaWxlICAgID0gb3B0LmZpbGUgPyAoQGFwcD8gYW5kIHNsYXNoLmpvaW4oQGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCBcIiN7QG5hbWV9Lm5vb25cIikpXG4gICAgICAgICAgICBAdGltZW91dCA9IG9wdC50aW1lb3V0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3N0Lm9uICdzdG9yZScsIChuYW1lLCBhY3Rpb24sIGFyZ3MuLi4pID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBuYW1lICE9IG5hbWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NldCcgICB0aGVuIEBzZXQuYXBwbHkgQCwgYXJnc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdnZXQnICAgdGhlbiBAZ2V0LmFwcGx5IEAsIGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZGVsJyAgIHRoZW4gQGRlbC5hcHBseSBALCBhcmdzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsZWFyJyB0aGVuIEBjbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NhdmUnICB0aGVuIEBzYXZlKClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXBwID0gZWxlY3Ryb24ucmVtb3RlLmFwcFxuICAgICAgICAgICAgQGZpbGUgPSBzbGFzaC5qb2luIGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCBcIiN7QG5hbWV9Lm5vb25cIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3N0Lm9uICdzdG9yZScsIChuYW1lLCBhY3Rpb24sIGFyZ3MuLi4pID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBuYW1lICE9IG5hbWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2RhdGEnIHRoZW4gQGRhdGEgPSBhcmdzWzBdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3NldCcgIHRoZW4gc2RzLnNldCBAZGF0YSwgQGtleXBhdGgoYXJnc1swXSksIGFyZ3NbMV1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZ2V0JyAgdGhlbiBzZHMuZ2V0IEBkYXRhLCBAa2V5cGF0aChhcmdzWzBdKSwgYXJnc1sxXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkZWwnICB0aGVuIHNkcy5zZXQgQGRhdGEsIEBrZXlwYXRoKGFyZ3NbMF0pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBkYXRhID0gQGxvYWQoKVxuICAgICAgICBAZGF0YSA9IF8uZGVmYXVsdHMgQGRhdGEsIG9wdC5kZWZhdWx0cyBpZiBvcHQuZGVmYXVsdHM/XG5cbiAgICBrZXlwYXRoOiAoa2V5KSAtPiBrZXkuc3BsaXQgQHNlcFxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcbiAgICAgICAgXG4gICAgZ2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB2YWx1ZSBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgXy5jbG9uZSBzZHMuZ2V0IEBkYXRhLCBAa2V5cGF0aChrZXkpLCB2YWx1ZVxuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cblxuICAgICAgICByZXR1cm4gaWYgbm90IGtleT8uc3BsaXQ/XG4gICAgICAgICMgcmV0dXJuIGlmIF8uaXNFcXVhbCBAZ2V0KGtleSksIHZhbHVlXG4gICAgICAgIHJldHVybiBpZiBAZ2V0KGtleSkgPT0gdmFsdWVcbiAgICAgICAgc2RzLnNldCBAZGF0YSwgQGtleXBhdGgoa2V5KSwgdmFsdWVcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAc2F2ZSwgQHRpbWVvdXRcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdzdG9yZScsIEBuYW1lLCAnc2V0Jywga2V5LCB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnc3RvcmUnLCBAbmFtZSwgJ3NldCcsIGtleSwgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgZGVsOiAoa2V5KSAtPiBAc2V0IGtleVxuICAgIFxuICAgIGNsZWFyOiAtPlxuICAgICAgICBcbiAgICAgICAgQGRhdGEgPSB7fVxuICAgICAgICBcbiAgICAgICAgaWYgQGFwcFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lciBpZiBAdGltZXJcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdzdG9yZScsIEBuYW1lLCAnZGF0YScsIHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScsIEBuYW1lLCAnY2xlYXInXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICByZWxvYWQ6IC0+XG4gICAgICAgIGlmIEBhcHBcbiAgICAgICAgICAgIEBkYXRhID0gQGxvYWQoKVxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ3N0b3JlJywgQG5hbWUsICdkYXRhJywgQGRhdGFcbiAgICBcbiAgICBsb2FkOiAtPlxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBub29uLmxvYWQgQGZpbGVcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QuZ2V0ICdzdG9yZScsIEBuYW1lLCAnZGF0YSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwXG5cbiAgICBzYXZlOiA9PlxuICAgICAgICBpZiBAYXBwXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IEBmaWxlXG4gICAgICAgICAgICByZXR1cm4gaWYgXy5pc0VtcHR5IEBkYXRhXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBlbWl0ICd3aWxsU2F2ZSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICAgICAgQHRpbWVyID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBhdG9taWMuc3luYyBAZmlsZSwgbm9vbi5zdHJpbmdpZnkoQGRhdGEsIHtpbmRlbnQ6IDIsIG1heGFsaWduOiA4fSkrJ1xcbidcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGVycm9yIFwic3RvcmUuc2F2ZSAtLSBjYW4ndCBzYXZlIHRvICcje0BmaWxlfTpcIiwgZXJyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAZW1pdCAnZGlkU2F2ZSdcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzdG9yZScsIEBuYW1lLCAnc2F2ZScgXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTdG9yZVxuIl19
//# sourceURL=../coffee/store.coffee