#  0000000   0000000  000   000  00000000  00     00  00000000  
# 000       000       000   000  000       000   000  000       
# 0000000   000       000000000  0000000   000000000  0000000   
#      000  000       000   000  000       000 0 000  000       
# 0000000    0000000  000   000  00000000  000   000  00000000  
{
prefs,   
last,
elem,
post,
$}   = require './kxk'
path = require 'path'

class Scheme
    
    @toggle: (schemes = ['dark', 'bright']) ->
        link =$ 'style-link' 
        currentScheme = path.basename last(link.href.split('/')), '.css'
        nextSchemeIndex = ( schemes.indexOf(currentScheme) + 1) % schemes.length
        nextScheme = schemes[nextSchemeIndex]
        Scheme.set nextScheme
    
    @set: (scheme) ->
        scheme = path.basename scheme, '.css'
        link =$ 'style-link' 
        newlink = elem 'link', 
            href: "css/#{scheme}.css"
            rel:  'stylesheet'
            type: 'text/css'
            id:   'style-link'
        link.parentNode.replaceChild newlink, link
        prefs.set 'scheme', scheme
        post.emit 'schemeChanged', scheme
        
module.exports = Scheme
