// koffee 1.4.0

/*
00     00   0000000   000000000   0000000  000   000  00000000 
000   000  000   000     000     000       000   000  000   000
000000000  000000000     000     000       000000000  0000000  
000 0 000  000   000     000     000       000   000  000   000
000   000  000   000     000      0000000  000   000  000   000
 */
var _, config, dissect, empty, last, merge, ranges, ref, sortRanges, valid;

ref = require('./kxk'), empty = ref.empty, valid = ref.valid, last = ref.last, _ = ref._;

config = function(patterns, flags) {
    var a, p, results;
    results = [];
    for (p in patterns) {
        a = patterns[p];
        results.push([new RegExp(p, flags), a]);
    }
    return results;
};

sortRanges = function(rgs) {
    return rgs.sort(function(a, b) {
        if (a.start === b.start) {
            return a.index - b.index;
        } else {
            return a.start - b.start;
        }
    });
};

ranges = function(regexes, text, flags) {
    var arg, gi, gs, i, j, k, l, match, r, ref1, ref2, reg, rgs, s, value;
    if (!_.isArray(regexes)) {
        if (_.isString(regexes)) {
            regexes = [[new RegExp(regexes, flags), 'found']];
        } else {
            regexes = [[regexes, 'found']];
        }
    } else if (valid(regexes) && !_.isArray(regexes[0])) {
        regexes = [regexes];
    }
    rgs = [];
    if ((text == null) || empty(regexes)) {
        return rgs;
    }
    for (r = k = 0, ref1 = regexes.length; 0 <= ref1 ? k < ref1 : k > ref1; r = 0 <= ref1 ? ++k : --k) {
        reg = regexes[r][0];
        if ((reg == null) || (reg.exec == null)) {
            console.error('no reg?', regexes, text, flags);
            return rgs;
        }
        arg = regexes[r][1];
        i = 0;
        s = text;
        while (s.length) {
            match = reg.exec(s);
            if (match == null) {
                break;
            }
            if (match.length === 1) {
                if (match[0].length > 0) {
                    rgs.push({
                        start: match.index + i,
                        match: match[0],
                        clss: arg,
                        index: r
                    });
                }
                i += match.index + Math.max(1, match[0].length);
                s = text.slice(i);
            } else {
                gs = 0;
                for (j = l = 0, ref2 = match.length - 2; 0 <= ref2 ? l <= ref2 : l >= ref2; j = 0 <= ref2 ? ++l : --l) {
                    value = arg;
                    if (_.isArray(value) && j < value.length) {
                        value = value[j];
                    } else if (_.isObject(value) && j < _.size(value)) {
                        value = [_.keys(value)[j], value[_.keys(value)[j]]];
                    }
                    if (match[j + 1] == null) {
                        break;
                    }
                    gi = match[0].slice(gs).indexOf(match[j + 1]);
                    rgs.push({
                        start: match.index + i + gs + gi,
                        match: match[j + 1],
                        clss: value,
                        index: r
                    });
                    gs += match[j + 1].length;
                }
                i += match.index + match[0].length;
                s = text.slice(i);
            }
        }
    }
    return sortRanges(rgs);
};

