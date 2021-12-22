###
00000000  00000000   00000000    0000000   00000000   
000       000   000  000   000  000   000  000   000  
0000000   0000000    0000000    000   000  0000000    
000       000   000  000   000  000   000  000   000  
00000000  000   000  000   000   0000000   000   000  
###

module.exports =  ->

    kxk = require './kxk'
    
    s = '[ERROR] ' + (kxk.kstr(s) for s in [].slice.call arguments, 0).join " "
        
    error s
    kxk.klog?.slog s