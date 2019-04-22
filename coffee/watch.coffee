###
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
###

{ slash, log, fs, _ } = require './kxk'

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
        
        if @opt.recursive
            for watch in @watchers 
                watch.close()
            delete @watchers
        
    watchDir: ->
        
        @watch = fs.watch @dir
        @watch.on 'error', (err) -> log "fs.watch dir:'#{@dir}' error: #{err.stack}"
        @watch.on 'change', @onChange
        
        if @opt.recursive
            # log 'ignore', @opt.ignore
            @watchers = []
            @walker = walkdir @dir
            onPath = (ignore) -> (path) -> 
                for regex in ignore
                    if new RegExp(regex).test path
                        # log "ignore #{regex} #{path}"
                        @ignore path
                        return
            
            if @opt.ignore
                @walker.on 'path', onPath @opt.ignore
                
            @walker.on 'directory', (path) =>
                return if @ignore path
                # log "watch #{path}"
                watch = fs.watch path
                @watchers.push watch
                change = (dir) => (chg, pth) => @onChange chg, pth, dir
                watch.on 'change', change path

    ignore: (path) ->
        
        if @opt.ignore
            for regex in @opt.ignore
                if new RegExp(regex).test path
                    # log "ignore! #{regex} #{path}"
                    return true
                
    onChange: (change, path, dir=@dir) =>
        
        return if @ignore path
        
        # log 'onChange', change, path, dir
        if /\d\d\d\d\d\d\d\d?\d?$/.test slash.ext path
            return

        path = slash.join dir, path
        # log 'onChange---', path
        if @file and @file != path
            return
            
        @emit 'change', dir:dir, path:path, change:change, watch:@
        
module.exports = Watch
