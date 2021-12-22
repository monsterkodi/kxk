// monsterkodi/kode 0.190.0

var _k_

var $, def, kerror, kpos, stopEvent, _

$ = require('./kxk').$
_ = require('./kxk')._
def = require('./kxk').def
kerror = require('./kxk').kerror
kpos = require('./kxk').kpos
stopEvent = require('./kxk').stopEvent

class Drag
{
    constructor (cfg)
    {
        var t, _30_22_, _36_60_, _37_58_, _38_56_, _43_18_

        this.deactivate = this.deactivate.bind(this)
        this.activate = this.activate.bind(this)
        this.dragStop = this.dragStop.bind(this)
        this.dragUp = this.dragUp.bind(this)
        this.dragMove = this.dragMove.bind(this)
        this.dragStart = this.dragStart.bind(this)
        this.eventPos = this.eventPos.bind(this)
        _.extend(this,def(cfg,{target:null,handle:null,onStart:null,onMove:null,onStop:null,active:true,stopEvent:true}))
        if (_.isString(this.target))
        {
            t = $(this.target)
            if (!(t != null))
            {
                return kerror("Drag -- can't find drag target with id",this.target)
            }
            this.target = t
        }
        if (!(this.target != null))
        {
            return kerror("Drag -- can't find drag target")
        }
        if (this.target === document.body)
        {
            this.useScreenPos = true
        }
        if ((this.onStart != null) && !_.isFunction(this.onStart))
        {
            kerror("Drag -- onStart not a function?")
        }
        if ((this.onMove != null) && !_.isFunction(this.onMove))
        {
            kerror("Drag -- onMove not a function?")
        }
        if ((this.onEnd != null) && !_.isFunction(this.onEnd))
        {
            kerror("Drag -- onEnd not a function?")
        }
        this.dragging = false
        this.listening = false
        if (_.isString(this.handle))
        {
            this.handle = $(this.handle)
        }
        this.handle = ((_43_18_=this.handle) != null ? _43_18_ : this.target)
        if (this.active)
        {
            this.activate()
        }
    }

    start (p, event)
    {
        var _61_33_

        if (!this.dragging && this.listening)
        {
            this.dragging = true
            this.startPos = p
            this.pos = p
            this.delta = kpos(0,0)
            this.deltaSum = kpos(0,0)
            if ('skip' === (typeof this.onStart === "function" ? this.onStart(this,event) : undefined))
            {
                delete this.startPos
                this.dragging = false
                return this
            }
            this.lastPos = p
            if (this.stopEvent !== false)
            {
                stopEvent(event)
            }
            document.addEventListener('mousemove',this.dragMove)
            document.addEventListener('mouseup',this.dragUp)
        }
        return this
    }

    eventPos (event)
    {
        if (this.useScreenPos)
        {
            return kpos({x:event.screenX,y:event.screenY})
        }
        else
        {
            return kpos(event)
        }
    }

    dragStart (event)
    {
        return this.start(this.eventPos(event),event)
    }

    dragMove (event)
    {
        var _103_19_, _96_28_, _97_27_

        if (this.dragging)
        {
            this.pos = this.eventPos(event)
            this.delta = this.lastPos.to(this.pos)
            this.deltaSum = this.startPos.to(this.pos)
            if ((this.constrainKey != null) && event[this.constrainKey])
            {
                this.constrain = ((_97_27_=this.constrain) != null ? _97_27_ : Math.abs(this.delta.x) >= Math.abs(this.delta.y) ? kpos(1,0) : kpos(0,1))
                this.delta.x *= this.constrain.x
                this.delta.y *= this.constrain.y
            }
            else
            {
                delete this.constrain
            }
            (typeof this.onMove === "function" ? this.onMove(this,event) : undefined)
            this.lastPos = this.pos
        }
        return this
    }

    dragUp (event)
    {
        delete this.constrain
        return this.dragStop(event)
    }

    dragStop (event)
    {
        var _123_39_

        if (this.dragging)
        {
            document.removeEventListener('mousemove',this.dragMove)
            document.removeEventListener('mouseup',this.dragUp)
            if ((this.onStop != null) && (event != null))
            {
                this.onStop(this,event)
            }
            delete this.lastPos
            delete this.startPos
            this.dragging = false
        }
        return this
    }

    activate ()
    {
        if (!this.listening)
        {
            this.listening = true
            this.handle.addEventListener('mousedown',this.dragStart)
        }
        return this
    }

    deactivate ()
    {
        if (this.listening)
        {
            this.handle.removeEventListener('mousedown',this.dragStart)
            this.listening = false
            if (this.dragging)
            {
                this.dragStop()
            }
        }
        return this
    }
}

module.exports = Drag