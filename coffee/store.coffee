###
 0000000  000000000   0000000   00000000   00000000  
000          000     000   000  000   000  000       
0000000      000     000   000  0000000    0000000   
     000     000     000   000  000   000  000       
0000000      000      0000000   000   000  00000000  
###

{ fileExists, noon, post, atomic, first, slash, fs, log, error, _ } = require './kxk'

Emitter = require 'events'
sds = require 'sds'

# simple key value store with delayed saving to userData folder
# does sync changes between processes

class Store extends Emitter

    @stores = {}
    @addStore: (store) ->

        if _.isEmpty @stores
            post.onGet 'store', (name, action, args...) =>
                switch action
                    when 'data' then return @stores[name]?.data
    
        @stores[store.name] = store

    constructor: (@name, opt={}) ->

        opt.separator ?= ':'
        opt.timeout   ?= 4000
        
        super()
        
        return error 'no name for store?' if not @name

        electron = require 'electron'
        @app = electron.app
        @sep = opt.separator
        
        if @app
            
            Store.addStore @
            
            @timer   = null
            @file    = opt.file ? (@app? and slash.join(@app.getPath('userData'), "#{@name}.noon"))
            @timeout = opt.timeout
                
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
                    when 'set'  then sds.set @data, @keypath(args[0]), args[1]
                    when 'get'  then sds.get @data, @keypath(args[0]), args[1]
                    when 'del'  then sds.set @data, @keypath(args[0])
                
        @data = @load()
        @data = _.defaults @data, opt.defaults if opt.defaults?

    keypath: (key) -> key.split @sep
    
    #  0000000   00000000  000000000
    # 000        000          000   
    # 000  0000  0000000      000   
    # 000   000  000          000   
    #  0000000   00000000     000   
        
    get: (key, value) ->
        
        return value if not key?.split?
        _.clone sds.get @data, @keypath(key), value
         
    #  0000000  00000000  000000000  
    # 000       000          000     
    # 0000000   0000000      000     
    #      000  000          000     
    # 0000000   00000000     000     
    
    set: (key, value) ->

        return if not key?.split?
        return if _.isEqual @get(key), value
        sds.set @data, @keypath(key), value
        if @app
            clearTimeout @timer
            @timer = setTimeout @save, @timeout
            post.toWins 'store', @name, 'set', key, value
        else
            post.toMain 'store', @name, 'set', key, value
                    
    del: (key) -> @set key
    
    clear: ->
        
        @data = {}
        
        if @app
            clearTimeout @timer if @timer
            post.toWins 'store', @name, 'data', {}
        else
            post.toMain 'store', @name, 'clear'
        
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    reload: ->
        if @app
            @data = @load()
            post.toWins 'store', @name, 'data', @data
    
    load: ->
        if @app
            try
                noon.load @file
            catch err
                {}
        else
            post.get 'store', @name, 'data'
        
    #  0000000   0000000   000   000  00000000
    # 000       000   000  000   000  000     
    # 0000000   000000000   000 000   0000000 
    #      000  000   000     000     000     
    # 0000000   000   000      0      00000000

    save: =>
        if @app
            return if not @file
            return if _.isEmpty @data
            
            @emit 'willSave'
            
            clearTimeout @timer
            @timer = null
            
            try
                atomic.sync @file, noon.stringify(@data, {indent: 2, maxalign: 8})+'\n'
            catch err
                error "store.save -- can't save to '#{@file}:", err
                
            @emit 'didSave'
        else 
            post.toMain 'store', @name, 'save' 
        
module.exports = Store
