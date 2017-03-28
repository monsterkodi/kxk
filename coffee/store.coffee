#  0000000  000000000   0000000   00000000   00000000  
# 000          000     000   000  000   000  000       
# 0000000      000     000   000  0000000    0000000   
#      000     000     000   000  000   000  000       
# 0000000      000      0000000   000   000  00000000  
{
fileExists
}        = require './kxk'
log      = require './log'
_        = require 'lodash'
fs       = require 'fs-extra'
noon     = require 'noon'
path     = require 'path'
chokidar = require 'chokidar'
atomic   = require 'write-file-atomic'

class Store
    
    constructor: (opt) ->
        
        @timer   = null
        @watcher = null
        @file    = opt?.file
        @sep     = opt?.separator ? ':'
        @timeout = opt?.timeout ? 1000
        @changes = []
        
        fs.remove @file + ".lock" if opt?
        
        @data = @loadData()
        
        @watcher = chokidar.watch @file
        @watcher.on 'change', @onFileChange
        
        @data = _.defaults @data, opt.defaults if opt?.defaults?

    #  0000000   00000000  000000000
    # 000        000          000   
    # 000  0000  0000000      000   
    # 000   000  000          000   
    #  0000000   00000000     000   
        
    get: (key, value) ->
        return value if not key?.split?
        keypath = key.split @sep
        object = @data
        while keypath.length
            object = object[keypath.shift()]
            if not object?
                return value
        object ? value
         
    #  0000000  00000000  000000000  
    # 000       000          000     
    # 0000000   0000000      000     
    #      000  000          000     
    # 0000000   00000000     000     
    
    set: (key, value) ->
        return if not key?.split?
        clearTimeout @timer if @timer
        @timer = setTimeout @save, @timeout
        keypath = key.split @sep
        @changes.push keypath: keypath, value: value
        Store.setKeypathValue @data, keypath, value

    @setKeypathValue: (object, keypath, value) ->
        keypath = _.clone keypath
        while keypath.length > 1
            k = keypath.shift()
            if not object[k]?
                object = object[k] = {}
            else
                object = object[k]
                
        if (keypath.length == 1) and object?
            if value?
                object[keypath[0]] = value
            else
                delete object[keypath[0]]
                    
    del: (key, value) -> @set key
    
    clear: ->
        clearTimeout @timer if @timer
        @data = {}
    
    onFileChange: => 
        data = loadData()
        for c in @changes
            Store.setKeypathValue data, c.keypath, c.value
        @data = data
    
    loadData: ->
        try
            noon.load @file
        catch err
            {}
        
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
        
module.exports = Store
