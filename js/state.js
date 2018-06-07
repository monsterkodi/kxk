(function() {
  /*
   0000000  000000000   0000000   000000000  00000000  
  000          000     000   000     000     000       
  0000000      000     000000000     000     0000000   
       000     000     000   000     000     000       
  0000000      000     000   000     000     00000000  
  */
  var State, error, log, store;

  ({store, error, log} = require('./kxk'));

  State = (function() {
    class State {
      static init() {
        if (this.store != null) {
          return error('State.init -- duplicate stores?');
        }
        return this.store = new store('state', {
          separator: '|'
        });
      }

      static get(key, value) {
        return this.store.get(key, value);
      }

      static set(key, value) {
        return this.store.set(key, value);
      }

      static del(key, value) {
        return this.store.del(key);
      }

      static save() {
        return this.store.save();
      }

    };

    State.store = null;

    return State;

  }).call(this);

  module.exports = State;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLEtBQUYsRUFBUyxLQUFULEVBQWdCLEdBQWhCLENBQUEsR0FBd0IsT0FBQSxDQUFRLE9BQVIsQ0FBeEI7O0VBRU07SUFBTixNQUFBLE1BQUE7TUFJVyxPQUFOLElBQU0sQ0FBQSxDQUFBO1FBRUgsSUFBa0Qsa0JBQWxEO0FBQUEsaUJBQU8sS0FBQSxDQUFNLGlDQUFOLEVBQVA7O2VBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLEtBQUosQ0FBVSxPQUFWLEVBQW1CO1VBQUEsU0FBQSxFQUFXO1FBQVgsQ0FBbkI7TUFITjs7TUFLQSxPQUFOLEdBQU0sQ0FBQyxHQUFELEVBQU0sS0FBTixDQUFBO2VBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLEdBQVgsRUFBZ0IsS0FBaEI7TUFBaEI7O01BQ0EsT0FBTixHQUFNLENBQUMsR0FBRCxFQUFNLEtBQU4sQ0FBQTtlQUFnQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEtBQWhCO01BQWhCOztNQUNBLE9BQU4sR0FBTSxDQUFDLEdBQUQsRUFBTSxLQUFOLENBQUE7ZUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsR0FBWDtNQUFoQjs7TUFDYSxPQUFuQixJQUFtQixDQUFBLENBQUE7ZUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUFIOztJQVp4Qjs7SUFFSSxLQUFDLENBQUEsS0FBRCxHQUFTOzs7Ozs7RUFZYixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXhCakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuIyMjXG5cbnsgc3RvcmUsIGVycm9yLCBsb2cgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBTdGF0ZVxuICAgIFxuICAgIEBzdG9yZSA9IG51bGxcbiAgICBcbiAgICBAaW5pdDogLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZXJyb3IgJ1N0YXRlLmluaXQgLS0gZHVwbGljYXRlIHN0b3Jlcz8nIGlmIEBzdG9yZT9cbiAgICAgICAgQHN0b3JlID0gbmV3IHN0b3JlICdzdGF0ZScsIHNlcGFyYXRvcjogJ3wnXG4gICAgICBcbiAgICBAZ2V0OiAgKGtleSwgdmFsdWUpIC0+IEBzdG9yZS5nZXQga2V5LCB2YWx1ZVxuICAgIEBzZXQ6ICAoa2V5LCB2YWx1ZSkgLT4gQHN0b3JlLnNldChrZXksIHZhbHVlKVxuICAgIEBkZWw6ICAoa2V5LCB2YWx1ZSkgLT4gQHN0b3JlLmRlbChrZXkpXG4gICAgQHNhdmU6ICAgICAgICAgICAgICAtPiBAc3RvcmUuc2F2ZSgpXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZVxuIl19
//# sourceURL=C:/Users/kodi/s/kxk/coffee/state.coffee