(function() {
  /*
  00000000  00000000   00000000    0000000   00000000   
  000       000   000  000   000  000   000  000   000  
  0000000   0000000    0000000    000   000  0000000    
  000       000   000  000   000  000   000  000   000  
  00000000  000   000  000   000   0000000   000   000  
  */
  var error;

  error = function() {
    var log, s, str;
    ({log, str} = require('./kxk'));
    s = '[ERROR] ' + ((function() {
      var i, len, ref, results;
      ref = [].slice.call(arguments, 0);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        results.push(str(s));
      }
      return results;
    }).apply(this, arguments)).join(" ");
    console.error(s);
    return log.slog(s);
  };

  module.exports = error;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vY29mZmVlL2Vycm9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQTs7RUFRQSxLQUFBLEdBQVEsUUFBQSxDQUFBLENBQUE7QUFFSixRQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUE7SUFBQSxDQUFBLENBQUUsR0FBRixFQUFPLEdBQVAsQ0FBQSxHQUFlLE9BQUEsQ0FBUSxPQUFSLENBQWY7SUFFQSxDQUFBLEdBQUksVUFBQSxHQUFhOztBQUFRO0FBQUE7TUFBQSxLQUFBLHFDQUFBOztxQkFBUCxHQUFBLENBQUksQ0FBSjtNQUFPLENBQUE7OzZCQUFSLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsR0FBbEQ7SUFFakIsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkO1dBQ0EsR0FBRyxDQUFDLElBQUosQ0FBUyxDQUFUO0VBUEk7O0VBU1IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFqQmpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbmVycm9yID0gLT5cblxuICAgIHsgbG9nLCBzdHIgfSA9IHJlcXVpcmUgJy4va3hrJ1xuICAgIFxuICAgIHMgPSAnW0VSUk9SXSAnICsgKHN0cihzKSBmb3IgcyBpbiBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMCkuam9pbiBcIiBcIlxuICAgICAgICBcbiAgICBjb25zb2xlLmVycm9yIHNcbiAgICBsb2cuc2xvZyBzXG5cbm1vZHVsZS5leHBvcnRzID0gZXJyb3IiXX0=
//# sourceURL=../coffee/error.coffee