// monsterkodi/kode 0.210.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var STYLES, toHexString, _

_ = require('./kxk')._

STYLES = {f0:'color:#000',f1:'color:#F00',f2:'color:#0D0',f3:'color:#DD0',f4:'color:#00F',f5:'color:#D0D',f6:'color:#0DD',f7:'color:#AAA',f8:'color:#555',f9:'color:#F55',f10:'color:#5F5',f11:'color:#FF5',f12:'color:#55F',f13:'color:#F5F',f14:'color:#5FF',f15:'color:#FFF',b0:'background-color:#000',b1:'background-color:#A00',b2:'background-color:#0A0',b3:'background-color:#A50',b4:'background-color:#00A',b5:'background-color:#A0A',b6:'background-color:#0AA',b7:'background-color:#AAA',b8:'background-color:#555',b9:'background-color:#F55',b10:'background-color:#5F5',b11:'background-color:#FF5',b12:'background-color:#55F',b13:'background-color:#F5F',b14:'background-color:#5FF',b15:'background-color:#FFF'}

toHexString = function (num)
{
    num = num.toString(16)
    while (num.length < 2)
    {
        num = `0${num}`
    }
    return num
}
;[0,1,2,3,4,5].forEach(function (red)
{
    return [0,1,2,3,4,5].forEach(function (green)
    {
        return [0,1,2,3,4,5].forEach(function (blue)
        {
            var b, c, g, n, r, rgb

            c = 16 + (red * 36) + (green * 6) + blue
            r = red > 0 ? red * 40 + 55 : 0
            g = green > 0 ? green * 40 + 55 : 0
            b = blue > 0 ? blue * 40 + 55 : 0
            rgb = (function () { var result = []; var list = [r,g,b]; for (var _59_40_ = 0; _59_40_ < list.length; _59_40_++)  { n = list[_59_40_];result.push(toHexString(n))  } return result }).bind(this)().join('')
            STYLES[`f${c}`] = `color:#${rgb}`
            return STYLES[`b${c}`] = `background-color:#${rgb}`
        })
    })
})
;(function() { var r = []; for (var i = 0; i <= 23; i++){ r.push(i); } return r; }).apply(this).forEach(function (gray)
{
    var c, l

    c = gray + 232
    l = toHexString(gray * 10 + 8)
    STYLES[`f${c}`] = `color:#${l}${l}${l}`
    return STYLES[`b${c}`] = `background-color:#${l}${l}${l}`
})
class AnsiDiss
{
    static ansi2html (s)
    {
        var andi, d, diss, htmlLine, i, l, lines, span, _81_32_

        andi = new AnsiDiss()
        lines = []
        var list = ((_81_32_=(s != null ? s.split('\n') : undefined)) != null ? _81_32_ : [])
        for (var _81_14_ = 0; _81_14_ < list.length; _81_14_++)
        {
            l = list[_81_14_]
            diss = andi.dissect(l)[1]
            htmlLine = ''
            for (var _84_22_ = i = 0, _84_26_ = diss.length; (_84_22_ <= _84_26_ ? i < diss.length : i > diss.length); (_84_22_ <= _84_26_ ? ++i : --i))
            {
                d = diss[i]
                span = d.styl && `<span style=\"${d.styl}\">${d.match}</span>` || d.match
                if (parseInt(i))
                {
                    if (diss[i - 1].start + diss[i - 1].match.length < d.start)
                    {
                        htmlLine += ' '
                    }
                }
                htmlLine += span
            }
            lines.push(htmlLine)
        }
        return lines.join('\n')
    }

    dissect (input)
    {
        this.input = input
    
        this.diss = []
        this.text = ""
        this.tokenize()
        return [this.text,this.diss]
    }

