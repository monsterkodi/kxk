// monsterkodi/kode 0.218.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var coffeePos, decode, errorStack, errorTrace, filePos, jsPosition, klog, kodePos, kxk, logErr, readMap, regex1, regex2, sh, slash, toCoffee, toJs, toKode, _

kxk = require('./kxk')
_ = kxk._
klog = kxk.klog
sh = kxk.sh
slash = kxk.slash

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
        for (var _30_17_ = 0; _30_17_ < list.length; _30_17_++)
        {
            line = list[_30_17_]
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
                var _75_29_ = toJs(absFile,1,0); jsFile = _75_29_[0]; a = _75_29_[1]; b = _75_29_[2]

                if (slash.fileExists(jsFile))
                {
                    var _77_56_ = toCoffee(jsFile,result.line,result.col); coffeeFile = _77_56_[0]; coffeeLine = _77_56_[1]; coffeeCol = _77_56_[2]

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
    for (var _117_18_ = 0; _117_18_ < list.length; _117_18_++)
    {
        stackLine = list[_117_18_]
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
    for (var _137_18_ = 0; _137_18_ < list.length; _137_18_++)
    {
        stackLine = list[_137_18_]
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
    for (var _157_14_ = i = 0, _157_18_ = segment.length; (_157_14_ <= _157_18_ ? i < segment.length : i > segment.length); (_157_14_ <= _157_18_ ? ++i : --i))
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
    for (var _186_10_ = 0; _186_10_ < list.length; _186_10_++)
    {
        l = list[_186_10_]
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
    for (var _210_13_ = 0; _210_13_ < list.length; _210_13_++)
    {
        line = list[_210_13_]
        jsCol = 0
        if (line.length)
        {
            var list1 = _k_.list(line.split(','))
            for (var _213_24_ = 0; _213_24_ < list1.length; _213_24_++)
            {
                segment = list1[_213_24_]
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

kodePos = function (mapData, sjsLine, sjsCol)
{
    return coffeePos(mapData,sjsLine,sjsCol)
}

toCoffee = function (jsFile, jsLine, jsCol = 0)
{
    var coffeeCol, coffeeFile, coffeeLine, coPos, mapData

    jsLine = parseInt(jsLine)
    jsCol = parseInt(jsCol)
    coffeeFile = jsFile.replace(/\/js\//,'/coffee/')
    coffeeFile = coffeeFile.replace(/\.js$/,'.coffee')
    coffeeLine = jsLine
    coffeeCol = jsCol
    if (slash.fileExists(jsFile))
    {
        if (!_k_.empty((mapData = readMap(jsFile))))
        {
            coPos = coffeePos(mapData,jsLine,jsCol)
            coffeeFile = slash.tilde(slash.join(mapData.sourceRoot,mapData.sources[0]))
            coffeeLine = coPos.line
            coffeeCol = coPos.col
        }
    }
    return [coffeeFile,coffeeLine,coffeeCol]
}

toKode = function (jsFile, jsLine, jsCol = 0)
{
    var coPos, kodeCol, kodeFile, kodeLine, mapData

    jsLine = parseInt(jsLine)
    jsCol = parseInt(jsCol)
    kodeFile = jsFile.replace(/\/js\//,'/kode/')
    kodeFile = kodeFile.replace(/\.js$/,'.kode')
    kodeLine = jsLine
    kodeCol = jsCol
    if (slash.fileExists(jsFile))
    {
        if (!_k_.empty((mapData = readMap(jsFile))))
        {
            coPos = kodePos(mapData,jsLine,jsCol)
            kodeFile = slash.tilde(slash.join(mapData.sourceRoot,mapData.sources[0]))
            kodeLine = coPos.line
            kodeCol = coPos.col
        }
    }
    return [kodeFile,kodeLine,kodeCol]
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
    for (var _299_13_ = 0; _299_13_ < list.length; _299_13_++)
    {
        line = list[_299_13_]
        jsCol = 0
        if (line.length)
        {
            var list1 = _k_.list(line.split(','))
            for (var _302_24_ = 0; _302_24_ < list1.length; _302_24_++)
            {
                segment = list1[_302_24_]
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
    var jsFile, jsPos, mapData

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
    if (!_k_.empty((mapData = readMap(jsFile))))
    {
        jsPos = jsPosition(mapData,coffeeLine,coffeeCol)
        return [jsFile,jsPos.line,jsPos.col]
    }
    else
    {
        return [jsFile,null,null]
    }
}
module.exports = {toJs:toJs,toKode:toKode,toCoffee:toCoffee,errorStack:errorStack,errorTrace:errorTrace,logErr:logErr}