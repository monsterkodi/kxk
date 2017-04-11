#000       0000000    0000000 
#000      000   000  000      
#000      000   000  000  0000
#000      000   000  000   000
#0000000   0000000    0000000 

{str, post} = require './kxk'

os      = require 'os'
sutil   = require 'stack-utils'
process = require 'process'
sorcery = require 'sorcery'

stack = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

log = ->
    s = (str(s) for s in [].slice.call arguments, 0).join " " 
    
    post.emit 'log', s
    console.log s
    
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

module.exports = log

