// monsterkodi/kode 0.210.0

var _k_

var dgram, udp

dgram = require('dgram')

udp = (function ()
{
    function udp (opt)
    {
        var _15_13_, _16_18_

        this.opt = opt
    
        this.opt = ((_15_13_=this.opt) != null ? _15_13_ : {})
        this.opt.port = ((_16_18_=this.opt.port) != null ? _16_18_ : 9669)
        try
        {
            this.port = dgram.createSocket('udp4')
            if (this.opt.onMsg)
            {
                this.port.on('listening',(function ()
                {
                    try
                    {
                        return this.port.setBroadcast(true)
                    }
                    catch (err)
                    {
                        console.error("[ERROR] can't listen:",err)
                    }
                }).bind(this))
                this.port.on('message',(function (message, rinfo)
                {
                    var messageString, msg

                    messageString = message.toString()
                    try
                    {
                        msg = JSON.parse(messageString)
                    }
                    catch (err)
                    {
                        console.error('conversion error',messageString,err)
                        return
                    }
                    return this.opt.onMsg(msg)
                }).bind(this))
                this.port.on('error',(function (err)
                {
                    console.error('[ERROR] port error',err)
                }).bind(this))
                this.port.bind(this.opt.port)
            }
            else
            {
                this.port.bind((function ()
                {
                    var _45_35_

                    return (this.port != null ? this.port.setBroadcast(true) : undefined)
                }).bind(this))
            }
        }
        catch (err)
        {
            this.port = null
            console.error("[ERROR] can't create udp port:",err)
        }
    }

    udp.prototype["send"] = function (...args)
    {
        var buf, msg

        if (!this.port)
        {
            return
        }
        if (args.length > 1)
        {
            msg = JSON.stringify(args)
        }
        else
        {
            msg = JSON.stringify(args[0])
        }
        buf = Buffer.from(msg,'utf8')
        return this.port.send(buf,0,buf.length,this.opt.port,'127.0.0.1',function ()
        {})
    }

    udp.prototype["close"] = function ()
    {
        var _65_13_

        ;(this.port != null ? this.port.close() : undefined)
        return this.port = null
    }

    return udp
})()

module.exports = udp