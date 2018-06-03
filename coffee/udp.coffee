###
000   000  0000000    00000000   
000   000  000   000  000   000  
000   000  000   000  00000000   
000   000  000   000  000        
 0000000   0000000    000        
###

log   = console.log
dgram = require 'dgram'

class udp

    constructor: (@opt) ->
                
        @opt ?= {}
        
        @port = dgram.createSocket 'udp4'
        
        if @opt.onMsg
            log 'receiver', @opt
            @port.on 'listening', => 
                log 'listening', @port.address().address, @port.address().port if @opt.debug
                @port.setBroadcast true
            @port.on 'message', (message, rinfo) =>
                msg = JSON.parse message.toString()
                log 'message', rinfo.address, rinfo.port, msg if @opt.debug
                @opt.onMsg msg
            @port.bind 9669
        else
            log 'sender', @opt if @opt.debug
            @port.bind => 
                log 'sender bind' if @opt.debug
                @port.setBroadcast true
                
    send: (args...) ->
        
        msg = JSON.stringify args 
        # log 'send', msg if @opt.debug
        buf = new Buffer msg
        @port.send buf, 0, buf.length, 9669, '255.255.255.255', =>
            log 'sent', msg if @opt.debug

module.exports = udp
    