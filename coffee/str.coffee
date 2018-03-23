###
 0000000  000000000  00000000 
000          000     000   000
0000000      000     0000000  
     000     000     000   000
0000000      000     000   000
###

noon   = require 'noon'
entity = require 'html-entities'

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

str.encode = (s) ->
    if s
        r = entity.XmlEntities.encode s
        r = r.replace /\s/g, '&nbsp;'
    else
        ''
        
module.exports = str