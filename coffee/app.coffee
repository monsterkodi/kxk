###
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000        
###

{ args, prefs, watch, empty, valid, slash, about, post, childp, os, fs, kerror, klog, _ } = require './kxk'

class App
    
    constructor: (@opt) ->

        process.on 'uncaughtException' (err) ->
            srcmap = require './srcmap'    
            srcmap.logErr err, '🔻'
            true
        
        @watchers = []
            
        electron = require 'electron'
        @app = electron.app
        @userData = slash.userData()
        
        electron.Menu.setApplicationMenu @opt.menu
                
        if @opt.tray
            klog.slog.icon = slash.fileUrl @resolve @opt.tray  
            
        argl = """
            noprefs     don't load preferences      false
            devtools    open developer tools        false  -D
            watch       watch sources for changes   false
            """
            
        argl = @opt.args + '\n' + argl if @opt.args
        args = args.init argl
        
        onOther = (event, args, dir) =>
            
            if @opt.onOtherInstance
                @opt.onOtherInstance args, dir 
            else
                @showWindow()
        
        if @opt.single != false
            if @app.makeSingleInstance? 
                if @app.makeSingleInstance onOther
                    @app.quit()
                    return
            else if @app.requestSingleInstanceLock? 
                if @app.requestSingleInstanceLock()
                    @app.on 'second-instance' onOther
                else
                    @app.quit()
                    return
        
        post.on 'showAbout' @showAbout
        post.on 'quitApp'   @quitApp

        @app.setName @opt.pkg.name
        @app.on 'ready' @onReady
        @app.on 'activate' @onActivate
        @app.on 'window-all-closed' (event) => 
            if not @opt.singleWindow
                event.preventDefault()        
            else
                @quitApp()
        
    resolve: (file) => slash.resolve slash.join @opt.dir, file
    
    # 00000000   00000000   0000000   0000000    000   000
    # 000   000  000       000   000  000   000   000 000
    # 0000000    0000000   000000000  000   000    00000
    # 000   000  000       000   000  000   000     000
    # 000   000  00000000  000   000  0000000       000
    
    onReady: =>
    
        if @opt.tray then @initTray()
         
        @hideDock()
         
        @app.setName @opt.pkg.name
    
        if not args.noprefs
            sep = @opt.prefsSeperator ? ':'
            if @opt.shortcut
                prefs.init separator:sep, defaults:shortcut:@opt.shortcut
            else
                prefs.init separator:sep
    
        if valid prefs.get 'shortcut'
            electron = require 'electron'
            electron.globalShortcut.register prefs.get('shortcut'), @opt.onShortcut ? @showWindow
             
        if args.watch
            klog 'App.onReady startWatcher'
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
        @tray = new electron.Tray trayImg
        @tray.on 'click' @toggleWindowFromTray
        
        if os.platform() != 'darwin'
            template = [
                label: "Quit"
                click: @quitApp
            ,
                label: "About"
                click: @showAbout
            ,
                label: "Activate"
                click: @toggleWindowFromTray
            ]
            @tray.setContextMenu electron.Menu.buildFromTemplate template
            
    #  0000000   0000000     0000000   000   000  000000000  
    # 000   000  000   000  000   000  000   000     000     
    # 000000000  0000000    000   000  000   000     000     
    # 000   000  000   000  000   000  000   000     000     
    # 000   000  0000000     0000000    0000000      000     
    
    showAbout: =>
        
        dark = 'dark' == prefs.get 'scheme' 'dark'
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
        if @opt.saveBounds != false
            @saveBounds()
        prefs.save()
        
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
       
    onActivate: (event, hasVisibleWindows) => 
        
        
        if @opt.onActivate
            if @opt.onActivate event, hasVisibleWindows
                return
                
        if not hasVisibleWindows
            @showWindow()
                
    showWindow: =>

        @opt.onWillShowWin?()
        
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
    
    createWindow: (onReadyToShow) =>
    
        electron = require 'electron'
        
        onReadyToShow ?= @opt.onWinReady
        
        if @opt.saveBounds != false
            bounds = prefs.get 'bounds'
            
        width  = bounds?.width  ? @opt.width  ? 500
        height = bounds?.height ? @opt.height ? 500
        
        @win = new electron.BrowserWindow
            width:              width
            height:             height
            minWidth:           @opt.minWidth           ? 250
            minHeight:          @opt.minHeight          ? 250
            backgroundColor:    @opt.backgroundColor    ? '#181818'
            frame:              @opt.frame              ? false
            transparent:        @opt.transparent        ? false
            fullscreen:         @opt.fullscreen         ? false
            fullscreenenable:   @opt.fullscreenenable   ? true
            acceptFirstMouse:   @opt.acceptFirstMouse   ? true
            resizable:          @opt.resizable          ? true
            maximizable:        @opt.maximizable        ? true
            minimizable:        @opt.minimizable        ? true
            closable:           @opt.closable           ? true
            autoHideMenuBar:    true
            thickFrame:         false
            show:               false
            icon:               @resolve @opt.icon 
            webPreferences: 
                webSecurity:    false
                nodeIntegration: true
    
        @win.setPosition bounds.x, bounds.y if bounds?
    
        if @opt.indexURL
            @win.loadURL @opt.index, baseURLForDataURL:@opt.indexURL
        else
            @win.loadURL slash.fileUrl @resolve @opt.index
        
        @win.webContents.openDevTools(mode:'detach') if args.devtools
        if @opt.saveBounds != false
            @win.setPosition bounds.x, bounds.y if bounds?
            @win.on 'resize' @saveBounds
            @win.on 'move'   @saveBounds
        @win.on 'closed' => @win = null
        @win.on 'close'  => @hideDock()
        @win.on 'ready-to-show' (event) => 
            win = event.sender
            onReadyToShow? win 
            win.show() 
            post.emit 'winReady' win.id
        @showDock()
                
        @win

    saveBounds: => if @win? then prefs.set 'bounds' @win.getBounds()
    screenSize: -> 
        electron = require 'electron'
        electron.screen.getPrimaryDisplay().workAreaSize
    
    # 000   000   0000000   000000000   0000000  000   000  00000000  00000000     
    # 000 0 000  000   000     000     000       000   000  000       000   000    
    # 000000000  000000000     000     000       000000000  0000000   0000000      
    # 000   000  000   000     000     000       000   000  000       000   000    
    # 00     00  000   000     000      0000000  000   000  00000000  000   000    
        
    startWatcher: =>
        
        @opt.dir = slash.resolve @opt.dir
        klog 'startWatcher' @opt.dir
        watcher = watch.dir @opt.dir
        watcher.on 'change' @onSrcChange
        watcher.on 'error' (err) -> error err
        @watchers.push watcher
        
        return if empty @opt.dirs
        
        klog 'startWatchers' @opt.dirs
        for dir in @opt.dirs
            watcher = watch.dir slash.resolve slash.join @opt.dir, dir
            watcher.on 'change' @onSrcChange
            watcher.on 'error' (err) -> error err
            @watchers.push watcher 
    
    stopWatcher: =>
         
        return if empty @watchers
        for watcher in @watchers
            watcher.close()
        @watchers = []
    
    onSrcChange: (info) =>
    
        # log "onSrcChange '#{info.change}'", info.path
        if slash.base(info.path) == 'main'
            @stopWatcher()
            @app.exit 0
            if pkg = slash.pkg @opt.dir
                if slash.isDir slash.join pkg, 'node_modules'
                    childp.execSync "#{pkg}/node_modules/.bin/electron . -w",
                        cwd:      pkg
                        encoding: 'utf8'
                        stdio:    'inherit'
                        shell:    true
                    process.exit 0
                    return
        post.toWins 'menuAction' 'Reload'
             
module.exports = App
    