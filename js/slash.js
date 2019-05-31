// koffee 0.56.0

/*
 0000000  000       0000000    0000000  000   000    
000       000      000   000  000       000   000    
0000000   000      000000000  0000000   000000000    
     000  000      000   000       000  000   000    
0000000   0000000  000   000  0000000   000   000
 */
var Slash, fs, os, path, textbase, textext;

os = require('os');

fs = require('fs');

path = require('path');

textext = null;

textbase = {
    profile: 1,
    license: 1,
    '.gitignore': 1,
    '.npmignore': 1
};

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
        if (!p.length) {
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
        if (!p.length) {
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
        if (p == null) {
            return false;
        }
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

    Slash.isText = function(f) {
        var _, isBinary;
        if (!textext) {
            _ = require('lodash');
            textext = _.reduce(require('textextensions'), function(map, ext) {
                map["." + ext] = true;
                return map;
            }, {});
            textext['.crypt'] = true;
            textext['.bashrc'] = true;
            textext['.svg'] = true;
            textext['.csv'] = true;
        }
        if (Slash.extname(f) && (textext[Slash.extname(f)] != null)) {
            return true;
        }
        if (textbase[Slash.basename(f).toLowerCase()]) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhc2guanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEVBQUEsR0FBVyxPQUFBLENBQVEsSUFBUjs7QUFDWCxFQUFBLEdBQVcsT0FBQSxDQUFRLElBQVI7O0FBQ1gsSUFBQSxHQUFXLE9BQUEsQ0FBUSxNQUFSOztBQUVYLE9BQUEsR0FBVzs7QUFFWCxRQUFBLEdBQ0k7SUFBQSxPQUFBLEVBQVEsQ0FBUjtJQUNBLE9BQUEsRUFBUSxDQURSO0lBRUEsWUFBQSxFQUFhLENBRmI7SUFHQSxZQUFBLEVBQWEsQ0FIYjs7O0FBS0U7OztJQUVGLEtBQUMsQ0FBQSxHQUFELEdBQU8sSUFBSSxNQUFKLENBQVcsTUFBWCxFQUFtQixHQUFuQjs7SUFFUCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUE7ZUFBRyxJQUFJLENBQUMsR0FBTCxLQUFZO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLEdBQUQ7ZUFHSjtJQUhJOztJQVdSLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxDQUFEO1FBQ0gsSUFBd0QsV0FBSixJQUFVLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBMUU7QUFBQSxtQkFBTyxLQUFLLENBQUMsS0FBTixDQUFZLHlCQUFBLEdBQTBCLENBQXRDLEVBQVA7O1FBQ0EsQ0FBQSxHQUFJLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZjtRQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQUssQ0FBQyxHQUFoQixFQUFxQixHQUFyQjtlQUNKO0lBSkc7O0lBTVAsS0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLENBQUQ7UUFDTixJQUEyRCxXQUFKLElBQVUsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUE3RTtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksNEJBQUEsR0FBNkIsQ0FBekMsRUFBUDs7UUFDQSxDQUFBLEdBQUksS0FBSyxDQUFD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QU8sQ0FBSSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsQ0FBMUI7SUFsQk47O0lBb0JULEtBQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxDQUFELEVBQUksRUFBSjtBQUVQLFlBQUE7UUFBQSxJQUFHLFVBQUEsS0FBYyxPQUFPLEVBQXhCO21CQUNJLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixFQUFlLE1BQWYsRUFBdUIsU0FBQyxHQUFELEVBQU0sSUFBTjt1QkFDbkIsRUFBQSxDQUFPLGFBQUosSUFBYSxJQUFiLElBQXFCLEVBQXhCO1lBRG1CLENBQXZCLEVBREo7U0FBQSxNQUFBO0FBSUk7dUJBQ0ksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsRUFESjthQUFBLGFBQUE7Z0JBRU07dUJBQ0YsR0FISjthQUpKOztJQUZPOzs7Ozs7QUFXZixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4wMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuICAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4jIyNcblxub3MgICAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICAgID0gcmVxdWlyZSAnZnMnIFxucGF0aCAgICAgPSByZXF1aXJlICdwYXRoJ1xuXG50ZXh0ZXh0ICA9IG51bGxcblxudGV4dGJhc2UgPSBcbiAgICBwcm9maWxlOjFcbiAgICBsaWNlbnNlOjFcbiAgICAnLmdpdGlnbm9yZSc6MVxuICAgICcubnBtaWdub3JlJzoxXG5cbmNsYXNzIFNsYXNoXG5cbiAgICBAcmVnID0gbmV3IFJlZ0V4cCBcIlxcXFxcXFxcXCIsICdnJ1xuXG4gICAgQHdpbjogLT4gcGF0aC5zZXAgPT0gJ1xcXFwnXG4gICAgXG4gICAgQGVycm9yOiAobXNnKSAtPlxuICAgICAgICAjIGVycm9yID0gcmVxdWlyZSAnLi9lcnJvcidcbiAgICAgICAgIyBlcnJvciBtc2dcbiAgICAgICAgJydcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBwYXRoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aCAtLSBubyBwYXRoPyAje3B9XCIgaWYgbm90IHA/IG9yIHAubGVuZ3RoID09IDBcbiAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHBcbiAgICAgICAgcCA9IHAucmVwbGFjZSBTbGFzaC5yZWcsICcvJ1xuICAgICAgICBwXG5cbiAgICBAdW5zbGFzaDogKHApIC0+XG4gICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnVuc2xhc2ggLS0gbm8gcGF0aD8gI3twfVwiIGlmIG5vdCBwPyBvciBwLmxlbmd0aCA9PSAwXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIGlmIHAubGVuZ3RoID49IDMgYW5kIHBbMF0gPT0gJy8nID09IHBbMl0gXG4gICAgICAgICAgICAgICAgcCA9IHBbMV0gKyAnOicgKyBwLnNsaWNlIDJcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwXG4gICAgICAgICAgICBpZiBwWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHAgPSBwLnNwbGljZSAwLCAxLCBwWzBdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgcFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3BsaXQ6IChwKSAtPiBTbGFzaC5wYXRoKHApLnNwbGl0KCcvJykuZmlsdGVyIChlKSAtPiBlLmxlbmd0aFxuICAgIFxuICAgIEBzcGxpdERyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICByb290ID0gU2xhc2gucGFyc2UocCkucm9vdFxuXG4gICAgICAgICAgICBpZiByb290Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBpZiBwLmxlbmd0aCA+IHJvb3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gU2xhc2gucGF0aCBwLnNsaWNlKHJvb3QubGVuZ3RoLTEpXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGggPSAnLydcbiAgICAgICAgICAgICAgICByZXR1cm4gW2ZpbGVQYXRoICwgcm9vdC5zbGljZSAwLCByb290Lmxlbmd0aC0yXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBbU2xhc2gucGF0aChwKSwgJyddXG4gICAgICAgIFxuICAgIEByZW1vdmVEcml2ZTogKHApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gU2xhc2guc3BsaXREcml2ZShwKVswXVxuICBcbiAgICBAaXNSb290OiAocCkgLT4gU2xhc2gucmVtb3ZlRHJpdmUocCkgPT0gJy8nXG4gICAgICAgIFxuICAgIEBzcGxpdEZpbGVMaW5lOiAocCkgLT4gICMgZmlsZS50eHQ6MTowIC0tPiBbJ2ZpbGUudHh0JywgMSwgMF1cbiAgICAgICAgXG4gICAgICAgIFtmLGRdID0gU2xhc2guc3BsaXREcml2ZSBwXG4gICAgICAgIHNwbGl0ID0gU3RyaW5nKGYpLnNwbGl0ICc6J1xuICAgICAgICBsaW5lID0gcGFyc2VJbnQgc3BsaXRbMV0gaWYgc3BsaXQubGVuZ3RoID4gMVxuICAgICAgICBjbG1uID0gcGFyc2VJbnQgc3BsaXRbMl0gaWYgc3BsaXQubGVuZ3RoID4gMlxuICAgICAgICBsID0gYyA9IDBcbiAgICAgICAgbCA9IGxpbmUgaWYgTnVtYmVyLmlzSW50ZWdlciBsaW5lXG4gICAgICAgIGMgPSBjbG1uIGlmIE51bWJlci5pc0ludGVnZXIgY2xtblxuICAgICAgICBkID0gZCArICc6JyBpZiBkICE9ICcnXG4gICAgICAgIFsgZCArIHNwbGl0WzBdLCBNYXRoLm1heChsLDEpLCAgTWF0aC5tYXgoYywwKSBdXG4gICAgICAgIFxuICAgIEBzcGxpdEZpbGVQb3M6IChwKSAtPiAjIGZpbGUudHh0OjE6MyAtLT4gWydmaWxlLnR4dCcsIFszLCAwXV1cbiAgICBcbiAgICAgICAgW2YsbCxjXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBbZiwgW2MsIGwtMV1dXG4gICAgICAgIFxuICAgIEByZW1vdmVMaW5lUG9zOiAocCkgLT4gU2xhc2guc3BsaXRGaWxlTGluZShwKVswXVxuICAgIEByZW1vdmVDb2x1bW46ICAocCkgLT4gXG4gICAgICAgIFtmLGxdID0gU2xhc2guc3BsaXRGaWxlTGluZSBwXG4gICAgICAgIGlmIGw+MSB0aGVuIGYgKyAnOicgKyBsXG4gICAgICAgIGVsc2UgZlxuICAgICAgICBcbiAgICBAZXh0OiAgICAgICAocCkgLT4gcGF0aC5leHRuYW1lKHApLnNsaWNlIDFcbiAgICBAc3BsaXRFeHQ6ICAocCkgLT4gW1NsYXNoLnJlbW92ZUV4dChwKSwgU2xhc2guZXh0KHApXVxuICAgIEByZW1vdmVFeHQ6IChwKSAtPiBTbGFzaC5qb2luIFNsYXNoLmRpcihwKSwgU2xhc2guYmFzZSBwXG4gICAgQHN3YXBFeHQ6ICAgKHAsIGV4dCkgLT4gU2xhc2gucmVtb3ZlRXh0KHApICsgKGV4dC5zdGFydHNXaXRoKCcuJykgYW5kIGV4dCBvciBcIi4je2V4dH1cIilcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAam9pbjogLT4gW10ubWFwLmNhbGwoYXJndW1lbnRzLCBTbGFzaC5wYXRoKS5qb2luICcvJ1xuICAgIFxuICAgIEBqb2luRmlsZVBvczogKGZpbGUsIHBvcykgLT4gIyBbJ2ZpbGUudHh0JywgWzMsIDBdXSAtLT4gZmlsZS50eHQ6MTozXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgcG9zPyBvciBub3QgcG9zWzBdP1xuICAgICAgICAgICAgZmlsZVxuICAgICAgICBlbHNlIGlmIHBvc1swXVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9OiN7cG9zWzBdfVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgQGpvaW5GaWxlTGluZTogKGZpbGUsIGxpbmUsIGNvbCkgLT4gIyAnZmlsZS50eHQnLCAxLCAyIC0tPiBmaWxlLnR4dDoxOjJcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmaWxlIGlmIG5vdCBsaW5lP1xuICAgICAgICByZXR1cm4gXCIje2ZpbGV9OiN7bGluZX1cIiBpZiBub3QgY29sP1xuICAgICAgICBcIiN7ZmlsZX06I3tsaW5lfToje2NvbH1cIlxuICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBwYXRobGlzdDogKHApIC0+ICMgJy9yb290L2Rpci9maWxlLnR4dCcgLS0+IFsnLycsICcvcm9vdCcsICcvcm9vdC9kaXInLCAnL3Jvb3QvZGlyL2ZpbGUudHh0J11cbiAgICBcbiAgICAgICAgcmV0dXJuIFtdIGlmIG5vdCBwLmxlbmd0aFxuICAgICAgICBwID0gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZSBwXG4gICAgICAgIGxpc3QgPSBbcF1cbiAgICAgICAgd2hpbGUgU2xhc2guZGlyKHApICE9ICcnXG4gICAgICAgICAgICBsaXN0LnVuc2hpZnQgU2xhc2guZGlyKHApXG4gICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbGlzdFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAYmFzZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGZpbGU6ICAgICAgIChwKSAgIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZXh0bmFtZTogICAgKHApICAgLT4gcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGJhc2VuYW1lOiAgIChwLGUpIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocCksIGVcbiAgICBAaXNBYnNvbHV0ZTogKHApICAgLT4gcGF0aC5pc0Fic29sdXRlIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGRpcm5hbWU6ICAgIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5kaXJuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQG5vcm1hbGl6ZTogIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5ub3JtYWxpemUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZGlyOiAgICAgICAgKHApICAgLT4gXG4gICAgICAgIHAgPSBTbGFzaC5zYW5pdGl6ZSBwXG4gICAgICAgIGlmIFNsYXNoLmlzUm9vdCBwIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBwYXRoLmRpcm5hbWUgcFxuICAgICAgICBpZiBwID09ICcuJyB0aGVuIHJldHVybiAnJ1xuICAgICAgICBTbGFzaC5wYXRoIHBcbiAgICAgICAgXG4gICAgQHNhbml0aXplOiAocCkgICAtPiBcbiAgICAgICAgaWYgbm90IHAubGVuZ3RoXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgJ2VtcHR5IHBhdGghJ1xuICAgICAgICBpZiBwWzBdID09ICdcXG4nXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcImxlYWRpbmcgbmV3bGluZSBpbiBwYXRoISAnI3twfSdcIlxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnNhbml0aXplIHAuc3Vic3RyIDFcbiAgICAgICAgaWYgcC5lbmRzV2l0aCAnXFxuJ1xuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJ0cmFpbGluZyBuZXdsaW5lIGluIHBhdGghICcje3B9J1wiXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guc2FuaXRpemUgcC5zdWJzdHIgMCwgcC5sZW5ndGgtMVxuICAgICAgICBwXG4gICAgXG4gICAgQHBhcnNlOiAgICAgIChwKSAgIC0+IFxuICAgICAgICBcbiAgICAgICAgZGljdCA9IHBhdGgucGFyc2UgcFxuICAgICAgICBcbiAgICAgICAgaWYgZGljdC5kaXIubGVuZ3RoID09IDIgYW5kIGRpY3QuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5kaXIgKz0gJy8nXG4gICAgICAgIGlmIGRpY3Qucm9vdC5sZW5ndGggPT0gMiBhbmQgZGljdC5yb290WzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5yb290ICs9ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgIGRpY3RcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBob21lOiAgICAgICAgICAtPiBTbGFzaC5wYXRoIG9zLmhvbWVkaXIoKVxuICAgIEB0aWxkZTogICAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIFNsYXNoLmhvbWUoKSwgJ34nXG4gICAgQHVudGlsZGU6ICAgKHApIC0+IFNsYXNoLnBhdGgocCk/LnJlcGxhY2UgL15cXH4vLCBTbGFzaC5ob21lKClcbiAgICBAdW5lbnY6ICAgICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpID0gcC5pbmRleE9mICckJywgMFxuICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgIGZvciBrLHYgb2YgcHJvY2Vzcy5lbnZcbiAgICAgICAgICAgICAgICBpZiBrID09IHAuc2xpY2UgaSsxLCBpKzEray5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcCA9IHAuc2xpY2UoMCwgaSkgKyB2ICsgcC5zbGljZShpK2subGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpID0gcC5pbmRleE9mICckJywgaSsxXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgIFxuICAgIEByZXNvbHZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlc29sdmUgU2xhc2gudW5lbnYgU2xhc2gudW50aWxkZSBwXG4gICAgXG4gICAgQHJlbGF0aXZlOiAocmVsLCB0bykgLT5cbiAgICAgICAgXG4gICAgICAgIHRvID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgdG8/Lmxlbmd0aFxuICAgICAgICByZWwgPSBTbGFzaC5yZXNvbHZlIHJlbFxuICAgICAgICByZXR1cm4gcmVsIGlmIG5vdCBTbGFzaC5pc0Fic29sdXRlIHJlbFxuICAgICAgICBpZiBTbGFzaC5yZXNvbHZlKHRvKSA9PSByZWxcbiAgICAgICAgICAgIHJldHVybiAnLidcbiAgICAgICAgICAgIFxuICAgICAgICBTbGFzaC5wYXRoIHBhdGgucmVsYXRpdmUgU2xhc2gucmVzb2x2ZSh0byksIHJlbFxuICAgICAgICBcbiAgICBAZmlsZVVybDogKHApIC0+IFwiZmlsZTovLy8je1NsYXNoLmVuY29kZSBwfVwiXG5cbiAgICBAc2FtZVBhdGg6IChhLCBiKSAtPiBTbGFzaC5yZXNvbHZlKGEpID09IFNsYXNoLnJlc29sdmUoYilcblxuICAgIEBlc2NhcGU6IChwKSAtPiBwLnJlcGxhY2UgLyhbXFxgXFxcIl0pL2csICdcXFxcJDEnXG5cbiAgICBAZW5jb2RlOiAocCkgLT5cbiAgICAgICAgcCA9IGVuY29kZVVSSSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcIy9nLCBcIiUyM1wiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJi9nLCBcIiUyNlwiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJy9nLCBcIiUyN1wiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAgIDAwMCAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBrZzogKHApIC0+XG4gICAgXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyAgU2xhc2guam9pbiBwLCAnLmdpdCcgICAgICAgICB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2Uubm9vbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLmpzb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG5cbiAgICBAZ2l0OiAocCkgLT5cblxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHAubGVuZ3RoIGFuZCBTbGFzaC5yZW1vdmVEcml2ZShwKSBub3QgaW4gWycuJywgJy8nLCAnJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5kaXJFeGlzdHMgU2xhc2guam9pbiBwLCAnLmdpdCcgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBleGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBpZiBub3QgcD9cbiAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICBmcy5hY2Nlc3MgcCwgZnMuUl9PSyB8IGZzLkZfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZnMuc3RhdCBwLCAoZXJyLCBzdGF0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBzdGF0XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgcD9cbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICBpZiBzdGF0ID0gZnMuc3RhdFN5bmMocClcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIHAsIGZzLlJfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGlmIGVyci5jb2RlIGluIFsnRU5PRU5UJywgJ0VOT1RESVInXVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgIG51bGwgICAgIFxuICAgICAgICBcbiAgICBAdG91Y2g6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgZnMubWtkaXJTeW5jIFNsYXNoLmRpcm5hbWUocCksIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIGlmIG5vdCBTbGFzaC5maWxlRXhpc3RzIHBcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgcCwgJydcbiAgICAgICAgXG4gICAgQGZpbGVFeGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNGaWxlKCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNGaWxlKClcblxuICAgIEBkaXJFeGlzdHM6IChwLCBjYikgLT5cblxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRGlyZWN0b3J5KCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgXG4gICAgQGlzRGlyOiAgKHAsIGNiKSAtPiBTbGFzaC5kaXJFeGlzdHMgcCwgY2JcbiAgICBAaXNGaWxlOiAocCwgY2IpIC0+IFNsYXNoLmZpbGVFeGlzdHMgcCwgY2JcbiAgICBcbiAgICBAaXNXcml0YWJsZTogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIGZzLmFjY2VzcyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICBjYiBub3QgZXJyP1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIFNsYXNoLnJlc29sdmUocCksIGZzLlJfT0sgfCBmcy5XX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAdXNlckRhdGE6IC0+XG4gICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgICAgIGlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZWN0cm9uLnJlbW90ZS5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZWN0cm9uLmFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpZiBwa2dEaXIgPSBTbGFzaC5wa2cgX19kaXJuYW1lXG4gICAgICAgICAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBwa2dEaXIsICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICAgICAgICAgIHsgc2RzIH0gPSByZXF1aXJlICcuL2t4aydcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHNkcy5maW5kLnZhbHVlIHBrZywgJ25hbWUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIFwifi9BcHBEYXRhL1JvYW1pbmcvI3tuYW1lfVwiXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnJlc29sdmUgXCJ+L0FwcERhdGEvUm9hbWluZy9cIlxuXG4gICAgIyMjXG4gICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgXG4gICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuICAgICMjI1xuICAgIFxuICAgIEBpc1RleHQ6IChmKSAtPlxuICAgIFxuICAgICAgICBpZiBub3QgdGV4dGV4dFxuICAgICAgICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICAgICAgIHRleHRleHQgPSBfLnJlZHVjZSByZXF1aXJlKCd0ZXh0ZXh0ZW5zaW9ucycpLCAobWFwLCBleHQpIC0+XG4gICAgICAgICAgICAgICAgbWFwW1wiLiN7ZXh0fVwiXSA9IHRydWVcbiAgICAgICAgICAgICAgICBtYXBcbiAgICAgICAgICAgICwge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGV4dGV4dFsnLmNyeXB0J10gID0gdHJ1ZVxuICAgICAgICAgICAgdGV4dGV4dFsnLmJhc2hyYyddID0gdHJ1ZVxuICAgICAgICAgICAgdGV4dGV4dFsnLnN2ZyddICAgID0gdHJ1ZVxuICAgICAgICAgICAgdGV4dGV4dFsnLmNzdiddICAgID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgU2xhc2guZXh0bmFtZShmKSBhbmQgdGV4dGV4dFtTbGFzaC5leHRuYW1lIGZdPyBcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgdGV4dGJhc2VbU2xhc2guYmFzZW5hbWUoZikudG9Mb3dlckNhc2UoKV1cbiAgICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBTbGFzaC5pc0ZpbGUgZlxuICAgICAgICBpc0JpbmFyeSA9IHJlcXVpcmUgJ2lzYmluYXJ5ZmlsZSdcbiAgICAgICAgcmV0dXJuIG5vdCBpc0JpbmFyeS5pc0JpbmFyeUZpbGVTeW5jIGZcbiAgICAgICAgXG4gICAgQHJlYWRUZXh0OiAoZiwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgZnMucmVhZEZpbGUgZiwgJ3V0ZjgnLCAoZXJyLCB0ZXh0KSAtPiBcbiAgICAgICAgICAgICAgICBjYiBub3QgZXJyPyBhbmQgdGV4dCBvciAnJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMgZiwgJ3V0ZjgnXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAnJ1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTbGFzaFxuIl19
//# sourceURL=../coffee/slash.coffee