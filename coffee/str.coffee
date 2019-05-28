###
 0000000  000000000  00000000 
000          000     000   000
0000000      000     0000000  
     000     000     000   000
0000000      000     000   000
###

_      = require 'lodash'
noon   = require 'noon'
entity = require 'html-entities'
time   = require 'pretty-time'

xmlEntities = new entity.XmlEntities()

str = (o) ->
    return 'null' if not o?
    if typeof(o) == 'object'
        if o._str?
            o._str()
        else
            "\n" + noon.stringify o, circular: true
    else
        String o

###
00000000  000   000   0000000   0000000   0000000    00000000
000       0000  000  000       000   000  000   000  000     
0000000   000 0 000  000       000   000  000   000  0000000 
000       000  0000  000       000   000  000   000  000     
00000000  000   000   0000000   0000000   0000000    00000000
###

str.encode = (s, spaces=true) ->
    if s
        r = xmlEntities.encode s
        if spaces
            r = r.replace /\s/g, '&nbsp;'
        r
    else
        ''
  
# ESCAPEREGEXP = /[\\^$*+?.()|[\]{}]/g
ESCAPEREGEXP = /[-\\^$*+?.()|[\]{}\/]/g
str.escapeRegexp = (s) ->
    s.replace ESCAPEREGEXP, '\\$&'
        
STRIPANSI = /\x1B[[(?);]{0,2}(;?\d)*./g
str.stripansi = (s) ->
    s.replace STRIPANSI, ''
        
str.replaceTabs = (s) ->
    i = 0
    while i < s.length
        if s[i] == '\t'
            s = s.splice i, 1, _.padStart "", 4-(i%4)
        i += 1
    s
    
str.time = (t) ->
    if typeof(t) == 'bigint'
        f = 1000n 
        for u in ['ns''μs''ms''s'] 
            if u == 's' or t < f 
                return '' + (1000n * t / f) + u 
            f *= 1000n    
    else
        time t
        
module.exports = str
