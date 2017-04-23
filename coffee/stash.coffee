#  0000000  000000000   0000000    0000000  000   000  
# 000          000     000   000  000       000   000  
# 0000000      000     000000000  0000000   000000000  
#      000     000     000   000       000  000   000  
# 0000000      000     000   000  0000000   000   000  

{ setKeypath, getKeypath, noon, fs, path, log, error, _
}        = require './kxk'
atomic   = require 'write-file-atomic'

# simple key value store with delayed saving to userData folder
# does not sync between processes
 
class Stash
    
    constructor: (@name, opt) ->

        return error 'no name for stash?' if not @name
        
        electron = require 'electron'
        app  = electron.app ? electron.remote.app

        @sep = opt?.separator ? ':'
        @timer   = null
        @file    = opt?.file ? "#{app.getPath('userData')}/#{@name}.noon"
        @timeout = opt?.timeout ? 4000
        @changes = []
        
        fs.ensureDirSync path.dirname @file
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
        
        clearTimeout @timer if @timer
        @timer = setTimeout @save, @timeout
                    
    del: (key) -> @set key
    
    clear: ->
        
        @data = {}
        clearTimeout @timer
        @timer = null
        fs.removeSync @file
        
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    load: ->
        try
            noon.load @file
        catch err
            {}
        
    #  0000000   0000000   000   000  00000000
    # 000       000   000  000   000  000     
    # 0000000   000000000   000 000   0000000 
    #      000  000   000     000     000     
    # 0000000   000   000      0      00000000

    save: =>
        return if not @file
        clearTimeout @timer
        @timer = null
        try
            atomic.sync @file, noon.stringify @data, {indent: 2, maxalign: 8}
        catch err
            error "can't save stash to '#{@file}': #{err}"
        
module.exports = Stash