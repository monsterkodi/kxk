// monsterkodi/kode 0.197.0

var _k_ = {empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, valid: undefined, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

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
    args.init = function (cfg, kargOpt)
    {
        var k, kargConfig, kk, o, pkg, pkgDir, pkgJson, s, v, vv

        kargOpt = (kargOpt != null ? kargOpt : {})
        pkg = kargOpt.pkg
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
                if (_k_.empty(pkg))
                {
                    return kerror(`args -- no pkg in '${pkgJson}'!`)
                }
            }
            else
            {
                return kerror('args -- no pkg dir!')
            }
        }
        kargConfig = {}
        kargConfig[pkg.name] = {}
        kargConfig.version = pkg.version
        for (kk in noon.parse(cfg))
        {
            vv = noon.parse(cfg)[kk]
            o = {}
            s = vv.split(/\s\s+/)
            if (s.length > 0)
            {
                if (!_k_.empty(s[0]))
                {
                    o['?'] = s[0]
                }
            }
            if (s.length > 1)
            {
                if (_k_.in(s[1],['*','**']))
                {
                    o[s[1]] = null
                }
                else
                {
                    o['='] = noon.parse(s[1])[0]
                }
            }
            if (s.length > 2)
            {
                if (s[2].startsWith('-'))
                {
                    o['-'] = s[2].substr(1)
                }
            }
            kargConfig[pkg.name][kk] = o
        }
        delete args.init
        if (_k_.empty(kargOpt.ignoreArgs))
        {
            if (slash.win() && slash.file(process.argv[0]) === `${pkg.name}.exe`)
            {
                kargOpt.ignoreArgs = 1
            }
            else
            {
                kargOpt.ignoreArgs = 2
            }
        }
        for (k in karg(kargConfig,kargOpt))
        {
            v = karg(kargConfig,kargOpt)[k]
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