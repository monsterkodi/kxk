// koffee 1.20.0

/*
000   000  000   000  000   000
000  000    000 000   000  000
0000000      00000    0000000
000  000    000 000   000  000
000   000  000   000  000   000
 */
var _, atomic, childp, crypto, empty, fs, i, k, karg, klor, kstr, len, noon, open, os, post, ref, sds, slash, walkdir;

childp = require('child_process');

crypto = require('crypto');

_ = require('lodash');

os = require('os');

noon = require('noon');

sds = require('sds');

fs = require('fs-extra');

open = require('opener');

walkdir = require('walkdir');

atomic = require('write-file-atomic');

post = require('./ppost');

slash = require('kslash');

karg = require('karg');

kstr = require('kstr');

klor = require('klor');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && (a.size == null) && Object.keys(a).length === 0) || a.size === 0;
};

module.exports = {
    _: _,
    os: os,
    fs: fs,
    sds: sds,
    karg: karg,
    kstr: kstr,
    klor: klor,
    kolor: klor.kolor,
    atomic: atomic,
    walkdir: walkdir,
    open: open,
    post: post,
    slash: slash,
    noon: noon,
    childp: childp,
    def: function(c, d) {
        if (c != null) {
            return _.defaults(_.clone(c), d);
        } else if (d != null) {
            return _.clone(d);
        } else {
            return {};
        }
    },
    filter: function(o, f) {
        if (_.isArray(o)) {
            return _.filter(o, f);
        } else if (_.isObject(o)) {
            return _.pickBy(o, f);
        } else {
            return o;
        }
    },
    clamp: function(r1, r2, v) {
        var ref, s1, s2;
        if (!_.isFinite(v)) {
            v = r1;
        }
        ref = [Math.min(r1, r2), Math.max(r1, r2)], s1 = ref[0], s2 = ref[1];
        if (v < s1) {
            v = s1;
        }
        if (v > s2) {
            v = s2;
        }
        if (!_.isFinite(v)) {
            v = r1;
        }
        return v;
    },
    fadeAngles: function(a, b, f) {
        if (a - b > 180) {
            a -= 360;
        } else if (a - b < -180) {
            a += 360;
        }
        return (1 - f) * a + f * b;
    },
    reduce: function(v, d) {
        if (v >= 0) {
            return Math.max(0, v - d);
        } else {
            return Math.min(0, v + d);
        }
    },
    fade: function(s, e, v) {
        return s * (1 - v) + e * v;
    },
    last: function(a) {
        return _.last(a);
    },
    first: function(a) {
        return _.first(a);
    },
    empty: empty,
    valid: function(a) {
        return !empty(a);
    },
    absMax: function(a, b) {
        if (Math.abs(a) >= Math.abs(b)) {
            return a;
        } else {
            return b;
        }
    },
    absMin: function(a, b) {
        if (Math.abs(a) < Math.abs(b)) {
            return a;
        } else {
            return b;
        }
    },
    randInt: function(r) {
        return Math.floor(Math.random() * r);
    },
    randIntRange: function(l, h) {
        return Math.floor(l + Math.random() * (h - l));
    },
    randRange: function(l, h) {
        return l + Math.random() * (h - l);
    },
    shortCount: function(v) {
        v = parseInt(v);
        switch (false) {
            case !(v > 999999):
                return (Math.floor(v / 1000000)) + "M";
            case !(v > 999):
                return (Math.floor(v / 1000)) + "k";
            default:
                return "" + v;
        }
    },
    rad2deg: function(r) {
        return 180 * r / Math.PI;
    },
    deg2rad: function(d) {
        return Math.PI * d / 180;
    },
    reversed: function(a) {
        return _.clone(a).reverse();
    },
    chai: function() {
        var chai;
        chai = require('chai');
        chai.should();
        chai.util.getMessage = function(obj, args) {
            var msg;
            msg = chai.util.flag(obj, 'negate') && args[2] || args[1];
            if (typeof msg === "function") {
                msg = msg();
            }
            if (msg != null) {
                msg;
            } else {
                msg = '';
            }
            return msg.replace(/#\{this\}/g, function() {
                return yellow(bold('\n' + noon.stringify(chai.util.flag(obj, 'object')) + '\n\n'));
            }).replace(/#\{act\}/g, function() {
                return magenta('\n' + noon.stringify(chai.util.getActual(obj, args)) + '\n');
            }).replace(/#\{exp\}/g, function() {
                return green('\n' + noon.stringify(args[3]) + '\n');
            });
        };
        return chai;
    },
    osascript: function(script) {
        var l;
        return ((function() {
            var i, len, ref, results;
            ref = script.split("\n");
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
                l = ref[i];
                results.push("-e \"" + (l.replace(/\"/g, "\\\"")) + "\"");
            }
            return results;
        })()).join(" ");
    }
};

