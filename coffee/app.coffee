###
 0000000   00000000   00000000   
000   000  000   000  000   000  
000000000  00000000   00000000   
000   000  000        000        
000   000  000        000        
###

{ args, prefs, empty, slash, about, karg, post, watch, childp, fs, log, error, _ } = require './kxk'


class App
    
    constructor: (@opt) ->
        
        log 'App.constructor', @opt

        @watcher = null
            
        electron = require 'electron'
        @app = electron.app
        if app.makeSingleInstance @showWindow
            app.quit()
            return
        
        if @opt.args
            
            args = args.init @opt.args
            
        post.on 'showAbout', @showAbout
        post.on 'quitApp',   @quitApp

        app.setName @opt.pkg.name
        app.on 'ready', @onReady
        app.on 'window-all-closed', (event) -> event.preventDefault()

    #00000000   00000000   0000000   0000000    000   000
    #000   000  000       000   000  000   000   000 000
    #0000000    0000000   000000000  000   000    00000
    #000   000  000       000   000  000   000     000
    #000   000  00000000  000   000  0000000       000
    
    onReady: =>
    
        if @opt.tray then @initTray()
         
        @app.dock?.hide()
         
        @app.setName @opt.pkg.name
    
        if not args.noprefs
            prefs.init
                shortcut: @opt.shortcut
    
        electron = require 'electron'
        electron.globalShortcut.register prefs.get('shortcut'), @showWindow
    
        @showWindow()
         
        if args.watch
            @startWatcher()        

    initTray: =>
        
        log 'initTray', slash.resolve slash.join @opt.dir, @opt.tray
        
        electron = require 'electron'
        @tray = new electron.Tray slash.resolve slash.join @opt.dir, @opt.tray
        @tray.on 'click', @toggleWindow
             
        @tray.setContextMenu electron.Menu.buildFromTemplate [
            label: "Quit"
            click: @quitApp
        ,
            label: "About"
            click: @showAbout
        ]
            
    showAbout: =>
        
        dark = 'dark' == prefs.get 'scheme', 'dark'
        about
            img:        slash.join @opt.dir, @opt.about
            color:      dark and '#383838' or '#ddd'
            background: dark and '#282828' or '#fff'
            highlight:  dark and '#fff'    or '#000'
            pkg:        @opt.pkg
    
    quitApp: =>
        
        log 'quitApp'
        @stopWatcher()
        @saveBounds()
        @app.exit 0
        process.exit 0
        
    #000   000  000  000   000  0000000     0000000   000   000
    #000 0 000  000  0000  000  000   000  000   000  000 0 000
    #000000000  000  000 0 000  000   000  000   000  000000000
    #000   000  000  000  0000  000   000  000   000  000   000
    #00     00  000  000   000  0000000     0000000   00     00
    
    toggleWindow: =>
         
        if @win?.isVisible()
            @win.hide()
            @app.dock?.hide()
        else
            @showWindow()
    
    showWindow: =>
         
        if @win?
            @win.show()
        else
            @createWindow()
        @app.dock?.show()

    createWindow: =>
    
        electron = require 'electron'
        @win = new electron.BrowserWindow
            width:           474
            height:          900
            minWidth:        474
            minHeight:       600
            backgroundColor: '#181818'
            fullscreen:      false
            show:            false
            frame:           false
            resizable:       true
            maximizable:     true
            minimizable:     true
            transparent:     true
            autoHideMenuBar: true
            icon:            slash.join @opt.dir, @opt.icon 
    
        bounds = prefs.get 'bounds'
        @win.setPosition bounds.x, bounds.y if bounds?
    
        @win.loadURL slash.fileUrl slash.join @opt.dir, @opt.index
        @win.webContents.openDevTools() if args.DevTools
        @win.on 'closed', => @win = null
        @win.on 'resize', @saveBounds
        @win.on 'move',   @saveBounds
        @win.on 'close',  => @app.dock?.hide()
        @win.on 'ready-to-show', => @win.show()
        @app.dock?.show()
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
    
        log 'onSrcChange', path
        if path == __filename
            @stopWatcher()
            @app.exit 0
            childp.execSync "#{@opt.dir}/../node_modules/.bin/electron . -w",
                cwd:      "#{@opt.dir}/.."
                encoding: 'utf8'
                stdio:    'inherit'
                shell:    true
            process.exit 0
        else
            post.toWins 'reload'
             
module.exports = App
    