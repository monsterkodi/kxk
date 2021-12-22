// monsterkodi/kode 0.190.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}}

var $, elem, kerror, _

elem = require('./kxk').elem
empty = require('./kxk').empty
kerror = require('./kxk').kerror
$ = require('./kxk').$
_ = require('./kxk')._

class Tooltip
{
    constructor (opt)
    {
        var _15_56_, _17_19_, _18_19_

        this.opt = opt
        this.onLeave = this.onLeave.bind(this)
        this.popup = this.popup.bind(this)
        this.onHover = this.onHover.bind(this)
        this.del = this.del.bind(this)
        if (!(this.opt != null ? this.opt.elem : undefined))
        {
            return kerror("no elem for tooltip?")
        }
        this.opt.delay = ((_17_19_=this.opt.delay) != null ? _17_19_ : 700)
        this.opt.html = ((_18_19_=this.opt.html) != null ? _18_19_ : this.opt.text)
        this.elem = this.opt.elem
        if (_.isString(this.opt.elem))
        {
            this.elem = $(this.opt.elem)
        }
        this.elem.tooltip = this
        this.elem.addEventListener('mouseenter',this.onHover)
        this.elem.addEventListener('DOMNodeRemoved',this.del)
    }

    del (event)
    {
        var _30_27_

        if (this.opt.keep)
        {
            return
        }
        if (!(this.elem != null))
        {
            return
        }
        if (_k_.empty((event)) || (event != null ? event.target : undefined) === this.elem)
        {
            delete this.elem.tooltip
            this.onLeave()
            this.elem.removeEventListener('DOMNodeRemoved',this.del)
            return this.elem = null
        }
    }

    onHover (event)
    {
        var _40_27_, _41_22_

        if (!(this.elem != null))
        {
            return
        }
        if ((this.div != null))
        {
            return
        }
        clearTimeout(this.timer)
        this.timer = setTimeout(this.popup,this.opt.delay)
        this.elem.addEventListener('mouseleave',this.onLeave)
        return this.elem.addEventListener('mousedown',this.onLeave)
    }

    popup (event)
    {
        var br, _51_27_, _52_22_, _61_67_, _62_59_, _63_60_

        if (!(this.elem != null))
        {
            return
        }
        if ((this.div != null))
        {
            return
        }
        this.div = elem({id:'tooltip',class:'tooltip',html:this.opt.html})
        if (this.opt.parent)
        {
            this.opt.parent.appendChild(this.div)
        }
        else
        {
            document.body.appendChild(this.div)
        }
        br = this.elem.getBoundingClientRect()
        this.div.style.transform = "scaleY(1)"
        this.div.style.opacity = '1'
        if ((this.opt.textSize != null))
        {
            this.div.style.fontSize = `${this.opt.textSize}px`
        }
        if ((this.opt.x != null))
        {
            this.div.style.left = `${br.left + this.opt.x}px`
        }
        if ((this.opt.y != null))
        {
            return this.div.style.top = `${br.bottom + this.opt.y}px`
        }
    }

    onLeave (event, e)
    {
        var _67_16_, _73_12_

        if ((this.elem != null))
        {
            this.elem.removeEventListener('mouseleave',this.onLeave)
            this.elem.removeEventListener('mousedown',this.onLeave)
        }
        clearTimeout(this.timer)
        this.timer = null
        ;(this.div != null ? this.div.remove() : undefined)
        return this.div = null
    }
}

module.exports = Tooltip