(function() {
  /*
   0000000  00000000    0000000  00     00   0000000   00000000   
  000       000   000  000       000   000  000   000  000   000  
  0000000   0000000    000       000000000  000000000  00000000   
       000  000   000  000       000 0 000  000   000  000        
  0000000   000   000   0000000  000   000  000   000  000        
  */
  var _, empty, errorStack, errorTrace, filePos, fs, log, logErr, mapConvert, regex1, regex2, slash, sourceMap, toCoffee, toJs, valid;

  ({fs, valid, empty, slash, log, _} = require('./kxk'));

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
    log.ulog({
      str: trace.text,
      source: trace.lines[0].file,
      line: trace.lines[0].line,
      sep: sep
    });
    ref = trace.lines;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      sep = slash.isAbsolute(line.file) ? '🐞' : '🔼';
      if (sep === '🐞' || line.file[0] === '.') {
        results.push(log.ulog({
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
    console.log(err.stack);
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
    coffeeFile = slash.path(jsFile);
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
            coffeeFile = mapData.sources[0];
            coffeeLine = pos.line;
            coffeeCol = pos.column;
          } else {
            log('no pos.line', pos);
          }
        } else {
          log('no consumer originalPositionFor');
        }
      }
    }
    // else
    // log 'no mapData', jsFile
    // else
    // log 'no jsFile', jsFile 
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
    // else
    // log 'no mapData'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjbWFwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9zcmNtYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxFQUFGLEVBQU0sS0FBTixFQUFhLEtBQWIsRUFBb0IsS0FBcEIsRUFBMkIsR0FBM0IsRUFBZ0MsQ0FBaEMsQ0FBQSxHQUFzQyxPQUFBLENBQVEsT0FBUixDQUF0Qzs7RUFFQSxTQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxvQkFBUjs7RUFFYixNQUFBLEdBQWE7O0VBQ2IsTUFBQSxHQUFhLDRCQWRiOzs7Ozs7O0VBc0JBLE1BQUEsR0FBUyxRQUFBLENBQUMsR0FBRCxFQUFNLE1BQUksSUFBVixDQUFBO0FBRUwsUUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLENBQVcsR0FBWCxDQUFaO0lBQ0EsS0FBQSxHQUFRLFVBQUEsQ0FBVyxHQUFYO0lBQ1IsR0FBRyxDQUFDLElBQUosQ0FBUztNQUFBLEdBQUEsRUFBSSxLQUFLLENBQUMsSUFBVjtNQUFnQixNQUFBLEVBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUF0QztNQUE0QyxJQUFBLEVBQUssS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFoRTtNQUFzRSxHQUFBLEVBQUk7SUFBMUUsQ0FBVDtBQUNBO0FBQUE7SUFBQSxL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LFFBQXRDLEVBUEo7T0FISjtLQVRBOzs7V0F1QkEsQ0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLElBQWY7RUF6Qkc7O0VBMkJQLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxJQUFBLEVBQVksSUFBWjtJQUNBLFFBQUEsRUFBWSxRQURaO0lBRUEsVUFBQSxFQUFZLFVBRlo7SUFHQSxVQUFBLEVBQVksVUFIWjtJQUlBLE1BQUEsRUFBWTtFQUpaO0FBNUxKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIyNcblxueyBmcywgdmFsaWQsIGVtcHR5LCBzbGFzaCwgbG9nLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuc291cmNlTWFwICA9IHJlcXVpcmUgJ3NvdXJjZS1tYXAnXG5tYXBDb252ZXJ0ID0gcmVxdWlyZSAnY29udmVydC1zb3VyY2UtbWFwJ1xuXG5yZWdleDEgICAgID0gL15cXHMrYXRcXHMrKFxcUyspXFxzK1xcKCguKik6KFxcZCspOihcXGQrKVxcKS9cclxucmVnZXgyICAgICA9IC9eXFxzK2F0XFxzKyguKik6KFxcZCspOihcXGQrKS9cclxuXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcblxubG9nRXJyID0gKGVyciwgc2VwPSfwn5KlJykgLT5cbiAgICBcbiAgICBjb25zb2xlLmxvZyBlcnJvclN0YWNrIGVyclxuICAgIHRyYWNlID0gZXJyb3JUcmFjZSBlcnJcbiAgICBsb2cudWxvZyBzdHI6dHJhY2UudGV4dCwgc291cmNlOnRyYWNlLmxpbmVzWzBdLmZpbGUsIGxpbmU6dHJhY2UubGluZXNbMF0ubGluZSwgc2VwOnNlcFxuICAgIGZvciBsaW5lIGluIHRyYWNlLmxpbmVzXG4gICAgICAgIHNlcCA9IGlmIHNsYXNoLmlzQWJzb2x1dGUgbGluZS5maWxlIHRoZW4gJ/CfkJ4nIGVsc2UgJ/CflLwnXG4gICAgICAgIGlmIHNlcCA9PSAn8J+Qnicgb3IgbGluZS5maWxlWzBdID09ICcuJ1xuICAgICAgICAgICAgbG9nLnVsb2cgc3RyOicgICAgICAgJytsaW5lLmZ1bmMsIHNvdXJjZTpsaW5lLmZpbGUsIGxpbmU6bGluZS5saW5lLCBzZXA6c2VwXG5cbiMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5maWxlUG9zID0gKGxpbmUpIC0+XG5cbiAgICBpZiBtYXRjaCA9IHJlZ2V4MS5leGVjIGxpbmVcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICBmdW5jOiBtYXRjaFsxXS5yZXBsYWNlICcuPGFub255bW91cz4nLCAnJ1xuICAgICAgICAgICAgZmlsZTogbWF0Y2hbMl1cclxuICAgICAgICAgICAgbGluZTogbWF0Y2hbM11cclxuICAgICAgICAgICAgY29sOiAgbWF0Y2hbNF1cclxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guZXh0KHJlc3VsdC5maWxlKSA9PSAnanMnXHJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWFwcGVkTGluZSA9IHRvQ29mZmVlIHJlc3VsdC5maWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtYXBwZWRMaW5lP1xuICAgICAgICAgICAgICAgIHJlc3VsdC5maWxlID0gbWFwcGVkTGluZVswXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5saW5lID0gbWFwcGVkTGluZVsxXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5jb2wgID0gbWFwcGVkTGluZVsyXVxuXG4gICAgZWxzZSBpZiBtYXRjaCA9IHJlZ2V4Mi5leGVjIGxpbmVcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICBmdW5jOiBzbGFzaC5maWxlIG1hdGNoWzFdXG4gICAgICAgICAgICBmaWxlOiBtYXRjaFsxXVxyXG4gICAgICAgICAgICBsaW5lOiBtYXRjaFsyXVxyXG4gICAgICAgICAgICBjb2w6ICBtYXRjaFszXVxyXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5leHQocmVzdWx0LmZpbGUpID09ICdqcydcclxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtYXBwZWRMaW5lID0gdG9Db2ZmZWUgcmVzdWx0LmZpbGUsIHJlc3VsdC5saW5lLCByZXN1bHQuY29sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG1hcHBlZExpbmU/XG4gICAgICAgICAgICAgICAgcmVzdWx0LmZpbGUgPSBtYXBwZWRMaW5lWzBdXG4gICAgICAgICAgICAgICAgcmVzdWx0LmxpbmUgPSBtYXBwZWRMaW5lWzFdXG4gICAgICAgICAgICAgICAgcmVzdWx0LmNvbCAgPSBtYXBwZWRMaW5lWzJdXG4gICAgcmVzdWx0XG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuZXJyb3JTdGFjayA9IChlcnIpIC0+XG4gICAgXG4gICAgbGluZXMgPSBbXVxyXG4gICAgXG4gICAgZm9yIHN0YWNrTGluZSBpbiBlcnIuc3RhY2suc3BsaXQgJ1xcbicgXHJcbiAgICAgICAgXG4gICAgICAgIGlmIGZwID0gZmlsZVBvcyBzdGFja0xpbmVcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggXCIgICAgICAgI3tfLnBhZEVuZCBmcC5mdW5jLCAzMH0gI3tmcC5maWxlfToje2ZwLmxpbmV9XCIgXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBsaW5lcy5wdXNoIHN0YWNrTGluZSBcclxuXHIgIFxuICAgIGxpbmVzLmpvaW4gJ1xcbidcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5lcnJvclRyYWNlID0gKGVycikgLT5cbiAgICBcbiAgICBsaW5lcyA9IFtdXHJcbiAgICB0ZXh0ICA9IFtdXG5cbiAgICBjb25zb2xlLmxvZyBlcnIuc3RhY2tcbiAgICBcbiAgICBmb3Igc3RhY2tMaW5lIGluIGVyci5zdGFjay5zcGxpdCAnXFxuJyBcclxuICAgICAgICBcbiAgICAgICAgaWYgZnAgPSBmaWxlUG9zIHN0YWNrTGluZVxuICAgICAgICAgICAgbGluZXMucHVzaCBmcFxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRleHQucHVzaCBzdGFja0xpbmUgXHJcblxyICBcbiAgICBsaW5lczogIGxpbmVzXG4gICAgdGV4dDogICB0ZXh0LmpvaW4gJ1xcbidcbiAgICBcbiMgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcblxudG9Db2ZmZWUgPSAoanNGaWxlLCBqc0xpbmUsIGpzQ29sPTApIC0+XG5cbiAgICBqc0xpbmUgPSBwYXJzZUludCBqc0xpbmVcbiAgICBqc0NvbCAgPSBwYXJzZUludCBqc0NvbFxuICAgIFxuICAgIGNvZmZlZUZpbGUgPSBzbGFzaC5wYXRoIGpzRmlsZVxuICAgIGNvZmZlZUxpbmUgPSBqc0xpbmVcbiAgICBjb2ZmZWVDb2wgID0ganNDb2xcbiAgICAgICAgXG4gICAgaWYgc2xhc2guZmlsZUV4aXN0cyBqc0ZpbGVcbiAgICAgICAgbWFwRGF0YSA9IG1hcENvbnZlcnQuZnJvbVNvdXJjZShmcy5yZWFkRmlsZVN5bmMganNGaWxlLCAndXRmOCcpPy50b09iamVjdCgpXG4gICAgICAgIGlmIHZhbGlkIG1hcERhdGFcbiAgICAgICAgICAgIG1hcERhdGEuc291cmNlc1swXSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC5kaXIoanNGaWxlKSwgbWFwRGF0YT8uc291cmNlc1swXSBpZiBtYXBEYXRhPy5zb3VyY2VzWzBdXG4gICAgICAgICAgICBjb25zdW1lciA9IG5ldyBzb3VyY2VNYXAuU291cmNlTWFwQ29uc3VtZXIgbWFwRGF0YVxuICAgICAgICAgICAgaWYgY29uc3VtZXIub3JpZ2luYWxQb3NpdGlvbkZvclxuICAgICAgICAgICAgICAgIHBvcyA9IGNvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3IgbGluZTpqc0xpbmUsIGNvbHVtbjpqc0NvbCwgYmlhczpzb3VyY2VNYXAuU291cmNlTWFwQ29uc3VtZXIuTEVBU1RfVVBQRVJfQk9VTkRcbiAgICAgICAgICAgICAgICBpZiB2YWxpZChwb3MubGluZSkgYW5kIHZhbGlkKHBvcy5jb2x1bW4pXG4gICAgICAgICAgICAgICAgICAgIGNvZmZlZUZpbGUgPSBtYXBEYXRhLnNvdXJjZXNbMF1cbiAgICAgICAgICAgICAgICAgICAgY29mZmVlTGluZSA9IHBvcy5saW5lIFxuICAgICAgICAgICAgICAgICAgICBjb2ZmZWVDb2wgID0gcG9zLmNvbHVtblxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nICdubyBwb3MubGluZScsIHBvc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZyAnbm8gY29uc3VtZXIgb3JpZ2luYWxQb3NpdGlvbkZvcidcbiAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAjIGxvZyAnbm8gbWFwRGF0YScsIGpzRmlsZVxuICAgICMgZWxzZVxuICAgICAgICAjIGxvZyAnbm8ganNGaWxlJywganNGaWxlIFxuICAgICAgICBcbiAgICBbY29mZmVlRmlsZSwgY29mZmVlTGluZSwgY29mZmVlQ29sXVxuXG4jIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgICAgICAwMDAgICAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgICAgICAgMDAwICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgICAgMDAwICAgICAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG50b0pzID0gKGNvZmZlZUZpbGUsIGNvZmZlZUxpbmUsIGNvZmZlZUNvbD0wKSAtPlxuICAgIFxuICAgIGpzRmlsZSA9IGNvZmZlZUZpbGUucmVwbGFjZSAvXFwvY29mZmVlXFwvLywgJy9qcy8nXG4gICAganNGaWxlID0ganNGaWxlLnJlcGxhY2UgL1xcLmNvZmZlZSQvLCAnLmpzJ1xuICAgIFxuICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIGpzRmlsZVxuICAgICAgICByZXR1cm4gW251bGwsIG51bGwsIG51bGxdXG4gICAgICAgIFxuICAgIGlmIG5vdCBjb2ZmZWVMaW5lPyB0aGVuIHJldHVybiBqc0ZpbGVcbiAgICBcbiAgICBtYXBEYXRhID0gbWFwQ29udmVydC5mcm9tU291cmNlKGZzLnJlYWRGaWxlU3luYyBqc0ZpbGUsICd1dGY4Jyk/LnRvT2JqZWN0KClcbiAgICBpZiB2YWxpZCBtYXBEYXRhXG4gICAgICAgIG1hcERhdGEuc291cmNlc1swXSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC5kaXIoanNGaWxlKSwgbWFwRGF0YT8uc291cmNlc1swXSBpZiBtYXBEYXRhPy5zb3VyY2VzWzBdXG4gICAgICAgIGNvbnN1bWVyID0gbmV3IHNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lciBtYXBEYXRhXG4gICAgICAgIGlmIGNvbnN1bWVyPy5hbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3I/XG4gICAgICAgICAgICBwb3NzID0gY29uc3VtZXIuYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yIHNvdXJjZTptYXBEYXRhLnNvdXJjZXNbMF0sIGxpbmU6Y29mZmVlTGluZSMsIGNvbHVtbjpjb2ZmZWVDb2xcbiAgICAgICAgICAgIGlmIHZhbGlkIHBvc3NcbiAgICAgICAgICAgICAgICByZXR1cm4gW2pzRmlsZSwgcG9zc1swXT8ubGluZSwgcG9zc1swXT8uY29sdW1uXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZyAnZW1wdHkgcG9zcydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9nICdubyBhbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IgaW4nLCBjb25zdW1lclxuICAgICMgZWxzZVxuICAgICAgICAjIGxvZyAnbm8gbWFwRGF0YSdcbiAgICAgICAgXG4gICAgW2pzRmlsZSwgbnVsbCwgbnVsbF1cbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgdG9KczogICAgICAgdG9Kc1xuICAgIHRvQ29mZmVlOiAgIHRvQ29mZmVlXG4gICAgZXJyb3JTdGFjazogZXJyb3JTdGFja1xuICAgIGVycm9yVHJhY2U6IGVycm9yVHJhY2VcbiAgICBsb2dFcnI6ICAgICBsb2dFcnJcbiAgICBcbiAgICAiXX0=
//# sourceURL=../coffee/srcmap.coffee