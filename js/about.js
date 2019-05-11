
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
  function About() {}

  About.win = null;

  About.url = null;

  About.opt = null;

  About.show = function(opt) {
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
    html = "<style type=\"text/css\">\n    body {\n        overflow:      hidden;\n        -webkit-user-select: none;\n    }\n    #about {\n        text-align:    center;\n        cursor:        pointer;\n        outline-width: 0;\n        overflow:      hidden;\n    }\n\n    #image {\n        position:      absolute;\n        height:        70%;\n        max-height:    70%;\n        left:          50%;\n        top:           50%;\n        transform:     translate(-50%, -50%);\n    }\n\n    #version {\n        position: absolute;\n        bottom:         " + ((ref14 = (ref15 = About.opt) != null ? ref15.versionOffset : void 0) != null ? ref14 : '7%') + ";\n        left:           0;\n        right:          0;\n        text-align:     center;\n        color:          " + ((ref16 = (ref17 = About.opt) != null ? ref17.color : void 0) != null ? ref16 : '#333') + ";\n        font-family:    Verdana, sans-serif;\n        text-decoration: none;\n    }\n\n    #version:hover {\n        color:          " + ((ref18 = (ref19 = About.opt) != null ? ref19.highlight : void 0) != null ? ref18 : '#f80') + ";\n    }\n\n</style>\n<div id='about' tabindex=0>\n    <img id='image' src=\"file://" + About.opt.img + "\"/>\n    <div id='version'>\n        " + version + "\n    </div>\n</div>\n<script>\n    var electron = require('electron');\n    var ipc = electron.ipcRenderer;\n    var l = document.getElementById('version');\n    l.onclick   = function () { ipc.send('openURL'); }\n    var a = document.getElementById('about');\n    a.onclick   = function () { ipc.send('closeAbout'); }\n    a.onkeydown = function () { ipc.send('closeAbout'); }\n    a.onblur    = function () { ipc.send('blurAbout');  }\n    a.onkeydown = function () { ipc.send('closeAbout'); }\n    a.focus()\n</script>";
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
  };

  About.blurAbout = function() {
    var ref;
    if (!((ref = About.opt) != null ? ref.debug : void 0)) {
      return About.closeAbout();
    }
  };

  About.closeAbout = function() {
    var electron, ipc, ref;
    electron = require('electron');
    ipc = electron.ipcMain;
    ipc.removeAllListeners('openURL');
    ipc.removeAllListeners('closeAbout');
    if ((ref = About.win) != null) {
      ref.close();
    }
    return About.win = null;
  };

  About.openURL = function() {
    if (About.url != null) {
      return opener(About.url);
    }
  };

  return About;

})();

