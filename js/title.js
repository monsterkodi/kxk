// monsterkodi/kode 0.196.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, clone: function (o,v) { v ??= new Map(); if (o instanceof Array) { if (!v.has(o)) {var r = []; v.set(o,r); for (var i=0; i < o.length; i++) {if (!v.has(o[i])) { v.set(o[i],_k_.clone(o[i],v)) }; r.push(v.get(o[i]))}}; return v.get(o) } else if (typeof o == 'string') { if (!v.has(o)) {v.set(o,''+o);}; return v.get(o) } else if (typeof o == 'object' && o.constructor.name == 'Object') { if (!v.has(o)) {var r = {}; v.set(o,r); for (k in o) {if (!v.has(o[k])) { v.set(o[k],_k_.clone(o[k],v)) }; r[k] = v.get(o[k])}; }; return v.get(o) } else {return o} }, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var $, drag, elem, keyinfo, kstr, kxk, menu, post, prefs, scheme, sds, slash, stopEvent, Title, _

kxk = require('./kxk')
$ = kxk.$
_ = kxk._
drag = kxk.drag
elem = kxk.elem
keyinfo = kxk.keyinfo
kstr = kxk.kstr
menu = kxk.menu
noon = kxk.noon
post = kxk.post
prefs = kxk.prefs
scheme = kxk.scheme
sds = kxk.sds
slash = kxk.slash
stopEvent = kxk.stopEvent


