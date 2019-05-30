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
            return a2h((r5('red')) + "\n" + (g5('green')), "<span style=\"color:#ff0000;\">red</span>\n<span style=\"color:#00ff00;\">green</span>");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBOEYsT0FBQSxDQUFRLEtBQVIsQ0FBOUYsRUFBRSx1QkFBRixFQUFZLGlDQUFaLEVBQTJCLGlCQUEzQixFQUFrQyxlQUFsQyxFQUF3QyxlQUF4QyxFQUE4QyxpQkFBOUMsRUFBcUQsaUJBQXJELEVBQTRELGlCQUE1RCxFQUFtRSxlQUFuRSxFQUF5RSxpQkFBekUsRUFBZ0YsbUJBQWhGLEVBQXdGOztBQUV4RixLQUFLLENBQUMsU0FBTixDQUFBOztBQUNBLE1BQUEsR0FBUyxJQUFBLENBQUEsQ0FBTSxDQUFDOztBQUVoQixRQUFBLENBQVMsS0FBVCxFQUFnQixTQUFBO0lBRVosUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQTtRQUViLEVBQUEsQ0FBRyxhQUFILEVBQWtCLFNBQUE7WUFDZCxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixDQUF3QixDQUFDLE1BQU0sQ0FBQyxHQUFoQyxDQUFvQyxVQUFwQzttQkFDQSxJQUFJLENBQUMsV0FBTCxDQUFpQixRQUFqQixDQUEwQixDQUFDLE1BQU0sQ0FBQyxHQUFsQyxDQUFzQyxRQUF0QztRQUZjLENBQWxCO1FBSUEsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQTttQkFDZixJQUFJLENBQUMsWUFBTCxDQUFrQixTQUFsQixDQUE0QixDQUFDLE1BQU0sQ0FBQyxHQUFwQyxDQUF3QyxhQUF4QztRQURlLENBQW5CO1FBR0EsRUFBQSxDQUFHLE1BQUgsRUFBVSxTQUFBO1lBQ04sSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFWLEVBQWMsQ0FBZCxDQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUF4QixDQUE0QixNQUE1QjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLENBQWYsQ0FBaUIsQ0FBQyxNQUFNLENBQUMsR0FBekIsQ0FBNkIsTUFBN0I7bUJBQ0EsSUFBSSxDQUFD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O0lBaEJpQixDQUFyQjtBQTloQlksQ0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiMgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwXG4jICAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDBcbiMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMFxuXG57IGZpbGVsaXN0LCBzcGxpdEZpbGVMaW5lLCBzbGFzaCwga3Bvcywga3N0ciwgZW1wdHksIHZhbGlkLCBjbGFtcCwgY2hhaSwga29sb3IsIGZpbHRlciwgXyB9ID0gcmVxdWlyZSAnLi4vJ1xuXG5rb2xvci5nbG9iYWxpemUoKVxuZXhwZWN0ID0gY2hhaSgpLmV4cGVjdFxuXG5kZXNjcmliZSAna3hrJywgLT5cbiAgICBcbiAgICBkZXNjcmliZSAna3N0cicsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAncmVwbGFjZVRhYnMnLCAtPlxuICAgICAgICAgICAga3N0ci5yZXBsYWNlVGFicygnXFx0XFx0Jykuc2hvdWxkLmVxbCAnICAgICAgICAnXG4gICAgICAgICAgICBrc3RyLnJlcGxhY2VUYWJzKCdhYVxcdGJiJykuc2hvdWxkLmVxbCAnYWEgIGJiJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdlc2NhcGVSZWdleHAnLCAtPlxuICAgICAgICAgICAga3N0ci5lc2NhcGVSZWdleHAoJ2EvYi50eHQnKS5zaG91bGQuZXFsICdhXFxcXC9iXFxcXC50eHQnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2xwYWQnIC0+XG4gICAgICAgICAgICBrc3RyLmxwYWQoJycsIDQpLnNob3VsZC5lcWwgJyAgICAnXG4gICAgICAgICAgICBrc3RyLmxwYWQoJ3gnLCA0KS5zaG91bGQuZXFsICcgICB4J1xuICAgICAgICAgICAga3N0ci5scGFkKCcgeHh4ICcsIDIpLnNob3VsZC5lcWwgJyB4eHggJ1xuXG4gICAgICAgIGl0ICdycGFkJyAtPlxuICAgICAgICAgICAga3N0ci5ycGFkKCcnLCA0KS5zaG91bGQuZXFsICcgICAgJ1xuICAgICAgICAgICAga3N0ci5ycGFkKCd4JywgNCkuc2hvdWxkLmVxbCAneCAgICdcbiAgICAgICAgICAgIGtzdHIucnBhZCgnIHh4eCAnLCAyKS5zaG91bGQuZXFsICcgeHh4ICdcbiAgICAgXG4gICAgICAgIGl0ICdhbnNpMmh0bWwnIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEyaCA9IChzLHIpIC0+IGtzdHIuYW5zaTJodG1sKHMpLnNob3VsZC5lcWwgclxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhMmggJ2hlbGxvJywgJ2hlbGxvJ1xuICAgICAgICAgICAgYTJoIHI1KCdyZWQnKSwgJzxzcGFuIHN0eWxlPVwiY29sb3I6I2ZmMDAwMDtcIj5yZWQ8L3NwYW4+J1xuICAgICAgICAgICAgYTJoIFwiXCJcIlxuICAgICAgICAgICAgICAgICN7cjUoJ3JlZCcpfVxuICAgICAgICAgICAgICAgICN7ZzUoJ2dyZWVuJyl9XG4gICAgICAgICAgICAgICAgXCJcIlwiLCBcIlwiXCJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOiNmZjAwMDA7XCI+cmVkPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiY29sb3I6IzAwZmYwMDtcIj5ncmVlbjwvc3Bhbj5cbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3RyaXBBbnNpJyAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoa3N0ci5zdHJpcEFuc2kgZzUoJ2dyZWVuJykpLnNob3VsZC5lcWwgJ2dyZWVuJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdzbGFzaCcsIC0+XG5cbiAgICAgICAgaXQgJ2RpcicsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy9zb21lL3BhdGgvZmlsZS50eHQnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyICcvc29tZS9kaXIvJykuc2hvdWxkLmVxbCAnL3NvbWUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgKHNsYXNoLmRpciAnQzpcXFxcQmFja1xcXFwnKS5zaG91bGQuZXFsICdDOi8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy4uLy4uJykuc2hvdWxkLmVxbCAnLi4nXG5cbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy8nKS5zaG91bGQuZXFsICcnXG5cbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy4nKS5zaG91bGQuZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5kaXIgJy4uJykuc2hvdWxkLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyICd+Jykuc2hvdWxkLmVxbCAnJ1xuXG4gICAgICAgICAgICAoc2xhc2guZGlyICcuLycpLnNob3VsZC5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmRpciAnLi4vJykuc2hvdWxkLmVxbCAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyICd+LycpLnNob3VsZC5lcWwgJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICAoc2xhc2guZGlyICdDOi8nKS5zaG91bGQuZXFsICcnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3BhdGhsaXN0JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBhdGhsaXN0ICcvc29tZS9wYXRoLnR4dCcpLnNob3VsZC5lcWwgWycvJywgJy9zb21lJywgJy9zb21lL3BhdGgudHh0J11cblxuICAgICAgICAgICAgKHNsYXNoLnBhdGhsaXN0ICcvJykuc2hvdWxkLmVxbCBbJy8nXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucGF0aGxpc3QgJycpLnNob3VsZC5lcWwgW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICAoc2xhc2gucGF0aGxpc3QgJ0M6XFxcXEJhY2tcXFxcU2xhc2hcXFxcJykuc2hvdWxkLmVxbCBbJ0M6LycsICdDOi9CYWNrJywgJ0M6L0JhY2svU2xhc2gvJ11cblxuICAgICAgICAgICAgKHNsYXNoLnBhdGhsaXN0ICd+Jykuc2hvdWxkLmVxbCBbJ34nXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdiYXNlJywgLT4gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5iYXNlICcvc29tZS9wYXRoLnR4dCcpLnNob3VsZC5lcWwgJ3BhdGgnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICdwYXRoJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucGF0aCBcIkM6XFxcXEJhY2tcXFxcU2xhc2hcXFxcQ3JhcFwiKS5zaG91bGQuZXFsIFwiQzovQmFjay9TbGFzaC9DcmFwXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBhdGggXCJDOlxcXFxCYWNrXFxcXFNsYXNoXFxcXENyYXBcXFxcLi5cXFxcLi5cXFxcVG9cXFxcVGhlXFxcXC4uXFxcXEZ1dHVyZVwiKS5zaG91bGQuZXFsIFwiQzovQmFjay9Uby9GdXR1cmVcIlxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdqb2luJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW4gJ2EnLCAnYicsICdjJykuc2hvdWxkLmVxbCAnYS9iL2MnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW4gJ0M6XFxcXEZPTycsICcuXFxcXEJBUicsICd0aGF0XFxcXHN1Y2tzJykuc2hvdWxkLmVxbCAnQzovRk9PL0JBUi90aGF0L3N1Y2tzJ1xuICAgIFxuICAgICAgICBpdCAnaG9tZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgaG9tZSA9IHNsYXNoLnBhdGggcHJvY2Vzcy5lbnZbJ0hPTUVEUklWRSddICsgcHJvY2Vzcy5lbnZbJ0hPTUVQQVRIJ11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBob21lID0gcHJvY2Vzcy5lbnZbJ0hPTUUnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmhvbWUoKSkuc2hvdWxkLmVxbCBob21lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC50aWxkZSBob21lKS5zaG91bGQuZXFsICd+J1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnRpbGRlIGhvbWUgKyAnL3N1YicpLnNob3VsZC5lcWwgJ34vc3ViJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gudW50aWxkZSAnfi9zdWInKS5zaG91bGQuZXFsIGhvbWUgKyAnL3N1YidcbiAgICBcbiAgICAgICAgaXQgJ3VuZW52JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnVuZW52ICdDOi8kUmVjeWNsZS5iaW4nKS5zaG91bGQuZXFsICdDOi8kUmVjeWNsZS5iaW4nXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgXG4gICAgICAgICAgICAoc2xhc2gudW5lbnYgJyRIT01FL3Rlc3QnKS5zaG91bGQuZXFsIHNsYXNoLnBhdGgocHJvY2Vzcy5lbnZbJ0hPTUUnXSkgKyAnL3Rlc3QnXG4gICAgXG4gICAgICAgIGl0ICd1bnNsYXNoJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnVuc2xhc2ggJy9jL3Rlc3QnKS5zaG91bGQuZXFsICdDOlxcXFx0ZXN0J1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdyZXNvbHZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlc29sdmUgJ34nKS5zaG91bGQuZXFsIHNsYXNoLmhvbWUoKVxuICAgIFxuICAgICAgICBpdCAncmVsYXRpdmUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucmVsYXRpdmUgJ0M6XFxcXHRlc3RcXFxcc29tZVxcXFxwYXRoLnR4dCcsICdDOlxcXFx0ZXN0XFxcXHNvbWVcXFxcb3RoZXJcXFxccGF0aCcpLnNob3VsZC5lcWwgJy4uLy4uL3BhdGgudHh0J1xuICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5yZWxhdGl2ZSAnQzpcXFxcc29tZVxcXFxwYXRoJywgJ0M6L3NvbWUvcGF0aCcpLnNob3VsZC5lcWwgJy4nXG4gICAgXG4gICAgICAgICAgICAoc2xhc2gucmVsYXRpdmUgJ0M6L1VzZXJzL2tvZGkvcy9rb25yYWQvYXBwL2pzL2NvZmZlZS5qcycsICdDOi9Vc2Vycy9rb2RpL3Mva29ucmFkJykuc2hvdWxkLmVxbCAnYXBwL2pzL2NvZmZlZS5qcydcblxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAoc2xhc2gucmVsYXRpdmUgJ0M6L3NvbWUvcGF0aC9vbi5jJywgJ0Q6L3BhdGgvb24uZCcpLnNob3VsZC5lcWwgJ0M6L3NvbWUvcGF0aC9vbi5jJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIChzbGFzaC5yZWxhdGl2ZSAnQzpcXFxcc29tZVxcXFxwYXRoXFxcXG9uLmMnLCAnRDpcXFxccGF0aFxcXFxvbi5kJykuc2hvdWxkLmVxbCAnQzovc29tZS9wYXRoL29uLmMnXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3BhcnNlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgKHNsYXNoLnBhcnNlKCdjOicpLnJvb3QpLnNob3VsZC5lcWwgJ2M6LydcbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5wYXJzZSgnYzonKS5kaXIpLnNob3VsZC5lcWwgJ2M6LydcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3BsaXQnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXQgJy9jL3VzZXJzL2hvbWUvJykuc2hvdWxkLmVxbCBbJ2MnLCAndXNlcnMnLCAnaG9tZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdCAnZC91c2Vycy9ob21lJykuc2hvdWxkLmVxbCBbJ2QnLCAndXNlcnMnLCAnaG9tZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdCAnYzovc29tZS9wYXRoJykuc2hvdWxkLmVxbCBbJ2M6JywgJ3NvbWUnLCAncGF0aCddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdCAnZDpcXFxcc29tZVxcXFxwYXRoXFxcXCcpLnNob3VsZC5lcWwgWydkOicsICdzb21lJywgJ3BhdGgnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCAnc3BsaXREcml2ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdERyaXZlICcvc29tZS9wYXRoJykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCAnJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXREcml2ZSAnYzovc29tZS9wYXRoJykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCAnYyddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdERyaXZlICdjOlxcXFxzb21lXFxcXHBhdGgnKS5zaG91bGQuZXFsIFsnL3NvbWUvcGF0aCcsICdjJ11cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdERyaXZlICdjOlxcXFwnKS5zaG91bGQuZXFsIFsnLycsICdjJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnNwbGl0RHJpdmUgJ2M6Jykuc2hvdWxkLmVxbCBbJy8nLCAnYyddXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ3JlbW92ZURyaXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICcvc29tZS9wYXRoJykuc2hvdWxkLmVxbCAnL3NvbWUvcGF0aCdcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOi9zb21lL3BhdGgnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOlxcXFxzb21lXFxcXHBhdGgnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOi8nKS5zaG91bGQuZXFsICcvJ1xuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnJlbW92ZURyaXZlICdjOlxcXFwnKS5zaG91bGQuZXFsICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucmVtb3ZlRHJpdmUgJ2M6Jykuc2hvdWxkLmVxbCAnLydcbiAgICBcbiAgICAgICAgaXQgJ3NwbGl0RmlsZUxpbmUnLCAtPlxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnNwbGl0RmlsZUxpbmUgJy9zb21lL3BhdGgnKS5zaG91bGQuZXFsIFsnL3NvbWUvcGF0aCcsIDEsIDBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVMaW5lICcvc29tZS9wYXRoOjEyMycpLnNob3VsZC5lcWwgWycvc29tZS9wYXRoJywgMTIzLCAwXVxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnNwbGl0RmlsZUxpbmUgJy9zb21lL3BhdGg6MTIzOjE1Jykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCAxMjMsIDE1XVxuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBzbGFzaC53aW4oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXRGaWxlTGluZSAnYzovc29tZS9wYXRoOjEyMycpLnNob3VsZC5lcWwgWydjOi9zb21lL3BhdGgnLCAxMjMsIDBdXG4gICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXRGaWxlTGluZSAnYzovc29tZS9wYXRoOjEyMzoxNScpLnNob3VsZC5lcWwgWydjOi9zb21lL3BhdGgnLCAxMjMsIDE1XVxuICAgIFxuICAgICAgICBpdCAnc3BsaXRGaWxlUG9zJywgLT5cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGgnKS5zaG91bGQuZXFsIFsnL3NvbWUvcGF0aCcsIFswLCAwXV1cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGg6MTIzJykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCBbMCwgMTIyXV1cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJy9zb21lL3BhdGg6MTIzOjE1Jykuc2hvdWxkLmVxbCBbJy9zb21lL3BhdGgnLCBbMTUsIDEyMl1dXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5zcGxpdEZpbGVQb3MgJ2M6L3NvbWUvcGF0aDoxMjMnKS5zaG91bGQuZXFsIFsnYzovc29tZS9wYXRoJywgWzAsIDEyMl1dXG4gICAgXG4gICAgICAgICAgICAoc2xhc2guc3BsaXRGaWxlUG9zICdjOi9zb21lL3BhdGg6MTIzOjE1Jykuc2hvdWxkLmVxbCBbJ2M6L3NvbWUvcGF0aCcsIFsxNSwgMTIyXV1cblxuICAgICAgICBpdCAnam9pbkZpbGVQb3MnLCAtPlxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzAsMF0pLnNob3VsZC5lcWwgJy9zb21lL3BhdGg6MSdcblxuICAgICAgICAgICAgKHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzAsNF0pLnNob3VsZC5lcWwgJy9zb21lL3BhdGg6NSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmpvaW5GaWxlUG9zICcvc29tZS9wYXRoJywgWzEsNV0pLnNob3VsZC5lcWwgJy9zb21lL3BhdGg6NjoxJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnKS5zaG91bGQuZXFsICcvc29tZS9wYXRoJ1xuXG4gICAgICAgICAgICAoc2xhc2guam9pbkZpbGVQb3MgJy9zb21lL3BhdGgnLCBbXSkuc2hvdWxkLmVxbCAnL3NvbWUvcGF0aCdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnZXhpc3RzJywgLT5cbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5leGlzdHMgX19kaXJuYW1lKS5zaG91bGQuZXhpc3RcbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5leGlzdHMgX19maWxlbmFtZSkuc2hvdWxkLmV4aXN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5leGlzdHMgX19maWxlbmFtZSArICdmb28nKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgJ2V4aXN0cyBhc3luYycsIChkb25lKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzbGFzaC5leGlzdHMgX19maWxlbmFtZSwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgKHN0YXQpLnNob3VsZC5leGlzdFxuICAgICAgICAgICAgICAgIGRvbmUoKVxuICAgIFxuICAgICAgICBpdCAnZXhpc3QgYXN5bmMgbm90JywgKGRvbmUpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNsYXNoLmV4aXN0cyBfX2ZpbGVuYW1lICsgJ2ZvbycsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdChzdGF0KS50by5ub3QuZXhpc3RcbiAgICAgICAgICAgICAgICBkb25lKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgJ2ZpbGVFeGlzdHMnLCAtPlxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLmZpbGVFeGlzdHMgX19maWxlbmFtZSkuc2hvdWxkLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qoc2xhc2guZmlsZUV4aXN0cyBfX2Rpcm5hbWUpLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdkaXJFeGlzdHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guZGlyRXhpc3RzIF9fZGlybmFtZSkuc2hvdWxkLmV4aXN0XG4gICAgXG4gICAgICAgICAgICBleHBlY3Qoc2xhc2guZGlyRXhpc3RzIF9fZmlsZW5hbWUpLnRvLm5vdC5leGlzdFxuICAgIFxuICAgICAgICBpdCAncGtnJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBrZyBfX2Rpcm5hbWUpLnNob3VsZC5leGlzdFxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLnBrZyBfX2ZpbGVuYW1lKS5zaG91bGQuZXhpc3RcbiAgICBcbiAgICAgICAgICAgIGV4cGVjdChzbGFzaC5wa2cgJ0M6XFxcXCcpLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qoc2xhc2gucGtnICdDOicpLnRvLm5vdC5leGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdpc1JlbGF0aXZlJywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmlzUmVsYXRpdmUgX19kaXJuYW1lKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1JlbGF0aXZlICcuJykuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1JlbGF0aXZlICcuLicpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guaXNSZWxhdGl2ZSAnLi4vLi9ibGEuLi8uLi9mYXJrJykuc2hvdWxkLmVxbCB0cnVlXG4gICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IHNsYXNoLndpbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1JlbGF0aXZlICdDOlxcXFxibGFmYXJrJykuc2hvdWxkLmVxbCBmYWxzZVxuICAgIFxuICAgICAgICAgICAgKHNsYXNoLmlzUmVsYXRpdmUgJy4uXFxcXGJsYWZhcmsnKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnc2FuaXRpemUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2guc2FuaXRpemUgJ2EuYlxcbicpLnNob3VsZC5lcWwgJ2EuYidcbiAgICBcbiAgICAgICAgICAgIChzbGFzaC5zYW5pdGl6ZSAnXFxuXFxuIGMgLiBkICBcXG5cXG5cXG4nKS5zaG91bGQuZXFsICcgYyAuIGQgICdcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnZmlsZWxpc3QnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImV4aXN0c1wiLCAtPiBfLmlzRnVuY3Rpb24gZmlsZWxpc3RcbiAgICAgICAgXG4gICAgICAgIGl0IFwiY2hkaXJcIiwgLT5cbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIgXCIje19fZGlybmFtZX1cIlxuICAgICAgICAgICAgKHByb2Nlc3MuY3dkKCkpLnNob3VsZC5lcWwgX19kaXJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZXR1cm5zIGFuIGFycmF5XCIsIC0+IF8uaXNBcnJheSBmaWxlbGlzdCAnLidcbiAgICAgICAgXG4gICAgICAgIGl0IFwicmV0dXJucyBlbXB0eSBhcnJheVwiLCAtPiBfLmlzRW1wdHkgZmlsZWxpc3QgJ2Zvb2JhcicsIGxvZ0Vycm9yOiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgaXQgXCJmaW5kcyB0aGlzIGZpbGUgcmVsYXRpdmVcIiwgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCAnLicpLnNob3VsZC5pbmNsdWRlICd0ZXN0LmNvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcImZpbmRzIHRoaXMgZmlsZSBhYnNvbHV0ZVwiLCAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0IF9fZGlybmFtZSkuc2hvdWxkLmluY2x1ZGUgc2xhc2gucGF0aCBfX2ZpbGVuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJsaXN0cyByZWxhdGl2ZSBwYXRoIHdpdGggZG90XCIsIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QoJy4vZGlyJykubGVuZ3RoKS5zaG91bGQuZ3QgMFxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwibGlzdHMgcmVsYXRpdmUgcGF0aCB3aXRob3V0IGRvdFwiLCAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0KCdkaXInKS5sZW5ndGgpLnNob3VsZC5ndCAwXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpZ25vcmVzIGhpZGRlbiBmaWxlcyBieSBkZWZhdWx0XCIsIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QgJ2RpcicpLnNob3VsZC5ub3QuaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJpbmNsdWRlcyBoaWRkZW4gZmlsZXNcIiwgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCAnZGlyJywgJ2lnbm9yZUhpZGRlbic6IGZhbHNlKS5zaG91bGQuaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJkb2Vzbid0IHJlY3Vyc2UgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0ICdkaXInKS5zaG91bGQuZXFsIFtzbGFzaC5ub3JtYWxpemUoJ2Rpci9ub2V4dCcpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmNvZmZlZScpLCBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmpzJyksIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QudHh0JyldXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJyZWN1cnNlcyBpZiBkZXB0aCBzZXRcIiwgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCAnZGlyJywgZGVwdGg6IDIpLnNob3VsZC5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL25vZXh0JyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuanMnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvdGVzdC50eHQnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmpzJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LnR4dCcpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxYi9sZXZlbDFiLmNvZmZlZScpXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpdCBcIm1hdGNoZXMgZXh0ZW5zaW9uXCIsIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QgJ2RpcicsIGRlcHRoOiAzLCBtYXRjaEV4dDogc2xhc2guZXh0IF9fZmlsZW5hbWUpLnNob3VsZC5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDMvbGV2ZWwzLmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDFiL2xldmVsMWIuY29mZmVlJyldXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ2twb3MnLCAtPlxuICAgIFxuICAgICAgICBpdCBcImFuZ2xlXCIsIC0+XG4gICAgICAgICAgICAoa3BvcygxLDApLmFuZ2xlKGtwb3MgMCwxKSkuc2hvdWxkLmVxbCA5MFxuICAgICAgICAgICAgKGtwb3MoMSwwKS5hbmdsZShrcG9zIDAsLTEpKS5zaG91bGQuZXFsIDkwXG4gICAgICAgICAgICAoa3BvcygwLDEwKS5hbmdsZShrcG9zIDEsMCkpLnNob3VsZC5lcWwgOTBcbiAgICAgICAgICAgIChrcG9zKDAsLTEwKS5hbmdsZShrcG9zIDEsMCkpLnNob3VsZC5lcWwgOTBcbiAgICBcbiAgICAgICAgaXQgXCJyb3RhdGlvblwiLCAtPlxuICAgICAgICAgICAgKE1hdGgucm91bmQga3BvcygwLDEpLnJvdGF0aW9uKGtwb3MgMSwwKSkuc2hvdWxkLmVxbCA5MFxuICAgICAgICAgICAgKE1hdGgucm91bmQga3BvcygwLC0xKS5yb3RhdGlvbihrcG9zIDEsMCkpLnNob3VsZC5lcWwgLTkwXG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsMSkucm90YXRpb24oa3BvcyAxLDApKS5zaG91bGQuZXFsIDQ1XG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsLTEpLnJvdGF0aW9uKGtwb3MgMSwwKSkuc2hvdWxkLmVxbCAtNDVcbiAgICAgICAgICAgIChNYXRoLnJvdW5kIGtwb3MoMSwwKS5yb3RhdGlvbihrcG9zIDAsMSkpLnNob3VsZC5lcWwgLTkwXG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsMCkucm90YXRpb24oa3BvcyAwLC0xKSkuc2hvdWxkLmVxbCA5MFxuICAgIFxuICAgICAgICBpdCBcInJvdGF0ZVwiLCAtPlxuICAgICAgICAgICAgKGtwb3MoMSwwKS5yb3RhdGUoOTApLnJvdW5kZWQoKSkuc2hvdWxkLmVxbCBrcG9zKDAsMSlcbiAgICAgICAgICAgIChrcG9zKDEsMCkucm90YXRlKC05MCkucm91bmRlZCgpKS5zaG91bGQuZXFsIGtwb3MoMCwtMSlcbiAgICAgICAgICAgIChrcG9zKDEsMCkucm90YXRlKDQ1KS5yb3VuZGVkKDAuMDAxKSkuc2hvdWxkLmVxbCBrcG9zKDEsMSkubm9ybWFsKCkucm91bmRlZCgwLjAwMSlcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnY2xhbXAnLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ2NsYW1wcycsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAwLCAxLCAxLjEpLnNob3VsZC5lcWwgMVxuICAgIFxuICAgICAgICAgICAgKGNsYW1wIDEsIDAsIDEuMSkuc2hvdWxkLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAyLjIsIDMsIDEuMSkuc2hvdWxkLmVxbCAyLjJcbiAgICBcbiAgICAgICAgICAgIChjbGFtcCAzLCAyLjIsIDEuMSkuc2hvdWxkLmVxbCAyLjJcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnbnVsbHMnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoY2xhbXAgMCwgMSkuc2hvdWxkLmVxbCAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAyLCAzLCB1bmRlZmluZWQpLnNob3VsZC5lcWwgMlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoY2xhbXAgNCwgNSwgbnVsbCkuc2hvdWxkLmVxbCA0XG4gICAgXG4gICAgICAgICAgICAoY2xhbXAgNiwgNywge30pLnNob3VsZC5lcWwgNlxuICAgIFxuICAgICAgICAgICAgKGNsYW1wIDgsIDksIFtdKS5zaG91bGQuZXFsIDhcbiAgICBcbiAgICAgICAgICAgIChjbGFtcCAxMCwgMTEsIGNsYW1wKS5zaG91bGQuZXFsIDEwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAtMywgLTIsIDApLnNob3VsZC5lcWwgLTJcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICBcbiAgICBcbiAgICBkZXNjcmliZSAnZW1wdHknLCAtPlxuICAgICAgICBcbiAgICAgICAgaXQgJ3RydWUnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgJycgICAgKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5IFtdICAgICkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSB7fSAgICApLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgbnVsbCkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSB1bmRlZmluZWQpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSAxKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSAwKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSBbW11dKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSBhOm51bGwpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5ICcgJykuc2hvdWxkLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgSW5maW5pdHkpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ3ZhbGlkJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCAnJyAgICApLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIFtdICAgICkuc2hvdWxkLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQge30gICAgKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCBudWxsKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCB1bmRlZmluZWQpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndHJ1ZScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCAxKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIDApLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQgW1tdXSkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCBhOm51bGwpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQgJyAnKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIEluZmluaXR5KS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBkZXNjcmliZSAnZmlsdGVyJywgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdhcnJheScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChmaWx0ZXIgWzEsMiwzLDRdLCAodixpKSAtPiBpICUgMikuc2hvdWxkLmVxbCBbMiw0XVxuXG4gICAgICAgICAgICAoZmlsdGVyIFsxLDIsMyw0XSwgKHYsaSkgLT4gdiAlIDIpLnNob3VsZC5lcWwgWzEsM11cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnb2JqZWN0JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGZpbHRlciB7YToxLGI6MixjOjMsZDo0fSwgKHYsaykgLT4gdiAlIDIpLnNob3VsZC5lcWwge2E6MSxjOjN9XG5cbiAgICAgICAgICAgIChmaWx0ZXIge2E6MSxiOjIsYzozLGQ6NH0sICh2LGspIC0+IGsgaW4gWydiJywgJ2MnXSkuc2hvdWxkLmVxbCB7YjoyLGM6M31cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndmFsdWUnLCAtPiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZmlsdGVyKDEsIC0+KSkuc2hvdWxkLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChmaWx0ZXIoXCJoZWxsb1wiLCAtPikpLnNob3VsZC5lcWwgXCJoZWxsb1wiXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ2lzVGV4dCcsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAnbm9uIGJpbmFyeScsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5pc1RleHQgX19kaXJuYW1lICsgJy9kaXIvbm9leHQnKS5zaG91bGQuZXFsIHRydWVcblxuICAgICAgICBpdCAnYmluYXJ5JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHNsYXNoLmlzVGV4dCBfX2Rpcm5hbWUgKyAnLi4vaW1nL2t4ay5wbmcnKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdyZWFkVGV4dCcsIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAncmVhZHMgdGV4dCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChzbGFzaC5yZWFkVGV4dCBfX2Rpcm5hbWUgKyAnL2Rpci9ub2V4dCcpLnNob3VsZC5lcWwgJ2hlbGxvXFxuJ1xuXG4gICAgICAgIGl0ICdyZXR1cm5zIGVtcHR5IHRleHQgaWYgZmlsZSBkb2VzbnQgZXhpc3QnLCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoc2xhc2gucmVhZFRleHQgX19kaXJuYW1lICsgJy9kaXIvZmlsZWRvZXNudGV4aXN0Jykuc2hvdWxkLmVxbCAnJ1xuXG4gICAgICAgIGl0ICdyZWFkcyB0ZXh0IHN5bmMnLCAoZG9uZSkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2xhc2gucmVhZFRleHQgX19kaXJuYW1lICsgJy9kaXIvbm9leHQnLCAodGV4dCkgLT5cbiAgICAgICAgICAgICAgICAodGV4dCkuc2hvdWxkLmVxbCAnaGVsbG9cXG4nXG4gICAgICAgICAgICAgICAgZG9uZSgpXG5cbiAgICAgICAgaXQgJ3JldHVybnMgZW1wdHkgdGV4dCBpZiBmaWxlIGRvZXNudCBleGlzdCBzeW5jJywgKGRvbmUpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNsYXNoLnJlYWRUZXh0IF9fZGlybmFtZSArICcvZGlyL2ZpbGVkb2VzbnRleGlzdCcsICh0ZXh0KSAtPlxuICAgICAgICAgICAgICAgICh0ZXh0KS5zaG91bGQuZXFsICcnXG4gICAgICAgICAgICAgICAgZG9uZSgpXG4gICAgICAgIFxuICAgICAgICAgICAgIl19
//# sourceURL=../../test/test.coffee