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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJjb2ZmZWUvcG9zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxHQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLEtBQUYsQ0FBQSxHQUFZLE9BQUEsQ0FBUSxPQUFSLENBQVo7O0VBRU0sTUFBTixNQUFBLElBQUE7SUFFSSxXQUFhLEdBQUEsSUFBQSxDQUFBO0FBQ1QsVUFBQSxLQUFBLEVBQUE7TUFEVSxJQUFDLENBQUE7TUFBRyxJQUFDLENBQUE7TUFDZixJQUFHLHVEQUFIO1FBQ0ksS0FBQSxHQUFRLElBQUMsQ0FBQTtRQUNULElBQUcsS0FBQSxDQUFNLE1BQU0sQ0FBQyxPQUFiLENBQUg7VUFDSSxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUssQ0FBQyxPQUFOLEdBQWdCLFFBQVEsQ0FBQyxlQUFlLENBQUMsVUFBekMsR0FBc0QsUUFBUSxDQUFDLElBQUksQ0FBQztVQUN6RSxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUssQ0FBQyxPQUFOLEdBQWdCLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBekMsR0FBcUQsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUY1RTtTQUFBLE1BQUE7VUFJSSxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUssQ0FBQyxPQUFOLEdBQWdCLE1BQU0sQ0FBQyxPQUF2QixHQUFpQztVQUN0QyxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUssQ0FBQyxPQUFOLEdBQWdCLE1BQU0sQ0FBQyxPQUF2QixHQUFpQyxFQUwxQztTQUZKO09BQUEsTUFRSyxJQUFPLGdCQUFKLElBQVksR0FBRyxDQUFDLEtBQUosQ0FBVSxJQUFDLENBQUEsQ0FBWCxDQUFmO1FBQ0QsSUFBQyxDQUFBLENBQUQsR0FBSyxJQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ1IsSUFBQyxDQUFBLENBQUQsR0FBSyxJQUFDLENBQUEsQ0FBQyxDQUFDLEVBRlA7O0lBVEk7O0lBYWIs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LEdBQUksSUFBQyxDQUFBO2FBQ25CO0lBVkk7O0VBakpaOztFQTZKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBQTtXQUFTLElBQUksR0FBSixDQUFRLENBQVIsRUFBVSxDQUFWO0VBQVQ7QUF2S2pCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbjAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCBcbiMjI1xuXG57IGNsYW1wIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgUG9zXG5cbiAgICBjb25zdHJ1Y3RvcjogKEB4LCBAeSkgLT5cbiAgICAgICAgaWYgQHg/LmNsaWVudFg/XG4gICAgICAgICAgICBldmVudCA9IEB4XG4gICAgICAgICAgICBpZiBpc05hTiB3aW5kb3cuc2Nyb2xsWFxuICAgICAgICAgICAgICAgIEB4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG4gICAgICAgICAgICAgICAgQHkgPSBldmVudC5jbGllbnRZICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHggPSBldmVudC5jbGllbnRYICsgd2luZG93LnNjcm9sbFggKyAxXG4gICAgICAgICAgICAgICAgQHkgPSBldmVudC5jbGllbnRZICsgd2luZG93LnNjcm9sbFkgKyAxXG4gICAgICAgIGVsc2UgaWYgbm90IEB5PyBhbmQgUG9zLmlzUG9zIEB4XG4gICAgICAgICAgICBAeSA9IEB4LnlcbiAgICAgICAgICAgIEB4ID0gQHgueFxuICAgICAgICBcbiAgICBjb3B5OiAtPiBuZXcgUG9zIEB4LCBAeVxuXG4gICAgcGx1czogKHZhbCkgLT5cbiAgICAgICAgbmV3UG9zID0gQGNvcHkoKVxuICAgICAgICBpZiB2YWw/XG4gICAgICAgICAgICBuZXdQb3MueCArPSB2YWwueCAgdW5sZXNzIGlzTmFOKHZhbC54KVxuICAgICAgICAgICAgbmV3UG9zLnkgKz0gdmFsLnkgIHVubGVzcyBpc05hTih2YWwueSlcbiAgICAgICAgbmV3UG9zXG5cbiAgICBtaW51czogKHZhbCkgLT5cbiAgICAgICAgbmV3UG9zID0gQGNvcHkoKVxuICAgICAgICBpZiB2YWw/XG4gICAgICAgICAgICBuZXdQb3MueCAtPSB2YWwueCAgdW5sZXNzIGlzTmFOKHZhbC54KVxuICAgICAgICAgICAgbmV3UG9zLnkgLT0gdmFsLnkgIHVubGVzcyBpc05hTih2YWwueSlcbiAgICAgICAgbmV3UG9zXG4gICAgICAgIFxuICAgIHRpbWVzOiAodmFsKSAtPiBAY29weSgpLnNjYWxlIHZhbFxuICAgICAgICBcbiAgICBjbGFtcGVkOiAobG93ZXIsIHVwcGVyKSAtPiBAY29weSgpLmNsYW1wIGxvd2VyLCB1cHBlclxuICAgIHJvdW5kZWQ6ICh2PTEuMCkgLT4gbmV3IFBvcyBNYXRoLnJvdW5kKEB4L3YpKnYsIE1hdGgucm91bmQoQHkvdikqdlxuICAgICAgICBcbiAgICB0bzogIChvdGhlcikgLT4gb3RoZXIubWludXMgQFxuICAgIG1pZDogKG90aGVyKSAtPiBAcGx1cyhvdGhlcikuc2NhbGUgMC41XG4gICAgaW50ZXJwb2xhdGU6IChvdGhlciwgZikgLT4gQHBsdXMgQHRvKG90aGVyKS5zY2FsZSBmXG5cbiAgICBtaW46ICh2YWwpIC0+XG4gICAgICAgIG5ld1BvcyA9IEBjb3B5KClcbiAgICAgICAgcmV0dXJuIG5ld1BvcyB1bmxlc3MgdmFsP1xuICAgICAgICBuZXdQb3MueCA9IHZhbC54ICBpZiBub3QgaXNOYU4odmFsLngpIGFuZCBAeCA+IHZhbC54XG4gICAgICAgIG5ld1Bvcy55ID0gdmFsLnkgIGlmIG5vdCBpc05hTih2YWwueSkgYW5kIEB5ID4gdmFsLnlcbiAgICAgICAgbmV3UG9zXG5cbiAgICBtYXg6ICh2YWwpIC0+XG4gICAgICAgIG5ld1BvcyA9IEBjb3B5KClcbiAgICAgICAgcmV0dXJuIG5ld1BvcyB1bmxlc3MgdmFsP1xuICAgICAgICBuZXdQb3MueCA9IHZhbC54ICBpZiBub3QgaXNOYU4odmFsLngpIGFuZCBAeCA8IHZhbC54XG4gICAgICAgIG5ld1Bvcy55ID0gdmFsLnkgIGlmIG5vdCBpc05hTih2YWwueSkgYW5kIEB5IDwgdmFsLnlcbiAgICAgICAgbmV3UG9zXG5cbiAgICBub3JtYWw6ICAgICAgICAgLT4gQGNvcHkoKS5ub3JtYWxpemUoKVxuICAgIG5lZzogICAgICAgICAgICAtPiBAY29weSgpLm5lZ2F0ZSgpXG4gICAgbGVuZ3RoOiAgICAgICAgIC0+IHJldHVybiBNYXRoLnNxcnQgQHNxdWFyZSgpXG4gICAgZG90OiAgICAgICAgKG8pIC0+IEB4Km8ueCArIEB5Km8ueVxuICAgIGNyb3NzOiAgICAgIChvKSAtPiBAeCpvLnkgLSBAeSpvLnhcbiAgICBzcXVhcmU6ICAgICAgICAgLT4gKEB4ICogQHgpICsgKEB5ICogQHkpXG4gICAgZGlzdFNxdWFyZTogKG8pIC0+IEBtaW51cyhvKS5zcXVhcmUoKVxuICAgIGRpc3Q6ICAgICAgIChvKSAtPiBNYXRoLnNxcnQgQGRpc3RTcXVhcmUobylcbiAgICBlcXVhbHM6ICAgICAobykgLT4gQHggPT0gbz8ueCBhbmQgQHkgPT0gbz8ueVxuICAgIGRlZzJyYWQ6ICAgIChkKSAtPiBNYXRoLlBJKmQvMTgwLjBcbiAgICByYWQyZGVnOiAgICAocikgLT4gcioxODAuMC9NYXRoLlBJXG4gICAgXG4gICAgaXNDbG9zZTogICAgKG8sZGlzdD0wLjEpIC0+IE1hdGguYWJzKEB4LW8ueCkrTWF0aC5hYnMoQHktby55KSA8IGRpc3RcbiAgICBpc1plcm86ICAgICAoZT0wLjAwMDAwMSkgLT4gTWF0aC5hYnMoQHgpPGUgYW5kIE1hdGguYWJzKEB5KTxlXG4gICAgXG4gICAgYW5nbGU6IChvPW5ldyBQb3MoMCwxKSkgLT5cbiAgICAgICAgQHJhZDJkZWcgTWF0aC5hY29zIEBub3JtYWwoKS5kb3Qgby5ub3JtYWwoKVxuICAgICAgICBcbiAgICBwZXJwOiAtPiBuZXcgUG9zIC1AeSwgQHhcbiAgICBcbiAgICByb3RhdGlvbjogKG8pIC0+IFxuICAgICAgICBkID0gby5kb3QgQHBlcnAoKVxuICAgICAgICBpZiBNYXRoLmFicyhkKSA8IDAuMDAwMVxuICAgICAgICAgICAgcmV0dXJuIDAgaWYgQGRvdChvKSA+IDBcbiAgICAgICAgICAgIHJldHVybiAxODBcbiAgICAgICAgcyA9IGQgPiAwIGFuZCAtMSBvciAxXG4gICAgICAgIHMgKiBAYW5nbGUgb1xuICAgICAgICAgICAgXG4gICAgY2hlY2s6IC0+XG4gICAgICAgIG5ld1BvcyA9IEBjb3B5KClcbiAgICAgICAgbmV3UG9zLnggPSAwIGlmIGlzTmFOKG5ld1Bvcy54KVxuICAgICAgICBuZXdQb3MueSA9IDAgaWYgaXNOYU4obmV3UG9zLnkpXG4gICAgICAgIG5ld1Bvc1xuXG4gICAgX3N0cjogLT4gXG4gICAgICAgIHMgID0gKFwiPHg6I3tAeH0gXCIgaWYgQHg/KSBvciBcIjxOYU4gXCJcbiAgICAgICAgcyArPSAoXCJ5OiN7QHl9PlwiIGlmIEB5Pykgb3IgXCJOYU4+XCJcblxuICAgIEBpc1BvczogKG8pIC0+IG8ueD8gYW5kIG8ueT8gYW5kIE51bWJlci5pc0Zpbml0ZShvLngpIGFuZCBOdW1iZXIuaXNGaW5pdGUoby55KVxuICAgIFxuICAgICNfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18gZGVzdHJ1Y3RpdmVcbiAgICBcbiAgICBmYWRlOiAobywgdmFsKSAtPlxuICAgICAgICBAeCA9IEB4ICogKDEtdmFsKSArIG8ueCAqIHZhbFxuICAgICAgICBAeSA9IEB5ICogKDEtdmFsKSArIG8ueSAqIHZhbFxuICAgICAgICBAXG4gICAgXG4gICAgc2NhbGU6ICh2YWwpIC0+XG4gICAgICAgIEB4ICo9IHZhbFxuICAgICAgICBAeSAqPSB2YWxcbiAgICAgICAgQFxuXG4gICAgbXVsOiAob3RoZXIpIC0+XG4gICAgICAgIEB4ICo9IG90aGVyLnhcbiAgICAgICAgQHkgKj0gb3RoZXIueVxuICAgICAgICBAXG4gICAgICAgIFxuICAgIGRpdjogKG90aGVyKSAtPlxuICAgICAgICBAeCAvPSBvdGhlci54XG4gICAgICAgIEB5IC89IG90aGVyLnlcbiAgICAgICAgQFxuICAgICAgICBcbiAgICBhZGQ6IChvdGhlcikgLT5cbiAgICAgICAgQHggKz0gb3RoZXIueFxuICAgICAgICBAeSArPSBvdGhlci55XG4gICAgICAgIEBcblxuICAgIHN1YjogKG90aGVyKSAtPlxuICAgICAgICBAeCAtPSBvdGhlci54XG4gICAgICAgIEB5IC09IG90aGVyLnlcbiAgICAgICAgQFxuXG4gICAgY2xhbXA6IChsb3dlciwgdXBwZXIpIC0+ICAgICAgICBcbiAgICAgICAgaWYgbG93ZXI/IGFuZCB1cHBlcj8gICAgICAgICAgICBcbiAgICAgICAgICAgIEB4ID0gY2xhbXAobG93ZXIueCwgdXBwZXIueCwgQHgpXG4gICAgICAgICAgICBAeSA9IGNsYW1wKGxvd2VyLnksIHVwcGVyLnksIEB5KVxuICAgICAgICBAXG4gICAgICAgIFxuICAgIG5vcm1hbGl6ZTogLT5cbiAgICAgICAgbCA9IEBsZW5ndGgoKVxuICAgICAgICBpZiBsXG4gICAgICAgICAgICBsID0gMS4wL2xcbiAgICAgICAgICAgIEB4ICo9IGxcbiAgICAgICAgICAgIEB5ICo9IGxcbiAgICAgICAgQCAgICBcblxuICAgIG5lZ2F0ZTogLT5cbiAgICAgICAgQHggKj0gLTFcbiAgICAgICAgQHkgKj0gLTFcbiAgICAgICAgQFxuICAgICAgICBcbiAgICByb3RhdGU6IChhbmdsZSkgLT5cbiAgICAgICAgYW5nbGUgLT0gMzYwIHdoaWxlIGFuZ2xlID4gIDM2MCBcbiAgICAgICAgYW5nbGUgKz0gMzYwIHdoaWxlIGFuZ2xlIDwgLTM2MCBcbiAgICAgICAgcmV0dXJuIEAgaWYgYW5nbGUgPT0gMFxuICAgICAgICByYWQgPSBAZGVnMnJhZCBhbmdsZVxuICAgICAgICBjb3MgPSBNYXRoLmNvcyByYWRcbiAgICAgICAgc2luID0gTWF0aC5zaW4gcmFkXG4gICAgICAgIHggID0gQHhcbiAgICAgICAgQHggPSBjb3MqQHggLSBzaW4qQHlcbiAgICAgICAgQHkgPSBzaW4qIHggKyBjb3MqQHlcbiAgICAgICAgQFxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpIC0+IG5ldyBQb3MgeCx5XG4iXX0=
//# sourceURL=C:/Users/kodi/s/kxk/coffee/pos.coffee