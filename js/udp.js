(function() {
  /*
  000   000  0000000    00000000   
  000   000  000   000  000   000  
  000   000  000   000  00000000   
  000   000  000   000  000        
   0000000   0000000    000        
  */
  var dgram, log, udp;

  log = console.log;

  dgram = require('dgram');

  udp = class udp {
    constructor(opt) {
      this.opt = opt;
      if (this.opt == null) {
        this.opt = {};
      }
      this.port = dgram.createSocket('udp4');
      if (this.opt.onMsg) {
        log('receiver', this.opt);
        this.port.on('listening', () => {
          if (this.opt.debug) {
            log('listening', this.port.address().address, this.port.address().port);
          }
          return this.port.setBroadcast(true);
        });
        this.port.on('message', (message, rinfo) => {
          var msg;
          msg = JSON.parse(message.toString());
          if (this.opt.debug) {
            log('message', rinfo.address, rinfo.port, msg);
          }
          return this.opt.onMsg(msg);
        });
        this.port.bind(9669);
      } else {
        if (this.opt.debug) {
          log('sender', this.opt);
        }
        this.port.bind(() => {
          if (this.opt.debug) {
            log('sender bind');
          }
          return this.port.setBroadcast(true);
        });
      }
    }

    send(...args) {
      var buf, msg;
      if (args.length > 1) {
        msg = JSON.stringify(args);
      } else {
        msg = JSON.stringify(args[0]);
      }
      // log 'send', msg if @opt.debug
      buf = new Buffer(msg);
      return this.port.send(buf, 0, buf.length, 9669, '255.255.255.255', () => {
        if (this.opt.debug) {
          return log('sent', msg);
        }
      });
    }

  };

  module.exports = udp;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvdWRwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBOztFQVFBLEdBQUEsR0FBUSxPQUFPLENBQUM7O0VBQ2hCLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFFRixNQUFOLE1BQUEsSUFBQTtJQUVJLFdBQWEsSUFBQSxDQUFBO01BQUMsSUFBQyxDQUFBOztRQUVYLElBQUMsQ0FBQSxNQUFPLENBQUE7O01BRVIsSUFBQyxDQUFBLElBQUQsR0FBUSxLQUFLLENBQUMsWUFBTixDQUFtQixNQUFuQjtNQUVSLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFSO1FBQ0ksR0FBQSxDQUFJLFVBQUosRUFBZ0IsSUFBQyxDQUFBLEdBQWpCO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsV0FBVCxFQUFzQixDQUFBLENBQUEsR0FBQTtVQUNsQixJQUFrRSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQXZFO1lBQUEsR0FBQSxDQUFJLFdBQUosRUFBaUIsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FBZSxDQUFDLE9BQWpDLEVBQTBDLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQWUsQ0FBQyxJQUExRCxFQUFBOztpQkFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkI7UUFGa0IsQ0FBdEI7UUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxTQUFULEVBQW9CLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FBQSxHQUFBO0FBQ2hCLGNBQUE7VUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFPLENBQUMsUUFBUixDQUFBLENBQVg7VUFDTixJQUFpRCxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQXREO1lBQUEsR0FBQSxDQUFJLFNBQUosRUFBZSxLQUFLLENBQUMsT0FBckIsRUFBOEIsS0FBSyxDQUFDLElBQXBDLEVBQTBDLEdBQTFDLEVBQUE7O2lCQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEdBQVg7UUFIZ0IsQ0FBcEI7UUFJQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBVEo7T0FBQSxNQUFBO1FBV0ksSUFBc0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUEzQjtVQUFBLEdBQUEsQ0FBSSxRQUFKLEVBQWMsSUFBQyxDQUFBLEdBQWYsRUFBQTs7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFBLENBQUEsR0FBQTtVQUNQLElBQXFCLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBMUI7WUFBQSxHQUFBLENBQUksYUFBSixFQUFBOztpQkFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkI7UUFGTyxDQUFYLEVBWko7O0lBTlM7O0lBc0JiLElBQU0sQ0FBQSxHQUFDLElBQUQsQ0FBQTtBQUVGLFVBQUEsR0FBQSxFQUFBO01BQUEsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1FBQ0ksR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQURWO09BQUEsTUFBQTtRQUdJLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUssQ0FBQSxDQUFBLENBQXBCLEVBSFY7T0FBQTs7TUFLQSxHQUFBLEdBQU0sSUFBSSxNQUFKLENBQVcsR0FBWDthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsQ0FBaEIsRUFBbUIsR0FBRyxDQUFDLE1BQXZCLEVBQStCLElBQS9CLEVBQXFDLGlCQUFyQyxFQUF3RCxDQUFBLENBQUEsR0FBQTtRQUNwRCxJQUFtQixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQXhCO2lCQUFBLEdBQUEsQ0FBSSxNQUFKLEVBQVksR0FBWixFQUFBOztNQURvRCxDQUF4RDtJQVJFOztFQXhCVjs7RUFtQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE5Q2pCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAgICAgIFxuIyMjXG5cbmxvZyAgID0gY29uc29sZS5sb2dcbmRncmFtID0gcmVxdWlyZSAnZGdyYW0nXG5cbmNsYXNzIHVkcFxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIFxuICAgICAgICBAcG9ydCA9IGRncmFtLmNyZWF0ZVNvY2tldCAndWRwNCdcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQub25Nc2dcbiAgICAgICAgICAgIGxvZyAncmVjZWl2ZXInLCBAb3B0XG4gICAgICAgICAgICBAcG9ydC5vbiAnbGlzdGVuaW5nJywgPT4gXG4gICAgICAgICAgICAgICAgbG9nICdsaXN0ZW5pbmcnLCBAcG9ydC5hZGRyZXNzKCkuYWRkcmVzcywgQHBvcnQuYWRkcmVzcygpLnBvcnQgaWYgQG9wdC5kZWJ1Z1xuICAgICAgICAgICAgICAgIEBwb3J0LnNldEJyb2FkY2FzdCB0cnVlXG4gICAgICAgICAgICBAcG9ydC5vbiAnbWVzc2FnZScsIChtZXNzYWdlLCByaW5mbykgPT5cbiAgICAgICAgICAgICAgICBtc2cgPSBKU09OLnBhcnNlIG1lc3NhZ2UudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIGxvZyAnbWVzc2FnZScsIHJpbmZvLmFkZHJlc3MsIHJpbmZvLnBvcnQsIG1zZyBpZiBAb3B0LmRlYnVnXG4gICAgICAgICAgICAgICAgQG9wdC5vbk1zZyBtc2dcbiAgICAgICAgICAgIEBwb3J0LmJpbmQgOTY2OVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ3NlbmRlcicsIEBvcHQgaWYgQG9wdC5kZWJ1Z1xuICAgICAgICAgICAgQHBvcnQuYmluZCA9PiBcbiAgICAgICAgICAgICAgICBsb2cgJ3NlbmRlciBiaW5kJyBpZiBAb3B0LmRlYnVnXG4gICAgICAgICAgICAgICAgQHBvcnQuc2V0QnJvYWRjYXN0IHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICBzZW5kOiAoYXJncy4uLikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGFyZ3MubGVuZ3RoID4gMVxuICAgICAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJnc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtc2cgPSBKU09OLnN0cmluZ2lmeSBhcmdzWzBdXG4gICAgICAgICMgbG9nICdzZW5kJywgbXNnIGlmIEBvcHQuZGVidWdcbiAgICAgICAgYnVmID0gbmV3IEJ1ZmZlciBtc2dcbiAgICAgICAgQHBvcnQuc2VuZCBidWYsIDAsIGJ1Zi5sZW5ndGgsIDk2NjksICcyNTUuMjU1LjI1NS4yNTUnLCA9PlxuICAgICAgICAgICAgbG9nICdzZW50JywgbXNnIGlmIEBvcHQuZGVidWdcblxubW9kdWxlLmV4cG9ydHMgPSB1ZHBcbiAgICAiXX0=
//# sourceURL=C:/Users/kodi/s/kxk/coffee/udp.coffee