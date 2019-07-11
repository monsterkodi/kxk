// koffee 1.3.0

/*
 0000000  00000000    0000000  00     00   0000000   00000000   
000       000   000  000       000   000  000   000  000   000  
0000000   0000000    000       000000000  000000000  00000000   
     000  000   000  000       000 0 000  000   000  000        
0000000   000   000   0000000  000   000  000   000  000
 */
var _, empty, errorStack, errorTrace, filePos, fs, klog, logErr, mapConvert, ref, regex1, regex2, slash, sourceMap, toCoffee, toJs, valid;

ref = require('./kxk'), fs = ref.fs, valid = ref.valid, empty = ref.empty, slash = ref.slash, klog = ref.klog, _ = ref._;

sourceMap = require('source-map');

mapConvert = require('convert-source-map');

regex1 = /^\s+at\s+(\S+)\s+\((.*):(\d+):(\d+)\)/;

regex2 = /^\s+at\s+(.*):(\d+):(\d+)/;

logErr = function(err, sep) {
    var i, len, line, ref1, results, trace;
    if (sep == null) {
        sep = '💥';
    }
    console.log(err);
    trace = errorTrace(err);
    if (valid(trace.lines)) {
        klog.flog({
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
                results.push(klog.flog({
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
        return klog.flog({
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
                }
            } else {
                klog('no consumer originalPositionFor', mapData != null, consumer != null);
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
            }
        } else {
            console.log('srcmap.toJs -- no allGeneratedPositionsFor in', consumer);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjbWFwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF1QyxPQUFBLENBQVEsT0FBUixDQUF2QyxFQUFFLFdBQUYsRUFBTSxpQkFBTixFQUFhLGlCQUFiLEVBQW9CLGlCQUFwQixFQUEyQixlQUEzQixFQUFpQzs7QUFFakMsU0FBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztBQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVI7O0FBRWIsTUFBQSxHQUFhOztBQUNiLE1BQUEsR0FBYTs7QUFRYixNQUFBLEdBQVMsU0FBQyxHQUFELEVBQU0sR0FBTjtBQUdOLFFBQUE7O1FBSFksTUFBSTs7SUFHaEIsT0FBQSxDQUFDLEdBQUQsQ0FBSyxHQUFMO0lBQ0MsS0FBQSxHQUFRLFVBQUEsQ0FBVyxHQUFYO0lBRVIsSUFBRyxLQUFBLENBQU0sS0FBSyxDQUFDLEtBQVosQ0FBSDtRQUNJLElBQUksQ0FBQyxJQUFMLENBQVU7WUFBQSxHQUFBLEVBQUksS0FBSyxDQUFDLElBQVY7WUFBZ0IsTUFBQSxFQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBdEM7WUFBNEMsSUFBQSxFQUFLLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBaEU7WUFBc0UsR0FBQSxFQUFJLEdBQTFFO1NBQVY7QUFDQTtBQUFBO2FBQUEsc0NBQUE7O1lBQ0ksR0FBQSxHQUFTLEtBQUssQ0FBQyxVQUFOLENBQWlCLElBQUksQ0FBQyxJQUF0QixDQUFBLElBQStCLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFWLEtBQWMsR0FBaEQsR0FBeUQsSUFBekQsR0FBbUU7WUFDekUsSUFBRyxHQUFBLEtBQU8sSUFBUCxJQUFlLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFWLEtBQWdCLEdBQWxDOzZCQUNJLElBQUksQ0FBQyxJQUFMLENBQVU7b0JBQUEsR0FBQSxFQUFJLFNBQUEsR0FBVSxJQUFJLENBQUMsSUFBbkI7b0JBQXlCLE1BQUEsRUFBTyxJQUFJLENBQUMsSUFBckM7b0JBQTJDLElBQUEsRUFBSyxJQUFJLENBQUMsSUFBckQ7b0JBQTJELEdBQUEsRUFBSSxHQUEvRDtpQkFBVixHQURKO2FBQUEsTUFBQTtxQ0FBQTs7QUFGSjt1QkFGSjtLQUFBLE1BQUE7ZUFPSSxJQUFJLENBQUMsSUFBTCxDQUFVO1lBQUEsR0FBQSxFQUFJLEtBQUssQ0FBQyxJQUFWO1lBQWdCLE1BQUEsRUFBTyxFQUF2QjtZQUEyQixJQUFBLEVBQUssQ0FBaEM7WUFBbUMsR0FBQSxFQUFJLEdBQXZDO1NBQVYsRUFQSjs7QUFOSzs7QUFxQlQsT0FBQSxHQUFVLFNBQUMsSUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFHLEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBWDtRQUVJLE1BQUEsR0FDSTtZQUFBLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBVCxDQUFpQixjQUFqQixFQUFpQyxFQUFqQyxDQUFOO1lBQ0EsSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBRFo7WUFFQSxJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FGWjtZQUdBLEdBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUhaOztRQUtKLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFNLENBQUMsSUFBakIsQ0FBQSxLQUEwQixJQUE3QjtZQUVJLFVBQUEsR0FBYSxRQUFBLENBQVMsTUFBTSxDQUFDLElBQWhCLEVBQXNCLE1BQU0sQ0FBQyxJQUE3QixFQUFtQyxNQUFNLENBQUMsR0FBMUM7WUFFYixJQUFHLGtCQUFIO2dCQUNJLE1BQU0sQ0FBQyxJQUFQLEdBQWMsVUFBVyxDQUFBLENBQUE7Z0JBQ3pCLE1BQU0sQ0FBQyxJQUFQLEdBQWMsVUFBVyxDQUFBLENBQUE7Z0JBQ3pCLE1BQU0sQ0FBQyxHQUFQLEdBQWMsVUFBVyxDQUFBLENBQUEsRUFIN0I7YUFKSjtTQUFBLE1BU0ssSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQU0sQ0FBQyxJQUFqQixDQUFBLEtBQTBCLFFBQTFCLElBQXVDLENBQUksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsTUFBTSxDQUFDLElBQXhCLENBQTlDO1lBV0QsT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFPLENBQUMsR0FBUixDQUFBLENBQVgsRUFBMEIsUUFBMUIsRUFBb0MsTUFBTSxDQUFDLElBQTNDLENBQWQ7WUFDVixJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLE9BQWpCLENBQUg7Z0JBQ0ksT0FBZSxJQUFBLENBQUssT0FBTCxFQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBZixFQUFDLGdCQUFELEVBQVEsV0FBUixFQUFVO2dCQUNWLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsTUFBakIsQ0FBSDtvQkFDSSxPQUFzQyxRQUFBLENBQVMsTUFBVCxFQUFpQixNQUFNLENBQUMsSUFBeEIsRUFBOEIsTUFBTSxDQUFDLEdBQXJDLENBQXRDLEVBQUMsb0JBQUQsRUFBYSxvQkFBYixFQUF5QjtvQkFDekIsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixVQUFqQixDQUFIO3dCQUNJLE1BQU0sQ0FBQyxJQUFQLEdBQWM7d0JBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYzt3QkFDZCxNQUFNLENBQUMsR0FBUCxHQUFjLFVBSGxCO3FCQUZKO2lCQUZKO2FBWkM7U0FqQlQ7S0FBQSxNQXVDSyxJQUFHLEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBWDtRQUVELE1BQUEsR0FDSTtZQUFBLElBQUEsRUFBTSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQU0sQ0FBQSxDQUFBLENBQWpCLENBQU47WUFDQSxJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FEWjtZQUVBLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUZaO1lBR0EsR0FBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBSFo7O1FBS0osSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQU0sQ0FBQyxJQUFqQixDQUFBLEtBQTBCLElBQTdCO1lBRUksVUFBQSxHQUFhLFFBQUEsQ0FBUyxNQUFNLENBQUMsSUFBaEIsRUFBc0IsTUFBTSxDQUFDLElBQTdCLEVBQW1DLE1BQU0sQ0FBQyxHQUExQztZQUViLElBQUcsa0JBQUg7Z0JBQ0ksTUFBTSxDQUFDLElBQVAsR0FBYyxVQUFXLENBQUEsQ0FBQTtnQkFDekIsTUFBTSxDQUFDLElBQVAsR0FBYyxVQUFXLENBQUEsQ0FBQTtnQkFDekIsTUFBTSxDQUFDLEdBQVAsR0FBYyxVQUFXLENBQUEsQ0FBQSxFQUg3QjthQUpKO1NBUkM7O1dBcUJMO0FBOURNOztBQXNFVixVQUFBLEdBQWEsU0FBQyxHQUFEO0FBRVQsUUFBQTtJQUFBLEtBQUEsR0FBUTtBQUVSO0FBQUEsU0FBQSxzQ0FBQTs7UUFFSSxJQUFHLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUFSO1lBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFBLEdBQVMsQ0FBQyxDQUFDLENBQUMsTUFBRixDQUFTLEVBQUUsQ0FBQyxJQUFaLEVBQWtCLEVBQWxCLENBQUQsQ0FBVCxHQUErQixHQUEvQixHQUFrQyxFQUFFLENBQUMsSUFBckMsR0FBMEMsR0FBMUMsR0FBNkMsRUFBRSxDQUFDLElBQTNELEVBREo7U0FBQSxNQUFBO1lBR0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBSEo7O0FBRko7V0FRQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7QUFaUzs7QUFvQmIsVUFBQSxHQUFhLFNBQUMsR0FBRDtBQUVULFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixJQUFBLEdBQVE7QUFFUjtBQUFBLFNBQUEsc0NBQUE7O1FBRUksSUFBRyxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBUjtZQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWCxFQURKO1NBQUEsTUFBQTtZQUdJLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUhKOztBQUZKO1dBUUE7UUFBQSxLQUFBLEVBQVEsS0FBUjtRQUNBLElBQUEsRUFBUSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FEUjs7QUFiUzs7QUFzQmIsUUFBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsS0FBakI7QUFFUCxRQUFBOztRQUZ3QixRQUFNOztJQUU5QixNQUFBLEdBQVMsUUFBQSxDQUFTLE1BQVQ7SUFDVCxLQUFBLEdBQVMsUUFBQSxDQUFTLEtBQVQ7SUFFVCxVQUFBLEdBQWEsS0FBSyxDQUFDLEtBQU4sQ0FBWSxNQUFaO0lBQ2IsVUFBQSxHQUFhO0lBQ2IsU0FBQSxHQUFhO0lBRWIsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFqQixDQUFIO1FBQ0ksT0FBQSxpRkFBK0QsQ0FBRSxRQUF2RCxDQUFBO1FBQ1YsSUFBRyxLQUFBLENBQU0sT0FBTixDQUFIO1lBQ0ksc0JBQXdGLE9BQU8sQ0FBRSxPQUFRLENBQUEsQ0FBQSxVQUF6RztnQkFBQSxPQUFPLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBaEIsR0FBcUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixDQUFYLG9CQUE4QixPQUFPLENBQUUsT0FBUSxDQUFBLENBQUEsVUFBL0MsQ0FBZCxFQUFyQjs7WUFDQSxRQUFBLEdBQVcsSUFBSSxTQUFTLENBQUMsaUJBQWQsQ0FBZ0MsT0FBaEM7WUFDWCxJQUFHLFFBQVEsQ0FBQyxtQkFBWjtnQkFDSSxHQUFBLEdBQU0sUUFBUSxDQUFDLG1CQUFULENBQTZCO29CQUFBLElBQUEsRUFBSyxNQUFMO29CQUFhLE1BQUEsRUFBTyxLQUFwQjtvQkFBMkIsSUFBQSxFQUFLLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBNUQ7aUJBQTdCO2dCQUNOLElBQUcsS0FBQSxDQUFNLEdBQUcsQ0FBQyxJQUFWLENBQUEsSUFBb0IsS0FBQSxDQUFNLEdBQUcsQ0FBQyxNQUFWLENBQXZCO29CQUNJLFVBQUEsR0FBYSxLQUFLLENBQUMsS0FBTixDQUFZLE9BQU8sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUE1QjtvQkFDYixVQUFBLEdBQWEsR0FBRyxDQUFDO29CQUNqQixTQUFBLEdBQWEsR0FBRyxDQUFDLE9BSHJCO2lCQUZKO2FBQUEsTUFBQTtnQkFPSSxJQUFBLENBQUssaUNBQUwsRUFBd0MsZUFBeEMsRUFBa0QsZ0JBQWxELEVBUEo7YUFISjtTQUZKOztXQWNBLENBQUMsVUFBRCxFQUFhLFVBQWIsRUFBeUIsU0FBekI7QUF2Qk87O0FBK0JYLElBQUEsR0FBTyxTQUFDLFVBQUQsRUFBYSxVQUFiLEVBQXlCLFNBQXpCO0FBRUgsUUFBQTs7UUFGNEIsWUFBVTs7SUFFdEMsTUFBQSxHQUFTLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFlBQW5CLEVBQWlDLE1BQWpDO0lBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixFQUE0QixLQUE1QjtJQUVULElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFqQixDQUFQO0FBQ0ksZUFBTyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixFQURYOztJQUdBLElBQU8sa0JBQVA7QUFBd0IsZUFBTyxPQUEvQjs7SUFFQSxPQUFBLGlGQUErRCxDQUFFLFFBQXZELENBQUE7SUFDVixJQUFHLEtBQUEsQ0FBTSxPQUFOLENBQUg7UUFDSSxzQkFBd0YsT0FBTyxDQUFFLE9BQVEsQ0FBQSxDQUFBLFVBQXpHO1lBQUEsT0FBTyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQWhCLEdBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FBWCxvQkFBOEIsT0FBTyxDQUFFLE9BQVEsQ0FBQSxDQUFBLFVBQS9DLENBQWQsRUFBckI7O1FBQ0EsUUFBQSxHQUFXLElBQUksU0FBUyxDQUFDLGlCQUFkLENBQWdDLE9BQWhDO1FBQ1gsSUFBRyx1RUFBSDtZQUNJLElBQUEsR0FBTyxRQUFRLENBQUMsd0JBQVQsQ0FBa0M7Z0JBQUEsTUFBQSxFQUFPLE9BQU8sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUF2QjtnQkFBMkIsSUFBQSxFQUFLLFVBQWhDO2FBQWxDO1lBQ1AsSUFBRyxLQUFBLENBQU0sSUFBTixDQUFIO0FBQ0ksdUJBQU8sQ0FBQyxNQUFELGlDQUFnQixDQUFFLGFBQWxCLGlDQUErQixDQUFFLGVBQWpDLEVBRFg7YUFGSjtTQUFBLE1BQUE7WUFPRyxPQUFBLENBQUMsR0FBRCxDQUFLLCtDQUFMLEVBQXNELFFBQXRELEVBUEg7U0FISjs7V0FZQSxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsSUFBZjtBQXZCRzs7QUF5QlAsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLElBQUEsRUFBWSxJQUFaO0lBQ0EsUUFBQSxFQUFZLFFBRFo7SUFFQSxVQUFBLEVBQVksVUFGWjtJQUdBLFVBQUEsRUFBWSxVQUhaO0lBSUEsTUFBQSxFQUFZLE1BSloiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMjI1xuXG57IGZzLCB2YWxpZCwgZW1wdHksIHNsYXNoLCBrbG9nLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuc291cmNlTWFwICA9IHJlcXVpcmUgJ3NvdXJjZS1tYXAnXG5tYXBDb252ZXJ0ID0gcmVxdWlyZSAnY29udmVydC1zb3VyY2UtbWFwJ1xuXG5yZWdleDEgICAgID0gL15cXHMrYXRcXHMrKFxcUyspXFxzK1xcKCguKik6KFxcZCspOihcXGQrKVxcKS9cbnJlZ2V4MiAgICAgPSAvXlxccythdFxccysoLiopOihcXGQrKTooXFxkKykvXG5cbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuXG5sb2dFcnIgPSAoZXJyLCBzZXA9J/CfkqUnKSAtPlxuICAgIFxuICAgICMgbG9nIGVycm9yU3RhY2sgZXJyXG4gICAgbG9nIGVyclxuICAgIHRyYWNlID0gZXJyb3JUcmFjZSBlcnJcbiAgICAjIGNvbnNvbGUubG9nICd0cmFjZTonLCBzdHIodHJhY2UpXG4gICAgaWYgdmFsaWQgdHJhY2UubGluZXNcbiAgICAgICAga2xvZy5mbG9nIHN0cjp0cmFjZS50ZXh0LCBzb3VyY2U6dHJhY2UubGluZXNbMF0uZmlsZSwgbGluZTp0cmFjZS5saW5lc1swXS5saW5lLCBzZXA6c2VwXG4gICAgICAgIGZvciBsaW5lIGluIHRyYWNlLmxpbmVzXG4gICAgICAgICAgICBzZXAgPSBpZiBzbGFzaC5pc0Fic29sdXRlKGxpbmUuZmlsZSkgb3IgbGluZS5maWxlWzBdPT0nficgdGhlbiAn8J+QnicgZWxzZSAn8J+UvCdcbiAgICAgICAgICAgIGlmIHNlcCA9PSAn8J+Qnicgb3IgbGluZS5maWxlWzBdID09ICcuJ1xuICAgICAgICAgICAgICAgIGtsb2cuZmxvZyBzdHI6JyAgICAgICAnK2xpbmUuZnVuYywgc291cmNlOmxpbmUuZmlsZSwgbGluZTpsaW5lLmxpbmUsIHNlcDpzZXBcbiAgICBlbHNlXG4gICAgICAgIGtsb2cuZmxvZyBzdHI6dHJhY2UudGV4dCwgc291cmNlOicnLCBsaW5lOjAsIHNlcDpzZXBcblxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbmZpbGVQb3MgPSAobGluZSkgLT5cblxuICAgIGlmIG1hdGNoID0gcmVnZXgxLmV4ZWMgbGluZVxuICAgICAgICBcbiAgICAgICAgcmVzdWx0ID1cbiAgICAgICAgICAgIGZ1bmM6IG1hdGNoWzFdLnJlcGxhY2UgJy48YW5vbnltb3VzPicsICcnXG4gICAgICAgICAgICBmaWxlOiBtYXRjaFsyXVxuICAgICAgICAgICAgbGluZTogbWF0Y2hbM11cbiAgICAgICAgICAgIGNvbDogIG1hdGNoWzRdXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5leHQocmVzdWx0LmZpbGUpID09ICdqcydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWFwcGVkTGluZSA9IHRvQ29mZmVlIHJlc3VsdC5maWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtYXBwZWRMaW5lP1xuICAgICAgICAgICAgICAgIHJlc3VsdC5maWxlID0gbWFwcGVkTGluZVswXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5saW5lID0gbWFwcGVkTGluZVsxXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5jb2wgID0gbWFwcGVkTGluZVsyXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHNsYXNoLmV4dChyZXN1bHQuZmlsZSkgPT0gJ2NvZmZlZScgYW5kIG5vdCBzbGFzaC5pc0Fic29sdXRlIHJlc3VsdC5maWxlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgc2VlbXMgbGlrZSBjaHJvbWUgaXMgcmVzb2x2aW5nIHRvIHJlbGF0aXZlIHBhdGhzIGFscmVhZHkgd2l0aG91dCBtYXBwaW5nIHRoZSBsaW5lIG51bWJlcnMgY29ycmVjdGx5IDooXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgXCJmaWxlUG9zMSBsaW5lOicje2xpbmV9JyByZXN1bHQ6XCIsIHN0ciByZXN1bHRcbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgJ3Byb2Nlc3MuY3dkJywgcHJvY2Vzcy5jd2QoKVxuICAgICAgICAgICAgIyB0cnlcbiAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nICdhcHAuZ2V0UGF0aChcImV4ZVwiKScsIHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlLmFwcC5nZXRQYXRoICdleGUnXG4gICAgICAgICAgICAjIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICMgY29uc29sZS5sb2cgZXJyLnN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhYnNGaWxlID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHByb2Nlc3MuY3dkKCksICdjb2ZmZWUnLCByZXN1bHQuZmlsZVxuICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBhYnNGaWxlXG4gICAgICAgICAgICAgICAgW2pzRmlsZSxhLGJdID0gdG9KcyBhYnNGaWxlLCAxLCAwXG4gICAgICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBqc0ZpbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvZmZlZUZpbGUsIGNvZmZlZUxpbmUsIGNvZmZlZUNvbF0gPSB0b0NvZmZlZSBqc0ZpbGUsIHJlc3VsdC5saW5lLCByZXN1bHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmZpbGVFeGlzdHMgY29mZmVlRmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZpbGUgPSBjb2ZmZWVGaWxlICMgdGhpcyAnZml4JyByZWxpZXMgb24gcHJvY2Vzcy5jd2QgdG8gYmUgdW5jaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubGluZSA9IGNvZmZlZUxpbmUgIyBhbmQgb25seSB3b3JrcyBmb3IgYXBwIHN0YXJ0ZWQgZnJvbSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jb2wgID0gY29mZmVlQ29sICAjIHZpYSBub2RlX21vZHVsZXMvZWxlY3Ryb24uLi4gOihcbiAgICAgICAgICAgICAgICAgICAgICAgICMgdXNpbmcgYXBwLmdldFBhdGgoXCJleGVcIikgYW5kIGZpbHRlciBvdXQgbm9kZV9tb2R1bGVzIHdvdWxkIHByb2JhYmx5IGJlIGJldHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgZWxzZSBpZiBtYXRjaCA9IHJlZ2V4Mi5leGVjIGxpbmVcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICBmdW5jOiBzbGFzaC5maWxlIG1hdGNoWzFdXG4gICAgICAgICAgICBmaWxlOiBtYXRjaFsxXVxuICAgICAgICAgICAgbGluZTogbWF0Y2hbMl1cbiAgICAgICAgICAgIGNvbDogIG1hdGNoWzNdXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5leHQocmVzdWx0LmZpbGUpID09ICdqcydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWFwcGVkTGluZSA9IHRvQ29mZmVlIHJlc3VsdC5maWxlLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtYXBwZWRMaW5lP1xuICAgICAgICAgICAgICAgIHJlc3VsdC5maWxlID0gbWFwcGVkTGluZVswXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5saW5lID0gbWFwcGVkTGluZVsxXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5jb2wgID0gbWFwcGVkTGluZVsyXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAjIGVsc2UgaWYgc2xhc2guZXh0KHJlc3VsdC5maWxlKSA9PSAnY29mZmVlJyBhbmQgbm90IHNsYXNoLmlzQWJzb2x1dGUgcmVzdWx0LmZpbGUgICAgICAgICAgICAgICAgXG4jICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBjb25zb2xlLmxvZyBcImZpbGVQb3MyIEZJWE1FIVwiLCBsaW5lLCByZXN1bHRcbiAgICAgICAgICAgIFxuICAgIHJlc3VsdFxuXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmVycm9yU3RhY2sgPSAoZXJyKSAtPlxuICAgIFxuICAgIGxpbmVzID0gW11cbiAgICBcbiAgICBmb3Igc3RhY2tMaW5lIGluIGVyci5zdGFjay5zcGxpdCAnXFxuJyBcbiAgICAgICAgXG4gICAgICAgIGlmIGZwID0gZmlsZVBvcyBzdGFja0xpbmVcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggXCIgICAgICAgI3tfLnBhZEVuZCBmcC5mdW5jLCAzMH0gI3tmcC5maWxlfToje2ZwLmxpbmV9XCIgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggc3RhY2tMaW5lIFxuXG4gIFxuICAgIGxpbmVzLmpvaW4gJ1xcbidcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5lcnJvclRyYWNlID0gKGVycikgLT5cbiAgICBcbiAgICBsaW5lcyA9IFtdXG4gICAgdGV4dCAgPSBbXVxuXG4gICAgZm9yIHN0YWNrTGluZSBpbiBlcnIuc3RhY2suc3BsaXQgJ1xcbicgXG4gICAgICAgIFxuICAgICAgICBpZiBmcCA9IGZpbGVQb3Mgc3RhY2tMaW5lXG4gICAgICAgICAgICBsaW5lcy5wdXNoIGZwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRleHQucHVzaCBzdGFja0xpbmUgXG5cbiAgXG4gICAgbGluZXM6ICBsaW5lc1xuICAgIHRleHQ6ICAgdGV4dC5qb2luICdcXG4nXG4gICAgXG4jIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnRvQ29mZmVlID0gKGpzRmlsZSwganNMaW5lLCBqc0NvbD0wKSAtPlxuXG4gICAganNMaW5lID0gcGFyc2VJbnQganNMaW5lXG4gICAganNDb2wgID0gcGFyc2VJbnQganNDb2xcbiAgICBcbiAgICBjb2ZmZWVGaWxlID0gc2xhc2gudGlsZGUganNGaWxlXG4gICAgY29mZmVlTGluZSA9IGpzTGluZVxuICAgIGNvZmZlZUNvbCAgPSBqc0NvbFxuICAgICAgICBcbiAgICBpZiBzbGFzaC5maWxlRXhpc3RzIGpzRmlsZVxuICAgICAgICBtYXBEYXRhID0gbWFwQ29udmVydC5mcm9tU291cmNlKGZzLnJlYWRGaWxlU3luYyBqc0ZpbGUsICd1dGY4Jyk/LnRvT2JqZWN0KClcbiAgICAgICAgaWYgdmFsaWQgbWFwRGF0YVxuICAgICAgICAgICAgbWFwRGF0YS5zb3VyY2VzWzBdID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLmRpcihqc0ZpbGUpLCBtYXBEYXRhPy5zb3VyY2VzWzBdIGlmIG1hcERhdGE/LnNvdXJjZXNbMF1cbiAgICAgICAgICAgIGNvbnN1bWVyID0gbmV3IHNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lciBtYXBEYXRhXG4gICAgICAgICAgICBpZiBjb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yXG4gICAgICAgICAgICAgICAgcG9zID0gY29uc3VtZXIub3JpZ2luYWxQb3NpdGlvbkZvciBsaW5lOmpzTGluZSwgY29sdW1uOmpzQ29sLCBiaWFzOnNvdXJjZU1hcC5Tb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORFxuICAgICAgICAgICAgICAgIGlmIHZhbGlkKHBvcy5saW5lKSBhbmQgdmFsaWQocG9zLmNvbHVtbilcbiAgICAgICAgICAgICAgICAgICAgY29mZmVlRmlsZSA9IHNsYXNoLnRpbGRlIG1hcERhdGEuc291cmNlc1swXVxuICAgICAgICAgICAgICAgICAgICBjb2ZmZWVMaW5lID0gcG9zLmxpbmUgXG4gICAgICAgICAgICAgICAgICAgIGNvZmZlZUNvbCAgPSBwb3MuY29sdW1uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAnbm8gY29uc3VtZXIgb3JpZ2luYWxQb3NpdGlvbkZvcicsIG1hcERhdGE/LCBjb25zdW1lcj9cbiAgICAgICAgXG4gICAgW2NvZmZlZUZpbGUsIGNvZmZlZUxpbmUsIGNvZmZlZUNvbF1cblxuIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAgMDAwICAgMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgICAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jICAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxudG9KcyA9IChjb2ZmZWVGaWxlLCBjb2ZmZWVMaW5lLCBjb2ZmZWVDb2w9MCkgLT5cbiAgICBcbiAgICBqc0ZpbGUgPSBjb2ZmZWVGaWxlLnJlcGxhY2UgL1xcL2NvZmZlZVxcLy8sICcvanMvJ1xuICAgIGpzRmlsZSA9IGpzRmlsZS5yZXBsYWNlIC9cXC5jb2ZmZWUkLywgJy5qcydcbiAgICBcbiAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBqc0ZpbGVcbiAgICAgICAgcmV0dXJuIFtudWxsLCBudWxsLCBudWxsXVxuICAgICAgICBcbiAgICBpZiBub3QgY29mZmVlTGluZT8gdGhlbiByZXR1cm4ganNGaWxlXG4gICAgXG4gICAgbWFwRGF0YSA9IG1hcENvbnZlcnQuZnJvbVNvdXJjZShmcy5yZWFkRmlsZVN5bmMganNGaWxlLCAndXRmOCcpPy50b09iamVjdCgpXG4gICAgaWYgdmFsaWQgbWFwRGF0YVxuICAgICAgICBtYXBEYXRhLnNvdXJjZXNbMF0gPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2guZGlyKGpzRmlsZSksIG1hcERhdGE/LnNvdXJjZXNbMF0gaWYgbWFwRGF0YT8uc291cmNlc1swXVxuICAgICAgICBjb25zdW1lciA9IG5ldyBzb3VyY2VNYXAuU291cmNlTWFwQ29uc3VtZXIgbWFwRGF0YVxuICAgICAgICBpZiBjb25zdW1lcj8uYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yP1xuICAgICAgICAgICAgcG9zcyA9IGNvbnN1bWVyLmFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvciBzb3VyY2U6bWFwRGF0YS5zb3VyY2VzWzBdLCBsaW5lOmNvZmZlZUxpbmUjLCBjb2x1bW46Y29mZmVlQ29sXG4gICAgICAgICAgICBpZiB2YWxpZCBwb3NzXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtqc0ZpbGUsIHBvc3NbMF0/LmxpbmUsIHBvc3NbMF0/LmNvbHVtbl1cbiAgICAgICAgICAgICMgZWxzZVxuICAgICAgICAgICAgICAgICMgbG9nICdzcmNtYXAudG9KcyAtLSBlbXB0eSBwb3NzISdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9nICdzcmNtYXAudG9KcyAtLSBubyBhbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IgaW4nLCBjb25zdW1lclxuICAgICAgICBcbiAgICBbanNGaWxlLCBudWxsLCBudWxsXVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID1cbiAgICB0b0pzOiAgICAgICB0b0pzXG4gICAgdG9Db2ZmZWU6ICAgdG9Db2ZmZWVcbiAgICBlcnJvclN0YWNrOiBlcnJvclN0YWNrXG4gICAgZXJyb3JUcmFjZTogZXJyb3JUcmFjZVxuICAgIGxvZ0VycjogICAgIGxvZ0VyclxuICAgIFxuICAgICJdfQ==
//# sourceURL=../coffee/srcmap.coffee