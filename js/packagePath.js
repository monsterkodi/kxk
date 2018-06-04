(function() {
  var dirExists, fileExists, log, packagePath, path, ref, resolve;

  ref = require('./kxk'), resolve = ref.resolve, dirExists = ref.dirExists, fileExists = ref.fileExists, path = ref.path, log = ref.log;

  packagePath = function(p) {
    if ((p != null ? p.length : void 0) != null) {
      while (p.length && (p !== '.' && p !== '/')) {
        if (dirExists(path.join(p, '.git'))) {
          return resolve(p);
        }
        if (fileExists(path.join(p, 'package.noon'))) {
          return resolve(p);
        }
        if (fileExists(path.join(p, 'package.json'))) {
          return resolve(p);
        }
        p = path.dirname(p);
      }
    }
    return null;
  };

  module.exports = packagePath;

}).call(this);

//# sourceMappingURL=packagePath.js.map
