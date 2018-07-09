###
 0000000  00000000    0000000  00     00   0000000   00000000   
000       000   000  000       000   000  000   000  000   000  
0000000   0000000    000       000000000  000000000  00000000   
     000  000   000  000       000 0 000  000   000  000        
0000000   000   000   0000000  000   000  000   000  000        
###

{ fs, valid, empty, slash, log, _ } = require './kxk'

sourceMap  = require 'source-map'
mapConvert = require 'convert-source-map'

regex1     = /^\s+at\s+(\S+)\s+\((.*):(\d+):(\d+)\)/
regex2     = /^\s+at\s+(.*):(\d+):(\d+)/

# 000       0000000    0000000   00000000  00000000   00000000   
# 000      000   000  000        000       000   000  000   000  
# 000      000   000  000  0000  0000000   0000000    0000000    
# 000      000   000  000   000  000       000   000  000   000  
# 0000000   0000000    0000000   00000000  000   000  000   000  

logErr = (err, sep='💥') ->
    
    console.log errorStack err
    trace = errorTrace err
    if valid trace.lines
        log.flog str:trace.text, source:trace.lines[0].file, line:trace.lines[0].line, sep:sep
        for line in trace.lines
            sep = if slash.isAbsolute(line.file) or line.file[0]=='~' then '🐞' else '🔼'
            if sep == '🐞' or line.file[0] == '.'
                log.flog str:'       '+line.func, source:line.file, line:line.line, sep:sep
    else
        log.flog str:trace.text, source:'', line:0, sep:sep

# 00000000  000  000      00000000  00000000    0000000    0000000  
# 000       000  000      000       000   000  000   000  000       
# 000000    000  000      0000000   00000000   000   000  0000000   
# 000       000  000      000       000        000   000       000  
# 000       000  0000000  00000000  000         0000000   0000000   

filePos = (line) ->

    if match = regex1.exec line
        
        result =
            func: match[1].replace '.<anonymous>', ''
            file: match[2]
            line: match[3]
            col:  match[4]
        
        if slash.ext(result.file) == 'js'
            
            mappedLine = toCoffee result.file, result.line, result.col
            
            if mappedLine?
                result.file = mappedLine[0]
                result.line = mappedLine[1]
                result.col  = mappedLine[2]

    else if match = regex2.exec line
        
        result =
            func: slash.file match[1]
            file: match[1]
            line: match[2]
            col:  match[3]
        
        if slash.ext(result.file) == 'js'
            
            mappedLine = toCoffee result.file, result.line, result.col
            
            if mappedLine?
                result.file = mappedLine[0]
                result.line = mappedLine[1]
                result.col  = mappedLine[2]
    result

#  0000000  000000000   0000000    0000000  000   000  
# 000          000     000   000  000       000  000   
# 0000000      000     000000000  000       0000000    
#      000     000     000   000  000       000  000   
# 0000000      000     000   000   0000000  000   000  

errorStack = (err) ->
    
    lines = []
    
    for stackLine in err.stack.split '\n' 
        
        if fp = filePos stackLine
            lines.push "       #{_.padEnd fp.func, 30} #{fp.file}:#{fp.line}" 
        else
            lines.push stackLine 
  
    lines.join '\n'

# 000000000  00000000    0000000    0000000  00000000  
#    000     000   000  000   000  000       000       
#    000     0000000    000000000  000       0000000   
#    000     000   000  000   000  000       000       
#    000     000   000  000   000   0000000  00000000  

errorTrace = (err) ->
    
    lines = []
    text  = []

    console.log err.stack
    
    for stackLine in err.stack.split '\n' 
        
        if fp = filePos stackLine
            lines.push fp
        else
            text.push stackLine 
  
    lines:  lines
    text:   text.join '\n'
    
# 000000000   0000000          0000000   0000000   00000000  00000000  00000000  00000000  
#    000     000   000        000       000   000  000       000       000       000       
#    000     000   000        000       000   000  000000    000000    0000000   0000000   
#    000     000   000        000       000   000  000       000       000       000       
#    000      0000000          0000000   0000000   000       000       00000000  00000000  

toCoffee = (jsFile, jsLine, jsCol=0) ->

    jsLine = parseInt jsLine
    jsCol  = parseInt jsCol
    
    coffeeFile = slash.tilde jsFile
    coffeeLine = jsLine
    coffeeCol  = jsCol
        
    if slash.fileExists jsFile
        mapData = mapConvert.fromSource(fs.readFileSync jsFile, 'utf8')?.toObject()
        if valid mapData
            mapData.sources[0] = slash.resolve slash.join slash.dir(jsFile), mapData?.sources[0] if mapData?.sources[0]
            consumer = new sourceMap.SourceMapConsumer mapData
            if consumer.originalPositionFor
                pos = consumer.originalPositionFor line:jsLine, column:jsCol, bias:sourceMap.SourceMapConsumer.LEAST_UPPER_BOUND
                if valid(pos.line) and valid(pos.column)
                    coffeeFile = slash.tilde mapData.sources[0]
                    coffeeLine = pos.line 
                    coffeeCol  = pos.column
                else
                    log 'no pos.line', pos
            else
                log 'no consumer originalPositionFor'
        
    [coffeeFile, coffeeLine, coffeeCol]

# 000000000   0000000               000   0000000  
#    000     000   000              000  000       
#    000     000   000              000  0000000   
#    000     000   000        000   000       000  
#    000      0000000          0000000   0000000   

toJs = (coffeeFile, coffeeLine, coffeeCol=0) ->
    
    jsFile = coffeeFile.replace /\/coffee\//, '/js/'
    jsFile = jsFile.replace /\.coffee$/, '.js'
    
    if not slash.fileExists jsFile
        return [null, null, null]
        
    if not coffeeLine? then return jsFile
    
    mapData = mapConvert.fromSource(fs.readFileSync jsFile, 'utf8')?.toObject()
    if valid mapData
        mapData.sources[0] = slash.resolve slash.join slash.dir(jsFile), mapData?.sources[0] if mapData?.sources[0]
        consumer = new sourceMap.SourceMapConsumer mapData
        if consumer?.allGeneratedPositionsFor?
            poss = consumer.allGeneratedPositionsFor source:mapData.sources[0], line:coffeeLine#, column:coffeeCol
            if valid poss
                return [jsFile, poss[0]?.line, poss[0]?.column]
            else
                log 'empty poss'
        else
            log 'no allGeneratedPositionsFor in', consumer
        
    [jsFile, null, null]
        
module.exports =
    toJs:       toJs
    toCoffee:   toCoffee
    errorStack: errorStack
    errorTrace: errorTrace
    logErr:     logErr
    
    