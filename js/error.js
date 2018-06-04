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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9lcnJvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLEdBQUYsRUFBTyxHQUFQLEVBQVksSUFBWixDQUFBLEdBQXFCLE9BQUEsQ0FBUSxPQUFSLENBQXJCOztFQUVBLEtBQUEsR0FBUSxRQUFBLENBQUEsQ0FBQTtBQUVKLFFBQUE7SUFBQSxDQUFBLEdBQUksVUFBQSxHQUFhOztBQUFRO0FBQUE7TUFBQSxLQUFBLHFDQUFBOztxQkFBUCxHQUFBLENBQUksQ0FBSjtNQUFPLENBQUE7OzZCQUFSLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsR0FBbEQsRUFBakI7OztJQUdBLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZDtXQUNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVDtFQU5JOztFQVFSLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBbEJqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG4wMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcclxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXHJcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxyXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcclxuMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXHJcbiMjI1xyXG5cclxueyBsb2csIHN0ciwgcG9zdCB9ID0gcmVxdWlyZSAnLi9reGsnXHJcblxyXG5lcnJvciA9IC0+XHJcbiAgICBcclxuICAgIHMgPSAnW0VSUk9SXSAnICsgKHN0cihzKSBmb3IgcyBpbiBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMCkuam9pbiBcIiBcIlxyXG4gICAgICAgIFxyXG4gICAgIyBwb3N0LmVtaXQgJ2Vycm9yJywgc1xyXG4gICAgY29uc29sZS5lcnJvciBzXHJcbiAgICBsb2cuc2xvZyBzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9yIl19
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/error.coffee