// monsterkodi/kode 0.243.0

var _k_ = {list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}}

var elem, keyinfo, kxk, os, Popup, post, slash, stopEvent

kxk = require('./kxk')
elem = kxk.elem
keyinfo = kxk.keyinfo
os = kxk.os
post = kxk.post
slash = kxk.slash
stopEvent = kxk.stopEvent


Popup = (function ()
{
    function Popup (opt)
    {
        var br, child, div, item, text, _42_30_, _43_109_, _43_81_

        this["onKeyDown"] = this["onKeyDown"].bind(this)
        this["onFocusOut"] = this["onFocusOut"].bind(this)
        this["onContextMenu"] = this["onContextMenu"].bind(this)
        this["onClick"] = this["onClick"].bind(this)
        this["onHover"] = this["onHover"].bind(this)
        this["activate"] = this["activate"].bind(this)
        this["close"] = this["close"].bind(this)
        this.focusElem = document.activeElement
        this.items = elem({class:'popup',tabindex:3})
        this.parent = opt.parent
        this.onClose = opt.onClose
        if (opt.class)
        {
            this.items.classList.add(opt.class)
        }
        var list = _k_.list(opt.items)
        for (var _24_17_ = 0; _24_17_ < list.length; _24_17_++)
        {
            item = list[_24_17_]
            if (item.hide)
            {
                continue
            }
            if (_k_.empty((item.text)) && _k_.empty((item.html)) && _k_.empty((item.child)) && _k_.empty((item.children)) && _k_.empty((item.img)))
            {
                div = elem('hr',{class:'popupItem separator'})
            }
            else
            {
                div = elem({class:'popupItem',text:item.text})
                if (!_k_.empty(item.html))
                {
                    div.innerHTML = item.html
                }
                else
                {
                    if (item.img)
                    {
                        div.appendChild(elem('img',{class:'popupImage',src:slash.fileUrl(item.img)}))
                    }
                    if (item.child)
                    {
                        div.appendChild(item.child)
                    }
                    if (item.children)
                    {
                        var list1 = _k_.list(item.children)
                        for (var _38_34_ = 0; _38_34_ < list1.length; _38_34_++)
                        {
                            child = list1[_38_34_]
                            div.appendChild(child)
                        }
                    }
                }
                div.item = item
                div.addEventListener('click',this.onClick)
                if (((_42_30_=item.combo) != null ? _42_30_ : item.accel))
                {
                    text = keyinfo.short((os.platform() === 'darwin' ? (((_43_81_=item.combo) != null ? _43_81_ : item.accel)) : (((_43_109_=item.accel) != null ? _43_109_ : item.combo))))
                    div.appendChild(elem('span',{class:'popupCombo',text:text}))
                }
                else if (item.menu)
                {
                    div.appendChild(elem('span',{class:'popupCombo',text:'▶'}))
                }
            }
            this.items.appendChild(div)
        }
        document.body.appendChild(this.items)
        this.items.addEventListener('contextmenu',this.onContextMenu)
        this.items.addEventListener('keydown',this.onKeyDown)
        this.items.addEventListener('focusout',this.onFocusOut)
        this.items.addEventListener('mouseover',this.onHover)
        br = this.items.getBoundingClientRect()
        if (opt.x + br.width > document.body.clientWidth)
        {
            this.items.style.left = `${document.body.clientWidth - br.width}px`
        }
        else
        {
            this.items.style.left = `${opt.x}px`
        }
        if (opt.y + br.height > document.body.clientHeight)
        {
            this.items.style.top = `${document.body.clientHeight - br.height}px`
        }
        else
        {
            this.items.style.top = `${opt.y}px`
        }
        if (opt.selectFirstItem !== false)
        {
            this.select(this.items.firstChild,{selectFirstItem:false})
        }
        post.emit('popup','opened')
    }

    Popup.prototype["close"] = function (opt = {})
    {
        var _101_22_, _80_42_, _80_48_, _81_33_, _85_14_, _88_14_, _89_14_, _90_14_, _91_14_, _94_15_, _97_22_

        if (_k_.empty((this.parent)) || ((_80_42_=this.parentMenu()) != null ? (_80_48_=_80_42_.elem) != null ? _80_48_.classList.contains('menu') : undefined : undefined))
        {
            if ('skip' === (typeof this.onClose === "function" ? this.onClose() : undefined))
            {
                return
            }
            post.emit('popup','closed')
        }
        ;(this.popup != null ? this.popup.close({focus:false}) : undefined)
        delete this.popup
        ;(this.items != null ? this.items.removeEventListener('keydown',this.onKeyDown) : undefined)
        ;(this.items != null ? this.items.removeEventListener('focusout',this.onFocusOut) : undefined)
        ;(this.items != null ? this.items.removeEventListener('mouseover',this.onHover) : undefined)
        ;(this.items != null ? this.items.remove() : undefined)
        delete this.items
        ;(this.parent != null ? this.parent.childClosed(this,opt) : undefined)
        if (opt.all)
        {
            if ((this.parent != null))
            {
                this.parent.close(opt)
            }
        }
        if (opt.focus !== false && !this.parent)
        {
            return (this.focusElem != null ? this.focusElem.focus() : undefined)
        }
    }

    Popup.prototype["childClosed"] = function (child, opt)
    {
        if (child === this.popup)
        {
            delete this.popup
            if (opt.focus !== false)
            {
                return this.focus()
            }
        }
    }

    Popup.prototype["select"] = function (item, opt = {})
    {
        var _120_17_, _123_17_, _127_20_

        if (!(item != null))
        {
            return
        }
        if ((this.popup != null))
        {
            this.popup.close({focus:false})
        }
        ;(this.selected != null ? this.selected.classList.remove('selected') : undefined)
        this.selected = item
        this.selected.classList.add('selected')
        if ((item.item != null ? item.item.menu : undefined) && opt.open !== false)
        {
            delete this.popup
            this.popupChild(item,opt)
        }
        return this.focus()
    }

    Popup.prototype["popupChild"] = function (item, opt = {})
    {
        var br, items

        if (items = item.item.menu)
        {
            if (this.popup)
            {
                return this.closePopup()
            }
            else
            {
                br = item.getBoundingClientRect()
                return this.popup = new Popup({items:items,parent:this,x:br.left + br.width,y:br.top,selectFirstItem:(opt != null ? opt.selectFirstItem : undefined)})
            }
        }
    }

    Popup.prototype["closePopup"] = function ()
    {
        var _150_14_

        ;(this.popup != null ? this.popup.close({focus:false}) : undefined)
        return delete this.popup
    }

    Popup.prototype["navigateLeft"] = function ()
    {
        var m

        if (this.popup)
        {
            return this.closePopup()
        }
        else if (m = this.parentMenu())
        {
            return m.navigateLeft()
        }
        else if (this.parent)
        {
            return this.close({focus:false})
        }
    }

    Popup.prototype["activateOrNavigateRight"] = function ()
    {
        var _170_20_

        if ((this.selected != null))
        {
            if (!this.selected.item.menu)
            {
                return this.activate(this.selected)
            }
            else
            {
                return this.navigateRight()
            }
        }
    }

    Popup.prototype["navigateRight"] = function ()
    {
        var _179_25_, _182_25_

        if (this.popup)
        {
            return this.popup.select(this.popup.items.firstChild)
        }
        else if ((this.selected != null ? this.selected.item.menu : undefined))
        {
            return this.select(this.selected,{selectFirstItem:true})
        }
        else
        {
            return (this.parentMenu() != null ? this.parentMenu().navigateRight() : undefined)
        }
    }

    Popup.prototype["parentMenu"] = function ()
    {
        var _185_18_

        if ((this.parent != null) && !this.parent.parent)
        {
            return this.parent
        }
    }

    Popup.prototype["nextItem"] = function ()
    {
        var next, _197_38_

        if (next = this.selected)
        {
            while (next = next.nextSibling)
            {
                if (!_k_.empty((next.item != null ? next.item.text : undefined)))
                {
                    return next
                }
            }
        }
    }

    Popup.prototype["prevItem"] = function ()
    {
        var prev, _203_38_

        if (prev = this.selected)
        {
            while (prev = prev.previousSibling)
            {
                if (!_k_.empty((prev.item != null ? prev.item.text : undefined)))
                {
                    return prev
                }
            }
        }
    }

    Popup.prototype["activate"] = function (item)
    {
        var _214_20_, _214_24_, _216_39_, _219_52_

        if (((item.item != null ? item.item.cb : undefined) != null))
        {
            this.close({all:true})
            return item.item.cb(((_216_39_=item.item.arg) != null ? _216_39_ : item.item.text))
        }
        else if (!item.item.menu)
        {
            this.close({all:true})
            return post.emit('menuAction',((_219_52_=item.item.action) != null ? _219_52_ : item.item.text),item.item)
        }
    }

    Popup.prototype["toggle"] = function (item)
    {
        if (this.popup)
        {
            this.popup.close({focus:false})
            return delete this.popup
        }
        else
        {
            return this.select(item,{selectFirstItem:false})
        }
    }

    Popup.prototype["onHover"] = function (event)
    {
        var item

        item = elem.upElem(event.target,{prop:'item'})
        if (item)
        {
            return this.select(item,{selectFirstItem:false})
        }
    }

    Popup.prototype["onClick"] = function (event)
    {
        var item

        stopEvent(event)
        item = elem.upElem(event.target,{prop:'item'})
        if (item)
        {
            if (item.item.menu)
            {
                return this.toggle(item)
            }
            else
            {
                return this.activate(item)
            }
        }
    }

    Popup.prototype["onContextMenu"] = function (event)
    {
        return stopEvent(event)
    }

    Popup.prototype["focus"] = function ()
    {
        var _260_20_

        return (this.items != null ? this.items.focus() : undefined)
    }

    Popup.prototype["onFocusOut"] = function (event)
    {
        var _264_34_

        if (!(event.relatedTarget != null ? event.relatedTarget.classList.contains('popup') : undefined))
        {
            return this.close({all:true,focus:false})
        }
    }

    Popup.prototype["onKeyDown"] = function (event)
    {
        var combo, key, mod

        mod = keyinfo.forEvent(event).mod
        key = keyinfo.forEvent(event).key
        combo = keyinfo.forEvent(event).combo

        switch (combo)
        {
            case 'end':
            case 'page down':
                return stopEvent(event,this.select(this.items.lastChild,{selectFirstItem:false}))

            case 'home':
            case 'page up':
                return stopEvent(event,this.select(this.items.firstChild,{selectFirstItem:false}))

            case 'esc':
                return stopEvent(event,this.close())

            case 'down':
                return stopEvent(event,this.select(this.nextItem(),{selectFirstItem:false}))

            case 'up':
                return stopEvent(event,this.select(this.prevItem(),{selectFirstItem:false}))

            case 'enter':
            case 'space':
                return stopEvent(event,this.activateOrNavigateRight())

            case 'left':
                return stopEvent(event,this.navigateLeft())

            case 'right':
                return stopEvent(event,this.navigateRight())

        }

    }

    return Popup
})()

module.exports = {menu:function (opt)
{
    return new Popup(opt)
}}