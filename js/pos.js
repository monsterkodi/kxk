// koffee 1.14.0

/*
0000000    0000000    0000000
00   000  000   000  000     
0000000   000   000  0000000 
00        000   000       000
00         0000000   0000000
 */
var Pos, clamp;

clamp = require('./kxk').clamp;

Pos = (function() {
    function Pos(x1, y1) {
        var event, ref;
        this.x = x1;
        this.y = y1;
        if (((ref = this.x) != null ? ref.clientX : void 0) != null) {
            event = this.x;
            if (isNaN(window.scrollX)) {
                this.x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
                this.y = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
            } else {
                this.x = event.clientX + window.scrollX + 1;
                this.y = event.clientY + window.scrollY + 1;
            }
        } else if ((this.y == null) && Pos.isPos(this.x)) {
            this.y = this.x.y;
            this.x = this.x.x;
        }
        if (isNaN(this.x)) {
            this.x = 0;
        }
        if (isNaN(this.y)) {
            this.y = 0;
        }
    }

    Pos.prototype.copy = function() {
        return new Pos(this.x, this.y);
    };

    Pos.prototype.clone = function() {
        return new Pos(this.x, this.y);
    };

    Pos.prototype.reset = function() {
        return this.x = this.y = 0;
    };

    Pos.prototype.plus = function(val) {
        var newPos;
        newPos = this.copy();
        if (val != null) {
            if (!isNaN(val.x)) {
                newPos.x += val.x;
            }
            if (!isNaN(val.y)) {
                newPos.y += val.y;
            }
        }
        return newPos;
    };

    Pos.prototype.minus = function(val) {
        var newPos;
        newPos = this.copy();
        if (val != null) {
            if (!isNaN(val.x)) {
                newPos.x -= val.x;
            }
            if (!isNaN(val.y)) {
                newPos.y -= val.y;
            }
        }
        return newPos;
    };

    Pos.prototype.times = function(val) {
        return this.copy().scale(val);
    };

    Pos.prototype.clamped = function(lower, upper) {
        return this.copy().clamp(lower, upper);
    };

    Pos.prototype.rounded = function(v) {
        if (v == null) {
            v = 1.0;
        }
        return new Pos(Math.round(this.x / v) * v, Math.round(this.y / v) * v);
    };

    Pos.prototype.to = function(other) {
        return other.minus(this);
    };

    Pos.prototype.mid = function(other) {
        return this.plus(other).scale(0.5);
    };

    Pos.prototype.interpolate = function(other, f) {
        return this.plus(this.to(other).scale(f));
    };

    Pos.prototype.min = function(val) {
        var newPos;
        newPos = this.copy();
        if (val == null) {
            return newPos;
        }
        if (!isNaN(val.x) && this.x > val.x) {
            newPos.x = val.x;
        }
        if (!isNaN(val.y) && this.y > val.y) {
            newPos.y = val.y;
        }
        return newPos;
    };

    Pos.prototype.max = function(val) {
        var newPos;
        newPos = this.copy();
        if (val == null) {
            return newPos;
        }
        if (!isNaN(val.x) && this.x < val.x) {
            newPos.x = val.x;
        }
        if (!isNaN(val.y) && this.y < val.y) {
            newPos.y = val.y;
        }
        return newPos;
    };

    Pos.prototype.normal = function() {
        return this.copy().normalize();
    };

    Pos.prototype.neg = function() {
        return this.copy().negate();
    };

    Pos.prototype.length = function() {
        return Math.sqrt(this.square());
    };

    Pos.prototype.dot = function(o) {
        return this.x * o.x + this.y * o.y;
    };

    Pos.prototype.cross = function(o) {
        return this.x * o.y - this.y * o.x;
    };

    Pos.prototype.square = function() {
        return (this.x * this.x) + (this.y * this.y);
    };

    Pos.prototype.distSquare = function(o) {
        return this.minus(o).square();
    };

    Pos.prototype.dist = function(o) {
        return Math.sqrt(this.distSquare(o));
    };

    Pos.prototype.equals = function(o) {
        return this.x === (o != null ? o.x : void 0) && this.y === (o != null ? o.y : void 0);
    };

    Pos.prototype.deg2rad = function(d) {
        return Math.PI * d / 180.0;
    };

    Pos.prototype.rad2deg = function(r) {
        return r * 180.0 / Math.PI;
    };

    Pos.prototype.isClose = function(o, dist) {
        if (dist == null) {
            dist = 0.1;
        }
        return Math.abs(this.x - o.x) + Math.abs(this.y - o.y) < dist;
    };

    Pos.prototype.isZero = function(e) {
        if (e == null) {
            e = 0.000001;
        }
        return Math.abs(this.x) < e && Math.abs(this.y) < e;
    };

    Pos.prototype.angle = function(o) {
        if (o == null) {
            o = new Pos(0, 1);
        }
        return this.rad2deg(Math.acos(this.normal().dot(o.normal())));
    };

    Pos.prototype.perp = function() {
        return new Pos(-this.y, this.x);
    };

    Pos.prototype.rotation = function(o) {
        var d, s;
        d = o.dot(this.perp());
        if (Math.abs(d) < 0.0001) {
            if (this.dot(o) > 0) {
                return 0;
            }
            return 180;
        }
        s = d > 0 && -1 || 1;
        return s * this.angle(o);
    };

    Pos.prototype.check = function() {
        var newPos;
        newPos = this.copy();
        if (isNaN(newPos.x)) {
            newPos.x = 0;
        }
        if (isNaN(newPos.y)) {
            newPos.y = 0;
        }
        return newPos;
    };

    Pos.prototype._str = function() {
        var s;
        s = (this.x != null ? "<x:" + this.x + " " : void 0) || "<NaN ";
        return s += (this.y != null ? "y:" + this.y + ">" : void 0) || "NaN>";
    };

    Pos.isPos = function(o) {
        return (o != null) && (o.x != null) && (o.y != null) && Number.isFinite(o.x) && Number.isFinite(o.y);
    };

    Pos.prototype.fade = function(o, val) {
        this.x = this.x * (1 - val) + o.x * val;
        this.y = this.y * (1 - val) + o.y * val;
        return this;
    };

    Pos.prototype.scale = function(val) {
        this.x *= val;
        this.y *= val;
        return this;
    };

    Pos.prototype.mul = function(other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    };

    Pos.prototype.div = function(other) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    };

    Pos.prototype.add = function(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    };

    Pos.prototype.sub = function(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    };

    Pos.prototype.clamp = function(lower, upper) {
        if ((lower != null) && (upper != null)) {
            this.x = clamp(lower.x, upper.x, this.x);
            this.y = clamp(lower.y, upper.y, this.y);
        }
        return this;
    };

    Pos.prototype.normalize = function() {
        var l;
        l = this.length();
        if (l) {
            l = 1.0 / l;
            this.x *= l;
            this.y *= l;
        }
        return this;
    };

    Pos.prototype.negate = function() {
        this.x *= -1;
        this.y *= -1;
        return this;
    };

    Pos.prototype.rotate = function(angle) {
        var cos, rad, sin, x;
        while (angle > 360) {
            angle -= 360;
        }
        while (angle < -360) {
            angle += 360;
        }
        if (angle === 0) {
            return this;
        }
        rad = this.deg2rad(angle);
        cos = Math.cos(rad);
        sin = Math.sin(rad);
        x = this.x;
        this.x = cos * this.x - sin * this.y;
        this.y = sin * x + cos * this.y;
        return this;
    };

    return Pos;

})();

