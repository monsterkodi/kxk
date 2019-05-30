// koffee 0.56.0

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
    f1: 'color:#E00',
    f2: 'color:#0A0',
    f3: 'color:#A50',
    f4: 'color:#00E',
    f5: 'color:#A0A',
    f6: 'color:#0AA',
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
        var diss, k, l, len, lines, ref, ref1, spans;
        diss = new AnsiDiss();
        lines = [];
        ref1 = (ref = s.split('\n')) != null ? ref : [];
        for (k = 0, len = ref1.length; k < len; k++) {
            l = ref1[k];
            spans = diss.dissect(l)[1].map(function(d) {
                return d.styl && ("<span style=\"" + d.styl + "\">" + d.match + "</span>") || d.match;
            });
            lines.push(spans.join(' '));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5zaWRpc3MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDRDQUFBO0lBQUE7O0FBVUUsSUFBTSxPQUFBLENBQVEsT0FBUjs7QUFFUixNQUFBLEdBQ0k7SUFBQSxFQUFBLEVBQUssWUFBTDtJQUNBLEVBQUEsRUFBSyxZQURMO0lBRUEsRUFBQSxFQUFLLFlBRkw7SUFHQSxFQUFBLEVBQUssWUFITDtJQUlBLEVBQUEsRUFBSyxZQUpMO0lBS0EsRUFBQSxFQUFLLFlBTEw7SUFNQSxFQUFBLEVBQUssWUFOTDtJQU9BLEVBQUEsRUFBSyxZQVBMO0lBUUEsRUFBQSxFQUFLLFlBUkw7SUFTQSxFQUFBLEVBQUssWUFUTDtJQVVBLEdBQUEsRUFBSyxZQVZMO0lBV0EsR0FBQSxFQUFLLFlBWEw7SUFZQSxHQUFBLEVBQUssWUFaTDtJQWFBLEdBQUEsRUFBSyxZQWJMO0lBY0EsR0FBQSxFQUFLLFlBZEw7SUFlQSxHQUFBLEVBQUssWUFmTDtJQWdCQSxFQUFBLEVBQUssdUJBaEJMO0lBaUJBLEVBQUEsRUFBSyx1QkFqQkw7SUFrQkEsRUFBQSxFQUFLLHVCQWxCTDtJQW1CQSxFQUFBLEVBQUssdUJBbkJMO0lBb0JBLEVBQUEsRUFBSyx1QkFwQkw7SUFxQkEsRUFBQSxFQUFLLHVCQXJCTDtJQXNCQSxFQUFBLEVBQUssdUJBdEJMO0lBdUJBLEVBQUEsRUFBSyx1QkF2Qkw7SUF3QkEsRUFBQSxFQUFLLHVCQXhCTDtJQXlCQSxFQUFBLEVBQUssdUJBekJMO0lBMEJBLEdBQUEsRUFBSyx1QkExQkw7SUEyQkEsR0FBQSxFQUFLLHVCQTNCTDtJQTRCQSxHQUFBLEVBQUssdUJBNUJMO0lBNkJBLEdBQUEsRUFBSyx1QkE3Qkw7SUE4QkEsR0FBQSxFQUFLLHVCQTlCTDtJQStCQSxHQUFBLEVBQUssdUJBL0JMOzs7QUFpQ0osV0FBQSxHQUFjLFNBQUMsR0FBRDtJQUNWLEdBQUEsR0FBTSxHQUFHLENBQUMsUUFBSixDQUFhLEVBQWI7QUFDTixXQUFNLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBbkI7UUFBMEIsR0FBQSxHQUFNLEdBQUEsR0FBSTtJQUFwQztXQUNBO0FBSFU7O0FBS2Qsa0JBQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxHQUFEO1dBQ1gsa0JBQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxLQUFEO2VBQ1gsa0JBQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxJQUFEO0FBQ1gsZ0JBQUE7WUFBQSxDQUFBLEdBQUksRUFBQSxHQUFLLENBQUMsR0FBQSxHQUFNLEVBQVAsQ0FBTCxHQUFrQixDQUFDLEtBQUEsR0FBUSxDQUFULENBQWxCLEdBQWdDO1lBQ3BDLENBQUEsR0FBTyxHQUFBLEdBQVEsQ0FBWCxHQUFrQixHQUFBLEdBQVEsRUFBUixHQUFhLEVBQS9CLEdBQXVDO1lBQzNDLENBQUEsR0FBTyxLQUFBLEdBQVEsQ0FBWCxHQUFrQixLQUFBLEdBQVEsRUFBUixHQUFhLEVBQS9CLEdBQXVDO1lBQzNDLENBQUEsR0FBTyxJQUFBLEdBQVEsQ0FBWCxHQUFrQixJQUFBLEdBQVEsRUFBUixHQUFhLEVBQS9CLEdBQXVDO1lBQzNDLEdBQUEsR0FBTTs7QUFBQztBQUFBO3FCQUFBLHFDQUFBOztpQ0FBQSxXQUFBLENBQVksQ0FBWjtBQUFBOztnQkFBRCxDQUFtQyxDQUFDLElBQXBDLENBQXlDLEVBQXpDO1lBQ04sTUFBTyxDQUFBLEdBQUEsR0FBSSxDQUFKLENBQVAsR0FBa0IsU0FBQSxHQUFVO21CQUM1QixNQUFPLENBQUEsR0FBQSxHQUFJLENBQUosQ0FBUCxHQUFrQixvQkFBQSxHQUFxQjtRQVA1QixDQUFmO0lBRFcsQ0FBZjtBQURXLENBQWY7O0FBV0E7Ozs7Y0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxJQUFEO0FBQ1osUUFBQTtJQUFBLENBQUEsR0FBSSxJQUFBLEdBQUs7SUFDVCxDQUFBLEdBQUksV0FBQSxDQUFZLElBQUEsR0FBSyxFQUFMLEdBQVUsQ0FBdEI7SUFDSixNQUFPLENBQUEsR0FBQSxHQUFJLENBQUosQ0FBUCxHQUFrQixTQUFBLEdBQVUsQ0FBVixHQUFjLENBQWQsR0FBa0I7V0FDcEMsTUFBTyxDQUFBLEdBQUEsR0FBSSxDQUFKLENBQVAsR0FBa0Isb0JBQUEsR0FBcUIsQ0FBckIsR0FBeUIsQ0FBekIsR0FBNkI7QUFKbkMsQ0FBaEI7O0FBWU07SUFFVyxrQkFBQSxHQUFBOztJQUViLFFBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxDQUFEO0FBRVIsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLFFBQUosQ0FBQTtRQUNQLEtBQUEsR0FBUTtBQUNSO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLENBQWdCLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBbkIsQ0FBdUIsU0FBQyxDQUFEO3VCQUFPLENBQUMsQ0FBQyxJQUFGLElBQVcsQ0FBQSxnQkFBQSxHQUFpQixDQUFDLENBQUMsSUFBbkIsR0FBd0IsS0FBeEIsR0FBNkIsQ0FBQyxDQUFDLEtBQS9CLEdBQXFDLFNBQXJDLENBQVgsSUFBNEQsQ0FBQyxDQUFDO1lBQXJFLENBQXZCO1lBQ1IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsQ0FBWDtBQUZKO2VBR0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO0lBUFE7O3VCQVNaLE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFBQyxJQUFDLENBQUEsUUFBRDtRQUNOLElBQUMsQ0FBQSxJQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsSUFBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLFFBQUQsQ0FBQTtlQUNBLENBQUMsSUFBQyxDQUFBLElBQUYsRUFBUSxJQUFDLENBQUEsSUFBVDtJQUpLOzt1QkFNVCxRQUFBLEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxLQUFBLEdBQWM7UUFDZCxXQUFBLEdBQWM7UUFDZCxTQUFBLEdBQWM7UUFFZCxFQUFBLEdBQUssRUFBQSxHQUFLO1FBQ1YsRUFBQSxHQUFLO1FBRUwsVUFBQSxHQUFhLFNBQUE7WUFDVCxFQUFBLEdBQUs7WUFDTCxFQUFBLEdBQUs7bUJBQ0wsRUFBQSxHQUFLO1FBSEk7UUFLYixRQUFBLEdBQVcsU0FBQyxLQUFEO1lBQVcsSUFBaUIsYUFBYSxFQUFiLEVBQUEsS0FBQSxLQUFqQjt1QkFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLEtBQVIsRUFBQTs7UUFBWDtRQUNYLFFBQUEsR0FBVyxTQUFDLEtBQUQ7bUJBQVcsQ0FBQyxDQUFDLElBQUYsQ0FBTyxFQUFQLEVBQVcsS0FBWDtRQUFYO1FBRVgsT0FBQSxHQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDtBQUNOLG9CQUFBO2dCQUFBLEtBQUMsQ0FBQSxJQUFELElBQVM7Z0JBQ1QsR0FBQSxHQUFNLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLEtBQVo7Z0JBQ04sS0FBQSxHQUFRLEdBQUcsQ0FBQyxJQUFKLENBQUE7Z0JBQ1IsSUFBRyxLQUFLLENBQUMsTUFBVDtvQkFDSSxLQUFBLEdBQVE7b0JBQ1IsSUFBd0IsRUFBRSxDQUFDLE1BQTNCO3dCQUFBLEtBQUEsSUFBUyxFQUFBLEdBQUssSUFBZDs7b0JBQ0EsSUFBd0IsRUFBRSxDQUFDLE1BQTNCO3dCQUFBLEtBQUEsSUFBUyxFQUFBLEdBQUssSUFBZDs7b0JBQ0EsSUFBd0IsRUFBRSxDQUFDLE1BQTNCO3dCQUFBLEtBQUEsSUFBUyxFQUFFLENBQUMsSUFBSCxDQUFRLEdBQVIsRUFBVDs7b0JBQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQ0k7d0JBQUEsS0FBQSxFQUFPLEtBQVA7d0JBQ0EsS0FBQSxFQUFPLEtBQUEsR0FBUSxHQUFHLENBQUMsTUFBSixDQUFXLE9BQVgsQ0FEZjt3QkFFQSxJQUFBLEVBQU8sS0FGUDtxQkFESixFQUxKOztnQkFTQSxLQUFBLEdBQVEsS0FBQyxDQUFBLElBQUksQ0FBQzt1QkFDZDtZQWRNO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtRQWdCVixlQUFBLEdBQWtCLFNBQUMsQ0FBRDtBQUNkLGdCQUFBO0FBQUEsaUJBQVMsMEJBQVQ7Z0JBQ0ksSUFBRyxDQUFBLEtBQUssTUFBTyxDQUFBLEdBQUEsR0FBSSxDQUFKLENBQWY7QUFDSSwyQkFBTyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBSCxFQURsQjs7QUFESjttQkFHQTtRQUpjO1FBTWxCLFFBQUEsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKO0FBQ1AsZ0JBQUE7WUFBQSxTQUFBLEdBQVk7WUFDWixJQUFXLENBQUMsQ0FBQyxJQUFGLENBQUEsQ0FBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBOUI7Z0JBQUEsQ0FBQSxHQUFJLElBQUo7O1lBQ0EsRUFBQSxHQUFLLENBQUMsQ0FBQyxTQUFGLENBQVksR0FBWixDQUFnQixDQUFDLEtBQWpCLENBQXVCLEdBQXZCO0FBQ0wsaUJBQUEsb0NBQUE7O2dCQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBVCxFQUFlLEVBQWY7QUFDUCx3QkFBQSxLQUFBO0FBQUEseUJBQ1MsSUFBQSxLQUFRLENBRGpCO3dCQUNpQyxVQUFBLENBQUE7QUFBeEI7QUFEVCx5QkFFUyxJQUFBLEtBQVEsQ0FGakI7d0JBR1EsUUFBQSxDQUFTLGtCQUFUO3dCQUNBLEVBQUEsR0FBSyxlQUFBLENBQWdCLEVBQWhCO0FBRko7QUFGVCx5QkFLUyxJQUFBLEtBQVEsQ0FMakI7d0JBS2lDLFFBQUEsQ0FBUyxhQUFUO0FBQXhCO0FBTFQseUJBTVMsSUFBQSxLQUFRLENBTmpCO3dCQU1pQyxRQUFBLENBQVMsMkJBQVQ7QUFBeEI7QUFOVCx5QkFPUyxJQUFBLEtBQVEsQ0FQakI7d0JBT2lDLFFBQUEsQ0FBUyxjQUFUO0FBQXhCO0FBUFQseUJBUVMsSUFBQSxLQUFRLENBUmpCO3dCQVFpQyxRQUFBLENBQVMsOEJBQVQ7QUFBeEI7QUFSVCx5QkFTUyxJQUFBLEtBQVEsRUFUakI7d0JBU2lDLEVBQUEsR0FBSyxNQUFPLENBQUEsS0FBQTtBQUFwQztBQVRULHlCQVVTLElBQUEsS0FBUSxFQVZqQjt3QkFVaUMsRUFBQSxHQUFLLE1BQU8sQ0FBQSxJQUFBO0FBQXBDO0FBVlQseUJBV1MsSUFBQSxLQUFRLEVBWGpCO3dCQVdpQyxFQUFBLEdBQUssTUFBTyxDQUFBLEdBQUEsR0FBSSxFQUFHLENBQUEsQ0FBQSxDQUFQO0FBQXBDO0FBWFQseUJBWVMsSUFBQSxLQUFRLEVBWmpCO3dCQVlpQyxFQUFBLEdBQUssTUFBTyxDQUFBLEdBQUEsR0FBSSxFQUFHLENBQUEsQ0FBQSxDQUFQO0FBQXBDO0FBWlQsMkJBYVUsQ0FBQSxFQUFBLElBQU0sSUFBTixJQUFNLElBQU4sSUFBYyxFQUFkLEVBYlY7d0JBYWlDLEVBQUEsR0FBSyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsSUFBQSxHQUFPLEVBQVIsQ0FBSDs7QUFiN0MsMkJBY1UsQ0FBQSxFQUFBLElBQU0sSUFBTixJQUFNLElBQU4sSUFBYyxFQUFkLEVBZFY7d0JBY2lDLEVBQUEsR0FBSyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsSUFBQSxHQUFPLEVBQVIsQ0FBSDs7QUFkN0MsMkJBZVUsQ0FBQSxFQUFBLElBQU0sSUFBTixJQUFNLElBQU4sSUFBYyxFQUFkLEVBZlY7d0JBZWlDLEVBQUEsR0FBSyxNQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsQ0FBQSxHQUFFLElBQUYsR0FBUyxFQUFWLENBQUg7O0FBZjdDLDJCQWdCUyxDQUFBLEdBQUEsSUFBTyxJQUFQLElBQU8sSUFBUCxJQUFlLEdBQWYsRUFoQlQ7d0JBZ0JpQyxFQUFBLEdBQUssTUFBTyxDQUFBLEdBQUEsR0FBRyxDQUFDLENBQUEsR0FBRSxJQUFGLEdBQVMsR0FBVixDQUFIOztBQWhCN0MseUJBaUJTLElBQUEsS0FBUSxFQWpCakI7d0JBaUJpQyxRQUFBLENBQVMsY0FBVDtBQUF4QjtBQWpCVCx5QkFrQlMsSUFBQSxLQUFRLEVBbEJqQjt3QkFtQlEsUUFBQSxDQUFTLGtCQUFUO3dCQUNBLFFBQUEsQ0FBUyxhQUFUO0FBcEJSO2dCQXFCQSxJQUFTLElBQUEsS0FBUyxFQUFULElBQUEsSUFBQSxLQUFhLEVBQXRCO0FBQUEsMEJBQUE7O0FBdkJKO21CQXdCQTtRQTVCTztRQThCWCxNQUFBLEdBQVM7WUFDTDtnQkFBQyxPQUFBLEVBQVMsUUFBVjtnQkFBd0MsR0FBQSxFQUFLLEVBQTdDO2FBREssRUFFTDtnQkFBQyxPQUFBLEVBQVMsZ0JBQVY7Z0JBQXdDLEdBQUEsRUFBSyxFQUE3QzthQUZLLEVBR0w7Z0JBQUMsT0FBQSxFQUFTLDJCQUFWO2dCQUF3QyxHQUFBLEVBQUssUUFBN0M7YUFISyxFQUlMO2dCQUFDLE9BQUEsRUFBUyxvQkFBVjtnQkFBd0MsR0FBQSxFQUFLLEVBQTdDO2FBSkssRUFLTDtnQkFBQyxPQUFBLEVBQVMsbUJBQVY7Z0JBQXdDLEdBQUEsRUFBSyxPQUE3QzthQUxLOztRQVFULE9BQUEsR0FBVSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLE9BQUQsRUFBVSxDQUFWO2dCQUNOLElBQVUsQ0FBQSxHQUFJLFdBQUosSUFBb0IsU0FBOUI7QUFBQSwyQkFBQTs7Z0JBQ0EsU0FBQSxHQUFZO3VCQUNaLEtBQUMsQ0FBQSxLQUFELEdBQVMsS0FBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsT0FBTyxDQUFDLE9BQXZCLEVBQWdDLE9BQU8sQ0FBQyxHQUF4QztZQUhIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtBQUtWO2VBQU0sQ0FBQyxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFqQixDQUFBLEdBQTJCLENBQWpDO0FBQ0ksaUJBQUEsZ0RBQUE7O2dCQUFBLE9BQUEsQ0FBUSxPQUFSLEVBQWlCLENBQWpCO0FBQUE7WUFDQSxJQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxLQUFpQixNQUExQjtBQUFBLHNCQUFBO2FBQUEsTUFBQTtzQ0FBQTs7UUFGSixDQUFBOztJQWxGTTs7Ozs7O0FBc0ZkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMjI1xuXG4jIGJhc2VkIG9uIGNvZGUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcmJ1cm5zL2Fuc2ktdG8taHRtbFxuXG57IF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5TVFlMRVMgPVxuICAgIGYwOiAgJ2NvbG9yOiMwMDAnICMgbm9ybWFsIGludGVuc2l0eVxuICAgIGYxOiAgJ2NvbG9yOiNFMDAnXG4gICAgZjI6ICAnY29sb3I6IzBBMCdcbiAgICBmMzogICdjb2xvcjojQTUwJ1xuICAgIGY0OiAgJ2NvbG9yOiMwMEUnXG4gICAgZjU6ICAnY29sb3I6I0EwQSdcbiAgICBmNjogICdjb2xvcjojMEFBJ1xuICAgIGY3OiAgJ2NvbG9yOiNBQUEnXG4gICAgZjg6ICAnY29sb3I6IzU1NScgIyBoaWdoIGludGVuc2l0eVxuICAgIGY5OiAgJ2NvbG9yOiNGNTUnXG4gICAgZjEwOiAnY29sb3I6IzVGNSdcbiAgICBmMTE6ICdjb2xvcjojRkY1J1xuICAgIGYxMjogJ2NvbG9yOiM1NUYnXG4gICAgZjEzOiAnY29sb3I6I0Y1RidcbiAgICBmMTQ6ICdjb2xvcjojNUZGJ1xuICAgIGYxNTogJ2NvbG9yOiNGRkYnXG4gICAgYjA6ICAnYmFja2dyb3VuZC1jb2xvcjojMDAwJyAjIG5vcm1hbCBpbnRlbnNpdHlcbiAgICBiMTogICdiYWNrZ3JvdW5kLWNvbG9yOiNBMDAnXG4gICAgYjI6ICAnYmFja2dyb3VuZC1jb2xvcjojMEEwJ1xuICAgIGIzOiAgJ2JhY2tncm91bmQtY29sb3I6I0E1MCdcbiAgICBiNDogICdiYWNrZ3JvdW5kLWNvbG9yOiMwMEEnXG4gICAgYjU6ICAnYmFja2dyb3VuZC1jb2xvcjojQTBBJ1xuICAgIGI2OiAgJ2JhY2tncm91bmQtY29sb3I6IzBBQSdcbiAgICBiNzogICdiYWNrZ3JvdW5kLWNvbG9yOiNBQUEnXG4gICAgYjg6ICAnYmFja2dyb3VuZC1jb2xvcjojNTU1JyAjIGhpZ2ggaW50ZW5zaXR5XG4gICAgYjk6ICAnYmFja2dyb3VuZC1jb2xvcjojRjU1J1xuICAgIGIxMDogJ2JhY2tncm91bmQtY29sb3I6IzVGNSdcbiAgICBiMTE6ICdiYWNrZ3JvdW5kLWNvbG9yOiNGRjUnXG4gICAgYjEyOiAnYmFja2dyb3VuZC1jb2xvcjojNTVGJ1xuICAgIGIxMzogJ2JhY2tncm91bmQtY29sb3I6I0Y1RidcbiAgICBiMTQ6ICdiYWNrZ3JvdW5kLWNvbG9yOiM1RkYnXG4gICAgYjE1OiAnYmFja2dyb3VuZC1jb2xvcjojRkZGJ1xuXG50b0hleFN0cmluZyA9IChudW0pIC0+XG4gICAgbnVtID0gbnVtLnRvU3RyaW5nKDE2KVxuICAgIHdoaWxlIG51bS5sZW5ndGggPCAyIHRoZW4gbnVtID0gXCIwI3tudW19XCJcbiAgICBudW1cblxuWzAuLjVdLmZvckVhY2ggKHJlZCkgLT5cbiAgICBbMC4uNV0uZm9yRWFjaCAoZ3JlZW4pIC0+XG4gICAgICAgIFswLi41XS5mb3JFYWNoIChibHVlKSAtPlxuICAgICAgICAgICAgYyA9IDE2ICsgKHJlZCAqIDM2KSArIChncmVlbiAqIDYpICsgYmx1ZVxuICAgICAgICAgICAgciA9IGlmIHJlZCAgID4gMCB0aGVuIHJlZCAgICogNDAgKyA1NSBlbHNlIDBcbiAgICAgICAgICAgIGcgPSBpZiBncmVlbiA+IDAgdGhlbiBncmVlbiAqIDQwICsgNTUgZWxzZSAwXG4gICAgICAgICAgICBiID0gaWYgYmx1ZSAgPiAwIHRoZW4gYmx1ZSAgKiA0MCArIDU1IGVsc2UgMCAgICAgICAgICAgIFxuICAgICAgICAgICAgcmdiID0gKHRvSGV4U3RyaW5nKG4pIGZvciBuIGluIFtyLCBnLCBiXSkuam9pbignJylcbiAgICAgICAgICAgIFNUWUxFU1tcImYje2N9XCJdID0gXCJjb2xvcjojI3tyZ2J9XCJcbiAgICAgICAgICAgIFNUWUxFU1tcImIje2N9XCJdID0gXCJiYWNrZ3JvdW5kLWNvbG9yOiMje3JnYn1cIlxuXG5bMC4uMjNdLmZvckVhY2ggKGdyYXkpIC0+XG4gICAgYyA9IGdyYXkrMjMyXG4gICAgbCA9IHRvSGV4U3RyaW5nKGdyYXkqMTAgKyA4KVxuICAgIFNUWUxFU1tcImYje2N9XCJdID0gXCJjb2xvcjojI3tsfSN7bH0je2x9XCJcbiAgICBTVFlMRVNbXCJiI3tjfVwiXSA9IFwiYmFja2dyb3VuZC1jb2xvcjojI3tsfSN7bH0je2x9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuXG5jbGFzcyBBbnNpRGlzc1xuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICAgQGFuc2kyaHRtbDogKHMpIC0+IFxuICAgIFxuICAgICAgICBkaXNzID0gbmV3IEFuc2lEaXNzKClcbiAgICAgICAgbGluZXMgPSBbXVxuICAgICAgICBmb3IgbCBpbiBzLnNwbGl0KCdcXG4nKSA/IFtdXG4gICAgICAgICAgICBzcGFucyA9IGRpc3MuZGlzc2VjdChsKVsxXS5tYXAgKGQpIC0+IGQuc3R5bCBhbmQgXCI8c3BhbiBzdHlsZT1cXFwiI3tkLnN0eWx9XFxcIj4je2QubWF0Y2h9PC9zcGFuPlwiIG9yIGQubWF0Y2hcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggc3BhbnMuam9pbiAnICdcbiAgICAgICAgbGluZXMuam9pbiAnXFxuJ1xuICAgICAgICBcbiAgICBkaXNzZWN0OiAoQGlucHV0KSAtPlxuICAgICAgICBAZGlzcyAgPSBbXVxuICAgICAgICBAdGV4dCAgPSBcIlwiXG4gICAgICAgIEB0b2tlbml6ZSgpXG4gICAgICAgIFtAdGV4dCwgQGRpc3NdXG5cbiAgICB0b2tlbml6ZTogKCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN0YXJ0ICAgICAgID0gMFxuICAgICAgICBhbnNpSGFuZGxlciA9IDJcbiAgICAgICAgYW5zaU1hdGNoICAgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgZmcgPSBiZyA9ICcnXG4gICAgICAgIHN0ID0gW11cblxuICAgICAgICByZXNldFN0eWxlID0gKCkgLT5cbiAgICAgICAgICAgIGZnID0gJydcbiAgICAgICAgICAgIGJnID0gJydcbiAgICAgICAgICAgIHN0ID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBhZGRTdHlsZSA9IChzdHlsZSkgLT4gc3QucHVzaCBzdHlsZSBpZiBzdHlsZSBub3QgaW4gc3RcbiAgICAgICAgZGVsU3R5bGUgPSAoc3R5bGUpIC0+IF8ucHVsbCBzdCwgc3R5bGVcbiAgICAgICAgXG4gICAgICAgIGFkZFRleHQgPSAodCkgPT5cbiAgICAgICAgICAgIEB0ZXh0ICs9IHRcbiAgICAgICAgICAgIHR4dCA9IEB0ZXh0LnNsaWNlIHN0YXJ0XG4gICAgICAgICAgICBtYXRjaCA9IHR4dC50cmltKClcbiAgICAgICAgICAgIGlmIG1hdGNoLmxlbmd0aFxuICAgICAgICAgICAgICAgIHN0eWxlID0gJydcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBmZyArICc7JyAgICBpZiBmZy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBiZyArICc7JyAgICBpZiBiZy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBzdC5qb2luICc7JyBpZiBzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICBAZGlzcy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiBtYXRjaFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogc3RhcnQgKyB0eHQuc2VhcmNoIC9bXlxcc10vXG4gICAgICAgICAgICAgICAgICAgIHN0eWw6ICBzdHlsZVxuICAgICAgICAgICAgc3RhcnQgPSBAdGV4dC5sZW5ndGhcbiAgICAgICAgICAgICcnXG4gICAgICAgIFxuICAgICAgICB0b0hpZ2hJbnRlbnNpdHkgPSAoYykgLT5cbiAgICAgICAgICAgIGZvciBpIGluIFswLi43XVxuICAgICAgICAgICAgICAgIGlmIGMgPT0gU1RZTEVTW1wiZiN7aX1cIl1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNUWUxFU1tcImYjezgraX1cIl1cbiAgICAgICAgICAgIGNcbiAgICAgICAgXG4gICAgICAgIGFuc2lDb2RlID0gKG0sIGMpIC0+XG4gICAgICAgICAgICBhbnNpTWF0Y2ggPSB0cnVlXG4gICAgICAgICAgICBjID0gJzAnIGlmIGMudHJpbSgpLmxlbmd0aCBpcyAwICAgICAgICAgICAgXG4gICAgICAgICAgICBjcyA9IGMudHJpbVJpZ2h0KCc7Jykuc3BsaXQoJzsnKSAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGNvZGUgaW4gY3NcbiAgICAgICAgICAgICAgICBjb2RlID0gcGFyc2VJbnQgY29kZSwgMTBcbiAgICAgICAgICAgICAgICBzd2l0Y2ggXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAwICAgICAgICAgIHRoZW4gcmVzZXRTdHlsZSgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAxICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkU3R5bGUgJ2ZvbnQtd2VpZ2h0OmJvbGQnXG4gICAgICAgICAgICAgICAgICAgICAgICBmZyA9IHRvSGlnaEludGVuc2l0eSBmZ1xuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgMiAgICAgICAgICB0aGVuIGFkZFN0eWxlICdvcGFjaXR5OjAuNSdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDQgICAgICAgICAgdGhlbiBhZGRTdHlsZSAndGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZSdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDggICAgICAgICAgdGhlbiBhZGRTdHlsZSAnZGlzcGxheTpub25lJ1xuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgOSAgICAgICAgICB0aGVuIGFkZFN0eWxlICd0ZXh0LWRlY29yYXRpb246bGluZS10aHJvdWdoJ1xuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgMzkgICAgICAgICB0aGVuIGZnID0gU1RZTEVTW1wiZjE1XCJdICMgZGVmYXVsdCBmb3JlZ3JvdW5kXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyA0OSAgICAgICAgIHRoZW4gYmcgPSBTVFlMRVNbXCJiMFwiXSAgIyBkZWZhdWx0IGJhY2tncm91bmRcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDM4ICAgICAgICAgdGhlbiBmZyA9IFNUWUxFU1tcImYje2NzWzJdfVwiXSAjIGV4dGVuZGVkIGZnIDM4OzU7WzAtMjU1XVxuICAgICAgICAgICAgICAgICAgICB3aGVuIGNvZGUgaXMgNDggICAgICAgICB0aGVuIGJnID0gU1RZTEVTW1wiYiN7Y3NbMl19XCJdICMgZXh0ZW5kZWQgYmcgNDg7NTtbMC0yNTVdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gIDMwIDw9IGNvZGUgPD0gMzcgIHRoZW4gZmcgPSBTVFlMRVNbXCJmI3tjb2RlIC0gMzB9XCJdICMgbm9ybWFsIGludGVuc2l0eVxuICAgICAgICAgICAgICAgICAgICB3aGVuICA0MCA8PSBjb2RlIDw9IDQ3ICB0aGVuIGJnID0gU1RZTEVTW1wiYiN7Y29kZSAtIDQwfVwiXVxuICAgICAgICAgICAgICAgICAgICB3aGVuICA5MCA8PSBjb2RlIDw9IDk3ICB0aGVuIGZnID0gU1RZTEVTW1wiZiN7OCtjb2RlIC0gOTB9XCJdICAjIGhpZ2ggaW50ZW5zaXR5XG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTAwIDw9IGNvZGUgPD0gMTA3IHRoZW4gYmcgPSBTVFlMRVNbXCJiI3s4K2NvZGUgLSAxMDB9XCJdXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gY29kZSBpcyAyOCAgICAgICAgIHRoZW4gZGVsU3R5bGUgJ2Rpc3BsYXk6bm9uZSdcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBjb2RlIGlzIDIyICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxTdHlsZSAnZm9udC13ZWlnaHQ6Ym9sZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbFN0eWxlICdvcGFjaXR5OjAuNSdcbiAgICAgICAgICAgICAgICBicmVhayBpZiBjb2RlIGluIFszOCwgNDhdXG4gICAgICAgICAgICAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIHRva2VucyA9IFtcbiAgICAgICAgICAgIHtwYXR0ZXJuOiAvXlxceDA4Ky8sICAgICAgICAgICAgICAgICAgICAgc3ViOiAnJ31cbiAgICAgICAgICAgIHtwYXR0ZXJuOiAvXlxceDFiXFxbWzAxMl0/Sy8sICAgICAgICAgICAgIHN1YjogJyd9XG4gICAgICAgICAgICB7cGF0dGVybjogL15cXHgxYlxcWygoPzpcXGR7MSwzfTs/KSt8KW0vLCAgc3ViOiBhbnNpQ29kZX0gXG4gICAgICAgICAgICB7cGF0dGVybjogL15cXHgxYlxcWz9bXFxkO117MCwzfS8sICAgICAgICAgc3ViOiAnJ31cbiAgICAgICAgICAgIHtwYXR0ZXJuOiAvXihbXlxceDFiXFx4MDhcXG5dKykvLCAgICAgICAgICBzdWI6IGFkZFRleHR9XG4gICAgICAgICBdXG5cbiAgICAgICAgcHJvY2VzcyA9IChoYW5kbGVyLCBpKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIGkgPiBhbnNpSGFuZGxlciBhbmQgYW5zaU1hdGNoICMgZ2l2ZSBhbnNpSGFuZGxlciBhbm90aGVyIGNoYW5jZSBpZiBpdCBtYXRjaGVzXG4gICAgICAgICAgICBhbnNpTWF0Y2ggPSBmYWxzZVxuICAgICAgICAgICAgQGlucHV0ID0gQGlucHV0LnJlcGxhY2UgaGFuZGxlci5wYXR0ZXJuLCBoYW5kbGVyLnN1YlxuXG4gICAgICAgIHdoaWxlIChsZW5ndGggPSBAaW5wdXQubGVuZ3RoKSA+IDBcbiAgICAgICAgICAgIHByb2Nlc3MoaGFuZGxlciwgaSkgZm9yIGhhbmRsZXIsIGkgaW4gdG9rZW5zXG4gICAgICAgICAgICBicmVhayBpZiBAaW5wdXQubGVuZ3RoID09IGxlbmd0aFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFuc2lEaXNzXG5cbiJdfQ==
//# sourceURL=../coffee/ansidiss.coffee