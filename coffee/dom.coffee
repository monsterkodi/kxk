###
0000000     0000000   00     00
000   000  000   000  000   000
000   000  000   000  000000000
000   000  000   000  000 0 000
0000000     0000000   000   000
###

_ = require 'lodash'

module.exports =
    
    $: (idOrQueryOrElement, queryOrElement=document) ->
        if _.isString idOrQueryOrElement
            if idOrQueryOrElement[0] in ['.', "#"] or queryOrElement != document
                queryOrElement.querySelector idOrQueryOrElement
            else
                document.getElementById idOrQueryOrElement
        else if _.isElement(idOrQueryOrElement) and _.isString queryOrElement
            idOrQueryOrElement.querySelector queryOrElement
        else
            idOrQueryOrElement

    # for elem in document.querySelectorAll '.class'
            
    childIndex: (e) -> Array.prototype.indexOf.call e.parentNode.childNodes, e 

    sw: () -> document.body.clientWidth
    sh: () -> document.body.clientHeight

    stopEvent: (event) ->
        
        if event?
            event.preventDefault?()
            event.stopPropagation?()
        event
    
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
        return
        
    setStyle: (selector, key, value, ssid=0) ->
        for rule in document.styleSheets[ssid].cssRules
            if rule.selectorText == selector
                rule.style[key] = value
                return
        document.styleSheets[ssid].insertRule "#{selector} { #{key}: #{value} }", document.styleSheets[ssid].cssRules.length
        return

    getStyle: (selector, key, value, ssid=0) ->
        for rule in document.styleSheets[ssid].cssRules
            if rule.selectorText == selector
                return rule.style[key] if rule.style[key]?.length
        return value