    tokenize ()
    {
        var addStyle, addText, ansiCode, ansiHandler, ansiMatch, bg, delStyle, fg, handler, i, length, process, resetStyle, st, start, toHighIntensity, tokens

        start = 0
        ansiHandler = 2
        ansiMatch = false
        fg = bg = ''
        st = []
        resetStyle = function ()
        {
            fg = ''
            bg = ''
            return st = []
        }
        addStyle = function (style)
        {
            if (!(_k_.in(style,st)))
            {
                return st.push(style)
            }
        }
        delStyle = function (style)
        {
            return _.pull(st,style)
        }
        addText = (function (t)
        {
            var match, style, txt

            this.text += t
            txt = this.text.slice(start)
            match = txt.trim()
            if (match.length)
            {
                style = ''
                if (fg.length)
                {
                    style += fg + ';'
                }
                if (bg.length)
                {
                    style += bg + ';'
                }
                if (st.length)
                {
                    style += st.join(';')
                }
                this.diss.push({match:match,start:start + txt.search(/[^\s]/),styl:style})
            }
            start = this.text.length
            return ''
        }).bind(this)
        toHighIntensity = function (c)
        {
            var i

            for (i = 0; i <= 7; i++)
            {
                if (c === STYLES[`f${i}`])
                {
                    return STYLES[`f${8 + i}`]
                }
            }
            return c
        }
        ansiCode = function (m, c)
        {
            var code, cs

            ansiMatch = true
            if (c.trim().length === 0)
            {
                c = '0'
            }
            cs = c.trimRight(';').split(';')
            var list = _k_.list(cs)
            for (var _144_21_ = 0; _144_21_ < list.length; _144_21_++)
            {
                code = list[_144_21_]
                code = parseInt(code,10)
                if (code === 0)
                {
                    resetStyle()
                }
                else if (code === 1)
                {
                    addStyle('font-weight:bold')
                    fg = toHighIntensity(fg)
                }
                else if (code === 2)
                {
                    addStyle('opacity:0.5')
                }
                else if (code === 4)
                {
                    addStyle('text-decoration:underline')
                }
                else if (code === 8)
                {
                    addStyle('display:none')
                }
                else if (code === 9)
                {
                    addStyle('text-decoration:line-through')
                }
                else if (code === 39)
                {
                    fg = STYLES["f15"]
                }
                else if (code === 49)
                {
                    bg = STYLES["b0"]
                }
                else if (code === 38)
                {
                    fg = STYLES[`f${cs[2]}`]
                }
                else if (code === 48)
                {
                    bg = STYLES[`b${cs[2]}`]
                }
                else if ((30 <= code && code <= 37))
                {
                    fg = STYLES[`f${code - 30}`]
                }
                else if ((40 <= code && code <= 47))
                {
                    bg = STYLES[`b${code - 40}`]
                }
                else if ((90 <= code && code <= 97))
                {
                    fg = STYLES[`f${8 + code - 90}`]
                }
                else if ((100 <= code && code <= 107))
                {
                    bg = STYLES[`b${8 + code - 100}`]
                }
                else if (code === 28)
                {
                    delStyle('display:none')
                }
                else if (code === 22)
                {
                    delStyle('font-weight:bold')
                    delStyle('opacity:0.5')
                }
                if (_k_.in(code,[38,48]))
                {
                    break
                }
            }
            return ''
        }
        tokens = [{pattern:/^\x08+/,sub:''},{pattern:/^\x1b\[[012]?K/,sub:''},{pattern:/^\x1b\[((?:\d{1,3};?)+|)m/,sub:ansiCode},{pattern:/^\x1b\[?[\d;]{0,3}/,sub:''},{pattern:/^([^\x1b\x08\n]+)/,sub:addText}]
        process = (function (handler, i)
        {
            if (i > ansiHandler && ansiMatch)
            {
                return
            }
            ansiMatch = false
            return this.input = this.input.replace(handler.pattern,handler.sub)
        }).bind(this)
        while ((length = this.input.length) > 0)
        {
            var list = _k_.list(tokens)
            for (i = 0; i < list.length; i++)
            {
                handler = list[i]
                process(handler,i)
            }
            if (this.input.length === length)
            {
                break
            }
        }
    }
}

module.exports = AnsiDiss