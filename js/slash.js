(function() {
  /*
   0000000  000       0000000    0000000  000   000    
  000       000      000   000  000       000   000    
  0000000   000      000000000  0000000   000000000    
       000  000      000   000       000  000   000    
  0000000   0000000  000   000  0000000   000   000    
  */
  var Slash, _, empty, error, fs, log, os, path;

  ({fs, os, empty, log, error, _} = require('./kxk'));

  path = require('path');

  Slash = (function() {
    class Slash {
      static win() {
        return path.sep === '\\';
      }

      
      // 00000000    0000000   000000000  000   000  
      // 000   000  000   000     000     000   000  
      // 00000000   000000000     000     000000000  
      // 000        000   000     000     000   000  
      // 000        000   000     000     000   000  
      static path(p) {
        if ((p == null) || p.length === 0) {
          return error(`Slash.path -- no path? ${p}`);
        }
        p = path.normalize(p);
        p = p.replace(Slash.reg, '/');
        return p;
      }

      static unslash(p) {
        if ((p == null) || p.length === 0) {
          return error(`Slash.unslash -- no path? ${p}`);
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
      }

      
      //  0000000  00000000   000      000  000000000  
      // 000       000   000  000      000     000     
      // 0000000   00000000   000      000     000     
      //      000  000        000      000     000     
      // 0000000   000        0000000  000     000     
      static split(p) {
        return Slash.path(p).split('/').filter(function(e) {
          return e.length;
        });
      }

      static splitDrive(p) {
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
      }

      static removeDrive(p) {
        return Slash.splitDrive(p)[0];
      }

      static isRoot(p) {
        return this.removeDrive(p) === '/';
      }

      static splitFileLine(p) { // file.txt:1:0 --> ['file.txt', 1, 0]
        var c, clmn, d, f, l, line, split;
        [f, d] = Slash.splitDrive(p);
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
      }

      static splitFilePos(p) { // file.txt:1:3 --> ['file.txt', [3, 0]]
        var c, f, l;
        [f, l, c] = Slash.splitFileLine(p);
        return [f, [c, l - 1]];
      }

      static removeLinePos(p) {
        return Slash.splitFileLine(p)[0];
      }

      static removeColumn(p) {
        var f, l;
        [f, l] = Slash.splitFileLine(p);
        if (l > 1) {
          return f + ':' + l;
        } else {
          return f;
        }
      }

      static ext(p) {
        return path.extname(p).slice(1);
      }

      static splitExt(p) {
        return [Slash.removeExt(p), Slash.ext(p)];
      }

      static removeExt(p) {
        return Slash.join(Slash.dir(p), Slash.base(p));
      }

      static swapExt(p, ext) {
        return Slash.removeExt(p) + (ext.startsWith('.') && ext || `.${ext}`);
      }

      
      //       000   0000000   000  000   000  
      //       000  000   000  000  0000  000  
      //       000  000   000  000  000 0 000  
      // 000   000  000   000  000  000  0000  
      //  0000000    0000000   000  000   000  
      static join() {
        return [].map.call(arguments, Slash.path).join('/');
      }

      static joinFilePos(file, pos) { // ['file.txt', [3, 0]] --> file.txt:1:3
        if ((pos == null) || !pos[0] && !pos[1]) {
          return file;
        } else if (pos[0]) {
          return file + `:${pos[1] + 1}:${pos[0]}`;
        } else {
          return file + `:${pos[1] + 1}`;
        }
      }

      static joinFileLine(file, line, col) { // 'file.txt', 1, 2 --> file.txt:1:2
        if (line == null) {
          return file;
        }
        if (col == null) {
          return `${file}:${line}`;
        }
        return `${file}:${line}:${col}`;
      }

      
      // 000   000   0000000   00     00  00000000  
      // 0000  000  000   000  000   000  000       
      // 000 0 000  000000000  000000000  0000000   
      // 000  0000  000   000  000 0 000  000       
      // 000   000  000   000  000   000  00000000  
      static base(p) {
        return path.basename(p, path.extname(p));
      }

      static file(p) {
        return path.basename(p);
      }

      static extname(p) {
        return path.extname(p);
      }

      static basename(p, e) {
        return path.basename(p, e);
      }

      static isAbsolute(p) {
        return path.isAbsolute(p);
      }

      static isRelative(p) {
        return !Slash.isAbsolute(p);
      }

      static dirname(p) {
        return Slash.path(path.dirname(p));
      }

      static dir(p) {
        return Slash.path(path.dirname(p));
      }

      static normalize(p) {
        return Slash.path(path.normalize(p));
      }

      static parse(p) {
        var dict;
        dict = path.parse(p);
        if (dict.dir.length === 2 && dict.dir[1] === ':') {
          dict.dir += '/';
        }
        if (dict.root.length === 2 && dict.root[1] === ':') {
          dict.root += '/';
        }
        return dict;
      }

      
      // 00     00  000   0000000   0000000    
      // 000   000  000  000       000         
      // 000000000  000  0000000   000         
      // 000 0 000  000       000  000         
      // 000   000  000  0000000    0000000    
      static home() {
        return Slash.path(os.homedir());
      }

      static tilde(p) {
        var ref;
        return (ref = Slash.path(p)) != null ? ref.replace(Slash.home(), '~') : void 0;
      }

      static untilde(p) {
        var ref;
        return (ref = Slash.path(p)) != null ? ref.replace(/^\~/, Slash.home()) : void 0;
      }

      static unenv(p) {
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
      }

      static resolve(p) {
        if (empty(p)) {
          return error(`Slash.resolve -- no path? ${p}`);
        }
        return Slash.path(path.resolve(Slash.unenv(Slash.untilde(p))));
      }

      static relative(rel, to) {
        if (empty(to)) {
          error("Slash.relative -- to nothing?", rel, to);
          return rel;
        }
        rel = Slash.resolve(rel);
        if (!Slash.isAbsolute(rel)) {
          return rel;
        }
        if (Slash.resolve(to) === rel) {
          return '.';
        }
        return Slash.path(path.relative(Slash.resolve(to), rel));
      }

      static fileUrl(p) {
        return `file://${Slash.encode(Slash.resolve(p))}`;
      }

      static samePath(a, b) {
        return Slash.resolve(a) === Slash.resolve(b);
      }

      static escape(p) {
        return p.replace(/([\`"])/g, '\\$1');
      }

      static encode(p) {
        p = encodeURI(p);
        p = p.replace(/\#/g, "%23");
        p = p.replace(/\&/g, "%26");
        return p = p.replace(/\'/g, "%27");
      }

      static pkg(p) {
        var ref;
        if ((p != null ? p.length : void 0) != null) {
          while (p.length && ((ref = this.removeDrive(p)) !== '.' && ref !== '/' && ref !== '')) {
            if (Slash.dirExists(Slash.join(p, '.git'))) {
              return Slash.resolve(p);
            }
            if (Slash.fileExists(Slash.join(p, 'package.noon'))) {
              return Slash.resolve(p);
            }
            if (Slash.fileExists(Slash.join(p, 'package.json'))) {
              return Slash.resolve(p);
            }
            p = Slash.dirname(p);
          }
        }
        return null;
      }

      static exists(p) {
        var stat;
        if (p == null) {
          return false;
        }
        try {
          p = Slash.resolve(p);
          if (stat = fs.statSync(p)) {
            fs.accessSync(p, fs.R_OK);
            return stat;
          }
        } catch (error1) {
          return null;
        }
        return null;
      }

      static isWritable(p) {
        try {
          fs.accessSync(Slash.resolve(p), fs.R_OK | fs.W_OK);
          return true;
        } catch (error1) {
          return false;
        }
      }

      static fileExists(p) {
        var stat;
        if (stat = Slash.exists(p)) {
          if (stat.isFile()) {
            return stat;
          }
        }
      }

      static dirExists(p) {
        var stat;
        if (stat = Slash.exists(p)) {
          if (stat.isDirectory()) {
            return stat;
          }
        }
      }

      static isDir(p) {
        return this.dirExists(p);
      }

      static isFile(p) {
        return this.fileExists(p);
      }

    };

    Slash.reg = new RegExp("\\\\", 'g');

    return Slash;

  }).call(this);

  module.exports = Slash;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhc2guanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9zbGFzaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxFQUFGLEVBQU0sRUFBTixFQUFVLEtBQVYsRUFBaUIsR0FBakIsRUFBc0IsS0FBdEIsRUFBNkIsQ0FBN0IsQ0FBQSxHQUFtQyxPQUFBLENBQVEsT0FBUixDQUFuQzs7RUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRUQ7SUFBTixNQUFBLE1BQUE7TUFJVSxPQUFMLEdBQUssQ0FBQSxDQUFBO2VBQUcsSUFBSSxDQUFDLEdBQUwsS0FBWTtNQUFmLENBRk47Ozs7Ozs7O01BVU8sT0FBTixJQUFNLENBQUMsQ0FBRCxDQUFBO1FBQ0gsSUFBa0QsV0FBSixJQUFVLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBcEU7QUFBQSxpQkFBTyxLQUFBLENBQU0sQ0FBQSx1QkFBQSxDQUFBLENBQTBCLENBQTFCLENBQUEsQ0FBTixFQUFQOztRQUNBLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7UUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7ZUFDSjtNQUpHOztNQU1HLE9BQVQsT0FBUyxDQUFDLENBQUQsQ0FBQTtRQUNOLElBQXFELFdBQUosSUFBVSxDQUFDLENBQUMsTUFBRixLQUFZLENBQXZFO0FBQUEsaUJBQU8sS0FBQSxDQUFNLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixDQUE3QixDQUFBLENBQU4sRUFBUDs7UUFDQSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYO1FBQ0osSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7VUFDSSxJQUFHLENBQUMsQ0FBQyxNQUFGLElBQVksQ0FBWixJQUFrQixDQUFBLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUFSLElBQVEsR0FBUixLQUFlLENBQUUsQ0FBQSxDQUFBLENBQWpCLENBQXJCO1lBQ0ksQ0FBQSxHQUFJLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxHQUFQLEdBQWEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBRHJCOztVQUVBLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7VUFDSixJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUFYO1lBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBTCxDQUFBLENBQWYsRUFEUjtXQUpKOztlQU1BO01BVE0sQ0FoQlY7Ozs7Ozs7O01BaUNRLE9BQVAsS0FBTyxDQUFDLENBQUQsQ0FBQTtlQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFhLENBQUMsS0FBZCxDQUFvQixHQUFwQixDQUF3QixDQUFDLE1BQXpCLENBQWdDLFFBQUEsQ0FBQyxDQUFELENBQUE7aUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBaEM7TUFBUDs7TUFFSyxPQUFaLFVBQVksQ0FBQyxDQUFELENBQUE7QUFFVCxZQUFBLFFBQUEsRUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFIO1VBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksQ0FBWixDQUFjLENBQUM7VUFFdEIsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1lBQ0ksSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLElBQUksQ0FBQyxNQUFuQjtjQUNJLFFBQUEsR0FBVyxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBSSxDQUFDLE1BQUwsR0FBWSxDQUFwQixDQUFYLEVBRGY7YUFBQSxNQUFBO2NBR0ksUUFBQSxHQUFXLElBSGY7O0FBSUEsbUJBQU8sQ0FBQyxRQUFELEVBQVksSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsSUFBSSxDQUFDLE1BQUwsR0FBWSxDQUExQixDQUFaLEVBTFg7V0FISjs7ZUFVQSxDQUFDLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFELEVBQWdCLEVBQWhCO01BWlM7O01BY0MsT0FBYixXQUFhLENBQUMsQ0FBRCxDQUFBO0FBRVYsZUFBTyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixDQUFvQixDQUFBLENBQUE7TUFGakI7O01BSUwsT0FBUixNQUFRLENBQUMsQ0FBRCxDQUFBO2VBQU8sSUFBQyxDQUFBLFdBQUQsQ0FBYSxDQUFiLENBQUEsS0FBbUI7TUFBMUI7O01BRU8sT0FBZixhQUFlLENBQUMsQ0FBRCxDQUFBLEVBQUE7QUFFWixZQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBO1FBQUEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FBakI7UUFDUixLQUFBLEdBQVEsTUFBQSxDQUFPLENBQVAsQ0FBUyxDQUFDLEtBQVYsQ0FBZ0IsR0FBaEI7UUFDUixJQUE0QixLQUFLLENBQUMsTUFBTixHQUFlLENBQTNDO1VBQUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLEVBQVA7O1FBQ0EsSUFBNEIsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUEzQztVQUFBLElBQUEsR0FBTyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZixFQUFQOztRQUNBLENBQUEsR0FBSSxDQUFBLEdBQUk7UUFDUixJQUFZLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQVo7VUFBQSxDQUFBLEdBQUksS0FBSjs7UUFDQSxJQUFZLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQVo7VUFBQSxDQUFBLEdBQUksS0FBSjs7UUFDQSxJQUFlLENBQUEsS0FBSyxFQUFwQjtVQUFBLENBQUEsR0FBSSxDQUFBLEdBQUksSUFBUjs7ZUFDQSxDQUFFLENBQUEsR0FBSSxLQUFNLENBQUEsQ0FBQSxDQUFaLEVBQWdCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFXLENBQVgsQ0FBaEIsRUFBZ0MsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVcsQ0FBWCxDQUFoQztNQVZZOztNQVlELE9BQWQsWUFBYyxDQUFDLENBQUQsQ0FBQSxFQUFBO0FBRVgsWUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO1FBQUEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsQ0FBQSxHQUFVLEtBQUssQ0FBQyxhQUFOLENBQW9CLENBQXBCO2VBQ1YsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFELEVBQUksQ0FBQSxHQUFFLENBQU4sQ0FBSjtNQUhXOztNQUtDLE9BQWYsYUFBZSxDQUFDLENBQUQsQ0FBQTtlQUFPLEtBQUssQ0FBQyxhQUFOLENBQW9CLENBQXBCLENBQXVCLENBQUEsQ0FBQTtNQUE5Qjs7TUFDQSxPQUFmLFlBQWUsQ0FBQyxDQUFELENBQUE7QUFDWixZQUFBLENBQUEsRUFBQTtRQUFBLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBQSxHQUFRLEtBQUssQ0FBQyxhQUFOLENBQW9CLENBQXBCO1FBQ1IsSUFBRyxDQUFBLEdBQUUsQ0FBTDtpQkFBWSxDQUFBLEdBQUksR0FBSixHQUFVLEVBQXRCO1NBQUEsTUFBQTtpQkFDSyxFQURMOztNQUZZOztNQUtKLE9BQVgsR0FBVyxDQUFDLENBQUQsQ0FBQTtlQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixDQUFlLENBQUMsS0FBaEIsQ0FBc0IsQ0FBdEI7TUFBUDs7TUFDQSxPQUFYLFFBQVcsQ0FBQyxDQUFELENBQUE7ZUFBTyxDQUFDLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQUQsRUFBcUIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQXJCO01BQVA7O01BQ0EsT0FBWCxTQUFXLENBQUMsQ0FBRCxDQUFBO2VBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBWCxFQUF5QixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBekI7TUFBUDs7TUFDQSxPQUFYLE9BQVcsQ0FBQyxDQUFELEVBQUksR0FBSixDQUFBO2VBQVksS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEdBQUcsQ0FBQyxVQUFKLENBQWUsR0FBZixDQUFBLElBQXdCLEdBQXhCLElBQStCLENBQUEsQ0FBQSxDQUFBLENBQUksR0FBSixDQUFBLENBQWhDO01BQWpDLENBakZaOzs7Ozs7OztNQXlGTyxPQUFOLElBQU0sQ0FBQSxDQUFBO2VBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQVksU0FBWixFQUF1QixLQUFLLENBQUMsSUFBN0IsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxHQUF4QztNQUFIOztNQUVPLE9BQWIsV0FBYSxDQUFDLElBQUQsRUFBTyxHQUFQLENBQUEsRUFBQTtRQUNWLElBQU8sYUFBSixJQUFZLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixJQUFlLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBdEM7aUJBQ0ksS0FESjtTQUFBLE1BRUssSUFBRyxHQUFJLENBQUEsQ0FBQSxDQUFQO2lCQUNELElBQUEsR0FBTyxDQUFBLENBQUEsQ0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQUosR0FBTyxDQUFYLENBQWEsQ0FBYixDQUFBLENBQWdCLEdBQUksQ0FBQSxDQUFBLENBQXBCLENBQUEsRUFETjtTQUFBLE1BQUE7aUJBR0QsSUFBQSxHQUFPLENBQUEsQ0FBQSxDQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFPLENBQVgsQ0FBQSxFQUhOOztNQUhLOztNQVFDLE9BQWQsWUFBYyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsR0FBYixDQUFBLEVBQUE7UUFDWCxJQUFtQixZQUFuQjtBQUFBLGlCQUFPLEtBQVA7O1FBQ0EsSUFBZ0MsV0FBaEM7QUFBQSxpQkFBTyxDQUFBLENBQUEsQ0FBRyxJQUFILENBQVEsQ0FBUixDQUFBLENBQVcsSUFBWCxDQUFBLEVBQVA7O2VBQ0EsQ0FBQSxDQUFBLENBQUcsSUFBSCxDQUFRLENBQVIsQ0FBQSxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEIsQ0FBQSxDQUFtQixHQUFuQixDQUFBO01BSFcsQ0FuR2Y7Ozs7Ozs7O01BOEdhLE9BQVosSUFBWSxDQUFDLENBQUQsQ0FBQTtlQUFTLElBQUksQ0FBQyxRQUFMLENBQWMsQ0FBZCxFQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBakI7TUFBVDs7TUFDQSxPQUFaLElBQVksQ0FBQyxDQUFELENBQUE7ZUFBUyxJQUFJLENBQUMsUUFBTCxDQUFjLENBQWQ7TUFBVDs7TUFDQSxPQUFaLE9BQVksQ0FBQyxDQUFELENBQUE7ZUFBUyxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWI7TUFBVDs7TUFDQSxPQUFaLFFBQVksQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFBO2VBQVMsSUFBSSxDQUFDLFFBQUwsQ0FBYyxDQUFkLEVBQWlCLENBQWpCO01BQVQ7O01BQ0EsT0FBWixVQUFZLENBQUMsQ0FBRCxDQUFBO2VBQVMsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsQ0FBaEI7TUFBVDs7TUFDQSxPQUFaLFVBQVksQ0FBQyxDQUFELENBQUE7ZUFBUyxDQUFJLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQWpCO01BQWI7O01BQ0EsT0FBWixPQUFZLENBQUMsQ0FBRCxDQUFBO2VBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBWDtNQUFUOztNQUNBLE9BQVosR0FBWSxDQUFDLENBQUQsQ0FBQTtlQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLENBQVg7TUFBVDs7TUFDQSxPQUFaLFNBQVksQ0FBQyxDQUFELENBQUE7ZUFBUyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZixDQUFYO01BQVQ7O01BRUEsT0FBWixLQUFZLENBQUMsQ0FBRCxDQUFBO0FBRVQsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVg7UUFFUCxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBVCxLQUFtQixDQUFuQixJQUF5QixJQUFJLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBVCxLQUFlLEdBQTNDO1VBQ0ksSUFBSSxDQUFDLEdBQUwsSUFBWSxJQURoQjs7UUFFQSxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBVixLQUFvQixDQUFwQixJQUEwQixJQUFJLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBVixLQUFnQixHQUE3QztVQUNJLElBQUksQ0FBQyxJQUFMLElBQWEsSUFEakI7O2VBR0E7TUFUUyxDQXhIYjs7Ozs7Ozs7TUF5SWdCLE9BQWYsSUFBZSxDQUFBLENBQUE7ZUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBWDtNQUFIOztNQUNKLE9BQVgsS0FBVyxDQUFDLENBQUQsQ0FBQTtBQUFPLFlBQUE7a0RBQWEsQ0FBRSxPQUFmLENBQXVCLEtBQUssQ0FBQyxJQUFOLENBQUEsQ0FBdkIsRUFBcUMsR0FBckM7TUFBUDs7TUFDQSxPQUFYLE9BQVcsQ0FBQyxDQUFELENBQUE7QUFBTyxZQUFBO2tEQUFhLENBQUUsT0FBZixDQUF1QixLQUF2QixFQUE4QixLQUFLLENBQUMsSUFBTixDQUFBLENBQTlCO01BQVA7O01BQ0EsT0FBWCxLQUFXLENBQUMsQ0FBRCxDQUFBO0FBRVIsWUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQTtRQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsRUFBZSxDQUFmO0FBQ0osZUFBTSxDQUFBLElBQUssQ0FBWDtBQUNJO1VBQUEsS0FBQSxRQUFBOztZQUNJLElBQUcsQ0FBQSxLQUFLLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQSxHQUFFLENBQVYsRUFBYSxDQUFBLEdBQUUsQ0FBRixHQUFJLENBQUMsQ0FBQyxNQUFuQixDQUFSO2NBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQUFXLENBQVgsQ0FBQSxHQUFnQixDQUFoQixHQUFvQixDQUFDLENBQUMsS0FBRixDQUFRLENBQUEsR0FBRSxDQUFDLENBQUMsTUFBSixHQUFXLENBQW5CO0FBQ3hCLG9CQUZKOztVQURKO1VBSUEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixFQUFlLENBQUEsR0FBRSxDQUFqQjtRQUxSO2VBTUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYO01BVFE7O01BV0YsT0FBVCxPQUFTLENBQUMsQ0FBRCxDQUFBO1FBQ04sSUFBaUQsS0FBQSxDQUFNLENBQU4sQ0FBakQ7QUFBQSxpQkFBTyxLQUFBLENBQU0sQ0FBQSwwQkFBQSxDQUFBLENBQTZCLENBQTdCLENBQUEsQ0FBTixFQUFQOztlQUNBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFLLENBQUMsS0FBTixDQUFZLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFaLENBQWIsQ0FBWDtNQUZNOztNQUlDLE9BQVYsUUFBVSxDQUFDLEdBQUQsRUFBTSxFQUFOLENBQUE7UUFFUCxJQUFHLEtBQUEsQ0FBTSxFQUFOLENBQUg7VUFDSSxLQUFBLENBQU0sK0JBQU4sRUFBdUMsR0FBdkMsRUFBNEMsRUFBNUM7QUFDQSxpQkFBTyxJQUZYOztRQUlBLEdBQUEsR0FBTSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQ7UUFDTixJQUFjLENBQUksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsR0FBakIsQ0FBbEI7QUFBQSxpQkFBTyxJQUFQOztRQUNBLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxFQUFkLENBQUEsS0FBcUIsR0FBeEI7QUFDSSxpQkFBTyxJQURYOztlQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsQ0FBZCxFQUFpQyxHQUFqQyxDQUFYO01BVk87O01BWUQsT0FBVCxPQUFTLENBQUMsQ0FBRCxDQUFBO2VBQU8sQ0FBQSxPQUFBLENBQUEsQ0FBVSxLQUFLLENBQUMsTUFBTixDQUFhLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFiLENBQVYsQ0FBQTtNQUFQOztNQUVDLE9BQVYsUUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7ZUFBVSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBQSxLQUFvQixLQUFLLENBQUMsT0FBTixDQUFjLENBQWQ7TUFBOUI7O01BRUYsT0FBUixNQUFRLENBQUMsQ0FBRCxDQUFBO2VBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxVQUFWLEVBQXNCLE1BQXRCO01BQVA7O01BRUEsT0FBUixNQUFRLENBQUMsQ0FBRCxDQUFBO1FBQ0wsQ0FBQSxHQUFJLFNBQUEsQ0FBVSxDQUFWO1FBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixFQUFpQixLQUFqQjtRQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsRUFBaUIsS0FBakI7ZUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLEVBQWlCLEtBQWpCO01BSkM7O01BTUgsT0FBTCxHQUFLLENBQUMsQ0FBRCxDQUFBO0FBRUYsWUFBQTtRQUFBLElBQUcsdUNBQUg7QUFFSSxpQkFBTSxDQUFDLENBQUMsTUFBRixJQUFhLFFBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxDQUFiLEVBQUEsS0FBd0IsR0FBeEIsSUFBQSxHQUFBLEtBQTZCLEdBQTdCLElBQUEsR0FBQSxLQUFrQyxFQUFsQyxDQUFuQjtZQUVJLElBQUcsS0FBSyxDQUFDLFNBQU4sQ0FBaUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWMsTUFBZCxDQUFqQixDQUFIO0FBQXNELHFCQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxFQUE3RDs7WUFDQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFjLGNBQWQsQ0FBakIsQ0FBSDtBQUFzRCxxQkFBTyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsRUFBN0Q7O1lBQ0EsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYyxjQUFkLENBQWpCLENBQUg7QUFBc0QscUJBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLEVBQTdEOztZQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQ7VUFMUixDQUZKOztlQVFBO01BVkU7O01BWUcsT0FBUixNQUFRLENBQUMsQ0FBRCxDQUFBO0FBRUwsWUFBQTtRQUFBLElBQW9CLFNBQXBCO0FBQUEsaUJBQU8sTUFBUDs7QUFDQTtVQUNJLENBQUEsR0FBSSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQ7VUFDSixJQUFHLElBQUEsR0FBTyxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVosQ0FBVjtZQUNJLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZCxFQUFpQixFQUFFLENBQUMsSUFBcEI7QUFDQSxtQkFBTyxLQUZYO1dBRko7U0FBQSxjQUFBO0FBTUksaUJBQU8sS0FOWDs7ZUFPQTtNQVZLOztNQVlJLE9BQVosVUFBWSxDQUFDLENBQUQsQ0FBQTtBQUVUO1VBQ0ksRUFBRSxDQUFDLFVBQUgsQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBZCxFQUFnQyxFQUFFLENBQUMsSUFBSCxHQUFVLEVBQUUsQ0FBQyxJQUE3QztBQUNBLGlCQUFPLEtBRlg7U0FBQSxjQUFBO0FBSUksaUJBQU8sTUFKWDs7TUFGUzs7TUFRQSxPQUFaLFVBQVksQ0FBQyxDQUFELENBQUE7QUFFVCxZQUFBO1FBQUEsSUFBRyxJQUFBLEdBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLENBQVY7VUFDSSxJQUFlLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBZjtBQUFBLG1CQUFPLEtBQVA7V0FESjs7TUFGUzs7TUFLRCxPQUFYLFNBQVcsQ0FBQyxDQUFELENBQUE7QUFFUixZQUFBO1FBQUEsSUFBRyxJQUFBLEdBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLENBQVY7VUFDSSxJQUFlLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBZjtBQUFBLG1CQUFPLEtBQVA7V0FESjs7TUFGUTs7TUFLSixPQUFQLEtBQU8sQ0FBQyxDQUFELENBQUE7ZUFBTyxJQUFDLENBQUEsU0FBRCxDQUFXLENBQVg7TUFBUDs7TUFDQyxPQUFSLE1BQVEsQ0FBQyxDQUFELENBQUE7ZUFBTyxJQUFDLENBQUEsVUFBRCxDQUFZLENBQVo7TUFBUDs7SUFoT2I7O0lBRUksS0FBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLE1BQUosQ0FBVyxNQUFYLEVBQW1CLEdBQW5COzs7Ozs7RUFnT1gsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE5T2pCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbjAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgXG4gICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiMjI1xuXG57IGZzLCBvcywgZW1wdHksIGxvZywgZXJyb3IsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuY2xhc3MgU2xhc2hcblxuICAgIEByZWcgPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcIiwgJ2cnXG5cbiAgICBAd2luOiAtPiBwYXRoLnNlcCA9PSAnXFxcXCdcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBwYXRoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIGVycm9yIFwiU2xhc2gucGF0aCAtLSBubyBwYXRoPyAje3B9XCIgaWYgbm90IHA/IG9yIHAubGVuZ3RoID09IDBcbiAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHBcbiAgICAgICAgcCA9IHAucmVwbGFjZSBTbGFzaC5yZWcsICcvJ1xuICAgICAgICBwXG5cbiAgICBAdW5zbGFzaDogKHApIC0+XG4gICAgICAgIHJldHVybiBlcnJvciBcIlNsYXNoLnVuc2xhc2ggLS0gbm8gcGF0aD8gI3twfVwiIGlmIG5vdCBwPyBvciBwLmxlbmd0aCA9PSAwXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIGlmIHAubGVuZ3RoID49IDMgYW5kIHBbMF0gPT0gJy8nID09IHBbMl0gXG4gICAgICAgICAgICAgICAgcCA9IHBbMV0gKyAnOicgKyBwLnNsaWNlIDJcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwXG4gICAgICAgICAgICBpZiBwWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHAgPSBwLnNwbGljZSAwLCAxLCBwWzBdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgcFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3BsaXQ6IChwKSAtPiBTbGFzaC5wYXRoKHApLnNwbGl0KCcvJykuZmlsdGVyIChlKSAtPiBlLmxlbmd0aFxuICAgIFxuICAgIEBzcGxpdERyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICByb290ID0gU2xhc2gucGFyc2UocCkucm9vdFxuXG4gICAgICAgICAgICBpZiByb290Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBpZiBwLmxlbmd0aCA+IHJvb3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gU2xhc2gucGF0aCBwLnNsaWNlKHJvb3QubGVuZ3RoLTEpXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGggPSAnLydcbiAgICAgICAgICAgICAgICByZXR1cm4gW2ZpbGVQYXRoICwgcm9vdC5zbGljZSAwLCByb290Lmxlbmd0aC0yXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBbU2xhc2gucGF0aChwKSwgJyddXG4gICAgICAgIFxuICAgIEByZW1vdmVEcml2ZTogKHApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gU2xhc2guc3BsaXREcml2ZShwKVswXVxuICBcbiAgICBAaXNSb290OiAocCkgLT4gQHJlbW92ZURyaXZlKHApID09ICcvJ1xuICAgICAgICBcbiAgICBAc3BsaXRGaWxlTGluZTogKHApIC0+ICAjIGZpbGUudHh0OjE6MCAtLT4gWydmaWxlLnR4dCcsIDEsIDBdXG4gICAgICAgIFxuICAgICAgICBbZixkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcFxuICAgICAgICBzcGxpdCA9IFN0cmluZyhmKS5zcGxpdCAnOidcbiAgICAgICAgbGluZSA9IHBhcnNlSW50IHNwbGl0WzFdIGlmIHNwbGl0Lmxlbmd0aCA+IDFcbiAgICAgICAgY2xtbiA9IHBhcnNlSW50IHNwbGl0WzJdIGlmIHNwbGl0Lmxlbmd0aCA+IDJcbiAgICAgICAgbCA9IGMgPSAwXG4gICAgICAgIGwgPSBsaW5lIGlmIE51bWJlci5pc0ludGVnZXIgbGluZVxuICAgICAgICBjID0gY2xtbiBpZiBOdW1iZXIuaXNJbnRlZ2VyIGNsbW5cbiAgICAgICAgZCA9IGQgKyAnOicgaWYgZCAhPSAnJ1xuICAgICAgICBbIGQgKyBzcGxpdFswXSwgTWF0aC5tYXgobCwxKSwgIE1hdGgubWF4KGMsMCkgXVxuICAgICAgICBcbiAgICBAc3BsaXRGaWxlUG9zOiAocCkgLT4gIyBmaWxlLnR4dDoxOjMgLS0+IFsnZmlsZS50eHQnLCBbMywgMF1dXG4gICAgXG4gICAgICAgIFtmLGwsY10gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgW2YsIFtjLCBsLTFdXVxuICAgICAgICBcbiAgICBAcmVtb3ZlTGluZVBvczogKHApIC0+IFNsYXNoLnNwbGl0RmlsZUxpbmUocClbMF1cbiAgICBAcmVtb3ZlQ29sdW1uOiAgKHApIC0+IFxuICAgICAgICBbZixsXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBpZiBsPjEgdGhlbiBmICsgJzonICsgbFxuICAgICAgICBlbHNlIGZcbiAgICAgICAgXG4gICAgQGV4dDogICAgICAgKHApIC0+IHBhdGguZXh0bmFtZShwKS5zbGljZSAxXG4gICAgQHNwbGl0RXh0OiAgKHApIC0+IFtTbGFzaC5yZW1vdmVFeHQocCksIFNsYXNoLmV4dChwKV1cbiAgICBAcmVtb3ZlRXh0OiAocCkgLT4gU2xhc2guam9pbiBTbGFzaC5kaXIocCksIFNsYXNoLmJhc2UgcFxuICAgIEBzd2FwRXh0OiAgIChwLCBleHQpIC0+IFNsYXNoLnJlbW92ZUV4dChwKSArIChleHQuc3RhcnRzV2l0aCgnLicpIGFuZCBleHQgb3IgXCIuI3tleHR9XCIpXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGpvaW46IC0+IFtdLm1hcC5jYWxsKGFyZ3VtZW50cywgU2xhc2gucGF0aCkuam9pbiAnLydcbiAgICBcbiAgICBAam9pbkZpbGVQb3M6IChmaWxlLCBwb3MpIC0+ICMgWydmaWxlLnR4dCcsIFszLCAwXV0gLS0+IGZpbGUudHh0OjE6M1xuICAgICAgICBpZiBub3QgcG9zPyBvciBub3QgcG9zWzBdIGFuZCBub3QgcG9zWzFdXG4gICAgICAgICAgICBmaWxlXG4gICAgICAgIGVsc2UgaWYgcG9zWzBdXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX06I3twb3NbMF19XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9XCJcbiAgICAgICAgICAgICAgICBcbiAgICBAam9pbkZpbGVMaW5lOiAoZmlsZSwgbGluZSwgY29sKSAtPiAjICdmaWxlLnR4dCcsIDEsIDIgLS0+IGZpbGUudHh0OjE6MlxuICAgICAgICByZXR1cm4gZmlsZSBpZiBub3QgbGluZT9cbiAgICAgICAgcmV0dXJuIFwiI3tmaWxlfToje2xpbmV9XCIgaWYgbm90IGNvbD9cbiAgICAgICAgXCIje2ZpbGV9OiN7bGluZX06I3tjb2x9XCJcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAYmFzZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBwLCBwYXRoLmV4dG5hbWUgcFxuICAgIEBmaWxlOiAgICAgICAocCkgICAtPiBwYXRoLmJhc2VuYW1lIHBcbiAgICBAZXh0bmFtZTogICAgKHApICAgLT4gcGF0aC5leHRuYW1lIHBcbiAgICBAYmFzZW5hbWU6ICAgKHAsZSkgLT4gcGF0aC5iYXNlbmFtZSBwLCBlXG4gICAgQGlzQWJzb2x1dGU6IChwKSAgIC0+IHBhdGguaXNBYnNvbHV0ZSBwXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIHBcbiAgICBAZGlybmFtZTogICAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLmRpcm5hbWUgcFxuICAgIEBkaXI6ICAgICAgICAocCkgICAtPiBTbGFzaC5wYXRoIHBhdGguZGlybmFtZSBwXG4gICAgQG5vcm1hbGl6ZTogIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5ub3JtYWxpemUgcFxuICAgIFxuICAgIEBwYXJzZTogICAgICAocCkgICAtPiBcbiAgICAgICAgXG4gICAgICAgIGRpY3QgPSBwYXRoLnBhcnNlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIGRpY3QuZGlyLmxlbmd0aCA9PSAyIGFuZCBkaWN0LmRpclsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3QuZGlyICs9ICcvJ1xuICAgICAgICBpZiBkaWN0LnJvb3QubGVuZ3RoID09IDIgYW5kIGRpY3Qucm9vdFsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3Qucm9vdCArPSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICBkaWN0XG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAaG9tZTogICAgICAgICAgLT4gU2xhc2gucGF0aCBvcy5ob21lZGlyKClcbiAgICBAdGlsZGU6ICAgICAocCkgLT4gU2xhc2gucGF0aChwKT8ucmVwbGFjZSBTbGFzaC5ob21lKCksICd+J1xuICAgIEB1bnRpbGRlOiAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIC9eXFx+LywgU2xhc2guaG9tZSgpXG4gICAgQHVuZW52OiAgICAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIDBcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgICBmb3Igayx2IG9mIHByb2Nlc3MuZW52XG4gICAgICAgICAgICAgICAgaWYgayA9PSBwLnNsaWNlIGkrMSwgaSsxK2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHAgPSBwLnNsaWNlKDAsIGkpICsgdiArIHAuc2xpY2UoaStrLmxlbmd0aCsxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIGkrMVxuICAgICAgICBTbGFzaC5wYXRoIHBcbiAgICBcbiAgICBAcmVzb2x2ZTogKHApIC0+XG4gICAgICAgIHJldHVybiBlcnJvciBcIlNsYXNoLnJlc29sdmUgLS0gbm8gcGF0aD8gI3twfVwiIGlmIGVtcHR5IHBcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlc29sdmUgU2xhc2gudW5lbnYgU2xhc2gudW50aWxkZSBwXG4gICAgXG4gICAgQHJlbGF0aXZlOiAocmVsLCB0bykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IHRvXG4gICAgICAgICAgICBlcnJvciBcIlNsYXNoLnJlbGF0aXZlIC0tIHRvIG5vdGhpbmc/XCIsIHJlbCwgdG9cbiAgICAgICAgICAgIHJldHVybiByZWxcbiAgICAgICAgICAgIFxuICAgICAgICByZWwgPSBTbGFzaC5yZXNvbHZlIHJlbFxuICAgICAgICByZXR1cm4gcmVsIGlmIG5vdCBTbGFzaC5pc0Fic29sdXRlIHJlbFxuICAgICAgICBpZiBTbGFzaC5yZXNvbHZlKHRvKSA9PSByZWxcbiAgICAgICAgICAgIHJldHVybiAnLidcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlbGF0aXZlIFNsYXNoLnJlc29sdmUodG8pLCByZWxcbiAgICAgICAgXG4gICAgQGZpbGVVcmw6IChwKSAtPiBcImZpbGU6Ly8je1NsYXNoLmVuY29kZSBTbGFzaC5yZXNvbHZlIHB9XCJcblxuICAgIEBzYW1lUGF0aDogKGEsIGIpIC0+IFNsYXNoLnJlc29sdmUoYSkgPT0gU2xhc2gucmVzb2x2ZShiKVxuXG4gICAgQGVzY2FwZTogKHApIC0+IHAucmVwbGFjZSAvKFtcXGBcIl0pL2csICdcXFxcJDEnXG5cbiAgICBAZW5jb2RlOiAocCkgLT5cbiAgICAgICAgcCA9IGVuY29kZVVSSSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcIy9nLCBcIiUyM1wiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJi9nLCBcIiUyNlwiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJy9nLCBcIiUyN1wiXG5cbiAgICBAcGtnOiAocCkgLT5cbiAgICBcbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgQHJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyAgU2xhc2guam9pbiBwLCAnLmdpdCcgICAgICAgICB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2Uubm9vbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLmpzb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXJuYW1lIHBcbiAgICAgICAgbnVsbFxuXG4gICAgQGV4aXN0czogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBwP1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgIGlmIHN0YXQgPSBmcy5zdGF0U3luYyhwKVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0XG4gICAgICAgIGNhdGNoIFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgbnVsbCAgICAgXG4gICAgICAgIFxuICAgIEBpc1dyaXRhYmxlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PS1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGZpbGVFeGlzdHM6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICByZXR1cm4gc3RhdCBpZiBzdGF0LmlzRmlsZSgpXG5cbiAgICBAZGlyRXhpc3RzOiAocCkgLT5cblxuICAgICAgICBpZiBzdGF0ID0gU2xhc2guZXhpc3RzIHBcbiAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgXG4gICAgQGlzRGlyOiAocCkgLT4gQGRpckV4aXN0cyBwXG4gICAgQGlzRmlsZTogKHApIC0+IEBmaWxlRXhpc3RzIHBcblxubW9kdWxlLmV4cG9ydHMgPSBTbGFzaFxuIl19
//# sourceURL=C:/Users/kodi/s/kxk/coffee/slash.coffee