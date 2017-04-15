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
            
            post.onSync 'store', (name, action, args...) =>
                return if @name != name
                switch action
                    when 'data' then return @data
    
            post.on 'store', (name, action, args...) =>
                return if @name != name
                switch action
                    when 'set'   then @set.apply @, args
                    when 'get'   then @get.apply @, args
                    when 'del'   then @del.apply @, args
                    when 'clear' then @clear()
                    when 'save'  then @save()
                @
                
        else
            post.on 'store', (name, action, args...) =>
                return if @name != name
                switch action
                    when 'data' then @data = args[0]
                    when 'set'  then setKeypath @data, @keypath(args[0]), args[1]
                    when 'get'  then getKeypath @data, @keypath(args[0]), args[1]
                    when 'del'  then setKeypath @data, @keypath(args[0])
                
        @data = @load()
        @data = _.defaults @data, opt.defaults if opt?.defaults?

    keypath: (key) -> key.split @sep
    
    #  0000000   00000000  000000000
    # 000        000          000   
    # 000  0000  0000000      000   
    # 000   000  000          000   
    #  0000000   00000000     000   
        
    get: (key, value) ->
        return value if not key?.split?
        getKeypath @data, @keypath(key), value
         
    #  0000000  00000000  000000000  
    # 000       000          000     
    # 0000000   0000000      000     
    #      000  000          000     
    # 0000000   00000000     000     
    
    set: (key, value) ->
        return if not key?.split?
        
        setKeypath @data, @keypath(key), value
        
        if @app
            clearTimeout @timer if @timer
            @timer = setTimeout @save, @timeout
            @changes.push keypath: @keypath(key), value: value
            post.toAllWins 'store', @name, 'set', key, value
        else
            post.toMain 'store', @name, 'set', key, value
                    
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
            try
                noon.load @file
            catch err
                {}
        else
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
