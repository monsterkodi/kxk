###
 0000000  000       0000000    0000000  000   000    
000       000      000   000  000       000   000    
0000000   000      000000000  0000000   000000000    
     000  000      000   000       000  000   000    
0000000   0000000  000   000  0000000   000   000    
###

{ fs, os, path, empty, log, error, _ } = require './kxk'

class slash

    @reg = new RegExp "\\\\", 'g'

    @win: -> path.sep == '\\'
    
    # 00000000    0000000   000000000  000   000  
    # 000   000  000   000     000     000   000  
    # 00000000   000000000     000     000000000  
    # 000        000   000     000     000   000  
    # 000        000   000     000     000   000  
    
    @path: (p) ->
        return error "no path? #{p}" if not p? or p.length == 0
        p = path.normalize p
        p = p.replace slash.reg, '/'
        p

    @unslash: (p) ->
        return error "no path? #{p}" if not p? or p.length == 0
        if p.length >= 3 and p[0] == '/' == p[2] 
            p = p[1] + ':' + p.slice 2
            log p
        p = path.normalize p
        
    #  0000000  00000000   000      000  000000000  
    # 000       000   000  000      000     000     
    # 0000000   00000000   000      000     000     
    #      000  000        000      000     000     
    # 0000000   000        0000000  000     000     
    
    @split: (p) -> slash.path(p).split '/'
    
    @splitDrive: (p) ->
        
        if slash.win()
            root = slash.parse(p).root

            if root.length > 1
                if p.length > root.length
                    filePath = slash.path p.slice(root.length-1)
                else 
                    filePath = '/'
                return [filePath , root.slice 0, root.length-2]
                
        [slash.path(p), '']
        
    @removeDrive: (p) ->
        
        return slash.splitDrive(p)[0]
  
    @isRoot: (p) -> @removeDrive(p) == '/'
        
    @splitFileLine: (p) ->  # file.txt:1:0 --> ['file.txt', 1, 0]
        
        [f,d] = slash.splitDrive p
        split = String(f).split ':'
        line = parseInt split[1] if split.length > 1
        clmn = parseInt split[2] if split.length > 2
        l = c = 0
        l = line if Number.isInteger line
        c = clmn if Number.isInteger clmn
        d = d + ':' if d != ''
        [ d + split[0], Math.max(l,1),  Math.max(c,0) ]
        
    @splitFilePos: (p) -> # file.txt:1:3 --> ['file.txt', [3, 0]]
    
        [f,l,c] = slash.splitFileLine p
        [f, [c, l-1]]
        
    @ext:       (p) -> path.extname(p).slice 1
    @splitExt:  (p) -> [slash.removeExt(p), slash.ext(p)]
    @removeExt: (p) -> slash.join slash.dir(p), slash.base p
    @swapExt:   (p, ext) -> slash.removeExt(p) + (ext.startsWith('.') and ext or ".#{ext}")
        
    #       000   0000000   000  000   000  
    #       000  000   000  000  0000  000  
    #       000  000   000  000  000 0 000  
    # 000   000  000   000  000  000  0000  
    #  0000000    0000000   000  000   000  
    
    @join: -> [].map.call(arguments, slash.path).join '/'
    
    @joinFilePos: (file, pos) -> # ['file.txt', [3, 0]] --> file.txt:1:3
        if not pos? or not pos[0] and not pos[1]
            file
        else if pos[0]
            file + ":#{pos[1]+1}:#{pos[0]}"
        else
            file + ":#{pos[1]+1}"
                
    @joinFileLine: (file, line, col) -> # 'file.txt', 1, 2 --> file.txt:1:2
        return file if not line?
        return "#{file}:#{line}" if not col?
        "#{file}:#{line}:#{col}"
    
    # 000   000   0000000   00     00  00000000  
    # 0000  000  000   000  000   000  000       
    # 000 0 000  000000000  000000000  0000000   
    # 000  0000  000   000  000 0 000  000       
    # 000   000  000   000  000   000  00000000  
    
    @base:       (p)   -> path.basename p, path.extname p
    @file:       (p)   -> path.basename p
    @extname:    (p)   -> path.extname p
    @basename:   (p,e) -> path.basename p, e
    @isAbsolute: (p)   -> path.isAbsolute p
    @dirname:    (p)   -> slash.path path.dirname p
    @dir:        (p)   -> slash.path path.dirname p
    @normalize:  (p)   -> slash.path path.normalize p
    
    @parse:      (p)   -> 
        
        dict = path.parse p
        
        if dict.dir.length == 2 and dict.dir[1] == ':'
            dict.dir += '/'
        if dict.root.length == 2 and dict.root[1] == ':'
            dict.root += '/'
            
        dict
    
    # 00     00  000   0000000   0000000    
    # 000   000  000  000       000         
    # 000000000  000  0000000   000         
    # 000 0 000  000       000  000         
    # 000   000  000  0000000    0000000    
    
    @home:          -> slash.path os.homedir()
    @tilde:     (p) -> slash.path(p).replace slash.home(), '~'
    @untilde:   (p) -> slash.path(p).replace /^\~/, slash.home()
    @unenv:     (p) -> 
        
        i = p.indexOf '$', 0
        while i >= 0
            for k,v of process.env
                if k == p.slice i+1, i+1+k.length
                    p = p.slice(0, i) + v + p.slice(i+k.length+1)
                    break
            i = p.indexOf '$', i+1
        slash.path p
    
    @resolve: (p) ->
        
        slash.path path.resolve slash.unenv slash.untilde p
    
    @relative: (rel, to) ->
        
        if empty to
            error "slash.relative to nothing?", rel, to
            return rel
            
        rel = slash.resolve rel
        return rel if not slash.isAbsolute rel
        if slash.resolve(to) == rel
            return '.'
        slash.path path.relative slash.resolve(to), rel
        
    @fileUrl: (p) -> "file://#{slash.encode slash.resolve p}"

    @samePath: (a, b) -> slash.resolve(a) == slash.resolve(b)

    @escape: (p) -> p.replace /([\`"])/g, '\\$1'

    @encode: (p) ->
        p = encodeURI p
        p = p.replace /\#/g, "%23"
        p = p.replace /\&/g, "%26"
        p = p.replace /\'/g, "%27"

    @pkg: (p) ->
    
        if p?.length?
            
            while p.length and @removeDrive(p) not in ['.', '/', '']
                
                if slash.dirExists  slash.join p, '.git'         then return slash.resolve p
                if slash.fileExists slash.join p, 'package.noon' then return slash.resolve p
                if slash.fileExists slash.join p, 'package.json' then return slash.resolve p
                p = slash.dirname p
        null

    @exists: (p) -> 
        
        return false if not p?
        try
            p = slash.resolve p
            if stat = fs.statSync(p)
                fs.accessSync p, fs.R_OK
                return stat
        catch 
            return null
        null     

    @fileExists: (p) ->
        
        if stat = slash.exists p
            return stat if stat.isFile()

    @dirExists: (p) ->

        if stat = slash.exists p
            return stat if stat.isDirectory()
            
    @isDir: (p) -> @dirExists p
    @isFile: (p) -> @fileExists p

module.exports = slash
