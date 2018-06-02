###
 0000000   0000000     0000000   000   000  000000000
000   000  000   000  000   000  000   000     000
000000000  0000000    000   000  000   000     000
000   000  000   000  000   000  000   000     000
000   000  0000000     0000000    0000000      000
###

opener = require 'opener'

class About

    @win = null
    @url = null
    @opt = null

    @show: (opt) ->

        About.opt = opt
        electron  = require 'electron'
        Browser   = electron.BrowserWindow
        ipc       = electron.ipcMain

        About.url = About.opt?.url
        if not About.url? and About.opt?.pkg?.repository?.url
            url = About.opt.pkg.repository.url
            url = url.slice 4 if url.startsWith "git+"
            url = url.slice 0, url.length-4 if url.endsWith ".git"
            About.url = url

        win = new Browser
            backgroundColor: About.opt?.background ? '#222'
            preloadWindow:   true
            center:          true
            hasShadow:       true
            alwaysOnTop:     true
            resizable:       false
            frame:           false
            show:            false
            fullscreenable:  false
            minimizable:     false
            maximizable:     false
            webPreferences:
                webSecurity: false
            width:           About.opt?.size ? 300
            height:          About.opt?.size ? 300

        version = About.opt?.version ? About.opt?.pkg?.version
        html = """
            <style type="text/css">
                body {
                    overflow:      hidden;
                    -webkit-user-select: none;
                }
                #about {
                    text-align:    center;
                    cursor:        pointer;
                    outline-width: 0;
                    overflow:      hidden;
                }

                #image {
                    position:      absolute;
                    height:        70%;
                    max-height:    70%;
                    left:          50%;
                    top:           50%;
                    transform:     translate(-50%, -50%);
                }

                #version {
                    position: absolute;
                    bottom:         #{About.opt?.versionOffset  ? '7%'};
                    left:           0;
                    right:          0;
                    text-align:     center;
                    color:          #{About.opt?.color ? '#333'};
                    font-family:    Verdana, sans-serif;
                    text-decoration: none;
                }

                #version:hover {
                    color:          #{About.opt?.highlight ? '#f80'};
                }

            </style>
            <div id='about' tabindex=0>
                <img id='image' src="file://#{About.opt.img}"/>
                <div id='version'>
                    #{version}
                </div>
            </div>
            <script>
                var electron = require('electron');
                var ipc = electron.ipcRenderer;
                var l = document.getElementById('version');
                l.onclick   = function () { ipc.send('openURL'); }
                var a = document.getElementById('about');
                a.onclick   = function () { ipc.send('closeAbout'); }
                a.onkeydown = function () { ipc.send('closeAbout'); }
                a.onblur    = function () { ipc.send('blurAbout'); }
                a.focus()
            </script>
        """

        ipc.on 'openURL',    About.openURL
        ipc.on 'closeAbout', About.closeAbout
        ipc.on 'blurAbout',  About.blurAbout

        win.loadURL "data:text/html;charset=utf-8," + encodeURI(html)
        win.on 'ready-to-show', -> 
            win.show()
            if About.opt?.debug
                win.openDevTools()
                
        About.win = win
        win

    @blurAbout: ->
        
        if not About.opt?.debug
            About.closeAbout()
    
    @closeAbout: ->
        
        electron = require 'electron'
        ipc      = electron.ipcMain
        ipc.removeAllListeners 'openURL'
        ipc.removeAllListeners 'closeAbout'
        About.win?.close()
        About.win = null

    @openURL: -> if About.url? then opener About.url

module.exports = About.show
