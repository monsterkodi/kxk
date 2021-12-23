// monsterkodi/kode 0.200.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var dumpImmediately, dumpInfos, dumpTimer, fileLog, infos, klog, post, slog, stack, sutil, _163_37_

sutil = require('stack-utils')
stack = new sutil({cwd:process.cwd(),internals:sutil.nodeInternals()})
infos = []

dumpInfos = function ()
{
    var fs, info, kstr, post, slash, stream

    fs = require('./kxk').fs
    kstr = require('./kxk').kstr
    post = require('./kxk').post
    slash = require('./kxk').slash

    stream = fs.createWriteStream(slash.resolve(slog.logFile),{flags:'a',encoding:'utf8'})
    while (infos.length)
    {
        info = infos.shift()
        stream.write(JSON.stringify(info) + '\n')
    }
    return stream.end()
}

dumpImmediately = function ()
{
    var data, fs, info, slash

    fs = require('./kxk').fs
    slash = require('./kxk').slash

    data = ''
    while (infos.length)
    {
        info = infos.shift()
        data += JSON.stringify(info) + '\n'
    }
    return fs.appendFileSync(slash.resolve(slog.logFile),data,'utf8')
}
dumpTimer = null

fileLog = function (info)
{
    var line, lines

    try
    {
        info.id = slog.id
        info.icon = slog.icon
        info.type = slog.type
        lines = info.str.split('\n')
        if (lines.length)
        {
            var list = _k_.list(lines)
            for (var _48_21_ = 0; _48_21_ < list.length; _48_21_++)
            {
                line = list[_48_21_]
                info.str = line
                infos.push(Object.assign({},info))
                info.sep = ''
                info.icon = ''
            }
        }
        else
        {
            infos.push(info)
        }
        return dumpImmediately()
    }
    catch (err)
    {
        console.error("kxk.log.fileLog -- ",err.stack)
        return slog.file = false
    }
}

slog = function (s)
{
    var post

    post = require('./kxk').post

    console.error(err)
    post.emit('slog',`!${slog.methsep}${s} ${err}`)
    if (slog.file)
    {
        return fileLog({str:s + err})
    }
}

klog = function ()
{
    var kstr, post, s, _124_14_

    post = require('./kxk').post
    kstr = require('./kxk').kstr

    s = (function () { var result = []; var list = _k_.list([].slice.call(arguments,0)); for (var _122_23_ = 0; _122_23_ < list.length; _122_23_++)  { s = list[_122_23_];result.push(kstr(s))  } return result }).bind(this)().join(" ")
    ;(post != null ? typeof (_124_14_=post.emit) === "function" ? _124_14_('log',s) : undefined : undefined)
    console.log(s)
    return slog(s)
}
slog.file = true
if (process.platform === 'win32')
{
    slog.logFile = '~/AppData/Roaming/klog.txt'
}
else if (process.platform === 'darwin')
{
    slog.logFile = '~/Library/Application Support/klog.txt'
}
slog.id = '???'
slog.type = process.type === 'renderer' ? 'win' : 'main'
slog.icon = process.type === 'renderer' ? '●' : '◼'
slog.depth = 2
slog.filesep = ' > '
slog.methsep = ' >> '
slog.filepad = 30
slog.methpad = 15
klog.slog = slog
klog.flog = fileLog
try
{
    if (process.type === 'renderer')
    {
        post = require('./kxk').post

        slog.id = post.get('appName')
    }
    else if (process.type === 'browser')
    {
        slog.id = (require('electron') != null ? require('electron').app.getName() : undefined)
    }
}
catch (err)
{
    console.warn(err)
}
module.exports = klog