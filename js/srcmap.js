// monsterkodi/kode 0.190.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var coffeePos, decode, errorStack, errorTrace, filePos, jsPosition, klog, logErr, readMap, regex1, regex2, sh, slash, toCoffee, toJs, _

_ = require('./kxk')._
empty = require('./kxk').empty
klog = require('./kxk').klog
sh = require('./kxk').sh
slash = require('./kxk').slash
valid = require('./kxk').valid

regex1 = /^\s+at\s+(\S+)\s+\((.*):(\d+):(\d+)\)/
regex2 = /^\s+at\s+(.*):(\d+):(\d+)/

logErr = function (err, sep = '💥')
{
    var line, trace

    console.log(`${err}`)
    return
    trace = errorTrace(err)
    if (!_k_.empty((trace != null ? trace.lines : undefined)))
    {
        klog.flog({str:trace.text,source:trace.lines[0].file,line:trace.lines[0].line,sep:sep})
        var list = _k_.list(trace.lines)
        for (var _29_17_ = 0; _29_17_ < list.length; _29_17_++)
        {
            line = list[_29_17_]
            sep = slash.isAbsolute(line.file) || line.file[0] === '~' ? '🐞' : '🔼'
            if (sep === '🐞' || line.file[0] === '.')
            {
                klog.flog({str:'       ' + line.func,source:line.file,line:line.line,sep:sep})
            }
        }
    }
    else
    {
        return klog.flog({str:trace.text,source:'',line:0,sep:sep})
    }
}

filePos = function (line)
{
    var a, absFile, b, coffeeCol, coffeeFile, coffeeLine, jsFile, mappedLine, match, result

    if (match = regex1.exec(line))
    {
        result = {func:match[1].replace('.<anonymous>',''),file:match[2],line:match[3],col:match[4]}
        if (slash.ext(result.file) === 'js')
        {
            mappedLine = toCoffee(result.file,result.line,result.col)
            if ((mappedLine != null))
            {
                result.file = mappedLine[0]
                result.line = mappedLine[1]
                result.col = mappedLine[2]
            }
        }
        else if (false && slash.ext(result.file) === 'coffee' && !slash.isAbsolute(result.file))
        {
            absFile = slash.resolve(slash.join(process.cwd(),'coffee',result.file))
            if (slash.fileExists(absFile))
            {
                var _74_29_ = toJs(absFile,1,0) ; jsFile = _74_29_[0]                ; a = _74_29_[1]                ; b = _74_29_[2]

                if (slash.fileExists(jsFile))
                {
                    var _76_56_ = toCoffee(jsFile,result.line,result.col) ; coffeeFile = _76_56_[0]                    ; coffeeLine = _76_56_[1]                    ; coffeeCol = _76_56_[2]

                    if (slash.fileExists(coffeeFile))
                    {
                        result.file = coffeeFile
                        result.line = coffeeLine
                        result.col = coffeeCol
                    }
                }
            }
        }
    }
    else if (match = regex2.exec(line))
    {
        result = {func:slash.file(match[1]),file:match[1],line:match[2],col:match[3]}
        if (slash.ext(result.file) === 'js')
        {
            mappedLine = toCoffee(result.file,result.line,result.col)
            if ((mappedLine != null))
            {
                result.file = mappedLine[0]
                result.line = mappedLine[1]
                result.col = mappedLine[2]
            }
        }
    }
    return result
}

errorStack = function (err)
{
    var fp, lines, stackLine

    lines = []
    var list = _k_.list(err.stack.split('\n'))
    for (var _116_18_ = 0; _116_18_ < list.length; _116_18_++)
    {
        stackLine = list[_116_18_]
        if (fp = filePos(stackLine))
        {
            lines.push(`       ${_.padEnd(fp.func,30)} ${fp.file}:${fp.line}`)
        }
        else
        {
            lines.push(stackLine)
        }
    }
    return lines.join('\n')
}

errorTrace = function (err)
{
    var fp, lines, stackLine, text

    lines = []
    text = []
    var list = _k_.list(err.stack.split('\n'))
    for (var _136_18_ = 0; _136_18_ < list.length; _136_18_++)
    {
        stackLine = list[_136_18_]
        if (fp = filePos(stackLine))
        {
            lines.push(fp)
        }
        else
        {
            text.push(stackLine)
        }
    }
    return {lines:lines,text:text.join('\n')}
}

decode = function (segment)
{
    var cc, i, rc, rs, vl, vs

    rs = []
    sh = rc = 0
    for (var _156_14_ = i = 0, _156_18_ = segment.length; (_156_14_ <= _156_18_ ? i < segment.length : i > segment.length); (_156_14_ <= _156_18_ ? ++i : --i))
    {
        cc = segment.charCodeAt(i) - 65
        if (cc >= 32)
        {
            cc -= 6
        }
        if (cc === -22)
        {
            cc = 62
        }
        if (cc === -18)
        {
            cc = 63
        }
        if (cc < 0)
        {
            cc += 69
        }
        if (cc & 32)
        {
            sh += 5
            rc = cc & 0b011111
        }
        else
        {
            vl = rc + (cc << sh)
            vs = vl >> 1
            if (vl & 1)
            {
                vs = -vs
            }
            rs.push(vs)
            sh = rc = 0
        }
    }
    return rs
}

