# 000000000  00000000   0000000  000000000
#    000     000       000          000
#    000     0000000   0000000      000
#    000     000            000     000
#    000     00000000  0000000      000

{ fileList, splitFileLine, slash, pos, empty, clamp, log, _ } = require '../' # '../coffee/kxk'

assert = require 'assert'
chai   = require 'chai'
expect = chai.expect
chai.should()

describe 'slash', ->
    
    it 'base', -> 
        
        expect slash.base '/some/path.txt'
        .to.eql 'path'
            
    it 'path', ->
        
        return if not slash.win()
        
        expect slash.path "C:\\Back\\Slash\\Crap"
        .to.eql "C:/Back/Slash/Crap"
        
        expect slash.path "C:\\Back\\Slash\\Crap\\..\\..\\To\\The\\..\\Future"
        .to.eql "C:/Back/To/Future"
        
    it 'join', ->
        
        expect slash.join 'a', 'b', 'c'
        .to.eql 'a/b/c'
        
        return if not slash.win()
        
        expect slash.join 'C:\\FOO', '.\\BAR', 'that\\sucks'
        .to.eql 'C:/FOO/BAR/that/sucks'

    it 'home', ->
        
        if slash.win()
            home = slash.path process.env['HOMEDRIVE'] + process.env['HOMEPATH']
        else
            home = process.env['HOME']
            
        expect slash.home()
        .to.eql home
        
        expect slash.tilde home
        .to.eql '~'

        expect slash.tilde home + '/sub'
        .to.eql '~/sub'
        
        expect slash.untilde '~/sub'
        .to.eql home + '/sub'

    it 'unenv', ->
        
        expect slash.unenv 'C:/$Recycle.bin'
        .to.eql 'C:/$Recycle.bin'

        return if not slash.win()

        expect slash.unenv '$HOME/test'
        .to.eql slash.path(process.env['HOME']) + '/test'

    it 'unslash', ->
        
        return if not slash.win()

        expect slash.unslash '/c/test'
        .to.eql 'C:\\test'
        
    it 'resolve', ->
        
        expect slash.resolve '~'
        .to.eql slash.home()

    it 'relative', ->
        
        expect slash.relative 'C:\\test\\some\\path.txt', 'C:\\test\\some\\other\\path'
        .to.eql '../../path.txt'
    
        expect slash.relative 'C:\\some\\path', 'C:/some/path'
        .to.eql '.'

        expect slash.relative 'C:/Users/kodi/s/konrad/app/js/coffee.js', 'C:/Users/kodi/s/konrad'
        .to.eql 'app/js/coffee.js'
            
    it 'parse', ->
        
        expect slash.parse('c:').root
        .to.eql 'c:/'

        expect slash.parse('c:').dir
        .to.eql 'c:/'
        
    it 'split', ->
        expect slash.split '/c/users/home/'
        .to.eql ['c', 'users', 'home']
        
        expect slash.split 'd/users/home'
        .to.eql ['d', 'users', 'home']
        
        expect slash.split 'c:/some/path'
        .to.eql ['c:', 'some', 'path']
        
        expect slash.split 'd:\\some\\path\\'
        .to.eql ['d:', 'some', 'path']
            
    it 'splitDrive', ->
        
        expect slash.splitDrive '/some/path'
        .to.eql ['/some/path', '']
        
        return if not slash.win()
        
        expect slash.splitDrive 'c:/some/path'
        .to.eql ['/some/path', 'c']
        
        expect slash.splitDrive 'c:\\some\\path'
        .to.eql ['/some/path', 'c']

        expect slash.splitDrive 'c:\\'
        .to.eql ['/', 'c']
        
        expect slash.splitDrive 'c:'
        .to.eql ['/', 'c']
        
    it 'removeDrive', ->
        
        expect slash.removeDrive '/some/path'
        .to.eql '/some/path'

        return if not slash.win()
        
        expect slash.removeDrive 'c:/some/path'
        .to.eql '/some/path'

        expect slash.removeDrive 'c:\\some\\path'
        .to.eql '/some/path'

        expect slash.removeDrive 'c:/'
        .to.eql '/'

        expect slash.removeDrive 'c:\\'
        .to.eql '/'
        
        expect slash.removeDrive 'c:'
        .to.eql '/'

    it 'splitFileLine', ->

        expect slash.splitFileLine '/some/path'
        .to.eql ['/some/path', 1, 0]
        
        expect slash.splitFileLine '/some/path:123'
        .to.eql ['/some/path', 123, 0]

        expect slash.splitFileLine '/some/path:123:15'
        .to.eql ['/some/path', 123, 15]

        return if not slash.win()
        
        expect slash.splitFileLine 'c:/some/path:123'
        .to.eql ['c:/some/path', 123, 0]

        expect slash.splitFileLine 'c:/some/path:123:15'
        .to.eql ['c:/some/path', 123, 15]

    it 'splitFilePos', ->

        expect slash.splitFilePos '/some/path'
        .to.eql ['/some/path', [0, 0]]

        expect slash.splitFilePos '/some/path:123'
        .to.eql ['/some/path', [0, 122]]

        expect slash.splitFilePos '/some/path:123:15'
        .to.eql ['/some/path', [15, 122]]

        return if not slash.win()
        
        expect slash.splitFilePos 'c:/some/path:123'
        .to.eql ['c:/some/path', [0, 122]]

        expect slash.splitFilePos 'c:/some/path:123:15'
        .to.eql ['c:/some/path', [15, 122]]
        
    it 'exists', ->

        expect slash.exists __dirname
        .to.exist

        expect slash.exists __filename
        .to.exist
        
        expect slash.exists __filename + 'foo'
        .to.not.exist
        
    it 'exists async', (done) ->
        
        slash.exists __filename, (f) ->
            expect slash.samePath f, __filename
            .to.eql true
            done()

    it 'exist async not', (done) ->
        
        slash.exists __filename + 'foo', (f) ->
            expect f
            .to.eql undefined
            done()
            
    it 'fileExists', ->

        expect slash.fileExists __filename
        .to.exist

        expect slash.fileExists __dirname
        .to.not.exist
        
    it 'dirExists', ->
        
        expect slash.dirExists __dirname
        .to.exist

        expect slash.dirExists __filename
        .to.not.exist

    it 'pkg', ->
        
        expect slash.pkg __dirname
        .to.exist

        expect slash.pkg __filename
        .to.exist

        expect slash.pkg 'C:\\'
        .to.not.exist
        
        expect slash.pkg 'C:'
        .to.not.exist
        
    it 'isRelative', ->
        
        expect slash.isRelative __dirname
        .to.eql false
        
        expect slash.isRelative '.'
        .to.eql true
        
        expect slash.isRelative '..'
        .to.eql true
        
        expect slash.isRelative '.././bla../../fark'
        .to.eql true

        expect slash.isRelative 'C:\\blafark'
        .to.eql false

        expect slash.isRelative '..\\blafark'
        .to.eql true
        
    it 'sanitize', ->
        
        expect slash.sanitize 'a.b\n'
        .to.eql 'a.b'

        expect slash.sanitize '\n\n c . d  \n\n\n'
        .to.eql ' c . d  '
        
