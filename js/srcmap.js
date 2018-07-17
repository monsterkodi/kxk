(function() {
  /*
   0000000  00000000    0000000  00     00   0000000   00000000   
  000       000   000  000       000   000  000   000  000   000  
  0000000   0000000    000       000000000  000000000  00000000   
       000  000   000  000       000 0 000  000   000  000        
  0000000   000   000   0000000  000   000  000   000  000        
  */
  var _, empty, errorStack, errorTrace, filePos, fs, log, logErr, mapConvert, regex1, regex2, slash, sourceMap, str, toCoffee, toJs, valid;

  ({fs, valid, empty, slash, str, log, _} = require('./kxk'));

  sourceMap = require('source-map');

  mapConvert = require('convert-source-map');

  regex1 = /^\s+at\s+(\S+)\s+\((.*):(\d+):(\d+)\)/;

  regex2 = /^\s+at\s+(.*):(\d+):(\d+)/;

  // 000       0000000    0000000   00000000  00000000   00000000   
  // 000      000   000  000        000       000   000  000   000  
  // 000      000   000  000  0000  0000000   0000000    0000000    
  // 000      000   000  000   000  000       000   000  000   000  
  // 0000000   0000000    0000000   00000000  000   000  000   000  
  logErr = function(err, sep = '💥') {
    var i, len, line, ref, results, trace;
    console.log(errorStack(err));
    trace = errorTrace(err);
    console.log('trace:', str(trace));
    if (valid(trace.lines)) {
      log.flog({
        str: trace.text,
        source: trace.lines[0].file,
        line: trace.lines[0].line,
        sep: sep
      });
      ref = trace.lines;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
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

  // 00000000  000  000      00000000  00000000    0000000    0000000  
  // 000       000  000      000       000   000  000   000  000       
  // 000000    000  000      0000000   00000000   000   000  0000000   
  // 000       000  000      000       000        000   000       000  
  // 000       000  0000000  00000000  000         0000000   0000000   
  filePos = function(line) {
    var a, absFile, b, coffeeCol, coffeeFile, coffeeLine, err, jsFile, mappedLine, match, result;
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
        
        // seems like chrome is resolving to relative paths already without mapping the lines numbers correctly :(
        // lets see what we got ...
        console.log('filePos1', line, str(result));
        console.log('process.cwd', process.cwd());
        try {
          console.log('app.getPath("exe")', require('electron').remote.app.getPath('exe'));
        } catch (error) {
          err = error;
          console.log(err.stack);
        }
        absFile = slash.join(process.cwd(), 'coffee', result.file);
        console.log('absFile', absFile);
        if (slash.fileExists(absFile)) {
          console.log('gotcha1!', absFile);
          [jsFile, a, b] = toJs(absFile, 0, 0);
          console.log('gotcha2!', jsFile);
          if (slash.fileExists(jsFile)) {
            console.log('gotcha3!', jsFile);
            [coffeeFile, coffeeLine, coffeeCol] = toCoffee(jsFile, result.line, result.col);
            if (slash.fileExists(coffeeFile)) {
              console.log('yay!!', coffeeFile);
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
        console.log('filePos2', line, result);
      }
    }
    return result;
  };

  //  0000000  000000000   0000000    0000000  000   000  
  // 000          000     000   000  000       000  000   
  // 0000000      000     000000000  000       0000000    
  //      000     000     000   000  000       000  000   
  // 0000000      000     000   000   0000000  000   000  
  errorStack = function(err) {
    var fp, i, len, lines, ref, stackLine;
    lines = [];
    ref = err.stack.split('\n');
    for (i = 0, len = ref.length; i < len; i++) {
      stackLine = ref[i];
      if (fp = filePos(stackLine)) {
        lines.push(`       ${_.padEnd(fp.func, 30)} ${fp.file}:${fp.line}`);
      } else {
        lines.push(stackLine);
      }
    }
    return lines.join('\n');
  };

  // 000000000  00000000    0000000    0000000  00000000  
  //    000     000   000  000   000  000       000       
  //    000     0000000    000000000  000       0000000   
  //    000     000   000  000   000  000       000       
  //    000     000   000  000   000   0000000  00000000  
  errorTrace = function(err) {
    var fp, i, len, lines, ref, stackLine, text;
    lines = [];
    text = [];
    ref = err.stack.split('\n');
    for (i = 0, len = ref.length; i < len; i++) {
      stackLine = ref[i];
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

  
  // 000000000   0000000          0000000   0000000   00000000  00000000  00000000  00000000  
  //    000     000   000        000       000   000  000       000       000       000       
  //    000     000   000        000       000   000  000000    000000    0000000   0000000   
  //    000     000   000        000       000   000  000       000       000       000       
  //    000      0000000          0000000   0000000   000       000       00000000  00000000  
  toCoffee = function(jsFile, jsLine, jsCol = 0) {
    var coffeeCol, coffeeFile, coffeeLine, consumer, mapData, pos, ref;
    jsLine = parseInt(jsLine);
    jsCol = parseInt(jsCol);
    coffeeFile = slash.tilde(jsFile);
    coffeeLine = jsLine;
    coffeeCol = jsCol;
    if (slash.fileExists(jsFile)) {
      mapData = (ref = mapConvert.fromSource(fs.readFileSync(jsFile, 'utf8'))) != null ? ref.toObject() : void 0;
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

  // 000000000   0000000               000   0000000  
  //    000     000   000              000  000       
  //    000     000   000              000  0000000   
  //    000     000   000        000   000       000  
  //    000      0000000          0000000   0000000   
  toJs = function(coffeeFile, coffeeLine, coffeeCol = 0) {
    var consumer, jsFile, mapData, poss, ref, ref1, ref2;
    jsFile = coffeeFile.replace(/\/coffee\//, '/js/');
    jsFile = jsFile.replace(/\.coffee$/, '.js');
    if (!slash.fileExists(jsFile)) {
      return [null, null, null];
    }
    if (coffeeLine == null) {
      return jsFile;
    }
    mapData = (ref = mapConvert.fromSource(fs.readFileSync(jsFile, 'utf8'))) != null ? ref.toObject() : void 0;
    if (valid(mapData)) {
      if (mapData != null ? mapData.sources[0] : void 0) {
        mapData.sources[0] = slash.resolve(slash.join(slash.dir(jsFile), mapData != null ? mapData.sources[0] : void 0));
      }
      consumer = new sourceMap.SourceMapConsumer(mapData);
      if ((consumer != null ? consumer.allGeneratedPositionsFor : void 0) != null) {
        poss = consumer.allGeneratedPositionsFor({
          source: mapData.sources[0],
          line: coffeeLine //, column:coffeeCol
        });
        if (valid(poss)) {
          return [jsFile, (ref1 = poss[0]) != null ? ref1.line : void 0, (ref2 = poss[0]) != null ? ref2.column : void 0];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjbWFwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9zcmNtYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTs7RUFRQSxDQUFBLENBQUUsRUFBRixFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCLEVBQTJCLEdBQTNCLEVBQWdDLEdBQWhDLEVBQXFDLENBQXJDLENBQUEsR0FBMkMsT0FBQSxDQUFRLE9BQVIsQ0FBM0M7O0VBRUEsU0FBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVI7O0VBRWIsTUFBQSxHQUFhOztFQUNiLE1BQUEsR0FBYSw0QkFkYjs7Ozs7OztFQXNCQSxNQUFBLEdBQVMsUUFBQSxDQUFDLEdBQUQsRUFBTSxNQUFJLElBQVYsQ0FBQTtBQUVMLFFBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQTtJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBQSxDQUFXLEdBQVgsQ0FBWjtJQUNBLEtBQUEsR0FBUSxVQUFBLENBQVcsR0FBWDtJQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWixFQUFzQixHQUFBLENBQUksS0FBSixDQUF0QjtJQUNBLElBQUcsS0FBQSxDQUFNLEtBQUssQ0FBQyxLQUFaLENBQUg7TUFDSSxHQUFHLENBQUMsSUFBSixDQUFTO1FBQUEsR0FBQSxFQUFJLEtBQUssQ0FBQyxJQUFWO1FBQWdCLE1BQUEsRUFBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXRDO1FBQTRDLElBQUEsRUFBSyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWhFO1FBQXNFLEdBQUEsRUFBSTtNQUExRSxDQUFUO0FBQ0E7QUFBQTtNQUFBLEtBQUEscUNBQUE7O1FBQ0ksR0FBQSxHQUFTLEtBQUssQ0FBQyxVQUFOLENBQWlCLElBQUksQ0FBQyxJQUF0QixDQUFBLElBQStCLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFWLEtBQWMsR0FBaEQsR0FBeUQsSUFBekQsR0FBbUU7UUFDekUsSUFBRyxHQUFBLEtBQU8sSUFBUCxJQUFlLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFWLEtBQWdCLEdBQWxDO3VCQUNJLEdBQUcsQ0FBQyxJQUFKLENBQVM7WUFBQSxHQUFBLEVBQUksU0FBQSxHQUFVLElBQUksQ0FBQyxJQUFuQjtZQUF5QixNQUFBLEVBQU8sSUFBSSxDQUFDLElBQXJDO1lBQTJDLElBQUEsRUFBSyxJQUFJLENBQUMsSUFBckQ7WUFBMkQsR0FBQSxFQUFJO1VBQS9ELENBQVQsR0FESjtTQUFBLE1BQUE7K0JBQUE7O01BRkosQ0FBQTtxQkFGSjtLQUFBLE1BQUE7YUFPSSxHQUFHLENBQUMsSUFBSixDQUFTO1FBQUEsR0FBQSxFQUFJLEtBQUssQ0FBQyxJQUFWO1FBQWdCLE1BQUEsRUFBTyxFQUF2QjtRQUEyQixJQUFBLEVBQUssQ0FBaEM7UUFBbUMsR0FBQSxFQUFJO01BQXZDLENBQVQsRUFQSjs7RUFMSyxFQXRCVDs7Ozs7OztFQTBDQSxPQUFBLEdBQVUsUUFBQSxDQUFDLElBQUQsQ0FBQTtBQUVOLFFBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBO0lBQUEsSUFBRyxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQVg7TUFFSSxNQUFBLEdBQ0k7UUFBQSxJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVQsQ0FBaUIsY0FBakIsRUFBaUMsRUFBakMsQ0FBTjtRQUNBLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQURaO1FBRUEsSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBRlo7UUFHQSxHQUFBLEVBQU0sS0FBTSxDQUFBLENBQUE7TUFIWjtNQUtKLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFNLENBQUMsSUFBakIsQ0FBQSxLQUEwQixJQUE3QjtRQUVJLFVBQUEsR0FBYSxRQUFBLENBQVMsTUFBTSxDQUFDLElBQWhCLEVBQXNCLE1BQU0sQ0FBQyxJQUE3QixFQUFtQyxNQUFNLENBQUMsR0FBMUM7UUFFYixJQUFHLGtCQUFIO1VBQ0ksTUFBTSxDQUFDLElBQVAsR0FBYyxVQUFXLENBQUEsQ0FBQTtVQUN6QixNQUFNLENBQUMsSUFBUCxHQUFjLFVBQVcsQ0FBQSxDQUFBO1VBQ3pCLE1BQU0sQ0FBQyxHQUFQLEdBQWMsVUFBVyxDQUFBLENBQUEsRUFIN0I7U0FKSjtPQUFBLE1BU0ssSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQU0sQ0FBQyxJQUFqQixDQUFBLEtBQTBCLFFBQTFCLElBQXVDLENBQUksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsTUFBTSxDQUFDLElBQXhCLENBQTlDOzs7O1FBSUQsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCLElBQXhCLEVBQThCLEdBQUEsQ0FBSSxNQUFKLENBQTlCO1FBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBM0I7QUFDQTtVQUNJLE9BQU8sQ0FBQyxHQUFSLENBQVksb0JBQVosRUFBa0MsT0FBQSxDQUFRLFVBQVIsQ0FBbUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQS9CLENBQXVDLEtBQXZDLENBQWxDLEVBREo7U0FBQSxhQUFBO1VBRU07VUFDRixPQUFPLENBQUMsR0FBUixDQUFZLEdBQUcsQ0FBQyxLQUFoQixFQUhKOztRQUtBLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBWCxFQUEwQixRQUExQixFQUFvQyxNQUFNLENBQUMsSUFBM0M7UUFDVixPQUFPLENBQUMsR0FBUixDQUFZLFNBQVosRUFBdUIsT0FBdkI7UUFDQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLE9BQWpCLENBQUg7VUFDSSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosRUFBd0IsT0FBeEI7VUFDQSxDQUFDLE1BQUQsRUFBUSxDQUFSLEVBQVUsQ0FBVixDQUFBLEdBQWUsSUFBQSxDQUFLLE9BQUwsRUFBYyxDQUFkLEVBQWlCLENBQWpCO1VBQ2YsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCLE1BQXhCO1VBQ0EsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFqQixDQUFIO1lBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCLE1BQXhCO1lBQ0EsQ0FBQyxVQUFELEVBQWEsVUFBYixFQUF5QixTQUF6QixDQUFBLEdBQXNDLFFBQUEsQ0FBUyxNQUFULEVBQWlCLE1BQU0sQ0FBQyxJQUF4QixFQUE4QixNQUFNLENBQUMsR0FBckM7WUFDdEMsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixVQUFqQixDQUFIO2NBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLFVBQXJCO2NBQ0EsTUFBTSxDQUFDLElBQVAsR0FBYztjQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7Y0FDZCxNQUFNLENBQUMsR0FBUCxHQUFjLFVBSmxCO2FBSEo7V0FKSjtTQWJDO09BakJUO0tBQUEsTUEyQ0ssSUFBRyxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQVg7TUFFRCxNQUFBLEdBQ0k7UUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFNLENBQUEsQ0FBQSxDQUFqQixDQUFOO1FBQ0EsSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBRFo7UUFFQSxJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FGWjtRQUdBLEdBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQTtNQUhaO01BS0osSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQU0sQ0FBQyxJQUFqQixDQUFBLEtBQTBCLElBQTdCO1FBRUksVUFBQSxHQUFhLFFBQUEsQ0FBUyxNQUFNLENBQUMsSUFBaEIsRUFBc0IsTUFBTSxDQUFDLElBQTdCLEVBQW1DLE1BQU0sQ0FBQyxHQUExQztRQUViLElBQUcsa0JBQUg7VUFDSSxNQUFNLENBQUMsSUFBUCxHQUFjLFVBQVcsQ0FBQSxDQUFBO1VBQ3pCLE1BQU0sQ0FBQyxJQUFQLEdBQWMsVUFBVyxDQUFBLENBQUE7VUFDekIsTUFBTSxDQUFDLEdBQVAsR0FBYyxVQUFXLENBQUEsQ0FBQSxFQUg3QjtTQUpKO09BQUEsTUFTSyxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBTSxDQUFDLElBQWpCLENBQUEsS0FBMEIsUUFBMUIsSUFBdUMsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFNLENBQUMsSUFBeEIsQ0FBOUM7UUFFRCxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFBOEIsTUFBOUIsRUFGQztPQWpCSjs7V0FxQkw7RUFsRU0sRUExQ1Y7Ozs7Ozs7RUFvSEEsVUFBQSxHQUFhLFFBQUEsQ0FBQyxHQUFELENBQUE7QUFFVCxRQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUE7SUFBQSxLQUFBLEdBQVE7QUFFUjtJQUFBLEtBQUEscUNBQUE7O01BRUksSUFBRyxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBUjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBQSxDQUFBLENBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxFQUFFLENBQUMsSUFBWixFQUFrQixFQUFsQixDQUFWLEVBQUEsQ0FBQSxDQUFrQyxFQUFFLENBQUMsSUFBckMsQ0FBMEMsQ0FBMUMsQ0FBQSxDQUE2QyxFQUFFLENBQUMsSUFBaEQsQ0FBQSxDQUFYLEVBREo7T0FBQSxNQUFBO1FBR0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBSEo7O0lBRko7V0FPQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7RUFYUyxFQXBIYjs7Ozs7OztFQXVJQSxVQUFBLEdBQWEsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUVULFFBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixJQUFBLEdBQVE7QUFFUjtJQUFBLEtBQUEscUNBQUE7O01BRUksSUFBRyxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBUjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWCxFQURKO09BQUEsTUFBQTtRQUdJLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUhKOztJQUZKO1dBT0E7TUFBQSxLQUFBLEVBQVEsS0FBUjtNQUNBLElBQUEsRUFBUSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7SUFEUjtFQVpTLEVBdkliOzs7Ozs7OztFQTRKQSxRQUFBLEdBQVcsUUFBQSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFFBQU0sQ0FBdkIsQ0FBQTtBQUVQLFFBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUE7SUFBQSxNQUFBLEdBQVMsUUFBQSxDQUFTLE1BQVQ7SUFDVCxLQUFBLEdBQVMsUUFBQSxDQUFTLEtBQVQ7SUFFVCxVQUFBLEdBQWEsS0FBSyxDQUFDLEtBQU4sQ0FBWSxNQUFaO0lBQ2IsVUFBQSxHQUFhO0lBQ2IsU0FBQSxHQUFhO0lBRWIsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFqQixDQUFIO01BQ0ksT0FBQSwrRUFBK0QsQ0FBRSxRQUF2RCxDQUFBO01BQ1YsSUFBRyxLQUFBLENBQU0sT0FBTixDQUFIO1FBQ0ksc0JBQXdGLE9BQU8sQ0FBRSxPQUFRLENBQUEsQ0FBQSxVQUF6RztVQUFBLE9BQU8sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFoQixHQUFxQixLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLENBQVgsb0JBQThCLE9BQU8sQ0FBRSxPQUFRLENBQUEsQ0FBQSxVQUEvQyxDQUFkLEVBQXJCOztRQUNBLFFBQUEsR0FBVyxJQUFJLFNBQVMsQ0FBQyxpQkFBZCxDQUFnQyxPQUFoQztRQUNYLElBQUcsUUFBUSxDQUFDLG1CQUFaO1VBQ0ksR0FBQSxHQUFNLFFBQVEsQ0FBQyxtQkFBVCxDQUE2QjtZQUFBLElBQUEsRUFBSyxNQUFMO1lBQWEsTUFBQSxFQUFPLEtBQXBCO1lBQTJCLElBQUEsRUFBSyxTQUFTLENBQUMsaUJBQWlCLENBQUM7VUFBNUQsQ0FBN0I7VUFDTixJQUFHLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFBLElBQW9CLEtBQUEsQ0FBTSxHQUFHLENBQUMsTUFBVixDQUF2QjtZQUNJLFVBQUEsR0FBYSxLQUFLLENBQUMsS0FBTixDQUFZLE9BQU8sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUE1QjtZQUNiLFVBQUEsR0FBYSxHQUFHLENBQUM7WUFDakIsU0FBQSxHQUFhLEdBQUcsQ0FBQyxPQUhyQjtXQUFBLE1BQUE7WUFLSSxHQUFBLENBQUksYUFBSixFQUFtQixHQUFuQixFQUxKO1dBRko7U0FBQSxNQUFBO1VBU0ksR0FBQSxDQUFJLGlDQUFKLEVBQXVDLE9BQXZDO1VBQ0EsR0FBQSxDQUFJLGlDQUFKLEVBQXVDLFFBQXZDLEVBVko7U0FISjtPQUZKOztXQWlCQSxDQUFDLFVBQUQsRUFBYSxVQUFiLEVBQXlCLFNBQXpCO0VBMUJPLEVBNUpYOzs7Ozs7O0VBOExBLElBQUEsR0FBTyxRQUFBLENBQUMsVUFBRCxFQUFhLFVBQWIsRUFBeUIsWUFBVSxDQUFuQyxDQUFBO0FBRUgsUUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtJQUFBLE1BQUEsR0FBUyxVQUFVLENBQUMsT0FBWCxDQUFtQixZQUFuQixFQUFpQyxNQUFqQztJQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsRUFBNEIsS0FBNUI7SUFFVCxJQUFHLENBQUksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsTUFBakIsQ0FBUDtBQUNJLGFBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsRUFEWDs7SUFHQSxJQUFPLGtCQUFQO0FBQXdCLGFBQU8sT0FBL0I7O0lBRUEsT0FBQSwrRUFBK0QsQ0FBRSxRQUF2RCxDQUFBO0lBQ1YsSUFBRyxLQUFBLENBQU0sT0FBTixDQUFIO01BQ0ksc0JBQXdGLE9BQU8sQ0FBRSxPQUFRLENBQUEsQ0FBQSxVQUF6RztRQUFBLE9BQU8sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFoQixHQUFxQixLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLENBQVgsb0JBQThCLE9BQU8sQ0FBRSxPQUFRLENBQUEsQ0FBQSxVQUEvQyxDQUFkLEVBQXJCOztNQUNBLFFBQUEsR0FBVyxJQUFJLFNBQVMsQ0FBQyxpQkFBZCxDQUFnQyxPQUFoQztNQUNYLElBQUcsdUVBQUg7UUFDSSxJQUFBLEdBQU8sUUFBUSxDQUFDLHdCQUFULENBQWtDO1VBQUEsTUFBQSxFQUFPLE9BQU8sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUF2QjtVQUEyQixJQUFBLEVBQUssVUFBaEM7UUFBQSxDQUFsQztRQUNQLElBQUcsS0FBQSxDQUFNLElBQU4sQ0FBSDtBQUNJLGlCQUFPLENBQUMsTUFBRCxpQ0FBZ0IsQ0FBRSxhQUFsQixpQ0FBK0IsQ0FBRSxlQUFqQyxFQURYO1NBQUEsTUFBQTtVQUdJLEdBQUEsQ0FBSSxZQUFKLEVBSEo7U0FGSjtPQUFBLE1BQUE7UUFPSSxHQUFBLENBQUksZ0NBQUosRUFBc0MsUUFBdEMsRUFQSjtPQUhKOztXQVlBLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxJQUFmO0VBdkJHOztFQXlCUCxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsSUFBQSxFQUFZLElBQVo7SUFDQSxRQUFBLEVBQVksUUFEWjtJQUVBLFVBQUEsRUFBWSxVQUZaO0lBR0EsVUFBQSxFQUFZLFVBSFo7SUFJQSxNQUFBLEVBQVk7RUFKWjtBQXhOSiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyMjXG5cbnsgZnMsIHZhbGlkLCBlbXB0eSwgc2xhc2gsIHN0ciwgbG9nLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuc291cmNlTWFwICA9IHJlcXVpcmUgJ3NvdXJjZS1tYXAnXG5tYXBDb252ZXJ0ID0gcmVxdWlyZSAnY29udmVydC1zb3VyY2UtbWFwJ1xuXG5yZWdleDEgICAgID0gL15cXHMrYXRcXHMrKFxcUyspXFxzK1xcKCguKik6KFxcZCspOihcXGQrKVxcKS9cclxucmVnZXgyICAgICA9IC9eXFxzK2F0XFxzKyguKik6KFxcZCspOihcXGQrKS9cclxuXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcblxubG9nRXJyID0gKGVyciwgc2VwPSfwn5KlJykgLT5cbiAgICBcbiAgICBjb25zb2xlLmxvZyBlcnJvclN0YWNrIGVyclxuICAgIHRyYWNlID0gZXJyb3JUcmFjZSBlcnJcbiAgICBjb25zb2xlLmxvZyAndHJhY2U6Jywgc3RyKHRyYWNlKVxuICAgIGlmIHZhbGlkIHRyYWNlLmxpbmVzXG4gICAgICAgIGxvZy5mbG9nIHN0cjp0cmFjZS50ZXh0LCBzb3VyY2U6dHJhY2UubGluZXNbMF0uZmlsZSwgbGluZTp0cmFjZS5saW5lc1swXS5saW5lLCBzZXA6c2VwXG4gICAgICAgIGZvciBsaW5lIGluIHRyYWNlLmxpbmVzXG4gICAgICAgICAgICBzZXAgPSBpZiBzbGFzaC5pc0Fic29sdXRlKGxpbmUuZmlsZSkgb3IgbGluZS5maWxlWzBdPT0nficgdGhlbiAn8J+QnicgZWxzZSAn8J+UvCdcbiAgICAgICAgICAgIGlmIHNlcCA9PSAn8J+Qnicgb3IgbGluZS5maWxlWzBdID09ICcuJ1xuICAgICAgICAgICAgICAgIGxvZy5mbG9nIHN0cjonICAgICAgICcrbGluZS5mdW5jLCBzb3VyY2U6bGluZS5maWxlLCBsaW5lOmxpbmUubGluZSwgc2VwOnNlcFxuICAgIGVsc2VcbiAgICAgICAgbG9nLmZsb2cgc3RyOnRyYWNlLnRleHQsIHNvdXJjZTonJywgbGluZTowLCBzZXA6c2VwXG5cbiMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5maWxlUG9zID0gKGxpbmUpIC0+XG5cbiAgICBpZiBtYXRjaCA9IHJlZ2V4MS5leGVjIGxpbmVcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICBmdW5jOiBtYXRjaFsxXS5yZXBsYWNlICcuPGFub255bW91cz4nLCAnJ1xuICAgICAgICAgICAgZmlsZTogbWF0Y2hbMl1cclxuICAgICAgICAgICAgbGluZTogbWF0Y2hbM11cclxuICAgICAgICAgICAgY29sOiAgbWF0Y2hbNF1cclxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guZXh0KHJlc3VsdC5maWxlKSA9PSAnanMnXHJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWFwcGVkTGluZSA9IHRvQ29mZmVlIHJlc3VsdC5maWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtYXBwZWRMaW5lP1xuICAgICAgICAgICAgICAgIHJlc3VsdC5maWxlID0gbWFwcGVkTGluZVswXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5saW5lID0gbWFwcGVkTGluZVsxXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5jb2wgID0gbWFwcGVkTGluZVsyXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHNsYXNoLmV4dChyZXN1bHQuZmlsZSkgPT0gJ2NvZmZlZScgYW5kIG5vdCBzbGFzaC5pc0Fic29sdXRlIHJlc3VsdC5maWxlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgc2VlbXMgbGlrZSBjaHJvbWUgaXMgcmVzb2x2aW5nIHRvIHJlbGF0aXZlIHBhdGhzIGFscmVhZHkgd2l0aG91dCBtYXBwaW5nIHRoZSBsaW5lcyBudW1iZXJzIGNvcnJlY3RseSA6KFxuICAgICAgICAgICAgIyBsZXRzIHNlZSB3aGF0IHdlIGdvdCAuLi5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdmaWxlUG9zMScsIGxpbmUsIHN0ciByZXN1bHRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdwcm9jZXNzLmN3ZCcsIHByb2Nlc3MuY3dkKClcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICdhcHAuZ2V0UGF0aChcImV4ZVwiKScsIHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlLmFwcC5nZXRQYXRoICdleGUnXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlcnIuc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGFic0ZpbGUgPSBzbGFzaC5qb2luIHByb2Nlc3MuY3dkKCksICdjb2ZmZWUnLCByZXN1bHQuZmlsZVxuICAgICAgICAgICAgY29uc29sZS5sb2cgJ2Fic0ZpbGUnLCBhYnNGaWxlXG4gICAgICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIGFic0ZpbGVcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAnZ290Y2hhMSEnLCBhYnNGaWxlXG4gICAgICAgICAgICAgICAgW2pzRmlsZSxhLGJdID0gdG9KcyBhYnNGaWxlLCAwLCAwXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cgJ2dvdGNoYTIhJywganNGaWxlXG4gICAgICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBqc0ZpbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgJ2dvdGNoYTMhJywganNGaWxlXG4gICAgICAgICAgICAgICAgICAgIFtjb2ZmZWVGaWxlLCBjb2ZmZWVMaW5lLCBjb2ZmZWVDb2xdID0gdG9Db2ZmZWUganNGaWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbFxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIGNvZmZlZUZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICd5YXkhIScsIGNvZmZlZUZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5maWxlID0gY29mZmVlRmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmxpbmUgPSBjb2ZmZWVMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY29sICA9IGNvZmZlZUNvbFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgZWxzZSBpZiBtYXRjaCA9IHJlZ2V4Mi5leGVjIGxpbmVcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICBmdW5jOiBzbGFzaC5maWxlIG1hdGNoWzFdXG4gICAgICAgICAgICBmaWxlOiBtYXRjaFsxXVxyXG4gICAgICAgICAgICBsaW5lOiBtYXRjaFsyXVxyXG4gICAgICAgICAgICBjb2w6ICBtYXRjaFszXVxyXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5leHQocmVzdWx0LmZpbGUpID09ICdqcydcclxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtYXBwZWRMaW5lID0gdG9Db2ZmZWUgcmVzdWx0LmZpbGUsIHJlc3VsdC5saW5lLCByZXN1bHQuY29sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG1hcHBlZExpbmU/XG4gICAgICAgICAgICAgICAgcmVzdWx0LmZpbGUgPSBtYXBwZWRMaW5lWzBdXG4gICAgICAgICAgICAgICAgcmVzdWx0LmxpbmUgPSBtYXBwZWRMaW5lWzFdXG4gICAgICAgICAgICAgICAgcmVzdWx0LmNvbCAgPSBtYXBwZWRMaW5lWzJdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgc2xhc2guZXh0KHJlc3VsdC5maWxlKSA9PSAnY29mZmVlJyBhbmQgbm90IHNsYXNoLmlzQWJzb2x1dGUgcmVzdWx0LmZpbGUgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdmaWxlUG9zMicsIGxpbmUsIHJlc3VsdFxuICAgICAgICAgICAgXG4gICAgcmVzdWx0XG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuZXJyb3JTdGFjayA9IChlcnIpIC0+XG4gICAgXG4gICAgbGluZXMgPSBbXVxyXG4gICAgXG4gICAgZm9yIHN0YWNrTGluZSBpbiBlcnIuc3RhY2suc3BsaXQgJ1xcbicgXHJcbiAgICAgICAgXG4gICAgICAgIGlmIGZwID0gZmlsZVBvcyBzdGFja0xpbmVcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggXCIgICAgICAgI3tfLnBhZEVuZCBmcC5mdW5jLCAzMH0gI3tmcC5maWxlfToje2ZwLmxpbmV9XCIgXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBsaW5lcy5wdXNoIHN0YWNrTGluZSBcclxuXHIgIFxuICAgIGxpbmVzLmpvaW4gJ1xcbidcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5lcnJvclRyYWNlID0gKGVycikgLT5cbiAgICBcbiAgICBsaW5lcyA9IFtdXHJcbiAgICB0ZXh0ICA9IFtdXG5cbiAgICBmb3Igc3RhY2tMaW5lIGluIGVyci5zdGFjay5zcGxpdCAnXFxuJyBcclxuICAgICAgICBcbiAgICAgICAgaWYgZnAgPSBmaWxlUG9zIHN0YWNrTGluZVxuICAgICAgICAgICAgbGluZXMucHVzaCBmcFxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRleHQucHVzaCBzdGFja0xpbmUgXHJcblxyICBcbiAgICBsaW5lczogIGxpbmVzXG4gICAgdGV4dDogICB0ZXh0LmpvaW4gJ1xcbidcbiAgICBcbiMgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcblxudG9Db2ZmZWUgPSAoanNGaWxlLCBqc0xpbmUsIGpzQ29sPTApIC0+XG5cbiAgICBqc0xpbmUgPSBwYXJzZUludCBqc0xpbmVcbiAgICBqc0NvbCAgPSBwYXJzZUludCBqc0NvbFxuICAgIFxuICAgIGNvZmZlZUZpbGUgPSBzbGFzaC50aWxkZSBqc0ZpbGVcbiAgICBjb2ZmZWVMaW5lID0ganNMaW5lXG4gICAgY29mZmVlQ29sICA9IGpzQ29sXG4gICAgICAgIFxuICAgIGlmIHNsYXNoLmZpbGVFeGlzdHMganNGaWxlXG4gICAgICAgIG1hcERhdGEgPSBtYXBDb252ZXJ0LmZyb21Tb3VyY2UoZnMucmVhZEZpbGVTeW5jIGpzRmlsZSwgJ3V0ZjgnKT8udG9PYmplY3QoKVxuICAgICAgICBpZiB2YWxpZCBtYXBEYXRhXG4gICAgICAgICAgICBtYXBEYXRhLnNvdXJjZXNbMF0gPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2guZGlyKGpzRmlsZSksIG1hcERhdGE/LnNvdXJjZXNbMF0gaWYgbWFwRGF0YT8uc291cmNlc1swXVxuICAgICAgICAgICAgY29uc3VtZXIgPSBuZXcgc291cmNlTWFwLlNvdXJjZU1hcENvbnN1bWVyIG1hcERhdGFcbiAgICAgICAgICAgIGlmIGNvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3JcbiAgICAgICAgICAgICAgICBwb3MgPSBjb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yIGxpbmU6anNMaW5lLCBjb2x1bW46anNDb2wsIGJpYXM6c291cmNlTWFwLlNvdXJjZU1hcENvbnN1bWVyLkxFQVNUX1VQUEVSX0JPVU5EXG4gICAgICAgICAgICAgICAgaWYgdmFsaWQocG9zLmxpbmUpIGFuZCB2YWxpZChwb3MuY29sdW1uKVxuICAgICAgICAgICAgICAgICAgICBjb2ZmZWVGaWxlID0gc2xhc2gudGlsZGUgbWFwRGF0YS5zb3VyY2VzWzBdXG4gICAgICAgICAgICAgICAgICAgIGNvZmZlZUxpbmUgPSBwb3MubGluZSBcbiAgICAgICAgICAgICAgICAgICAgY29mZmVlQ29sICA9IHBvcy5jb2x1bW5cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnbm8gcG9zLmxpbmUnLCBwb3NcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cgJ25vIGNvbnN1bWVyIG9yaWdpbmFsUG9zaXRpb25Gb3InLCBtYXBEYXRhXG4gICAgICAgICAgICAgICAgbG9nICdubyBjb25zdW1lciBvcmlnaW5hbFBvc2l0aW9uRm9yJywgY29uc3VtZXJcbiAgICAgICAgXG4gICAgW2NvZmZlZUZpbGUsIGNvZmZlZUxpbmUsIGNvZmZlZUNvbF1cblxuIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAgMDAwICAgMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jICAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxudG9KcyA9IChjb2ZmZWVGaWxlLCBjb2ZmZWVMaW5lLCBjb2ZmZWVDb2w9MCkgLT5cbiAgICBcbiAgICBqc0ZpbGUgPSBjb2ZmZWVGaWxlLnJlcGxhY2UgL1xcL2NvZmZlZVxcLy8sICcvanMvJ1xuICAgIGpzRmlsZSA9IGpzRmlsZS5yZXBsYWNlIC9cXC5jb2ZmZWUkLywgJy5qcydcbiAgICBcbiAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBqc0ZpbGVcbiAgICAgICAgcmV0dXJuIFtudWxsLCBudWxsLCBudWxsXVxuICAgICAgICBcbiAgICBpZiBub3QgY29mZmVlTGluZT8gdGhlbiByZXR1cm4ganNGaWxlXG4gICAgXG4gICAgbWFwRGF0YSA9IG1hcENvbnZlcnQuZnJvbVNvdXJjZShmcy5yZWFkRmlsZVN5bmMganNGaWxlLCAndXRmOCcpPy50b09iamVjdCgpXG4gICAgaWYgdmFsaWQgbWFwRGF0YVxuICAgICAgICBtYXBEYXRhLnNvdXJjZXNbMF0gPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2guZGlyKGpzRmlsZSksIG1hcERhdGE/LnNvdXJjZXNbMF0gaWYgbWFwRGF0YT8uc291cmNlc1swXVxuICAgICAgICBjb25zdW1lciA9IG5ldyBzb3VyY2VNYXAuU291cmNlTWFwQ29uc3VtZXIgbWFwRGF0YVxuICAgICAgICBpZiBjb25zdW1lcj8uYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yP1xuICAgICAgICAgICAgcG9zcyA9IGNvbnN1bWVyLmFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvciBzb3VyY2U6bWFwRGF0YS5zb3VyY2VzWzBdLCBsaW5lOmNvZmZlZUxpbmUjLCBjb2x1bW46Y29mZmVlQ29sXG4gICAgICAgICAgICBpZiB2YWxpZCBwb3NzXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtqc0ZpbGUsIHBvc3NbMF0/LmxpbmUsIHBvc3NbMF0/LmNvbHVtbl1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cgJ2VtcHR5IHBvc3MnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyAnbm8gYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yIGluJywgY29uc3VtZXJcbiAgICAgICAgXG4gICAgW2pzRmlsZSwgbnVsbCwgbnVsbF1cbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgdG9KczogICAgICAgdG9Kc1xuICAgIHRvQ29mZmVlOiAgIHRvQ29mZmVlXG4gICAgZXJyb3JTdGFjazogZXJyb3JTdGFja1xuICAgIGVycm9yVHJhY2U6IGVycm9yVHJhY2VcbiAgICBsb2dFcnI6ICAgICBsb2dFcnJcbiAgICBcbiAgICAiXX0=
//# sourceURL=../coffee/srcmap.coffee