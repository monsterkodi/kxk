// koffee 0.56.0

/*
000   000  000   000  000   000
000  000    000 000   000  000
0000000      00000    0000000
000  000    000 000   000  000
000   000  000   000  000   000
 */
var _, atomic, childp, colorette, colors, crypto, fs, i, k, karg, klor, len, noon, open, os, post, ref, sds, walkdir;

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

karg = require('karg');

klor = require('klor');

colors = require('colors');

colorette = require('colorette');

module.exports = {
    _: _,
    os: os,
    fs: fs,
    sds: sds,
    karg: karg,
    klor: klor,
    kolor: klor.kolor,
    colors: colors,
    colorette: colorette,
    atomic: atomic,
    walkdir: walkdir,
    open: open,
    post: post,
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

module.exports.kstr = require('./str');

module.exports.klog = require('./log');

module.exports.kerror = require('./error');

module.exports.kpos = require('./pos');

module.exports.slash = require('./slash');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3hrLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFBLEdBQVksT0FBQSxDQUFRLGVBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLENBQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLElBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLEdBQUEsR0FBWSxPQUFBLENBQVEsS0FBUjs7QUFDWixFQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLE9BQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixNQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixJQUFBLEdBQVksT0FBQSxDQUFRLE1BQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7QUFDWixTQUFBLEdBQVksT0FBQSxDQUFRLFdBQVI7O0FBRVosTUFBTSxDQUFDLE9BQVAsR0FFSTtJQUFBLENBQUEsRUFBRSxDQUFGO0lBQ0EsRUFBQSxFQUFHLEVBREg7SUFFQSxFQUFBLEVBQUcsRUFGSDtJQUdBLEdBQUEsRUFBSSxHQUhKO0lBSUEsSUFBQSxFQUFLLElBSkw7SUFLQSxJQUFBLEVBQUssSUFMTDtJQU1BLEtBQUEsRUFBTSxJQUFJLENBQUMsS0FOWDtJQU9BLE1BQUEsRUFBTyxNQVBQO0lBUUEsU0FBQSxFQUFVLFNBUlY7SUFTQSxNQUFBLEVBQU8sTUFUUDtJQVVBLE9BQUEsRUFBUSxPQVZSO0lBV0EsSUFBQSxFQUFLLElBWEw7SUFZQSxJQUFBLEVBQUssSUFaTDtJQWFBLElBQUEsRUFBSyxJQWJMO0lBY0EsTUFBQSxF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T0FBTyxDQUFDLEdBQWYsR0FBNkIsT0FBQSxDQUFRLE9BQVI7O0FBQzdCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBZixHQUE2QixPQUFBLENBQVEsT0FBUjs7QUFDN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFmLEdBQTZCLE9BQUEsQ0FBUSxPQUFSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgIDAwMCAgICAwMDAgMDAwICAgMDAwICAwMDBcbjAwMDAwMDAgICAgICAwMDAwMCAgICAwMDAwMDAwXG4wMDAgIDAwMCAgICAwMDAgMDAwICAgMDAwICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG5jaGlsZHAgICAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuY3J5cHRvICAgID0gcmVxdWlyZSAnY3J5cHRvJ1xuXyAgICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xub3MgICAgICAgID0gcmVxdWlyZSAnb3MnXG5ub29uICAgICAgPSByZXF1aXJlICdub29uJ1xuc2RzICAgICAgID0gcmVxdWlyZSAnc2RzJ1xuZnMgICAgICAgID0gcmVxdWlyZSAnZnMtZXh0cmEnXG5vcGVuICAgICAgPSByZXF1aXJlICdvcGVuZXInXG53YWxrZGlyICAgPSByZXF1aXJlICd3YWxrZGlyJ1xuYXRvbWljICAgID0gcmVxdWlyZSAnd3JpdGUtZmlsZS1hdG9taWMnXG5wb3N0ICAgICAgPSByZXF1aXJlICcuL3Bwb3N0J1xua2FyZyAgICAgID0gcmVxdWlyZSAna2FyZydcbmtsb3IgICAgICA9IHJlcXVpcmUgJ2tsb3InXG5jb2xvcnMgICAgPSByZXF1aXJlICdjb2xvcnMnXG5jb2xvcmV0dGUgPSByZXF1aXJlICdjb2xvcmV0dGUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAgIF86X1xuICAgIG9zOm9zXG4gICAgZnM6ZnNcbiAgICBzZHM6c2RzXG4gICAga2FyZzprYXJnXG4gICAga2xvcjprbG9yXG4gICAga29sb3I6a2xvci5rb2xvclxuICAgIGNvbG9yczpjb2xvcnNcbiAgICBjb2xvcmV0dGU6Y29sb3JldHRlXG4gICAgYXRvbWljOmF0b21pY1xuICAgIHdhbGtkaXI6d2Fsa2RpclxuICAgIG9wZW46b3BlblxuICAgIHBvc3Q6cG9zdFxuICAgIG5vb246bm9vblxuICAgIGNoaWxkcDpjaGlsZHBcblxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBkZWY6IChjLGQpIC0+XG4gICAgICAgIGlmIGM/XG4gICAgICAgICAgICBfLmRlZmF1bHRzIF8uY2xvbmUoYyksIGRcbiAgICAgICAgZWxzZSBpZiBkP1xuICAgICAgICAgICAgXy5jbG9uZSBkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHt9XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBmaWx0ZXI6IChvLCBmKSAtPlxuXG4gICAgICAgIGlmIF8uaXNBcnJheSBvXG4gICAgICAgICAgICBfLmZpbHRlciBvLCBmXG4gICAgICAgIGVsc2UgaWYgXy5pc09iamVjdCBvXG4gICAgICAgICAgICBfLnBpY2tCeSBvLCBmXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9cblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgY2xhbXA6IChyMSwgcjIsIHYpIC0+XG5cbiAgICAgICAgdiA9IHIxIGlmIG5vdCBfLmlzRmluaXRlIHZcbiAgICAgICAgW3MxLCBzMl0gPSBbTWF0aC5taW4ocjEscjIpLCBNYXRoLm1heChyMSxyMildXG4gICAgICAgIHYgPSBzMSBpZiB2IDwgczFcbiAgICAgICAgdiA9IHMyIGlmIHYgPiBzMlxuICAgICAgICB2ID0gcjEgaWYgbm90IF8uaXNGaW5pdGUgdlxuICAgICAgICB2XG5cbiAgICBmYWRlQW5nbGVzOiAoYSwgYiwgZikgLT5cblxuICAgICAgICBpZiAgICAgIGEtYiA+ICAxODAgdGhlbiBhIC09IDM2MFxuICAgICAgICBlbHNlIGlmIGEtYiA8IC0xODAgdGhlbiBhICs9IDM2MFxuICAgICAgICAoMS1mKSAqIGEgKyBmICogYlxuXG4gICAgcmVkdWNlOiAodixkKSAtPiBpZiB2Pj0wIHRoZW4gTWF0aC5tYXgoMCwgdi1kKSBlbHNlIE1hdGgubWluKDAsIHYrZClcblxuICAgIGZhZGU6ICAocyxlLHYpIC0+IHMqKDEtdikrZSoodilcbiAgICBsYXN0OiAgKGEpIC0+IF8ubGFzdCBhXG4gICAgZmlyc3Q6IChhKSAtPiBfLmZpcnN0IGFcbiAgICBlbXB0eTogKGEpIC0+IG5vdCBfLmlzTnVtYmVyKGEpIGFuZCBfLmlzRW1wdHkoYSkgb3IgYSA9PSAnJ1xuICAgIHZhbGlkOiAoYSkgLT4gXy5pc051bWJlcihhKSBvciAoXy5pc1N0cmluZyhhKSBhbmQgYSAhPSAnJykgb3Igbm90IF8uaXNFbXB0eShhKVxuXG4gICAgYWJzTWF4OiAoYSxiKSAtPiBpZiBNYXRoLmFicyhhKSA+PSBNYXRoLmFicyhiKSB0aGVuIGEgZWxzZSBiXG4gICAgYWJzTWluOiAoYSxiKSAtPiBpZiBNYXRoLmFicyhhKSAgPCBNYXRoLmFicyhiKSB0aGVuIGEgZWxzZSBiXG5cbiAgICByYW5kSW50OiAocikgLT4gTWF0aC5mbG9vciBNYXRoLnJhbmRvbSgpICogclxuICAgIHJhbmRJbnRSYW5nZTogKGwsaCkgLT4gTWF0aC5mbG9vciBsK01hdGgucmFuZG9tKCkqKGgtbClcbiAgICByYW5kUmFuZ2U6IChsLGgpIC0+IGwrTWF0aC5yYW5kb20oKSooaC1sKVxuXG4gICAgc2hvcnRDb3VudDogKHYpIC0+XG4gICAgICAgIHYgPSBwYXJzZUludCB2XG4gICAgICAgIHN3aXRjaFxuICAgICAgICAgICAgd2hlbiB2ID4gOTk5OTk5IHRoZW4gXCIje01hdGguZmxvb3Igdi8xMDAwMDAwfU1cIlxuICAgICAgICAgICAgd2hlbiB2ID4gOTk5ICAgIHRoZW4gXCIje01hdGguZmxvb3Igdi8xMDAwfWtcIlxuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgXCIje3Z9XCJcblxuICAgIHJhZDJkZWc6IChyKSAtPiAxODAgKiByIC8gTWF0aC5QSVxuICAgIGRlZzJyYWQ6IChkKSAtPiBNYXRoLlBJICogZCAvIDE4MFxuXG4gICAgcmV2ZXJzZWQ6IChhKSAtPiBfLmNsb25lKGEpLnJldmVyc2UoKVxuXG4gICAgY2hhaTogLT5cbiAgICAgICAgY2hhaSA9IHJlcXVpcmUgJ2NoYWknXG4gICAgICAgIGNoYWkuc2hvdWxkKClcbiAgICAgICAgY2hhaS51dGlsLmdldE1lc3NhZ2UgPSAob2JqLCBhcmdzKSAtPlxuICAgICAgICAgICAgbXNnID0gY2hhaS51dGlsLmZsYWcob2JqLCAnbmVnYXRlJykgYW5kIGFyZ3NbMl0gb3IgYXJnc1sxXVxuICAgICAgICAgICAgaWYgdHlwZW9mIG1zZyA9PSBcImZ1bmN0aW9uXCIgdGhlbiBtc2cgPSBtc2coKVxuICAgICAgICAgICAgbXNnID89ICcnXG4gICAgICAgICAgICBtc2cgLnJlcGxhY2UgLyNcXHt0aGlzXFx9L2csIC0+IHllbGxvd0JyaWdodCAnXFxuJytub29uLnN0cmluZ2lmeShjaGFpLnV0aWwuZmxhZyBvYmosICdvYmplY3QnKSsnXFxuXFxuJ1xuICAgICAgICAgICAgICAgIC5yZXBsYWNlIC8jXFx7YWN0XFx9L2csICAtPiBtYWdlbnRhICAgICAgJ1xcbicrbm9vbi5zdHJpbmdpZnkoY2hhaS51dGlsLmdldEFjdHVhbCBvYmosIGFyZ3MpKydcXG4nXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UgLyNcXHtleHBcXH0vZywgIC0+IGdyZWVuICAgICAgICAnXFxuJytub29uLnN0cmluZ2lmeShhcmdzWzNdKSsnXFxuJ1xuICAgICAgICBjaGFpXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAgICAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgIDAwMFxuXG4gICAgb3Nhc2NyaXB0OiAoc2NyaXB0KSAtPiAoIFwiLWUgXFxcIiN7bC5yZXBsYWNlKC9cXFwiL2csIFwiXFxcXFxcXCJcIil9XFxcIlwiIGZvciBsIGluIHNjcmlwdC5zcGxpdChcIlxcblwiKSApLmpvaW4oXCIgXCIpXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuaWYgbm90IFN0cmluZy5wcm90b3R5cGUuc3BsaWNlXG4gICAgU3RyaW5nLnByb3RvdHlwZS5zcGxpY2UgPSAoc3RhcnQsIGRlbENvdW50LCBuZXdTdWJTdHI9JycpIC0+XG4gICAgICAgIEBzbGljZSgwLCBzdGFydCkgKyBuZXdTdWJTdHIgKyBAc2xpY2Uoc3RhcnQgKyBNYXRoLmFicyhkZWxDb3VudCkpXG5cbmlmIG5vdCBTdHJpbmcucHJvdG90eXBlLnN0cmlwXG4gICAgU3RyaW5nLnByb3RvdHlwZS5zdHJpcCA9IFN0cmluZy5wcm90b3R5cGUudHJpbVxuXG5pZiBub3QgU3RyaW5nLnByb3RvdHlwZS5oYXNoXG4gICAgU3RyaW5nLnByb3RvdHlwZS5oYXNoID0gLT4gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShALnZhbHVlT2YoKSwgJ3V0ZjgnKS5kaWdlc3QoJ2hleCcpXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuaWYgbm90IEFycmF5LnByb3RvdHlwZS5jbG9uZVxuICAgIEFycmF5LnByb3RvdHlwZS5jbG9uZSA9IC0+XG4gICAgICAgIEAuc2xpY2UgMFxuXG5pZiBub3QgQXJyYXkucHJvdG90eXBlLnJldmVyc2VkXG4gICAgQXJyYXkucHJvdG90eXBlLnJldmVyc2VkID0gLT5cbiAgICAgICAgQC5zbGljZSgwKS5yZXZlcnNlKClcblxubW9kdWxlLmV4cG9ydHMua3N0ciAgICAgICAgPSByZXF1aXJlICcuL3N0cidcbm1vZHVsZS5leHBvcnRzLmtsb2cgICAgICAgID0gcmVxdWlyZSAnLi9sb2cnXG5tb2R1bGUuZXhwb3J0cy5rZXJyb3IgICAgICA9IHJlcXVpcmUgJy4vZXJyb3InXG5tb2R1bGUuZXhwb3J0cy5rcG9zICAgICAgICA9IHJlcXVpcmUgJy4vcG9zJ1xubW9kdWxlLmV4cG9ydHMuc2xhc2ggICAgICAgPSByZXF1aXJlICcuL3NsYXNoJ1xuXG5tb2R1bGUuZXhwb3J0c1trXSAgICAgICAgICA9IHJlcXVpcmUoJy4vZG9tJylba10gZm9yIGsgaW4gT2JqZWN0LmtleXMgcmVxdWlyZSAnLi9kb20nXG5cbm1vZHVsZS5leHBvcnRzLmRyYWcgICAgICAgID0gcmVxdWlyZSAnLi9kcmFnJ1xubW9kdWxlLmV4cG9ydHMuZWxlbSAgICAgICAgPSByZXF1aXJlICcuL2VsZW0nXG5tb2R1bGUuZXhwb3J0cy5zdGFzaCAgICAgICA9IHJlcXVpcmUgJy4vc3Rhc2gnXG5tb2R1bGUuZXhwb3J0cy5zdG9yZSAgICAgICA9IHJlcXVpcmUgJy4vc3RvcmUnXG5tb2R1bGUuZXhwb3J0cy5wcmVmcyAgICAgICA9IHJlcXVpcmUgJy4vcHJlZnMnXG5tb2R1bGUuZXhwb3J0cy5maWxlbGlzdCAgICA9IHJlcXVpcmUgJy4vZmlsZWxpc3QnXG5tb2R1bGUuZXhwb3J0cy5rZXlpbmZvICAgICA9IHJlcXVpcmUgJy4va2V5aW5mbydcbm1vZHVsZS5leHBvcnRzLmhpc3RvcnkgICAgID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xubW9kdWxlLmV4cG9ydHMuc2NoZW1lICAgICAgPSByZXF1aXJlICcuL3NjaGVtZSdcbm1vZHVsZS5leHBvcnRzLmFib3V0ICAgICAgID0gcmVxdWlyZSAnLi9hYm91dCdcbm1vZHVsZS5leHBvcnRzLnBvcHVwICAgICAgID0gcmVxdWlyZSAnLi9wb3B1cCdcbm1vZHVsZS5leHBvcnRzLm1lbnUgICAgICAgID0gcmVxdWlyZSAnLi9tZW51J1xubW9kdWxlLmV4cG9ydHMudGl0bGUgICAgICAgPSByZXF1aXJlICcuL3RpdGxlJ1xubW9kdWxlLmV4cG9ydHMubWF0Y2hyICAgICAgPSByZXF1aXJlICcuL21hdGNocidcbm1vZHVsZS5leHBvcnRzLnRvb2x0aXAgICAgID0gcmVxdWlyZSAnLi90b29sdGlwJ1xubW9kdWxlLmV4cG9ydHMuYXJncyAgICAgICAgPSByZXF1aXJlICcuL2FyZ3MnXG5tb2R1bGUuZXhwb3J0cy5zcmNtYXAgICAgICA9IHJlcXVpcmUgJy4vc3JjbWFwJ1xubW9kdWxlLmV4cG9ydHMud2F0Y2ggICAgICAgPSByZXF1aXJlICcuL3dhdGNoJ1xubW9kdWxlLmV4cG9ydHMuYXBwICAgICAgICAgPSByZXF1aXJlICcuL2FwcCdcbm1vZHVsZS5leHBvcnRzLndpbiAgICAgICAgID0gcmVxdWlyZSAnLi93aW4nXG5tb2R1bGUuZXhwb3J0cy51ZHAgICAgICAgICA9IHJlcXVpcmUgJy4vdWRwJ1xuIl19
//# sourceURL=../coffee/kxk.coffee