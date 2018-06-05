(function() {
  /*
  000000000  000  000000000  000      00000000
     000     000     000     000      000     
     000     000     000     000      0000000 
     000     000     000     000      000     
     000     000     000     0000000  00000000
  */
  var $, Title, _, elem, empty, keyinfo, log, menu, noon, post, prefs, scheme, sds, slash, stopEvent, str,
    indexOf = [].indexOf;

  ({elem, sds, prefs, slash, scheme, empty, post, stopEvent, keyinfo, menu, noon, str, log, $, _} = require('./kxk'));

  Title = class Title {
    constructor(opt) {
      var pkg, ref;
      this.onTitlebar = this.onTitlebar.bind(this);
      
      // 00     00  00000000  000   000  000   000  
      // 000   000  000       0000  000  000   000  
      // 000000000  0000000   000 0 000  000   000  
      // 000 0 000  000       000  0000  000   000  
      // 000   000  00000000  000   000   0000000   
      this.onMenuAction = this.onMenuAction.bind(this);
      this.menuVisible = this.menuVisible.bind(this);
      this.showMenu = this.showMenu.bind(this);
      this.hideMenu = this.hideMenu.bind(this);
      this.toggleMenu = this.toggleMenu.bind(this);
      this.openMenu = this.openMenu.bind(this);
      this.opt = opt;
      post.on('titlebar', this.onTitlebar);
      post.on('menuAction', this.onMenuAction);
      if (this.opt == null) {
        this.opt = {};
      }
      pkg = this.opt.pkg;
      this.elem = $((ref = this.opt.elem) != null ? ref : "#titlebar");
      this.elem.addEventListener('dblclick', function(event) {
        return stopEvent(event, post.emit('menuAction', 'Maximize'));
      });
      this.winicon = elem({
        class: 'winicon'
      });
      this.winicon.appendChild(elem('img', {
        src: slash.fileUrl(slash.join(this.opt.dir, this.opt.icon))
      }));
      this.elem.appendChild(this.winicon);
      this.winicon.addEventListener('click', function() {
        return post.emit('menuAction', 'Open Menu');
      });
      this.title = elem({
        class: 'titlebar-title'
      });
      this.elem.appendChild(this.title);
      this.setTitle(pkg);
      
      // — ◻ 🞩
      this.minimize = elem({
        class: 'winbutton minimize gray'
      });
      this.minimize.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"-10 -8 30 30\">\n    <line x1=\"-1\" y1=\"5\" x2=\"11\" y2=\"5\"></line>\n</svg>";
      this.elem.appendChild(this.minimize);
      this.minimize.addEventListener('click', function() {
        return post.emit('menuAction', 'Minimize');
      });
      this.maximize = elem({
        class: 'winbutton maximize gray'
      });
      this.maximize.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"-10 -9 30 30\">\n  <rect width=\"11\" height=\"11\" style=\"fill-opacity: 0;\"></rect>\n</svg>";
      this.elem.appendChild(this.maximize);
      this.maximize.addEventListener('click', function() {
        return post.emit('menuAction', 'Maximize');
      });
      this.close = elem({
        class: 'winbutton close'
      });
      this.close.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"-10 -9 30 30\">\n    <line x1=\"0\" y1=\"0\" x2=\"10\" y2=\"11\"></line>\n    <line x1=\"10\" y1=\"0\" x2=\"0\" y2=\"11\"></line>\n</svg>";
      this.elem.appendChild(this.close);
      this.close.addEventListener('click', function() {
        return post.emit('menuAction', 'Close');
      });
      this.initStyle();
      if (this.opt.menu) {
        this.initMenu(this.menuTemplate());
      }
    }

    showTitle() {
      return this.title.style.display = 'initial';
    }

    hideTitle() {
      return this.title.style.display = 'none';
    }

    setTitle(info) {
      var html;
      html = `<span class='titlebar-name'>${info.name}</span>`;
      if (info.version) {
        html += "<span class='titlebar-dot'> ● </span>";
        html += `<span class='titlebar-version'>${info.version}</span>`;
      }
      if (info.path) {
        html += "<span class='titlebar-dot'> ⯈ </span>";
        html += `<span class='titlebar-version'>${info.path}</span>`;
      }
      return this.title.innerHTML = html;
    }

    onTitlebar(action) {
      switch (action) {
        case 'showTitle':
          return this.showTitle();
        case 'hideTitle':
          return this.hideTitle();
        case 'showMenu':
          return this.showMenu();
        case 'hideMenu':
          return this.hideMenu();
        case 'toggleMenu':
          return this.toggleMenu();
      }
    }

    onMenuAction(action, args) {
      var electron, maximized, wa, wb, win;
      electron = require('electron');
      win = electron.remote.getCurrentWindow();
      switch (action) {
        case 'Toggle Menu':
          return this.toggleMenu();
        case 'Open Menu':
          return this.openMenu();
        case 'Show Menu':
          return this.showMenu();
        case 'Hide Menu':
          return this.hideMenu();
        case 'Toggle Scheme':
          if (this.opt.scheme !== false) {
            return scheme.toggle();
          }
          break;
        case 'DevTools':
          return win.webContents.toggleDevTools();
        case 'Reload':
          return win.webContents.reloadIgnoringCache();
        case 'Close':
          return win.close();
        case 'Minimize':
          return win.minimize();
        case 'Maximize':
          wa = electron.screen.getPrimaryDisplay().workAreaSize;
          wb = win.getBounds();
          maximized = win.isMaximized() || (wb.width === wa.width && wb.height === wa.height);
          if (maximized) {
            return win.unmaximize();
          } else {
            return win.maximize();
          }
      }
    }

    menuTemplate() {
      if (empty(this.templateCache)) {
        // log 'menuTemplate', slash.resolve slash.join @opt.dir, @opt.menu
        this.templateCache = this.makeTemplate(noon.load(slash.resolve(slash.join(this.opt.dir, this.opt.menu))));
      }
      return this.templateCache;
    }

    makeTemplate(obj) {
      var item, menuOrAccel, text, tmpl;
      tmpl = [];
      for (text in obj) {
        menuOrAccel = obj[text];
        tmpl.push((function() {
          switch (false) {
            case !(empty(menuOrAccel) && text.startsWith('-')):
              return {
                text: ''
              };
            case !_.isNumber(menuOrAccel):
              return {
                text: text,
                accel: str(menuOrAccel)
              };
            case !_.isString(menuOrAccel):
              return {
                text: text,
                accel: menuOrAccel
              };
            case !empty(menuOrAccel):
              return {
                text: text,
                accel: ''
              };
            default:
              if ((menuOrAccel.accel != null) || (menuOrAccel.command != null)) { // needs better test!
                item = _.clone(menuOrAccel);
                item.text = text;
                return item;
              } else {
                return {
                  text: text,
                  menu: this.makeTemplate(menuOrAccel)
                };
              }
          }
        }).call(this));
      }
      return tmpl;
    }

    initMenu(items) {
      this.menu = new menu({
        items: items
      });
      this.elem.insertBefore(this.menu.elem, this.elem.firstChild.nextSibling);
      return this.hideMenu();
    }

    menuVisible() {
      return this.menu.elem.style.display !== 'none';
    }

    showMenu() {
      var ref;
      this.menu.elem.style.display = 'inline-block';
      if ((ref = this.menu) != null) {
        if (typeof ref.focus === "function") {
          ref.focus();
        }
      }
      return post.emit('titlebar', 'hideTitle');
    }

    hideMenu() {
      var ref;
      if ((ref = this.menu) != null) {
        ref.close();
      }
      this.menu.elem.style.display = 'none';
      return post.emit('titlebar', 'showTitle');
    }

    toggleMenu() {
      if (this.menuVisible()) {
        return this.hideMenu();
      } else {
        return this.showMenu();
      }
    }

    openMenu() {
      if (this.menuVisible()) {
        return this.hideMenu();
      } else {
        this.showMenu();
        return this.menu.open();
      }
    }

    //  0000000  000000000  000   000  000      00000000  
    // 000          000      000 000   000      000       
    // 0000000      000       00000    000      0000000   
    //      000     000        000     000      000       
    // 0000000      000        000     0000000  00000000  
    initStyle() {
      var href, link, titleStyle;
      if (link = $("#style-link")) {
        href = slash.fileUrl(slash.resolve(slash.join(__dirname, "css/style.css")));
        titleStyle = elem('link', {
          href: href,
          rel: 'stylesheet',
          type: 'text/css'
        });
        link.parentNode.insertBefore(titleStyle, link);
        href = slash.fileUrl(slash.resolve(slash.join(__dirname, `css/${prefs.get('scheme', 'dark')}.css`)));
        titleStyle = elem('link', {
          href: href,
          rel: 'stylesheet',
          type: 'text/css',
          id: 'style-title'
        });
        return link.parentNode.insertBefore(titleStyle, link);
      }
    }

    
    // 000   000  00000000  000   000
    // 000  000   000        000 000
    // 0000000    0000000     00000
    // 000  000   000          000
    // 000   000  00000000     000
    handleKey(event) {
      var combo, combos, i, item, keypath, len, mainMenu, ref, ref1;
      ({combo} = keyinfo.forEvent(event));
      mainMenu = this.menuTemplate();
      ref = sds.find.key(mainMenu, 'accel');
      for (i = 0, len = ref.length; i < len; i++) {
        keypath = ref[i];
        combos = sds.get(mainMenu, keypath).split(' ');
        if (indexOf.call(combos, combo) >= 0) {
          keypath.pop();
          item = sds.get(mainMenu, keypath);
          post.emit('menuAction', (ref1 = item.action) != null ? ref1 : item.text, item.actarg);
          return item;
        }
      }
      return 'unhandled';
    }

  };

  module.exports = Title;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS90aXRsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQTtJQUFBOztFQVFBLENBQUEsQ0FBRSxJQUFGLEVBQVEsR0FBUixFQUFhLEtBQWIsRUFBb0IsS0FBcEIsRUFBMkIsTUFBM0IsRUFBbUMsS0FBbkMsRUFBMEMsSUFBMUMsRUFBZ0QsU0FBaEQsRUFBMkQsT0FBM0QsRUFBb0UsSUFBcEUsRUFBMEUsSUFBMUUsRUFBZ0YsR0FBaEYsRUFBcUYsR0FBckYsRUFBMEYsQ0FBMUYsRUFBNkYsQ0FBN0YsQ0FBQSxHQUFtRyxPQUFBLENBQVEsT0FBUixDQUFuRzs7RUFFTSxRQUFOLE1BQUEsTUFBQTtJQUVJLFdBQWEsSUFBQSxDQUFBO0FBRVQsVUFBQSxHQUFBLEVBQUE7VUF5RUosQ0FBQSxpQkFBQSxDQUFBLHNCQXpFSTs7Ozs7OztVQXdGSixDQUFBLG1CQUFBLENBQUE7VUE2REEsQ0FBQSxrQkFBQSxDQUFBO1VBQ0EsQ0FBQSxlQUFBLENBQUE7VUFDQSxDQUFBLGVBQUEsQ0FBQTtVQUNBLENBQUEsaUJBQUEsQ0FBQTtVQUNBLENBQUEsZUFBQSxDQUFBO01BM0pjLElBQUMsQ0FBQTtNQUVYLElBQUksQ0FBQyxFQUFMLENBQVEsVUFBUixFQUFzQixJQUFDLENBQUEsVUFBdkI7TUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBc0IsSUFBQyxDQUFBLFlBQXZCOztRQUVBLElBQUMsQ0FBQSxNQUFPLENBQUE7O01BRVIsR0FBQSxHQUFNLElBQUMsQ0FB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LFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFBO0FBRVg7TUFBQSxLQUFBLHFDQUFBOztRQUNJLE1BQUEsR0FBUyxHQUFHLENBQUMsR0FBSixDQUFRLFFBQVIsRUFBa0IsT0FBbEIsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyxHQUFqQztRQUNULElBQUcsYUFBUyxNQUFULEVBQUEsS0FBQSxNQUFIO1VBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBQTtVQUNBLElBQUEsR0FBTyxHQUFHLENBQUMsR0FBSixDQUFRLFFBQVIsRUFBa0IsT0FBbEI7VUFDUCxJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsd0NBQXNDLElBQUksQ0FBQyxJQUEzQyxFQUFpRCxJQUFJLENBQUMsTUFBdEQ7QUFDQSxpQkFBTyxLQUpYOztNQUZKO2FBUUE7SUFkTzs7RUFoTWY7O0VBZ05BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBMU5qQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIyNcblxueyBlbGVtLCBzZHMsIHByZWZzLCBzbGFzaCwgc2NoZW1lLCBlbXB0eSwgcG9zdCwgc3RvcEV2ZW50LCBrZXlpbmZvLCBtZW51LCBub29uLCBzdHIsIGxvZywgJCwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFRpdGxlXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuXG4gICAgICAgIHBvc3Qub24gJ3RpdGxlYmFyJywgICBAb25UaXRsZWJhclxuICAgICAgICBwb3N0Lm9uICdtZW51QWN0aW9uJywgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBcbiAgICAgICAgcGtnID0gQG9wdC5wa2dcbiAgICAgICAgXG4gICAgICAgIEBlbGVtID0kIEBvcHQuZWxlbSA/IFwiI3RpdGxlYmFyXCJcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snLCAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudCwgcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2luaWNvbiA9IGVsZW0gY2xhc3M6ICd3aW5pY29uJ1xuICAgICAgICBAd2luaWNvbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnLCBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lmljb25cbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHdpbmljb25cbiAgICAgICAgQHdpbmljb24uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nLCAnT3BlbiBNZW51JyAgIFxuICAgICAgICBcbiAgICAgICAgQHRpdGxlID0gZWxlbSBjbGFzczogJ3RpdGxlYmFyLXRpdGxlJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdGl0bGVcbiAgICAgICAgQHNldFRpdGxlIHBrZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAjIOKAlCDil7sg8J+eqVxuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtaW5pbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOCAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiLTFcIiB5MT1cIjVcIiB4Mj1cIjExXCIgeTI9XCI1XCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQG1pbmltaXplXG4gICAgICAgIEBtaW5pbWl6ZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicsICdNaW5pbWl6ZSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWF4aW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMVwiIGhlaWdodD1cIjExXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6IDA7XCI+PC9yZWN0PlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWF4aW1pemVcbiAgICAgICAgQG1heGltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuXG4gICAgICAgIEBjbG9zZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gY2xvc2UnXG4gICAgICAgIFxuICAgICAgICBAY2xvc2UuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIxMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY2xvc2VcbiAgICAgICAgQGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ0Nsb3NlJ1xuXG4gICAgICAgIEBpbml0U3R5bGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBpbml0TWVudSBAbWVudVRlbXBsYXRlKClcbiAgICAgICAgIFxuICAgIHNob3dUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnaW5pdGlhbCdcbiAgICBoaWRlVGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbiAgICBzZXRUaXRsZTogKGluZm8pIC0+XG4gICAgICAgIGh0bWwgID0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItbmFtZSc+I3tpbmZvLm5hbWV9PC9zcGFuPlwiXG4gICAgICAgIGlmIGluZm8udmVyc2lvblxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiDil48gPC9zcGFuPlwiXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLXZlcnNpb24nPiN7aW5mby52ZXJzaW9ufTwvc3Bhbj5cIlxuICAgICAgICBpZiBpbmZvLnBhdGhcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4g4q+IIDwvc3Bhbj5cIlxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci12ZXJzaW9uJz4je2luZm8ucGF0aH08L3NwYW4+XCJcbiAgICAgICAgQHRpdGxlLmlubmVySFRNTCA9IGh0bWxcbiAgICBcbiAgICBvblRpdGxlYmFyOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnc2hvd1RpdGxlJyAgIHRoZW4gQHNob3dUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlVGl0bGUnICAgdGhlbiBAaGlkZVRpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ3Nob3dNZW51JyAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlTWVudScgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAndG9nZ2xlTWVudScgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJyAgXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBNZW51JyAgICAgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnT3BlbiBNZW51JyAgICAgICAgdGhlbiBAb3Blbk1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnU2hvdyBNZW51JyAgICAgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZSBNZW51JyAgICAgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIFNjaGVtZScgICAgXG4gICAgICAgICAgICAgICAgaWYgQG9wdC5zY2hlbWUgIT0gZmFsc2UgdGhlbiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICAgICAgdGhlbiB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnTWluaW1pemUnICAgICAgICAgdGhlbiB3aW4ubWluaW1pemUoKVxuICAgICAgICAgICAgd2hlbiAnTWF4aW1pemUnIFxuICAgICAgICAgICAgICAgIHdhID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgICAgICAgICAgd2IgPSB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3aW4uaXNNYXhpbWl6ZWQoKSBvciAod2Iud2lkdGggPT0gd2Eud2lkdGggYW5kIHdiLmhlaWdodCA9PSB3YS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgaWYgbWF4aW1pemVkIHRoZW4gd2luLnVubWF4aW1pemUoKSBlbHNlIHdpbi5tYXhpbWl6ZSgpICBcblxuICAgIG1lbnVUZW1wbGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgICAgICAjIGxvZyAnbWVudVRlbXBsYXRlJywgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lm1lbnVcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlID0gQG1ha2VUZW1wbGF0ZSBub29uLmxvYWQgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lm1lbnVcbiAgICAgICAgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgXG4gICAgbWFrZVRlbXBsYXRlOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgdG1wbCA9IFtdXG4gICAgICAgIGZvciB0ZXh0LG1lbnVPckFjY2VsIG9mIG9ialxuICAgICAgICAgICAgdG1wbC5wdXNoIHN3aXRjaFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkobWVudU9yQWNjZWwpIGFuZCB0ZXh0LnN0YXJ0c1dpdGggJy0nXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgICAgICAgd2hlbiBfLmlzTnVtYmVyIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDpzdHIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNTdHJpbmcgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOm1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgd2hlbiBlbXB0eSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6ICcnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBtZW51T3JBY2NlbC5hY2NlbD8gb3IgbWVudU9yQWNjZWwuY29tbWFuZD8gIyBuZWVkcyBiZXR0ZXIgdGVzdCFcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBfLmNsb25lIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRleHQgPSB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVudTpAbWFrZVRlbXBsYXRlIG1lbnVPckFjY2VsXG4gICAgICAgIHRtcGxcblxuICAgIGluaXRNZW51OiAoaXRlbXMpIC0+XG5cbiAgICAgICAgQG1lbnUgPSBuZXcgbWVudSBpdGVtczppdGVtc1xuICAgICAgICBAZWxlbS5pbnNlcnRCZWZvcmUgQG1lbnUuZWxlbSwgQGVsZW0uZmlyc3RDaGlsZC5uZXh0U2libGluZ1xuICAgICAgICBAaGlkZU1lbnUoKVxuXG4gICAgbWVudVZpc2libGU6ID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSAhPSAnbm9uZSdcbiAgICBzaG93TWVudTogICAgPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7IEBtZW51Py5mb2N1cz8oKTsgcG9zdC5lbWl0ICd0aXRsZWJhcicsICdoaWRlVGl0bGUnXG4gICAgaGlkZU1lbnU6ICAgID0+IEBtZW51Py5jbG9zZSgpOyBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IHBvc3QuZW1pdCAndGl0bGViYXInLCAnc2hvd1RpdGxlJ1xuICAgIHRvZ2dsZU1lbnU6ICA9PiBpZiBAbWVudVZpc2libGUoKSB0aGVuIEBoaWRlTWVudSgpIGVsc2UgQHNob3dNZW51KClcbiAgICBvcGVuTWVudTogICAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpOyBAbWVudS5vcGVuKClcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpbml0U3R5bGU6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBsaW5rID0kIFwiI3N0eWxlLWxpbmtcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gc2xhc2guZmlsZVVybCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcImNzcy9zdHlsZS5jc3NcIlxuICAgICAgICAgICAgdGl0bGVTdHlsZSA9IGVsZW0gJ2xpbmsnLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgICAgICAgICByZWw6ICAnc3R5bGVzaGVldCdcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9jc3MnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsaW5rLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlIHRpdGxlU3R5bGUsIGxpbmtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3MvI3twcmVmcy5nZXQgJ3NjaGVtZScsICdkYXJrJ30uY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIGlkOiAgICdzdHlsZS10aXRsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcblxuICAgIGhhbmRsZUtleTogKGV2ZW50KSAtPlxuXG4gICAgICAgIHsgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIG1haW5NZW51ID0gQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGtleXBhdGggaW4gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnYWNjZWwnXG4gICAgICAgICAgICBjb21ib3MgPSBzZHMuZ2V0KG1haW5NZW51LCBrZXlwYXRoKS5zcGxpdCAnICdcbiAgICAgICAgICAgIGlmIGNvbWJvIGluIGNvbWJvc1xuICAgICAgICAgICAgICAgIGtleXBhdGgucG9wKClcbiAgICAgICAgICAgICAgICBpdGVtID0gc2RzLmdldCBtYWluTWVudSwga2V5cGF0aFxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbWVudUFjdGlvbicsIGl0ZW0uYWN0aW9uID8gaXRlbS50ZXh0LCBpdGVtLmFjdGFyZ1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtXG5cbiAgICAgICAgJ3VuaGFuZGxlZCdcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUaXRsZVxuIl19
//# sourceURL=C:/Users/kodi/s/kxk/coffee/title.coffee