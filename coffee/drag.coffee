# 0000000    00000000    0000000    0000000 
# 000   000  000   000  000   000  000      
# 000   000  0000000    000000000  000  0000
# 000   000  000   000  000   000  000   000
# 0000000    000   000  000   000   0000000 
{
def,
error
}   = require './kxk'
pos = require './pos'
_   = require 'lodash'

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

        if typeof @target is 'string'
            t = document.getElementById @target
            if not t?
                error "Drag.constructor -- can't find drag target with id", @target
                return
            @target = t
        if not @target?
            error "Drag.constructor -- can't find drag target"
            return

        @dragging  = false
        @listening = false
        @handle    = document.getElementById(@handle) if typeof @handle  is 'string'
        @handle    = @target if not @handle?
        @activate() if @active

    dragStart: (event) =>
        return if @dragging or not @listening
        @dragging = true
        @startPos = pos event
        @pos      = pos event
        @onStart @, event if @onStart?
        @lastPos  = pos event
                
        event.preventDefault()

        document.addEventListener 'mousemove', @dragMove
        document.addEventListener 'mouseup',   @dragUp

    dragMove: (event) =>

        return if not @dragging

        @pos   = pos event
        @delta = @lastPos.to @pos
        @deltaSum = @startPos.to @pos
        
        if @onMove?
            @onMove this, event

        @lastPos = @pos
                
    dragUp: (event) => @dragStop event

    dragStop: (event) =>

        return if not @dragging
        document.removeEventListener 'mousemove', @dragMove
        document.removeEventListener 'mouseup',   @dragUp
        delete @lastPos
        delete @startPos
        @onStop this, event if @onStop? and event?
        @dragging = false

    activate: =>
        
        return if @listening
        @listening = true
        @handle.addEventListener 'mousedown', @dragStart

    deactivate: =>

        return if not @listening
        @handle.removeEventListener 'mousedown', @dragStart
        @listening = false
        @dragStop() if @dragging

module.exports = Drag
