#000       0000000    0000000 
#000      000   000  000      
#000      000   000  000  0000
#000      000   000  000   000
#0000000   0000000    0000000 

str     = require './str'
post    = require './post'
sutil   = require 'stack-utils'
process = require 'process'
stack   = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

log = -> 
    s = (str(s) for s in [].slice.call arguments, 0).join " "    
    post.emit 'log', s        
    console.log s
    try
        f = stack.capture(2)[1]
        s = "#{f.getFileName()}:#{f.getLineNumber()} ⦿ #{f.getFunctionName()} ▸ #{s}"
        post.emit 'slog', s
    catch err
        post.emit 'slog', " ▸ #{s} #{err}"
    
module.exports = log