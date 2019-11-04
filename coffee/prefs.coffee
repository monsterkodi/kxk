###
00000000   00000000   00000000  00000000   0000000
000   000  000   000  000       000       000     
00000000   0000000    0000000   000000    0000000 
000        000   000  000       000            000
000        000   000  00000000  000       0000000 
###

{ store, slash, klog, kerror, fs, _ } = require './kxk'

class Prefs
    
    @store   = null
    @watcher = null
    
    @init: (opt={}) ->

        return error 'prefs.init -- duplicate stores?' if @store?
        @store = new store 'prefs' opt
        @store.on 'willSave' @unwatch
        @store.on 'didSave'  @watch
        @watch() 
      
    @unwatch: =>
        
        return if not @store.app?
        
        @watcher?.close()
        @watcher = null
        
    @watch: =>
        
        return if not @store.app?
        
        slash.error = klog
        if slash.touch @store.file
        
            @unwatch()
            @watcher = fs.watch @store.file
            @watcher
                .on 'change' @onFileChange
                .on 'rename' @onFileUnlink
                .on 'error'  (err) -> kerror 'Prefs watch error' err
                
        else
            kerror "can't touch prefs file #{@store.file}"
        
    @onFileChange: => @store.reload()
    @onFileUnlink: => @unwatch(); @store.clear()
            
    @get:  (key, value) -> if @store then @store.get(key, value) else _.cloneDeep value
    @set:  (key, value) -> @unwatch(); @store.set(key, value); @watch()
    @del:  (key, value) -> @unwatch(); @store.del(key); @watch()
    @save:              -> @store?.save()
    
    @toggle: (key, cb) -> 
        val = not @get key, false
        @set key, val
        cb? val
        
    @apply: (key, deflt=false, cb) ->
        if not cb? and deflt != false
            cb = deflt
        cb? @get key, deflt
        
module.exports = Prefs