dissect = function(ranges, opt) {
    var c, d, di, dps, i, k, l, len, len1, len2, len3, len4, len5, m, n, o, p, pn, q, r, ref1, ref2, ref3, ref4, ref5, rg, ri, si, t, u;
    if (opt == null) {
        opt = {
            join: false
        };
    }
    if (!ranges.length) {
        return [];
    }
    di = [];
    for (k = 0, len = ranges.length; k < len; k++) {
        rg = ranges[k];
        di.push([rg.start, rg.index]);
        di.push([rg.start + rg.match.length, rg.index]);
    }
    di.sort(function(a, b) {
        if (a[0] === b[0]) {
            return a[1] - b[1];
        } else {
            return a[0] - b[0];
        }
    });
    d = [];
    si = -1;
    for (l = 0, len1 = di.length; l < len1; l++) {
        dps = di[l];
        if (dps[0] > si) {
            si = dps[0];
            d.push({
                start: si,
                cls: []
            });
        }
    }
    p = 0;
    for (ri = m = 0, ref1 = ranges.length; 0 <= ref1 ? m < ref1 : m > ref1; ri = 0 <= ref1 ? ++m : --m) {
        rg = ranges[ri];
        while (d[p].start < rg.start) {
            p += 1;
        }
        pn = p;
        while (d[pn].start < rg.start + rg.match.length) {
            if (rg.clss != null) {
                if (rg.clss.split == null) {
                    ref2 = rg.clss;
                    for (n = 0, len2 = ref2.length; n < len2; n++) {
                        r = ref2[n];
                        if ((r != null ? r.split : void 0) == null) {
                            continue;
                        }
                        ref3 = r.split('.');
                        for (o = 0, len3 = ref3.length; o < len3; o++) {
                            c = ref3[o];
                            if (d[pn].cls.indexOf(c) < 0) {
                                d[pn].cls.push(c);
                            }
                        }
                    }
                } else {
                    ref4 = rg.clss.split('.');
                    for (q = 0, len4 = ref4.length; q < len4; q++) {
                        c = ref4[q];
                        if (d[pn].cls.indexOf(c) < 0) {
                            d[pn].cls.push(c);
                        }
                    }
                }
            }
            if (pn + 1 < d.length) {
                if (!d[pn].match) {
                    d[pn].match = rg.match.substr(d[pn].start - rg.start, d[pn + 1].start - d[pn].start);
                }
                pn += 1;
            } else {
                if (!d[pn].match) {
                    d[pn].match = rg.match.substr(d[pn].start - rg.start);
                }
                break;
            }
        }
    }
    d = d.filter(function(i) {
        var ref5;
        return (ref5 = i.match) != null ? ref5.trim().length : void 0;
    });
    for (t = 0, len5 = d.length; t < len5; t++) {
        i = d[t];
        i.clss = i.cls.join(' ');
        delete i.cls;
    }
    if (d.length > 1) {
        for (i = u = ref5 = d.length - 2; ref5 <= 0 ? u <= 0 : u >= 0; i = ref5 <= 0 ? ++u : --u) {
            if (d[i].start + d[i].match.length === d[i + 1].start) {
                if (d[i].clss === d[i + 1].clss) {
                    d[i].match += d[i + 1].match;
                    d.splice(i + 1, 1);
                }
            }
        }
    }
    return d;
};

merge = function(dssA, dssB) {
    var A, B, d, result;
    result = [];
    A = dssA.shift();
    B = dssB.shift();
    while (A && B) {
        if (A.start + A.match.length < B.start) {
            result.push(A);
            A = dssA.shift();
            continue;
        }
        if (B.start + B.match.length < A.start) {
            result.push(B);
            B = dssB.shift();
            continue;
        }
        if (A.start < B.start) {
            d = B.start - A.start;
            result.push({
                start: A.start,
                clss: A.clss,
                match: A.match.slice(0, d)
            });
            A.start += d;
            A.match = A.match.slice(d);
            continue;
        }
        if (B.start < A.start) {
            d = A.start - B.start;
            result.push({
                start: B.start,
                clss: B.clss,
                match: B.match.slice(0, d)
            });
            B.start += d;
            B.match = B.match.slice(d);
            continue;
        }
        if (A.start === B.start) {
            d = A.match.length - B.match.length;
            result.push({
                start: A.start,
                clss: A.clss + " " + B.clss,
                match: d >= 0 && B.match || A.match
            });
            if (d > 0) {
                A.match = A.match.slice(B.match.length);
                A.start += B.match.length;
                B = dssB.shift();
            } else if (d < 0) {
                B.match = B.match.slice(A.match.length);
                B.start += A.match.length;
                A = dssA.shift();
            } else {
                A = dssA.shift();
                B = dssB.shift();
            }
        }
    }
    if (B && !A) {
        result = result.concat([B], dssB);
    }
    if (A && !B) {
        result = result.concat([A], dssA);
    }
    return result;
};

