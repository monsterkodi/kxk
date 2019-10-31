###
000   000  000   0000000  000000000   0000000   00000000   000   000
000   000  000  000          000     000   000  000   000   000 000 
000000000  000  0000000      000     000   000  0000000      00000  
000   000  000       000     000     000   000  000   000     000   
000   000  000  0000000      000      0000000   000   000     000   
###

{ def, last, _ } = require './kxk'

class History
    
    @: (opt) ->
        
        @opt  = def opt, list: [], maxLength: 100
        @list = opt.list
        
    add: (i) ->
        
        _.pullAllWith @list, [i], _.isEqual
        
        @list.push i
        if @list.length > @opt.maxLength
            @list.shift()
        
    previous: ->
        
        if @list.length > 1 then @list[@list.length-2]
        else null
    
    current: -> last @list
            
module.exports = History
