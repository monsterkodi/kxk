#  0000000  000       0000000    0000000  000   000    
# 000       000      000   000  000       000   000    
# 0000000   000      000000000  0000000   000000000    
#      000  000      000   000       000  000   000    
# 0000000   0000000  000   000  0000000   000   000    

{ fs, os, path, log, error, _ } = require './kxk'

class slash

    @reg = new RegExp "\\\\", 'g'

    @win: -> path.sep == '\\'
    
    @path: (p) ->
        return error "no path? #{p}" if not p? or p.length == 0
        p = path.normalize p
        p = p.replace slash.reg, '/'
        # log 'slash.path', p
        p

    @splitDrive: (p) ->
        
        if slash.win()
            root = path.parse(p).root
            if root.length
                return [slash.path(p.slice(root.length-1)), p.slice(0, root.length-1)]
        [slash.path(p), '']
        
    @removeDrive: (p) ->
        
        return @splitDrive(p)[0]
  
    @splitFileLine: (p) ->  # file.txt:1:0 --> ['file.txt', 1, 0]
        
        [f,d] = slash.splitDrive p
        split = String(f).split ':'
        line = parseInt split[1] if split.length > 1
        clmn = parseInt split[2] if split.length > 2
        l = c = 0
        l = line if Number.isInteger line
        c = clmn if Number.isInteger clmn
        [ d + split[0], Math.max(l,1),  Math.max(c,0) ]
        
    @splitFilePos: (p) -> # file.txt:1:3 --> ['file.txt', [3, 0]]
    
        [f,l,c] = slash.splitFileLine p
        [f, [c, l-1]]
        
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
    
    @dirname:   (p) -> slash.path path.dirname p
    @normalize: (p) -> slash.path path.normalize p
    @home:          -> slash.path os.homedir()
    @tilde:     (p) -> slash.path(p).replace slash.home(), '~'
    @untilde:   (p) -> slash.path(p).replace /^\~/, slash.home()
    @unenv:     (p) -> 
        
        i = p.indexOf '$'
        while i >= 0
            for k,v of process.env
                if k == p.slice i+1, i+1+k.length
                    p = p.slice(0, i) + v + p.slice(i+k.length+1)
                    i = p.indexOf '$'
                    break
        p
    
    @resolve: (p) ->
        
        slash.path path.resolve slash.unenv slash.untilde p
    
    @relative: (rel, to) ->
        
        rel = slash.resolve rel
        return rel if not path.isAbsolute rel
        if slash.resolve(to) == rel
            return '.'
        slash.path path.relative slash.resolve(to), rel
    
module.exports = slash
