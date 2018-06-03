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
        
        @port = dgram.createSocket 'udp4'
        
        log = if @opt.debug then console.log else ->
        
        if @opt.onMsg
            log 'receiver', @opt
            @port.on 'listening', => 
                log 'listening', @port.address().address, @port.address().port
                @port.setBroadcast true
            @port.on 'message', (message, rinfo) =>
                msg = JSON.parse message.toString()
                log 'message', rinfo.address, rinfo.port, msg
                @opt.onMsg msg
            @port.bind @opt.port
        else
            log 'sender', @opt
            @port.bind => 
                log 'sender bind', @port.address().port
                @port.setBroadcast true
                
    send: (args...) ->
        
        log = if @opt.debug then console.log else ->
            
        if args.length > 1
            msg = JSON.stringify args
        else
            msg = JSON.stringify args[0]
        # log 'send', msg if @opt.debug
        buf = new Buffer msg
        @port.send buf, 0, buf.length, @opt.port, '255.255.255.255', ->
            log 'sent', msg

module.exports = udp
    