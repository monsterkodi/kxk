
/*
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000
 */
var $, Win, _, elem, empty, fs, keyinfo, log, popup, pos, post, prefs, ref, scheme, slash, stopEvent, str, title, valid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), post = ref.post, keyinfo = ref.keyinfo, title = ref.title, scheme = ref.scheme, stopEvent = ref.stopEvent, prefs = ref.prefs, slash = ref.slash, elem = ref.elem, empty = ref.empty, valid = ref.valid, popup = ref.popup, pos = ref.pos, str = ref.str, fs = ref.fs, log = ref.log, $ = ref.$, _ = ref._;

Win = (function() {
  function Win(opt) {
    var electron, onLoad, onShow;
    this.opt = opt;
    this.onKeyUp = bind(this.onKeyUp, this);
    this.onKeyDown = bind(this.onKeyDown, this);
    this.onContextMenu = bind(this.onContextMenu, this);
    this.onMenuAction = bind(this.onMenuAction, this);
    window.onerror = function(msg, source, line, col, err) {
      var srcmap;
      console.log('window.onerror', msg, source, line, col);
      srcmap = require('./srcmap');
      srcmap.logErr(err);
      return true;
    };
    prefs.init();
    if (this.opt.icon) {
      log.slog.icon = slash.fileUrl(slash.join(this.opt.dir, this.opt.icon));
    }
    electron = require('electron');
    this.win = window.win = electron.remote.getCurrentWindow();
    this.id = window.winID = this.win.id;
    this.modifiers = '';
    this.userData = slash.userData();
    post.on('menuAction', this.onMenuAction);
    window.titlebar = new title(this.opt);
    document.body.addEventListener('contextmenu', this.onContextMenu);
    if (!this.opt.nokeys) {
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
    }
    if (this.opt.scheme !== false) {
      scheme.set(prefs.get('scheme', 'dark'));
    }
    if (_.isFunction(this.opt.onShow)) {
      onShow = (function(_this) {
        return function() {
          _this.opt.onShow();
          return _this.win.removeListener('ready-to-show', onShow);
        };
      })(this);
      this.win.on('ready-to-show', onShow);
    }
    if (_.isFunction(this.opt.onLoad)) {
      onLoad = (function(_this) {
        return function() {
          _this.opt.onLoad();
          return _this.win.webContents.removeListener('did-finish-load', onLoad);
        };
      })(this);
      this.win.webContents.on('did-finish-load', onLoad);
    }
  }

  Win.prototype.screenshot = function() {
    return this.win.capturePage((function(_this) {
      return function(img) {
        var file;
        file = slash.resolve("~/Desktop/" + _this.opt.pkg.name + "-screenshot.png");
        return fs.writeFile(file, img.toPNG(), function(err) {
          if (valid(err)) {
            return log('saving screenshot failed', err);
          } else {
            return log("screenshot saved to " + file);
          }
        });
      };
    })(this));
  };

  Win.prototype.onMenuAction = function(action, args) {
    switch (action) {
      case 'Screenshot':
        return this.screenshot();
      case 'About':
        return post.toMain('showAbout');
      case 'Save':
        return post.toMain('saveBuffer');
      case 'Quit':
        return post.toMain('quitApp');
    }
  };

  Win.prototype.onContextMenu = function(event) {
    var absPos, items;
    this.win.focus();
    absPos = pos(event);
    if (absPos == null) {
      absPos = pos($("#main").getBoundingClientRect().left, $("#main").getBoundingClientRect().top);
    }
    items = _.clone(window.titlebar.menuTemplate());
    if (_.isFunction(this.opt.context)) {
      items = this.opt.context(items);
      if (empty(items)) {
        return;
      }
    } else {
      items.unshift({
        text: 'Clear',
        accel: 'cmdctrl+k'
      });
    }
    return popup.menu({
      items: items,
      x: absPos.x,
      y: absPos.y,
      onClose: function() {
        return post.emit('contextClosed');
      }
    });
  };

  Win.prototype.onKeyDown = function(event) {
    var info;
    if ('unhandled' !== window.titlebar.handleKey(event, true)) {
      return stopEvent(event);
    }
    info = keyinfo.forEvent(event);
    this.modifiers = info.mod;
    info.event = event;
    return post.emit('combo', info.combo, info);
  };

  Win.prototype.onKeyUp = function(event) {
    var info;
    info = keyinfo.forEvent(event);
    return this.modifiers = info.mod;
  };

  return Win;

})();

