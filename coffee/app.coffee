###
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000        
###

{ args, prefs, empty, slash, about, post, watch, childp, fs, error, log, _ } = require './kxk'

class App
    
    constructor: (@opt) ->
        
        process.on 'uncaughtException', (err) ->
            # error 'main.uncaughtException'
            error err.message ? err
            try
                sutil = require 'stack-utils'
                stack = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()
                stackTrace = stack.captureString()
                console.log 'stackTrace', stackTrace.split('\n').length, stackTrace
                log stackTrace 
            catch err
                error err.message ? err
        
        @watcher = null
            
        electron = require 'electron'
        @app = electron.app
        @userData = @app.getPath 'userData'
        
        if @opt.tray
            log.slog.icon = slash.fileUrl @resolve @opt.tray  
        
        if @opt.single != false
            if @app.makeSingleInstance @showWindow
                @app.quit()
                return
    
        argl = """
            noprefs     don't load preferences      false
            devtools    open developer tools        false  -D
            watch       watch sources for changes   false
            """
            
        argl = @opt.args + '\n' + argl if @opt.args
        args = args.init argl
            
        post.on 'showAbout', @showAbout
        post.on 'quitApp',   @quitApp

        @app.setName @opt.pkg.name
        @app.on 'ready', @onReady
        @app.on 'window-all-closed', (event) -> event.preventDefault()        

    resolve: (file) => slash.resolve slash.join @opt.dir, file
    
    #00000000   00000000   0000000   0000000    000   000
    #000   000  000       000   000  000   000   000 000
    #0000000    0000000   000000000  000   000    00000
    #000   000  000       000   000  000   000     000
    #000   000  00000000  000   000  0000000       000
    
    onReady: =>
    
        if @opt.tray then @initTray()
         
        @hideDock()
         
        @app.setName @opt.pkg.name
    
        if not args.noprefs
            prefs.init
                shortcut: @opt.shortcut
    
        if not empty prefs.get 'shortcut' 
            electron = require 'electron'
            electron.globalShortcut.register prefs.get('shortcut'), @showWindow
             
        if args.watch
            @startWatcher()
        
        if @opt.onShow
            @opt.onShow()
        else
            @showWindow()

        post.emit 'appReady'

    # 000000000  00000000    0000000   000   000  
    #    000     000   000  000   000   000 000   
    #    000     0000000    000000000    00000    
    #    000     000   000  000   000     000     
    #    000     000   000  000   000     000     
    
    initTray: =>
        
        electron = require 'electron'
        trayImg = @resolve @opt.tray
        log 'trayImg', trayImg
        @tray = new electron.Tray trayImg
        @tray.on 'click', @toggleWindowFromTray
             
        @tray.setContextMenu electron.Menu.buildFromTemplate [
            label: "Quit"
            click: @quitApp
        ,
            label: "About"
            click: @showAbout
        ]
            
    #  0000000   0000000     0000000   000   000  000000000  
    # 000   000  000   000  000   000  000   000     000     
    # 000000000  0000000    000   000  000   000     000     
    # 000   000  000   000  000   000  000   000     000     
    # 000   000  0000000     0000000    0000000      000     
    
    showAbout: =>
        
        dark = 'dark' == prefs.get 'scheme', 'dark'
        about
            img:        @resolve @opt.about
            color:      dark and '#383838' or '#ddd'
            background: dark and '#282828' or '#fff'
            highlight:  dark and '#fff'    or '#000'
            pkg:        @opt.pkg
            debug:      @opt.aboutDebug
    
    #  0000000   000   000  000  000000000  
    # 000   000  000   000  000     000     
    # 000 00 00  000   000  000     000     
    # 000 0000   000   000  000     000     
    #  00000 00   0000000   000     000     
    
    quitApp: =>
        
        @stopWatcher()
        @saveBounds()
        
        if 'delay' != @opt.onQuit?()
            @exitApp()
            
    exitApp: =>
        
        @app.exit 0
        process.exit 0
        
    # 0000000     0000000    0000000  000   000  
    # 000   000  000   000  000       000  000   
    # 000   000  000   000  000       0000000    
    # 000   000  000   000  000       000  000   
    # 0000000     0000000    0000000  000   000  
    
    hideDock: => @app.dock?.hide()
    showDock: => @app.dock?.show()
        
    #000   000  000  000   000  0000000     0000000   000   000
    #000 0 000  000  0000  000  000   000  000   000  000 0 000
    #000000000  000  000 0 000  000   000  000   000  000000000
    #000   000  000  000  0000  000   000  000   000  000   000
    #00     00  000  000   000  0000000     0000000   00     00
    
    toggleWindow: =>
         
        if @win?.isVisible()
            @win.hide()
            @hideDock()
        else
            @showWindow()

    toggleWindowFromTray: => @showWindow()
            
    showWindow: =>
         
        if @win?
            @win.show()
        else
            @createWindow()
        @showDock()
        
    #  0000000  00000000   00000000   0000000   000000000  00000000  
    # 000       000   000  000       000   000     000     000       
    # 000       0000000    0000000   000000000     000     0000000   
    # 000       000   000  000       000   000     000     000       
    #  0000000  000   000  00000000  000   000     000     00000000  
    
    createWindow: =>
    
        electron = require 'electron'
        
        bounds = prefs.get 'bounds'
        width  = bounds?.width  ? @opt.width  ? 500
        height = bounds?.height ? @opt.height ? 500
        
        @win = new electron.BrowserWindow
            width:           width
            height:          height
            minWidth:        @opt.minWidth  ? 250
            minHeight:       @opt.minHeight ? 250
            backgroundColor: '#181818'
            fullscreen:      false
            show:            false
            frame:           false
            resizable:       true
            maximizable:     true
            minimizable:     true
            transparent:     true
            autoHideMenuBar: true
            icon:            @resolve @opt.icon 
    
        @win.setPosition bounds.x, bounds.y if bounds?
    
        @win.loadURL slash.fileUrl @resolve @opt.index
        @win.webContents.openDevTools() if args.devtools
        @win.on 'resize', @saveBounds
        @win.on 'move',   @saveBounds
        @win.on 'closed', => @win = null
        @win.on 'close',  => @hideDock()
        @win.on 'ready-to-show', (event) => 
            log 'event.sender', event?.sender
            log 'event.sender.id', event?.sender?.id
            @win.show(); post.emit 'winReady', @win.id
        @showDock()
        @win

    saveBounds: => if @win? then prefs.set 'bounds', @win.getBounds()

    # 000   000   0000000   000000000   0000000  000   000  00000000  00000000     
    # 000 0 000  000   000     000     000       000   000  000       000   000    
    # 000000000  000000000     000     000       000000000  0000000   0000000      
    # 000   000  000   000     000     000       000   000  000       000   000    
    # 00     00  000   000     000      0000000  000   000  00000000  000   000    
        
    startWatcher: =>
         
        @watcher = watch.watch @opt.dir
        @watcher.on 'change', @onSrcChange
        @watcher.on 'error', (err) -> error err
    
    stopWatcher: =>
         
        if @watcher?
            @watcher.close()
            @watcher = null
    
    onSrcChange: (path) =>
    
        log 'onSrcChange', path, @opt.dir, path.startsWith @opt.dir
        if slash.file(path) == 'main'
            @stopWatcher()
            @app.exit 0
            childp.execSync "#{@opt.dir}/../node_modules/.bin/electron . -w",
                cwd:      "#{@opt.dir}/.."
                encoding: 'utf8'
                stdio:    'inherit'
                shell:    true
            process.exit 0
        else
            post.toWins 'menuAction', 'Reload'
             
module.exports = App
    