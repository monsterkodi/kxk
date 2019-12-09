###
000   000  00000000  000   000  000  000   000  00000000   0000000   
000  000   000        000 000   000  0000  000  000       000   000  
0000000    0000000     00000    000  000 0 000  000000    000   000  
000  000   000          000     000  000  0000  000       000   000  
000   000  00000000     000     000  000   000  000        0000000   
###

{ empty, os } = require './kxk'

class Keyinfo
    
    @forEvent: (event) =>
                      
        combo = @comboForEvent event
        info =
            mod:   @modifiersForEvent event
            key:   @keynameForEvent   event
            char:  @characterForEvent event
            combo: combo
            short: @short combo
        info
    
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
        mods.push 'command' if event.metaKey  or event.key == 'Meta'
        mods.push 'alt'     if event.altKey   or event.key == 'Alt'
        mods.push 'ctrl'    if event.ctrlKey  or event.key == 'Control'
        mods.push 'shift'   if event.shiftKey or event.key == 'Shift'
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
        
        switch event.code
            when 'IntlBackslash' 'Backslash'    then '\\'
            when 'Equal'                        then '=' 
            when 'Minus'                        then '-' 
            when 'Plus'                         then '+'
            when 'Slash'                        then '/'
            when 'Quote'                        then "'"
            when 'Comma'                        then ','
            when 'Period'                       then '.'
            when 'Space'                        then 'space'
            when 'Escape'                       then 'esc'
            when 'Semicolon'                    then ';'
            when 'BracketLeft'                  then '[' 
            when 'BracketRight'                 then ']' 
            when 'Backquote'                    then '`'
            else
                if not event.key?
                    ''
                else if event.key.startsWith 'Arrow'
                    event.key.slice(5).toLowerCase()
                else if event.code.startsWith 'Key'
                    event.code.slice(3).toLowerCase()
                else if event.code.startsWith 'Digit'
                    event.code.slice(5)
                else if event.key in ['Delete' 'Insert' 'Enter' 'Backspace' 'Home' 'End']
                    event.key.toLowerCase()
                else if event.key == 'PageUp'
                    'page up'
                else if event.key == 'PageDown'
                    'page down'
                else if event.key == 'Control'
                    'ctrl'
                else if event.key == 'Meta'
                    'command'
                else if @characterForEvent(event)?.length == 1              
                    @characterForEvent(event).toLowerCase()
                else                                    
                    event.key.toLowerCase()        

    @characterForEvent: (event) ->

        if event.key?.length == 1 
            event.key
        else if event.code == 'NumpadEqual' 
            '='
        
    @short: (combo) ->
        
        combo = @convertCmdCtrl combo.toLowerCase()
        for i in [0...@iconKeyNames.length]
            combo = combo.replace new RegExp(@iconKeyNames[i], 'gi'), @iconKeyChars[i]
        combo = combo.replace /\+/g, ''
        combo.toUpperCase()

module.exports = Keyinfo
