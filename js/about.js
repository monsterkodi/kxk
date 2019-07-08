// koffee 1.3.0

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
        var Browser, electron, html, ipc, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, url, version, win;
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
                webSecurity: false,
                nodeIntegration: true
            },
            width: (ref6 = (ref7 = About.opt) != null ? ref7.size : void 0) != null ? ref6 : 300,
            height: (ref8 = (ref9 = About.opt) != null ? ref9.size : void 0) != null ? ref8 : 300
        });
        version = (ref10 = (ref11 = About.opt) != null ? ref11.version : void 0) != null ? ref10 : (ref12 = About.opt) != null ? (ref13 = ref12.pkg) != null ? ref13.version : void 0 : void 0;
        html = "<!DOCTYPE html>\n<html lang=\"en\">\n    <head>\n        <meta charset=\"utf-8\">\n        <style type=\"text/css\">\n            body {\n                overflow:      hidden;\n                -webkit-user-select: none;\n            }\n            .about {\n                text-align:    center;\n                cursor:        pointer;\n                outline-width: 0;\n                overflow:      hidden;\n            }\n            .image {\n                position:      absolute;\n                height:        70%;\n                max-height:    70%;\n                left:          50%;\n                top:           50%;\n                transform:     translate(-50%, -50%);\n            }\n            .version {\n                position:       absolute;\n                bottom:         " + ((ref14 = (ref15 = About.opt) != null ? ref15.versionOffset : void 0) != null ? ref14 : '7%') + ";\n                left:           0;\n                right:          0;\n                text-align:     center;\n                font-family:    Verdana, sans-serif;\n                text-decoration: none;\n                color:          rgb(50, 50, 50);\n            }\n            .version:hover {\n                color:          rgb(205, 205, 205);\n            }\n        </style>\n    </head>\n    <body>\n        <div class='about' id='about' tabindex=0>\n            <img class='image' src=\"file://" + About.opt.img + "\"/>\n            <div id='version' class='version'>\n                " + version + "\n            </div>\n        </div>\n        <script>\n            var electron = require('electron');\n            var ipc = electron.ipcRenderer;\n            var l = document.getElementById('version');\n            l.onclick   = function () { ipc.send('openURL'); }\n            var a = document.getElementById('about');\n            a.onclick   = function () { ipc.send('closeAbout'); }\n            a.onblur    = function () { ipc.send('blurAbout');  }\n            a.onkeydown = function () { console.log('close'); ipc.send('closeAbout'); }\n            a.focus()\n        </script>\n    </body>\n</html>";
        ipc.on('openURL', About.openURL);
        ipc.on('closeAbout', About.closeAbout);
        ipc.on('blurAbout', About.blurAbout);
        win.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
        win.on('ready-to-show', function() {
            var ref16;
            win.show();
            if ((ref16 = About.opt) != null ? ref16.debug : void 0) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFFSDs7O0lBRUYsS0FBQyxDQUFBLEdBQUQsR0FBTzs7SUFDUCxLQUFDLENBQUEsR0FBRCxHQUFPOztJQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU87O0lBRVAsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLEdBQUQ7QUFFSCxZQUFBO1FBQUEsS0FBSyxDQUFDLEdBQU4sR0FBWTtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE9BQUEsR0FBWSxRQUFRLENBQUM7UUFDckIsR0FBQSxHQUFZLFFBQVEsQ0FBQztRQUVyQixLQUFLLENBQUMsR0FBTixrQ0FBcUIsQ0FBRTtRQUN2QixJQUFPLG1CQUFKLHFHQUE2QyxDQUFFLCtCQUFsRDtZQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDL0IsSUFBcUIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLENBQXJCO2dCQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBTjs7WUFDQSxJQUFtQyxHQUFHLENBQUMsUUFBSixDQUFhLE1BQWIsQ0FBbkM7Z0JBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUFhLEdBQUcsQ0FBQyxNQUFKLEdBQVcsQ0FBeEIsRUFBTjs7WUFDQSxLQUFLLENBQUMsR0FBTixHQUFZLElBSmhCOztRQU1BLEdBQUEsR0FBTSxJQUFJLE9BQUosQ0FDRjtZQUFBLGVBQUEsa0ZBQXlDLE1BQXpDO1lBQ0EsYUFBQSxFQUFpQixJQURqQjtZQUVBLE1BQUEsRUFBaUIsSUFGakI7WUFHQSxTQUFBLEVBQWlCLElBSGpCO1lBSUEsV0FBQSxFQUFpQixJQUpqQjtZQUtBLFNBQUEsRUFBaUIsS0FMakI7WUFNQSxLQUFBLEVBQWlCLEtBTmpCO1lBT0EsSUFBQSxFQUFpQixLQVBqQjtZQVFBLGNBQUEsRUFBaUIsS0FSakI7WUFTQSxXQUFBLEVBQWlCLEtBVGpCO1lBVUEsV0FBQSxFQUFpQixLQVZqQjtZQVdBLGNBQUEsRUFDSTtnQkFBQSxXQUFBLEVBQWEsS0FBYjtnQkFDQSxlQUFBLEVBQWlCLElBRGpCO2FBWko7WUFjQSxLQUFBLDRFQUFtQyxHQWRuQztZQWVBLE1BQUEsNEVBQW1DLEdBZm5DO1NBREU7UUFrQk4sT0FBQSxxSkFBNkMsQ0FBRTtRQUMvQyxJQUFBLEdBQU8sNnlCQUFBLEdBMEIwQix3RkFBNEIsSUFBNUIsQ0ExQjFCLEdBMEIyRCxpZ0JBMUIzRCxHQXlDc0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQXpDaEQsR0F5Q29ELHdFQXpDcEQsR0EyQ1csT0EzQ1gsR0EyQ21CO1FBa0IxQixHQUFHLENBQUMsRUFBSixDQUFPLFNBQVAsRUFBcUIsS0FBSyxDQUFDLE9BQTNCO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxZQUFQLEVBQXFCLEtBQUssQ0FBQyxVQUEzQjtRQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sV0FBUCxFQUFxQixLQUFLLENBQUMsU0FBM0I7UUFFQSxHQUFHLENBQUMsT0FBSixDQUFZLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWLENBQTlDO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxlQUFQLEVBQXdCLFNBQUE7QUFDcEIsZ0JBQUE7WUFBQSxHQUFHLENBQUMsSUFBSixDQUFBO1lBQ0EsdUNBQVksQ0FBRSxjQUFkO3VCQUNJLEdBQUcsQ0FBQyxZQUFKLENBQUEsRUFESjs7UUFGb0IsQ0FBeEI7UUFLQSxLQUFLLENBQUMsR0FBTixHQUFZO2VBQ1o7SUF6R0c7O0lBMkdQLEtBQUMsQ0FBQSxTQUFELEdBQVksU0FBQTtBQUVSLFlBQUE7UUFBQSxJQUFHLGlDQUFhLENBQUUsZUFBbEI7bUJBQ0ksS0FBSyxDQUFDLFVBQU4sQ0FBQSxFQURKOztJQUZROztJQUtaLEtBQUMsQ0FBQSxVQUFELEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7UUFDWCxHQUFBLEdBQVcsUUFBUSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixTQUF2QjtRQUNBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixZQUF2Qjs7ZUFDUyxDQUFFLEtBQVgsQ0FBQTs7ZUFDQSxLQUFLLENBQUMsR0FBTixHQUFZO0lBUEg7O0lBU2IsS0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO1FBQUcsSUFBRyxpQkFBSDttQkFBbUIsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLEVBQW5COztJQUFIOzs7Ozs7QUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMFxuIyMjXG5cbm9wZW5lciA9IHJlcXVpcmUgJ29wZW5lcidcblxuY2xhc3MgQWJvdXRcblxuICAgIEB3aW4gPSBudWxsXG4gICAgQHVybCA9IG51bGxcbiAgICBAb3B0ID0gbnVsbFxuXG4gICAgQHNob3c6IChvcHQpIC0+XG5cbiAgICAgICAgQWJvdXQub3B0ID0gb3B0XG4gICAgICAgIGVsZWN0cm9uICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBCcm93c2VyICAgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIGlwYyAgICAgICA9IGVsZWN0cm9uLmlwY01haW5cblxuICAgICAgICBBYm91dC51cmwgPSBBYm91dC5vcHQ/LnVybFxuICAgICAgICBpZiBub3QgQWJvdXQudXJsPyBhbmQgQWJvdXQub3B0Py5wa2c/LnJlcG9zaXRvcnk/LnVybFxuICAgICAgICAgICAgdXJsID0gQWJvdXQub3B0LnBrZy5yZXBvc2l0b3J5LnVybFxuICAgICAgICAgICAgdXJsID0gdXJsLnNsaWNlIDQgaWYgdXJsLnN0YXJ0c1dpdGggXCJnaXQrXCJcbiAgICAgICAgICAgIHVybCA9IHVybC5zbGljZSAwLCB1cmwubGVuZ3RoLTQgaWYgdXJsLmVuZHNXaXRoIFwiLmdpdFwiXG4gICAgICAgICAgICBBYm91dC51cmwgPSB1cmxcblxuICAgICAgICB3aW4gPSBuZXcgQnJvd3NlclxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBBYm91dC5vcHQ/LmJhY2tncm91bmQgPyAnIzIyMidcbiAgICAgICAgICAgIHByZWxvYWRXaW5kb3c6ICAgdHJ1ZVxuICAgICAgICAgICAgY2VudGVyOiAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBoYXNTaGFkb3c6ICAgICAgIHRydWVcbiAgICAgICAgICAgIGFsd2F5c09uVG9wOiAgICAgdHJ1ZVxuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmFibGU6ICBmYWxzZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6IGZhbHNlXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgIEFib3V0Lm9wdD8uc2l6ZSA/IDMwMFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICBBYm91dC5vcHQ/LnNpemUgPyAzMDBcblxuICAgICAgICB2ZXJzaW9uID0gQWJvdXQub3B0Py52ZXJzaW9uID8gQWJvdXQub3B0Py5wa2c/LnZlcnNpb25cbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgICAgICAgICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuYWJvdXQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgY2VudGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAgICAgICAgcG9pbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUtd2lkdGg6IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLmltYWdlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgNzAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4LWhlaWdodDogICAgNzAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgNTAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAgICAgICAgICAgNTAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAgICAgdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC52ZXJzaW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgICBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAje0Fib3V0Lm9wdD8udmVyc2lvbk9mZnNldCA/ICc3JSd9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQtYWxpZ246ICAgICBjZW50ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250LWZhbWlseTogICAgVmVyZGFuYSwgc2Fucy1zZXJpZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAgICAgICAgICByZ2IoNTAsIDUwLCA1MCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLnZlcnNpb246aG92ZXIge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgICAgIHJnYigyMDUsIDIwNSwgMjA1KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdhYm91dCcgaWQ9J2Fib3V0JyB0YWJpbmRleD0wPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPSdpbWFnZScgc3JjPVwiZmlsZTovLyN7QWJvdXQub3B0LmltZ31cIi8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9J3ZlcnNpb24nIGNsYXNzPSd2ZXJzaW9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICN7dmVyc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlwYyA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJzaW9uJyk7XG4gICAgICAgICAgICAgICAgICAgIGwub25jbGljayAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnb3BlblVSTCcpOyB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fib3V0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGEub25jbGljayAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnY2xvc2VBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgICAgIGEub25ibHVyICAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnYmx1ckFib3V0Jyk7ICB9XG4gICAgICAgICAgICAgICAgICAgIGEub25rZXlkb3duID0gZnVuY3Rpb24gKCkgeyBjb25zb2xlLmxvZygnY2xvc2UnKTsgaXBjLnNlbmQoJ2Nsb3NlQWJvdXQnKTsgfVxuICAgICAgICAgICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgPC9odG1sPlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBpcGMub24gJ29wZW5VUkwnLCAgICBBYm91dC5vcGVuVVJMXG4gICAgICAgIGlwYy5vbiAnY2xvc2VBYm91dCcsIEFib3V0LmNsb3NlQWJvdXRcbiAgICAgICAgaXBjLm9uICdibHVyQWJvdXQnLCAgQWJvdXQuYmx1ckFib3V0XG5cbiAgICAgICAgd2luLmxvYWRVUkwgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgICAgIHdpbi5vbiAncmVhZHktdG8tc2hvdycsIC0+IFxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgaWYgQWJvdXQub3B0Py5kZWJ1Z1xuICAgICAgICAgICAgICAgIHdpbi5vcGVuRGV2VG9vbHMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBBYm91dC53aW4gPSB3aW5cbiAgICAgICAgd2luXG5cbiAgICBAYmx1ckFib3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEFib3V0Lm9wdD8uZGVidWdcbiAgICAgICAgICAgIEFib3V0LmNsb3NlQWJvdXQoKVxuICAgIFxuICAgIEBjbG9zZUFib3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgaXBjICAgICAgPSBlbGVjdHJvbi5pcGNNYWluXG4gICAgICAgIGlwYy5yZW1vdmVBbGxMaXN0ZW5lcnMgJ29wZW5VUkwnXG4gICAgICAgIGlwYy5yZW1vdmVBbGxMaXN0ZW5lcnMgJ2Nsb3NlQWJvdXQnXG4gICAgICAgIEFib3V0Lndpbj8uY2xvc2UoKVxuICAgICAgICBBYm91dC53aW4gPSBudWxsXG5cbiAgICBAb3BlblVSTDogLT4gaWYgQWJvdXQudXJsPyB0aGVuIG9wZW5lciBBYm91dC51cmxcblxubW9kdWxlLmV4cG9ydHMgPSBBYm91dC5zaG93XG4iXX0=
//# sourceURL=../coffee/about.coffee