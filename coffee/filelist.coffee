# 00000000  000  000      00000000  000      000   0000000  000000000  
# 000       000  000      000       000      000  000          000     
# 000000    000  000      0000000   000      000  0000000      000     
# 000       000  000      000       000      000       000     000     
# 000       000  0000000  00000000  0000000  000  0000000      000     

{ slash, path, fs, log, _ } = require './kxk'

#   synchronous file list
#
#   paths  string or a list of strings
#          if path is relative, returned files are also relative
#          if path is absolute, returned files are also absolute
###           
    opt:  
          ignoreHidden: true # skip files that starts with a dot
          logError:     true # print message to console.log if a path doesn't exits
          depth:        0    # recurse into subdirectories if > 0
          matchExt:     null # string or list of strings to match
###

fileList = (paths, opt) ->
    
    opt ?= {}
    opt.ignoreHidden ?= true
    opt.logError     ?= true
    files = []
    paths = [paths] if _.isString paths
    
    filter = (p) ->
        
        if slash.fileName(p).toLowerCase() == 'ntuser' then return true
        
        if opt.ignoreHidden and path.basename(p).startsWith '.'
            return true
        else if opt.matchExt? 
            if _.isString(opt.matchExt) and path.extname(p) != path.extname opt.matchExt
                return true
            else if _.isArray(opt.matchExt) and path.extname(p) not in opt.matchExt
                return true
        false
    
    for p in paths
        try
            [p,pos] = slash.splitFilePos p
            stat = fs.statSync p
            
            if stat.isDirectory()
                
                children = fs.readdirSync p
                children = (slash.join(p,f) for f in children)
                childdirs = []
                for p in children
                    ps = fs.statSync p 
                    if ps.isDirectory() then childdirs.push slash.normalize p
                    else if ps.isFile()
                        if not filter p
                            if path.isAbsolute p
                                files.push slash.resolve p
                            else
                                files.push slash.normalize p 
                                    
                if opt.depth? and _.isInteger(opt.depth) and opt.depth > 0
                    copt = _.clone opt
                    copt.depth -= 1
                    for d in childdirs
                        files = files.concat fileList d, copt 

            else if stat.isFile()
                                
                continue if filter p
                
                p = slash.joinFilePos p, pos
                files.push p
                
        catch err
            if opt.logError
                log "[ERROR] kxk.fileList: #{err}"
                log "paths:", paths
                log "opt:", opt

    files

module.exports = fileList