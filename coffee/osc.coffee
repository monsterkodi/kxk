###
 0000000    0000000   0000000
000   000  000       000     
000   000  0000000   000     
000   000       000  000     
 0000000   0000000    0000000
###

log = console.log
OSC = require 'osc-js' 

class osc

    constructor: (@opt) ->
        
        @msgs = []
        
        @opt ?= {}
        @opt.channel ?= '/log'
        
        @osc = new OSC plugin: new OSC.DatagramPlugin
        @osc.on 'open', @onOpen
        @osc.on @opt.channel, @onMsg if @opt.onMsg
        log 'osc', opt
        @osc.open()
        
    onOpen: =>
        log 'osc open', @opt.channel if @opt.debug
        while msg = @msgs.shift()
            log 'uncache', msg if @opt.debug
            @osc.send new OSC.Message @opt.channel, msg
        
    onMsg: (msg) => 
        log 'onMsg', JSON.parse(msg.args[0]) if @opt.debug
        @opt.onMsg JSON.parse msg.args[0]
        
    send: (args...) ->
        
        if @osc.status()
            log 'send', JSON.stringify(args) if @opt.debug
            @osc.send new OSC.Message @opt.channel, JSON.stringify args
        else
            log 'cache', JSON.stringify(args) if @opt.debug
            @msgs.push JSON.stringify args

module.exports = osc
    