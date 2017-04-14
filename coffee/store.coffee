#  0000000  000000000   0000000   00000000   00000000  
# 000          000     000   000  000   000  000       
# 0000000      000     000   000  0000000    0000000   
#      000     000     000   000  000   000  000       
# 0000000      000      0000000   000   000  00000000  

{ fileExists, setKeypath, getKeypath, noon, post, path, fs, log, error, _
}        = require './kxk'
chokidar = require 'chokidar'
atomic   = require 'write-file-atomic'
electron = require 'electron'

class Store
    
    constructor: (@name, opt) ->

        return error 'no name for store?' if not @name

        @app = electron.app
        @sep = opt?.separator ? ':'
        
        if @app
            log "new app store #{@name}"
            @timer   = null
            @watcher = null
            @file    = opt?.file ? (@app? and "#{@app.getPath('userData')}/#{@name}.noon")
            @timeout = opt?.timeout ? 1000
            @changes = []
            
            @watcher = chokidar.watch @file
            @watcher.on 'change', => 
                data = @load()
                for c in @changes
                    setKeypath data, c.keypath, c.value
                @data = data
                post.toAllWins 'store', @name, 'data', @data
            
            post.onSync 'store', (name, action, args) =>
                return if @name != name
                log "app.store.#{@name}.onSync", name, action, args
                switch action
                    when 'data' then return @data
    
            post.on 'store', (name, action, args) =>
                return if @name != name
                log "app.store.#{@name}.on", name, action, args
                switch action
                    when 'set'   then @set args[0], args[1]
                    when 'get'   then @get args[0], args[1]
                    when 'del'   then @del args[0]
                    when 'clear' then @clear()
                    when 'save'  then @save()
                @
                
        else
            log "new win store #{@name}"
            post.on 'store', (name, action, args) =>
                return if @name != name
                log "win.store.#{@name}.on", name, action, args
                switch action
                    when 'data' then @data = args
                    when 'set'  then setKeypath @data, args[0], args[1]
                    when 'get'  then getKeypath @data, args[0], args[1]
                    when 'del'  then setKeypath @data, args[0]
                
        @data = @load()
        @data = _.defaults @data, opt.defaults if opt?.defaults?

    #  0000000   00000000  000000000
    # 000        000          000   
    # 000  0000  0000000      000   
    # 000   000  000          000   
    #  0000000   00000000     000   
        
    get: (key, value) ->
        return value if not key?.split?
        keypath = key.split @sep
        
        getKeypath @data, keypath, value
         
    #  0000000  00000000  000000000  
    # 000       000          000     
    # 0000000   0000000      000     
    #      000  000          000     
    # 0000000   00000000     000     
    
    set: (key, value) ->
        return if not key?.split?
        keypath = key.split @sep
        
        setKeypath @data, keypath, value
        
        if @app
            clearTimeout @timer if @timer
            @timer = setTimeout @save, @timeout
            keypath = key.split @sep
            @changes.push keypath: keypath, value: value
            post.toAllWins 'set', @name, 'set', keypath, value
        else
            post.emit 'store', @name, 'set', key, value
                    
    del: (key) -> @set key
    
    clear: ->
        
        @data = {}
        
        if @app
            clearTimeout @timer if @timer
            post.toAllWins 'store', @name, 'data', {}
        else
            post.toMain 'store', @name, 'clear'
        
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    load: ->
        if @app
            log "win store #{@name} load"
            log "load from file #{@file}"
            try
                noon.load @file
            catch err
                error "can't load store file #{@file}"
                {}
        else
            log "win store #{@name} load"
            post.fromMain 'store', @name, 'data'
        
    #  0000000   0000000   000   000  00000000
    # 000       000   000  000   000  000     
    # 0000000   000000000   000 000   0000000 
    #      000  000   000     000     000     
    # 0000000   000   000      0      00000000

    save: =>
        if @app
            return if not @file
            clearTimeout @timer
    
            @timer = null
            data = @load()
            for c in @changes
                setKeypath data, c.keypath, c.value
            @data = data
            @changes = []
            str = noon.stringify @data, {indent: 2, maxalign: 8}
            @watcher.unwatch @file
            atomic.sync @file, str
            @watcher.add @file
        else 
            post.toMain 'store', @name, 'save' 
        
module.exports = Store
