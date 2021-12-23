// monsterkodi/kode 0.199.0

var _k_ = {extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var events, Gamepad

events = require('events')

Gamepad = (function ()
{
    _k_.extend(Gamepad, events);
    function Gamepad (doPoll = true)
    {
        this["poll"] = this["poll"].bind(this)
        this.btns = ['A','B','X','Y','LB','RB','LT','RT','Back','Start','LS','RS','Up','Down','Left','Right','Menu']
        this.state = {buttons:{},left:{x:0,y:0},right:{x:0,y:0}}
        this.deadZone = 0.1
        this.continuous = false
        if (doPoll && 'function' === typeof((navigator != null ? navigator.getGamepads : undefined)))
        {
            this.init()
        }
        return Gamepad.__super__.constructor.apply(this, arguments)
    }

    Gamepad.prototype["init"] = function ()
    {
        return window.addEventListener('gamepadconnected',(function (event)
        {
            if (event.gamepad.index === 0 && event.gamepad.axes.length >= 4)
            {
                return window.requestAnimationFrame(this.poll)
            }
        }).bind(this))
    }

    Gamepad.prototype["axisValue"] = function (value)
    {
        if (Math.abs(value) < this.deadZone)
        {
            return 0
        }
        return value
    }

    Gamepad.prototype["getState"] = function ()
    {
        var button, index, pad, state, x, y, _48_38_

        if (pad = (typeof navigator.getGamepads === "function" ? navigator.getGamepads()[0] : undefined))
        {
            state = {buttons:{}}
            for (var _51_26_ = index = 0, _51_30_ = pad.buttons.length; (_51_26_ <= _51_30_ ? index < pad.buttons.length : index > pad.buttons.length); (_51_26_ <= _51_30_ ? ++index : --index))
            {
                button = pad.buttons[index]
                if (button.pressed)
                {
                    state.buttons[this.btns[index]] = button.value
                }
            }
            x = this.axisValue(pad.axes[0])
            y = this.axisValue(-pad.axes[1])
            state.left = {x:x,y:y}
            x = this.axisValue(pad.axes[2])
            y = this.axisValue(-pad.axes[3])
            state.right = {x:x,y:y}
            return state
        }
    }

    Gamepad.prototype["poll"] = function ()
    {
        var button, changed, index, pad, state, x, y, _68_38_

        if (pad = (typeof navigator.getGamepads === "function" ? navigator.getGamepads()[0] : undefined))
        {
            state = {}
            changed = false
            for (var _73_26_ = index = 0, _73_30_ = pad.buttons.length; (_73_26_ <= _73_30_ ? index < pad.buttons.length : index > pad.buttons.length); (_73_26_ <= _73_30_ ? ++index : --index))
            {
                button = pad.buttons[index]
                if (button.pressed)
                {
                    state[this.btns[index]] = button.value
                    if (!this.state.buttons[this.btns[index]])
                    {
                        this.emit('button',this.btns[index],1)
                        changed = true
                    }
                }
                else if (this.state.buttons[this.btns[index]])
                {
                    this.emit('button',this.btns[index],0)
                    changed = true
                }
            }
            this.state.buttons = state
            if (changed)
            {
                this.emit('buttons',this.state.buttons)
            }
            changed = false
            x = this.axisValue(pad.axes[0])
            y = this.axisValue(-pad.axes[1])
            if (x !== this.state.left.x || y !== this.state.left.y)
            {
                this.state.left = {x:x,y:y}
                changed = true
            }
            x = this.axisValue(pad.axes[2])
            y = this.axisValue(-pad.axes[3])
            if (x !== this.state.right.x || y !== this.state.right.y)
            {
                this.state.right = {x:x,y:y}
                changed = true
            }
            if (changed || this.continuous)
            {
                this.emit('axis',this.state)
            }
            return window.requestAnimationFrame(this.poll)
        }
    }

    return Gamepad
})()

module.exports = Gamepad