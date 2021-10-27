// koffee 1.14.0

/*
 0000000   000   000   0000000  000  0000000    000   0000000   0000000
000   000  0000  000  000       000  000   000  000  000       000     
000000000  000 0 000  0000000   000  000   000  000  0000000   0000000 
000   000  000  0000       000  000  000   000  000       000       000
000   000  000   000  0000000   000  0000000    000  0000000   0000000
 */
var AnsiDiss, STYLES, _, j, results, toHexString,
    indexOf = [].indexOf;

_ = require('./kxk')._;

STYLES = {
    f0: 'color:#000',
    f1: 'color:#F00',
    f2: 'color:#0D0',
    f3: 'color:#DD0',
    f4: 'color:#00F',
    f5: 'color:#D0D',
    f6: 'color:#0DD',
    f7: 'color:#AAA',
    f8: 'color:#555',
    f9: 'color:#F55',
    f10: 'color:#5F5',
    f11: 'color:#FF5',
    f12: 'color:#55F',
    f13: 'color:#F5F',
    f14: 'color:#5FF',
    f15: 'color:#FFF',
    b0: 'background-color:#000',
    b1: 'background-color:#A00',
    b2: 'background-color:#0A0',
    b3: 'background-color:#A50',
    b4: 'background-color:#00A',
    b5: 'background-color:#A0A',
    b6: 'background-color:#0AA',
    b7: 'background-color:#AAA',
    b8: 'background-color:#555',
    b9: 'background-color:#F55',
    b10: 'background-color:#5F5',
    b11: 'background-color:#FF5',
    b12: 'background-color:#55F',
    b13: 'background-color:#F5F',
    b14: 'background-color:#5FF',
    b15: 'background-color:#FFF'
};

toHexString = function(num) {
    num = num.toString(16);
    while (num.length < 2) {
        num = "0" + num;
    }
    return num;
};

[0, 1, 2, 3, 4, 5].forEach(function(red) {
    return [0, 1, 2, 3, 4, 5].forEach(function(green) {
        return [0, 1, 2, 3, 4, 5].forEach(function(blue) {
            var b, c, g, n, r, rgb;
            c = 16 + (red * 36) + (green * 6) + blue;
            r = red > 0 ? red * 40 + 55 : 0;
            g = green > 0 ? green * 40 + 55 : 0;
            b = blue > 0 ? blue * 40 + 55 : 0;
            rgb = ((function() {
                var j, len, ref, results;
                ref = [r, g, b];
                results = [];
                for (j = 0, len = ref.length; j < len; j++) {
                    n = ref[j];
                    results.push(toHexString(n));
                }
                return results;
            })()).join('');
            STYLES["f" + c] = "color:#" + rgb;
            return STYLES["b" + c] = "background-color:#" + rgb;
        });
    });
});

(function() {
    results = [];
    for (j = 0; j <= 23; j++){ results.push(j); }
    return results;
}).apply(this).forEach(function(gray) {
    var c, l;
    c = gray + 232;
    l = toHexString(gray * 10 + 8);
    STYLES["f" + c] = "color:#" + l + l + l;
    return STYLES["b" + c] = "background-color:#" + l + l + l;
});

