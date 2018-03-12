###
00000000   00000000   00000000  00000000   0000000
000   000  000   000  000       000       000     
00000000   0000000    0000000   000000    0000000 
000        000   000  000       000            000
000        000   000  00000000  000       0000000 
###

{store, error} = require './kxk' 

class Prefs
    
    @store = null
    
    @init: (defs={}) -> 
        return error 'prefs.init -- duplicate stores?' if @store?
        @store = new store 'prefs', defaults:defs
        
    @get:  (key, value) -> @store.get key, value
    @set:  (key, value) -> @store.set key, value
    @del:  (key, value) -> @store.del key
    @save:              -> @store.save()
        
module.exports = Prefs
