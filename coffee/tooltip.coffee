###
000000000   0000000    0000000   000      000000000  000  00000000 
   000     000   000  000   000  000         000     000  000   000
   000     000   000  000   000  000         000     000  00000000 
   000     000   000  000   000  000         000     000  000      
   000      0000000    0000000   0000000     000     000  000      
###

{ elem, empty, kerror, $, _ } = require './kxk'

class Tooltip
    
    @: (@opt) ->
        
        return kerror "no elem for tooltip?" if not @opt?.elem
        
        @opt.delay ?= 700
        @opt.html  ?= @opt.text
        
        @elem =  @opt.elem
        @elem =$ @opt.elem if _.isString @opt.elem
        @elem.tooltip = @      

        @elem.addEventListener 'mouseenter', @onHover
        @elem.addEventListener 'DOMNodeRemoved', @del

    del: (event) => 
        
        return if @opt.keep
        return if not @elem?
        
        if empty(event) or event?.target == @elem
            delete @elem.tooltip
            @onLeave()
            @elem.removeEventListener 'DOMNodeRemoved', @del
            @elem = null

    onHover: (event) =>

        return if not @elem?
        return if @div?
        
        clearTimeout @timer
        @timer = setTimeout @popup, @opt.delay
        
        @elem.addEventListener 'mouseleave', @onLeave
        @elem.addEventListener 'mousedown',  @onLeave

    popup: (event) =>
        
        return if not @elem?
        return if @div?
        @div = elem id:'tooltip', class:'tooltip', html: @opt.html
        if @opt.parent
            @opt.parent.appendChild @div
        else
            document.body.appendChild @div
        br = @elem.getBoundingClientRect()
        @div.style.transform = "scaleY(1)"
        @div.style.opacity = '1'
        @div.style.fontSize = "#{@opt.textSize}px" if @opt.textSize?
        @div.style.left = "#{br.left + @opt.x}px" if @opt.x?
        @div.style.top = "#{br.bottom + @opt.y}px" if @opt.y?
        
    onLeave: (event, e) =>
        
        if @elem?
            @elem.removeEventListener  'mouseleave', @onLeave
            @elem.removeEventListener  'mousedown',  @onLeave
            
        clearTimeout @timer
        @timer = null
        @div?.remove()
        @div = null
        
module.exports = Tooltip
