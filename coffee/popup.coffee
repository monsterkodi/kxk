###
00000000    0000000   00000000   000   000  00000000 
000   000  000   000  000   000  000   000  000   000
00000000   000   000  00000000   000   000  00000000 
000        000   000  000        000   000  000      
000         0000000   000         0000000   000      
###

{ empty, stopEvent, keyinfo, post, elem, log } = require './kxk'

class Popup
    
    constructor: (opt) ->
        
        @focusElem = document.activeElement
        @items  = elem class: 'popup', tabindex: 3
        @parent = opt.parent
        
        for item in opt.items
            continue if item.hide
            if empty(item.text) and empty(item.html)
                div = elem 'hr', class: 'popupItem separator'
            else
                div = elem class: 'popupItem', text: item.text
                if not empty item.html
                    div.innerHTML = item.html 
                div.item = item
                div.addEventListener 'click', @onClick
                if item.combo ? item.accel
                    div.appendChild elem 'span', class:'popupCombo', text:keyinfo.short item.combo ? item.accel
                else if item.menu 
                    div.appendChild elem 'span', class:'popupCombo', text:'▶'
            @items.appendChild div

        document.body.appendChild @items
                
        @items.addEventListener 'keydown',   @onKeyDown
        @items.addEventListener 'focusout',  @onFocusOut
        @items.addEventListener 'mouseover', @onHover
        
        br = @items.getBoundingClientRect()
        
        if opt.x+br.width > document.body.clientWidth 
            @items.style.left = "#{document.body.clientWidth - br.width}px"
        else
            @items.style.left = "#{opt.x}px" 
           
        if opt.y+br.height > document.body.clientHeight
            @items.style.top = "#{document.body.clientHeight - br.height}px"
        else
            @items.style.top  = "#{opt.y}px"
        
        if opt.selectFirstItem != false
            @select @items.firstChild, selectFirstItem:false
        
    #  0000000  000       0000000    0000000  00000000  
    # 000       000      000   000  000       000       
    # 000       000      000   000  0000000   0000000   
    # 000       000      000   000       000  000       
    #  0000000  0000000   0000000   0000000   00000000  
    
    close: (opt={})=>
        
        @popup?.close focus:false
        delete @popup
        
        @items?.removeEventListener 'keydown',   @onKeyDown
        @items?.removeEventListener 'focusout',  @onFocusOut
        @items?.removeEventListener 'mouseover', @onHover
        @items?.remove()
        delete @items
        
        @parent?.childClosed @, opt
        
        if opt.all
            if @parent?
                @parent.close opt
                                            
        if opt.focus != false and not @parent
            @focusElem?.focus() 

    childClosed: (child, opt) ->
        
        if child == @popup
            delete @popup
            if opt.focus != false
                @focus()
            
    #  0000000  00000000  000      00000000   0000000  000000000  
    # 000       000       000      000       000          000     
    # 0000000   0000000   000      0000000   000          000     
    #      000  000       000      000       000          000     
    # 0000000   00000000  0000000  00000000   0000000     000     
    
    select: (item, opt={}) ->
        
        return if not item?
        
        if @popup?
            @popup.close focus:false
        
        @selected?.classList.remove 'selected'
        @selected = item
        @selected.classList.add 'selected'
        
        if item.item?.menu and opt.open != false
            delete @popup
            @popupChild item, opt
            
        @focus()
        
    # 00000000    0000000   00000000   000   000  00000000    0000000  000   000  000  000      0000000    
    # 000   000  000   000  000   000  000   000  000   000  000       000   000  000  000      000   000  
    # 00000000   000   000  00000000   000   000  00000000   000       000000000  000  000      000   000  
    # 000        000   000  000        000   000  000        000       000   000  000  000      000   000  
    # 000         0000000   000         0000000   000         0000000  000   000  000  0000000  0000000    
    
    popupChild: (item, opt={}) -> 
        
        if items = item.item.menu
            if @popup
                @closePopup()
            else
                br = item.getBoundingClientRect()
                @popup = new Popup items:items, parent:@, x:br.left+br.width, y:br.top, selectFirstItem:opt?.selectFirstItem

    closePopup: ->
        
        @popup?.close focus:false
        delete @popup

    # 000   000   0000000   000   000  000   0000000    0000000   000000000  00000000  
    # 0000  000  000   000  000   000  000  000        000   000     000     000       
    # 000 0 000  000000000   000 000   000  000  0000  000000000     000     0000000   
    # 000  0000  000   000     000     000  000   000  000   000     000     000       
    # 000   000  000   000      0      000   0000000   000   000     000     00000000  
    
    navigateLeft: ->
        
        if @popup 
            @closePopup()
        else if menu = @parentMenu()
            menu.navigateLeft()
        else if @parent
            @close focus:false

    activateOrNavigateRight: ->
        
        if @selected?
            if not @selected.item.menu
                @activate @selected
            else
                @navigateRight()
            
    navigateRight: ->
        if @popup
            @popup.select @popup.items.firstChild
        else if @selected?.item.menu
            # @activate @selected
            @select @selected, selectFirstItem:true
        else if menu = @parentMenu()
            menu.navigateRight()
            
    parentMenu: -> 
        if @parent? and not @parent.parent
            @parent
            
    # 000   000  00000000  000   000  000000000        00000000   00000000   00000000  000   000  
    # 0000  000  000        000 000      000           000   000  000   000  000       000   000  
    # 000 0 000  0000000     00000       000           00000000   0000000    0000000    000 000   
    # 000  0000  000        000 000      000           000        000   000  000          000     
    # 000   000  00000000  000   000     000           000        000   000  00000000      0      
    
    nextItem: ->
        if next = @selected
            while next = next.nextSibling
                if not empty next.item?.text
                    return next
    
    prevItem: ->
        if prev = @selected
            while prev = prev.previousSibling
                if not empty prev.item?.text
                    return prev
                
    #  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
    # 000   000  000          000     000  000   000  000   000     000     000       
    # 000000000  000          000     000   000 000   000000000     000     0000000   
    # 000   000  000          000     000     000     000   000     000     000       
    # 000   000   0000000     000     000      0      000   000     000     00000000  
    
    activate: (item) ->
        
        if item.item?.cb?
            @close all:true
            item.item.cb item.item.arg ? item.item.text
        else if not item.item.menu
            @close all:true
            post.emit 'menuAction', item.item.action ? item.item.text, item.item.actarg

    toggle: (item) ->
        
        if @popup
            @popup.close focus:false
            delete @popup
        else
            @select item, selectFirstItem:false
            
    # 00     00   0000000   000   000   0000000  00000000    
    # 000   000  000   000  000   000  000       000         
    # 000000000  000   000  000   000  0000000   0000000     
    # 000 0 000  000   000  000   000       000  000         
    # 000   000   0000000    0000000   0000000   00000000    
            
    onHover: (event) => 
    
        if item = elem.upElem event.target, prop:'item'
            @select item, selectFirstItem:false   

    onClick: (event) => 
        
        stopEvent event 
        
        if item = elem.upElem event.target, prop:'item'
            if item.item.menu
                @toggle item
            else
                @activate item

    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
    
    focus: -> @items?.focus()
    
    onFocusOut: (event) => 
        
        if not event.relatedTarget?.classList.contains 'popup'
            @close all:true, focus:false
                
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    onKeyDown: (event) =>
        
        { mod, key, combo } = keyinfo.forEvent event
        
        switch combo
            when 'end', 'page down' then stopEvent event, @select @items.lastChild, selectFirstItem:false 
            when 'home', 'page up'  then stopEvent event, @select @items.firstChild, selectFirstItem:false 
            when 'esc'              then stopEvent event, @close()
            when 'down'             then stopEvent event, @select @nextItem(), selectFirstItem:false 
            when 'up'               then stopEvent event, @select @prevItem(), selectFirstItem:false 
            when 'enter', 'space'   then stopEvent event, @activateOrNavigateRight()
            when 'left'             then stopEvent event, @navigateLeft()
            when 'right'            then stopEvent event, @navigateRight()
            
module.exports = menu: (opt) -> new Popup opt
