#000       0000000    0000000 
#000      000   000  000      
#000      000   000  000  0000
#000      000   000  000   000
#0000000   0000000    0000000 

str   = require './str'
post  = require './post'
trace = require 'traceback'

log = -> 
    s = (str(s) for s in [].slice.call arguments, 0).join " "
    console.log s
    post.emit 'log', s
    stack = trace()
    stack.shift()
    caller = _.first stack
    post.emit 'slog', "#{caller.file}:#{caller.line} ⦿ #{caller.name} ▸ #{s}", stack

module.exports = log