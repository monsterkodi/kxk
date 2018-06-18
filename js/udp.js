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
        this.port = dgram.createSocket('udp4');
        if (this.opt.onMsg) {
          log('receiver', this.opt);
          this.port.on('listening', () => {
            var err;
            try {
              log('listening', this.port.address().address, this.port.address().port);
              this.port.setBroadcast(true);
              this.port.setRecvBufferSize(2000000);
              return log('req size', this.port.getRecvBufferSize());
            } catch (error) {
              err = error;
              return log("[ERROR] can't listen:", err);
            }
          });
          this.port.on('message', (message, rinfo) => {
            var err, messageString, msg;
            this.port.setSendBufferSize(2000000);
            log('send size', this.port.getSendBufferSize());
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS91ZHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLEtBQUEsRUFBQTs7RUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBRUYsTUFBTixNQUFBLElBQUE7SUFFSSxXQUFhLElBQUEsQ0FBQTtBQUVULFVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQTtNQUZVLElBQUMsQ0FBQTs7UUFFWCxJQUFDLENBQUEsTUFBTyxDQUFBOzs7WUFDSixDQUFDLE9BQVE7O01BRWIsR0FBQSxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUixHQUFtQixPQUFPLENBQUMsR0FBM0IsR0FBb0MsUUFBQSxDQUFBLENBQUEsRUFBQTtBQUUxQztRQUNJLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsTUFBbkI7UUFFUixJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBUjtVQUVJLEdBQUEsQ0FBSSxVQUFKLEVBQWdCLElBQUMsQ0FBQSxHQUFqQjtVQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLFdBQVQsRUFBc0IsQ0FBQSxDQUFBLEdBQUE7QUFDbEIsZ0JBQUE7QUFBQTtjQUNJLEdBQUEsQ0FBSSxXQUFKLEVBQWlCLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQWUsQ0FBQyxPQUFqQyxFQUEwQyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFlLENBQUMsSUFBMUQ7Y0FDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkI7Y0FDQSxJQUFDLENBQUEsSUFBSSxDQUFDLGlCQUFOLENBQXdCLE9BQXhCO3FCQUNBLEdBQUEsQ0FBSSxVQUFKLEVBQWlCLElBQUMsQ0FBQSxJQUFJLENBQUMsaUJBQU4sQ0FBQSxDQUFqQixFQUpKO2FBQUEsYUFBQTtjQU1NO3FCQUNG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cEMsRUFBMEMsV0FBMUMsRUFBdUQsUUFBQSxDQUFBLENBQUE7ZUFDbkQsR0FBQSxDQUFJLE1BQUosRUFBWSxHQUFaO01BRG1ELENBQXZEO0lBbEJFOztJQXFCTixLQUFPLENBQUEsQ0FBQTtBQUVILFVBQUE7O1dBQUssQ0FBRSxLQUFQLENBQUE7O2FBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUhMOztFQTVFWDs7RUFpRkEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUEzRmpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAgICAgIFxuIyMjXG5cbmRncmFtID0gcmVxdWlyZSAnZGdyYW0nXG5cbmNsYXNzIHVkcFxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIEBvcHQucG9ydCA/PSA5NjY5XG4gICAgICAgIFxuICAgICAgICBsb2cgPSBpZiBAb3B0LmRlYnVnIHRoZW4gY29uc29sZS5sb2cgZWxzZSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgQHBvcnQgPSBkZ3JhbS5jcmVhdGVTb2NrZXQgJ3VkcDQnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBvcHQub25Nc2dcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsb2cgJ3JlY2VpdmVyJywgQG9wdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0Lm9uICdsaXN0ZW5pbmcnLCA9PiBcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ2xpc3RlbmluZycsIEBwb3J0LmFkZHJlc3MoKS5hZGRyZXNzLCBAcG9ydC5hZGRyZXNzKCkucG9ydFxuICAgICAgICAgICAgICAgICAgICAgICAgQHBvcnQuc2V0QnJvYWRjYXN0IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwb3J0LnNldFJlY3ZCdWZmZXJTaXplIDIwMDAwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAncmVxIHNpemUnLCAgQHBvcnQuZ2V0UmVjdkJ1ZmZlclNpemUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nIFwiW0VSUk9SXSBjYW4ndCBsaXN0ZW46XCIsIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQub24gJ21lc3NhZ2UnLCAobWVzc2FnZSwgcmluZm8pID0+XG4gICAgICAgICAgICAgICAgICAgIEBwb3J0LnNldFNlbmRCdWZmZXJTaXplIDIwMDAwMDBcbiAgICAgICAgICAgICAgICAgICAgbG9nICdzZW5kIHNpemUnLCBAcG9ydC5nZXRTZW5kQnVmZmVyU2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VTdHJpbmcgPSBtZXNzYWdlLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgbG9nICdtZXNzYWdlU3RyaW5nJywgbWVzc2FnZVN0cmluZ1xuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZyA9IEpTT04ucGFyc2UgbWVzc2FnZVN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAnY29udmVyc2lvbiBlcnJvcicsIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnbWVzc2FnZScsIHJpbmZvLmFkZHJlc3MsIHJpbmZvLnBvcnQsIG1zZ1xuICAgICAgICAgICAgICAgICAgICBAb3B0Lm9uTXNnIG1zZ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICAgICAgICAgICAgICBsb2cgJ1tFUlJPUl0gcG9ydCBlcnJvcicsIGVyclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5iaW5kIEBvcHQucG9ydFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxvZyAnc2VuZGVyJywgQG9wdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0LmJpbmQgPT4gXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnc2VuZGVyIGJpbmQnLCBAcG9ydD8uYWRkcmVzcygpLnBvcnRcbiAgICAgICAgICAgICAgICAgICAgQHBvcnQ/LnNldEJyb2FkY2FzdCB0cnVlXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgQHBvcnQgPSBudWxsXG4gICAgICAgICAgICBsb2cgXCJbRVJST1JdIGNhbid0IGNyZWF0ZSB1ZHAgcG9ydDpcIiwgZXJyXG4gICAgICAgICAgICAgICAgXG4gICAgc2VuZDogKGFyZ3MuLi4pIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBwb3J0XG4gICAgICAgIFxuICAgICAgICBsb2cgPSBpZiBAb3B0LmRlYnVnIHRoZW4gY29uc29sZS5sb2cgZWxzZSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGFyZ3MubGVuZ3RoID4gMVxuICAgICAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJnc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtc2cgPSBKU09OLnN0cmluZ2lmeSBhcmdzWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgYnVmID0gbmV3IEJ1ZmZlciBtc2dcbiAgICAgICAgXG4gICAgICAgIGxvZyBcInNlbmRpbmcgI3tidWYubGVuZ3RofSBieXRlc1wiXG4gICAgICAgIFxuICAgICAgICBpZiBidWYubGVuZ3RoID4gQHBvcnQuZ2V0U2VuZEJ1ZmZlclNpemUoKVxuICAgICAgICAgICAgbG9nIFwibXNnIHRvbyBsYXJnZSEgI3tidWYubGVuZ3RofSAje0Bwb3J0LmdldFNlbmRCdWZmZXJTaXplKCl9XCJcbiAgICAgICAgXG4gICAgICAgIEBwb3J0LnNlbmQgYnVmLCAwLCBidWYubGVuZ3RoLCBAb3B0LnBvcnQsICcxMjcuMC4wLjEnLCAtPlxuICAgICAgICAgICAgbG9nICdzZW50JywgbXNnXG4gICAgICAgICAgICBcbiAgICBjbG9zZTogLT5cbiAgICAgICAgXG4gICAgICAgIEBwb3J0Py5jbG9zZSgpXG4gICAgICAgIEBwb3J0ID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IHVkcFxuICAgICJdfQ==
//# sourceURL=../coffee/udp.coffee