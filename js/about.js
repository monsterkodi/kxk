// monsterkodi/kode 0.217.0

var _k_

class About
{
    static win = null

    static url = null

    static opt = null

    static show (opt)
    {
        var Browser, electron, html, ipc, url, version, win, _1_25_, _1_9_, _28_29_, _29_24_, _29_39_, _29_44_, _29_56_, _36_38_, _36_51_, _47_38_, _47_45_, _48_38_, _48_45_, _56_27_, _56_37_, _56_48_, _56_53_

        About.opt = opt
        electron = require('electron')
        electron.protocol.registerFileProtocol('file',function (request, callback)
        {
            return callback(decodeURI(request.url.replace('file:///','')))
        })
        Browser = electron.BrowserWindow
        ipc = electron.ipcMain
        About.url = (About.opt != null ? About.opt.url : undefined)
        if (!(About.url != null) && ((_29_39_=About.opt) != null ? (_29_44_=_29_39_.pkg) != null ? (_29_56_=_29_44_.repository) != null ? _29_56_.url : undefined : undefined : undefined))
        {
            url = About.opt.pkg.repository.url
            if (url.startsWith("git+"))
            {
                url = url.slice(4)
            }
            if (url.endsWith(".git"))
            {
                url = url.slice(0,url.length - 4)
            }
            About.url = url
        }
        win = new Browser({backgroundColor:((_36_51_=(About.opt != null ? About.opt.background : undefined)) != null ? _36_51_ : '#111'),preloadWindow:true,center:true,hasShadow:true,alwaysOnTop:true,resizable:false,frame:false,show:false,fullscreenable:false,minimizable:false,maximizable:false,width:((_47_45_=(About.opt != null ? About.opt.size : undefined)) != null ? _47_45_ : 300),height:((_48_45_=(About.opt != null ? About.opt.size : undefined)) != null ? _48_45_ : 300),webPreferences:{webSecurity:false,contextIsolation:false,nodeIntegration:true,enableRemoteModule:true,nodeIntegrationInWorker:true}})
        version = ((_56_37_=(About.opt != null ? About.opt.version : undefined)) != null ? _56_37_ : ((_56_48_=About.opt) != null ? (_56_53_=_56_48_.pkg) != null ? _56_53_.version : undefined : undefined))
        html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <style type="text/css">
            body {
                overflow:      hidden;
                -webkit-user-select: none;
            }
            .about {
                text-align:    center;
                cursor:        pointer;
                outline-width: 0;
                overflow:      hidden;
            }
            .image {
                position:      absolute;
                height:        70%;
                max-height:    70%;
                left:          50%;
                top:           50%;
                transform:     translate(-50%, -50%);
            }
            .version {
                position:       absolute;
                bottom:         ${((_1_25_=(About.opt != null ? About.opt.versionOffset : undefined)) != null ? _1_25_ : '7%')};
                left:           0;
                right:          0;
                text-align:     center;
                font-family:    Verdana, sans-serif;
                text-decoration: none;
                color:          rgb(50, 50, 50);
            }
            .version:hover {
                color:          rgb(205, 205, 205);
            }
        </style>
    </head>
    <body>
        <div class='about' id='about' tabindex=0>
            <img class='image' src="file://${About.opt.img}"/>
            <div id='version' class='version'>
                ${version}
            </div>
        </div>
        <script>
            var electron = require('electron');
            var ipc = electron.ipcRenderer;
            var l = document.getElementById('version');
            l.onclick   = function () { ipc.send('openURL'); }
            var a = document.getElementById('about');
            a.onclick   = function () { ipc.send('closeAbout'); }
            a.onblur    = function () { ipc.send('blurAbout');  }
            a.onkeydown = function () { ipc.send('closeAbout'); }
            a.focus()                    
        </script>
    </body>
</html>`
        ipc.on('openURL',About.openURL)
        ipc.on('closeAbout',About.closeAbout)
        ipc.on('blurAbout',About.blurAbout)
        win.loadURL("data:text/html;charset=utf-8," + encodeURI(html))
        win.on('ready-to-show',function ()
        {
            var _125_24_

            win.show()
            if ((About.opt != null ? About.opt.debug : undefined))
            {
                return win.openDevTools({mode:'detach'})
            }
        })
        About.win = win
        return win
    }

    static blurAbout ()
    {
        var _133_24_

        if (!(About.opt != null ? About.opt.debug : undefined))
        {
            return About.closeAbout()
        }
    }

    static closeAbout ()
    {
        var electron, ipc, _142_17_

        electron = require('electron')
        ipc = electron.ipcMain
        ipc.removeAllListeners('openURL')
        ipc.removeAllListeners('closeAbout')
        ;(About.win != null ? About.win.close() : undefined)
        return About.win = null
    }

    static openURL ()
    {
        var opener, _148_20_

        opener = require('opener')
        if ((About.url != null))
        {
            return opener(About.url)
        }
    }
}

module.exports = About.show