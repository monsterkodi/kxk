# 00000000    0000000    0000000  000   000   0000000    0000000   00000000  00000000    0000000   000000000  000   000  
# 000   000  000   000  000       000  000   000   000  000        000       000   000  000   000     000     000   000  
# 00000000   000000000  000       0000000    000000000  000  0000  0000000   00000000   000000000     000     000000000  
# 000        000   000  000       000  000   000   000  000   000  000       000        000   000     000     000   000  
# 000        000   000   0000000  000   000  000   000   0000000   00000000  000        000   000     000     000   000  
{
resolve
}    = require './kxk'
fs   = require 'fs'
path = require 'path'

packagePath = (p) ->
    while p.length and p not in ['.', '/']            
        if fs.existsSync path.join p, 'package.noon'
            return resolve p
        if fs.existsSync path.join p, 'package.json'
            return resolve p
        if fs.existsSync path.join p, '.git'
            return resolve p
        p = path.dirname p
    null

module.exports = packagePath