// koffee 1.14.0

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
        if (About.url != null) {
            return opener(About.url);
        }
    };

    return About;

})();

module.exports = About.show;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJhYm91dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUVIOzs7SUFFRixLQUFDLENBQUEsR0FBRCxHQUFPOztJQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU87O0lBQ1AsS0FBQyxDQUFBLEdBQUQsR0FBTzs7SUFFUCxLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsR0FBRDtBQUVILFlBQUE7UUFBQSxLQUFLLENBQUMsR0FBTixHQUFZO1FBR1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSO1FBRVosUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBbEIsQ0FBdUMsTUFBdkMsRUFBK0MsU0FBQyxPQUFELEVBQVUsUUFBVjttQkFDM0MsUUFBQSxDQUFTLFNBQUEsQ0FBVSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQVosQ0FBb0IsVUFBcEIsRUFBZ0MsRUFBaEMsQ0FBVixDQUFUO1FBRDJDLENBQS9DO1FBR0EsT0FBQSxHQUFZLFFBQVEsQ0FBQztRQUNyQixHQUFBLEdBQVksUUFBUSxDQUFDO1FBRXJCLEtBQUssQ0FBQyxHQUFOLGtDQUFxQixDQUFFO1FBQ3ZCLElBQU8sbUJBQUoscUdBQTZDLENBQUUsK0JBQWxEO1lBQ0ksR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUMvQixJQUFxQixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsQ0FBckI7Z0JBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUFOOztZQUNBLElBQW1DLEdBQUcsQ0FBQyxRQUFKLENBQWEsTUFBYixDQUFuQztnQkFBQSxHQUFBLEdBQU0sR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWLEVBQWEsR0FBRyxDQUFDLE1BQUosR0FBVyxDQUF4QixFQUFOOztZQUNBLEtBQUssQ0FBQyxHQUFOLEdBQVksSUFKaEI7O1FBTUEsR0FBQSxHQUFNLElBQUksT0FBSixDQUNGO1lBQUEsZUFBQSxrRkFBeUMsTUFBekM7WUFDQSxhQUFBLEVBQWlCLElBRGpCO1lBRUEsTUFBQSxFQUFpQixJQUZqQjtZQUdBLFNBQUEsRUFBaUIsSUFIakI7WUFJQSxXQUFBLEVBQWlCLElBSmpCO1lBS0EsU0FBQSxFQUFpQixLQUxqQjtZQU1BLEtBQUEsRUFBaUIsS0FOakI7WUFPQSxJQUFBLEVBQWlCLEtBUGpCO1lBUUEsY0FBQSxFQUFpQixLQVJqQjtZQVNBLFdBQUEsRUFBaUIsS0FUakI7WUFVQSxXQUFBLEVBQWlCLEtBVmpCO1lBV0EsS0FBQSw0RUFBbUMsR0FYbkM7WUFZQSxNQUFBLDRFQUFtQyxHQVpuQztZQWFBLGNBQUEsRUFDSTtnQkFBQSxXQUFBLEVBQXlCLEtBQXpCO2dCQUNBLGdCQUFBLEVBQXlCLEtBRHpCO2dCQUVBLGVBQUEsRUFBeUIsSUFGekI7Z0JBR0Esa0JBQUEsRUFBeUIsSUFIekI7Z0JBSUEsdUJBQUEsRUFBeUIsSUFKekI7YUFkSjtTQURFO1FBcUJOLE9BQUEscUpBQTZDLENBQUU7UUFDL0MsSUFBQSxHQUFPLDZ5QkFBQSxHQTBCMEIsd0ZBQTRCLElBQTVCLENBMUIxQixHQTBCMkQsaWdCQTFCM0QsR0F5Q3NDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0F6Q2hELEdBeUNvRCx3RUF6Q3BELEdBMkNXLE9BM0NYLEdBMkNtQjtRQWtCMUIsR0FBRyxDQUFDLEVBQUosQ0FBTyxTQUFQLEVBQW9CLEtBQUssQ0FBQyxPQUExQjtRQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sWUFBUCxFQUFvQixLQUFLLENBQUMsVUFBMUI7UUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLFdBQVAsRUFBb0IsS0FBSyxDQUFDLFNBQTFCO1FBRUEsR0FBRyxDQUFDLE9BQUosQ0FBWSwrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVixDQUE5QztRQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sZUFBUCxFQUF1QixTQUFBO0FBQ25CLGdCQUFBO1lBQUEsR0FBRyxDQUFDLElBQUosQ0FBQTtZQUNBLHVDQUFZLENBQUUsY0FBZDt1QkFDSSxHQUFHLENBQUMsWUFBSixDQUFpQjtvQkFBQSxJQUFBLEVBQUssUUFBTDtpQkFBakIsRUFESjs7UUFGbUIsQ0FBdkI7UUFLQSxLQUFLLENBQUMsR0FBTixHQUFZO2VBQ1o7SUFsSEc7O0lBb0hQLEtBQUMsQ0FBQSxTQUFELEdBQVksU0FBQTtBQUVSLFlBQUE7UUFBQSxJQUFHLGlDQUFhLENBQUUsZUFBbEI7bUJBQ0ksS0FBSyxDQUFDLFVBQU4sQ0FBQSxFQURKOztJQUZROztJQUtaLEtBQUMsQ0FBQSxVQUFELEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7UUFDWCxHQUFBLEdBQVcsUUFBUSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixTQUF2QjtRQUNBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixZQUF2Qjs7ZUFDUyxDQUFFLEtBQVgsQ0FBQTs7ZUFDQSxLQUFLLENBQUMsR0FBTixHQUFZO0lBUEg7O0lBU2IsS0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO1FBQUcsSUFBRyxpQkFBSDttQkFBbUIsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFiLEVBQW5COztJQUFIOzs7Ozs7QUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMFxuIyMjXG5cbm9wZW5lciA9IHJlcXVpcmUgJ29wZW5lcidcblxuY2xhc3MgQWJvdXRcblxuICAgIEB3aW4gPSBudWxsXG4gICAgQHVybCA9IG51bGxcbiAgICBAb3B0ID0gbnVsbFxuXG4gICAgQHNob3c6IChvcHQpIC0+XG5cbiAgICAgICAgQWJvdXQub3B0ID0gb3B0XG4gICAgICAgICMgQWJvdXQub3B0LmRlYnVnID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wcm90b2NvbC5yZWdpc3RlckZpbGVQcm90b2NvbCAnZmlsZScsIChyZXF1ZXN0LCBjYWxsYmFjaykgLT4gXG4gICAgICAgICAgICBjYWxsYmFjayBkZWNvZGVVUkkgcmVxdWVzdC51cmwucmVwbGFjZSAnZmlsZTovLy8nLCAnJ1xuICAgICAgICBcbiAgICAgICAgQnJvd3NlciAgID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBpcGMgICAgICAgPSBlbGVjdHJvbi5pcGNNYWluXG5cbiAgICAgICAgQWJvdXQudXJsID0gQWJvdXQub3B0Py51cmxcbiAgICAgICAgaWYgbm90IEFib3V0LnVybD8gYW5kIEFib3V0Lm9wdD8ucGtnPy5yZXBvc2l0b3J5Py51cmxcbiAgICAgICAgICAgIHVybCA9IEFib3V0Lm9wdC5wa2cucmVwb3NpdG9yeS51cmxcbiAgICAgICAgICAgIHVybCA9IHVybC5zbGljZSA0IGlmIHVybC5zdGFydHNXaXRoIFwiZ2l0K1wiXG4gICAgICAgICAgICB1cmwgPSB1cmwuc2xpY2UgMCwgdXJsLmxlbmd0aC00IGlmIHVybC5lbmRzV2l0aCBcIi5naXRcIlxuICAgICAgICAgICAgQWJvdXQudXJsID0gdXJsXG5cbiAgICAgICAgd2luID0gbmV3IEJyb3dzZXJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQWJvdXQub3B0Py5iYWNrZ3JvdW5kID8gJyMxMTEnXG4gICAgICAgICAgICBwcmVsb2FkV2luZG93OiAgIHRydWVcbiAgICAgICAgICAgIGNlbnRlcjogICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgaGFzU2hhZG93OiAgICAgICB0cnVlXG4gICAgICAgICAgICBhbHdheXNPblRvcDogICAgIHRydWVcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5hYmxlOiAgZmFsc2VcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgZmFsc2VcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgZmFsc2VcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgQWJvdXQub3B0Py5zaXplID8gMzAwXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIEFib3V0Lm9wdD8uc2l6ZSA/IDMwMFxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgY29udGV4dElzb2xhdGlvbjogICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBlbmFibGVSZW1vdGVNb2R1bGU6ICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbkluV29ya2VyOiB0cnVlLFxuXG4gICAgICAgIHZlcnNpb24gPSBBYm91dC5vcHQ/LnZlcnNpb24gPyBBYm91dC5vcHQ/LnBrZz8udmVyc2lvblxuICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgICAgICAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC5hYm91dCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiAgICBjZW50ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICAgICAgICBwb2ludGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuaW1hZ2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICA3MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXgtaGVpZ2h0OiAgICA3MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICA1MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICA1MCU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICAgICB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLnZlcnNpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAgICAgICAgICN7QWJvdXQub3B0Py52ZXJzaW9uT2Zmc2V0ID8gJzclJ307XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgIGNlbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAgICBWZXJkYW5hLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgICAgIHJnYig1MCwgNTAsIDUwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAudmVyc2lvbjpob3ZlciB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogICAgICAgICAgcmdiKDIwNSwgMjA1LCAyMDUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2Fib3V0JyBpZD0nYWJvdXQnIHRhYmluZGV4PTA+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9J2ltYWdlJyBzcmM9XCJmaWxlOi8vI3tBYm91dC5vcHQuaW1nfVwiLz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD0ndmVyc2lvbicgY2xhc3M9J3ZlcnNpb24nPlxuICAgICAgICAgICAgICAgICAgICAgICAgI3t2ZXJzaW9ufVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgICAgICB2YXIgZWxlY3Ryb24gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXBjID0gZWxlY3Ryb24uaXBjUmVuZGVyZXI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcnNpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgbC5vbmNsaWNrICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdvcGVuVVJMJyk7IH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgYS5vbmNsaWNrICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdjbG9zZUFib3V0Jyk7IH1cbiAgICAgICAgICAgICAgICAgICAgYS5vbmJsdXIgICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdibHVyQWJvdXQnKTsgIH1cbiAgICAgICAgICAgICAgICAgICAgYS5vbmtleWRvd24gPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdjbG9zZUFib3V0Jyk7IH1cbiAgICAgICAgICAgICAgICAgICAgYS5mb2N1cygpICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgPC9odG1sPlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBpcGMub24gJ29wZW5VUkwnICAgIEFib3V0Lm9wZW5VUkxcbiAgICAgICAgaXBjLm9uICdjbG9zZUFib3V0JyBBYm91dC5jbG9zZUFib3V0XG4gICAgICAgIGlwYy5vbiAnYmx1ckFib3V0JyAgQWJvdXQuYmx1ckFib3V0XG5cbiAgICAgICAgd2luLmxvYWRVUkwgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgICAgIHdpbi5vbiAncmVhZHktdG8tc2hvdycgLT4gXG4gICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICBpZiBBYm91dC5vcHQ/LmRlYnVnXG4gICAgICAgICAgICAgICAgd2luLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEFib3V0LndpbiA9IHdpblxuICAgICAgICB3aW5cblxuICAgIEBibHVyQWJvdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQWJvdXQub3B0Py5kZWJ1Z1xuICAgICAgICAgICAgQWJvdXQuY2xvc2VBYm91dCgpXG4gICAgXG4gICAgQGNsb3NlQWJvdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBpcGMgICAgICA9IGVsZWN0cm9uLmlwY01haW5cbiAgICAgICAgaXBjLnJlbW92ZUFsbExpc3RlbmVycyAnb3BlblVSTCdcbiAgICAgICAgaXBjLnJlbW92ZUFsbExpc3RlbmVycyAnY2xvc2VBYm91dCdcbiAgICAgICAgQWJvdXQud2luPy5jbG9zZSgpXG4gICAgICAgIEFib3V0LndpbiA9IG51bGxcblxuICAgIEBvcGVuVVJMOiAtPiBpZiBBYm91dC51cmw/IHRoZW4gb3BlbmVyIEFib3V0LnVybFxuXG5tb2R1bGUuZXhwb3J0cyA9IEFib3V0LnNob3dcbiJdfQ==
//# sourceURL=../coffee/about.coffee