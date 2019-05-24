// koffee 0.45.0
var _, assert, chai, clamp, empty, expect, filelist, filter, kpos, kstr, ref, slash, splitFileLine, valid;

ref = require('../'), filelist = ref.filelist, splitFileLine = ref.splitFileLine, slash = ref.slash, kpos = ref.kpos, kstr = ref.kstr, empty = ref.empty, valid = ref.valid, clamp = ref.clamp, filter = ref.filter, _ = ref._;

assert = require('assert');

chai = require('chai');

expect = chai.expect;

chai.should();

describe('kxk', function() {
    describe('kstr', function() {
        it('replaceTabs', function() {
            kstr.replaceTabs('\t\t').should.eql('        ');
            return kstr.replaceTabs('aa\tbb').should.eql('aa  bb');
        });
        return it('escapeRegexp', function() {
            return kstr.escapeRegexp('a/b.txt').should.eql('a\\/b\\.txt');
        });
    });
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
    describe('kpos', function() {
        it("angle", function() {
            expect(kpos(1, 0).angle(kpos(0, 1))).to.eql(90);
            expect(kpos(1, 0).angle(kpos(0, -1))).to.eql(90);
            expect(kpos(0, 10).angle(kpos(1, 0))).to.eql(90);
            return expect(kpos(0, -10).angle(kpos(1, 0))).to.eql(90);
        });
        it("rotation", function() {
            expect(Math.round(kpos(0, 1).rotation(kpos(1, 0)))).to.eql(90);
            expect(Math.round(kpos(0, -1).rotation(kpos(1, 0)))).to.eql(-90);
            expect(Math.round(kpos(1, 1).rotation(kpos(1, 0)))).to.eql(45);
            expect(Math.round(kpos(1, -1).rotation(kpos(1, 0)))).to.eql(-45);
            expect(Math.round(kpos(1, 0).rotation(kpos(0, 1)))).to.eql(-90);
            return expect(Math.round(kpos(1, 0).rotation(kpos(0, -1)))).to.eql(90);
        });
        return it("rotate", function() {
            expect(kpos(1, 0).rotate(90).rounded()).to.eql(kpos(0, 1));
            expect(kpos(1, 0).rotate(-90).rounded()).to.eql(kpos(0, -1));
            return expect(kpos(1, 0).rotate(45).rounded(0.001)).to.eql(kpos(1, 1).normal().rounded(0.001));
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
    describe('isText', function() {
        it('non binary', function() {
            return expect(slash.isText(__dirname + '/dir/noext')).to.eql(true);
        });
        return it('binary', function() {
            return expect(slash.isText(__dirname + '../img/kxk.png')).to.eql(false);
        });
    });
    return describe('readText', function() {
        it('reads text', function() {
            return expect(slash.readText(__dirname + '/dir/noext')).to.eql('hello\n');
        });
        it('returns empty text if file doesnt exist', function() {
            return expect(slash.readText(__dirname + '/dir/filedoesntexist')).to.eql('');
        });
        it('reads text sync', function(done) {
            return slash.readText(__dirname + '/dir/noext', function(text) {
                expect(text).to.eql('hello\n');
                return done();
            });
        });
        return it('returns empty text if file doesnt exist sync', function(done) {
            return slash.readText(__dirname + '/dir/filedoesntexist', function(text) {
                expect(text).to.eql('');
                return done();
            });
        });
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBaUYsT0FBQSxDQUFRLEtBQVIsQ0FBakYsRUFBRSx1QkFBRixFQUFZLGlDQUFaLEVBQTJCLGlCQUEzQixFQUFrQyxlQUFsQyxFQUF3QyxlQUF4QyxFQUE4QyxpQkFBOUMsRUFBcUQsaUJBQXJELEVBQTRELGlCQUE1RCxFQUFtRSxtQkFBbkUsRUFBMkU7O0FBRTNFLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsTUFBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxJQUFJLENBQUMsTUFBTCxDQUFBOztBQUVBLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFNBQUE7SUFFWixRQUFBLENBQVMsTUFBVCxFQUFpQixTQUFBO1FBRWIsRUFBQSxDQUFHLGFBQUgsRUFBa0IsU0FBQTtZQUNkLElBQUksQ0FBQyxXQUFMLENBQWlCLE1BQWpCLENBQXdCLENBQUMsTUFBTSxDQUFDLEdBQWhDLENBQW9DLFVBQXBDO21CQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLFFBQWpCLENBQTBCLENBQUMsTUFBTSxDQUFDLEdBQWxDLENBQXNDLFFBQXRDO1FBRmMsQ0FBbEI7ZUFJQSxFQUFBLENBQUcsY0FBSCxFQUFtQixTQUFBO21CQUNmLElBQUksQ0FBQyxZQUFMLENBQWtCLFNBQWxCLENBQTRCLENBQUMsTUFBTSxDQUFDLEdBQXBDLENBQXdDLGFBQXhDO1FBRGUsQ0FBbkI7SUFOYSxDQUFqQjtJQWVBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUE7UUFFZCxFQUFBLENBQUcsS0FBSCxFQUFVLFNBQUE7WUFFTixNQUFBLENBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxxQkFBVixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLFlBRFI7WUFHQSxNQUFBLENBQU8sS0FBSyxDQUFD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QUFDLElBQUQ7Z0JBQy9DLE1BQUEsQ0FBTyxJQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLEVBRFI7dUJBRUEsSUFBQSxDQUFBO1lBSCtDLENBQW5EO1FBRitDLENBQW5EO0lBbkJpQixDQUFyQjtBQTFwQlksQ0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiMgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwXG4jICAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDBcbiMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMFxuXG57IGZpbGVsaXN0LCBzcGxpdEZpbGVMaW5lLCBzbGFzaCwga3Bvcywga3N0ciwgZW1wdHksIHZhbGlkLCBjbGFtcCwgZmlsdGVyLCBfIH0gPSByZXF1aXJlICcuLi8nXG5cbmFzc2VydCA9IHJlcXVpcmUgJ2Fzc2VydCdcbmNoYWkgICA9IHJlcXVpcmUgJ2NoYWknXG5leHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS5zaG91bGQoKVxuXG5kZXNjcmliZSAna3hrJywgLT5cbiAgICBcbiAgICBkZXNjcmliZSAna3N0cicsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAncmVwbGFjZVRhYnMnLCAtPlxuICAgICAgICAgICAga3N0ci5yZXBsYWNlVGFicygnXFx0XFx0Jykuc2hvdWxkLmVxbCAnICAgICAgICAnXG4gICAgICAgICAgICBrc3RyLnJlcGxhY2VUYWJzKCdhYVxcdGJiJykuc2hvdWxkLmVxbCAnYWEgIGJiJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdlc2NhcGVSZWdleHAnLCAtPlxuICAgICAgICAgICAga3N0ci5lc2NhcGVSZWdleHAoJ2EvYi50eHQnKS5zaG91bGQuZXFsICdhXFxcXC9iXFxcXC50eHQnXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdzbGFzaCcsIC0+XG5cbiAgICAgICAgaXQgJ2RpcicsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy9zb21lL3BhdGgvZmlsZS50eHQnXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcvc29tZS9kaXIvJ1xuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnQzpcXFxcQmFja1xcXFwnXG4gICAgICAgICAgICAgICAgLnRvLmVxbCAnQzovJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcuLi8uLidcbiAgICAgICAgICAgIC50by5lcWwgJy4uJ1xuXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcvJ1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcuJ1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyICcuLidcbiAgICAgICAgICAgIC50by5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnfidcbiAgICAgICAgICAgIC50by5lcWwgJydcblxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnLi8nXG4gICAgICAgICAgICAudG8uZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5kaXIgJy4uLydcbiAgICAgICAgICAgIC50by5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnfi8nXG4gICAgICAgICAgICAudG8uZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmRpciAnQzovJ1xuICAgICAgICAgICAgICAgIC50by5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAncGF0aGxpc3QnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGF0aGxpc3QgJy9zb21lL3BhdGgudHh0J1xuICAgICAgICAgICAgLnRvLmVxbCBbJy8nLCAnL3NvbWUnLCAnL3NvbWUvcGF0aC50eHQnXVxuXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGF0aGxpc3QgJy8nXG4gICAgICAgICAgICAudG8uZXFsIFsnLyddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXRobGlzdCAnJ1xuICAgICAgICAgICAgLnRvLmVxbCBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wYXRobGlzdCAnQzpcXFxcQmFja1xcXFxTbGFzaFxcXFwnXG4gICAgICAgICAgICAgICAgLnRvLmVxbCBbJ0M6LycsICdDOi9CYWNrJywgJ0M6L0JhY2svU2xhc2gvJ11cblxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhdGhsaXN0ICd+J1xuICAgICAgICAgICAgLnRvLmVxbCBbJ34nXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdiYXNlJywgLT4gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5iYXNlICcvc29tZS9wYXRoLnR4dCdcbiAgICAgICAgICAgIC50by5lcWwgJ3BhdGgnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdwYXRoJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGF0aCBcIkM6XFxcXEJhY2tcXFxcU2xhc2hcXFxcQ3JhcFwiXG4gICAgICAgICAgICAudG8uZXFsIFwiQzovQmFjay9TbGFzaC9DcmFwXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhdGggXCJDOlxcXFxCYWNrXFxcXFNsYXNoXFxcXENyYXBcXFxcLi5cXFxcLi5cXFxcVG9cXFxcVGhlXFxcXC4uXFxcXEZ1dHVyZVwiXG4gICAgICAgICAgICAudG8uZXFsIFwiQzovQmFjay9Uby9GdXR1cmVcIlxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdqb2luJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmpvaW4gJ2EnLCAnYicsICdjJ1xuICAgICAgICAgICAgLnRvLmVxbCAnYS9iL2MnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmpvaW4gJ0M6XFxcXEZPTycsICcuXFxcXEJBUicsICd0aGF0XFxcXHN1Y2tzJ1xuICAgICAgICAgICAgLnRvLmVxbCAnQzovRk9PL0JBUi90aGF0L3N1Y2tzJ1xuICAgIFxuICAgICAgICBpdCAnaG9tZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgaG9tZSA9IHNsYXNoLnBhdGggcHJvY2Vzcy5lbnZbJ0hPTUVEUklWRSddICsgcHJvY2Vzcy5lbnZbJ0hPTUVQQVRIJ11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBob21lID0gcHJvY2Vzcy5lbnZbJ0hPTUUnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmhvbWUoKVxuICAgICAgICAgICAgLnRvLmVxbCBob21lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC50aWxkZSBob21lXG4gICAgICAgICAgICAudG8uZXFsICd+J1xuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnRpbGRlIGhvbWUgKyAnL3N1YidcbiAgICAgICAgICAgIC50by5lcWwgJ34vc3ViJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gudW50aWxkZSAnfi9zdWInXG4gICAgICAgICAgICAudG8uZXFsIGhvbWUgKyAnL3N1YidcbiAgICBcbiAgICAgICAgaXQgJ3VuZW52JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnVuZW52ICdDOi8kUmVjeWNsZS5iaW4nXG4gICAgICAgICAgICAudG8uZXFsICdDOi8kUmVjeWNsZS5iaW4nXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gudW5lbnYgJyRIT01FL3Rlc3QnXG4gICAgICAgICAgICAudG8uZXFsIHNsYXNoLnBhdGgocHJvY2Vzcy5lbnZbJ0hPTUUnXSkgKyAnL3Rlc3QnXG4gICAgXG4gICAgICAgIGl0ICd1bnNsYXNoJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnVuc2xhc2ggJy9jL3Rlc3QnXG4gICAgICAgICAgICAudG8uZXFsICdDOlxcXFx0ZXN0J1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdyZXNvbHZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnJlc29sdmUgJ34nXG4gICAgICAgICAgICAudG8uZXFsIHNsYXNoLmhvbWUoKVxuICAgIFxuICAgICAgICBpdCAncmVsYXRpdmUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVsYXRpdmUgJ0M6XFxcXHRlc3RcXFxcc29tZVxcXFxwYXRoLnR4dCcsICdDOlxcXFx0ZXN0XFxcXHNvbWVcXFxcb3RoZXJcXFxccGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgJy4uLy4uL3BhdGgudHh0J1xuICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZWxhdGl2ZSAnQzpcXFxcc29tZVxcXFxwYXRoJywgJ0M6L3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgJy4nXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVsYXRpdmUgJ0M6L1VzZXJzL2tvZGkvcy9rb25yYWQvYXBwL2pzL2NvZmZlZS5qcycsICdDOi9Vc2Vycy9rb2RpL3Mva29ucmFkJ1xuICAgICAgICAgICAgLnRvLmVxbCAnYXBwL2pzL2NvZmZlZS5qcydcblxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVsYXRpdmUgJ0M6L3NvbWUvcGF0aC9vbi5jJywgJ0Q6L3BhdGgvb24uZCdcbiAgICAgICAgICAgICAgICAudG8uZXFsICdDOi9zb21lL3BhdGgvb24uYydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVsYXRpdmUgJ0M6XFxcXHNvbWVcXFxccGF0aFxcXFxvbi5jJywgJ0Q6XFxcXHBhdGhcXFxcb24uZCdcbiAgICAgICAgICAgICAgICAudG8uZXFsICdDOi9zb21lL3BhdGgvb24uYydcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAncGFyc2UnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGFyc2UoJ2M6Jykucm9vdFxuICAgICAgICAgICAgLnRvLmVxbCAnYzovJ1xuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnBhcnNlKCdjOicpLmRpclxuICAgICAgICAgICAgLnRvLmVxbCAnYzovJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdzcGxpdCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdCAnL2MvdXNlcnMvaG9tZS8nXG4gICAgICAgICAgICAudG8uZXFsIFsnYycsICd1c2VycycsICdob21lJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0ICdkL3VzZXJzL2hvbWUnXG4gICAgICAgICAgICAudG8uZXFsIFsnZCcsICd1c2VycycsICdob21lJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0ICdjOi9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsIFsnYzonLCAnc29tZScsICdwYXRoJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0ICdkOlxcXFxzb21lXFxcXHBhdGhcXFxcJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2Q6JywgJ3NvbWUnLCAncGF0aCddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdzcGxpdERyaXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RHJpdmUgJy9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsICcnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdERyaXZlICdjOi9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsICdjJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RHJpdmUgJ2M6XFxcXHNvbWVcXFxccGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgJ2MnXVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RHJpdmUgJ2M6XFxcXCdcbiAgICAgICAgICAgIC50by5lcWwgWycvJywgJ2MnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXREcml2ZSAnYzonXG4gICAgICAgICAgICAudG8uZXFsIFsnLycsICdjJ11cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAncmVtb3ZlRHJpdmUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVtb3ZlRHJpdmUgJy9zb21lL3BhdGgnXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoJ1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVtb3ZlRHJpdmUgJ2M6L3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGgnXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVtb3ZlRHJpdmUgJ2M6XFxcXHNvbWVcXFxccGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGgnXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVtb3ZlRHJpdmUgJ2M6LydcbiAgICAgICAgICAgIC50by5lcWwgJy8nXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVtb3ZlRHJpdmUgJ2M6XFxcXCdcbiAgICAgICAgICAgIC50by5lcWwgJy8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZW1vdmVEcml2ZSAnYzonXG4gICAgICAgICAgICAudG8uZXFsICcvJ1xuICAgIFxuICAgICAgICBpdCAnc3BsaXRGaWxlTGluZScsIC0+XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlTGluZSAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgMSwgMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZUxpbmUgJy9zb21lL3BhdGg6MTIzJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJy9zb21lL3BhdGgnLCAxMjMsIDBdXG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc3BsaXRGaWxlTGluZSAnL3NvbWUvcGF0aDoxMjM6MTUnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsIDEyMywgMTVdXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVMaW5lICdjOi9zb21lL3BhdGg6MTIzJ1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2M6L3NvbWUvcGF0aCcsIDEyMywgMF1cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVMaW5lICdjOi9zb21lL3BhdGg6MTIzOjE1J1xuICAgICAgICAgICAgLnRvLmVxbCBbJ2M6L3NvbWUvcGF0aCcsIDEyMywgMTVdXG4gICAgXG4gICAgICAgIGl0ICdzcGxpdEZpbGVQb3MnLCAtPlxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZVBvcyAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgWycvc29tZS9wYXRoJywgWzAsIDBdXVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZVBvcyAnL3NvbWUvcGF0aDoxMjMnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsIFswLCAxMjJdXVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZVBvcyAnL3NvbWUvcGF0aDoxMjM6MTUnXG4gICAgICAgICAgICAudG8uZXFsIFsnL3NvbWUvcGF0aCcsIFsxNSwgMTIyXV1cbiAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLnNwbGl0RmlsZVBvcyAnYzovc29tZS9wYXRoOjEyMydcbiAgICAgICAgICAgIC50by5lcWwgWydjOi9zb21lL3BhdGgnLCBbMCwgMTIyXV1cbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zcGxpdEZpbGVQb3MgJ2M6L3NvbWUvcGF0aDoxMjM6MTUnXG4gICAgICAgICAgICAudG8uZXFsIFsnYzovc29tZS9wYXRoJywgWzE1LCAxMjJdXVxuXG4gICAgICAgIGl0ICdqb2luRmlsZVBvcycsIC0+XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnLCBbMCwwXVxuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aDoxJ1xuXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnLCBbMCw0XVxuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aDo1J1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnLCBbMSw1XVxuICAgICAgICAgICAgLnRvLmVxbCAnL3NvbWUvcGF0aDo2OjEnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5qb2luRmlsZVBvcyAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIC50by5lcWwgJy9zb21lL3BhdGgnXG5cbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5qb2luRmlsZVBvcyAnL3NvbWUvcGF0aCcsIFtdXG4gICAgICAgICAgICAudG8uZXFsICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdleGlzdHMnLCAtPlxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmV4aXN0cyBfX2Rpcm5hbWVcbiAgICAgICAgICAgIC50by5leGlzdFxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmV4aXN0cyBfX2ZpbGVuYW1lXG4gICAgICAgICAgICAudG8uZXhpc3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmV4aXN0cyBfX2ZpbGVuYW1lICsgJ2ZvbydcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnZXhpc3RzIGFzeW5jJywgKGRvbmUpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNsYXNoLmV4aXN0cyBfX2ZpbGVuYW1lLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBleHBlY3Qgc3RhdFxuICAgICAgICAgICAgICAgIC50by5leGlzdFxuICAgICAgICAgICAgICAgIGRvbmUoKVxuICAgIFxuICAgICAgICBpdCAnZXhpc3QgYXN5bmMgbm90JywgKGRvbmUpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNsYXNoLmV4aXN0cyBfX2ZpbGVuYW1lICsgJ2ZvbycsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdCBzdGF0XG4gICAgICAgICAgICAgICAgLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCAnZmlsZUV4aXN0cycsIC0+XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZmlsZUV4aXN0cyBfX2ZpbGVuYW1lXG4gICAgICAgICAgICAudG8uZXhpc3RcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5maWxlRXhpc3RzIF9fZGlybmFtZVxuICAgICAgICAgICAgLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdkaXJFeGlzdHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyRXhpc3RzIF9fZGlybmFtZVxuICAgICAgICAgICAgLnRvLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guZGlyRXhpc3RzIF9fZmlsZW5hbWVcbiAgICAgICAgICAgIC50by5ub3QuZXhpc3RcbiAgICBcbiAgICAgICAgaXQgJ3BrZycsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wa2cgX19kaXJuYW1lXG4gICAgICAgICAgICAudG8uZXhpc3RcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wa2cgX19maWxlbmFtZVxuICAgICAgICAgICAgLnRvLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucGtnICdDOlxcXFwnXG4gICAgICAgICAgICAudG8ubm90LmV4aXN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5wa2cgJ0M6J1xuICAgICAgICAgICAgLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdpc1JlbGF0aXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzUmVsYXRpdmUgX19kaXJuYW1lXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5pc1JlbGF0aXZlICcuJ1xuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5pc1JlbGF0aXZlICcuLidcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guaXNSZWxhdGl2ZSAnLi4vLi9ibGEuLi8uLi9mYXJrJ1xuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5pc1JlbGF0aXZlICdDOlxcXFxibGFmYXJrJ1xuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzUmVsYXRpdmUgJy4uXFxcXGJsYWZhcmsnXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc2FuaXRpemUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2guc2FuaXRpemUgJ2EuYlxcbidcbiAgICAgICAgICAgIC50by5lcWwgJ2EuYidcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5zYW5pdGl6ZSAnXFxuXFxuIGMgLiBkICBcXG5cXG5cXG4nXG4gICAgICAgICAgICAudG8uZXFsICcgYyAuIGQgICdcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnZmlsZWxpc3QnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImV4aXN0c1wiLCAtPiBfLmlzRnVuY3Rpb24gZmlsZWxpc3RcbiAgICAgICAgXG4gICAgICAgIGl0IFwiY2hkaXJcIiwgLT5cbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIgXCIje19fZGlybmFtZX1cIlxuICAgICAgICAgICAgZXhwZWN0IHByb2Nlc3MuY3dkKClcbiAgICAgICAgICAgIC50by5lcWwgX19kaXJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZXR1cm5zIGFuIGFycmF5XCIsIC0+IF8uaXNBcnJheSBmaWxlbGlzdCAnLidcbiAgICAgICAgXG4gICAgICAgIGl0IFwicmV0dXJucyBlbXB0eSBhcnJheVwiLCAtPiBfLmlzRW1wdHkgZmlsZWxpc3QgJ2Zvb2JhcicsIGxvZ0Vycm9yOiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgaXQgXCJmaW5kcyB0aGlzIGZpbGUgcmVsYXRpdmVcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCAnLidcbiAgICAgICAgICAgIC50by5pbmNsdWRlICd0ZXN0LmNvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcImZpbmRzIHRoaXMgZmlsZSBhYnNvbHV0ZVwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0IF9fZGlybmFtZVxuICAgICAgICAgICAgLnRvLmluY2x1ZGUgc2xhc2gucGF0aCBfX2ZpbGVuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJsaXN0cyByZWxhdGl2ZSBwYXRoIHdpdGggZG90XCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QoJy4vZGlyJykubGVuZ3RoXG4gICAgICAgICAgICAudG8uZ3QgMFxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwibGlzdHMgcmVsYXRpdmUgcGF0aCB3aXRob3V0IGRvdFwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0KCdkaXInKS5sZW5ndGhcbiAgICAgICAgICAgIC50by5ndCAwXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpZ25vcmVzIGhpZGRlbiBmaWxlcyBieSBkZWZhdWx0XCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QgJ2RpcidcbiAgICAgICAgICAgIC50by5ub3QuaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpbmNsdWRlcyBoaWRkZW4gZmlsZXNcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCAnZGlyJywgJ2lnbm9yZUhpZGRlbic6IGZhbHNlXG4gICAgICAgICAgICAudG8uaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJkb2Vzbid0IHJlY3Vyc2UgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGZpbGVsaXN0ICdkaXInXG4gICAgICAgICAgICAudG8uZXFsIFtzbGFzaC5ub3JtYWxpemUoJ2Rpci9ub2V4dCcpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmNvZmZlZScpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmpzJyksIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QudHh0JyldXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZWN1cnNlcyBpZiBkZXB0aCBzZXRcIiwgLT5cbiAgICAgICAgICAgIGV4cGVjdCBmaWxlbGlzdCAnZGlyJywgZGVwdGg6IDJcbiAgICAgICAgICAgIC50by5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL25vZXh0JyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuanMnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvdGVzdC50eHQnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmpzJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LnR4dCcpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxYi9sZXZlbDFiLmNvZmZlZScpXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCBcIm1hdGNoZXMgZXh0ZW5zaW9uXCIsIC0+XG4gICAgICAgICAgICBleHBlY3QgZmlsZWxpc3QgJ2RpcicsIGRlcHRoOiAzLCBtYXRjaEV4dDogc2xhc2guZXh0IF9fZmlsZW5hbWVcbiAgICAgICAgICAgIC50by5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDMvbGV2ZWwzLmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDFiL2xldmVsMWIuY29mZmVlJyldXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ2twb3MnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImFuZ2xlXCIsIC0+XG4gICAgICAgICAgICBleHBlY3Qga3BvcygxLDApLmFuZ2xlKGtwb3MgMCwxKVxuICAgICAgICAgICAgLnRvLmVxbCA5MFxuICAgICAgICAgICAgZXhwZWN0IGtwb3MoMSwwKS5hbmdsZShrcG9zIDAsLTEpXG4gICAgICAgICAgICAudG8uZXFsIDkwXG4gICAgICAgICAgICBleHBlY3Qga3BvcygwLDEwKS5hbmdsZShrcG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICAgICAgICAgIGV4cGVjdCBrcG9zKDAsLTEwKS5hbmdsZShrcG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgOTBcbiAgICBcbiAgICAgICAgaXQgXCJyb3RhdGlvblwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IE1hdGgucm91bmQga3BvcygwLDEpLnJvdGF0aW9uKGtwb3MgMSwwKVxuICAgICAgICAgICAgLnRvLmVxbCA5MFxuICAgICAgICAgICAgZXhwZWN0IE1hdGgucm91bmQga3BvcygwLC0xKS5yb3RhdGlvbihrcG9zIDEsMClcbiAgICAgICAgICAgIC50by5lcWwgLTkwXG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBrcG9zKDEsMSkucm90YXRpb24oa3BvcyAxLDApXG4gICAgICAgICAgICAudG8uZXFsIDQ1XG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBrcG9zKDEsLTEpLnJvdGF0aW9uKGtwb3MgMSwwKVxuICAgICAgICAgICAgLnRvLmVxbCAtNDVcbiAgICAgICAgICAgIGV4cGVjdCBNYXRoLnJvdW5kIGtwb3MoMSwwKS5yb3RhdGlvbihrcG9zIDAsMSlcbiAgICAgICAgICAgIC50by5lcWwgLTkwXG4gICAgICAgICAgICBleHBlY3QgTWF0aC5yb3VuZCBrcG9zKDEsMCkucm90YXRpb24oa3BvcyAwLC0xKVxuICAgICAgICAgICAgLnRvLmVxbCA5MFxuICAgIFxuICAgICAgICBpdCBcInJvdGF0ZVwiLCAtPlxuICAgICAgICAgICAgZXhwZWN0IGtwb3MoMSwwKS5yb3RhdGUoOTApLnJvdW5kZWQoKVxuICAgICAgICAgICAgLnRvLmVxbCBrcG9zKDAsMSlcbiAgICAgICAgICAgIGV4cGVjdCBrcG9zKDEsMCkucm90YXRlKC05MCkucm91bmRlZCgpXG4gICAgICAgICAgICAudG8uZXFsIGtwb3MoMCwtMSlcbiAgICAgICAgICAgIGV4cGVjdCBrcG9zKDEsMCkucm90YXRlKDQ1KS5yb3VuZGVkKDAuMDAxKVxuICAgICAgICAgICAgLnRvLmVxbCBrcG9zKDEsMSkubm9ybWFsKCkucm91bmRlZCgwLjAwMSlcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnY2xhbXAnLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ2NsYW1wcycsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAwLCAxLCAxLjFcbiAgICAgICAgICAgIC50by5lcWwgMVxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IGNsYW1wIDEsIDAsIDEuMVxuICAgICAgICAgICAgLnRvLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAyLjIsIDMsIDEuMVxuICAgICAgICAgICAgLnRvLmVxbCAyLjJcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAzLCAyLjIsIDEuMVxuICAgICAgICAgICAgLnRvLmVxbCAyLjJcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnbnVsbHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgMCwgMVxuICAgICAgICAgICAgLnRvLmVxbCAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAyLCAzLCB1bmRlZmluZWRcbiAgICAgICAgICAgIC50by5lcWwgMlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgNCwgNSwgbnVsbFxuICAgICAgICAgICAgLnRvLmVxbCA0XG4gICAgXG4gICAgICAgICAgICBleHBlY3QgY2xhbXAgNiwgNywge31cbiAgICAgICAgICAgIC50by5lcWwgNlxuICAgIFxuICAgICAgICAgICAgZXhwZWN0IGNsYW1wIDgsIDksIFtdXG4gICAgICAgICAgICAudG8uZXFsIDhcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAxMCwgMTEsIGNsYW1wXG4gICAgICAgICAgICAudG8uZXFsIDEwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBjbGFtcCAtMywgLTIsIDBcbiAgICAgICAgICAgIC50by5lcWwgLTJcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnZW1wdHknLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ3RydWUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgJycgICAgXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5IFtdICAgIFxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSB7fSAgICBcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgbnVsbFxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSB1bmRlZmluZWRcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSAxXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSAwXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSBbW11dXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlbXB0eSBhOm51bGxcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVtcHR5ICcgJ1xuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZW1wdHkgSW5maW5pdHlcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ3ZhbGlkJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCAnJyAgICBcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIFtdICAgIFxuICAgICAgICAgICAgLnRvLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQge30gICAgXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCBudWxsXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCB1bmRlZmluZWRcbiAgICAgICAgICAgIC50by5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndHJ1ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCAxXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIDBcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgW1tdXVxuICAgICAgICAgICAgLnRvLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCB2YWxpZCBhOm51bGxcbiAgICAgICAgICAgIC50by5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgdmFsaWQgJyAnXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHZhbGlkIEluZmluaXR5XG4gICAgICAgICAgICAudG8uZXFsIHRydWVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBkZXNjcmliZSAnZmlsdGVyJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdhcnJheScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBmaWx0ZXIgWzEsMiwzLDRdLCAodixpKSAtPiBpICUgMlxuICAgICAgICAgICAgLnRvLmVxbCBbMiw0XVxuXG4gICAgICAgICAgICBleHBlY3QgZmlsdGVyIFsxLDIsMyw0XSwgKHYsaSkgLT4gdiAlIDJcbiAgICAgICAgICAgIC50by5lcWwgWzEsM11cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnb2JqZWN0JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGZpbHRlciB7YToxLGI6MixjOjMsZDo0fSwgKHYsaykgLT4gdiAlIDJcbiAgICAgICAgICAgIC50by5lcWwge2E6MSxjOjN9XG5cbiAgICAgICAgICAgIGV4cGVjdCBmaWx0ZXIge2E6MSxiOjIsYzozLGQ6NH0sICh2LGspIC0+IGsgaW4gWydiJywgJ2MnXVxuICAgICAgICAgICAgLnRvLmVxbCB7YjoyLGM6M31cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndmFsdWUnLCAtPiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZmlsdGVyKDEsIC0+KVxuICAgICAgICAgICAgLnRvLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBmaWx0ZXIoXCJoZWxsb1wiLCAtPilcbiAgICAgICAgICAgIC50by5lcWwgXCJoZWxsb1wiXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ2lzVGV4dCcsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAnbm9uIGJpbmFyeScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5pc1RleHQgX19kaXJuYW1lICsgJy9kaXIvbm9leHQnXG4gICAgICAgICAgICAudG8uZXFsIHRydWVcblxuICAgICAgICBpdCAnYmluYXJ5JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHNsYXNoLmlzVGV4dCBfX2Rpcm5hbWUgKyAnLi4vaW1nL2t4ay5wbmcnXG4gICAgICAgICAgICAudG8uZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdyZWFkVGV4dCcsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAncmVhZHMgdGV4dCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBzbGFzaC5yZWFkVGV4dCBfX2Rpcm5hbWUgKyAnL2Rpci9ub2V4dCdcbiAgICAgICAgICAgIC50by5lcWwgJ2hlbGxvXFxuJ1xuXG4gICAgICAgIGl0ICdyZXR1cm5zIGVtcHR5IHRleHQgaWYgZmlsZSBkb2VzbnQgZXhpc3QnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgc2xhc2gucmVhZFRleHQgX19kaXJuYW1lICsgJy9kaXIvZmlsZWRvZXNudGV4aXN0J1xuICAgICAgICAgICAgLnRvLmVxbCAnJ1xuXG4gICAgICAgIGl0ICdyZWFkcyB0ZXh0IHN5bmMnLCAoZG9uZSkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2xhc2gucmVhZFRleHQgX19kaXJuYW1lICsgJy9kaXIvbm9leHQnLCAodGV4dCkgLT5cbiAgICAgICAgICAgICAgICBleHBlY3QgdGV4dFxuICAgICAgICAgICAgICAgIC50by5lcWwgJ2hlbGxvXFxuJ1xuICAgICAgICAgICAgICAgIGRvbmUoKVxuXG4gICAgICAgIGl0ICdyZXR1cm5zIGVtcHR5IHRleHQgaWYgZmlsZSBkb2VzbnQgZXhpc3Qgc3luYycsIChkb25lKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzbGFzaC5yZWFkVGV4dCBfX2Rpcm5hbWUgKyAnL2Rpci9maWxlZG9lc250ZXhpc3QnLCAodGV4dCkgLT5cbiAgICAgICAgICAgICAgICBleHBlY3QgdGV4dFxuICAgICAgICAgICAgICAgIC50by5lcWwgJydcbiAgICAgICAgICAgICAgICBkb25lKClcbiAgICAgICAgXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../../test/test.coffee