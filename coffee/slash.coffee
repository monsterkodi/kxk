###
 0000000  000       0000000    0000000  000   000    
000       000      000   000  000       000   000    
0000000   000      000000000  0000000   000000000    
     000  000      000   000       000  000   000    
0000000   0000000  000   000  0000000   000   000    
###

{ fs, os, empty, log, error, _ } = require './kxk'

path = require 'path'

class Slash

    @reg = new RegExp "\\\\", 'g'

    @win: -> path.sep == '\\'
    
    # 00000000    0000000   000000000  000   000  
    # 000   000  000   000     000     000   000  
    # 00000000   000000000     000     000000000  
    # 000        000   000     000     000   000  
    # 000        000   000     000     000   000  
    
    @path: (p) ->
        return error "Slash.path -- no path? #{p}" if not p? or p.length == 0
        p = path.normalize p
        p = p.replace Slash.reg, '/'
        p

    @unslash: (p) ->
        return error "Slash.unslash -- no path? #{p}" if not p? or p.length == 0
        p = Slash.path p
        if Slash.win()
            if p.length >= 3 and p[0] == '/' == p[2] 
                p = p[1] + ':' + p.slice 2
            p = path.normalize p
            if p[1] == ':'
                p = p.splice 0, 1, p[0].toUpperCase()
        p
        
    #  0000000  00000000   000      000  000000000  
    # 000       000   000  000      000     000     
    # 0000000   00000000   000      000     000     
    #      000  000        000      000     000     
    # 0000000   000        0000000  000     000     
    
    @split: (p) -> Slash.path(p).split('/').filter (e) -> e.length
    
    @splitDrive: (p) ->
        
        if Slash.win()
            root = Slash.parse(p).root

            if root.length > 1
                if p.length > root.length
                    filePath = Slash.path p.slice(root.length-1)
                else 
                    filePath = '/'
                return [filePath , root.slice 0, root.length-2]
                
        [Slash.path(p), '']
        
    @removeDrive: (p) ->
        
        return Slash.splitDrive(p)[0]
  
    @isRoot: (p) -> @removeDrive(p) == '/'
        
    @splitFileLine: (p) ->  # file.txt:1:0 --> ['file.txt', 1, 0]
        
        [f,d] = Slash.splitDrive p
        split = String(f).split ':'
        line = parseInt split[1] if split.length > 1
        clmn = parseInt split[2] if split.length > 2
        l = c = 0
        l = line if Number.isInteger line
        c = clmn if Number.isInteger clmn
        d = d + ':' if d != ''
        [ d + split[0], Math.max(l,1),  Math.max(c,0) ]
        
    @splitFilePos: (p) -> # file.txt:1:3 --> ['file.txt', [3, 0]]
    
        [f,l,c] = Slash.splitFileLine p
        [f, [c, l-1]]
        
    @removeLinePos: (p) -> Slash.splitFileLine(p)[0]
    @removeColumn:  (p) -> 
        [f,l] = Slash.splitFileLine p
        if l>1 then f + ':' + l
        else f
        
    @ext:       (p) -> path.extname(p).slice 1
    @splitExt:  (p) -> [Slash.removeExt(p), Slash.ext(p)]
    @removeExt: (p) -> Slash.join Slash.dir(p), Slash.base p
    @swapExt:   (p, ext) -> Slash.removeExt(p) + (ext.startsWith('.') and ext or ".#{ext}")
        
    #       000   0000000   000  000   000  
    #       000  000   000  000  0000  000  
    #       000  000   000  000  000 0 000  
    # 000   000  000   000  000  000  0000  
    #  0000000    0000000   000  000   000  
    
    @join: -> [].map.call(arguments, Slash.path).join '/'
    
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
    @isRelative: (p)   -> not Slash.isAbsolute p
    @dirname:    (p)   -> Slash.path path.dirname p
    @dir:        (p)   -> Slash.path path.dirname p
    @normalize:  (p)   -> Slash.path path.normalize p
    
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
    
    @home:          -> Slash.path os.homedir()
    @tilde:     (p) -> Slash.path(p)?.replace Slash.home(), '~'
    @untilde:   (p) -> Slash.path(p)?.replace /^\~/, Slash.home()
    @unenv:     (p) -> 
        
        i = p.indexOf '$', 0
        while i >= 0
            for k,v of process.env
                if k == p.slice i+1, i+1+k.length
                    p = p.slice(0, i) + v + p.slice(i+k.length+1)
                    break
            i = p.indexOf '$', i+1
        Slash.path p
    
    @resolve: (p) ->
        return error "Slash.resolve -- no path? #{p}" if empty p
        Slash.path path.resolve Slash.unenv Slash.untilde p
    
    @relative: (rel, to) ->
        
        if empty to
            error "Slash.relative -- to nothing?", rel, to
            return rel
            
        rel = Slash.resolve rel
        return rel if not Slash.isAbsolute rel
        if Slash.resolve(to) == rel
            return '.'
        Slash.path path.relative Slash.resolve(to), rel
        
    @fileUrl: (p) -> "file://#{Slash.encode Slash.resolve p}"

    @samePath: (a, b) -> Slash.resolve(a) == Slash.resolve(b)

    @escape: (p) -> p.replace /([\`"])/g, '\\$1'

    @encode: (p) ->
        p = encodeURI p
        p = p.replace /\#/g, "%23"
        p = p.replace /\&/g, "%26"
        p = p.replace /\'/g, "%27"

    @pkg: (p) ->
    
        if p?.length?
            
            while p.length and @removeDrive(p) not in ['.', '/', '']
                
                if Slash.dirExists  Slash.join p, '.git'         then return Slash.resolve p
                if Slash.fileExists Slash.join p, 'package.noon' then return Slash.resolve p
                if Slash.fileExists Slash.join p, 'package.json' then return Slash.resolve p
                p = Slash.dirname p
        null

    @exists: (p) -> 
        
        return false if not p?
        try
            p = Slash.resolve p
            if stat = fs.statSync(p)
                fs.accessSync p, fs.R_OK
                return stat
        catch 
            return null
        null     
        
    @isWritable: (p) ->
        
        try
            fs.accessSync Slash.resolve(p), fs.R_OK | fs.W_OK
            return true
        catch
            return false

    @fileExists: (p) ->
        
        if stat = Slash.exists p
            return stat if stat.isFile()

    @dirExists: (p) ->

        if stat = Slash.exists p
            return stat if stat.isDirectory()
            
    @isDir: (p) -> @dirExists p
    @isFile: (p) -> @fileExists p

module.exports = Slash
