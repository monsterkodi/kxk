// koffee 0.42.0

/*
00000000  00000000   00000000    0000000   00000000   
000       000   000  000   000  000   000  000   000  
0000000   0000000    0000000    000   000  0000000    
000       000   000  000   000  000   000  000   000  
00000000  000   000  000   000   0000000   000   000
 */
var error;

error = function() {
    var klog, ref, s, str;
    ref = require('./kxk'), klog = ref.klog, str = ref.str;
    s = '[ERROR] ' + ((function() {
        var i, len, ref1, results;
        ref1 = [].slice.call(arguments, 0);
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            s = ref1[i];
            results.push(str(s));
        }
        return results;
    }).apply(this, arguments)).join(" ");
    console.error(s);
    return klog.slog(s);
};

module.exports = error;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUSxTQUFBO0FBRUosUUFBQTtJQUFBLE1BQWdCLE9BQUEsQ0FBUSxPQUFSLENBQWhCLEVBQUUsZUFBRixFQUFRO0lBRVIsQ0FBQSxHQUFJLFVBQUEsR0FBYTs7QUFBQztBQUFBO2FBQUEsc0NBQUE7O3lCQUFBLEdBQUEsQ0FBSSxDQUFKO0FBQUE7OzZCQUFELENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsR0FBbEQ7SUFBcUQsT0FBQSxDQUV0RSxLQUZzRSxDQUVoRSxDQUZnRTtXQUd0RSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQVY7QUFQSTs7QUFTUixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG5lcnJvciA9IC0+XG5cbiAgICB7IGtsb2csIHN0ciB9ID0gcmVxdWlyZSAnLi9reGsnXG4gICAgXG4gICAgcyA9ICdbRVJST1JdICcgKyAoc3RyKHMpIGZvciBzIGluIFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwKS5qb2luIFwiIFwiXG4gICAgICAgIFxuICAgIGVycm9yIHNcbiAgICBrbG9nLnNsb2cgc1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9yIl19
//# sourceURL=../coffee/error.coffee