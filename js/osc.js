(function() {
  /*
   0000000    0000000   0000000
  000   000  000       000     
  000   000  0000000   000     
  000   000       000  000     
   0000000   0000000    0000000
  */
  var OSC, log, osc;

  log = console.log;

  OSC = require('osc-js');

  osc = class osc {
    constructor(opt) {
      var base;
      this.onOpen = this.onOpen.bind(this);
      this.onMsg = this.onMsg.bind(this);
      this.opt = opt;
      this.msgs = [];
      if (this.opt == null) {
        this.opt = {};
      }
      if ((base = this.opt).channel == null) {
        base.channel = '/log';
      }
      this.osc = new OSC({
        plugin: new OSC.DatagramPlugin
      });
      this.osc.on('open', this.onOpen);
      if (this.opt.onMsg) {
        this.osc.on(this.opt.channel, this.onMsg);
      }
      log('osc', this.opt);
      this.osc.open();
    }

    onOpen() {
      var msg, results;
      if (this.opt.debug) {
        log('osc open', this.opt.channel);
      }
      results = [];
      while (msg = this.msgs.shift()) {
        if (this.opt.debug) {
          log('uncache', msg);
        }
        results.push(this.osc.send(new OSC.Message(this.opt.channel, msg)));
      }
      return results;
    }

    onMsg(msg) {
      if (this.opt.debug) {
        log('onMsg', JSON.parse(msg.args[0]));
      }
      return this.opt.onMsg(JSON.parse(msg.args[0]));
    }

    send(...args) {
      if (this.osc.status()) {
        if (this.opt.debug) {
          log('send', JSON.stringify(args));
        }
        return this.osc.send(new OSC.Message(this.opt.channel, JSON.stringify(args)));
      } else {
        if (this.opt.debug) {
          log('cache', JSON.stringify(args));
        }
        return this.msgs.push(JSON.stringify(args));
      }
    }

  };

  module.exports = osc;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3NjLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvb3NjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBOztFQVFBLEdBQUEsR0FBTSxPQUFPLENBQUM7O0VBQ2QsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVBLE1BQU4sTUFBQSxJQUFBO0lBRUksV0FBYSxJQUFBLENBQUE7QUFFVCxVQUFBO1VBV0osQ0FBQSxhQUFBLENBQUE7VUFNQSxDQUFBLFlBQUEsQ0FBQTtNQW5CYyxJQUFDLENBQUE7TUFFWCxJQUFDLENBQUEsSUFBRCxHQUFROztRQUVSLElBQUMsQ0FBQSxNQUFPLENBQUE7OztZQUNKLENBQUMsVUFBVzs7TUFFaEIsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLEdBQUosQ0FBUTtRQUFBLE1BQUEsRUFBUSxJQUFJLEdBQUcsQ0FBQztNQUFoQixDQUFSO01BQ1AsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsTUFBakI7TUFDQSxJQUFnQyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQXJDO1FBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFiLEVBQXNCLElBQUMsQ0FBQSxLQUF2QixFQUFBOztNQUNBLEdBQUEsQ0FBSSxLQUFKLEVBQVcsSUFBQyxDQUFBLEdBQVo7TUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBQTtJQVhTOztJQWFiLE1BQVEsQ0FBQSxDQUFBO0FBQ0osVUFBQSxHQUFBLEVBQUE7TUFBQSxJQUFnQyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQXJDO1FBQUEsR0FBQSxDQUFJLFVBQUosRUFBZ0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFyQixFQUFBOztBQUNBO2FBQU0sR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBLENBQVo7UUFDSSxJQUFzQixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQTNCO1VBQUEsR0FBQSxDQUFJLFNBQUosRUFBZSxHQUFmLEVBQUE7O3FCQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQUksR0FBRyxDQUFDLE9BQVIsQ0FBZ0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFyQixFQUE4QixHQUE5QixDQUFWO01BRkosQ0FBQTs7SUFGSTs7SUFNUixLQUFPLENBQUMsR0FBRCxDQUFBO01BQ0gsSUFBd0MsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUE3QztRQUFBLEdBQUEsQ0FBSSxPQUFKLEVBQWEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBcEIsQ0FBYixFQUFBOzthQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXBCLENBQVg7SUFGRzs7SUFJUCxJQUFNLENBQUEsR0FBQyxJQUFELENBQUE7TUFFRixJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFBLENBQUg7UUFDSSxJQUFvQyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQXpDO1VBQUEsR0FBQSxDQUFJLE1BQUosRUFBWSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsQ0FBWixFQUFBOztlQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQUksR0FBRyxDQUFDLE9BQVIsQ0FBZ0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFyQixFQUE4QixJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsQ0FBOUIsQ0FBVixFQUZKO09BQUEsTUFBQTtRQUlJLElBQXFDLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBMUM7VUFBQSxHQUFBLENBQUksT0FBSixFQUFhLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixDQUFiLEVBQUE7O2VBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLENBQVgsRUFMSjs7SUFGRTs7RUF6QlY7O0VBa0NBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBN0NqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgIFxuMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIyNcblxubG9nID0gY29uc29sZS5sb2dcbk9TQyA9IHJlcXVpcmUgJ29zYy1qcycgXG5cbmNsYXNzIG9zY1xuXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgQG1zZ3MgPSBbXVxuICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBAb3B0LmNoYW5uZWwgPz0gJy9sb2cnXG4gICAgICAgIFxuICAgICAgICBAb3NjID0gbmV3IE9TQyBwbHVnaW46IG5ldyBPU0MuRGF0YWdyYW1QbHVnaW5cbiAgICAgICAgQG9zYy5vbiAnb3BlbicsIEBvbk9wZW5cbiAgICAgICAgQG9zYy5vbiBAb3B0LmNoYW5uZWwsIEBvbk1zZyBpZiBAb3B0Lm9uTXNnXG4gICAgICAgIGxvZyAnb3NjJywgQG9wdFxuICAgICAgICBAb3NjLm9wZW4oKVxuICAgICAgICBcbiAgICBvbk9wZW46ID0+XG4gICAgICAgIGxvZyAnb3NjIG9wZW4nLCBAb3B0LmNoYW5uZWwgaWYgQG9wdC5kZWJ1Z1xuICAgICAgICB3aGlsZSBtc2cgPSBAbXNncy5zaGlmdCgpXG4gICAgICAgICAgICBsb2cgJ3VuY2FjaGUnLCBtc2cgaWYgQG9wdC5kZWJ1Z1xuICAgICAgICAgICAgQG9zYy5zZW5kIG5ldyBPU0MuTWVzc2FnZSBAb3B0LmNoYW5uZWwsIG1zZ1xuICAgICAgICBcbiAgICBvbk1zZzogKG1zZykgPT4gXG4gICAgICAgIGxvZyAnb25Nc2cnLCBKU09OLnBhcnNlKG1zZy5hcmdzWzBdKSBpZiBAb3B0LmRlYnVnXG4gICAgICAgIEBvcHQub25Nc2cgSlNPTi5wYXJzZSBtc2cuYXJnc1swXVxuICAgICAgICBcbiAgICBzZW5kOiAoYXJncy4uLikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBvc2Muc3RhdHVzKClcbiAgICAgICAgICAgIGxvZyAnc2VuZCcsIEpTT04uc3RyaW5naWZ5KGFyZ3MpIGlmIEBvcHQuZGVidWdcbiAgICAgICAgICAgIEBvc2Muc2VuZCBuZXcgT1NDLk1lc3NhZ2UgQG9wdC5jaGFubmVsLCBKU09OLnN0cmluZ2lmeSBhcmdzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyAnY2FjaGUnLCBKU09OLnN0cmluZ2lmeShhcmdzKSBpZiBAb3B0LmRlYnVnXG4gICAgICAgICAgICBAbXNncy5wdXNoIEpTT04uc3RyaW5naWZ5IGFyZ3NcblxubW9kdWxlLmV4cG9ydHMgPSBvc2NcbiAgICAiXX0=
//# sourceURL=C:/Users/kodi/s/kxk/coffee/osc.coffee