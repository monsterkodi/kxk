###
000000000  000  000000000  000      00000000
   000     000     000     000      000     
   000     000     000     000      0000000 
   000     000     000     000      000     
   000     000     000     0000000  00000000
###

{ elem, sds, prefs, slash, scheme, empty, post, stopEvent, keyinfo, menu, noon, kstr, $, _ } = require './kxk'

class Title
    
    constructor: (@opt) ->
        
        @opt ?= {}
        
        pkg = @opt.pkg
        
        @elem =$ @opt.elem ? "#titlebar"
        
        return if not @elem

        post.on 'titlebar',   @onTitlebar
        post.on 'menuAction', @onMenuAction
        
        @elem.addEventListener 'dblclick', (event) -> stopEvent event, post.emit 'menuAction', 'Maximize'
                
        @winicon = elem class: 'winicon'
        if @opt.icon
            @winicon.appendChild elem 'img', src:slash.fileUrl slash.join @opt.dir, @opt.icon
        @elem.appendChild @winicon
        @winicon.addEventListener 'click', -> post.emit 'menuAction', 'Open Menu'   
        
        @title = elem class: 'titlebar-title'
        @elem.appendChild @title
        @setTitle @opt
                
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
        @close.addEventListener 'click', -> post.emit 'menuAction', 'Close'

        @topframe = elem class: 'topframe'
        @elem.appendChild @topframe
        
        @initStyle()
        
        if @opt.menu
            
            @initMenu @menuTemplate()
       
    pushElem: (elem) ->
        
        @elem.insertBefore elem, @minimize
            
    showTitle: -> @title.style.display = 'initial'
    hideTitle: -> @title.style.display = 'none'

    #  0000000  00000000  000000000  000000000  000  000000000  000      00000000  
    # 000       000          000        000     000     000     000      000       
    # 0000000   0000000      000        000     000     000     000      0000000   
    #      000  000          000        000     000     000     000      000       
    # 0000000   00000000     000        000     000     000     0000000  00000000  
    
    setTitle: (opt) ->
        
        html = ""
        
        parts = opt.title ? []
        
        if opt.pkg.name and 'name' in parts
            html += "<span class='titlebar-name'>#{opt.pkg.name}</span>"
        
        if opt.pkg.version and 'version' in parts
            html += "<span class='titlebar-dot'> ● </span>"
            html += "<span class='titlebar-version'>#{opt.pkg.version}</span>"
            
        if opt.pkg.path and 'path' in parts
            html += "<span class='titlebar-dot'> ► </span>"
            html += "<span class='titlebar-version'>#{opt.pkg.path}</span>"
            
        if html == ""
            @title.style.display = 'none'
            
        @title.innerHTML = html
    
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
        
        electron = require 'electron'  
        win = electron.remote.getCurrentWindow()
        
        switch action
            when 'Toggle Menu'      then @toggleMenu()
            when 'Open Menu'        then @openMenu()
            when 'Show Menu'        then @showMenu()
            when 'Hide Menu'        then @hideMenu()
            when 'Toggle Scheme'    
                if @opt.scheme != false then scheme.toggle()
            when 'DevTools'         then win.webContents.toggleDevTools()
            when 'Reload'           then win.webContents.reloadIgnoringCache()
            when 'Close'            then win.close()
            when 'Minimize'         then win.minimize()
            when 'Maximize' 
                wa = electron.screen.getPrimaryDisplay().workAreaSize
                wb = win.getBounds()
                maximized = win.isMaximized() or (wb.width == wa.width and wb.height == wa.height)
                if maximized then win.unmaximize() else win.maximize()  

    menuTemplate: ->
        
        return [] if not @opt.dir or not @opt.menu
        
        if empty @templateCache
            @templateCache = @makeTemplate noon.load slash.resolve slash.join @opt.dir, @opt.menu
            
        if @opt.menuTemplate?
            @opt.menuTemplate @templateCache
        else
            @templateCache
        
    makeTemplate: (obj) ->
        
        tmpl = []
        for text,menuOrAccel of obj
            tmpl.push switch
                when empty(menuOrAccel) and text.startsWith '-'
                    text: ''
                when _.isNumber menuOrAccel
                    text:text
                    accel:kstr menuOrAccel
                when _.isString menuOrAccel
                    text:text
                    accel:keyinfo.convertCmdCtrl menuOrAccel
                when empty menuOrAccel
                    text:text
                    accel: ''
                else
                    if menuOrAccel.accel? or menuOrAccel.command? # needs better test!
                        item = _.clone menuOrAccel
                        item.text = text
                        item
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

    #  0000000  000000000  000   000  000      00000000  
    # 000          000      000 000   000      000       
    # 0000000      000       00000    000      0000000   
    #      000     000        000     000      000       
    # 0000000      000        000     0000000  00000000  
    
    initStyle: ->
        
        if link =$ "#style-link"
            
            href = slash.fileUrl slash.resolve slash.join __dirname, "css/style.css"
            titleStyle = elem 'link',
                href: href
                rel:  'stylesheet'
                type: 'text/css'
                
            link.parentNode.insertBefore titleStyle, link
            
            href = slash.fileUrl slash.resolve slash.join __dirname, "css/#{prefs.get 'scheme', 'dark'}.css"
            titleStyle = elem 'link',
                href: href
                rel:  'stylesheet'
                type: 'text/css'
                id:   'style-title'
                
            link.parentNode.insertBefore titleStyle, link
    
    # 000   000  00000000  000   000
    # 000  000   000        000 000
    # 0000000    0000000     00000
    # 000  000   000          000
    # 000   000  00000000     000

    handleKey: (event) ->

        { combo } = keyinfo.forEvent event
        
        mainMenu = @menuTemplate()
            
        accels = sds.find.key mainMenu, 'accel'
        combos = sds.find.key mainMenu, 'combo'
        
        kepaths = combos.concat accels # swap on win?
        
        for keypath in kepaths
            combos = sds.get(mainMenu, keypath).split ' '
            combos = combos.map (combo) -> keyinfo.convertCmdCtrl combo
            if combo in combos
                keypath.pop()
                item = sds.get mainMenu, keypath
                post.emit 'menuAction', item.action ? item.text, item
                return item

        'unhandled'
            
module.exports = Title
