# 000000000  00000000   0000000  000000000
#    000     000       000          000
#    000     0000000   0000000      000
#    000     000            000     000
#    000     00000000  0000000      000

{ filelist, splitFileLine, slash, kpos, kstr, empty, valid, clamp, chai, kolor, filter, _ } = require '../'

kolor.globalize()
expect = chai().expect

describe 'kxk', ->
    
    describe 'kstr', ->
        
        it 'replaceTabs', ->
            kstr.replaceTabs('\t\t').should.eql '        '
            kstr.replaceTabs('aa\tbb').should.eql 'aa  bb'
            
        it 'escapeRegexp', ->
            kstr.escapeRegexp('a/b.txt').should.eql 'a\\/b\\.txt'
            
        it 'lpad' ->
            kstr.lpad('', 4).should.eql '    '
            kstr.lpad('x', 4).should.eql '   x'
            kstr.lpad(' xxx ', 2).should.eql ' xxx '

        it 'rpad' ->
            kstr.rpad('', 4).should.eql '    '
            kstr.rpad('x', 4).should.eql 'x   '
            kstr.rpad(' xxx ', 2).should.eql ' xxx '
     
        it 'ansi2html' ->
            
            a2h = (s,r) -> kstr.ansi2html(s).should.eql r
            
            a2h 'hello', 'hello'
            a2h r5('red'), '<span style="color:#ff0000;">red</span>'
            a2h """
                #{r5('red')}
                #{g5('green')}
                """, """
                <span style="color:#ff0000;">red</span>
                <span style="color:#00ff00;">green</span>
                """
            
        it 'stripAnsi' ->
            
            (kstr.stripAnsi g5('green')).should.eql 'green'
            
    #  0000000  000       0000000    0000000  000   000  
    # 000       000      000   000  000       000   000  
    # 0000000   000      000000000  0000000   000000000  
    #      000  000      000   000       000  000   000  
    # 0000000   0000000  000   000  0000000   000   000  
    
    describe 'slash', ->

        it 'dir', ->
            
            (slash.dir '/some/path/file.txt').should.eql '/some/path'
            
            (slash.dir '/some/dir/').should.eql '/some'
            
            if slash.win()
                (slash.dir 'C:\\Back\\').should.eql 'C:/'
            
            (slash.dir '../..').should.eql '..'

            (slash.dir '/').should.eql ''

            (slash.dir '.').should.eql ''
            
            (slash.dir '..').should.eql ''
            
            (slash.dir '~').should.eql ''

            (slash.dir './').should.eql ''
            
            (slash.dir '../').should.eql ''
            
            (slash.dir '~/').should.eql ''
            
            if slash.win()
                (slash.dir 'C:/').should.eql ''
            
        it 'pathlist', ->
            
            (slash.pathlist '/some/path.txt').should.eql ['/', '/some', '/some/path.txt']

            (slash.pathlist '/').should.eql ['/']
            
            (slash.pathlist '').should.eql []
            
            if slash.win()
                (slash.pathlist 'C:\\Back\\Slash\\').should.eql ['C:/', 'C:/Back', 'C:/Back/Slash/']

            (slash.pathlist '~').should.eql ['~']
                        
        it 'base', -> 
            
            (slash.base '/some/path.txt').should.eql 'path'
                
        it 'path', ->
            
            return if not slash.win()
            
            (slash.path "C:\\Back\\Slash\\Crap").should.eql "C:/Back/Slash/Crap"
            
            (slash.path "C:\\Back\\Slash\\Crap\\..\\..\\To\\The\\..\\Future").should.eql "C:/Back/To/Future"
            
        it 'join', ->
            
            (slash.join 'a', 'b', 'c').should.eql 'a/b/c'
            
            return if not slash.win()
            
            (slash.join 'C:\\FOO', '.\\BAR', 'that\\sucks').should.eql 'C:/FOO/BAR/that/sucks'
    
        it 'home', ->
            
            if slash.win()
                home = slash.path process.env['HOMEDRIVE'] + process.env['HOMEPATH']
            else
                home = process.env['HOME']
                
            (slash.home()).should.eql home
            
            (slash.tilde home).should.eql '~'
    
            (slash.tilde home + '/sub').should.eql '~/sub'
            
            (slash.untilde '~/sub').should.eql home + '/sub'
    
        it 'unenv', ->
            
            (slash.unenv 'C:/$Recycle.bin').should.eql 'C:/$Recycle.bin'
    
            return if not slash.win()
    
            (slash.unenv '$HOME/test').should.eql slash.path(process.env['HOME']) + '/test'
    
        it 'unslash', ->
            
            return if not slash.win()
    
            (slash.unslash '/c/test').should.eql 'C:\\test'
            
        it 'resolve', ->
            
            (slash.resolve '~').should.eql slash.home()
    
        it 'relative', ->
            
            (slash.relative 'C:\\test\\some\\path.txt', 'C:\\test\\some\\other\\path').should.eql '../../path.txt'
        
            (slash.relative 'C:\\some\\path', 'C:/some/path').should.eql '.'
    
            (slash.relative 'C:/Users/kodi/s/konrad/app/js/coffee.js', 'C:/Users/kodi/s/konrad').should.eql 'app/js/coffee.js'

            if slash.win()
                
                (slash.relative 'C:/some/path/on.c', 'D:/path/on.d').should.eql 'C:/some/path/on.c'
                
                (slash.relative 'C:\\some\\path\\on.c', 'D:\\path\\on.d').should.eql 'C:/some/path/on.c'
            
        it 'parse', ->
            
            return if not slash.win()
            (slash.parse('c:').root).should.eql 'c:/'
    
            (slash.parse('c:').dir).should.eql 'c:/'
            
        it 'split', ->
            
            (slash.split '/c/users/home/').should.eql ['c', 'users', 'home']
            
            (slash.split 'd/users/home').should.eql ['d', 'users', 'home']
            
            (slash.split 'c:/some/path').should.eql ['c:', 'some', 'path']
            
            (slash.split 'd:\\some\\path\\').should.eql ['d:', 'some', 'path']
                
        it 'splitDrive', ->
            
            (slash.splitDrive '/some/path').should.eql ['/some/path', '']
            
            return if not slash.win()
            
            (slash.splitDrive 'c:/some/path').should.eql ['/some/path', 'c']
            
            (slash.splitDrive 'c:\\some\\path').should.eql ['/some/path', 'c']
    
            (slash.splitDrive 'c:\\').should.eql ['/', 'c']
            
            (slash.splitDrive 'c:').should.eql ['/', 'c']
            
        it 'removeDrive', ->
            
            (slash.removeDrive '/some/path').should.eql '/some/path'
    
            return if not slash.win()
            
            (slash.removeDrive 'c:/some/path').should.eql '/some/path'
    
            (slash.removeDrive 'c:\\some\\path').should.eql '/some/path'
    
            (slash.removeDrive 'c:/').should.eql '/'
    
            (slash.removeDrive 'c:\\').should.eql '/'
            
            (slash.removeDrive 'c:').should.eql '/'
    
        it 'splitFileLine', ->
    
            (slash.splitFileLine '/some/path').should.eql ['/some/path', 1, 0]
            
            (slash.splitFileLine '/some/path:123').should.eql ['/some/path', 123, 0]
    
            (slash.splitFileLine '/some/path:123:15').should.eql ['/some/path', 123, 15]
    
            return if not slash.win()
            
            (slash.splitFileLine 'c:/some/path:123').should.eql ['c:/some/path', 123, 0]
    
            (slash.splitFileLine 'c:/some/path:123:15').should.eql ['c:/some/path', 123, 15]
    
        it 'splitFilePos', ->
    
            (slash.splitFilePos '/some/path').should.eql ['/some/path', [0, 0]]
    
            (slash.splitFilePos '/some/path:123').should.eql ['/some/path', [0, 122]]
    
            (slash.splitFilePos '/some/path:123:15').should.eql ['/some/path', [15, 122]]
    
            return if not slash.win()
            
            (slash.splitFilePos 'c:/some/path:123').should.eql ['c:/some/path', [0, 122]]
    
            (slash.splitFilePos 'c:/some/path:123:15').should.eql ['c:/some/path', [15, 122]]

        it 'joinFilePos', ->
    
            (slash.joinFilePos '/some/path', [0,0]).should.eql '/some/path:1'

            (slash.joinFilePos '/some/path', [0,4]).should.eql '/some/path:5'
            
            (slash.joinFilePos '/some/path', [1,5]).should.eql '/some/path:6:1'
            
            (slash.joinFilePos '/some/path').should.eql '/some/path'

            (slash.joinFilePos '/some/path', []).should.eql '/some/path'
            
        it 'exists', ->
    
            (slash.exists __dirname).should.exist
    
            (slash.exists __filename).should.exist
            
            (slash.exists __filename + 'foo').should.eql false
            
        it 'exists async', (done) ->
            
            slash.exists __filename, (stat) ->
                (stat).should.exist
                done()
    
        it 'exist async not', (done) ->
            
            slash.exists __filename + 'foo', (stat) ->
                expect(stat).to.not.exist
                done()
                
        it 'fileExists', ->
    
            (slash.fileExists __filename).should.exist
    
            expect(slash.fileExists __dirname).to.not.exist
            
        it 'dirExists', ->
            
            (slash.dirExists __dirname).should.exist
    
            expect(slash.dirExists __filename).to.not.exist
    
        it 'pkg', ->
            
            (slash.pkg __dirname).should.exist
    
            (slash.pkg __filename).should.exist
    
            expect(slash.pkg 'C:\\').to.not.exist
            
            expect(slash.pkg 'C:').to.not.exist
            
        it 'isRelative', ->
            
            (slash.isRelative __dirname).should.eql false
            
            (slash.isRelative '.').should.eql true
            
            (slash.isRelative '..').should.eql true
            
            (slash.isRelative '.././bla../../fark').should.eql true
    
            return if not slash.win()
            
            (slash.isRelative 'C:\\blafark').should.eql false
    
            (slash.isRelative '..\\blafark').should.eql true
            
        it 'sanitize', ->
            
            (slash.sanitize 'a.b\n').should.eql 'a.b'
    
            (slash.sanitize '\n\n c . d  \n\n\n').should.eql ' c . d  '
            
    # 00000000  000  000      00000000  000      000   0000000  000000000  
    # 000       000  000      000       000      000  000          000     
    # 000000    000  000      0000000   000      000  0000000      000     
    # 000       000  000      000       000      000       000     000     
    # 000       000  0000000  00000000  0000000  000  0000000      000     
    
    describe 'filelist', ->
    
        it "exists", -> _.isFunction filelist
        
        it "chdir", ->
            process.chdir "#{__dirname}"
            (process.cwd()).should.eql __dirname
            
        it "returns an array", -> _.isArray filelist '.'
        
        it "returns empty array", -> _.isEmpty filelist 'foobar', logError: false
        
        it "finds this file relative", ->
            (filelist '.').should.include 'test.coffee'
            
        it "finds this file absolute", ->
            (filelist __dirname).should.include slash.path __filename
            
        it "lists relative path with dot", ->
            (filelist('./dir').length).should.gt 0
            
        it "lists relative path without dot", ->
            (filelist('dir').length).should.gt 0
            
        it "ignores hidden files by default", ->
            (filelist 'dir').should.not.include slash.normalize 'dir/.konrad.noon'
            
        it "includes hidden files", ->
            (filelist 'dir', 'ignoreHidden': false).should.include slash.normalize 'dir/.konrad.noon'
            
        it "doesn't recurse by default", ->
            (filelist 'dir').should.eql [slash.normalize('dir/noext'), slash.normalize('dir/test.coffee'), slash.normalize('dir/test.js'), slash.normalize('dir/test.txt')]
            
        it "recurses if depth set", ->
            (filelist 'dir', depth: 2).should.eql [
                slash.normalize('dir/noext'), 
                slash.normalize('dir/test.coffee'), 
                slash.normalize('dir/test.js'), 
                slash.normalize('dir/test.txt'), 
                slash.normalize('dir/level1/test.coffee'), 
                slash.normalize('dir/level1/test.js'), 
                slash.normalize('dir/level1/test.txt'), 
                slash.normalize('dir/level1/level2/level2.coffee'), 
                slash.normalize('dir/level1b/level1b.coffee')]
                
        it "matches extension", ->
            (filelist 'dir', depth: 3, matchExt: slash.ext __filename).should.eql [
                slash.normalize('dir/test.coffee'), 
                slash.normalize('dir/level1/test.coffee'), 
                slash.normalize('dir/level1/level2/level2.coffee'), 
                slash.normalize('dir/level1/level2/level3/level3.coffee'), 
                slash.normalize('dir/level1b/level1b.coffee')]
    
    # 000   000  00000000    0000000    0000000  
    # 000  000   000   000  000   000  000       
    # 0000000    00000000   000   000  0000000   
    # 000  000   000        000   000       000  
    # 000   000  000         0000000   0000000   
    
    describe 'kpos', ->
    
        it "angle", ->
            (kpos(1,0).angle(kpos 0,1)).should.eql 90
            (kpos(1,0).angle(kpos 0,-1)).should.eql 90
            (kpos(0,10).angle(kpos 1,0)).should.eql 90
            (kpos(0,-10).angle(kpos 1,0)).should.eql 90
    
        it "rotation", ->
            (Math.round kpos(0,1).rotation(kpos 1,0)).should.eql 90
            (Math.round kpos(0,-1).rotation(kpos 1,0)).should.eql -90
            (Math.round kpos(1,1).rotation(kpos 1,0)).should.eql 45
            (Math.round kpos(1,-1).rotation(kpos 1,0)).should.eql -45
            (Math.round kpos(1,0).rotation(kpos 0,1)).should.eql -90
            (Math.round kpos(1,0).rotation(kpos 0,-1)).should.eql 90
    
        it "rotate", ->
            (kpos(1,0).rotate(90).rounded()).should.eql kpos(0,1)
            (kpos(1,0).rotate(-90).rounded()).should.eql kpos(0,-1)
            (kpos(1,0).rotate(45).rounded(0.001)).should.eql kpos(1,1).normal().rounded(0.001)
    
    #  0000000  000       0000000   00     00  00000000   
    # 000       000      000   000  000   000  000   000  
    # 000       000      000000000  000000000  00000000   
    # 000       000      000   000  000 0 000  000        
    #  0000000  0000000  000   000  000   000  000        
    
    describe 'clamp', ->
        
        it 'clamps', ->
            
            (clamp 0, 1, 1.1).should.eql 1
    
            (clamp 1, 0, 1.1).should.eql 1
            
            (clamp 2.2, 3, 1.1).should.eql 2.2
    
            (clamp 3, 2.2, 1.1).should.eql 2.2
            
        it 'nulls', ->
            
            (clamp 0, 1).should.eql 0
            
            (clamp 2, 3, undefined).should.eql 2
            
            (clamp 4, 5, null).should.eql 4
    
            (clamp 6, 7, {}).should.eql 6
    
            (clamp 8, 9, []).should.eql 8
    
            (clamp 10, 11, clamp).should.eql 10
            
            (clamp -3, -2, 0).should.eql -2
            
    # 00000000  00     00  00000000   000000000  000   000  
    # 000       000   000  000   000     000      000 000   
    # 0000000   000000000  00000000      000       00000    
    # 000       000 0 000  000           000        000     
    # 00000000  000   000  000           000        000     
    
    describe 'empty', ->
        
        it 'true', ->
            
            (empty ''    ).should.eql true
            
            (empty []    ).should.eql true
            
            (empty {}    ).should.eql true
            
            (empty null).should.eql true
            
            (empty undefined).should.eql true
            
        it 'false', ->
            
            (empty 1).should.eql false
            
            (empty 0).should.eql false
            
            (empty [[]]).should.eql false
            
            (empty a:null).should.eql false
            
            (empty ' ').should.eql false
            
            (empty Infinity).should.eql false
            
    # 000   000   0000000   000      000  0000000    
    # 000   000  000   000  000      000  000   000  
    #  000 000   000000000  000      000  000   000  
    #    000     000   000  000      000  000   000  
    #     0      000   000  0000000  000  0000000    
    
    describe 'valid', ->
        
        it 'false', ->
            
            (valid ''    ).should.eql false
            
            (valid []    ).should.eql false
            
            (valid {}    ).should.eql false
            
            (valid null).should.eql false
            
            (valid undefined).should.eql false
            
        it 'true', ->
            
            (valid 1).should.eql true
            
            (valid 0).should.eql true
            
            (valid [[]]).should.eql true
            
            (valid a:null).should.eql true
            
            (valid ' ').should.eql true
            
            (valid Infinity).should.eql true
        
    # 00000000  000  000      000000000  00000000  00000000   
    # 000       000  000         000     000       000   000  
    # 000000    000  000         000     0000000   0000000    
    # 000       000  000         000     000       000   000  
    # 000       000  0000000     000     00000000  000   000  
    
    describe 'filter', ->
        
        it 'array', ->
            
            (filter [1,2,3,4], (v,i) -> i % 2).should.eql [2,4]

            (filter [1,2,3,4], (v,i) -> v % 2).should.eql [1,3]
            
        it 'object', ->
            
            (filter {a:1,b:2,c:3,d:4}, (v,k) -> v % 2).should.eql {a:1,c:3}

            (filter {a:1,b:2,c:3,d:4}, (v,k) -> k in ['b', 'c']).should.eql {b:2,c:3}
            
        it 'value', ->            
            
            (filter(1, ->)).should.eql 1
            
            (filter("hello", ->)).should.eql "hello"
                
    # 000   0000000  000000000  00000000  000   000  000000000  
    # 000  000          000     000        000 000      000     
    # 000  0000000      000     0000000     00000       000     
    # 000       000     000     000        000 000      000     
    # 000  0000000      000     00000000  000   000     000     
    
    describe 'isText', ->
        
        it 'non binary', ->
            
            (slash.isText __dirname + '/dir/noext').should.eql true

        it 'binary', ->
            
            (slash.isText __dirname + '../img/kxk.png').should.eql false
            
    # 00000000   00000000   0000000   0000000    000000000  00000000  000   000  000000000  
    # 000   000  000       000   000  000   000     000     000        000 000      000     
    # 0000000    0000000   000000000  000   000     000     0000000     00000       000     
    # 000   000  000       000   000  000   000     000     000        000 000      000     
    # 000   000  00000000  000   000  0000000       000     00000000  000   000     000     
    
    describe 'readText', ->
        
        it 'reads text', ->
            
            (slash.readText __dirname + '/dir/noext').should.eql 'hello\n'

        it 'returns empty text if file doesnt exist', ->
            
            (slash.readText __dirname + '/dir/filedoesntexist').should.eql ''

        it 'reads text sync', (done) ->
            
            slash.readText __dirname + '/dir/noext', (text) ->
                (text).should.eql 'hello\n'
                done()

        it 'returns empty text if file doesnt exist sync', (done) ->
            
            slash.readText __dirname + '/dir/filedoesntexist', (text) ->
                (text).should.eql ''
                done()
        
            