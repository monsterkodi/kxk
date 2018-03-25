###
00     00  00000000  000   000  000   000  
000   000  000       0000  000  000   000  
000000000  0000000   000 0 000  000   000  
000 0 000  000       000  0000  000   000  
000   000  00000000  000   000   0000000   
###

{ stopEvent, keyinfo, popup, post, elem, log } = require './kxk'

class Menu
    
    constructor: (opt) ->
        
        @elem = elem class: 'menu', tabindex: 3
        
        for item in opt.items
            continue if item.hide
            div = elem class: 'menuItem', text: item.text
            div.item = item
            div.addEventListener 'click', @onClick
            if item.combo?
                combo = elem 'span', class: 'popupCombo', text: keyinfo.short item.combo
                div.appendChild combo
            @elem.appendChild div

        @select @elem.firstChild
            
        @elem.addEventListener 'keydown',   @onKeyDown
        @elem.addEventListener 'focusout',  @onFocusOut
        @elem.addEventListener 'mouseover', @onHover
        
    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
    
    focus: => 
        
        @focusElem = document.activeElement
        @elem.focus()
        
    blur: => @close(); @focusElem?.focus?()
    
    onHover: (event) => @select event.target
    
    onFocusOut: (event) => 
    
    popupFocusOut: (popup, event) ->
        
        log 'popupFocusOut', popup == @popup
        if popup == @popup
            log 'relatedTarget', event.relatedTarget.id, event.relatedTarget.className 
            if not event.relatedTarget.classList.contains 'popup'
                @close()
        else
            popup.close()
            @blur()
        
    #  0000000  000       0000000    0000000  00000000  
    # 000       000      000   000  000       000       
    # 000       000      000   000  0000000   0000000   
    # 000       000      000   000       000  000       
    #  0000000  0000000   0000000   0000000   00000000  
    
    close: => 
        @popup?.close focus:false
        delete @popup
        # @focusElem?.focus()
    
    #  0000000  00000000  000      00000000   0000000  000000000  
    # 000       000       000      000       000          000     
    # 0000000   0000000   000      0000000   000          000     
    #      000  000       000      000       000          000     
    # 0000000   00000000  0000000  00000000   0000000     000     
    
    select: (item) -> 
        
        return if not item?
        
        if @popup?
            @popup.close focus:false
        
        @selected?.classList.remove 'selected'
        @selected = item
        @selected.classList.add 'selected'
        
        if @popup?
            delete @popup
            @activate item
        
    #  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
    # 000   000  000          000     000  000   000  000   000     000     000       
    # 000000000  000          000     000   000 000   000000000     000     0000000   
    # 000   000  000          000     000     000     000   000     000     000       
    # 000   000   0000000     000     000      0      000   000     000     00000000  
    
    activate: (item) -> 
        
        items = item.item.menu
        if items
            if @popup
                @popup.close focus:false
                delete @popup
            else
                br = item.getBoundingClientRect()
                pr = item.parentNode.getBoundingClientRect()
                @popup = popup.menu items:items, parent:@, x:br.left, y:pr.top+pr.height
        
    itemSelected: (item, elem) ->
            
    deactivate: (item) -> log item.item

    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    onKeyDown: (event) =>
        
        { mod, key, combo } = keyinfo.forEvent event
        
        switch combo
            when 'end', 'page down'   then @select @elem.lastChild
            when 'home', 'page up'    then @select @elem.firstChild
            when 'enter', 'down'      then @activate @selected
            when 'up'                 then @deactivate @selected
            when 'esc', 'space'       then @close()
            # when 'down'             then @select @selected?.nextSibling ? @elem.firstChild 
            # when 'up'               then @select @selected?.previousSibling ? @elem.lastChild 
            when 'right'            then @select @selected?.nextSibling
            when 'left'             then @select @selected?.previousSibling
            
        stopEvent event
     
    onClick: (e) => @activate e.target
        
module.exports = Menu
