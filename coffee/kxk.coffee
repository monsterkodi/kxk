###
000   000  000   000  000   000  
000  000    000 000   000  000   
0000000      00000    0000000    
000  000    000 000   000  000   
000   000  000   000  000   000  
###

childp  = require 'child_process'
crypto  = require 'crypto'
_       = require 'lodash'
os      = require 'os'
noon    = require 'noon'
sds     = require 'sds'
fs      = require 'fs-extra'
open    = require 'opener' 
walkdir = require 'walkdir'
atomic  = require 'write-file-atomic'
post    = require './ppost'
karg    = require 'karg'
colors  = require 'colors'

module.exports =
    
    _:_
    os:os
    fs:fs
    sds:sds
    karg:karg
    colors:colors
    atomic:atomic
    walkdir:walkdir
    open:open
    post:post
    noon:noon
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
    
    # 00000000  000  000      000000000  00000000  00000000   
    # 000       000  000         000     000       000   000  
    # 000000    000  000         000     0000000   0000000    
    # 000       000  000         000     000       000   000  
    # 000       000  0000000     000     00000000  000   000  
    
    filter: (o, f) ->
        
        if _.isArray o
            _.filter o, f
        else if _.isObject o
            _.pickBy o, f
        else
            o
            
    # 000   000   0000000   000      000   000  00000000
    # 000   000  000   000  000      000   000  000     
    #  000 000   000000000  000      000   000  0000000 
    #    000     000   000  000      000   000  000     
    #     0      000   000  0000000   0000000   00000000

    clamp: (r1, r2, v) -> 
        
        v = r1 if not _.isFinite v
        [s1, s2] = [Math.min(r1,r2), Math.max(r1,r2)]
        v = s1 if v < s1
        v = s2 if v > s2
        v = r1 if not _.isFinite v
        v

    fadeAngles: (a, b, f) ->
        
        if      a-b >  180 then a -= 360
        else if a-b < -180 then a += 360
        (1-f) * a + f * b
    
    fade:  (s,e,v) -> s*(1-v)+e*(v)
    last:  (a) -> _.last a
    first: (a) -> _.first a
    empty: (a) -> not _.isNumber(a) and _.isEmpty(a) or a == ''
    valid: (a) -> _.isNumber(a) or (_.isString(a) and a != '') or not _.isEmpty(a)

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
    deg2rad: (d) -> Math.PI * d / 180

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
module.exports.slash       = require './slash'

module.exports[k]          = require('./dom')[k] for k in Object.keys require './dom'
    
module.exports.drag        = require './drag'
module.exports.elem        = require './elem'
module.exports.stash       = require './stash'
module.exports.store       = require './store'
module.exports.state       = require './state'
module.exports.prefs       = require './prefs'
module.exports.fileList    = require './filelist'
module.exports.keyinfo     = require './keyinfo'
module.exports.history     = require './history'
module.exports.scheme      = require './scheme'
module.exports.about       = require './about'
module.exports.popup       = require './popup'
module.exports.menu        = require './menu'
module.exports.title       = require './title'
module.exports.matchr      = require './matchr'
module.exports.popupWindow = require './popupwindow'
module.exports.tooltip     = require './tooltip'
module.exports.args        = require './args'
module.exports.srcmap      = require './srcmap'
module.exports.watch       = require './watch'
module.exports.app         = require './app'
module.exports.win         = require './win'
module.exports.udp         = require './udp'

