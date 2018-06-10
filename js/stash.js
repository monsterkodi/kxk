(function() {
  /*
   0000000  000000000   0000000    0000000  000   000  
  000          000     000   000  000       000   000  
  0000000      000     000000000  0000000   000000000  
       000     000     000   000       000  000   000  
  0000000      000     000   000  0000000   000   000  
  */
  var Stash, _, atomic, error, fs, log, noon, sds, slash;

  ({noon, atomic, slash, fs, sds, log, error, _} = require('./kxk'));

  // simple key value store with delayed saving to userData folder
  // does not sync between processes
  Stash = class Stash {
    constructor(name, opt) {
      var app, electron, ref, ref1, ref2, ref3;
      
      //  0000000   0000000   000   000  00000000
      // 000       000   000  000   000  000     
      // 0000000   000000000   000 000   0000000 
      //      000  000   000     000     000     
      // 0000000   000   000      0      00000000
      this.save = this.save.bind(this);
      this.name = name;
      if (!this.name) {
        return error('stash.constructor -- no name?');
      }
      electron = require('electron');
      app = (ref = electron.app) != null ? ref : electron.remote.app;
      this.sep = (ref1 = opt != null ? opt.separator : void 0) != null ? ref1 : ':';
      this.timer = null;
      this.file = slash.path((ref2 = opt != null ? opt.file : void 0) != null ? ref2 : `${app.getPath('userData')}/${this.name}.noon`);
      this.timeout = (ref3 = opt != null ? opt.timeout : void 0) != null ? ref3 : 4000;
      this.changes = [];
      fs.ensureDirSync(slash.dirname(this.file));
      this.data = this.load();
      if ((opt != null ? opt.defaults : void 0) != null) {
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
        error('stash.get -- invalid key', key);
      }
      if ((key != null ? key.split : void 0) == null) {
        return value;
      }
      return sds.get(this.data, this.keypath(key), value);
    }

    
    //  0000000  00000000  000000000  
    // 000       000          000     
    // 0000000   0000000      000     
    //      000  000          000     
    // 0000000   00000000     000     
    set(key, value) {
      if ((key != null ? key.split : void 0) == null) {
        return error('stash.set -- invalid key', key);
      }
      sds.set(this.data, this.keypath(key), value);
      if (this.timer) {
        clearTimeout(this.timer);
      }
      return this.timer = setTimeout(this.save, this.timeout);
    }

    del(key) {
      return this.set(key);
    }

    clear() {
      this.data = {};
      clearTimeout(this.timer);
      this.timer = null;
      return fs.removeSync(this.file);
    }

    
    // 000       0000000    0000000   0000000    
    // 000      000   000  000   000  000   000  
    // 000      000   000  000000000  000   000  
    // 000      000   000  000   000  000   000  
    // 0000000   0000000   000   000  0000000    
    load() {
      var err;
      try {
        return noon.load(this.file);
      } catch (error1) {
        err = error1;
        return {};
      }
    }

    save() {
      var err;
      if (!this.file) {
        return;
      }
      clearTimeout(this.timer);
      this.timer = null;
      try {
        // log 'save stash', @file
        return atomic.sync(this.file, noon.stringify(this.data, {
          indent: 2,
          maxalign: 8
        }));
      } catch (error1) {
        err = error1;
        return error(`stash.save -- can't save to '${this.file}': ${err}`);
      }
    }

  };

  module.exports = Stash;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Rhc2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vY29mZmVlL3N0YXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxJQUFGLEVBQVEsTUFBUixFQUFnQixLQUFoQixFQUF1QixFQUF2QixFQUEyQixHQUEzQixFQUFnQyxHQUFoQyxFQUFxQyxLQUFyQyxFQUE0QyxDQUE1QyxDQUFBLEdBQWtELE9BQUEsQ0FBUSxPQUFSLENBQWxELEVBUkE7Ozs7RUFhTSxRQUFOLE1BQUEsTUFBQTtJQUVJLFdBQWEsS0FBQSxFQUFRLEdBQVIsQ0FBQTtBQUVULFVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBOzs7Ozs7O1VBcUVKLENBQUEsV0FBQSxDQUFBO01BdkVjLElBQUMsQ0FBQTtNQUVYLElBQWdELENBQUksSUFBQyxDQUFBLElBQXJEO0FBQUEsZUFBTyxLQUFBLENBQU0sK0JBQU4sRUFBUDs7TUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7TUFDWCxHQUFBLHdDQUFzQixRQUFRLENBQUMsTUFBTSxDQUFDO01BRXRDLElBQUMsQ0FBQSxHQUFELGtFQUF3QjtNQUN4QixJQUFDLENBQUEsS0FBRCxHQUFXO01BQ1gsSUFBQyxDQUFBLElBQUQsR0FBVyxLQUFLLENBQUMsSUFBTiwyREFBdUIsQ0FBQSxDQUFBLENBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxVQUFaLENBQUgsQ0FBMkIsQ0FBM0IsQ0FBQSxDQUE4QixJQUFDLENBQUEsSUFBL0IsQ0FBb0MsS0FBcEMsQ0FBdkI7TUFDWCxJQUFDLENBQUEsT0FBRCxnRUFBMEI7TUFDMUIsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUVYLEVBQUUsQ0FBQyxhQUFILENBQWlCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLElBQWYsQ0FBakI7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDUixJQUEwQyw2Q0FBMUM7UUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLElBQVosRUFBa0IsR0FBRyxDQUFDLFFBQXRCLEVBQVI7O0lBZlM7O0lBaUJiLE9BQVMsQ0FBQyxHQUFELENBQUE7YUFBUyxHQUFHLENBQUMsS0FBSixDQUFVLElBQUMsQ0FBQSxHQUFYO0lBQVQsQ0FqQlQ7Ozs7Ozs7O0lBeUJBLEdBQUssQ0FBQyxHQUFELEVBQU0sS0FBTixDQUFBO01BQ0QsSUFBNkMsMENBQTdDO1FBQUEsS0FBQSxDQUFNLDBCQUFOLEVBQWtDLEdBQWxDLEVBQUE7O01BQ0EsSUFBb0IsMENBQXBCO0FBQUEsZUFBTyxNQUFQOzthQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBQyxDQUFBLElBQVQsRUFBZSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsQ0FBZixFQUE4QixLQUE5QjtJQUhDLENBekJMOzs7Ozs7OztJQW9DQSxHQUFLLENBQUMsR0FBRCxFQUFNLEtBQU4sQ0FBQTtNQUVELElBQW9ELDBDQUFwRDtBQUFBLGVBQU8sS0FBQSxDQUFNLDBCQUFOLEVBQWtDLEdBQWxDLEVBQVA7O01BQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFDLENBQUEsSUFBVCxFQUFlLElBQUMsQ0FBQSxPQUFELENBQVMsR0FBVCxDQUFmLEVBQThCLEtBQTlCO01BRUEsSUFBdUIsSUFBQyxDQUFBLEtBQXhCO1FBQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxLQUFkLEVBQUE7O2FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFBLENBQVcsSUFBQyxDQUFBLElBQVosRUFBa0IsSUFBQyxDQUFBLE9BQW5CO0lBTlI7O0lBUUwsR0FBSyxDQUFDLEdBQUQsQ0FBQTthQUFTLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTDtJQUFUOztJQUVMLEtBQU8sQ0FBQSxDQUFBO01BRUgsSUFBQyxDQUFBLElBQUQsR0FBUSxDQUFBO01BQ1IsWUFBQSxDQUFhLElBQUMsQ0FBQSxLQUFkO01BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBQyxDQUFBLElBQWY7SUFMRyxDQTlDUDs7Ozs7Ozs7SUEyREEsSUFBTSxDQUFBLENBQUE7QUFDRixVQUFBO0FBQUE7ZUFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxJQUFYLEVBREo7T0FBQSxjQUFBO1FBRU07ZUFDRixDQUFBLEVBSEo7O0lBREU7O0lBWU4sSUFBTSxDQUFBLENBQUE7QUFFRixVQUFBO01BQUEsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsZUFBQTs7TUFFQSxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7TUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTO0FBQ1Q7O2VBRUksTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsSUFBYixFQUFtQixJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxJQUFoQixFQUFzQjtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsUUFBQSxFQUFVO1FBQXZCLENBQXRCLENBQW5CLEVBRko7T0FBQSxjQUFBO1FBR007ZUFDRixLQUFBLENBQU0sQ0FBQSw2QkFBQSxDQUFBLENBQWdDLElBQUMsQ0FBQSxJQUFqQyxDQUFzQyxHQUF0QyxDQUFBLENBQTJDLEdBQTNDLENBQUEsQ0FBTixFQUpKOztJQU5FOztFQXpFVjs7RUFxRkEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsR2pCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG57IG5vb24sIGF0b21pYywgc2xhc2gsIGZzLCBzZHMsIGxvZywgZXJyb3IsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG4jIHNpbXBsZSBrZXkgdmFsdWUgc3RvcmUgd2l0aCBkZWxheWVkIHNhdmluZyB0byB1c2VyRGF0YSBmb2xkZXJcbiMgZG9lcyBub3Qgc3luYyBiZXR3ZWVuIHByb2Nlc3Nlc1xuIFxuY2xhc3MgU3Rhc2hcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBvcHQpIC0+XG5cbiAgICAgICAgcmV0dXJuIGVycm9yICdzdGFzaC5jb25zdHJ1Y3RvciAtLSBubyBuYW1lPycgaWYgbm90IEBuYW1lXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBhcHAgID0gZWxlY3Ryb24uYXBwID8gZWxlY3Ryb24ucmVtb3RlLmFwcFxuXG4gICAgICAgIEBzZXAgPSBvcHQ/LnNlcGFyYXRvciA/ICc6J1xuICAgICAgICBAdGltZXIgICA9IG51bGxcbiAgICAgICAgQGZpbGUgICAgPSBzbGFzaC5wYXRoIG9wdD8uZmlsZSA/IFwiI3thcHAuZ2V0UGF0aCgndXNlckRhdGEnKX0vI3tAbmFtZX0ubm9vblwiXG4gICAgICAgIEB0aW1lb3V0ID0gb3B0Py50aW1lb3V0ID8gNDAwMFxuICAgICAgICBAY2hhbmdlcyA9IFtdXG4gICAgICAgIFxuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jIHNsYXNoLmRpcm5hbWUgQGZpbGVcbiAgICAgICAgQGRhdGEgPSBAbG9hZCgpXG4gICAgICAgIEBkYXRhID0gXy5kZWZhdWx0cyBAZGF0YSwgb3B0LmRlZmF1bHRzIGlmIG9wdD8uZGVmYXVsdHM/XG5cbiAgICBrZXlwYXRoOiAoa2V5KSAtPiBrZXkuc3BsaXQgQHNlcFxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcbiAgICAgICAgXG4gICAgZ2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgZXJyb3IgJ3N0YXNoLmdldCAtLSBpbnZhbGlkIGtleScsIGtleSBpZiBub3Qga2V5Py5zcGxpdD9cbiAgICAgICAgcmV0dXJuIHZhbHVlIGlmIG5vdCBrZXk/LnNwbGl0P1xuICAgICAgICBzZHMuZ2V0IEBkYXRhLCBAa2V5cGF0aChrZXkpLCB2YWx1ZVxuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBlcnJvciAnc3Rhc2guc2V0IC0tIGludmFsaWQga2V5Jywga2V5IGlmIG5vdCBrZXk/LnNwbGl0P1xuICAgICAgICBzZHMuc2V0IEBkYXRhLCBAa2V5cGF0aChrZXkpLCB2YWx1ZVxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lciBpZiBAdGltZXJcbiAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAc2F2ZSwgQHRpbWVvdXRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgZGVsOiAoa2V5KSAtPiBAc2V0IGtleVxuICAgIFxuICAgIGNsZWFyOiAtPlxuICAgICAgICBcbiAgICAgICAgQGRhdGEgPSB7fVxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIEB0aW1lciA9IG51bGxcbiAgICAgICAgZnMucmVtb3ZlU3luYyBAZmlsZVxuICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgbG9hZDogLT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBub29uLmxvYWQgQGZpbGVcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICB7fVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDBcblxuICAgIHNhdmU6ID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBmaWxlXG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIEB0aW1lciA9IG51bGxcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICAjIGxvZyAnc2F2ZSBzdGFzaCcsIEBmaWxlXG4gICAgICAgICAgICBhdG9taWMuc3luYyBAZmlsZSwgbm9vbi5zdHJpbmdpZnkgQGRhdGEsIHsgaW5kZW50OiAyLCBtYXhhbGlnbjogOCB9XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgXCJzdGFzaC5zYXZlIC0tIGNhbid0IHNhdmUgdG8gJyN7QGZpbGV9JzogI3tlcnJ9XCJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXNoXG4iXX0=
//# sourceURL=../coffee/stash.coffee