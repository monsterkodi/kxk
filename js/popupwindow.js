(function() {
  /*
  00000000    0000000   00000000   000   000  00000000   000   000  000  000   000  
  000   000  000   000  000   000  000   000  000   000  000 0 000  000  0000  000  
  00000000   000   000  00000000   000   000  00000000   000000000  000  000 0 000  
  000        000   000  000        000   000  000        000   000  000  000  0000  
  000         0000000   000         0000000   000        00     00  000  000   000  
  */
  var PopupWindow, _, elem, keyinfo, slash;

  ({keyinfo, slash, elem, _} = require('./kxk'));

  PopupWindow = (function() {
    class PopupWindow {
      
      //  0000000  000   000   0000000   000   000  
      // 000       000   000  000   000  000 0 000  
      // 0000000   000000000  000   000  000000000  
      //      000  000   000  000   000  000   000  
      // 0000000   000   000   0000000   00     00  
      static show(opt) {
        var Browser, electron, html, i, item, len, popupOpt, ref, ref1, remote, win;
        electron = require('electron');
        
        // PopupWindow.close()
        PopupWindow.opt = opt;
        popupOpt = {
          winID: electron.remote.getCurrentWindow().id,
          items: []
        };
        ref = opt.items;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          if (!item.hide) {
            popupOpt.items.push({
              text: item.text,
              combo: item.combo
            });
          }
        }
        remote = electron.remote;
        Browser = remote.BrowserWindow;
        electron.ipcRenderer.on('popupItem', PopupWindow.onPopupItem);
        electron.ipcRenderer.on('popupClose', PopupWindow.close);
        if (PopupWindow.win != null) {
          PopupWindow.win.setPosition(opt.x, opt.y);
        } else {
          win = new Browser({
            x: opt.x,
            y: opt.y,
            backgroundColor: (ref1 = opt.background) != null ? ref1 : '#222',
            hasShadow: true,
            show: false,
            frame: false,
            resizable: false,
            minimizable: false,
            maximizable: false,
            fullscreenable: false,
            webPreferences: {
              webSecurity: false
            },
            width: 240,
            height: popupOpt.items.length * 28
          });
          
          // html = """
          // <link rel='stylesheet' href="#{slash.fileUrl opt.stylesheet}" type='text/css'>
          // <body>
          // <script>
          // var PopupWindow = require("#{slash.path __dirname}/popupWindow");
          // new PopupWindow(#{JSON.stringify popupOpt});
          // </script>
          // </body>
          // """
          // win.loadURL "data:text/html;charset=utf-8," + encodeURI html
          win.on('blur', PopupWindow.close);
          // win.on 'ready-to-show', -> 
          // win.show()
          // win.webContents.openDevTools()
          PopupWindow.win = win;
        }
        html = `<link rel='stylesheet' href="${slash.fileUrl(opt.stylesheet)}" type='text/css'>\n<body>\n<script>\n    var PopupWindow = require("${slash.path(__dirname)}/popupWindow");\n    new PopupWindow(${JSON.stringify(popupOpt)});\n</script>\n</body>`;
        PopupWindow.win.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
        PopupWindow.win.webContents.on('did-finish-load', function() {
          return PopupWindow.win.show();
        });
        return PopupWindow.win;
      }

      static onPopupItem(e, text) {
        var i, item, len, ref, results;
        PopupWindow.close();
        ref = PopupWindow.opt.items;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          if (item.text === text) {
            if (typeof item.cb === "function") {
              item.cb();
            }
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      }

      static close() {
        var electron, ref;
        electron = require('electron');
        electron.ipcRenderer.removeListener('popupItem', PopupWindow.onPopupItem);
        electron.ipcRenderer.removeListener('popupClose', PopupWindow.close);
        return (ref = PopupWindow.win) != null ? ref.hide() : void 0;
      }

      // 00000000    0000000   00000000   000   000  00000000   
      // 000   000  000   000  000   000  000   000  000   000  
      // 00000000   000   000  00000000   000   000  00000000   
      // 000        000   000  000        000   000  000        
      // 000         0000000   000         0000000   000        
      constructor(opt) {
        var combo, div, i, item, len, ref, ref1;
        this.close = this.close.bind(this);
        this.onHover = this.onHover.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.items = elem({
          class: 'popupWindow',
          tabindex: 1
        });
        this.targetWinID = opt.winID;
        ref = opt.items;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          if (item.hide) {
            continue;
          }
          div = elem({
            class: 'popupItem',
            text: item.text
          });
          div.item = item;
          div.addEventListener('click', this.onClick);
          if (item.combo != null) {
            combo = elem('span', {
              class: 'popupCombo',
              text: item.combo
            });
            div.appendChild(combo);
          }
          this.items.appendChild(div);
        }
        this.select(this.items.firstChild);
        ((ref1 = opt.parent) != null ? ref1 : document.body).appendChild(this.items);
        this.items.addEventListener('keydown', this.onKeyDown);
        this.items.addEventListener('focusout', this.onFocusOut);
        this.items.addEventListener('mouseover', this.onHover);
        this.items.focus();
        this.getWin().setSize(parseInt(this.items.getBoundingClientRect().width), parseInt(this.items.getBoundingClientRect().height));
      }

      close() {
        var electron, ref, ref1, ref2, ref3, targetWin;
        electron = require('electron');
        if ((ref = this.items) != null) {
          ref.removeEventListener('keydown', this.onKeyDown);
        }
        if ((ref1 = this.items) != null) {
          ref1.removeEventListener('focusout', this.onFocusOut);
        }
        if ((ref2 = this.items) != null) {
          ref2.removeEventListener('mouseover', this.onHover);
        }
        if ((ref3 = this.items) != null) {
          ref3.remove();
        }
        delete this.items;
        targetWin = electron.remote.BrowserWindow.fromId(this.targetWinID);
        return targetWin.webContents.send('popupClose');
      }

      getWin() {
        return require('electron').remote.getCurrentWindow();
      }

      select(item) {
        var ref;
        if (item == null) {
          return;
        }
        if ((ref = this.selected) != null) {
          ref.classList.remove('selected');
        }
        this.selected = item;
        return this.selected.classList.add('selected');
      }

      activate(item) {
        var electron, ref, targetWin;
        electron = require('electron');
        targetWin = electron.remote.BrowserWindow.fromId(this.targetWinID);
        targetWin.webContents.send('popupItem', (ref = item.item.ipc) != null ? ref : item.item.text);
        return this.close();
      }

      onHover(event) {
        return this.select(event.target);
      }

      onKeyDown(event) {
        var combo, electron, key, mod, ref, ref1, ref2, ref3, ref4, ref5, targetWin;
        electron = require('electron');
        ({mod, key, combo} = keyinfo.forEvent(event));
        switch (combo) {
          case 'end':
          case 'page down':
            return this.select(this.items.lastChild);
          case 'home':
          case 'page up':
            return this.select(this.items.firstChild);
          case 'enter':
            return this.activate(this.selected);
          case 'esc':
          case 'space':
            return this.close();
          case 'down':
            return this.select((ref = (ref1 = this.selected) != null ? ref1.nextSibling : void 0) != null ? ref : this.items.firstChild);
          case 'up':
            return this.select((ref2 = (ref3 = this.selected) != null ? ref3.previousSibling : void 0) != null ? ref2 : this.items.lastChild);
          case 'right':
            return this.select((ref4 = this.selected) != null ? ref4.nextSibling : void 0);
          case 'left':
            return this.select((ref5 = this.selected) != null ? ref5.previousSibling : void 0);
        }
        if (key.length < 1) {
          return;
        }
        targetWin = electron.remote.BrowserWindow.fromId(this.targetWinID);
        targetWin.webContents.send('popupModKeyCombo', mod, key, combo);
        return this.close();
      }

      onClick(e) {
        return this.activate(e.target);
      }

    };

    PopupWindow.win = null;

    PopupWindow.opt = null;

    PopupWindow.popup = null;

    return PopupWindow;

  }).call(this);

  module.exports = PopupWindow;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXB3aW5kb3cuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9wb3B1cHdpbmRvdy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsV0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxPQUFGLEVBQVcsS0FBWCxFQUFrQixJQUFsQixFQUF3QixDQUF4QixDQUFBLEdBQThCLE9BQUEsQ0FBUSxPQUFSLENBQTlCOztFQUVNO0lBQU4sTUFBQSxZQUFBLENBQUE7Ozs7Ozs7TUFZVyxPQUFOLElBQU0sQ0FBQyxHQUFELENBQUE7QUFFSCxZQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQTtRQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUixFQUFYOzs7UUFJQSxXQUFXLENBQUMsR0FBWixHQUFrQjtRQUVsQixRQUFBLEdBQ0k7VUFBQSxLQUFBLEVBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBaEIsQ0FBQSxDQUFrQyxDQUFDLEVBQTFDO1VBQ0EsS0FBQSxFQUFNO1FBRE47QUFFSjtRQUFBLEtBQUEscUNBQUE7O1VBQ0ksSUFBRyxDQUFJLElBQUksQ0FBQyxJQUFaO1lBQ0ksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFmLENBQ0k7Y0FBQSxJQUFBLEVBQU0sSUFBSSxDQUFDLElBQVg7Y0FDQSxLQUFBLEVBQU8sSUFBSSxDQUFDO1lBRFosQ0FESixFQURKOztRQURKO1FBTUEsTUFBQSxHQUFXLFFBQVEsQ0FBQztRQUNwQixPQUFBLEdBQVcsTUFBTSxDQUFDO1FBRWxCLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBckIsQ0FBd0IsV0FBeEIsRUFBcUMsV0FBVyxDQUFDLFdBQWpEO1FBQ0EsUUFBUSxDQUFD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TVMsSUFOVDtBQU1pQyxtQkFBTyxJQUFDLENBQUEsTUFBRCwwRkFBcUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUE1QztBQU54QyxlQU9TLE9BUFQ7QUFPaUMsbUJBQU8sSUFBQyxDQUFBLE1BQUQsc0NBQWlCLENBQUUsb0JBQW5CO0FBUHhDLGVBUVMsTUFSVDtBQVFpQyxtQkFBTyxJQUFDLENBQUEsTUFBRCxzQ0FBaUIsQ0FBRSx3QkFBbkI7QUFSeEM7UUFTQSxJQUFVLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBdkI7QUFBQSxpQkFBQTs7UUFDQSxTQUFBLEdBQVksUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBOUIsQ0FBcUMsSUFBQyxDQUFBLFdBQXRDO1FBQ1osU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUF0QixDQUEyQixrQkFBM0IsRUFBK0MsR0FBL0MsRUFBb0QsR0FBcEQsRUFBeUQsS0FBekQ7ZUFDQSxJQUFDLENBQUEsS0FBRCxDQUFBO01BaEJPOztNQWtCWCxPQUFTLENBQUMsQ0FBRCxDQUFBO2VBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQUMsTUFBWjtNQUFQOztJQXBMYjs7SUFFSSxXQUFDLENBQUEsR0FBRCxHQUFTOztJQUNULFdBQUMsQ0FBQSxHQUFELEdBQVM7O0lBQ1QsV0FBQyxDQUFBLEtBQUQsR0FBUzs7Ozs7O0VBa0xiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBaE1qQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXHJcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcclxuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxyXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXHJcbjAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcclxuIyMjXHJcblxyXG57IGtleWluZm8sIHNsYXNoLCBlbGVtLCBfIH0gPSByZXF1aXJlICcuL2t4aydcclxuXHJcbmNsYXNzIFBvcHVwV2luZG93XHJcbiAgICBcclxuICAgIEB3aW4gICA9IG51bGxcclxuICAgIEBvcHQgICA9IG51bGxcclxuICAgIEBwb3B1cCA9IG51bGxcclxuICAgIFxyXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXHJcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcclxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxyXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXHJcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcclxuICAgIFxyXG4gICAgQHNob3c6IChvcHQpIC0+XHJcbiAgICAgICAgXHJcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcclxuICAgICAgICBcclxuICAgICAgICAjIFBvcHVwV2luZG93LmNsb3NlKClcclxuICAgICAgICBcclxuICAgICAgICBQb3B1cFdpbmRvdy5vcHQgPSBvcHQgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHBvcHVwT3B0ID0gXHJcbiAgICAgICAgICAgIHdpbklEOiBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmlkXHJcbiAgICAgICAgICAgIGl0ZW1zOltdXHJcbiAgICAgICAgZm9yIGl0ZW0gaW4gb3B0Lml0ZW1zXHJcbiAgICAgICAgICAgIGlmIG5vdCBpdGVtLmhpZGVcclxuICAgICAgICAgICAgICAgIHBvcHVwT3B0Lml0ZW1zLnB1c2hcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpdGVtLnRleHRcclxuICAgICAgICAgICAgICAgICAgICBjb21ibzogaXRlbS5jb21ib1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJlbW90ZSAgID0gZWxlY3Ryb24ucmVtb3RlXHJcbiAgICAgICAgQnJvd3NlciAgPSByZW1vdGUuQnJvd3NlcldpbmRvd1xyXG4gICAgICAgIFxyXG4gICAgICAgIGVsZWN0cm9uLmlwY1JlbmRlcmVyLm9uICdwb3B1cEl0ZW0nLCBQb3B1cFdpbmRvdy5vblBvcHVwSXRlbVxyXG4gICAgICAgIGVsZWN0cm9uLmlwY1JlbmRlcmVyLm9uICdwb3B1cENsb3NlJywgUG9wdXBXaW5kb3cuY2xvc2VcclxuICAgICAgICBcclxuICAgICAgICBpZiBQb3B1cFdpbmRvdy53aW4/XHJcbiAgICAgICAgICAgIFBvcHVwV2luZG93Lndpbi5zZXRQb3NpdGlvbiBvcHQueCwgb3B0LnlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHdpbiA9IG5ldyBCcm93c2VyXHJcbiAgICAgICAgICAgICAgICB4OiAgICAgICAgICAgICAgIG9wdC54XHJcbiAgICAgICAgICAgICAgICB5OiAgICAgICAgICAgICAgIG9wdC55XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IG9wdC5iYWNrZ3JvdW5kID8gJyMyMjInXHJcbiAgICAgICAgICAgICAgICBoYXNTaGFkb3c6ICAgICAgIHRydWVcclxuICAgICAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgIGZ1bGxzY3JlZW5hYmxlOiAgZmFsc2VcclxuICAgICAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOlxyXG4gICAgICAgICAgICAgICAgICAgIHdlYlNlY3VyaXR5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAyNDBcclxuICAgICAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgcG9wdXBPcHQuaXRlbXMubGVuZ3RoICogMjhcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAjIGh0bWwgPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICMgPGxpbmsgcmVsPSdzdHlsZXNoZWV0JyBocmVmPVwiI3tzbGFzaC5maWxlVXJsIG9wdC5zdHlsZXNoZWV0fVwiIHR5cGU9J3RleHQvY3NzJz5cclxuICAgICAgICAgICAgICAgICMgPGJvZHk+XHJcbiAgICAgICAgICAgICAgICAjIDxzY3JpcHQ+XHJcbiAgICAgICAgICAgICAgICAgICAgIyB2YXIgUG9wdXBXaW5kb3cgPSByZXF1aXJlKFwiI3tzbGFzaC5wYXRoIF9fZGlybmFtZX0vcG9wdXBXaW5kb3dcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgIyBuZXcgUG9wdXBXaW5kb3coI3tKU09OLnN0cmluZ2lmeSBwb3B1cE9wdH0pO1xyXG4gICAgICAgICAgICAgICAgIyA8L3NjcmlwdD5cclxuICAgICAgICAgICAgICAgICMgPC9ib2R5PlxyXG4gICAgICAgICAgICAjIFwiXCJcIlxyXG4gICAgICAgICAgICAjIHdpbi5sb2FkVVJMIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXHJcbiAgICBcclxuICAgICAgICAgICAgd2luLm9uICdibHVyJywgUG9wdXBXaW5kb3cuY2xvc2VcclxuICAgICAgICAgICAgIyB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAtPiBcclxuICAgICAgICAgICAgICAgICMgd2luLnNob3coKVxyXG4gICAgICAgICAgICAgICAgIyB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBQb3B1cFdpbmRvdy53aW4gPSB3aW5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAgICAgICA8bGluayByZWw9J3N0eWxlc2hlZXQnIGhyZWY9XCIje3NsYXNoLmZpbGVVcmwgb3B0LnN0eWxlc2hlZXR9XCIgdHlwZT0ndGV4dC9jc3MnPlxyXG4gICAgICAgICAgICA8Ym9keT5cclxuICAgICAgICAgICAgPHNjcmlwdD5cclxuICAgICAgICAgICAgICAgIHZhciBQb3B1cFdpbmRvdyA9IHJlcXVpcmUoXCIje3NsYXNoLnBhdGggX19kaXJuYW1lfS9wb3B1cFdpbmRvd1wiKTtcclxuICAgICAgICAgICAgICAgIG5ldyBQb3B1cFdpbmRvdygje0pTT04uc3RyaW5naWZ5IHBvcHVwT3B0fSk7XHJcbiAgICAgICAgICAgIDwvc2NyaXB0PlxyXG4gICAgICAgICAgICA8L2JvZHk+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgUG9wdXBXaW5kb3cud2luLmxvYWRVUkwgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcclxuICAgICAgICBQb3B1cFdpbmRvdy53aW4ud2ViQ29udGVudHMub24gJ2RpZC1maW5pc2gtbG9hZCcsIC0+XHJcbiAgICAgICAgICAgIFBvcHVwV2luZG93Lndpbi5zaG93KClcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgUG9wdXBXaW5kb3cud2luXHJcblxyXG4gICAgQG9uUG9wdXBJdGVtOiAoZSx0ZXh0KSAtPiBcclxuICAgICAgICBcclxuICAgICAgICBQb3B1cFdpbmRvdy5jbG9zZSgpXHJcbiAgICAgICAgZm9yIGl0ZW0gaW4gUG9wdXBXaW5kb3cub3B0Lml0ZW1zXHJcbiAgICAgICAgICAgIGlmIGl0ZW0udGV4dCA9PSB0ZXh0XHJcbiAgICAgICAgICAgICAgICBpdGVtLmNiPygpXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgIFxyXG4gICAgQGNsb3NlOiAtPiBcclxuICAgICAgICBcclxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xyXG4gICAgICAgIGVsZWN0cm9uLmlwY1JlbmRlcmVyLnJlbW92ZUxpc3RlbmVyICdwb3B1cEl0ZW0nLCAgUG9wdXBXaW5kb3cub25Qb3B1cEl0ZW1cclxuICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lciAncG9wdXBDbG9zZScsIFBvcHVwV2luZG93LmNsb3NlXHJcbiAgICAgICAgXHJcbiAgICAgICAgUG9wdXBXaW5kb3cud2luPy5oaWRlKClcclxuXHJcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcclxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxyXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXHJcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcclxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcjogKG9wdCkgLT5cclxuICAgICAgICBcclxuICAgICAgICBAaXRlbXMgPSBlbGVtIGNsYXNzOiAncG9wdXBXaW5kb3cnLCB0YWJpbmRleDogMVxyXG4gICAgICAgIEB0YXJnZXRXaW5JRCA9IG9wdC53aW5JRFxyXG4gICAgICAgIGZvciBpdGVtIGluIG9wdC5pdGVtc1xyXG4gICAgICAgICAgICBjb250aW51ZSBpZiBpdGVtLmhpZGVcclxuICAgICAgICAgICAgZGl2ID0gZWxlbSBjbGFzczogJ3BvcHVwSXRlbScsIHRleHQ6IGl0ZW0udGV4dFxyXG4gICAgICAgICAgICBkaXYuaXRlbSA9IGl0ZW1cclxuICAgICAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgQG9uQ2xpY2tcclxuICAgICAgICAgICAgaWYgaXRlbS5jb21ibz9cclxuICAgICAgICAgICAgICAgIGNvbWJvID0gZWxlbSAnc3BhbicsIGNsYXNzOiAncG9wdXBDb21ibycsIHRleHQ6IGl0ZW0uY29tYm9cclxuICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCBjb21ib1xyXG4gICAgICAgICAgICBAaXRlbXMuYXBwZW5kQ2hpbGQgZGl2XHJcblxyXG4gICAgICAgIEBzZWxlY3QgQGl0ZW1zLmZpcnN0Q2hpbGRcclxuXHJcbiAgICAgICAgKG9wdC5wYXJlbnQgPyBkb2N1bWVudC5ib2R5KS5hcHBlbmRDaGlsZCBAaXRlbXNcclxuXHJcbiAgICAgICAgQGl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAgIEBvbktleURvd25cclxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAnZm9jdXNvdXQnLCAgQG9uRm9jdXNPdXRcclxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgQG9uSG92ZXJcclxuICAgICAgICBAaXRlbXMuZm9jdXMoKVxyXG5cclxuICAgICAgICBAZ2V0V2luKCkuc2V0U2l6ZSBwYXJzZUludChAaXRlbXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KEBpdGVtcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpXHJcbiAgICAgICAgXHJcbiAgICBjbG9zZTogPT5cclxuICAgICAgICBcclxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xyXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsICAgQG9uS2V5RG93blxyXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAnZm9jdXNvdXQnLCAgQG9uRm9jdXNPdXRcclxuICAgICAgICBAaXRlbXM/LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNlb3ZlcicsIEBvbkhvdmVyXHJcbiAgICAgICAgQGl0ZW1zPy5yZW1vdmUoKVxyXG4gICAgICAgIGRlbGV0ZSBAaXRlbXNcclxuICAgICAgICB0YXJnZXRXaW4gPSBlbGVjdHJvbi5yZW1vdGUuQnJvd3NlcldpbmRvdy5mcm9tSWQgQHRhcmdldFdpbklEXHJcbiAgICAgICAgdGFyZ2V0V2luLndlYkNvbnRlbnRzLnNlbmQgJ3BvcHVwQ2xvc2UnXHJcblxyXG4gICAgZ2V0V2luOiAtPiByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcclxuXHJcbiAgICBzZWxlY3Q6IChpdGVtKSAtPiBcclxuICAgICAgICByZXR1cm4gaWYgbm90IGl0ZW0/XHJcbiAgICAgICAgQHNlbGVjdGVkPy5jbGFzc0xpc3QucmVtb3ZlICdzZWxlY3RlZCdcclxuICAgICAgICBAc2VsZWN0ZWQgPSBpdGVtXHJcbiAgICAgICAgQHNlbGVjdGVkLmNsYXNzTGlzdC5hZGQgJ3NlbGVjdGVkJ1xyXG4gICAgICAgIFxyXG4gICAgYWN0aXZhdGU6IChpdGVtKSAtPlxyXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXHJcbiAgICAgICAgdGFyZ2V0V2luID0gZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3cuZnJvbUlkIEB0YXJnZXRXaW5JRFxyXG4gICAgICAgIHRhcmdldFdpbi53ZWJDb250ZW50cy5zZW5kICdwb3B1cEl0ZW0nLCBpdGVtLml0ZW0uaXBjID8gaXRlbS5pdGVtLnRleHRcclxuICAgICAgICBAY2xvc2UoKVxyXG4gICAgIFxyXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PiBAc2VsZWN0IGV2ZW50LnRhcmdldCAgIFxyXG4gICAgXHJcbiAgICBvbktleURvd246IChldmVudCkgPT5cclxuICAgICAgICBcclxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xyXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XHJcbiAgICAgICAgc3dpdGNoIGNvbWJvXHJcbiAgICAgICAgICAgIHdoZW4gJ2VuZCcsICdwYWdlIGRvd24nIHRoZW4gcmV0dXJuIEBzZWxlY3QgQGl0ZW1zLmxhc3RDaGlsZFxyXG4gICAgICAgICAgICB3aGVuICdob21lJywgJ3BhZ2UgdXAnICB0aGVuIHJldHVybiBAc2VsZWN0IEBpdGVtcy5maXJzdENoaWxkXHJcbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJyAgICAgICAgICAgIHRoZW4gcmV0dXJuIEBhY3RpdmF0ZSBAc2VsZWN0ZWRcclxuICAgICAgICAgICAgd2hlbiAnZXNjJywgJ3NwYWNlJyAgICAgdGhlbiByZXR1cm4gQGNsb3NlKClcclxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgICAgICAgICAgdGhlbiByZXR1cm4gQHNlbGVjdCBAc2VsZWN0ZWQ/Lm5leHRTaWJsaW5nID8gQGl0ZW1zLmZpcnN0Q2hpbGQgXHJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIEBzZWxlY3QgQHNlbGVjdGVkPy5wcmV2aW91c1NpYmxpbmcgPyBAaXRlbXMubGFzdENoaWxkIFxyXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgICAgICAgICB0aGVuIHJldHVybiBAc2VsZWN0IEBzZWxlY3RlZD8ubmV4dFNpYmxpbmdcclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgICAgICAgICAgdGhlbiByZXR1cm4gQHNlbGVjdCBAc2VsZWN0ZWQ/LnByZXZpb3VzU2libGluZ1xyXG4gICAgICAgIHJldHVybiBpZiBrZXkubGVuZ3RoIDwgMVxyXG4gICAgICAgIHRhcmdldFdpbiA9IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93LmZyb21JZCBAdGFyZ2V0V2luSURcclxuICAgICAgICB0YXJnZXRXaW4ud2ViQ29udGVudHMuc2VuZCAncG9wdXBNb2RLZXlDb21ibycsIG1vZCwga2V5LCBjb21ib1xyXG4gICAgICAgIEBjbG9zZSgpXHJcbiAgICAgXHJcbiAgICBvbkNsaWNrOiAoZSkgPT4gQGFjdGl2YXRlIGUudGFyZ2V0XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvcHVwV2luZG93XHJcbiJdfQ==
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/popupwindow.coffee