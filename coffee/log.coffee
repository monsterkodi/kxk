###
000   000  000       0000000    0000000     
000  000   000      000   000  000          
0000000    000      000   000  000  0000    
000  000   000      000   000  000   000    
000   000  0000000   0000000    0000000     
###

sutil   = require 'stack-utils'
stack   = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

# 00000000  000  000      00000000  
# 000       000  000      000       
# 000000    000  000      0000000   
# 000       000  000      000       
# 000       000  0000000  00000000  

infos = []

dumpInfos = ->
    
    fs     = require 'fs'
    slash  = require('./kxk').slash
    stream = fs.createWriteStream slash.resolve(slog.logFile), flags:'a', encoding: 'utf8'
    while infos.length
        info = infos.shift()
        stream.write JSON.stringify(info)+'\n'
    stream.end()

dumpImmediately = ->
    
    fs     = require 'fs'
    slash  = require('./kxk').slash
    data = ''
    while infos.length
        info = infos.shift()
        data += JSON.stringify(info)+'\n'
    fs.appendFileSync slash.resolve(slog.logFile), data, 'utf8'
    
dumpTimer = null
    
fileLog = (info) ->
    
    try
        info.id   = slog.id
        info.icon = slog.icon
        info.type = slog.type
        lines = info.str.split '\n'
        if lines.length
            for line in lines
                info.str = line
                infos.push Object.assign {}, info
                info.sep  = ''
                info.icon = ''
        else
            infos.push info
            
        # clearImmediate dumpTimer
        # dumpTimer = setImmediate dumpInfos
        
        dumpImmediately() # shell scripts need immediate dump
        
    catch err
        error "kxk.log.fileLog -- ", err.stack
        slog.file = false

#  0000000  000       0000000    0000000   
# 000       000      000   000  000        
# 0000000   000      000   000  000  0000  
#      000  000      000   000  000   000  
# 0000000   0000000   0000000    0000000   

slog = (s) ->
    
    {slash, post, kstr } = require './kxk'
    
    try # fancy log with source-mapped files and line numbers
        f = stack.capture()[slog.depth]
        sorcery = require 'sorcery'
        
        info = source: slash.tilde(f.getFileName()), line: f.getLineNumber()
        try
            if chain = sorcery.loadSync(f.getFileName())
                sorceryInfo = chain.trace(f.getLineNumber(), 0)
                if not slash.samePath f.getScriptNameOrSourceURL(), f.getFileName()
                    if slash.isAbsolute f.getScriptNameOrSourceURL()
                        source = slash.path f.getScriptNameOrSourceURL()
                    else
                        source = slash.resolve slash.join slash.dir(f.getFileName()), f.getScriptNameOrSourceURL()
                else
                    source = f.getFileName()
                sorceryInfo.source = slash.tilde source
                info = sorceryInfo
            else
        catch err
            true

        file = kstr.lpad "#{info.source}:#{info.line}", slog.filepad
        meth = kstr.rpad f.getFunctionName(), slog.methpad
        info.str = s
        s = "#{file}#{slog.filesep}#{meth}#{slog.methsep}#{s}"
        post.emit 'slog', s, info
        if slog.file
            fileLog info            
            
    catch err
        error err
        post.emit 'slog', "!#{slog.methsep}#{s} #{err}"

# 000       0000000    0000000   
# 000      000   000  000        
# 000      000   000  000  0000  
# 000      000   000  000   000  
# 0000000   0000000    0000000   

klog = ->
    
    {post, kstr} = require './kxk'
    s = (kstr(s) for s in [].slice.call arguments, 0).join " " 
    
    post.emit 'log', s
    console.log s
    slog s

#  0000000   0000000   000   000  00000000  000   0000000     
# 000       000   000  0000  000  000       000  000          
# 000       000   000  000 0 000  000000    000  000  0000    
# 000       000   000  000  0000  000       000  000   000    
#  0000000   0000000   000   000  000       000   0000000     
    
slog.file = true
if process.platform == 'win32'
    slog.logFile = '~/AppData/Roaming/klog.txt'
else if process.platform == 'darwin'
    slog.logFile = '~/Library/Application Support/klog.txt'
else
    {slash} = require './kxk'
    if slash.isFile '~/AppData/Roaming/klog.txt'
        slog.logFile = '~/AppData/Roaming/klog.txt'
    else
        slog.file = false

slog.id      = '???'
slog.type    = if process.type == 'renderer' then 'win' else 'main'
slog.icon    = if process.type == 'renderer' then '●' else '◼'
slog.depth   = 2
slog.filesep = ' > '
slog.methsep = ' >> '
slog.filepad = 30
slog.methpad = 15

klog.slog    = slog
klog.flog    = fileLog

try
    electron = require 'electron'
    if process.type == 'renderer'
        app = electron.remote.app
    else
        app = electron.app
    slog.id = app.getName()
    {slash} = require './kxk'
    slog.logFile = slash.join app.getPath('appData'), 'klog.txt'
catch err
    try
<<<<<<< HEAD
        {slash} = require './kxk'
=======
        slash = require './slash'
>>>>>>> koffee
        if process.argv[0].length and slash.base(process.argv[0]) in ['node', 'coffee', 'koffee', 'electron']
            if process.argv[1]?.length
                slog.id = slash.base process.argv[1]
        else if slash.ext(process.argv[-1]) in ['js']
            slog.id = slash.base process.argv[-1]
        else
            warn "can't figure out slog.id -- process.argv:", process.argv.join ' '
    catch err
        null
    
module.exports = klog

