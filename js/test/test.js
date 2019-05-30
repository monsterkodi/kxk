// koffee 0.56.0
var _, chai, clamp, empty, expect, filelist, filter, kolor, kpos, kstr, ref, slash, splitFileLine, valid;

ref = require('../'), filelist = ref.filelist, splitFileLine = ref.splitFileLine, slash = ref.slash, kpos = ref.kpos, kstr = ref.kstr, empty = ref.empty, valid = ref.valid, clamp = ref.clamp, chai = ref.chai, kolor = ref.kolor, filter = ref.filter, _ = ref._;

kolor.globalize();

expect = chai().expect;

describe('kxk', function() {
    describe('kstr', function() {
        it('replaceTabs', function() {
            kstr.replaceTabs('\t\t').should.eql('        ');
            return kstr.replaceTabs('aa\tbb').should.eql('aa  bb');
        });
        it('escapeRegexp', function() {
            return kstr.escapeRegexp('a/b.txt').should.eql('a\\/b\\.txt');
        });
        it('lpad', function() {
            kstr.lpad('', 4).should.eql('    ');
            kstr.lpad('x', 4).should.eql('   x');
            return kstr.lpad(' xxx ', 2).should.eql(' xxx ');
        });
        it('rpad', function() {
            kstr.rpad('', 4).should.eql('    ');
            kstr.rpad('x', 4).should.eql('x   ');
            return kstr.rpad(' xxx ', 2).should.eql(' xxx ');
        });
        it('ansi2html', function() {
            var a2h;
            a2h = function(s, r) {
                return kstr.ansi2html(s).should.eql(r);
            };
            a2h('hello', 'hello');
            a2h(r5('red'), '<span style="color:#ff0000;">red</span>');
            a2h((r5('red')) + "\n" + (g5('green')), "<span style=\"color:#ff0000;\">red</span>\n<span style=\"color:#00ff00;\">green</span>");
            return a2h("" + (r5('red')) + (g5('green')), '<span style="color:#ff0000;">red</span><span style="color:#00ff00;">green</span>');
        });
        return it('stripAnsi', function() {
            return (kstr.stripAnsi(g5('green'))).should.eql('green');
        });
    });
    describe('slash', function() {
        it('dir', function() {
            (slash.dir('/some/path/file.txt')).should.eql('/some/path');
            (slash.dir('/some/dir/')).should.eql('/some');
            if (slash.win()) {
                (slash.dir('C:\\Back\\')).should.eql('C:/');
            }
            (slash.dir('../..')).should.eql('..');
            (slash.dir('/')).should.eql('');
            (slash.dir('.')).should.eql('');
            (slash.dir('..')).should.eql('');
            (slash.dir('~')).should.eql('');
            (slash.dir('./')).should.eql('');
            (slash.dir('../')).should.eql('');
            (slash.dir('~/')).should.eql('');
            if (slash.win()) {
                return (slash.dir('C:/')).should.eql('');
            }
        });
        it('pathlist', function() {
            (slash.pathlist('/some/path.txt')).should.eql(['/', '/some', '/some/path.txt']);
            (slash.pathlist('/')).should.eql(['/']);
            (slash.pathlist('')).should.eql([]);
            if (slash.win()) {
                (slash.pathlist('C:\\Back\\Slash\\')).should.eql(['C:/', 'C:/Back', 'C:/Back/Slash/']);
            }
            return (slash.pathlist('~')).should.eql(['~']);
        });
        it('base', function() {
            return (slash.base('/some/path.txt')).should.eql('path');
        });
        it('path', function() {
            if (!slash.win()) {
                return;
            }
            (slash.path("C:\\Back\\Slash\\Crap")).should.eql("C:/Back/Slash/Crap");
            return (slash.path("C:\\Back\\Slash\\Crap\\..\\..\\To\\The\\..\\Future")).should.eql("C:/Back/To/Future");
        });
        it('join', function() {
            (slash.join('a', 'b', 'c')).should.eql('a/b/c');
            if (!slash.win()) {
                return;
            }
            return (slash.join('C:\\FOO', '.\\BAR', 'that\\sucks')).should.eql('C:/FOO/BAR/that/sucks');
        });
        it('home', function() {
            var home;
            if (slash.win()) {
                home = slash.path(process.env['HOMEDRIVE'] + process.env['HOMEPATH']);
            } else {
                home = process.env['HOME'];
            }
            (slash.home()).should.eql(home);
            (slash.tilde(home)).should.eql('~');
            (slash.tilde(home + '/sub')).should.eql('~/sub');
            return (slash.untilde('~/sub')).should.eql(home + '/sub');
        });
        it('unenv', function() {
            (slash.unenv('C:/$Recycle.bin')).should.eql('C:/$Recycle.bin');
            if (!slash.win()) {
                return;
            }
            return (slash.unenv('$HOME/test')).should.eql(slash.path(process.env['HOME']) + '/test');
        });
        it('unslash', function() {
            if (!slash.win()) {
                return;
            }
            return (slash.unslash('/c/test')).should.eql('C:\\test');
        });
        it('resolve', function() {
            return (slash.resolve('~')).should.eql(slash.home());
        });
        it('relative', function() {
            (slash.relative('C:\\test\\some\\path.txt', 'C:\\test\\some\\other\\path')).should.eql('../../path.txt');
            (slash.relative('C:\\some\\path', 'C:/some/path')).should.eql('.');
            (slash.relative('C:/Users/kodi/s/konrad/app/js/coffee.js', 'C:/Users/kodi/s/konrad')).should.eql('app/js/coffee.js');
            if (slash.win()) {
                (slash.relative('C:/some/path/on.c', 'D:/path/on.d')).should.eql('C:/some/path/on.c');
                return (slash.relative('C:\\some\\path\\on.c', 'D:\\path\\on.d')).should.eql('C:/some/path/on.c');
            }
        });
        it('parse', function() {
            if (!slash.win()) {
                return;
            }
            (slash.parse('c:').root).should.eql('c:/');
            return (slash.parse('c:').dir).should.eql('c:/');
        });
        it('split', function() {
            (slash.split('/c/users/home/')).should.eql(['c', 'users', 'home']);
            (slash.split('d/users/home')).should.eql(['d', 'users', 'home']);
            (slash.split('c:/some/path')).should.eql(['c:', 'some', 'path']);
            return (slash.split('d:\\some\\path\\')).should.eql(['d:', 'some', 'path']);
        });
        it('splitDrive', function() {
            (slash.splitDrive('/some/path')).should.eql(['/some/path', '']);
            if (!slash.win()) {
                return;
            }
            (slash.splitDrive('c:/some/path')).should.eql(['/some/path', 'c']);
            (slash.splitDrive('c:\\some\\path')).should.eql(['/some/path', 'c']);
            (slash.splitDrive('c:\\')).should.eql(['/', 'c']);
            return (slash.splitDrive('c:')).should.eql(['/', 'c']);
        });
        it('removeDrive', function() {
            (slash.removeDrive('/some/path')).should.eql('/some/path');
            if (!slash.win()) {
                return;
            }
            (slash.removeDrive('c:/some/path')).should.eql('/some/path');
            (slash.removeDrive('c:\\some\\path')).should.eql('/some/path');
            (slash.removeDrive('c:/')).should.eql('/');
            (slash.removeDrive('c:\\')).should.eql('/');
            return (slash.removeDrive('c:')).should.eql('/');
        });
        it('splitFileLine', function() {
            (slash.splitFileLine('/some/path')).should.eql(['/some/path', 1, 0]);
            (slash.splitFileLine('/some/path:123')).should.eql(['/some/path', 123, 0]);
            (slash.splitFileLine('/some/path:123:15')).should.eql(['/some/path', 123, 15]);
            if (!slash.win()) {
                return;
            }
            (slash.splitFileLine('c:/some/path:123')).should.eql(['c:/some/path', 123, 0]);
            return (slash.splitFileLine('c:/some/path:123:15')).should.eql(['c:/some/path', 123, 15]);
        });
        it('splitFilePos', function() {
            (slash.splitFilePos('/some/path')).should.eql(['/some/path', [0, 0]]);
            (slash.splitFilePos('/some/path:123')).should.eql(['/some/path', [0, 122]]);
            (slash.splitFilePos('/some/path:123:15')).should.eql(['/some/path', [15, 122]]);
            if (!slash.win()) {
                return;
            }
            (slash.splitFilePos('c:/some/path:123')).should.eql(['c:/some/path', [0, 122]]);
            return (slash.splitFilePos('c:/some/path:123:15')).should.eql(['c:/some/path', [15, 122]]);
        });
        it('joinFilePos', function() {
            (slash.joinFilePos('/some/path', [0, 0])).should.eql('/some/path:1');
            (slash.joinFilePos('/some/path', [0, 4])).should.eql('/some/path:5');
            (slash.joinFilePos('/some/path', [1, 5])).should.eql('/some/path:6:1');
            (slash.joinFilePos('/some/path')).should.eql('/some/path');
            return (slash.joinFilePos('/some/path', [])).should.eql('/some/path');
        });
        it('exists', function() {
            (slash.exists(__dirname)).should.exist;
            (slash.exists(__filename)).should.exist;
            return (slash.exists(__filename + 'foo')).should.eql(false);
        });
        it('exists async', function(done) {
            return slash.exists(__filename, function(stat) {
                stat.should.exist;
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
            (slash.fileExists(__filename)).should.exist;
            return expect(slash.fileExists(__dirname)).to.not.exist;
        });
        it('dirExists', function() {
            (slash.dirExists(__dirname)).should.exist;
            return expect(slash.dirExists(__filename)).to.not.exist;
        });
        it('pkg', function() {
            (slash.pkg(__dirname)).should.exist;
            (slash.pkg(__filename)).should.exist;
            expect(slash.pkg('C:\\')).to.not.exist;
            return expect(slash.pkg('C:')).to.not.exist;
        });
        it('isRelative', function() {
            (slash.isRelative(__dirname)).should.eql(false);
            (slash.isRelative('.')).should.eql(true);
            (slash.isRelative('..')).should.eql(true);
            (slash.isRelative('.././bla../../fark')).should.eql(true);
            if (!slash.win()) {
                return;
            }
            (slash.isRelative('C:\\blafark')).should.eql(false);
            return (slash.isRelative('..\\blafark')).should.eql(true);
        });
        return it('sanitize', function() {
            (slash.sanitize('a.b\n')).should.eql('a.b');
            return (slash.sanitize('\n\n c . d  \n\n\n')).should.eql(' c . d  ');
        });
    });
    describe('filelist', function() {
        it("exists", function() {
            return _.isFunction(filelist);
        });
        it("chdir", function() {
            process.chdir("" + __dirname);
            return (process.cwd()).should.eql(__dirname);
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
            return (filelist('.')).should.include('test.coffee');
        });
        it("finds this file absolute", function() {
            return (filelist(__dirname)).should.include(slash.path(__filename));
        });
        it("lists relative path with dot", function() {
            return (filelist('./dir').length).should.gt(0);
        });
        it("lists relative path without dot", function() {
            return (filelist('dir').length).should.gt(0);
        });
        it("ignores hidden files by default", function() {
            return (filelist('dir')).should.not.include(slash.normalize('dir/.konrad.noon'));
        });
        it("includes hidden files", function() {
            return (filelist('dir', {
                'ignoreHidden': false
            })).should.include(slash.normalize('dir/.konrad.noon'));
        });
        it("doesn't recurse by default", function() {
            return (filelist('dir')).should.eql([slash.normalize('dir/noext'), slash.normalize('dir/test.coffee'), slash.normalize('dir/test.js'), slash.normalize('dir/test.txt')]);
        });
        it("recurses if depth set", function() {
            return (filelist('dir', {
                depth: 2
            })).should.eql([slash.normalize('dir/noext'), slash.normalize('dir/test.coffee'), slash.normalize('dir/test.js'), slash.normalize('dir/test.txt'), slash.normalize('dir/level1/test.coffee'), slash.normalize('dir/level1/test.js'), slash.normalize('dir/level1/test.txt'), slash.normalize('dir/level1/level2/level2.coffee'), slash.normalize('dir/level1b/level1b.coffee')]);
        });
        return it("matches extension", function() {
            return (filelist('dir', {
                depth: 3,
                matchExt: slash.ext(__filename)
            })).should.eql([slash.normalize('dir/test.coffee'), slash.normalize('dir/level1/test.coffee'), slash.normalize('dir/level1/level2/level2.coffee'), slash.normalize('dir/level1/level2/level3/level3.coffee'), slash.normalize('dir/level1b/level1b.coffee')]);
        });
    });
    describe('kpos', function() {
        it("angle", function() {
            (kpos(1, 0).angle(kpos(0, 1))).should.eql(90);
            (kpos(1, 0).angle(kpos(0, -1))).should.eql(90);
            (kpos(0, 10).angle(kpos(1, 0))).should.eql(90);
            return (kpos(0, -10).angle(kpos(1, 0))).should.eql(90);
        });
        it("rotation", function() {
            (Math.round(kpos(0, 1).rotation(kpos(1, 0)))).should.eql(90);
            (Math.round(kpos(0, -1).rotation(kpos(1, 0)))).should.eql(-90);
            (Math.round(kpos(1, 1).rotation(kpos(1, 0)))).should.eql(45);
            (Math.round(kpos(1, -1).rotation(kpos(1, 0)))).should.eql(-45);
            (Math.round(kpos(1, 0).rotation(kpos(0, 1)))).should.eql(-90);
            return (Math.round(kpos(1, 0).rotation(kpos(0, -1)))).should.eql(90);
        });
        return it("rotate", function() {
            (kpos(1, 0).rotate(90).rounded()).should.eql(kpos(0, 1));
            (kpos(1, 0).rotate(-90).rounded()).should.eql(kpos(0, -1));
            return (kpos(1, 0).rotate(45).rounded(0.001)).should.eql(kpos(1, 1).normal().rounded(0.001));
        });
    });
    describe('clamp', function() {
        it('clamps', function() {
            (clamp(0, 1, 1.1)).should.eql(1);
            (clamp(1, 0, 1.1)).should.eql(1);
            (clamp(2.2, 3, 1.1)).should.eql(2.2);
            return (clamp(3, 2.2, 1.1)).should.eql(2.2);
        });
        return it('nulls', function() {
            (clamp(0, 1)).should.eql(0);
            (clamp(2, 3, void 0)).should.eql(2);
            (clamp(4, 5, null)).should.eql(4);
            (clamp(6, 7, {})).should.eql(6);
            (clamp(8, 9, [])).should.eql(8);
            (clamp(10, 11, clamp)).should.eql(10);
            return (clamp(-3, -2, 0)).should.eql(-2);
        });
    });
    describe('empty', function() {
        it('true', function() {
            (empty('')).should.eql(true);
            (empty([])).should.eql(true);
            (empty({})).should.eql(true);
            (empty(null)).should.eql(true);
            return (empty(void 0)).should.eql(true);
        });
        return it('false', function() {
            (empty(1)).should.eql(false);
            (empty(0)).should.eql(false);
            (empty([[]])).should.eql(false);
            (empty({
                a: null
            })).should.eql(false);
            (empty(' ')).should.eql(false);
            return (empty(2e308)).should.eql(false);
        });
    });
    describe('valid', function() {
        it('false', function() {
            (valid('')).should.eql(false);
            (valid([])).should.eql(false);
            (valid({})).should.eql(false);
            (valid(null)).should.eql(false);
            return (valid(void 0)).should.eql(false);
        });
        return it('true', function() {
            (valid(1)).should.eql(true);
            (valid(0)).should.eql(true);
            (valid([[]])).should.eql(true);
            (valid({
                a: null
            })).should.eql(true);
            (valid(' ')).should.eql(true);
            return (valid(2e308)).should.eql(true);
        });
    });
    describe('filter', function() {
        it('array', function() {
            (filter([1, 2, 3, 4], function(v, i) {
                return i % 2;
            })).should.eql([2, 4]);
            return (filter([1, 2, 3, 4], function(v, i) {
                return v % 2;
            })).should.eql([1, 3]);
        });
        it('object', function() {
            (filter({
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }, function(v, k) {
                return v % 2;
            })).should.eql({
                a: 1,
                c: 3
            });
            return (filter({
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }, function(v, k) {
                return k === 'b' || k === 'c';
            })).should.eql({
                b: 2,
                c: 3
            });
        });
        return it('value', function() {
            (filter(1, function() {})).should.eql(1);
            return (filter("hello", function() {})).should.eql("hello");
        });
    });
    describe('isText', function() {
        it('non binary', function() {
            return (slash.isText(__dirname + '/dir/noext')).should.eql(true);
        });
        return it('binary', function() {
            return (slash.isText(__dirname + '../img/kxk.png')).should.eql(false);
        });
    });
    return describe('readText', function() {
        it('reads text', function() {
            return (slash.readText(__dirname + '/dir/noext')).should.eql('hello\n');
        });
        it('returns empty text if file doesnt exist', function() {
            return (slash.readText(__dirname + '/dir/filedoesntexist')).should.eql('');
        });
        it('reads text sync', function(done) {
            return slash.readText(__dirname + '/dir/noext', function(text) {
                text.should.eql('hello\n');
                return done();
            });
        });
        return it('returns empty text if file doesnt exist sync', function(done) {
            return slash.readText(__dirname + '/dir/filedoesntexist', function(text) {
                text.should.eql('');
                return done();
            });
        });
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBOEYsT0FBQSxDQUFRLEtBQVIsQ0FBOUYsRUFBRSx1QkFBRixFQUFZLGlDQUFaLEVBQTJCLGlCQUEzQixFQUFrQyxlQUFsQyxFQUF3QyxlQUF4QyxFQUE4QyxpQkFBOUMsRUFBcUQsaUJBQXJELEVBQTRELGlCQUE1RCxFQUFtRSxlQUFuRSxFQUF5RSxpQkFBekUsRUFBZ0YsbUJBQWhGLEVBQXdGOztBQUV4RixLQUFLLENBQUMsU0FBTixDQUFBOztBQUNBLE1BQUEsR0FBUyxJQUFBLENBQUEsQ0FBTSxDQUFDOztBQUVoQixRQUFBLENBQVMsS0FBVCxFQUFnQixTQUFBO0lBRVosUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQTtRQUViLEVBQUEsQ0FBRyxhQUFILEVBQWtCLFNBQUE7WUFDZCxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixDQUF3QixDQUFDLE1BQU0sQ0FBQyxHQUFoQyxDQUFvQyxVQUFwQzttQkFDQSxJQUFJLENBQUMsV0FBTCxDQUFpQixRQUFqQixDQUEwQixDQUFDLE1BQU0sQ0FBQyxHQUFsQyxDQUFzQyxRQUF0QztRQUZjLENBQWxCO1FBSUEsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQTttQkFDZixJQUFJLENBQUMsWUFBTCxDQUFrQixTQUFsQixDQUE0QixDQUFDLE1BQU0sQ0FBQyxHQUFwQyxDQUF3QyxhQUF4QztRQURlLENBQW5CO1FBR0EsRUFBQSxDQUFHLE1BQUgsRUFBVSxTQUFBO1lBQ04sSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFWLEVBQWMsQ0FBZCxDQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUF4QixDQUE0QixNQUE1QjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLENBQWYsQ0FBaUIsQ0FBQyxNQUFNLENBQUMsR0FBekIsQ0FBNkIsTUFBN0I7bUJBQ0EsSUFBSSxDQUFD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QUEzQixFQUFtRCxTQUFDLElBQUQ7Z0JBQzlDLElBQUssQ0FBQyxNQUFNLENBQUMsR0FBZCxDQUFrQixFQUFsQjt1QkFDQSxJQUFBLENBQUE7WUFGK0MsQ0FBbkQ7UUFGK0MsQ0FBbkQ7SUFoQmlCLENBQXJCO0FBL2hCWSxDQUFoQiIsInNvdXJjZXNDb250ZW50IjpbIiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDBcbiMgICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMFxuIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwXG5cbnsgZmlsZWxpc3QsIHNwbGl0RmlsZUxpbmUsIHNsYXNoLCBrcG9zLCBrc3RyLCBlbXB0eSwgdmFsaWQsIGNsYW1wLCBjaGFpLCBrb2xvciwgZmlsdGVyLCBfIH0gPSByZXF1aXJlICcuLi8nXG5cbmtvbG9yLmdsb2JhbGl6ZSgpXG5leHBlY3QgPSBjaGFpKCkuZXhwZWN0XG5cbmRlc2NyaWJlICdreGsnLCAtPlxuICAgIFxuICAgIGRlc2NyaWJlICdrc3RyJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdyZXBsYWNlVGFicycsIC0+XG4gICAgICAgICAgICBrc3RyLnJlcGxhY2VUYWJzKCdcXHRcXHQnKS5zaG91bGQuZXFsICcgICAgICAgICdcbiAgICAgICAgICAgIGtzdHIucmVwbGFjZVRhYnMoJ2FhXFx0YmInKS5zaG91bGQuZXFsICdhYSAgYmInXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2VzY2FwZVJlZ2V4cCcsIC0+XG4gICAgICAgICAgICBrc3RyLmVzY2FwZVJlZ2V4cCgnYS9iLnR4dCcpLnNob3VsZC5lcWwgJ2FcXFxcL2JcXFxcLnR4dCdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnbHBhZCcgLT5cbiAgICAgICAgICAgIGtzdHIubHBhZCgnJywgNCkuc2hvdWxkLmVxbCAnICAgICdcbiAgICAgICAgICAgIGtzdHIubHBhZCgneCcsIDQpLnNob3VsZC5lcWwgJyAgIHgnXG4gICAgICAgICAgICBrc3RyLmxwYWQoJyB4eHggJywgMikuc2hvdWxkLmVxbCAnIHh4eCAnXG5cbiAgICAgICAgaXQgJ3JwYWQnIC0+XG4gICAgICAgICAgICBrc3RyLnJwYWQoJycsIDQpLnNob3VsZC5lcWwgJyAgICAnXG4gICAgICAgICAgICBrc3RyLnJwYWQoJ3gnLCA0KS5zaG91bGQuZXFsICd4ICAgJ1xuICAgICAgICAgICAga3N0ci5ycGFkKCcgeHh4ICcsIDIpLnNob3VsZC5lcWwgJyB4eHggJ1xuICAgICBcbiAgICAgICAgaXQgJ2Fuc2kyaHRtbCcgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYTJoID0gKHMscikgLT4ga3N0ci5hbnNpMmh0bWwocykuc2hvdWxkLmVxbCByXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEyaCAnaGVsbG8nLCAnaGVsbG8nXG4gICAgICAgICAgICBhMmggcjUoJ3JlZCcpLCAnPHNwYW4gc3R5bGU9XCJjb2xvcjojZmYwMDAwO1wiPnJlZDwvc3Bhbj4nXG4gICAgICAgICAgICBhMmggXCJcIlwiXG4gICAgICAgICAgICAgICAgI3tyNSgncmVkJyl9XG4gICAgICAgICAgICAgICAgI3tnNSgnZ3JlZW4nKX1cbiAgICAgICAgICAgICAgICBcIlwiXCIsIFwiXCJcIlxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiY29sb3I6I2ZmMDAwMDtcIj5yZWQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJjb2xvcjojMDBmZjAwO1wiPmdyZWVuPC9zcGFuPlxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgYTJoIFwiI3tyNSgncmVkJyl9I3tnNSgnZ3JlZW4nKX1cIiwgJzxzcGFuIHN0eWxlPVwiY29sb3I6I2ZmMDAwMDtcIj5yZWQ8L3NwYW4+PHNwYW4gc3R5bGU9XCJjb2xvcjojMDBmZjAwO1wiPmdyZWVuPC9zcGFuPidcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3RyaXBBbnNpJyAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoa3N0ci5zdHJpcEFuc2kgZzUoJ2dyZWVuJykpLnNob3VsZC5lcWwgJ2dyZWVuJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdzbGFzaCcsIC0+XG5cbiAgICAgICAgaXQgJ2RpcicsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy9zb21lL3BhdGgvZmlsZS50eHQnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyICcvc29tZS9kaXIvJykuc2hvdWxkLmVxbCAnL3NvbWUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgKHNsYXNoLmRpciAnQzpcXFxcQmFja1xcXFwnKS5zaG91bGQuZXFsICdDOi8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy4uLy4uJykuc2hvdWxkLmVxbCAnLi4nXG5cbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy8nKS5zaG91bGQuZXFsICcnXG5cbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy4nKS5zaG91bGQuZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy4uJykuc2hvdWxkLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyICd+Jykuc2hvdWxkLmVxbCAnJ1xuXG4gICAgICAgICAgICAoc2xhc2guZGlyICcuLycpLnNob3VsZC5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmRpciAnLi4vJykuc2hvdWxkLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyICd+LycpLnNob3VsZC5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICAoc2xhc2guZGlyICdDOi8nKS5zaG91bGQuZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3BhdGhsaXN0JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBhdGhsaXN0ICcvc29tZS9wYXRoLnR4dCcpLnNob3VsZC5lcWwgWycvJywgJy9zb21lJywgJy9zb21lL3BhdGgudHh0J11cblxuICAgICAgICAgICAgKHNsYXNoLnBhdGhsaXN0ICcvJykuc2hvdWxkLmVxbCBbJy8nXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucGF0aGxpc3QgJycpLnNob3VsZC5lcWwgW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICAoc2xhc2gucGF0aGxpc3QgJ0M6XFxcXEJhY2tcXFxcU2xhc2hcXFxcJykuc2hvdWxkLmVxbCBbJ0M6LycsICdDOi9CYWNrJywgJ0M6L0JhY2svU2xhc2gvJ11cblxuICAgICAgICAgICAgKHNsYXNoLnBhdGhsaXN0ICd+Jykuc2hvdWxkLmVxbCBbJ34nXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdiYXNlJywgLT4gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5iYXNlICcvc29tZS9wYXRoLnR4dCcpLnNob3VsZC5lcWwgJ3BhdGgnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdwYXRoJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucGF0aCBcIkM6XFxcXEJhY2tcXFxcU2xhc2hcXFxcQ3JhcFwiKS5zaG91bGQuZXFsIFwiQzovQmFjay9TbGFzaC9DcmFwXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBhdGggXCJDOlxcXFxCYWNrXFxcXFNsYXNoXFxcXENyYXBcXFxcLi5cXFxcLi5cXFxcVG9cXFxcVGhlXFxcXC4uXFxcXEZ1dHVyZVwiKS5zaG91bGQuZXFsIFwiQzovQmFjay9Uby9GdXR1cmVcIlxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdqb2luJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW4gJ2EnLCAnYicsICdjJykuc2hvdWxkLmVxbCAnYS9iL2MnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW4gJ0M6XFxcXEZPTycsICcuXFxcXEJBUicsICd0aGF0XFxcXHN1Y2tzJykuc2hvdWxkLmVxbCAnQzovRk9PL0JBUi90aGF0L3N1Y2tzJ1xuICAgIFxuICAgICAgICBpdCAnaG9tZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgaG9tZSA9IHNsYXNoLnBhdGggcHJvY2Vzcy5lbnZbJ0hPTUVEUklWRSddICsgcHJvY2Vzcy5lbnZbJ0hPTUVQQVRIJ11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBob21lID0gcHJvY2Vzcy5lbnZbJ0hPTUUnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmhvbWUoKSkuc2hvdWxkLmVxbCBob21lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC50aWxkZSBob21lKS5zaG91bGQuZXFsICd+J1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnRpbGRlIGhvbWUgKyAnL3N1YicpLnNob3VsZC5lcWwgJ34vc3ViJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gudW50aWxkZSAnfi9zdWInKS5zaG91bGQuZXFsIGhvbWUgKyAnL3N1YidcbiAgICBcbiAgICAgICAgaXQgJ3VuZW52JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnVuZW52ICdDOi8kUmVjeWNsZS5iaW4nKS5zaG91bGQuZXFsICdDOi8kUmVjeWNsZS5iaW4nXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgXG4gICAgICAgICAgICAoc2xhc2gudW5lbnYgJyRIT01FL3Rlc3QnKS5zaG91bGQuZXFsIHNsYXNoLnBhdGgocHJvY2Vzcy5lbnZbJ0hPTUUnXSkgKyAnL3Rlc3QnXG4gICAgXG4gICAgICAgIGl0ICd1bnNsYXNoJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnVuc2xhc2ggJy9jL3Rlc3QnKS5zaG91bGQuZXFsICdDOlxcXFx0ZXN0J1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdyZXNvbHZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlc29sdmUgJ34nKS5zaG91bGQuZXFsIHNsYXNoLmhvbWUoKVxuICAgIFxuICAgICAgICBpdCAncmVsYXRpdmUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucmVsYXRpdmUgJ0M6XFxcXHRlc3RcXFxcc29tZVxcXFxwYXRoLnR4dCcsICdDOlxcXFx0ZXN0XFxcXHNvbWVcXFxcb3RoZXJcXFxccGF0aCcpLnNob3VsZC5lcWwgJy4uLy4uL3BhdGgudHh0J1xuICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5yZWxhdGl2ZSAnQzpcXFxcc29tZVxcXFxwYXRoJywgJ0M6L3NvbWUvcGF0aCcpLnNob3VsZC5lcWwgJy4nXG4gICAgXG4gICAgICAgICAgICAoc2xhc2gucmVsYXRpdmUgJ0M6L1VzZXJzL2tvZGkvcy9rb25yYWQvYXBwL2pzL2NvZmZlZS5qcycsICdDOi9Vc2Vycy9rb2RpL3Mva29ucmFkJykuc2hvdWxkLmVxbCAnYXBwL2pzL2NvZmZlZS5qcydcblxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAoc2xhc2gucmVsYXRpdmUgJ0M6L3NvbWUvcGF0aC9vbi5jJywgJ0Q6L3BhdGgvb24uZCcpLnNob3VsZC5lcWwgJ0M6L3NvbWUvcGF0aC9vbi5jJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIChzbGFzaC5yZWxhdGl2ZSAnQzpcXFxcc29tZVxcXFxwYXRoXFxcXG9uLmMnLCAnRDpcXFxccGF0aFxcXFxvbi5kJykuc2hvdWxkLmVxbCAnQzovc29tZS9wYXRoL29uLmMnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3BhcnNlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgKHNsYXNoLnBhcnNlKCdjOicpLnJvb3QpLnNob3VsZC5lcWwgJ2M6LydcbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5wYXJzZSgnYzonKS5kaXIpLnNob3VsZC5lcWwgJ2M6LydcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3BsaXQnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXQgJy9jL3VzZXJzL2hvbWUvJykuc2hvdWxkLmVxbCBbJ2MnLCAndXNlcnMnLCAnaG9tZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdCAnZC91c2Vycy9ob21lJykuc2hvdWxkLmVxbCBbJ2QnLCAndXNlcnMnLCAnaG9tZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdCAnYzovc29tZS9wYXRoJykuc2hvdWxkLmVxbCBbJ2M6JywgJ3NvbWUnLCAncGF0aCddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdCAnZDpcXFxcc29tZVxcXFxwYXRoXFxcXCcpLnNob3VsZC5lcWwgWydkOicsICdzb21lJywgJ3BhdGgnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3BsaXREcml2ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdERyaXZlICcvc29tZS9wYXRoJykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCAnJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXREcml2ZSAnYzovc29tZS9wYXRoJykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCAnYyddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdERyaXZlICdjOlxcXFxzb21lXFxcXHBhdGgnKS5zaG91bGQuZXFsIFsnL3NvbWUvcGF0aCcsICdjJ11cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdERyaXZlICdjOlxcXFwnKS5zaG91bGQuZXFsIFsnLycsICdjJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnNwbGl0RHJpdmUgJ2M6Jykuc2hvdWxkLmVxbCBbJy8nLCAnYyddXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3JlbW92ZURyaXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICcvc29tZS9wYXRoJykuc2hvdWxkLmVxbCAnL3NvbWUvcGF0aCdcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOi9zb21lL3BhdGgnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOlxcXFxzb21lXFxcXHBhdGgnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOi8nKS5zaG91bGQuZXFsICcvJ1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOlxcXFwnKS5zaG91bGQuZXFsICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucmVtb3ZlRHJpdmUgJ2M6Jykuc2hvdWxkLmVxbCAnLydcbiAgICBcbiAgICAgICAgaXQgJ3NwbGl0RmlsZUxpbmUnLCAtPlxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnNwbGl0RmlsZUxpbmUgJy9zb21lL3BhdGgnKS5zaG91bGQuZXFsIFsnL3NvbWUvcGF0aCcsIDEsIDBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVMaW5lICcvc29tZS9wYXRoOjEyMycpLnNob3VsZC5lcWwgWycvc29tZS9wYXRoJywgMTIzLCAwXVxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnNwbGl0RmlsZUxpbmUgJy9zb21lL3BhdGg6MTIzOjE1Jykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCAxMjMsIDE1XVxuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXRGaWxlTGluZSAnYzovc29tZS9wYXRoOjEyMycpLnNob3VsZC5lcWwgWydjOi9zb21lL3BhdGgnLCAxMjMsIDBdXG4gICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXRGaWxlTGluZSAnYzovc29tZS9wYXRoOjEyMzoxNScpLnNob3VsZC5lcWwgWydjOi9zb21lL3BhdGgnLCAxMjMsIDE1XVxuICAgIFxuICAgICAgICBpdCAnc3BsaXRGaWxlUG9zJywgLT5cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGgnKS5zaG91bGQuZXFsIFsnL3NvbWUvcGF0aCcsIFswLCAwXV1cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGg6MTIzJykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCBbMCwgMTIyXV1cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGg6MTIzOjE1Jykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCBbMTUsIDEyMl1dXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJ2M6L3NvbWUvcGF0aDoxMjMnKS5zaG91bGQuZXFsIFsnYzovc29tZS9wYXRoJywgWzAsIDEyMl1dXG4gICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXRGaWxlUG9zICdjOi9zb21lL3BhdGg6MTIzOjE1Jykuc2hvdWxkLmVxbCBbJ2M6L3NvbWUvcGF0aCcsIFsxNSwgMTIyXV1cblxuICAgICAgICBpdCAnam9pbkZpbGVQb3MnLCAtPlxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzAsMF0pLnNob3VsZC5lcWwgJy9zb21lL3BhdGg6MSdcblxuICAgICAgICAgICAgKHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzAsNF0pLnNob3VsZC5lcWwgJy9zb21lL3BhdGg6NSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzEsNV0pLnNob3VsZC5lcWwgJy9zb21lL3BhdGg6NjoxJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuXG4gICAgICAgICAgICAoc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnLCBbXSkuc2hvdWxkLmVxbCAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnZXhpc3RzJywgLT5cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5leGlzdHMgX19kaXJuYW1lKS5zaG91bGQuZXhpc3RcbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5leGlzdHMgX19maWxlbmFtZSkuc2hvdWxkLmV4aXN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5leGlzdHMgX19maWxlbmFtZSArICdmb28nKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2V4aXN0cyBhc3luYycsIChkb25lKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzbGFzaC5leGlzdHMgX19maWxlbmFtZSwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgKHN0YXQpLnNob3VsZC5leGlzdFxuICAgICAgICAgICAgICAgIGRvbmUoKVxuICAgIFxuICAgICAgICBpdCAnZXhpc3QgYXN5bmMgbm90JywgKGRvbmUpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNsYXNoLmV4aXN0cyBfX2ZpbGVuYW1lICsgJ2ZvbycsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdChzdGF0KS50by5ub3QuZXhpc3RcbiAgICAgICAgICAgICAgICBkb25lKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgJ2ZpbGVFeGlzdHMnLCAtPlxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLmZpbGVFeGlzdHMgX19maWxlbmFtZSkuc2hvdWxkLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qoc2xhc2guZmlsZUV4aXN0cyBfX2Rpcm5hbWUpLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdkaXJFeGlzdHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyRXhpc3RzIF9fZGlybmFtZSkuc2hvdWxkLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qoc2xhc2guZGlyRXhpc3RzIF9fZmlsZW5hbWUpLnRvLm5vdC5leGlzdFxuICAgIFxuICAgICAgICBpdCAncGtnJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBrZyBfX2Rpcm5hbWUpLnNob3VsZC5leGlzdFxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBrZyBfX2ZpbGVuYW1lKS5zaG91bGQuZXhpc3RcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdChzbGFzaC5wa2cgJ0M6XFxcXCcpLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qoc2xhc2gucGtnICdDOicpLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdpc1JlbGF0aXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmlzUmVsYXRpdmUgX19kaXJuYW1lKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1JlbGF0aXZlICcuJykuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1JlbGF0aXZlICcuLicpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guaXNSZWxhdGl2ZSAnLi4vLi9ibGEuLi8uLi9mYXJrJykuc2hvdWxkLmVxbCB0cnVlXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1JlbGF0aXZlICdDOlxcXFxibGFmYXJrJykuc2hvdWxkLmVxbCBmYWxzZVxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLmlzUmVsYXRpdmUgJy4uXFxcXGJsYWZhcmsnKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc2FuaXRpemUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc2FuaXRpemUgJ2EuYlxcbicpLnNob3VsZC5lcWwgJ2EuYidcbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zYW5pdGl6ZSAnXFxuXFxuIGMgLiBkICBcXG5cXG5cXG4nKS5zaG91bGQuZXFsICcgYyAuIGQgICdcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnZmlsZWxpc3QnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImV4aXN0c1wiLCAtPiBfLmlzRnVuY3Rpb24gZmlsZWxpc3RcbiAgICAgICAgXG4gICAgICAgIGl0IFwiY2hkaXJcIiwgLT5cbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIgXCIje19fZGlybmFtZX1cIlxuICAgICAgICAgICAgKHByb2Nlc3MuY3dkKCkpLnNob3VsZC5lcWwgX19kaXJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZXR1cm5zIGFuIGFycmF5XCIsIC0+IF8uaXNBcnJheSBmaWxlbGlzdCAnLidcbiAgICAgICAgXG4gICAgICAgIGl0IFwicmV0dXJucyBlbXB0eSBhcnJheVwiLCAtPiBfLmlzRW1wdHkgZmlsZWxpc3QgJ2Zvb2JhcicsIGxvZ0Vycm9yOiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgaXQgXCJmaW5kcyB0aGlzIGZpbGUgcmVsYXRpdmVcIiwgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCAnLicpLnNob3VsZC5pbmNsdWRlICd0ZXN0LmNvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcImZpbmRzIHRoaXMgZmlsZSBhYnNvbHV0ZVwiLCAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0IF9fZGlybmFtZSkuc2hvdWxkLmluY2x1ZGUgc2xhc2gucGF0aCBfX2ZpbGVuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJsaXN0cyByZWxhdGl2ZSBwYXRoIHdpdGggZG90XCIsIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QoJy4vZGlyJykubGVuZ3RoKS5zaG91bGQuZ3QgMFxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwibGlzdHMgcmVsYXRpdmUgcGF0aCB3aXRob3V0IGRvdFwiLCAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0KCdkaXInKS5sZW5ndGgpLnNob3VsZC5ndCAwXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpZ25vcmVzIGhpZGRlbiBmaWxlcyBieSBkZWZhdWx0XCIsIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QgJ2RpcicpLnNob3VsZC5ub3QuaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpbmNsdWRlcyBoaWRkZW4gZmlsZXNcIiwgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCAnZGlyJywgJ2lnbm9yZUhpZGRlbic6IGZhbHNlKS5zaG91bGQuaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJkb2Vzbid0IHJlY3Vyc2UgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0ICdkaXInKS5zaG91bGQuZXFsIFtzbGFzaC5ub3JtYWxpemUoJ2Rpci9ub2V4dCcpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmNvZmZlZScpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmpzJyksIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QudHh0JyldXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZWN1cnNlcyBpZiBkZXB0aCBzZXRcIiwgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCAnZGlyJywgZGVwdGg6IDIpLnNob3VsZC5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL25vZXh0JyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuanMnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvdGVzdC50eHQnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmpzJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LnR4dCcpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxYi9sZXZlbDFiLmNvZmZlZScpXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCBcIm1hdGNoZXMgZXh0ZW5zaW9uXCIsIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QgJ2RpcicsIGRlcHRoOiAzLCBtYXRjaEV4dDogc2xhc2guZXh0IF9fZmlsZW5hbWUpLnNob3VsZC5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDMvbGV2ZWwzLmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDFiL2xldmVsMWIuY29mZmVlJyldXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ2twb3MnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImFuZ2xlXCIsIC0+XG4gICAgICAgICAgICAoa3BvcygxLDApLmFuZ2xlKGtwb3MgMCwxKSkuc2hvdWxkLmVxbCA5MFxuICAgICAgICAgICAgKGtwb3MoMSwwKS5hbmdsZShrcG9zIDAsLTEpKS5zaG91bGQuZXFsIDkwXG4gICAgICAgICAgICAoa3BvcygwLDEwKS5hbmdsZShrcG9zIDEsMCkpLnNob3VsZC5lcWwgOTBcbiAgICAgICAgICAgIChrcG9zKDAsLTEwKS5hbmdsZShrcG9zIDEsMCkpLnNob3VsZC5lcWwgOTBcbiAgICBcbiAgICAgICAgaXQgXCJyb3RhdGlvblwiLCAtPlxuICAgICAgICAgICAgKE1hdGgucm91bmQga3BvcygwLDEpLnJvdGF0aW9uKGtwb3MgMSwwKSkuc2hvdWxkLmVxbCA5MFxuICAgICAgICAgICAgKE1hdGgucm91bmQga3BvcygwLC0xKS5yb3RhdGlvbihrcG9zIDEsMCkpLnNob3VsZC5lcWwgLTkwXG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsMSkucm90YXRpb24oa3BvcyAxLDApKS5zaG91bGQuZXFsIDQ1XG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsLTEpLnJvdGF0aW9uKGtwb3MgMSwwKSkuc2hvdWxkLmVxbCAtNDVcbiAgICAgICAgICAgIChNYXRoLnJvdW5kIGtwb3MoMSwwKS5yb3RhdGlvbihrcG9zIDAsMSkpLnNob3VsZC5lcWwgLTkwXG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsMCkucm90YXRpb24oa3BvcyAwLC0xKSkuc2hvdWxkLmVxbCA5MFxuICAgIFxuICAgICAgICBpdCBcInJvdGF0ZVwiLCAtPlxuICAgICAgICAgICAgKGtwb3MoMSwwKS5yb3RhdGUoOTApLnJvdW5kZWQoKSkuc2hvdWxkLmVxbCBrcG9zKDAsMSlcbiAgICAgICAgICAgIChrcG9zKDEsMCkucm90YXRlKC05MCkucm91bmRlZCgpKS5zaG91bGQuZXFsIGtwb3MoMCwtMSlcbiAgICAgICAgICAgIChrcG9zKDEsMCkucm90YXRlKDQ1KS5yb3VuZGVkKDAuMDAxKSkuc2hvdWxkLmVxbCBrcG9zKDEsMSkubm9ybWFsKCkucm91bmRlZCgwLjAwMSlcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnY2xhbXAnLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ2NsYW1wcycsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAwLCAxLCAxLjEpLnNob3VsZC5lcWwgMVxuICAgIFxuICAgICAgICAgICAgKGNsYW1wIDEsIDAsIDEuMSkuc2hvdWxkLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAyLjIsIDMsIDEuMSkuc2hvdWxkLmVxbCAyLjJcbiAgICBcbiAgICAgICAgICAgIChjbGFtcCAzLCAyLjIsIDEuMSkuc2hvdWxkLmVxbCAyLjJcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnbnVsbHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoY2xhbXAgMCwgMSkuc2hvdWxkLmVxbCAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAyLCAzLCB1bmRlZmluZWQpLnNob3VsZC5lcWwgMlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoY2xhbXAgNCwgNSwgbnVsbCkuc2hvdWxkLmVxbCA0XG4gICAgXG4gICAgICAgICAgICAoY2xhbXAgNiwgNywge30pLnNob3VsZC5lcWwgNlxuICAgIFxuICAgICAgICAgICAgKGNsYW1wIDgsIDksIFtdKS5zaG91bGQuZXFsIDhcbiAgICBcbiAgICAgICAgICAgIChjbGFtcCAxMCwgMTEsIGNsYW1wKS5zaG91bGQuZXFsIDEwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAtMywgLTIsIDApLnNob3VsZC5lcWwgLTJcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnZW1wdHknLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ3RydWUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgJycgICAgKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5IFtdICAgICkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSB7fSAgICApLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgbnVsbCkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSB1bmRlZmluZWQpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSAxKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSAwKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSBbW11dKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSBhOm51bGwpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5ICcgJykuc2hvdWxkLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgSW5maW5pdHkpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ3ZhbGlkJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCAnJyAgICApLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIFtdICAgICkuc2hvdWxkLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQge30gICAgKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCBudWxsKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCB1bmRlZmluZWQpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndHJ1ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCAxKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIDApLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQgW1tdXSkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCBhOm51bGwpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQgJyAnKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIEluZmluaXR5KS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBkZXNjcmliZSAnZmlsdGVyJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdhcnJheScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChmaWx0ZXIgWzEsMiwzLDRdLCAodixpKSAtPiBpICUgMikuc2hvdWxkLmVxbCBbMiw0XVxuXG4gICAgICAgICAgICAoZmlsdGVyIFsxLDIsMyw0XSwgKHYsaSkgLT4gdiAlIDIpLnNob3VsZC5lcWwgWzEsM11cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnb2JqZWN0JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGZpbHRlciB7YToxLGI6MixjOjMsZDo0fSwgKHYsaykgLT4gdiAlIDIpLnNob3VsZC5lcWwge2E6MSxjOjN9XG5cbiAgICAgICAgICAgIChmaWx0ZXIge2E6MSxiOjIsYzozLGQ6NH0sICh2LGspIC0+IGsgaW4gWydiJywgJ2MnXSkuc2hvdWxkLmVxbCB7YjoyLGM6M31cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndmFsdWUnLCAtPiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZmlsdGVyKDEsIC0+KSkuc2hvdWxkLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChmaWx0ZXIoXCJoZWxsb1wiLCAtPikpLnNob3VsZC5lcWwgXCJoZWxsb1wiXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ2lzVGV4dCcsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAnbm9uIGJpbmFyeScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1RleHQgX19kaXJuYW1lICsgJy9kaXIvbm9leHQnKS5zaG91bGQuZXFsIHRydWVcblxuICAgICAgICBpdCAnYmluYXJ5JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmlzVGV4dCBfX2Rpcm5hbWUgKyAnLi4vaW1nL2t4ay5wbmcnKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdyZWFkVGV4dCcsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAncmVhZHMgdGV4dCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5yZWFkVGV4dCBfX2Rpcm5hbWUgKyAnL2Rpci9ub2V4dCcpLnNob3VsZC5lcWwgJ2hlbGxvXFxuJ1xuXG4gICAgICAgIGl0ICdyZXR1cm5zIGVtcHR5IHRleHQgaWYgZmlsZSBkb2VzbnQgZXhpc3QnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucmVhZFRleHQgX19kaXJuYW1lICsgJy9kaXIvZmlsZWRvZXNudGV4aXN0Jykuc2hvdWxkLmVxbCAnJ1xuXG4gICAgICAgIGl0ICdyZWFkcyB0ZXh0IHN5bmMnLCAoZG9uZSkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2xhc2gucmVhZFRleHQgX19kaXJuYW1lICsgJy9kaXIvbm9leHQnLCAodGV4dCkgLT5cbiAgICAgICAgICAgICAgICAodGV4dCkuc2hvdWxkLmVxbCAnaGVsbG9cXG4nXG4gICAgICAgICAgICAgICAgZG9uZSgpXG5cbiAgICAgICAgaXQgJ3JldHVybnMgZW1wdHkgdGV4dCBpZiBmaWxlIGRvZXNudCBleGlzdCBzeW5jJywgKGRvbmUpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNsYXNoLnJlYWRUZXh0IF9fZGlybmFtZSArICcvZGlyL2ZpbGVkb2VzbnRleGlzdCcsICh0ZXh0KSAtPlxuICAgICAgICAgICAgICAgICh0ZXh0KS5zaG91bGQuZXFsICcnXG4gICAgICAgICAgICAgICAgZG9uZSgpXG4gICAgICAgIFxuICAgICAgICAgICAgIl19
//# sourceURL=../../test/test.coffee