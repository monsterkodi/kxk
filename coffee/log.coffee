#000       0000000    0000000 
#000      000   000  000      
#000      000   000  000  0000
#000      000   000  000   000
#0000000   0000000    0000000 

str  = require './str'
post = require './post'

log = -> 
    s = (str(s) for s in [].slice.call arguments, 0).join " "
    console.log s
    post.emit 'log', s

module.exports = log