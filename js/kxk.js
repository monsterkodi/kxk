// koffee 1.4.0

/*
000   000  000   000  000   000
000  000    000 000   000  000
0000000      00000    0000000
000  000    000 000   000  000
000   000  000   000  000   000
 */
var _, atomic, childp, colorette, colors, crypto, fs, i, k, karg, klor, kstr, len, noon, open, os, post, ref, sds, slash, walkdir;

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

colors = require('colors');

colorette = require('colorette');

module.exports = {
    _: _,
    os: os,
    fs: fs,
    sds: sds,
    karg: karg,
    kstr: kstr,
    klor: klor,
    kolor: klor.kolor,
    colors: colors,
    colorette: colorette,
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
    empty: function(a) {
        return !_.isNumber(a) && _.isEmpty(a) || a === '';
    },
    valid: function(a) {
        return _.isNumber(a) || (_.isString(a) && a !== '') || !_.isEmpty(a);
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
                return yellowBright('\n' + noon.stringify(chai.util.flag(obj, 'object')) + '\n\n');
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

module.exports.args = require('./args');

module.exports.srcmap = require('./srcmap');

module.exports.watch = require('./watch');

module.exports.app = require('./app');

module.exports.win = require('./win');

module.exports.udp = require('./udp');

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3hrLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFBLEdBQVksT0FBQSxDQUFRLGVBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLENBQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLElBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLEdBQUEsR0FBWSxPQUFBLENBQVEsS0FBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLE9BQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixNQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixLQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsTUFBUjs7QUFDWixJQUFBLEdBQVksT0FBQSxDQUFRLE1BQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUjs7QUFFWixNQUFNLENBQUMsT0FBUCxHQUVJO0lBQUEsQ0FBQSxFQUFFLENBQUY7SUFDQSxFQUFBLEVBQUcsRUFESDtJQUVBLEVBQUEsRUFBRyxFQUZIO0lBR0EsR0FBQSxFQUFJLEdBSEo7SUFJQSxJQUFBLEVBQUssSUFKTDtJQUtBLElBQUEsRUFBSyxJQUxMO0lBTUEsSUFBQSxFQUFLLElBTkw7SUFPQSxLQUFBLEVBQU0sSUFBSSxDQUFDLEtBUFg7SUFRQSxNQUFBLEVBQU8sTUFSUDtJQVNBLFNBQUEsRUFBVSxTQVRWO0lBVUEsTUFBQSxFQUFPLE1BVlA7SUFXQSxPQUFB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QU8sQ0FBQyxLQUFmLEdBQTZCLE9BQUEsQ0FBUSxTQUFSOztBQUM3QixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQWYsR0FBNkIsT0FBQSxDQUFRLE9BQVI7O0FBQzdCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBZixHQUE2QixPQUFBLENBQVEsT0FBUjs7QUFDN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFmLEdBQTZCLE9BQUEsQ0FBUSxPQUFSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgIDAwMCAgICAwMDAgMDAwICAgMDAwICAwMDBcbjAwMDAwMDAgICAgICAwMDAwMCAgICAwMDAwMDAwXG4wMDAgIDAwMCAgICAwMDAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG5jaGlsZHAgICAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuY3J5cHRvICAgID0gcmVxdWlyZSAnY3J5cHRvJ1xuXyAgICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xub3MgICAgICAgID0gcmVxdWlyZSAnb3MnXG5ub29uICAgICAgPSByZXF1aXJlICdub29uJ1xuc2RzICAgICAgID0gcmVxdWlyZSAnc2RzJ1xuZnMgICAgICAgID0gcmVxdWlyZSAnZnMtZXh0cmEnXG5vcGVuICAgICAgPSByZXF1aXJlICdvcGVuZXInXG53YWxrZGlyICAgPSByZXF1aXJlICd3YWxrZGlyJ1xuYXRvbWljICAgID0gcmVxdWlyZSAnd3JpdGUtZmlsZS1hdG9taWMnXG5wb3N0ICAgICAgPSByZXF1aXJlICcuL3Bwb3N0J1xuc2xhc2ggICAgID0gcmVxdWlyZSAna3NsYXNoJ1xua2FyZyAgICAgID0gcmVxdWlyZSAna2FyZydcbmtzdHIgICAgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgICAgPSByZXF1aXJlICdrbG9yJ1xuY29sb3JzICAgID0gcmVxdWlyZSAnY29sb3JzJ1xuY29sb3JldHRlID0gcmVxdWlyZSAnY29sb3JldHRlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgICBfOl9cbiAgICBvczpvc1xuICAgIGZzOmZzXG4gICAgc2RzOnNkc1xuICAgIGthcmc6a2FyZ1xuICAgIGtzdHI6a3N0clxuICAgIGtsb3I6a2xvclxuICAgIGtvbG9yOmtsb3Iua29sb3JcbiAgICBjb2xvcnM6Y29sb3JzXG4gICAgY29sb3JldHRlOmNvbG9yZXR0ZVxuICAgIGF0b21pYzphdG9taWNcbiAgICB3YWxrZGlyOndhbGtkaXJcbiAgICBvcGVuOm9wZW5cbiAgICBwb3N0OnBvc3RcbiAgICBzbGFzaDpzbGFzaFxuICAgIG5vb246bm9vblxuICAgIGNoaWxkcDpjaGlsZHBcblxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBkZWY6IChjLGQpIC0+XG4gICAgICAgIGlmIGM/XG4gICAgICAgICAgICBfLmRlZmF1bHRzIF8uY2xvbmUoYyksIGRcbiAgICAgICAgZWxzZSBpZiBkP1xuICAgICAgICAgICAgXy5jbG9uZSBkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHt9XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBmaWx0ZXI6IChvLCBmKSAtPlxuXG4gICAgICAgIGlmIF8uaXNBcnJheSBvXG4gICAgICAgICAgICBfLmZpbHRlciBvLCBmXG4gICAgICAgIGVsc2UgaWYgXy5pc09iamVjdCBvXG4gICAgICAgICAgICBfLnBpY2tCeSBvLCBmXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9cblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgY2xhbXA6IChyMSwgcjIsIHYpIC0+XG5cbiAgICAgICAgdiA9IHIxIGlmIG5vdCBfLmlzRmluaXRlIHZcbiAgICAgICAgW3MxLCBzMl0gPSBbTWF0aC5taW4ocjEscjIpLCBNYXRoLm1heChyMSxyMildXG4gICAgICAgIHYgPSBzMSBpZiB2IDwgczFcbiAgICAgICAgdiA9IHMyIGlmIHYgPiBzMlxuICAgICAgICB2ID0gcjEgaWYgbm90IF8uaXNGaW5pdGUgdlxuICAgICAgICB2XG5cbiAgICBmYWRlQW5nbGVzOiAoYSwgYiwgZikgLT5cblxuICAgICAgICBpZiAgICAgIGEtYiA+ICAxODAgdGhlbiBhIC09IDM2MFxuICAgICAgICBlbHNlIGlmIGEtYiA8IC0xODAgdGhlbiBhICs9IDM2MFxuICAgICAgICAoMS1mKSAqIGEgKyBmICogYlxuXG4gICAgcmVkdWNlOiAodixkKSAtPiBpZiB2Pj0wIHRoZW4gTWF0aC5tYXgoMCwgdi1kKSBlbHNlIE1hdGgubWluKDAsIHYrZClcblxuICAgIGZhZGU6ICAocyxlLHYpIC0+IHMqKDEtdikrZSoodilcbiAgICBsYXN0OiAgKGEpIC0+IF8ubGFzdCBhXG4gICAgZmlyc3Q6IChhKSAtPiBfLmZpcnN0IGFcbiAgICBlbXB0eTogKGEpIC0+IG5vdCBfLmlzTnVtYmVyKGEpIGFuZCBfLmlzRW1wdHkoYSkgb3IgYSA9PSAnJ1xuICAgIHZhbGlkOiAoYSkgLT4gXy5pc051bWJlcihhKSBvciAoXy5pc1N0cmluZyhhKSBhbmQgYSAhPSAnJykgb3Igbm90IF8uaXNFbXB0eShhKVxuXG4gICAgYWJzTWF4OiAoYSxiKSAtPiBpZiBNYXRoLmFicyhhKSA+PSBNYXRoLmFicyhiKSB0aGVuIGEgZWxzZSBiXG4gICAgYWJzTWluOiAoYSxiKSAtPiBpZiBNYXRoLmFicyhhKSAgPCBNYXRoLmFicyhiKSB0aGVuIGEgZWxzZSBiXG5cbiAgICByYW5kSW50OiAocikgLT4gTWF0aC5mbG9vciBNYXRoLnJhbmRvbSgpICogclxuICAgIHJhbmRJbnRSYW5nZTogKGwsaCkgLT4gTWF0aC5mbG9vciBsK01hdGgucmFuZG9tKCkqKGgtbClcbiAgICByYW5kUmFuZ2U6IChsLGgpIC0+IGwrTWF0aC5yYW5kb20oKSooaC1sKVxuXG4gICAgc2hvcnRDb3VudDogKHYpIC0+XG4gICAgICAgIHYgPSBwYXJzZUludCB2XG4gICAgICAgIHN3aXRjaFxuICAgICAgICAgICAgd2hlbiB2ID4gOTk5OTk5IHRoZW4gXCIje01hdGguZmxvb3Igdi8xMDAwMDAwfU1cIlxuICAgICAgICAgICAgd2hlbiB2ID4gOTk5ICAgIHRoZW4gXCIje01hdGguZmxvb3Igdi8xMDAwfWtcIlxuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgXCIje3Z9XCJcblxuICAgIHJhZDJkZWc6IChyKSAtPiAxODAgKiByIC8gTWF0aC5QSVxuICAgIGRlZzJyYWQ6IChkKSAtPiBNYXRoLlBJICogZCAvIDE4MFxuXG4gICAgcmV2ZXJzZWQ6IChhKSAtPiBfLmNsb25lKGEpLnJldmVyc2UoKVxuXG4gICAgY2hhaTogLT5cbiAgICAgICAgY2hhaSA9IHJlcXVpcmUgJ2NoYWknXG4gICAgICAgIGNoYWkuc2hvdWxkKClcbiAgICAgICAgY2hhaS51dGlsLmdldE1lc3NhZ2UgPSAob2JqLCBhcmdzKSAtPlxuICAgICAgICAgICAgbXNnID0gY2hhaS51dGlsLmZsYWcob2JqLCAnbmVnYXRlJykgYW5kIGFyZ3NbMl0gb3IgYXJnc1sxXVxuICAgICAgICAgICAgaWYgdHlwZW9mIG1zZyA9PSBcImZ1bmN0aW9uXCIgdGhlbiBtc2cgPSBtc2coKVxuICAgICAgICAgICAgbXNnID89ICcnXG4gICAgICAgICAgICBtc2cgLnJlcGxhY2UgLyNcXHt0aGlzXFx9L2csIC0+IHllbGxvd0JyaWdodCAnXFxuJytub29uLnN0cmluZ2lmeShjaGFpLnV0aWwuZmxhZyBvYmosICdvYmplY3QnKSsnXFxuXFxuJ1xuICAgICAgICAgICAgICAgIC5yZXBsYWNlIC8jXFx7YWN0XFx9L2csICAtPiBtYWdlbnRhICAgICAgJ1xcbicrbm9vbi5zdHJpbmdpZnkoY2hhaS51dGlsLmdldEFjdHVhbCBvYmosIGFyZ3MpKydcXG4nXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UgLyNcXHtleHBcXH0vZywgIC0+IGdyZWVuICAgICAgICAnXFxuJytub29uLnN0cmluZ2lmeShhcmdzWzNdKSsnXFxuJ1xuICAgICAgICBjaGFpXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAgICAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgIDAwMFxuXG4gICAgb3Nhc2NyaXB0OiAoc2NyaXB0KSAtPiAoIFwiLWUgXFxcIiN7bC5yZXBsYWNlKC9cXFwiL2csIFwiXFxcXFxcXCJcIil9XFxcIlwiIGZvciBsIGluIHNjcmlwdC5zcGxpdChcIlxcblwiKSApLmpvaW4oXCIgXCIpXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuaWYgbm90IFN0cmluZy5wcm90b3R5cGUuc3BsaWNlXG4gICAgU3RyaW5nLnByb3RvdHlwZS5zcGxpY2UgPSAoc3RhcnQsIGRlbENvdW50LCBuZXdTdWJTdHI9JycpIC0+XG4gICAgICAgIEBzbGljZSgwLCBzdGFydCkgKyBuZXdTdWJTdHIgKyBAc2xpY2Uoc3RhcnQgKyBNYXRoLmFicyhkZWxDb3VudCkpXG5cbmlmIG5vdCBTdHJpbmcucHJvdG90eXBlLnN0cmlwXG4gICAgU3RyaW5nLnByb3RvdHlwZS5zdHJpcCA9IFN0cmluZy5wcm90b3R5cGUudHJpbVxuXG5pZiBub3QgU3RyaW5nLnByb3RvdHlwZS5oYXNoXG4gICAgU3RyaW5nLnByb3RvdHlwZS5oYXNoID0gLT4gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShALnZhbHVlT2YoKSwgJ3V0ZjgnKS5kaWdlc3QoJ2hleCcpXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuaWYgbm90IEFycmF5LnByb3RvdHlwZS5jbG9uZVxuICAgIEFycmF5LnByb3RvdHlwZS5jbG9uZSA9IC0+XG4gICAgICAgIEAuc2xpY2UgMFxuXG5pZiBub3QgQXJyYXkucHJvdG90eXBlLnJldmVyc2VkXG4gICAgQXJyYXkucHJvdG90eXBlLnJldmVyc2VkID0gLT5cbiAgICAgICAgQC5zbGljZSgwKS5yZXZlcnNlKClcblxubW9kdWxlLmV4cG9ydHMua2xvZyAgICAgICAgPSByZXF1aXJlICcuL2xvZydcbm1vZHVsZS5leHBvcnRzLmtlcnJvciAgICAgID0gcmVxdWlyZSAnLi9lcnJvcidcbm1vZHVsZS5leHBvcnRzLmtwb3MgICAgICAgID0gcmVxdWlyZSAnLi9wb3MnXG5cbm1vZHVsZS5leHBvcnRzW2tdICAgICAgICAgID0gcmVxdWlyZSgnLi9kb20nKVtrXSBmb3IgayBpbiBPYmplY3Qua2V5cyByZXF1aXJlICcuL2RvbSdcblxubW9kdWxlLmV4cG9ydHMuZHJhZyAgICAgICAgPSByZXF1aXJlICcuL2RyYWcnXG5tb2R1bGUuZXhwb3J0cy5lbGVtICAgICAgICA9IHJlcXVpcmUgJy4vZWxlbSdcbm1vZHVsZS5leHBvcnRzLnN0YXNoICAgICAgID0gcmVxdWlyZSAnLi9zdGFzaCdcbm1vZHVsZS5leHBvcnRzLnN0b3JlICAgICAgID0gcmVxdWlyZSAnLi9zdG9yZSdcbm1vZHVsZS5leHBvcnRzLnByZWZzICAgICAgID0gcmVxdWlyZSAnLi9wcmVmcydcbm1vZHVsZS5leHBvcnRzLmZpbGVsaXN0ICAgID0gcmVxdWlyZSAnLi9maWxlbGlzdCdcbm1vZHVsZS5leHBvcnRzLmtleWluZm8gICAgID0gcmVxdWlyZSAnLi9rZXlpbmZvJ1xubW9kdWxlLmV4cG9ydHMuZ2FtZXBhZCAgICAgPSByZXF1aXJlICcuL2dhbWVwYWQnXG5tb2R1bGUuZXhwb3J0cy5oaXN0b3J5ICAgICA9IHJlcXVpcmUgJy4vaGlzdG9yeSdcbm1vZHVsZS5leHBvcnRzLnNjaGVtZSAgICAgID0gcmVxdWlyZSAnLi9zY2hlbWUnXG5tb2R1bGUuZXhwb3J0cy5hYm91dCAgICAgICA9IHJlcXVpcmUgJy4vYWJvdXQnXG5tb2R1bGUuZXhwb3J0cy5wb3B1cCAgICAgICA9IHJlcXVpcmUgJy4vcG9wdXAnXG5tb2R1bGUuZXhwb3J0cy5tZW51ICAgICAgICA9IHJlcXVpcmUgJy4vbWVudSdcbm1vZHVsZS5leHBvcnRzLnRpdGxlICAgICAgID0gcmVxdWlyZSAnLi90aXRsZSdcbm1vZHVsZS5leHBvcnRzLm1hdGNociAgICAgID0gcmVxdWlyZSAnLi9tYXRjaHInXG5tb2R1bGUuZXhwb3J0cy50b29sdGlwICAgICA9IHJlcXVpcmUgJy4vdG9vbHRpcCdcbm1vZHVsZS5leHBvcnRzLmFyZ3MgICAgICAgID0gcmVxdWlyZSAnLi9hcmdzJ1xubW9kdWxlLmV4cG9ydHMuc3JjbWFwICAgICAgPSByZXF1aXJlICcuL3NyY21hcCdcbm1vZHVsZS5leHBvcnRzLndhdGNoICAgICAgID0gcmVxdWlyZSAnLi93YXRjaCdcbm1vZHVsZS5leHBvcnRzLmFwcCAgICAgICAgID0gcmVxdWlyZSAnLi9hcHAnXG5tb2R1bGUuZXhwb3J0cy53aW4gICAgICAgICA9IHJlcXVpcmUgJy4vd2luJ1xubW9kdWxlLmV4cG9ydHMudWRwICAgICAgICAgPSByZXF1aXJlICcuL3VkcCdcbiJdfQ==
//# sourceURL=../coffee/kxk.coffee