readMap = function (jsFile)
{
    var l, map, mapVar, source, url, urlVar

    source = slash.readText(jsFile)
    urlVar = '//# sourceURL='
    mapVar = '//# sourceMappingURL='
    var list = _k_.list(source.split(/\r?\n/))
    for (var _185_10_ = 0; _185_10_ < list.length; _185_10_++)
    {
        l = list[_185_10_]
        if (!url && l.startsWith(urlVar))
        {
            url = l.split(urlVar)[1]
        }
        if (!map && l.startsWith(mapVar))
        {
            map = l.split(mapVar)[1]
        }
        if (map && url)
        {
            break
        }
    }
    if (map)
    {
        map = map.slice('data:application/json;base64,'.length)
        map = Buffer.from(map,'base64').toString()
        map = JSON.parse(map)
        if (url && _k_.empty(map.sources[0]))
        {
            map.sources[0] = url
        }
    }
    return map
}

coffeePos = function (mapData, sjsLine, sjsCol)
{
    var coCol, coLine, jsCol, jsLine, line, lines, seg, segment

    lines = mapData.mappings.split(';')
    jsLine = 1
    coLine = 1
    coCol = 0
    var list = _k_.list(lines)
    for (var _209_13_ = 0; _209_13_ < list.length; _209_13_++)
    {
        line = list[_209_13_]
        jsCol = 0
        if (line.length)
        {
            var list1 = _k_.list(line.split(','))
            for (var _212_24_ = 0; _212_24_ < list1.length; _212_24_++)
            {
                segment = list1[_212_24_]
                seg = decode(segment)
                jsCol += seg[0]
                coLine += seg[2]
                coCol += seg[3]
                if (jsLine === sjsLine && jsCol >= sjsCol)
                {
                    return {line:coLine,col:coCol}
                }
            }
        }
        if (jsLine === sjsLine)
        {
            return {line:coLine,col:0}
        }
        jsLine++
    }
    return {line:0,col:0}
}

toCoffee = function (jsFile, jsLine, jsCol = 0)
{
    var coffeeCol, coffeeFile, coffeeLine, coPos

    jsLine = parseInt(jsLine)
    jsCol = parseInt(jsCol)
    coffeeFile = jsFile.replace(/\/js\//,'/coffee/')
    coffeeFile = coffeeFile.replace(/\.js$/,'.coffee')
    coffeeLine = jsLine
    coffeeCol = jsCol
    if (slash.fileExists(jsFile))
    {
        if (!_k_.empty(mapData) = readMap(jsFile))
        {
            coPos = coffeePos(mapData,jsLine,jsCol)
            coffeeFile = slash.tilde(slash.join(mapData.sourceRoot,mapData.sources[0]))
            coffeeLine = coPos.line
            coffeeCol = coPos.col
        }
    }
    return [coffeeFile,coffeeLine,coffeeCol]
}

jsPosition = function (mapData, coffeeLine, coffeeCol)
{
    var coCol, coLine, dfCol, dfLine, dfMin, jsCol, jsLine, line, lines, result, seg, segment

    lines = mapData.mappings.split(';')
    jsLine = 1
    coLine = 1
    coCol = 0
    dfMin = {line:lines.length,col:9999}
    result = {line:0,col:0}
    var list = _k_.list(lines)
    for (var _262_13_ = 0; _262_13_ < list.length; _262_13_++)
    {
        line = list[_262_13_]
        jsCol = 0
        if (line.length)
        {
            var list1 = _k_.list(line.split(','))
            for (var _265_24_ = 0; _265_24_ < list1.length; _265_24_++)
            {
                segment = list1[_265_24_]
                seg = decode(segment)
                jsCol += seg[0]
                coLine += seg[2]
                coCol += seg[3]
                dfLine = Math.abs(coffeeLine - coLine)
                dfCol = Math.abs(coffeeCol - coCol)
                if (dfLine < dfMin.line || dfLine === dfMin.line && dfCol < dfMin.col)
                {
                    dfMin = {line:dfLine,col:dfCol}
                    result = {line:jsLine,col:jsCol}
                }
            }
        }
        jsLine++
    }
    return result
}

toJs = function (coffeeFile, coffeeLine, coffeeCol = 0)
{
    var jsFile, jsPos

    jsFile = coffeeFile.replace(/\/coffee\//,'/js/')
    jsFile = jsFile.replace(/\.coffee$/,'.js')
    if (!slash.fileExists(jsFile))
    {
        return [null,null,null]
    }
    if (!(coffeeLine != null))
    {
        return [jsFile,null,null]
    }
    if (!_k_.empty(mapData) = readMap(jsFile))
    {
        jsPos = jsPosition(mapData,coffeeLine,coffeeCol)
        return [jsFile,jsPos.line,jsPos.col]
    }
    else
    {
        return [jsFile,null,null]
    }
}
module.exports = {toJs:toJs,toCoffee:toCoffee,errorStack:errorStack,errorTrace:errorTrace,logErr:logErr}