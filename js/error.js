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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9lcnJvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLEdBQUYsRUFBTyxHQUFQLEVBQVksSUFBWixDQUFBLEdBQXFCLE9BQUEsQ0FBUSxPQUFSLENBQXJCOztFQUVBLEtBQUEsR0FBUSxRQUFBLENBQUEsQ0FBQTtBQUVKLFFBQUE7SUFBQSxDQUFBLEdBQUksVUFBQSxHQUFhOztBQUFRO0FBQUE7TUFBQSxLQUFBLHFDQUFBOztxQkFBUCxHQUFBLENBQUksQ0FBSjtNQUFPLENBQUE7OzZCQUFSLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsR0FBbEQsRUFBakI7OztJQUdBLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZDtXQUNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVDtFQU5JOztFQVFSLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBbEJqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG57IGxvZywgc3RyLCBwb3N0IH0gPSByZXF1aXJlICcuL2t4aydcblxuZXJyb3IgPSAtPlxuICAgIFxuICAgIHMgPSAnW0VSUk9SXSAnICsgKHN0cihzKSBmb3IgcyBpbiBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMCkuam9pbiBcIiBcIlxuICAgICAgICBcbiAgICAjIHBvc3QuZW1pdCAnZXJyb3InLCBzXG4gICAgY29uc29sZS5lcnJvciBzXG4gICAgbG9nLnNsb2cgc1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9yIl19
//# sourceURL=C:/Users/kodi/s/kxk/coffee/error.coffee