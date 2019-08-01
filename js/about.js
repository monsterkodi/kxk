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
        if (About.url != null) {
            return opener(About.url);
        }
    };

    return About;

})();

module.exports = About.show;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFFSDs7O0lBRUYsS0FBQyxDQUFBLEdBQUQsR0FBTzs7SUFDUCxLQUFDLENBQUEsR0FBRCxHQUFPOztJQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU87O0lBRVAsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLEdBQUQ7QUFFSCxZQUFBO1FBQUEsS0FBSyxDQUFDLEdBQU4sR0FBWTtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE9BQUEsR0FBWSxRQUFRLENBQUM7UUFDckIsR0FBQSxHQUFZLFFBQVEsQ0FBQztRQUVyQixLQUFLLENBQUMsR0FBTixrQ0FBcUIsQ0FBRTtRQUN2QixJQUFPLG1CQUFKLHFHQUE2QyxDQUFFLCtCQUFsRDtZQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDL0IsSUFBcUIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLENBQXJCO2dCQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBTjs7WUFDQSxJQUFtQyxHQUFHLENBQUMsUUFBSixDQUFhLE1BQWIsQ0FBbkM7Z0JBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUFhLEdBQUcsQ0FBQyxNQUFKLEdBQVcsQ0FBeEIsRUFBTjs7WUFDQSxLQUFLLENBQUMsR0FBTixHQUFZLElBSmhCOztRQU1BLEdBQUEsR0FBTSxJQUFJLE9BQUosQ0FDRjtZQUFBLGVBQUEsa0ZBQXlDLE1BQXpDO1lBQ0EsYUFBQSxFQUFpQixJQURqQjtZQUVBLE1BQUEsRUFBaUIsSUFGakI7WUFHQSxTQUFBLEVBQWlCLElBSGpCO1lBSUEsV0FBQSxFQUFpQixJQUpqQjtZQUtBLFNBQUEsRUFBaUIsS0FMakI7WUFNQSxLQUFBLEVBQWlCLEtBTmpCO1lBT0EsSUFBQSxFQUFpQixLQVBqQjtZQVFBLGNBQUEsRUFBaUIsS0FSakI7WUFTQSxXQUFBLEVBQWlCLEtBVGpCO1lBVUEsV0FBQSxFQUFpQixLQVZqQjtZQVdBLGNBQUEsRUFDSTtnQkFBQSxXQUFBLEVBQWEsS0FBYjtnQkFDQSxlQUFBLEVBQWlCLElBRGpCO2FBWko7WUFjQSxLQUFBLDRFQUFtQyxHQWRuQztZQWVBLE1BQUEsNEVBQW1DLEdBZm5DO1NBREU7UUFrQk4sT0FBQSxxSkFBNkMsQ0FBRTtRQUMvQyxJQUFBLEdBQU8sNnlCQUFBLEdBMEIwQix3RkFBNEIsSUFBNUIsQ0ExQjFCLEdBMEIyRCxpZ0JBMUIzRCxHQXlDc0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQXpDaEQsR0F5Q29ELHdFQXpDcEQsR0EyQ1csT0EzQ1gsR0EyQ21CO1FBa0IxQixHQUFHLENBQUMsRUFBSixDQUFPLFNBQVAsRUFBb0IsS0FBSyxDQUFDLE9BQTFCO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxZQUFQLEVBQW9CLEtBQUssQ0FBQyxVQUExQjtRQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sV0FBUCxFQUFvQixLQUFLLENBQUMsU0FBMUI7UUFFQSxHQUFHLENBQUMsT0FBSixDQUFZLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWLENBQTlDO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxlQUFQLEVBQXVCLFNBQUE7QUFDbkIsZ0JBQUE7WUFBQSxHQUFHLENBQUMsSUFBSixDQUFBO1lBQ0EsdUNBQVksQ0FBRSxjQUFkO3VCQUNJLEdBQUcsQ0FBQyxZQUFKLENBQWlCO29CQUFBLElBQUEsRUFBSyxRQUFMO2lCQUFqQixFQURKOztRQUZtQixDQUF2QjtRQUtBLEtBQUssQ0FBQyxHQUFOLEdBQVk7ZUFDWjtJQXpHRzs7SUEyR1AsS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFBO0FBRVIsWUFBQTtRQUFBLElBQUcsaUNBQWEsQ0FBRSxlQUFsQjttQkFDSSxLQUFLLENBQUMsVUFBTixDQUFBLEVBREo7O0lBRlE7O0lBS1osS0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLEdBQUEsR0FBVyxRQUFRLENBQUM7UUFDcEIsR0FBRyxDQUFDLGtCQUFKLENBQXVCLFNBQXZCO1FBQ0EsR0FBRyxDQUFDLGtCQUFKLENBQXVCLFlBQXZCOztlQUNTLENBQUUsS0FBWCxDQUFBOztlQUNBLEtBQUssQ0FBQyxHQUFOLEdBQVk7SUFQSDs7SUFTYixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7UUFBRyxJQUFHLGlCQUFIO21CQUFtQixNQUFBLENBQU8sS0FBSyxDQUFDLEdBQWIsRUFBbkI7O0lBQUg7Ozs7OztBQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwXG4jIyNcblxub3BlbmVyID0gcmVxdWlyZSAnb3BlbmVyJ1xuXG5jbGFzcyBBYm91dFxuXG4gICAgQHdpbiA9IG51bGxcbiAgICBAdXJsID0gbnVsbFxuICAgIEBvcHQgPSBudWxsXG5cbiAgICBAc2hvdzogKG9wdCkgLT5cblxuICAgICAgICBBYm91dC5vcHQgPSBvcHRcbiAgICAgICAgZWxlY3Ryb24gID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEJyb3dzZXIgICA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgaXBjICAgICAgID0gZWxlY3Ryb24uaXBjTWFpblxuXG4gICAgICAgIEFib3V0LnVybCA9IEFib3V0Lm9wdD8udXJsXG4gICAgICAgIGlmIG5vdCBBYm91dC51cmw/IGFuZCBBYm91dC5vcHQ/LnBrZz8ucmVwb3NpdG9yeT8udXJsXG4gICAgICAgICAgICB1cmwgPSBBYm91dC5vcHQucGtnLnJlcG9zaXRvcnkudXJsXG4gICAgICAgICAgICB1cmwgPSB1cmwuc2xpY2UgNCBpZiB1cmwuc3RhcnRzV2l0aCBcImdpdCtcIlxuICAgICAgICAgICAgdXJsID0gdXJsLnNsaWNlIDAsIHVybC5sZW5ndGgtNCBpZiB1cmwuZW5kc1dpdGggXCIuZ2l0XCJcbiAgICAgICAgICAgIEFib3V0LnVybCA9IHVybFxuXG4gICAgICAgIHdpbiA9IG5ldyBCcm93c2VyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEFib3V0Lm9wdD8uYmFja2dyb3VuZCA/ICcjMjIyJ1xuICAgICAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgICAgICBjZW50ZXI6ICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGhhc1NoYWRvdzogICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuYWJsZTogIGZhbHNlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgICAgICB3ZWJTZWN1cml0eTogZmFsc2VcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgQWJvdXQub3B0Py5zaXplID8gMzAwXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIEFib3V0Lm9wdD8uc2l6ZSA/IDMwMFxuXG4gICAgICAgIHZlcnNpb24gPSBBYm91dC5vcHQ/LnZlcnNpb24gPyBBYm91dC5vcHQ/LnBrZz8udmVyc2lvblxuICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgICAgICAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC5hYm91dCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiAgICBjZW50ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICAgICAgICBwb2ludGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuaW1hZ2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICA3MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXgtaGVpZ2h0OiAgICA3MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICA1MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICA1MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICAgICB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLnZlcnNpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAgICAgICAgICN7QWJvdXQub3B0Py52ZXJzaW9uT2Zmc2V0ID8gJzclJ307XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgIGNlbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAgICBWZXJkYW5hLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgICAgIHJnYig1MCwgNTAsIDUwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAudmVyc2lvbjpob3ZlciB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogICAgICAgICAgcmdiKDIwNSwgMjA1LCAyMDUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2Fib3V0JyBpZD0nYWJvdXQnIHRhYmluZGV4PTA+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9J2ltYWdlJyBzcmM9XCJmaWxlOi8vI3tBYm91dC5vcHQuaW1nfVwiLz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD0ndmVyc2lvbicgY2xhc3M9J3ZlcnNpb24nPlxuICAgICAgICAgICAgICAgICAgICAgICAgI3t2ZXJzaW9ufVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgICAgICB2YXIgZWxlY3Ryb24gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXBjID0gZWxlY3Ryb24uaXBjUmVuZGVyZXI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcnNpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgbC5vbmNsaWNrICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdvcGVuVVJMJyk7IH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgYS5vbmNsaWNrICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdjbG9zZUFib3V0Jyk7IH1cbiAgICAgICAgICAgICAgICAgICAgYS5vbmJsdXIgICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdibHVyQWJvdXQnKTsgIH1cbiAgICAgICAgICAgICAgICAgICAgYS5vbmtleWRvd24gPSBmdW5jdGlvbiAoKSB7IGNvbnNvbGUubG9nKCdjbG9zZScpOyBpcGMuc2VuZCgnY2xvc2VBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICA8L2h0bWw+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGlwYy5vbiAnb3BlblVSTCcgICAgQWJvdXQub3BlblVSTFxuICAgICAgICBpcGMub24gJ2Nsb3NlQWJvdXQnIEFib3V0LmNsb3NlQWJvdXRcbiAgICAgICAgaXBjLm9uICdibHVyQWJvdXQnICBBYm91dC5ibHVyQWJvdXRcblxuICAgICAgICB3aW4ubG9hZFVSTCBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbClcbiAgICAgICAgd2luLm9uICdyZWFkeS10by1zaG93JyAtPiBcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIGlmIEFib3V0Lm9wdD8uZGVidWdcbiAgICAgICAgICAgICAgICB3aW4ub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQWJvdXQud2luID0gd2luXG4gICAgICAgIHdpblxuXG4gICAgQGJsdXJBYm91dDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBBYm91dC5vcHQ/LmRlYnVnXG4gICAgICAgICAgICBBYm91dC5jbG9zZUFib3V0KClcbiAgICBcbiAgICBAY2xvc2VBYm91dDogLT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIGlwYyAgICAgID0gZWxlY3Ryb24uaXBjTWFpblxuICAgICAgICBpcGMucmVtb3ZlQWxsTGlzdGVuZXJzICdvcGVuVVJMJ1xuICAgICAgICBpcGMucmVtb3ZlQWxsTGlzdGVuZXJzICdjbG9zZUFib3V0J1xuICAgICAgICBBYm91dC53aW4/LmNsb3NlKClcbiAgICAgICAgQWJvdXQud2luID0gbnVsbFxuXG4gICAgQG9wZW5VUkw6IC0+IGlmIEFib3V0LnVybD8gdGhlbiBvcGVuZXIgQWJvdXQudXJsXG5cbm1vZHVsZS5leHBvcnRzID0gQWJvdXQuc2hvd1xuIl19
//# sourceURL=../coffee/about.coffee