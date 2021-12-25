// monsterkodi/kode 0.223.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, clone: function (o,v) { v ??= new Map(); if (o instanceof Array) { if (!v.has(o)) {var r = []; v.set(o,r); for (var i=0; i < o.length; i++) {if (!v.has(o[i])) { v.set(o[i],_k_.clone(o[i],v)) }; r.push(v.get(o[i]))}}; return v.get(o) } else if (typeof o == 'string') { if (!v.has(o)) {v.set(o,''+o)}; return v.get(o) } else if (typeof o == 'object' && o.constructor.name == 'Object') { if (!v.has(o)) { var k, r = {}; v.set(o,r); for (k in o) { if (!v.has(o[k])) { v.set(o[k],_k_.clone(o[k],v)) }; r[k] = v.get(o[k]) }; }; return v.get(o) } else {return o} }}

var fileList, filter, fs, slash

filter = require('./kxk').filter
fs = require('./kxk').fs
slash = require('./kxk').slash


fileList = function (paths, opt)
{
    var childdirs, children, copt, d, f, files, p, pos, ps, stat, _27_21_, _28_21_

    opt = (opt != null ? opt : {})
    opt.ignoreHidden = ((_27_21_=opt.ignoreHidden) != null ? _27_21_ : true)
    opt.logError = ((_28_21_=opt.logError) != null ? _28_21_ : true)
    files = []
    if ((function(o){return (typeof o === 'string' || o instanceof String)})(paths))
    {
        paths = [paths]
    }
    filter = function (p)
    {
        var _38_28_

        if (slash.base(p).toLowerCase() === 'ntuser')
        {
            return true
        }
        if (opt.ignoreHidden && slash.file(p).startsWith('.'))
        {
            return true
        }
        else if ((opt.matchExt != null))
        {
            if ((function(o){return (typeof o === 'string' || o instanceof String)})(opt.matchExt) && slash.ext(p) !== opt.matchExt)
            {
                return true
            }
            else if (opt.matchExt instanceof Array && !(_k_.in(slash.ext(p),opt.matchExt)))
            {
                return true
            }
        }
        return false
    }
    var list = _k_.list(paths)
    for (var _45_10_ = 0; _45_10_ < list.length; _45_10_++)
    {
        p = list[_45_10_]
        if (!(p != null ? p.length : undefined))
        {
            continue
        }
        try
        {
            var _48_20_ = slash.splitFilePos(p); p = _48_20_[0]; pos = _48_20_[1]

            stat = fs.statSync(p)
            if (stat.isDirectory())
            {
                children = fs.readdirSync(p)
                children = (function () { var _54__50_ = []; var list1 = _k_.list(children); for (var _54_50_ = 0; _54_50_ < list1.length; _54_50_++)  { f = list1[_54_50_];_54__50_.push(slash.join(p,f))  } return _54__50_ }).bind(this)()
                childdirs = []
                var list2 = _k_.list(children)
                for (var _56_22_ = 0; _56_22_ < list2.length; _56_22_++)
                {
                    p = list2[_56_22_]
                    ps = fs.statSync(p)
                    if (ps.isDirectory())
                    {
                        childdirs.push(slash.normalize(p))
                    }
                    else if (ps.isFile())
                    {
                        if (!filter(p))
                        {
                            if (slash.isAbsolute(p))
                            {
                                files.push(slash.resolve(p))
                            }
                            else
                            {
                                files.push(slash.normalize(p))
                            }
                        }
                    }
                }
                if ((function(o){return !isNaN(o) && !isNaN(parseFloat(o)) && isFinite(o)})(opt.depth) && opt.depth > 0)
                {
                    copt = _k_.clone(opt)
                    copt.depth -= 1
                    var list3 = _k_.list(childdirs)
                    for (var _69_26_ = 0; _69_26_ < list3.length; _69_26_++)
                    {
                        d = list3[_69_26_]
                        files = files.concat(fileList(d,copt))
                    }
                }
            }
            else if (stat.isFile())
            {
                if (filter(p))
                {
                    continue
                }
                p = slash.joinFilePos(p,pos)
                files.push(p)
            }
        }
        catch (err)
        {
            if (opt.logError)
            {
                console.error(`[ERROR] kxk.fileList: ${err}`)
                console.error("paths:",JSON.stringify(paths))
                console.error("opt:",JSON.stringify(opt))
            }
        }
    }
    return files
}
module.exports = fileList