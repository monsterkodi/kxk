###
00000000  000      00000000  00     00  
000       000      000       000   000  
0000000   000      0000000   000000000  
000       000      000       000 0 000  
00000000  0000000  00000000  000   000  
###

_ = require 'lodash'

elem = (typ, opt) ->
    
    if _.isPlainObject typ
        opt = typ 
        typ = opt.typ
        
    opt ?= {}   
    typ ?= 'div'

    e = document.createElement typ
    
    if opt.text? and (_.isString(opt.text) or _.isNumber(opt.text))
        e.textContent = opt.text
        delete opt.text
    
    if opt.html? and _.isString opt.html
        e.innerHTML = opt.html
        delete opt.html
    
    if opt.child? and _.isElement opt.child
        e.appendChild opt.child
        delete opt.child
        
    if opt.children? and _.isArray opt.children
        for c in opt.children
            e.appendChild c if _.isElement c
        delete opt.children
        
    for event in ['mousedown', 'mousemove', 'mouseup', 'click', 'dblclick']
        if opt[event] and _.isFunction opt[event]
            e.addEventListener event, opt[event]
            delete opt[event]
            
    for k in Object.keys opt
        e.setAttribute k, opt[k]
    e

elem.containsPos = (div, pos) ->
    
    br = div.getBoundingClientRect()
    br.left <= pos.x <= br.left+br.width and br.top <= pos.y <= br.top+br.height

elem.childIndex = (e) -> Array.prototype.indexOf.call e.parentNode.childNodes, e 

elem.upAttr = (element, attr) ->
    
    return null if not element?
    a = element.getAttribute? attr
    return a if a != null and a != ''
    elem.upAttr element.parentNode, attr

elem.upProp = (element, prop) ->
    
    return null if not element?
    return element[prop] if element[prop]?
    elem.upProp element.parentNode, prop
    
elem.upElem = (element, opt) ->
    
    return null if not element?
    return element if opt?.tag? and opt.tag == element.tagName
    return element if opt?.prop? and element[opt.prop]?
    return element if opt?.attr? and element.getAttribute?(opt.attr)?
    return element if opt?.class? and element.classList?.contains opt.class
    elem.upElem element.parentNode, opt

elem.downElem = (element, opt) ->
    
    return null if not element?
    return element if opt?.tag? and opt.tag == element.tagName
    if opt?.prop? and element[opt.prop]?
        return element if not opt?.value? or element[opt.prop] == opt.value
    if opt?.attr? and element.getAttribute?(opt.attr)?
        return element if not opt?.value? or element.getAttribute(opt.attr) == opt.value
    for child in element.children
        if found = elem.downElem child, opt
            return found
    
module.exports = elem

