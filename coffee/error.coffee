# 00000000  00000000   00000000    0000000   00000000   
# 000       000   000  000   000  000   000  000   000  
# 0000000   0000000    0000000    000   000  0000000    
# 000       000   000  000   000  000   000  000   000  
# 00000000  000   000  000   000   0000000   000   000  

{str, post, os, process} = require './kxk'

sutil   = require 'stack-utils'
sorcery = require 'sorcery'

stack = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

error = ->
    s = '[ERROR] ' + (str(s) for s in [].slice.call arguments, 0).join " "
        
    post.emit 'error', s
    console.error s
    
    try # something fancy. might be too slow though ...
        f = stack.capture(2)[1]
        l = sorcery.loadSync(f.getFileName()).trace(f.getLineNumber(), f.getFunctionName())
        p = (l.source ? f.getFileName()).replace os.homedir(), "~"
        n = l.line ? f.getLineNumber()
        m = f.getFunctionName()
        s = "#{p}:#{n} ⦿ #{m} ▸ #{s}"
        post.emit 'slog', s 
    catch err
        post.emit 'slog', " ▸ #{s} #{err}"

module.exports = error