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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9hYm91dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsS0FBQSxFQUFBOztFQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFFSDtJQUFOLE1BQUEsTUFBQTtNQU1XLE9BQU4sSUFBTSxDQUFDLEdBQUQsQ0FBQTtBQUVILFlBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQTtRQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVk7UUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7UUFDWixPQUFBLEdBQVksUUFBUSxDQUFDO1FBQ3JCLEdBQUEsR0FBWSxRQUFRLENBQUM7UUFFckIsS0FBSyxDQUFDLEdBQU4sa0NBQXFCLENBQUU7UUFDdkIsSUFBTyxtQkFBSixxR0FBNkMsQ0FBRSwrQkFBbEQ7VUFDSSxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1VBQy9CLElBQXFCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixDQUFyQjtZQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBTjs7VUFDQSxJQUFtQyxHQUFHLENBQUMsUUFBSixDQUFhLE1BQWIsQ0FBbkM7WUFBQSxHQUFBLEdBQU0sR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWLEVBQWEsR0FBRyxDQUFDLE1BQUosR0FBVyxDQUF4QixFQUFOOztVQUNBLEtBQUssQ0FBQyxHQUFOLEdBQVksSUFKaEI7O1FBTUEsR0FBQSxHQUFNLElBQUksT0FBSixDQUNGO1VBQUEsZUFBQSxrRkFBeUMsTUFBekM7VUFDQSxhQUFBLEVBQWlCLElBRGpCO1VBRUEsTUFBQSxFQUFpQixJQUZqQjtVQUdBLFNBQUEsRUFBaUIsSUFIakI7VUFJQSxXQUFBLEVBQWlCLElBSmpCO1VBS0EsU0FBQSxFQUFpQixLQUxqQjtVQU1BLEtBQUEsRUFBaUIsS0FOakI7VUFPQSxJQUFBLEVBQWlCLEtBUGpCO1VBUUEsY0FBQSxFQUFpQixLQVJqQjtVQVNBLFdBQUEsRUFBaUIsS0FUakI7VUFVQSxXQUFBLEVBQWlCLEtBVmpCO1VBV0EsY0FBQSxFQUNJO1lBQUEsV0FBQSxFQUFhO1VBQWIsQ0FaSjtVQWFBLEtBQUEsNEVBQW1DLEdBYm5DO1VBY0EsTUFBQSw0RUFBbUM7UUFkbkMsQ0FERTtRQWlCTixPQUFBLHFKQUE2QyxDQUFFO1FBQy9DLElBQUEsR0FBTyxDQUFBLG9pQkFBQSxDQUFBLHdGQXdCbUQsSUF4Qm5ELENBd0J3RCxvSEF4QnhELENBQUEsZ0ZBNEIwQyxNQTVCMUMsQ0E0QmlELHdJQTVCakQsQ0FBQSxvRkFrQzhDLE1BbEM5QyxDQWtDcUQsbUZBbENyRCxDQUFBLENBdUMrQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBdkN6QyxDQXVDNkMscUNBdkM3QyxDQUFBLENBeUNPLE9BekNQLENBeUNlLDhjQXpDZjtRQXlEUCxHQUFHLENBQUMsRUFBSixDQUFPLFNBQVAsRUFBcUIsS0FBSyxDQUFDLE9BQTNCO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxZQUFQLEVBQXFCLEtBQUssQ0FBQyxVQUEzQjtRQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sV0FBUCxFQUFxQixLQUFLLENBQUMsU0FBM0I7UUFFQSxHQUFHLENBQUMsT0FBSixDQUFZLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWLENBQTlDO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxlQUFQLEVBQXdCLFFBQUEsQ0FBQSxDQUFBO0FBQ3BCLGNBQUE7VUFBQSxHQUFHLENBQUMsSUFBSixDQUFBO1VBQ0EsdUNBQVksQ0FBRSxjQUFkO21CQUNJLEdBQUcsQ0FBQyxZQUFKLENBQUEsRUFESjs7UUFGb0IsQ0FBeEI7UUFLQSxLQUFLLENBQUMsR0FBTixHQUFZO2VBQ1o7TUFwR0c7O01Bc0dLLE9BQVgsU0FBVyxDQUFBLENBQUE7QUFFUixZQUFBO1FBQUEsSUFBRyxpQ0FBYSxDQUFFLGVBQWxCO2lCQUNJLEtBQUssQ0FBQyxVQUFOLENBQUEsRUFESjs7TUFGUTs7TUFLQyxPQUFaLFVBQVksQ0FBQSxDQUFBO0FBRVQsWUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBO1FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO1FBQ1gsR0FBQSxHQUFXLFFBQVEsQ0FBQztRQUNwQixHQUFHLENBQUMsa0JBQUosQ0FBdUIsU0FBdkI7UUFDQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsWUFBdkI7O2FBQ1MsQ0FBRSxLQUFYLENBQUE7O2VBQ0EsS0FBSyxDQUFDLEdBQU4sR0FBWTtNQVBIOztNQVNILE9BQVQsT0FBUyxDQUFBLENBQUE7UUFBRyxJQUFHLGlCQUFIO2lCQUFtQixNQUFBLENBQU8sS0FBSyxDQUFDLEdBQWIsRUFBbkI7O01BQUg7O0lBMUhkOztJQUVJLEtBQUMsQ0FBQSxHQUFELEdBQU87O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTzs7SUFDUCxLQUFDLENBQUEsR0FBRCxHQUFPOzs7Ozs7RUF3SFgsTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0FBSyxDQUFDO0FBdEl2QiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwXG4jIyNcblxub3BlbmVyID0gcmVxdWlyZSAnb3BlbmVyJ1xuXG5jbGFzcyBBYm91dFxuXG4gICAgQHdpbiA9IG51bGxcbiAgICBAdXJsID0gbnVsbFxuICAgIEBvcHQgPSBudWxsXG5cbiAgICBAc2hvdzogKG9wdCkgLT5cblxuICAgICAgICBBYm91dC5vcHQgPSBvcHRcbiAgICAgICAgZWxlY3Ryb24gID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEJyb3dzZXIgICA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgaXBjICAgICAgID0gZWxlY3Ryb24uaXBjTWFpblxuXG4gICAgICAgIEFib3V0LnVybCA9IEFib3V0Lm9wdD8udXJsXG4gICAgICAgIGlmIG5vdCBBYm91dC51cmw/IGFuZCBBYm91dC5vcHQ/LnBrZz8ucmVwb3NpdG9yeT8udXJsXG4gICAgICAgICAgICB1cmwgPSBBYm91dC5vcHQucGtnLnJlcG9zaXRvcnkudXJsXG4gICAgICAgICAgICB1cmwgPSB1cmwuc2xpY2UgNCBpZiB1cmwuc3RhcnRzV2l0aCBcImdpdCtcIlxuICAgICAgICAgICAgdXJsID0gdXJsLnNsaWNlIDAsIHVybC5sZW5ndGgtNCBpZiB1cmwuZW5kc1dpdGggXCIuZ2l0XCJcbiAgICAgICAgICAgIEFib3V0LnVybCA9IHVybFxuXG4gICAgICAgIHdpbiA9IG5ldyBCcm93c2VyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEFib3V0Lm9wdD8uYmFja2dyb3VuZCA/ICcjMjIyJ1xuICAgICAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgICAgICBjZW50ZXI6ICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGhhc1NoYWRvdzogICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuYWJsZTogIGZhbHNlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgICAgICB3ZWJTZWN1cml0eTogZmFsc2VcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgQWJvdXQub3B0Py5zaXplID8gMzAwXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIEFib3V0Lm9wdD8uc2l6ZSA/IDMwMFxuXG4gICAgICAgIHZlcnNpb24gPSBBYm91dC5vcHQ/LnZlcnNpb24gPyBBYm91dC5vcHQ/LnBrZz8udmVyc2lvblxuICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICAgICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgI2Fib3V0IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgY2VudGVyO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICAgICAgICBwb2ludGVyO1xuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lLXdpZHRoOiAwO1xuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgI2ltYWdlIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogICAgICAgIDcwJTtcbiAgICAgICAgICAgICAgICAgICAgbWF4LWhlaWdodDogICAgNzAlO1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICA1MCU7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogICAgICAgICAgIDUwJTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAgICAgdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICN2ZXJzaW9uIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgICAgICAgICBib3R0b206ICAgICAgICAgI3tBYm91dC5vcHQ/LnZlcnNpb25PZmZzZXQgID8gJzclJ307XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgICAgICByaWdodDogICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgIGNlbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgICAgICN7QWJvdXQub3B0Py5jb2xvciA/ICcjMzMzJ307XG4gICAgICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAgICBWZXJkYW5hLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgI3ZlcnNpb246aG92ZXIge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogICAgICAgICAgI3tBYm91dC5vcHQ/LmhpZ2hsaWdodCA/ICcjZjgwJ307XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICA8L3N0eWxlPlxuICAgICAgICAgICAgPGRpdiBpZD0nYWJvdXQnIHRhYmluZGV4PTA+XG4gICAgICAgICAgICAgICAgPGltZyBpZD0naW1hZ2UnIHNyYz1cImZpbGU6Ly8je0Fib3V0Lm9wdC5pbWd9XCIvPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J3ZlcnNpb24nPlxuICAgICAgICAgICAgICAgICAgICAje3ZlcnNpb259XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgdmFyIGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgICAgICB2YXIgaXBjID0gZWxlY3Ryb24uaXBjUmVuZGVyZXI7XG4gICAgICAgICAgICAgICAgdmFyIGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyc2lvbicpO1xuICAgICAgICAgICAgICAgIGwub25jbGljayAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnb3BlblVSTCcpOyB9XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICBhLm9uY2xpY2sgICA9IGZ1bmN0aW9uICgpIHsgaXBjLnNlbmQoJ2Nsb3NlQWJvdXQnKTsgfVxuICAgICAgICAgICAgICAgIGEub25rZXlkb3duID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnY2xvc2VBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgYS5vbmJsdXIgICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdibHVyQWJvdXQnKTsgfVxuICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGlwYy5vbiAnb3BlblVSTCcsICAgIEFib3V0Lm9wZW5VUkxcbiAgICAgICAgaXBjLm9uICdjbG9zZUFib3V0JywgQWJvdXQuY2xvc2VBYm91dFxuICAgICAgICBpcGMub24gJ2JsdXJBYm91dCcsICBBYm91dC5ibHVyQWJvdXRcblxuICAgICAgICB3aW4ubG9hZFVSTCBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbClcbiAgICAgICAgd2luLm9uICdyZWFkeS10by1zaG93JywgLT4gXG4gICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICBpZiBBYm91dC5vcHQ/LmRlYnVnXG4gICAgICAgICAgICAgICAgd2luLm9wZW5EZXZUb29scygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEFib3V0LndpbiA9IHdpblxuICAgICAgICB3aW5cblxuICAgIEBibHVyQWJvdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQWJvdXQub3B0Py5kZWJ1Z1xuICAgICAgICAgICAgQWJvdXQuY2xvc2VBYm91dCgpXG4gICAgXG4gICAgQGNsb3NlQWJvdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBpcGMgICAgICA9IGVsZWN0cm9uLmlwY01haW5cbiAgICAgICAgaXBjLnJlbW92ZUFsbExpc3RlbmVycyAnb3BlblVSTCdcbiAgICAgICAgaXBjLnJlbW92ZUFsbExpc3RlbmVycyAnY2xvc2VBYm91dCdcbiAgICAgICAgQWJvdXQud2luPy5jbG9zZSgpXG4gICAgICAgIEFib3V0LndpbiA9IG51bGxcblxuICAgIEBvcGVuVVJMOiAtPiBpZiBBYm91dC51cmw/IHRoZW4gb3BlbmVyIEFib3V0LnVybFxuXG5tb2R1bGUuZXhwb3J0cyA9IEFib3V0LnNob3dcbiJdfQ==
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/about.coffee