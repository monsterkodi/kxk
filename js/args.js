// monsterkodi/kode 0.214.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined}

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
    args.init = function (cfg, pkg)
    {
        var k, pkgDir, pkgJson, v

        if (!(pkg != null))
        {
            pkgDir = slash.pkg(__dirname)
            while (!_k_.empty((pkgDir)) && slash.file(slash.dir(pkgDir)) === 'node_modules')
            {
                pkgDir = slash.pkg(slash.dir(pkgDir))
            }
            if (!_k_.empty(pkgDir))
            {
                pkgJson = slash.join(pkgDir,'package.json')
                pkg = require(pkgJson)
            }
        }
        delete args.init
        if (!_k_.empty(pkg))
        {
            cfg += `\nversion   ${pkg.version}`
        }
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