###
 0000000    0000000   00     00  00000000  00000000    0000000   0000000  
000        000   000  000   000  000       000   000  000   000  000   000
000  0000  000000000  000000000  0000000   00000000   000000000  000   000
000   000  000   000  000 0 000  000       000        000   000  000   000
 0000000   000   000  000   000  00000000  000        000   000  0000000  
###

events = require 'events'

class Gamepad extends events

    @: (@continuous=false) -> 
    
        @btns = ['A''B''X''Y''LB''RB''LT''RT''Back''Start''LS''RS''Up''Down''Left''Right''Menu']
        @state = buttons:{}, left:{x:0,y:0}, right:{x:0,y:0}
        @deadZone = 0.1

        if 'function' == typeof navigator?.getGamepads
            @init()
        
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    init: ->

        window.addEventListener 'gamepadconnected' (event) =>
            if event.gamepad.index == 0 and event.gamepad.axes.length >= 4
                window.requestAnimationFrame @poll
        
    # 00000000    0000000   000      000      
    # 000   000  000   000  000      000      
    # 00000000   000   000  000      000      
    # 000        000   000  000      000      
    # 000         0000000   0000000  0000000  
    
    axisValue: (value) ->
        
        if Math.abs(value) < @deadZone then return 0
        value
    
    poll: =>
            
        if pad = navigator.getGamepads?()[0]
            
            state = {}
            
            changed = false
            for index in [0...pad.buttons.length]
                button = pad.buttons[index]
                if button.pressed
                    state[@btns[index]] = button.value
                    if not @state.buttons[@btns[index]]
                        @emit 'button' @btns[index], 1
                        changed = true
                else if @state.buttons[@btns[index]]
                    @emit 'button' @btns[index], 0
                    changed = true
                    
            @state.buttons = state
                    
            if changed 
                @emit 'buttons' @state.buttons
            
            changed = false 
            x = @axisValue  pad.axes[0]
            y = @axisValue -pad.axes[1]
            if x != @state.left.x or y != @state.left.y
                @state.left = x:x, y:y 
                changed = true
                
            x = @axisValue  pad.axes[2]
            y = @axisValue -pad.axes[3]
            if x != @state.right.x or y != @state.right.y
                @state.right = x:x, y:y 
                changed = true
                
            if changed or @continuous
                @emit 'axis' @state

            window.requestAnimationFrame @poll

module.exports = new Gamepad
