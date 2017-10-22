# 000000000  00000000   0000000  000000000  
#    000     000       000          000     
#    000     0000000   0000000      000     
#    000     000            000     000     
#    000     00000000  0000000      000     

{ fileList, pos, log, _ } = require '../coffee/kxk'

assert = require 'assert'
chai   = require 'chai'
path   = require 'path'
expect = chai.expect
chai.should()

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
        .to.include __filename
    it "ignores hidden files by default", ->
        expect fileList 'dir'
        .to.not.include 'dir/.konrad.noon'        
    it "includes hidden files", ->
        expect fileList 'dir', 'ignoreHidden': false
        .to.include 'dir/.konrad.noon'        
    it "doesn't recurse by default", -> 
        expect fileList 'dir'
        .to.eql ['dir/test.coffee', 'dir/test.js', 'dir/test.txt']
    it "recurses if depth set", -> 
        expect fileList 'dir', depth: 2
        .to.eql ['dir/test.coffee', 'dir/test.js', 'dir/test.txt', 'dir/level1/test.coffee', 'dir/level1/test.js', 'dir/level1/test.txt', 'dir/level1/level2/level2.coffee', 'dir/level1b/level1b.coffee']
    it "matches extension", ->
        expect fileList 'dir', depth: 3, matchExt: __filename
        .to.eql ['dir/test.coffee', 'dir/level1/test.coffee', 'dir/level1/level2/level2.coffee', 'dir/level1/level2/level3/level3.coffee', 'dir/level1b/level1b.coffee']

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
        
        
        