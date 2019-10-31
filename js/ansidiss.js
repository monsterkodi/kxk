// koffee 1.4.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5zaWRpc3MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDRDQUFBO0lBQUE7O0FBVUUsSUFBTSxPQUFBLENBQVEsT0FBUjs7QUFFUixNQUFBLEdBQ0k7SUFBQSxFQUFBLEVBQUssWUFBTDtJQUNBLEVBQUEsRUFBSyxZQURMO0lBRUEsRUFBQSxFQUFLLFlBRkw7SUFHQSxFQUFBLEVBQUssWUFITDtJQUlBLEVBQUEsRUFBSyxZQUpMO0lBS0EsRUFBQSxFQUFLLFlBTEw7SUFNQSxFQUFBLEVBQUssWUFOTDtJQU9BLEVBQUEsRUFBSyxZQVBMO0lBUUEsRUFBQSxFQUFLLFlBUkw7SUFTQSxFQUFBLEVBQUssWUFUTDtJQVVBLEdBQUEsRUFBSyxZQVZMO0lBV0EsR0FBQSxFQUFLLFlBWEw7SUFZQSxHQUFBLEVBQUssWUFaTDtJQWFBLEdBQUEsRUFBSyxZQWJMO0lBY0EsR0FBQSxFQUFLLFlBZEw7SUFlQSxHQUFBLEVBQUssWUFmTDtJQWdCQSxFQUFBLEVBQUssdUJBaEJMO0lBaUJBLEVBQUEsRUFBSyx1QkFqQkw7SUFrQkEsRUFBQSxFQUFLLHVCQWxCTDtJQW1CQSxFQUFBLEVBQUssdUJBbkJMO0lBb0JBLEVBQUEsRUFBSyx1QkFwQkw7SUFxQkEsRUFBQSxFQUFLLHVCQXJCTDtJQXNCQSxFQUFBLEVBQUssdUJBdEJMO0lBdUJBLEVBQUEsRUFBSyx1QkF2Qkw7SUF3QkEsRUFBQSxFQUFLLHVCQXhCTDtJQXlCQSxFQUFBLEVBQUssdUJBekJMO0lBMEJBLEdBQUEsRUFBSyx1QkExQkw7SUEyQkEsR0FBQSxFQUFLLHVCQTNCTDtJQTRCQSxHQUFBLEVBQUssdUJBNUJMO0lBNkJBLEdBQUEsRUFBSyx1QkE3Qkw7SUE4QkEsR0FBQSxFQUFLLHVCQTlCTDtJQStCQSxHQUFBLEVBQUssdUJBL0JMOzs7QUFpQ0osV0FBQSxHQUFjLFNBQUMsR0FBRDtJQUNWLEdBQUEsR0FBTSxHQUFHLENBQUMsUUFBSixDQUFhLEVBQWI7QUFDTixXQUFNLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBbkI7UUFBMEIsR0FBQSxHQUFNLEdBQUEsR0FBSTtJQUFwQztXQUNBO0FBSFU7O0FBS2Qsa0JBQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxHQUFEO1dBQ1gsa0JBQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxLQUFEO2VBQ1gsa0JBQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxJQUFEO0FBQ1gsZ0JBQUE7WUFBQSxDQUFBLEdBQUksRUFBQSxHQUFLLENBQUMsR0FBQSxHQUFNLEVBQVAsQ0FBTCxHQUFrQixDQUFDLEtBQUEsR0FBUSxDQUFULENBQWxCLEdBQWdDO1lBQ3BDLENBQUEsR0FBTyxHQUFBLEdBQVEsQ0FBWCxHQUFrQixHQUFBLEdBQVEsRUFBUixHQUFhLEVBQS9CLEdBQXVDO1lBQzNDLENBQUEsR0FBTyxLQUFBLEdBQVEsQ0FBWCxHQUFrQixLQUFBLEdBQVEsRUFBUixHQUFhLEVBQS9CLEdBQXVDO1lBQzNDLENBQUEsR0FBTyxJQUFBLEdBQVEsQ0FBWCxHQUFrQixJQUFBLEdBQVEsRUFBUixHQUFhLEVBQS9CLEdBQXVDO1lBQzNDLEdBQUEsR0FBTTs7QUFBQztBQUFBO3FCQUFBLHFDQUFBOztpQ0FBQSxXQUFBLENBQVksQ0FBWjtBQUFBOztnQkFBRCxDQUFtQyxDQUFDLElBQXBDLENBQXlDLEVBQXpDO1lBQ04sTUFBTyxDQUFBLEdBQUEsR0FBSSxDQUFKLENBQVAsR0FBa0IsU0FBQSxHQUFVO21CQUM1QixNQUFPLENBQUEsR0FBQSxHQUFJLENBQUosQ0FBUCxHQUFrQixvQkFBQSxHQUFxQjtRQVA1QixDQUFmO0lBRFcsQ0FBZjtBQURXLENBQWY7O0FBV0E7Ozs7Y0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxJQUFEO0FBQ1osUUFBQTtJQUFBLENBQUEsR0FBSSxJQUFBLEdBQUs7SUFDVCxDQUFBLEdBQUksV0FBQSxDQUFZLElBQUEsR0FBSyxFQUFMLEdBQVUsQ0FBdEI7SUFDSixNQUFPLENBQUEsR0FBQSxHQUFJLENBQUosQ0FBUCxHQUFrQixTQUFBLEdBQVUsQ0FBVixHQUFjLENBQWQsR0FBa0I7V0FDcEMsTUFBTyxDQUFBLEdBQUEsR0FBSSxDQUFKLENBQVAsR0FBa0Isb0JBQUEsR0FBcUIsQ0FBckIsR0FBeUIsQ0FBekIsR0FBNkI7QUFKbkMsQ0FBaEI7O0FBWU07OztJQUVGLFFBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxDQUFEO0FBRVIsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLFFBQUosQ0FBQTtRQUNQLEtBQUEsR0FBUTtBQUNSO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLENBQWdCLENBQUEsQ0FBQTtZQUN2QixRQUFBLEdBQVc7QUFDWCxpQkFBUyx5RkFBVDtnQkFDSSxDQUFBLEdBQUksSUFBSyxDQUFBLENBQUE7Z0JBQ1QsSUFBQSxHQUFPLENBQUMsQ0FBQyxJQUFGLElBQVcsQ0FBQSxnQkFBQSxHQUFpQixDQUFDLENBQUMsSUFBbkIsR0FBd0IsS0FBeEIsR0FBNkIsQ0FBQyxDQUFDLEtBQS9CLEdBQXFDLFNBQXJDLENBQVgsSUFBNEQsQ0FBQyxDQUFDO2dCQUNyRSxJQUFHLFFBQUEsQ0FBUyxDQUFULENBQUg7b0JBQ0ksSUFBRyxJQUFLLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBSSxDQUFDLEtBQVYsR0FBa0IsSUFBSyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQUksQ0FBQyxLQUFLLENBQUMsTUFBbEMsR0FBMkMsQ0FBQyxDQUFDLEtBQWhEO3dCQUNJLFFBQUEsSUFBWSxJQURoQjtxQkFESjs7Z0JBR0EsUUFBQSxJQUFZO0FBTmhCO1lBT0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYO0FBVko7ZUFXQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7SUFmUTs7dUJBaUJaLE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFBQyxJQUFDLENBQUEsUUFBRDtRQUVOLElBQUMsQ0FBQSxJQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsSUFBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLFFBQUQsQ0FBQTtlQUNBLENBQUMsSUFBQyxDQUFBLElBQUYsRUFBUSxJQUFDLENBQUEsSUFBVDtJQUxLOzt1QkFPVCxRQUFBLEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxLQUFBLEdBQWM7UUFDZCxXQUFBLEdBQWM7UUFDZCxTQUFBLEdBQWM7UUFFZCxFQUFBLEdBQUssRUFBQSxHQUFLO1FBQ1YsRUFBQSxHQUFLO1FBRUwsVUFBQSxHQUFhLFNBQUE7WUFDVCxFQUFBLEdBQUs7WUFDTCxFQUFBLEdBQUs7bUJBQ0wsRUFBQSxHQUFLO1FBSEk7UUFLYixRQUFBLEdBQVcsU0FBQyxLQUFEO1lBQVcsSUFBaUIsYUFBYSxFQUFiLEVBQUEsS0FBQSxLQUFqQjt1QkFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLEtBQVIsRUFBQTs7UUFBWDtRQUNYLFFBQUEsR0FBVyxTQUFDLEtBQUQ7bUJBQVcsQ0FBQyxDQUFDLElBQUYsQ0FBTyxFQUFQLEVBQVcsS0FBWDtRQUFYO1FBRVgsT0FBQSxHQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDtBQUNOLG9CQUFBO2dCQUFBLEtBQUMsQ0FBQSxJQUFELElBQVM7Z0JBQ1QsR0FBQSxHQUFNLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLEtBQVo7Z0JBQ04sS0FBQSxHQUFRLEdBQUcsQ0FBQyxJQUFKLENBQUE7Z0JBQ1IsSUFBRyxLQUFLLENBQUMsTUFBVDtvQkFDSSxLQUFBLEdBQVE7b0JBQ1IsSUFBd0IsRUFBRSxDQUFDLE1BQTNCO3dCQUFBLEtBQUEsSUFBUyxFQUFBLEdBQUssSUFBZDs7b0JBQ0EsSUFBd0IsRUFBRSxDQUFDLE1BQTNCO3dCQUFBLEtBQUEsSUFBUyxFQUFBLEdBQUssSUFBZDs7b0JBQ0EsSUFBd0IsRUFBRSxDQUFDLE1BQTNCO3dCQUFBLEtBQUEsSUFBUyxFQUFFLENBQUMsSUFBSCxDQUFRLEdBQVIsRUFBVDs7b0JBQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQ0k7d0JBQUEsS0FBQSxFQUFPLEtBQVA7d0JBQ0EsS0FBQSxFQUFPLEtBQUEsR0FBUSxHQUFHLENBQUMsTUFBSixDQUFXLE9BQVgsQ0FEZjt3QkFFQSxJQUFBLEVBQU8sS0FGUDtxQkFESixFQUxKOztnQkFTQSxLQUFBLEdBQVEsS0FBQyxDQUFBLElBQUksQ0FBQzt1QkFDZDtZQWRNO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtRQWdCVixlQUFBLEdBQWtCLFNBQUMsQ0FBRDtBQUNkLGdCQUFBO0FBQUEsaUJBQVMsMEJBQVQ7Z0JBQ0ksSUFBRyxDQUFBLEtBQUssTUFBTyxDQUFBLEdBQUEsR0FBSSxDQUFKLENBQWY7QUFDSSwyQkFBTyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBSCxFQURsQjs7QUFESjttQkFHQTtRQUpjO1FBTWxCLFFBQUEsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKO0FBQ1AsZ0JBQUE7WUFBQSxTQUFBLEdBQVk7WUFDWixJQUFXLENBQUMsQ0FBQyxJQUFGLENBQUEsQ0FBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBOUI7Z0JBQUEsQ0FBQSxHQUFJLElBQUo7O1lBQ0EsRUFBQSxHQUFLLENBQUMsQ0FBQyxTQUFGLENBQVksR0FBWixDQUFnQixDQUFDLEtBQWpCLENBQXVCLEdBQXZCO0FBQ0wsaUJBQUEsb0NBQUE7O2dCQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBVCxFQUFlLEVBQWY7QUFDUCx3QkFBQSxLQUFBO0FBQUEseUJBQ1MsSUFBQSxLQUFRLENBRGpCO3dCQUNpQyxVQUFBLENBQUE7QUFBeEI7QUFEVCx5QkFFUyxJQUFBLEtBQVEsQ0FGakI7d0JBR1EsUUFBQSxDQUFTLGtCQUFUO3dCQUNBLEVBQUEsR0FBSyxlQUFBLENBQWdCLEVBQWhCO0FBRko7QUFGVCx5QkFLUyxJQUFBLEtBQVEsQ0FMakI7d0JBS2lDLFFBQUEsQ0FBUyxhQUFUO0FBQXhCO0FBTFQseUJBTVMsSUFBQSxLQUFRLENBTmpCO3dCQU1pQyxRQUFBLENBQVMsMkJBQVQ7QUFBeEI7QUFOVCx5QkFPUyxJQUFBLEtBQVEsQ0FQakI7d0JBT2lDLFFBQUEsQ0FBUyxjQUFUO0FBQXhCO0FBUFQseUJBUVMsSUFBQSxLQUFRLENBUmpCO3dCQVFpQyxRQUFBLENBQVMsOEJBQVQ7QUFBeEI7QUFSVCx5QkFTUyxJQUFBLEtBQVEsRUFUakI7d0JBU2lDLEVBQUEsR0FBSyxNQUFPLENBQUEsS0FBQTtBQUFwQztBQVRULHlCQVVTLElBQUEsS0FBUSxFQVZqQjt3QkFVaUMsRUFBQSxHQUFLLE1BQU8sQ0FBQSxJQUFBO0FBQXBDO0FBVlQseUJBV1MsSUFBQSxLQUFRLEVBWGpCO3dCQVdpQyxFQUFBLEdBQUssTUFBTyxDQUFBLEdBQUEsR0FBSSxFQUFHLENBQUEsQ0FBQSxDQUFQO0FBQXBDO0FBWFQseUJBWVMsSUFBQSxLQUFRLEVBWmpCO3dCQVlpQyxFQUFBLEdBQUssTUFBTyxDQUFBLEdBQUEsR0FBSSxFQUFHLENBQUEsQ0FBQSxDQUFQO0FBQXBDO0FBWlQsMkJBYVUsQ0FBQSxFQUFBLElBQU0sSUFBTixJQUFNLElBQU4sSUFBYyxFQUFkLEVBYlY7d0JBYWlDLEVBQUEsR0FBSyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsSUFBQSxHQUFPLEVBQVIsQ0FBSDs7QUFiN0MsMkJBY1UsQ0FBQSxFQUFBLElBQU0sSUFBTixJQUFNLElBQU4sSUFBYyxFQUFkLEVBZFY7d0JBY2lDLEVBQUEsR0FBSyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsSUFBQSxHQUFPLEVBQVIsQ0FBSDs7QUFkN0MsMkJBZVUsQ0FBQSxFQUFBLElBQU0sSUFBTixJQUFNLElBQU4sSUFBYyxFQUFkLEVBZlY7d0JBZWlDLEVBQUEsR0FBSyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsQ0FBQSxHQUFFLElBQUYsR0FBUyxFQUFWLENBQUg7O0FBZjdDLDJCQWdCUyxDQUFBLEdBQUEsSUFBTyxJQUFQLElBQU8sSUFBUCxJQUFlLEdBQWYsRUFoQlQ7d0JBZ0JpQyxFQUFBLEdBQUssTUFBTyxDQUFBLEdBQUEsR0FBRyxDQUFDLENBQUEsR0FBRSxJQUFGLEdBQVMsR0FBVixDQUFIOztBQWhCN0MseUJBaUJTLElBQUEsS0FBUSxFQWpCakI7d0JBaUJpQyxRQUFBLENBQVMsY0FBVDtBQUF4QjtBQWpCVCx5QkFrQlMsSUFBQSxLQUFRLEVBbEJqQjt3QkFtQlEsUUFBQSxDQUFTLGtCQUFUO3dCQUNBLFFBQUEsQ0FBUyxhQUFUO0FBcEJSO2dCQXFCQSxJQUFTLElBQUEsS0FBUyxFQUFULElBQUEsSUFBQSxLQUFhLEVBQXRCO0FBQUEsMEJBQUE7O0FBdkJKO21CQXdCQTtRQTVCTztRQThCWCxNQUFBLEdBQVM7WUFDTDtnQkFBQyxPQUFBLEVBQVMsUUFBVjtnQkFBd0MsR0FBQSxFQUFLLEVBQTdDO2FBREssRUFFTDtnQkFBQyxPQUFBLEVBQVMsZ0JBQVY7Z0JBQXdDLEdBQUEsRUFBSyxFQUE3QzthQUZLLEVBR0w7Z0JBQUMsT0FBQSxFQUFTLDJCQUFWO2dCQUF3QyxHQUFBLEVBQUssUUFBN0M7YUFISyxFQUlMO2dCQUFDLE9BQUEsRUFBUyxvQkFBVjtnQkFBd0MsR0FBQSxFQUFLLEVBQTdDO2FBSkssRUFLTDtnQkFBQyxPQUFBLEVBQVMsbUJBQVY7Z0JBQXdDLEdBQUEsRUFBSyxPQUE3QzthQUxLOztRQVFULE9BQUEsR0FBVSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLE9BQUQsRUFBVSxDQUFWO2dCQUNOLElBQVUsQ0FBQSxHQUFJLFdBQUosSUFBb0IsU0FBOUI7QUFBQSwyQkFBQTs7Z0JBQ0EsU0FBQSxHQUFZO3VCQUNaLEtBQUMsQ0FBQSxLQUFELEdBQVMsS0FBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsT0FBTyxDQUFDLE9BQXZCLEVBQWdDLE9BQU8sQ0FBQyxHQUF4QztZQUhIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtBQUtWO2VBQU0sQ0FBQyxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFqQixDQUFBLEdBQTJCLENBQWpDO0FBQ0ksaUJBQUEsZ0RBQUE7O2dCQUFBLE9BQUEsQ0FBUSxPQUFSLEVBQWlCLENBQWpCO0FBQUE7WUFDQSxJQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxLQUFpQixNQUExQjtBQUFBLHNCQUFBO2FBQUEsTUFBQTtzQ0FBQTs7UUFGSixDQUFBOztJQWxGTTs7Ozs7O0FBc0ZkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMjI1xuXG4jIGJhc2VkIG9uIGNvZGUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcmJ1cm5zL2Fuc2ktdG8taHRtbFxuXG57IF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5TVFlMRVMgPVxuICAgIGYwOiAgJ2NvbG9yOiMwMDAnICMgbm9ybWFsIGludGVuc2l0eVxuICAgIGYxOiAgJ2NvbG9yOiNGMDAnXG4gICAgZjI6ICAnY29sb3I6IzBEMCdcbiAgICBmMzogICdjb2xvcjojREQwJ1xuICAgIGY0OiAgJ2NvbG9yOiMwMEYnXG4gICAgZjU6ICAnY29sb3I6I0QwRCdcbiAgICBmNjogICdjb2xvcjojMEREJ1xuICAgIGY3OiAgJ2NvbG9yOiNBQUEnXG4gICAgZjg6ICAnY29sb3I6IzU1NScgIyBoaWdoIGludGVuc2l0eVxuICAgIGY5OiAgJ2NvbG9yOiNGNTUnXG4gICAgZjEwOiAnY29sb3I6IzVGNSdcbiAgICBmMTE6ICdjb2xvcjojRkY1J1xuICAgIGYxMjogJ2NvbG9yOiM1NUYnXG4gICAgZjEzOiAnY29sb3I6I0Y1RidcbiAgICBmMTQ6ICdjb2xvcjojNUZGJ1xuICAgIGYxNTogJ2NvbG9yOiNGRkYnXG4gICAgYjA6ICAnYmFja2dyb3VuZC1jb2xvcjojMDAwJyAjIG5vcm1hbCBpbnRlbnNpdHlcbiAgICBiMTogICdiYWNrZ3JvdW5kLWNvbG9yOiNBMDAnXG4gICAgYjI6ICAnYmFja2dyb3VuZC1jb2xvcjojMEEwJ1xuICAgIGIzOiAgJ2JhY2tncm91bmQtY29sb3I6I0E1MCdcbiAgICBiNDogICdiYWNrZ3JvdW5kLWNvbG9yOiMwMEEnXG4gICAgYjU6ICAnYmFja2dyb3VuZC1jb2xvcjojQTBBJ1xuICAgIGI2OiAgJ2JhY2tncm91bmQtY29sb3I6IzBBQSdcbiAgICBiNzogICdiYWNrZ3JvdW5kLWNvbG9yOiNBQUEnXG4gICAgYjg6ICAnYmFja2dyb3VuZC1jb2xvcjojNTU1JyAjIGhpZ2ggaW50ZW5zaXR5XG4gICAgYjk6ICAnYmFja2dyb3VuZC1jb2xvcjojRjU1J1xuICAgIGIxMDogJ2JhY2tncm91bmQtY29sb3I6IzVGNSdcbiAgICBiMTE6ICdiYWNrZ3JvdW5kLWNvbG9yOiNGRjUnXG4gICAgYjEyOiAnYmFja2dyb3VuZC1jb2xvcjojNTVGJ1xuICAgIGIxMzogJ2JhY2tncm91bmQtY29sb3I6I0Y1RidcbiAgICBiMTQ6ICdiYWNrZ3JvdW5kLWNvbG9yOiM1RkYnXG4gICAgYjE1OiAnYmFja2dyb3VuZC1jb2xvcjojRkZGJ1xuXG50b0hleFN0cmluZyA9IChudW0pIC0+XG4gICAgbnVtID0gbnVtLnRvU3RyaW5nKDE2KVxuICAgIHdoaWxlIG51bS5sZW5ndGggPCAyIHRoZW4gbnVtID0gXCIwI3tudW19XCJcbiAgICBudW1cblxuWzAuLjVdLmZvckVhY2ggKHJlZCkgLT5cbiAgICBbMC4uNV0uZm9yRWFjaCAoZ3JlZW4pIC0+XG4gICAgICAgIFswLi41XS5mb3JFYWNoIChibHVlKSAtPlxuICAgICAgICAgICAgYyA9IDE2ICsgKHJlZCAqIDM2KSArIChncmVlbiAqIDYpICsgYmx1ZVxuICAgICAgICAgICAgciA9IGlmIHJlZCAgID4gMCB0aGVuIHJlZCAgICogNDAgKyA1NSBlbHNlIDBcbiAgICAgICAgICAgIGcgPSBpZiBncmVlbiA+IDAgdGhlbiBncmVlbiAqIDQwICsgNTUgZWxzZSAwXG4gICAgICAgICAgICBiID0gaWYgYmx1ZSAgPiAwIHRoZW4gYmx1ZSAgKiA0MCArIDU1IGVsc2UgMCAgICAgICAgICAgIFxuICAgICAgICAgICAgcmdiID0gKHRvSGV4U3RyaW5nKG4pIGZvciBuIGluIFtyLCBnLCBiXSkuam9pbignJylcbiAgICAgICAgICAgIFNUWUxFU1tcImYje2N9XCJdID0gXCJjb2xvcjojI3tyZ2J9XCJcbiAgICAgICAgICAgIFNUWUxFU1tcImIje2N9XCJdID0gXCJiYWNrZ3JvdW5kLWNvbG9yOiMje3JnYn1cIlxuXG5bMC4uMjNdLmZvckVhY2ggKGdyYXkpIC0+XG4gICAgYyA9IGdyYXkrMjMyXG4gICAgbCA9IHRvSGV4U3RyaW5nKGdyYXkqMTAgKyA4KVxuICAgIFNUWUxFU1tcImYje2N9XCJdID0gXCJjb2xvcjojI3tsfSN7bH0je2x9XCJcbiAgICBTVFlMRVNbXCJiI3tjfVwiXSA9IFwiYmFja2dyb3VuZC1jb2xvcjojI3tsfSN7bH0je2x9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuXG5jbGFzcyBBbnNpRGlzc1xuICAgIFxuICAgIEBhbnNpMmh0bWw6IChzKSAtPiBcbiAgICBcbiAgICAgICAgYW5kaSA9IG5ldyBBbnNpRGlzcygpXG4gICAgICAgIGxpbmVzID0gW11cbiAgICAgICAgZm9yIGwgaW4gcz8uc3BsaXQoJ1xcbicpID8gW11cbiAgICAgICAgICAgIGRpc3MgPSBhbmRpLmRpc3NlY3QobClbMV1cbiAgICAgICAgICAgIGh0bWxMaW5lID0gJydcbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uZGlzcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgZCA9IGRpc3NbaV1cbiAgICAgICAgICAgICAgICBzcGFuID0gZC5zdHlsIGFuZCBcIjxzcGFuIHN0eWxlPVxcXCIje2Quc3R5bH1cXFwiPiN7ZC5tYXRjaH08L3NwYW4+XCIgb3IgZC5tYXRjaFxuICAgICAgICAgICAgICAgIGlmIHBhcnNlSW50IGlcbiAgICAgICAgICAgICAgICAgICAgaWYgZGlzc1tpLTFdLnN0YXJ0ICsgZGlzc1tpLTFdLm1hdGNoLmxlbmd0aCA8IGQuc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxMaW5lICs9ICcgJ1xuICAgICAgICAgICAgICAgIGh0bWxMaW5lICs9IHNwYW5cbiAgICAgICAgICAgIGxpbmVzLnB1c2ggaHRtbExpbmVcbiAgICAgICAgbGluZXMuam9pbiAnXFxuJ1xuICAgICAgICBcbiAgICBkaXNzZWN0OiAoQGlucHV0KSAtPlxuICAgICAgICBcbiAgICAgICAgQGRpc3MgID0gW11cbiAgICAgICAgQHRleHQgID0gXCJcIlxuICAgICAgICBAdG9rZW5pemUoKVxuICAgICAgICBbQHRleHQsIEBkaXNzXVxuXG4gICAgdG9rZW5pemU6ICgpIC0+XG4gICAgICAgIFxuICAgICAgICBzdGFydCAgICAgICA9IDBcbiAgICAgICAgYW5zaUhhbmRsZXIgPSAyXG4gICAgICAgIGFuc2lNYXRjaCAgID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGZnID0gYmcgPSAnJ1xuICAgICAgICBzdCA9IFtdXG5cbiAgICAgICAgcmVzZXRTdHlsZSA9ICgpIC0+XG4gICAgICAgICAgICBmZyA9ICcnXG4gICAgICAgICAgICBiZyA9ICcnXG4gICAgICAgICAgICBzdCA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgYWRkU3R5bGUgPSAoc3R5bGUpIC0+IHN0LnB1c2ggc3R5bGUgaWYgc3R5bGUgbm90IGluIHN0XG4gICAgICAgIGRlbFN0eWxlID0gKHN0eWxlKSAtPiBfLnB1bGwgc3QsIHN0eWxlXG4gICAgICAgIFxuICAgICAgICBhZGRUZXh0ID0gKHQpID0+XG4gICAgICAgICAgICBAdGV4dCArPSB0XG4gICAgICAgICAgICB0eHQgPSBAdGV4dC5zbGljZSBzdGFydFxuICAgICAgICAgICAgbWF0Y2ggPSB0eHQudHJpbSgpXG4gICAgICAgICAgICBpZiBtYXRjaC5sZW5ndGhcbiAgICAgICAgICAgICAgICBzdHlsZSA9ICcnXG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gZmcgKyAnOycgICAgaWYgZmcubGVuZ3RoXG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gYmcgKyAnOycgICAgaWYgYmcubGVuZ3RoXG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gc3Quam9pbiAnOycgaWYgc3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgQGRpc3MucHVzaFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0ICsgdHh0LnNlYXJjaCAvW15cXHNdL1xuICAgICAgICAgICAgICAgICAgICBzdHlsOiAgc3R5bGVcbiAgICAgICAgICAgIHN0YXJ0ID0gQHRleHQubGVuZ3RoXG4gICAgICAgICAgICAnJ1xuICAgICAgICBcbiAgICAgICAgdG9IaWdoSW50ZW5zaXR5ID0gKGMpIC0+XG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uN11cbiAgICAgICAgICAgICAgICBpZiBjID09IFNUWUxFU1tcImYje2l9XCJdXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTVFlMRVNbXCJmI3s4K2l9XCJdXG4gICAgICAgICAgICBjXG4gICAgICAgIFxuICAgICAgICBhbnNpQ29kZSA9IChtLCBjKSAtPlxuICAgICAgICAgICAgYW5zaU1hdGNoID0gdHJ1ZVxuICAgICAgICAgICAgYyA9ICcwJyBpZiBjLnRyaW0oKS5sZW5ndGggaXMgMCAgICAgICAgICAgIFxuICAgICAgICAgICAgY3MgPSBjLnRyaW1SaWdodCgnOycpLnNwbGl0KCc7JykgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBjb2RlIGluIGNzXG4gICAgICAgICAgICAgICAgY29kZSA9IHBhcnNlSW50IGNvZGUsIDEwXG4gICAgICAgICAgICAgICAgc3dpdGNoIFxuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgMCAgICAgICAgICB0aGVuIHJlc2V0U3R5bGUoKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgMSAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFN0eWxlICdmb250LXdlaWdodDpib2xkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZmcgPSB0b0hpZ2hJbnRlbnNpdHkgZmdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDIgICAgICAgICAgdGhlbiBhZGRTdHlsZSAnb3BhY2l0eTowLjUnXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyA0ICAgICAgICAgIHRoZW4gYWRkU3R5bGUgJ3RleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmUnXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyA4ICAgICAgICAgIHRoZW4gYWRkU3R5bGUgJ2Rpc3BsYXk6bm9uZSdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDkgICAgICAgICAgdGhlbiBhZGRTdHlsZSAndGV4dC1kZWNvcmF0aW9uOmxpbmUtdGhyb3VnaCdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDM5ICAgICAgICAgdGhlbiBmZyA9IFNUWUxFU1tcImYxNVwiXSAjIGRlZmF1bHQgZm9yZWdyb3VuZFxuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgNDkgICAgICAgICB0aGVuIGJnID0gU1RZTEVTW1wiYjBcIl0gICMgZGVmYXVsdCBiYWNrZ3JvdW5kXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAzOCAgICAgICAgIHRoZW4gZmcgPSBTVFlMRVNbXCJmI3tjc1syXX1cIl0gIyBleHRlbmRlZCBmZyAzODs1O1swLTI1NV1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDQ4ICAgICAgICAgdGhlbiBiZyA9IFNUWUxFU1tcImIje2NzWzJdfVwiXSAjIGV4dGVuZGVkIGJnIDQ4OzU7WzAtMjU1XVxuICAgICAgICAgICAgICAgICAgICB3aGVuICAzMCA8PSBjb2RlIDw9IDM3ICB0aGVuIGZnID0gU1RZTEVTW1wiZiN7Y29kZSAtIDMwfVwiXSAjIG5vcm1hbCBpbnRlbnNpdHlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAgNDAgPD0gY29kZSA8PSA0NyAgdGhlbiBiZyA9IFNUWUxFU1tcImIje2NvZGUgLSA0MH1cIl1cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAgOTAgPD0gY29kZSA8PSA5NyAgdGhlbiBmZyA9IFNUWUxFU1tcImYjezgrY29kZSAtIDkwfVwiXSAgIyBoaWdoIGludGVuc2l0eVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEwMCA8PSBjb2RlIDw9IDEwNyB0aGVuIGJnID0gU1RZTEVTW1wiYiN7OCtjb2RlIC0gMTAwfVwiXVxuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgMjggICAgICAgICB0aGVuIGRlbFN0eWxlICdkaXNwbGF5Om5vbmUnXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAyMiAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsU3R5bGUgJ2ZvbnQtd2VpZ2h0OmJvbGQnXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxTdHlsZSAnb3BhY2l0eTowLjUnXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgY29kZSBpbiBbMzgsIDQ4XVxuICAgICAgICAgICAgJydcbiAgICAgICAgICAgIFxuICAgICAgICB0b2tlbnMgPSBbXG4gICAgICAgICAgICB7cGF0dGVybjogL15cXHgwOCsvLCAgICAgICAgICAgICAgICAgICAgIHN1YjogJyd9XG4gICAgICAgICAgICB7cGF0dGVybjogL15cXHgxYlxcW1swMTJdP0svLCAgICAgICAgICAgICBzdWI6ICcnfVxuICAgICAgICAgICAge3BhdHRlcm46IC9eXFx4MWJcXFsoKD86XFxkezEsM307PykrfCltLywgIHN1YjogYW5zaUNvZGV9IFxuICAgICAgICAgICAge3BhdHRlcm46IC9eXFx4MWJcXFs/W1xcZDtdezAsM30vLCAgICAgICAgIHN1YjogJyd9XG4gICAgICAgICAgICB7cGF0dGVybjogL14oW15cXHgxYlxceDA4XFxuXSspLywgICAgICAgICAgc3ViOiBhZGRUZXh0fVxuICAgICAgICAgXVxuXG4gICAgICAgIHByb2Nlc3MgPSAoaGFuZGxlciwgaSkgPT5cbiAgICAgICAgICAgIHJldHVybiBpZiBpID4gYW5zaUhhbmRsZXIgYW5kIGFuc2lNYXRjaCAjIGdpdmUgYW5zaUhhbmRsZXIgYW5vdGhlciBjaGFuY2UgaWYgaXQgbWF0Y2hlc1xuICAgICAgICAgICAgYW5zaU1hdGNoID0gZmFsc2VcbiAgICAgICAgICAgIEBpbnB1dCA9IEBpbnB1dC5yZXBsYWNlIGhhbmRsZXIucGF0dGVybiwgaGFuZGxlci5zdWJcblxuICAgICAgICB3aGlsZSAobGVuZ3RoID0gQGlucHV0Lmxlbmd0aCkgPiAwXG4gICAgICAgICAgICBwcm9jZXNzKGhhbmRsZXIsIGkpIGZvciBoYW5kbGVyLCBpIGluIHRva2Vuc1xuICAgICAgICAgICAgYnJlYWsgaWYgQGlucHV0Lmxlbmd0aCA9PSBsZW5ndGhcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbnNpRGlzc1xuXG4iXX0=
//# sourceURL=../coffee/ansidiss.coffee