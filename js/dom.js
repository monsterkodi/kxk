// monsterkodi/kode 0.222.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var _

_ = require('lodash')
module.exports = {$:function (idOrQueryOrElement, queryOrElement = document)
{
    if ((function(o){return (typeof o === 'string' || o instanceof String)})(idOrQueryOrElement))
    {
        if (_k_.in(idOrQueryOrElement[0],['.',"#"]) || queryOrElement !== document)
        {
            return queryOrElement.querySelector(idOrQueryOrElement)
        }
        else
        {
            return document.getElementById(idOrQueryOrElement)
        }
    }
    else if (_.isElement(idOrQueryOrElement) && (function(o){return (typeof o === 'string' || o instanceof String)})(queryOrElement))
    {
        return idOrQueryOrElement.querySelector(queryOrElement)
    }
    else
    {
        return idOrQueryOrElement
    }
},childIndex:function (e)
{
    return Array.prototype.indexOf.call(e.parentNode.childNodes,e)
},sw:function ()
{
    return document.body.clientWidth
},sh:function ()
{
    return document.body.clientHeight
},stopEvent:function (event)
{
    if ((event != null) && typeof(event.preventDefault) === 'function' && typeof(event.stopPropagation) === 'function')
    {
        event.preventDefault()
        event.stopPropagation()
    }
    return event
},setStyle:function (selector, key, value, ssid = 0)
{
    var rule

    var list = _k_.list(document.styleSheets[ssid].cssRules)
    for (var _43_17_ = 0; _43_17_ < list.length; _43_17_++)
    {
        rule = list[_43_17_]
        if (rule.selectorText === selector)
        {
            rule.style[key] = value
            return
        }
    }
    document.styleSheets[ssid].insertRule(`${selector} { ${key}: ${value} }`,document.styleSheets[ssid].cssRules.length)
    return
},getStyle:function (selector, key, value, ssid = 0)
{
    var rule

    var list = _k_.list(document.styleSheets[ssid].cssRules)
    for (var _51_17_ = 0; _51_17_ < list.length; _51_17_++)
    {
        rule = list[_51_17_]
        if (rule.selectorText === selector)
        {
            if ((rule.style[key] != null ? rule.style[key].length : undefined))
            {
                return rule.style[key]
            }
        }
    }
    return value
}}