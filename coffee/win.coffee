###
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000  
###

{ post, stopEvent, keyinfo, scheme, prefs, slash, title, valid, empty, popup, klog, open, kpos, fs, $, _ } = require './kxk'

class Win
    
    @: (@opt) ->
        
        window.onerror = (msg, source, line, col, err) ->
            
            error 'window.onerror' msg, source, line, col
            srcmap = require './srcmap'
            srcmap.logErr err
            true
        
        sep = @opt.prefsSeperator ? ':'
        prefs.init separator:sep
        
        if @opt.icon
            klog.slog.icon = slash.fileUrl slash.join @opt.dir, @opt.icon
        
        electron = require 'electron'
        
        @win = window.win = electron.remote.getCurrentWindow()
        @id  = window.winID = @win.id
        
        @modifiers = ''

        @userData = slash.userData()
        
        post.on 'menuAction' @onMenuAction
        
        @opt.title ?= process.argv[0].endsWith('Electron Helper') and ['version'] or []
        
        window.titlebar = new title @opt
        
        if @opt.context != false
            document.body.addEventListener 'contextmenu' @onContextMenu
        
        if not @opt.nokeys
            document.addEventListener 'keydown' @onKeyDown
            document.addEventListener 'keyup'   @onKeyUp
        
        if @opt.scheme != false
            scheme.set prefs.get 'scheme' 'dark'
            
        if _.isFunction @opt.onShow
            onShow = => @opt.onShow(); @win.removeListener 'ready-to-show' onShow
            @win.on 'ready-to-show' onShow

        if _.isFunction @opt.onLoad
            onLoad = => @opt.onLoad(); @win.webContents.removeListener 'did-finish-load' onLoad
            @win.webContents.on 'did-finish-load' onLoad
            
    #  0000000   0000000  00000000   00000000  00000000  000   000   0000000  000   000   0000000   000000000
    # 000       000       000   000  000       000       0000  000  000       000   000  000   000     000
    # 0000000   000       0000000    0000000   0000000   000 0 000  0000000   000000000  000   000     000
    #      000  000       000   000  000       000       000  0000       000  000   000  000   000     000
    # 0000000    0000000  000   000  00000000  00000000  000   000  0000000   000   000   0000000      000
    
    screenshot: ->
    
        @win.capturePage (img) =>
            file = slash.resolve "~/Desktop/#{@opt.pkg.name}-screenshot.png"
            fs.writeFile file, img.toPNG(), (err) ->
                if valid err
                    klog 'saving screenshot failed', err
                else
                    klog "screenshot saved to #{file}"
            
    # 00     00  00000000  000   000  000   000   0000000    0000000  000000000  000   0000000   000   000  
    # 000   000  000       0000  000  000   000  000   000  000          000     000  000   000  0000  000  
    # 000000000  0000000   000 0 000  000   000  000000000  000          000     000  000   000  000 0 000  
    # 000 0 000  000       000  0000  000   000  000   000  000          000     000  000   000  000  0000  
    # 000   000  00000000  000   000   0000000   000   000   0000000     000     000   0000000   000   000  
    
    onMenuAction: (action, args) =>

        switch action
            when 'Screenshot'  then @screenshot()
            when 'Preferences' then open prefs.store.file
            when 'About'       then post.toMain 'showAbout'
            when 'Save'        then post.toMain 'saveBuffer'
            when 'Quit'        then post.toMain 'quitApp'

    #  0000000   0000000   000   000  000000000  00000000  000   000  000000000  
    # 000       000   000  0000  000     000     000        000 000      000     
    # 000       000   000  000 0 000     000     0000000     00000       000     
    # 000       000   000  000  0000     000     000        000 000      000     
    #  0000000   0000000   000   000     000     00000000  000   000     000     
    
    onContextMenu: (event) =>

        @win.focus()
        
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