module.exports = {
    config: config,
    ranges: ranges,
    dissect: dissect,
    sortRanges: sortRanges,
    merge: merge
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2hyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUE0QixPQUFBLENBQVEsT0FBUixDQUE1QixFQUFFLGlCQUFGLEVBQVMsaUJBQVQsRUFBZ0IsZUFBaEIsRUFBc0I7O0FBVXRCLE1BQUEsR0FBUyxTQUFDLFFBQUQsRUFBVyxLQUFYO0FBQXFCLFFBQUE7QUFBRTtTQUFBLGFBQUE7O3FCQUFBLENBQUMsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFjLEtBQWQsQ0FBRCxFQUF1QixDQUF2QjtBQUFBOztBQUF2Qjs7QUFFVCxVQUFBLEdBQWEsU0FBQyxHQUFEO1dBRVQsR0FBRyxDQUFDLElBQUosQ0FBUyxTQUFDLENBQUQsRUFBRyxDQUFIO1FBQ0wsSUFBRyxDQUFDLENBQUMsS0FBRixLQUFXLENBQUMsQ0FBQyxLQUFoQjttQkFDSSxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxNQURoQjtTQUFBLE1BQUE7bUJBR0ksQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFDLENBQUMsTUFIaEI7O0lBREssQ0FBVDtBQUZTOztBQTZCYixNQUFBLEdBQVMsU0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixLQUFoQjtBQUVMLFFBQUE7SUFBQSxJQUFHLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxPQUFWLENBQVA7UUFDSSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxDQUFIO1lBQ0ksT0FBQSxHQUFVLENBQUMsQ0FBQyxJQUFJLE1BQUosQ0FBVyxPQUFYLEVBQW9CLEtBQXBCLENBQUQsRUFBNkIsT0FBN0IsQ0FBRCxFQURkO1NBQUEsTUFBQTtZQUdJLE9BQUEsR0FBVSxDQUFDLENBQUMsT0FBRCxFQUFVLE9BQVYsQ0FBRCxFQUhkO1NBREo7S0FBQSxNQUtLLElBQUcsS0FBQSxDQUFNLE9BQU4sQ0FBQSxJQUFtQixDQUFJLENBQUMsQ0FBQyxPQUFGLENB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QUhIO2FBQUEsTUFBQTtnQkFLRCxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBQTtnQkFDSixDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBQSxFQU5IO2FBVlQ7O0lBaENKO0lBa0RBLElBQUcsQ0FBQSxJQUFNLENBQUksQ0FBYjtRQUNJLE1BQUEsR0FBUyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxDQUFkLEVBQW1CLElBQW5CLEVBRGI7O0lBRUEsSUFBRyxDQUFBLElBQU0sQ0FBSSxDQUFiO1FBQ0ksTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELENBQWQsRUFBbUIsSUFBbkIsRUFEYjs7V0FFQTtBQTVESTs7QUE4RFIsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFBWSxNQUFaO0lBQ0EsTUFBQSxFQUFZLE1BRFo7SUFFQSxPQUFBLEVBQVksT0FGWjtJQUdBLFVBQUEsRUFBWSxVQUhaO0lBSUEsS0FBQSxFQUFZLEtBSloiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBlbXB0eSwgdmFsaWQsIGxhc3QsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMDAwMDAgXG5cbiMgY29udmVydCB0aGUgcGF0dGVybnMgb2JqZWN0IHRvIGEgbGlzdCBvZiBbUmVnRXhwKGtleSksIHZhbHVlXSBwYWlyc1xuXG5jb25maWcgPSAocGF0dGVybnMsIGZsYWdzKSAtPiAoIFtuZXcgUmVnRXhwKHAsIGZsYWdzKSwgYV0gZm9yIHAsYSBvZiBwYXR0ZXJucyApXG5cbnNvcnRSYW5nZXMgPSAocmdzKSAtPlxuICAgIFxuICAgIHJncy5zb3J0IChhLGIpIC0+XG4gICAgICAgIGlmIGEuc3RhcnQgPT0gYi5zdGFydFxuICAgICAgICAgICAgYS5pbmRleCAtIGIuaW5kZXhcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYS5zdGFydCAtIGIuc3RhcnRcblxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwIFxuXG4jIGFjY2VwdHMgYSBsaXN0IG9mIFtyZWdleHAsIHZhbHVlKHMpXSBwYWlycyBhbmQgYSBzdHJpbmdcbiMgcmV0dXJucyBhIGxpc3Qgb2Ygb2JqZWN0cyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBtYXRjaGVzOlxuICBcbiMgICAgIG1hdGNoOiB0aGUgbWF0Y2hlZCBzdWJzdHJpbmdcbiMgICAgIHN0YXJ0OiBwb3NpdGlvbiBvZiBtYXRjaCBpbiBzdHJcbiMgICAgIGNsc3M6ICB0aGUgdmFsdWUgZm9yIHRoZSBtYXRjaFxuIyAgICAgaW5kZXg6IGluZGV4IG9mIHRoZSByZWdleHBcbiAgICBcbiMgICAgIHRoZSBvYmplY3RzIGFyZSBzb3J0ZWQgYnkgc3RhcnQgYW5kIGluZGV4XG4gICAgICBcbiMgICAgIGlmIHRoZSByZWdleHAgaGFzIGNhcHR1cmUgZ3JvdXBzIHRoZW4gXG4jICAgICAgICAgdGhlIHZhbHVlIGZvciB0aGUgbWF0Y2ggb2YgdGhlIG50aCBncm91cCBpc1xuIyAgICAgICAgICAgICB0aGUgbnRoIGl0ZW0gb2YgdmFsdWVzKHMpIGlmIHZhbHVlKHMpIGlzIGFuIGFycmF5XG4jICAgICAgICAgICAgIHRoZSBudGggW2tleSwgdmFsdWVdIHBhaXIgaWYgdmFsdWUocykgaXMgYW4gb2JqZWN0XG5cbnJhbmdlcyA9IChyZWdleGVzLCB0ZXh0LCBmbGFncykgLT5cbiAgICBcbiAgICBpZiBub3QgXy5pc0FycmF5IHJlZ2V4ZXNcbiAgICAgICAgaWYgXy5pc1N0cmluZyByZWdleGVzXG4gICAgICAgICAgICByZWdleGVzID0gW1tuZXcgUmVnRXhwKHJlZ2V4ZXMsIGZsYWdzKSwgJ2ZvdW5kJ11dXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlZ2V4ZXMgPSBbW3JlZ2V4ZXMsICdmb3VuZCddXVxuICAgIGVsc2UgaWYgdmFsaWQocmVnZXhlcykgYW5kIG5vdCBfLmlzQXJyYXkgcmVnZXhlc1swXVxuICAgICAgICByZWdleGVzID0gW3JlZ2V4ZXNdXG5cbiAgICByZ3MgPSBbXVxuICAgIHJldHVybiByZ3MgaWYgbm90IHRleHQ/IG9yIGVtcHR5IHJlZ2V4ZXNcbiAgICBcbiAgICBmb3IgciBpbiBbMC4uLnJlZ2V4ZXMubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgcmVnID0gcmVnZXhlc1tyXVswXVxuICAgICAgICBcbiAgICAgICAgaWYgbm90IHJlZz8gb3Igbm90IHJlZy5leGVjP1xuICAgICAgICAgICAgZXJyb3IgJ25vIHJlZz8nLCByZWdleGVzLCB0ZXh0LCBmbGFnc1xuICAgICAgICAgICAgcmV0dXJuIHJnc1xuICAgICAgICBcbiAgICAgICAgYXJnID0gcmVnZXhlc1tyXVsxXVxuICAgICAgICBpID0gMFxuICAgICAgICBzID0gdGV4dFxuXG4gICAgICAgIHdoaWxlIHMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG1hdGNoID0gcmVnLmV4ZWMgc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBicmVhayBpZiBub3QgbWF0Y2g/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG1hdGNoLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbWF0Y2hbMF0ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICByZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG1hdGNoLmluZGV4ICsgaVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG1hdGNoWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNzOiAgYXJnXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpICs9IG1hdGNoLmluZGV4ICsgTWF0aC5tYXggMSwgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgcyA9IHRleHQuc2xpY2UgaVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdzID0gMFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBqIGluIFswLi5tYXRjaC5sZW5ndGgtMl1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBhcmdcbiAgICAgICAgICAgICAgICAgICAgaWYgXy5pc0FycmF5KHZhbHVlKSBhbmQgaiA8IHZhbHVlLmxlbmd0aCB0aGVuIHZhbHVlID0gdmFsdWVbal1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBfLmlzT2JqZWN0KHZhbHVlKSBhbmQgaiA8IF8uc2l6ZSh2YWx1ZSkgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFtfLmtleXModmFsdWUpW2pdLCB2YWx1ZVtfLmtleXModmFsdWUpW2pdXV1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgaWYgbm90IG1hdGNoW2orMV0/XG4gICAgICAgICAgICAgICAgICAgIGdpID0gbWF0Y2hbMF0uc2xpY2UoZ3MpLmluZGV4T2YgbWF0Y2hbaisxXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmdzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBtYXRjaC5pbmRleCArIGkgKyBncyArIGdpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogbWF0Y2hbaisxXVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xzczogIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogclxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGdzICs9IG1hdGNoW2orMV0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgaSArPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aFxuICAgICAgICAgICAgICAgIHMgPSB0ZXh0LnNsaWNlIGlcblxuICAgIHNvcnRSYW5nZXMgcmdzICAgICAgICBcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgIFxuIFxuIyBhY2NlcHRzIGEgbGlzdCBvZiByYW5nZXNcbiMgcmV0dXJucyBhIGxpc3Qgb2Ygb2JqZWN0czpcbiBcbiMgICAgIG1hdGNoOiB0aGUgbWF0Y2hlZCBzdWJzdHJpbmdcbiMgICAgIHN0YXJ0OiBwb3NpdGlvbiBvZiBtYXRjaCBpbiBzdHJcbiMgICAgIGNsc3M6ICBzdHJpbmcgb2YgY2xhc3NuYW1lcyBqb2luZWQgd2l0aCBhIHNwYWNlXG4gICAgIFxuIyAgICAgd2l0aCBub25lIG9mIHRoZSBbc3RhcnQsIHN0YXJ0K21hdGNoLmxlbmd0aF0gcmFuZ2VzIG92ZXJsYXBwaW5nXG5cbmRpc3NlY3QgPSAocmFuZ2VzLCBvcHQgPSBqb2luOmZhbHNlKSAtPiBcbiAgICBcbiAgICAjIGxvZyA9IG9wdD8ubG9nID8gLT5cbiAgICAgICAgXG4gICAgcmV0dXJuIFtdIGlmIG5vdCByYW5nZXMubGVuZ3RoXG4gICAgIyBjb25zb2xlLmxvZyBcImRpc3NlY3QgLS0gI3tKU09OLnN0cmluZ2lmeSByYW5nZXN9XCJcbiAgICBcbiAgICBkaSA9IFtdICMgY29sbGVjdCBhIGxpc3Qgb2YgcG9zaXRpb25zIHdoZXJlIGEgbWF0Y2ggc3RhcnRzIG9yIGVuZHNcbiAgICBmb3IgcmcgaW4gcmFuZ2VzXG4gICAgICAgIGRpLnB1c2ggW3JnLnN0YXJ0LCByZy5pbmRleF1cbiAgICAgICAgZGkucHVzaCBbcmcuc3RhcnQgKyByZy5tYXRjaC5sZW5ndGgsIHJnLmluZGV4XVxuICAgICAgICBcbiAgICBkaS5zb3J0IChhLGIpIC0+ICMgc29ydCB0aGUgc3RhcnQvZW5kIHBvc2l0aW9ucyBieSB4IG9yIGluZGV4XG4gICAgICAgIGlmIGFbMF09PWJbMF0gXG4gICAgICAgICAgICBhWzFdLWJbMV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYVswXS1iWzBdXG4gICAgICAgICAgICBcbiAgICBkID0gW10gXG4gICAgc2kgPSAtMVxuXG4gICAgZm9yIGRwcyBpbiBkaSAgICAgICAgICAjIGNyZWF0ZSBhIGxpc3Qgb2YgZHVtbXkgcmFuZ2VzIFxuICAgICAgICBpZiBkcHNbMF0gPiBzaSAgICAgIyBvbmUgcmFuZ2UgZm9yIGVhY2ggcG9zaXRpb25cbiAgICAgICAgICAgIHNpID0gZHBzWzBdXG4gICAgICAgICAgICBkLnB1c2hcbiAgICAgICAgICAgICAgICBzdGFydDogc2lcbiAgICAgICAgICAgICAgICBjbHM6ICAgW11cblxuICAgIHAgPSAwXG4gICAgZm9yIHJpIGluIFswLi4ucmFuZ2VzLmxlbmd0aF1cbiAgICAgICAgcmcgPSByYW5nZXNbcmldXG4gICAgICAgIHdoaWxlIGRbcF0uc3RhcnQgPCByZy5zdGFydCBcbiAgICAgICAgICAgIHAgKz0gMSBcbiAgICAgICAgcG4gPSBwXG4gICAgICAgIHdoaWxlIGRbcG5dLnN0YXJ0IDwgcmcuc3RhcnQrcmcubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICBpZiByZy5jbHNzP1xuICAgICAgICAgICAgICAgIGlmIG5vdCByZy5jbHNzLnNwbGl0P1xuICAgICAgICAgICAgICAgICAgICBmb3IgciBpbiByZy5jbHNzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBpZiBub3Qgcj8uc3BsaXQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgYyBpbiByLnNwbGl0ICcuJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW3BuXS5jbHMucHVzaCBjIGlmIGRbcG5dLmNscy5pbmRleE9mKGMpIDwgMFxuICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIGZvciBjIGluIHJnLmNsc3Muc3BsaXQgJy4nIFxuICAgICAgICAgICAgICAgICAgICAgICAgZFtwbl0uY2xzLnB1c2ggYyBpZiBkW3BuXS5jbHMuaW5kZXhPZihjKSA8IDBcbiAgICAgICAgICAgIGlmIHBuKzEgPCBkLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG5vdCBkW3BuXS5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBkW3BuXS5tYXRjaCA9IHJnLm1hdGNoLnN1YnN0ciBkW3BuXS5zdGFydC1yZy5zdGFydCwgZFtwbisxXS5zdGFydC1kW3BuXS5zdGFydFxuICAgICAgICAgICAgICAgIHBuICs9IDFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBub3QgZFtwbl0ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgZFtwbl0ubWF0Y2ggPSByZy5tYXRjaC5zdWJzdHIgZFtwbl0uc3RhcnQtcmcuc3RhcnRcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgIGQgPSBkLmZpbHRlciAoaSkgLT4gaS5tYXRjaD8udHJpbSgpLmxlbmd0aFxuICAgIFxuICAgIGZvciBpIGluIGRcbiAgICAgICAgaS5jbHNzID0gaS5jbHMuam9pbiAnICdcbiAgICAgICAgZGVsZXRlIGkuY2xzXG4gICAgICAgIFxuICAgIGlmIGQubGVuZ3RoID4gMVxuICAgICAgICBmb3IgaSBpbiBbZC5sZW5ndGgtMi4uMF1cbiAgICAgICAgICAgIGlmIGRbaV0uc3RhcnQgKyBkW2ldLm1hdGNoLmxlbmd0aCA9PSBkW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICBpZiBkW2ldLmNsc3MgPT0gZFtpKzFdLmNsc3NcbiAgICAgICAgICAgICAgICAgICAgZFtpXS5tYXRjaCArPSBkW2krMV0ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgZC5zcGxpY2UgaSsxLCAxXG4gICAgZFxuXG4jIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gXG4jIG1lcmdlcyB0d28gc29ydGVkIGxpc3RzIG9mIGRpc3NlY3Rpb25zXG4gICAgXG5tZXJnZSA9IChkc3NBLCBkc3NCKSAtPlxuICAgIFxuICAgIHJlc3VsdCA9IFtdXG4gICAgQSA9IGRzc0Euc2hpZnQoKVxuICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICBcbiAgICB3aGlsZSBBIGFuZCBCXG5cbiAgICAgICAgaWYgQS5zdGFydCtBLm1hdGNoLmxlbmd0aCA8IEIuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoIEFcbiAgICAgICAgICAgIEEgPSBkc3NBLnNoaWZ0KClcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQi5zdGFydCtCLm1hdGNoLmxlbmd0aCA8IEEuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoIEJcbiAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQS5zdGFydCA8IEIuc3RhcnRcbiAgICAgICAgICAgIGQgPSBCLnN0YXJ0LUEuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoXG4gICAgICAgICAgICAgICAgc3RhcnQ6IEEuc3RhcnRcbiAgICAgICAgICAgICAgICBjbHNzOiAgQS5jbHNzXG4gICAgICAgICAgICAgICAgbWF0Y2g6IEEubWF0Y2guc2xpY2UgMCwgZFxuICAgICAgICAgICAgQS5zdGFydCArPSBkXG4gICAgICAgICAgICBBLm1hdGNoID0gQS5tYXRjaC5zbGljZSBkXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEIuc3RhcnQgPCBBLnN0YXJ0XG4gICAgICAgICAgICBkID0gQS5zdGFydC1CLnN0YXJ0XG4gICAgICAgICAgICByZXN1bHQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBCLnN0YXJ0XG4gICAgICAgICAgICAgICAgY2xzczogIEIuY2xzc1xuICAgICAgICAgICAgICAgIG1hdGNoOiBCLm1hdGNoLnNsaWNlIDAsIGRcbiAgICAgICAgICAgIEIuc3RhcnQgKz0gZFxuICAgICAgICAgICAgQi5tYXRjaCA9IEIubWF0Y2guc2xpY2UgZFxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBBLnN0YXJ0ID09IEIuc3RhcnRcbiAgICAgICAgICAgIGQgPSBBLm1hdGNoLmxlbmd0aCAtIEIubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICByZXN1bHQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBBLnN0YXJ0XG4gICAgICAgICAgICAgICAgY2xzczogIEEuY2xzcyArIFwiIFwiICsgQi5jbHNzXG4gICAgICAgICAgICAgICAgbWF0Y2g6IGQgPj0gMCBhbmQgQi5tYXRjaCBvciBBLm1hdGNoXG4gICAgICAgICAgICBpZiBkID4gMFxuICAgICAgICAgICAgICAgIEEubWF0Y2ggPSBBLm1hdGNoLnNsaWNlIEIubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICAgICAgQS5zdGFydCArPSBCLm1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgZCA8IDBcbiAgICAgICAgICAgICAgICBCLm1hdGNoID0gQi5tYXRjaC5zbGljZSBBLm1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIEIuc3RhcnQgKz0gQS5tYXRjaC5sZW5ndGhcbiAgICAgICAgICAgICAgICBBID0gZHNzQS5zaGlmdCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQSA9IGRzc0Euc2hpZnQoKVxuICAgICAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgXG4gICAgaWYgQiBhbmQgbm90IEFcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCBbQl0sIGRzc0IgXG4gICAgaWYgQSBhbmQgbm90IEJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCBbQV0sIGRzc0EgXG4gICAgcmVzdWx0XG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIGNvbmZpZzogICAgIGNvbmZpZ1xuICAgIHJhbmdlczogICAgIHJhbmdlc1xuICAgIGRpc3NlY3Q6ICAgIGRpc3NlY3RcbiAgICBzb3J0UmFuZ2VzOiBzb3J0UmFuZ2VzXG4gICAgbWVyZ2U6ICAgICAgbWVyZ2VcbiJdfQ==
//# sourceURL=../coffee/matchr.coffee