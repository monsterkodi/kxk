###
000       0000000    0000000     
000      000   000  000          
000      000   000  000  0000    
000      000   000  000   000    
0000000   0000000    0000000     
###

post    = require './ppost'
str     = require './str'
os      = require 'os'
fs      = require 'fs'
_       = require 'lodash'
noon    = require 'noon'
sutil   = require 'stack-utils'
sorcery = require 'sorcery'

stack   = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

# 00000000  000  000      00000000  
# 000       000  000      000       
# 000000    000  000      0000000   
# 000       000  000      000       
# 000       000  0000000  00000000  

fileLog = (info) ->
    
    try
        slash     = require './slash'
        stream    = fs.createWriteStream slash.resolve(slog.logFile), flags:'a', encoding: 'utf8'
        info.id   = slog.id
        info.icon = slog.icon
        info.type = slog.type
        stream.write noon.stringify(info)+'\n'
        stream.end()
    catch err
        console.log "fileLog error -- ", err.stack
        slog.file = false

#  0000000  000       0000000    0000000   
# 000       000      000   000  000        
# 0000000   000      000   000  000  0000  
#      000  000      000   000  000   000  
# 0000000   0000000   0000000    0000000   

slog = (s) ->
    
    slash = require './slash'
    
    try # fancy log with source-mapped files and line numbers
        f = stack.capture()[slog.depth]
        if chain = sorcery.loadSync(f.getFileName())
            info = chain.trace(f.getLineNumber(), 0)
            if not slash.samePath f.getScriptNameOrSourceURL(), f.getFileName()
                if slash.isAbsolute f.getScriptNameOrSourceURL()
                    source = slash.path f.getScriptNameOrSourceURL()
                else
                    source = slash.resolve slash.join slash.dir(f.getFileName()), f.getScriptNameOrSourceURL()
            else
                source = f.getFileName()
            info.source = slash.tilde source
        else
            info = source: slash.tilde(f.getFileName()), line: f.getLineNumber()

        file = _.padStart "#{info.source}:#{info.line}", slog.filepad
        meth = _.padEnd f.getFunctionName(), slog.methpad
        info.str = s
        s = "#{file}#{slog.filesep}#{meth}#{slog.methsep}#{s}"
        post.emit 'slog', s, info
        if slog.file
            fileLog info            
            
    catch err
        post.emit 'slog', "!#{slog.methsep}#{s} #{err}"

# 000       0000000    0000000   
# 000      000   000  000        
# 000      000   000  000  0000  
# 000      000   000  000   000  
# 0000000   0000000    0000000   

log = ->
    
    s = (str(s) for s in [].slice.call arguments, 0).join " " 
    
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
else
    slog.logFile = '~/Library/Application Support/klog.txt'

slog.id      = '???'
slog.type    = if process.type == 'renderer' then 'win' else 'main'
slog.icon    = if process.type == 'renderer' then '●' else '◼'
slog.depth   = 2
slog.filesep = ' > ' #' ⦿ '
slog.methsep = ' >> ' #' ▸ '
slog.filepad = 30
slog.methpad = 15

log.slog     = slog
log.flog     = fileLog

try
    electron = require 'electron'
    if process.type == 'renderer'
        app = electron.remote.app
    else
        app = electron.app
    slog.id = app.getName()
    slash = require './slash'
    slog.logFile = slash.join app.getPath('appData'), 'klog.txt'
catch err
    try
        slash = require './slash'
        if process.argv[0].length and slash.base(process.argv[0]) in ['node', 'coffee']
            if process.argv[1]?.length
                slog.id = slash.base process.argv[1]
        else
            console.log "can't figure out slog.id -- process.argv:", process.argv.join ' '
    catch err
        null

module.exports = log

