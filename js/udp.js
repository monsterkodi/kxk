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
      var base, err, log;
      this.opt = opt;
      if (this.opt == null) {
        this.opt = {};
      }
      if ((base = this.opt).port == null) {
        base.port = 9669;
      }
      log = this.opt.debug ? console.log : function() {};
      try {
        this.port = dgram.createSocket('udp4', {
          recvBufferSize: 2000000,
          sendBufferSize: 2000000
        });
        log(this.port.getSendBufferSize());
        log(this.port.getRecvBufferSize());
        if (this.opt.onMsg) {
          log('receiver', this.opt);
          this.port.on('listening', () => {
            var err;
            try {
              log('listening', this.port.address().address, this.port.address().port);
              return this.port.setBroadcast(true);
            } catch (error) {
              err = error;
              return log("[ERROR] can't listen:", err);
            }
          });
          this.port.on('message', (message, rinfo) => {
            var err, messageString, msg;
            messageString = message.toString();
            log('messageString', messageString);
            try {
              msg = JSON.parse(messageString);
            } catch (error) {
              err = error;
              log('conversion error', err);
              return;
            }
            log('message', rinfo.address, rinfo.port, msg);
            return this.opt.onMsg(msg);
          });
          this.port.on('error', (err) => {
            return log('[ERROR] port error', err);
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
      } catch (error) {
        err = error;
        this.port = null;
        log("[ERROR] can't create udp port:", err);
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
      buf = new Buffer(msg);
      log(`sending ${buf.length} bytes`);
      if (buf.length > this.port.getSendBufferSize()) {
        log(`msg too large! ${buf.length} ${this.port.getSendBufferSize()}`);
      }
      return this.port.send(buf, 0, buf.length, this.opt.port, '127.0.0.1', function() {
        return log('sent', msg);
      });
    }

    close() {
      var ref;
      if ((ref = this.port) != null) {
        ref.close();
      }
      return this.port = null;
    }

  };

  module.exports = udp;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS91ZHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLEtBQUEsRUFBQTs7RUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBRUYsTUFBTixNQUFBLElBQUE7SUFFSSxXQUFhLElBQUEsQ0FBQTtBQUVULFVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQTtNQUZVLElBQUMsQ0FBQTs7UUFFWCxJQUFDLENBQUEsTUFBTyxDQUFBOzs7WUFDSixDQUFDLE9BQVE7O01BRWIsR0FBQSxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUixHQUFtQixPQUFPLENBQUMsR0FBM0IsR0FBb0MsUUFBQSxDQUFBLENBQUEsRUFBQTtBQUUxQztRQUNJLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsTUFBbkIsRUFBMkI7VUFBQSxjQUFBLEVBQWUsT0FBZjtVQUF3QixjQUFBLEVBQWU7UUFBdkMsQ0FBM0I7UUFFUixHQUFBLENBQUksSUFBQyxDQUFBLElBQUksQ0FBQyxpQkFBTixDQUFBLENBQUo7UUFDQSxHQUFBLENBQUksSUFBQyxDQUFBLElBQUksQ0FBQyxpQkFBTixDQUFBLENBQUo7UUFFQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUjtVQUVJLEdBQUEsQ0FBSSxVQUFKLEVBQWdCLElBQUMsQ0FBQSxHQUFqQjtVQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLFdBQVQsRUFBc0IsQ0FBQSxDQUFBLEdBQUE7QUFDbEIsZ0JBQUE7QUFBQTtjQUNJLEdBQUEsQ0FBSSxXQUFKLEVBQWlCLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQWUsQ0FBQyxPQUFqQyxFQUEwQyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFlLENBQUMsSUFBMUQ7cUJBQ0EsSUFBQyxDQUFBLElB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LEVBQVksR0FBWjtNQURtRCxDQUF2RDtJQWxCRTs7SUFxQk4sS0FBTyxDQUFBLENBQUE7QUFFSCxVQUFBOztXQUFLLENBQUUsS0FBUCxDQUFBOzthQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFITDs7RUExRVg7O0VBK0VBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBekZqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgICBcbiMjI1xuXG5kZ3JhbSA9IHJlcXVpcmUgJ2RncmFtJ1xuXG5jbGFzcyB1ZHBcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBAb3B0LnBvcnQgPz0gOTY2OVxuICAgICAgICBcbiAgICAgICAgbG9nID0gaWYgQG9wdC5kZWJ1ZyB0aGVuIGNvbnNvbGUubG9nIGVsc2UgLT5cbiAgICAgICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIEBwb3J0ID0gZGdyYW0uY3JlYXRlU29ja2V0ICd1ZHA0JywgcmVjdkJ1ZmZlclNpemU6MjAwMDAwMCwgc2VuZEJ1ZmZlclNpemU6MjAwMDAwMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsb2cgQHBvcnQuZ2V0U2VuZEJ1ZmZlclNpemUoKVxuICAgICAgICAgICAgbG9nIEBwb3J0LmdldFJlY3ZCdWZmZXJTaXplKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9wdC5vbk1zZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxvZyAncmVjZWl2ZXInLCBAb3B0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQub24gJ2xpc3RlbmluZycsID0+IFxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAnbGlzdGVuaW5nJywgQHBvcnQuYWRkcmVzcygpLmFkZHJlc3MsIEBwb3J0LmFkZHJlc3MoKS5wb3J0XG4gICAgICAgICAgICAgICAgICAgICAgICBAcG9ydC5zZXRCcm9hZGNhc3QgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyBcIltFUlJPUl0gY2FuJ3QgbGlzdGVuOlwiLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0Lm9uICdtZXNzYWdlJywgKG1lc3NhZ2UsIHJpbmZvKSA9PlxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlU3RyaW5nID0gbWVzc2FnZS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnbWVzc2FnZVN0cmluZycsIG1lc3NhZ2VTdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBKU09OLnBhcnNlIG1lc3NhZ2VTdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ2NvbnZlcnNpb24gZXJyb3InLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBsb2cgJ21lc3NhZ2UnLCByaW5mby5hZGRyZXNzLCByaW5mby5wb3J0LCBtc2dcbiAgICAgICAgICAgICAgICAgICAgQG9wdC5vbk1zZyBtc2dcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgICAgICAgICAgICAgbG9nICdbRVJST1JdIHBvcnQgZXJyb3InLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQuYmluZCBAb3B0LnBvcnRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsb2cgJ3NlbmRlcicsIEBvcHRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5iaW5kID0+IFxuICAgICAgICAgICAgICAgICAgICBsb2cgJ3NlbmRlciBiaW5kJywgQHBvcnQ/LmFkZHJlc3MoKS5wb3J0XG4gICAgICAgICAgICAgICAgICAgIEBwb3J0Py5zZXRCcm9hZGNhc3QgdHJ1ZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIEBwb3J0ID0gbnVsbFxuICAgICAgICAgICAgbG9nIFwiW0VSUk9SXSBjYW4ndCBjcmVhdGUgdWRwIHBvcnQ6XCIsIGVyclxuICAgICAgICAgICAgICAgIFxuICAgIHNlbmQ6IChhcmdzLi4uKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAcG9ydFxuICAgICAgICBcbiAgICAgICAgbG9nID0gaWYgQG9wdC5kZWJ1ZyB0aGVuIGNvbnNvbGUubG9nIGVsc2UgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBhcmdzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIG1zZyA9IEpTT04uc3RyaW5naWZ5IGFyZ3NcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJnc1swXVxuICAgICAgICAgICAgXG4gICAgICAgIGJ1ZiA9IG5ldyBCdWZmZXIgbXNnXG4gICAgICAgIFxuICAgICAgICBsb2cgXCJzZW5kaW5nICN7YnVmLmxlbmd0aH0gYnl0ZXNcIlxuICAgICAgICBcbiAgICAgICAgaWYgYnVmLmxlbmd0aCA+IEBwb3J0LmdldFNlbmRCdWZmZXJTaXplKClcbiAgICAgICAgICAgIGxvZyBcIm1zZyB0b28gbGFyZ2UhICN7YnVmLmxlbmd0aH0gI3tAcG9ydC5nZXRTZW5kQnVmZmVyU2l6ZSgpfVwiXG4gICAgICAgIFxuICAgICAgICBAcG9ydC5zZW5kIGJ1ZiwgMCwgYnVmLmxlbmd0aCwgQG9wdC5wb3J0LCAnMTI3LjAuMC4xJywgLT5cbiAgICAgICAgICAgIGxvZyAnc2VudCcsIG1zZ1xuICAgICAgICAgICAgXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIFxuICAgICAgICBAcG9ydD8uY2xvc2UoKVxuICAgICAgICBAcG9ydCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSB1ZHBcbiAgICAiXX0=
//# sourceURL=../coffee/udp.coffee