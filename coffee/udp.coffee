###
000   000  0000000    00000000   
000   000  000   000  000   000  
000   000  000   000  00000000   
000   000  000   000  000        
 0000000   0000000    000        
###

dgram = require 'dgram'

class udp

    constructor: (@opt) ->
                
        @opt ?= {}
        @opt.port ?= 9669
        
        log = if @opt.debug then console.log else ->
            
        try
            @port = dgram.createSocket 'udp4'
                        
            if @opt.onMsg
                
                log 'receiver', @opt
                
                @port.on 'listening', => 
                    try
                        log 'listening', @port.address().address, @port.address().port
                        @port.setBroadcast true
                        @port.setRecvBufferSize 2000000
                        log 'req size',  @port.getRecvBufferSize()
                        
                    catch err
                        log "[ERROR] can't listen:", err
                        
                @port.on 'message', (message, rinfo) =>
                    @port.setSendBufferSize 2000000
                    log 'send size', @port.getSendBufferSize()
                    messageString = message.toString()
                    log 'messageString', messageString
                    try
                        msg = JSON.parse messageString
                    catch err
                        log 'conversion error', err
                        return
                    log 'message', rinfo.address, rinfo.port, msg
                    @opt.onMsg msg
                    
                @port.on 'error', (err) =>
                    log '[ERROR] port error', err
                    
                @port.bind @opt.port
                
            else
                
                log 'sender', @opt
                
                @port.bind => 
                    log 'sender bind', @port?.address().port
                    @port?.setBroadcast true
        catch err
            @port = null
            log "[ERROR] can't create udp port:", err
                
    send: (args...) ->
        
        return if not @port
        
        log = if @opt.debug then console.log else ->
            
        if args.length > 1
            msg = JSON.stringify args
        else
            msg = JSON.stringify args[0]
            
        buf = new Buffer msg
        
        log "sending #{buf.length} bytes"
        
        if buf.length > @port.getSendBufferSize()
            log "msg too large! #{buf.length} #{@port.getSendBufferSize()}"
        
        @port.send buf, 0, buf.length, @opt.port, '127.0.0.1', ->
            log 'sent', msg
            
    close: ->
        
        @port?.close()
        @port = null

module.exports = udp
    