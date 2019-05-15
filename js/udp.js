// koffee 0.42.0

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
        buf = new Buffer(msg);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxVQUFBO0lBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUVGO0lBRVcsYUFBQyxHQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOztZQUVWLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7O2dCQUNKLENBQUM7O2dCQUFELENBQUMsT0FBUTs7QUFFYjtZQUNJLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsTUFBbkI7WUFFUixJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUjtnQkFFSSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBOzJCQUFBLFNBQUE7QUFDbEIsNEJBQUE7QUFBQTttQ0FDSSxLQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkIsRUFESjt5QkFBQSxhQUFBOzRCQUdNO21DQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sdUJBQVAsRUFBZ0MsR0FBaEMsRUFKSDs7b0JBRGtCO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7Z0JBT0EsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLE9BQUQsRUFBVSxLQUFWO0FBRWhCLDRCQUFBO3dCQUFBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFFBQVIsQ0FBQTtBQUNoQjs0QkFDSSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYLEVBRFY7eUJBQUEsYUFBQTs0QkFFTTs0QkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLGtCQUFQLEVBQTJCLEdBQTNCO0FBQ0MsbUNBSko7OytCQUtBLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEdBQVg7b0JBUmdCO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEI7Z0JBVUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsT0FBVCxFQUFrQixDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLEdBQUQ7K0JBQ2YsT0FBQSxDQUFDLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixHQUE3QjtvQkFEZTtnQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO2dCQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBaEIsRUF0Qko7YUFBQSxNQUFBO2dCQTBCSSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFBO0FBQ1AsNEJBQUE7K0RBQUssQ0FBRSxZQUFQLENBQW9CLElBQXBCO29CQURPO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQTFCSjthQUhKO1NBQUEsYUFBQTtZQStCTTtZQUNGLElBQUMsQ0FBQSxJQUFELEdBQVE7WUFBSSxPQUFBLENBQ1osS0FEWSxDQUNOLGdDQURNLEVBQzRCLEdBRDVCLEVBaENoQjs7SUFMUzs7a0JBd0NiLElBQUEsR0FBTSxTQUFBO0FBRUYsWUFBQTtRQUZHO1FBRUgsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1lBQ0ksR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQURWO1NBQUEsTUFBQTtZQUdJLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUssQ0FBQSxDQUFBLENBQXBCLEVBSFY7O1FBS0EsR0FBQSxHQUFNLElBQUksTUFBSixDQUFXLEdBQVg7ZUFFTixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLENBQWhCLEVBQW1CLEdBQUcsQ0FBQyxNQUF2QixFQUErQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQXBDLEVBQTBDLFdBQTFDLEVBQXVELFNBQUEsR0FBQSxDQUF2RDtJQVhFOztrQkFhTixLQUFBLEdBQU8sU0FBQTtBQUVILFlBQUE7O2VBQUssQ0FBRSxLQUFQLENBQUE7O2VBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUhMOzs7Ozs7QUFLWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgICBcbiMjI1xuXG5kZ3JhbSA9IHJlcXVpcmUgJ2RncmFtJ1xuXG5jbGFzcyB1ZHBcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBAb3B0LnBvcnQgPz0gOTY2OVxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBAcG9ydCA9IGRncmFtLmNyZWF0ZVNvY2tldCAndWRwNCdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5vbk1zZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0Lm9uICdsaXN0ZW5pbmcnLCA9PiBcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBAcG9ydC5zZXRCcm9hZGNhc3QgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgXCJbRVJST1JdIGNhbid0IGxpc3RlbjpcIiwgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5vbiAnbWVzc2FnZScsIChtZXNzYWdlLCByaW5mbykgPT5cblxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlU3RyaW5nID0gbWVzc2FnZS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnID0gSlNPTi5wYXJzZSBtZXNzYWdlU3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ2NvbnZlcnNpb24gZXJyb3InLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBAb3B0Lm9uTXNnIG1zZ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICAgICAgICAgICAgICBlcnJvciAnW0VSUk9SXSBwb3J0IGVycm9yJywgZXJyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0LmJpbmQgQG9wdC5wb3J0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQuYmluZCA9PiBcbiAgICAgICAgICAgICAgICAgICAgQHBvcnQ/LnNldEJyb2FkY2FzdCB0cnVlXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgQHBvcnQgPSBudWxsXG4gICAgICAgICAgICBlcnJvciBcIltFUlJPUl0gY2FuJ3QgY3JlYXRlIHVkcCBwb3J0OlwiLCBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICBzZW5kOiAoYXJncy4uLikgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQHBvcnRcbiAgICAgICAgXG4gICAgICAgIGlmIGFyZ3MubGVuZ3RoID4gMVxuICAgICAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJnc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtc2cgPSBKU09OLnN0cmluZ2lmeSBhcmdzWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgYnVmID0gbmV3IEJ1ZmZlciBtc2dcbiAgICAgICAgXG4gICAgICAgIEBwb3J0LnNlbmQgYnVmLCAwLCBidWYubGVuZ3RoLCBAb3B0LnBvcnQsICcxMjcuMC4wLjEnLCAtPlxuICAgICAgICAgICAgXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAcG9ydD8uY2xvc2UoKVxuICAgICAgICBAcG9ydCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSB1ZHBcbiAgICAiXX0=
//# sourceURL=../coffee/udp.coffee