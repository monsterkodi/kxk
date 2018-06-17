###
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000  
###

{ keyinfo, title, scheme, stopEvent, prefs, slash, post, elem, popup, pos, str, log, $, _ } = require './kxk'

class Win
    
    constructor: (@opt) ->
        
        window.onerror = (msg, source, line, col, err) ->
            
            srcmap = require './srcmap'
            console.log srcmap.errorStack err
            trace = srcmap.errorTrace err
            log.ulog str:trace.text, source:trace.lines[0].file, line:trace.lines[0].line, sep:'💥'
            for line in trace.lines
                sep = if slash.isAbsolute line.file then '🐞' else '🔼'
                log.ulog str:'       '+line.func, source:line.file, line:line.line, sep:sep
            true
        
        prefs.init()
        
        if @opt.icon
            log.slog.icon = slash.fileUrl slash.join @opt.dir, @opt.icon
        
        electron = require 'electron'
        @win = window.win = electron.remote.getCurrentWindow()
        @id  = window.winID = @win.id

        post.on 'menuAction', @onMenuAction
        
        window.titlebar = new title @opt
        
        document.body.addEventListener 'contextmenu', @onContextMenu
        
        document.addEventListener 'keydown', @onKeyDown
        
        if @opt.scheme != false
            scheme.set prefs.get 'scheme', 'dark'

    # 00     00  00000000  000   000  000   000   0000000    0000000  000000000  000   0000000   000   000  
    # 000   000  000       0000  000  000   000  000   000  000          000     000  000   000  0000  000  
    # 000000000  0000000   000 0 000  000   000  000000000  000          000     000  000   000  000 0 000  
    # 000 0 000  000       000  0000  000   000  000   000  000          000     000  000   000  000  0000  
    # 000   000  00000000  000   000   0000000   000   000   0000000     000     000   0000000   000   000  
    
    onMenuAction: (action, args) =>
        
        switch action
            when 'About' then post.toMain 'showAbout'
            when 'Save'  then post.toMain 'saveBuffer'
            when 'Quit'  then post.toMain 'quitApp'

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
        items.unshift text:'Clear', accel:'ctrl+k'
            
        popup.menu
            items:  items
            x:      absPos.x
            y:      absPos.y
    
    # 000   000  00000000  000   000
    # 000  000   000        000 000
    # 0000000    0000000     00000
    # 000  000   000          000
    # 000   000  00000000     000
    
    onKeyDown: (event) =>
    
        return stopEvent(event) if 'unhandled' != window.titlebar.handleKey event, true
        
        info = keyinfo.forEvent event
    
        if info.combo
            info.event = event
            post.emit 'combo', info.combo, info
    
module.exports = Win
