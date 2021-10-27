// koffee 1.14.0

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
                            console.error('conversion error', messageString, err);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidWRwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxVQUFBO0lBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUVGO0lBRUMsYUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOztZQUVBLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7O2dCQUNKLENBQUM7O2dCQUFELENBQUMsT0FBUTs7QUFFYjtZQUNJLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsTUFBbkI7WUFFUixJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUjtnQkFFSSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBOzJCQUFBLFNBQUE7QUFDbEIsNEJBQUE7QUFBQTttQ0FDSSxLQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkIsRUFESjt5QkFBQSxhQUFBOzRCQUVNO21DQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sdUJBQVAsRUFBZ0MsR0FBaEMsRUFISDs7b0JBRGtCO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7Z0JBTUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLE9BQUQsRUFBVSxLQUFWO0FBRWhCLDRCQUFBO3dCQUFBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFFBQVIsQ0FBQTtBQUNoQjs0QkFDSSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYLEVBRFY7eUJBQUEsYUFBQTs0QkFFTTs0QkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLGtCQUFQLEVBQTJCLGFBQTNCLEVBQTBDLEdBQTFDO0FBQ0MsbUNBSko7OytCQUtBLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEdBQVg7b0JBUmdCO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEI7Z0JBVUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsT0FBVCxFQUFrQixDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLEdBQUQ7K0JBQ2YsT0FBQSxDQUFDLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixHQUE3QjtvQkFEZTtnQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO2dCQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBaEIsRUFyQko7YUFBQSxNQUFBO2dCQXdCSSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFBO0FBQUcsNEJBQUE7K0RBQUssQ0FBRSxZQUFQLENBQW9CLElBQXBCO29CQUFIO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQXhCSjthQUhKO1NBQUEsYUFBQTtZQTZCTTtZQUNGLElBQUMsQ0FBQSxJQUFELEdBQVE7WUFBSSxPQUFBLENBQ1osS0FEWSxDQUNOLGdDQURNLEVBQzRCLEdBRDVCLEVBOUJoQjs7SUFMRDs7a0JBc0NILElBQUEsR0FBTSxTQUFBO0FBRUYsWUFBQTtRQUZHO1FBRUgsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1lBQ0ksR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQURWO1NBQUEsTUFBQTtZQUdJLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUssQ0FBQSxDQUFBLENBQXBCLEVBSFY7O1FBS0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUFpQixNQUFqQjtlQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsQ0FBaEIsRUFBbUIsR0FBRyxDQUFDLE1BQXZCLEVBQStCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBcEMsRUFBMEMsV0FBMUMsRUFBdUQsU0FBQSxHQUFBLENBQXZEO0lBVkU7O2tCQVlOLEtBQUEsR0FBTyxTQUFBO0FBRUgsWUFBQTs7ZUFBSyxDQUFFLEtBQVAsQ0FBQTs7ZUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBSEw7Ozs7OztBQUtYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAgICAgIFxuIyMjXG5cbmRncmFtID0gcmVxdWlyZSAnZGdyYW0nXG5cbmNsYXNzIHVkcFxuXG4gICAgQDogKEBvcHQpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBvcHQgPz0ge31cbiAgICAgICAgQG9wdC5wb3J0ID89IDk2NjlcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgQHBvcnQgPSBkZ3JhbS5jcmVhdGVTb2NrZXQgJ3VkcDQnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQub25Nc2dcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5vbiAnbGlzdGVuaW5nJywgPT4gXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBvcnQuc2V0QnJvYWRjYXN0IHRydWVcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBcIltFUlJPUl0gY2FuJ3QgbGlzdGVuOlwiLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0Lm9uICdtZXNzYWdlJywgKG1lc3NhZ2UsIHJpbmZvKSA9PlxuXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VTdHJpbmcgPSBtZXNzYWdlLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBKU09OLnBhcnNlIG1lc3NhZ2VTdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnY29udmVyc2lvbiBlcnJvcicsIG1lc3NhZ2VTdHJpbmcsIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIEBvcHQub25Nc2cgbXNnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0Lm9uICdlcnJvcicsIChlcnIpID0+XG4gICAgICAgICAgICAgICAgICAgIGVycm9yICdbRVJST1JdIHBvcnQgZXJyb3InLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQuYmluZCBAb3B0LnBvcnRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcG9ydC5iaW5kID0+IEBwb3J0Py5zZXRCcm9hZGNhc3QgdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIEBwb3J0ID0gbnVsbFxuICAgICAgICAgICAgZXJyb3IgXCJbRVJST1JdIGNhbid0IGNyZWF0ZSB1ZHAgcG9ydDpcIiwgZXJyXG4gICAgICAgICAgICAgICAgXG4gICAgc2VuZDogKGFyZ3MuLi4pIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBwb3J0XG4gICAgICAgIFxuICAgICAgICBpZiBhcmdzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIG1zZyA9IEpTT04uc3RyaW5naWZ5IGFyZ3NcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJnc1swXVxuICAgICAgICAgICAgXG4gICAgICAgIGJ1ZiA9IEJ1ZmZlci5mcm9tIG1zZywgJ3V0ZjgnXG4gICAgICAgIEBwb3J0LnNlbmQgYnVmLCAwLCBidWYubGVuZ3RoLCBAb3B0LnBvcnQsICcxMjcuMC4wLjEnLCAtPlxuICAgICAgICAgICAgXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAcG9ydD8uY2xvc2UoKVxuICAgICAgICBAcG9ydCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSB1ZHBcbiAgICAiXX0=
//# sourceURL=../coffee/udp.coffee