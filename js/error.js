// koffee 1.14.0

/*
00000000  00000000   00000000    0000000   00000000   
000       000   000  000   000  000   000  000   000  
0000000   0000000    0000000    000   000  0000000    
000       000   000  000   000  000   000  000   000  
00000000  000   000  000   000   0000000   000   000
 */
var error;

error = function() {
    var klog, kstr, ref, s;
    ref = require('./kxk'), klog = ref.klog, kstr = ref.kstr;
    s = '[ERROR] ' + ((function() {
        var i, len, ref1, results;
        ref1 = [].slice.call(arguments, 0);
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            s = ref1[i];
            results.push(kstr(s));
        }
        return results;
    }).apply(this, arguments)).join(" ");
    console.error(s);
    return klog.slog(s);
};

module.exports = error;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJlcnJvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLFNBQUE7QUFFSixRQUFBO0lBQUEsTUFBaUIsT0FBQSxDQUFRLE9BQVIsQ0FBakIsRUFBRSxlQUFGLEVBQVE7SUFFUixDQUFBLEdBQUksVUFBQSxHQUFhOztBQUFDO0FBQUE7YUFBQSxzQ0FBQTs7eUJBQUEsSUFBQSxDQUFLLENBQUw7QUFBQTs7NkJBQUQsQ0FBNkMsQ0FBQyxJQUE5QyxDQUFtRCxHQUFuRDtJQUFzRCxPQUFBLENBRXZFLEtBRnVFLENBRWpFLENBRmlFO1dBR3ZFLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBVjtBQVBJOztBQVNSLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbmVycm9yID0gLT5cblxuICAgIHsga2xvZywga3N0ciB9ID0gcmVxdWlyZSAnLi9reGsnXG4gICAgXG4gICAgcyA9ICdbRVJST1JdICcgKyAoa3N0cihzKSBmb3IgcyBpbiBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMCkuam9pbiBcIiBcIlxuICAgICAgICBcbiAgICBlcnJvciBzXG4gICAga2xvZy5zbG9nIHNcblxubW9kdWxlLmV4cG9ydHMgPSBlcnJvciJdfQ==
//# sourceURL=../coffee/error.coffee