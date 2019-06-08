// koffee 0.56.0
var _, chai, clamp, empty, expect, filelist, filter, kolor, kpos, kstr, ref, slash, splitFileLine, valid;

ref = require('../'), filelist = ref.filelist, splitFileLine = ref.splitFileLine, slash = ref.slash, kpos = ref.kpos, kstr = ref.kstr, empty = ref.empty, valid = ref.valid, clamp = ref.clamp, chai = ref.chai, kolor = ref.kolor, filter = ref.filter, _ = ref._;

kolor.globalize();

expect = chai().expect;

describe('kxk', function() {
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
    return describe('filter', function() {
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
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBOEYsT0FBQSxDQUFRLEtBQVIsQ0FBOUYsRUFBRSx1QkFBRixFQUFZLGlDQUFaLEVBQTJCLGlCQUEzQixFQUFrQyxlQUFsQyxFQUF3QyxlQUF4QyxFQUE4QyxpQkFBOUMsRUFBcUQsaUJBQXJELEVBQTRELGlCQUE1RCxFQUFtRSxlQUFuRSxFQUF5RSxpQkFBekUsRUFBZ0YsbUJBQWhGLEVBQXdGOztBQUV4RixLQUFLLENBQUMsU0FBTixDQUFBOztBQUNBLE1BQUEsR0FBUyxJQUFBLENBQUEsQ0FBTSxDQUFDOztBQUVoQixRQUFBLENBQVMsS0FBVCxFQUFlLFNBQUE7SUFRWCxRQUFBLENBQVMsVUFBVCxFQUFvQixTQUFBO1FBRWhCLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTttQkFBRyxDQUFDLENBQUMsVUFBRixDQUFhLFFBQWI7UUFBSCxDQUFaO1FBRUEsRUFBQSxDQUFHLE9BQUgsRUFBVyxTQUFBO1lBQ1AsT0FBTyxDQUFDLEtBQVIsQ0FBYyxFQUFBLEdBQUcsU0FBakI7bUJBQ0EsQ0FBQyxPQUFPLENBQUMsR0FBUixDQUFBLENBQUQsQ0FBZSxDQUFDLE1BQU0sQ0FBQyxHQUF2QixDQUEyQixTQUEzQjtRQUZPLENBQVg7UUFJQSxFQUFBLENBQUcsa0JBQUgsRUFBc0IsU0FBQTttQkFBRyxDQUFDLENBQUMsT0FBRixDQUFVLFFBQUEsQ0FBUyxHQUFULENBQVY7UUFBSCxDQUF0QjtRQUVBLEVBQUEsQ0FBRyxxQkFBSCxFQUF5QixTQUFBO21CQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBQSxDQUFTLFFBQVQsRUFBbUI7Z0JBQUEsUUFBQSxFQUFVLEtBQVY7YUFBbkIsQ0FBVjtRQUFILENBQXpCO1FBRUEsRUFBQSxDQUFHLDBCQUFILEVBQThCLFNBQUE7bUJBQzFCLENBQUMsUUFBQSxDQUFTLEdBQVQsQ0FBRCxD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QUMsTUFBQSxDQUFPLENBQVAsRUFBVSxTQUFBLEdBQUEsQ0FBVixDQUFELENBQWUsQ0FBQyxNQUFNLENBQUMsR0FBdkIsQ0FBMkIsQ0FBM0I7bUJBRUEsQ0FBQyxNQUFBLENBQU8sT0FBUCxFQUFlLFNBQUEsR0FBQSxDQUFmLENBQUQsQ0FBb0IsQ0FBQyxNQUFNLENBQUMsR0FBNUIsQ0FBZ0MsT0FBaEM7UUFKTyxDQUFYO0lBZGMsQ0FBbEI7QUFwTVcsQ0FBZiIsInNvdXJjZXNDb250ZW50IjpbIiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDBcbiMgICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMFxuIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwXG5cbnsgZmlsZWxpc3QsIHNwbGl0RmlsZUxpbmUsIHNsYXNoLCBrcG9zLCBrc3RyLCBlbXB0eSwgdmFsaWQsIGNsYW1wLCBjaGFpLCBrb2xvciwgZmlsdGVyLCBfIH0gPSByZXF1aXJlICcuLi8nXG5cbmtvbG9yLmdsb2JhbGl6ZSgpXG5leHBlY3QgPSBjaGFpKCkuZXhwZWN0XG5cbmRlc2NyaWJlICdreGsnIC0+XG4gICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdmaWxlbGlzdCcgLT5cbiAgICBcbiAgICAgICAgaXQgXCJleGlzdHNcIiAtPiBfLmlzRnVuY3Rpb24gZmlsZWxpc3RcbiAgICAgICAgXG4gICAgICAgIGl0IFwiY2hkaXJcIiAtPlxuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpciBcIiN7X19kaXJuYW1lfVwiXG4gICAgICAgICAgICAocHJvY2Vzcy5jd2QoKSkuc2hvdWxkLmVxbCBfX2Rpcm5hbWVcbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcInJldHVybnMgYW4gYXJyYXlcIiAtPiBfLmlzQXJyYXkgZmlsZWxpc3QgJy4nXG4gICAgICAgIFxuICAgICAgICBpdCBcInJldHVybnMgZW1wdHkgYXJyYXlcIiAtPiBfLmlzRW1wdHkgZmlsZWxpc3QgJ2Zvb2JhcicsIGxvZ0Vycm9yOiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgaXQgXCJmaW5kcyB0aGlzIGZpbGUgcmVsYXRpdmVcIiAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0ICcuJykuc2hvdWxkLmluY2x1ZGUgJ3Rlc3QuY29mZmVlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwiZmluZHMgdGhpcyBmaWxlIGFic29sdXRlXCIgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCBfX2Rpcm5hbWUpLnNob3VsZC5pbmNsdWRlIHNsYXNoLnBhdGggX19maWxlbmFtZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwibGlzdHMgcmVsYXRpdmUgcGF0aCB3aXRoIGRvdFwiIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QoJy4vZGlyJykubGVuZ3RoKS5zaG91bGQuZ3QgMFxuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwibGlzdHMgcmVsYXRpdmUgcGF0aCB3aXRob3V0IGRvdFwiIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QoJ2RpcicpLmxlbmd0aCkuc2hvdWxkLmd0IDBcbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcImlnbm9yZXMgaGlkZGVuIGZpbGVzIGJ5IGRlZmF1bHRcIiAtPlxuICAgICAgICAgICAgKGZpbGVsaXN0ICdkaXInKS5zaG91bGQubm90LmluY2x1ZGUgc2xhc2gubm9ybWFsaXplICdkaXIvLmtvbnJhZC5ub29uJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0IFwiaW5jbHVkZXMgaGlkZGVuIGZpbGVzXCIgLT5cbiAgICAgICAgICAgIChmaWxlbGlzdCAnZGlyJywgJ2lnbm9yZUhpZGRlbic6IGZhbHNlKS5zaG91bGQuaW5jbHVkZSBzbGFzaC5ub3JtYWxpemUgJ2Rpci8ua29ucmFkLm5vb24nXG4gICAgICAgICAgICBcbiAgICAgICAgaXQgXCJkb2Vzbid0IHJlY3Vyc2UgYnkgZGVmYXVsdFwiIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QgJ2RpcicpLnNob3VsZC5lcWwgW3NsYXNoLm5vcm1hbGl6ZSgnZGlyL25vZXh0JyksIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuanMnKSwgc2xhc2gubm9ybWFsaXplKCdkaXIvdGVzdC50eHQnKV1cbiAgICAgICAgICAgIFxuICAgICAgICBpdCBcInJlY3Vyc2VzIGlmIGRlcHRoIHNldFwiIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QgJ2RpcicsIGRlcHRoOiAyKS5zaG91bGQuZXFsIFtcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9ub2V4dCcpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci90ZXN0LmpzJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QudHh0JyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvdGVzdC5qcycpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvdGVzdC50eHQnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDIuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMWIvbGV2ZWwxYi5jb2ZmZWUnKV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaXQgXCJtYXRjaGVzIGV4dGVuc2lvblwiIC0+XG4gICAgICAgICAgICAoZmlsZWxpc3QgJ2RpcicsIGRlcHRoOiAzLCBtYXRjaEV4dDogc2xhc2guZXh0IF9fZmlsZW5hbWUpLnNob3VsZC5lcWwgW1xuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL3Rlc3QuY29mZmVlJyksIFxuICAgICAgICAgICAgICAgIHNsYXNoLm5vcm1hbGl6ZSgnZGlyL2xldmVsMS90ZXN0LmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDEvbGV2ZWwyL2xldmVsMi5jb2ZmZWUnKSwgXG4gICAgICAgICAgICAgICAgc2xhc2gubm9ybWFsaXplKCdkaXIvbGV2ZWwxL2xldmVsMi9sZXZlbDMvbGV2ZWwzLmNvZmZlZScpLCBcbiAgICAgICAgICAgICAgICBzbGFzaC5ub3JtYWxpemUoJ2Rpci9sZXZlbDFiL2xldmVsMWIuY29mZmVlJyldXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZGVzY3JpYmUgJ2twb3MnIC0+XG4gICAgXG4gICAgICAgIGl0IFwiYW5nbGVcIiAtPlxuICAgICAgICAgICAgKGtwb3MoMSwwKS5hbmdsZShrcG9zIDAsMSkpLnNob3VsZC5lcWwgOTBcbiAgICAgICAgICAgIChrcG9zKDEsMCkuYW5nbGUoa3BvcyAwLC0xKSkuc2hvdWxkLmVxbCA5MFxuICAgICAgICAgICAgKGtwb3MoMCwxMCkuYW5nbGUoa3BvcyAxLDApKS5zaG91bGQuZXFsIDkwXG4gICAgICAgICAgICAoa3BvcygwLC0xMCkuYW5nbGUoa3BvcyAxLDApKS5zaG91bGQuZXFsIDkwXG4gICAgXG4gICAgICAgIGl0IFwicm90YXRpb25cIiAtPlxuICAgICAgICAgICAgKE1hdGgucm91bmQga3BvcygwLDEpLnJvdGF0aW9uKGtwb3MgMSwwKSkuc2hvdWxkLmVxbCA5MFxuICAgICAgICAgICAgKE1hdGgucm91bmQga3BvcygwLC0xKS5yb3RhdGlvbihrcG9zIDEsMCkpLnNob3VsZC5lcWwgLTkwXG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsMSkucm90YXRpb24oa3BvcyAxLDApKS5zaG91bGQuZXFsIDQ1XG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsLTEpLnJvdGF0aW9uKGtwb3MgMSwwKSkuc2hvdWxkLmVxbCAtNDVcbiAgICAgICAgICAgIChNYXRoLnJvdW5kIGtwb3MoMSwwKS5yb3RhdGlvbihrcG9zIDAsMSkpLnNob3VsZC5lcWwgLTkwXG4gICAgICAgICAgICAoTWF0aC5yb3VuZCBrcG9zKDEsMCkucm90YXRpb24oa3BvcyAwLC0xKSkuc2hvdWxkLmVxbCA5MFxuICAgIFxuICAgICAgICBpdCBcInJvdGF0ZVwiIC0+XG4gICAgICAgICAgICAoa3BvcygxLDApLnJvdGF0ZSg5MCkucm91bmRlZCgpKS5zaG91bGQuZXFsIGtwb3MoMCwxKVxuICAgICAgICAgICAgKGtwb3MoMSwwKS5yb3RhdGUoLTkwKS5yb3VuZGVkKCkpLnNob3VsZC5lcWwga3BvcygwLC0xKVxuICAgICAgICAgICAgKGtwb3MoMSwwKS5yb3RhdGUoNDUpLnJvdW5kZWQoMC4wMDEpKS5zaG91bGQuZXFsIGtwb3MoMSwxKS5ub3JtYWwoKS5yb3VuZGVkKDAuMDAxKVxuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdjbGFtcCcgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICdjbGFtcHMnIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAwLCAxLCAxLjEpLnNob3VsZC5lcWwgMVxuICAgIFxuICAgICAgICAgICAgKGNsYW1wIDEsIDAsIDEuMSkuc2hvdWxkLmVxbCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAyLjIsIDMsIDEuMSkuc2hvdWxkLmVxbCAyLjJcbiAgICBcbiAgICAgICAgICAgIChjbGFtcCAzLCAyLjIsIDEuMSkuc2hvdWxkLmVxbCAyLjJcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnbnVsbHMnIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCAwLCAxKS5zaG91bGQuZXFsIDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGNsYW1wIDIsIDMsIHVuZGVmaW5lZCkuc2hvdWxkLmVxbCAyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChjbGFtcCA0LCA1LCBudWxsKS5zaG91bGQuZXFsIDRcbiAgICBcbiAgICAgICAgICAgIChjbGFtcCA2LCA3LCB7fSkuc2hvdWxkLmVxbCA2XG4gICAgXG4gICAgICAgICAgICAoY2xhbXAgOCwgOSwgW10pLnNob3VsZC5lcWwgOFxuICAgIFxuICAgICAgICAgICAgKGNsYW1wIDEwLCAxMSwgY2xhbXApLnNob3VsZC5lcWwgMTBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGNsYW1wIC0zLCAtMiwgMCkuc2hvdWxkLmVxbCAtMlxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgICAwMDAgICAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdlbXB0eScgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ICd0cnVlJyAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgJycgICAgKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5IFtdICAgICkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSB7fSAgICApLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgbnVsbCkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSB1bmRlZmluZWQpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdmYWxzZScgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5IDEpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5IDApLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5IFtbXV0pLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGVtcHR5IGE6bnVsbCkuc2hvdWxkLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZW1wdHkgJyAnKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChlbXB0eSBJbmZpbml0eSkuc2hvdWxkLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBkZXNjcmliZSAndmFsaWQnIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAnZmFsc2UnIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCAnJyAgICApLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIFtdICAgICkuc2hvdWxkLmVxbCBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQge30gICAgKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCBudWxsKS5zaG91bGQuZXFsIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCB1bmRlZmluZWQpLnNob3VsZC5lcWwgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAndHJ1ZScgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIDEpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQgMCkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCBbW11dKS5zaG91bGQuZXFsIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKHZhbGlkIGE6bnVsbCkuc2hvdWxkLmVxbCB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICh2YWxpZCAnICcpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAodmFsaWQgSW5maW5pdHkpLnNob3VsZC5lcWwgdHJ1ZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGRlc2NyaWJlICdmaWx0ZXInIC0+XG4gICAgICAgIFxuICAgICAgICBpdCAnYXJyYXknIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIChmaWx0ZXIgWzEsMiwzLDRdLCAodixpKSAtPiBpICUgMikuc2hvdWxkLmVxbCBbMiw0XVxuXG4gICAgICAgICAgICAoZmlsdGVyIFsxLDIsMyw0XSwgKHYsaSkgLT4gdiAlIDIpLnNob3VsZC5lcWwgWzEsM11cbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnb2JqZWN0JyAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZmlsdGVyIHthOjEsYjoyLGM6MyxkOjR9LCAodixrKSAtPiB2ICUgMikuc2hvdWxkLmVxbCB7YToxLGM6M31cblxuICAgICAgICAgICAgKGZpbHRlciB7YToxLGI6MixjOjMsZDo0fSwgKHYsaykgLT4gayBpbiBbJ2InLCAnYyddKS5zaG91bGQuZXFsIHtiOjIsYzozfVxuICAgICAgICAgICAgXG4gICAgICAgIGl0ICd2YWx1ZScgLT4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGZpbHRlcigxLCAtPikpLnNob3VsZC5lcWwgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAoZmlsdGVyKFwiaGVsbG9cIiAtPikpLnNob3VsZC5lcWwgXCJoZWxsb1wiXG4gICAgICAgICAgICAgICAgIl19
//# sourceURL=../../test/test.coffee