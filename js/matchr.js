(function() {
  /*
  00     00   0000000   000000000   0000000  000   000  00000000 
  000   000  000   000     000     000       000   000  000   000
  000000000  000000000     000     000       000000000  0000000  
  000 0 000  000   000     000     000       000   000  000   000
  000   000  000   000     000      0000000  000   000  000   000
  */
  var _, config, dissect, empty, last, merge, ranges, sortRanges, str;

  ({empty, last, str, _} = require('./kxk'));

  //  0000000   0000000   000   000  00000000  000   0000000 
  // 000       000   000  0000  000  000       000  000      
  // 000       000   000  000 0 000  000000    000  000  0000
  // 000       000   000  000  0000  000       000  000   000
  //  0000000   0000000   000   000  000       000   0000000 

  // convert the patterns object to a list of [RegExp(key), value] pairs
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

  // 00000000    0000000   000   000   0000000   00000000   0000000
  // 000   000  000   000  0000  000  000        000       000     
  // 0000000    000000000  000 0 000  000  0000  0000000   0000000 
  // 000   000  000   000  000  0000  000   000  000            000
  // 000   000  000   000  000   000   0000000   00000000  0000000 

  // accepts a list of [regexp, value(s)] pairs and a string
  // returns a list of objects with information about the matches:

  //     match: the matched substring
  //     start: position of match in str
  //     value: the value for the match
  //     index: index of the regexp

  //     the objects are sorted by start and index

  //     if the regexp has capture groups then 
  //         the value for the match of the nth group is
  //             the nth item of values(s) if value(s) is an array
  //             the nth [key, value] pair if value(s) is an object
  ranges = function(regexes, text, flags) {
    var arg, gi, gs, i, j, k, l, match, r, ref, ref1, reg, rgs, s, value;
    if (!_.isArray(regexes)) {
      if (_.isString(regexes)) {
        if (regexes.indexOf('|') >= 0) {
          regexes = (function() {
            var k, len, ref, results;
            ref = regexes.split('|');
            results = [];
            for (k = 0, len = ref.length; k < len; k++) {
              r = ref[k];
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
    } else if (!_.isArray(regexes[0])) {
      regexes = [regexes];
    }
    rgs = [];
    if (text == null) {
      return rgs;
    }
    for (r = k = 0, ref = regexes.length; (0 <= ref ? k < ref : k > ref); r = 0 <= ref ? ++k : --k) {
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
          for (j = l = 0, ref1 = match.length - 2; (0 <= ref1 ? l <= ref1 : l >= ref1); j = 0 <= ref1 ? ++l : --l) {
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

  
  // 0000000    000   0000000   0000000  00000000   0000000  000000000
  // 000   000  000  000       000       000       000          000   
  // 000   000  000  0000000   0000000   0000000   000          000   
  // 000   000  000       000       000  000       000          000   
  // 0000000    000  0000000   0000000   00000000   0000000     000   

  // accepts a list of ranges
  // returns a list of objects:

  //     match: the matched substring
  //     start: position of match in str
  //     clss:  string of classnames joined with a space

  //     with none of the [start, start+match.length] ranges overlapping
  dissect = function(ranges, opt = {
      join: false
    }) {
    var c, d, di, dps, i, k, l, len, len1, len2, len3, len4, len5, m, n, o, p, pn, q, r, ref, ref1, ref2, ref3, ref4, rg, ri, si, t, u;
    
    // log = opt?.log ? ->
    if (!ranges.length) {
      return [];
    }
    // console.log "dissect -- #{JSON.stringify ranges}"
    di = []; // collect a list of positions where a match starts or ends
    for (k = 0, len = ranges.length; k < len; k++) {
      rg = ranges[k];
      di.push([rg.start, rg.index]);
      di.push([rg.start + rg.match.length, rg.index]);
    }
    di.sort(function(a, b) { // sort the start/end positions by x or index
      if (a[0] === b[0]) {
        return a[1] - b[1];
      } else {
        return a[0] - b[0];
      }
    });
    d = [];
    si = -1;
// create a list of dummy ranges 
    for (l = 0, len1 = di.length; l < len1; l++) {
      dps = di[l];
      if (dps[0] > si) { // one range for each position
        si = dps[0];
        d.push({
          start: si,
          cls: []
        });
      }
    }
    p = 0;
    for (ri = m = 0, ref = ranges.length; (0 <= ref ? m < ref : m > ref); ri = 0 <= ref ? ++m : --m) {
      rg = ranges[ri];
      while (d[p].start < rg.start) {
        p += 1;
      }
      pn = p;
      while (d[pn].start < rg.start + rg.match.length) {
        if (rg.value != null) {
          if (rg.value.split == null) {
            ref1 = rg.value;
            for (n = 0, len2 = ref1.length; n < len2; n++) {
              r = ref1[n];
              if (r.split == null) {
                continue;
              }
              ref2 = r.split('.');
              for (o = 0, len3 = ref2.length; o < len3; o++) {
                c = ref2[o];
                if (d[pn].cls.indexOf(c) < 0) {
                  d[pn].cls.push(c);
                }
              }
            }
          } else {
            ref3 = rg.value.split('.');
            for (q = 0, len4 = ref3.length; q < len4; q++) {
              c = ref3[q];
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
      var ref4;
      return (ref4 = i.match) != null ? ref4.trim().length : void 0;
    });
    for (t = 0, len5 = d.length; t < len5; t++) {
      i = d[t];
      i.clss = i.cls.join(' ');
      delete i.cls;
    }
    if (d.length > 1) {
      for (i = u = ref4 = d.length - 2; (ref4 <= 0 ? u <= 0 : u >= 0); i = ref4 <= 0 ? ++u : --u) {
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

  // 00     00  00000000  00000000    0000000   00000000  
  // 000   000  000       000   000  000        000       
  // 000000000  0000000   0000000    000  0000  0000000   
  // 000 0 000  000       000   000  000   000  000       
  // 000   000  00000000  000   000   0000000   00000000  

  // merges two sorted lists of dissections
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2hyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9tYXRjaHIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLEtBQUYsRUFBUyxJQUFULEVBQWUsR0FBZixFQUFvQixDQUFwQixDQUFBLEdBQTBCLE9BQUEsQ0FBUSxPQUFSLENBQTFCLEVBUkE7Ozs7Ozs7OztFQWtCQSxNQUFBLEdBQVMsUUFBQSxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQUE7QUFBcUIsUUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQTRCO0lBQUEsS0FBQSxhQUFBOzttQkFBMUIsQ0FBQyxJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFELEVBQXVCLENBQXZCO0lBQTBCLENBQUE7O0VBQWpEOztFQUVULFVBQUEsR0FBYSxRQUFBLENBQUMsR0FBRCxDQUFBO1dBRVQsR0FBRyxDQUFDLElBQUosQ0FBUyxRQUFBLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBQTtNQUNMLElBQUcsQ0FBQyxDQUFDLEtBQUYsS0FBVyxDQUFDLENBQUMsS0FBaEI7ZUFDSSxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxNQURoQjtPQUFBLE1BQUE7ZUFHSSxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxNQUhoQjs7SUFESyxDQUFUO0VBRlMsRUFwQmI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFpREEsTUFBQSxHQUFTLFFBQUEsQ0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixLQUFoQixDQUFBO0FBRUwsUUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEs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SixDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBQSxFQU5IO1NBVlQ7O0lBaENKO0lBa0RBLElBQUcsQ0FBQSxJQUFNLENBQUksQ0FBYjtNQUNJLE1BQUEsR0FBUyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxDQUFkLEVBQW1CLElBQW5CLEVBRGI7O0lBRUEsSUFBRyxDQUFBLElBQU0sQ0FBSSxDQUFiO01BQ0ksTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFELENBQWQsRUFBbUIsSUFBbkIsRUFEYjs7V0FFQTtFQTVESTs7RUE4RFIsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFBWSxNQUFaO0lBQ0EsTUFBQSxFQUFZLE1BRFo7SUFFQSxPQUFBLEVBQVksT0FGWjtJQUdBLFVBQUEsRUFBWSxVQUhaO0lBSUEsS0FBQSxFQUFZO0VBSlo7QUFoUkoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBlbXB0eSwgbGFzdCwgc3RyLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAwMDAwIFxuXG4jIGNvbnZlcnQgdGhlIHBhdHRlcm5zIG9iamVjdCB0byBhIGxpc3Qgb2YgW1JlZ0V4cChrZXkpLCB2YWx1ZV0gcGFpcnNcblxuY29uZmlnID0gKHBhdHRlcm5zLCBmbGFncykgLT4gKCBbbmV3IFJlZ0V4cChwLCBmbGFncyksIGFdIGZvciBwLGEgb2YgcGF0dGVybnMgKVxuXG5zb3J0UmFuZ2VzID0gKHJncykgLT5cbiAgICBcbiAgICByZ3Muc29ydCAoYSxiKSAtPlxuICAgICAgICBpZiBhLnN0YXJ0ID09IGIuc3RhcnRcbiAgICAgICAgICAgIGEuaW5kZXggLSBiLmluZGV4XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGEuc3RhcnQgLSBiLnN0YXJ0XG5cbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCBcblxuIyBhY2NlcHRzIGEgbGlzdCBvZiBbcmVnZXhwLCB2YWx1ZShzKV0gcGFpcnMgYW5kIGEgc3RyaW5nXG4jIHJldHVybnMgYSBsaXN0IG9mIG9iamVjdHMgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbWF0Y2hlczpcbiAgXG4jICAgICBtYXRjaDogdGhlIG1hdGNoZWQgc3Vic3RyaW5nXG4jICAgICBzdGFydDogcG9zaXRpb24gb2YgbWF0Y2ggaW4gc3RyXG4jICAgICB2YWx1ZTogdGhlIHZhbHVlIGZvciB0aGUgbWF0Y2hcbiMgICAgIGluZGV4OiBpbmRleCBvZiB0aGUgcmVnZXhwXG4gICAgXG4jICAgICB0aGUgb2JqZWN0cyBhcmUgc29ydGVkIGJ5IHN0YXJ0IGFuZCBpbmRleFxuICAgICAgXG4jICAgICBpZiB0aGUgcmVnZXhwIGhhcyBjYXB0dXJlIGdyb3VwcyB0aGVuIFxuIyAgICAgICAgIHRoZSB2YWx1ZSBmb3IgdGhlIG1hdGNoIG9mIHRoZSBudGggZ3JvdXAgaXNcbiMgICAgICAgICAgICAgdGhlIG50aCBpdGVtIG9mIHZhbHVlcyhzKSBpZiB2YWx1ZShzKSBpcyBhbiBhcnJheVxuIyAgICAgICAgICAgICB0aGUgbnRoIFtrZXksIHZhbHVlXSBwYWlyIGlmIHZhbHVlKHMpIGlzIGFuIG9iamVjdFxuXG5yYW5nZXMgPSAocmVnZXhlcywgdGV4dCwgZmxhZ3MpIC0+XG4gICAgXG4gICAgaWYgbm90IF8uaXNBcnJheSByZWdleGVzXG4gICAgICAgIGlmIF8uaXNTdHJpbmcgcmVnZXhlc1xuICAgICAgICAgICAgaWYgcmVnZXhlcy5pbmRleE9mKCd8JykgPj0gMFxuICAgICAgICAgICAgICAgIHJlZ2V4ZXMgPSAoW25ldyBSZWdFeHAociwgZmxhZ3MpLCAnZm91bmQnXSBmb3IgciBpbiByZWdleGVzLnNwbGl0KCd8JykpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVnZXhlcyA9IFtbbmV3IFJlZ0V4cChyZWdleGVzLCBmbGFncyksICdmb3VuZCddXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZWdleGVzID0gW1tyZWdleGVzLCAnZm91bmQnXV1cbiAgICBlbHNlIGlmIG5vdCBfLmlzQXJyYXkgcmVnZXhlc1swXVxuICAgICAgICByZWdleGVzID0gW3JlZ2V4ZXNdXG5cbiAgICByZ3MgPSBbXVxuICAgIHJldHVybiByZ3MgaWYgbm90IHRleHQ/XG4gICAgXG4gICAgZm9yIHIgaW4gWzAuLi5yZWdleGVzLmxlbmd0aF1cbiAgICAgICAgXG4gICAgICAgIHJlZyA9IHJlZ2V4ZXNbcl1bMF1cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCByZWc/IG9yIG5vdCByZWcuZXhlYz9cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgJ25vIHJlZz8nLCByZWdleGVzLCB0ZXh0LCBmbGFnc1xuICAgICAgICAgICAgcmV0dXJuIHJnc1xuICAgICAgICBcbiAgICAgICAgYXJnID0gcmVnZXhlc1tyXVsxXVxuICAgICAgICBpID0gMFxuICAgICAgICBzID0gdGV4dFxuXG4gICAgICAgIHdoaWxlIHMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG1hdGNoID0gcmVnLmV4ZWMgc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBicmVhayBpZiBub3QgbWF0Y2g/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG1hdGNoLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbWF0Y2hbMF0ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICByZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG1hdGNoLmluZGV4ICsgaVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG1hdGNoWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJnXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpICs9IG1hdGNoLmluZGV4ICsgTWF0aC5tYXggMSwgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgcyA9IHRleHQuc2xpY2UgaVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdzID0gMFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBqIGluIFswLi5tYXRjaC5sZW5ndGgtMl1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBhcmdcbiAgICAgICAgICAgICAgICAgICAgaWYgXy5pc0FycmF5KHZhbHVlKSBhbmQgaiA8IHZhbHVlLmxlbmd0aCB0aGVuIHZhbHVlID0gdmFsdWVbal1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBfLmlzT2JqZWN0KHZhbHVlKSBhbmQgaiA8IF8uc2l6ZSh2YWx1ZSkgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFtfLmtleXModmFsdWUpW2pdLCB2YWx1ZVtfLmtleXModmFsdWUpW2pdXV1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgaWYgbm90IG1hdGNoW2orMV0/XG4gICAgICAgICAgICAgICAgICAgIGdpID0gbWF0Y2hbMF0uc2xpY2UoZ3MpLmluZGV4T2YgbWF0Y2hbaisxXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmdzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBtYXRjaC5pbmRleCArIGkgKyBncyArIGdpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogbWF0Y2hbaisxXVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogclxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGdzICs9IG1hdGNoW2orMV0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgaSArPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aFxuICAgICAgICAgICAgICAgIHMgPSB0ZXh0LnNsaWNlIGlcblxuICAgIHNvcnRSYW5nZXMgcmdzICAgICAgICBcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgIFxuIFxuIyBhY2NlcHRzIGEgbGlzdCBvZiByYW5nZXNcbiMgcmV0dXJucyBhIGxpc3Qgb2Ygb2JqZWN0czpcbiBcbiMgICAgIG1hdGNoOiB0aGUgbWF0Y2hlZCBzdWJzdHJpbmdcbiMgICAgIHN0YXJ0OiBwb3NpdGlvbiBvZiBtYXRjaCBpbiBzdHJcbiMgICAgIGNsc3M6ICBzdHJpbmcgb2YgY2xhc3NuYW1lcyBqb2luZWQgd2l0aCBhIHNwYWNlXG4gICAgIFxuIyAgICAgd2l0aCBub25lIG9mIHRoZSBbc3RhcnQsIHN0YXJ0K21hdGNoLmxlbmd0aF0gcmFuZ2VzIG92ZXJsYXBwaW5nXG5cbmRpc3NlY3QgPSAocmFuZ2VzLCBvcHQgPSBqb2luOmZhbHNlKSAtPiBcbiAgICBcbiAgICAjIGxvZyA9IG9wdD8ubG9nID8gLT5cbiAgICAgICAgXG4gICAgcmV0dXJuIFtdIGlmIG5vdCByYW5nZXMubGVuZ3RoXG4gICAgIyBjb25zb2xlLmxvZyBcImRpc3NlY3QgLS0gI3tKU09OLnN0cmluZ2lmeSByYW5nZXN9XCJcbiAgICBcbiAgICBkaSA9IFtdICMgY29sbGVjdCBhIGxpc3Qgb2YgcG9zaXRpb25zIHdoZXJlIGEgbWF0Y2ggc3RhcnRzIG9yIGVuZHNcbiAgICBmb3IgcmcgaW4gcmFuZ2VzXG4gICAgICAgIGRpLnB1c2ggW3JnLnN0YXJ0LCByZy5pbmRleF1cbiAgICAgICAgZGkucHVzaCBbcmcuc3RhcnQgKyByZy5tYXRjaC5sZW5ndGgsIHJnLmluZGV4XVxuICAgICAgICBcbiAgICBkaS5zb3J0IChhLGIpIC0+ICMgc29ydCB0aGUgc3RhcnQvZW5kIHBvc2l0aW9ucyBieSB4IG9yIGluZGV4XG4gICAgICAgIGlmIGFbMF09PWJbMF0gXG4gICAgICAgICAgICBhWzFdLWJbMV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYVswXS1iWzBdXG4gICAgICAgICAgICBcbiAgICBkID0gW10gXG4gICAgc2kgPSAtMVxuXG4gICAgZm9yIGRwcyBpbiBkaSAgICAgICAgICAjIGNyZWF0ZSBhIGxpc3Qgb2YgZHVtbXkgcmFuZ2VzIFxuICAgICAgICBpZiBkcHNbMF0gPiBzaSAgICAgIyBvbmUgcmFuZ2UgZm9yIGVhY2ggcG9zaXRpb25cbiAgICAgICAgICAgIHNpID0gZHBzWzBdXG4gICAgICAgICAgICBkLnB1c2hcbiAgICAgICAgICAgICAgICBzdGFydDogc2lcbiAgICAgICAgICAgICAgICBjbHM6ICAgW11cblxuICAgIHAgPSAwXG4gICAgZm9yIHJpIGluIFswLi4ucmFuZ2VzLmxlbmd0aF1cbiAgICAgICAgcmcgPSByYW5nZXNbcmldXG4gICAgICAgIHdoaWxlIGRbcF0uc3RhcnQgPCByZy5zdGFydCBcbiAgICAgICAgICAgIHAgKz0gMSBcbiAgICAgICAgcG4gPSBwXG4gICAgICAgIHdoaWxlIGRbcG5dLnN0YXJ0IDwgcmcuc3RhcnQrcmcubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICBpZiByZy52YWx1ZT9cbiAgICAgICAgICAgICAgICBpZiBub3QgcmcudmFsdWUuc3BsaXQ/XG4gICAgICAgICAgICAgICAgICAgIGZvciByIGluIHJnLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBpZiBub3Qgci5zcGxpdD9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBjIGluIHIuc3BsaXQgJy4nIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRbcG5dLmNscy5wdXNoIGMgaWYgZFtwbl0uY2xzLmluZGV4T2YoYykgPCAwXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgZm9yIGMgaW4gcmcudmFsdWUuc3BsaXQgJy4nIFxuICAgICAgICAgICAgICAgICAgICAgICAgZFtwbl0uY2xzLnB1c2ggYyBpZiBkW3BuXS5jbHMuaW5kZXhPZihjKSA8IDBcbiAgICAgICAgICAgIGlmIHBuKzEgPCBkLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG5vdCBkW3BuXS5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBkW3BuXS5tYXRjaCA9IHJnLm1hdGNoLnN1YnN0ciBkW3BuXS5zdGFydC1yZy5zdGFydCwgZFtwbisxXS5zdGFydC1kW3BuXS5zdGFydFxuICAgICAgICAgICAgICAgIHBuICs9IDFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBub3QgZFtwbl0ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgZFtwbl0ubWF0Y2ggPSByZy5tYXRjaC5zdWJzdHIgZFtwbl0uc3RhcnQtcmcuc3RhcnRcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgIGQgPSBkLmZpbHRlciAoaSkgLT4gaS5tYXRjaD8udHJpbSgpLmxlbmd0aFxuICAgIFxuICAgIGZvciBpIGluIGRcbiAgICAgICAgaS5jbHNzID0gaS5jbHMuam9pbiAnICdcbiAgICAgICAgZGVsZXRlIGkuY2xzXG4gICAgICAgIFxuICAgIGlmIGQubGVuZ3RoID4gMVxuICAgICAgICBmb3IgaSBpbiBbZC5sZW5ndGgtMi4uMF1cbiAgICAgICAgICAgIGlmIGRbaV0uc3RhcnQgKyBkW2ldLm1hdGNoLmxlbmd0aCA9PSBkW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICBpZiBkW2ldLmNsc3MgPT0gZFtpKzFdLmNsc3NcbiAgICAgICAgICAgICAgICAgICAgZFtpXS5tYXRjaCArPSBkW2krMV0ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgZC5zcGxpY2UgaSsxLCAxXG4gICAgZFxuXG4jIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gXG4jIG1lcmdlcyB0d28gc29ydGVkIGxpc3RzIG9mIGRpc3NlY3Rpb25zXG4gICAgXG5tZXJnZSA9IChkc3NBLCBkc3NCKSAtPlxuICAgIFxuICAgIHJlc3VsdCA9IFtdXG4gICAgQSA9IGRzc0Euc2hpZnQoKVxuICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICBcbiAgICB3aGlsZSBBIGFuZCBCXG5cbiAgICAgICAgaWYgQS5zdGFydCtBLm1hdGNoLmxlbmd0aCA8IEIuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoIEFcbiAgICAgICAgICAgIEEgPSBkc3NBLnNoaWZ0KClcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQi5zdGFydCtCLm1hdGNoLmxlbmd0aCA8IEEuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoIEJcbiAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQS5zdGFydCA8IEIuc3RhcnRcbiAgICAgICAgICAgIGQgPSBCLnN0YXJ0LUEuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoXG4gICAgICAgICAgICAgICAgc3RhcnQ6IEEuc3RhcnRcbiAgICAgICAgICAgICAgICBjbHNzOiAgQS5jbHNzXG4gICAgICAgICAgICAgICAgbWF0Y2g6IEEubWF0Y2guc2xpY2UgMCwgZFxuICAgICAgICAgICAgQS5zdGFydCArPSBkXG4gICAgICAgICAgICBBLm1hdGNoID0gQS5tYXRjaC5zbGljZSBkXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEIuc3RhcnQgPCBBLnN0YXJ0XG4gICAgICAgICAgICBkID0gQS5zdGFydC1CLnN0YXJ0XG4gICAgICAgICAgICByZXN1bHQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBCLnN0YXJ0XG4gICAgICAgICAgICAgICAgY2xzczogIEIuY2xzc1xuICAgICAgICAgICAgICAgIG1hdGNoOiBCLm1hdGNoLnNsaWNlIDAsIGRcbiAgICAgICAgICAgIEIuc3RhcnQgKz0gZFxuICAgICAgICAgICAgQi5tYXRjaCA9IEIubWF0Y2guc2xpY2UgZFxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBBLnN0YXJ0ID09IEIuc3RhcnRcbiAgICAgICAgICAgIGQgPSBBLm1hdGNoLmxlbmd0aCAtIEIubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICByZXN1bHQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBBLnN0YXJ0XG4gICAgICAgICAgICAgICAgY2xzczogIEEuY2xzcyArIFwiIFwiICsgQi5jbHNzXG4gICAgICAgICAgICAgICAgbWF0Y2g6IGQgPj0gMCBhbmQgQi5tYXRjaCBvciBBLm1hdGNoXG4gICAgICAgICAgICBpZiBkID4gMFxuICAgICAgICAgICAgICAgIEEubWF0Y2ggPSBBLm1hdGNoLnNsaWNlIEIubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICAgICAgQS5zdGFydCArPSBCLm1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgZCA8IDBcbiAgICAgICAgICAgICAgICBCLm1hdGNoID0gQi5tYXRjaC5zbGljZSBBLm1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIEIuc3RhcnQgKz0gQS5tYXRjaC5sZW5ndGhcbiAgICAgICAgICAgICAgICBBID0gZHNzQS5zaGlmdCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQSA9IGRzc0Euc2hpZnQoKVxuICAgICAgICAgICAgICAgIEIgPSBkc3NCLnNoaWZ0KClcbiAgICAgICAgXG4gICAgaWYgQiBhbmQgbm90IEFcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCBbQl0sIGRzc0IgXG4gICAgaWYgQSBhbmQgbm90IEJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCBbQV0sIGRzc0EgXG4gICAgcmVzdWx0XG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIGNvbmZpZzogICAgIGNvbmZpZ1xuICAgIHJhbmdlczogICAgIHJhbmdlc1xuICAgIGRpc3NlY3Q6ICAgIGRpc3NlY3RcbiAgICBzb3J0UmFuZ2VzOiBzb3J0UmFuZ2VzXG4gICAgbWVyZ2U6ICAgICAgbWVyZ2VcbiJdfQ==
//# sourceURL=../coffee/matchr.coffee