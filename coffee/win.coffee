###
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000  
###

{ $, _, empty, keyinfo, klog, kpos, open, popup, post, prefs, scheme, slash, stopEvent, title, valid } = require './kxk'

if process.type == 'renderer'
    electron = require 'electron'
else
    error "this should be used in renderer process only! process.type: #{process.type} grandpa: #{module.parent.parent?.filename} parent: #{module.parent.filename} module: #{module.filename}"

class Win
    
    @: (@opt) ->
        
        window.onerror = (msg, source, line, col, error) ->
            
            try
                error 'window.onerror' msg, source, line, col
            catch err
                console.log 'dafuk?' err
            # srcmap.logErr err
            true
        
        sep = @opt.prefsSeperator ? '▸'
        prefs.init separator:sep
        
        if @opt.icon
            klog.slog.icon = slash.fileUrl slash.join @opt.dir, @opt.icon
               
        @id = window.winID = electron.ipcRenderer.sendSync 'getWinID'
        window.win = @

        @modifiers = ''

        @userData = post.get 'userData'
        
        # klog 'kxk.Win id' @id, 'userData' @userData
        
        post.on 'menuAction' @onMenuAction
        post.on 'winMoved'   @onMoved
        
        @opt.title ?= process.argv[0].endsWith('Electron Helper') and ['version'] or []
        
        window.titlebar = new title @opt
        
        if @opt.context != false
            document.body.addEventListener 'contextmenu' @onContextMenu
        
        if not @opt.nokeys
            document.addEventListener 'keydown' @onKeyDown
            document.addEventListener 'keyup'   @onKeyUp
        
        if @opt.scheme != false
            scheme.set prefs.get 'scheme' 'dark'
            
        # if _.isFunction @opt.onShow
            # onShow = => @opt.onShow(); @win.removeListener 'ready-to-show' onShow
            # @win.on 'ready-to-show' onShow
        # else
            # @win.on 'ready-to-show' => @win.show()

        # if _.isFunction @opt.onLoad
            # onLoad = => @opt.onLoad(); @win.webContents.removeListener 'did-finish-load' onLoad
            # @win.webContents.on 'did-finish-load' onLoad
            
    getBounds:     -> electron.ipcRenderer.sendSync 'getWinBounds'
    setBounds: (b) -> electron.ipcRenderer.send 'setWinBounds' b
    onMoved:       =>
        
    # 00     00  00000000  000   000  000   000   0000000    0000000  000000000  000   0000000   000   000  
    # 000   000  000       0000  000  000   000  000   000  000          000     000  000   000  0000  000  
    # 000000000  0000000   000 0 000  000   000  000000000  000          000     000  000   000  000 0 000  
    # 000 0 000  000       000  0000  000   000  000   000  000          000     000  000   000  000  0000  
    # 000   000  00000000  000   000   0000000   000   000   0000000     000     000   0000000   000   000  
    
    onMenuAction: (action, args) =>

        # klog 'kxk.win.onMenuAction' action
        
        switch action
            when 'Preferences' then return open prefs.store.file
          
        electron.ipcRenderer.send 'menuAction' action
        'unhandled'

    #  0000000   0000000   000   000  000000000  00000000  000   000  000000000  
    # 000       000   000  0000  000     000     000        000 000      000     
    # 000       000   000  000 0 000     000     0000000     00000       000     
    # 000       000   000  000  0000     000     000        000 000      000     
    #  0000000   0000000   000   000     000     00000000  000   000     000     
    
    onContextMenu: (event) =>

        @win?.focus()
        
        absPos = kpos event
        if not absPos?
            absPos = kpos $("#main").getBoundingClientRect().left, $("#main").getBoundingClientRect().top
        
        items = _.clone window.titlebar.menuTemplate()
        
        if _.isFunction @opt.context
            items = @opt.context items
            if empty items 
                return
        else
            items.unshift text:'Clear' accel:'cmdctrl+k'
        
        popup.menu
            items:   items
            x:       absPos.x
            y:       absPos.y
            onClose: -> post.emit 'contextClosed'
    
    openFileDialog: (title:'Open File', defaultPath:, properties:, cb:) ->
        
        post.toMain 'openFileDialog' title:title, defaultPath:defaultPath, properties:properties
        if _.isFunction cb then post.once 'openFileDialogResult' (r) -> if not r.cancelled and valid r.filePaths then cb r.filePaths
        
    saveFileDialog: (title:'Save File', defaultPath:, cb:) ->      
        
        post.toMain 'saveFileDialog' title:title, defaultPath:defaultPath
        if _.isFunction cb then post.once 'saveFileDialogResult' (r) -> klog 'r' r; if not r.cancelled and valid r.filePath then cb r.filePath

    messageBox: (
            type:       'warning'
            buttons:    ['Ok']
            defaultId:  0
            cancelId:   0
            title:      ''
            message:    'no message!'
            detail:     'no details!'
            cb: 
            ) ->
                        
        options = arguments[0]
        cb = options.cb
        delete options.cb
        post.toMain 'messageBox' options
        if _.isFunction cb then post.once 'messageBoxResult' (r) -> cb r
            
    # 000   000  00000000  000   000
    # 000  000   000        000 000
    # 0000000    0000000     00000
    # 000  000   000          000
    # 000   000  00000000     000
    
    onKeyDown: (event) =>
        
        return stopEvent(event) if 'unhandled' != window.titlebar.handleKey event, true
    
        info = keyinfo.forEvent event
        @modifiers = info.mod
        
        info.event = event
        post.emit 'combo' info.combo, info
    
    onKeyUp: (event) =>
        
        info = keyinfo.forEvent event
        @modifiers = info.mod 
        
module.exports = Win
