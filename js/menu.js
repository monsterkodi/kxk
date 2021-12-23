// monsterkodi/kode 0.208.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var elem, keyinfo, Menu, popup, stopEvent

elem = require('./kxk').elem
keyinfo = require('./kxk').keyinfo
popup = require('./kxk').popup
stopEvent = require('./kxk').stopEvent


Menu = (function ()
{
    function Menu (opt)
    {
        var combo, div, item, _22_25_

        this["onClick"] = this["onClick"].bind(this)
        this["onKeyDown"] = this["onKeyDown"].bind(this)
        this["close"] = this["close"].bind(this)
        this["onFocusOut"] = this["onFocusOut"].bind(this)
        this["onHover"] = this["onHover"].bind(this)
        this["blur"] = this["blur"].bind(this)
        this["focus"] = this["focus"].bind(this)
        this.elem = elem({class:'menu',tabindex:3})
        var list = _k_.list(opt.items)
        for (var _17_17_ = 0; _17_17_ < list.length; _17_17_++)
        {
            item = list[_17_17_]
            if (item.hide)
            {
                continue
            }
            div = elem({class:'menuItem',text:item.text})
            div.item = item
            div.addEventListener('click',this.onClick)
            if ((item.combo != null))
            {
                combo = elem('span',{class:'popupCombo',text:keyinfo.short(item.combo)})
                div.appendChild(combo)
            }
            this.elem.appendChild(div)
        }
        this.select(this.elem.firstChild)
        this.elem.addEventListener('keydown',this.onKeyDown)
        this.elem.addEventListener('focusout',this.onFocusOut)
        this.elem.addEventListener('mouseover',this.onHover)
    }

    Menu.prototype["del"] = function ()
    {
        var _36_13_

        this.close()
        ;(this.elem != null ? this.elem.remove() : undefined)
        return this.elem = null
    }

    Menu.prototype["focus"] = function ()
    {
        this.focusElem = document.activeElement
        return this.elem.focus()
    }

    Menu.prototype["blur"] = function ()
    {
        var _50_33_, _50_40_

        this.close()
        return ((_50_33_=this.focusElem) != null ? typeof (_50_40_=_50_33_.focus) === "function" ? _50_40_() : undefined : undefined)
    }

    Menu.prototype["onHover"] = function (event)
    {
        return this.select(event.target,{selectFirstItem:false})
    }

    Menu.prototype["onFocusOut"] = function (event)
    {
        var _56_45_

        if (this.popup && !(event.relatedTarget != null ? event.relatedTarget.classList.contains('popup') : undefined))
        {
            this.popup.close({focus:false})
            return delete this.popup
        }
    }

    Menu.prototype["open"] = function ()
    {
        return this.select(this.elem.firstChild,{activate:true})
    }

    Menu.prototype["close"] = function (opt = {})
    {
        var _76_17_, _83_26_, _83_33_

        if ((this.popup != null))
        {
            this.popup.close({focus:false})
            delete this.popup
            if (opt.focus !== false)
            {
                return this.elem.focus()
            }
        }
        else
        {
            if (opt.focus !== false)
            {
                return ((_83_26_=this.focusElem) != null ? typeof (_83_33_=_83_26_.focus) === "function" ? _83_33_() : undefined : undefined)
            }
        }
    }

    Menu.prototype["childClosed"] = function (child, opt)
    {
        if (child === this.popup)
        {
            delete this.popup
            if (opt.focus !== false)
            {
                return this.elem.focus()
            }
        }
    }

    Menu.prototype["select"] = function (item, opt = {})
    {
        var hadPopup, _102_17_, _106_17_

        if (!(item != null))
        {
            return
        }
        if ((this.popup != null))
        {
            hadPopup = true
            this.popup.close({focus:false})
        }
        ;(this.selected != null ? this.selected.classList.remove('selected') : undefined)
        this.selected = item
        this.selected.classList.add('selected')
        if (hadPopup || opt.activate)
        {
            delete this.popup
            return this.activate(item,opt)
        }
    }

    Menu.prototype["activate"] = function (item, opt = {})
    {
        var br, items, pr

        items = item.item.menu
        if (items)
        {
            if (this.popup)
            {
                this.popup.close({focus:false})
                delete this.popup
            }
            br = item.getBoundingClientRect()
            pr = item.parentNode.getBoundingClientRect()
            opt.items = items
            opt.parent = this
            opt.x = br.left
            opt.y = pr.top + pr.height
            opt.class = 'titlemenu'
            this.popup = popup.menu(opt)
            if (opt.selectFirstItem === false)
            {
                return this.elem.focus()
            }
        }
    }

    Menu.prototype["toggle"] = function (item)
    {
        if (this.popup)
        {
            this.popup.close({focus:false})
            return delete this.popup
        }
        else
        {
            return this.activate(item,{selectFirstItem:false})
        }
    }

    Menu.prototype["itemSelected"] = function (item, elem)
    {}

    Menu.prototype["deactivate"] = function (item)
    {}

    Menu.prototype["navigateLeft"] = function ()
    {
        var _153_39_

        return this.select((this.selected != null ? this.selected.previousSibling : undefined),{activate:true,selectFirstItem:false})
    }

    Menu.prototype["navigateRight"] = function ()
    {
        var _154_39_

        return this.select((this.selected != null ? this.selected.nextSibling : undefined),{activate:true,selectFirstItem:false})
    }

    Menu.prototype["onKeyDown"] = function (event)
    {
        var combo, key, mod

        mod = keyinfo.forEvent(event).mod
        key = keyinfo.forEvent(event).key
        combo = keyinfo.forEvent(event).combo

        switch (combo)
        {
            case 'end':
            case 'page down':
                return stopEvent(event,this.select(this.elem.lastChild,{activate:true,selectFirstItem:false}))

            case 'home':
            case 'page up':
                return stopEvent(event,this.select(this.elem.firstChild,{activate:true,selectFirstItem:false}))

            case 'enter':
            case 'down':
            case 'space':
                return stopEvent(event,this.activate(this.selected))

            case 'esc':
                return stopEvent(event,this.close())

            case 'right':
                return stopEvent(event,this.navigateRight())

            case 'left':
                return stopEvent(event,this.navigateLeft())

        }

    }

    Menu.prototype["onClick"] = function (e)
    {
        return this.toggle(e.target)
    }

    return Menu
})()

module.exports = Menu