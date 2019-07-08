// koffee 1.3.0

/*
000   000  0000000    00000000   
000   000  000   000  000   000  
000   000  000   000  00000000   
000   000  000   000  000        
 0000000   0000000    000
 */
var dgram, udp,
    slice = [].slice;

dgram = require('dgram');

udp = (function() {
    function udp(opt) {
        var base, err;
        this.opt = opt;
        if (this.opt != null) {
            this.opt;
        } else {
            this.opt = {};
        }
        if ((base = this.opt).port != null) {
            base.port;
        } else {
            base.port = 9669;
        }
        try {
            this.port = dgram.createSocket('udp4');
            if (this.opt.onMsg) {
                this.port.on('listening', (function(_this) {
                    return function() {
                        var err;
                        try {
                            return _this.port.setBroadcast(true);
                        } catch (error) {
                            err = error;
                            return console.error("[ERROR] can't listen:", err);
                        }
                    };
                })(this));
                this.port.on('message', (function(_this) {
                    return function(message, rinfo) {
                        var err, messageString, msg;
                        messageString = message.toString();
                        try {
                            msg = JSON.parse(messageString);
                        } catch (error) {
                            err = error;
                            console.error('conversion error', err);
                            return;
                        }
                        return _this.opt.onMsg(msg);
                    };
                })(this));
                this.port.on('error', (function(_this) {
                    return function(err) {
                        return console.error('[ERROR] port error', err);
                    };
                })(this));
                this.port.bind(this.opt.port);
            } else {
                this.port.bind((function(_this) {
                    return function() {
                        var ref;
                        return (ref = _this.port) != null ? ref.setBroadcast(true) : void 0;
                    };
                })(this));
            }
        } catch (error) {
            err = error;
            this.port = null;
            console.error("[ERROR] can't create udp port:", err);
        }
    }

    udp.prototype.send = function() {
        var args, buf, msg;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (!this.port) {
            return;
        }
        if (args.length > 1) {
            msg = JSON.stringify(args);
        } else {
            msg = JSON.stringify(args[0]);
        }
        buf = Buffer.from(msg, 'utf8');
        return this.port.send(buf, 0, buf.length, this.opt.port, '127.0.0.1', function() {});
    };

    udp.prototype.close = function() {
        var ref;
        if ((ref = this.port) != null) {
            ref.close();
        }
        return this.port = null;
    };

    return udp;

})();

