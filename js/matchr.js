(function() {
  /*
  00     00   0000000   000000000   0000000  000   000  00000000 
  000   000  000   000     000     000       000   000  000   000
  000000000  000000000     000     000       000000000  0000000  
  000 0 000  000   000     000     000       000   000  000   000
  000   000  000   000     000      0000000  000   000  000   000
  */
  var _, config, dissect, empty, last, merge, ranges, sortRanges, str, valid;

  ({empty, valid, last, str, _} = require('./kxk'));

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
    } else if (valid(regexes) && !_.isArray(regexes[0])) {
      regexes = [regexes];
    }
    rgs = [];
    if ((text == null) || empty(regexes)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2hyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9tYXRjaHIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsR0FBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxLQUFGLEVBQVMsS0FBVCxFQUFnQixJQUFoQixFQUFzQixHQUF0QixFQUEyQixDQUEzQixDQUFBLEdBQWlDLE9BQUEsQ0FBUSxPQUFSLENBQWpDLEVBUkE7Ozs7Ozs7OztFQWtCQSxNQUFBLEdBQVMsUUFBQSxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQUE7QUFBcUIsUUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQTRCO0lBQUEsS0FBQSxhQUFBOzttQkFBMUIsQ0FBQyxJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFELEVBQXVCLENBQXZCO0lBQTBCLENBQUE7O0VBQWpEOztFQUVULFVBQUEsR0FBYSxRQUFBLENBQUMsR0FBRCxDQUFBO1dBRVQsR0FBRyxDQUFDLElBQUosQ0FBUyxRQUFBLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBQTtNQUNMLElBQUcsQ0FBQyxDQUFDLEtBQUYsS0FBVyxDQUFDLENBQUMsS0FBaEI7ZUFDSSxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxNQURoQjtPQUFBLE1BQUE7ZUFHSSxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxNQUhoQjs7SUFESyxDQUFUO0VBRlMsRUFwQmI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFpREEsTUFBQSxHQUFTLFFBQUEsQ0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixLQUFoQixDQUFBO0FBRUwsUUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxF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QUksSUFBSSxDQUFDLEtBQUwsQ0FBQSxFQUhIO1NBQUEsTUFBQTtVQUtELENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFBO1VBQ0osQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQUEsRUFOSDtTQVZUOztJQWhDSjtJQWtEQSxJQUFHLENBQUEsSUFBTSxDQUFJLENBQWI7TUFDSSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUQsQ0FBZCxFQUFtQixJQUFuQixFQURiOztJQUVBLElBQUcsQ0FBQSxJQUFNLENBQUksQ0FBYjtNQUNJLE1BQUEsR0FBUyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxDQUFkLEVBQW1CLElBQW5CLEVBRGI7O1dBRUE7RUE1REk7O0VBOERSLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQVksTUFBWjtJQUNBLE1BQUEsRUFBWSxNQURaO0lBRUEsT0FBQSxFQUFZLE9BRlo7SUFHQSxVQUFBLEVBQVksVUFIWjtJQUlBLEtBQUEsRUFBWTtFQUpaO0FBaFJKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgZW1wdHksIHZhbGlkLCBsYXN0LCBzdHIsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMDAwMDAgXG5cbiMgY29udmVydCB0aGUgcGF0dGVybnMgb2JqZWN0IHRvIGEgbGlzdCBvZiBbUmVnRXhwKGtleSksIHZhbHVlXSBwYWlyc1xuXG5jb25maWcgPSAocGF0dGVybnMsIGZsYWdzKSAtPiAoIFtuZXcgUmVnRXhwKHAsIGZsYWdzKSwgYV0gZm9yIHAsYSBvZiBwYXR0ZXJucyApXG5cbnNvcnRSYW5nZXMgPSAocmdzKSAtPlxuICAgIFxuICAgIHJncy5zb3J0IChhLGIpIC0+XG4gICAgICAgIGlmIGEuc3RhcnQgPT0gYi5zdGFydFxuICAgICAgICAgICAgYS5pbmRleCAtIGIuaW5kZXhcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYS5zdGFydCAtIGIuc3RhcnRcblxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwIFxuXG4jIGFjY2VwdHMgYSBsaXN0IG9mIFtyZWdleHAsIHZhbHVlKHMpXSBwYWlycyBhbmQgYSBzdHJpbmdcbiMgcmV0dXJucyBhIGxpc3Qgb2Ygb2JqZWN0cyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBtYXRjaGVzOlxuICBcbiMgICAgIG1hdGNoOiB0aGUgbWF0Y2hlZCBzdWJzdHJpbmdcbiMgICAgIHN0YXJ0OiBwb3NpdGlvbiBvZiBtYXRjaCBpbiBzdHJcbiMgICAgIHZhbHVlOiB0aGUgdmFsdWUgZm9yIHRoZSBtYXRjaFxuIyAgICAgaW5kZXg6IGluZGV4IG9mIHRoZSByZWdleHBcbiAgICBcbiMgICAgIHRoZSBvYmplY3RzIGFyZSBzb3J0ZWQgYnkgc3RhcnQgYW5kIGluZGV4XG4gICAgICBcbiMgICAgIGlmIHRoZSByZWdleHAgaGFzIGNhcHR1cmUgZ3JvdXBzIHRoZW4gXG4jICAgICAgICAgdGhlIHZhbHVlIGZvciB0aGUgbWF0Y2ggb2YgdGhlIG50aCBncm91cCBpc1xuIyAgICAgICAgICAgICB0aGUgbnRoIGl0ZW0gb2YgdmFsdWVzKHMpIGlmIHZhbHVlKHMpIGlzIGFuIGFycmF5XG4jICAgICAgICAgICAgIHRoZSBudGggW2tleSwgdmFsdWVdIHBhaXIgaWYgdmFsdWUocykgaXMgYW4gb2JqZWN0XG5cbnJhbmdlcyA9IChyZWdleGVzLCB0ZXh0LCBmbGFncykgLT5cbiAgICBcbiAgICBpZiBub3QgXy5pc0FycmF5IHJlZ2V4ZXNcbiAgICAgICAgaWYgXy5pc1N0cmluZyByZWdleGVzXG4gICAgICAgICAgICBpZiByZWdleGVzLmluZGV4T2YoJ3wnKSA+PSAwXG4gICAgICAgICAgICAgICAgcmVnZXhlcyA9IChbbmV3IFJlZ0V4cChyLCBmbGFncyksICdmb3VuZCddIGZvciByIGluIHJlZ2V4ZXMuc3BsaXQoJ3wnKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZWdleGVzID0gW1tuZXcgUmVnRXhwKHJlZ2V4ZXMsIGZsYWdzKSwgJ2ZvdW5kJ11dXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlZ2V4ZXMgPSBbW3JlZ2V4ZXMsICdmb3VuZCddXVxuICAgIGVsc2UgaWYgdmFsaWQocmVnZXhlcykgYW5kIG5vdCBfLmlzQXJyYXkgcmVnZXhlc1swXVxuICAgICAgICByZWdleGVzID0gW3JlZ2V4ZXNdXG5cbiAgICByZ3MgPSBbXVxuICAgIHJldHVybiByZ3MgaWYgbm90IHRleHQ/IG9yIGVtcHR5IHJlZ2V4ZXNcbiAgICBcbiAgICBmb3IgciBpbiBbMC4uLnJlZ2V4ZXMubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgcmVnID0gcmVnZXhlc1tyXVswXVxuICAgICAgICBcbiAgICAgICAgaWYgbm90IHJlZz8gb3Igbm90IHJlZy5leGVjP1xuICAgICAgICAgICAgY29uc29sZS5lcnJvciAnbm8gcmVnPycsIHJlZ2V4ZXMsIHRleHQsIGZsYWdzXG4gICAgICAgICAgICByZXR1cm4gcmdzXG4gICAgICAgIFxuICAgICAgICBhcmcgPSByZWdleGVzW3JdWzFdXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHMgPSB0ZXh0XG5cbiAgICAgICAgd2hpbGUgcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWF0Y2ggPSByZWcuZXhlYyBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrIGlmIG5vdCBtYXRjaD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbWF0Y2gubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBtYXRjaFswXS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgIHJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogbWF0Y2guaW5kZXggKyBpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogbWF0Y2hbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiByXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGkgKz0gbWF0Y2guaW5kZXggKyBNYXRoLm1heCAxLCBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgICAgICAgICBzID0gdGV4dC5zbGljZSBpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZ3MgPSAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGogaW4gWzAuLm1hdGNoLmxlbmd0aC0yXVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGFyZ1xuICAgICAgICAgICAgICAgICAgICBpZiBfLmlzQXJyYXkodmFsdWUpIGFuZCBqIDwgdmFsdWUubGVuZ3RoIHRoZW4gdmFsdWUgPSB2YWx1ZVtqXVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIF8uaXNPYmplY3QodmFsdWUpIGFuZCBqIDwgXy5zaXplKHZhbHVlKSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gW18ua2V5cyh2YWx1ZSlbal0sIHZhbHVlW18ua2V5cyh2YWx1ZSlbal1dXVxuICAgICAgICAgICAgICAgICAgICBicmVhayBpZiBub3QgbWF0Y2hbaisxXT9cbiAgICAgICAgICAgICAgICAgICAgZ2kgPSBtYXRjaFswXS5zbGljZShncykuaW5kZXhPZiBtYXRjaFtqKzFdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG1hdGNoLmluZGV4ICsgaSArIGdzICsgZ2lcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiBtYXRjaFtqKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiByXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZ3MgKz0gbWF0Y2hbaisxXS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpICs9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgcyA9IHRleHQuc2xpY2UgaVxuXG4gICAgc29ydFJhbmdlcyByZ3MgICAgICAgIFxuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgXG4gXG4jIGFjY2VwdHMgYSBsaXN0IG9mIHJhbmdlc1xuIyByZXR1cm5zIGEgbGlzdCBvZiBvYmplY3RzOlxuIFxuIyAgICAgbWF0Y2g6IHRoZSBtYXRjaGVkIHN1YnN0cmluZ1xuIyAgICAgc3RhcnQ6IHBvc2l0aW9uIG9mIG1hdGNoIGluIHN0clxuIyAgICAgY2xzczogIHN0cmluZyBvZiBjbGFzc25hbWVzIGpvaW5lZCB3aXRoIGEgc3BhY2VcbiAgICAgXG4jICAgICB3aXRoIG5vbmUgb2YgdGhlIFtzdGFydCwgc3RhcnQrbWF0Y2gubGVuZ3RoXSByYW5nZXMgb3ZlcmxhcHBpbmdcblxuZGlzc2VjdCA9IChyYW5nZXMsIG9wdCA9IGpvaW46ZmFsc2UpIC0+IFxuICAgIFxuICAgICMgbG9nID0gb3B0Py5sb2cgPyAtPlxuICAgICAgICBcbiAgICByZXR1cm4gW10gaWYgbm90IHJhbmdlcy5sZW5ndGhcbiAgICAjIGNvbnNvbGUubG9nIFwiZGlzc2VjdCAtLSAje0pTT04uc3RyaW5naWZ5IHJhbmdlc31cIlxuICAgIFxuICAgIGRpID0gW10gIyBjb2xsZWN0IGEgbGlzdCBvZiBwb3NpdGlvbnMgd2hlcmUgYSBtYXRjaCBzdGFydHMgb3IgZW5kc1xuICAgIGZvciByZyBpbiByYW5nZXNcbiAgICAgICAgZGkucHVzaCBbcmcuc3RhcnQsIHJnLmluZGV4XVxuICAgICAgICBkaS5wdXNoIFtyZy5zdGFydCArIHJnLm1hdGNoLmxlbmd0aCwgcmcuaW5kZXhdXG4gICAgICAgIFxuICAgIGRpLnNvcnQgKGEsYikgLT4gIyBzb3J0IHRoZSBzdGFydC9lbmQgcG9zaXRpb25zIGJ5IHggb3IgaW5kZXhcbiAgICAgICAgaWYgYVswXT09YlswXSBcbiAgICAgICAgICAgIGFbMV0tYlsxXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhWzBdLWJbMF1cbiAgICAgICAgICAgIFxuICAgIGQgPSBbXSBcbiAgICBzaSA9IC0xXG5cbiAgICBmb3IgZHBzIGluIGRpICAgICAgICAgICMgY3JlYXRlIGEgbGlzdCBvZiBkdW1teSByYW5nZXMgXG4gICAgICAgIGlmIGRwc1swXSA+IHNpICAgICAjIG9uZSByYW5nZSBmb3IgZWFjaCBwb3NpdGlvblxuICAgICAgICAgICAgc2kgPSBkcHNbMF1cbiAgICAgICAgICAgIGQucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBzaVxuICAgICAgICAgICAgICAgIGNsczogICBbXVxuXG4gICAgcCA9IDBcbiAgICBmb3IgcmkgaW4gWzAuLi5yYW5nZXMubGVuZ3RoXVxuICAgICAgICByZyA9IHJhbmdlc1tyaV1cbiAgICAgICAgd2hpbGUgZFtwXS5zdGFydCA8IHJnLnN0YXJ0IFxuICAgICAgICAgICAgcCArPSAxIFxuICAgICAgICBwbiA9IHBcbiAgICAgICAgd2hpbGUgZFtwbl0uc3RhcnQgPCByZy5zdGFydCtyZy5tYXRjaC5sZW5ndGhcbiAgICAgICAgICAgIGlmIHJnLnZhbHVlP1xuICAgICAgICAgICAgICAgIGlmIG5vdCByZy52YWx1ZS5zcGxpdD9cbiAgICAgICAgICAgICAgICAgICAgZm9yIHIgaW4gcmcudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIGlmIG5vdCByLnNwbGl0P1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGMgaW4gci5zcGxpdCAnLicgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtwbl0uY2xzLnB1c2ggYyBpZiBkW3BuXS5jbHMuaW5kZXhPZihjKSA8IDBcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICBmb3IgYyBpbiByZy52YWx1ZS5zcGxpdCAnLicgXG4gICAgICAgICAgICAgICAgICAgICAgICBkW3BuXS5jbHMucHVzaCBjIGlmIGRbcG5dLmNscy5pbmRleE9mKGMpIDwgMFxuICAgICAgICAgICAgaWYgcG4rMSA8IGQubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgbm90IGRbcG5dLm1hdGNoXG4gICAgICAgICAgICAgICAgICAgIGRbcG5dLm1hdGNoID0gcmcubWF0Y2guc3Vic3RyIGRbcG5dLnN0YXJ0LXJnLnN0YXJ0LCBkW3BuKzFdLnN0YXJ0LWRbcG5dLnN0YXJ0XG4gICAgICAgICAgICAgICAgcG4gKz0gMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBkW3BuXS5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBkW3BuXS5tYXRjaCA9IHJnLm1hdGNoLnN1YnN0ciBkW3BuXS5zdGFydC1yZy5zdGFydFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgZCA9IGQuZmlsdGVyIChpKSAtPiBpLm1hdGNoPy50cmltKCkubGVuZ3RoXG4gICAgXG4gICAgZm9yIGkgaW4gZFxuICAgICAgICBpLmNsc3MgPSBpLmNscy5qb2luICcgJ1xuICAgICAgICBkZWxldGUgaS5jbHNcbiAgICAgICAgXG4gICAgaWYgZC5sZW5ndGggPiAxXG4gICAgICAgIGZvciBpIGluIFtkLmxlbmd0aC0yLi4wXVxuICAgICAgICAgICAgaWYgZFtpXS5zdGFydCArIGRbaV0ubWF0Y2gubGVuZ3RoID09IGRbaSsxXS5zdGFydFxuICAgICAgICAgICAgICAgIGlmIGRbaV0uY2xzcyA9PSBkW2krMV0uY2xzc1xuICAgICAgICAgICAgICAgICAgICBkW2ldLm1hdGNoICs9IGRbaSsxXS5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBkLnNwbGljZSBpKzEsIDFcbiAgICBkXG5cbiMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiBcbiMgbWVyZ2VzIHR3byBzb3J0ZWQgbGlzdHMgb2YgZGlzc2VjdGlvbnNcbiAgICBcbm1lcmdlID0gKGRzc0EsIGRzc0IpIC0+XG4gICAgXG4gICAgcmVzdWx0ID0gW11cbiAgICBBID0gZHNzQS5zaGlmdCgpXG4gICAgQiA9IGRzc0Iuc2hpZnQoKVxuICAgIFxuICAgIHdoaWxlIEEgYW5kIEJcblxuICAgICAgICBpZiBBLnN0YXJ0K0EubWF0Y2gubGVuZ3RoIDwgQi5zdGFydFxuICAgICAgICAgICAgcmVzdWx0LnB1c2ggQVxuICAgICAgICAgICAgQSA9IGRzc0Euc2hpZnQoKVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBCLnN0YXJ0K0IubWF0Y2gubGVuZ3RoIDwgQS5zdGFydFxuICAgICAgICAgICAgcmVzdWx0LnB1c2ggQlxuICAgICAgICAgICAgQiA9IGRzc0Iuc2hpZnQoKVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBBLnN0YXJ0IDwgQi5zdGFydFxuICAgICAgICAgICAgZCA9IEIuc3RhcnQtQS5zdGFydFxuICAgICAgICAgICAgcmVzdWx0LnB1c2hcbiAgICAgICAgICAgICAgICBzdGFydDogQS5zdGFydFxuICAgICAgICAgICAgICAgIGNsc3M6ICBBLmNsc3NcbiAgICAgICAgICAgICAgICBtYXRjaDogQS5tYXRjaC5zbGljZSAwLCBkXG4gICAgICAgICAgICBBLnN0YXJ0ICs9IGRcbiAgICAgICAgICAgIEEubWF0Y2ggPSBBLm1hdGNoLnNsaWNlIGRcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQi5zdGFydCA8IEEuc3RhcnRcbiAgICAgICAgICAgIGQgPSBBLnN0YXJ0LUIuc3RhcnRcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoXG4gICAgICAgICAgICAgICAgc3RhcnQ6IEIuc3RhcnRcbiAgICAgICAgICAgICAgICBjbHNzOiAgQi5jbHNzXG4gICAgICAgICAgICAgICAgbWF0Y2g6IEIubWF0Y2guc2xpY2UgMCwgZFxuICAgICAgICAgICAgQi5zdGFydCArPSBkXG4gICAgICAgICAgICBCLm1hdGNoID0gQi5tYXRjaC5zbGljZSBkXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEEuc3RhcnQgPT0gQi5zdGFydFxuICAgICAgICAgICAgZCA9IEEubWF0Y2gubGVuZ3RoIC0gQi5tYXRjaC5sZW5ndGhcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoXG4gICAgICAgICAgICAgICAgc3RhcnQ6IEEuc3RhcnRcbiAgICAgICAgICAgICAgICBjbHNzOiAgQS5jbHNzICsgXCIgXCIgKyBCLmNsc3NcbiAgICAgICAgICAgICAgICBtYXRjaDogZCA+PSAwIGFuZCBCLm1hdGNoIG9yIEEubWF0Y2hcbiAgICAgICAgICAgIGlmIGQgPiAwXG4gICAgICAgICAgICAgICAgQS5tYXRjaCA9IEEubWF0Y2guc2xpY2UgQi5tYXRjaC5sZW5ndGhcbiAgICAgICAgICAgICAgICBBLnN0YXJ0ICs9IEIubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICAgICAgQiA9IGRzc0Iuc2hpZnQoKVxuICAgICAgICAgICAgZWxzZSBpZiBkIDwgMFxuICAgICAgICAgICAgICAgIEIubWF0Y2ggPSBCLm1hdGNoLnNsaWNlIEEubWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICAgICAgQi5zdGFydCArPSBBLm1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIEEgPSBkc3NBLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBBID0gZHNzQS5zaGlmdCgpXG4gICAgICAgICAgICAgICAgQiA9IGRzc0Iuc2hpZnQoKVxuICAgICAgICBcbiAgICBpZiBCIGFuZCBub3QgQVxuICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0IFtCXSwgZHNzQiBcbiAgICBpZiBBIGFuZCBub3QgQlxuICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0IFtBXSwgZHNzQSBcbiAgICByZXN1bHRcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gXG4gICAgY29uZmlnOiAgICAgY29uZmlnXG4gICAgcmFuZ2VzOiAgICAgcmFuZ2VzXG4gICAgZGlzc2VjdDogICAgZGlzc2VjdFxuICAgIHNvcnRSYW5nZXM6IHNvcnRSYW5nZXNcbiAgICBtZXJnZTogICAgICBtZXJnZVxuIl19
//# sourceURL=../coffee/matchr.coffee