###
00000000    0000000   00000000   000   000  00000000 
000   000  000   000  000   000  000   000  000   000
00000000   000   000  00000000   000   000  00000000 
000        000   000  000        000   000  000      
000         0000000   000         0000000   000      
###

{ empty, stopEvent, keyinfo, elem, log } = require './kxk'

class Popup
    
    constructor: (opt) ->
        
        @focus = document.activeElement
        @items = elem class: 'popup', tabindex: 3
        
        @menu  = opt.menu
        
        for item in opt.items
            continue if item.hide
            if empty item.text
                div = elem 'hr', class: 'popupItem separator'
            else
                div = elem class: 'popupItem', text: item.text
                div.item = item
                div.addEventListener 'click', @onClick
                if item.combo ? item.accel
                    div.appendChild elem 'span', class:'popupCombo', text:keyinfo.short item.combo ? item.accel
                else if item.menu 
                    div.appendChild elem 'span', class:'popupCombo', text:'▶'
            @items.appendChild div

        @select @items.firstChild
            
        document.body.appendChild @items
        
        @items.addEventListener 'keydown',   @onKeyDown
        @items.addEventListener 'focusout',  @onFocusOut
        @items.addEventListener 'mouseover', @onHover
        @items.focus()
        
        br = @items.getBoundingClientRect()
        
        if opt.x+br.width > document.body.clientWidth 
            @items.style.left = "#{document.body.clientWidth - br.width}px"
        else
            @items.style.left = "#{opt.x}px" 
           
        if opt.y+br.height > document.body.clientHeight
            @items.style.top = "#{document.body.clientHeight - br.height}px"
        else
            @items.style.top  = "#{opt.y}px"
        
    close: (opt={})=>
        
        # log ''
        
        @items?.removeEventListener 'keydown',   @onKeyDown
        @items?.removeEventListener 'focusout',  @onFocusOut
        @items?.removeEventListener 'mouseover', @onHover
        @items?.remove()
        delete @items
        @focus.focus() if opt.focus != false

    select: (item) ->
        
        return if not item?
        @selected?.classList.remove 'selected'
        @selected = item
        @selected.classList.add 'selected'
        @menu?.itemSelected? item.item, item
        
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
                
    activate: (item) ->
        
        if not @menu?
            
            log 'no menu'
            
            @close()
            item.item?.cb?(item.item.arg ? item.item.text)
            
        else if not @menu?.itemActivated? item.item, item
            log 'menu returned false ... closing'
            @close focus:false
            # item.item?.cb?(item.item.arg ? item.item.text)
     
    onHover:    (event) => @select event.target   
    onFocusOut: (event) => 
        if @menu 
            @menu.popupFocusOut @, event
        else 
            @close() 
        
    onKeyDown: (event) =>
        
        { mod, key, combo } = keyinfo.forEvent event
        
        switch combo
            when 'end', 'page down' then @select @items.lastChild
            when 'home', 'page up'  then @select @items.firstChild
            when 'enter'            then @activate @selected
            when 'esc', 'space'     then @close()
            when 'down'             then @select @nextItem() ? @items.firstChild 
            when 'up'               then @select @prevItem() ? @items.lastChild 
            when 'right'            then @select @nextItem()
            when 'left'             then @select @prevItem()
            
        stopEvent event
     
    onClick: (e) => stopEvent e, @activate e.target
        
module.exports = menu: (opt) -> new Popup opt
