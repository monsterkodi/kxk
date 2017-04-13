#000       0000000    0000000 
#000      000   000  000      
#000      000   000  000  0000
#000      000   000  000   000
#0000000   0000000    0000000 

{str, post, os, process
}       = require './kxk'
sutil   = require 'stack-utils'
sorcery = require 'sorcery'
stack   = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

slog = (s) ->
    
    try # fancy log with source-mapped files and line numbers
        f = stack.capture()[2]
        if magic = sorcery.loadSync(f.getFileName())
            info = magic.trace(f.getLineNumber(), f.getFunctionName())
        else
            info = source: f.getFileName(), line: f.getLineNumber()
        p = info.source.replace os.homedir(), "~"
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

log.slog = slog

module.exports = log

