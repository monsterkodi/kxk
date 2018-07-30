
/*
 0000000  00000000    0000000  00     00   0000000   00000000   
000       000   000  000       000   000  000   000  000   000  
0000000   0000000    000       000000000  000000000  00000000   
     000  000   000  000       000 0 000  000   000  000        
0000000   000   000   0000000  000   000  000   000  000
 */

(function() {
  var _, empty, errorStack, errorTrace, filePos, fs, log, logErr, mapConvert, ref, regex1, regex2, slash, sourceMap, str, toCoffee, toJs, valid;

  ref = require('./kxk'), fs = ref.fs, valid = ref.valid, empty = ref.empty, slash = ref.slash, str = ref.str, log = ref.log, _ = ref._;

  sourceMap = require('source-map');

  mapConvert = require('convert-source-map');

  regex1 = /^\s+at\s+(\S+)\s+\((.*):(\d+):(\d+)\)/;

  regex2 = /^\s+at\s+(.*):(\d+):(\d+)/;

  logErr = function(err, sep) {
    var i, len, line, ref1, results, trace;
    if (sep == null) {
      sep = '💥';
    }
    console.log(errorStack(err));
    trace = errorTrace(err);
    if (valid(trace.lines)) {
      log.flog({
        str: trace.text,
        source: trace.lines[0].file,
        line: trace.lines[0].line,
        sep: sep
      });
      ref1 = trace.lines;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        line = ref1[i];
        sep = slash.isAbsolute(line.file) || line.file[0] === '~' ? '🐞' : '🔼';
        if (sep === '🐞' || line.file[0] === '.') {
          results.push(log.flog({
            str: '       ' + line.func,
            source: line.file,
            line: line.line,
            sep: sep
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    } else {
      return log.flog({
        str: trace.text,
        source: '',
        line: 0,
        sep: sep
      });
    }
  };

  filePos = function(line) {
    var a, absFile, b, coffeeCol, coffeeFile, coffeeLine, jsFile, mappedLine, match, ref1, ref2, result;
    if (match = regex1.exec(line)) {
      result = {
        func: match[1].replace('.<anonymous>', ''),
        file: match[2],
        line: match[3],
        col: match[4]
      };
      if (slash.ext(result.file) === 'js') {
        mappedLine = toCoffee(result.file, result.line, result.col);
        if (mappedLine != null) {
          result.file = mappedLine[0];
          result.line = mappedLine[1];
          result.col = mappedLine[2];
        }
      } else if (slash.ext(result.file) === 'coffee' && !slash.isAbsolute(result.file)) {
        absFile = slash.resolve(slash.join(process.cwd(), 'coffee', result.file));
        if (slash.fileExists(absFile)) {
          ref1 = toJs(absFile, 1, 0), jsFile = ref1[0], a = ref1[1], b = ref1[2];
          if (slash.fileExists(jsFile)) {
            ref2 = toCoffee(jsFile, result.line, result.col), coffeeFile = ref2[0], coffeeLine = ref2[1], coffeeCol = ref2[2];
            if (slash.fileExists(coffeeFile)) {
              result.file = coffeeFile;
              result.line = coffeeLine;
              result.col = coffeeCol;
            }
          }
        }
      }
    } else if (match = regex2.exec(line)) {
      result = {
        func: slash.file(match[1]),
        file: match[1],
        line: match[2],
        col: match[3]
      };
      if (slash.ext(result.file) === 'js') {
        mappedLine = toCoffee(result.file, result.line, result.col);
        if (mappedLine != null) {
          result.file = mappedLine[0];
          result.line = mappedLine[1];
          result.col = mappedLine[2];
        }
      } else if (slash.ext(result.file) === 'coffee' && !slash.isAbsolute(result.file)) {
        console.log("filePos2 FIXME!", line, result);
      }
    }
    return result;
  };

  errorStack = function(err) {
    var fp, i, len, lines, ref1, stackLine;
    lines = [];
    ref1 = err.stack.split('\n');
    for (i = 0, len = ref1.length; i < len; i++) {
      stackLine = ref1[i];
      if (fp = filePos(stackLine)) {
        lines.push("       " + (_.padEnd(fp.func, 30)) + " " + fp.file + ":" + fp.line);
      } else {
        lines.push(stackLine);
      }
    }
    return lines.join('\n');
  };

  errorTrace = function(err) {
    var fp, i, len, lines, ref1, stackLine, text;
    lines = [];
    text = [];
    ref1 = err.stack.split('\n');
    for (i = 0, len = ref1.length; i < len; i++) {
      stackLine = ref1[i];
      if (fp = filePos(stackLine)) {
        lines.push(fp);
      } else {
        text.push(stackLine);
      }
    }
    return {
      lines: lines,
      text: text.join('\n')
    };
  };

  toCoffee = function(jsFile, jsLine, jsCol) {
    var coffeeCol, coffeeFile, coffeeLine, consumer, mapData, pos, ref1;
    if (jsCol == null) {
      jsCol = 0;
    }
    jsLine = parseInt(jsLine);
    jsCol = parseInt(jsCol);
    coffeeFile = slash.tilde(jsFile);
    coffeeLine = jsLine;
    coffeeCol = jsCol;
    if (slash.fileExists(jsFile)) {
      mapData = (ref1 = mapConvert.fromSource(fs.readFileSync(jsFile, 'utf8'))) != null ? ref1.toObject() : void 0;
      if (valid(mapData)) {
        if (mapData != null ? mapData.sources[0] : void 0) {
          mapData.sources[0] = slash.resolve(slash.join(slash.dir(jsFile), mapData != null ? mapData.sources[0] : void 0));
        }
        consumer = new sourceMap.SourceMapConsumer(mapData);
        if (consumer.originalPositionFor) {
          pos = consumer.originalPositionFor({
            line: jsLine,
            column: jsCol,
            bias: sourceMap.SourceMapConsumer.LEAST_UPPER_BOUND
          });
          if (valid(pos.line) && valid(pos.column)) {
            coffeeFile = slash.tilde(mapData.sources[0]);
            coffeeLine = pos.line;
            coffeeCol = pos.column;
          } else {
            log('no pos.line', pos);
          }
        } else {
          log('no consumer originalPositionFor', mapData);
          log('no consumer originalPositionFor', consumer);
        }
      }
    }
    return [coffeeFile, coffeeLine, coffeeCol];
  };

  toJs = function(coffeeFile, coffeeLine, coffeeCol) {
    var consumer, jsFile, mapData, poss, ref1, ref2, ref3;
    if (coffeeCol == null) {
      coffeeCol = 0;
    }
    jsFile = coffeeFile.replace(/\/coffee\//, '/js/');
    jsFile = jsFile.replace(/\.coffee$/, '.js');
    if (!slash.fileExists(jsFile)) {
      return [null, null, null];
    }
    if (coffeeLine == null) {
      return jsFile;
    }
    mapData = (ref1 = mapConvert.fromSource(fs.readFileSync(jsFile, 'utf8'))) != null ? ref1.toObject() : void 0;
    if (valid(mapData)) {
      if (mapData != null ? mapData.sources[0] : void 0) {
        mapData.sources[0] = slash.resolve(slash.join(slash.dir(jsFile), mapData != null ? mapData.sources[0] : void 0));
      }
      consumer = new sourceMap.SourceMapConsumer(mapData);
      if ((consumer != null ? consumer.allGeneratedPositionsFor : void 0) != null) {
        poss = consumer.allGeneratedPositionsFor({
          source: mapData.sources[0],
          line: coffeeLine
        });
        if (valid(poss)) {
          return [jsFile, (ref2 = poss[0]) != null ? ref2.line : void 0, (ref3 = poss[0]) != null ? ref3.column : void 0];
        } else {
          log('empty poss');
        }
      } else {
        log('no allGeneratedPositionsFor in', consumer);
      }
    }
    return [jsFile, null, null];
  };

  module.exports = {
    toJs: toJs,
    toCoffee: toCoffee,
    errorStack: errorStack,
    errorTrace: errorTrace,
    logErr: logErr
  };

}).call(this);