module.exports = About.show;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUVIOzs7RUFFRixLQUFDLENBQUEsR0FBRCxHQUFPOztFQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU87O0VBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTzs7RUFFUCxLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsR0FBRDtBQUVILFFBQUE7SUFBQSxLQUFLLENBQUMsR0FBTixHQUFZO0lBQ1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSO0lBQ1osT0FBQSxHQUFZLFFBQVEsQ0FBQztJQUNyQixHQUFBLEdBQVksUUFBUSxDQUFDO0lBRXJCLEtBQUssQ0FBQyxHQUFOLGtDQUFxQixDQUFFO0lBQ3ZCLElBQU8sbUJBQUoscUdBQTZDLENBQUUsK0JBQWxEO01BQ0ksR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztNQUMvQixJQUFxQixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsQ0FBckI7UUFBQSxHQUFBLEdBQU0sR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWLEVBQU47O01BQ0EsSUFBbUMsR0FBRyxDQUFDLFFBQUosQ0FBYSxNQUFiLENBQW5DO1FBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUFhLEdBQUcsQ0FBQyxNQUFKLEdBQVcsQ0FBeEIsRUFBTjs7TUFDQSxLQUFLLENBQUMsR0FBTixHQUFZLElBSmhCOztJQU1BLEdBQUEsR0FBTSxJQUFJLE9BQUosQ0FDRjtNQUFBLGVBQUEsa0ZBQXlDLE1BQXpDO01BQ0EsYUFBQSxFQUFpQixJQURqQjtNQUVBLE1BQUEsRUFBaUIsSUFGakI7TUFHQSxTQUFBLEVBQWlCLElBSGpCO01BSUEsV0FBQSxFQUFpQixJQUpqQjtNQUtBLFNBQUEsRUFBaUIsS0FMakI7TUFNQSxLQUFBLEVBQWlCLEtBTmpCO01BT0EsSUFBQSxFQUFpQixLQVBqQjtNQVFBLGNBQUEsRUFBaUIsS0FSakI7TUFTQSxXQUFBLEVBQWlCLEtBVGpCO01BVUEsV0FBQSxFQUFpQixLQVZqQjtNQVdBLGNBQUEsRUFDSTtRQUFBLFdBQUEsRUFBYSxLQUFiO09BWko7TUFhQSxLQUFBLDRFQUFtQyxHQWJuQztNQWNBLE1BQUEsNEVBQW1DLEdBZG5DO0tBREU7SUFpQk4sT0FBQSxxSkFBNkMsQ0FBRTtJQUMvQyxJQUFBLEdBQU8sd2lCQUFBLEdBd0JzQix3RkFBNkIsSUFBN0IsQ0F4QnRCLEdBd0J3RCxzSEF4QnhELEdBNEJzQixnRkFBb0IsTUFBcEIsQ0E1QnRCLEdBNEJpRCwwSUE1QmpELEdBa0NzQixvRkFBd0IsTUFBeEIsQ0FsQ3RCLEdBa0NxRCxzRkFsQ3JELEdBdUMrQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBdkN6QyxHQXVDNkMsd0NBdkM3QyxHQXlDTyxPQXpDUCxHQXlDZTtJQWlCdEIsR0FBRyxDQUFDLEVBQUosQ0FBTyxTQUFQLEVBQXFCLEtBQUssQ0FBQyxPQUEzQjtJQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sWUFBUCxFQUFxQixLQUFLLENBQUMsVUFBM0I7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLFdBQVAsRUFBcUIsS0FBSyxDQUFDLFNBQTNCO0lBRUEsR0FBRyxDQUFDLE9BQUosQ0FBWSwrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVixDQUE5QztJQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sZUFBUCxFQUF3QixTQUFBO0FBQ3BCLFVBQUE7TUFBQSxHQUFHLENBQUMsSUFBSixDQUFBO01BQ0EsdUNBQVksQ0FBRSxjQUFkO2VBQ0ksR0FBRyxDQUFDLFlBQUosQ0FBQSxFQURKOztJQUZvQixDQUF4QjtJQUtBLEtBQUssQ0FBQyxHQUFOLEdBQVk7V0FDWjtFQXJHRzs7RUF1R1AsS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFBO0FBRVIsUUFBQTtJQUFBLElBQUcsaUNBQWEsQ0FBRSxlQUFsQjthQUNJLEtBQUssQ0FBQyxVQUFOLENBQUEsRUFESjs7RUFGUTs7RUFLWixLQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7QUFFVCxRQUFBO0lBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSO0lBQ1gsR0FBQSxHQUFXLFFBQVEsQ0FBQztJQUNwQixHQUFHLENBQUMsa0JBQUosQ0FBdUIsU0FBdkI7SUFDQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsWUFBdkI7O1NBQ1MsQ0FBRSxLQUFYLENBQUE7O1dBQ0EsS0FBSyxDQUFDLEdBQU4sR0FBWTtFQVBIOztFQVNiLEtBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTtJQUFHLElBQUcsaUJBQUg7YUFBbUIsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLEVBQW5COztFQUFIOzs7Ozs7QUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMFxuIyMjXG5cbm9wZW5lciA9IHJlcXVpcmUgJ29wZW5lcidcblxuY2xhc3MgQWJvdXRcblxuICAgIEB3aW4gPSBudWxsXG4gICAgQHVybCA9IG51bGxcbiAgICBAb3B0ID0gbnVsbFxuXG4gICAgQHNob3c6IChvcHQpIC0+XG5cbiAgICAgICAgQWJvdXQub3B0ID0gb3B0XG4gICAgICAgIGVsZWN0cm9uICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBCcm93c2VyICAgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIGlwYyAgICAgICA9IGVsZWN0cm9uLmlwY01haW5cblxuICAgICAgICBBYm91dC51cmwgPSBBYm91dC5vcHQ/LnVybFxuICAgICAgICBpZiBub3QgQWJvdXQudXJsPyBhbmQgQWJvdXQub3B0Py5wa2c/LnJlcG9zaXRvcnk/LnVybFxuICAgICAgICAgICAgdXJsID0gQWJvdXQub3B0LnBrZy5yZXBvc2l0b3J5LnVybFxuICAgICAgICAgICAgdXJsID0gdXJsLnNsaWNlIDQgaWYgdXJsLnN0YXJ0c1dpdGggXCJnaXQrXCJcbiAgICAgICAgICAgIHVybCA9IHVybC5zbGljZSAwLCB1cmwubGVuZ3RoLTQgaWYgdXJsLmVuZHNXaXRoIFwiLmdpdFwiXG4gICAgICAgICAgICBBYm91dC51cmwgPSB1cmxcblxuICAgICAgICB3aW4gPSBuZXcgQnJvd3NlclxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBBYm91dC5vcHQ/LmJhY2tncm91bmQgPyAnIzIyMidcbiAgICAgICAgICAgIHByZWxvYWRXaW5kb3c6ICAgdHJ1ZVxuICAgICAgICAgICAgY2VudGVyOiAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBoYXNTaGFkb3c6ICAgICAgIHRydWVcbiAgICAgICAgICAgIGFsd2F5c09uVG9wOiAgICAgdHJ1ZVxuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmFibGU6ICBmYWxzZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6IGZhbHNlXG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgIEFib3V0Lm9wdD8uc2l6ZSA/IDMwMFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICBBYm91dC5vcHQ/LnNpemUgPyAzMDBcblxuICAgICAgICB2ZXJzaW9uID0gQWJvdXQub3B0Py52ZXJzaW9uID8gQWJvdXQub3B0Py5wa2c/LnZlcnNpb25cbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgICAgIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICNhYm91dCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQtYWxpZ246ICAgIGNlbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAgICAgICAgcG9pbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogMDtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICNpbWFnZSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICA3MCU7XG4gICAgICAgICAgICAgICAgICAgIG1heC1oZWlnaHQ6ICAgIDcwJTtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgNTAlO1xuICAgICAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICA1MCU7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogICAgIHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAjdmVyc2lvbiB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAgICAgICAgICN7QWJvdXQub3B0Py52ZXJzaW9uT2Zmc2V0ICA/ICc3JSd9O1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgICAgIHRleHQtYWxpZ246ICAgICBjZW50ZXI7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAgICAgICAgICAje0Fib3V0Lm9wdD8uY29sb3IgPyAnIzMzMyd9O1xuICAgICAgICAgICAgICAgICAgICBmb250LWZhbWlseTogICAgVmVyZGFuYSwgc2Fucy1zZXJpZjtcbiAgICAgICAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICN2ZXJzaW9uOmhvdmVyIHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgICAgICN7QWJvdXQub3B0Py5oaWdobGlnaHQgPyAnI2Y4MCd9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgIDxkaXYgaWQ9J2Fib3V0JyB0YWJpbmRleD0wPlxuICAgICAgICAgICAgICAgIDxpbWcgaWQ9J2ltYWdlJyBzcmM9XCJmaWxlOi8vI3tBYm91dC5vcHQuaW1nfVwiLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSd2ZXJzaW9uJz5cbiAgICAgICAgICAgICAgICAgICAgI3t2ZXJzaW9ufVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIHZhciBlbGVjdHJvbiA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG4gICAgICAgICAgICAgICAgdmFyIGlwYyA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyO1xuICAgICAgICAgICAgICAgIHZhciBsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcnNpb24nKTtcbiAgICAgICAgICAgICAgICBsLm9uY2xpY2sgICA9IGZ1bmN0aW9uICgpIHsgaXBjLnNlbmQoJ29wZW5VUkwnKTsgfVxuICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fib3V0Jyk7XG4gICAgICAgICAgICAgICAgYS5vbmNsaWNrICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdjbG9zZUFib3V0Jyk7IH1cbiAgICAgICAgICAgICAgICBhLm9ua2V5ZG93biA9IGZ1bmN0aW9uICgpIHsgaXBjLnNlbmQoJ2Nsb3NlQWJvdXQnKTsgfVxuICAgICAgICAgICAgICAgIGEub25ibHVyICAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnYmx1ckFib3V0Jyk7ICB9XG4gICAgICAgICAgICAgICAgYS5vbmtleWRvd24gPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdjbG9zZUFib3V0Jyk7IH1cbiAgICAgICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBpcGMub24gJ29wZW5VUkwnLCAgICBBYm91dC5vcGVuVVJMXG4gICAgICAgIGlwYy5vbiAnY2xvc2VBYm91dCcsIEFib3V0LmNsb3NlQWJvdXRcbiAgICAgICAgaXBjLm9uICdibHVyQWJvdXQnLCAgQWJvdXQuYmx1ckFib3V0XG5cbiAgICAgICAgd2luLmxvYWRVUkwgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgICAgIHdpbi5vbiAncmVhZHktdG8tc2hvdycsIC0+IFxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgaWYgQWJvdXQub3B0Py5kZWJ1Z1xuICAgICAgICAgICAgICAgIHdpbi5vcGVuRGV2VG9vbHMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBBYm91dC53aW4gPSB3aW5cbiAgICAgICAgd2luXG5cbiAgICBAYmx1ckFib3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEFib3V0Lm9wdD8uZGVidWdcbiAgICAgICAgICAgIEFib3V0LmNsb3NlQWJvdXQoKVxuICAgIFxuICAgIEBjbG9zZUFib3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgaXBjICAgICAgPSBlbGVjdHJvbi5pcGNNYWluXG4gICAgICAgIGlwYy5yZW1vdmVBbGxMaXN0ZW5lcnMgJ29wZW5VUkwnXG4gICAgICAgIGlwYy5yZW1vdmVBbGxMaXN0ZW5lcnMgJ2Nsb3NlQWJvdXQnXG4gICAgICAgIEFib3V0Lndpbj8uY2xvc2UoKVxuICAgICAgICBBYm91dC53aW4gPSBudWxsXG5cbiAgICBAb3BlblVSTDogLT4gaWYgQWJvdXQudXJsPyB0aGVuIG9wZW5lciBBYm91dC51cmxcblxubW9kdWxlLmV4cG9ydHMgPSBBYm91dC5zaG93XG4iXX0=
//# sourceURL=../coffee/about.coffee