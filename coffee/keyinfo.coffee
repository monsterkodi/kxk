###
000   000  00000000  000   000  000  000   000  00000000   0000000   
000  000   000        000 000   000  0000  000  000       000   000  
0000000    0000000     00000    000  000 0 000  000000    000   000  
000  000   000          000     000  000  0000  000       000   000  
000   000  00000000     000     000  000   000  000        0000000   
###

keycode = require 'keycode'
ansiKey = require 'ansi-keycode'
os      = require 'os'

class Keyinfo
    
    @forEvent: (event) =>
        combo = @comboForEvent    event
        mod:   @modifiersForEvent event
        key:   @keynameForEvent   event
        char:  @characterForEvent event
        combo: combo
        short: @short combo
    
    @modifierNames = ['shift' 'ctrl' 'alt' 'command'] 
    @modifierChars = ['⌂' '⌃' '⌥' '⌘']
    
    @iconKeyNames  = ['shift' 'ctrl' 'alt' 'command' 'backspace' 'delete' 'home' 'end' 'page up' 'page down' 'return' 'enter' 'up' 'down' 'left' 'right' 'tab'  'space' 'click']
    @iconKeyChars  = ['⌂' '⌃' '⌥' '⌘' '⌫' '⌦' '↖' '↘' '⇞' '⇟' '↩' '↩' '↑' '↓' '←' '→' '⤠' '␣' '⍝'] # '⭲' '🖯' ]

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
    
        key = @keynameForEvent event
        if key not in @modifierNames
            return join @modifiersForEvent(event), key
        return ''

    @convertCmdCtrl: (combo) ->
        
        index = combo.indexOf 'cmdctrl'
        if index >= 0
            if os.platform() == 'darwin'
                combo = combo.replace 'cmdctrl' 'command'
                combo = combo.replace 'alt+command' 'command+alt'
            else
                combo = combo.replace 'cmdctrl' 'ctrl'            
        combo
                
    @keynameForEvent: (event) ->
        
        name = keycode event
        if not name?
            switch event.code
                when 'NumpadEqual' then return 'numpad ='
                when 'Numpad5'     then return 'numpad 5'
        return '' if name in ['left command' 'right command' 'ctrl' 'alt' 'shift']
        name

    @characterForEvent: (event) ->
        
        ansi = ansiKey event 
        return null if not ansi? 
        return null if ansi.length != 1 
        return null if @modifiersForEvent(event) not in ['' 'shift']
        return null if /f\d{1,2}/.test @keynameForEvent event
        ansi
        
    @short: (combo) ->
        
        combo = @convertCmdCtrl combo.toLowerCase()
        for i in [0...@iconKeyNames.length]
            combo = combo.replace new RegExp(@iconKeyNames[i], 'gi'), @iconKeyChars[i]
        combo = combo.replace /\+/g, ''
        combo.toUpperCase()

module.exports = Keyinfo
