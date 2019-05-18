// koffee 0.43.0

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
            if (regexes.indexOf('|') >= 0) {
                regexes = (function() {
                    var k, len, ref1, results;
                    ref1 = regexes.split('|');
                    results = [];
                    for (k = 0, len = ref1.length; k < len; k++) {
                        r = ref1[k];
                        results.push([new RegExp(r, flags), 'found']);
                    }
                    return results;
                })();
            } else {
                regexes = [[new RegExp(regexes, flags), 'found']];
            }
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
                        value: arg,
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
                        value: value,
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
            if (rg.value != null) {
                if (rg.value.split == null) {
                    ref2 = rg.value;
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
                    ref4 = rg.value.split('.');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2hyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUE0QixPQUFBLENBQVEsT0FBUixDQUE1QixFQUFFLGlCQUFGLEVBQVMsaUJBQVQsRUFBZ0IsZUFBaEIsRUFBc0I7O0FBVXRCLE1BQUEsR0FBUyxTQUFDLFFBQUQsRUFBVyxLQUFYO0FBQXFCLFFBQUE7QUFBRTtTQUFBLGFBQUE7O3FCQUFBLENBQUMsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFjLEtBQWQsQ0FBRCxFQUF1QixDQUF2QjtBQUFBOztBQUF2Qjs7QUFFVCxVQUFBLEdBQWEsU0FBQyxHQUFEO1dBRVQsR0FBRyxDQUFDLElBQUosQ0FBUyxTQUFDLENBQUQsRUFBRyxDQUFIO1FBQ0wsSUFBRyxDQUFDLENBQUMsS0FBRixLQUFXLENBQUMsQ0FBQyxLQUFoQjttQkFDSSxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxNQURoQjtTQUFBLE1BQUE7bUJBR0ksQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFDLENBQUMsTUFIaEI7O0lBREssQ0FBVDtBQUZTOztBQTZCYixNQUFBLEdBQVMsU0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixLQUFoQjtBQUVMLFFBQUE7SUFBQSxJQUFHLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxPQUFWLENBQVA7UUFDSSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxDQUFIO1lBQ0ksSUFBRyxPQUFPLENBQUMsT0FBUixDQUFnQixHQUFoQixDQUFBLElBQXdCLENBQTNCO2dCQUNJLE9BQUE7O0FBQVc7QUFBQTt5QkFBQSxzQ0FBQTs7cUNBQUEsQ0FBQyxJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFELEVBQXVCLE9BQXZCO0FBQUE7O3FCQURmO2FBQUEsTUFBQTtnQkFHSSxPQUFBLEdBQVUsQ0FBQyxDQUFDLElBQUksTUFBSixDQUFXLE9B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R0FBSSxDQUFQO2dCQUNELENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUF0QjtnQkFDVixDQUFDLENBQUMsS0FBRixJQUFXLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ25CLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFBLEVBSEg7YUFBQSxNQUFBO2dCQUtELENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFBO2dCQUNKLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFBLEVBTkg7YUFWVDs7SUFoQ0o7SUFrREEsSUFBRyxDQUFBLElBQU0sQ0FBSSxDQUFiO1FBQ0ksTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELENBQWQsRUFBbUIsSUFBbkIsRUFEYjs7SUFFQSxJQUFHLENBQUEsSUFBTSxDQUFJLENBQWI7UUFDSSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsQ0FBZCxFQUFtQixJQUFuQixFQURiOztXQUVBO0FBNURJOztBQThEUixNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsTUFBQSxFQUFZLE1BQVo7SUFDQSxNQUFBLEVBQVksTUFEWjtJQUVBLE9BQUEsRUFBWSxPQUZaO0lBR0EsVUFBQSxFQUFZLFVBSFo7SUFJQSxLQUFBLEVBQVksS0FKWiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgIFxuMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGVtcHR5LCB2YWxpZCwgbGFzdCwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwMDAwMCBcblxuIyBjb252ZXJ0IHRoZSBwYXR0ZXJucyBvYmplY3QgdG8gYSBsaXN0IG9mIFtSZWdFeHAoa2V5KSwgdmFsdWVdIHBhaXJzXG5cbmNvbmZpZyA9IChwYXR0ZXJucywgZmxhZ3MpIC0+ICggW25ldyBSZWdFeHAocCwgZmxhZ3MpLCBhXSBmb3IgcCxhIG9mIHBhdHRlcm5zIClcblxuc29ydFJhbmdlcyA9IChyZ3MpIC0+XG4gICAgXG4gICAgcmdzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgaWYgYS5zdGFydCA9PSBiLnN0YXJ0XG4gICAgICAgICAgICBhLmluZGV4IC0gYi5pbmRleFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhLnN0YXJ0IC0gYi5zdGFydFxuXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgXG5cbiMgYWNjZXB0cyBhIGxpc3Qgb2YgW3JlZ2V4cCwgdmFsdWUocyldIHBhaXJzIGFuZCBhIHN0cmluZ1xuIyByZXR1cm5zIGEgbGlzdCBvZiBvYmplY3RzIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1hdGNoZXM6XG4gIFxuIyAgICAgbWF0Y2g6IHRoZSBtYXRjaGVkIHN1YnN0cmluZ1xuIyAgICAgc3RhcnQ6IHBvc2l0aW9uIG9mIG1hdGNoIGluIHN0clxuIyAgICAgdmFsdWU6IHRoZSB2YWx1ZSBmb3IgdGhlIG1hdGNoXG4jICAgICBpbmRleDogaW5kZXggb2YgdGhlIHJlZ2V4cFxuICAgIFxuIyAgICAgdGhlIG9iamVjdHMgYXJlIHNvcnRlZCBieSBzdGFydCBhbmQgaW5kZXhcbiAgICAgIFxuIyAgICAgaWYgdGhlIHJlZ2V4cCBoYXMgY2FwdHVyZSBncm91cHMgdGhlbiBcbiMgICAgICAgICB0aGUgdmFsdWUgZm9yIHRoZSBtYXRjaCBvZiB0aGUgbnRoIGdyb3VwIGlzXG4jICAgICAgICAgICAgIHRoZSBudGggaXRlbSBvZiB2YWx1ZXMocykgaWYgdmFsdWUocykgaXMgYW4gYXJyYXlcbiMgICAgICAgICAgICAgdGhlIG50aCBba2V5LCB2YWx1ZV0gcGFpciBpZiB2YWx1ZShzKSBpcyBhbiBvYmplY3RcblxucmFuZ2VzID0gKHJlZ2V4ZXMsIHRleHQsIGZsYWdzKSAtPlxuICAgIFxuICAgIGlmIG5vdCBfLmlzQXJyYXkgcmVnZXhlc1xuICAgICAgICBpZiBfLmlzU3RyaW5nIHJlZ2V4ZXNcbiAgICAgICAgICAgIGlmIHJlZ2V4ZXMuaW5kZXhPZignfCcpID49IDBcbiAgICAgICAgICAgICAgICByZWdleGVzID0gKFtuZXcgUmVnRXhwKHIsIGZsYWdzKSwgJ2ZvdW5kJ10gZm9yIHIgaW4gcmVnZXhlcy5zcGxpdCgnfCcpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlZ2V4ZXMgPSBbW25ldyBSZWdFeHAocmVnZXhlcywgZmxhZ3MpLCAnZm91bmQnXV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVnZXhlcyA9IFtbcmVnZXhlcywgJ2ZvdW5kJ11dXG4gICAgZWxzZSBpZiB2YWxpZChyZWdleGVzKSBhbmQgbm90IF8uaXNBcnJheSByZWdleGVzWzBdXG4gICAgICAgIHJlZ2V4ZXMgPSBbcmVnZXhlc11cblxuICAgIHJncyA9IFtdXG4gICAgcmV0dXJuIHJncyBpZiBub3QgdGV4dD8gb3IgZW1wdHkgcmVnZXhlc1xuICAgIFxuICAgIGZvciByIGluIFswLi4ucmVnZXhlcy5sZW5ndGhdXG4gICAgICAgIFxuICAgICAgICByZWcgPSByZWdleGVzW3JdWzBdXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgcmVnPyBvciBub3QgcmVnLmV4ZWM/XG4gICAgICAgICAgICBlcnJvciAnbm8gcmVnPycsIHJlZ2V4ZXMsIHRleHQsIGZsYWdzXG4gICAgICAgICAgICByZXR1cm4gcmdzXG4gICAgICAgIFxuICAgICAgICBhcmcgPSByZWdleGVzW3JdWzFdXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHMgPSB0ZXh0XG5cbiAgICAgICAgd2hpbGUgcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWF0Y2ggPSByZWcuZXhlYyBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrIGlmIG5vdCBtYXRjaD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbWF0Y2gubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBtYXRjaFswXS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgIHJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogbWF0Y2guaW5kZXggKyBpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogbWF0Y2hbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiByXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGkgKz0gbWF0Y2guaW5kZXggKyBNYXRoLm1heCAxLCBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgICAgICAgICBzID0gdGV4dC5zbGljZSBpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZ3MgPSAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGogaW4gWzAuLm1hdGNoLmxlbmd0aC0yXVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGFyZ1xuICAgICAgICAgICAgICAgICAgICBpZiBfLmlzQXJyYXkodmFsdWUpIGFuZCBqIDwgdmFsdWUubGVuZ3RoIHRoZW4gdmFsdWUgPSB2YWx1ZVtqXVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIF8uaXNPYmplY3QodmFsdWUpIGFuZCBqIDwgXy5zaXplKHZhbHVlKSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gW18ua2V5cyh2YWx1ZSlbal0sIHZhbHVlW18ua2V5cyh2YWx1ZSlbal1dXVxuICAgICAgICAgICAgICAgICAgICBicmVhayBpZiBub3QgbWF0Y2hbaisxXT9cbiAgICAgICAgICAgICAgICAgICAgZ2kgPSBtYXRjaFswXS5zbGljZShncykuaW5kZXhPZiBtYXRjaFtqKzFdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG1hdGNoLmluZGV4ICsgaSArIGdzICsgZ2lcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiBtYXRjaFtqKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiByXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZ3MgKz0gbWF0Y2hbaisxXS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpICs9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgcyA9IHRleHQuc2xpY2UgaVxuXG4gICAgc29ydFJhbmdlcyByZ3MgICAgICAgIFxuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgXG4gXG4jIGFjY2VwdHMgYSBsaXN0IG9mIHJhbmdlc1xuIyByZXR1cm5zIGEgbGlzdCBvZiBvYmplY3RzOlxuIFxuIyAgICAgbWF0Y2g6IHRoZSBtYXRjaGVkIHN1YnN0cmluZ1xuIyAgICAgc3RhcnQ6IHBvc2l0aW9uIG9mIG1hdGNoIGluIHN0clxuIyAgICAgY2xzczogIHN0cmluZyBvZiBjbGFzc25hbWVzIGpvaW5lZCB3aXRoIGEgc3BhY2VcbiAgICAgXG4jICAgICB3aXRoIG5vbmUgb2YgdGhlIFtzdGFydCwgc3RhcnQrbWF0Y2gubGVuZ3RoXSByYW5nZXMgb3ZlcmxhcHBpbmdcblxuZGlzc2VjdCA9IChyYW5nZXMsIG9wdCA9IGpvaW46ZmFsc2UpIC0+IFxuICAgIFxuICAgICMgbG9nID0gb3B0Py5sb2cgPyAtPlxuICAgICAgICBcbiAgICByZXR1cm4gW10gaWYgbm90IHJhbmdlcy5sZW5ndGhcbiAgICAjIGNvbnNvbGUubG9nIFwiZGlzc2VjdCAtLSAje0pTT04uc3RyaW5naWZ5IHJhbmdlc31cIlxuICAgIFxuICAgIGRpID0gW10gIyBjb2xsZWN0IGEgbGlzdCBvZiBwb3NpdGlvbnMgd2hlcmUgYSBtYXRjaCBzdGFydHMgb3IgZW5kc1xuICAgIGZvciByZyBpbiByYW5nZXNcbiAgICAgICAgZGkucHVzaCBbcmcuc3RhcnQsIHJnLmluZGV4XVxuICAgICAgICBkaS5wdXNoIFtyZy5zdGFydCArIHJnLm1hdGNoLmxlbmd0aCwgcmcuaW5kZXhdXG4gICAgICAgIFxuICAgIGRpLnNvcnQgKGEsYikgLT4gIyBzb3J0IHRoZSBzdGFydC9lbmQgcG9zaXRpb25zIGJ5IHggb3IgaW5kZXhcbiAgICAgICAgaWYgYVswXT09YlswXSBcbiAgICAgICAgICAgIGFbMV0tYlsxXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhWzBdLWJbMF1cbiAgICAgICAgICAgIFxuICAgIGQgPSBbXSBcbiAgICBzaSA9IC0xXG5cbiAgICBmb3IgZHBzIGluIGRpICAgICAgICAgICMgY3JlYXRlIGEgbGlzdCBvZiBkdW1teSByYW5nZXMgXG4gICAgICAgIGlmIGRwc1swXSA+IHNpICAgICAjIG9uZSByYW5nZSBmb3IgZWFjaCBwb3NpdGlvblxuICAgICAgICAgICAgc2kgPSBkcHNbMF1cbiAgICAgICAgICAgIGQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBzaVxuICAgICAgICAgICAgICAgIGNsczogICBbXVxuXG4gICAgcCA9IDBcbiAgICBmb3IgcmkgaW4gWzAuLi5yYW5nZXMubGVuZ3RoXVxuICAgICAgICByZyA9IHJhbmdlc1tyaV1cbiAgICAgICAgd2hpbGUgZFtwXS5zdGFydCA8IHJnLnN0YXJ0IFxuICAgICAgICAgICAgcCArPSAxIFxuICAgICAgICBwbiA9IHBcbiAgICAgICAgd2hpbGUgZFtwbl0uc3RhcnQgPCByZy5zdGFydCtyZy5tYXRjaC5sZW5ndGhcbiAgICAgICAgICAgIGlmIHJnLnZhbHVlP1xuICAgICAgICAgICAgICAgIGlmIG5vdCByZy52YWx1ZS5zcGxpdD9cbiAgICAgICAgICAgICAgICAgICAgZm9yIHIgaW4gcmcudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIGlmIG5vdCByPy5zcGxpdD9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBjIGluIHIuc3BsaXQgJy4nIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRbcG5dLmNscy5wdXNoIGMgaWYgZFtwbl0uY2xzLmluZGV4T2YoYykgPCAwXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgZm9yIGMgaW4gcmcudmFsdWUuc3BsaXQgJy4nIFxuICAgICAgICAgICAgICAgICAgICAgICAgZFtwbl0uY2xzLnB1c2ggYyBpZiBkW3BuXS5jbHMuaW5kZXhPZihjKSA8IDBcbiAgICAgICAgICAgIGlmIHBuKzEgPCBkLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG5vdCBkW3BuXS5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBkW3BuXS5tYXRjaCA9IHJnLm1hdGNoLnN1YnN0ciBkW3BuXS5zdGFydC1yZy5zdGFydCwgZFtwbisxXS5zdGFydC1kW3BuXS5zdGFydFxuICAgICAgICAgICAgICAgIHBuICs9IDFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBub3QgZFtwbl0ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgZFtwbl0ubWF0Y2ggPSByZy5tYXRjaC5zdWJzdHIgZFtwbl0uc3RhcnQtcmcuc3RhcnRcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgIGQgPSBkLmZpbHRlciAoaSkgLT4gaS5tYXRjaD8udHJpbSgpLmxlbmd0aFxuICAgIFxuICAgIGZvciBpIGluIGRcbiAgICAgICAgaS5jbHNzID0gaS5jbHMuam9pbiAnICdcbiAgICAgICAgZGVsZXRlIGkuY2xzXG4gICAgICAgIFxuICAgIGlmIGQubGVuZ3RoID4gMVxuICAgICAgICBmb3IgaSBpbiBbZC5sZW5ndGgtMi4uMF1cbiAgICAgICAgICAgIGlmIGRbaV0uc3RhcnQgKyBkW2ldLm1hdGNoLmxlbmd0aCA9PSBkW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICBpZiBkW2ldLmNsc3MgPT0gZFtpKzFdLmNsc3NcbiAgICAgICAgICAgICAgICAgICAgZFtpXS5tYXRjaCArPSBkW2krMV0ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgZC5zcGxpY2UgaSsxLCAxXG4gICAgZFxuXG4jIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gXG4jIG1lcmdlcyB0d28gc29ydGVkIGxpc3RzIG9mIGRpc3NlY3Rpb25zXG4gICAgXG5tZXJnZSA9IChkc3NBLCBkc3NCKSAtPlxuICAgIFxuICAgIHJlc3VsdCA9IFtdXG4gICAgQSA9IGRzc0Euc2hpZnQoKVxuICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICBcbiAgICB3aGlsZSBBIGFuZCBCXG5cbiAgICAgICAgaWYgQS5zdGFydCtBLm1hdGNoLmxlbmd0aCA8IEIuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoIEFcbiAgICAgICAgICAgIEEgPSBkc3NBLnNoaWZ0KClcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQi5zdGFydCtCLm1hdGNoLmxlbmd0aCA8IEEuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoIEJcbiAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQS5zdGFydCA8IEIuc3RhcnRcbiAgICAgICAgICAgIGQgPSBCLnN0YXJ0LUEuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoXG4gICAgICAgICAgICAgICAgc3RhcnQ6IEEuc3RhcnRcbiAgICAgICAgICAgICAgICBjbHNzOiAgQS5jbHNzXG4gICAgICAgICAgICAgICAgbWF0Y2g6IEEubWF0Y2guc2xpY2UgMCwgZFxuICAgICAgICAgICAgQS5zdGFydCArPSBkXG4gICAgICAgICAgICBBLm1hdGNoID0gQS5tYXRjaC5zbGljZSBkXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEIuc3RhcnQgPCBBLnN0YXJ0XG4gICAgICAgICAgICBkID0gQS5zdGFydC1CLnN0YXJ0XG4gICAgICAgICAgICByZXN1bHQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBCLnN0YXJ0XG4gICAgICAgICAgICAgICAgY2xzczogIEIuY2xzc1xuICAgICAgICAgICAgICAgIG1hdGNoOiBCLm1hdGNoLnNsaWNlIDAsIGRcbiAgICAgICAgICAgIEIuc3RhcnQgKz0gZFxuICAgICAgICAgICAgQi5tYXRjaCA9IEIubWF0Y2guc2xpY2UgZFxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBBLnN0YXJ0ID09IEIuc3RhcnRcbiAgICAgICAgICAgIGQgPSBBLm1hdGNoLmxlbmd0aCAtIEIubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICByZXN1bHQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBBLnN0YXJ0XG4gICAgICAgICAgICAgICAgY2xzczogIEEuY2xzcyArIFwiIFwiICsgQi5jbHNzXG4gICAgICAgICAgICAgICAgbWF0Y2g6IGQgPj0gMCBhbmQgQi5tYXRjaCBvciBBLm1hdGNoXG4gICAgICAgICAgICBpZiBkID4gMFxuICAgICAgICAgICAgICAgIEEubWF0Y2ggPSBBLm1hdGNoLnNsaWNlIEIubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICAgICAgQS5zdGFydCArPSBCLm1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgZCA8IDBcbiAgICAgICAgICAgICAgICBCLm1hdGNoID0gQi5tYXRjaC5zbGljZSBBLm1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIEIuc3RhcnQgKz0gQS5tYXRjaC5sZW5ndGhcbiAgICAgICAgICAgICAgICBBID0gZHNzQS5zaGlmdCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQSA9IGRzc0Euc2hpZnQoKVxuICAgICAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgXG4gICAgaWYgQiBhbmQgbm90IEFcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCBbQl0sIGRzc0IgXG4gICAgaWYgQSBhbmQgbm90IEJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCBbQV0sIGRzc0EgXG4gICAgcmVzdWx0XG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIGNvbmZpZzogICAgIGNvbmZpZ1xuICAgIHJhbmdlczogICAgIHJhbmdlc1xuICAgIGRpc3NlY3Q6ICAgIGRpc3NlY3RcbiAgICBzb3J0UmFuZ2VzOiBzb3J0UmFuZ2VzXG4gICAgbWVyZ2U6ICAgICAgbWVyZ2VcbiJdfQ==
//# sourceURL=../coffee/matchr.coffee