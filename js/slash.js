// koffee 0.56.0

/*
 0000000  000       0000000    0000000  000   000    
000       000      000   000  000       000   000    
0000000   000      000000000  0000000   000000000    
     000  000      000   000       000  000   000    
0000000   0000000  000   000  0000000   000   000
 */
var Slash, fs, os, path;

os = require('os');

fs = require('fs');

path = require('path');

Slash = (function() {
    function Slash() {}

    Slash.reg = new RegExp("\\\\", 'g');

    Slash.win = function() {
        return path.sep === '\\';
    };

    Slash.error = function(msg) {
        return '';
    };

    Slash.path = function(p) {
        if ((p == null) || p.length === 0) {
            return Slash.error("Slash.path -- no path? " + p);
        }
        p = path.normalize(p);
        p = p.replace(Slash.reg, '/');
        return p;
    };

    Slash.unslash = function(p) {
        if ((p == null) || p.length === 0) {
            return Slash.error("Slash.unslash -- no path? " + p);
        }
        p = Slash.path(p);
        if (Slash.win()) {
            if (p.length >= 3 && (p[0] === '/' && '/' === p[2])) {
                p = p[1] + ':' + p.slice(2);
            }
            p = path.normalize(p);
            if (p[1] === ':') {
                p = p.splice(0, 1, p[0].toUpperCase());
            }
        }
        return p;
    };

    Slash.split = function(p) {
        return Slash.path(p).split('/').filter(function(e) {
            return e.length;
        });
    };

    Slash.splitDrive = function(p) {
        var filePath, root;
        if (Slash.win()) {
            root = Slash.parse(p).root;
            if (root.length > 1) {
                if (p.length > root.length) {
                    filePath = Slash.path(p.slice(root.length - 1));
                } else {
                    filePath = '/';
                }
                return [filePath, root.slice(0, root.length - 2)];
            }
        }
        return [Slash.path(p), ''];
    };

    Slash.removeDrive = function(p) {
        return Slash.splitDrive(p)[0];
    };

    Slash.isRoot = function(p) {
        return Slash.removeDrive(p) === '/';
    };

    Slash.splitFileLine = function(p) {
        var c, clmn, d, f, l, line, ref, split;
        ref = Slash.splitDrive(p), f = ref[0], d = ref[1];
        split = String(f).split(':');
        if (split.length > 1) {
            line = parseInt(split[1]);
        }
        if (split.length > 2) {
            clmn = parseInt(split[2]);
        }
        l = c = 0;
        if (Number.isInteger(line)) {
            l = line;
        }
        if (Number.isInteger(clmn)) {
            c = clmn;
        }
        if (d !== '') {
            d = d + ':';
        }
        return [d + split[0], Math.max(l, 1), Math.max(c, 0)];
    };

    Slash.splitFilePos = function(p) {
        var c, f, l, ref;
        ref = Slash.splitFileLine(p), f = ref[0], l = ref[1], c = ref[2];
        return [f, [c, l - 1]];
    };

    Slash.removeLinePos = function(p) {
        return Slash.splitFileLine(p)[0];
    };

    Slash.removeColumn = function(p) {
        var f, l, ref;
        ref = Slash.splitFileLine(p), f = ref[0], l = ref[1];
        if (l > 1) {
            return f + ':' + l;
        } else {
            return f;
        }
    };

    Slash.ext = function(p) {
        return path.extname(p).slice(1);
    };

    Slash.splitExt = function(p) {
        return [Slash.removeExt(p), Slash.ext(p)];
    };

    Slash.removeExt = function(p) {
        return Slash.join(Slash.dir(p), Slash.base(p));
    };

    Slash.swapExt = function(p, ext) {
        return Slash.removeExt(p) + (ext.startsWith('.') && ext || ("." + ext));
    };

    Slash.join = function() {
        return [].map.call(arguments, Slash.path).join('/');
    };

    Slash.joinFilePos = function(file, pos) {
        if ((pos == null) || (pos[0] == null)) {
            return file;
        } else if (pos[0]) {
            return file + (":" + (pos[1] + 1) + ":" + pos[0]);
        } else {
            return file + (":" + (pos[1] + 1));
        }
    };

    Slash.joinFileLine = function(file, line, col) {
        if (line == null) {
            return file;
        }
        if (col == null) {
            return file + ":" + line;
        }
        return file + ":" + line + ":" + col;
    };

    Slash.pathlist = function(p) {
        var list;
        if (!(p != null ? p.length : void 0)) {
            return [];
        }
        p = Slash.path(Slash.sanitize(p));
        list = [p];
        while (Slash.dir(p) !== '') {
            list.unshift(Slash.dir(p));
            p = Slash.dir(p);
        }
        return list;
    };

    Slash.base = function(p) {
        return path.basename(Slash.sanitize(p), path.extname(Slash.sanitize(p)));
    };

    Slash.file = function(p) {
        return path.basename(Slash.sanitize(p));
    };

    Slash.extname = function(p) {
        return path.extname(Slash.sanitize(p));
    };

    Slash.basename = function(p, e) {
        return path.basename(Slash.sanitize(p), e);
    };

    Slash.isAbsolute = function(p) {
        return path.isAbsolute(Slash.sanitize(p));
    };

    Slash.isRelative = function(p) {
        return !Slash.isAbsolute(Slash.sanitize(p));
    };

    Slash.dirname = function(p) {
        return Slash.path(path.dirname(Slash.sanitize(p)));
    };

    Slash.normalize = function(p) {
        return Slash.path(path.normalize(Slash.sanitize(p)));
    };

    Slash.dir = function(p) {
        p = Slash.sanitize(p);
        if (Slash.isRoot(p)) {
            return '';
        }
        p = path.dirname(p);
        if (p === '.') {
            return '';
        }
        return Slash.path(p);
    };

    Slash.sanitize = function(p) {
        if (!(p != null ? p.length : void 0)) {
            return Slash.error('empty path!');
        }
        if (p[0] === '\n') {
            Slash.error("leading newline in path! '" + p + "'");
            return Slash.sanitize(p.substr(1));
        }
        if (p.endsWith('\n')) {
            Slash.error("trailing newline in path! '" + p + "'");
            return Slash.sanitize(p.substr(0, p.length - 1));
        }
        return p;
    };

    Slash.parse = function(p) {
        var dict;
        dict = path.parse(p);
        if (dict.dir.length === 2 && dict.dir[1] === ':') {
            dict.dir += '/';
        }
        if (dict.root.length === 2 && dict.root[1] === ':') {
            dict.root += '/';
        }
        return dict;
    };

    Slash.home = function() {
        return Slash.path(os.homedir());
    };

    Slash.tilde = function(p) {
        var ref;
        return (ref = Slash.path(p)) != null ? ref.replace(Slash.home(), '~') : void 0;
    };

    Slash.untilde = function(p) {
        var ref;
        return (ref = Slash.path(p)) != null ? ref.replace(/^\~/, Slash.home()) : void 0;
    };

    Slash.unenv = function(p) {
        var i, k, ref, v;
        i = p.indexOf('$', 0);
        while (i >= 0) {
            ref = process.env;
            for (k in ref) {
                v = ref[k];
                if (k === p.slice(i + 1, i + 1 + k.length)) {
                    p = p.slice(0, i) + v + p.slice(i + k.length + 1);
                    break;
                }
            }
            i = p.indexOf('$', i + 1);
        }
        return Slash.path(p);
    };

    Slash.resolve = function(p) {
        if (!(p != null ? p.length : void 0)) {
            p = process.cwd();
        }
        return Slash.path(path.resolve(Slash.unenv(Slash.untilde(p))));
    };

    Slash.relative = function(rel, to) {
        if (!(to != null ? to.length : void 0)) {
            to = process.cwd();
        }
        rel = Slash.resolve(rel);
        if (!Slash.isAbsolute(rel)) {
            return rel;
        }
        if (Slash.resolve(to) === rel) {
            return '.';
        }
        return Slash.path(path.relative(Slash.resolve(to), rel));
    };

    Slash.fileUrl = function(p) {
        return "file:///" + (Slash.encode(p));
    };

    Slash.samePath = function(a, b) {
        return Slash.resolve(a) === Slash.resolve(b);
    };

    Slash.escape = function(p) {
        return p.replace(/([\`\"])/g, '\\$1');
    };

    Slash.encode = function(p) {
        p = encodeURI(p);
        p = p.replace(/\#/g, "%23");
        p = p.replace(/\&/g, "%26");
        return p = p.replace(/\'/g, "%27");
    };

    Slash.pkg = function(p) {
        var ref;
        if ((p != null ? p.length : void 0) != null) {
            while (p.length && ((ref = Slash.removeDrive(p)) !== '.' && ref !== '/' && ref !== '')) {
                if (Slash.dirExists(Slash.join(p, '.git'))) {
                    return Slash.resolve(p);
                }
                if (Slash.fileExists(Slash.join(p, 'package.noon'))) {
                    return Slash.resolve(p);
                }
                if (Slash.fileExists(Slash.join(p, 'package.json'))) {
                    return Slash.resolve(p);
                }
                p = Slash.dir(p);
            }
        }
        return null;
    };

    Slash.git = function(p) {
        var ref;
        if ((p != null ? p.length : void 0) != null) {
            while (p.length && ((ref = Slash.removeDrive(p)) !== '.' && ref !== '/' && ref !== '')) {
                if (Slash.dirExists(Slash.join(p, '.git'))) {
                    return Slash.resolve(p);
                }
                p = Slash.dir(p);
            }
        }
        return null;
    };

    Slash.exists = function(p, cb) {
        var err, ref, stat;
        if ('function' === typeof cb) {
            if (p == null) {
                cb();
                return;
            }
            p = Slash.resolve(Slash.removeLinePos(p));
            fs.access(p, fs.R_OK | fs.F_OK, function(err) {
                if (err != null) {
                    return cb();
                } else {
                    return fs.stat(p, function(err, stat) {
                        if (err != null) {
                            return cb();
                        } else {
                            return cb(stat);
                        }
                    });
                }
            });
            return;
        }
        if (p != null) {
            try {
                p = Slash.resolve(Slash.removeLinePos(p));
                if (stat = fs.statSync(p)) {
                    fs.accessSync(p, fs.R_OK);
                    return stat;
                }
            } catch (error) {
                err = error;
                if ((ref = err.code) === 'ENOENT' || ref === 'ENOTDIR') {
                    return false;
                }
                console.error(err);
            }
        }
        return null;
    };

    Slash.touch = function(p) {
        fs.mkdirSync(Slash.dirname(p), {
            recursive: true
        });
        if (!Slash.fileExists(p)) {
            return fs.writeFileSync(p, '');
        }
    };

    Slash.fileExists = function(p, cb) {
        var stat;
        if ('function' === typeof cb) {
            return Slash.exists(p, function(stat) {
                if (stat != null ? stat.isFile() : void 0) {
                    return cb(stat);
                } else {
                    return cb();
                }
            });
        } else {
            if (stat = Slash.exists(p)) {
                if (stat.isFile()) {
                    return stat;
                }
            }
        }
    };

    Slash.dirExists = function(p, cb) {
        var stat;
        if ('function' === typeof cb) {
            return Slash.exists(p, function(stat) {
                if (stat != null ? stat.isDirectory() : void 0) {
                    return cb(stat);
                } else {
                    return cb();
                }
            });
        } else {
            if (stat = Slash.exists(p)) {
                if (stat.isDirectory()) {
                    return stat;
                }
            }
        }
    };

    Slash.isDir = function(p, cb) {
        return Slash.dirExists(p, cb);
    };

    Slash.isFile = function(p, cb) {
        return Slash.fileExists(p, cb);
    };

    Slash.isWritable = function(p, cb) {
        if ('function' === typeof cb) {
            return fs.access(Slash.resolve(p), fs.R_OK | fs.W_OK, function(err) {
                return cb(err == null);
            });
        } else {
            try {
                fs.accessSync(Slash.resolve(p), fs.R_OK | fs.W_OK);
                return true;
            } catch (error) {
                return false;
            }
        }
    };

    Slash.userData = function() {
        var electron, err, name, pkg, pkgDir, sds;
        try {
            electron = require('electron');
            if (process.type === 'renderer') {
                return electron.remote.app.getPath('userData');
            } else {
                return electron.app.getPath('userData');
            }
        } catch (error) {
            err = error;
            try {
                if (pkgDir = Slash.pkg(__dirname)) {
                    pkg = require(slash.join(pkgDir, 'package.json'));
                    sds = require('./kxk').sds;
                    name = sds.find.value(pkg, 'name');
                    return Slash.resolve("~/AppData/Roaming/" + name);
                }
            } catch (error) {
                err = error;
                console.error(err);
            }
        }
        return Slash.resolve("~/AppData/Roaming/");
    };


    /*
    000   0000000  000000000  00000000  000   000  000000000
    000  000          000     000        000 000      000   
    000  0000000      000     0000000     00000       000   
    000       000     000     000        000 000      000   
    000  0000000      000     00000000  000   000     000
     */

    Slash.textext = null;

    Slash.textbase = {
        profile: 1,
        license: 1,
        '.gitignore': 1,
        '.npmignore': 1
    };

    Slash.isText = function(f) {
        var ext, isBinary, j, len, ref;
        if (!Slash.textext) {
            Slash.textext = {};
            ref = require('textextensions');
            for (j = 0, len = ref.length; j < len; j++) {
                ext = ref[j];
                Slash.textext[ext] = true;
            }
            Slash.textext['crypt'] = true;
        }
        ext = Slash.ext(f);
        if (ext && (Slash.textext[ext] != null)) {
            return true;
        }
        if (Slash.textbase[Slash.basename(f).toLowerCase()]) {
            return true;
        }
        if (!Slash.isFile(f)) {
            return false;
        }
        isBinary = require('isbinaryfile');
        return !isBinary.isBinaryFileSync(f);
    };

    Slash.readText = function(f, cb) {
        var err;
        if ('function' === typeof cb) {
            return fs.readFile(f, 'utf8', function(err, text) {
                return cb((err == null) && text || '');
            });
        } else {
            try {
                return fs.readFileSync(f, 'utf8');
            } catch (error) {
                err = error;
                return '';
            }
        }
    };

    return Slash;

})();

module.exports = Slash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhc2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEVBQUEsR0FBVyxPQUFBLENBQVEsSUFBUjs7QUFDWCxFQUFBLEdBQVcsT0FBQSxDQUFRLElBQVI7O0FBQ1gsSUFBQSxHQUFXLE9BQUEsQ0FBUSxNQUFSOztBQUVMOzs7SUFFRixLQUFDLENBQUEsR0FBRCxHQUFPLElBQUksTUFBSixDQUFXLE1BQVgsRUFBbUIsR0FBbkI7O0lBRVAsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFBO2VBQUcsSUFBSSxDQUFDLEdBQUwsS0FBWTtJQUFmOztJQUVOLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxHQUFEO2VBR0o7SUFISTs7SUFXUixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQXdELFdBQUosSUFBVSxDQUFDLENBQUMsTUFBRixLQUFZLENBQTFFO0FBQUEsbUJBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBWSx5QkFBQSxHQUEwQixDQUF0QyxFQUFQOztRQUNBLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7UUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7ZUFDSjtJQUpHOztJQU1QLEtBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxDQUFEO1FBQ04sSUFBMkQsV0FBSixJQUFVLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBN0U7QUFBQSxtQkFBTyxLQUFLLENBQUMsS0FBTixDQUFZLDRCQUFBLEdBQTZCLENBQXpDLEVBQVA7O1FBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtRQUNKLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFIO1lBQ0ksSUFBRyxDQUFDLENBQUMsTUFBRixJQUFZLENBQVosSUFBa0IsQ0FBQSxDQUFFLENBQUEsQ0FBQSxD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QXhCO21CQUNJLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixFQUFlLE1BQWYsRUFBdUIsU0FBQyxHQUFELEVBQU0sSUFBTjt1QkFDbkIsRUFBQSxDQUFPLGFBQUosSUFBYSxJQUFiLElBQXFCLEVBQXhCO1lBRG1CLENBQXZCLEVBREo7U0FBQSxNQUFBO0FBSUk7dUJBQ0ksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsRUFESjthQUFBLGFBQUE7Z0JBRU07dUJBQ0YsR0FISjthQUpKOztJQUZPOzs7Ozs7QUFXZixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4wMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuICAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4jIyNcblxub3MgICAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICAgID0gcmVxdWlyZSAnZnMnIFxucGF0aCAgICAgPSByZXF1aXJlICdwYXRoJ1xuXG5jbGFzcyBTbGFzaFxuXG4gICAgQHJlZyA9IG5ldyBSZWdFeHAgXCJcXFxcXFxcXFwiLCAnZydcblxuICAgIEB3aW46IC0+IHBhdGguc2VwID09ICdcXFxcJ1xuICAgIFxuICAgIEBlcnJvcjogKG1zZykgLT5cbiAgICAgICAgIyBlcnJvciA9IHJlcXVpcmUgJy4vZXJyb3InXG4gICAgICAgICMgZXJyb3IgbXNnXG4gICAgICAgICcnXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAcGF0aDogKHApIC0+XG4gICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnBhdGggLS0gbm8gcGF0aD8gI3twfVwiIGlmIG5vdCBwPyBvciBwLmxlbmd0aCA9PSAwXG4gICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgcFxuXG4gICAgQHVuc2xhc2g6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC51bnNsYXNoIC0tIG5vIHBhdGg/ICN7cH1cIiBpZiBub3QgcD8gb3IgcC5sZW5ndGggPT0gMFxuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBpZiBwLmxlbmd0aCA+PSAzIGFuZCBwWzBdID09ICcvJyA9PSBwWzJdIFxuICAgICAgICAgICAgICAgIHAgPSBwWzFdICsgJzonICsgcC5zbGljZSAyXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgaWYgcFsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICBwID0gcC5zcGxpY2UgMCwgMSwgcFswXS50b1VwcGVyQ2FzZSgpXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHNwbGl0OiAocCkgLT4gU2xhc2gucGF0aChwKS5zcGxpdCgnLycpLmZpbHRlciAoZSkgLT4gZS5sZW5ndGhcbiAgICBcbiAgICBAc3BsaXREcml2ZTogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBTbGFzaC53aW4oKVxuICAgICAgICAgICAgcm9vdCA9IFNsYXNoLnBhcnNlKHApLnJvb3RcblxuICAgICAgICAgICAgaWYgcm9vdC5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgaWYgcC5sZW5ndGggPiByb290Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IFNsYXNoLnBhdGggcC5zbGljZShyb290Lmxlbmd0aC0xKVxuICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gJy8nXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaWxlUGF0aCAsIHJvb3Quc2xpY2UgMCwgcm9vdC5sZW5ndGgtMl1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgW1NsYXNoLnBhdGgocCksICcnXVxuICAgICAgICBcbiAgICBAcmVtb3ZlRHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnNwbGl0RHJpdmUocClbMF1cbiAgXG4gICAgQGlzUm9vdDogKHApIC0+IFNsYXNoLnJlbW92ZURyaXZlKHApID09ICcvJ1xuICAgICAgICBcbiAgICBAc3BsaXRGaWxlTGluZTogKHApIC0+ICAjIGZpbGUudHh0OjE6MCAtLT4gWydmaWxlLnR4dCcsIDEsIDBdXG4gICAgICAgIFxuICAgICAgICBbZixkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcFxuICAgICAgICBzcGxpdCA9IFN0cmluZyhmKS5zcGxpdCAnOidcbiAgICAgICAgbGluZSA9IHBhcnNlSW50IHNwbGl0WzFdIGlmIHNwbGl0Lmxlbmd0aCA+IDFcbiAgICAgICAgY2xtbiA9IHBhcnNlSW50IHNwbGl0WzJdIGlmIHNwbGl0Lmxlbmd0aCA+IDJcbiAgICAgICAgbCA9IGMgPSAwXG4gICAgICAgIGwgPSBsaW5lIGlmIE51bWJlci5pc0ludGVnZXIgbGluZVxuICAgICAgICBjID0gY2xtbiBpZiBOdW1iZXIuaXNJbnRlZ2VyIGNsbW5cbiAgICAgICAgZCA9IGQgKyAnOicgaWYgZCAhPSAnJ1xuICAgICAgICBbIGQgKyBzcGxpdFswXSwgTWF0aC5tYXgobCwxKSwgIE1hdGgubWF4KGMsMCkgXVxuICAgICAgICBcbiAgICBAc3BsaXRGaWxlUG9zOiAocCkgLT4gIyBmaWxlLnR4dDoxOjMgLS0+IFsnZmlsZS50eHQnLCBbMywgMF1dXG4gICAgXG4gICAgICAgIFtmLGwsY10gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgW2YsIFtjLCBsLTFdXVxuICAgICAgICBcbiAgICBAcmVtb3ZlTGluZVBvczogKHApIC0+IFNsYXNoLnNwbGl0RmlsZUxpbmUocClbMF1cbiAgICBAcmVtb3ZlQ29sdW1uOiAgKHApIC0+IFxuICAgICAgICBbZixsXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBpZiBsPjEgdGhlbiBmICsgJzonICsgbFxuICAgICAgICBlbHNlIGZcbiAgICAgICAgXG4gICAgQGV4dDogICAgICAgKHApIC0+IHBhdGguZXh0bmFtZShwKS5zbGljZSAxXG4gICAgQHNwbGl0RXh0OiAgKHApIC0+IFtTbGFzaC5yZW1vdmVFeHQocCksIFNsYXNoLmV4dChwKV1cbiAgICBAcmVtb3ZlRXh0OiAocCkgLT4gU2xhc2guam9pbiBTbGFzaC5kaXIocCksIFNsYXNoLmJhc2UgcFxuICAgIEBzd2FwRXh0OiAgIChwLCBleHQpIC0+IFNsYXNoLnJlbW92ZUV4dChwKSArIChleHQuc3RhcnRzV2l0aCgnLicpIGFuZCBleHQgb3IgXCIuI3tleHR9XCIpXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGpvaW46IC0+IFtdLm1hcC5jYWxsKGFyZ3VtZW50cywgU2xhc2gucGF0aCkuam9pbiAnLydcbiAgICBcbiAgICBAam9pbkZpbGVQb3M6IChmaWxlLCBwb3MpIC0+ICMgWydmaWxlLnR4dCcsIFszLCAwXV0gLS0+IGZpbGUudHh0OjE6M1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IHBvcz8gb3Igbm90IHBvc1swXT9cbiAgICAgICAgICAgIGZpbGVcbiAgICAgICAgZWxzZSBpZiBwb3NbMF1cbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfToje3Bvc1swXX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX1cIlxuICAgICAgICAgICAgICAgIFxuICAgIEBqb2luRmlsZUxpbmU6IChmaWxlLCBsaW5lLCBjb2wpIC0+ICMgJ2ZpbGUudHh0JywgMSwgMiAtLT4gZmlsZS50eHQ6MToyXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZmlsZSBpZiBub3QgbGluZT9cbiAgICAgICAgcmV0dXJuIFwiI3tmaWxlfToje2xpbmV9XCIgaWYgbm90IGNvbD9cbiAgICAgICAgXCIje2ZpbGV9OiN7bGluZX06I3tjb2x9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGF0aGxpc3Q6IChwKSAtPiAjICcvcm9vdC9kaXIvZmlsZS50eHQnIC0tPiBbJy8nLCAnL3Jvb3QnLCAnL3Jvb3QvZGlyJywgJy9yb290L2Rpci9maWxlLnR4dCddXG4gICAgXG4gICAgICAgIHJldHVybiBbXSBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIFNsYXNoLnNhbml0aXplIHBcbiAgICAgICAgbGlzdCA9IFtwXVxuICAgICAgICB3aGlsZSBTbGFzaC5kaXIocCkgIT0gJydcbiAgICAgICAgICAgIGxpc3QudW5zaGlmdCBTbGFzaC5kaXIocClcbiAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBsaXN0XG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBiYXNlOiAgICAgICAocCkgICAtPiBwYXRoLmJhc2VuYW1lIFNsYXNoLnNhbml0aXplKHApLCBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZmlsZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBleHRuYW1lOiAgICAocCkgICAtPiBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAYmFzZW5hbWU6ICAgKHAsZSkgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgZVxuICAgIEBpc0Fic29sdXRlOiAocCkgICAtPiBwYXRoLmlzQWJzb2x1dGUgU2xhc2guc2FuaXRpemUocClcbiAgICBAaXNSZWxhdGl2ZTogKHApICAgLT4gbm90IFNsYXNoLmlzQWJzb2x1dGUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZGlybmFtZTogICAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLmRpcm5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAbm9ybWFsaXplOiAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLm5vcm1hbGl6ZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBkaXI6ICAgICAgICAocCkgICAtPiBcbiAgICAgICAgcCA9IFNsYXNoLnNhbml0aXplIHBcbiAgICAgICAgaWYgU2xhc2guaXNSb290IHAgdGhlbiByZXR1cm4gJydcbiAgICAgICAgcCA9IHBhdGguZGlybmFtZSBwXG4gICAgICAgIGlmIHAgPT0gJy4nIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgICAgICBcbiAgICBAc2FuaXRpemU6IChwKSAtPiBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yICdlbXB0eSBwYXRoISdcbiAgICAgICAgaWYgcFswXSA9PSAnXFxuJ1xuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJsZWFkaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAxXG4gICAgICAgIGlmIHAuZW5kc1dpdGggJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwidHJhaWxpbmcgbmV3bGluZSBpbiBwYXRoISAnI3twfSdcIlxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnNhbml0aXplIHAuc3Vic3RyIDAsIHAubGVuZ3RoLTFcbiAgICAgICAgcFxuICAgIFxuICAgIEBwYXJzZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgZGljdCA9IHBhdGgucGFyc2UgcFxuICAgICAgICBcbiAgICAgICAgaWYgZGljdC5kaXIubGVuZ3RoID09IDIgYW5kIGRpY3QuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5kaXIgKz0gJy8nXG4gICAgICAgIGlmIGRpY3Qucm9vdC5sZW5ndGggPT0gMiBhbmQgZGljdC5yb290WzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5yb290ICs9ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgIGRpY3RcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBob21lOiAgICAgICAgICAtPiBTbGFzaC5wYXRoIG9zLmhvbWVkaXIoKVxuICAgIEB0aWxkZTogICAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIFNsYXNoLmhvbWUoKSwgJ34nXG4gICAgQHVudGlsZGU6ICAgKHApIC0+IFNsYXNoLnBhdGgocCk/LnJlcGxhY2UgL15cXH4vLCBTbGFzaC5ob21lKClcbiAgICBAdW5lbnY6ICAgICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpID0gcC5pbmRleE9mICckJywgMFxuICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgIGZvciBrLHYgb2YgcHJvY2Vzcy5lbnZcbiAgICAgICAgICAgICAgICBpZiBrID09IHAuc2xpY2UgaSsxLCBpKzEray5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcCA9IHAuc2xpY2UoMCwgaSkgKyB2ICsgcC5zbGljZShpK2subGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpID0gcC5pbmRleE9mICckJywgaSsxXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgIFxuICAgIEByZXNvbHZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlc29sdmUgU2xhc2gudW5lbnYgU2xhc2gudW50aWxkZSBwXG4gICAgXG4gICAgQHJlbGF0aXZlOiAocmVsLCB0bykgLT5cbiAgICAgICAgXG4gICAgICAgIHRvID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgdG8/Lmxlbmd0aFxuICAgICAgICByZWwgPSBTbGFzaC5yZXNvbHZlIHJlbFxuICAgICAgICByZXR1cm4gcmVsIGlmIG5vdCBTbGFzaC5pc0Fic29sdXRlIHJlbFxuICAgICAgICBpZiBTbGFzaC5yZXNvbHZlKHRvKSA9PSByZWxcbiAgICAgICAgICAgIHJldHVybiAnLidcbiAgICAgICAgICAgIFxuICAgICAgICBTbGFzaC5wYXRoIHBhdGgucmVsYXRpdmUgU2xhc2gucmVzb2x2ZSh0byksIHJlbFxuICAgICAgICBcbiAgICBAZmlsZVVybDogKHApIC0+IFwiZmlsZTovLy8je1NsYXNoLmVuY29kZSBwfVwiXG5cbiAgICBAc2FtZVBhdGg6IChhLCBiKSAtPiBTbGFzaC5yZXNvbHZlKGEpID09IFNsYXNoLnJlc29sdmUoYilcblxuICAgIEBlc2NhcGU6IChwKSAtPiBwLnJlcGxhY2UgLyhbXFxgXFxcIl0pL2csICdcXFxcJDEnXG5cbiAgICBAZW5jb2RlOiAocCkgLT5cbiAgICAgICAgcCA9IGVuY29kZVVSSSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcIy9nLCBcIiUyM1wiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJi9nLCBcIiUyNlwiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJy9nLCBcIiUyN1wiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAgIDAwMCAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBrZzogKHApIC0+XG4gICAgXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyAgU2xhc2guam9pbiBwLCAnLmdpdCcgICAgICAgICB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2Uubm9vbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLmpzb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG5cbiAgICBAZ2l0OiAocCkgLT5cblxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHAubGVuZ3RoIGFuZCBTbGFzaC5yZW1vdmVEcml2ZShwKSBub3QgaW4gWycuJywgJy8nLCAnJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5kaXJFeGlzdHMgU2xhc2guam9pbiBwLCAnLmdpdCcgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBleGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBpZiBub3QgcD9cbiAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICBmcy5hY2Nlc3MgcCwgZnMuUl9PSyB8IGZzLkZfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZnMuc3RhdCBwLCAoZXJyLCBzdGF0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBzdGF0XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmIHA/XG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBTbGFzaC5yZW1vdmVMaW5lUG9zIHBcbiAgICAgICAgICAgICAgICBpZiBzdGF0ID0gZnMuc3RhdFN5bmMocClcbiAgICAgICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBpZiBlcnIuY29kZSBpbiBbJ0VOT0VOVCcsICdFTk9URElSJ11cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgIG51bGwgICAgIFxuICAgICAgICBcbiAgICBAdG91Y2g6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgZnMubWtkaXJTeW5jIFNsYXNoLmRpcm5hbWUocCksIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIGlmIG5vdCBTbGFzaC5maWxlRXhpc3RzIHBcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgcCwgJydcbiAgICAgICAgXG4gICAgQGZpbGVFeGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNGaWxlKCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNGaWxlKClcblxuICAgIEBkaXJFeGlzdHM6IChwLCBjYikgLT5cblxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRGlyZWN0b3J5KCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgXG4gICAgQGlzRGlyOiAgKHAsIGNiKSAtPiBTbGFzaC5kaXJFeGlzdHMgcCwgY2JcbiAgICBAaXNGaWxlOiAocCwgY2IpIC0+IFNsYXNoLmZpbGVFeGlzdHMgcCwgY2JcbiAgICBcbiAgICBAaXNXcml0YWJsZTogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIGZzLmFjY2VzcyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICBjYiBub3QgZXJyP1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIFNsYXNoLnJlc29sdmUocCksIGZzLlJfT0sgfCBmcy5XX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAdXNlckRhdGE6IC0+XG4gICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgICAgIGlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZWN0cm9uLnJlbW90ZS5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZWN0cm9uLmFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpZiBwa2dEaXIgPSBTbGFzaC5wa2cgX19kaXJuYW1lXG4gICAgICAgICAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBwa2dEaXIsICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICAgICAgICAgIHsgc2RzIH0gPSByZXF1aXJlICcuL2t4aydcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHNkcy5maW5kLnZhbHVlIHBrZywgJ25hbWUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIFwifi9BcHBEYXRhL1JvYW1pbmcvI3tuYW1lfVwiXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnJlc29sdmUgXCJ+L0FwcERhdGEvUm9hbWluZy9cIlxuXG4gICAgIyMjXG4gICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgXG4gICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuICAgICMjI1xuICAgIFxuICAgIEB0ZXh0ZXh0OiBudWxsXG4gICAgXG4gICAgQHRleHRiYXNlOiBcbiAgICAgICAgcHJvZmlsZToxXG4gICAgICAgIGxpY2Vuc2U6MVxuICAgICAgICAnLmdpdGlnbm9yZSc6MVxuICAgICAgICAnLm5wbWlnbm9yZSc6MVxuICAgIFxuICAgIEBpc1RleHQ6IChmKSAtPlxuICAgIFxuICAgICAgICBpZiBub3QgU2xhc2gudGV4dGV4dFxuICAgICAgICAgICAgU2xhc2gudGV4dGV4dCA9IHt9XG4gICAgICAgICAgICBmb3IgZXh0IGluIHJlcXVpcmUgJ3RleHRleHRlbnNpb25zJ1xuICAgICAgICAgICAgICAgIFNsYXNoLnRleHRleHRbZXh0XSA9IHRydWVcbiAgICAgICAgICAgIFNsYXNoLnRleHRleHRbJ2NyeXB0J10gID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgZXh0ID0gU2xhc2guZXh0IGZcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgZXh0IGFuZCBTbGFzaC50ZXh0ZXh0W2V4dF0/IFxuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBTbGFzaC50ZXh0YmFzZVtTbGFzaC5iYXNlbmFtZShmKS50b0xvd2VyQ2FzZSgpXVxuICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IFNsYXNoLmlzRmlsZSBmXG4gICAgICAgIGlzQmluYXJ5ID0gcmVxdWlyZSAnaXNiaW5hcnlmaWxlJ1xuICAgICAgICByZXR1cm4gbm90IGlzQmluYXJ5LmlzQmluYXJ5RmlsZVN5bmMgZlxuICAgICAgICBcbiAgICBAcmVhZFRleHQ6IChmLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBmcy5yZWFkRmlsZSBmLCAndXRmOCcsIChlcnIsIHRleHQpIC0+IFxuICAgICAgICAgICAgICAgIGNiIG5vdCBlcnI/IGFuZCB0ZXh0IG9yICcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyBmLCAndXRmOCdcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICcnXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFNsYXNoXG4iXX0=
//# sourceURL=../coffee/slash.coffee