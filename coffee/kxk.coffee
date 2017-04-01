# 000   000  000   000  000   000  
# 000  000    000 000   000  000   
# 0000000      00000    0000000    
# 000  000    000 000   000  000   
# 000   000  000   000  000   000  

_       = require 'lodash'
os      = require 'os'
fs      = require 'fs'
path    = require 'path'
process = require 'process'
crypto  = require 'crypto'

module.exports =
    
    # 0000000    000   0000000  000000000
    # 000   000  000  000          000   
    # 000   000  000  000          000   
    # 000   000  000  000          000   
    # 0000000    000   0000000     000   

    def: (c,d) ->
        if c?
            _.defaults(_.clone(c), d)
        else if d?
            _.clone(d)
        else
            {}

    #  0000000   00000000   00000000    0000000   000   000
    # 000   000  000   000  000   000  000   000   000 000 
    # 000000000  0000000    0000000    000000000    00000  
    # 000   000  000   000  000   000  000   000     000   
    # 000   000  000   000  000   000  000   000     000   

    last:  (a) -> 
        if not _.isArray a
            return a
        if a?.length
            return a[a.length-1]
        null
        
    first: (a) ->
        if not _.isArray a
            return a
        if a?.length
            return a[0]
        null

    # 000   000   0000000   000      000   000  00000000
    # 000   000  000   000  000      000   000  000     
    #  000 000   000000000  000      000   000  0000000 
    #    000     000   000  000      000   000  000     
    #     0      000   000  0000000   0000000   00000000

    clamp: (r1, r2, v) ->
        if r1 > r2
            [r1,r2] = [r2,r1]
        v = Math.max(v, r1) if r1?
        v = Math.min(v, r2) if r2?
        v

    absMax: (a,b) -> if Math.abs(a) >= Math.abs(b) then a else b
    absMin: (a,b) -> if Math.abs(a)  < Math.abs(b) then a else b
        
    randInt: (r) -> Math.floor Math.random() * r
        
    shortCount: (v) ->
        v = parseInt v
        switch
            when v > 999999 then "#{Math.floor v/1000000}M"
            when v > 999    then "#{Math.floor v/1000}k"
            else                 "#{v}"
       
    rad2deg: (r) -> 180 * r / Math.PI
            
    # 00000000    0000000   000000000  000   000
    # 000   000  000   000     000     000   000
    # 00000000   000000000     000     000000000
    # 000        000   000     000     000   000
    # 000        000   000     000     000   000
    
    unresolve: (p) -> p.replace os.homedir(), "~"    
    fileName:  (p) -> path.basename p, path.extname p
    extName:   (p) -> path.extname(p).slice 1
    resolve:   (p) -> 
        i = p.indexOf '$'
        while i >= 0
            for k,v of process.env
                if k == p.slice i+1, i+1+k.length
                    p = p.slice(0, i) + v + p.slice(i+k.length+1)
                    i = p.indexOf '$'
                    break
        path.normalize path.resolve p.replace /^\~/, process.env.HOME
    
    fileExists: (file) ->
        try
            if fs.statSync(file).isFile()
                fs.accessSync file, fs.R_OK
                return true
        catch 
            return false

    dirExists: (dir) ->
        try
            if fs.statSync(dir).isDirectory()
                fs.accessSync dir, fs.R_OK
                return true
        catch
            return false
                                                          
    relative: (absolute, to) ->
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
        
    swapExt: (p, ext) -> path.join(path.dirname(p), path.basename(p, path.extname(p))) + ext

    escapePath: (p) -> p.replace /([\`"])/g, '\\$1'

    encodePath: (p) ->
        p = encodeURI p
        p = p.replace /\#/g, "%23"
        p = p.replace /\&/g, "%26"
        p = p.replace /\'/g, "%27"

    splitFilePos: (file) -> # file.txt:22:33 --> ['file.txt', [33, 22]]
        split = file.split ':'
        line = parseInt split[1] if split.length > 1
        clmn = parseInt split[2] if split.length > 2
        p = [0, 0]
        p[0] = clmn     if Number.isInteger clmn
        p[1] = line - 1 if Number.isInteger line
        [split[0], p]

    packagePath: (p) ->
        while p.length and p not in ['.', '/']            
            if fs.existsSync path.join p, 'package.noon'
                return resolve p
            if fs.existsSync path.join p, 'package.json'
                return resolve p
            if fs.existsSync path.join p, '.git'
                return resolve p
            p = path.dirname p
        null
            
    #  0000000   0000000   0000000
    # 000       000       000     
    # 000       0000000   0000000 
    # 000            000       000
    #  0000000  0000000   0000000 

    style: (selector, rule) ->
        for i in [0...document.styleSheets[0].cssRules.length]
            r = document.styleSheets[0].cssRules[i]
            if r?.selectorText == selector
                document.styleSheets[0].deleteRule i
        document.styleSheets[0].insertRule "#{selector} { #{rule} }", document.styleSheets[0].cssRules.length
    
    setStyle: (selector, key, value, ssid=0) ->
        for rule in document.styleSheets[ssid].cssRules
            if rule.selectorText == selector
                rule.style[key] = value
                return
        document.styleSheets[ssid].insertRule "#{selector} { #{key}: #{value} }", document.styleSheets[ssid].cssRules.length

    getStyle: (selector, key, value, ssid=0) ->
        for rule in document.styleSheets[ssid].cssRules
            if rule.selectorText == selector
                return rule.style[key]
        return value
                
    # 0000000     0000000   00     00
    # 000   000  000   000  000   000
    # 000   000  000   000  000000000
    # 000   000  000   000  000 0 000
    # 0000000     0000000   000   000
        
    $: (idOrClass, e=document) -> 
        if idOrClass[0] in ['.', "#"] or e != document
            e.querySelector idOrClass
        else
            document.getElementById idOrClass

    childIndex: (e) -> Array.prototype.indexOf.call(e.parentNode.childNodes, e)

    sw: () -> document.body.clientWidth
    sh: () -> document.body.clientHeight

    #  0000000   0000000  00000000   000  00000000   000000000  
    # 000       000       000   000  000  000   000     000     
    # 0000000   000       0000000    000  00000000      000     
    #      000  000       000   000  000  000           000     
    # 0000000    0000000  000   000  000  000           000     
    
    osascript: (script) -> ( "-e \"#{l.replace(/\"/g, "\\\"")}\"" for l in script.split("\n") ).join(" ")

#  0000000  000000000  00000000   000  000   000   0000000 
# 000          000     000   000  000  0000  000  000      
# 0000000      000     0000000    000  000 0 000  000  0000
#      000     000     000   000  000  000  0000  000   000
# 0000000      000     000   000  000  000   000   0000000 
    
if not String.prototype.splice
    String.prototype.splice = (start, delCount, newSubStr='') ->
        @slice(0, start) + newSubStr + @slice(start + Math.abs(delCount))
if not String.prototype.strip
    String.prototype.strip = String.prototype.trim
if not String.prototype.hash
    String.prototype.hash = -> crypto.createHash('md5').update(@.valueOf(), 'utf8').digest('hex')

#  0000000   00000000   00000000    0000000   000   000
# 000   000  000   000  000   000  000   000   000 000 
# 000000000  0000000    0000000    000000000    00000  
# 000   000  000   000  000   000  000   000     000   
# 000   000  000   000  000   000  000   000     000   

if not Array.prototype.reversed
    Array.prototype.reversed = ->
        _.clone(@).reverse()

module.exports.post        = require './post'
module.exports.str         = require './str'
module.exports.log         = require './log'
module.exports.pos         = require './pos'
module.exports.drag        = require './drag'
module.exports.elem        = require './elem'
module.exports.store       = require './store'
module.exports.prefs       = require './prefs'
module.exports.about       = require './about'
module.exports.keyinfo     = require './keyinfo'
module.exports.history     = require './history'
module.exports.fileList    = require './fileList'
module.exports.popup       = require './popup'
module.exports.popupWindow = require './popupWindow'
module.exports.scheme      = require './scheme'
