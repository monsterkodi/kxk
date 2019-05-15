// koffee 0.42.0
var _, assert, chai, clamp, empty, expect, filelist, filter, pos, ref, slash, splitFileLine, valid;

ref = require('../'), filelist = ref.filelist, splitFileLine = ref.splitFileLine, slash = ref.slash, pos = ref.pos, empty = ref.empty, valid = ref.valid, clamp = ref.clamp, filter = ref.filter, _ = ref._;

assert = require('assert');

chai = require('chai');

expect = chai.expect;

chai.should();

describe('kxk', function() {
    describe('slash', function() {
        it('dir', function() {
            expect(slash.dir('/some/path/file.txt')).to.eql('/some/path');
            expect(slash.dir('/some/dir/')).to.eql('/some');
            if (slash.win()) {
                expect(slash.dir('C:\\Back\\')).to.eql('C:/');
            }
            expect(slash.dir('../..')).to.eql('..');
            expect(slash.dir('/')).to.eql('');
            expect(slash.dir('.')).to.eql('');
            expect(slash.dir('..')).to.eql('');
            expect(slash.dir('~')).to.eql('');
            expect(slash.dir('./')).to.eql('');
            expect(slash.dir('../')).to.eql('');
            expect(slash.dir('~/')).to.eql('');
            if (slash.win()) {
                return expect(slash.dir('C:/')).to.eql('');
            }
        });
        it('pathlist', function() {
            expect(slash.pathlist('/some/path.txt')).to.eql(['/', '/some', '/some/path.txt']);
            expect(slash.pathlist('/')).to.eql(['/']);
            expect(slash.pathlist('')).to.eql([]);
            if (slash.win()) {
                expect(slash.pathlist('C:\\Back\\Slash\\')).to.eql(['C:/', 'C:/Back', 'C:/Back/Slash/']);
            }
            return expect(slash.pathlist('~')).to.eql(['~']);
        });
        it('base', function() {
            return expect(slash.base('/some/path.txt')).to.eql('path');
        });
        it('path', function() {
            if (!slash.win()) {
                return;
            }
            expect(slash.path("C:\\Back\\Slash\\Crap")).to.eql("C:/Back/Slash/Crap");
            return expect(slash.path("C:\\Back\\Slash\\Crap\\..\\..\\To\\The\\..\\Future")).to.eql("C:/Back/To/Future");
        });
        it('join', function() {
            expect(slash.join('a', 'b', 'c')).to.eql('a/b/c');
            if (!slash.win()) {
                return;
            }
            return expect(slash.join('C:\\FOO', '.\\BAR', 'that\\sucks')).to.eql('C:/FOO/BAR/that/sucks');
        });
        it('home', function() {
            var home;
            if (slash.win()) {
                home = slash.path(process.env['HOMEDRIVE'] + process.env['HOMEPATH']);
            } else {
                home = process.env['HOME'];
            }
            expect(slash.home()).to.eql(home);
            expect(slash.tilde(home)).to.eql('~');
            expect(slash.tilde(home + '/sub')).to.eql('~/sub');
            return expect(slash.untilde('~/sub')).to.eql(home + '/sub');
        });
        it('unenv', function() {
            expect(slash.unenv('C:/$Recycle.bin')).to.eql('C:/$Recycle.bin');
            if (!slash.win()) {
                return;
            }
            return expect(slash.unenv('$HOME/test')).to.eql(slash.path(process.env['HOME']) + '/test');
        });
        it('unslash', function() {
            if (!slash.win()) {
                return;
            }
            return expect(slash.unslash('/c/test')).to.eql('C:\\test');
        });
        it('resolve', function() {
            return expect(slash.resolve('~')).to.eql(slash.home());
        });
        it('relative', function() {
            expect(slash.relative('C:\\test\\some\\path.txt', 'C:\\test\\some\\other\\path')).to.eql('../../path.txt');
            expect(slash.relative('C:\\some\\path', 'C:/some/path')).to.eql('.');
            expect(slash.relative('C:/Users/kodi/s/konrad/app/js/coffee.js', 'C:/Users/kodi/s/konrad')).to.eql('app/js/coffee.js');
            if (slash.win()) {
                expect(slash.relative('C:/some/path/on.c', 'D:/path/on.d')).to.eql('C:/some/path/on.c');
                return expect(slash.relative('C:\\some\\path\\on.c', 'D:\\path\\on.d')).to.eql('C:/some/path/on.c');
            }
        });
        it('parse', function() {
            if (!slash.win()) {
                return;
            }
            expect(slash.parse('c:').root).to.eql('c:/');
            return expect(slash.parse('c:').dir).to.eql('c:/');
        });
        it('split', function() {
            expect(slash.split('/c/users/home/')).to.eql(['c', 'users', 'home']);
            expect(slash.split('d/users/home')).to.eql(['d', 'users', 'home']);
            expect(slash.split('c:/some/path')).to.eql(['c:', 'some', 'path']);
            return expect(slash.split('d:\\some\\path\\')).to.eql(['d:', 'some', 'path']);
        });
        it('splitDrive', function() {
            expect(slash.splitDrive('/some/path')).to.eql(['/some/path', '']);
            if (!slash.win()) {
                return;
            }
            expect(slash.splitDrive('c:/some/path')).to.eql(['/some/path', 'c']);
            expect(slash.splitDrive('c:\\some\\path')).to.eql(['/some/path', 'c']);
            expect(slash.splitDrive('c:\\')).to.eql(['/', 'c']);
            return expect(slash.splitDrive('c:')).to.eql(['/', 'c']);
        });
        it('removeDrive', function() {
            expect(slash.removeDrive('/some/path')).to.eql('/some/path');
            if (!slash.win()) {
                return;
            }
            expect(slash.removeDrive('c:/some/path')).to.eql('/some/path');
            expect(slash.removeDrive('c:\\some\\path')).to.eql('/some/path');
            expect(slash.removeDrive('c:/')).to.eql('/');
            expect(slash.removeDrive('c:\\')).to.eql('/');
            return expect(slash.removeDrive('c:')).to.eql('/');
        });
        it('splitFileLine', function() {
            expect(slash.splitFileLine('/some/path')).to.eql(['/some/path', 1, 0]);
            expect(slash.splitFileLine('/some/path:123')).to.eql(['/some/path', 123, 0]);
            expect(slash.splitFileLine('/some/path:123:15')).to.eql(['/some/path', 123, 15]);
            if (!slash.win()) {
                return;
            }
            expect(slash.splitFileLine('c:/some/path:123')).to.eql(['c:/some/path', 123, 0]);
            return expect(slash.splitFileLine('c:/some/path:123:15')).to.eql(['c:/some/path', 123, 15]);
        });
        it('splitFilePos', function() {
            expect(slash.splitFilePos('/some/path')).to.eql(['/some/path', [0, 0]]);
            expect(slash.splitFilePos('/some/path:123')).to.eql(['/some/path', [0, 122]]);
            expect(slash.splitFilePos('/some/path:123:15')).to.eql(['/some/path', [15, 122]]);
            if (!slash.win()) {
                return;
            }
            expect(slash.splitFilePos('c:/some/path:123')).to.eql(['c:/some/path', [0, 122]]);
            return expect(slash.splitFilePos('c:/some/path:123:15')).to.eql(['c:/some/path', [15, 122]]);
        });
        it('joinFilePos', function() {
            expect(slash.joinFilePos('/some/path', [0, 0])).to.eql('/some/path:1');
            expect(slash.joinFilePos('/some/path', [0, 4])).to.eql('/some/path:5');
            expect(slash.joinFilePos('/some/path', [1, 5])).to.eql('/some/path:6:1');
            expect(slash.joinFilePos('/some/path')).to.eql('/some/path');
            return expect(slash.joinFilePos('/some/path', [])).to.eql('/some/path');
        });
        it('exists', function() {
            expect(slash.exists(__dirname)).to.exist;
            expect(slash.exists(__filename)).to.exist;
            return expect(slash.exists(__filename + 'foo')).to.eql(false);
        });
        it('exists async', function(done) {
            return slash.exists(__filename, function(stat) {
                expect(stat).to.exist;
                return done();
            });
        });
        it('exist async not', function(done) {
            return slash.exists(__filename + 'foo', function(stat) {
                expect(stat).to.not.exist;
                return done();
            });
        });
        it('fileExists', function() {
            expect(slash.fileExists(__filename)).to.exist;
            return expect(slash.fileExists(__dirname)).to.not.exist;
        });
        it('dirExists', function() {
            expect(slash.dirExists(__dirname)).to.exist;
            return expect(slash.dirExists(__filename)).to.not.exist;
        });
        it('pkg', function() {
            expect(slash.pkg(__dirname)).to.exist;
            expect(slash.pkg(__filename)).to.exist;
            expect(slash.pkg('C:\\')).to.not.exist;
            return expect(slash.pkg('C:')).to.not.exist;
        });
        it('isRelative', function() {
            expect(slash.isRelative(__dirname)).to.eql(false);
            expect(slash.isRelative('.')).to.eql(true);
            expect(slash.isRelative('..')).to.eql(true);
            expect(slash.isRelative('.././bla../../fark')).to.eql(true);
            if (!slash.win()) {
                return;
            }
            expect(slash.isRelative('C:\\blafark')).to.eql(false);
            return expect(slash.isRelative('..\\blafark')).to.eql(true);
        });
        return it('sanitize', function() {
            expect(slash.sanitize('a.b\n')).to.eql('a.b');
            return expect(slash.sanitize('\n\n c . d  \n\n\n')).to.eql(' c . d  ');
        });
    });
    describe('filelist', function() {
        it("exists", function() {
            return _.isFunction(filelist);
        });
        it("chdir", function() {
            process.chdir("" + __dirname);
            return expect(process.cwd()).to.eql(__dirname);
        });
        it("returns an array", function() {
            return _.isArray(filelist('.'));
        });
        it("returns empty array", function() {
            return _.isEmpty(filelist('foobar', {
                logError: false
            }));
        });
        it("finds this file relative", function() {
            return expect(filelist('.')).to.include('test.coffee');
        });
        it("finds this file absolute", function() {
            return expect(filelist(__dirname)).to.include(slash.path(__filename));
        });
        it("lists relative path with dot", function() {
            return expect(filelist('./dir').length).to.gt(0);
        });
        it("lists relative path without dot", function() {
            return expect(filelist('dir').length).to.gt(0);
        });
        it("ignores hidden files by default", function() {
            return expect(filelist('dir')).to.not.include(slash.normalize('dir/.konrad.noon'));
        });
        it("includes hidden files", function() {
            return expect(filelist('dir', {
                'ignoreHidden': false
            })).to.include(slash.normalize('dir/.konrad.noon'));
        });
        it("doesn't recurse by default", function() {
            return expect(filelist('dir')).to.eql([slash.normalize('dir/noext'), slash.normalize('dir/test.coffee'), slash.normalize('dir/test.js'), slash.normalize('dir/test.txt')]);
        });
        it("recurses if depth set", function() {
            return expect(filelist('dir', {
                depth: 2
            })).to.eql([slash.normalize('dir/noext'), slash.normalize('dir/test.coffee'), slash.normalize('dir/test.js'), slash.normalize('dir/test.txt'), slash.normalize('dir/level1/test.coffee'), slash.normalize('dir/level1/test.js'), slash.normalize('dir/level1/test.txt'), slash.normalize('dir/level1/level2/level2.coffee'), slash.normalize('dir/level1b/level1b.coffee')]);
        });
        return it("matches extension", function() {
            return expect(filelist('dir', {
                depth: 3,
                matchExt: slash.ext(__filename)
            })).to.eql([slash.normalize('dir/test.coffee'), slash.normalize('dir/level1/test.coffee'), slash.normalize('dir/level1/level2/level2.coffee'), slash.normalize('dir/level1/level2/level3/level3.coffee'), slash.normalize('dir/level1b/level1b.coffee')]);
        });
    });
    describe('pos', function() {
        it("angle", function() {
            expect(pos(1, 0).angle(pos(0, 1))).to.eql(90);
            expect(pos(1, 0).angle(pos(0, -1))).to.eql(90);
            expect(pos(0, 10).angle(pos(1, 0))).to.eql(90);
            return expect(pos(0, -10).angle(pos(1, 0))).to.eql(90);
        });
        it("rotation", function() {
            expect(Math.round(pos(0, 1).rotation(pos(1, 0)))).to.eql(90);
            expect(Math.round(pos(0, -1).rotation(pos(1, 0)))).to.eql(-90);
            expect(Math.round(pos(1, 1).rotation(pos(1, 0)))).to.eql(45);
            expect(Math.round(pos(1, -1).rotation(pos(1, 0)))).to.eql(-45);
            expect(Math.round(pos(1, 0).rotation(pos(0, 1)))).to.eql(-90);
            return expect(Math.round(pos(1, 0).rotation(pos(0, -1)))).to.eql(90);
        });
        return it("rotate", function() {
            expect(pos(1, 0).rotate(90).rounded()).to.eql(pos(0, 1));
            expect(pos(1, 0).rotate(-90).rounded()).to.eql(pos(0, -1));
            return expect(pos(1, 0).rotate(45).rounded(0.001)).to.eql(pos(1, 1).normal().rounded(0.001));
        });
    });
    describe('clamp', function() {
        it('clamps', function() {
            expect(clamp(0, 1, 1.1)).to.eql(1);
            expect(clamp(1, 0, 1.1)).to.eql(1);
            expect(clamp(2.2, 3, 1.1)).to.eql(2.2);
            return expect(clamp(3, 2.2, 1.1)).to.eql(2.2);
        });
        return it('nulls', function() {
            expect(clamp(0, 1)).to.eql(0);
            expect(clamp(2, 3, void 0)).to.eql(2);
            expect(clamp(4, 5, null)).to.eql(4);
            expect(clamp(6, 7, {})).to.eql(6);
            expect(clamp(8, 9, [])).to.eql(8);
            expect(clamp(10, 11, clamp)).to.eql(10);
            return expect(clamp(-3, -2, 0)).to.eql(-2);
        });
    });
    describe('empty', function() {
        it('true', function() {
            expect(empty('')).to.eql(true);
            expect(empty([])).to.eql(true);
            expect(empty({})).to.eql(true);
            expect(empty(null)).to.eql(true);
            return expect(empty(void 0)).to.eql(true);
        });
        return it('false', function() {
            expect(empty(1)).to.eql(false);
            expect(empty(0)).to.eql(false);
            expect(empty([[]])).to.eql(false);
            expect(empty({
                a: null
            })).to.eql(false);
            expect(empty(' ')).to.eql(false);
            return expect(empty(2e308)).to.eql(false);
        });
    });
    describe('valid', function() {
        it('false', function() {
            expect(valid('')).to.eql(false);
            expect(valid([])).to.eql(false);
            expect(valid({})).to.eql(false);
            expect(valid(null)).to.eql(false);
            return expect(valid(void 0)).to.eql(false);
        });
        return it('true', function() {
            expect(valid(1)).to.eql(true);
            expect(valid(0)).to.eql(true);
            expect(valid([[]])).to.eql(true);
            expect(valid({
                a: null
            })).to.eql(true);
            expect(valid(' ')).to.eql(true);
            return expect(valid(2e308)).to.eql(true);
        });
    });
    describe('filter', function() {
        it('array', function() {
            expect(filter([1, 2, 3, 4], function(v, i) {
                return i % 2;
            })).to.eql([2, 4]);
            return expect(filter([1, 2, 3, 4], function(v, i) {
                return v % 2;
            })).to.eql([1, 3]);
        });
        it('object', function() {
            expect(filter({
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }, function(v, k) {
                return v % 2;
            })).to.eql({
                a: 1,
                c: 3
            });
            return expect(filter({
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }, function(v, k) {
                return k === 'b' || k === 'c';
            })).to.eql({
                b: 2,
                c: 3
            });
        });
        return it('value', function() {
            expect(filter(1, function() {})).to.eql(1);
            return expect(filter("hello", function() {})).to.eql("hello");
        });
    });
    return describe('isText', function() {
        return it('non binary', function() {
            return expect(slash.isText(__dirname + '/dir/noext')).to.eql(true);
        });
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBMEUsT0FBQSxDQUFRLEtBQVIsQ0FBMUUsRUFBRSx1QkFBRixFQUFZLGlDQUFaLEVBQTJCLGlCQUEzQixFQUFrQyxhQUFsQyxFQUF1QyxpQkFBdkMsRUFBOEMsaUJBQTlDLEVBQXFELGlCQUFyRCxFQUE0RCxtQkFBNUQsRUFBb0U7O0FBRXBFLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsTUFBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxJQUFJLENBQUMsTUFBTCxDQUFBOztBQUVBLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFNBQUE7SUFFWixRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBO1FBRWQsRUFBQSxDQUFHLEtBQUgsRUFBVSxTQUFBO1lBRU4sTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUscUJBQVYsQ0FBUCxDQUNBLENBQUMsRUFBRSxDQUFDLEdBREosQ0FDUSxZQURSO1lBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsWUFBVixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLE9BRFI7WUFHQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtnQkFDSSxNQUFBLENBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxZQUFWLENBQVAsQ0FDQSxDQUFDLEVBQUUsQ0FBQyxHQURKLENBQ1EsS0FEUixFQURKOztZQUlBLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBTixDQUFVLE9BQVYsQ0FBUCxDQUNBLENBQUMsRUFBRSxDQUFDLEdBREosQ0FDUSxJQURSO1lBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsR0FBVixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLEVBRFI7WUFHQSxNQUFBLENBQU8s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Q0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQURSO21CQUdBLE1BQUEsQ0FBTyxNQUFBLENBQU87Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7Z0JBQVMsQ0FBQSxFQUFFLENBQVg7Z0JBQWEsQ0FBQSxFQUFFLENBQWY7YUFBUCxFQUEwQixTQUFDLENBQUQsRUFBRyxDQUFIO3VCQUFTLENBQUEsS0FBTSxHQUFOLElBQUEsQ0FBQSxLQUFXO1lBQXBCLENBQTFCLENBQVAsQ0FDQSxDQUFDLEVBQUUsQ0FBQyxHQURKLENBQ1E7Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7YUFEUjtRQUxTLENBQWI7ZUFRQSxFQUFBLENBQUcsT0FBSCxFQUFZLFNBQUE7WUFFUixNQUFBLENBQU8sTUFBQSxDQUFPLENBQVAsRUFBVSxTQUFBLEdBQUEsQ0FBVixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLENBRFI7bUJBR0EsTUFBQSxDQUFPLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLFNBQUEsR0FBQSxDQUFoQixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLE9BRFI7UUFMUSxDQUFaO0lBbEJlLENBQW5CO1dBMEJBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7ZUFFZixFQUFBLENBQUcsWUFBSCxFQUFpQixTQUFBO21CQUViLE1BQUEsQ0FBTyxLQUFLLENBQUMsTUFBTixDQUFhLFNBQUEsR0FBWSxZQUF6QixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLElBRFI7UUFGYSxDQUFqQjtJQUZlLENBQW5CO0FBL2tCWSxDQUFoQiIsInNvdXJjZXNDb250ZW50IjpbIiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDBcbiMgICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMFxuIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwXG5cbnsgZmlsZWxpc3QsIHNwbGl0RmlsZUxpbmUsIHNsYXNoLCBwb3MsIGVtcHR5LCB2YWxpZCwgY2xhbXAsIGZpbHRlciwgXyB9ID0gcmVxdWlyZSAnLi4vJyAjICcuLi9jb2ZmZWUva3hrJ1xuXG5hc3NlcnQgPSByZXF1aXJlICdhc3NlcnQnXG5jaGFpICAgPSByZXF1aXJlICdjaGFpJ1xuZXhwZWN0ID0gY2hhaS5leHBlY3RcbmNoYWkuc2hvdWxkKClcblxuZGVzY3JpYmUgJ2t4aycsIC0+XG4gICAgXG4gICAgZGVzY3JpYmUgJ3NsYXNoJywgLT5cblxuICAgICAgICBpdCAnZGlyJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnL3NvbWUvcGF0aC9maWxlLnR4dCdcbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGgnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy9zb21lL2Rpci8nXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICdDOlxcXFxCYWNrXFxcXCdcbiAgICAgICAgICAgICAgICAudG8uZXFsICdDOi8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy4uLy4uJ1xuICAgICAgICAgICAgLnRvLmVxbCAnLi4nXG5cbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy8nXG4gICAgICAgICAgICAudG8uZXFsICcnXG5cbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy4nXG4gICAgICAgICAgICAudG8uZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy4uJ1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICd+J1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcuLydcbiAgICAgICAgICAgIC50by5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnLi4vJ1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICd+LydcbiAgICAgICAgICAgIC50by5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICdDOi8nXG4gICAgICAgICAgICAgICAgLnRvLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdwYXRobGlzdCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXRobGlzdCAnL3NvbWUvcGF0aC50eHQnXG4gICAgICAgICAgICAudG8uZXFsIFsnLycsICcvc29tZScsICcvc29tZS9wYXRoLnR4dCddXG5cbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXRobGlzdCAnLydcbiAgICAgICAgICAgIC50by5lcWwgWycvJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhdGhsaXN0ICcnXG4gICAgICAgICAgICAudG8uZXFsIFtdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhdGhsaXN0ICdDOlxcXFxCYWNrXFxcXFNsYXNoXFxcXCdcbiAgICAgICAgICAgICAgICAudG8uZXFsIFsnQzovJywgJ0M6L0JhY2snLCAnQzovQmFjay9TbGFzaC8nXVxuXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGF0aGxpc3QgJ34nXG4gICAgICAgICAgICAudG8uZXFsIFsnfiddXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgJ2Jhc2UnLCAtPiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmJhc2UgJy9zb21lL3BhdGgudHh0J1xuICAgICAgICAgICAgLnRvLmVxbCAncGF0aCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgJ3BhdGgnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXRoIFwiQzpcXFxcQmFja1xcXFxTbGFzaFxcXFxDcmFwXCJcbiAgICAgICAgICAgIC50by5lcWwgXCJDOi9CYWNrL1NsYXNoL0NyYXBcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGF0aCBcIkM6XFxcXEJhY2tcXFxcU2xhc2hcXFxcQ3JhcFxcXFwuLlxcXFwuLlxcXFxUb1xcXFxUaGVcXFxcLi5cXFxcRnV0dXJlXCJcbiAgICAgICAgICAgIC50by5lcWwgXCJDOi9CYWNrL1RvL0Z1dHVyZVwiXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2pvaW4nLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guam9pbiAnYScsICdiJywgJ2MnXG4gICAgICAgICAgICAudG8uZXFsICdhL2IvYydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guam9pbiAnQzpcXFxcRk9PJywgJy5cXFxcQkFSJywgJ3RoYXRcXFxcc3Vja3MnXG4gICAgICAgICAgICAudG8uZXFsICdDOi9GT08vQkFSL3RoYXQvc3Vja3MnXG4gICAgXG4gICAgICAgIGl0ICdob21lJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBob21lID0gc2xhc2gucGF0aCBwcm9jZXNzLmVudlsnSE9NRURSSVZFJ10gKyBwcm9jZXNzLmVudlsnSE9NRVBBVEgnXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGhvbWUgPSBwcm9jZXNzLmVudlsnSE9NRSddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaG9tZSgpXG4gICAgICAgICAgICAudG8uZXFsIGhvbWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnRpbGRlIGhvbWVcbiAgICAgICAgICAgIC50by5lcWwgJ34nXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gudGlsZGUgaG9tZSArICcvc3ViJ1xuICAgICAgICAgICAgLnRvLmVxbCAnfi9zdWInXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC51bnRpbGRlICd+L3N1YidcbiAgICAgICAgICAgIC50by5lcWwgaG9tZSArICcvc3ViJ1xuICAgIFxuICAgICAgICBpdCAndW5lbnYnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gudW5lbnYgJ0M6LyRSZWN5Y2xlLmJpbidcbiAgICAgICAgICAgIC50by5lcWwgJ0M6LyRSZWN5Y2xlLmJpbidcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC51bmVudiAnJEhPTUUvdGVzdCdcbiAgICAgICAgICAgIC50by5lcWwgc2xhc2gucGF0aChwcm9jZXNzLmVudlsnSE9NRSddKSArICcvdGVzdCdcbiAgICBcbiAgICAgICAgaXQgJ3Vuc2xhc2gnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gudW5zbGFzaCAnL2MvdGVzdCdcbiAgICAgICAgICAgIC50by5lcWwgJ0M6XFxcXHRlc3QnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3Jlc29sdmUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVzb2x2ZSAnfidcbiAgICAgICAgICAgIC50by5lcWwgc2xhc2guaG9tZSgpXG4gICAgXG4gICAgICAgIGl0ICdyZWxhdGl2ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZWxhdGl2ZSAnQzpcXFxcdGVzdFxcXFxzb21lXFxcXHBhdGgudHh0JywgJ0M6XFxcXHRlc3RcXFxcc29tZVxcXFxvdGhlclxcXFxwYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCAnLi4vLi4vcGF0aC50eHQnXG4gICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbGF0aXZlICdDOlxcXFxzb21lXFxcXHBhdGgnLCAnQzovc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCAnLidcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZWxhdGl2ZSAnQzovVXNlcnMva29kaS9zL2tvbnJhZC9hcHAvanMvY29mZmVlLmpzJywgJ0M6L1VzZXJzL2tvZGkvcy9rb25yYWQnXG4gICAgICAgICAgICAudG8uZXFsICdhcHAvanMvY29mZmVlLmpzJ1xuXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZWxhdGl2ZSAnQzovc29tZS9wYXRoL29uLmMnLCAnRDovcGF0aC9vbi5kJ1xuICAgICAgICAgICAgICAgIC50by5lcWwgJ0M6L3NvbWUvcGF0aC9vbi5jJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZWxhdGl2ZSAnQzpcXFxcc29tZVxcXFxwYXRoXFxcXG9uLmMnLCAnRDpcXFxccGF0aFxcXFxvbi5kJ1xuICAgICAgICAgICAgICAgIC50by5lcWwgJ0M6L3NvbWUvcGF0aC9vbi5jJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdwYXJzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXJzZSgnYzonKS5yb290XG4gICAgICAgICAgICAudG8uZXFsICdjOi8nXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGFyc2UoJ2M6JykuZGlyXG4gICAgICAgICAgICAudG8uZXFsICdjOi8nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3NwbGl0JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0ICcvYy91c2Vycy9ob21lLydcbiAgICAgICAgICAgIC50by5lcWwgWydjJywgJ3VzZXJzJywgJ2hvbWUnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXQgJ2QvdXNlcnMvaG9tZSdcbiAgICAgICAgICAgIC50by5lcWwgWydkJywgJ3VzZXJzJywgJ2hvbWUnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXQgJ2M6L3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgWydjOicsICdzb21lJywgJ3BhdGgnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXQgJ2Q6XFxcXHNvbWVcXFxccGF0aFxcXFwnXG4gICAgICAgICAgICAudG8uZXFsIFsnZDonLCAnc29tZScsICdwYXRoJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgJ3NwbGl0RHJpdmUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXREcml2ZSAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgJyddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RHJpdmUgJ2M6L3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgJ2MnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXREcml2ZSAnYzpcXFxcc29tZVxcXFxwYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCAnYyddXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXREcml2ZSAnYzpcXFxcJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy8nLCAnYyddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdERyaXZlICdjOidcbiAgICAgICAgICAgIC50by5lcWwgWycvJywgJ2MnXVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdyZW1vdmVEcml2ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZW1vdmVEcml2ZSAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGgnXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZW1vdmVEcml2ZSAnYzovc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aCdcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZW1vdmVEcml2ZSAnYzpcXFxcc29tZVxcXFxwYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aCdcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZW1vdmVEcml2ZSAnYzovJ1xuICAgICAgICAgICAgLnRvLmVxbCAnLydcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZW1vdmVEcml2ZSAnYzpcXFxcJ1xuICAgICAgICAgICAgLnRvLmVxbCAnLydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbW92ZURyaXZlICdjOidcbiAgICAgICAgICAgIC50by5lcWwgJy8nXG4gICAgXG4gICAgICAgIGl0ICdzcGxpdEZpbGVMaW5lJywgLT5cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVMaW5lICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCAxLCAwXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlTGluZSAnL3NvbWUvcGF0aDoxMjMnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsIDEyMywgMF1cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVMaW5lICcvc29tZS9wYXRoOjEyMzoxNSdcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgMTIzLCAxNV1cbiAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZUxpbmUgJ2M6L3NvbWUvcGF0aDoxMjMnXG4gICAgICAgICAgICAudG8uZXFsIFsnYzovc29tZS9wYXRoJywgMTIzLCAwXVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZUxpbmUgJ2M6L3NvbWUvcGF0aDoxMjM6MTUnXG4gICAgICAgICAgICAudG8uZXFsIFsnYzovc29tZS9wYXRoJywgMTIzLCAxNV1cbiAgICBcbiAgICAgICAgaXQgJ3NwbGl0RmlsZVBvcycsIC0+XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlUG9zICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCBbMCwgMF1dXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlUG9zICcvc29tZS9wYXRoOjEyMydcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgWzAsIDEyMl1dXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlUG9zICcvc29tZS9wYXRoOjEyMzoxNSdcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgWzE1LCAxMjJdXVxuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlUG9zICdjOi9zb21lL3BhdGg6MTIzJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2M6L3NvbWUvcGF0aCcsIFswLCAxMjJdXVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZVBvcyAnYzovc29tZS9wYXRoOjEyMzoxNSdcbiAgICAgICAgICAgIC50by5lcWwgWydjOi9zb21lL3BhdGgnLCBbMTUsIDEyMl1dXG5cbiAgICAgICAgaXQgJ2pvaW5GaWxlUG9zJywgLT5cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5qb2luRmlsZVBvcyAnL3NvbWUvcGF0aCcsIFswLDBdXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoOjEnXG5cbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5qb2luRmlsZVBvcyAnL3NvbWUvcGF0aCcsIFswLDRdXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoOjUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5qb2luRmlsZVBvcyAnL3NvbWUvcGF0aCcsIFsxLDVdXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoOjY6MSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aCdcblxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgW11cbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGgnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2V4aXN0cycsIC0+XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZXhpc3RzIF9fZGlybmFtZVxuICAgICAgICAgICAgLnRvLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZXhpc3RzIF9fZmlsZW5hbWVcbiAgICAgICAgICAgIC50by5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZXhpc3RzIF9fZmlsZW5hbWUgKyAnZm9vJ1xuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdleGlzdHMgYXN5bmMnLCAoZG9uZSkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2xhc2guZXhpc3RzIF9fZmlsZW5hbWUsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdCBzdGF0XG4gICAgICAgICAgICAgICAgLnRvLmV4aXN0XG4gICAgICAgICAgICAgICAgZG9uZSgpXG4gICAgXG4gICAgICAgIGl0ICdleGlzdCBhc3luYyBub3QnLCAoZG9uZSkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2xhc2guZXhpc3RzIF9fZmlsZW5hbWUgKyAnZm9vJywgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgZXhwZWN0IHN0YXRcbiAgICAgICAgICAgICAgICAudG8ubm90LmV4aXN0XG4gICAgICAgICAgICAgICAgZG9uZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdmaWxlRXhpc3RzJywgLT5cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5maWxlRXhpc3RzIF9fZmlsZW5hbWVcbiAgICAgICAgICAgIC50by5leGlzdFxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmZpbGVFeGlzdHMgX19kaXJuYW1lXG4gICAgICAgICAgICAudG8ubm90LmV4aXN0XG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2RpckV4aXN0cycsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXJFeGlzdHMgX19kaXJuYW1lXG4gICAgICAgICAgICAudG8uZXhpc3RcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXJFeGlzdHMgX19maWxlbmFtZVxuICAgICAgICAgICAgLnRvLm5vdC5leGlzdFxuICAgIFxuICAgICAgICBpdCAncGtnJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBrZyBfX2Rpcm5hbWVcbiAgICAgICAgICAgIC50by5leGlzdFxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBrZyBfX2ZpbGVuYW1lXG4gICAgICAgICAgICAudG8uZXhpc3RcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wa2cgJ0M6XFxcXCdcbiAgICAgICAgICAgIC50by5ub3QuZXhpc3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBrZyAnQzonXG4gICAgICAgICAgICAudG8ubm90LmV4aXN0XG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2lzUmVsYXRpdmUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaXNSZWxhdGl2ZSBfX2Rpcm5hbWVcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzUmVsYXRpdmUgJy4nXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzUmVsYXRpdmUgJy4uJ1xuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5pc1JlbGF0aXZlICcuLi8uL2JsYS4uLy4uL2ZhcmsnXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzUmVsYXRpdmUgJ0M6XFxcXGJsYWZhcmsnXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaXNSZWxhdGl2ZSAnLi5cXFxcYmxhZmFyaydcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdzYW5pdGl6ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zYW5pdGl6ZSAnYS5iXFxuJ1xuICAgICAgICAgICAgLnRvLmVxbCAnYS5iJ1xuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNhbml0aXplICdcXG5cXG4gYyAuIGQgIFxcblxcblxcbidcbiAgICAgICAgICAgIC50by5lcWwgJyBjIC4gZCAgJ1xuICAgICAgICAgICAgXG4gICAgZGVzY3JpYmUgJ2ZpbGVsaXN0JywgLT5cbiAgICBcbiAgICAgICAgaXQgXCJleGlzdHNcIiwgLT4gXy5pc0Z1bmN0aW9uIGZpbGVsaXN0XG4gICAgICAgIFxuICAgICAgICBpdCBcImNoZGlyXCIsIC0+XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyIFwiI3tfX2Rpcm5hbWV9XCJcbiAgICAgICAgICAgIGV4cGVjdCBwcm9jZXNzLmN3ZCgpXG4gICAgICAgICAgICAudG8uZXFsIF9fZGlybmFtZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwicmV0dXJucyBhbiBhcnJheVwiLCAtPiBfLmlzQXJyYXkgZmlsZWxpc3QgJy4nXG4gICAgICAgIFxuICAgICAgICBpdCBcInJldHVybnMgZW1wdHkgYXJyYXlcIiwgLT4gXy5pc0VtcHR5IGZpbGVsaXN0ICdmb29iYXInLCBsb2dFcnJvcjogZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGl0IFwiZmluZHMgdGhpcyBmaWxlIHJlbGF0aXZlXCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QgJy4nXG4gICAgICAgICAgICAudG8uaW5jbHVkZSAndGVzdC5jb2ZmZWUnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJmaW5kcyB0aGlzIGZpbGUgYWJzb2x1dGVcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCBfX2Rpcm5hbWVcbiAgICAgICAgICAgIC50by5pbmNsdWRlIHNsYXNoLnBhdGggX19maWxlbmFtZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwibGlzdHMgcmVsYXRpdmUgcGF0aCB3aXRoIGRvdFwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0KCcuL2RpcicpLmxlbmd0aFxuICAgICAgICAgICAgLnRvLmd0IDBcbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcImxpc3RzIHJlbGF0aXZlIHBhdGggd2l0aG91dCBkb3RcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCgnZGlyJykubGVuZ3RoXG4gICAgICAgICAgICAudG8uZ3QgMFxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwiaWdub3JlcyBoaWRkZW4gZmlsZXMgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0ICdkaXInXG4gICAgICAgICAgICAudG8ubm90LmluY2x1ZGUgc2xhc2gubm9ybWFsaXplICdkaXIvLmtvbnJhZC5ub29uJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwiaW5jbHVkZXMgaGlkZGVuIGZpbGVzXCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QgJ2RpcicsICdpZ25vcmVIaWRkZW4nOiBmYWxzZVxuICAgICAgICAgICAgLnRvLmluY2x1ZGUgc2xhc2gubm9ybWFsaXplICdkaXIvLmtvbnJhZC5ub29uJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwiZG9lc24ndCByZWN1cnNlIGJ5IGRlZmF1bHRcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCAnZGlyJ1xuICAgICAgICAgICAgLnRvLmVxbCBbc2xhc2gubm9ybWFsaXplKCdkaXIvbm9leHQnKSwgc2xhc2gubm9ybWFsaXplKCdkaXIvdGVzdC5jb2ZmZWUnKSwgc2xhc2gubm9ybWFsaXplKCdkaXIvdGVzdC5qcycpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LnR4dCcpXVxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwicmVjdXJzZXMgaWYgZGVwdGggc2V0XCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QgJ2RpcicsIGRlcHRoOiAyXG4gICAgICAgICAgICAudG8uZXFsIFtcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9ub2V4dCcpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmpzJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QudHh0JyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvdGVzdC5qcycpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvdGVzdC50eHQnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDIuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMWIvbGV2ZWwxYi5jb2ZmZWUnKV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgXCJtYXRjaGVzIGV4dGVuc2lvblwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0ICdkaXInLCBkZXB0aDogMywgbWF0Y2hFeHQ6IHNsYXNoLmV4dCBfX2ZpbGVuYW1lXG4gICAgICAgICAgICAudG8uZXFsIFtcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvdGVzdC5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDIuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS9sZXZlbDIvbGV2ZWwzL2xldmVsMy5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxYi9sZXZlbDFiLmNvZmZlZScpXVxuICAgIFxuICAgIGRlc2NyaWJlICdwb3MnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImFuZ2xlXCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgcG9zKDEsMCkuYW5nbGUocG9zIDAsMSlcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICAgICAgICAgIGV4cGVjdCBwb3MoMSwwKS5hbmdsZShwb3MgMCwtMSlcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICAgICAgICAgIGV4cGVjdCBwb3MoMCwxMCkuYW5nbGUocG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICAgICAgICAgIGV4cGVjdCBwb3MoMCwtMTApLmFuZ2xlKHBvcyAxLDApXG4gICAgICAgICAgICAudG8uZXFsIDkwXG4gICAgXG4gICAgICAgIGl0IFwicm90YXRpb25cIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBNYXRoLnJvdW5kIHBvcygwLDEpLnJvdGF0aW9uKHBvcyAxLDApXG4gICAgICAgICAgICAudG8uZXFsIDkwXG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBwb3MoMCwtMSkucm90YXRpb24ocG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgLTkwXG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBwb3MoMSwxKS5yb3RhdGlvbihwb3MgMSwwKVxuICAgICAgICAgICAgLnRvLmVxbCA0NVxuICAgICAgICAgICAgZXhwZWN0IE1hdGgucm91bmQgcG9zKDEsLTEpLnJvdGF0aW9uKHBvcyAxLDApXG4gICAgICAgICAgICAudG8uZXFsIC00NVxuICAgICAgICAgICAgZXhwZWN0IE1hdGgucm91bmQgcG9zKDEsMCkucm90YXRpb24ocG9zIDAsMSlcbiAgICAgICAgICAgIC50by5lcWwgLTkwXG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBwb3MoMSwwKS5yb3RhdGlvbihwb3MgMCwtMSlcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICBcbiAgICAgICAgaXQgXCJyb3RhdGVcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBwb3MoMSwwKS5yb3RhdGUoOTApLnJvdW5kZWQoKVxuICAgICAgICAgICAgLnRvLmVxbCBwb3MoMCwxKVxuICAgICAgICAgICAgZXhwZWN0IHBvcygxLDApLnJvdGF0ZSgtOTApLnJvdW5kZWQoKVxuICAgICAgICAgICAgLnRvLmVxbCBwb3MoMCwtMSlcbiAgICAgICAgICAgIGV4cGVjdCBwb3MoMSwwKS5yb3RhdGUoNDUpLnJvdW5kZWQoMC4wMDEpXG4gICAgICAgICAgICAudG8uZXFsIHBvcygxLDEpLm5vcm1hbCgpLnJvdW5kZWQoMC4wMDEpXG4gICAgXG4gICAgZGVzY3JpYmUgJ2NsYW1wJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdjbGFtcHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgMCwgMSwgMS4xXG4gICAgICAgICAgICAudG8uZXFsIDFcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAxLCAwLCAxLjFcbiAgICAgICAgICAgIC50by5lcWwgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgMi4yLCAzLCAxLjFcbiAgICAgICAgICAgIC50by5lcWwgMi4yXG4gICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgMywgMi4yLCAxLjFcbiAgICAgICAgICAgIC50by5lcWwgMi4yXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ251bGxzJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGNsYW1wIDAsIDFcbiAgICAgICAgICAgIC50by5lcWwgMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgMiwgMywgdW5kZWZpbmVkXG4gICAgICAgICAgICAudG8uZXFsIDJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGNsYW1wIDQsIDUsIG51bGxcbiAgICAgICAgICAgIC50by5lcWwgNFxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IGNsYW1wIDYsIDcsIHt9XG4gICAgICAgICAgICAudG8uZXFsIDZcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCA4LCA5LCBbXVxuICAgICAgICAgICAgLnRvLmVxbCA4XG4gICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgMTAsIDExLCBjbGFtcFxuICAgICAgICAgICAgLnRvLmVxbCAxMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgLTMsIC0yLCAwXG4gICAgICAgICAgICAudG8uZXFsIC0yXG4gICAgICAgICAgICBcbiAgICBkZXNjcmliZSAnZW1wdHknLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ3RydWUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgJycgICAgXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IFtdICAgIFxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSB7fSAgICBcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgbnVsbFxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSB1bmRlZmluZWRcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSAxXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSAwXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSBbW11dXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSBhOm51bGxcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5ICcgJ1xuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgSW5maW5pdHlcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgIGRlc2NyaWJlICd2YWxpZCcsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAnZmFsc2UnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgJycgICAgXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCBbXSAgICBcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIHt9ICAgIFxuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgbnVsbFxuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgdW5kZWZpbmVkXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3RydWUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgMVxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCAwXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIFtbXV1cbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgYTpudWxsXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkICcgJ1xuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCBJbmZpbml0eVxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgIFxuICAgIGRlc2NyaWJlICdmaWx0ZXInLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ2FycmF5JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGZpbHRlciBbMSwyLDMsNF0sICh2LGkpIC0+IGkgJSAyXG4gICAgICAgICAgICAudG8uZXFsIFsyLDRdXG5cbiAgICAgICAgICAgIGV4cGVjdCBmaWx0ZXIgWzEsMiwzLDRdLCAodixpKSAtPiB2ICUgMlxuICAgICAgICAgICAgLnRvLmVxbCBbMSwzXVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdvYmplY3QnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZmlsdGVyIHthOjEsYjoyLGM6MyxkOjR9LCAodixrKSAtPiB2ICUgMlxuICAgICAgICAgICAgLnRvLmVxbCB7YToxLGM6M31cblxuICAgICAgICAgICAgZXhwZWN0IGZpbHRlciB7YToxLGI6MixjOjMsZDo0fSwgKHYsaykgLT4gayBpbiBbJ2InLCAnYyddXG4gICAgICAgICAgICAudG8uZXFsIHtiOjIsYzozfVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICd2YWx1ZScsIC0+ICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBmaWx0ZXIoMSwgLT4pXG4gICAgICAgICAgICAudG8uZXFsIDFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGZpbHRlcihcImhlbGxvXCIsIC0+KVxuICAgICAgICAgICAgLnRvLmVxbCBcImhlbGxvXCJcbiAgICAgICAgICAgICAgICBcbiAgICBkZXNjcmliZSAnaXNUZXh0JywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdub24gYmluYXJ5JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzVGV4dCBfX2Rpcm5hbWUgKyAnL2Rpci9ub2V4dCdcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgIl19
//# sourceURL=../../test/test.coffee