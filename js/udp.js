// Generated by CoffeeScript 1.12.7

/*
000   000  0000000    00000000   
000   000  000   000  000   000  
000   000  000   000  00000000   
000   000  000   000  000        
 0000000   0000000    000
 */

(function() {
  var dgram, udp,
    slice = [].slice;

  dgram = require('dgram');

  udp = (function() {
    function udp(opt) {
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
        this.port.on('listening', (function(_this) {
          return function() {
            log('listening', _this.port.address().address, _this.port.address().port);
            return _this.port.setBroadcast(true);
          };
        })(this));
        this.port.on('message', (function(_this) {
          return function(message, rinfo) {
            var msg;
            msg = JSON.parse(message.toString());
            log('message', rinfo.address, rinfo.port, msg);
            return _this.opt.onMsg(msg);
          };
        })(this));
        this.port.bind(this.opt.port);
      } else {
        log('sender', this.opt);
        this.port.bind((function(_this) {
          return function() {
            var ref, ref1;
            log('sender bind', (ref = _this.port) != null ? ref.address().port : void 0);
            return (ref1 = _this.port) != null ? ref1.setBroadcast(true) : void 0;
          };
        })(this));
      }
    }

    udp.prototype.send = function() {
      var args, buf, log, msg;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
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
      return this.port.send(buf, 0, buf.length, this.opt.port, '255.255.255.255', function() {
        return log('sent', msg);
      });
    };

    udp.prototype.close = function() {
      this.port.close();
      return this.port = null;
    };

    return udp;

  })();

  module.exports = udp;

}).call(this);
