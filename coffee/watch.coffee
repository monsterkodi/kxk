###
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
###

{ slash, log, fs, _ } = require './kxk'

event = require 'events'

class Watch extends event

    constructor: (path, opt) ->
        
        super()
        
        @dir = slash.resolve path
        @opt = opt ? {}
        
        @watchDir()
       
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
        
        @watch.close()
        delete @watch
        
    watchDir: ->
        
        @watch = fs.watch @dir
        @watch.on 'error', (err) -> log "fs.watch dir:'#{@dir}' error: #{err.stack}"
        @watch.on 'change', @onChange
        
    onChange: (change, path) =>
        
        if /\d\d\d\d\d\d\d\d?\d?$/.test slash.ext path
            return

        path = slash.join @dir, path
        
        if @file and @file != path
            log "ignore file:#{@file} path:#{path}"
            return
            
        # log "onChange '#{change}' #{@dir} #{path}"
        @emit 'change', dir:@dir, path:path, change:change, watch:@
        
module.exports = Watch
