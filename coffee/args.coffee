###
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000 
###

{ karg, post, slash, noon, empty, fs, log, _ } = require './kxk'

if process.type == 'renderer'
    
    module.exports = post.get 'args'
    
else
        
    args = {} 
        
    args.init = (cfg, pkg) ->
        
        if not pkg?
            pkgJson = slash.join slash.pkg(__dirname), 'package.json'
            log 'pkgJson', pkgJson
            pkg = require pkgJson
            
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
            
        # log 'cfg;', kargConfig
            
        delete args.init
        
        for k,v of karg kargConfig
            args[k] = v
            
        # log 'args:', args
        args
    
    post.onGet 'args', => args
    
    module.exports = args
