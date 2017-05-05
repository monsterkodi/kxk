# 00000000    0000000    0000000  000   000   0000000    0000000   00000000  00000000    0000000   000000000  000   000  
# 000   000  000   000  000       000  000   000   000  000        000       000   000  000   000     000     000   000  
# 00000000   000000000  000       0000000    000000000  000  0000  0000000   00000000   000000000     000     000000000  
# 000        000   000  000       000  000   000   000  000   000  000       000        000   000     000     000   000  
# 000        000   000   0000000  000   000  000   000   0000000   00000000  000        000   000     000     000   000  

{ resolve, fileExists, path, log 
} = require './kxk'

packagePath = (p) ->
    
    if p?.length?
        
        while p.length and p not in ['.', '/']
            
            if fileExists path.join p, '.git'         then return resolve p
            if fileExists path.join p, 'package.noon' then return resolve p
            if fileExists path.join p, 'package.json' then return resolve p
            
            p = path.dirname p
    null

module.exports = packagePath