# 00000000    0000000   000000000  000   000
# 000   000  000   000     000     000   000
# 00000000   000000000     000     000000000
# 000        000   000     000     000   000
# 000        000   000     000     000   000

path = require 'path'
os   = require 'os'
fs   = require 'fs'

fileName  = (p) -> path.basename p, path.extname p
extName   = (p) -> path.extname(p).slice 1
splitExt  = (p) -> path.join path.dirname(p), fileName p
swapExt   = (p, ext) -> splitExt(p) + ext

unresolve = (p) -> p.replace os.homedir(), "~"
resolve   = (p) -> 
    i = p.indexOf '$'
    while i >= 0
        for k,v of process.env
            if k == p.slice i+1, i+1+k.length
                p = p.slice(0, i) + v + p.slice(i+k.length+1)
                i = p.indexOf '$'
                break
    path.normalize path.resolve p.replace /^\~/, process.env.HOME
    
fileExists = (file) ->
    file = resolve file
    try
        if fs.statSync(file).isFile()
            fs.accessSync file, fs.R_OK
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
                                                      
relative = (absolute, to) ->
    absolute = resolve absolute
    return absolute if not absolute?.startsWith '/'
    d = path.normalize path.resolve to.replace /\~/, process.env.HOME
    r = path.relative d, absolute
    if r.startsWith '../../' 
        unresolved = absolute.replace(os.homedir(), "~")
        if unresolved.length < r.length
            r = unresolved
    if absolute.length < r.length    
        r = absolute
    r
    
escapePath = (p) -> p.replace /([\`"])/g, '\\$1'

encodePath = (p) ->
    p = encodeURI p
    p = p.replace /\#/g, "%23"
    p = p.replace /\&/g, "%26"
    p = p.replace /\'/g, "%27"

splitFilePos = (file) -> # file.txt:22:33 --> ['file.txt', [33, 22]]
    split = file.split ':'
    line = parseInt split[1] if split.length > 1
    clmn = parseInt split[2] if split.length > 2
    p = [0, 0]
    p[0] = clmn     if Number.isInteger clmn
    p[1] = line - 1 if Number.isInteger line
    [split[0], p]

module.exports = 
    fileName    : fileName
    extName     : extName
    splitExt    : splitExt
    swapExt     : swapExt
    unresolve   : unresolve
    resolve     : resolve
    fileExists  : fileExists
    dirExists   : dirExists
    relative    : relative
    escapePath  : escapePath
    encodePath  : encodePath
    splitFilePos: splitFilePos
    
    
