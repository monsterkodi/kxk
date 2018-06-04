(function() {
  /*
  000   000  0000000    00000000   
  000   000  000   000  000   000  
  000   000  000   000  00000000   
  000   000  000   000  000        
   0000000   0000000    000        
  */
  var dgram, udp;

  dgram = require('dgram');

  udp = class udp {
    constructor(opt) {
      var base, log;
      this.opt = opt;
      if (this.opt == null) {
        this.opt = {};
      }
      if ((base = this.opt).port == null) {
        base.port = 9669;
      }
      this.port = dgram.createSocket('udp4');
      log = this.opt.debug ? console.log : function() {};
      if (this.opt.onMsg) {
        log('receiver', this.opt);
        this.port.on('listening', () => {
          log('listening', this.port.address().address, this.port.address().port);
          return this.port.setBroadcast(true);
        });
        this.port.on('message', (message, rinfo) => {
          var msg;
          msg = JSON.parse(message.toString());
          log('message', rinfo.address, rinfo.port, msg);
          return this.opt.onMsg(msg);
        });
        this.port.bind(this.opt.port);
      } else {
        log('sender', this.opt);
        this.port.bind(() => {
          var ref, ref1;
          log('sender bind', (ref = this.port) != null ? ref.address().port : void 0);
          return (ref1 = this.port) != null ? ref1.setBroadcast(true) : void 0;
        });
      }
    }

    send(...args) {
      var buf, log, msg;
      if (!this.port) {
        return;
      }
      log = this.opt.debug ? console.log : function() {};
      if (args.length > 1) {
        msg = JSON.stringify(args);
      } else {
        msg = JSON.stringify(args[0]);
      }
      // log 'send', msg if @opt.debug
      buf = new Buffer(msg);
      return this.port.send(buf, 0, buf.length, this.opt.port, '255.255.255.255', function() {
        return log('sent', msg);
      });
    }

    close() {
      this.port.close();
      return this.port = null;
    }

  };

  module.exports = udp;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvdWRwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxLQUFBLEVBQUE7O0VBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUVGLE1BQU4sTUFBQSxJQUFBO0lBRUksV0FBYSxJQUFBLENBQUE7QUFFVCxVQUFBLElBQUEsRUFBQTtNQUZVLElBQUMsQ0FBQTs7UUFFWCxJQUFDLENBQUEsTUFBTyxDQUFBOzs7WUFDSixDQUFDLE9BQVE7O01BRWIsSUFBQyxDQUFBLElBQUQsR0FBUSxLQUFLLENBQUMsWUFBTixDQUFtQixNQUFuQjtNQUVSLEdBQUEsR0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQVIsR0FBbUIsT0FBTyxDQUFDLEdBQTNCLEdBQW9DLFFBQUEsQ0FBQSxDQUFBLEVBQUE7TUFFMUMsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQVI7UUFDSSxHQUFBLENBQUksVUFBSixFQUFnQixJQUFDLENBQUEsR0FBakI7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxXQUFULEVBQXNCLENBQUEsQ0FBQSxHQUFBO1VBQ2xCLEdBQUEsQ0FBSSxXQUFKLEVBQWlCLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQWUsQ0FBQyxPQUFqQyxFQUEwQyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFlLENBQUMsSUFBMUQ7aUJBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFOLENBQW1CLElBQW5CO1FBRmtCLENBQXRCO1FBR0EsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixDQUFDLE9BQUQsRUFBVSxLQUFWLENBQUEsR0FBQTtBQUNoQixjQUFBO1VBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBTyxDQUFDLFFBQVIsQ0FBQSxDQUFYO1VBQ04sR0FBQSxDQUFJLFNBQUosRUFBZSxLQUFLLENBQUMsT0FBckIsRUFBOEIsS0FBSyxDQUFDLElBQXBDLEVBQTBDLEdBQTFDO2lCQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEdBQVg7UUFIZ0IsQ0FBcEI7UUFJQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWhCLEVBVEo7T0FBQSxNQUFBO1FBV0ksR0FBQSxDQUFJLFFBQUosRUFBYyxJQUFDLENBQUEsR0FBZjtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLENBQUEsQ0FBQSxHQUFBO0FBQ1AsY0FBQSxHQUFBLEVBQUE7VUFBQSxHQUFBLENBQUksYUFBSixpQ0FBd0IsQ0FBRSxPQUFQLENBQUEsQ0FBZ0IsQ0FBQyxhQUFwQztrREFDSyxDQUFFLFlBQVAsQ0FBb0IsSUFBcEI7UUFGTyxDQUFYLEVBWko7O0lBVFM7O0lBeUJiLElBQU0sQ0FBQSxHQUFDLElBQUQsQ0FBQTtBQUVGLFVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQTtNQUFBLElBQVUsQ0FBSSxJQUFDLENBQUEsSUFBZjtBQUFBLGVBQUE7O01BRUEsR0FBQSxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUixHQUFtQixPQUFPLENBQUMsR0FBM0IsR0FBb0MsUUFBQSxDQUFBLENBQUEsRUFBQTtNQUUxQyxJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7UUFDSSxHQUFBLEdBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLEVBRFY7T0FBQSxNQUFBO1FBR0ksR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBSyxDQUFBLENBQUEsQ0FBcEIsRUFIVjtPQUpBOztNQVNBLEdBQUEsR0FBTSxJQUFJLE1BQUosQ0FBVyxHQUFYO2FBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUFnQixDQUFoQixFQUFtQixHQUFHLENBQUMsTUFBdkIsRUFBK0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFwQyxFQUEwQyxpQkFBMUMsRUFBNkQsUUFBQSxDQUFBLENBQUE7ZUFDekQsR0FBQSxDQUFJLE1BQUosRUFBWSxHQUFaO01BRHlELENBQTdEO0lBWkU7O0lBZU4sS0FBTyxDQUFBLENBQUE7TUFFSCxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQTthQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFITDs7RUExQ1g7O0VBK0NBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBekRqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgICBcbiMjI1xuXG5kZ3JhbSA9IHJlcXVpcmUgJ2RncmFtJ1xuXG5jbGFzcyB1ZHBcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBAb3B0LnBvcnQgPz0gOTY2OVxuICAgICAgICBcbiAgICAgICAgQHBvcnQgPSBkZ3JhbS5jcmVhdGVTb2NrZXQgJ3VkcDQnXG4gICAgICAgIFxuICAgICAgICBsb2cgPSBpZiBAb3B0LmRlYnVnIHRoZW4gY29uc29sZS5sb2cgZWxzZSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5vbk1zZ1xuICAgICAgICAgICAgbG9nICdyZWNlaXZlcicsIEBvcHRcbiAgICAgICAgICAgIEBwb3J0Lm9uICdsaXN0ZW5pbmcnLCA9PiBcbiAgICAgICAgICAgICAgICBsb2cgJ2xpc3RlbmluZycsIEBwb3J0LmFkZHJlc3MoKS5hZGRyZXNzLCBAcG9ydC5hZGRyZXNzKCkucG9ydFxuICAgICAgICAgICAgICAgIEBwb3J0LnNldEJyb2FkY2FzdCB0cnVlXG4gICAgICAgICAgICBAcG9ydC5vbiAnbWVzc2FnZScsIChtZXNzYWdlLCByaW5mbykgPT5cbiAgICAgICAgICAgICAgICBtc2cgPSBKU09OLnBhcnNlIG1lc3NhZ2UudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIGxvZyAnbWVzc2FnZScsIHJpbmZvLmFkZHJlc3MsIHJpbmZvLnBvcnQsIG1zZ1xuICAgICAgICAgICAgICAgIEBvcHQub25Nc2cgbXNnXG4gICAgICAgICAgICBAcG9ydC5iaW5kIEBvcHQucG9ydFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ3NlbmRlcicsIEBvcHRcbiAgICAgICAgICAgIEBwb3J0LmJpbmQgPT4gXG4gICAgICAgICAgICAgICAgbG9nICdzZW5kZXIgYmluZCcsIEBwb3J0Py5hZGRyZXNzKCkucG9ydFxuICAgICAgICAgICAgICAgIEBwb3J0Py5zZXRCcm9hZGNhc3QgdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgIHNlbmQ6IChhcmdzLi4uKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAcG9ydFxuICAgICAgICBcbiAgICAgICAgbG9nID0gaWYgQG9wdC5kZWJ1ZyB0aGVuIGNvbnNvbGUubG9nIGVsc2UgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIG1zZyA9IEpTT04uc3RyaW5naWZ5IGFyZ3NcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJnc1swXVxuICAgICAgICAjIGxvZyAnc2VuZCcsIG1zZyBpZiBAb3B0LmRlYnVnXG4gICAgICAgIGJ1ZiA9IG5ldyBCdWZmZXIgbXNnXG4gICAgICAgIEBwb3J0LnNlbmQgYnVmLCAwLCBidWYubGVuZ3RoLCBAb3B0LnBvcnQsICcyNTUuMjU1LjI1NS4yNTUnLCAtPlxuICAgICAgICAgICAgbG9nICdzZW50JywgbXNnXG4gICAgICAgICAgICBcbiAgICBjbG9zZTogLT5cbiAgICAgICAgXG4gICAgICAgIEBwb3J0LmNsb3NlKClcbiAgICAgICAgQHBvcnQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gdWRwXG4gICAgIl19
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/udp.coffee