module.exports = udp;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxVQUFBO0lBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUVGO0lBRVcsYUFBQyxHQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOztZQUVWLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7O2dCQUNKLENBQUM7O2dCQUFELENBQUMsT0FBUTs7QUFFYjtZQUNJLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsTUFBbkI7WUFFUixJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUjtnQkFFSSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBOzJCQUFBLFNBQUE7QUFDbEIsNEJBQUE7QUFBQTttQ0FDSSxLQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkIsRUFESjt5QkFBQSxhQUFBOzRCQUVNO21DQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sdUJBQVAsRUFBZ0MsR0FBaEMsRUFISDs7b0JBRGtCO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7Z0JBTUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLE9BQUQsRUFBVSxLQUFWO0FBRWhCLDRCQUFBO3dCQUFBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFFBQVIsQ0FBQTtBQUNoQjs0QkFDSSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYLEVBRFY7eUJBQUEsYUFBQTs0QkFFTTs0QkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLGtCQUFQLEVBQTJCLEdBQTNCO0FBQ0MsbUNBSko7OytCQUtBLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEdBQVg7b0JBUmdCO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEI7Z0JBVUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsT0FBVCxFQUFrQixDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLEdBQUQ7K0JBQ2YsT0FBQSxDQUFDLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixHQUE3QjtvQkFEZTtnQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO2dCQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBaEIsRUFyQko7YUFBQSxNQUFBO2dCQXdCSSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFBO0FBQUcsNEJBQUE7K0RBQUssQ0FBRSxZQUFQLENBQW9CLElBQXBCO29CQUFIO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQXhCSjthQUhKO1NBQUEsYUFBQTtZQTZCTTtZQUNGLElBQUMsQ0FBQSxJQUFELEdBQVE7WUFBSSxPQUFBLENBQ1osS0FEWSxDQUNOLGdDQURNLEVBQzRCLEdBRDVCLEVBOUJoQjs7SUFMUzs7a0JBc0NiLElBQUEsR0FBTSxTQUFBO0FBRUYsWUFBQTtRQUZHO1FBRUgsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1lBQ0ksR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQURWO1NBQUEsTUFBQTtZQUdJLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUssQ0FBQSxDQUFBLENBQXBCLEVBSFY7O1FBS0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUFpQixNQUFqQjtlQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsQ0FBaEIsRUFBbUIsR0FBRyxDQUFDLE1BQXZCLEVBQStCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBcEMsRUFBMEMsV0FBMUMsRUFBdUQsU0FBQSxHQUFBLENBQXZEO0lBVkU7O2tCQVlOLEtBQUEsR0FBTyxTQUFBO0FBRUgsWUFBQTs7ZUFBSyxDQUFFLEtBQVAsQ0FBQTs7ZUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBSEw7Ozs7OztBQUtYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAgICAgIFxuIyMjXG5cbmRncmFtID0gcmVxdWlyZSAnZGdyYW0nXG5cbmNsYXNzIHVkcFxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIEBvcHQucG9ydCA/PSA5NjY5XG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIEBwb3J0ID0gZGdyYW0uY3JlYXRlU29ja2V0ICd1ZHA0J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb3B0Lm9uTXNnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQub24gJ2xpc3RlbmluZycsID0+IFxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwb3J0LnNldEJyb2FkY2FzdCB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgXCJbRVJST1JdIGNhbid0IGxpc3RlbjpcIiwgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5vbiAnbWVzc2FnZScsIChtZXNzYWdlLCByaW5mbykgPT5cblxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlU3RyaW5nID0gbWVzc2FnZS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnID0gSlNPTi5wYXJzZSBtZXNzYWdlU3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ2NvbnZlcnNpb24gZXJyb3InLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBAb3B0Lm9uTXNnIG1zZ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICAgICAgICAgICAgICBlcnJvciAnW0VSUk9SXSBwb3J0IGVycm9yJywgZXJyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0LmJpbmQgQG9wdC5wb3J0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHBvcnQuYmluZCA9PiBAcG9ydD8uc2V0QnJvYWRjYXN0IHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBAcG9ydCA9IG51bGxcbiAgICAgICAgICAgIGVycm9yIFwiW0VSUk9SXSBjYW4ndCBjcmVhdGUgdWRwIHBvcnQ6XCIsIGVyclxuICAgICAgICAgICAgICAgIFxuICAgIHNlbmQ6IChhcmdzLi4uKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAcG9ydFxuICAgICAgICBcbiAgICAgICAgaWYgYXJncy5sZW5ndGggPiAxXG4gICAgICAgICAgICBtc2cgPSBKU09OLnN0cmluZ2lmeSBhcmdzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1zZyA9IEpTT04uc3RyaW5naWZ5IGFyZ3NbMF1cbiAgICAgICAgICAgIFxuICAgICAgICBidWYgPSBCdWZmZXIuZnJvbSBtc2csICd1dGY4J1xuICAgICAgICBAcG9ydC5zZW5kIGJ1ZiwgMCwgYnVmLmxlbmd0aCwgQG9wdC5wb3J0LCAnMTI3LjAuMC4xJywgLT5cbiAgICAgICAgICAgIFxuICAgIGNsb3NlOiAtPlxuICAgICAgICBcbiAgICAgICAgQHBvcnQ/LmNsb3NlKClcbiAgICAgICAgQHBvcnQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gdWRwXG4gICAgIl19
//# sourceURL=../coffee/udp.coffee