# 00000000    0000000   000000000  000   000
# 000   000  000   000     000     000   000
# 00000000   000000000     000     000000000
# 000        000   000     000     000   000
# 000        000   000     000     000   000

error = require './error'
path  = require 'path'
os    = require 'os'
fs    = require 'fs'

fileName  = (p) -> path.basename p, path.extname p
extName   = (p) -> path.extname(p).slice 1
splitExt  = (p) -> path.join path.dirname(p), fileName p
swapExt   = (p, ext) -> splitExt(p) + (ext.startsWith('.') and ext or ".#{ext}")

unresolve = (p) -> p.replace os.homedir(), "~"
resolve   = (p) -> 
    return error "no path to resolve? #{p}" if not p? or p.length == 0
    i = p.indexOf '$'
    while i >= 0
        for k,v of process.env
            if k == p.slice i+1, i+1+k.length
                p = p.slice(0, i) + v + p.slice(i+k.length+1)
                i = p.indexOf '$'
                break
    path.normalize path.resolve p.replace /^\~/, os.homedir()

samePath = (pa, pb) -> resolve(pa) == resolve(pb)
    
fileExists = (file) ->
    return false if not file?
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

removeDrive = (file) ->
    if path.sep == '\\'
        root = path.parse(file).root
        if root.length
            return file.slice root.length-1
    file

splitFilePos = (file) -> # file.txt:1:3 --> ['file.txt', [3, 0]]
    file = removeDrive file
    split = String(file).split ':'
    line = parseInt split[1] if split.length > 1
    clmn = parseInt split[2] if split.length > 2
    p = [0, 0]
    p[0] = clmn     if Number.isInteger clmn
    p[1] = line - 1 if Number.isInteger line
    [split[0], p]

joinFilePos = (file, pos) -> # ['file.txt', [3, 0]] --> file.txt:1:3
    if not pos? or not pos[0] and not pos[1]
        file
    else if pos[0]
        file + ":#{pos[1]+1}:#{pos[0]}"
    else
        file + ":#{pos[1]+1}"
        
splitFileLine = (fileLine) ->  # file.txt:1:0 --> ['file.txt', 1, 0]
    split = String(fileLine).split ':'
    line = parseInt split[1] if split.length > 1
    clmn = parseInt split[2] if split.length > 2
    l = c = 0
    l = line if Number.isInteger line
    c = clmn if Number.isInteger clmn
    [split[0], l, c]
    
joinFileLine  = (file, line, col) -> # 'file.txt', 1, 2 --> file.txt:1:2
    return file if not line?
    return "#{file}:#{line}" if not col?
    "#{file}:#{line}:#{col}"

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
    relative     : relative
    escapePath   : escapePath
    encodePath   : encodePath
    splitFilePos : splitFilePos
    joinFilePos  : joinFilePos
    splitFileLine: splitFileLine
    joinFileLine : joinFileLine
    
    
