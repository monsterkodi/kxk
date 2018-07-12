###
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000  
###

{ post, keyinfo, title, scheme, stopEvent, prefs, slash, elem, empty, valid, popup, pos, str, fs, log, $, _ } = require './kxk'

class Win
    
    constructor: (@opt) ->
        
        window.onerror = (msg, source, line, col, err) ->
            
            srcmap = require './srcmap'
            srcmap.logErr err
            true
        
        prefs.init()
        
        if @opt.icon
            log.slog.icon = slash.fileUrl slash.join @opt.dir, @opt.icon
        
        electron = require 'electron'
        
        @win = window.win = electron.remote.getCurrentWindow()
        @id  = window.winID = @win.id
        
        @modifiers = ''

        @userData = slash.userData()
        
        post.on 'menuAction', @onMenuAction
        
        window.titlebar = new title @opt
        
        document.body.addEventListener 'contextmenu', @onContextMenu
        
        document.addEventListener 'keydown', @onKeyDown
        document.addEventListener 'keyup',   @onKeyUp
        
        if @opt.scheme != false
            scheme.set prefs.get 'scheme', 'dark'
            
        if _.isFunction @opt.onShow
            @win.on 'ready-to-show', @opt.onShow

    # 0000000   0000000  00000000   00000000  00000000  000   000   0000000  000   000   0000000   000000000
    #000       000       000   000  000       000       0000  000  000       000   000  000   000     000
    #0000000   000       0000000    0000000   0000000   000 0 000  0000000   000000000  000   000     000
    #     000  000       000   000  000       000       000  0000       000  000   000  000   000     000
    #0000000    0000000  000   000  00000000  00000000  000   000  0000000   000   000   0000000      000
    
    screenshot: ->
    
        @win.capturePage (img) =>
            file = slash.resolve "~/Desktop/#{@opt.pkg.name}-screenshot.png"
            fs.writeFile file, img.toPNG(), (err) ->
                if valid err
                    log 'saving screenshot failed', err
                else
                    log "screenshot saved to #{file}"
            
    # 00     00  00000000  000   000  000   000   0000000    0000000  000000000  000   0000000   000   000  
    # 000   000  000       0000  000  000   000  000   000  000          000     000  000   000  0000  000  
    # 000000000  0000000   000 0 000  000   000  000000000  000          000     000  000   000  000 0 000  
    # 000 0 000  000       000  0000  000   000  000   000  000          000     000  000   000  000  0000  
    # 000   000  00000000  000   000   0000000   000   000   0000000     000     000   0000000   000   000  
    
    onMenuAction: (action, args) =>
        
        switch action
            when 'Screenshot' then @screenshot()
            when 'About'      then post.toMain 'showAbout'
            when 'Save'       then post.toMain 'saveBuffer'
            when 'Quit'       then post.toMain 'quitApp'

    #  0000000   0000000   000   000  000000000  00000000  000   000  000000000  
    # 000       000   000  0000  000     000     000        000 000      000     
    # 000       000   000  000 0 000     000     0000000     00000       000     
    # 000       000   000  000  0000     000     000        000 000      000     
    #  0000000   0000000   000   000     000     00000000  000   000     000     
    
    onContextMenu: (event) =>
        
        absPos = pos event
        if not absPos?
            absPos = pos $("#main").getBoundingClientRect().left, $("#main").getBoundingClientRect().top
        
        items = _.clone window.titlebar.menuTemplate()
        if _.isFunction @opt.context
            items = @opt.context items
        else
            items.unshift text:'Clear', accel:'ctrl+k'
            
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
        
        if info.combo
            info.event = event
            post.emit 'combo', info.combo, info
    
    onKeyUp: (event) =>
        
        info = keyinfo.forEvent event
        @modifiers = info.mod 
        
module.exports = Win