describe 'fileList', ->

    it "exists", -> _.isFunction fileList
    
    it "chdir", ->
        process.chdir "#{__dirname}"
        expect process.cwd()
        .to.eql __dirname
        
    it "returns an array", -> _.isArray fileList '.'
    
    it "returns empty array", -> _.isEmpty fileList 'foobar', logError: false
    
    it "finds this file relative", ->
        expect fileList '.'
        .to.include 'test.coffee'
        
    it "finds this file absolute", ->
        expect fileList __dirname
        .to.include slash.path __filename
        
    it "lists relative path with dot", ->
        expect fileList('./dir').length
        .to.gt 0
        
    it "lists relative path without dot", ->
        expect fileList('dir').length
        .to.gt 0
        
    it "ignores hidden files by default", ->
        expect fileList 'dir'
        .to.not.include slash.normalize 'dir/.konrad.noon'
        
    it "includes hidden files", ->
        expect fileList 'dir', 'ignoreHidden': false
        .to.include slash.normalize 'dir/.konrad.noon'
        
    it "doesn't recurse by default", ->
        expect fileList 'dir'
        .to.eql [slash.normalize('dir/test.coffee'), slash.normalize('dir/test.js'), slash.normalize('dir/test.txt')]
        
    it "recurses if depth set", ->
        expect fileList 'dir', depth: 2
        .to.eql [
            slash.normalize('dir/test.coffee'), 
            slash.normalize('dir/test.js'), 
            slash.normalize('dir/test.txt'), 
            slash.normalize('dir/level1/test.coffee'), 
            slash.normalize('dir/level1/test.js'), 
            slash.normalize('dir/level1/test.txt'), 
            slash.normalize('dir/level1/level2/level2.coffee'), 
            slash.normalize('dir/level1b/level1b.coffee')]
            
    it "matches extension", ->
        expect fileList 'dir', depth: 3, matchExt: slash.ext __filename
        .to.eql [
            slash.normalize('dir/test.coffee'), 
            slash.normalize('dir/level1/test.coffee'), 
            slash.normalize('dir/level1/level2/level2.coffee'), 
            slash.normalize('dir/level1/level2/level3/level3.coffee'), 
            slash.normalize('dir/level1b/level1b.coffee')]

