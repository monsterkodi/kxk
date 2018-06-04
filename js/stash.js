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
      this.file = (ref2 = opt != null ? opt.file : void 0) != null ? ref2 : `${app.getPath('userData')}/${this.name}.noon`;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Rhc2guanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9zdGFzaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQTs7RUFRQSxDQUFBLENBQUUsSUFBRixFQUFRLE1BQVIsRUFBZ0IsS0FBaEIsRUFBdUIsRUFBdkIsRUFBMkIsR0FBM0IsRUFBZ0MsR0FBaEMsRUFBcUMsS0FBckMsRUFBNEMsQ0FBNUMsQ0FBQSxHQUFrRCxPQUFBLENBQVEsT0FBUixDQUFsRCxFQVJBOzs7O0VBYU0sUUFBTixNQUFBLE1BQUE7SUFFSSxXQUFhLEtBQUEsRUFBUSxHQUFSLENBQUE7QUFFVCxVQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQTs7Ozs7OztVQXFFSixDQUFBLFdBQUEsQ0FBQTtNQXZFYyxJQUFDLENBQUE7TUFFWCxJQUFnRCxDQUFJLElBQUMsQ0FBQSxJQUFyRDtBQUFBLGVBQU8sS0FBQSxDQUFNLCtCQUFOLEVBQVA7O01BRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO01BQ1gsR0FBQSx3Q0FBc0IsUUFBUSxDQUFDLE1BQU0sQ0FBQztNQUV0QyxJQUFDLENBQUEsR0FBRCxrRUFBd0I7TUFDeEIsSUFBQyxDQUFBLEtBQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxJQUFELDZEQUF1QixDQUFBLENBQUEsQ0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFVBQVosQ0FBSCxDQUEyQixDQUEzQixDQUFBLENBQThCLElBQUMsQ0FBQSxJQUEvQixDQUFvQyxLQUFwQztNQUN2QixJQUFDLENBQUEsT0FBRCxnRUFBMEI7TUFDMUIsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUVYLEVBQUUsQ0FBQyxhQUFILENBQWlCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLElBQWYsQ0FBakI7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDUixJQUEwQyw2Q0FBMUM7UUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLElBQVosRUFBa0IsR0FBRyxDQUFDLFFBQXRCLEVBQVI7O0lBZlM7O0lBaUJiLE9BQVMsQ0FBQyxHQUFELENBQUE7YUFBUyxHQUFHLENBQUMsS0FBSixDQUFVLElBQUMsQ0FBQSxHQUFYO0lBQVQsQ0FqQlQ7Ozs7Ozs7O0lBeUJBLEdBQUssQ0FBQyxHQUFELEVBQU0sS0FBTixDQUFBO01BQ0QsSUFBNkMsMENBQTdDO1FBQUEsS0FBQSxDQUFNLDBCQUFOLEVBQWtDLEdBQWxDLEVBQUE7O01BQ0EsSUFBb0IsMENBQXBCO0FBQUEsZUFBTyxNQUFQOzthQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBQyxDQUFBLElBQVQsRUFBZSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsQ0FBZixFQUE4QixLQUE5QjtJQUhDLENBekJMOzs7Ozs7OztJQW9DQSxHQUFLLENBQUMsR0FBRCxFQUFNLEtBQU4sQ0FBQTtNQUVELElBQW9ELDBDQUFwRDtBQUFBLGVBQU8sS0FBQSxDQUFNLDBCQUFOLEVBQWtDLEdBQWxDLEVBQVA7O01BQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFDLENBQUEsSUFBVCxFQUFlLElBQUMsQ0FBQSxPQUFELENBQVMsR0FBVCxDQUFmLEVBQThCLEtBQTlCO01BRUEsSUFBdUIsSUFBQyxDQUFBLEtBQXhCO1FBQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxLQUFkLEVBQUE7O2FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFBLENBQVcsSUFBQyxDQUFBLElBQVosRUFBa0IsSUFBQyxDQUFBLE9BQW5CO0lBTlI7O0lBUUwsR0FBSyxDQUFDLEdBQUQsQ0FBQTthQUFTLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTDtJQUFUOztJQUVMLEtBQU8sQ0FBQSxDQUFBO01BRUgsSUFBQyxDQUFBLElBQUQsR0FBUSxDQUFBO01BQ1IsWUFBQSxDQUFhLElBQUMsQ0FBQSxLQUFkO01BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBQyxDQUFBLElBQWY7SUFMRyxDQTlDUDs7Ozs7Ozs7SUEyREEsSUFBTSxDQUFBLENBQUE7QUFDRixVQUFBO0FBQUE7ZUFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxJQUFYLEVBREo7T0FBQSxjQUFBO1FBRU07ZUFDRixDQUFBLEVBSEo7O0lBREU7O0lBWU4sSUFBTSxDQUFBLENBQUE7QUFDRixVQUFBO01BQUEsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsZUFBQTs7TUFDQSxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7TUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTO0FBQ1Q7ZUFDSSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxJQUFiLEVBQW1CLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLElBQWhCLEVBQXNCO1VBQUMsTUFBQSxFQUFRLENBQVQ7VUFBWSxRQUFBLEVBQVU7UUFBdEIsQ0FBdEIsQ0FBbkIsRUFESjtPQUFBLGNBQUE7UUFFTTtlQUNGLEtBQUEsQ0FBTSxDQUFBLDZCQUFBLENBQUEsQ0FBZ0MsSUFBQyxDQUFBLElBQWpDLENBQXNDLEdBQXRDLENBQUEsQ0FBMkMsR0FBM0MsQ0FBQSxDQUFOLEVBSEo7O0lBSkU7O0VBekVWOztFQWtGQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQS9GakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcclxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcclxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcclxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcclxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcclxuIyMjXHJcblxyXG57IG5vb24sIGF0b21pYywgc2xhc2gsIGZzLCBzZHMsIGxvZywgZXJyb3IsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xyXG5cclxuIyBzaW1wbGUga2V5IHZhbHVlIHN0b3JlIHdpdGggZGVsYXllZCBzYXZpbmcgdG8gdXNlckRhdGEgZm9sZGVyXHJcbiMgZG9lcyBub3Qgc3luYyBiZXR3ZWVuIHByb2Nlc3Nlc1xyXG4gXHJcbmNsYXNzIFN0YXNoXHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIG9wdCkgLT5cclxuXHJcbiAgICAgICAgcmV0dXJuIGVycm9yICdzdGFzaC5jb25zdHJ1Y3RvciAtLSBubyBuYW1lPycgaWYgbm90IEBuYW1lXHJcbiAgICAgICAgXHJcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcclxuICAgICAgICBhcHAgID0gZWxlY3Ryb24uYXBwID8gZWxlY3Ryb24ucmVtb3RlLmFwcFxyXG5cclxuICAgICAgICBAc2VwID0gb3B0Py5zZXBhcmF0b3IgPyAnOidcclxuICAgICAgICBAdGltZXIgICA9IG51bGxcclxuICAgICAgICBAZmlsZSAgICA9IG9wdD8uZmlsZSA/IFwiI3thcHAuZ2V0UGF0aCgndXNlckRhdGEnKX0vI3tAbmFtZX0ubm9vblwiXHJcbiAgICAgICAgQHRpbWVvdXQgPSBvcHQ/LnRpbWVvdXQgPyA0MDAwXHJcbiAgICAgICAgQGNoYW5nZXMgPSBbXVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZzLmVuc3VyZURpclN5bmMgc2xhc2guZGlybmFtZSBAZmlsZVxyXG4gICAgICAgIEBkYXRhID0gQGxvYWQoKVxyXG4gICAgICAgIEBkYXRhID0gXy5kZWZhdWx0cyBAZGF0YSwgb3B0LmRlZmF1bHRzIGlmIG9wdD8uZGVmYXVsdHM/XHJcblxyXG4gICAga2V5cGF0aDogKGtleSkgLT4ga2V5LnNwbGl0IEBzZXBcclxuICAgIFxyXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDBcclxuICAgICMgMDAwICAgICAgICAwMDAgICAgICAgICAgMDAwICAgXHJcbiAgICAjIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxyXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcclxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXHJcbiAgICAgICAgXHJcbiAgICBnZXQ6IChrZXksIHZhbHVlKSAtPlxyXG4gICAgICAgIGVycm9yICdzdGFzaC5nZXQgLS0gaW52YWxpZCBrZXknLCBrZXkgaWYgbm90IGtleT8uc3BsaXQ/XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlIGlmIG5vdCBrZXk/LnNwbGl0P1xyXG4gICAgICAgIHNkcy5nZXQgQGRhdGEsIEBrZXlwYXRoKGtleSksIHZhbHVlXHJcbiAgICAgICAgIFxyXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgXHJcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcclxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxyXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXHJcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICBcclxuICAgIFxyXG4gICAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZXJyb3IgJ3N0YXNoLnNldCAtLSBpbnZhbGlkIGtleScsIGtleSBpZiBub3Qga2V5Py5zcGxpdD9cclxuICAgICAgICBzZHMuc2V0IEBkYXRhLCBAa2V5cGF0aChrZXkpLCB2YWx1ZVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXIgaWYgQHRpbWVyXHJcbiAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAc2F2ZSwgQHRpbWVvdXRcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgIGRlbDogKGtleSkgLT4gQHNldCBrZXlcclxuICAgIFxyXG4gICAgY2xlYXI6IC0+XHJcbiAgICAgICAgXHJcbiAgICAgICAgQGRhdGEgPSB7fVxyXG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcclxuICAgICAgICBAdGltZXIgPSBudWxsXHJcbiAgICAgICAgZnMucmVtb3ZlU3luYyBAZmlsZVxyXG4gICAgICAgIFxyXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcclxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXHJcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxyXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcclxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXHJcbiAgICBcclxuICAgIGxvYWQ6IC0+XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIG5vb24ubG9hZCBAZmlsZVxyXG4gICAgICAgIGNhdGNoIGVyclxyXG4gICAgICAgICAgICB7fVxyXG4gICAgICAgIFxyXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwXHJcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcclxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwIFxyXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXHJcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDBcclxuXHJcbiAgICBzYXZlOiA9PlxyXG4gICAgICAgIHJldHVybiBpZiBub3QgQGZpbGVcclxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXHJcbiAgICAgICAgQHRpbWVyID0gbnVsbFxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgICBhdG9taWMuc3luYyBAZmlsZSwgbm9vbi5zdHJpbmdpZnkgQGRhdGEsIHtpbmRlbnQ6IDIsIG1heGFsaWduOiA4fVxyXG4gICAgICAgIGNhdGNoIGVyclxyXG4gICAgICAgICAgICBlcnJvciBcInN0YXNoLnNhdmUgLS0gY2FuJ3Qgc2F2ZSB0byAnI3tAZmlsZX0nOiAje2Vycn1cIlxyXG4gICAgICAgIFxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXNoXHJcbiJdfQ==
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/stash.coffee