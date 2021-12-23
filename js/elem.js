// monsterkodi/kode 0.210.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var elem, _

_ = require('lodash')

elem = function (typ, opt)
{
    var c, e, event, k, _22_15_, _26_15_, _30_16_, _34_19_, _39_17_

    if (typ && typeof(typ) === 'object')
    {
        opt = typ
        typ = opt.typ
    }
    opt = (opt != null ? opt : {})
    typ = (typ != null ? typ : 'div')
    e = document.createElement(typ)
    if ((opt.text != null) && ((function(o){return (typeof o === 'string' || o instanceof String)})(opt.text) || (function(o){return !isNaN(o) && !isNaN(parseFloat(o)) && isFinite(o)})(opt.text)))
    {
        e.textContent = opt.text
        delete opt.text
    }
    if ((opt.html != null) && (function(o){return (typeof o === 'string' || o instanceof String)})(opt.html))
    {
        e.innerHTML = opt.html
        delete opt.html
    }
    if ((opt.child != null) && _.isElement(opt.child))
    {
        e.appendChild(opt.child)
        delete opt.child
    }
    if ((opt.children != null) && opt.children instanceof Array)
    {
        var list = _k_.list(opt.children)
        for (var _35_14_ = 0; _35_14_ < list.length; _35_14_++)
        {
            c = list[_35_14_]
            if (_.isElement(c))
            {
                e.appendChild(c)
            }
        }
        delete opt.children
    }
    if ((opt.parent != null) && _.isElement(opt.parent))
    {
        opt.parent.appendChild(e)
        delete opt.parent
    }
    var list1 = ['mousedown','mousemove','mouseup','click','dblclick']
    for (var _43_14_ = 0; _43_14_ < list1.length; _43_14_++)
    {
        event = list1[_43_14_]
        if (opt[event] && typeof(opt[event]) === 'function')
        {
            e.addEventListener(event,opt[event])
            delete opt[event]
        }
    }
    var list2 = _k_.list(Object.keys(opt))
    for (var _48_10_ = 0; _48_10_ < list2.length; _48_10_++)
    {
        k = list2[_48_10_]
        e.setAttribute(k,opt[k])
    }
    return e
}

elem.containsPos = function (div, pos)
{
    var br

    br = div.getBoundingClientRect()
    return br.left <= pos.x <= br.left + br.width && (br.top <= pos.y && pos.y <= br.top + br.height)
}

elem.childIndex = function (e)
{
    return Array.prototype.indexOf.call(e.parentNode.childNodes,e)
}

elem.upAttr = function (element, attr)
{
    var a, _62_28_

    if (!(element != null))
    {
        return null
    }
    a = (typeof element.getAttribute === "function" ? element.getAttribute(attr) : undefined)
    if (a !== null && a !== '')
    {
        return a
    }
    return elem.upAttr(element.parentNode,attr)
}

elem.upProp = function (element, prop)
{
    if (!(element != null))
    {
        return null
    }
    if ((element[prop] != null))
    {
        return element[prop]
    }
    return elem.upProp(element.parentNode,prop)
}

elem.upElem = function (element, opt)
{
    var _75_30_, _76_31_, _77_31_, _77_57_, _77_68_, _78_32_, _78_55_

    if (!(element != null))
    {
        return null
    }
    if (((opt != null ? opt.tag : undefined) != null) && opt.tag === element.tagName)
    {
        return element
    }
    if (((opt != null ? opt.prop : undefined) != null) && (element[opt.prop] != null))
    {
        return element
    }
    if (((opt != null ? opt.attr : undefined) != null) && ((typeof element.getAttribute === "function" ? element.getAttribute(opt.attr) : undefined) != null))
    {
        return element
    }
    if (((opt != null ? opt.class : undefined) != null) && (element.classList != null ? element.classList.contains(opt.class) : undefined))
    {
        return element
    }
    return elem.upElem(element.parentNode,opt)
}

elem.downElem = function (element, opt)
{
    var child, found, _84_30_, _85_16_, _86_40_, _87_16_, _87_42_, _87_53_, _88_40_

    if (!(element != null))
    {
        return null
    }
    if (((opt != null ? opt.tag : undefined) != null) && opt.tag === element.tagName)
    {
        return element
    }
    if (((opt != null ? opt.prop : undefined) != null) && (element[opt.prop] != null))
    {
        if (!((opt != null ? opt.value : undefined) != null) || element[opt.prop] === opt.value)
        {
            return element
        }
    }
    if (((opt != null ? opt.attr : undefined) != null) && ((typeof element.getAttribute === "function" ? element.getAttribute(opt.attr) : undefined) != null))
    {
        if (!((opt != null ? opt.value : undefined) != null) || element.getAttribute(opt.attr) === opt.value)
        {
            return element
        }
    }
    var list = _k_.list(element.children)
    for (var _89_14_ = 0; _89_14_ < list.length; _89_14_++)
    {
        child = list[_89_14_]
        if (found = elem.downElem(child,opt))
        {
            return found
        }
    }
}
module.exports = elem