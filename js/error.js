// koffee 1.19.0

/*
00000000  00000000   00000000    0000000   00000000   
000       000   000  000   000  000   000  000   000  
0000000   0000000    0000000    000   000  0000000    
000       000   000  000   000  000   000  000   000  
00000000  000   000  000   000   0000000   000   000
 */
module.exports = function() {
    var kxk, ref, s;
    kxk = require('./kxk');
    s = '[ERROR] ' + ((function() {
        var i, len, ref, results;
        ref = [].slice.call(arguments, 0);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            results.push(kxk.kstr(s));
        }
        return results;
    }).apply(this, arguments)).join(" ");
    console.error(s);
    return (ref = kxk.klog) != null ? ref.slog(s) : void 0;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJlcnJvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQWtCLFNBQUE7QUFFZCxRQUFBO0lBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSO0lBRU4sQ0FBQSxHQUFJLFVBQUEsR0FBYTs7QUFBQztBQUFBO2FBQUEscUNBQUE7O3lCQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVDtBQUFBOzs2QkFBRCxDQUFpRCxDQUFDLElBQWxELENBQXVELEdBQXZEO0lBQTBELE9BQUEsQ0FFM0UsS0FGMkUsQ0FFckUsQ0FGcUU7eUNBR25FLENBQUUsSUFBVixDQUFlLENBQWY7QUFQYyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9ICAtPlxuXG4gICAga3hrID0gcmVxdWlyZSAnLi9reGsnXG4gICAgXG4gICAgcyA9ICdbRVJST1JdICcgKyAoa3hrLmtzdHIocykgZm9yIHMgaW4gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDApLmpvaW4gXCIgXCJcbiAgICAgICAgXG4gICAgZXJyb3Igc1xuICAgIGt4ay5rbG9nPy5zbG9nIHMiXX0=
//# sourceURL=../coffee/error.coffee