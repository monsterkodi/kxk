# 00000000  000  000      00000000  000      000   0000000  000000000  
# 000       000  000      000       000      000  000          000     
# 000000    000  000      0000000   000      000  0000000      000     
# 000       000  000      000       000      000       000     000     
# 000       000  0000000  00000000  0000000  000  0000000      000     

log  = require './log'
path = require 'path'
fs   = require 'fs'

fileList = (paths, opt={ignoreHidden: true, logError: true}) ->
    files = []
    paths = [paths] if typeof paths == 'string'
    for p in paths
        try
            [p,l] = p.split ':'
            stat = fs.statSync p
            if stat.isDirectory()
                dirfiles = fs.readdirSync p
                dirfiles = (path.join(p,f) for f in dirfiles)
                dirfiles = (f for f in dirfiles when fs.statSync(f).isFile())
                if opt.ignoreHidden
                    dirfiles = dirfiles.filter (f) -> not path.basename(f).startsWith '.'
                files = files.concat dirfiles
                
            else if stat.isFile()
                if opt.ignoreHidden and path.basename(p).startsWith '.'
                    continue
                p += ":#{l}" if l?
                files.push p
        catch err
            if opt.logError
                log "[ERROR] kxk.fileList: #{err}"
    files

module.exports = fileList