Title = (function ()
{
    function Title (opt)
    {
        var pkg, _16_13_, _20_27_

        this.opt = opt
        this["openMenu"] = this["openMenu"].bind(this)
        this["toggleMenu"] = this["toggleMenu"].bind(this)
        this["hideMenu"] = this["hideMenu"].bind(this)
        this["showMenu"] = this["showMenu"].bind(this)
        this["menuVisible"] = this["menuVisible"].bind(this)
        this["onMenuAction"] = this["onMenuAction"].bind(this)
        this["onTitlebar"] = this["onTitlebar"].bind(this)
        this["onDragMove"] = this["onDragMove"].bind(this)
        this["onDragStart"] = this["onDragStart"].bind(this)
        this.opt = ((_16_13_=this.opt) != null ? _16_13_ : {})
        pkg = this.opt.pkg
        this.elem = $(((_20_27_=this.opt.elem) != null ? _20_27_ : "#titlebar"))
        if (!this.elem)
        {
            return
        }
        post.on('titlebar',this.onTitlebar)
        post.on('menuAction',this.onMenuAction)
        this.elem.addEventListener('dblclick',function (event)
        {
            return stopEvent(event,post.emit('menuAction','Maximize'))
        })
        this.winicon = elem({class:'winicon'})
        if (this.opt.icon)
        {
            this.winicon.appendChild(elem('img',{src:slash.fileUrl(slash.join(this.opt.dir,this.opt.icon))}))
        }
        this.elem.appendChild(this.winicon)
        this.winicon.addEventListener('click',function ()
        {
            return post.emit('menuAction','Open Menu')
        })
        this.title = elem({class:'titlebar-title'})
        this.elem.appendChild(this.title)
        this.initTitleDrag()
        this.setTitle(this.opt)
        this.minimize = elem({class:'winbutton minimize gray'})
        this.minimize.innerHTML = `<svg width="100%" height="100%" viewBox="-10 -8 30 30">
    <line x1="-1" y1="5" x2="11" y2="5"></line>
</svg>`
        this.elem.appendChild(this.minimize)
        this.minimize.addEventListener('click',function ()
        {
            return post.emit('menuAction','Minimize')
        })
        this.maximize = elem({class:'winbutton maximize gray'})
        this.maximize.innerHTML = `<svg width="100%" height="100%" viewBox="-10 -9 30 30">
  <rect width="11" height="11" style="fill-opacity: 0;"></rect>
</svg>`
        this.elem.appendChild(this.maximize)
        this.maximize.addEventListener('click',function ()
        {
            return post.emit('menuAction','Maximize')
        })
        this.close = elem({class:'winbutton close'})
        this.close.innerHTML = `<svg width="100%" height="100%" viewBox="-10 -9 30 30">
    <line x1="0" y1="0" x2="10" y2="11"></line>
    <line x1="10" y1="0" x2="0" y2="11"></line>
</svg>`
        this.elem.appendChild(this.close)
        this.close.addEventListener('click',function ()
        {
            return post.emit('menuAction','Close')
        })
        this.topframe = elem({class:'topframe'})
        this.elem.appendChild(this.topframe)
        this.initStyle()
        if (this.opt.menu)
        {
            this.initMenu(this.menuTemplate())
        }
    }

    Title.prototype["pushElem"] = function (elem)
    {
        return this.elem.insertBefore(elem,this.minimize)
    }

    Title.prototype["showTitle"] = function ()
    {
        return this.title.style.display = 'initial'
    }

    Title.prototype["hideTitle"] = function ()
    {
        return this.title.style.display = 'none'
    }

    Title.prototype["initTitleDrag"] = function ()
    {
        var _102_38_

        return this.titleDrag = new drag({target:document.body,handle:((_102_38_=this.opt.dragElem) != null ? _102_38_ : this.elem),onStart:this.onDragStart,onMove:this.onDragMove,stopEvent:false})
    }

    Title.prototype["onDragStart"] = function (drag, event)
    {
        if (event.target.nodeName === 'INPUT')
        {
            return 'skip'
        }
        return this.startBounds = window.win.getBounds()
    }

    Title.prototype["onDragMove"] = function (drag, event)
    {
        if (this.startBounds)
        {
            return window.win.setBounds({x:this.startBounds.x + drag.deltaSum.x,y:this.startBounds.y + drag.deltaSum.y,width:this.startBounds.width,height:this.startBounds.height})
        }
    }

    Title.prototype["setTitle"] = function (opt)
    {
        var html, parts, _133_26_

        html = ""
        parts = ((_133_26_=opt.title) != null ? _133_26_ : [])
        if (opt.pkg.name && _k_.in('name',parts))
        {
            html += `<span class='titlebar-name'>${opt.pkg.name}</span>`
        }
        if (opt.pkg.version && _k_.in('version',parts))
        {
            html += `<span class='titlebar-dot'>${opt.pkg.version}</span>`
        }
        if (opt.pkg.path && _k_.in('path',parts))
        {
            html += "<span class='titlebar-dot'> ► </span>"
            html += `<span class='titlebar-name'>${opt.pkg.path}</span>`
        }
        return this.title.innerHTML = html
    }

    Title.prototype["onTitlebar"] = function (action)
    {
        switch (action)
        {
            case 'showTitle':
                return this.showTitle()

            case 'hideTitle':
                return this.hideTitle()

            case 'showMenu':
                return this.showMenu()

            case 'hideMenu':
                return this.hideMenu()

            case 'toggleMenu':
                return this.toggleMenu()

        }

    }

    Title.prototype["onMenuAction"] = function (action, args)
    {
        switch (action.toLowerCase())
        {
            case 'toggle menu':
                return this.toggleMenu()

            case 'open menu':
                return this.openMenu()

            case 'show menu':
                return this.showMenu()

            case 'hide menu':
                return this.hideMenu()

            case 'toggle scheme':
                if (this.opt.scheme !== false)
                {
                    return scheme.toggle()
                }
                break
        }

    }

    Title.prototype["menuTemplate"] = function ()
    {
        var _179_28_

        if (!this.opt.dir || !this.opt.menu)
        {
            return []
        }
        if (_k_.empty(this.templateCache))
        {
            this.templateCache = this.makeTemplate(noon.load(slash.resolve(slash.join(this.opt.dir,this.opt.menu))))
        }
        if ((this.opt.menuTemplate != null) && typeof(this.opt.menuTemplate) === 'function')
        {
            return this.opt.menuTemplate(this.templateCache)
        }
        else
        {
            return this.templateCache
        }
    }

    Title.prototype["makeTemplate"] = function (obj)
    {
        var item, menuOrAccel, text, tmpl

        tmpl = []
        for (text in obj)
        {
            menuOrAccel = obj[text]
            item = (function ()
            {
                var _201_37_, _201_61_

                if (_k_.empty(menuOrAccel) && text.startsWith('-'))
                {
                    return {text:''}
                }
                else if ((function(o){return !isNaN(o) && !isNaN(parseFloat(o)) && isFinite(o)})(menuOrAccel))
                {
                    return {text:text,accel:kstr(menuOrAccel)}
                }
                else if ((function(o){return (typeof o === 'string' || o instanceof String)})(menuOrAccel))
                {
                    return {text:text,accel:keyinfo.convertCmdCtrl(menuOrAccel)}
                }
                else if (_k_.empty(menuOrAccel))
                {
                    return {text:text,accel:''}
                }
                else if ((menuOrAccel.accel != null) || (menuOrAccel.command != null))
                {
                    item = _k_.clone(menuOrAccel)
                    item.text = text
                    return item
                }
                else
                {
                    return {text:text,menu:this.makeTemplate(menuOrAccel)}
                }
            }).bind(this)
            tmpl.push(item())
        }
        return tmpl
    }

    Title.prototype["initMenu"] = function (items)
    {
        this.menu = new menu({items:items})
        this.elem.insertBefore(this.menu.elem,this.elem.firstChild.nextSibling)
        return this.hideMenu()
    }

    Title.prototype["refreshMenu"] = function ()
    {
        this.menu.del()
        return this.initMenu(this.menuTemplate())
    }

    Title.prototype["menuVisible"] = function ()
    {
        return this.menu.elem.style.display !== 'none'
    }

    Title.prototype["showMenu"] = function ()
    {
        var _223_68_, _223_75_

        this.menu.elem.style.display = 'inline-block'
        return ((_223_68_=this.menu) != null ? typeof (_223_75_=_223_68_.focus) === "function" ? _223_75_() : undefined : undefined)
    }

    Title.prototype["hideMenu"] = function ()
    {
        var _224_25_

        ;(this.menu != null ? this.menu.close() : undefined)
        return this.menu.elem.style.display = 'none'
    }

    Title.prototype["toggleMenu"] = function ()
    {
        if (this.menuVisible())
        {
            return this.hideMenu()
        }
        else
        {
            return this.showMenu()
        }
    }

    Title.prototype["openMenu"] = function ()
    {
        if (this.menuVisible())
        {
            return this.hideMenu()
        }
        else
        {
            this.showMenu()
            return this.menu.open()
        }
    }

    Title.prototype["initStyle"] = function ()
    {
        var href, link, titleStyle

        if (link = $("#style-link"))
        {
            href = slash.fileUrl(slash.resolve(slash.join(__dirname,"css/style.css")))
            titleStyle = elem('link',{href:href,rel:'stylesheet',type:'text/css'})
            link.parentNode.insertBefore(titleStyle,link)
            href = slash.fileUrl(slash.resolve(slash.join(__dirname,`css/${prefs.get('scheme','dark')}.css`)))
            titleStyle = elem('link',{href:href,rel:'stylesheet',type:'text/css',id:'style-title'})
            return link.parentNode.insertBefore(titleStyle,link)
        }
    }

    Title.prototype["handleKey"] = function (event)
    {
        var accels, combo, combos, item, kepaths, key, keypath, mainMenu, mod, _284_51_

        mod = keyinfo.forEvent(event).mod
        key = keyinfo.forEvent(event).key
        combo = keyinfo.forEvent(event).combo

        mainMenu = this.menuTemplate()
        accels = sds.find.key(mainMenu,'accel')
        combos = sds.find.key(mainMenu,'combo')
        kepaths = combos.concat(accels)
        if (_k_.empty(combo))
        {
            return 'unhandled'
        }
        var list = _k_.list(kepaths)
        for (var _277_20_ = 0; _277_20_ < list.length; _277_20_++)
        {
            keypath = list[_277_20_]
            combos = sds.get(mainMenu,keypath).split(' ')
            combos = combos.map(function (c)
            {
                return keyinfo.convertCmdCtrl(c)
            })
            if (_k_.in(combo,combos))
            {
                keypath.pop()
                item = sds.get(mainMenu,keypath)
                post.emit('menuAction',((_284_51_=item.action) != null ? _284_51_ : item.text),item)
                return item
            }
        }
        return 'unhandled'
    }

    return Title
})()

module.exports = Title