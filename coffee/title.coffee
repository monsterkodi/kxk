###
000000000  000  000000000  000      00000000
   000     000     000     000      000     
   000     000     000     000      0000000 
   000     000     000     000      000     
   000     000     000     0000000  00000000
###

{ elem, sds, slash, empty, post, keyinfo, menu, noon, log, $, _ } = require './kxk'

class Title
    
    constructor: (cfg) ->

        post.on 'titlebar',   @onTitlebar
        post.on 'menuAction', @onMenuAction
        
        @cfg = cfg
        @cfg ?= {}
        
        pkg = @cfg.pkg
        
        @elem =$ cfg.elem ? "#titlebar"
        @elem.ondblclick = (event) -> post.toMain 'maximizeWindow', window.winID
                
        @winicon = elem class: 'winicon'
        @winicon.appendChild elem 'img', src:slash.fileUrl @cfg.icon
        @elem.appendChild @winicon
        @winicon.addEventListener 'click', -> post.emit 'menuAction', 'Open Menu'   
        
        @title = elem class: 'titlebar-title'
        html  = "<span class='titlebar-name'>#{pkg.name}</span>"
        html += "<span class='titlebar-dot'> ● </span>"
        html += "<span class='titlebar-version'>#{pkg.version}</span>"
        @title.innerHTML = html
        @title.ondblclick = => post.toMain 'toggleMaximize'
        @elem.appendChild @title
                
        # — ◻ 🞩
        @minimize = elem class: 'winbutton minimize gray'
        
        @minimize.innerHTML = """
            <svg width="100%" height="100%" viewBox="-10 -8 30 30">
                <line x1="-1" y1="5" x2="11" y2="5"></line>
            </svg>
        """
        
        @elem.appendChild @minimize
        @minimize.addEventListener 'click', -> post.emit 'menuAction', 'Minimize'
        
        @maximize = elem class: 'winbutton maximize gray'
        
        @maximize.innerHTML = """
            <svg width="100%" height="100%" viewBox="-10 -9 30 30">
              <rect width="11" height="11" style="fill-opacity: 0;"></rect>
            </svg>
        """
        @elem.appendChild @maximize
        @maximize.addEventListener 'click', -> post.emit 'menuAction', 'Maximize'

        @close = elem class: 'winbutton close'
        
        @close.innerHTML = """
            <svg width="100%" height="100%" viewBox="-10 -9 30 30">
                <line x1="0" y1="0" x2="10" y2="11"></line>
                <line x1="10" y1="0" x2="0" y2="11"></line>
            </svg>
        """
        
        @elem.appendChild @close
        @close.addEventListener 'click', -> post.emit 'menuAction', 'Close Window'
        
        if @cfg.menu
            
            @initMenu @menuTemplate()
         
    showTitle: -> @title.style.display = 'initial'
    hideTitle: -> @title.style.display = 'none'
            
    onTitlebar: (action) =>
        
        switch action
            when 'showTitle'   then @showTitle()
            when 'hideTitle'   then @hideTitle()
            when 'showMenu'    then @showMenu()
            when 'hideMenu'    then @hideMenu()
            when 'toggleMenu'  then @toggleMenu()
            
    # 00     00  00000000  000   000  000   000  
    # 000   000  000       0000  000  000   000  
    # 000000000  0000000   000 0 000  000   000  
    # 000 0 000  000       000  0000  000   000  
    # 000   000  00000000  000   000   0000000   

    onMenuAction: (action, args) =>
        
        win = -> require('electron').remote.getCurrentWindow()
        
        switch action
            when 'Toggle Menu'      then @toggleMenu()
            when 'Open Menu'        then @openMenu()
            when 'Show Menu'        then @showMenu()
            when 'Hide Menu'        then @hideMenu()
            when 'DevTools'         then win().webContents.toggleDevTools()
            when 'Reload'           then win().webContents.reloadIgnoringCache()
            when 'Close Window'     then win().close()
            when 'Minimize'         then win().minimize()
            when 'Maximize'         
                if win().isMaximized() then win().unmaximize() else win().maximize()  

    menuTemplate: ->
        
        if empty @templateCache
            @templateCache = @makeTemplate noon.load slash.resolve @cfg.menu
        @templateCache
        
    makeTemplate: (obj) ->
        
        tmpl = []
        for text,menuOrAccel of obj
            tmpl.push switch
                when empty(menuOrAccel) and text.startsWith '-'
                    text: ''
                when _.isNumber menuOrAccel
                    text:text
                    accel:str menuOrAccel
                when _.isString menuOrAccel
                    text:text
                    accel:menuOrAccel
                when empty(menuOrAccel)
                    text:text
                    accel: ''
                else
                    text:text
                    menu:@makeTemplate menuOrAccel
        tmpl

    initMenu: (items) ->

        @menu = new menu items:items
        @elem.insertBefore @menu.elem, @elem.firstChild.nextSibling
        @hideMenu()

    menuVisible: => @menu.elem.style.display != 'none'
    showMenu:    => @menu.elem.style.display = 'inline-block'; @menu?.focus?(); post.emit 'titlebar', 'hideTitle'
    hideMenu:    => @menu?.close(); @menu.elem.style.display = 'none'; post.emit 'titlebar', 'showTitle'
    toggleMenu:  => if @menuVisible() then @hideMenu() else @showMenu()
    openMenu:    => if @menuVisible() then @hideMenu() else @showMenu(); @menu.open()

    # 000   000  00000000  000   000
    # 000  000   000        000 000
    # 0000000    0000000     00000
    # 000  000   000          000
    # 000   000  00000000     000

    handleKey: (event) ->

        { combo } = keyinfo.forEvent event
        
        mainMenu = @menuTemplate()
            
        for keypath in sds.find.key mainMenu, 'accel'
            combos = sds.get(mainMenu, keypath).split ' '
            if combo in combos
                keypath.pop()
                item = sds.get mainMenu, keypath
                post.emit 'menuAction', item.action ? item.text, item.actarg
                return item

        'unhandled'
            
module.exports = Title
