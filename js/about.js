// koffee 1.14.0

/*
 0000000   0000000     0000000   000   000  000000000
000   000  000   000  000   000  000   000     000
000000000  0000000    000   000  000   000     000
000   000  000   000  000   000  000   000     000
000   000  0000000     0000000    0000000      000
 */
var About;

About = (function() {
    function About() {}

    About.win = null;

    About.url = null;

    About.opt = null;

    About.show = function(opt) {
        var Browser, electron, html, ipc, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, url, version, win;
        About.opt = opt;
        electron = require('electron');
        electron.protocol.registerFileProtocol('file', function(request, callback) {
            return callback(decodeURI(request.url.replace('file:///', '')));
        });
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
            backgroundColor: (ref4 = (ref5 = About.opt) != null ? ref5.background : void 0) != null ? ref4 : '#111',
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
            width: (ref6 = (ref7 = About.opt) != null ? ref7.size : void 0) != null ? ref6 : 300,
            height: (ref8 = (ref9 = About.opt) != null ? ref9.size : void 0) != null ? ref8 : 300,
            webPreferences: {
                webSecurity: false,
                contextIsolation: false,
                nodeIntegration: true,
                enableRemoteModule: true,
                nodeIntegrationInWorker: true
            }
        });
        version = (ref10 = (ref11 = About.opt) != null ? ref11.version : void 0) != null ? ref10 : (ref12 = About.opt) != null ? (ref13 = ref12.pkg) != null ? ref13.version : void 0 : void 0;
        html = "<!DOCTYPE html>\n<html lang=\"en\">\n    <head>\n        <meta charset=\"utf-8\">\n        <style type=\"text/css\">\n            body {\n                overflow:      hidden;\n                -webkit-user-select: none;\n            }\n            .about {\n                text-align:    center;\n                cursor:        pointer;\n                outline-width: 0;\n                overflow:      hidden;\n            }\n            .image {\n                position:      absolute;\n                height:        70%;\n                max-height:    70%;\n                left:          50%;\n                top:           50%;\n                transform:     translate(-50%, -50%);\n            }\n            .version {\n                position:       absolute;\n                bottom:         " + ((ref14 = (ref15 = About.opt) != null ? ref15.versionOffset : void 0) != null ? ref14 : '7%') + ";\n                left:           0;\n                right:          0;\n                text-align:     center;\n                font-family:    Verdana, sans-serif;\n                text-decoration: none;\n                color:          rgb(50, 50, 50);\n            }\n            .version:hover {\n                color:          rgb(205, 205, 205);\n            }\n        </style>\n    </head>\n    <body>\n        <div class='about' id='about' tabindex=0>\n            <img class='image' src=\"file://" + About.opt.img + "\"/>\n            <div id='version' class='version'>\n                " + version + "\n            </div>\n        </div>\n        <script>\n            var electron = require('electron');\n            var ipc = electron.ipcRenderer;\n            var l = document.getElementById('version');\n            l.onclick   = function () { ipc.send('openURL'); }\n            var a = document.getElementById('about');\n            a.onclick   = function () { ipc.send('closeAbout'); }\n            a.onblur    = function () { ipc.send('blurAbout');  }\n            a.onkeydown = function () { ipc.send('closeAbout'); }\n            a.focus()                    \n        </script>\n    </body>\n</html>";
        ipc.on('openURL', About.openURL);
        ipc.on('closeAbout', About.closeAbout);
        ipc.on('blurAbout', About.blurAbout);
        win.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
        win.on('ready-to-show', function() {
            var ref16;
            win.show();
            if ((ref16 = About.opt) != null ? ref16.debug : void 0) {
                return win.openDevTools({
                    mode: 'detach'
                });
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
        var opener;
        opener = require('opener');
        if (About.url != null) {
            return opener(About.url);
        }
    };

    return About;

})();

module.exports = About.show;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJhYm91dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUU07OztJQUVGLEtBQUMsQ0FBQSxHQUFELEdBQU87O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTzs7SUFDUCxLQUFDLENBQUEsR0FBRCxHQUFPOztJQUVQLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxHQUFEO0FBRUgsWUFBQTtRQUFBLEtBQUssQ0FBQyxHQUFOLEdBQVk7UUFHWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7UUFFWixRQUFRLENBQUMsUUFBUSxDQUFDLG9CQUFsQixDQUF1QyxNQUF2QyxFQUErQyxTQUFDLE9BQUQsRUFBVSxRQUFWO21CQUMzQyxRQUFBLENBQVMsU0FBQSxDQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBWixDQUFvQixVQUFwQixFQUFnQyxFQUFoQyxDQUFWLENBQVQ7UUFEMkMsQ0FBL0M7UUFHQSxPQUFBLEdBQVksUUFBUSxDQUFDO1FBQ3JCLEdBQUEsR0FBWSxRQUFRLENBQUM7UUFFckIsS0FBSyxDQUFDLEdBQU4sa0NBQXFCLENBQUU7UUFDdkIsSUFBTyxtQkFBSixxR0FBNkMsQ0FBRSwrQkFBbEQ7WUFDSSxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1lBQy9CLElBQXFCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixDQUFyQjtnQkFBQSxHQUFBLEdBQU0sR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWLEVBQU47O1lBQ0EsSUFBbUMsR0FBRyxDQUFDLFFBQUosQ0FBYSxNQUFiLENBQW5DO2dCQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBYSxHQUFHLENBQUMsTUFBSixHQUFXLENBQXhCLEVBQU47O1lBQ0EsS0FBSyxDQUFDLEdBQU4sR0FBWSxJQUpoQjs7UUFNQSxHQUFBLEdBQU0sSUFBSSxPQUFKLENBQ0Y7WUFBQSxlQUFBLGtGQUF5QyxNQUF6QztZQUNBLGFBQUEsRUFBaUIsSUFEakI7WUFFQSxNQUFBLEVBQWlCLElBRmpCO1lBR0EsU0FBQSxFQUFpQixJQUhqQjtZQUlBLFdBQUEsRUFBaUIsSUFKakI7WUFLQSxTQUFBLEVBQWlCLEtBTGpCO1lBTUEsS0FBQSxFQUFpQixLQU5qQjtZQU9BLElBQUEsRUFBaUIsS0FQakI7WUFRQSxjQUFBLEVBQWlCLEtBUmpCO1lBU0EsV0FBQSxFQUFpQixLQVRqQjtZQVVBLFdBQUEsRUFBaUIsS0FWakI7WUFXQSxLQUFBLDRFQUFtQyxHQVhuQztZQVlBLE1BQUEsNEVBQW1DLEdBWm5DO1lBYUEsY0FBQSxFQUNJO2dCQUFBLFdBQUEsRUFBeUIsS0FBekI7Z0JBQ0EsZ0JBQUEsRUFBeUIsS0FEekI7Z0JBRUEsZUFBQSxFQUF5QixJQUZ6QjtnQkFHQSxrQkFBQSxFQUF5QixJQUh6QjtnQkFJQSx1QkFBQSxFQUF5QixJQUp6QjthQWRKO1NBREU7UUFxQk4sT0FBQSxxSkFBNkMsQ0FBRTtRQUMvQyxJQUFBLEdBQU8sNnlCQUFBLEdBMEIwQix3RkFBNEIsSUFBNUIsQ0ExQjFCLEdBMEIyRCxpZ0JBMUIzRCxHQXlDc0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQXpDaEQsR0F5Q29ELHdFQXpDcEQsR0EyQ1csT0EzQ1gsR0EyQ21CO1FBa0IxQixHQUFHLENBQUMsRUFBSixDQUFPLFNBQVAsRUFBb0IsS0FBSyxDQUFDLE9BQTFCO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxZQUFQLEVBQW9CLEtBQUssQ0FBQyxVQUExQjtRQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sV0FBUCxFQUFvQixLQUFLLENBQUMsU0FBMUI7UUFFQSxHQUFHLENBQUMsT0FBSixDQUFZLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWLENBQTlDO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxlQUFQLEVBQXVCLFNBQUE7QUFDbkIsZ0JBQUE7WUFBQSxHQUFHLENBQUMsSUFBSixDQUFBO1lBQ0EsdUNBQVksQ0FBRSxjQUFkO3VCQUNJLEdBQUcsQ0FBQyxZQUFKLENBQWlCO29CQUFBLElBQUEsRUFBSyxRQUFMO2lCQUFqQixFQURKOztRQUZtQixDQUF2QjtRQUtBLEtBQUssQ0FBQyxHQUFOLEdBQVk7ZUFDWjtJQWxIRzs7SUFvSFAsS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFBO0FBRVIsWUFBQTtRQUFBLElBQUcsaUNBQWEsQ0FBRSxlQUFsQjttQkFDSSxLQUFLLENBQUMsVUFBTixDQUFBLEVBREo7O0lBRlE7O0lBS1osS0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLEdBQUEsR0FBVyxRQUFRLENBQUM7UUFDcEIsR0FBRyxDQUFDLGtCQUFKLENBQXVCLFNBQXZCO1FBQ0EsR0FBRyxDQUFDLGtCQUFKLENBQXVCLFlBQXZCOztlQUNTLENBQUUsS0FBWCxDQUFBOztlQUNBLEtBQUssQ0FBQyxHQUFOLEdBQVk7SUFQSDs7SUFTYixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO1FBQ1QsSUFBRyxpQkFBSDttQkFBbUIsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLEVBQW5COztJQUhNOzs7Ozs7QUFLZCxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMFxuIyMjXG5cbmNsYXNzIEFib3V0XG5cbiAgICBAd2luID0gbnVsbFxuICAgIEB1cmwgPSBudWxsXG4gICAgQG9wdCA9IG51bGxcblxuICAgIEBzaG93OiAob3B0KSAtPlxuXG4gICAgICAgIEFib3V0Lm9wdCA9IG9wdFxuICAgICAgICAjIEFib3V0Lm9wdC5kZWJ1ZyA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24ucHJvdG9jb2wucmVnaXN0ZXJGaWxlUHJvdG9jb2wgJ2ZpbGUnLCAocmVxdWVzdCwgY2FsbGJhY2spIC0+IFxuICAgICAgICAgICAgY2FsbGJhY2sgZGVjb2RlVVJJIHJlcXVlc3QudXJsLnJlcGxhY2UgJ2ZpbGU6Ly8vJywgJydcbiAgICAgICAgXG4gICAgICAgIEJyb3dzZXIgICA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgaXBjICAgICAgID0gZWxlY3Ryb24uaXBjTWFpblxuXG4gICAgICAgIEFib3V0LnVybCA9IEFib3V0Lm9wdD8udXJsXG4gICAgICAgIGlmIG5vdCBBYm91dC51cmw/IGFuZCBBYm91dC5vcHQ/LnBrZz8ucmVwb3NpdG9yeT8udXJsXG4gICAgICAgICAgICB1cmwgPSBBYm91dC5vcHQucGtnLnJlcG9zaXRvcnkudXJsXG4gICAgICAgICAgICB1cmwgPSB1cmwuc2xpY2UgNCBpZiB1cmwuc3RhcnRzV2l0aCBcImdpdCtcIlxuICAgICAgICAgICAgdXJsID0gdXJsLnNsaWNlIDAsIHVybC5sZW5ndGgtNCBpZiB1cmwuZW5kc1dpdGggXCIuZ2l0XCJcbiAgICAgICAgICAgIEFib3V0LnVybCA9IHVybFxuXG4gICAgICAgIHdpbiA9IG5ldyBCcm93c2VyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEFib3V0Lm9wdD8uYmFja2dyb3VuZCA/ICcjMTExJ1xuICAgICAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgICAgICBjZW50ZXI6ICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGhhc1NoYWRvdzogICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuYWJsZTogIGZhbHNlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgIEFib3V0Lm9wdD8uc2l6ZSA/IDMwMFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICBBYm91dC5vcHQ/LnNpemUgPyAzMDBcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnRleHRJc29sYXRpb246ICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgZW5hYmxlUmVtb3RlTW9kdWxlOiAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb25JbldvcmtlcjogdHJ1ZSxcblxuICAgICAgICB2ZXJzaW9uID0gQWJvdXQub3B0Py52ZXJzaW9uID8gQWJvdXQub3B0Py5wa2c/LnZlcnNpb25cbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgICAgICAgICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuYWJvdXQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgY2VudGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAgICAgICAgcG9pbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUtd2lkdGg6IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLmltYWdlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgNzAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4LWhlaWdodDogICAgNzAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgNTAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAgICAgICAgICAgNTAlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAgICAgdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC52ZXJzaW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgICBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAje0Fib3V0Lm9wdD8udmVyc2lvbk9mZnNldCA/ICc3JSd9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQtYWxpZ246ICAgICBjZW50ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250LWZhbWlseTogICAgVmVyZGFuYSwgc2Fucy1zZXJpZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAgICAgICAgICByZ2IoNTAsIDUwLCA1MCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLnZlcnNpb246aG92ZXIge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgICAgIHJnYigyMDUsIDIwNSwgMjA1KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdhYm91dCcgaWQ9J2Fib3V0JyB0YWJpbmRleD0wPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPSdpbWFnZScgc3JjPVwiZmlsZTovLyN7QWJvdXQub3B0LmltZ31cIi8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9J3ZlcnNpb24nIGNsYXNzPSd2ZXJzaW9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICN7dmVyc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlwYyA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJzaW9uJyk7XG4gICAgICAgICAgICAgICAgICAgIGwub25jbGljayAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnb3BlblVSTCcpOyB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fib3V0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGEub25jbGljayAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnY2xvc2VBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgICAgIGEub25ibHVyICAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnYmx1ckFib3V0Jyk7ICB9XG4gICAgICAgICAgICAgICAgICAgIGEub25rZXlkb3duID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnY2xvc2VBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgICAgIGEuZm9jdXMoKSAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8L2JvZHk+XG4gICAgICAgIDwvaHRtbD5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXBjLm9uICdvcGVuVVJMJyAgICBBYm91dC5vcGVuVVJMXG4gICAgICAgIGlwYy5vbiAnY2xvc2VBYm91dCcgQWJvdXQuY2xvc2VBYm91dFxuICAgICAgICBpcGMub24gJ2JsdXJBYm91dCcgIEFib3V0LmJsdXJBYm91dFxuXG4gICAgICAgIHdpbi5sb2FkVVJMIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSShodG1sKVxuICAgICAgICB3aW4ub24gJ3JlYWR5LXRvLXNob3cnIC0+IFxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgaWYgQWJvdXQub3B0Py5kZWJ1Z1xuICAgICAgICAgICAgICAgIHdpbi5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBBYm91dC53aW4gPSB3aW5cbiAgICAgICAgd2luXG5cbiAgICBAYmx1ckFib3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEFib3V0Lm9wdD8uZGVidWdcbiAgICAgICAgICAgIEFib3V0LmNsb3NlQWJvdXQoKVxuICAgIFxuICAgIEBjbG9zZUFib3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgaXBjICAgICAgPSBlbGVjdHJvbi5pcGNNYWluXG4gICAgICAgIGlwYy5yZW1vdmVBbGxMaXN0ZW5lcnMgJ29wZW5VUkwnXG4gICAgICAgIGlwYy5yZW1vdmVBbGxMaXN0ZW5lcnMgJ2Nsb3NlQWJvdXQnXG4gICAgICAgIEFib3V0Lndpbj8uY2xvc2UoKVxuICAgICAgICBBYm91dC53aW4gPSBudWxsXG5cbiAgICBAb3BlblVSTDogLT5cbiAgICBcbiAgICAgICAgb3BlbmVyID0gcmVxdWlyZSAnb3BlbmVyJ1xuICAgICAgICBpZiBBYm91dC51cmw/IHRoZW4gb3BlbmVyIEFib3V0LnVybFxuXG5tb2R1bGUuZXhwb3J0cyA9IEFib3V0LnNob3dcbiJdfQ==
//# sourceURL=../coffee/about.coffee