AnsiDiss = (function() {
    function AnsiDiss() {}

    AnsiDiss.ansi2html = function(s) {
        var andi, d, diss, htmlLine, i, k, l, len, lines, o, ref, ref1, ref2, span;
        andi = new AnsiDiss();
        lines = [];
        ref1 = (ref = s != null ? s.split('\n') : void 0) != null ? ref : [];
        for (k = 0, len = ref1.length; k < len; k++) {
            l = ref1[k];
            diss = andi.dissect(l)[1];
            htmlLine = '';
            for (i = o = 0, ref2 = diss.length; 0 <= ref2 ? o < ref2 : o > ref2; i = 0 <= ref2 ? ++o : --o) {
                d = diss[i];
                span = d.styl && ("<span style=\"" + d.styl + "\">" + d.match + "</span>") || d.match;
                if (parseInt(i)) {
                    if (diss[i - 1].start + diss[i - 1].match.length < d.start) {
                        htmlLine += ' ';
                    }
                }
                htmlLine += span;
            }
            lines.push(htmlLine);
        }
        return lines.join('\n');
    };

    AnsiDiss.prototype.dissect = function(input) {
        this.input = input;
        this.diss = [];
        this.text = "";
        this.tokenize();
        return [this.text, this.diss];
    };

    AnsiDiss.prototype.tokenize = function() {
        var addStyle, addText, ansiCode, ansiHandler, ansiMatch, bg, delStyle, fg, handler, i, k, len, length, process, resetStyle, results1, st, start, toHighIntensity, tokens;
        start = 0;
        ansiHandler = 2;
        ansiMatch = false;
        fg = bg = '';
        st = [];
        resetStyle = function() {
            fg = '';
            bg = '';
            return st = [];
        };
        addStyle = function(style) {
            if (indexOf.call(st, style) < 0) {
                return st.push(style);
            }
        };
        delStyle = function(style) {
            return _.pull(st, style);
        };
        addText = (function(_this) {
            return function(t) {
                var match, style, txt;
                _this.text += t;
                txt = _this.text.slice(start);
                match = txt.trim();
                if (match.length) {
                    style = '';
                    if (fg.length) {
                        style += fg + ';';
                    }
                    if (bg.length) {
                        style += bg + ';';
                    }
                    if (st.length) {
                        style += st.join(';');
                    }
                    _this.diss.push({
                        match: match,
                        start: start + txt.search(/[^\s]/),
                        styl: style
                    });
                }
                start = _this.text.length;
                return '';
            };
        })(this);
        toHighIntensity = function(c) {
            var i, k;
            for (i = k = 0; k <= 7; i = ++k) {
                if (c === STYLES["f" + i]) {
                    return STYLES["f" + (8 + i)];
                }
            }
            return c;
        };
        ansiCode = function(m, c) {
            var code, cs, k, len;
            ansiMatch = true;
            if (c.trim().length === 0) {
                c = '0';
            }
            cs = c.trimRight(';').split(';');
            for (k = 0, len = cs.length; k < len; k++) {
                code = cs[k];
                code = parseInt(code, 10);
                switch (false) {
                    case code !== 0:
                        resetStyle();
                        break;
                    case code !== 1:
                        addStyle('font-weight:bold');
                        fg = toHighIntensity(fg);
                        break;
                    case code !== 2:
                        addStyle('opacity:0.5');
                        break;
                    case code !== 4:
                        addStyle('text-decoration:underline');
                        break;
                    case code !== 8:
                        addStyle('display:none');
                        break;
                    case code !== 9:
                        addStyle('text-decoration:line-through');
                        break;
                    case code !== 39:
                        fg = STYLES["f15"];
                        break;
                    case code !== 49:
                        bg = STYLES["b0"];
                        break;
                    case code !== 38:
                        fg = STYLES["f" + cs[2]];
                        break;
                    case code !== 48:
                        bg = STYLES["b" + cs[2]];
                        break;
                    case !((30 <= code && code <= 37)):
                        fg = STYLES["f" + (code - 30)];
                        break;
                    case !((40 <= code && code <= 47)):
                        bg = STYLES["b" + (code - 40)];
                        break;
                    case !((90 <= code && code <= 97)):
                        fg = STYLES["f" + (8 + code - 90)];
                        break;
                    case !((100 <= code && code <= 107)):
                        bg = STYLES["b" + (8 + code - 100)];
                        break;
                    case code !== 28:
                        delStyle('display:none');
                        break;
                    case code !== 22:
                        delStyle('font-weight:bold');
                        delStyle('opacity:0.5');
                }
                if (code === 38 || code === 48) {
                    break;
                }
            }
            return '';
        };
        tokens = [
            {
                pattern: /^\x08+/,
                sub: ''
            }, {
                pattern: /^\x1b\[[012]?K/,
                sub: ''
            }, {
                pattern: /^\x1b\[((?:\d{1,3};?)+|)m/,
                sub: ansiCode
            }, {
                pattern: /^\x1b\[?[\d;]{0,3}/,
                sub: ''
            }, {
                pattern: /^([^\x1b\x08\n]+)/,
                sub: addText
            }
        ];
        process = (function(_this) {
            return function(handler, i) {
                if (i > ansiHandler && ansiMatch) {
                    return;
                }
                ansiMatch = false;
                return _this.input = _this.input.replace(handler.pattern, handler.sub);
            };
        })(this);
        results1 = [];
        while ((length = this.input.length) > 0) {
            for (i = k = 0, len = tokens.length; k < len; i = ++k) {
                handler = tokens[i];
                process(handler, i);
            }
            if (this.input.length === length) {
                break;
            } else {
                results1.push(void 0);
            }
        }
        return results1;
    };

    return AnsiDiss;

})();

module.exports = AnsiDiss;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5zaWRpc3MuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJhbnNpZGlzcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNENBQUE7SUFBQTs7QUFVRSxJQUFNLE9BQUEsQ0FBUSxPQUFSOztBQUVSLE1BQUEsR0FDSTtJQUFBLEVBQUEsRUFBSyxZQUFMO0lBQ0EsRUFBQSxFQUFLLFlBREw7SUFFQSxFQUFBLEVBQUssWUFGTDtJQUdBLEVBQUEsRUFBSyxZQUhMO0lBSUEsRUFBQSxFQUFLLFlBSkw7SUFLQSxFQUFBLEVBQUssWUFMTDtJQU1BLEVBQUEsRUFBSyxZQU5MO0lBT0EsRUFBQSxFQUFLLFlBUEw7SUFRQSxFQUFBLEVBQUssWUFSTDtJQVNBLEVBQUEsRUFBSyxZQVRMO0lBVUEsR0FBQSxFQUFLLFlBVkw7SUFXQSxHQUFBLEVBQUssWUFYTDtJQVlBLEdBQUEsRUFBSyxZQVpMO0lBYUEsR0FBQSxFQUFLLFlBYkw7SUFjQSxHQUFBLEVBQUssWUFkTDtJQWVBLEdBQUEsRUFBSyxZQWZMO0lBZ0JBLEVBQUEsRUFBSyx1QkFoQkw7SUFpQkEsRUFBQSxFQUFLLHVCQWpCTDtJQWtCQSxFQUFBLEVBQUssdUJBbEJMO0lBbUJBLEVBQUEsRUFBSyx1QkFuQkw7SUFvQkEsRUFBQSxFQUFLLHVCQXBCTDtJQXFCQSxFQUFBLEVBQUssdUJBckJMO0lBc0JBLEVBQUEsRUFBSyx1QkF0Qkw7SUF1QkEsRUFBQSxFQUFLLHVCQXZCTDtJQXdCQSxFQUFBLEVBQUssdUJBeEJMO0lBeUJBLEVBQUEsRUFBSyx1QkF6Qkw7SUEwQkEsR0FBQSxFQUFLLHVCQTFCTDtJQTJCQSxHQUFBLEVBQUssdUJBM0JMO0lBNEJBLEdBQUEsRUFBSyx1QkE1Qkw7SUE2QkEsR0FBQSxFQUFLLHVCQTdCTDtJQThCQSxHQUFBLEVBQUssdUJBOUJMO0lBK0JBLEdBQUEsRUFBSyx1QkEvQkw7OztBQWlDSixXQUFBLEdBQWMsU0FBQyxH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QUFBQTtZQUNBLElBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEtBQWlCLE1BQTFCO0FBQUEsc0JBQUE7YUFBQSxNQUFBO3NDQUFBOztRQUZKLENBQUE7O0lBbEZNOzs7Ozs7QUFzRmQsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyMjXG5cbiMgYmFzZWQgb24gY29kZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9yYnVybnMvYW5zaS10by1odG1sXG5cbnsgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cblNUWUxFUyA9XG4gICAgZjA6ICAnY29sb3I6IzAwMCcgIyBub3JtYWwgaW50ZW5zaXR5XG4gICAgZjE6ICAnY29sb3I6I0YwMCdcbiAgICBmMjogICdjb2xvcjojMEQwJ1xuICAgIGYzOiAgJ2NvbG9yOiNERDAnXG4gICAgZjQ6ICAnY29sb3I6IzAwRidcbiAgICBmNTogICdjb2xvcjojRDBEJ1xuICAgIGY2OiAgJ2NvbG9yOiMwREQnXG4gICAgZjc6ICAnY29sb3I6I0FBQSdcbiAgICBmODogICdjb2xvcjojNTU1JyAjIGhpZ2ggaW50ZW5zaXR5XG4gICAgZjk6ICAnY29sb3I6I0Y1NSdcbiAgICBmMTA6ICdjb2xvcjojNUY1J1xuICAgIGYxMTogJ2NvbG9yOiNGRjUnXG4gICAgZjEyOiAnY29sb3I6IzU1RidcbiAgICBmMTM6ICdjb2xvcjojRjVGJ1xuICAgIGYxNDogJ2NvbG9yOiM1RkYnXG4gICAgZjE1OiAnY29sb3I6I0ZGRidcbiAgICBiMDogICdiYWNrZ3JvdW5kLWNvbG9yOiMwMDAnICMgbm9ybWFsIGludGVuc2l0eVxuICAgIGIxOiAgJ2JhY2tncm91bmQtY29sb3I6I0EwMCdcbiAgICBiMjogICdiYWNrZ3JvdW5kLWNvbG9yOiMwQTAnXG4gICAgYjM6ICAnYmFja2dyb3VuZC1jb2xvcjojQTUwJ1xuICAgIGI0OiAgJ2JhY2tncm91bmQtY29sb3I6IzAwQSdcbiAgICBiNTogICdiYWNrZ3JvdW5kLWNvbG9yOiNBMEEnXG4gICAgYjY6ICAnYmFja2dyb3VuZC1jb2xvcjojMEFBJ1xuICAgIGI3OiAgJ2JhY2tncm91bmQtY29sb3I6I0FBQSdcbiAgICBiODogICdiYWNrZ3JvdW5kLWNvbG9yOiM1NTUnICMgaGlnaCBpbnRlbnNpdHlcbiAgICBiOTogICdiYWNrZ3JvdW5kLWNvbG9yOiNGNTUnXG4gICAgYjEwOiAnYmFja2dyb3VuZC1jb2xvcjojNUY1J1xuICAgIGIxMTogJ2JhY2tncm91bmQtY29sb3I6I0ZGNSdcbiAgICBiMTI6ICdiYWNrZ3JvdW5kLWNvbG9yOiM1NUYnXG4gICAgYjEzOiAnYmFja2dyb3VuZC1jb2xvcjojRjVGJ1xuICAgIGIxNDogJ2JhY2tncm91bmQtY29sb3I6IzVGRidcbiAgICBiMTU6ICdiYWNrZ3JvdW5kLWNvbG9yOiNGRkYnXG5cbnRvSGV4U3RyaW5nID0gKG51bSkgLT5cbiAgICBudW0gPSBudW0udG9TdHJpbmcoMTYpXG4gICAgd2hpbGUgbnVtLmxlbmd0aCA8IDIgdGhlbiBudW0gPSBcIjAje251bX1cIlxuICAgIG51bVxuXG5bMC4uNV0uZm9yRWFjaCAocmVkKSAtPlxuICAgIFswLi41XS5mb3JFYWNoIChncmVlbikgLT5cbiAgICAgICAgWzAuLjVdLmZvckVhY2ggKGJsdWUpIC0+XG4gICAgICAgICAgICBjID0gMTYgKyAocmVkICogMzYpICsgKGdyZWVuICogNikgKyBibHVlXG4gICAgICAgICAgICByID0gaWYgcmVkICAgPiAwIHRoZW4gcmVkICAgKiA0MCArIDU1IGVsc2UgMFxuICAgICAgICAgICAgZyA9IGlmIGdyZWVuID4gMCB0aGVuIGdyZWVuICogNDAgKyA1NSBlbHNlIDBcbiAgICAgICAgICAgIGIgPSBpZiBibHVlICA+IDAgdGhlbiBibHVlICAqIDQwICsgNTUgZWxzZSAwICAgICAgICAgICAgXG4gICAgICAgICAgICByZ2IgPSAodG9IZXhTdHJpbmcobikgZm9yIG4gaW4gW3IsIGcsIGJdKS5qb2luKCcnKVxuICAgICAgICAgICAgU1RZTEVTW1wiZiN7Y31cIl0gPSBcImNvbG9yOiMje3JnYn1cIlxuICAgICAgICAgICAgU1RZTEVTW1wiYiN7Y31cIl0gPSBcImJhY2tncm91bmQtY29sb3I6IyN7cmdifVwiXG5cblswLi4yM10uZm9yRWFjaCAoZ3JheSkgLT5cbiAgICBjID0gZ3JheSsyMzJcbiAgICBsID0gdG9IZXhTdHJpbmcoZ3JheSoxMCArIDgpXG4gICAgU1RZTEVTW1wiZiN7Y31cIl0gPSBcImNvbG9yOiMje2x9I3tsfSN7bH1cIlxuICAgIFNUWUxFU1tcImIje2N9XCJdID0gXCJiYWNrZ3JvdW5kLWNvbG9yOiMje2x9I3tsfSN7bH1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG5cbmNsYXNzIEFuc2lEaXNzXG4gICAgXG4gICAgQGFuc2kyaHRtbDogKHMpIC0+IFxuICAgIFxuICAgICAgICBhbmRpID0gbmV3IEFuc2lEaXNzKClcbiAgICAgICAgbGluZXMgPSBbXVxuICAgICAgICBmb3IgbCBpbiBzPy5zcGxpdCgnXFxuJykgPyBbXVxuICAgICAgICAgICAgZGlzcyA9IGFuZGkuZGlzc2VjdChsKVsxXVxuICAgICAgICAgICAgaHRtbExpbmUgPSAnJ1xuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5kaXNzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBkID0gZGlzc1tpXVxuICAgICAgICAgICAgICAgIHNwYW4gPSBkLnN0eWwgYW5kIFwiPHNwYW4gc3R5bGU9XFxcIiN7ZC5zdHlsfVxcXCI+I3tkLm1hdGNofTwvc3Bhbj5cIiBvciBkLm1hdGNoXG4gICAgICAgICAgICAgICAgaWYgcGFyc2VJbnQgaVxuICAgICAgICAgICAgICAgICAgICBpZiBkaXNzW2ktMV0uc3RhcnQgKyBkaXNzW2ktMV0ubWF0Y2gubGVuZ3RoIDwgZC5zdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbExpbmUgKz0gJyAnXG4gICAgICAgICAgICAgICAgaHRtbExpbmUgKz0gc3BhblxuICAgICAgICAgICAgbGluZXMucHVzaCBodG1sTGluZVxuICAgICAgICBsaW5lcy5qb2luICdcXG4nXG4gICAgICAgIFxuICAgIGRpc3NlY3Q6IChAaW5wdXQpIC0+XG4gICAgICAgIFxuICAgICAgICBAZGlzcyAgPSBbXVxuICAgICAgICBAdGV4dCAgPSBcIlwiXG4gICAgICAgIEB0b2tlbml6ZSgpXG4gICAgICAgIFtAdGV4dCwgQGRpc3NdXG5cbiAgICB0b2tlbml6ZTogKCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN0YXJ0ICAgICAgID0gMFxuICAgICAgICBhbnNpSGFuZGxlciA9IDJcbiAgICAgICAgYW5zaU1hdGNoICAgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgZmcgPSBiZyA9ICcnXG4gICAgICAgIHN0ID0gW11cblxuICAgICAgICByZXNldFN0eWxlID0gKCkgLT5cbiAgICAgICAgICAgIGZnID0gJydcbiAgICAgICAgICAgIGJnID0gJydcbiAgICAgICAgICAgIHN0ID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBhZGRTdHlsZSA9IChzdHlsZSkgLT4gc3QucHVzaCBzdHlsZSBpZiBzdHlsZSBub3QgaW4gc3RcbiAgICAgICAgZGVsU3R5bGUgPSAoc3R5bGUpIC0+IF8ucHVsbCBzdCwgc3R5bGVcbiAgICAgICAgXG4gICAgICAgIGFkZFRleHQgPSAodCkgPT5cbiAgICAgICAgICAgIEB0ZXh0ICs9IHRcbiAgICAgICAgICAgIHR4dCA9IEB0ZXh0LnNsaWNlIHN0YXJ0XG4gICAgICAgICAgICBtYXRjaCA9IHR4dC50cmltKClcbiAgICAgICAgICAgIGlmIG1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIHN0eWxlID0gJydcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBmZyArICc7JyAgICBpZiBmZy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBiZyArICc7JyAgICBpZiBiZy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBzdC5qb2luICc7JyBpZiBzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICBAZGlzcy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiBtYXRjaFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogc3RhcnQgKyB0eHQuc2VhcmNoIC9bXlxcc10vXG4gICAgICAgICAgICAgICAgICAgIHN0eWw6ICBzdHlsZVxuICAgICAgICAgICAgc3RhcnQgPSBAdGV4dC5sZW5ndGhcbiAgICAgICAgICAgICcnXG4gICAgICAgIFxuICAgICAgICB0b0hpZ2hJbnRlbnNpdHkgPSAoYykgLT5cbiAgICAgICAgICAgIGZvciBpIGluIFswLi43XVxuICAgICAgICAgICAgICAgIGlmIGMgPT0gU1RZTEVTW1wiZiN7aX1cIl1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNUWUxFU1tcImYjezgraX1cIl1cbiAgICAgICAgICAgIGNcbiAgICAgICAgXG4gICAgICAgIGFuc2lDb2RlID0gKG0sIGMpIC0+XG4gICAgICAgICAgICBhbnNpTWF0Y2ggPSB0cnVlXG4gICAgICAgICAgICBjID0gJzAnIGlmIGMudHJpbSgpLmxlbmd0aCBpcyAwICAgICAgICAgICAgXG4gICAgICAgICAgICBjcyA9IGMudHJpbVJpZ2h0KCc7Jykuc3BsaXQoJzsnKSAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGNvZGUgaW4gY3NcbiAgICAgICAgICAgICAgICBjb2RlID0gcGFyc2VJbnQgY29kZSwgMTBcbiAgICAgICAgICAgICAgICBzd2l0Y2ggXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAwICAgICAgICAgIHRoZW4gcmVzZXRTdHlsZSgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAxICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkU3R5bGUgJ2ZvbnQtd2VpZ2h0OmJvbGQnXG4gICAgICAgICAgICAgICAgICAgICAgICBmZyA9IHRvSGlnaEludGVuc2l0eSBmZ1xuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgMiAgICAgICAgICB0aGVuIGFkZFN0eWxlICdvcGFjaXR5OjAuNSdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDQgICAgICAgICAgdGhlbiBhZGRTdHlsZSAndGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZSdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDggICAgICAgICAgdGhlbiBhZGRTdHlsZSAnZGlzcGxheTpub25lJ1xuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgOSAgICAgICAgICB0aGVuIGFkZFN0eWxlICd0ZXh0LWRlY29yYXRpb246bGluZS10aHJvdWdoJ1xuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgMzkgICAgICAgICB0aGVuIGZnID0gU1RZTEVTW1wiZjE1XCJdICMgZGVmYXVsdCBmb3JlZ3JvdW5kXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyA0OSAgICAgICAgIHRoZW4gYmcgPSBTVFlMRVNbXCJiMFwiXSAgIyBkZWZhdWx0IGJhY2tncm91bmRcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDM4ICAgICAgICAgdGhlbiBmZyA9IFNUWUxFU1tcImYje2NzWzJdfVwiXSAjIGV4dGVuZGVkIGZnIDM4OzU7WzAtMjU1XVxuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgNDggICAgICAgICB0aGVuIGJnID0gU1RZTEVTW1wiYiN7Y3NbMl19XCJdICMgZXh0ZW5kZWQgYmcgNDg7NTtbMC0yNTVdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gIDMwIDw9IGNvZGUgPD0gMzcgIHRoZW4gZmcgPSBTVFlMRVNbXCJmI3tjb2RlIC0gMzB9XCJdICMgbm9ybWFsIGludGVuc2l0eVxuICAgICAgICAgICAgICAgICAgICB3aGVuICA0MCA8PSBjb2RlIDw9IDQ3ICB0aGVuIGJnID0gU1RZTEVTW1wiYiN7Y29kZSAtIDQwfVwiXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICA5MCA8PSBjb2RlIDw9IDk3ICB0aGVuIGZnID0gU1RZTEVTW1wiZiN7OCtjb2RlIC0gOTB9XCJdICAjIGhpZ2ggaW50ZW5zaXR5XG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTAwIDw9IGNvZGUgPD0gMTA3IHRoZW4gYmcgPSBTVFlMRVNbXCJiI3s4K2NvZGUgLSAxMDB9XCJdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAyOCAgICAgICAgIHRoZW4gZGVsU3R5bGUgJ2Rpc3BsYXk6bm9uZSdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDIyICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxTdHlsZSAnZm9udC13ZWlnaHQ6Ym9sZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbFN0eWxlICdvcGFjaXR5OjAuNSdcbiAgICAgICAgICAgICAgICBicmVhayBpZiBjb2RlIGluIFszOCwgNDhdXG4gICAgICAgICAgICAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIHRva2VucyA9IFtcbiAgICAgICAgICAgIHtwYXR0ZXJuOiAvXlxceDA4Ky8sICAgICAgICAgICAgICAgICAgICAgc3ViOiAnJ31cbiAgICAgICAgICAgIHtwYXR0ZXJuOiAvXlxceDFiXFxbWzAxMl0/Sy8sICAgICAgICAgICAgIHN1YjogJyd9XG4gICAgICAgICAgICB7cGF0dGVybjogL15cXHgxYlxcWygoPzpcXGR7MSwzfTs/KSt8KW0vLCAgc3ViOiBhbnNpQ29kZX0gXG4gICAgICAgICAgICB7cGF0dGVybjogL15cXHgxYlxcWz9bXFxkO117MCwzfS8sICAgICAgICAgc3ViOiAnJ31cbiAgICAgICAgICAgIHtwYXR0ZXJuOiAvXihbXlxceDFiXFx4MDhcXG5dKykvLCAgICAgICAgICBzdWI6IGFkZFRleHR9XG4gICAgICAgICBdXG5cbiAgICAgICAgcHJvY2VzcyA9IChoYW5kbGVyLCBpKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIGkgPiBhbnNpSGFuZGxlciBhbmQgYW5zaU1hdGNoICMgZ2l2ZSBhbnNpSGFuZGxlciBhbm90aGVyIGNoYW5jZSBpZiBpdCBtYXRjaGVzXG4gICAgICAgICAgICBhbnNpTWF0Y2ggPSBmYWxzZVxuICAgICAgICAgICAgQGlucHV0ID0gQGlucHV0LnJlcGxhY2UgaGFuZGxlci5wYXR0ZXJuLCBoYW5kbGVyLnN1YlxuXG4gICAgICAgIHdoaWxlIChsZW5ndGggPSBAaW5wdXQubGVuZ3RoKSA+IDBcbiAgICAgICAgICAgIHByb2Nlc3MoaGFuZGxlciwgaSkgZm9yIGhhbmRsZXIsIGkgaW4gdG9rZW5zXG4gICAgICAgICAgICBicmVhayBpZiBAaW5wdXQubGVuZ3RoID09IGxlbmd0aFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFuc2lEaXNzXG5cbiJdfQ==
//# sourceURL=../coffee/ansidiss.coffee