###
000   000  000   0000000  000000000   0000000   00000000   000   000
000   000  000  000          000     000   000  000   000   000 000 
000000000  000  0000000      000     000   000  0000000      00000  
000   000  000       000     000     000   000  000   000     000   
000   000  000  0000000      000      0000000   000   000     000   
###

{ def, _ } = require './kxk'

class History
    
    constructor: (opt) ->
        @opt  = def opt, list: [], maxLength: 100
        @list = opt.list
        
    add: (i) ->
        _.pull @list, i
        @list.push i
        if @list.length > @opt.maxLength
            @list.shift()
        
    previous: ->
        if @list.length > 1 then @list[@list.length-2]
        else null
    
    current: -> _.last @list
            
module.exports = History
