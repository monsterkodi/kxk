# 00000000    0000000   000000000  000   000
# 000   000  000   000     000     000   000
# 00000000   000000000     000     000000000
# 000        000   000     000     000   000
# 000        000   000     000     000   000

{ slash, path, error, os, fs } = require './kxk'

fileName  = (p) -> path.basename p, path.extname p
extName   = (p) -> path.extname(p).slice 1
splitExt  = (p) -> slash.join path.dirname(p), fileName p
swapExt   = (p, ext) -> splitExt(p) + (ext.startsWith('.') and ext or ".#{ext}")

unresolve = (p) -> slash.tilde p
resolve   = (p) -> slash.resolve p

samePath = (a, b) -> resolve(a) == resolve(b)
    
fileExists = (p) ->
    return false if not p?
    file = resolve p
    try
        if fs.statSync(p).isFile()
            fs.accessSync p, fs.R_OK
            return true
    catch 
        return false

dirExists = (dir) ->
    dir = resolve dir
    try
        if fs.statSync(dir).isDirectory()
            fs.accessSync dir, fs.R_OK
            return true
    catch
        return false
    
escapePath = (p) -> p.replace /([\`"])/g, '\\$1'

encodePath = (p) ->
    p = encodeURI p
    p = p.replace /\#/g, "%23"
    p = p.replace /\&/g, "%26"
    p = p.replace /\'/g, "%27"

splitFilePos  = (p) -> slash.splitFilePos  p # file.txt:1:3 --> ['file.txt', [3, 0]]
splitFileLine = (p) -> slash.splitFileLine p # file.txt:1:0 --> ['file.txt', 1, 0]

joinFilePos   = (file, pos) -> slash.joinFilePos file, pos # ['file.txt', [3, 0]] --> file.txt:1:3
joinFileLine  = (file, line, col) -> slash.joinFilePos file, line, col # 'file.txt', 1, 2 --> file.txt:1:2

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
    
    
