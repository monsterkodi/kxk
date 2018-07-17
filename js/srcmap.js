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
    var mappedLine, match, result;
    if (match = regex1.exec(line)) {
      result = {
        func: match[1].replace('.<anonymous>', ''),
        file: match[2],
        line: match[3],
        col: match[4]
      };
      console.log('filePos1', line, result);
      if (slash.ext(result.file) === 'js') {
        mappedLine = toCoffee(result.file, result.line, result.col);
        if (mappedLine != null) {
          result.file = mappedLine[0];
          result.line = mappedLine[1];
          result.col = mappedLine[2];
        }
      }
    } else if (match = regex2.exec(line)) {
      result = {
        func: slash.file(match[1]),
        file: match[1],
        line: match[2],
        col: match[3]
      };
      console.log('filePos2', line, result);
      if (slash.ext(result.file) === 'js') {
        mappedLine = toCoffee(result.file, result.line, result.col);
        if (mappedLine != null) {
          result.file = mappedLine[0];
          result.line = mappedLine[1];
          result.col = mappedLine[2];
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjbWFwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9zcmNtYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTs7RUFRQSxDQUFBLENBQUUsRUFBRixFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCLEVBQTJCLEdBQTNCLEVBQWdDLEdBQWhDLEVBQXFDLENBQXJDLENBQUEsR0FBMkMsT0FBQSxDQUFRLE9BQVIsQ0FBM0M7O0VBRUEsU0FBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVI7O0VBRWIsTUFBQSxHQUFhOztFQUNiLE1BQUEsR0FBYSw0QkFkYjs7Ozs7OztFQXNCQSxNQUFBLEdBQVMsUUFBQSxDQUFDLEdBQUQsRUFBTSxNQUFJLElBQVYsQ0FBQTtBQUVMLFFBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQTtJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBQSxDQUFXLEdBQVgsQ0FBWjtJQUNBLEtBQUEsR0FBUSxVQUFBLENBQVcsR0FBWDtJQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWixFQUFzQixHQUFBLENBQUksS0FBSixDQUF0QjtJQUNBLElBQUcsS0FBQSxDQUFNLEtBQUssQ0FBQyxLQUFaLENBQUg7TUFDSSxHQUFHLENBQUMsSUFBSixDQUFTO1FBQUEsR0FBQSxFQUFJLEtBQUssQ0FBQyxJQUFWO1FBQWdCLE1BQUEsRUFBTyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXRDO1FBQTRDLElBQUEsRUFBSyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWhFO1FBQXNFLEdBQUEsRUFBSTtNQUExRSxDQUFUO0FBQ0E7QUFBQTtNQUFBLEtBQUEscUNBQUE7O1FBQ0ksR0FBQSxHQUFTLEtBQUssQ0FBQyxVQUFOLENBQWlCLElBQUksQ0FBQyxJQUF0QixDQUFBLElBQStCLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFWLEtBQWMsR0FBaEQsR0FBeUQsSUFBekQsR0FBbUU7UUFDekUsSUFBRyxHQUFBLEtBQU8sSUFBUCxJQUFlLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFWLEtBQWdCLEdBQWxDO3VCQUNJLEdBQUcsQ0FBQyxJQUFKLENBQVM7WUFBQSxHQUFBLEVBQUksU0FBQSxHQUFVLElBQUksQ0FBQyxJQUFuQjtZQUF5QixNQUFBLEVBQU8sSUFBSSxDQUFDLElBQXJDO1lBQTJDLElBQUEsRUFBSyxJQUFJLENBQUMsSUFBckQ7WUFBMkQsR0FBQSxFQUFJO1VBQS9ELENBQVQsR0FESjtTQUFBLE1BQUE7K0JBQUE7O01BRkosQ0FBQTtxQkFGSjtLQUFBLE1BQUE7YUFPSSxHQUFHLENBQUMsSUFBSixDQUFTO1FBQUEsR0FBQSxFQUFJLEtBQUssQ0FBQyxJQUFWO1FBQWdCLE1BQUEsRUFBTyxFQUF2QjtRQUEyQixJQUFBLEVBQUssQ0FBaEM7UUFBbUMsR0FBQSxFQUFJO01BQXZDLENBQVQsRUFQSjs7RUFMSyxFQXRCVDs7Ozs7OztFQTBDQSxPQUFBLEdBQVUsUUFBQSxDQUFDLElBQUQsQ0FBQTtBQUVOLFFBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQTtJQUFBLElBQUcsS0FBQSxHQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixDQUFYO01BRUksTUFBQSxHQUNJO1FBQUEsSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFULENBQWlCLGNBQWpCLEVBQWlDLEVBQWpDLENBQU47UUFDQSxJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FEWjtRQUVBLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUZaO1FBR0EsR0FBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBO01BSFo7TUFLSixPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFBOEIsTUFBOUI7TUFFQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBTSxDQUFDLElBQWpCLENBQUEsS0FBMEIsSUFBN0I7UUFFSSxVQUFBLEdBQWEsUUFBQSxDQUFTLE1BQU0sQ0FBQyxJQUFoQixFQUFzQixNQUFNLENBQUMsSUFBN0IsRUFBbUMsTUFBTSxDQUFDLEdBQTFDO1FBRWIsSUFBRyxrQkFBSDtVQUNJLE1BQU0sQ0FBQyxJQUFQLEdBQWMsVUFBVyxDQUFBLENBQUE7VUFDekIsTUFBTSxDQUFDLElBQVAsR0FBYyxVQUFXLENBQUEsQ0FBQTtVQUN6QixNQUFNLENBQUMsR0FBUCxHQUFjLFVBQVcsQ0FBQSxDQUFBLEVBSDdCO1NBSko7T0FWSjtLQUFBLE1BbUJLLElBQUcsS0FBQSxHQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixDQUFYO01BRUQsTUFBQSxHQUNJO1FBQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBTSxDQUFBLENBQUEsQ0FBakIsQ0FBTjtRQUNBLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQURaO1FBRUEsSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBRlo7UUFHQSxHQUFBLEVBQU0sS0FBTSxDQUFBLENBQUE7TUFIWjtNQUtKLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWixFQUF3QixJQUF4QixFQUE4QixNQUE5QjtNQUVBLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFNLENBQUMsSUFBakIsQ0FBQSxLQUEwQixJQUE3QjtRQUVJLFVBQUEsR0FBYSxRQUFBLENBQVMsTUFBTSxDQUFDLElBQWhCLEVBQXNCLE1BQU0sQ0FBQyxJQUE3QixFQUFtQyxNQUFNLENBQUMsR0FBMUM7UUFFYixJQUFHLGtCQUFIO1VBQ0ksTUFBTSxDQUFDLElBQVAsR0FBYyxVQUFXLENBQUEsQ0FBQTtVQUN6QixNQUFNLENBQUMsSUFBUCxHQUFjLFVBQVcsQ0FBQSxDQUFBO1VBQ3pCLE1BQU0sQ0FBQyxHQUFQLEdBQWMsVUFBVyxDQUFBLENBQUEsRUFIN0I7U0FKSjtPQVZDOztXQWtCTDtFQXZDTSxFQTFDVjs7Ozs7OztFQXlGQSxVQUFBLEdBQWEsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUVULFFBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtJQUFBLEtBQUEsR0FBUTtBQUVSO0lBQUEsS0FBQSxxQ0FBQTs7TUFFSSxJQUFHLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUFSO1FBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFBLENBQUEsQ0FBVSxDQUFDLENBQUMsTUFBRixDQUFTLEVBQUUsQ0FBQyxJQUFaLEVBQWtCLEVBQWxCLENBQVYsRUFBQSxDQUFBLENBQWtDLEVBQUUsQ0FBQyxJQUFyQyxDQUEwQyxDQUExQyxDQUFBLENBQTZDLEVBQUUsQ0FBQyxJQUFoRCxDQUFBLENBQVgsRUFESjtPQUFBLE1BQUE7UUFHSSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFISjs7SUFGSjtXQU9BLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtFQVhTLEVBekZiOzs7Ozs7O0VBNEdBLFVBQUEsR0FBYSxRQUFBLENBQUMsR0FBRCxDQUFBO0FBRVQsUUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLFNBQUEsRUFBQTtJQUFBLEtBQUEsR0FBUTtJQUNSLElBQUEsR0FBUTtBQUVSO0lBQUEsS0FBQSxxQ0FBQTs7TUFFSSxJQUFHLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUFSO1FBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLEVBREo7T0FBQSxNQUFBO1FBR0ksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBSEo7O0lBRko7V0FPQTtNQUFBLEtBQUEsRUFBUSxLQUFSO01BQ0EsSUFBQSxFQUFRLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtJQURSO0VBWlMsRUE1R2I7Ozs7Ozs7O0VBaUlBLFFBQUEsR0FBVyxRQUFBLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsUUFBTSxDQUF2QixDQUFBO0FBRVAsUUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQTtJQUFBLE1BQUEsR0FBUyxRQUFBLENBQVMsTUFBVDtJQUNULEtBQUEsR0FBUyxRQUFBLENBQVMsS0FBVDtJQUVULFVBQUEsR0FBYSxLQUFLLENBQUMsS0FBTixDQUFZLE1BQVo7SUFDYixVQUFBLEdBQWE7SUFDYixTQUFBLEdBQWE7SUFFYixJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLE1BQWpCLENBQUg7TUFDSSxPQUFBLCtFQUErRCxDQUFFLFFBQXZELENBQUE7TUFDVixJQUFHLEtBQUEsQ0FBTSxPQUFOLENBQUg7UUFDSSxzQkFBd0YsT0FBTyxDQUFFLE9BQVEsQ0FBQSxDQUFBLFVBQXpHO1VBQUEsT0FBTyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQWhCLEdBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FBWCxvQkFBOEIsT0FBTyxDQUFFLE9BQVEsQ0FBQSxDQUFBLFVBQS9DLENBQWQsRUFBckI7O1FBQ0EsUUFBQSxHQUFXLElBQUksU0FBUyxDQUFDLGlCQUFkLENBQWdDLE9BQWhDO1FBQ1gsSUFBRyxRQUFRLENBQUMsbUJBQVo7VUFDSSxHQUFBLEdBQU0sUUFBUSxDQUFDLG1CQUFULENBQTZCO1lBQUEsSUFBQSxFQUFLLE1BQUw7WUFBYSxNQUFBLEVBQU8sS0FBcEI7WUFBMkIsSUFBQSxFQUFLLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztVQUE1RCxDQUE3QjtVQUNOLElBQUcsS0FBQSxDQUFNLEdBQUcsQ0FBQyxJQUFWLENBQUEsSUFBb0IsS0FBQSxDQUFNLEdBQUcsQ0FBQyxNQUFWLENBQXZCO1lBQ0ksVUFBQSxHQUFhLEtBQUssQ0FBQyxLQUFOLENBQVksT0FBTyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQTVCO1lBQ2IsVUFBQSxHQUFhLEdBQUcsQ0FBQztZQUNqQixTQUFBLEdBQWEsR0FBRyxDQUFDLE9BSHJCO1dBQUEsTUFBQTtZQUtJLEdBQUEsQ0FBSSxhQUFKLEVBQW1CLEdBQW5CLEVBTEo7V0FGSjtTQUFBLE1BQUE7VUFTSSxHQUFBLENBQUksaUNBQUosRUFBdUMsT0FBdkM7VUFDQSxHQUFBLENBQUksaUNBQUosRUFBdUMsUUFBdkMsRUFWSjtTQUhKO09BRko7O1dBaUJBLENBQUMsVUFBRCxFQUFhLFVBQWIsRUFBeUIsU0FBekI7RUExQk8sRUFqSVg7Ozs7Ozs7RUFtS0EsSUFBQSxHQUFPLFFBQUEsQ0FBQyxVQUFELEVBQWEsVUFBYixFQUF5QixZQUFVLENBQW5DLENBQUE7QUFFSCxRQUFBLFFBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0lBQUEsTUFBQSxHQUFTLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFlBQW5CLEVBQWlDLE1BQWpDO0lBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixFQUE0QixLQUE1QjtJQUVULElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFqQixDQUFQO0FBQ0ksYUFBTyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixFQURYOztJQUdBLElBQU8sa0JBQVA7QUFBd0IsYUFBTyxPQUEvQjs7SUFFQSxPQUFBLCtFQUErRCxDQUFFLFFBQXZELENBQUE7SUFDVixJQUFHLEtBQUEsQ0FBTSxPQUFOLENBQUg7TUFDSSxzQkFBd0YsT0FBTyxDQUFFLE9BQVEsQ0FBQSxDQUFBLFVBQXpHO1FBQUEsT0FBTyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQWhCLEdBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FBWCxvQkFBOEIsT0FBTyxDQUFFLE9BQVEsQ0FBQSxDQUFBLFVBQS9DLENBQWQsRUFBckI7O01BQ0EsUUFBQSxHQUFXLElBQUksU0FBUyxDQUFDLGlCQUFkLENBQWdDLE9BQWhDO01BQ1gsSUFBRyx1RUFBSDtRQUNJLElBQUEsR0FBTyxRQUFRLENBQUMsd0JBQVQsQ0FBa0M7VUFBQSxNQUFBLEVBQU8sT0FBTyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQXZCO1VBQTJCLElBQUEsRUFBSyxVQUFoQztRQUFBLENBQWxDO1FBQ1AsSUFBRyxLQUFBLENBQU0sSUFBTixDQUFIO0FBQ0ksaUJBQU8sQ0FBQyxNQUFELGlDQUFnQixDQUFFLGFBQWxCLGlDQUErQixDQUFFLGVBQWpDLEVBRFg7U0FBQSxNQUFBO1VBR0ksR0FBQSxDQUFJLFlBQUosRUFISjtTQUZKO09BQUEsTUFBQTtRQU9JLEdBQUEsQ0FBSSxnQ0FBSixFQUFzQyxRQUF0QyxFQVBKO09BSEo7O1dBWUEsQ0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLElBQWY7RUF2Qkc7O0VBeUJQLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxJQUFBLEVBQVksSUFBWjtJQUNBLFFBQUEsRUFBWSxRQURaO0lBRUEsVUFBQSxFQUFZLFVBRlo7SUFHQSxVQUFBLEVBQVksVUFIWjtJQUlBLE1BQUEsRUFBWTtFQUpaO0FBN0xKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIyNcblxueyBmcywgdmFsaWQsIGVtcHR5LCBzbGFzaCwgc3RyLCBsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5zb3VyY2VNYXAgID0gcmVxdWlyZSAnc291cmNlLW1hcCdcbm1hcENvbnZlcnQgPSByZXF1aXJlICdjb252ZXJ0LXNvdXJjZS1tYXAnXG5cbnJlZ2V4MSAgICAgPSAvXlxccythdFxccysoXFxTKylcXHMrXFwoKC4qKTooXFxkKyk6KFxcZCspXFwpL1xyXG5yZWdleDIgICAgID0gL15cXHMrYXRcXHMrKC4qKTooXFxkKyk6KFxcZCspL1xyXG5cbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuXG5sb2dFcnIgPSAoZXJyLCBzZXA9J/CfkqUnKSAtPlxuICAgIFxuICAgIGNvbnNvbGUubG9nIGVycm9yU3RhY2sgZXJyXG4gICAgdHJhY2UgPSBlcnJvclRyYWNlIGVyclxuICAgIGNvbnNvbGUubG9nICd0cmFjZTonLCBzdHIodHJhY2UpXG4gICAgaWYgdmFsaWQgdHJhY2UubGluZXNcbiAgICAgICAgbG9nLmZsb2cgc3RyOnRyYWNlLnRleHQsIHNvdXJjZTp0cmFjZS5saW5lc1swXS5maWxlLCBsaW5lOnRyYWNlLmxpbmVzWzBdLmxpbmUsIHNlcDpzZXBcbiAgICAgICAgZm9yIGxpbmUgaW4gdHJhY2UubGluZXNcbiAgICAgICAgICAgIHNlcCA9IGlmIHNsYXNoLmlzQWJzb2x1dGUobGluZS5maWxlKSBvciBsaW5lLmZpbGVbMF09PSd+JyB0aGVuICfwn5CeJyBlbHNlICfwn5S8J1xuICAgICAgICAgICAgaWYgc2VwID09ICfwn5CeJyBvciBsaW5lLmZpbGVbMF0gPT0gJy4nXG4gICAgICAgICAgICAgICAgbG9nLmZsb2cgc3RyOicgICAgICAgJytsaW5lLmZ1bmMsIHNvdXJjZTpsaW5lLmZpbGUsIGxpbmU6bGluZS5saW5lLCBzZXA6c2VwXG4gICAgZWxzZVxuICAgICAgICBsb2cuZmxvZyBzdHI6dHJhY2UudGV4dCwgc291cmNlOicnLCBsaW5lOjAsIHNlcDpzZXBcblxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbmZpbGVQb3MgPSAobGluZSkgLT5cblxuICAgIGlmIG1hdGNoID0gcmVnZXgxLmV4ZWMgbGluZVxuICAgICAgICBcbiAgICAgICAgcmVzdWx0ID1cbiAgICAgICAgICAgIGZ1bmM6IG1hdGNoWzFdLnJlcGxhY2UgJy48YW5vbnltb3VzPicsICcnXG4gICAgICAgICAgICBmaWxlOiBtYXRjaFsyXVxyXG4gICAgICAgICAgICBsaW5lOiBtYXRjaFszXVxyXG4gICAgICAgICAgICBjb2w6ICBtYXRjaFs0XVxyXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyAnZmlsZVBvczEnLCBsaW5lLCByZXN1bHRcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmV4dChyZXN1bHQuZmlsZSkgPT0gJ2pzJ1xyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG1hcHBlZExpbmUgPSB0b0NvZmZlZSByZXN1bHQuZmlsZSwgcmVzdWx0LmxpbmUsIHJlc3VsdC5jb2xcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbWFwcGVkTGluZT9cbiAgICAgICAgICAgICAgICByZXN1bHQuZmlsZSA9IG1hcHBlZExpbmVbMF1cbiAgICAgICAgICAgICAgICByZXN1bHQubGluZSA9IG1hcHBlZExpbmVbMV1cbiAgICAgICAgICAgICAgICByZXN1bHQuY29sICA9IG1hcHBlZExpbmVbMl1cblxuICAgIGVsc2UgaWYgbWF0Y2ggPSByZWdleDIuZXhlYyBsaW5lXG4gICAgICAgIFxuICAgICAgICByZXN1bHQgPVxuICAgICAgICAgICAgZnVuYzogc2xhc2guZmlsZSBtYXRjaFsxXVxuICAgICAgICAgICAgZmlsZTogbWF0Y2hbMV1cclxuICAgICAgICAgICAgbGluZTogbWF0Y2hbMl1cclxuICAgICAgICAgICAgY29sOiAgbWF0Y2hbM11cclxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2cgJ2ZpbGVQb3MyJywgbGluZSwgcmVzdWx0XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guZXh0KHJlc3VsdC5maWxlKSA9PSAnanMnXHJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWFwcGVkTGluZSA9IHRvQ29mZmVlIHJlc3VsdC5maWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtYXBwZWRMaW5lP1xuICAgICAgICAgICAgICAgIHJlc3VsdC5maWxlID0gbWFwcGVkTGluZVswXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5saW5lID0gbWFwcGVkTGluZVsxXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5jb2wgID0gbWFwcGVkTGluZVsyXVxuICAgIHJlc3VsdFxuXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmVycm9yU3RhY2sgPSAoZXJyKSAtPlxuICAgIFxuICAgIGxpbmVzID0gW11cclxuICAgIFxuICAgIGZvciBzdGFja0xpbmUgaW4gZXJyLnN0YWNrLnNwbGl0ICdcXG4nIFxyXG4gICAgICAgIFxuICAgICAgICBpZiBmcCA9IGZpbGVQb3Mgc3RhY2tMaW5lXG4gICAgICAgICAgICBsaW5lcy5wdXNoIFwiICAgICAgICN7Xy5wYWRFbmQgZnAuZnVuYywgMzB9ICN7ZnAuZmlsZX06I3tmcC5saW5lfVwiIFxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbGluZXMucHVzaCBzdGFja0xpbmUgXHJcblxyICBcbiAgICBsaW5lcy5qb2luICdcXG4nXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuZXJyb3JUcmFjZSA9IChlcnIpIC0+XG4gICAgXG4gICAgbGluZXMgPSBbXVxyXG4gICAgdGV4dCAgPSBbXVxuXG4gICAgZm9yIHN0YWNrTGluZSBpbiBlcnIuc3RhY2suc3BsaXQgJ1xcbicgXHJcbiAgICAgICAgXG4gICAgICAgIGlmIGZwID0gZmlsZVBvcyBzdGFja0xpbmVcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggZnBcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0ZXh0LnB1c2ggc3RhY2tMaW5lIFxyXG5cciAgXG4gICAgbGluZXM6ICBsaW5lc1xuICAgIHRleHQ6ICAgdGV4dC5qb2luICdcXG4nXG4gICAgXG4jIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnRvQ29mZmVlID0gKGpzRmlsZSwganNMaW5lLCBqc0NvbD0wKSAtPlxuXG4gICAganNMaW5lID0gcGFyc2VJbnQganNMaW5lXG4gICAganNDb2wgID0gcGFyc2VJbnQganNDb2xcbiAgICBcbiAgICBjb2ZmZWVGaWxlID0gc2xhc2gudGlsZGUganNGaWxlXG4gICAgY29mZmVlTGluZSA9IGpzTGluZVxuICAgIGNvZmZlZUNvbCAgPSBqc0NvbFxuICAgICAgICBcbiAgICBpZiBzbGFzaC5maWxlRXhpc3RzIGpzRmlsZVxuICAgICAgICBtYXBEYXRhID0gbWFwQ29udmVydC5mcm9tU291cmNlKGZzLnJlYWRGaWxlU3luYyBqc0ZpbGUsICd1dGY4Jyk/LnRvT2JqZWN0KClcbiAgICAgICAgaWYgdmFsaWQgbWFwRGF0YVxuICAgICAgICAgICAgbWFwRGF0YS5zb3VyY2VzWzBdID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLmRpcihqc0ZpbGUpLCBtYXBEYXRhPy5zb3VyY2VzWzBdIGlmIG1hcERhdGE/LnNvdXJjZXNbMF1cbiAgICAgICAgICAgIGNvbnN1bWVyID0gbmV3IHNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lciBtYXBEYXRhXG4gICAgICAgICAgICBpZiBjb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yXG4gICAgICAgICAgICAgICAgcG9zID0gY29uc3VtZXIub3JpZ2luYWxQb3NpdGlvbkZvciBsaW5lOmpzTGluZSwgY29sdW1uOmpzQ29sLCBiaWFzOnNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORFxuICAgICAgICAgICAgICAgIGlmIHZhbGlkKHBvcy5saW5lKSBhbmQgdmFsaWQocG9zLmNvbHVtbilcbiAgICAgICAgICAgICAgICAgICAgY29mZmVlRmlsZSA9IHNsYXNoLnRpbGRlIG1hcERhdGEuc291cmNlc1swXVxuICAgICAgICAgICAgICAgICAgICBjb2ZmZWVMaW5lID0gcG9zLmxpbmUgXG4gICAgICAgICAgICAgICAgICAgIGNvZmZlZUNvbCAgPSBwb3MuY29sdW1uXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgJ25vIHBvcy5saW5lJywgcG9zXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nICdubyBjb25zdW1lciBvcmlnaW5hbFBvc2l0aW9uRm9yJywgbWFwRGF0YVxuICAgICAgICAgICAgICAgIGxvZyAnbm8gY29uc3VtZXIgb3JpZ2luYWxQb3NpdGlvbkZvcicsIGNvbnN1bWVyXG4gICAgICAgIFxuICAgIFtjb2ZmZWVGaWxlLCBjb2ZmZWVMaW5lLCBjb2ZmZWVDb2xdXG5cbiMgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAgICAgIDAwMCAgIDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgICAgICAgMDAwICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAgICAgICAwMDAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAgICAwMDAgICAgICAwMDAwMDAwICAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnRvSnMgPSAoY29mZmVlRmlsZSwgY29mZmVlTGluZSwgY29mZmVlQ29sPTApIC0+XG4gICAgXG4gICAganNGaWxlID0gY29mZmVlRmlsZS5yZXBsYWNlIC9cXC9jb2ZmZWVcXC8vLCAnL2pzLydcbiAgICBqc0ZpbGUgPSBqc0ZpbGUucmVwbGFjZSAvXFwuY29mZmVlJC8sICcuanMnXG4gICAgXG4gICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMganNGaWxlXG4gICAgICAgIHJldHVybiBbbnVsbCwgbnVsbCwgbnVsbF1cbiAgICAgICAgXG4gICAgaWYgbm90IGNvZmZlZUxpbmU/IHRoZW4gcmV0dXJuIGpzRmlsZVxuICAgIFxuICAgIG1hcERhdGEgPSBtYXBDb252ZXJ0LmZyb21Tb3VyY2UoZnMucmVhZEZpbGVTeW5jIGpzRmlsZSwgJ3V0ZjgnKT8udG9PYmplY3QoKVxuICAgIGlmIHZhbGlkIG1hcERhdGFcbiAgICAgICAgbWFwRGF0YS5zb3VyY2VzWzBdID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLmRpcihqc0ZpbGUpLCBtYXBEYXRhPy5zb3VyY2VzWzBdIGlmIG1hcERhdGE/LnNvdXJjZXNbMF1cbiAgICAgICAgY29uc3VtZXIgPSBuZXcgc291cmNlTWFwLlNvdXJjZU1hcENvbnN1bWVyIG1hcERhdGFcbiAgICAgICAgaWYgY29uc3VtZXI/LmFsbEdlbmVyYXRlZFBvc2l0aW9uc0Zvcj9cbiAgICAgICAgICAgIHBvc3MgPSBjb25zdW1lci5hbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3Igc291cmNlOm1hcERhdGEuc291cmNlc1swXSwgbGluZTpjb2ZmZWVMaW5lIywgY29sdW1uOmNvZmZlZUNvbFxuICAgICAgICAgICAgaWYgdmFsaWQgcG9zc1xuICAgICAgICAgICAgICAgIHJldHVybiBbanNGaWxlLCBwb3NzWzBdPy5saW5lLCBwb3NzWzBdPy5jb2x1bW5dXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nICdlbXB0eSBwb3NzJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ25vIGFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvciBpbicsIGNvbnN1bWVyXG4gICAgICAgIFxuICAgIFtqc0ZpbGUsIG51bGwsIG51bGxdXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPVxuICAgIHRvSnM6ICAgICAgIHRvSnNcbiAgICB0b0NvZmZlZTogICB0b0NvZmZlZVxuICAgIGVycm9yU3RhY2s6IGVycm9yU3RhY2tcbiAgICBlcnJvclRyYWNlOiBlcnJvclRyYWNlXG4gICAgbG9nRXJyOiAgICAgbG9nRXJyXG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/srcmap.coffee