###
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
###

{ slash, fs, _ } = require './kxk'

event   = require 'events'
walkdir = require 'walkdir'

class Watch extends event

    constructor: (path, opt) ->
        
        super()
        
        @dir = slash.resolve path
        @opt = opt ? {}
        
        slash.exists @dir, (stat) => if stat then @watchDir() 
       
    @watch: (path, opt) ->
    
        if slash.isDir path
            Watch.dir path, opt
        else
            Watch.file path, opt
    
    @file: (path, opt) ->
            
        w = Watch.dir slash.dir(path), opt
        w.file = slash.resolve path
        w
        
    @dir: (path, opt) ->
        
        new Watch path, opt

    close: ->
        
        @watch?.close()
        delete @watch
        delete @dir
        if @opt.recursive
            for watch in @watchers 
                watch.close()
            delete @watchers
        
    watchDir: ->
        
        return if not @dir
        
        @watch = fs.watch @dir
        @watch.on 'error', (err) -> error "fs.watch dir:'#{@dir}' error: #{err.stack}"
        @watch.on 'change', @onChange
        
        if @opt.recursive
            @watchers = []
            @walker = walkdir @dir
            onPath = (ignore) -> (path) -> 
                for regex in ignore
                    if new RegExp(regex).test path
                        @ignore path
                        return
            
            if @opt.ignore
                @walker.on 'path', onPath @opt.ignore
                
            @walker.on 'directory', (path) =>
                return if @ignore path
                watch = fs.watch path
                @watchers.push watch
                change = (dir) => (chg, pth) => @onChange chg, pth, dir
                watch.on 'change', change path

    ignore: (path) ->
        
        if @opt.ignore
            for regex in @opt.ignore
                if new RegExp(regex).test path
                    return true
                
    onChange: (change, path, dir=@dir) =>
        
        return if @ignore path
        
        if /\d\d\d\d\d\d\d\d?\d?$/.test slash.ext path
            return

        path = slash.join dir, path
        if @file and @file != path
            return
            
        @emit 'change', dir:dir, path:path, change:change, watch:@
        
module.exports = Watch
