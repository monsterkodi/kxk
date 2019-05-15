###
00000000  00000000   00000000    0000000   00000000   
000       000   000  000   000  000   000  000   000  
0000000   0000000    0000000    000   000  0000000    
000       000   000  000   000  000   000  000   000  
00000000  000   000  000   000   0000000   000   000  
###

error = ->

    { klog, str } = require './kxk'
    
    s = '[ERROR] ' + (str(s) for s in [].slice.call arguments, 0).join " "
        
    error s
    klog.slog s

module.exports = error