module.exports = Win;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1IQUFBO0VBQUE7O0FBUUEsTUFBZ0gsT0FBQSxDQUFRLE9BQVIsQ0FBaEgsRUFBRSxlQUFGLEVBQVEscUJBQVIsRUFBaUIsaUJBQWpCLEVBQXdCLG1CQUF4QixFQUFnQyx5QkFBaEMsRUFBMkMsaUJBQTNDLEVBQWtELGlCQUFsRCxFQUF5RCxlQUF6RCxFQUErRCxpQkFBL0QsRUFBc0UsaUJBQXRFLEVBQTZFLGlCQUE3RSxFQUFvRixhQUFwRixFQUF5RixhQUF6RixFQUE4RixXQUE5RixFQUFrRyxhQUFsRyxFQUF1RyxTQUF2RyxFQUEwRzs7QUFFcEc7RUFFVyxhQUFDLEdBQUQ7QUFFVCxRQUFBO0lBRlUsSUFBQyxDQUFBLE1BQUQ7Ozs7O0lBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFELEVBQU0sTUFBTixFQUFjLElBQWQsRUFBb0IsR0FBcEIsRUFBeUIsR0FBekI7QUFFYixVQUFBO01BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWixFQUE4QixHQUE5QixFQUFtQyxNQUFuQyxFQUEyQyxJQUEzQyxFQUFpRCxHQUFqRDtNQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjtNQUNULE1BQU0sQ0FBQyxNQUFQLENBQWMsR0FBZDthQUNBO0lBTGE7SUFPakIsS0FBSyxDQUFDLElBQU4sQ0FBQTtJQUVBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO01BQ0ksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFULEdBQWdCLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQWhCLEVBQXFCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBMUIsQ0FBZCxFQURwQjs7SUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7SUFFWCxJQUFDLENBQUEs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U0FBQyxLQUFEO0FBRVAsUUFBQTtJQUFBLElBQTJCLFdBQUEsS0FBZSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQWhCLENBQTBCLEtBQTFCLEVBQWlDLElBQWpDLENBQTFDO0FBQUEsYUFBTyxTQUFBLENBQVUsS0FBVixFQUFQOztJQUVBLElBQUEsR0FBTyxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQjtJQUVQLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDO0lBR2xCLElBQUksQ0FBQyxLQUFMLEdBQWE7V0FDYixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsSUFBSSxDQUFDLEtBQXhCLEVBQStCLElBQS9CO0VBVk87O2dCQVlYLE9BQUEsR0FBUyxTQUFDLEtBQUQ7QUFFTCxRQUFBO0lBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCO1dBQ1AsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLENBQUM7RUFIYjs7Ozs7O0FBS2IsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBrZXlpbmZvLCB0aXRsZSwgc2NoZW1lLCBzdG9wRXZlbnQsIHByZWZzLCBzbGFzaCwgZWxlbSwgZW1wdHksIHZhbGlkLCBwb3B1cCwgcG9zLCBzdHIsIGZzLCBsb2csICQsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBXaW5cbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cub25lcnJvciA9IChtc2csIHNvdXJjZSwgbGluZSwgY29sLCBlcnIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nICd3aW5kb3cub25lcnJvcicsIG1zZywgc291cmNlLCBsaW5lLCBjb2xcbiAgICAgICAgICAgIHNyY21hcCA9IHJlcXVpcmUgJy4vc3JjbWFwJ1xuICAgICAgICAgICAgc3JjbWFwLmxvZ0VyciBlcnJcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXG4gICAgICAgIHByZWZzLmluaXQoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5pY29uXG4gICAgICAgICAgICBsb2cuc2xvZy5pY29uID0gc2xhc2guZmlsZVVybCBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lmljb25cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIFxuICAgICAgICBAd2luID0gd2luZG93LndpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgQGlkICA9IHdpbmRvdy53aW5JRCA9IEB3aW4uaWRcbiAgICAgICAgXG4gICAgICAgIEBtb2RpZmllcnMgPSAnJ1xuXG4gICAgICAgIEB1c2VyRGF0YSA9IHNsYXNoLnVzZXJEYXRhKClcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ21lbnVBY3Rpb24nLCBAb25NZW51QWN0aW9uXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cudGl0bGViYXIgPSBuZXcgdGl0bGUgQG9wdFxuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyICdjb250ZXh0bWVudScsIEBvbkNvbnRleHRNZW51XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQG9wdC5ub2tleXNcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCBAb25LZXlEb3duXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdrZXl1cCcsICAgQG9uS2V5VXBcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2NoZW1lICE9IGZhbHNlXG4gICAgICAgICAgICBzY2hlbWUuc2V0IHByZWZzLmdldCAnc2NoZW1lJywgJ2RhcmsnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIEBvcHQub25TaG93XG4gICAgICAgICAgICBvblNob3cgPSA9PiBAb3B0Lm9uU2hvdygpOyBAd2luLnJlbW92ZUxpc3RlbmVyICdyZWFkeS10by1zaG93Jywgb25TaG93XG4gICAgICAgICAgICBAd2luLm9uICdyZWFkeS10by1zaG93Jywgb25TaG93XG5cbiAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIEBvcHQub25Mb2FkXG4gICAgICAgICAgICBvbkxvYWQgPSA9PiBAb3B0Lm9uTG9hZCgpOyBAd2luLndlYkNvbnRlbnRzLnJlbW92ZUxpc3RlbmVyICdkaWQtZmluaXNoLWxvYWQnLCBvbkxvYWRcbiAgICAgICAgICAgIEB3aW4ud2ViQ29udGVudHMub24gJ2RpZC1maW5pc2gtbG9hZCcsIG9uTG9hZFxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgIDAwMFxuICAgIFxuICAgIHNjcmVlbnNob3Q6IC0+XG4gICAgXG4gICAgICAgIEB3aW4uY2FwdHVyZVBhZ2UgKGltZykgPT5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIFwifi9EZXNrdG9wLyN7QG9wdC5wa2cubmFtZX0tc2NyZWVuc2hvdC5wbmdcIlxuICAgICAgICAgICAgZnMud3JpdGVGaWxlIGZpbGUsIGltZy50b1BORygpLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgICAgICAgICBsb2cgJ3NhdmluZyBzY3JlZW5zaG90IGZhaWxlZCcsIGVyclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nIFwic2NyZWVuc2hvdCBzYXZlZCB0byAje2ZpbGV9XCJcbiAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdTY3JlZW5zaG90JyB0aGVuIEBzY3JlZW5zaG90KClcbiAgICAgICAgICAgIHdoZW4gJ0Fib3V0JyAgICAgIHRoZW4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ1NhdmUnICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3NhdmVCdWZmZXInXG4gICAgICAgICAgICB3aGVuICdRdWl0JyAgICAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0QXBwJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT5cblxuICAgICAgICBAd2luLmZvY3VzKClcbiAgICAgICAgXG4gICAgICAgIGFic1BvcyA9IHBvcyBldmVudFxuICAgICAgICBpZiBub3QgYWJzUG9zP1xuICAgICAgICAgICAgYWJzUG9zID0gcG9zICQoXCIjbWFpblwiKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0LCAkKFwiI21haW5cIikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgICAgIFxuICAgICAgICBpdGVtcyA9IF8uY2xvbmUgd2luZG93LnRpdGxlYmFyLm1lbnVUZW1wbGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBfLmlzRnVuY3Rpb24gQG9wdC5jb250ZXh0XG4gICAgICAgICAgICBpdGVtcyA9IEBvcHQuY29udGV4dCBpdGVtc1xuICAgICAgICAgICAgaWYgZW1wdHkgaXRlbXMgXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGl0ZW1zLnVuc2hpZnQgdGV4dDonQ2xlYXInLCBhY2NlbDonY21kY3RybCtrJ1xuICAgICAgICAgICAgXG4gICAgICAgIHBvcHVwLm1lbnVcbiAgICAgICAgICAgIGl0ZW1zOiAgIGl0ZW1zXG4gICAgICAgICAgICB4OiAgICAgICBhYnNQb3MueFxuICAgICAgICAgICAgeTogICAgICAgYWJzUG9zLnlcbiAgICAgICAgICAgIG9uQ2xvc2U6IC0+IHBvc3QuZW1pdCAnY29udGV4dENsb3NlZCdcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwXG4gICAgXG4gICAgb25LZXlEb3duOiAoZXZlbnQpID0+XG4gICAgXG4gICAgICAgIHJldHVybiBzdG9wRXZlbnQoZXZlbnQpIGlmICd1bmhhbmRsZWQnICE9IHdpbmRvdy50aXRsZWJhci5oYW5kbGVLZXkgZXZlbnQsIHRydWVcbiAgICAgICAgXG4gICAgICAgIGluZm8gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgXG4gICAgICAgIEBtb2RpZmllcnMgPSBpbmZvLm1vZFxuICAgICAgICBcbiAgICAgICAgIyBpZiBpbmZvLmNvbWJvXG4gICAgICAgIGluZm8uZXZlbnQgPSBldmVudFxuICAgICAgICBwb3N0LmVtaXQgJ2NvbWJvJywgaW5mby5jb21ibywgaW5mb1xuICAgIFxuICAgIG9uS2V5VXA6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGluZm8gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIEBtb2RpZmllcnMgPSBpbmZvLm1vZCBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFdpblxuIl19
//# sourceURL=../coffee/win.coffee