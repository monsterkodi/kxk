# 00000000   00000000   00000000  00000000   0000000
# 000   000  000   000  000       000       000     
# 00000000   0000000    0000000   000000    0000000 
# 000        000   000  000       000            000
# 000        000   000  00000000  000       0000000 

Store = require './store' 

class Prefs
    
    @store = null
    
    @init: (defs={}) -> @store = new Store name:'prefs', defaults:defs
        
    @get:  (key, value) -> @store.get key, value
    @set:  (key, value) -> @store.set key, value
    @del:  (key, value) -> @store.del key
    @save:              -> @store.save()
        
module.exports = Prefs
