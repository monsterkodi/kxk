# 00000000    0000000   00000000   000   000  00000000   000   000  000  000   000  
# 000   000  000   000  000   000  000   000  000   000  000 0 000  000  0000  000  
# 00000000   000   000  00000000   000   000  00000000   000000000  000  000 0 000  
# 000        000   000  000        000   000  000        000   000  000  000  0000  
# 000         0000000   000         0000000   000        00     00  000  000   000  
{
keyinfo, 
elem } = require './kxk'
_      = require 'lodash'

electron = require 'electron'

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
        PopupWindow.opt = opt
        popupOpt = _.clone opt
        for item in popupOpt
            delete item.cb
        
        remote   = electron.remote
        Browser  = remote.BrowserWindow
        
        electron.ipcRenderer.on 'popupItem', PopupWindow.onPopupItem
        
        win = new Browser
            parent:          opt.win
            backgroundColor: opt.background ? '#222'
            hasShadow:       true
            show:            false
            resizable:       false
            frame:           false
            fullscreenable:  false
            minimizable:     false
            maximizable:     false
            webPreferences:
                webSecurity: false
            minWidth:        opt.minWidth  ? 300
            minHeight:       opt.minHeight ? 300
            width:           300
            height:          300

        html = """
            <link rel='stylesheet' href="file://#{opt.stylesheet}" type='text/css'>
            <script>
                popupWindow = require("#{__dirname}/popupWindow");
                popupWindow.windowMain();
            </script>
        """

        win.webContents.on 'did-finish-load', ->
            win.webContents.send 'popup', popupOpt
         
        win.loadURL "data:text/html;charset=utf-8," + encodeURI html
            
        PopupWindow.win = win
        win

    @onPopupItem: (e,text) -> 
        
        for item in PopupWindow.opt.items
            if item.text == text
                item.cb?()
                break
        
        PopupWindow.close()
        
    @close: -> 
        
        electron.ipcRenderer.removeListener 'popupItem', PopupWindow.onPopupItem
        
        PopupWindow.win?.close()
        PopupWindow.win = null

    # 000   000  000  000   000  00     00   0000000   000  000   000  
    # 000 0 000  000  0000  000  000   000  000   000  000  0000  000  
    # 000000000  000  000 0 000  000000000  000000000  000  000 0 000  
    # 000   000  000  000  0000  000 0 000  000   000  000  000  0000  
    # 00     00  000  000   000  000   000  000   000  000  000   000  
    
    @windowMain: ->
        ipc = electron.ipcRenderer
        ipc.on 'popup', (e,opt) ->
            @popup = new PopupWindow opt 

    # 00000000    0000000   00000000   000   000  00000000   
    # 000   000  000   000  000   000  000   000  000   000  
    # 00000000   000   000  00000000   000   000  00000000   
    # 000        000   000  000        000   000  000        
    # 000         0000000   000         0000000   000        
    
    constructor: (opt) ->
        @items = elem class: 'popupWindow', tabindex: 3
        @items.style.left = "#{opt.x}px"
        @items.style.top  = "#{opt.y}px"
        
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
        
    close: =>
        @items?.removeEventListener 'keydown',   @onKeyDown
        @items?.removeEventListener 'focusout',  @onFocusOut
        @items?.removeEventListener 'mouseover', @onHover
        @items?.remove()
        delete @items
        @getWin()?.close()

    getWin: -> require('electron').remote.getCurrentWindow()

    select: (item) -> 
        return if not item?
        @selected?.classList.remove 'selected'
        @selected = item
        @selected.classList.add 'selected'
        
    activate: (item) ->
        @getWin().getParentWindow().webContents.send 'popupItem', item.item.ipc ? item.item.text
        @close()
     
    onHover: (event) => @select event.target   
    onKeyDown: (event) =>
        {mod, key, combo} = keyinfo.forEvent event
        switch combo
            when 'end', 'page down' then @select @items.lastChild
            when 'home', 'page up'  then @select @items.firstChild
            when 'enter'            then @activate @selected
            when 'esc', 'space'     then @close()
            when 'down'             then @select @selected?.nextSibling ? @items.firstChild 
            when 'up'               then @select @selected?.previousSibling ? @items.lastChild 
            when 'right'            then @select @selected?.nextSibling
            when 'left'             then @select @selected?.previousSibling
        event.stopPropagation()
     
    onClick: (e) => @activate e.target

module.exports = PopupWindow
