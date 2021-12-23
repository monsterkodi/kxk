// monsterkodi/kode 0.210.0

var _k_

var def, last, _

def = require('./kxk').def
last = require('./kxk').last
_ = require('./kxk')._

class History
{
    constructor (opt)
    {
        this.opt = def(opt,{list:[],maxLength:100})
        this.list = opt.list
    }

    add (i)
    {
        _.pullAllWith(this.list,[i],_.isEqual)
        this.list.push(i)
        if (this.list.length > this.opt.maxLength)
        {
            return this.list.shift()
        }
    }

    previous ()
    {
        if (this.list.length > 1)
        {
            return this.list[this.list.length - 2]
        }
        else
        {
            return null
        }
    }

    current ()
    {
        return last(this.list)
    }
}

module.exports = History