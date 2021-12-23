// monsterkodi/kode 0.200.0

var _k_

var args, karg, kerror, kxk, post, slash

if (process.type === 'renderer')
{
    module.exports = function ()
    {
        return require('./kxk').post.get('args')
    }
}
else
{
    kxk = require('./kxk')
    karg = kxk.karg
    kerror = kxk.kerror
    noon = kxk.noon
    post = kxk.post
    slash = kxk.slash

    args = {}
    args.init = function (cfg)
    {
        var k, v

        delete args.init
        for (k in karg(cfg))
        {
            v = karg(cfg)[k]
            args[k] = v
        }
        return args
    }
    if (typeof((post != null ? post.onGet : undefined)) === 'function')
    {
        post.onGet('args',(function ()
        {
            return args
        }).bind(this))
    }
    module.exports = args
}