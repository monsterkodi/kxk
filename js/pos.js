(function() {
  /*
  0000000    0000000    0000000
  00   000  000   000  000     
  0000000   000   000  0000000 
  00        000   000       000
  00         0000000   0000000 
  */
  var Pos, clamp;

  ({clamp} = require('./kxk'));

  Pos = class Pos {
    constructor(x1, y1) {
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
    }

    copy() {
      return new Pos(this.x, this.y);
    }

    plus(val) {
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
    }

    minus(val) {
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
    }

    times(val) {
      return this.copy().scale(val);
    }

    clamped(lower, upper) {
      return this.copy().clamp(lower, upper);
    }

    rounded(v = 1.0) {
      return new Pos(Math.round(this.x / v) * v, Math.round(this.y / v) * v);
    }

    to(other) {
      return other.minus(this);
    }

    mid(other) {
      return this.plus(other).scale(0.5);
    }

    interpolate(other, f) {
      return this.plus(this.to(other).scale(f));
    }

    min(val) {
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
    }

    max(val) {
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
    }

    normal() {
      return this.copy().normalize();
    }

    neg() {
      return this.copy().negate();
    }

    length() {
      return Math.sqrt(this.square());
    }

    dot(o) {
      return this.x * o.x + this.y * o.y;
    }

    cross(o) {
      return this.x * o.y - this.y * o.x;
    }

    square() {
      return (this.x * this.x) + (this.y * this.y);
    }

    distSquare(o) {
      return this.minus(o).square();
    }

    dist(o) {
      return Math.sqrt(this.distSquare(o));
    }

    equals(o) {
      return this.x === (o != null ? o.x : void 0) && this.y === (o != null ? o.y : void 0);
    }

    deg2rad(d) {
      return Math.PI * d / 180.0;
    }

    rad2deg(r) {
      return r * 180.0 / Math.PI;
    }

    isClose(o, dist = 0.1) {
      return Math.abs(this.x - o.x) + Math.abs(this.y - o.y) < dist;
    }

    isZero(e = 0.000001) {
      return Math.abs(this.x) < e && Math.abs(this.y) < e;
    }

    angle(o = new Pos(0, 1)) {
      return this.rad2deg(Math.acos(this.normal().dot(o.normal())));
    }

    perp() {
      return new Pos(-this.y, this.x);
    }

    rotation(o) {
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
    }

    check() {
      var newPos;
      newPos = this.copy();
      if (isNaN(newPos.x)) {
        newPos.x = 0;
      }
      if (isNaN(newPos.y)) {
        newPos.y = 0;
      }
      return newPos;
    }

    _str() {
      var s;
      s = (this.x != null ? `<x:${this.x} ` : void 0) || "<NaN ";
      return s += (this.y != null ? `y:${this.y}>` : void 0) || "NaN>";
    }

    static isPos(o) {
      return (o.x != null) && (o.y != null) && Number.isFinite(o.x) && Number.isFinite(o.y);
    }

    
    //_________________________________________________________ destructive
    fade(o, val) {
      this.x = this.x * (1 - val) + o.x * val;
      this.y = this.y * (1 - val) + o.y * val;
      return this;
    }

    scale(val) {
      this.x *= val;
      this.y *= val;
      return this;
    }

    mul(other) {
      this.x *= other.x;
      this.y *= other.y;
      return this;
    }

    div(other) {
      this.x /= other.x;
      this.y /= other.y;
      return this;
    }

    add(other) {
      this.x += other.x;
      this.y += other.y;
      return this;
    }

    sub(other) {
      this.x -= other.x;
      this.y -= other.y;
      return this;
    }

    clamp(lower, upper) {
      if ((lower != null) && (upper != null)) {
        this.x = clamp(lower.x, upper.x, this.x);
        this.y = clamp(lower.y, upper.y, this.y);
      }
      return this;
    }

    normalize() {
      var l;
      l = this.length();
      if (l) {
        l = 1.0 / l;
        this.x *= l;
        this.y *= l;
      }
      return this;
    }

    negate() {
      this.x *= -1;
      this.y *= -1;
      return this;
    }

    rotate(angle) {
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
    }

  };

  module.exports = function(x, y) {
    return new Pos(x, y);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9wb3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLEdBQUEsRUFBQTs7RUFRQSxDQUFBLENBQUUsS0FBRixDQUFBLEdBQVksT0FBQSxDQUFRLE9BQVIsQ0FBWjs7RUFFTSxNQUFOLE1BQUEsSUFBQTtJQUVJLFdBQWEsR0FBQSxJQUFBLENBQUE7QUFDVCxVQUFBLEtBQUEsRUFBQTtNQURVLElBQUMsQ0FBQTtNQUFHLElBQUMsQ0FBQTtNQUNmLElBQUcsdURBQUg7UUFDSSxLQUFBLEdBQVEsSUFBQyxDQUFBO1FBQ1QsSUFBRyxLQUFBLENBQU0sTUFBTSxDQUFDLE9BQWIsQ0FBSDtVQUNJLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDLE9BQU4sR0FBZ0IsUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUF6QyxHQUFzRCxRQUFRLENBQUMsSUFBSSxDQUFDO1VBQ3pFLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDLE9BQU4sR0FBZ0IsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUF6QyxHQUFxRCxRQUFRLENBQUMsSUFBSSxDQUFDLFVBRjVFO1NBQUEsTUFBQTtVQUlJLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDLE9BQU4sR0FBZ0IsTUFBTSxDQUFDLE9BQXZCLEdBQWlDO1VBQ3RDLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDLE9BQU4sR0FBZ0IsTUFBTSxDQUFDLE9BQXZCLEdBQWlDLEVBTDFDO1NBRko7T0FBQSxNQVFLLElBQU8sZ0JBQUosSUFBWSxHQUFHLENBQUMsS0FBSixDQUFVLElBQUMsQ0FBQSxDQUFYLENBQWY7UUFDRCxJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUMsQ0FBQSxDQUFDLENBQUM7UUFDUixJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUMsQ0FBQSxDQUFDLENBQUMsRUFGUDs7SUFUSTs7SUFh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QUEsR0FBSSxJQUFDLENBQUE7YUFDbkI7SUFWSTs7RUFqSlo7O0VBNkpBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFBO1dBQVMsSUFBSSxHQUFKLENBQVEsQ0FBUixFQUFVLENBQVY7RUFBVDtBQXZLakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4wMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbjAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwXG4wMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyMjXG5cbnsgY2xhbXAgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBQb3NcblxuICAgIGNvbnN0cnVjdG9yOiAoQHgsIEB5KSAtPlxuICAgICAgICBpZiBAeD8uY2xpZW50WD9cbiAgICAgICAgICAgIGV2ZW50ID0gQHhcbiAgICAgICAgICAgIGlmIGlzTmFOIHdpbmRvdy5zY3JvbGxYXG4gICAgICAgICAgICAgICAgQHggPSBldmVudC5jbGllbnRYICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICBAeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAeCA9IGV2ZW50LmNsaWVudFggKyB3aW5kb3cuc2Nyb2xsWCArIDFcbiAgICAgICAgICAgICAgICBAeSA9IGV2ZW50LmNsaWVudFkgKyB3aW5kb3cuc2Nyb2xsWSArIDFcbiAgICAgICAgZWxzZSBpZiBub3QgQHk/IGFuZCBQb3MuaXNQb3MgQHhcbiAgICAgICAgICAgIEB5ID0gQHgueVxuICAgICAgICAgICAgQHggPSBAeC54XG4gICAgICAgIFxuICAgIGNvcHk6IC0+IG5ldyBQb3MgQHgsIEB5XG5cbiAgICBwbHVzOiAodmFsKSAtPlxuICAgICAgICBuZXdQb3MgPSBAY29weSgpXG4gICAgICAgIGlmIHZhbD9cbiAgICAgICAgICAgIG5ld1Bvcy54ICs9IHZhbC54ICB1bmxlc3MgaXNOYU4odmFsLngpXG4gICAgICAgICAgICBuZXdQb3MueSArPSB2YWwueSAgdW5sZXNzIGlzTmFOKHZhbC55KVxuICAgICAgICBuZXdQb3NcblxuICAgIG1pbnVzOiAodmFsKSAtPlxuICAgICAgICBuZXdQb3MgPSBAY29weSgpXG4gICAgICAgIGlmIHZhbD9cbiAgICAgICAgICAgIG5ld1Bvcy54IC09IHZhbC54ICB1bmxlc3MgaXNOYU4odmFsLngpXG4gICAgICAgICAgICBuZXdQb3MueSAtPSB2YWwueSAgdW5sZXNzIGlzTmFOKHZhbC55KVxuICAgICAgICBuZXdQb3NcbiAgICAgICAgXG4gICAgdGltZXM6ICh2YWwpIC0+IEBjb3B5KCkuc2NhbGUgdmFsXG4gICAgICAgIFxuICAgIGNsYW1wZWQ6IChsb3dlciwgdXBwZXIpIC0+IEBjb3B5KCkuY2xhbXAgbG93ZXIsIHVwcGVyXG4gICAgcm91bmRlZDogKHY9MS4wKSAtPiBuZXcgUG9zIE1hdGgucm91bmQoQHgvdikqdiwgTWF0aC5yb3VuZChAeS92KSp2XG4gICAgICAgIFxuICAgIHRvOiAgKG90aGVyKSAtPiBvdGhlci5taW51cyBAXG4gICAgbWlkOiAob3RoZXIpIC0+IEBwbHVzKG90aGVyKS5zY2FsZSAwLjVcbiAgICBpbnRlcnBvbGF0ZTogKG90aGVyLCBmKSAtPiBAcGx1cyBAdG8ob3RoZXIpLnNjYWxlIGZcblxuICAgIG1pbjogKHZhbCkgLT5cbiAgICAgICAgbmV3UG9zID0gQGNvcHkoKVxuICAgICAgICByZXR1cm4gbmV3UG9zIHVubGVzcyB2YWw/XG4gICAgICAgIG5ld1Bvcy54ID0gdmFsLnggIGlmIG5vdCBpc05hTih2YWwueCkgYW5kIEB4ID4gdmFsLnhcbiAgICAgICAgbmV3UG9zLnkgPSB2YWwueSAgaWYgbm90IGlzTmFOKHZhbC55KSBhbmQgQHkgPiB2YWwueVxuICAgICAgICBuZXdQb3NcblxuICAgIG1heDogKHZhbCkgLT5cbiAgICAgICAgbmV3UG9zID0gQGNvcHkoKVxuICAgICAgICByZXR1cm4gbmV3UG9zIHVubGVzcyB2YWw/XG4gICAgICAgIG5ld1Bvcy54ID0gdmFsLnggIGlmIG5vdCBpc05hTih2YWwueCkgYW5kIEB4IDwgdmFsLnhcbiAgICAgICAgbmV3UG9zLnkgPSB2YWwueSAgaWYgbm90IGlzTmFOKHZhbC55KSBhbmQgQHkgPCB2YWwueVxuICAgICAgICBuZXdQb3NcblxuICAgIG5vcm1hbDogICAgICAgICAtPiBAY29weSgpLm5vcm1hbGl6ZSgpXG4gICAgbmVnOiAgICAgICAgICAgIC0+IEBjb3B5KCkubmVnYXRlKClcbiAgICBsZW5ndGg6ICAgICAgICAgLT4gcmV0dXJuIE1hdGguc3FydCBAc3F1YXJlKClcbiAgICBkb3Q6ICAgICAgICAobykgLT4gQHgqby54ICsgQHkqby55XG4gICAgY3Jvc3M6ICAgICAgKG8pIC0+IEB4Km8ueSAtIEB5Km8ueFxuICAgIHNxdWFyZTogICAgICAgICAtPiAoQHggKiBAeCkgKyAoQHkgKiBAeSlcbiAgICBkaXN0U3F1YXJlOiAobykgLT4gQG1pbnVzKG8pLnNxdWFyZSgpXG4gICAgZGlzdDogICAgICAgKG8pIC0+IE1hdGguc3FydCBAZGlzdFNxdWFyZShvKVxuICAgIGVxdWFsczogICAgIChvKSAtPiBAeCA9PSBvPy54IGFuZCBAeSA9PSBvPy55XG4gICAgZGVnMnJhZDogICAgKGQpIC0+IE1hdGguUEkqZC8xODAuMFxuICAgIHJhZDJkZWc6ICAgIChyKSAtPiByKjE4MC4wL01hdGguUElcbiAgICBcbiAgICBpc0Nsb3NlOiAgICAobyxkaXN0PTAuMSkgLT4gTWF0aC5hYnMoQHgtby54KStNYXRoLmFicyhAeS1vLnkpIDwgZGlzdFxuICAgIGlzWmVybzogICAgIChlPTAuMDAwMDAxKSAtPiBNYXRoLmFicyhAeCk8ZSBhbmQgTWF0aC5hYnMoQHkpPGVcbiAgICBcbiAgICBhbmdsZTogKG89bmV3IFBvcygwLDEpKSAtPlxuICAgICAgICBAcmFkMmRlZyBNYXRoLmFjb3MgQG5vcm1hbCgpLmRvdCBvLm5vcm1hbCgpXG4gICAgICAgIFxuICAgIHBlcnA6IC0+IG5ldyBQb3MgLUB5LCBAeFxuICAgIFxuICAgIHJvdGF0aW9uOiAobykgLT4gXG4gICAgICAgIGQgPSBvLmRvdCBAcGVycCgpXG4gICAgICAgIGlmIE1hdGguYWJzKGQpIDwgMC4wMDAxXG4gICAgICAgICAgICByZXR1cm4gMCBpZiBAZG90KG8pID4gMFxuICAgICAgICAgICAgcmV0dXJuIDE4MFxuICAgICAgICBzID0gZCA+IDAgYW5kIC0xIG9yIDFcbiAgICAgICAgcyAqIEBhbmdsZSBvXG4gICAgICAgICAgICBcbiAgICBjaGVjazogLT5cbiAgICAgICAgbmV3UG9zID0gQGNvcHkoKVxuICAgICAgICBuZXdQb3MueCA9IDAgaWYgaXNOYU4obmV3UG9zLngpXG4gICAgICAgIG5ld1Bvcy55ID0gMCBpZiBpc05hTihuZXdQb3MueSlcbiAgICAgICAgbmV3UG9zXG5cbiAgICBfc3RyOiAtPiBcbiAgICAgICAgcyAgPSAoXCI8eDoje0B4fSBcIiBpZiBAeD8pIG9yIFwiPE5hTiBcIlxuICAgICAgICBzICs9IChcInk6I3tAeX0+XCIgaWYgQHk/KSBvciBcIk5hTj5cIlxuXG4gICAgQGlzUG9zOiAobykgLT4gby54PyBhbmQgby55PyBhbmQgTnVtYmVyLmlzRmluaXRlKG8ueCkgYW5kIE51bWJlci5pc0Zpbml0ZShvLnkpXG4gICAgXG4gICAgI19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXyBkZXN0cnVjdGl2ZVxuICAgIFxuICAgIGZhZGU6IChvLCB2YWwpIC0+XG4gICAgICAgIEB4ID0gQHggKiAoMS12YWwpICsgby54ICogdmFsXG4gICAgICAgIEB5ID0gQHkgKiAoMS12YWwpICsgby55ICogdmFsXG4gICAgICAgIEBcbiAgICBcbiAgICBzY2FsZTogKHZhbCkgLT5cbiAgICAgICAgQHggKj0gdmFsXG4gICAgICAgIEB5ICo9IHZhbFxuICAgICAgICBAXG5cbiAgICBtdWw6IChvdGhlcikgLT5cbiAgICAgICAgQHggKj0gb3RoZXIueFxuICAgICAgICBAeSAqPSBvdGhlci55XG4gICAgICAgIEBcbiAgICAgICAgXG4gICAgZGl2OiAob3RoZXIpIC0+XG4gICAgICAgIEB4IC89IG90aGVyLnhcbiAgICAgICAgQHkgLz0gb3RoZXIueVxuICAgICAgICBAXG4gICAgICAgIFxuICAgIGFkZDogKG90aGVyKSAtPlxuICAgICAgICBAeCArPSBvdGhlci54XG4gICAgICAgIEB5ICs9IG90aGVyLnlcbiAgICAgICAgQFxuXG4gICAgc3ViOiAob3RoZXIpIC0+XG4gICAgICAgIEB4IC09IG90aGVyLnhcbiAgICAgICAgQHkgLT0gb3RoZXIueVxuICAgICAgICBAXG5cbiAgICBjbGFtcDogKGxvd2VyLCB1cHBlcikgLT4gICAgICAgIFxuICAgICAgICBpZiBsb3dlcj8gYW5kIHVwcGVyPyAgICAgICAgICAgIFxuICAgICAgICAgICAgQHggPSBjbGFtcChsb3dlci54LCB1cHBlci54LCBAeClcbiAgICAgICAgICAgIEB5ID0gY2xhbXAobG93ZXIueSwgdXBwZXIueSwgQHkpXG4gICAgICAgIEBcbiAgICAgICAgXG4gICAgbm9ybWFsaXplOiAtPlxuICAgICAgICBsID0gQGxlbmd0aCgpXG4gICAgICAgIGlmIGxcbiAgICAgICAgICAgIGwgPSAxLjAvbFxuICAgICAgICAgICAgQHggKj0gbFxuICAgICAgICAgICAgQHkgKj0gbFxuICAgICAgICBAICAgIFxuXG4gICAgbmVnYXRlOiAtPlxuICAgICAgICBAeCAqPSAtMVxuICAgICAgICBAeSAqPSAtMVxuICAgICAgICBAXG4gICAgICAgIFxuICAgIHJvdGF0ZTogKGFuZ2xlKSAtPlxuICAgICAgICBhbmdsZSAtPSAzNjAgd2hpbGUgYW5nbGUgPiAgMzYwIFxuICAgICAgICBhbmdsZSArPSAzNjAgd2hpbGUgYW5nbGUgPCAtMzYwIFxuICAgICAgICByZXR1cm4gQCBpZiBhbmdsZSA9PSAwXG4gICAgICAgIHJhZCA9IEBkZWcycmFkIGFuZ2xlXG4gICAgICAgIGNvcyA9IE1hdGguY29zIHJhZFxuICAgICAgICBzaW4gPSBNYXRoLnNpbiByYWRcbiAgICAgICAgeCAgPSBAeFxuICAgICAgICBAeCA9IGNvcypAeCAtIHNpbipAeVxuICAgICAgICBAeSA9IHNpbiogeCArIGNvcypAeVxuICAgICAgICBAXG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgLT4gbmV3IFBvcyB4LHlcbiJdfQ==
//# sourceURL=../coffee/pos.coffee