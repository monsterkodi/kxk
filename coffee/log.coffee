#000       0000000    0000000 
#000      000   000  000      
#000      000   000  000  0000
#000      000   000  000   000
#0000000   0000000    0000000 

post    = require './ppost' 
str     = require './str'
os      = require 'os'
sutil   = require 'stack-utils'
sorcery = require 'sorcery'

stack   = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

slog = (s) ->
    
    slash = require './slash'
    try # fancy log with source-mapped files and line numbers
        f = stack.capture()[slog.depth]
        if magic = sorcery.loadSync(f.getFileName())
            info = magic.trace(f.getLineNumber(), f.getFunctionName())
        else
            info = source: f.getFileName(), line: f.getLineNumber()
        p = slash.tilde info.source
        m = f.getFunctionName()
        s = "#{p}:#{info.line} ⦿ #{m} ▸ #{s}"
        post.emit 'slog', s 
    catch err
        post.emit 'slog', " ▸ #{s}"

log = ->
    
    s = (str(s) for s in [].slice.call arguments, 0).join " " 
    
    post.emit 'log', s
    console.log s
    slog s

slog.depth = 2
log.slog = slog

module.exports = log

