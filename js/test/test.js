// koffee 0.30.0
var _, assert, chai, clamp, empty, expect, filelist, filter, log, pos, ref, slash, splitFileLine, valid;

ref = require('../'), filelist = ref.filelist, splitFileLine = ref.splitFileLine, slash = ref.slash, pos = ref.pos, empty = ref.empty, valid = ref.valid, clamp = ref.clamp, filter = ref.filter, log = ref.log, _ = ref._;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBK0UsT0FBQSxDQUFRLEtBQVIsQ0FBL0UsRUFBRSx1QkFBRixFQUFZLGlDQUFaLEVBQTJCLGlCQUEzQixFQUFrQyxhQUFsQyxFQUF1QyxpQkFBdkMsRUFBOEMsaUJBQTlDLEVBQXFELGlCQUFyRCxFQUE0RCxtQkFBNUQsRUFBb0UsYUFBcEUsRUFBeUU7O0FBRXpFLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsTUFBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxJQUFJLENBQUMsTUFBTCxDQUFBOztBQUVBLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFNBQUE7SUFFWixRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBO1FBRWQsRUFBQSxDQUFHLEtBQUgsRUFBVSxTQUFBO1lBRU4sTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUscUJBQVYsQ0FBUCxDQUNBLENBQUMsRUFBRSxDQUFDLEdBREosQ0FDUSxZQURSO1lBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsWUFBVixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLE9BRFI7WUFHQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtnQkFDSSxNQUFBLENBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxZQUFWLENBQVAsQ0FDQSxDQUFDLEVBQUUsQ0FBQyxHQURKLENBQ1EsS0FEUixFQURKOztZQUlBLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBTixDQUFVLE9BQVYsQ0FBUCxDQUNBLENBQUMsRUFBRSxDQUFDLEdBREosQ0FDUSxJQURSO1lBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsR0FBVixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLEVBRFI7WUFH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QyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQURSO21CQUdBLE1BQUEsQ0FBTyxNQUFBLENBQU87Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7Z0JBQVMsQ0FBQSxFQUFFLENBQVg7Z0JBQWEsQ0FBQSxFQUFFLENBQWY7YUFBUCxFQUEwQixTQUFDLENBQUQsRUFBRyxDQUFIO3VCQUFTLENBQUEsS0FBTSxHQUFOLElBQUEsQ0FBQSxLQUFXO1lBQXBCLENBQTFCLENBQVAsQ0FDQSxDQUFDLEVBQUUsQ0FBQyxHQURKLENBQ1E7Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7YUFEUjtRQUxTLENBQWI7ZUFRQSxFQUFBLENBQUcsT0FBSCxFQUFZLFNBQUE7WUFFUixNQUFBLENBQU8sTUFBQSxDQUFPLENBQVAsRUFBVSxTQUFBLEdBQUEsQ0FBVixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLENBRFI7bUJBR0EsTUFBQSxDQUFPLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLFNBQUEsR0FBQSxDQUFoQixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLE9BRFI7UUFMUSxDQUFaO0lBbEJlLENBQW5CO1dBMEJBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7ZUFFZixFQUFBLENBQUcsWUFBSCxFQUFpQixTQUFBO21CQUViLE1BQUEsQ0FBTyxLQUFLLENBQUMsTUFBTixDQUFhLFNBQUEsR0FBWSxZQUF6QixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLElBRFI7UUFGYSxDQUFqQjtJQUZlLENBQW5CO0FBL2tCWSxDQUFoQiIsInNvdXJjZXNDb250ZW50IjpbIiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDBcbiMgICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMFxuIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwXG5cbnsgZmlsZWxpc3QsIHNwbGl0RmlsZUxpbmUsIHNsYXNoLCBwb3MsIGVtcHR5LCB2YWxpZCwgY2xhbXAsIGZpbHRlciwgbG9nLCBfIH0gPSByZXF1aXJlICcuLi8nICMgJy4uL2NvZmZlZS9reGsnXG5cbmFzc2VydCA9IHJlcXVpcmUgJ2Fzc2VydCdcbmNoYWkgICA9IHJlcXVpcmUgJ2NoYWknXG5leHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS5zaG91bGQoKVxuXG5kZXNjcmliZSAna3hrJywgLT5cbiAgICBcbiAgICBkZXNjcmliZSAnc2xhc2gnLCAtPlxuXG4gICAgICAgIGl0ICdkaXInLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcvc29tZS9wYXRoL2ZpbGUudHh0J1xuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnL3NvbWUvZGlyLydcbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJ0M6XFxcXEJhY2tcXFxcJ1xuICAgICAgICAgICAgICAgIC50by5lcWwgJ0M6LydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnLi4vLi4nXG4gICAgICAgICAgICAudG8uZXFsICcuLidcblxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnLydcbiAgICAgICAgICAgIC50by5lcWwgJydcblxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnLidcbiAgICAgICAgICAgIC50by5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnLi4nXG4gICAgICAgICAgICAudG8uZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJ34nXG4gICAgICAgICAgICAudG8uZXFsICcnXG5cbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy4vJ1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcuLi8nXG4gICAgICAgICAgICAudG8uZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJ34vJ1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJ0M6LydcbiAgICAgICAgICAgICAgICAudG8uZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3BhdGhsaXN0JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhdGhsaXN0ICcvc29tZS9wYXRoLnR4dCdcbiAgICAgICAgICAgIC50by5lcWwgWycvJywgJy9zb21lJywgJy9zb21lL3BhdGgudHh0J11cblxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhdGhsaXN0ICcvJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy8nXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGF0aGxpc3QgJydcbiAgICAgICAgICAgIC50by5lcWwgW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBleHBlY3Qgc2xhc2gucGF0aGxpc3QgJ0M6XFxcXEJhY2tcXFxcU2xhc2hcXFxcJ1xuICAgICAgICAgICAgICAgIC50by5lcWwgWydDOi8nLCAnQzovQmFjaycsICdDOi9CYWNrL1NsYXNoLyddXG5cbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXRobGlzdCAnfidcbiAgICAgICAgICAgIC50by5lcWwgWyd+J11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCAnYmFzZScsIC0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guYmFzZSAnL3NvbWUvcGF0aC50eHQnXG4gICAgICAgICAgICAudG8uZXFsICdwYXRoJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCAncGF0aCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhdGggXCJDOlxcXFxCYWNrXFxcXFNsYXNoXFxcXENyYXBcIlxuICAgICAgICAgICAgLnRvLmVxbCBcIkM6L0JhY2svU2xhc2gvQ3JhcFwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXRoIFwiQzpcXFxcQmFja1xcXFxTbGFzaFxcXFxDcmFwXFxcXC4uXFxcXC4uXFxcXFRvXFxcXFRoZVxcXFwuLlxcXFxGdXR1cmVcIlxuICAgICAgICAgICAgLnRvLmVxbCBcIkM6L0JhY2svVG8vRnV0dXJlXCJcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnam9pbicsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5qb2luICdhJywgJ2InLCAnYydcbiAgICAgICAgICAgIC50by5lcWwgJ2EvYi9jJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5qb2luICdDOlxcXFxGT08nLCAnLlxcXFxCQVInLCAndGhhdFxcXFxzdWNrcydcbiAgICAgICAgICAgIC50by5lcWwgJ0M6L0ZPTy9CQVIvdGhhdC9zdWNrcydcbiAgICBcbiAgICAgICAgaXQgJ2hvbWUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIGhvbWUgPSBzbGFzaC5wYXRoIHByb2Nlc3MuZW52WydIT01FRFJJVkUnXSArIHByb2Nlc3MuZW52WydIT01FUEFUSCddXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaG9tZSA9IHByb2Nlc3MuZW52WydIT01FJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5ob21lKClcbiAgICAgICAgICAgIC50by5lcWwgaG9tZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gudGlsZGUgaG9tZVxuICAgICAgICAgICAgLnRvLmVxbCAnfidcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC50aWxkZSBob21lICsgJy9zdWInXG4gICAgICAgICAgICAudG8uZXFsICd+L3N1YidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnVudGlsZGUgJ34vc3ViJ1xuICAgICAgICAgICAgLnRvLmVxbCBob21lICsgJy9zdWInXG4gICAgXG4gICAgICAgIGl0ICd1bmVudicsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC51bmVudiAnQzovJFJlY3ljbGUuYmluJ1xuICAgICAgICAgICAgLnRvLmVxbCAnQzovJFJlY3ljbGUuYmluJ1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnVuZW52ICckSE9NRS90ZXN0J1xuICAgICAgICAgICAgLnRvLmVxbCBzbGFzaC5wYXRoKHByb2Nlc3MuZW52WydIT01FJ10pICsgJy90ZXN0J1xuICAgIFxuICAgICAgICBpdCAndW5zbGFzaCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC51bnNsYXNoICcvYy90ZXN0J1xuICAgICAgICAgICAgLnRvLmVxbCAnQzpcXFxcdGVzdCdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAncmVzb2x2ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZXNvbHZlICd+J1xuICAgICAgICAgICAgLnRvLmVxbCBzbGFzaC5ob21lKClcbiAgICBcbiAgICAgICAgaXQgJ3JlbGF0aXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbGF0aXZlICdDOlxcXFx0ZXN0XFxcXHNvbWVcXFxccGF0aC50eHQnLCAnQzpcXFxcdGVzdFxcXFxzb21lXFxcXG90aGVyXFxcXHBhdGgnXG4gICAgICAgICAgICAudG8uZXFsICcuLi8uLi9wYXRoLnR4dCdcbiAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVsYXRpdmUgJ0M6XFxcXHNvbWVcXFxccGF0aCcsICdDOi9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsICcuJ1xuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbGF0aXZlICdDOi9Vc2Vycy9rb2RpL3Mva29ucmFkL2FwcC9qcy9jb2ZmZWUuanMnLCAnQzovVXNlcnMva29kaS9zL2tvbnJhZCdcbiAgICAgICAgICAgIC50by5lcWwgJ2FwcC9qcy9jb2ZmZWUuanMnXG5cbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbGF0aXZlICdDOi9zb21lL3BhdGgvb24uYycsICdEOi9wYXRoL29uLmQnXG4gICAgICAgICAgICAgICAgLnRvLmVxbCAnQzovc29tZS9wYXRoL29uLmMnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbGF0aXZlICdDOlxcXFxzb21lXFxcXHBhdGhcXFxcb24uYycsICdEOlxcXFxwYXRoXFxcXG9uLmQnXG4gICAgICAgICAgICAgICAgLnRvLmVxbCAnQzovc29tZS9wYXRoL29uLmMnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3BhcnNlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhcnNlKCdjOicpLnJvb3RcbiAgICAgICAgICAgIC50by5lcWwgJ2M6LydcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXJzZSgnYzonKS5kaXJcbiAgICAgICAgICAgIC50by5lcWwgJ2M6LydcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3BsaXQnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXQgJy9jL3VzZXJzL2hvbWUvJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2MnLCAndXNlcnMnLCAnaG9tZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdCAnZC91c2Vycy9ob21lJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2QnLCAndXNlcnMnLCAnaG9tZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdCAnYzovc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2M6JywgJ3NvbWUnLCAncGF0aCddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdCAnZDpcXFxcc29tZVxcXFxwYXRoXFxcXCdcbiAgICAgICAgICAgIC50by5lcWwgWydkOicsICdzb21lJywgJ3BhdGgnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3BsaXREcml2ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdERyaXZlICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCAnJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXREcml2ZSAnYzovc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCAnYyddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdERyaXZlICdjOlxcXFxzb21lXFxcXHBhdGgnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsICdjJ11cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdERyaXZlICdjOlxcXFwnXG4gICAgICAgICAgICAudG8uZXFsIFsnLycsICdjJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RHJpdmUgJ2M6J1xuICAgICAgICAgICAgLnRvLmVxbCBbJy8nLCAnYyddXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3JlbW92ZURyaXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbW92ZURyaXZlICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aCdcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbW92ZURyaXZlICdjOi9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoJ1xuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbW92ZURyaXZlICdjOlxcXFxzb21lXFxcXHBhdGgnXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoJ1xuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbW92ZURyaXZlICdjOi8nXG4gICAgICAgICAgICAudG8uZXFsICcvJ1xuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlbW92ZURyaXZlICdjOlxcXFwnXG4gICAgICAgICAgICAudG8uZXFsICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVtb3ZlRHJpdmUgJ2M6J1xuICAgICAgICAgICAgLnRvLmVxbCAnLydcbiAgICBcbiAgICAgICAgaXQgJ3NwbGl0RmlsZUxpbmUnLCAtPlxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZUxpbmUgJy9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsIDEsIDBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVMaW5lICcvc29tZS9wYXRoOjEyMydcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgMTIzLCAwXVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZUxpbmUgJy9zb21lL3BhdGg6MTIzOjE1J1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCAxMjMsIDE1XVxuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlTGluZSAnYzovc29tZS9wYXRoOjEyMydcbiAgICAgICAgICAgIC50by5lcWwgWydjOi9zb21lL3BhdGgnLCAxMjMsIDBdXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlTGluZSAnYzovc29tZS9wYXRoOjEyMzoxNSdcbiAgICAgICAgICAgIC50by5lcWwgWydjOi9zb21lL3BhdGgnLCAxMjMsIDE1XVxuICAgIFxuICAgICAgICBpdCAnc3BsaXRGaWxlUG9zJywgLT5cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsIFswLCAwXV1cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGg6MTIzJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCBbMCwgMTIyXV1cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGg6MTIzOjE1J1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCBbMTUsIDEyMl1dXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVQb3MgJ2M6L3NvbWUvcGF0aDoxMjMnXG4gICAgICAgICAgICAudG8uZXFsIFsnYzovc29tZS9wYXRoJywgWzAsIDEyMl1dXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlUG9zICdjOi9zb21lL3BhdGg6MTIzOjE1J1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2M6L3NvbWUvcGF0aCcsIFsxNSwgMTIyXV1cblxuICAgICAgICBpdCAnam9pbkZpbGVQb3MnLCAtPlxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzAsMF1cbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGg6MSdcblxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzAsNF1cbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGg6NSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzEsNV1cbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGg6NjoxJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoJ1xuXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnLCBbXVxuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnZXhpc3RzJywgLT5cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5leGlzdHMgX19kaXJuYW1lXG4gICAgICAgICAgICAudG8uZXhpc3RcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5leGlzdHMgX19maWxlbmFtZVxuICAgICAgICAgICAgLnRvLmV4aXN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5leGlzdHMgX19maWxlbmFtZSArICdmb28nXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2V4aXN0cyBhc3luYycsIChkb25lKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzbGFzaC5leGlzdHMgX19maWxlbmFtZSwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgZXhwZWN0IHN0YXRcbiAgICAgICAgICAgICAgICAudG8uZXhpc3RcbiAgICAgICAgICAgICAgICBkb25lKClcbiAgICBcbiAgICAgICAgaXQgJ2V4aXN0IGFzeW5jIG5vdCcsIChkb25lKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzbGFzaC5leGlzdHMgX19maWxlbmFtZSArICdmb28nLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBleHBlY3Qgc3RhdFxuICAgICAgICAgICAgICAgIC50by5ub3QuZXhpc3RcbiAgICAgICAgICAgICAgICBkb25lKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgJ2ZpbGVFeGlzdHMnLCAtPlxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmZpbGVFeGlzdHMgX19maWxlbmFtZVxuICAgICAgICAgICAgLnRvLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZmlsZUV4aXN0cyBfX2Rpcm5hbWVcbiAgICAgICAgICAgIC50by5ub3QuZXhpc3RcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnZGlyRXhpc3RzJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpckV4aXN0cyBfX2Rpcm5hbWVcbiAgICAgICAgICAgIC50by5leGlzdFxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpckV4aXN0cyBfX2ZpbGVuYW1lXG4gICAgICAgICAgICAudG8ubm90LmV4aXN0XG4gICAgXG4gICAgICAgIGl0ICdwa2cnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGtnIF9fZGlybmFtZVxuICAgICAgICAgICAgLnRvLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGtnIF9fZmlsZW5hbWVcbiAgICAgICAgICAgIC50by5leGlzdFxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBrZyAnQzpcXFxcJ1xuICAgICAgICAgICAgLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGtnICdDOidcbiAgICAgICAgICAgIC50by5ub3QuZXhpc3RcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnaXNSZWxhdGl2ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5pc1JlbGF0aXZlIF9fZGlybmFtZVxuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaXNSZWxhdGl2ZSAnLidcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaXNSZWxhdGl2ZSAnLi4nXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzUmVsYXRpdmUgJy4uLy4vYmxhLi4vLi4vZmFyaydcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaXNSZWxhdGl2ZSAnQzpcXFxcYmxhZmFyaydcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5pc1JlbGF0aXZlICcuLlxcXFxibGFmYXJrJ1xuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3Nhbml0aXplJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNhbml0aXplICdhLmJcXG4nXG4gICAgICAgICAgICAudG8uZXFsICdhLmInXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc2FuaXRpemUgJ1xcblxcbiBjIC4gZCAgXFxuXFxuXFxuJ1xuICAgICAgICAgICAgLnRvLmVxbCAnIGMgLiBkICAnXG4gICAgICAgICAgICBcbiAgICBkZXNjcmliZSAnZmlsZWxpc3QnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImV4aXN0c1wiLCAtPiBfLmlzRnVuY3Rpb24gZmlsZWxpc3RcbiAgICAgICAgXG4gICAgICAgIGl0IFwiY2hkaXJcIiwgLT5cbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIgXCIje19fZGlybmFtZX1cIlxuICAgICAgICAgICAgZXhwZWN0IHByb2Nlc3MuY3dkKClcbiAgICAgICAgICAgIC50by5lcWwgX19kaXJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZXR1cm5zIGFuIGFycmF5XCIsIC0+IF8uaXNBcnJheSBmaWxlbGlzdCAnLidcbiAgICAgICAgXG4gICAgICAgIGl0IFwicmV0dXJucyBlbXB0eSBhcnJheVwiLCAtPiBfLmlzRW1wdHkgZmlsZWxpc3QgJ2Zvb2JhcicsIGxvZ0Vycm9yOiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgaXQgXCJmaW5kcyB0aGlzIGZpbGUgcmVsYXRpdmVcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCAnLidcbiAgICAgICAgICAgIC50by5pbmNsdWRlICd0ZXN0LmNvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcImZpbmRzIHRoaXMgZmlsZSBhYnNvbHV0ZVwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0IF9fZGlybmFtZVxuICAgICAgICAgICAgLnRvLmluY2x1ZGUgc2xhc2gucGF0aCBfX2ZpbGVuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJsaXN0cyByZWxhdGl2ZSBwYXRoIHdpdGggZG90XCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QoJy4vZGlyJykubGVuZ3RoXG4gICAgICAgICAgICAudG8uZ3QgMFxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwibGlzdHMgcmVsYXRpdmUgcGF0aCB3aXRob3V0IGRvdFwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0KCdkaXInKS5sZW5ndGhcbiAgICAgICAgICAgIC50by5ndCAwXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpZ25vcmVzIGhpZGRlbiBmaWxlcyBieSBkZWZhdWx0XCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QgJ2RpcidcbiAgICAgICAgICAgIC50by5ub3QuaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpbmNsdWRlcyBoaWRkZW4gZmlsZXNcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCAnZGlyJywgJ2lnbm9yZUhpZGRlbic6IGZhbHNlXG4gICAgICAgICAgICAudG8uaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJkb2Vzbid0IHJlY3Vyc2UgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0ICdkaXInXG4gICAgICAgICAgICAudG8uZXFsIFtzbGFzaC5ub3JtYWxpemUoJ2Rpci9ub2V4dCcpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmNvZmZlZScpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmpzJyksIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QudHh0JyldXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZWN1cnNlcyBpZiBkZXB0aCBzZXRcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCAnZGlyJywgZGVwdGg6IDJcbiAgICAgICAgICAgIC50by5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL25vZXh0JyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuanMnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvdGVzdC50eHQnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmpzJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LnR4dCcpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxYi9sZXZlbDFiLmNvZmZlZScpXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCBcIm1hdGNoZXMgZXh0ZW5zaW9uXCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QgJ2RpcicsIGRlcHRoOiAzLCBtYXRjaEV4dDogc2xhc2guZXh0IF9fZmlsZW5hbWVcbiAgICAgICAgICAgIC50by5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDMvbGV2ZWwzLmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDFiL2xldmVsMWIuY29mZmVlJyldXG4gICAgXG4gICAgZGVzY3JpYmUgJ3BvcycsIC0+XG4gICAgXG4gICAgICAgIGl0IFwiYW5nbGVcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBwb3MoMSwwKS5hbmdsZShwb3MgMCwxKVxuICAgICAgICAgICAgLnRvLmVxbCA5MFxuICAgICAgICAgICAgZXhwZWN0IHBvcygxLDApLmFuZ2xlKHBvcyAwLC0xKVxuICAgICAgICAgICAgLnRvLmVxbCA5MFxuICAgICAgICAgICAgZXhwZWN0IHBvcygwLDEwKS5hbmdsZShwb3MgMSwwKVxuICAgICAgICAgICAgLnRvLmVxbCA5MFxuICAgICAgICAgICAgZXhwZWN0IHBvcygwLC0xMCkuYW5nbGUocG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICBcbiAgICAgICAgaXQgXCJyb3RhdGlvblwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IE1hdGgucm91bmQgcG9zKDAsMSkucm90YXRpb24ocG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICAgICAgICAgIGV4cGVjdCBNYXRoLnJvdW5kIHBvcygwLC0xKS5yb3RhdGlvbihwb3MgMSwwKVxuICAgICAgICAgICAgLnRvLmVxbCAtOTBcbiAgICAgICAgICAgIGV4cGVjdCBNYXRoLnJvdW5kIHBvcygxLDEpLnJvdGF0aW9uKHBvcyAxLDApXG4gICAgICAgICAgICAudG8uZXFsIDQ1XG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBwb3MoMSwtMSkucm90YXRpb24ocG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgLTQ1XG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBwb3MoMSwwKS5yb3RhdGlvbihwb3MgMCwxKVxuICAgICAgICAgICAgLnRvLmVxbCAtOTBcbiAgICAgICAgICAgIGV4cGVjdCBNYXRoLnJvdW5kIHBvcygxLDApLnJvdGF0aW9uKHBvcyAwLC0xKVxuICAgICAgICAgICAgLnRvLmVxbCA5MFxuICAgIFxuICAgICAgICBpdCBcInJvdGF0ZVwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IHBvcygxLDApLnJvdGF0ZSg5MCkucm91bmRlZCgpXG4gICAgICAgICAgICAudG8uZXFsIHBvcygwLDEpXG4gICAgICAgICAgICBleHBlY3QgcG9zKDEsMCkucm90YXRlKC05MCkucm91bmRlZCgpXG4gICAgICAgICAgICAudG8uZXFsIHBvcygwLC0xKVxuICAgICAgICAgICAgZXhwZWN0IHBvcygxLDApLnJvdGF0ZSg0NSkucm91bmRlZCgwLjAwMSlcbiAgICAgICAgICAgIC50by5lcWwgcG9zKDEsMSkubm9ybWFsKCkucm91bmRlZCgwLjAwMSlcbiAgICBcbiAgICBkZXNjcmliZSAnY2xhbXAnLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ2NsYW1wcycsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAwLCAxLCAxLjFcbiAgICAgICAgICAgIC50by5lcWwgMVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IGNsYW1wIDEsIDAsIDEuMVxuICAgICAgICAgICAgLnRvLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAyLjIsIDMsIDEuMVxuICAgICAgICAgICAgLnRvLmVxbCAyLjJcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAzLCAyLjIsIDEuMVxuICAgICAgICAgICAgLnRvLmVxbCAyLjJcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnbnVsbHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgMCwgMVxuICAgICAgICAgICAgLnRvLmVxbCAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAyLCAzLCB1bmRlZmluZWRcbiAgICAgICAgICAgIC50by5lcWwgMlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgNCwgNSwgbnVsbFxuICAgICAgICAgICAgLnRvLmVxbCA0XG4gICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgNiwgNywge31cbiAgICAgICAgICAgIC50by5lcWwgNlxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IGNsYW1wIDgsIDksIFtdXG4gICAgICAgICAgICAudG8uZXFsIDhcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAxMCwgMTEsIGNsYW1wXG4gICAgICAgICAgICAudG8uZXFsIDEwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAtMywgLTIsIDBcbiAgICAgICAgICAgIC50by5lcWwgLTJcbiAgICAgICAgICAgIFxuICAgIGRlc2NyaWJlICdlbXB0eScsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAndHJ1ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSAnJyAgICBcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgW10gICAgXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IHt9ICAgIFxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSBudWxsXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IHVuZGVmaW5lZFxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2ZhbHNlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IDFcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IDBcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IFtbXV1cbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IGE6bnVsbFxuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgJyAnXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSBJbmZpbml0eVxuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgZGVzY3JpYmUgJ3ZhbGlkJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCAnJyAgICBcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIFtdICAgIFxuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQge30gICAgXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCBudWxsXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCB1bmRlZmluZWRcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndHJ1ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCAxXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIDBcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgW1tdXVxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCBhOm51bGxcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgJyAnXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIEluZmluaXR5XG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgXG4gICAgZGVzY3JpYmUgJ2ZpbHRlcicsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAnYXJyYXknLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZmlsdGVyIFsxLDIsMyw0XSwgKHYsaSkgLT4gaSAlIDJcbiAgICAgICAgICAgIC50by5lcWwgWzIsNF1cblxuICAgICAgICAgICAgZXhwZWN0IGZpbHRlciBbMSwyLDMsNF0sICh2LGkpIC0+IHYgJSAyXG4gICAgICAgICAgICAudG8uZXFsIFsxLDNdXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ29iamVjdCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBmaWx0ZXIge2E6MSxiOjIsYzozLGQ6NH0sICh2LGspIC0+IHYgJSAyXG4gICAgICAgICAgICAudG8uZXFsIHthOjEsYzozfVxuXG4gICAgICAgICAgICBleHBlY3QgZmlsdGVyIHthOjEsYjoyLGM6MyxkOjR9LCAodixrKSAtPiBrIGluIFsnYicsICdjJ11cbiAgICAgICAgICAgIC50by5lcWwge2I6MixjOjN9XG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3ZhbHVlJywgLT4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGZpbHRlcigxLCAtPilcbiAgICAgICAgICAgIC50by5lcWwgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZmlsdGVyKFwiaGVsbG9cIiwgLT4pXG4gICAgICAgICAgICAudG8uZXFsIFwiaGVsbG9cIlxuICAgICAgICAgICAgICAgIFxuICAgIGRlc2NyaWJlICdpc1RleHQnLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ25vbiBiaW5hcnknLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaXNUZXh0IF9fZGlybmFtZSArICcvZGlyL25vZXh0J1xuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../../test/test.coffee