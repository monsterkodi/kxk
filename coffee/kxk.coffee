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
kxkPath = require './path'
module.exports[k] = kxkPath[k] for k in Objects.keys kxkPath
module.exports.store       = require './store'
module.exports.prefs       = require './prefs'
module.exports.fileList    = require './fileList'
module.exports.packagePath = require './packagePath'
module.exports.keyinfo     = require './keyinfo'
module.exports.history     = require './history'
module.exports.scheme      = require './scheme'
module.exports.about       = require './about'
module.exports.popup       = require './popup'
module.exports.popupWindow = require './popupWindow'
