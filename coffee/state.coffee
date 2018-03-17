###
 0000000  000000000   0000000   000000000  00000000  
000          000     000   000     000     000       
0000000      000     000000000     000     0000000   
     000     000     000   000     000     000       
0000000      000     000   000     000     00000000  
###

{ store, error, log } = require './kxk'

class State
    
    @store = null
    
    @init: -> 
        
        return error 'State.init -- duplicate stores?' if @store?
        @store = new store 'state', separator: '|'
      
    @get:  (key, value) -> @store.get key, value
    @set:  (key, value) -> @store.set(key, value)
    @del:  (key, value) -> @store.del(key)
    @save:              -> @store.save()
        
module.exports = State
