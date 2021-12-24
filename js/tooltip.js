// monsterkodi/kode 0.218.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}}

var $, elem, kerror, kxk, Tooltip

kxk = require('./kxk')
elem = kxk.elem
kerror = kxk.kerror
$ = kxk.$


Tooltip = (function ()
{
    function Tooltip (opt)
    {
        var _16_56_, _18_19_, _19_19_

        this.opt = opt
    
        this["onLeave"] = this["onLeave"].bind(this)
        this["popup"] = this["popup"].bind(this)
        this["onHover"] = this["onHover"].bind(this)
        this["del"] = this["del"].bind(this)
        if (!(this.opt != null ? this.opt.elem : undefined))
        {
            return kerror("no elem for tooltip?")
        }
        this.opt.delay = ((_18_19_=this.opt.delay) != null ? _18_19_ : 700)
        this.opt.html = ((_19_19_=this.opt.html) != null ? _19_19_ : this.opt.text)
        this.elem = this.opt.elem
        if ((function(o){return (typeof o === 'string' || o instanceof String)})(this.opt.elem))
        {
            this.elem = $(this.opt.elem)
        }
        this.elem.tooltip = this
        this.elem.addEventListener('mouseenter',this.onHover)
        this.elem.addEventListener('DOMNodeRemoved',this.del)
    }

    Tooltip.prototype["del"] = function (event)
    {
        var _31_27_

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

    Tooltip.prototype["onHover"] = function (event)
    {
        var _41_27_, _42_22_

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

    Tooltip.prototype["popup"] = function (event)
    {
        var br, _52_27_, _53_22_, _62_67_, _63_59_, _64_60_

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

    Tooltip.prototype["onLeave"] = function (event, e)
    {
        var _68_16_, _74_12_

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

    return Tooltip
})()

module.exports = Tooltip