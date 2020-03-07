###
00     00  00000000  000   000  000   000  
000   000  000       0000  000  000   000  
000000000  0000000   000 0 000  000   000  
000 0 000  000       000  0000  000   000  
000   000  00000000  000   000   0000000   
###

{ elem, keyinfo, popup, stopEvent } = require './kxk'

class Menu
    
    @: (opt) ->
        
        @elem = elem class:'menu' tabindex:3
        
        for item in opt.items
            continue if item.hide
            div = elem class: 'menuItem' text: item.text
            div.item = item
            div.addEventListener 'click' @onClick
            if item.combo?
                combo = elem 'span' class:'popupCombo' text: keyinfo.short item.combo
                div.appendChild combo
            @elem.appendChild div

        @select @elem.firstChild
            
        @elem.addEventListener 'keydown'   @onKeyDown
        @elem.addEventListener 'focusout'  @onFocusOut
        @elem.addEventListener 'mouseover' @onHover
        
    del: ->
        
        @close()
        @elem?.remove()
        @elem = null
        
    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
    
    focus: => 
        
        @focusElem = document.activeElement
        @elem.focus()
        
    blur: => @close(); @focusElem?.focus?()
    
    onHover: (event) => @select event.target, selectFirstItem:false
    
    onFocusOut: (event) => 
        
        if @popup and not event.relatedTarget?.classList.contains 'popup'
            @popup.close focus:false
            delete @popup
    
    #  0000000   00000000   00000000  000   000  
    # 000   000  000   000  000       0000  000  
    # 000   000  00000000   0000000   000 0 000  
    # 000   000  000        000       000  0000  
    #  0000000   000        00000000  000   000  
    
    open: -> @select @elem.firstChild, activate:true
            
    #  0000000  000       0000000    0000000  00000000  
    # 000       000      000   000  000       000       
    # 000       000      000   000  0000000   0000000   
    # 000       000      000   000       000  000       
    #  0000000  0000000   0000000   0000000   00000000  
    
    close: (opt={}) =>
        
        if @popup?
            @popup.close focus:false
            delete @popup
            if opt.focus != false
                @elem.focus()
        else
            if opt.focus != false
                @focusElem?.focus?()
            
    childClosed: (child, opt) ->
        
        if child == @popup
            delete @popup
            if opt.focus != false
                @elem.focus()
    
    #  0000000  00000000  000      00000000   0000000  000000000  
    # 000       000       000      000       000          000     
    # 0000000   0000000   000      0000000   000          000     
    #      000  000       000      000       000          000     
    # 0000000   00000000  0000000  00000000   0000000     000     
    
    select: (item, opt={}) -> 
        
        return if not item?
        
        if @popup?
            hadPopup = true
            @popup.close focus:false
        
        @selected?.classList.remove 'selected'
        @selected = item
        @selected.classList.add 'selected'
        
        if hadPopup or opt.activate
            delete @popup
            @activate item, opt
        
    #  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
    # 000   000  000          000     000  000   000  000   000     000     000       
    # 000000000  000          000     000   000 000   000000000     000     0000000   
    # 000   000  000          000     000     000     000   000     000     000       
    # 000   000   0000000     000     000      0      000   000     000     00000000  
    
    activate: (item, opt={}) -> 
        
        items = item.item.menu
        
        if items
            
            if @popup
                @popup.close focus:false
                delete @popup

            br = item.getBoundingClientRect()
            pr = item.parentNode.getBoundingClientRect()
            opt.items = items
            opt.parent = @
            opt.x = br.left
            opt.y = pr.top+pr.height
            opt.class = 'titlemenu'
            @popup = popup.menu opt
            if opt.selectFirstItem == false
                @elem.focus()

    toggle: (item) ->
        
        if @popup
            @popup.close focus:false
            delete @popup
        else
            @activate item, selectFirstItem:false
            
    itemSelected: (item, elem) ->
            
    deactivate: (item) -> 

    navigateLeft:  -> @select @selected?.previousSibling, activate:true, selectFirstItem:false
    navigateRight: -> @select @selected?.nextSibling,     activate:true, selectFirstItem:false
    
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    onKeyDown: (event) =>
        
        { mod, key, combo } = keyinfo.forEvent event
        
        switch combo
            
            when 'end', 'page down'         then stopEvent event, @select @elem.lastChild,  activate:true, selectFirstItem:false
            when 'home', 'page up'          then stopEvent event, @select @elem.firstChild, activate:true, selectFirstItem:false
            when 'enter', 'down', 'space'   then stopEvent event, @activate @selected
            when 'esc'                      then stopEvent event, @close()
            when 'right'                    then stopEvent event, @navigateRight()
            when 'left'                     then stopEvent event, @navigateLeft()
            
    onClick: (e) => @toggle e.target
        
module.exports = Menu
