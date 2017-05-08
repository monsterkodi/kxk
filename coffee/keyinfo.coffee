# 000   000  00000000  000   000  000  000   000  00000000   0000000   
# 000  000   000        000 000   000  0000  000  000       000   000  
# 0000000    0000000     00000    000  000 0 000  000000    000   000  
# 000  000   000          000     000  000  0000  000       000   000  
# 000   000  00000000     000     000  000   000  000        0000000   

keycode = require 'keycode'
ansiKey = require 'ansi-keycode'

class Keyinfo
    
    @forEvent: (event) =>
        combo = @comboForEvent    event
        mod:   @modifiersForEvent event
        key:   @keynameForEvent   event
        char:  @characterForEvent event
        combo: combo
        short: @short combo
    
    @modifierNames = ['shift', 'ctrl', 'alt', 'command']
    @modifierChars = ['⇧', '^', '⌥', '⌘']
    
    @forCombo: (combo) ->
        mods = []
        char = null
        for c in combo.split '+'
            if @isModifier c
                mods.push c 
            else
                key = c
                char = c if c.length == 1 # does this work?
        mod:   mods.join '+'
        key:   key
        combo: combo 
        char:  char
    
    @isModifier: (keyname) -> keyname in @modifierNames

    @modifiersForEvent: (event) -> 
        mods = []
        mods.push 'command' if event.metaKey
        mods.push 'alt'     if event.altKey
        mods.push 'ctrl'    if event.ctrlKey 
        mods.push 'shift'   if event.shiftKey
        return mods.join '+'
                    
    @comboForEvent: (event) =>
        
        join = -> 
            args = [].slice.call arguments, 0
            args = args.filter (e) -> e?.length
            args.join '+'
    
        key = keycode event
        if key not in @modifierNames
            return join @modifiersForEvent(event), key
        return ""

    @keynameForEvent: (event) -> 
        name = keycode event
        return "" if name in ["left command", "right command", "ctrl", "alt", "shift"]
        name

    @characterForEvent: (event) ->
        ansi = ansiKey event 
        return null if not ansi? 
        return null if ansi.length != 1 
        return null if @modifiersForEvent(event) not in ["", "shift"]
        return null if /f\d{1,2}/.test @keynameForEvent event
        ansi
        
    @short: (combo) ->
        for i in [0...@modifierNames.length]
            modifierName = @modifierNames[i]+'+'
            combo = combo.replace modifierName, @modifierChars[i]
        combo.toUpperCase()

module.exports = Keyinfo
