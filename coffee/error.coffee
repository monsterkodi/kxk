# 00000000  00000000   00000000    0000000   00000000   
# 000       000   000  000   000  000   000  000   000  
# 0000000   0000000    0000000    000   000  0000000    
# 000       000   000  000   000  000   000  000   000  
# 00000000  000   000  000   000   0000000   000   000  

str  = require './str'
post = require './post'

error = -> 
    s = '[ERROR] ' + (str(s) for s in [].slice.call arguments, 0).join " "
    console.error s
    post.emit 'error', s
    post.emit 'log', s

module.exports = error