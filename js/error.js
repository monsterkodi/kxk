(function() {
  /*
  00000000  00000000   00000000    0000000   00000000   
  000       000   000  000   000  000   000  000   000  
  0000000   0000000    0000000    000   000  0000000    
  000       000   000  000   000  000   000  000   000  
  00000000  000   000  000   000   0000000   000   000  
  */
  var error, log, post, str;

  ({log, str, post} = require('./kxk'));

  error = function() {
    var s;
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
    
    // post.emit 'error', s
    console.error(s);
    return log.slog(s);
  };

  module.exports = error;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vY29mZmVlL2Vycm9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTs7RUFRQSxDQUFBLENBQUUsR0FBRixFQUFPLEdBQVAsRUFBWSxJQUFaLENBQUEsR0FBcUIsT0FBQSxDQUFRLE9BQVIsQ0FBckI7O0VBRUEsS0FBQSxHQUFRLFFBQUEsQ0FBQSxDQUFBO0FBRUosUUFBQTtJQUFBLENBQUEsR0FBSSxVQUFBLEdBQWE7O0FBQVE7QUFBQTtNQUFBLEtBQUEscUNBQUE7O3FCQUFQLEdBQUEsQ0FBSSxDQUFKO01BQU8sQ0FBQTs7NkJBQVIsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxHQUFsRCxFQUFqQjs7O0lBR0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkO1dBQ0EsR0FBRyxDQUFDLElBQUosQ0FBUyxDQUFUO0VBTkk7O0VBUVIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsQmpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgbG9nLCBzdHIsIHBvc3QgfSA9IHJlcXVpcmUgJy4va3hrJyBcblxuZXJyb3IgPSAtPlxuICAgIFxuICAgIHMgPSAnW0VSUk9SXSAnICsgKHN0cihzKSBmb3IgcyBpbiBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMCkuam9pbiBcIiBcIlxuICAgICAgICBcbiAgICAjIHBvc3QuZW1pdCAnZXJyb3InLCBzXG4gICAgY29uc29sZS5lcnJvciBzXG4gICAgbG9nLnNsb2cgc1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9yIl19
//# sourceURL=../coffee/error.coffee