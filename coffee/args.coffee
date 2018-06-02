###
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000 
###

{ karg, post, slash, noon, empty, valid, fs, error, log, _ } = require './kxk'

if process.type == 'renderer'
    
    module.exports = post.get 'args'
    
else
        
    args = {} 
        
    args.init = (cfg, pkg) ->
        
        if not pkg?
            pkgDir = slash.pkg __dirname
            while valid(pkgDir) and slash.file(slash.dir pkgDir) == 'node_modules'
                pkgDir = slash.pkg slash.dir pkgDir
            if valid pkgDir
                pkgJson = slash.join pkgDir, 'package.json'
                pkg = require pkgJson
                return error "args -- no pkg in '#{pkgJson}'!" if empty pkg
            else
                return error 'args -- no pkg dir!'
            
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
            
            kargConfig[pkg.name][kk] = o
            
        delete args.init
        
        for k,v of karg kargConfig
            args[k] = v
            
        args
    
    post.onGet 'args', => args
    
    module.exports = args
