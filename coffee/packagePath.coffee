# 00000000    0000000    0000000  000   000   0000000    0000000   00000000  00000000    0000000   000000000  000   000  
# 000   000  000   000  000       000  000   000   000  000        000       000   000  000   000     000     000   000  
# 00000000   000000000  000       0000000    000000000  000  0000  0000000   00000000   000000000     000     000000000  
# 000        000   000  000       000  000   000   000  000   000  000       000        000   000     000     000   000  
# 000        000   000   0000000  000   000  000   000   0000000   00000000  000        000   000     000     000   000  

{ dirExists, fileExists, slash, path, log } = require './kxk'

packagePath = (p) ->
    
    if p?.length?
        
        while p.length and p not in ['.', '/']
            
            if dirExists  slash.join p, '.git'         then return slash.resolve p
            if fileExists slash.join p, 'package.noon' then return slash.resolve p
            if fileExists slash.join p, 'package.json' then return slash.resolve p
            
            p = path.dirname p
    null

module.exports = packagePath