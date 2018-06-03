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
      electron = require('electron');
      this.win = window.win = electron.remote.getCurrentWindow();
      this.id = window.winID = this.win.id;
      post.on('menuAction', this.onMenuAction);
      window.titlebar = new title(this.opt);
      document.body.addEventListener('contextmenu', this.onContextMenu);
      document.addEventListener('keydown', this.onKeyDown);
      scheme.set(prefs.get('scheme', 'dark'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvd2luLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxPQUFGLEVBQVcsS0FBWCxFQUFrQixNQUFsQixFQUEwQixTQUExQixFQUFxQyxLQUFyQyxFQUE0QyxLQUE1QyxFQUFtRCxJQUFuRCxFQUF5RCxJQUF6RCxFQUErRCxLQUEvRCxFQUFzRSxHQUF0RSxFQUEyRSxHQUEzRSxFQUFnRixHQUFoRixFQUFxRixDQUFyRixFQUF3RixDQUF4RixDQUFBLEdBQThGLE9BQUEsQ0FBUSxPQUFSLENBQTlGOztFQUVNLE1BQU4sTUFBQSxJQUFBO0lBRUksV0FBYSxJQUFBLENBQUE7QUFFVCxVQUFBLFFBQUE7Ozs7OztVQXNCSixDQUFBLG1CQUFBLENBQUEsd0JBdEJJOzs7Ozs7VUFtQ0osQ0FBQSxvQkFBQSxDQUFBLHlCQW5DSTs7Ozs7OztVQXVESixDQUFBLGdCQUFBLENBQUE7TUF6RGMsSUFBQyxDQUFBO01BRVgsS0FBSyxDQUFDLElBQU4sQ0FBQTtNQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtNQUNYLElBQUMsQ0FBQSxHQUFELEdBQU8sTUFBTSxDQUFDLEdBQVAsR0FBYSxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFoQixDQUFBO01BQ3BCLElBQUMsQ0FBQSxFQUFELEdBQU8sTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFDLENBQUEsR0FBRyxDQUFDO01BRTNCLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFzQixJQUFDLENBQUEsWUFBdkI7TUFFQSxNQUFNLENBQUMsUUFBUCxHQUFrQixJQUFJLEtBQUosQ0FBVSxJQUFDLENBQUEsR0FBWDtNQUVsQixRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFkLENBQStCLGFBQS9CLEVBQThDLElBQUMsQ0FBQSxhQUEvQztNQUVBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxJQUFDLENBQUEsU0FBdEM7TUFFQSxNQUFNLENBQUMsR0FBUCxDQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixFQUFvQixNQUFwQixDQUFYO0lBaEJTOztJQXdCYixZQUFjLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FBQTtBQUVWLGNBQU8sTUFBUDtBQUFBLGFBQ1MsT0FEVDtpQkFDc0IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaO0FBRHRCLGFBRVMsTUFGVDtpQkFFc0IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaO0FBRnRCLGFBR1MsTUFIVDtpQkFHc0IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaO0FBSHRCO0lBRlU7O0lBYWQsYUFBZSxDQUFDLEtBQUQsQ0FBQTtBQUVYLFVBQUEsTUFBQSxFQUFBO01BQUEsTUFBQSxHQUFTLEdBQUEsQ0FBSSxLQUFKO01BQ1QsSUFBTyxjQUFQO1FBQ0ksTUFBQSxHQUFTLEdBQUEsQ0FBSSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMscUJBQVgsQ0FBQSxDQUFrQyxDQUFDLElBQXZDLEVBQTZDLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxxQkFBWCxDQUFBLENBQWtDLENBQUMsR0FBaEYsRUFEYjs7TUFHQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQWhCLENBQUEsQ0FBUjtNQUNSLEtBQUssQ0FBQyxPQUFOLENBQWM7UUFBQSxJQUFBLEVBQUssT0FBTDtRQUFjLEtBQUEsRUFBTTtNQUFwQixDQUFkO2FBRUEsS0FBSyxDQUFDLElBQU4sQ0FDSTtRQUFBLEtBQUEsRUFBUSxLQUFSO1FBQ0EsQ0FBQSxFQUFRLE1BQU0sQ0FBQyxDQURmO1FBRUEsQ0FBQSxFQUFRLE1BQU0sQ0FBQztNQUZmLENBREo7SUFUVzs7SUFvQmYsU0FBVyxDQUFDLEtBQUQsQ0FBQTtBQUVQLFVBQUE7TUFBQSxJQUEyQixXQUFBLEtBQWUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFoQixDQUEwQixLQUExQixFQUFpQyxJQUFqQyxDQUExQztBQUFBLGVBQU8sU0FBQSxDQUFVLEtBQVYsRUFBUDs7TUFFQSxJQUFBLEdBQU8sT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakI7TUFFUCxJQUFHLElBQUksQ0FBQyxLQUFSO1FBQ0ksSUFBSSxDQUFDLEtBQUwsR0FBYTtlQUNiLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixJQUFJLENBQUMsS0FBeEIsRUFBK0IsSUFBL0IsRUFGSjs7SUFOTzs7RUEzRGY7O0VBcUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBL0VqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4wMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IGtleWluZm8sIHRpdGxlLCBzY2hlbWUsIHN0b3BFdmVudCwgcHJlZnMsIHNsYXNoLCBwb3N0LCBlbGVtLCBwb3B1cCwgcG9zLCBzdHIsIGxvZywgJCwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFdpblxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHByZWZzLmluaXQoKVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgQHdpbiA9IHdpbmRvdy53aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIEBpZCAgPSB3aW5kb3cud2luSUQgPSBAd2luLmlkXG5cbiAgICAgICAgcG9zdC5vbiAnbWVudUFjdGlvbicsIEBvbk1lbnVBY3Rpb25cbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy50aXRsZWJhciA9IG5ldyB0aXRsZSBAb3B0XG4gICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgQG9uQ29udGV4dE1lbnVcbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCBAb25LZXlEb3duXG4gICAgICAgIFxuICAgICAgICBzY2hlbWUuc2V0IHByZWZzLmdldCAnc2NoZW1lJywgJ2RhcmsnXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnQWJvdXQnIHRoZW4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ1NhdmUnICB0aGVuIHBvc3QudG9NYWluICdzYXZlQnVmZmVyJ1xuICAgICAgICAgICAgd2hlbiAnUXVpdCcgIHRoZW4gcG9zdC50b01haW4gJ3F1aXRBcHAnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgYWJzUG9zID0gcG9zIGV2ZW50XG4gICAgICAgIGlmIG5vdCBhYnNQb3M/XG4gICAgICAgICAgICBhYnNQb3MgPSBwb3MgJChcIiNtYWluXCIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQsICQoXCIjbWFpblwiKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3BcbiAgICAgICAgICAgXG4gICAgICAgIGl0ZW1zID0gXy5jbG9uZSB3aW5kb3cudGl0bGViYXIubWVudVRlbXBsYXRlKClcbiAgICAgICAgaXRlbXMudW5zaGlmdCB0ZXh0OidDbGVhcicsIGFjY2VsOidjdHJsK2snXG4gICAgICAgICAgICBcbiAgICAgICAgcG9wdXAubWVudVxuICAgICAgICAgICAgaXRlbXM6ICBpdGVtc1xuICAgICAgICAgICAgeDogICAgICBhYnNQb3MueFxuICAgICAgICAgICAgeTogICAgICBhYnNQb3MueVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cbiAgICBcbiAgICAgICAgcmV0dXJuIHN0b3BFdmVudChldmVudCkgaWYgJ3VuaGFuZGxlZCcgIT0gd2luZG93LnRpdGxlYmFyLmhhbmRsZUtleSBldmVudCwgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgaW5mbyA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICBcbiAgICAgICAgaWYgaW5mby5jb21ib1xuICAgICAgICAgICAgaW5mby5ldmVudCA9IGV2ZW50XG4gICAgICAgICAgICBwb3N0LmVtaXQgJ2NvbWJvJywgaW5mby5jb21ibywgaW5mb1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXaW5cbiJdfQ==
//# sourceURL=C:/Users/kodi/s/kxk/coffee/win.coffee