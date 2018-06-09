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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXB3aW5kb3cuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vY29mZmVlL3BvcHVwd2luZG93LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxXQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLE9BQUYsRUFBVyxLQUFYLEVBQWtCLElBQWxCLEVBQXdCLENBQXhCLENBQUEsR0FBOEIsT0FBQSxDQUFRLE9BQVIsQ0FBOUI7O0VBRU07SUFBTixNQUFBLFlBQUEsQ0FBQTs7Ozs7OztNQVlXLE9BQU4sSUFBTSxDQUFDLEdBQUQsQ0FBQTtBQUVILFlBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBO1FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO1FBRVgsV0FBVyxDQUFDLEdBQVosR0FBa0I7UUFFbEIsUUFBQSxHQUNJO1VBQUEsS0FBQSxFQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWhCLENBQUEsQ0FBa0MsQ0FBQyxFQUExQztVQUNBLEtBQUEsRUFBTTtRQUROO0FBRUo7UUFBQSxLQUFBLHFDQUFBOztVQUNJLElBQUcsQ0FBSSxJQUFJLENBQUMsSUFBWjtZQUNJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBZixDQUNJO2NBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxJQUFYO2NBQ0EsS0FBQSxFQUFPLElBQUksQ0FBQztZQURaLENBREosRUFESjs7UUFESjtRQU1BLE1BQUEsR0FBVyxRQUFRLENBQUM7UUFDcEIsT0FBQSxHQUFXLE1BQU0sQ0FBQztRQUVsQixRQUFRLENBQUMsV0FBVyxDQUFDLEVBQXJCLENBQXdCLFdBQXhCLEVBQXFDLFdBQVcsQ0FBQyxXQUFqRDtRQUNBLFFBQVEsQ0FBQyxXQUFX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TlQ7QUFNaUMsbUJBQU8sSUFBQyxDQUFBLE1BQUQsMEZBQXFDLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBNUM7QUFOeEMsZUFPUyxPQVBUO0FBT2lDLG1CQUFPLElBQUMsQ0FBQSxNQUFELHNDQUFpQixDQUFFLG9CQUFuQjtBQVB4QyxlQVFTLE1BUlQ7QUFRaUMsbUJBQU8sSUFBQyxDQUFBLE1BQUQsc0NBQWlCLENBQUUsd0JBQW5CO0FBUnhDO1FBU0EsSUFBVSxHQUFHLENBQUMsTUFBSixHQUFhLENBQXZCO0FBQUEsaUJBQUE7O1FBQ0EsU0FBQSxHQUFZLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQTlCLENBQXFDLElBQUMsQ0FBQSxXQUF0QztRQUNaLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBdEIsQ0FBMkIsa0JBQTNCLEVBQStDLEdBQS9DLEVBQW9ELEdBQXBELEVBQXlELEtBQXpEO2VBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtNQWhCTzs7TUFrQlgsT0FBUyxDQUFDLENBQUQsQ0FBQTtlQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFDLE1BQVo7TUFBUDs7SUFsTGI7O0lBRUksV0FBQyxDQUFBLEdBQUQsR0FBUzs7SUFDVCxXQUFDLENBQUEsR0FBRCxHQUFTOztJQUNULFdBQUMsQ0FBQSxLQUFELEdBQVM7Ozs7OztFQWdMYixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTlMakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbjAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IGtleWluZm8sIHNsYXNoLCBlbGVtLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgUG9wdXBXaW5kb3dcbiAgICBcbiAgICBAd2luICAgPSBudWxsXG4gICAgQG9wdCAgID0gbnVsbFxuICAgIEBwb3B1cCA9IG51bGxcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiAgICBcbiAgICBAc2hvdzogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIFxuICAgICAgICBQb3B1cFdpbmRvdy5vcHQgPSBvcHQgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcG9wdXBPcHQgPSBcbiAgICAgICAgICAgIHdpbklEOiBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmlkXG4gICAgICAgICAgICBpdGVtczpbXVxuICAgICAgICBmb3IgaXRlbSBpbiBvcHQuaXRlbXNcbiAgICAgICAgICAgIGlmIG5vdCBpdGVtLmhpZGVcbiAgICAgICAgICAgICAgICBwb3B1cE9wdC5pdGVtcy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW0udGV4dFxuICAgICAgICAgICAgICAgICAgICBjb21ibzogaXRlbS5jb21ib1xuICAgICAgICBcbiAgICAgICAgcmVtb3RlICAgPSBlbGVjdHJvbi5yZW1vdGVcbiAgICAgICAgQnJvd3NlciAgPSByZW1vdGUuQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uaXBjUmVuZGVyZXIub24gJ3BvcHVwSXRlbScsIFBvcHVwV2luZG93Lm9uUG9wdXBJdGVtXG4gICAgICAgIGVsZWN0cm9uLmlwY1JlbmRlcmVyLm9uICdwb3B1cENsb3NlJywgUG9wdXBXaW5kb3cuY2xvc2VcbiAgICAgICAgXG4gICAgICAgIGlmIFBvcHVwV2luZG93Lndpbj9cbiAgICAgICAgICAgIFBvcHVwV2luZG93Lndpbi5zZXRQb3NpdGlvbiBvcHQueCwgb3B0LnlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2luID0gbmV3IEJyb3dzZXJcbiAgICAgICAgICAgICAgICB4OiAgICAgICAgICAgICAgIG9wdC54XG4gICAgICAgICAgICAgICAgeTogICAgICAgICAgICAgICBvcHQueVxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb3B0LmJhY2tncm91bmQgPyAnIzIyMidcbiAgICAgICAgICAgICAgICBoYXNTaGFkb3c6ICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIGZ1bGxzY3JlZW5hYmxlOiAgZmFsc2VcbiAgICAgICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6IGZhbHNlXG4gICAgICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAyNDBcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIHBvcHVwT3B0Lml0ZW1zLmxlbmd0aCAqIDI4XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAjIDxsaW5rIHJlbD0nc3R5bGVzaGVldCcgaHJlZj1cIiN7c2xhc2guZmlsZVVybCBvcHQuc3R5bGVzaGVldH1cIiB0eXBlPSd0ZXh0L2Nzcyc+XG4gICAgICAgICAgICAgICAgIyA8Ym9keT5cbiAgICAgICAgICAgICAgICAjIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgICAgICMgdmFyIFBvcHVwV2luZG93ID0gcmVxdWlyZShcIiN7c2xhc2gucGF0aCBfX2Rpcm5hbWV9L3BvcHVwV2luZG93XCIpO1xuICAgICAgICAgICAgICAgICAgICAjIG5ldyBQb3B1cFdpbmRvdygje0pTT04uc3RyaW5naWZ5IHBvcHVwT3B0fSk7XG4gICAgICAgICAgICAgICAgIyA8L3NjcmlwdD5cbiAgICAgICAgICAgICAgICAjIDwvYm9keT5cbiAgICAgICAgICAgICMgXCJcIlwiXG4gICAgICAgICAgICAjIHdpbi5sb2FkVVJMIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgXG4gICAgICAgICAgICB3aW4ub24gJ2JsdXInLCBQb3B1cFdpbmRvdy5jbG9zZVxuICAgICAgICAgICAgIyB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAtPiBcbiAgICAgICAgICAgICAgICAjIHdpbi5zaG93KClcbiAgICAgICAgICAgICAgICAjIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgUG9wdXBXaW5kb3cud2luID0gd2luXG4gICAgICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPGxpbmsgcmVsPSdzdHlsZXNoZWV0JyBocmVmPVwiI3tzbGFzaC5maWxlVXJsIG9wdC5zdHlsZXNoZWV0fVwiIHR5cGU9J3RleHQvY3NzJz5cbiAgICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICB2YXIgUG9wdXBXaW5kb3cgPSByZXF1aXJlKFwiI3tzbGFzaC5wYXRoIF9fZGlybmFtZX0vcG9wdXBXaW5kb3dcIik7XG4gICAgICAgICAgICAgICAgbmV3IFBvcHVwV2luZG93KCN7SlNPTi5zdHJpbmdpZnkgcG9wdXBPcHR9KTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgUG9wdXBXaW5kb3cud2luLmxvYWRVUkwgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICAgICAgUG9wdXBXaW5kb3cud2luLndlYkNvbnRlbnRzLm9uICdkaWQtZmluaXNoLWxvYWQnLCAtPlxuICAgICAgICAgICAgUG9wdXBXaW5kb3cud2luLnNob3coKVxuICAgICAgICAgICAgXG4gICAgICAgIFBvcHVwV2luZG93LndpblxuXG4gICAgQG9uUG9wdXBJdGVtOiAoZSx0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIFBvcHVwV2luZG93LmNsb3NlKClcbiAgICAgICAgZm9yIGl0ZW0gaW4gUG9wdXBXaW5kb3cub3B0Lml0ZW1zXG4gICAgICAgICAgICBpZiBpdGVtLnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgICAgIGl0ZW0uY2I/KClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICBAY2xvc2U6IC0+IFxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgZWxlY3Ryb24uaXBjUmVuZGVyZXIucmVtb3ZlTGlzdGVuZXIgJ3BvcHVwSXRlbScsICBQb3B1cFdpbmRvdy5vblBvcHVwSXRlbVxuICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lciAncG9wdXBDbG9zZScsIFBvcHVwV2luZG93LmNsb3NlXG4gICAgICAgIFxuICAgICAgICBQb3B1cFdpbmRvdy53aW4/LmhpZGUoKVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAaXRlbXMgPSBlbGVtIGNsYXNzOiAncG9wdXBXaW5kb3cnLCB0YWJpbmRleDogMVxuICAgICAgICBAdGFyZ2V0V2luSUQgPSBvcHQud2luSURcbiAgICAgICAgZm9yIGl0ZW0gaW4gb3B0Lml0ZW1zXG4gICAgICAgICAgICBjb250aW51ZSBpZiBpdGVtLmhpZGVcbiAgICAgICAgICAgIGRpdiA9IGVsZW0gY2xhc3M6ICdwb3B1cEl0ZW0nLCB0ZXh0OiBpdGVtLnRleHRcbiAgICAgICAgICAgIGRpdi5pdGVtID0gaXRlbVxuICAgICAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgQG9uQ2xpY2tcbiAgICAgICAgICAgIGlmIGl0ZW0uY29tYm8/XG4gICAgICAgICAgICAgICAgY29tYm8gPSBlbGVtICdzcGFuJywgY2xhc3M6ICdwb3B1cENvbWJvJywgdGV4dDogaXRlbS5jb21ib1xuICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCBjb21ib1xuICAgICAgICAgICAgQGl0ZW1zLmFwcGVuZENoaWxkIGRpdlxuXG4gICAgICAgIEBzZWxlY3QgQGl0ZW1zLmZpcnN0Q2hpbGRcblxuICAgICAgICAob3B0LnBhcmVudCA/IGRvY3VtZW50LmJvZHkpLmFwcGVuZENoaWxkIEBpdGVtc1xuXG4gICAgICAgIEBpdGVtcy5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgICBAb25LZXlEb3duXG4gICAgICAgIEBpdGVtcy5hZGRFdmVudExpc3RlbmVyICdmb2N1c291dCcsICBAb25Gb2N1c091dFxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgQG9uSG92ZXJcbiAgICAgICAgQGl0ZW1zLmZvY3VzKClcblxuICAgICAgICBAZ2V0V2luKCkuc2V0U2l6ZSBwYXJzZUludChAaXRlbXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChAaXRlbXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KVxuICAgICAgICBcbiAgICBjbG9zZTogPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsICAgQG9uS2V5RG93blxuICAgICAgICBAaXRlbXM/LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2ZvY3Vzb3V0JywgIEBvbkZvY3VzT3V0XG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgQG9uSG92ZXJcbiAgICAgICAgQGl0ZW1zPy5yZW1vdmUoKVxuICAgICAgICBkZWxldGUgQGl0ZW1zXG4gICAgICAgIHRhcmdldFdpbiA9IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93LmZyb21JZCBAdGFyZ2V0V2luSURcbiAgICAgICAgdGFyZ2V0V2luLndlYkNvbnRlbnRzLnNlbmQgJ3BvcHVwQ2xvc2UnXG5cbiAgICBnZXRXaW46IC0+IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuXG4gICAgc2VsZWN0OiAoaXRlbSkgLT4gXG4gICAgICAgIHJldHVybiBpZiBub3QgaXRlbT9cbiAgICAgICAgQHNlbGVjdGVkPy5jbGFzc0xpc3QucmVtb3ZlICdzZWxlY3RlZCdcbiAgICAgICAgQHNlbGVjdGVkID0gaXRlbVxuICAgICAgICBAc2VsZWN0ZWQuY2xhc3NMaXN0LmFkZCAnc2VsZWN0ZWQnXG4gICAgICAgIFxuICAgIGFjdGl2YXRlOiAoaXRlbSkgLT5cbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgdGFyZ2V0V2luID0gZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3cuZnJvbUlkIEB0YXJnZXRXaW5JRFxuICAgICAgICB0YXJnZXRXaW4ud2ViQ29udGVudHMuc2VuZCAncG9wdXBJdGVtJywgaXRlbS5pdGVtLmlwYyA/IGl0ZW0uaXRlbS50ZXh0XG4gICAgICAgIEBjbG9zZSgpXG4gICAgIFxuICAgIG9uSG92ZXI6IChldmVudCkgPT4gQHNlbGVjdCBldmVudC50YXJnZXQgICBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW5kJywgJ3BhZ2UgZG93bicgdGhlbiByZXR1cm4gQHNlbGVjdCBAaXRlbXMubGFzdENoaWxkXG4gICAgICAgICAgICB3aGVuICdob21lJywgJ3BhZ2UgdXAnICB0aGVuIHJldHVybiBAc2VsZWN0IEBpdGVtcy5maXJzdENoaWxkXG4gICAgICAgICAgICB3aGVuICdlbnRlcicgICAgICAgICAgICB0aGVuIHJldHVybiBAYWN0aXZhdGUgQHNlbGVjdGVkXG4gICAgICAgICAgICB3aGVuICdlc2MnLCAnc3BhY2UnICAgICB0aGVuIHJldHVybiBAY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgICAgICAgICAgdGhlbiByZXR1cm4gQHNlbGVjdCBAc2VsZWN0ZWQ/Lm5leHRTaWJsaW5nID8gQGl0ZW1zLmZpcnN0Q2hpbGQgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgICAgICAgICB0aGVuIHJldHVybiBAc2VsZWN0IEBzZWxlY3RlZD8ucHJldmlvdXNTaWJsaW5nID8gQGl0ZW1zLmxhc3RDaGlsZCBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICAgICAgICAgIHRoZW4gcmV0dXJuIEBzZWxlY3QgQHNlbGVjdGVkPy5uZXh0U2libGluZ1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgICAgICAgICAgdGhlbiByZXR1cm4gQHNlbGVjdCBAc2VsZWN0ZWQ/LnByZXZpb3VzU2libGluZ1xuICAgICAgICByZXR1cm4gaWYga2V5Lmxlbmd0aCA8IDFcbiAgICAgICAgdGFyZ2V0V2luID0gZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3cuZnJvbUlkIEB0YXJnZXRXaW5JRFxuICAgICAgICB0YXJnZXRXaW4ud2ViQ29udGVudHMuc2VuZCAncG9wdXBNb2RLZXlDb21ibycsIG1vZCwga2V5LCBjb21ib1xuICAgICAgICBAY2xvc2UoKVxuICAgICBcbiAgICBvbkNsaWNrOiAoZSkgPT4gQGFjdGl2YXRlIGUudGFyZ2V0XG5cbm1vZHVsZS5leHBvcnRzID0gUG9wdXBXaW5kb3dcbiJdfQ==
//# sourceURL=../coffee/popupwindow.coffee