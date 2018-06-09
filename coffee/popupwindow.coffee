###
00000000    0000000   00000000   000   000  00000000   000   000  000  000   000  
000   000  000   000  000   000  000   000  000   000  000 0 000  000  0000  000  
00000000   000   000  00000000   000   000  00000000   000000000  000  000 0 000  
000        000   000  000        000   000  000        000   000  000  000  0000  
000         0000000   000         0000000   000        00     00  000  000   000  
###

{ keyinfo, slash, elem, _ } = require './kxk'

class PopupWindow
    
    @win   = null
    @opt   = null
    @popup = null
    
    #  0000000  000   000   0000000   000   000  
    # 000       000   000  000   000  000 0 000  
    # 0000000   000000000  000   000  000000000  
    #      000  000   000  000   000  000   000  
    # 0000000   000   000   0000000   00     00  
    
    @show: (opt) ->
        
        electron = require 'electron'
        
        PopupWindow.opt = opt        
        
        popupOpt = 
            winID: electron.remote.getCurrentWindow().id
            items:[]
        for item in opt.items
            if not item.hide
                popupOpt.items.push
                    text: item.text
                    combo: item.combo
        
        remote   = electron.remote
        Browser  = remote.BrowserWindow
        
        electron.ipcRenderer.on 'popupItem', PopupWindow.onPopupItem
        electron.ipcRenderer.on 'popupClose', PopupWindow.close
        
        if PopupWindow.win?
            PopupWindow.win.setPosition opt.x, opt.y
        else
            win = new Browser
                x:               opt.x
                y:               opt.y
                backgroundColor: opt.background ? '#222'
                hasShadow:       true
                show:            false
                frame:           false
                resizable:       false
                minimizable:     false
                maximizable:     false
                fullscreenable:  false
                webPreferences:
                    webSecurity: false
                width:           240
                height:          popupOpt.items.length * 28
                
            # html = """
                # <link rel='stylesheet' href="#{slash.fileUrl opt.stylesheet}" type='text/css'>
                # <body>
                # <script>
                    # var PopupWindow = require("#{slash.path __dirname}/popupWindow");
                    # new PopupWindow(#{JSON.stringify popupOpt});
                # </script>
                # </body>
            # """
            # win.loadURL "data:text/html;charset=utf-8," + encodeURI html
    
            win.on 'blur', PopupWindow.close
            # win.on 'ready-to-show', -> 
                # win.show()
                # win.webContents.openDevTools()
                
            PopupWindow.win = win
            
        html = """
            <link rel='stylesheet' href="#{slash.fileUrl opt.stylesheet}" type='text/css'>
            <body>
            <script>
                var PopupWindow = require("#{slash.path __dirname}/popupWindow");
                new PopupWindow(#{JSON.stringify popupOpt});
            </script>
            </body>
        """
        PopupWindow.win.loadURL "data:text/html;charset=utf-8," + encodeURI html
        PopupWindow.win.webContents.on 'did-finish-load', ->
            PopupWindow.win.show()
            
        PopupWindow.win

    @onPopupItem: (e,text) -> 
        
        PopupWindow.close()
        for item in PopupWindow.opt.items
            if item.text == text
                item.cb?()
                break
        
    @close: -> 
        
        electron = require 'electron'
        electron.ipcRenderer.removeListener 'popupItem',  PopupWindow.onPopupItem
        electron.ipcRenderer.removeListener 'popupClose', PopupWindow.close
        
        PopupWindow.win?.hide()

    # 00000000    0000000   00000000   000   000  00000000   
    # 000   000  000   000  000   000  000   000  000   000  
    # 00000000   000   000  00000000   000   000  00000000   
    # 000        000   000  000        000   000  000        
    # 000         0000000   000         0000000   000        
    
    constructor: (opt) ->
        
        @items = elem class: 'popupWindow', tabindex: 1
        @targetWinID = opt.winID
        for item in opt.items
            continue if item.hide
            div = elem class: 'popupItem', text: item.text
            div.item = item
            div.addEventListener 'click', @onClick
            if item.combo?
                combo = elem 'span', class: 'popupCombo', text: item.combo
                div.appendChild combo
            @items.appendChild div

        @select @items.firstChild

        (opt.parent ? document.body).appendChild @items

        @items.addEventListener 'keydown',   @onKeyDown
        @items.addEventListener 'focusout',  @onFocusOut
        @items.addEventListener 'mouseover', @onHover
        @items.focus()

        @getWin().setSize parseInt(@items.getBoundingClientRect().width),
                          parseInt(@items.getBoundingClientRect().height)
        
    close: =>
        
        electron = require 'electron'
        @items?.removeEventListener 'keydown',   @onKeyDown
        @items?.removeEventListener 'focusout',  @onFocusOut
        @items?.removeEventListener 'mouseover', @onHover
        @items?.remove()
        delete @items
        targetWin = electron.remote.BrowserWindow.fromId @targetWinID
        targetWin.webContents.send 'popupClose'

    getWin: -> require('electron').remote.getCurrentWindow()

    select: (item) -> 
        return if not item?
        @selected?.classList.remove 'selected'
        @selected = item
        @selected.classList.add 'selected'
        
    activate: (item) ->
        electron = require 'electron'
        targetWin = electron.remote.BrowserWindow.fromId @targetWinID
        targetWin.webContents.send 'popupItem', item.item.ipc ? item.item.text
        @close()
     
    onHover: (event) => @select event.target   
    
    onKeyDown: (event) =>
        
        electron = require 'electron'
        { mod, key, combo } = keyinfo.forEvent event
        switch combo
            when 'end', 'page down' then return @select @items.lastChild
            when 'home', 'page up'  then return @select @items.firstChild
            when 'enter'            then return @activate @selected
            when 'esc', 'space'     then return @close()
            when 'down'             then return @select @selected?.nextSibling ? @items.firstChild 
            when 'up'               then return @select @selected?.previousSibling ? @items.lastChild 
            when 'right'            then return @select @selected?.nextSibling
            when 'left'             then return @select @selected?.previousSibling
        return if key.length < 1
        targetWin = electron.remote.BrowserWindow.fromId @targetWinID
        targetWin.webContents.send 'popupModKeyCombo', mod, key, combo
        @close()
     
    onClick: (e) => @activate e.target

module.exports = PopupWindow
