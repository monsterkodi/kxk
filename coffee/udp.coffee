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
        
        try
            @port = dgram.createSocket 'udp4'
                        
            if @opt.onMsg
                
                @port.on 'listening', => 
                    try
                        @port.setBroadcast true
                    catch err
                        error "[ERROR] can't listen:", err
                        
                @port.on 'message', (message, rinfo) =>

                    messageString = message.toString()
                    try
                        msg = JSON.parse messageString
                    catch err
                        error 'conversion error', err
                        return
                    @opt.onMsg msg
                    
                @port.on 'error', (err) =>
                    error '[ERROR] port error', err
                    
                @port.bind @opt.port
                
            else
                @port.bind => @port?.setBroadcast true
                
        catch err
            @port = null
            error "[ERROR] can't create udp port:", err
                
    send: (args...) ->
        
        return if not @port
        
        if args.length > 1
            msg = JSON.stringify args
        else
            msg = JSON.stringify args[0]
            
        buf = Buffer.from msg, 'utf8'
        @port.send buf, 0, buf.length, @opt.port, '127.0.0.1', ->
            
    close: ->
        
        @port?.close()
        @port = null

module.exports = udp
    