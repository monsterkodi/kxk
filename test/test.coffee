# 000000000  00000000   0000000  000000000  
#    000     000       000          000     
#    000     0000000   0000000      000     
#    000     000            000     000     
#    000     00000000  0000000      000     
{
fileList,
last,
log}   = require '../coffee/kxk'
_      = require 'lodash'
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
    
                