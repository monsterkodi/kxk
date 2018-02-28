# 00000000    0000000   000000000  000   000
# 000   000  000   000     000     000   000
# 00000000   000000000     000     000000000
# 000        000   000     000     000   000
# 000        000   000     000     000   000

{ slash, path, error, os, fs } = require './kxk'

fileName   = (p)    -> slash.base p
extName    = (p)    -> slash.ext p
splitExt   = (p)    -> slash.removeExt p
swapExt    = (p, e) -> slash.swapExt p, e
unresolve  = (p)    -> slash.tilde p
resolve    = (p)    -> slash.resolve p
samePath   = (a, b) -> slash.samePath a, b
escapePath = (p)    -> slash.escape p
encodePath = (p)    -> slash.encode p

splitFilePos  = (p)       -> slash.splitFilePos  p
splitFileLine = (p)       -> slash.splitFileLine p
joinFilePos   = (f, p)    -> slash.joinFilePos f, p
joinFileLine  = (f, l, c) -> slash.joinFilePos f, l, c

fileExists = (p) -> slash.fileExists p
dirExists  = (p) -> slash.dirExists p
    
module.exports = 
    
    fileName     : fileName
    extName      : extName
    samePath     : samePath
    splitExt     : splitExt
    swapExt      : swapExt
    unresolve    : unresolve
    resolve      : resolve
    fileExists   : fileExists
    dirExists    : dirExists
    escapePath   : escapePath
    encodePath   : encodePath
    splitFilePos : splitFilePos
    joinFilePos  : joinFilePos
    splitFileLine: splitFileLine
    joinFileLine : joinFileLine
    
    
