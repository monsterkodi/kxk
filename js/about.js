(function() {
  /*
   0000000   0000000     0000000   000   000  000000000
  000   000  000   000  000   000  000   000     000
  000000000  0000000    000   000  000   000     000
  000   000  000   000  000   000  000   000     000
  000   000  0000000     0000000    0000000      000
  */
  var About, opener;

  opener = require('opener');

  About = (function() {
    class About {
      static show(opt) {
        var Browser, electron, html, ipc, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, url, version, win;
        About.opt = opt;
        electron = require('electron');
        Browser = electron.BrowserWindow;
        ipc = electron.ipcMain;
        About.url = (ref = About.opt) != null ? ref.url : void 0;
        if ((About.url == null) && ((ref1 = About.opt) != null ? (ref2 = ref1.pkg) != null ? (ref3 = ref2.repository) != null ? ref3.url : void 0 : void 0 : void 0)) {
          url = About.opt.pkg.repository.url;
          if (url.startsWith("git+")) {
            url = url.slice(4);
          }
          if (url.endsWith(".git")) {
            url = url.slice(0, url.length - 4);
          }
          About.url = url;
        }
        win = new Browser({
          backgroundColor: (ref4 = (ref5 = About.opt) != null ? ref5.background : void 0) != null ? ref4 : '#222',
          preloadWindow: true,
          center: true,
          hasShadow: true,
          alwaysOnTop: true,
          resizable: false,
          frame: false,
          show: false,
          fullscreenable: false,
          minimizable: false,
          maximizable: false,
          webPreferences: {
            webSecurity: false
          },
          width: (ref6 = (ref7 = About.opt) != null ? ref7.size : void 0) != null ? ref6 : 300,
          height: (ref8 = (ref9 = About.opt) != null ? ref9.size : void 0) != null ? ref8 : 300
        });
        version = (ref10 = (ref11 = About.opt) != null ? ref11.version : void 0) != null ? ref10 : (ref12 = About.opt) != null ? (ref13 = ref12.pkg) != null ? ref13.version : void 0 : void 0;
        html = `<style type="text/css">\n    body {\n        overflow:      hidden;\n        -webkit-user-select: none;\n    }\n    #about {\n        text-align:    center;\n        cursor:        pointer;\n        outline-width: 0;\n        overflow:      hidden;\n    }\n\n    #image {\n        position:      absolute;\n        height:        70%;\n        max-height:    70%;\n        left:          50%;\n        top:           50%;\n        transform:     translate(-50%, -50%);\n    }\n\n    #version {\n        position: absolute;\n        bottom:         ${(ref14 = (ref15 = About.opt) != null ? ref15.versionOffset : void 0) != null ? ref14 : '7%'};\n        left:           0;\n        right:          0;\n        text-align:     center;\n        color:          ${(ref16 = (ref17 = About.opt) != null ? ref17.color : void 0) != null ? ref16 : '#333'};\n        font-family:    Verdana, sans-serif;\n        text-decoration: none;\n    }\n\n    #version:hover {\n        color:          ${(ref18 = (ref19 = About.opt) != null ? ref19.highlight : void 0) != null ? ref18 : '#f80'};\n    }\n\n</style>\n<div id='about' tabindex=0>\n    <img id='image' src="file://${About.opt.img}"/>\n    <div id='version'>\n        ${version}\n    </div>\n</div>\n<script>\n    var electron = require('electron');\n    var ipc = electron.ipcRenderer;\n    var l = document.getElementById('version');\n    l.onclick   = function () { ipc.send('openURL'); }\n    var a = document.getElementById('about');\n    a.onclick   = function () { ipc.send('closeAbout'); }\n    a.onkeydown = function () { ipc.send('closeAbout'); }\n    a.onblur    = function () { ipc.send('blurAbout'); }\n    a.focus()\n</script>`;
        ipc.on('openURL', About.openURL);
        ipc.on('closeAbout', About.closeAbout);
        ipc.on('blurAbout', About.blurAbout);
        win.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
        win.on('ready-to-show', function() {
          var ref20;
          win.show();
          if ((ref20 = About.opt) != null ? ref20.debug : void 0) {
            return win.openDevTools();
          }
        });
        About.win = win;
        return win;
      }

      static blurAbout() {
        var ref;
        if (!((ref = About.opt) != null ? ref.debug : void 0)) {
          return About.closeAbout();
        }
      }

      static closeAbout() {
        var electron, ipc, ref;
        electron = require('electron');
        ipc = electron.ipcMain;
        ipc.removeAllListeners('openURL');
        ipc.removeAllListeners('closeAbout');
        if ((ref = About.win) != null) {
          ref.close();
        }
        return About.win = null;
      }

      static openURL() {
        if (About.url != null) {
          return opener(About.url);
        }
      }

    };

    About.win = null;

    About.url = null;

    About.opt = null;

    return About;

  }).call(this);

  module.exports = About.show;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vY29mZmVlL2Fib3V0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxLQUFBLEVBQUE7O0VBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUVIO0lBQU4sTUFBQSxNQUFBO01BTVcsT0FBTixJQUFNLENBQUMsR0FBRCxDQUFBO0FBRUgsWUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBO1FBQUEsS0FBSyxDQUFDLEdBQU4sR0FBWTtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE9BQUEsR0FBWSxRQUFRLENBQUM7UUFDckIsR0FBQSxHQUFZLFFBQVEsQ0FBQztRQUVyQixLQUFLLENBQUMsR0FBTixrQ0FBcUIsQ0FBRTtRQUN2QixJQUFPLG1CQUFKLHFHQUE2QyxDQUFFLCtCQUFsRDtVQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7VUFDL0IsSUFBcUIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLENBQXJCO1lBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUFOOztVQUNBLElBQW1DLEdBQUcsQ0FBQyxRQUFKLENBQWEsTUFBYixDQUFuQztZQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBYSxHQUFHLENBQUMsTUFBSixHQUFXLENBQXhCLEVBQU47O1VBQ0EsS0FBSyxDQUFDLEdBQU4sR0FBWSxJQUpoQjs7UUFNQSxHQUFBLEdBQU0sSUFBSSxPQUFKLENBQ0Y7VUFBQSxlQUFBLGtGQUF5QyxNQUF6QztVQUNBLGFBQUEsRUFBaUIsSUFEakI7VUFFQSxNQUFBLEVBQWlCLElBRmpCO1VBR0EsU0FBQSxFQUFpQixJQUhqQjtVQUlBLFdBQUEsRUFBaUIsSUFKakI7VUFLQSxTQUFBLEVBQWlCLEtBTGpCO1VBTUEsS0FBQSxFQUFpQixLQU5qQjtVQU9BLElBQUEsRUFBaUIsS0FQakI7VUFRQSxjQUFBLEVBQWlCLEtBUmpCO1VBU0EsV0FBQSxFQUFpQixLQVRqQjtVQVVBLFdBQUEsRUFBaUIsS0FWakI7VUFXQSxjQUFBLEVBQ0k7WUFBQSxXQUFBLEVBQWE7VUFBYixDQVpKO1VBYUEsS0FBQSw0RUFBbUMsR0FibkM7VUFjQSxNQUFBLDRFQUFtQztRQWRuQyxDQURFO1FBaUJOLE9BQUEscUpBQTZDLENBQUU7UUFDL0MsSUFBQSxHQUFPLENBQUEsb2lCQUFBLENBQUEsd0ZBd0JtRCxJQXhCbkQsQ0F3QndELG9IQXhCeEQsQ0FBQSxnRkE0QjBDLE1BNUIxQyxDQTRCaUQsd0lBNUJqRCxDQUFBLG9GQWtDOEMsTUFsQzlDLENBa0NxRCxtRkFsQ3JELENBQUEsQ0F1QytCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0F2Q3pDLENBdUM2QyxxQ0F2QzdDLENBQUEsQ0F5Q08sT0F6Q1AsQ0F5Q2UsOGNBekNmO1FBeURQLEdBQUcsQ0FBQyxFQUFKLENBQU8sU0FBUCxFQUFxQixLQUFLLENBQUMsT0FBM0I7UUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLFlBQVAsRUFBcUIsS0FBSyxDQUFDLFVBQTNCO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxXQUFQLEVBQXFCLEtBQUssQ0FBQyxTQUEzQjtRQUVBLEdBQUcsQ0FBQyxPQUFKLENBQVksK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVYsQ0FBOUM7UUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLGVBQVAsRUFBd0IsUUFBQSxDQUFBLENBQUE7QUFDcEIsY0FBQTtVQUFBLEdBQUcsQ0FBQyxJQUFKLENBQUE7VUFDQSx1Q0FBWSxDQUFFLGNBQWQ7bUJBQ0ksR0FBRyxDQUFDLFlBQUosQ0FBQSxFQURKOztRQUZvQixDQUF4QjtRQUtBLEtBQUssQ0FBQyxHQUFOLEdBQVk7ZUFDWjtNQXBHRzs7TUFzR0ssT0FBWCxTQUFXLENBQUEsQ0FBQTtBQUVSLFlBQUE7UUFBQSxJQUFHLGlDQUFhLENBQUUsZUFBbEI7aUJBQ0ksS0FBSyxDQUFDLFVBQU4sQ0FBQSxFQURKOztNQUZROztNQUtDLE9BQVosVUFBWSxDQUFBLENBQUE7QUFFVCxZQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUE7UUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7UUFDWCxHQUFBLEdBQVcsUUFBUSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixTQUF2QjtRQUNBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixZQUF2Qjs7YUFDUyxDQUFFLEtBQVgsQ0FBQTs7ZUFDQSxLQUFLLENBQUMsR0FBTixHQUFZO01BUEg7O01BU0gsT0FBVCxPQUFTLENBQUEsQ0FBQTtRQUFHLElBQUcsaUJBQUg7aUJBQW1CLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBYixFQUFuQjs7TUFBSDs7SUExSGQ7O0lBRUksS0FBQyxDQUFBLEdBQUQsR0FBTzs7SUFDUCxLQUFDLENBQUEsR0FBRCxHQUFPOztJQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU87Ozs7OztFQXdIWCxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFLLENBQUM7QUF0SXZCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDBcbiMjI1xuXG5vcGVuZXIgPSByZXF1aXJlICdvcGVuZXInXG5cbmNsYXNzIEFib3V0XG5cbiAgICBAd2luID0gbnVsbFxuICAgIEB1cmwgPSBudWxsXG4gICAgQG9wdCA9IG51bGxcblxuICAgIEBzaG93OiAob3B0KSAtPlxuXG4gICAgICAgIEFib3V0Lm9wdCA9IG9wdFxuICAgICAgICBlbGVjdHJvbiAgPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgQnJvd3NlciAgID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBpcGMgICAgICAgPSBlbGVjdHJvbi5pcGNNYWluXG5cbiAgICAgICAgQWJvdXQudXJsID0gQWJvdXQub3B0Py51cmxcbiAgICAgICAgaWYgbm90IEFib3V0LnVybD8gYW5kIEFib3V0Lm9wdD8ucGtnPy5yZXBvc2l0b3J5Py51cmxcbiAgICAgICAgICAgIHVybCA9IEFib3V0Lm9wdC5wa2cucmVwb3NpdG9yeS51cmxcbiAgICAgICAgICAgIHVybCA9IHVybC5zbGljZSA0IGlmIHVybC5zdGFydHNXaXRoIFwiZ2l0K1wiXG4gICAgICAgICAgICB1cmwgPSB1cmwuc2xpY2UgMCwgdXJsLmxlbmd0aC00IGlmIHVybC5lbmRzV2l0aCBcIi5naXRcIlxuICAgICAgICAgICAgQWJvdXQudXJsID0gdXJsXG5cbiAgICAgICAgd2luID0gbmV3IEJyb3dzZXJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQWJvdXQub3B0Py5iYWNrZ3JvdW5kID8gJyMyMjInXG4gICAgICAgICAgICBwcmVsb2FkV2luZG93OiAgIHRydWVcbiAgICAgICAgICAgIGNlbnRlcjogICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgaGFzU2hhZG93OiAgICAgICB0cnVlXG4gICAgICAgICAgICBhbHdheXNPblRvcDogICAgIHRydWVcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5hYmxlOiAgZmFsc2VcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgZmFsc2VcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgZmFsc2VcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgICAgIHdlYlNlY3VyaXR5OiBmYWxzZVxuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICBBYm91dC5vcHQ/LnNpemUgPyAzMDBcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgQWJvdXQub3B0Py5zaXplID8gMzAwXG5cbiAgICAgICAgdmVyc2lvbiA9IEFib3V0Lm9wdD8udmVyc2lvbiA/IEFib3V0Lm9wdD8ucGtnPy52ZXJzaW9uXG4gICAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgICAgICBib2R5IHtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgICAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAjYWJvdXQge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiAgICBjZW50ZXI7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogICAgICAgIHBvaW50ZXI7XG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmUtd2lkdGg6IDA7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAjaW1hZ2Uge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgNzAlO1xuICAgICAgICAgICAgICAgICAgICBtYXgtaGVpZ2h0OiAgICA3MCU7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICAgIDUwJTtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAgICAgICAgICAgNTAlO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICAgICB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgI3ZlcnNpb24ge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAje0Fib3V0Lm9wdD8udmVyc2lvbk9mZnNldCAgPyAnNyUnfTtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiAgICAgY2VudGVyO1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogICAgICAgICAgI3tBYm91dC5vcHQ/LmNvbG9yID8gJyMzMzMnfTtcbiAgICAgICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6ICAgIFZlcmRhbmEsIHNhbnMtc2VyaWY7XG4gICAgICAgICAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAjdmVyc2lvbjpob3ZlciB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAgICAgICAgICAje0Fib3V0Lm9wdD8uaGlnaGxpZ2h0ID8gJyNmODAnfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgICAgICA8ZGl2IGlkPSdhYm91dCcgdGFiaW5kZXg9MD5cbiAgICAgICAgICAgICAgICA8aW1nIGlkPSdpbWFnZScgc3JjPVwiZmlsZTovLyN7QWJvdXQub3B0LmltZ31cIi8+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD0ndmVyc2lvbic+XG4gICAgICAgICAgICAgICAgICAgICN7dmVyc2lvbn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICB2YXIgZWxlY3Ryb24gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuICAgICAgICAgICAgICAgIHZhciBpcGMgPSBlbGVjdHJvbi5pcGNSZW5kZXJlcjtcbiAgICAgICAgICAgICAgICB2YXIgbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJzaW9uJyk7XG4gICAgICAgICAgICAgICAgbC5vbmNsaWNrICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdvcGVuVVJMJyk7IH1cbiAgICAgICAgICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhYm91dCcpO1xuICAgICAgICAgICAgICAgIGEub25jbGljayAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnY2xvc2VBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgYS5vbmtleWRvd24gPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdjbG9zZUFib3V0Jyk7IH1cbiAgICAgICAgICAgICAgICBhLm9uYmx1ciAgICA9IGZ1bmN0aW9uICgpIHsgaXBjLnNlbmQoJ2JsdXJBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXBjLm9uICdvcGVuVVJMJywgICAgQWJvdXQub3BlblVSTFxuICAgICAgICBpcGMub24gJ2Nsb3NlQWJvdXQnLCBBYm91dC5jbG9zZUFib3V0XG4gICAgICAgIGlwYy5vbiAnYmx1ckFib3V0JywgIEFib3V0LmJsdXJBYm91dFxuXG4gICAgICAgIHdpbi5sb2FkVVJMIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSShodG1sKVxuICAgICAgICB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAtPiBcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIGlmIEFib3V0Lm9wdD8uZGVidWdcbiAgICAgICAgICAgICAgICB3aW4ub3BlbkRldlRvb2xzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQWJvdXQud2luID0gd2luXG4gICAgICAgIHdpblxuXG4gICAgQGJsdXJBYm91dDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBBYm91dC5vcHQ/LmRlYnVnXG4gICAgICAgICAgICBBYm91dC5jbG9zZUFib3V0KClcbiAgICBcbiAgICBAY2xvc2VBYm91dDogLT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIGlwYyAgICAgID0gZWxlY3Ryb24uaXBjTWFpblxuICAgICAgICBpcGMucmVtb3ZlQWxsTGlzdGVuZXJzICdvcGVuVVJMJ1xuICAgICAgICBpcGMucmVtb3ZlQWxsTGlzdGVuZXJzICdjbG9zZUFib3V0J1xuICAgICAgICBBYm91dC53aW4/LmNsb3NlKClcbiAgICAgICAgQWJvdXQud2luID0gbnVsbFxuXG4gICAgQG9wZW5VUkw6IC0+IGlmIEFib3V0LnVybD8gdGhlbiBvcGVuZXIgQWJvdXQudXJsXG5cbm1vZHVsZS5leHBvcnRzID0gQWJvdXQuc2hvd1xuIl19
//# sourceURL=../coffee/about.coffee