describe 'pos', ->

    it "angle", ->
        expect pos(1,0).angle(pos 0,1)
        .to.eql 90
        expect pos(1,0).angle(pos 0,-1)
        .to.eql 90
        expect pos(0,10).angle(pos 1,0)
        .to.eql 90
        expect pos(0,-10).angle(pos 1,0)
        .to.eql 90

    it "rotation", ->
        expect Math.round pos(0,1).rotation(pos 1,0)
        .to.eql 90
        expect Math.round pos(0,-1).rotation(pos 1,0)
        .to.eql -90
        expect Math.round pos(1,1).rotation(pos 1,0)
        .to.eql 45
        expect Math.round pos(1,-1).rotation(pos 1,0)
        .to.eql -45
        expect Math.round pos(1,0).rotation(pos 0,1)
        .to.eql -90
        expect Math.round pos(1,0).rotation(pos 0,-1)
        .to.eql 90

    it "rotate", ->
        expect pos(1,0).rotate(90).rounded()
        .to.eql pos(0,1)
        expect pos(1,0).rotate(-90).rounded()
        .to.eql pos(0,-1)
        expect pos(1,0).rotate(45).rounded(0.001)
        .to.eql pos(1,1).normal().rounded(0.001)

describe 'clamp', ->
    
    it 'clamps', ->
        
        expect clamp 0, 1, 1.1
        .to.eql 1

        expect clamp 1, 0, 1.1
        .to.eql 1
        
        expect clamp 2.2, 3, 1.1
        .to.eql 2.2

        expect clamp 3, 2.2, 1.1
        .to.eql 2.2
        
    it 'nulls', ->
        
        expect clamp 0, 1
        .to.eql 0
        
        expect clamp 2, 3, undefined
        .to.eql 2
        
        expect clamp 4, 5, null
        .to.eql 4

        expect clamp 6, 7, {}
        .to.eql 6

        expect clamp 8, 9, []
        .to.eql 8

        expect clamp 10, 11, clamp
        .to.eql 10
        
        expect clamp -3, -2, 0
        .to.eql -2
        
describe 'empty', ->
    
    it 'true', ->
        
        expect empty ''    
        .to.eql true
        
        expect empty []    
        .to.eql true
        
        expect empty {}    
        .to.eql true
        
        expect empty null
        .to.eql true
        
        expect empty undefined
        .to.eql true
        
    it 'false', ->
        
        expect empty 1
        .to.eql false
        
        expect empty 0
        .to.eql false
        
        expect empty [[]]
        .to.eql false
        
        expect empty a:null
        .to.eql false
        
        expect empty ' '
        .to.eql false
        
        expect empty Infinity
        .to.eql false
        
        