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
          log('listening', this.port.address().address, this.port.address().port);
          return this.port.setBroadcast(true);
        });
        this.port.on('message', (message, rinfo) => {
          return log('message', rinfo.address, rinfo.port, message);
        });
        this.port.bind(9669);
      } else {
        log('sender', this.opt);
        this.port.bind(() => {
          log('sender bind');
          return this.port.setBroadcast(true);
        });
      }
    }

    send(...args) {
      var buf, msg;
      msg = JSON.stringify(args);
      if (this.opt.debug) {
        log('send', msg);
      }
      buf = new Buffer(msg);
      return this.port.send(buf, 0, buf.length, 9669, '255.255.255.255', function() {
        return log('sent', msg);
      });
    }

  };

  module.exports = udp;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvdWRwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBOztFQVFBLEdBQUEsR0FBUSxPQUFPLENBQUM7O0VBQ2hCLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFFRixNQUFOLE1BQUEsSUFBQTtJQUVJLFdBQWEsSUFBQSxDQUFBO01BQUMsSUFBQyxDQUFBOztRQUVYLElBQUMsQ0FBQSxNQUFPLENBQUE7O01BRVIsSUFBQyxDQUFBLElBQUQsR0FBUSxLQUFLLENBQUMsWUFBTixDQUFtQixNQUFuQjtNQUVSLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFSO1FBQ0ksR0FBQSxDQUFJLFVBQUosRUFBZ0IsSUFBQyxDQUFBLEdBQWpCO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsV0FBVCxFQUFzQixDQUFBLENBQUEsR0FBQTtVQUNsQixHQUFBLENBQUksV0FBSixFQUFpQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFlLENBQUMsT0FBakMsRUFBMEMsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FBZSxDQUFDLElBQTFEO2lCQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsWUFBTixDQUFtQixJQUFuQjtRQUZrQixDQUF0QjtRQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLFNBQVQsRUFBb0IsQ0FBQyxPQUFELEVBQVUsS0FBVixDQUFBLEdBQUE7aUJBQ2hCLEdBQUEsQ0FBSSxTQUFKLEVBQWUsS0FBSyxDQUFDLE9BQXJCLEVBQThCLEtBQUssQ0FBQyxJQUFwQyxFQUEwQyxPQUExQztRQURnQixDQUFwQjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQVgsRUFQSjtPQUFBLE1BQUE7UUFTSSxHQUFBLENBQUksUUFBSixFQUFjLElBQUMsQ0FBQSxHQUFmO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBQSxDQUFBLEdBQUE7VUFDUCxHQUFBLENBQUksYUFBSjtpQkFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkI7UUFGTyxDQUFYLEVBVko7O0lBTlM7O0lBb0JiLElBQU0sQ0FBQSxHQUFDLElBQUQsQ0FBQTtBQUVGLFVBQUEsR0FBQSxFQUFBO01BQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZjtNQUNOLElBQW1CLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBeEI7UUFBQSxHQUFBLENBQUksTUFBSixFQUFZLEdBQVosRUFBQTs7TUFDQSxHQUFBLEdBQU0sSUFBSSxNQUFKLENBQVcsR0FBWDthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsQ0FBaEIsRUFBbUIsR0FBRyxDQUFDLE1BQXZCLEVBQStCLElBQS9CLEVBQXFDLGlCQUFyQyxFQUF3RCxRQUFBLENBQUEsQ0FBQTtlQUNwRCxHQUFBLENBQUksTUFBSixFQUFZLEdBQVo7TUFEb0QsQ0FBeEQ7SUFMRTs7RUF0QlY7O0VBOEJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBekNqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgICBcbiMjI1xuXG5sb2cgICA9IGNvbnNvbGUubG9nXG5kZ3JhbSA9IHJlcXVpcmUgJ2RncmFtJ1xuXG5jbGFzcyB1ZHBcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBcbiAgICAgICAgQHBvcnQgPSBkZ3JhbS5jcmVhdGVTb2NrZXQgJ3VkcDQnXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm9uTXNnXG4gICAgICAgICAgICBsb2cgJ3JlY2VpdmVyJywgQG9wdFxuICAgICAgICAgICAgQHBvcnQub24gJ2xpc3RlbmluZycsID0+IFxuICAgICAgICAgICAgICAgIGxvZyAnbGlzdGVuaW5nJywgQHBvcnQuYWRkcmVzcygpLmFkZHJlc3MsIEBwb3J0LmFkZHJlc3MoKS5wb3J0XG4gICAgICAgICAgICAgICAgQHBvcnQuc2V0QnJvYWRjYXN0IHRydWVcbiAgICAgICAgICAgIEBwb3J0Lm9uICdtZXNzYWdlJywgKG1lc3NhZ2UsIHJpbmZvKSA9PlxuICAgICAgICAgICAgICAgIGxvZyAnbWVzc2FnZScsIHJpbmZvLmFkZHJlc3MsIHJpbmZvLnBvcnQsIG1lc3NhZ2VcbiAgICAgICAgICAgIEBwb3J0LmJpbmQgOTY2OVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ3NlbmRlcicsIEBvcHRcbiAgICAgICAgICAgIEBwb3J0LmJpbmQgPT4gXG4gICAgICAgICAgICAgICAgbG9nICdzZW5kZXIgYmluZCdcbiAgICAgICAgICAgICAgICBAcG9ydC5zZXRCcm9hZGNhc3QgdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgIHNlbmQ6IChhcmdzLi4uKSAtPlxuICAgICAgICBcbiAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJncyBcbiAgICAgICAgbG9nICdzZW5kJywgbXNnIGlmIEBvcHQuZGVidWdcbiAgICAgICAgYnVmID0gbmV3IEJ1ZmZlciBtc2dcbiAgICAgICAgQHBvcnQuc2VuZCBidWYsIDAsIGJ1Zi5sZW5ndGgsIDk2NjksICcyNTUuMjU1LjI1NS4yNTUnLCAtPlxuICAgICAgICAgICAgbG9nICdzZW50JywgbXNnXG5cbm1vZHVsZS5leHBvcnRzID0gdWRwXG4gICAgIl19
//# sourceURL=C:/Users/kodi/s/kxk/coffee/udp.coffee