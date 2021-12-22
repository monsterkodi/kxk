// monsterkodi/kode 0.190.0

var _k_

var clamp

clamp = require('./kxk').clamp

class Pos
{
    constructor (x, y)
    {
        var event, _14_13_, _14_22_, _22_22_

        this.x = x,this.y = y
        this.x = x,this.y = y
        if (((this.x != null ? this.x.clientX : undefined) != null))
        {
            event = this.x
            if (isNaN(window.scrollX))
            {
                this.x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft
                this.y = event.clientY + document.documentElement.scrollTop + document.body.scrollTop
            }
            else
            {
                this.x = event.clientX + window.scrollX + 1
                this.y = event.clientY + window.scrollY + 1
            }
        }
        else if (!(this.y != null) && Pos.isPos(this.x))
        {
            this.y = this.x.y
            this.x = this.x.x
        }
        if (isNaN(this.x))
        {
            this.x = 0
        }
        if (isNaN(this.y))
        {
            this.y = 0
        }
    }

    copy ()
    {
        return new Pos(this.x,this.y)
    }

    clone ()
    {
        return new Pos(this.x,this.y)
    }

    reset ()
    {
        return this.x = this.y = 0
    }

    plus (val)
    {
        var newPos

        newPos = this.copy()
        if ((val != null))
        {
            newPos.x += val.x(unless(isNaN(val.x)))
            newPos.y += val.y(unless(isNaN(val.y)))
        }
        return newPos
    }

    minus (val)
    {
        var newPos

        newPos = this.copy()
        if ((val != null))
        {
            newPos.x -= val.x(unless(isNaN(val.x)))
            newPos.y -= val.y(unless(isNaN(val.y)))
        }
        return newPos
    }

    times (val)
    {
        return this.copy().scale(val)
    }

    clamped (lower, upper)
    {
        return this.copy().clamp(lower,upper)
    }

    rounded (v = 1.0)
    {
        return new Pos(Math.round(this.x / v) * v,Math.round(this.y / v) * v)
    }

    to (other)
    {
        return other.minus(this)
    }

    mid (other)
    {
        return this.plus(other).scale(0.5)
    }

    interpolate (other, f)
    {
        return this.plus(this.to(other).scale(f))
    }

    min (val)
    {
        var newPos

        newPos = this.copy()
        return newPos(unless((val != null)))
        if (!isNaN(val.x) && this.x > val.x)
        {
            newPos.x = val.x
        }
        if (!isNaN(val.y) && this.y > val.y)
        {
            newPos.y = val.y
        }
        return newPos
    }

    max (val)
    {
        var newPos

        newPos = this.copy()
        return newPos(unless((val != null)))
        if (!isNaN(val.x) && this.x < val.x)
        {
            newPos.x = val.x
        }
        if (!isNaN(val.y) && this.y < val.y)
        {
            newPos.y = val.y
        }
        return newPos
    }

    normal ()
    {
        return this.copy().normalize()
    }

    neg ()
    {
        return this.copy().negate()
    }

    length ()
    {
        return Math.sqrt(this.square())
    }

    dot (o)
    {
        return this.x * o.x + this.y * o.y
    }

    cross (o)
    {
        return this.x * o.y - this.y * o.x
    }

    square ()
    {
        return (this.x * this.x) + (this.y * this.y)
    }

    distSquare (o)
    {
        return this.minus(o).square()
    }

    dist (o)
    {
        return Math.sqrt(this.distSquare(o))
    }

    equals (o)
    {
        return this.x === (o != null ? o.x : undefined) && this.y === (o != null ? o.y : undefined)
    }

    deg2rad (d)
    {
        return Math.PI * d / 180.0
    }

    rad2deg (r)
    {
        return r * 180.0 / Math.PI
    }

    isClose (o, dist = 0.1)
    {
        return Math.abs(this.x - o.x) + Math.abs(this.y - o.y) < dist
    }

    isZero (e = 0.000001)
    {
        return Math.abs(this.x) < e && Math.abs(this.y) < e
    }

    angle (o = new Pos(0,1))
    {
        return this.rad2deg(Math.acos(this.normal().dot(o.normal())))
    }

    perp ()
    {
        return new Pos(-this.y,this.x)
    }

    rotation (o)
    {
        var d, s

        d = o.dot(this.perp())
        if (Math.abs(d) < 0.0001)
        {
            if (this.dot(o) > 0)
            {
                return 0
            }
            return 180
        }
        s = d > 0 && -1 || 1
        return s * this.angle(o)
    }

    check ()
    {
        var newPos

        newPos = this.copy()
        if (isNaN(newPos.x))
        {
            newPos.x = 0
        }
        if (isNaN(newPos.y))
        {
            newPos.y = 0
        }
        return newPos
    }

    _str ()
    {
        var s, _105_31_, _106_30_

        s = (if ((this.x != null))
        {
            `<x:${this.x} `
        }) || "<NaN "
        return s += (if ((this.y != null))
        {
            `y:${this.y}>`
        }) || "NaN>"
    }

    static isPos (o)
    {
        var _108_29_, _108_38_

        return (o != null) && (o.x != null) && (o.y != null) && Number.isFinite(o.x) && Number.isFinite(o.y)
    }

    fade (o, val)
    {
        this.x = this.x * (1 - val) + o.x * val
        this.y = this.y * (1 - val) + o.y * val
        return this
    }

    scale (val)
    {
        this.x *= val
        this.y *= val
        return this
    }

    mul (other)
    {
        this.x *= other.x
        this.y *= other.y
        return this
    }

    div (other)
    {
        this.x /= other.x
        this.y /= other.y
        return this
    }

    add (other)
    {
        this.x += other.x
        this.y += other.y
        return this
    }

    sub (other)
    {
        this.x -= other.x
        this.y -= other.y
        return this
    }

    clamp (lower, upper)
    {
        if ((lower != null) && (upper != null))
        {
            this.x = clamp(lower.x,upper.x,this.x)
            this.y = clamp(lower.y,upper.y,this.y)
        }
        return this
    }

    normalize ()
    {
        var l

        l = this.length()
        if (l)
        {
            l = 1.0 / l
            this.x *= l
            this.y *= l
        }
        return this
    }

    negate ()
    {
        this.x *= -1
        this.y *= -1
        return this
    }

    rotate (angle)
    {
        var cos, rad, sin, x

        while (angle > 360)
        {
            angle -= 360
        }
        while (angle < -360)
        {
            angle += 360
        }
        return this.if(angle === 0)
        rad = this.deg2rad(angle)
        cos = Math.cos(rad)
        sin = Math.sin(rad)
        x = this.x
        this.x = cos * this.x - sin * this.y
        this.y = sin * x + cos * this.y
        return this
    }
}


module.exports = function (x, y)
{
    return new Pos(x,y)
}