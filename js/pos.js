// monsterkodi/kode 0.208.0

var _k_

var clamp, Pos

clamp = require('./kxk').clamp


Pos = (function ()
{
    function Pos (x, y)
    {
        var event, _14_13_, _14_22_, _22_22_

        this.x = x
        this.y = y
    
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

    Pos.prototype["copy"] = function ()
    {
        return new Pos(this.x,this.y)
    }

    Pos.prototype["clone"] = function ()
    {
        return new Pos(this.x,this.y)
    }

    Pos.prototype["reset"] = function ()
    {
        return this.x = this.y = 0
    }

    Pos.prototype["plus"] = function (val)
    {
        var newPos

        newPos = this.copy()
        if ((val != null))
        {
            if (!isNaN(val.x))
            {
                newPos.x += val.x
            }
            if (!isNaN(val.y))
            {
                newPos.y += val.y
            }
        }
        return newPos
    }

    Pos.prototype["minus"] = function (val)
    {
        var newPos

        newPos = this.copy()
        if ((val != null))
        {
            if (!isNaN(val.x))
            {
                newPos.x -= val.x
            }
            if (!isNaN(val.y))
            {
                newPos.y -= val.y
            }
        }
        return newPos
    }

    Pos.prototype["times"] = function (val)
    {
        return this.copy().scale(val)
    }

    Pos.prototype["clamped"] = function (lower, upper)
    {
        return this.copy().clamp(lower,upper)
    }

    Pos.prototype["rounded"] = function (v = 1.0)
    {
        return new Pos(Math.round(this.x / v) * v,Math.round(this.y / v) * v)
    }

    Pos.prototype["to"] = function (other)
    {
        return other.minus(this)
    }

    Pos.prototype["mid"] = function (other)
    {
        return this.plus(other).scale(0.5)
    }

    Pos.prototype["interpolate"] = function (other, f)
    {
        return this.plus(this.to(other).scale(f))
    }

    Pos.prototype["min"] = function (val)
    {
        var newPos

        newPos = this.copy()
        if (!(val != null))
        {
            return newPos
        }
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

    Pos.prototype["max"] = function (val)
    {
        var newPos

        newPos = this.copy()
        if (!(val != null))
        {
            return newPos
        }
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

    Pos.prototype["normal"] = function ()
    {
        return this.copy().normalize()
    }

    Pos.prototype["neg"] = function ()
    {
        return this.copy().negate()
    }

    Pos.prototype["length"] = function ()
    {
        return Math.sqrt(this.square())
    }

    Pos.prototype["dot"] = function (o)
    {
        return this.x * o.x + this.y * o.y
    }

    Pos.prototype["cross"] = function (o)
    {
        return this.x * o.y - this.y * o.x
    }

    Pos.prototype["square"] = function ()
    {
        return (this.x * this.x) + (this.y * this.y)
    }

    Pos.prototype["distSquare"] = function (o)
    {
        return this.minus(o).square()
    }

    Pos.prototype["dist"] = function (o)
    {
        return Math.sqrt(this.distSquare(o))
    }

    Pos.prototype["equals"] = function (o)
    {
        return this.x === (o != null ? o.x : undefined) && this.y === (o != null ? o.y : undefined)
    }

    Pos.prototype["deg2rad"] = function (d)
    {
        return Math.PI * d / 180.0
    }

    Pos.prototype["rad2deg"] = function (r)
    {
        return r * 180.0 / Math.PI
    }

    Pos.prototype["isClose"] = function (o, dist = 0.1)
    {
        return Math.abs(this.x - o.x) + Math.abs(this.y - o.y) < dist
    }

    Pos.prototype["isZero"] = function (e = 0.000001)
    {
        return Math.abs(this.x) < e && Math.abs(this.y) < e
    }

    Pos.prototype["angle"] = function (o = new Pos(0,1))
    {
        return this.rad2deg(Math.acos(this.normal().dot(o.normal())))
    }

    Pos.prototype["perp"] = function ()
    {
        return new Pos(-this.y,this.x)
    }

    Pos.prototype["rotation"] = function (o)
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

    Pos.prototype["check"] = function ()
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

    Pos.prototype["_str"] = function ()
    {
        var s

        s = (this.x ? `<x:${this.x} ` : "<NaN ")
        return s += (this.y ? `y:${this.y}>` : "NaN>")
    }

    Pos["isPos"] = function (o)
    {
        var _108_29_, _108_38_

        return (o != null) && (o.x != null) && (o.y != null) && Number.isFinite(o.x) && Number.isFinite(o.y)
    }

    Pos.prototype["fade"] = function (o, val)
    {
        this.x = this.x * (1 - val) + o.x * val
        this.y = this.y * (1 - val) + o.y * val
        return this
    }

    Pos.prototype["scale"] = function (val)
    {
        this.x *= val
        this.y *= val
        return this
    }

    Pos.prototype["mul"] = function (other)
    {
        this.x *= other.x
        this.y *= other.y
        return this
    }

    Pos.prototype["div"] = function (other)
    {
        this.x /= other.x
        this.y /= other.y
        return this
    }

    Pos.prototype["add"] = function (other)
    {
        this.x += other.x
        this.y += other.y
        return this
    }

    Pos.prototype["sub"] = function (other)
    {
        this.x -= other.x
        this.y -= other.y
        return this
    }

    Pos.prototype["clamp"] = function (lower, upper)
    {
        if ((lower != null) && (upper != null))
        {
            this.x = clamp(lower.x,upper.x,this.x)
            this.y = clamp(lower.y,upper.y,this.y)
        }
        return this
    }

    Pos.prototype["normalize"] = function ()
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

    Pos.prototype["negate"] = function ()
    {
        this.x *= -1
        this.y *= -1
        return this
    }

    Pos.prototype["rotate"] = function (angle)
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
        if (angle === 0)
        {
            return this
        }
        rad = this.deg2rad(angle)
        cos = Math.cos(rad)
        sin = Math.sin(rad)
        x = this.x
        this.x = cos * this.x - sin * this.y
        this.y = sin * x + cos * this.y
        return this
    }

    return Pos
})()


module.exports = function (x, y)
{
    return new Pos(x,y)
}