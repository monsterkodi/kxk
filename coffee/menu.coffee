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
    
    focus: -> 
        
        @focus = document.activeElement
        @elem.focus()
        
    blur: -> @focus.focus()
    
    onHover: (event) => @select event.target
    
    onFocusOut: (event) => @close()
    
    close: -> #log '' # @selected?.item
    
    #  0000000  00000000  000      00000000   0000000  000000000  
    # 000       000       000      000       000          000     
    # 0000000   0000000   000      0000000   000          000     
    #      000  000       000      000       000          000     
    # 0000000   00000000  0000000  00000000   0000000     000     
    
    select: (item) -> 
        
        return if not item?
        @selected?.classList.remove 'selected'
        @selected = item
        @selected.classList.add 'selected'
        
    #  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
    # 000   000  000          000     000  000   000  000   000     000     000       
    # 000000000  000          000     000   000 000   000000000     000     0000000   
    # 000   000  000          000     000     000     000   000     000     000       
    # 000   000   0000000     000     000      0      000   000     000     00000000  
    
    activate: (item) -> 
        
        items = item.item.menu
        # log 'activate', item.item.text
        if items
            br = item.getBoundingClientRect()
            pr = item.parentNode.getBoundingClientRect()
            popup.menu items:items, parent:item, x:br.left, y:pr.top+pr.height, menu:@
        
    itemActivated: (item, elem) ->
        
        if item?.menu
            br = elem.getBoundingClientRect()
            log 'activate', item.text, br.top
            popup.menu items:item.menu, parent:elem, x:br.left+br.width, y:br.top, menu:@
            true
        else 
            post.emit 'menuAction', item.action ? item.text
            false
            
    itemSelected: (item, elem) ->
            
    deactivate: (item) -> log item.item

        # item.item?.cb?(item.item.arg ? item.item.text)
         
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
