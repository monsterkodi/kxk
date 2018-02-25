# 00000000  00000000   00000000    0000000   00000000   
# 000       000   000  000   000  000   000  000   000  
# 0000000   0000000    0000000    000   000  0000000    
# 000       000   000  000   000  000   000  000   000  
# 00000000  000   000  000   000   0000000   000   000  

{ log, str, post } = require './kxk'

error = ->
    
    s = '[ERROR] ' + (str(s) for s in [].slice.call arguments, 0).join " "
        
    post.emit 'error', s
    console.error s
    log.slog s

module.exports = error