module.exports = function(x, y) {
    return new Pos(x, y);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicG9zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRRSxRQUFVLE9BQUEsQ0FBUSxPQUFSOztBQUVOO0lBRUMsYUFBQyxFQUFELEVBQUssRUFBTDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsSUFBRDtRQUFJLElBQUMsQ0FBQSxJQUFEO1FBQ0osSUFBRyx1REFBSDtZQUNJLEtBQUEsR0FBUSxJQUFDLENBQUE7WUFDVCxJQUFHLEtBQUEsQ0FBTSxNQUFNLENBQUMsT0FBYixDQUFIO2dCQUNJLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDLE9BQU4sR0FBZ0IsUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUF6QyxHQUFzRCxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUN6RSxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUssQ0FBQyxPQUFOLEdBQWdCLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBekMsR0FBcUQsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUY1RTthQUFBLE1BQUE7Z0JBSUksSUFBQyxDQUFBLENBQUQsR0FBSyxLQUFLLENBQUMsT0FBTixHQUFnQixNQUFNLENBQUMsT0FBdkIsR0FBaUM7Z0JBQ3RDLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDLE9BQU4sR0FBZ0IsTUFBTSxDQUFDLE9BQXZCLEdBQWlDLEVBTDFDO2FBRko7U0FBQSxNQVFLLElBQU8sZ0JBQUosSUFBWSxHQUFHLENBQUMsS0FBSixDQUFVLElBQUMsQ0FBQSxDQUFYLENBQWY7WUFDRCxJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUMsQ0FBQSxDQUFDLENBQUM7WUFDUixJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUMsQ0FBQSxDQUFDLENBQUMsRUFGUDs7UUFHTCxJQUFVLEtBQUEsQ0FBTSxJQUFDLENBQUEsQ0FBUCxDQUFWO1lBQUEsSUFBQyxDQUFBLENBQUQs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QUEsR0FBTSxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQVQ7UUFDTixHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFUO1FBQ04sR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVDtRQUNOLENBQUEsR0FBSyxJQUFDLENBQUE7UUFDTixJQUFDLENBQUEsQ0FBRCxHQUFLLEdBQUEsR0FBSSxJQUFDLENBQUEsQ0FBTCxHQUFTLEdBQUEsR0FBSSxJQUFDLENBQUE7UUFDbkIsSUFBQyxDQUFBLENBQUQsR0FBSyxHQUFBLEdBQUssQ0FBTCxHQUFTLEdBQUEsR0FBSSxJQUFDLENBQUE7ZUFDbkI7SUFWSTs7Ozs7O0FBWVosTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxDQUFELEVBQUcsQ0FBSDtXQUFTLElBQUksR0FBSixDQUFRLENBQVIsRUFBVSxDQUFWO0FBQVQiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4wMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbjAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwXG4wMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyMjXG5cbnsgY2xhbXAgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBQb3NcblxuICAgIEA6IChAeCwgQHkpIC0+XG4gICAgICAgIGlmIEB4Py5jbGllbnRYP1xuICAgICAgICAgICAgZXZlbnQgPSBAeFxuICAgICAgICAgICAgaWYgaXNOYU4gd2luZG93LnNjcm9sbFhcbiAgICAgICAgICAgICAgICBAeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgIEB5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEB4ID0gZXZlbnQuY2xpZW50WCArIHdpbmRvdy5zY3JvbGxYICsgMVxuICAgICAgICAgICAgICAgIEB5ID0gZXZlbnQuY2xpZW50WSArIHdpbmRvdy5zY3JvbGxZICsgMVxuICAgICAgICBlbHNlIGlmIG5vdCBAeT8gYW5kIFBvcy5pc1BvcyBAeFxuICAgICAgICAgICAgQHkgPSBAeC55XG4gICAgICAgICAgICBAeCA9IEB4LnhcbiAgICAgICAgQHggPSAwIGlmIGlzTmFOIEB4XG4gICAgICAgIEB5ID0gMCBpZiBpc05hTiBAeVxuICAgICAgICBcbiAgICBjb3B5OiAgLT4gbmV3IFBvcyBAeCwgQHlcbiAgICBjbG9uZTogLT4gbmV3IFBvcyBAeCwgQHlcblxuICAgIHJlc2V0OiAtPiBAeCA9IEB5ID0gMFxuICAgIFxuICAgIHBsdXM6ICh2YWwpIC0+XG4gICAgICAgIG5ld1BvcyA9IEBjb3B5KClcbiAgICAgICAgaWYgdmFsP1xuICAgICAgICAgICAgbmV3UG9zLnggKz0gdmFsLnggIHVubGVzcyBpc05hTih2YWwueClcbiAgICAgICAgICAgIG5ld1Bvcy55ICs9IHZhbC55ICB1bmxlc3MgaXNOYU4odmFsLnkpXG4gICAgICAgIG5ld1Bvc1xuXG4gICAgbWludXM6ICh2YWwpIC0+XG4gICAgICAgIG5ld1BvcyA9IEBjb3B5KClcbiAgICAgICAgaWYgdmFsP1xuICAgICAgICAgICAgbmV3UG9zLnggLT0gdmFsLnggIHVubGVzcyBpc05hTih2YWwueClcbiAgICAgICAgICAgIG5ld1Bvcy55IC09IHZhbC55ICB1bmxlc3MgaXNOYU4odmFsLnkpXG4gICAgICAgIG5ld1Bvc1xuICAgICAgICBcbiAgICB0aW1lczogKHZhbCkgLT4gQGNvcHkoKS5zY2FsZSB2YWxcbiAgICAgICAgXG4gICAgY2xhbXBlZDogKGxvd2VyLCB1cHBlcikgLT4gQGNvcHkoKS5jbGFtcCBsb3dlciwgdXBwZXJcbiAgICByb3VuZGVkOiAodj0xLjApIC0+IG5ldyBQb3MgTWF0aC5yb3VuZChAeC92KSp2LCBNYXRoLnJvdW5kKEB5L3YpKnZcbiAgICAgICAgXG4gICAgdG86ICAob3RoZXIpIC0+IG90aGVyLm1pbnVzIEBcbiAgICBtaWQ6IChvdGhlcikgLT4gQHBsdXMob3RoZXIpLnNjYWxlIDAuNVxuICAgIGludGVycG9sYXRlOiAob3RoZXIsIGYpIC0+IEBwbHVzIEB0byhvdGhlcikuc2NhbGUgZlxuXG4gICAgbWluOiAodmFsKSAtPlxuICAgICAgICBuZXdQb3MgPSBAY29weSgpXG4gICAgICAgIHJldHVybiBuZXdQb3MgdW5sZXNzIHZhbD9cbiAgICAgICAgbmV3UG9zLnggPSB2YWwueCAgaWYgbm90IGlzTmFOKHZhbC54KSBhbmQgQHggPiB2YWwueFxuICAgICAgICBuZXdQb3MueSA9IHZhbC55ICBpZiBub3QgaXNOYU4odmFsLnkpIGFuZCBAeSA+IHZhbC55XG4gICAgICAgIG5ld1Bvc1xuXG4gICAgbWF4OiAodmFsKSAtPlxuICAgICAgICBuZXdQb3MgPSBAY29weSgpXG4gICAgICAgIHJldHVybiBuZXdQb3MgdW5sZXNzIHZhbD9cbiAgICAgICAgbmV3UG9zLnggPSB2YWwueCAgaWYgbm90IGlzTmFOKHZhbC54KSBhbmQgQHggPCB2YWwueFxuICAgICAgICBuZXdQb3MueSA9IHZhbC55ICBpZiBub3QgaXNOYU4odmFsLnkpIGFuZCBAeSA8IHZhbC55XG4gICAgICAgIG5ld1Bvc1xuXG4gICAgbm9ybWFsOiAgICAgICAgIC0+IEBjb3B5KCkubm9ybWFsaXplKClcbiAgICBuZWc6ICAgICAgICAgICAgLT4gQGNvcHkoKS5uZWdhdGUoKVxuICAgIGxlbmd0aDogICAgICAgICAtPiByZXR1cm4gTWF0aC5zcXJ0IEBzcXVhcmUoKVxuICAgIGRvdDogICAgICAgIChvKSAtPiBAeCpvLnggKyBAeSpvLnlcbiAgICBjcm9zczogICAgICAobykgLT4gQHgqby55IC0gQHkqby54XG4gICAgc3F1YXJlOiAgICAgICAgIC0+IChAeCAqIEB4KSArIChAeSAqIEB5KVxuICAgIGRpc3RTcXVhcmU6IChvKSAtPiBAbWludXMobykuc3F1YXJlKClcbiAgICBkaXN0OiAgICAgICAobykgLT4gTWF0aC5zcXJ0IEBkaXN0U3F1YXJlKG8pXG4gICAgZXF1YWxzOiAgICAgKG8pIC0+IEB4ID09IG8/LnggYW5kIEB5ID09IG8/LnlcbiAgICBkZWcycmFkOiAgICAoZCkgLT4gTWF0aC5QSSpkLzE4MC4wXG4gICAgcmFkMmRlZzogICAgKHIpIC0+IHIqMTgwLjAvTWF0aC5QSVxuICAgIFxuICAgIGlzQ2xvc2U6ICAgIChvLGRpc3Q9MC4xKSAtPiBNYXRoLmFicyhAeC1vLngpK01hdGguYWJzKEB5LW8ueSkgPCBkaXN0XG4gICAgaXNaZXJvOiAgICAgKGU9MC4wMDAwMDEpIC0+IE1hdGguYWJzKEB4KTxlIGFuZCBNYXRoLmFicyhAeSk8ZVxuICAgIFxuICAgIGFuZ2xlOiAobz1uZXcgUG9zKDAsMSkpIC0+XG4gICAgICAgIEByYWQyZGVnIE1hdGguYWNvcyBAbm9ybWFsKCkuZG90IG8ubm9ybWFsKClcbiAgICAgICAgXG4gICAgcGVycDogLT4gbmV3IFBvcyAtQHksIEB4XG4gICAgXG4gICAgcm90YXRpb246IChvKSAtPiBcbiAgICAgICAgZCA9IG8uZG90IEBwZXJwKClcbiAgICAgICAgaWYgTWF0aC5hYnMoZCkgPCAwLjAwMDFcbiAgICAgICAgICAgIHJldHVybiAwIGlmIEBkb3QobykgPiAwXG4gICAgICAgICAgICByZXR1cm4gMTgwXG4gICAgICAgIHMgPSBkID4gMCBhbmQgLTEgb3IgMVxuICAgICAgICBzICogQGFuZ2xlIG9cbiAgICAgICAgICAgIFxuICAgIGNoZWNrOiAtPlxuICAgICAgICBuZXdQb3MgPSBAY29weSgpXG4gICAgICAgIG5ld1Bvcy54ID0gMCBpZiBpc05hTihuZXdQb3MueClcbiAgICAgICAgbmV3UG9zLnkgPSAwIGlmIGlzTmFOKG5ld1Bvcy55KVxuICAgICAgICBuZXdQb3NcblxuICAgIF9zdHI6IC0+IFxuICAgICAgICBzICA9IChcIjx4OiN7QHh9IFwiIGlmIEB4Pykgb3IgXCI8TmFOIFwiXG4gICAgICAgIHMgKz0gKFwieToje0B5fT5cIiBpZiBAeT8pIG9yIFwiTmFOPlwiXG5cbiAgICBAaXNQb3M6IChvKSAtPiBvPyBhbmQgby54PyBhbmQgby55PyBhbmQgTnVtYmVyLmlzRmluaXRlKG8ueCkgYW5kIE51bWJlci5pc0Zpbml0ZShvLnkpXG4gICAgXG4gICAgI19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXyBkZXN0cnVjdGl2ZVxuICAgIFxuICAgIGZhZGU6IChvLCB2YWwpIC0+XG4gICAgICAgIEB4ID0gQHggKiAoMS12YWwpICsgby54ICogdmFsXG4gICAgICAgIEB5ID0gQHkgKiAoMS12YWwpICsgby55ICogdmFsXG4gICAgICAgIEBcbiAgICBcbiAgICBzY2FsZTogKHZhbCkgLT5cbiAgICAgICAgQHggKj0gdmFsXG4gICAgICAgIEB5ICo9IHZhbFxuICAgICAgICBAXG5cbiAgICBtdWw6IChvdGhlcikgLT5cbiAgICAgICAgQHggKj0gb3RoZXIueFxuICAgICAgICBAeSAqPSBvdGhlci55XG4gICAgICAgIEBcbiAgICAgICAgXG4gICAgZGl2OiAob3RoZXIpIC0+XG4gICAgICAgIEB4IC89IG90aGVyLnhcbiAgICAgICAgQHkgLz0gb3RoZXIueVxuICAgICAgICBAXG4gICAgICAgIFxuICAgIGFkZDogKG90aGVyKSAtPlxuICAgICAgICBAeCArPSBvdGhlci54XG4gICAgICAgIEB5ICs9IG90aGVyLnlcbiAgICAgICAgQFxuXG4gICAgc3ViOiAob3RoZXIpIC0+XG4gICAgICAgIEB4IC09IG90aGVyLnhcbiAgICAgICAgQHkgLT0gb3RoZXIueVxuICAgICAgICBAXG5cbiAgICBjbGFtcDogKGxvd2VyLCB1cHBlcikgLT4gICAgICAgIFxuICAgICAgICBpZiBsb3dlcj8gYW5kIHVwcGVyPyAgICAgICAgICAgIFxuICAgICAgICAgICAgQHggPSBjbGFtcChsb3dlci54LCB1cHBlci54LCBAeClcbiAgICAgICAgICAgIEB5ID0gY2xhbXAobG93ZXIueSwgdXBwZXIueSwgQHkpXG4gICAgICAgIEBcbiAgICAgICAgXG4gICAgbm9ybWFsaXplOiAtPlxuICAgICAgICBsID0gQGxlbmd0aCgpXG4gICAgICAgIGlmIGxcbiAgICAgICAgICAgIGwgPSAxLjAvbFxuICAgICAgICAgICAgQHggKj0gbFxuICAgICAgICAgICAgQHkgKj0gbFxuICAgICAgICBAICAgIFxuXG4gICAgbmVnYXRlOiAtPlxuICAgICAgICBAeCAqPSAtMVxuICAgICAgICBAeSAqPSAtMVxuICAgICAgICBAXG4gICAgICAgIFxuICAgIHJvdGF0ZTogKGFuZ2xlKSAtPlxuICAgICAgICBhbmdsZSAtPSAzNjAgd2hpbGUgYW5nbGUgPiAgMzYwIFxuICAgICAgICBhbmdsZSArPSAzNjAgd2hpbGUgYW5nbGUgPCAtMzYwIFxuICAgICAgICByZXR1cm4gQCBpZiBhbmdsZSA9PSAwXG4gICAgICAgIHJhZCA9IEBkZWcycmFkIGFuZ2xlXG4gICAgICAgIGNvcyA9IE1hdGguY29zIHJhZFxuICAgICAgICBzaW4gPSBNYXRoLnNpbiByYWRcbiAgICAgICAgeCAgPSBAeFxuICAgICAgICBAeCA9IGNvcypAeCAtIHNpbipAeVxuICAgICAgICBAeSA9IHNpbiogeCArIGNvcypAeVxuICAgICAgICBAXG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgLT4gbmV3IFBvcyB4LHlcbiJdfQ==
//# sourceURL=../coffee/pos.coffee