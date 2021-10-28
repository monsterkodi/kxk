###
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000 
###

if process.type == 'renderer'
    
    module.exports = require('./kxk').post.get 'args'
    
else

    { empty, karg, kerror, noon, slash, valid } = require './kxk'
    
    args = {} 
        
    args.init = (cfg, kargOpt) ->
        
        kargOpt ?= {}
        pkg = kargOpt.pkg
        
        if not pkg?
            pkgDir = slash.pkg __dirname
            while valid(pkgDir) and slash.file(slash.dir pkgDir) == 'node_modules'
                pkgDir = slash.pkg slash.dir pkgDir
            if valid pkgDir
                pkgJson = slash.join pkgDir, 'package.json'
                pkg = require pkgJson
                return kerror "args -- no pkg in '#{pkgJson}'!" if empty pkg
            else
                return kerror 'args -- no pkg dir!'
            
        kargConfig = {}
        kargConfig[pkg.name] = {}
        kargConfig.version = pkg.version
        
        for kk,vv of noon.parse cfg
            o = {}
            s = vv.split(/\s\s+/)
            
            if s.length > 0 
                o['?'] = s[0] if not empty s[0]
            if s.length > 1
                if s[1] in ['*', '**']
                    o[s[1]] = null
                else
                    o['='] = noon.parse(s[1])[0] 
            if s.length > 2
                if s[2].startsWith '-'
                    o['-'] = s[2].substr 1
            
            kargConfig[pkg.name][kk] = o
            
        delete args.init
        
        if empty kargOpt.ignoreArgs
            if slash.win() and slash.file(process.argv[0]) == "#{pkg.name}.exe"
                kargOpt.ignoreArgs=1
            else
                kargOpt.ignoreArgs=2
        
        for k,v of karg kargConfig, kargOpt
            args[k] = v
            
        args
    
    post?.onGet 'args' => args
    
    module.exports = args
