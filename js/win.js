(function() {
  /*
  000   000  000  000   000  
  000 0 000  000  0000  000  
  000000000  000  000 0 000  
  000   000  000  000  0000  
  00     00  000  000   000  
  */
  var $, Win, _, elem, keyinfo, log, popup, pos, post, prefs, scheme, slash, stopEvent, str, title;

  ({keyinfo, title, scheme, stopEvent, prefs, slash, post, elem, popup, pos, str, log, $, _} = require('./kxk'));

  Win = class Win {
    constructor(opt) {
      var electron;
      // 00     00  00000000  000   000  000   000   0000000    0000000  000000000  000   0000000   000   000  
      // 000   000  000       0000  000  000   000  000   000  000          000     000  000   000  0000  000  
      // 000000000  0000000   000 0 000  000   000  000000000  000          000     000  000   000  000 0 000  
      // 000 0 000  000       000  0000  000   000  000   000  000          000     000  000   000  000  0000  
      // 000   000  00000000  000   000   0000000   000   000   0000000     000     000   0000000   000   000  
      this.onMenuAction = this.onMenuAction.bind(this);
      //  0000000   0000000   000   000  000000000  00000000  000   000  000000000  
      // 000       000   000  0000  000     000     000        000 000      000     
      // 000       000   000  000 0 000     000     0000000     00000       000     
      // 000       000   000  000  0000     000     000        000 000      000     
      //  0000000   0000000   000   000     000     00000000  000   000     000     
      this.onContextMenu = this.onContextMenu.bind(this);
      
      // 000   000  00000000  000   000
      // 000  000   000        000 000
      // 0000000    0000000     00000
      // 000  000   000          000
      // 000   000  00000000     000
      this.onKeyDown = this.onKeyDown.bind(this);
      this.opt = opt;
      prefs.init();
      if (this.opt.icon) {
        log.slog.icon = slash.fileUrl(slash.join(this.opt.dir, this.opt.icon));
      }
      electron = require('electron');
      this.win = window.win = electron.remote.getCurrentWindow();
      this.id = window.winID = this.win.id;
      post.on('menuAction', this.onMenuAction);
      window.titlebar = new title(this.opt);
      document.body.addEventListener('contextmenu', this.onContextMenu);
      document.addEventListener('keydown', this.onKeyDown);
      if (this.opt.scheme !== false) {
        scheme.set(prefs.get('scheme', 'dark'));
      }
    }

    onMenuAction(action, args) {
      switch (action) {
        case 'About':
          return post.toMain('showAbout');
        case 'Save':
          return post.toMain('saveBuffer');
        case 'Quit':
          return post.toMain('quitApp');
      }
    }

    onContextMenu(event) {
      var absPos, items;
      absPos = pos(event);
      if (absPos == null) {
        absPos = pos($("#main").getBoundingClientRect().left, $("#main").getBoundingClientRect().top);
      }
      items = _.clone(window.titlebar.menuTemplate());
      items.unshift({
        text: 'Clear',
        accel: 'ctrl+k'
      });
      return popup.menu({
        items: items,
        x: absPos.x,
        y: absPos.y
      });
    }

    onKeyDown(event) {
      var info;
      if ('unhandled' !== window.titlebar.handleKey(event, true)) {
        return stopEvent(event);
      }
      info = keyinfo.forEvent(event);
      if (info.combo) {
        info.event = event;
        return post.emit('combo', info.combo, info);
      }
    }

  };

  module.exports = Win;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS93aW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLE9BQUYsRUFBVyxLQUFYLEVBQWtCLE1BQWxCLEVBQTBCLFNBQTFCLEVBQXFDLEtBQXJDLEVBQTRDLEtBQTVDLEVBQW1ELElBQW5ELEVBQXlELElBQXpELEVBQStELEtBQS9ELEVBQXNFLEdBQXRFLEVBQTJFLEdBQTNFLEVBQWdGLEdBQWhGLEVBQXFGLENBQXJGLEVBQXdGLENBQXhGLENBQUEsR0FBOEYsT0FBQSxDQUFRLE9BQVIsQ0FBOUY7O0VBRU0sTUFBTixNQUFBLElBQUE7SUFFSSxXQUFhLElBQUEsQ0FBQTtBQUVULFVBQUEsUUFBQTs7Ozs7O1VBMEJKLENBQUEsbUJBQUEsQ0FBQSx3QkExQkk7Ozs7OztVQXVDSixDQUFBLG9CQUFBLENBQUEseUJBdkNJOzs7Ozs7O1VBMkRKLENBQUEsZ0JBQUEsQ0FBQTtNQTdEYyxJQUFDLENBQUE7TUFFWCxLQUFLLENBQUMsSUFBTixDQUFBO01BRUEsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQVI7UUFDSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQVQsR0FBZ0IsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBaEIsRUFBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUExQixDQUFkLEVBRHBCOztNQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtNQUNYLElBQUMsQ0FBQSxHQUFELEdBQU8sTUFBTSxDQUFDLEdBQVAsR0FBYSxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFoQixDQUFBO01BQ3BCLElBQUMsQ0FBQSxFQUFELEdBQU8sTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFDLENBQUEsR0FBRyxDQUFDO01BRTNCLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFzQixJQUFDLENBQUEsWUFBdkI7TUFFQSxNQUFNLENBQUMsUUFBUCxHQUFrQixJQUFJLEtBQUosQ0FBVSxJQUFDLENBQUEsR0FBWDtNQUVsQixRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFkLENBQStCLGFBQS9CLEVBQThDLElBQUMsQ0FBQSxhQUEvQztNQUVBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxJQUFDLENBQUEsU0FBdEM7TUFFQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxLQUFlLEtBQWxCO1FBQ0ksTUFBTSxDQUFDLEdBQVAsQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVYsRUFBb0IsTUFBcEIsQ0FBWCxFQURKOztJQW5CUzs7SUE0QmIsWUFBYyxDQUFDLE1BQUQsRUFBUyxJQUFULENBQUE7QUFFVixjQUFPLE1BQVA7QUFBQSxhQUNTLE9BRFQ7aUJBQ3NCLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWjtBQUR0QixhQUVTLE1BRlQ7aUJBRXNCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWjtBQUZ0QixhQUdTLE1BSFQ7aUJBR3NCLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWjtBQUh0QjtJQUZVOztJQWFkLGFBQWUsQ0FBQyxLQUFELENBQUE7QUFFWCxVQUFBLE1BQUEsRUFBQTtNQUFBLE1BQUEsR0FBUyxHQUFBLENBQUksS0FBSjtNQUNULElBQU8sY0FBUDtRQUNJLE1BQUEsR0FBUyxHQUFBLENBQUksQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLHFCQUFYLENBQUEsQ0FBa0MsQ0FBQyxJQUF2QyxFQUE2QyxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMscUJBQVgsQ0FBQSxDQUFrQyxDQUFDLEdBQWhGLEVBRGI7O01BR0EsS0FBQSxHQUFRLENBQUMsQ0FBQyxLQUFGLENBQVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFoQixDQUFBLENBQVI7TUFDUixLQUFLLENBQUMsT0FBTixDQUFjO1FBQUEsSUFBQSxFQUFLLE9BQUw7UUFBYyxLQUFBLEVBQU07TUFBcEIsQ0FBZDthQUVBLEtBQUssQ0FBQyxJQUFOLENBQ0k7UUFBQSxLQUFBLEVBQVEsS0FBUjtRQUNBLENBQUEsRUFBUSxNQUFNLENBQUMsQ0FEZjtRQUVBLENBQUEsRUFBUSxNQUFNLENBQUM7TUFGZixDQURKO0lBVFc7O0lBb0JmLFNBQVcsQ0FBQyxLQUFELENBQUE7QUFFUCxVQUFBO01BQUEsSUFBMkIsV0FBQSxLQUFlLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBaEIsQ0FBMEIsS0FBMUIsRUFBaUMsSUFBakMsQ0FBMUM7QUFBQSxlQUFPLFNBQUEsQ0FBVSxLQUFWLEVBQVA7O01BRUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCO01BRVAsSUFBRyxJQUFJLENBQUMsS0FBUjtRQUNJLElBQUksQ0FBQyxLQUFMLEdBQWE7ZUFDYixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsSUFBSSxDQUFDLEtBQXhCLEVBQStCLElBQS9CLEVBRko7O0lBTk87O0VBL0RmOztFQXlFQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQW5GakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBrZXlpbmZvLCB0aXRsZSwgc2NoZW1lLCBzdG9wRXZlbnQsIHByZWZzLCBzbGFzaCwgcG9zdCwgZWxlbSwgcG9wdXAsIHBvcywgc3RyLCBsb2csICQsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBXaW5cbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwcmVmcy5pbml0KClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuaWNvblxuICAgICAgICAgICAgbG9nLnNsb2cuaWNvbiA9IHNsYXNoLmZpbGVVcmwgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5pY29uXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBAd2luID0gd2luZG93LndpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgQGlkICA9IHdpbmRvdy53aW5JRCA9IEB3aW4uaWRcblxuICAgICAgICBwb3N0Lm9uICdtZW51QWN0aW9uJywgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgd2luZG93LnRpdGxlYmFyID0gbmV3IHRpdGxlIEBvcHRcbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lciAnY29udGV4dG1lbnUnLCBAb25Db250ZXh0TWVudVxuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIEBvbktleURvd25cbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2NoZW1lICE9IGZhbHNlXG4gICAgICAgICAgICBzY2hlbWUuc2V0IHByZWZzLmdldCAnc2NoZW1lJywgJ2RhcmsnXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnQWJvdXQnIHRoZW4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ1NhdmUnICB0aGVuIHBvc3QudG9NYWluICdzYXZlQnVmZmVyJ1xuICAgICAgICAgICAgd2hlbiAnUXVpdCcgIHRoZW4gcG9zdC50b01haW4gJ3F1aXRBcHAnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgYWJzUG9zID0gcG9zIGV2ZW50XG4gICAgICAgIGlmIG5vdCBhYnNQb3M/XG4gICAgICAgICAgICBhYnNQb3MgPSBwb3MgJChcIiNtYWluXCIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQsICQoXCIjbWFpblwiKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3BcbiAgICAgICAgICAgXG4gICAgICAgIGl0ZW1zID0gXy5jbG9uZSB3aW5kb3cudGl0bGViYXIubWVudVRlbXBsYXRlKClcbiAgICAgICAgaXRlbXMudW5zaGlmdCB0ZXh0OidDbGVhcicsIGFjY2VsOidjdHJsK2snXG4gICAgICAgICAgICBcbiAgICAgICAgcG9wdXAubWVudVxuICAgICAgICAgICAgaXRlbXM6ICBpdGVtc1xuICAgICAgICAgICAgeDogICAgICBhYnNQb3MueFxuICAgICAgICAgICAgeTogICAgICBhYnNQb3MueVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cbiAgICBcbiAgICAgICAgcmV0dXJuIHN0b3BFdmVudChldmVudCkgaWYgJ3VuaGFuZGxlZCcgIT0gd2luZG93LnRpdGxlYmFyLmhhbmRsZUtleSBldmVudCwgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgaW5mbyA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICBcbiAgICAgICAgaWYgaW5mby5jb21ib1xuICAgICAgICAgICAgaW5mby5ldmVudCA9IGV2ZW50XG4gICAgICAgICAgICBwb3N0LmVtaXQgJ2NvbWJvJywgaW5mby5jb21ibywgaW5mb1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXaW5cbiJdfQ==
//# sourceURL=../coffee/win.coffee