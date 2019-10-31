###
 0000000  000000000   0000000    0000000  000   000  
000          000     000   000  000       000   000  
0000000      000     000000000  0000000   000000000  
     000     000     000   000       000  000   000  
0000000      000     000   000  0000000   000   000  
###

{ noon, atomic, slash, fs, sds, kerror, _ } = require './kxk'

# simple key value store with delayed saving to userData folder
# does not sync between processes
 
class Stash
    
    @: (@name, opt) ->

        return kerror 'stash.constructor -- no name?' if not @name
        
        electron = require 'electron'
        app  = electron.app ? electron.remote.app

        @sep = opt?.separator ? ':'
        @timer   = null
        @file    = slash.path opt?.file ? "#{slash.userData()}/#{@name}.noon"
        @timeout = opt?.timeout ? 4000
        @changes = []
        
        fs.ensureDirSync slash.dirname @file
        @data = @load()
        @data = _.defaults @data, opt.defaults if opt?.defaults?

    keypath: (key) -> key.split @sep
    
    #  0000000   00000000  000000000
    # 000        000          000   
    # 000  0000  0000000      000   
    # 000   000  000          000   
    #  0000000   00000000     000   
        
    get: (key, value) ->
        kerror 'stash.get -- invalid key', key if not key?.split?
        return value if not key?.split?
        sds.get @data, @keypath(key), value
         
    #  0000000  00000000  000000000  
    # 000       000          000     
    # 0000000   0000000      000     
    #      000  000          000     
    # 0000000   00000000     000     
    
    set: (key, value) ->
        
        return kerror 'stash.set -- invalid key', key if not key?.split?
        sds.set @data, @keypath(key), value
        
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
            # log 'save stash', @file
            fs.ensureDirSync slash.dir @file
            atomic.sync @file, noon.stringify @data, { indent: 2, maxalign: 8 }
        catch err
            kerror "stash.save -- can't save to '#{@file}': #{err}"
        
module.exports = Stash
