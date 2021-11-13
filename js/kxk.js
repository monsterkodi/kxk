// koffee 1.19.0

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
    return (a === '' || a === null || a === void 0 || a === []) || (typeof a === 'object' && Object.keys(a).length === 0) || ((a.length != null) && a.length === 0);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3hrLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsia3hrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFBLEdBQVksT0FBQSxDQUFRLGVBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLENBQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLElBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLEdBQUEsR0FBWSxPQUFBLENBQVEsS0FBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLE9BQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixNQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixLQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsTUFBUjs7QUFDWixJQUFBLEdBQVksT0FBQSxDQUFRLE1BQVI7O0FBRVosS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUMsQ0FBQSxLQUFLLEVBQUwsSUFBVyxDQUFBLEtBQUssSUFBaEIsSUFBd0IsQ0FBQSxLQUFLLE1BQTdCLElBQTBDLENBQUEsS0FBSyxFQUFoRCxDQUFBLElBQXVELENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQsQ0FBdkQsSUFBaUgsQ0FBQyxrQkFBQSxJQUFjLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBM0I7QUFBeEg7O0FBRVIsTUFBTSxDQUFDLE9BQVAsR0FFSTtJQUFBLENBQUEsRUFB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QVEsU0FBUjs7QUFDN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFmLEdBQTZCLE9BQUEsQ0FBUSxPQUFSOztBQUU3QixJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFNBQW5CO0lBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFmLEdBQXlCLE9BQUEsQ0FBUSxPQUFSLEVBRDdCO0NBQUEsTUFFSyxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFmLEdBQXlCLE9BQUEsQ0FBUSxPQUFSLEVBRHhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgIDAwMCAgICAwMDAgMDAwICAgMDAwICAwMDBcbjAwMDAwMDAgICAgICAwMDAwMCAgICAwMDAwMDAwXG4wMDAgIDAwMCAgICAwMDAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG5jaGlsZHAgICAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuY3J5cHRvICAgID0gcmVxdWlyZSAnY3J5cHRvJ1xuXyAgICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xub3MgICAgICAgID0gcmVxdWlyZSAnb3MnXG5ub29uICAgICAgPSByZXF1aXJlICdub29uJ1xuc2RzICAgICAgID0gcmVxdWlyZSAnc2RzJ1xuZnMgICAgICAgID0gcmVxdWlyZSAnZnMtZXh0cmEnXG5vcGVuICAgICAgPSByZXF1aXJlICdvcGVuZXInXG53YWxrZGlyICAgPSByZXF1aXJlICd3YWxrZGlyJ1xuYXRvbWljICAgID0gcmVxdWlyZSAnd3JpdGUtZmlsZS1hdG9taWMnXG5wb3N0ICAgICAgPSByZXF1aXJlICcuL3Bwb3N0J1xuc2xhc2ggICAgID0gcmVxdWlyZSAna3NsYXNoJ1xua2FyZyAgICAgID0gcmVxdWlyZSAna2FyZydcbmtzdHIgICAgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgICAgPSByZXF1aXJlICdrbG9yJ1xuXG5lbXB0eSA9IChhKSAtPiAoYSA9PSAnJyBvciBhID09IG51bGwgb3IgYSA9PSB1bmRlZmluZWQgb3IgYSA9PSBbXSkgb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApIG9yIChhLmxlbmd0aD8gYW5kIGEubGVuZ3RoID09IDApXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAgIF86X1xuICAgIG9zOm9zXG4gICAgZnM6ZnNcbiAgICBzZHM6c2RzXG4gICAga2FyZzprYXJnXG4gICAga3N0cjprc3RyXG4gICAga2xvcjprbG9yXG4gICAga29sb3I6a2xvci5rb2xvclxuICAgIGF0b21pYzphdG9taWNcbiAgICB3YWxrZGlyOndhbGtkaXJcbiAgICBvcGVuOm9wZW5cbiAgICBwb3N0OnBvc3RcbiAgICBzbGFzaDpzbGFzaFxuICAgIG5vb246bm9vblxuICAgIGNoaWxkcDpjaGlsZHBcblxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBkZWY6IChjLGQpIC0+XG4gICAgICAgIGlmIGM/XG4gICAgICAgICAgICBfLmRlZmF1bHRzIF8uY2xvbmUoYyksIGRcbiAgICAgICAgZWxzZSBpZiBkP1xuICAgICAgICAgICAgXy5jbG9uZSBkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHt9XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBmaWx0ZXI6IChvLCBmKSAtPlxuXG4gICAgICAgIGlmIF8uaXNBcnJheSBvXG4gICAgICAgICAgICBfLmZpbHRlciBvLCBmXG4gICAgICAgIGVsc2UgaWYgXy5pc09iamVjdCBvXG4gICAgICAgICAgICBfLnBpY2tCeSBvLCBmXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9cblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgY2xhbXA6IChyMSwgcjIsIHYpIC0+XG5cbiAgICAgICAgdiA9IHIxIGlmIG5vdCBfLmlzRmluaXRlIHZcbiAgICAgICAgW3MxLCBzMl0gPSBbTWF0aC5taW4ocjEscjIpLCBNYXRoLm1heChyMSxyMildXG4gICAgICAgIHYgPSBzMSBpZiB2IDwgczFcbiAgICAgICAgdiA9IHMyIGlmIHYgPiBzMlxuICAgICAgICB2ID0gcjEgaWYgbm90IF8uaXNGaW5pdGUgdlxuICAgICAgICB2XG5cbiAgICBmYWRlQW5nbGVzOiAoYSwgYiwgZikgLT5cblxuICAgICAgICBpZiAgICAgIGEtYiA+ICAxODAgdGhlbiBhIC09IDM2MFxuICAgICAgICBlbHNlIGlmIGEtYiA8IC0xODAgdGhlbiBhICs9IDM2MFxuICAgICAgICAoMS1mKSAqIGEgKyBmICogYlxuXG4gICAgcmVkdWNlOiAodixkKSAtPiBpZiB2Pj0wIHRoZW4gTWF0aC5tYXgoMCwgdi1kKSBlbHNlIE1hdGgubWluKDAsIHYrZClcblxuICAgIGZhZGU6ICAocyxlLHYpIC0+IHMqKDEtdikrZSoodilcbiAgICBsYXN0OiAgKGEpIC0+IF8ubGFzdCBhXG4gICAgZmlyc3Q6IChhKSAtPiBfLmZpcnN0IGFcbiAgICBlbXB0eTogZW1wdHlcbiAgICB2YWxpZDogKGEpIC0+IG5vdCBlbXB0eSBhXG5cbiAgICBhYnNNYXg6IChhLGIpIC0+IGlmIE1hdGguYWJzKGEpID49IE1hdGguYWJzKGIpIHRoZW4gYSBlbHNlIGJcbiAgICBhYnNNaW46IChhLGIpIC0+IGlmIE1hdGguYWJzKGEpICA8IE1hdGguYWJzKGIpIHRoZW4gYSBlbHNlIGJcblxuICAgIHJhbmRJbnQ6IChyKSAtPiBNYXRoLmZsb29yIE1hdGgucmFuZG9tKCkgKiByXG4gICAgcmFuZEludFJhbmdlOiAobCxoKSAtPiBNYXRoLmZsb29yIGwrTWF0aC5yYW5kb20oKSooaC1sKVxuICAgIHJhbmRSYW5nZTogKGwsaCkgLT4gbCtNYXRoLnJhbmRvbSgpKihoLWwpXG5cbiAgICBzaG9ydENvdW50OiAodikgLT5cbiAgICAgICAgdiA9IHBhcnNlSW50IHZcbiAgICAgICAgc3dpdGNoXG4gICAgICAgICAgICB3aGVuIHYgPiA5OTk5OTkgdGhlbiBcIiN7TWF0aC5mbG9vciB2LzEwMDAwMDB9TVwiXG4gICAgICAgICAgICB3aGVuIHYgPiA5OTkgICAgdGhlbiBcIiN7TWF0aC5mbG9vciB2LzEwMDB9a1wiXG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICBcIiN7dn1cIlxuXG4gICAgcmFkMmRlZzogKHIpIC0+IDE4MCAqIHIgLyBNYXRoLlBJXG4gICAgZGVnMnJhZDogKGQpIC0+IE1hdGguUEkgKiBkIC8gMTgwXG5cbiAgICByZXZlcnNlZDogKGEpIC0+IF8uY2xvbmUoYSkucmV2ZXJzZSgpXG5cbiAgICBjaGFpOiAtPlxuICAgICAgICBjaGFpID0gcmVxdWlyZSAnY2hhaSdcbiAgICAgICAgY2hhaS5zaG91bGQoKVxuICAgICAgICBjaGFpLnV0aWwuZ2V0TWVzc2FnZSA9IChvYmosIGFyZ3MpIC0+XG4gICAgICAgICAgICBtc2cgPSBjaGFpLnV0aWwuZmxhZyhvYmosICduZWdhdGUnKSBhbmQgYXJnc1syXSBvciBhcmdzWzFdXG4gICAgICAgICAgICBpZiB0eXBlb2YgbXNnID09IFwiZnVuY3Rpb25cIiB0aGVuIG1zZyA9IG1zZygpXG4gICAgICAgICAgICBtc2cgPz0gJydcbiAgICAgICAgICAgIG1zZyAucmVwbGFjZSAvI1xce3RoaXNcXH0vZywgLT4geWVsbG93IGJvbGQgICdcXG4nK25vb24uc3RyaW5naWZ5KGNoYWkudXRpbC5mbGFnIG9iaiwgJ29iamVjdCcpKydcXG5cXG4nXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UgLyNcXHthY3RcXH0vZywgIC0+IG1hZ2VudGEgICAgICAnXFxuJytub29uLnN0cmluZ2lmeShjaGFpLnV0aWwuZ2V0QWN0dWFsIG9iaiwgYXJncykrJ1xcbidcbiAgICAgICAgICAgICAgICAucmVwbGFjZSAvI1xce2V4cFxcfS9nLCAgLT4gZ3JlZW4gICAgICAgICdcXG4nK25vb24uc3RyaW5naWZ5KGFyZ3NbM10pKydcXG4nXG4gICAgICAgIGNoYWlcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgICAgIDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAgMDAwXG5cbiAgICBvc2FzY3JpcHQ6IChzY3JpcHQpIC0+ICggXCItZSBcXFwiI3tsLnJlcGxhY2UoL1xcXCIvZywgXCJcXFxcXFxcIlwiKX1cXFwiXCIgZm9yIGwgaW4gc2NyaXB0LnNwbGl0KFwiXFxuXCIpICkuam9pbihcIiBcIilcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG5pZiBub3QgU3RyaW5nLnByb3RvdHlwZS5zcGxpY2VcbiAgICBTdHJpbmcucHJvdG90eXBlLnNwbGljZSA9IChzdGFydCwgZGVsQ291bnQsIG5ld1N1YlN0cj0nJykgLT5cbiAgICAgICAgQHNsaWNlKDAsIHN0YXJ0KSArIG5ld1N1YlN0ciArIEBzbGljZShzdGFydCArIE1hdGguYWJzKGRlbENvdW50KSlcblxuaWYgbm90IFN0cmluZy5wcm90b3R5cGUuc3RyaXBcbiAgICBTdHJpbmcucHJvdG90eXBlLnN0cmlwID0gU3RyaW5nLnByb3RvdHlwZS50cmltXG5cbmlmIG5vdCBTdHJpbmcucHJvdG90eXBlLmhhc2hcbiAgICBTdHJpbmcucHJvdG90eXBlLmhhc2ggPSAtPiBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKEAudmFsdWVPZigpLCAndXRmOCcpLmRpZ2VzdCgnaGV4JylcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5pZiBub3QgQXJyYXkucHJvdG90eXBlLmNsb25lXG4gICAgQXJyYXkucHJvdG90eXBlLmNsb25lID0gLT5cbiAgICAgICAgQC5zbGljZSAwXG5cbmlmIG5vdCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZWRcbiAgICBBcnJheS5wcm90b3R5cGUucmV2ZXJzZWQgPSAtPlxuICAgICAgICBALnNsaWNlKDApLnJldmVyc2UoKVxuXG5tb2R1bGUuZXhwb3J0cy5rbG9nICAgICAgICA9IHJlcXVpcmUgJy4vbG9nJ1xubW9kdWxlLmV4cG9ydHMua2Vycm9yICAgICAgPSByZXF1aXJlICcuL2Vycm9yJ1xubW9kdWxlLmV4cG9ydHMua3BvcyAgICAgICAgPSByZXF1aXJlICcuL3Bvcydcbm1vZHVsZS5leHBvcnRzLmFyZ3MgICAgICAgID0gcmVxdWlyZSAnLi9hcmdzJ1xuXG5tb2R1bGUuZXhwb3J0c1trXSAgICAgICAgICA9IHJlcXVpcmUoJy4vZG9tJylba10gZm9yIGsgaW4gT2JqZWN0LmtleXMgcmVxdWlyZSAnLi9kb20nXG5cbm1vZHVsZS5leHBvcnRzLmRyYWcgICAgICAgID0gcmVxdWlyZSAnLi9kcmFnJ1xubW9kdWxlLmV4cG9ydHMuZWxlbSAgICAgICAgPSByZXF1aXJlICcuL2VsZW0nXG5tb2R1bGUuZXhwb3J0cy5zdGFzaCAgICAgICA9IHJlcXVpcmUgJy4vc3Rhc2gnXG5tb2R1bGUuZXhwb3J0cy5zdG9yZSAgICAgICA9IHJlcXVpcmUgJy4vc3RvcmUnXG5tb2R1bGUuZXhwb3J0cy5wcmVmcyAgICAgICA9IHJlcXVpcmUgJy4vcHJlZnMnXG5tb2R1bGUuZXhwb3J0cy5maWxlbGlzdCAgICA9IHJlcXVpcmUgJy4vZmlsZWxpc3QnXG5tb2R1bGUuZXhwb3J0cy5rZXlpbmZvICAgICA9IHJlcXVpcmUgJy4va2V5aW5mbydcbm1vZHVsZS5leHBvcnRzLmdhbWVwYWQgICAgID0gcmVxdWlyZSAnLi9nYW1lcGFkJ1xubW9kdWxlLmV4cG9ydHMuaGlzdG9yeSAgICAgPSByZXF1aXJlICcuL2hpc3RvcnknXG5tb2R1bGUuZXhwb3J0cy5zY2hlbWUgICAgICA9IHJlcXVpcmUgJy4vc2NoZW1lJ1xubW9kdWxlLmV4cG9ydHMuYWJvdXQgICAgICAgPSByZXF1aXJlICcuL2Fib3V0J1xubW9kdWxlLmV4cG9ydHMucG9wdXAgICAgICAgPSByZXF1aXJlICcuL3BvcHVwJ1xubW9kdWxlLmV4cG9ydHMubWVudSAgICAgICAgPSByZXF1aXJlICcuL21lbnUnXG5tb2R1bGUuZXhwb3J0cy50aXRsZSAgICAgICA9IHJlcXVpcmUgJy4vdGl0bGUnXG5tb2R1bGUuZXhwb3J0cy5tYXRjaHIgICAgICA9IHJlcXVpcmUgJy4vbWF0Y2hyJ1xubW9kdWxlLmV4cG9ydHMudG9vbHRpcCAgICAgPSByZXF1aXJlICcuL3Rvb2x0aXAnXG5tb2R1bGUuZXhwb3J0cy5zcmNtYXAgICAgICA9IHJlcXVpcmUgJy4vc3JjbWFwJ1xubW9kdWxlLmV4cG9ydHMud2F0Y2ggICAgICAgPSByZXF1aXJlICcuL3dhdGNoJ1xubW9kdWxlLmV4cG9ydHMudWRwICAgICAgICAgPSByZXF1aXJlICcuL3VkcCdcblxuaWYgcHJvY2Vzcy50eXBlID09ICdicm93c2VyJ1xuICAgIG1vZHVsZS5leHBvcnRzLmFwcCAgICAgPSByZXF1aXJlICcuL2FwcCdcbmVsc2UgaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcbiAgICBtb2R1bGUuZXhwb3J0cy53aW4gICAgID0gcmVxdWlyZSAnLi93aW4nXG4iXX0=
//# sourceURL=../coffee/kxk.coffee