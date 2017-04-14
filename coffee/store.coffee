#  0000000  000000000   0000000   00000000   00000000  
# 000          000     000   000  000   000  000       
# 0000000      000     000   000  0000000    0000000   
#      000     000     000   000  000   000  000       
# 0000000      000      0000000   000   000  00000000  

{ fileExists, setKeypath, getKeypath, noon, post, path, fs, log, _
}        = require './kxk'
chokidar = require 'chokidar'
atomic   = require 'write-file-atomic'
electron = require 'electron'

class Store
    
    constructor: (opt) ->

        @app  = electron.app
        @name = opt?.name
        @sep  = opt?.separator ? ':'
        
        if @app
            @timer   = null
            @watcher = null
            @file    = opt?.file ? (@app? and "#{app.getPath('userData')}/#{@name}.noon")
            @timeout = opt?.timeout ? 1000
            @changes = []
            @watcher = chokidar.watch @file
            @watcher.on 'change', @onFileChange
                
        @data = @loadData()
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
        
        setKeypath @data, keypath, value
        
        if @app
            clearTimeout @timer if @timer
            @timer = setTimeout @save, @timeout
            keypath = key.split @sep
            @changes.push keypath: keypath, value: value
        else
            post.emit 'store', @name, 'set', key, value
                    
    del: (key) -> @set key
    
    clear: ->
        
        @data = {}
        
        if @app
            clearTimeout @timer if @timer
            post.toAllWins 'store', @name, 'clear'
        else
            post.toAll 'store', @name, 'clear'
        
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    loadData: ->
        
        if @app
            log "loadData from file #{@file}"
            try
                noon.load @file
            catch err
                error "can't load store file #{@file}"
                {}
        else
            log 'loadData from main'
            @data = post.sendSync 'store', @name, 'loadData'
        
    #  0000000   0000000   000   000  00000000
    # 000       000   000  000   000  000     
    # 0000000   000000000   000 000   0000000 
    #      000  000   000     000     000     
    # 0000000   000   000      0      00000000

    save: () =>
        return if not @file
        clearTimeout @timer
        lockFile = @file + ".lock"         
        if fileExists lockFile
            @timer = setTimeout @save, 100
            return
        fs.ensureFileSync lockFile
        @timer = null
        data = @loadData()
        for c in @changes
            Store.setKeypathValue data, c.keypath, c.value
        @data = data
        @changes = []
        str = noon.stringify @data, {indent: 2, maxalign: 8}
        @watcher.unwatch @file
        atomic.sync @file, str
        @watcher.add @file
        fs.remove lockFile
        
    # 000   000   0000000   000000000   0000000  000   000    
    # 000 0 000  000   000     000     000       000   000    
    # 000000000  000000000     000     000       000000000    
    # 000   000  000   000     000     000       000   000    
    # 00     00  000   000     000      0000000  000   000    
        
    onFileChange: => 
        data = @loadData()
        for c in @changes
            Store.setKeypathValue data, c.keypath, c.value
        @data = data

module.exports = Store
