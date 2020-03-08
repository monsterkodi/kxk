###
000   000   0000000   000000000   0000000  000   000
000 0 000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000   000  000   000     000     000       000   000
00     00  000   000     000      0000000  000   000
###

{ fs, kerror, klog, slash, walkdir } = require './kxk'

event   = require 'events'
walkdir = require 'walkdir'

class Watch extends event

    @: (path, opt) ->
        
        super()
        
        @dir  = slash.resolve path
        @opt  = opt ? {}
        @last = {}
        
        slash.exists @dir, (stat) => if stat then @watchDir()
       
    @dir: (path, opt) -> new Watch path, opt
    
    @watch: (path, opt) ->
    
        if slash.isDir path
            Watch.dir path, opt
        else
            Watch.file path, opt
    
    @file: (path, opt) ->
            
        w = Watch.dir slash.dir(path), opt
        w.file = slash.resolve path
        w
        
    # 0000000    000  00000000   
    # 000   000  000  000   000  
    # 000   000  000  0000000    
    # 000   000  000  000   000  
    # 0000000    000  000   000  
    
    watchDir: ->
        
        return if not @dir
        
        @watch = fs.watch @dir
        @watch.on 'error' (err) => kerror "watch dir:'#{@dir}' error: #{err}"
        @watch.on 'change' @onChange
        
        if @opt.recursive
            @watchers = []
            @walker = walkdir @dir
            onPath = (ignore) -> (path) -> 
                for regex in ignore
                    if new RegExp(regex).test path
                        @ignore path
                        return
            
            if @opt.ignore
                @walker.on 'path' onPath @opt.ignore
                
            @walker.on 'directory' (path) =>
                return if @ignore path
                watch = fs.watch path
                @watchers.push watch
                change = (dir) => (chg, pth) => @onChange chg, pth, dir
                watch.on 'change' change path
                watch.on 'error' (err) -> kerror "watch subdir:'#{path}' error: #{err}"

    # 000   0000000   000   000   0000000   00000000   00000000  
    # 000  000        0000  000  000   000  000   000  000       
    # 000  000  0000  000 0 000  000   000  0000000    0000000   
    # 000  000   000  000  0000  000   000  000   000  000       
    # 000   0000000   000   000   0000000   000   000  00000000  
    
    ignore: (path) ->
        
        if @opt.ignore
            for regex in @opt.ignore
                if new RegExp(regex).test path
                    return true
       
    #  0000000  000       0000000    0000000  00000000  
    # 000       000      000   000  000       000       
    # 000       000      000   000  0000000   0000000   
    # 000       000      000   000       000  000       
    #  0000000  0000000   0000000   0000000   00000000  
    
    close: ->
        
        @watch?.close()
        delete @watch
        delete @dir
        if @opt.recursive
            for watch in @watchers 
                watch.close()
            delete @watchers
                    
    #  0000000   000   000   0000000  000   000   0000000   000   000   0000000   00000000  
    # 000   000  0000  000  000       000   000  000   000  0000  000  000        000       
    # 000   000  000 0 000  000       000000000  000000000  000 0 000  000  0000  0000000   
    # 000   000  000  0000  000       000   000  000   000  000  0000  000   000  000       
    #  0000000   000   000   0000000  000   000  000   000  000   000   0000000   00000000  
    
    onChange: (change, path, dir=@dir) =>
        
        return if @ignore path
        
        path = slash.join dir, path
        
        if @file and @file != path
            return
        
        if slash.isDir path
            if @file
                klog 'ignore dir' path
                return
                        
        if stat = slash.exists path
        
            if path == @remove?.path # and change == 'rename'
                clearTimeout @remove.timer
                clearRemove = => delete @remove
                setTimeout clearRemove, 100
                return
            
            if path == @last?.path and stat.mtime.getTime() == @last?.mtime?.getTime()
                return # unchanged
            
            @last = mtime:stat.mtime, path:path
            @emit 'change' dir:dir, path:path, change:change, watch:@
            
        else
            
            @remove =
                path:  path
                timer: setTimeout ((d,p,w)->->
                    delete w.remove; 
                    w.emit 'change' dir:d, path:p, change:'remove', watch:w)(dir,path,@), 100
        
module.exports = Watch
