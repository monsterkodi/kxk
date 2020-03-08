# 000000000  00000000   0000000  000000000
#    000     000       000          000
#    000     0000000   0000000      000
#    000     000            000     000
#    000     00000000  0000000      000

{ filelist, splitFileLine, slash, kpos, kstr, empty, valid, clamp, chai, kolor, filter, _ } = require '../'

kolor.globalize()
expect = chai().expect

describe 'kxk' ->

    # 00000000  000  000      00000000  000      000   0000000  000000000
    # 000       000  000      000       000      000  000          000
    # 000000    000  000      0000000   000      000  0000000      000
    # 000       000  000      000       000      000       000     000
    # 000       000  0000000  00000000  0000000  000  0000000      000

    describe 'filelist' ->

        it 'exists' -> _.isFunction filelist

        it 'chdir' -> 
            process.chdir __dirname 
            process.cwd().should.eql __dirname
        
        it 'returns an array', -> _.isArray filelist '.'

        it 'returns empty array' -> _.isEmpty filelist 'foobar' logError: false

        it 'finds this file relative' ->
            (filelist '.').should.include 'test.coffee'

        it 'finds this file absolute' ->
            (filelist __dirname).should.include slash.path __filename

        it "lists relative path with dot" ->
            (filelist('./dir').length).should.gt 0

        it "lists relative path without dot" ->
            (filelist('dir').length).should.gt 0

        it "ignores hidden files by default" ->
            (filelist 'dir').should.not.include slash.normalize 'dir/.konrad.noon'

        it "includes hidden files" ->
            (filelist 'dir' 'ignoreHidden': false).should.include slash.normalize 'dir/.konrad.noon'

        it "doesn't recurse by default" ->
            (filelist 'dir').should.eql [slash.normalize('dir/noext'), slash.normalize('dir/test.coffee'), slash.normalize('dir/test.js'), slash.normalize('dir/test.txt')]

        it "recurses if depth set" ->
            (filelist 'dir' depth: 2).should.eql [
                slash.normalize('dir/noext'),
                slash.normalize('dir/test.coffee'),
                slash.normalize('dir/test.js'),
                slash.normalize('dir/test.txt'),
                slash.normalize('dir/level1/test.coffee'),
                slash.normalize('dir/level1/test.js'),
                slash.normalize('dir/level1/test.txt'),
                slash.normalize('dir/level1/level2/level2.coffee'),
                slash.normalize('dir/level1b/level1b.coffee')]

        it "matches extension" ->
            (filelist 'dir' depth: 3, matchExt: slash.ext __filename).should.eql [
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

    describe 'kpos' ->

        it "angle" ->
            (kpos(1,0).angle(kpos 0,1)).should.eql 90
            (kpos(1,0).angle(kpos 0,-1)).should.eql 90
            (kpos(0,10).angle(kpos 1,0)).should.eql 90
            (kpos(0,-10).angle(kpos 1,0)).should.eql 90

        it "rotation" ->
            (Math.round kpos(0,1).rotation(kpos 1,0)).should.eql 90
            (Math.round kpos(0,-1).rotation(kpos 1,0)).should.eql -90
            (Math.round kpos(1,1).rotation(kpos 1,0)).should.eql 45
            (Math.round kpos(1,-1).rotation(kpos 1,0)).should.eql -45
            (Math.round kpos(1,0).rotation(kpos 0,1)).should.eql -90
            (Math.round kpos(1,0).rotation(kpos 0,-1)).should.eql 90

        it "rotate" ->
            (kpos(1,0).rotate(90).rounded()).should.eql kpos(0,1)
            (kpos(1,0).rotate(-90).rounded()).should.eql kpos(0,-1)
            (kpos(1,0).rotate(45).rounded(0.001)).should.eql kpos(1,1).normal().rounded(0.001)

    #  0000000  000       0000000   00     00  00000000
    # 000       000      000   000  000   000  000   000
    # 000       000      000000000  000000000  00000000
    # 000       000      000   000  000 0 000  000
    #  0000000  0000000  000   000  000   000  000

    describe 'clamp' ->

        it 'clamps' ->

            (clamp 0, 1, 1.1).should.eql 1

            (clamp 1, 0, 1.1).should.eql 1

            (clamp 2.2, 3, 1.1).should.eql 2.2

            (clamp 3, 2.2, 1.1).should.eql 2.2

        it 'nulls' ->

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

    describe 'empty' ->

        it 'true' ->

            (empty ''    ).should.eql true

            (empty []    ).should.eql true

            (empty {}    ).should.eql true

            (empty null).should.eql true

            (empty undefined).should.eql true

        it 'false' ->

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

    describe 'valid' ->

        it 'false' ->

            (valid ''    ).should.eql false

            (valid []    ).should.eql false

            (valid {}    ).should.eql false

            (valid null).should.eql false

            (valid undefined).should.eql false

        it 'true' ->

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

    describe 'filter' ->

        it 'array' ->

            (filter [1,2,3,4], (v,i) -> i % 2).should.eql [2,4]

            (filter [1,2,3,4], (v,i) -> v % 2).should.eql [1,3]

        it 'object' ->

            (filter {a:1,b:2,c:3,d:4}, (v,k) -> v % 2).should.eql {a:1,c:3}

            (filter {a:1,b:2,c:3,d:4}, (v,k) -> k in ['b', 'c']).should.eql {b:2,c:3}

        it 'value' ->

            (filter(1, ->)).should.eql 1

            (filter("hello" ->)).should.eql "hello"
