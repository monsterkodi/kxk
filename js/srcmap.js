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
      } else {
        log('no mapData', jsFile);
      }
    } else {
      log('no jsFile', jsFile);
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
    } else {
      log('no mapData');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjbWFwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9zcmNtYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxFQUFGLEVBQU0sS0FBTixFQUFhLEtBQWIsRUFBb0IsS0FBcEIsRUFBMkIsR0FBM0IsRUFBZ0MsQ0FBaEMsQ0FBQSxHQUFzQyxPQUFBLENBQVEsT0FBUixDQUF0Qzs7RUFFQSxTQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxvQkFBUjs7RUFFYixNQUFBLEdBQWE7O0VBQ2IsTUFBQSxHQUFhLDRCQWRiOzs7Ozs7O0VBc0JBLE1BQUEsR0FBUyxRQUFBLENBQUMsR0FBRCxFQUFNLE1BQUksSUFBVixDQUFBO0FBRUwsUUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLENBQVcsR0FBWCxDQUFaO0lBQ0EsS0FBQSxHQUFRLFVBQUEsQ0FBVyxHQUFYO0lBQ1IsR0FBRyxDQUFDLElBQUosQ0FBUztNQUFBLEdBQUEsRUFBSSxLQUFLLENBQUMsSUFBVjtNQUFnQixNQUFBLEVBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUF0QztNQUE0QyxJQUFBLEVBQUssS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFoRTtNQUFzRSxHQUFBLEVBQUk7SUFBMUUsQ0FBVDtBQUNBO0FBQUE7SUFBQSxL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LGVBQWpDLEVBRFg7U0FBQSxNQUFBO1VBR0ksR0FBQSxDQUFJLFlBQUosRUFISjtTQUZKO09BQUEsTUFBQTtRQU9JLEdBQUEsQ0FBSSxnQ0FBSixFQUFzQyxRQUF0QyxFQVBKO09BSEo7S0FBQSxNQUFBO01BWUksR0FBQSxDQUFJLFlBQUosRUFaSjs7V0FjQSxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsSUFBZjtFQXpCRzs7RUEyQlAsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLElBQUEsRUFBWSxJQUFaO0lBQ0EsUUFBQSxFQUFZLFFBRFo7SUFFQSxVQUFBLEVBQVksVUFGWjtJQUdBLFVBQUEsRUFBWSxVQUhaO0lBSUEsTUFBQSxFQUFZO0VBSlo7QUE1TEoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMjI1xuXG57IGZzLCB2YWxpZCwgZW1wdHksIHNsYXNoLCBsb2csIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5zb3VyY2VNYXAgID0gcmVxdWlyZSAnc291cmNlLW1hcCdcbm1hcENvbnZlcnQgPSByZXF1aXJlICdjb252ZXJ0LXNvdXJjZS1tYXAnXG5cbnJlZ2V4MSAgICAgPSAvXlxccythdFxccysoXFxTKylcXHMrXFwoKC4qKTooXFxkKyk6KFxcZCspXFwpL1xyXG5yZWdleDIgICAgID0gL15cXHMrYXRcXHMrKC4qKTooXFxkKyk6KFxcZCspL1xyXG5cbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuXG5sb2dFcnIgPSAoZXJyLCBzZXA9J/CfkqUnKSAtPlxuICAgIFxuICAgIGNvbnNvbGUubG9nIGVycm9yU3RhY2sgZXJyXG4gICAgdHJhY2UgPSBlcnJvclRyYWNlIGVyclxuICAgIGxvZy51bG9nIHN0cjp0cmFjZS50ZXh0LCBzb3VyY2U6dHJhY2UubGluZXNbMF0uZmlsZSwgbGluZTp0cmFjZS5saW5lc1swXS5saW5lLCBzZXA6c2VwXG4gICAgZm9yIGxpbmUgaW4gdHJhY2UubGluZXNcbiAgICAgICAgc2VwID0gaWYgc2xhc2guaXNBYnNvbHV0ZSBsaW5lLmZpbGUgdGhlbiAn8J+QnicgZWxzZSAn8J+UvCdcbiAgICAgICAgaWYgc2VwID09ICfwn5CeJyBvciBsaW5lLmZpbGVbMF0gPT0gJy4nXG4gICAgICAgICAgICBsb2cudWxvZyBzdHI6JyAgICAgICAnK2xpbmUuZnVuYywgc291cmNlOmxpbmUuZmlsZSwgbGluZTpsaW5lLmxpbmUsIHNlcDpzZXBcblxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbmZpbGVQb3MgPSAobGluZSkgLT5cblxuICAgIGlmIG1hdGNoID0gcmVnZXgxLmV4ZWMgbGluZVxuICAgICAgICBcbiAgICAgICAgcmVzdWx0ID1cbiAgICAgICAgICAgIGZ1bmM6IG1hdGNoWzFdLnJlcGxhY2UgJy48YW5vbnltb3VzPicsICcnXG4gICAgICAgICAgICBmaWxlOiBtYXRjaFsyXVxyXG4gICAgICAgICAgICBsaW5lOiBtYXRjaFszXVxyXG4gICAgICAgICAgICBjb2w6ICBtYXRjaFs0XVxyXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5leHQocmVzdWx0LmZpbGUpID09ICdqcydcclxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtYXBwZWRMaW5lID0gdG9Db2ZmZWUgcmVzdWx0LmZpbGUsIHJlc3VsdC5saW5lLCByZXN1bHQuY29sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG1hcHBlZExpbmU/XG4gICAgICAgICAgICAgICAgcmVzdWx0LmZpbGUgPSBtYXBwZWRMaW5lWzBdXG4gICAgICAgICAgICAgICAgcmVzdWx0LmxpbmUgPSBtYXBwZWRMaW5lWzFdXG4gICAgICAgICAgICAgICAgcmVzdWx0LmNvbCAgPSBtYXBwZWRMaW5lWzJdXG5cbiAgICBlbHNlIGlmIG1hdGNoID0gcmVnZXgyLmV4ZWMgbGluZVxuICAgICAgICBcbiAgICAgICAgcmVzdWx0ID1cbiAgICAgICAgICAgIGZ1bmM6IHNsYXNoLmZpbGUgbWF0Y2hbMV1cbiAgICAgICAgICAgIGZpbGU6IG1hdGNoWzFdXHJcbiAgICAgICAgICAgIGxpbmU6IG1hdGNoWzJdXHJcbiAgICAgICAgICAgIGNvbDogIG1hdGNoWzNdXHJcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmV4dChyZXN1bHQuZmlsZSkgPT0gJ2pzJ1xyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG1hcHBlZExpbmUgPSB0b0NvZmZlZSByZXN1bHQuZmlsZSwgcmVzdWx0LmxpbmUsIHJlc3VsdC5jb2xcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbWFwcGVkTGluZT9cbiAgICAgICAgICAgICAgICByZXN1bHQuZmlsZSA9IG1hcHBlZExpbmVbMF1cbiAgICAgICAgICAgICAgICByZXN1bHQubGluZSA9IG1hcHBlZExpbmVbMV1cbiAgICAgICAgICAgICAgICByZXN1bHQuY29sICA9IG1hcHBlZExpbmVbMl1cbiAgICByZXN1bHRcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5lcnJvclN0YWNrID0gKGVycikgLT5cbiAgICBcbiAgICBsaW5lcyA9IFtdXHJcbiAgICBcbiAgICBmb3Igc3RhY2tMaW5lIGluIGVyci5zdGFjay5zcGxpdCAnXFxuJyBcclxuICAgICAgICBcbiAgICAgICAgaWYgZnAgPSBmaWxlUG9zIHN0YWNrTGluZVxuICAgICAgICAgICAgbGluZXMucHVzaCBcIiAgICAgICAje18ucGFkRW5kIGZwLmZ1bmMsIDMwfSAje2ZwLmZpbGV9OiN7ZnAubGluZX1cIiBcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggc3RhY2tMaW5lIFxyXG5cciAgXG4gICAgbGluZXMuam9pbiAnXFxuJ1xuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbmVycm9yVHJhY2UgPSAoZXJyKSAtPlxuICAgIFxuICAgIGxpbmVzID0gW11cclxuICAgIHRleHQgID0gW11cblxuICAgIGNvbnNvbGUubG9nIGVyci5zdGFja1xuICAgIFxuICAgIGZvciBzdGFja0xpbmUgaW4gZXJyLnN0YWNrLnNwbGl0ICdcXG4nIFxyXG4gICAgICAgIFxuICAgICAgICBpZiBmcCA9IGZpbGVQb3Mgc3RhY2tMaW5lXG4gICAgICAgICAgICBsaW5lcy5wdXNoIGZwXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGV4dC5wdXNoIHN0YWNrTGluZSBcclxuXHIgIFxuICAgIGxpbmVzOiAgbGluZXNcbiAgICB0ZXh0OiAgIHRleHQuam9pbiAnXFxuJ1xuICAgIFxuIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgICAwMDAwMDAwICAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG50b0NvZmZlZSA9IChqc0ZpbGUsIGpzTGluZSwganNDb2w9MCkgLT5cblxuICAgIGpzTGluZSA9IHBhcnNlSW50IGpzTGluZVxuICAgIGpzQ29sICA9IHBhcnNlSW50IGpzQ29sXG4gICAgXG4gICAgY29mZmVlRmlsZSA9IHNsYXNoLnBhdGgganNGaWxlXG4gICAgY29mZmVlTGluZSA9IGpzTGluZVxuICAgIGNvZmZlZUNvbCAgPSBqc0NvbFxuICAgICAgICBcbiAgICBpZiBzbGFzaC5maWxlRXhpc3RzIGpzRmlsZVxuICAgICAgICBtYXBEYXRhID0gbWFwQ29udmVydC5mcm9tU291cmNlKGZzLnJlYWRGaWxlU3luYyBqc0ZpbGUsICd1dGY4Jyk/LnRvT2JqZWN0KClcbiAgICAgICAgaWYgdmFsaWQgbWFwRGF0YVxuICAgICAgICAgICAgbWFwRGF0YS5zb3VyY2VzWzBdID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLmRpcihqc0ZpbGUpLCBtYXBEYXRhPy5zb3VyY2VzWzBdIGlmIG1hcERhdGE/LnNvdXJjZXNbMF1cbiAgICAgICAgICAgIGNvbnN1bWVyID0gbmV3IHNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lciBtYXBEYXRhXG4gICAgICAgICAgICBpZiBjb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yXG4gICAgICAgICAgICAgICAgcG9zID0gY29uc3VtZXIub3JpZ2luYWxQb3NpdGlvbkZvciBsaW5lOmpzTGluZSwgY29sdW1uOmpzQ29sLCBiaWFzOnNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORFxuICAgICAgICAgICAgICAgIGlmIHZhbGlkKHBvcy5saW5lKSBhbmQgdmFsaWQocG9zLmNvbHVtbilcbiAgICAgICAgICAgICAgICAgICAgY29mZmVlRmlsZSA9IG1hcERhdGEuc291cmNlc1swXVxuICAgICAgICAgICAgICAgICAgICBjb2ZmZWVMaW5lID0gcG9zLmxpbmUgXG4gICAgICAgICAgICAgICAgICAgIGNvZmZlZUNvbCAgPSBwb3MuY29sdW1uXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgJ25vIHBvcy5saW5lJywgcG9zXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nICdubyBjb25zdW1lciBvcmlnaW5hbFBvc2l0aW9uRm9yJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ25vIG1hcERhdGEnLCBqc0ZpbGVcbiAgICBlbHNlXG4gICAgICAgIGxvZyAnbm8ganNGaWxlJywganNGaWxlIFxuICAgICAgICBcbiAgICBbY29mZmVlRmlsZSwgY29mZmVlTGluZSwgY29mZmVlQ29sXVxuXG4jIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgICAgICAwMDAgICAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgICAgICAgMDAwICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgICAgMDAwICAgICAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG50b0pzID0gKGNvZmZlZUZpbGUsIGNvZmZlZUxpbmUsIGNvZmZlZUNvbD0wKSAtPlxuICAgIFxuICAgIGpzRmlsZSA9IGNvZmZlZUZpbGUucmVwbGFjZSAvXFwvY29mZmVlXFwvLywgJy9qcy8nXG4gICAganNGaWxlID0ganNGaWxlLnJlcGxhY2UgL1xcLmNvZmZlZSQvLCAnLmpzJ1xuICAgIFxuICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIGpzRmlsZVxuICAgICAgICByZXR1cm4gW251bGwsIG51bGwsIG51bGxdXG4gICAgICAgIFxuICAgIGlmIG5vdCBjb2ZmZWVMaW5lPyB0aGVuIHJldHVybiBqc0ZpbGVcbiAgICBcbiAgICBtYXBEYXRhID0gbWFwQ29udmVydC5mcm9tU291cmNlKGZzLnJlYWRGaWxlU3luYyBqc0ZpbGUsICd1dGY4Jyk/LnRvT2JqZWN0KClcbiAgICBpZiB2YWxpZCBtYXBEYXRhXG4gICAgICAgIG1hcERhdGEuc291cmNlc1swXSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC5kaXIoanNGaWxlKSwgbWFwRGF0YT8uc291cmNlc1swXSBpZiBtYXBEYXRhPy5zb3VyY2VzWzBdXG4gICAgICAgIGNvbnN1bWVyID0gbmV3IHNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lciBtYXBEYXRhXG4gICAgICAgIGlmIGNvbnN1bWVyPy5hbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3I/XG4gICAgICAgICAgICBwb3NzID0gY29uc3VtZXIuYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yIHNvdXJjZTptYXBEYXRhLnNvdXJjZXNbMF0sIGxpbmU6Y29mZmVlTGluZSMsIGNvbHVtbjpjb2ZmZWVDb2xcbiAgICAgICAgICAgIGlmIHZhbGlkIHBvc3NcbiAgICAgICAgICAgICAgICByZXR1cm4gW2pzRmlsZSwgcG9zc1swXT8ubGluZSwgcG9zc1swXT8uY29sdW1uXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZyAnZW1wdHkgcG9zcydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9nICdubyBhbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IgaW4nLCBjb25zdW1lclxuICAgIGVsc2VcbiAgICAgICAgbG9nICdubyBtYXBEYXRhJ1xuICAgICAgICBcbiAgICBbanNGaWxlLCBudWxsLCBudWxsXVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID1cbiAgICB0b0pzOiAgICAgICB0b0pzXG4gICAgdG9Db2ZmZWU6ICAgdG9Db2ZmZWVcbiAgICBlcnJvclN0YWNrOiBlcnJvclN0YWNrXG4gICAgZXJyb3JUcmFjZTogZXJyb3JUcmFjZVxuICAgIGxvZ0VycjogICAgIGxvZ0VyclxuICAgIFxuICAgICJdfQ==
//# sourceURL=../coffee/srcmap.coffee