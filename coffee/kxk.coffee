# 000   000  000   000  000   000  
# 000  000    000 000   000  000   
# 0000000      00000    0000000    
# 000  000    000 000   000  000   
# 000   000  000   000  000   000  

childp  = require 'child_process'
process = require 'process'
crypto  = require 'crypto'
_       = require 'lodash'
noon    = require 'noon'
path    = require 'path'
# post    = require 'ppost'
post    = require './ppost'
fs      = require 'fs-extra'
os      = require 'os'

module.exports =
    
    _:_
    os:os
    fs:fs
    post:post
    path:path
    noon:noon
    process:process
    childp:childp
    
    # 0000000    000   0000000  000000000
    # 000   000  000  000          000   
    # 000   000  000  000          000   
    # 000   000  000  000          000   
    # 0000000    000   0000000     000   

    def: (c,d) ->
        if c?
            _.defaults _.clone(c), d
        else if d?
            _.clone d
        else
            {}

    setKeypath: (object, keypath, value) ->
        keypath = _.clone keypath
        while keypath.length > 1
            k = keypath.shift()
            if not object[k]?
                object = object[k] = {}
            else
                object = object[k]
                
        if (keypath.length == 1) and object?
            if value?
                object[keypath[0]] = value
            else
                delete object[keypath[0]]

    getKeypath: (object, keypath, value) ->
        while keypath.length
            object = object[keypath.shift()]
            if not object?
                return value
        object ? value
    
    # 000   000   0000000   000      000   000  00000000
    # 000   000  000   000  000      000   000  000     
    #  000 000   000000000  000      000   000  0000000 
    #    000     000   000  000      000   000  000     
    #     0      000   000  0000000   0000000   00000000

    clamp: (r1, r2, v) -> _.clamp v, r1, r2
    last:  (a) -> _.last a
    first: (a) -> _.first a
    empty: (a) -> _.isEmpty(a) or a == ''
    valid: (a) -> not module.exports.empty a

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

    reversed: (a) -> _.clone(a).reverse()
                                    
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

module.exports.str         = require './str'
module.exports.log         = require './log'
module.exports.error       = require './error'
module.exports.pos         = require './pos'
module.exports[k]          = require('./dom')[k] for k in Object.keys require './dom'
module.exports[k]          = require('./path')[k] for k in Object.keys require './path' 
module.exports.drag        = require './drag'
module.exports.elem        = require './elem'
module.exports.stash       = require './stash'
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
