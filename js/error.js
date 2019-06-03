// koffee 0.56.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUSxTQUFBO0FBRUosUUFBQTtJQUFBLE1BQWlCLE9BQUEsQ0FBUSxPQUFSLENBQWpCLEVBQUUsZUFBRixFQUFRO0lBRVIsQ0FBQSxHQUFJLFVBQUEsR0FBYTs7QUFBQztBQUFBO2FBQUEsc0NBQUE7O3lCQUFBLElBQUEsQ0FBSyxDQUFMO0FBQUE7OzZCQUFELENBQTZDLENBQUMsSUFBOUMsQ0FBbUQsR0FBbkQ7SUFBc0QsT0FBQSxDQUV2RSxLQUZ1RSxDQUVqRSxDQUZpRTtXQUd2RSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQVY7QUFQSTs7QUFTUixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG5lcnJvciA9IC0+XG5cbiAgICB7IGtsb2csIGtzdHIgfSA9IHJlcXVpcmUgJy4va3hrJ1xuICAgIFxuICAgIHMgPSAnW0VSUk9SXSAnICsgKGtzdHIocykgZm9yIHMgaW4gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDApLmpvaW4gXCIgXCJcbiAgICAgICAgXG4gICAgZXJyb3Igc1xuICAgIGtsb2cuc2xvZyBzXG5cbm1vZHVsZS5leHBvcnRzID0gZXJyb3IiXX0=
//# sourceURL=../coffee/error.coffee