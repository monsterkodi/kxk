# 0000000    00000000    0000000    0000000 
# 000   000  000   000  000   000  000      
# 000   000  0000000    000000000  000  0000
# 000   000  000   000  000   000  000   000
# 0000000    000   000  000   000   0000000 

{ def, pos, stopEvent, error, log, $, _
} = require './kxk'

class Drag

    constructor: (cfg) ->
        
        _.extend @, def cfg,
                target  : null
                handle  : null
                onStart : null
                onMove  : null
                onStop  : null
                active  : true
                cursor  : 'move'

        if _.isString @target
            t =$ @target
            if not t?
                return error "Drag -- can't find drag target with id", @target
            @target = t
            
        if not @target?
            return error "Drag -- can't find drag target"
        
        error "Drag -- onStart not a function?" if @onStart? and not _.isFunction @onStart
        error "Drag -- onMove not a function?" if @onMove? and not _.isFunction @onMove
        error "Drag -- onEnd not a function?" if @onEnd? and not _.isFunction @onEnd
                
        @dragging  = false
        @listening = false
        @handle    = $(@handle) if _.isString @handle
        @handle   ?= @target
        @activate() if @active

    #  0000000  000000000   0000000   00000000   000000000  
    # 000          000     000   000  000   000     000     
    # 0000000      000     000000000  0000000       000     
    #      000     000     000   000  000   000     000     
    # 0000000      000     000   000  000   000     000     
    
    start: (p, event) ->
        
        if not @dragging and @listening
            @dragging = true
            @startPos = p
            @pos      = p
            
            if 'skip' == @onStart? @, event
                delete @startPos
                @dragging = false
                return @
                
            @lastPos  = p
                    
            stopEvent event
    
            document.addEventListener 'mousemove', @dragMove
            document.addEventListener 'mouseup',   @dragUp
        @
    
    dragStart: (event) => @start pos(event), event
        
    # 00     00   0000000   000   000  00000000  
    # 000   000  000   000  000   000  000       
    # 000000000  000   000   000 000   0000000   
    # 000 0 000  000   000     000     000       
    # 000   000   0000000       0      00000000  
    
    dragMove: (event) =>

        if @dragging
            @pos = pos event
            @delta    = @lastPos.to @pos
            @deltaSum = @startPos.to @pos
            @onMove? @, event 
            @lastPos = @pos
        @
                
    dragUp: (event) => @dragStop event

    #  0000000  000000000   0000000   00000000   
    # 000          000     000   000  000   000  
    # 0000000      000     000   000  00000000   
    #      000     000     000   000  000        
    # 0000000      000      0000000   000        
    
    dragStop: (event) =>

        if @dragging
            document.removeEventListener 'mousemove', @dragMove
            document.removeEventListener 'mouseup',   @dragUp
            @onStop @, event if @onStop? and event?
            delete @lastPos
            delete @startPos
            @dragging = false
        @

    #  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
    # 000   000  000          000     000  000   000  000   000     000     000       
    # 000000000  000          000     000   000 000   000000000     000     0000000   
    # 000   000  000          000     000     000     000   000     000     000       
    # 000   000   0000000     000     000      0      000   000     000     00000000  
    
    activate: =>
        
        if not @listening
            @listening = true
            @handle.addEventListener 'mousedown', @dragStart
        @

    deactivate: =>

        if @listening
            @handle.removeEventListener 'mousedown', @dragStart
            @listening = false
            @dragStop() if @dragging
        @

module.exports = Drag
