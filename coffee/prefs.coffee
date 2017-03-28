# 00000000   00000000   00000000  00000000   0000000
# 000   000  000   000  000       000       000     
# 00000000   0000000    0000000   000000    0000000 
# 000        000   000  000       000            000
# 000        000   000  00000000  000       0000000 

log      = require './log'
Store    = require './store' 

class Prefs
    
    @store = null
    
    @init: (defs={}) -> 
        electron = require 'electron'
        app = electron.app ? electron.remote.app
        file = "#{app.getPath('userData')}/prefs.noon"
        @store = new Store file:file, defaults:defs
        
    @get:  (key, value) -> @store.get key, value
    @set:  (key, value) -> @store.set key, value
    @del:  (key, value) -> @store.del key
    @save:              -> @store.save()
        
module.exports = Prefs
