###
 0000000  000       0000000    0000000  000   000    
000       000      000   000  000       000   000    
0000000   000      000000000  0000000   000000000    
     000  000      000   000       000  000   000    
0000000   0000000  000   000  0000000   000   000    
###

{ fs, os, empty, valid, _ } = require './kxk'

path     = require 'path'
isBinary = require 'isbinaryfile'

textext = _.reduce require('textextensions'), (map, ext) ->
    map[".#{ext}"] = true
    map
, {}

textext['.crypt']  = true
textext['.bashrc'] = true
textext['.svg']    = true
textext['.csv']    = true

textbase = 
    profile:1
    license:1
    '.gitignore':1
    '.npmignore':1

class Slash

    @reg = new RegExp "\\\\", 'g'

    @win: -> path.sep == '\\'
    
    @error: (msg) ->
        # error = require './error'
        # error msg
        ''
    
    # 00000000    0000000   000000000  000   000  
    # 000   000  000   000     000     000   000  
    # 00000000   000000000     000     000000000  
    # 000        000   000     000     000   000  
    # 000        000   000     000     000   000  
    
    @path: (p) ->
        return Slash.error "Slash.path -- no path? #{p}" if not p? or p.length == 0
        p = path.normalize p
        p = p.replace Slash.reg, '/'
        p

    @unslash: (p) ->
        return Slash.error "Slash.unslash -- no path? #{p}" if not p? or p.length == 0
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
  
    @isRoot: (p) -> Slash.removeDrive(p) == '/'
        
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
        
        if not pos? or not pos[0]?
            file
        else if pos[0]
            file + ":#{pos[1]+1}:#{pos[0]}"
        else
            file + ":#{pos[1]+1}"
                
    @joinFileLine: (file, line, col) -> # 'file.txt', 1, 2 --> file.txt:1:2
        
        return file if not line?
        return "#{file}:#{line}" if not col?
        "#{file}:#{line}:#{col}"
    
    # 00000000    0000000   000000000  000   000  000      000   0000000  000000000  
    # 000   000  000   000     000     000   000  000      000  000          000     
    # 00000000   000000000     000     000000000  000      000  0000000      000     
    # 000        000   000     000     000   000  000      000       000     000     
    # 000        000   000     000     000   000  0000000  000  0000000      000     
    
    @pathlist: (p) -> # '/root/dir/file.txt' --> ['/', '/root', '/root/dir', '/root/dir/file.txt']
    
        return [] if empty p
        p = Slash.path Slash.sanitize p
        list = [p]
        while Slash.dir(p) != ''
            list.unshift Slash.dir(p)
            p = Slash.dir p
        list
        
    # 000   000   0000000   00     00  00000000  
    # 0000  000  000   000  000   000  000       
    # 000 0 000  000000000  000000000  0000000   
    # 000  0000  000   000  000 0 000  000       
    # 000   000  000   000  000   000  00000000  
    
    @base:       (p)   -> path.basename Slash.sanitize(p), path.extname Slash.sanitize(p)
    @file:       (p)   -> path.basename Slash.sanitize(p)
    @extname:    (p)   -> path.extname Slash.sanitize(p)
    @basename:   (p,e) -> path.basename Slash.sanitize(p), e
    @isAbsolute: (p)   -> path.isAbsolute Slash.sanitize(p)
    @isRelative: (p)   -> not Slash.isAbsolute Slash.sanitize(p)
    @dirname:    (p)   -> Slash.path path.dirname Slash.sanitize(p)
    @normalize:  (p)   -> Slash.path path.normalize Slash.sanitize(p)
    @dir:        (p)   -> 
        p = Slash.sanitize p
        if Slash.isRoot p then return ''
        p = path.dirname p
        if p == '.' then return ''
        Slash.path p
    @sanitize:   (p)   -> 
        if empty p
            return Slash.error 'empty path!'
        if p[0] == '\n'
            Slash.error "leading newline in path! '#{p}'"
            return Slash.sanitize p.substr 1
        if p.endsWith '\n'
            Slash.error "trailing newline in path! '#{p}'"
            return Slash.sanitize p.substr 0, p.length-1
        p
    
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
        return Slash.error "Slash.resolve -- no path? #{p}" if empty p
        Slash.path path.resolve Slash.unenv Slash.untilde p
    
    @relative: (rel, to) ->
        
        if empty to
            Slash.error "Slash.relative -- to nothing? rel:'#{rel}' to:'#{to}'"
            return rel
            
        rel = Slash.resolve rel
        return rel if not Slash.isAbsolute rel
        if Slash.resolve(to) == rel
            return '.'
            
        Slash.path path.relative Slash.resolve(to), rel
        
    @fileUrl: (p) -> "file:///#{Slash.encode p}"

    @samePath: (a, b) -> Slash.resolve(a) == Slash.resolve(b)

    @escape: (p) -> p.replace /([\`\"])/g, '\\$1'

    @encode: (p) ->
        p = encodeURI p
        p = p.replace /\#/g, "%23"
        p = p.replace /\&/g, "%26"
        p = p.replace /\'/g, "%27"

    # 00000000   000   000   0000000       000   0000000   000  000000000  
    # 000   000  000  000   000           000   000        000     000     
    # 00000000   0000000    000  0000    000    000  0000  000     000     
    # 000        000  000   000   000   000     000   000  000     000     
    # 000        000   000   0000000   000       0000000   000     000     
    
    @pkg: (p) ->
    
        if p?.length?
            
            while p.length and @removeDrive(p) not in ['.', '/', '']
                
                if Slash.dirExists  Slash.join p, '.git'         then return Slash.resolve p
                if Slash.fileExists Slash.join p, 'package.noon' then return Slash.resolve p
                if Slash.fileExists Slash.join p, 'package.json' then return Slash.resolve p
                p = Slash.dir p
        null

    @git: (p) ->

        if p?.length?
            
            while p.length and @removeDrive(p) not in ['.', '/', '']
                
                if Slash.dirExists Slash.join p, '.git' then return Slash.resolve p
                p = Slash.dir p
        null
        
    # 00000000  000   000  000   0000000  000000000   0000000  
    # 000        000 000   000  000          000     000       
    # 0000000     00000    000  0000000      000     0000000   
    # 000        000 000   000       000     000          000  
    # 00000000  000   000  000  0000000      000     0000000   
    
    @exists: (p, cb) ->
        
        if _.isFunction cb
            if not p?
                cb() 
                return
            p = Slash.resolve Slash.removeLinePos p
            fs.access p, fs.R_OK | fs.F_OK, (err) ->
                if valid err
                    cb() 
                else
                    fs.stat p, (err, stat) ->
                        if valid err
                            cb()
                        else
                            cb stat
            return
        
        return false if not p?
        
        try
            p = Slash.resolve Slash.removeLinePos p
            if stat = fs.statSync(p)
                fs.accessSync p, fs.R_OK
                return stat
        catch err
            if err.code in ['ENOENT', 'ENOTDIR']
                return false
            error err
        null     
        
    @touch: (p) ->
        
        fs.ensureDirSync Slash.dirname p
        if not Slash.fileExists p
            fs.writeFileSync p, ''
        
    @fileExists: (p, cb) ->
        
        if _.isFunction cb
            Slash.exists p, (stat) ->
                if stat?.isFile() then cb stat
                else cb()
        else
            if stat = Slash.exists p
                return stat if stat.isFile()

    @dirExists: (p, cb) ->

        if _.isFunction cb
            Slash.exists p, (stat) ->
                if stat?.isDirectory() then cb stat
                else cb()
        else
            if stat = Slash.exists p
                return stat if stat.isDirectory()
            
    @isDir:  (p, cb) -> @dirExists p, cb
    @isFile: (p, cb) -> @fileExists p, cb
    
    @isWritable: (p, cb) ->
        
        if _.isFunction cb
            fs.access Slash.resolve(p), fs.R_OK | fs.W_OK, (err) ->
                if valid err then cb false
                else cb true
        else
            try
                fs.accessSync Slash.resolve(p), fs.R_OK | fs.W_OK
                return true
            catch
                return false

    @userData: ->
       
        try
            electron = require 'electron'
            if process.type == 'renderer'
                return electron.remote.app.getPath 'userData'
            else
                return electron.app.getPath 'userData'
        catch err
            try
                if pkgDir = Slash.pkg __dirname
                    pkg = require slash.join pkgDir, 'package.json'
                    { sds } = require './kxk'
                    name = sds.find.value pkg, 'name'
                    return Slash.resolve "~/AppData/Roaming/#{name}"
            catch err
                error err
                
        return Slash.resolve "~/AppData/Roaming/"

    ###
    000   0000000  000000000  00000000  000   000  000000000
    000  000          000     000        000 000      000   
    000  0000000      000     0000000     00000       000   
    000       000     000     000        000 000      000   
    000  0000000      000     00000000  000   000     000   
    ###
    
    @isText: (f) ->
    
        return true if Slash.extname(f) and textext[Slash.extname f]? 
        return true if textbase[Slash.basename(f).toLowerCase()]
        return false if not Slash.isFile f
        return not isBinary.isBinaryFileSync f
    
module.exports = Slash
