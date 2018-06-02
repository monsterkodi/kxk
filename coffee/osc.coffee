###
 0000000    0000000   0000000
000   000  000       000     
000   000  0000000   000     
000   000       000  000     
 0000000   0000000    0000000
###

log = console.log
OSC = require 'osc-js' 

class Server

    constructor: (@cb, @channel='/log', port=9669) ->
        
        @osc = new OSC plugin: new OSC.DatagramPlugin open: host:'localhost', port:port
        @osc.open()
        @osc.on @channel, @onMessage
        
    onMessage: (msg) => 
        
        @cb @channel, JSON.parse msg.args[0]
        
class Client
    
    constructor: (@channel='/log', port=9669) ->
        
        @msgs = []
        
        @osc = new OSC plugin: new OSC.DatagramPlugin send: host:'localhost', port:port
        @osc.open()
        @osc.on 'open', => 
            for msg in @msgs
                @osc.send new OSC.Message @channel, msg
        
    send: (args...) ->
        
        if @osc.status()
            @osc.send new OSC.Message @channel, JSON.stringify args
        else
            @msgs.push JSON.stringify args

module.exports = 
    
    Server:Server
    Client:Client
