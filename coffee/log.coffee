###
00       0000000    0000000 
00      000   000  000      
00      000   000  000  0000
00      000   000  000   000
000000   0000000    0000000 
###

post    = require './ppost' 
str     = require './str'
os      = require 'os'
fs      = require 'fs'
_       = require 'lodash'
sutil   = require 'stack-utils'
sorcery = require 'sorcery'

stack   = new sutil cwd: process.cwd(), internals: sutil.nodeInternals()

slog = (s) ->
    
    slash = require './slash'
    
    try # fancy log with source-mapped files and line numbers
        f = stack.capture()[slog.depth]
        if chain = sorcery.loadSync(f.getFileName())
            info   = chain.trace(f.getLineNumber(), 0)
            source = f.getFileName()
            if not slash.samePath f.getScriptNameOrSourceURL(), f.getFileName()
                source = slash.path f.getScriptNameOrSourceURL()
            else
                sourceText = fs.readFileSync f.getFileName(), 'utf8'
                # balancer is broken. below is not a comment. should handle escaped hash signs. 
                match  = sourceText.match /\/\/\# sourceURL=(.+)$/
                if match?[1]?
                    source = match?[1]
            info.source = slash.tilde source
        else
            info = source: slash.tilde(f.getFileName()), line: f.getLineNumber()

        file = _.padStart "#{info.source}:#{info.line}", slog.filepad
        meth = _.padEnd f.getFunctionName(), slog.methpad
        s = "#{file}#{slog.filesep}#{meth}#{slog.methsep}#{s}"
        post.emit 'slog', s 
    catch err
        post.emit 'slog', "!#{slog.methsep}#{s} #{err}"

log = ->
    
    s = (str(s) for s in [].slice.call arguments, 0).join " " 
    
    post.emit 'log', s
    console.log s
    slog s

slog.depth = 2
slog.filesep = ' > ' #' ⦿ '
slog.methsep = ' >> ' #' ▸ '
slog.filepad = 30
slog.methpad = 15
log.slog = slog

module.exports = log

