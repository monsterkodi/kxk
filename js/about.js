// koffee 0.43.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJvdXQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFFSDs7O0lBRUYsS0FBQyxDQUFBLEdBQUQsR0FBTzs7SUFDUCxLQUFDLENBQUEsR0FBRCxHQUFPOztJQUNQLEtBQUMsQ0FBQSxHQUFELEdBQU87O0lBRVAsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLEdBQUQ7QUFFSCxZQUFBO1FBQUEsS0FBSyxDQUFDLEdBQU4sR0FBWTtRQUNaLFFBQUEsR0FBWSxPQUFBLENBQVEsVUFBUjtRQUNaLE9BQUEsR0FBWSxRQUFRLENBQUM7UUFDckIsR0FBQSxHQUFZLFFBQVEsQ0FBQztRQUVyQixLQUFLLENBQUMsR0FBTixrQ0FBcUIsQ0FBRTtRQUN2QixJQUFPLG1CQUFKLHFHQUE2QyxDQUFFLCtCQUFsRDtZQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDL0IsSUFBcUIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLENBQXJCO2dCQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBTjs7WUFDQSxJQUFtQyxHQUFHLENBQUMsUUFBSixDQUFhLE1BQWIsQ0FBbkM7Z0JBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUFhLEdBQUcsQ0FBQyxNQUFKLEdBQVcsQ0FBeEIsRUFBTjs7WUFDQSxLQUFLLENBQUMsR0FBTixHQUFZLElBSmhCOztRQU1BLEdBQUEsR0FBTSxJQUFJLE9BQUosQ0FDRjtZQUFBLGVBQUEsa0ZBQXlDLE1BQXpDO1lBQ0EsYUFBQSxFQUFpQixJQURqQjtZQUVBLE1BQUEsRUFBaUIsSUFGakI7WUFHQSxTQUFBLEVBQWlCLElBSGpCO1lBSUEsV0FBQSxFQUFpQixJQUpqQjtZQUtBLFNBQUEsRUFBaUIsS0FMakI7WUFNQSxLQUFBLEVBQWlCLEtBTmpCO1lBT0EsSUFBQSxFQUFpQixLQVBqQjtZQVFBLGNBQUEsRUFBaUIsS0FSakI7WUFTQSxXQUFBLEVBQWlCLEtBVGpCO1lBVUEsV0FBQSxFQUFpQixLQVZqQjtZQVdBLGNBQUEsRUFDSTtnQkFBQSxXQUFBLEVBQWEsS0FBYjthQVpKO1lBYUEsS0FBQSw0RUFBbUMsR0FibkM7WUFjQSxNQUFBLDRFQUFtQyxHQWRuQztTQURFO1FBaUJOLE9BQUEscUpBQTZDLENBQUU7UUFDL0MsSUFBQSxHQUFPLHdpQkFBQSxHQXdCc0Isd0ZBQTZCLElBQTdCLENBeEJ0QixHQXdCd0Qsc0hBeEJ4RCxHQTRCc0IsZ0ZBQW9CLE1BQXBCLENBNUJ0QixHQTRCaUQsMElBNUJqRCxHQWtDc0Isb0ZBQXdCLE1BQXhCLENBbEN0QixHQWtDcUQsc0ZBbENyRCxHQXVDK0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQXZDekMsR0F1QzZDLHdDQXZDN0MsR0F5Q08sT0F6Q1AsR0F5Q2U7UUFpQnRCLEdBQUcsQ0FBQyxFQUFKLENBQU8sU0FBUCxFQUFxQixLQUFLLENBQUMsT0FBM0I7UUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLFlBQVAsRUFBcUIsS0FBSyxDQUFDLFVBQTNCO1FBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxXQUFQLEVBQXFCLEtBQUssQ0FBQyxTQUEzQjtRQUVBLEdBQUcsQ0FBQyxPQUFKLENBQVksK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVYsQ0FBOUM7UUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLGVBQVAsRUFBd0IsU0FBQTtBQUNwQixnQkFBQTtZQUFBLEdBQUcsQ0FBQyxJQUFKLENBQUE7WUFDQSx1Q0FBWSxDQUFFLGNBQWQ7dUJBQ0ksR0FBRyxDQUFDLFlBQUosQ0FBQSxFQURKOztRQUZvQixDQUF4QjtRQUtBLEtBQUssQ0FBQyxHQUFOLEdBQVk7ZUFDWjtJQXJHRzs7SUF1R1AsS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFBO0FBRVIsWUFBQTtRQUFBLElBQUcsaUNBQWEsQ0FBRSxlQUFsQjttQkFDSSxLQUFLLENBQUMsVUFBTixDQUFBLEVBREo7O0lBRlE7O0lBS1osS0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtRQUNYLEdBQUEsR0FBVyxRQUFRLENBQUM7UUFDcEIsR0FBRyxDQUFDLGtCQUFKLENBQXVCLFNBQXZCO1FBQ0EsR0FBRyxDQUFDLGtCQUFKLENBQXVCLFlBQXZCOztlQUNTLENBQUUsS0FBWCxDQUFBOztlQUNBLEtBQUssQ0FBQyxHQUFOLEdBQVk7SUFQSDs7SUFTYixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7UUFBRyxJQUFHLGlCQUFIO21CQUFtQixNQUFBLENBQU8sS0FBSyxDQUFDLEdBQWIsRUFBbkI7O0lBQUg7Ozs7OztBQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwXG4jIyNcblxub3BlbmVyID0gcmVxdWlyZSAnb3BlbmVyJ1xuXG5jbGFzcyBBYm91dFxuXG4gICAgQHdpbiA9IG51bGxcbiAgICBAdXJsID0gbnVsbFxuICAgIEBvcHQgPSBudWxsXG5cbiAgICBAc2hvdzogKG9wdCkgLT5cblxuICAgICAgICBBYm91dC5vcHQgPSBvcHRcbiAgICAgICAgZWxlY3Ryb24gID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIEJyb3dzZXIgICA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgaXBjICAgICAgID0gZWxlY3Ryb24uaXBjTWFpblxuXG4gICAgICAgIEFib3V0LnVybCA9IEFib3V0Lm9wdD8udXJsXG4gICAgICAgIGlmIG5vdCBBYm91dC51cmw/IGFuZCBBYm91dC5vcHQ/LnBrZz8ucmVwb3NpdG9yeT8udXJsXG4gICAgICAgICAgICB1cmwgPSBBYm91dC5vcHQucGtnLnJlcG9zaXRvcnkudXJsXG4gICAgICAgICAgICB1cmwgPSB1cmwuc2xpY2UgNCBpZiB1cmwuc3RhcnRzV2l0aCBcImdpdCtcIlxuICAgICAgICAgICAgdXJsID0gdXJsLnNsaWNlIDAsIHVybC5sZW5ndGgtNCBpZiB1cmwuZW5kc1dpdGggXCIuZ2l0XCJcbiAgICAgICAgICAgIEFib3V0LnVybCA9IHVybFxuXG4gICAgICAgIHdpbiA9IG5ldyBCcm93c2VyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEFib3V0Lm9wdD8uYmFja2dyb3VuZCA/ICcjMjIyJ1xuICAgICAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgICAgICBjZW50ZXI6ICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGhhc1NoYWRvdzogICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICB0cnVlXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuYWJsZTogIGZhbHNlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgIGZhbHNlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgICAgICB3ZWJTZWN1cml0eTogZmFsc2VcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgQWJvdXQub3B0Py5zaXplID8gMzAwXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgIEFib3V0Lm9wdD8uc2l6ZSA/IDMwMFxuXG4gICAgICAgIHZlcnNpb24gPSBBYm91dC5vcHQ/LnZlcnNpb24gPyBBYm91dC5vcHQ/LnBrZz8udmVyc2lvblxuICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICAgICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgI2Fib3V0IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgY2VudGVyO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICAgICAgICBwb2ludGVyO1xuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lLXdpZHRoOiAwO1xuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgI2ltYWdlIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogICAgICAgIDcwJTtcbiAgICAgICAgICAgICAgICAgICAgbWF4LWhlaWdodDogICAgNzAlO1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICA1MCU7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogICAgICAgICAgIDUwJTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAgICAgdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICN2ZXJzaW9uIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgICAgICAgICBib3R0b206ICAgICAgICAgI3tBYm91dC5vcHQ/LnZlcnNpb25PZmZzZXQgID8gJzclJ307XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgICAgICByaWdodDogICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogICAgIGNlbnRlcjtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgICAgICN7QWJvdXQub3B0Py5jb2xvciA/ICcjMzMzJ307XG4gICAgICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAgICBWZXJkYW5hLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgI3ZlcnNpb246aG92ZXIge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogICAgICAgICAgI3tBYm91dC5vcHQ/LmhpZ2hsaWdodCA/ICcjZjgwJ307XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICA8L3N0eWxlPlxuICAgICAgICAgICAgPGRpdiBpZD0nYWJvdXQnIHRhYmluZGV4PTA+XG4gICAgICAgICAgICAgICAgPGltZyBpZD0naW1hZ2UnIHNyYz1cImZpbGU6Ly8je0Fib3V0Lm9wdC5pbWd9XCIvPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J3ZlcnNpb24nPlxuICAgICAgICAgICAgICAgICAgICAje3ZlcnNpb259XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgdmFyIGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgICAgICB2YXIgaXBjID0gZWxlY3Ryb24uaXBjUmVuZGVyZXI7XG4gICAgICAgICAgICAgICAgdmFyIGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmVyc2lvbicpO1xuICAgICAgICAgICAgICAgIGwub25jbGljayAgID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnb3BlblVSTCcpOyB9XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICBhLm9uY2xpY2sgICA9IGZ1bmN0aW9uICgpIHsgaXBjLnNlbmQoJ2Nsb3NlQWJvdXQnKTsgfVxuICAgICAgICAgICAgICAgIGEub25rZXlkb3duID0gZnVuY3Rpb24gKCkgeyBpcGMuc2VuZCgnY2xvc2VBYm91dCcpOyB9XG4gICAgICAgICAgICAgICAgYS5vbmJsdXIgICAgPSBmdW5jdGlvbiAoKSB7IGlwYy5zZW5kKCdibHVyQWJvdXQnKTsgIH1cbiAgICAgICAgICAgICAgICBhLm9ua2V5ZG93biA9IGZ1bmN0aW9uICgpIHsgaXBjLnNlbmQoJ2Nsb3NlQWJvdXQnKTsgfVxuICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGlwYy5vbiAnb3BlblVSTCcsICAgIEFib3V0Lm9wZW5VUkxcbiAgICAgICAgaXBjLm9uICdjbG9zZUFib3V0JywgQWJvdXQuY2xvc2VBYm91dFxuICAgICAgICBpcGMub24gJ2JsdXJBYm91dCcsICBBYm91dC5ibHVyQWJvdXRcblxuICAgICAgICB3aW4ubG9hZFVSTCBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbClcbiAgICAgICAgd2luLm9uICdyZWFkeS10by1zaG93JywgLT4gXG4gICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICBpZiBBYm91dC5vcHQ/LmRlYnVnXG4gICAgICAgICAgICAgICAgd2luLm9wZW5EZXZUb29scygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEFib3V0LndpbiA9IHdpblxuICAgICAgICB3aW5cblxuICAgIEBibHVyQWJvdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQWJvdXQub3B0Py5kZWJ1Z1xuICAgICAgICAgICAgQWJvdXQuY2xvc2VBYm91dCgpXG4gICAgXG4gICAgQGNsb3NlQWJvdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICBpcGMgICAgICA9IGVsZWN0cm9uLmlwY01haW5cbiAgICAgICAgaXBjLnJlbW92ZUFsbExpc3RlbmVycyAnb3BlblVSTCdcbiAgICAgICAgaXBjLnJlbW92ZUFsbExpc3RlbmVycyAnY2xvc2VBYm91dCdcbiAgICAgICAgQWJvdXQud2luPy5jbG9zZSgpXG4gICAgICAgIEFib3V0LndpbiA9IG51bGxcblxuICAgIEBvcGVuVVJMOiAtPiBpZiBBYm91dC51cmw/IHRoZW4gb3BlbmVyIEFib3V0LnVybFxuXG5tb2R1bGUuZXhwb3J0cyA9IEFib3V0LnNob3dcbiJdfQ==
//# sourceURL=../coffee/about.coffee