if (!String.prototype.splice) {
    String.prototype.splice = function(start, delCount, newSubStr) {
        if (newSubStr == null) {
            newSubStr = '';
        }
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

if (!String.prototype.strip) {
    String.prototype.strip = String.prototype.trim;
}

if (!String.prototype.hash) {
    String.prototype.hash = function() {
        return crypto.createHash('md5').update(this.valueOf(), 'utf8').digest('hex');
    };
}

if (!Array.prototype.clone) {
    Array.prototype.clone = function() {
        return this.slice(0);
    };
}

if (!Array.prototype.reversed) {
    Array.prototype.reversed = function() {
        return this.slice(0).reverse();
    };
}

module.exports.klog = require('./log');

module.exports.kerror = require('./error');

module.exports.kpos = require('./pos');

module.exports.args = require('./args');

ref = Object.keys(require('./dom'));
for (i = 0, len = ref.length; i < len; i++) {
    k = ref[i];
    module.exports[k] = require('./dom')[k];
}

module.exports.drag = require('./drag');

module.exports.elem = require('./elem');

module.exports.stash = require('./stash');

module.exports.store = require('./store');

module.exports.prefs = require('./prefs');

module.exports.filelist = require('./filelist');

module.exports.keyinfo = require('./keyinfo');

module.exports.gamepad = require('./gamepad');

module.exports.history = require('./history');

module.exports.scheme = require('./scheme');

module.exports.about = require('./about');

module.exports.popup = require('./popup');

module.exports.menu = require('./menu');

module.exports.title = require('./title');

module.exports.matchr = require('./matchr');

module.exports.tooltip = require('./tooltip');

module.exports.srcmap = require('./srcmap');

module.exports.watch = require('./watch');

module.exports.udp = require('./udp');

if (process.type === 'browser') {
    module.exports.app = require('./app');
} else if (process.type === 'renderer') {
    module.exports.win = require('./win');
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3hrLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsia3hrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFBLEdBQVksT0FBQSxDQUFRLGVBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLENBQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLElBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLEdBQUEsR0FBWSxPQUFBLENBQVEsS0FBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLE9BQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixNQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixLQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsTUFBUjs7QUFDWixJQUFBLEdBQVksT0FBQSxDQUFRLE1BQVI7O0FBRVosS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQThCLGdCQUE5QixJQUEwQyxNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEUsQ0FBNUIsSUFBc0csQ0FBQyxDQUFDLElBQUYsS0FBVTtBQUF2SDs7QUFFUixNQUFNLENBQUMsT0FBUCxHQUVJO0lBQUEsQ0FBQSxFQUFFLENBQUY7SUFDQSxFQUFBLEVBQUcsRUFESDtJQUVBLEVB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LEdBQWYsR0FBNkIsT0FBQSxDQUFRLE9BQVI7O0FBRTdCLElBQUcsT0FBTyxDQUFDLElBQVIsS0FBZ0IsU0FBbkI7SUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQWYsR0FBeUIsT0FBQSxDQUFRLE9BQVIsRUFEN0I7Q0FBQSxNQUVLLElBQUcsT0FBTyxDQUFDLElBQVIsS0FBZ0IsVUFBbkI7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQWYsR0FBeUIsT0FBQSxDQUFRLE9BQVIsRUFEeEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgMDAwICAgIDAwMCAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMCAgICAgIDAwMDAwICAgIDAwMDAwMDBcbjAwMCAgMDAwICAgIDAwMCAwMDAgICAwMDAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmNoaWxkcCAgICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5jcnlwdG8gICAgPSByZXF1aXJlICdjcnlwdG8nXG5fICAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5vcyAgICAgICAgPSByZXF1aXJlICdvcydcbm5vb24gICAgICA9IHJlcXVpcmUgJ25vb24nXG5zZHMgICAgICAgPSByZXF1aXJlICdzZHMnXG5mcyAgICAgICAgPSByZXF1aXJlICdmcy1leHRyYSdcbm9wZW4gICAgICA9IHJlcXVpcmUgJ29wZW5lcidcbndhbGtkaXIgICA9IHJlcXVpcmUgJ3dhbGtkaXInXG5hdG9taWMgICAgPSByZXF1aXJlICd3cml0ZS1maWxlLWF0b21pYydcbnBvc3QgICAgICA9IHJlcXVpcmUgJy4vcHBvc3QnXG5zbGFzaCAgICAgPSByZXF1aXJlICdrc2xhc2gnXG5rYXJnICAgICAgPSByZXF1aXJlICdrYXJnJ1xua3N0ciAgICAgID0gcmVxdWlyZSAna3N0cidcbmtsb3IgICAgICA9IHJlcXVpcmUgJ2tsb3InXG5cbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBub3QgYS5zaXplPyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApIG9yIGEuc2l6ZSA9PSAwXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAgIF86X1xuICAgIG9zOm9zXG4gICAgZnM6ZnNcbiAgICBzZHM6c2RzXG4gICAga2FyZzprYXJnXG4gICAga3N0cjprc3RyXG4gICAga2xvcjprbG9yXG4gICAga29sb3I6a2xvci5rb2xvclxuICAgIGF0b21pYzphdG9taWNcbiAgICB3YWxrZGlyOndhbGtkaXJcbiAgICBvcGVuOm9wZW5cbiAgICBwb3N0OnBvc3RcbiAgICBzbGFzaDpzbGFzaFxuICAgIG5vb246bm9vblxuICAgIGNoaWxkcDpjaGlsZHBcblxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBkZWY6IChjLGQpIC0+XG4gICAgICAgIGlmIGM/XG4gICAgICAgICAgICBfLmRlZmF1bHRzIF8uY2xvbmUoYyksIGRcbiAgICAgICAgZWxzZSBpZiBkP1xuICAgICAgICAgICAgXy5jbG9uZSBkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHt9XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBmaWx0ZXI6IChvLCBmKSAtPlxuXG4gICAgICAgIGlmIF8uaXNBcnJheSBvXG4gICAgICAgICAgICBfLmZpbHRlciBvLCBmXG4gICAgICAgIGVsc2UgaWYgXy5pc09iamVjdCBvXG4gICAgICAgICAgICBfLnBpY2tCeSBvLCBmXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9cblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgY2xhbXA6IChyMSwgcjIsIHYpIC0+XG5cbiAgICAgICAgdiA9IHIxIGlmIG5vdCBfLmlzRmluaXRlIHZcbiAgICAgICAgW3MxLCBzMl0gPSBbTWF0aC5taW4ocjEscjIpLCBNYXRoLm1heChyMSxyMildXG4gICAgICAgIHYgPSBzMSBpZiB2IDwgczFcbiAgICAgICAgdiA9IHMyIGlmIHYgPiBzMlxuICAgICAgICB2ID0gcjEgaWYgbm90IF8uaXNGaW5pdGUgdlxuICAgICAgICB2XG5cbiAgICBmYWRlQW5nbGVzOiAoYSwgYiwgZikgLT5cblxuICAgICAgICBpZiAgICAgIGEtYiA+ICAxODAgdGhlbiBhIC09IDM2MFxuICAgICAgICBlbHNlIGlmIGEtYiA8IC0xODAgdGhlbiBhICs9IDM2MFxuICAgICAgICAoMS1mKSAqIGEgKyBmICogYlxuXG4gICAgcmVkdWNlOiAodixkKSAtPiBpZiB2Pj0wIHRoZW4gTWF0aC5tYXgoMCwgdi1kKSBlbHNlIE1hdGgubWluKDAsIHYrZClcblxuICAgIGZhZGU6ICAocyxlLHYpIC0+IHMqKDEtdikrZSoodilcbiAgICBsYXN0OiAgKGEpIC0+IF8ubGFzdCBhXG4gICAgZmlyc3Q6IChhKSAtPiBfLmZpcnN0IGFcbiAgICBlbXB0eTogZW1wdHlcbiAgICB2YWxpZDogKGEpIC0+IG5vdCBlbXB0eSBhXG5cbiAgICBhYnNNYXg6IChhLGIpIC0+IGlmIE1hdGguYWJzKGEpID49IE1hdGguYWJzKGIpIHRoZW4gYSBlbHNlIGJcbiAgICBhYnNNaW46IChhLGIpIC0+IGlmIE1hdGguYWJzKGEpICA8IE1hdGguYWJzKGIpIHRoZW4gYSBlbHNlIGJcblxuICAgIHJhbmRJbnQ6IChyKSAtPiBNYXRoLmZsb29yIE1hdGgucmFuZG9tKCkgKiByXG4gICAgcmFuZEludFJhbmdlOiAobCxoKSAtPiBNYXRoLmZsb29yIGwrTWF0aC5yYW5kb20oKSooaC1sKVxuICAgIHJhbmRSYW5nZTogKGwsaCkgLT4gbCtNYXRoLnJhbmRvbSgpKihoLWwpXG5cbiAgICBzaG9ydENvdW50OiAodikgLT5cbiAgICAgICAgdiA9IHBhcnNlSW50IHZcbiAgICAgICAgc3dpdGNoXG4gICAgICAgICAgICB3aGVuIHYgPiA5OTk5OTkgdGhlbiBcIiN7TWF0aC5mbG9vciB2LzEwMDAwMDB9TVwiXG4gICAgICAgICAgICB3aGVuIHYgPiA5OTkgICAgdGhlbiBcIiN7TWF0aC5mbG9vciB2LzEwMDB9a1wiXG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICBcIiN7dn1cIlxuXG4gICAgcmFkMmRlZzogKHIpIC0+IDE4MCAqIHIgLyBNYXRoLlBJXG4gICAgZGVnMnJhZDogKGQpIC0+IE1hdGguUEkgKiBkIC8gMTgwXG5cbiAgICByZXZlcnNlZDogKGEpIC0+IF8uY2xvbmUoYSkucmV2ZXJzZSgpXG5cbiAgICBjaGFpOiAtPlxuICAgICAgICBjaGFpID0gcmVxdWlyZSAnY2hhaSdcbiAgICAgICAgY2hhaS5zaG91bGQoKVxuICAgICAgICBjaGFpLnV0aWwuZ2V0TWVzc2FnZSA9IChvYmosIGFyZ3MpIC0+XG4gICAgICAgICAgICBtc2cgPSBjaGFpLnV0aWwuZmxhZyhvYmosICduZWdhdGUnKSBhbmQgYXJnc1syXSBvciBhcmdzWzFdXG4gICAgICAgICAgICBpZiB0eXBlb2YgbXNnID09IFwiZnVuY3Rpb25cIiB0aGVuIG1zZyA9IG1zZygpXG4gICAgICAgICAgICBtc2cgPz0gJydcbiAgICAgICAgICAgIG1zZyAucmVwbGFjZSAvI1xce3RoaXNcXH0vZywgLT4geWVsbG93IGJvbGQgICdcXG4nK25vb24uc3RyaW5naWZ5KGNoYWkudXRpbC5mbGFnIG9iaiwgJ29iamVjdCcpKydcXG5cXG4nXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UgLyNcXHthY3RcXH0vZywgIC0+IG1hZ2VudGEgICAgICAnXFxuJytub29uLnN0cmluZ2lmeShjaGFpLnV0aWwuZ2V0QWN0dWFsIG9iaiwgYXJncykrJ1xcbidcbiAgICAgICAgICAgICAgICAucmVwbGFjZSAvI1xce2V4cFxcfS9nLCAgLT4gZ3JlZW4gICAgICAgICdcXG4nK25vb24uc3RyaW5naWZ5KGFyZ3NbM10pKydcXG4nXG4gICAgICAgIGNoYWlcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgICAgIDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAgMDAwXG5cbiAgICBvc2FzY3JpcHQ6IChzY3JpcHQpIC0+ICggXCItZSBcXFwiI3tsLnJlcGxhY2UoL1xcXCIvZywgXCJcXFxcXFxcIlwiKX1cXFwiXCIgZm9yIGwgaW4gc2NyaXB0LnNwbGl0KFwiXFxuXCIpICkuam9pbihcIiBcIilcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG5pZiBub3QgU3RyaW5nLnByb3RvdHlwZS5zcGxpY2VcbiAgICBTdHJpbmcucHJvdG90eXBlLnNwbGljZSA9IChzdGFydCwgZGVsQ291bnQsIG5ld1N1YlN0cj0nJykgLT5cbiAgICAgICAgQHNsaWNlKDAsIHN0YXJ0KSArIG5ld1N1YlN0ciArIEBzbGljZShzdGFydCArIE1hdGguYWJzKGRlbENvdW50KSlcblxuaWYgbm90IFN0cmluZy5wcm90b3R5cGUuc3RyaXBcbiAgICBTdHJpbmcucHJvdG90eXBlLnN0cmlwID0gU3RyaW5nLnByb3RvdHlwZS50cmltXG5cbmlmIG5vdCBTdHJpbmcucHJvdG90eXBlLmhhc2hcbiAgICBTdHJpbmcucHJvdG90eXBlLmhhc2ggPSAtPiBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKEAudmFsdWVPZigpLCAndXRmOCcpLmRpZ2VzdCgnaGV4JylcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5pZiBub3QgQXJyYXkucHJvdG90eXBlLmNsb25lXG4gICAgQXJyYXkucHJvdG90eXBlLmNsb25lID0gLT5cbiAgICAgICAgQC5zbGljZSAwXG5cbmlmIG5vdCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZWRcbiAgICBBcnJheS5wcm90b3R5cGUucmV2ZXJzZWQgPSAtPlxuICAgICAgICBALnNsaWNlKDApLnJldmVyc2UoKVxuXG5tb2R1bGUuZXhwb3J0cy5rbG9nICAgICAgICA9IHJlcXVpcmUgJy4vbG9nJ1xubW9kdWxlLmV4cG9ydHMua2Vycm9yICAgICAgPSByZXF1aXJlICcuL2Vycm9yJ1xubW9kdWxlLmV4cG9ydHMua3BvcyAgICAgICAgPSByZXF1aXJlICcuL3Bvcydcbm1vZHVsZS5leHBvcnRzLmFyZ3MgICAgICAgID0gcmVxdWlyZSAnLi9hcmdzJ1xuXG5tb2R1bGUuZXhwb3J0c1trXSAgICAgICAgICA9IHJlcXVpcmUoJy4vZG9tJylba10gZm9yIGsgaW4gT2JqZWN0LmtleXMgcmVxdWlyZSAnLi9kb20nXG5cbm1vZHVsZS5leHBvcnRzLmRyYWcgICAgICAgID0gcmVxdWlyZSAnLi9kcmFnJ1xubW9kdWxlLmV4cG9ydHMuZWxlbSAgICAgICAgPSByZXF1aXJlICcuL2VsZW0nXG5tb2R1bGUuZXhwb3J0cy5zdGFzaCAgICAgICA9IHJlcXVpcmUgJy4vc3Rhc2gnXG5tb2R1bGUuZXhwb3J0cy5zdG9yZSAgICAgICA9IHJlcXVpcmUgJy4vc3RvcmUnXG5tb2R1bGUuZXhwb3J0cy5wcmVmcyAgICAgICA9IHJlcXVpcmUgJy4vcHJlZnMnXG5tb2R1bGUuZXhwb3J0cy5maWxlbGlzdCAgICA9IHJlcXVpcmUgJy4vZmlsZWxpc3QnXG5tb2R1bGUuZXhwb3J0cy5rZXlpbmZvICAgICA9IHJlcXVpcmUgJy4va2V5aW5mbydcbm1vZHVsZS5leHBvcnRzLmdhbWVwYWQgICAgID0gcmVxdWlyZSAnLi9nYW1lcGFkJ1xubW9kdWxlLmV4cG9ydHMuaGlzdG9yeSAgICAgPSByZXF1aXJlICcuL2hpc3RvcnknXG5tb2R1bGUuZXhwb3J0cy5zY2hlbWUgICAgICA9IHJlcXVpcmUgJy4vc2NoZW1lJ1xubW9kdWxlLmV4cG9ydHMuYWJvdXQgICAgICAgPSByZXF1aXJlICcuL2Fib3V0J1xubW9kdWxlLmV4cG9ydHMucG9wdXAgICAgICAgPSByZXF1aXJlICcuL3BvcHVwJ1xubW9kdWxlLmV4cG9ydHMubWVudSAgICAgICAgPSByZXF1aXJlICcuL21lbnUnXG5tb2R1bGUuZXhwb3J0cy50aXRsZSAgICAgICA9IHJlcXVpcmUgJy4vdGl0bGUnXG5tb2R1bGUuZXhwb3J0cy5tYXRjaHIgICAgICA9IHJlcXVpcmUgJy4vbWF0Y2hyJ1xubW9kdWxlLmV4cG9ydHMudG9vbHRpcCAgICAgPSByZXF1aXJlICcuL3Rvb2x0aXAnXG5tb2R1bGUuZXhwb3J0cy5zcmNtYXAgICAgICA9IHJlcXVpcmUgJy4vc3JjbWFwJ1xubW9kdWxlLmV4cG9ydHMud2F0Y2ggICAgICAgPSByZXF1aXJlICcuL3dhdGNoJ1xubW9kdWxlLmV4cG9ydHMudWRwICAgICAgICAgPSByZXF1aXJlICcuL3VkcCdcblxuaWYgcHJvY2Vzcy50eXBlID09ICdicm93c2VyJ1xuICAgIG1vZHVsZS5leHBvcnRzLmFwcCAgICAgPSByZXF1aXJlICcuL2FwcCdcbmVsc2UgaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcbiAgICBtb2R1bGUuZXhwb3J0cy53aW4gICAgID0gcmVxdWlyZSAnLi93aW4nXG4iXX0=
//# sourceURL=../coffee/kxk.coffee