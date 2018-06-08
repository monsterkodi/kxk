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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXB3aW5kb3cuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vY29mZmVlL3BvcHVwd2luZG93LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxXQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLE9BQUYsRUFBVyxLQUFYLEVBQWtCLElBQWxCLEVBQXdCLENBQXhCLENBQUEsR0FBOEIsT0FBQSxDQUFRLE9BQVIsQ0FBOUI7O0VBRU07SUFBTixNQUFBLFlBQUEsQ0FBQTs7Ozs7OztNQVlXLE9BQU4sSUFBTSxDQUFDLEdBQUQsQ0FBQTtBQUVILFlBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBO1FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLEVBQVg7OztRQUlBLFdBQVcsQ0FBQyxHQUFaLEdBQWtCO1FBRWxCLFFBQUEsR0FDSTtVQUFBLEtBQUEsRUFBTyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFoQixDQUFBLENBQWtDLENBQUMsRUFBMUM7VUFDQSxLQUFBLEVBQU07UUFETjtBQUVKO1FBQUEsS0FBQSxxQ0FBQTs7VUFDSSxJQUFHLENBQUksSUFBSSxDQUFDLElBQVo7WUFDSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQWYsQ0FDSTtjQUFBLElBQUEsRUFBTSxJQUFJLENBQUMsSUFBWDtjQUNBLEtBQUEsRUFBTyxJQUFJLENBQUM7WUFEWixDQURKLEVBREo7O1FBREo7UUFNQSxNQUFBLEdBQVcsUUFBUSxDQUFDO1FBQ3BCLE9BQUEsR0FBVyxNQUFNLENBQUM7UUFFbEIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFyQixDQUF3QixXQUF4QixFQUFxQyxXQUFXLENBQUMsV0FBakQ7UUFDQSxRQUFRLENB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ZUFNUyxJQU5UO0FBTWlDLG1CQUFPLElBQUMsQ0FBQSxNQUFELDBGQUFxQyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQTVDO0FBTnhDLGVBT1MsT0FQVDtBQU9pQyxtQkFBTyxJQUFDLENBQUEsTUFBRCxzQ0FBaUIsQ0FBRSxvQkFBbkI7QUFQeEMsZUFRUyxNQVJUO0FBUWlDLG1CQUFPLElBQUMsQ0FBQSxNQUFELHNDQUFpQixDQUFFLHdCQUFuQjtBQVJ4QztRQVNBLElBQVUsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUF2QjtBQUFBLGlCQUFBOztRQUNBLFNBQUEsR0FBWSxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUE5QixDQUFxQyxJQUFDLENBQUEsV0FBdEM7UUFDWixTQUFTLENBQUMsV0FBVyxDQUFDLElBQXRCLENBQTJCLGtCQUEzQixFQUErQyxHQUEvQyxFQUFvRCxHQUFwRCxFQUF5RCxLQUF6RDtlQUNBLElBQUMsQ0FBQSxLQUFELENBQUE7TUFoQk87O01Ba0JYLE9BQVMsQ0FBQyxDQUFELENBQUE7ZUFBTyxJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsQ0FBQyxNQUFaO01BQVA7O0lBcExiOztJQUVJLFdBQUMsQ0FBQSxHQUFELEdBQVM7O0lBQ1QsV0FBQyxDQUFBLEdBQUQsR0FBUzs7SUFDVCxXQUFDLENBQUEsS0FBRCxHQUFTOzs7Ozs7RUFrTGIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFoTWpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBrZXlpbmZvLCBzbGFzaCwgZWxlbSwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFBvcHVwV2luZG93XG4gICAgXG4gICAgQHdpbiAgID0gbnVsbFxuICAgIEBvcHQgICA9IG51bGxcbiAgICBAcG9wdXAgPSBudWxsXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG4gICAgXG4gICAgQHNob3c6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBcbiAgICAgICAgIyBQb3B1cFdpbmRvdy5jbG9zZSgpXG4gICAgICAgIFxuICAgICAgICBQb3B1cFdpbmRvdy5vcHQgPSBvcHQgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcG9wdXBPcHQgPSBcbiAgICAgICAgICAgIHdpbklEOiBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmlkXG4gICAgICAgICAgICBpdGVtczpbXVxuICAgICAgICBmb3IgaXRlbSBpbiBvcHQuaXRlbXNcbiAgICAgICAgICAgIGlmIG5vdCBpdGVtLmhpZGVcbiAgICAgICAgICAgICAgICBwb3B1cE9wdC5pdGVtcy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW0udGV4dFxuICAgICAgICAgICAgICAgICAgICBjb21ibzogaXRlbS5jb21ib1xuICAgICAgICBcbiAgICAgICAgcmVtb3RlICAgPSBlbGVjdHJvbi5yZW1vdGVcbiAgICAgICAgQnJvd3NlciAgPSByZW1vdGUuQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24uaXBjUmVuZGVyZXIub24gJ3BvcHVwSXRlbScsIFBvcHVwV2luZG93Lm9uUG9wdXBJdGVtXG4gICAgICAgIGVsZWN0cm9uLmlwY1JlbmRlcmVyLm9uICdwb3B1cENsb3NlJywgUG9wdXBXaW5kb3cuY2xvc2VcbiAgICAgICAgXG4gICAgICAgIGlmIFBvcHVwV2luZG93Lndpbj9cbiAgICAgICAgICAgIFBvcHVwV2luZG93Lndpbi5zZXRQb3NpdGlvbiBvcHQueCwgb3B0LnlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2luID0gbmV3IEJyb3dzZXJcbiAgICAgICAgICAgICAgICB4OiAgICAgICAgICAgICAgIG9wdC54XG4gICAgICAgICAgICAgICAgeTogICAgICAgICAgICAgICBvcHQueVxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb3B0LmJhY2tncm91bmQgPyAnIzIyMidcbiAgICAgICAgICAgICAgICBoYXNTaGFkb3c6ICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIGZ1bGxzY3JlZW5hYmxlOiAgZmFsc2VcbiAgICAgICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6IGZhbHNlXG4gICAgICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAyNDBcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIHBvcHVwT3B0Lml0ZW1zLmxlbmd0aCAqIDI4XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAjIDxsaW5rIHJlbD0nc3R5bGVzaGVldCcgaHJlZj1cIiN7c2xhc2guZmlsZVVybCBvcHQuc3R5bGVzaGVldH1cIiB0eXBlPSd0ZXh0L2Nzcyc+XG4gICAgICAgICAgICAgICAgIyA8Ym9keT5cbiAgICAgICAgICAgICAgICAjIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgICAgICMgdmFyIFBvcHVwV2luZG93ID0gcmVxdWlyZShcIiN7c2xhc2gucGF0aCBfX2Rpcm5hbWV9L3BvcHVwV2luZG93XCIpO1xuICAgICAgICAgICAgICAgICAgICAjIG5ldyBQb3B1cFdpbmRvdygje0pTT04uc3RyaW5naWZ5IHBvcHVwT3B0fSk7XG4gICAgICAgICAgICAgICAgIyA8L3NjcmlwdD5cbiAgICAgICAgICAgICAgICAjIDwvYm9keT5cbiAgICAgICAgICAgICMgXCJcIlwiXG4gICAgICAgICAgICAjIHdpbi5sb2FkVVJMIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgXG4gICAgICAgICAgICB3aW4ub24gJ2JsdXInLCBQb3B1cFdpbmRvdy5jbG9zZVxuICAgICAgICAgICAgIyB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAtPiBcbiAgICAgICAgICAgICAgICAjIHdpbi5zaG93KClcbiAgICAgICAgICAgICAgICAjIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgUG9wdXBXaW5kb3cud2luID0gd2luXG4gICAgICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPGxpbmsgcmVsPSdzdHlsZXNoZWV0JyBocmVmPVwiI3tzbGFzaC5maWxlVXJsIG9wdC5zdHlsZXNoZWV0fVwiIHR5cGU9J3RleHQvY3NzJz5cbiAgICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICB2YXIgUG9wdXBXaW5kb3cgPSByZXF1aXJlKFwiI3tzbGFzaC5wYXRoIF9fZGlybmFtZX0vcG9wdXBXaW5kb3dcIik7XG4gICAgICAgICAgICAgICAgbmV3IFBvcHVwV2luZG93KCN7SlNPTi5zdHJpbmdpZnkgcG9wdXBPcHR9KTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgUG9wdXBXaW5kb3cud2luLmxvYWRVUkwgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICAgICAgUG9wdXBXaW5kb3cud2luLndlYkNvbnRlbnRzLm9uICdkaWQtZmluaXNoLWxvYWQnLCAtPlxuICAgICAgICAgICAgUG9wdXBXaW5kb3cud2luLnNob3coKVxuICAgICAgICAgICAgXG4gICAgICAgIFBvcHVwV2luZG93LndpblxuXG4gICAgQG9uUG9wdXBJdGVtOiAoZSx0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIFBvcHVwV2luZG93LmNsb3NlKClcbiAgICAgICAgZm9yIGl0ZW0gaW4gUG9wdXBXaW5kb3cub3B0Lml0ZW1zXG4gICAgICAgICAgICBpZiBpdGVtLnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgICAgIGl0ZW0uY2I/KClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICBAY2xvc2U6IC0+IFxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgZWxlY3Ryb24uaXBjUmVuZGVyZXIucmVtb3ZlTGlzdGVuZXIgJ3BvcHVwSXRlbScsICBQb3B1cFdpbmRvdy5vblBvcHVwSXRlbVxuICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lciAncG9wdXBDbG9zZScsIFBvcHVwV2luZG93LmNsb3NlXG4gICAgICAgIFxuICAgICAgICBQb3B1cFdpbmRvdy53aW4/LmhpZGUoKVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAaXRlbXMgPSBlbGVtIGNsYXNzOiAncG9wdXBXaW5kb3cnLCB0YWJpbmRleDogMVxuICAgICAgICBAdGFyZ2V0V2luSUQgPSBvcHQud2luSURcbiAgICAgICAgZm9yIGl0ZW0gaW4gb3B0Lml0ZW1zXG4gICAgICAgICAgICBjb250aW51ZSBpZiBpdGVtLmhpZGVcbiAgICAgICAgICAgIGRpdiA9IGVsZW0gY2xhc3M6ICdwb3B1cEl0ZW0nLCB0ZXh0OiBpdGVtLnRleHRcbiAgICAgICAgICAgIGRpdi5pdGVtID0gaXRlbVxuICAgICAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgQG9uQ2xpY2tcbiAgICAgICAgICAgIGlmIGl0ZW0uY29tYm8/XG4gICAgICAgICAgICAgICAgY29tYm8gPSBlbGVtICdzcGFuJywgY2xhc3M6ICdwb3B1cENvbWJvJywgdGV4dDogaXRlbS5jb21ib1xuICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCBjb21ib1xuICAgICAgICAgICAgQGl0ZW1zLmFwcGVuZENoaWxkIGRpdlxuXG4gICAgICAgIEBzZWxlY3QgQGl0ZW1zLmZpcnN0Q2hpbGRcblxuICAgICAgICAob3B0LnBhcmVudCA/IGRvY3VtZW50LmJvZHkpLmFwcGVuZENoaWxkIEBpdGVtc1xuXG4gICAgICAgIEBpdGVtcy5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgICBAb25LZXlEb3duXG4gICAgICAgIEBpdGVtcy5hZGRFdmVudExpc3RlbmVyICdmb2N1c291dCcsICBAb25Gb2N1c091dFxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgQG9uSG92ZXJcbiAgICAgICAgQGl0ZW1zLmZvY3VzKClcblxuICAgICAgICBAZ2V0V2luKCkuc2V0U2l6ZSBwYXJzZUludChAaXRlbXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChAaXRlbXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KVxuICAgICAgICBcbiAgICBjbG9zZTogPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsICAgQG9uS2V5RG93blxuICAgICAgICBAaXRlbXM/LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2ZvY3Vzb3V0JywgIEBvbkZvY3VzT3V0XG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgQG9uSG92ZXJcbiAgICAgICAgQGl0ZW1zPy5yZW1vdmUoKVxuICAgICAgICBkZWxldGUgQGl0ZW1zXG4gICAgICAgIHRhcmdldFdpbiA9IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93LmZyb21JZCBAdGFyZ2V0V2luSURcbiAgICAgICAgdGFyZ2V0V2luLndlYkNvbnRlbnRzLnNlbmQgJ3BvcHVwQ2xvc2UnXG5cbiAgICBnZXRXaW46IC0+IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuXG4gICAgc2VsZWN0OiAoaXRlbSkgLT4gXG4gICAgICAgIHJldHVybiBpZiBub3QgaXRlbT9cbiAgICAgICAgQHNlbGVjdGVkPy5jbGFzc0xpc3QucmVtb3ZlICdzZWxlY3RlZCdcbiAgICAgICAgQHNlbGVjdGVkID0gaXRlbVxuICAgICAgICBAc2VsZWN0ZWQuY2xhc3NMaXN0LmFkZCAnc2VsZWN0ZWQnXG4gICAgICAgIFxuICAgIGFjdGl2YXRlOiAoaXRlbSkgLT5cbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgdGFyZ2V0V2luID0gZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3cuZnJvbUlkIEB0YXJnZXRXaW5JRFxuICAgICAgICB0YXJnZXRXaW4ud2ViQ29udGVudHMuc2VuZCAncG9wdXBJdGVtJywgaXRlbS5pdGVtLmlwYyA/IGl0ZW0uaXRlbS50ZXh0XG4gICAgICAgIEBjbG9zZSgpXG4gICAgIFxuICAgIG9uSG92ZXI6IChldmVudCkgPT4gQHNlbGVjdCBldmVudC50YXJnZXQgICBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW5kJywgJ3BhZ2UgZG93bicgdGhlbiByZXR1cm4gQHNlbGVjdCBAaXRlbXMubGFzdENoaWxkXG4gICAgICAgICAgICB3aGVuICdob21lJywgJ3BhZ2UgdXAnICB0aGVuIHJldHVybiBAc2VsZWN0IEBpdGVtcy5maXJzdENoaWxkXG4gICAgICAgICAgICB3aGVuICdlbnRlcicgICAgICAgICAgICB0aGVuIHJldHVybiBAYWN0aXZhdGUgQHNlbGVjdGVkXG4gICAgICAgICAgICB3aGVuICdlc2MnLCAnc3BhY2UnICAgICB0aGVuIHJldHVybiBAY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgICAgICAgICAgdGhlbiByZXR1cm4gQHNlbGVjdCBAc2VsZWN0ZWQ/Lm5leHRTaWJsaW5nID8gQGl0ZW1zLmZpcnN0Q2hpbGQgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgICAgICAgICB0aGVuIHJldHVybiBAc2VsZWN0IEBzZWxlY3RlZD8ucHJldmlvdXNTaWJsaW5nID8gQGl0ZW1zLmxhc3RDaGlsZCBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICAgICAgICAgIHRoZW4gcmV0dXJuIEBzZWxlY3QgQHNlbGVjdGVkPy5uZXh0U2libGluZ1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgICAgICAgICAgdGhlbiByZXR1cm4gQHNlbGVjdCBAc2VsZWN0ZWQ/LnByZXZpb3VzU2libGluZ1xuICAgICAgICByZXR1cm4gaWYga2V5Lmxlbmd0aCA8IDFcbiAgICAgICAgdGFyZ2V0V2luID0gZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3cuZnJvbUlkIEB0YXJnZXRXaW5JRFxuICAgICAgICB0YXJnZXRXaW4ud2ViQ29udGVudHMuc2VuZCAncG9wdXBNb2RLZXlDb21ibycsIG1vZCwga2V5LCBjb21ib1xuICAgICAgICBAY2xvc2UoKVxuICAgICBcbiAgICBvbkNsaWNrOiAoZSkgPT4gQGFjdGl2YXRlIGUudGFyZ2V0XG5cbm1vZHVsZS5leHBvcnRzID0gUG9wdXBXaW5kb3dcbiJdfQ==
//# sourceURL=../coffee/popupwindow.coffee