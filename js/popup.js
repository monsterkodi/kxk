// monsterkodi/kode 0.190.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}}

var elem, keyinfo, os, post, stopEvent

elem = require('./kxk').elem
empty = require('./kxk').empty
keyinfo = require('./kxk').keyinfo
os = require('./kxk').os
post = require('./kxk').post
stopEvent = require('./kxk').stopEvent

class Popup
{
    constructor (opt)
    {
        var br, div, item, text, _32_30_, _35_39_, _37_39_

        this.onKeyDown = this.onKeyDown.bind(this)
        this.onFocusOut = this.onFocusOut.bind(this)
        this.onContextMenu = this.onContextMenu.bind(this)
        this.onClick = this.onClick.bind(this)
        this.onHover = this.onHover.bind(this)
        this.activate = this.activate.bind(this)
        this.close = this.close.bind(this)
        this.focusElem = document.activeElement
        this.items = elem({class:'popup',tabindex:3})
        this.parent = opt.parent
        this.onClose = opt.onClose
        if (opt.class)
        {
            this.items.classList.add(opt.class)
        }
        var list = _k_.list(opt.items)
        for (var _22_17_ = 0; _22_17_ < list.length; _22_17_++)
        {
            item = list[_22_17_]
            if (item.hide)
            {
                continue
            }
            if (_k_.empty((item.text)) && _k_.empty((item.html)))
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
                div.item = item
                div.addEventListener('click',this.onClick)
                if (((_32_30_=item.combo) != null ? _32_30_ : item.accel))
                {
                    text = keyinfo.short(if (os.platform() === 'darwin')
                    {
                        ((_35_39_=item.combo) != null ? _35_39_ : item.accel)
                    }
                    else
                    {
                        ((_37_39_=item.accel) != null ? _37_39_ : item.combo)
                    })
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

    close (opt = {})
    {
        var _74_42_, _74_48_, _76_20_, _78_14_, _81_14_, _82_14_, _83_14_, _84_14_, _87_15_, _90_22_, _94_22_

        if (_k_.empty((this.parent)) || ((_74_42_=this.parentMenu()) != null ? (_74_48_=_74_42_.elem) != null ? _74_48_.classList.contains('menu') : undefined : undefined))
        {
            post.emit('popup','closed')
            (typeof this.onClose === "function" ? this.onClose() : undefined)
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

    childClosed (child, opt)
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

    select (item, opt = {})
    {
        var _113_17_, _116_17_, _120_20_

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

    popupChild (item, opt = {})
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

    closePopup ()
    {
        var _143_14_

        ;(this.popup != null ? this.popup.close({focus:false}) : undefined)
        return delete this.popup
    }

    navigateLeft ()
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

    activateOrNavigateRight ()
    {
        var _163_20_

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

    navigateRight ()
    {
        var _172_25_, _175_25_

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

    parentMenu ()
    {
        var _178_18_

        if ((this.parent != null) && !this.parent.parent)
        {
            return this.parent
        }
    }

    nextItem ()
    {
        var next, _190_38_

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

    prevItem ()
    {
        var prev, _196_38_

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

    activate (item)
    {
        var _207_20_, _207_24_, _209_39_, _212_52_

        if (((item.item != null ? item.item.cb : undefined) != null))
        {
            this.close({all:true})
            return item.item.cb(((_209_39_=item.item.arg) != null ? _209_39_ : item.item.text))
        }
        else if (!item.item.menu)
        {
            this.close({all:true})
            return post.emit('menuAction',((_212_52_=item.item.action) != null ? _212_52_ : item.item.text),item.item)
        }
    }

    toggle (item)
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

    onHover (event)
    {
        var item

        item = elem.upElem(event.target,{prop:'item'})
        if (item)
        {
            return this.select(item,{selectFirstItem:false})
        }
    }

    onClick (event)
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

    onContextMenu (event)
    {
        return stopEvent(event)
    }

    focus ()
    {
        var _253_20_

        return (this.items != null ? this.items.focus() : undefined)
    }

    onFocusOut (event)
    {
        var _257_34_

        if (!(event.relatedTarget != null ? event.relatedTarget.classList.contains('popup') : undefined))
        {
            return this.close({all:true,focus:false})
        }
    }

    onKeyDown (event)
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
}

module.exports = {menu:function (opt)
{
    return new Popup(opt)
}}