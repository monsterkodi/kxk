// koffee 1.19.0

/*
000   000  000       0000000    0000000     
000  000   000      000   000  000          
0000000    000      000   000  000  0000    
000  000   000      000   000  000   000    
000   000  0000000   0000000    0000000
 */
var dumpImmediately, dumpInfos, dumpTimer, err, fileLog, infos, klog, post, slog, stack, sutil;

sutil = require('stack-utils');

stack = new sutil({
    cwd: process.cwd(),
    internals: sutil.nodeInternals()
});

infos = [];

dumpInfos = function() {
    var fs, info, kstr, post, ref, slash, stream;
    ref = require('./kxk'), fs = ref.fs, kstr = ref.kstr, post = ref.post, slash = ref.slash;
    stream = fs.createWriteStream(slash.resolve(slog.logFile), {
        flags: 'a',
        encoding: 'utf8'
    });
    while (infos.length) {
        info = infos.shift();
        stream.write(JSON.stringify(info) + '\n');
    }
    return stream.end();
};

dumpImmediately = function() {
    var data, fs, info, ref, slash;
    ref = require('./kxk'), fs = ref.fs, slash = ref.slash;
    data = '';
    while (infos.length) {
        info = infos.shift();
        data += JSON.stringify(info) + '\n';
    }
    return fs.appendFileSync(slash.resolve(slog.logFile), data, 'utf8');
};

dumpTimer = null;

fileLog = function(info) {
    var err, i, len, line, lines;
    try {
        info.id = slog.id;
        info.icon = slog.icon;
        info.type = slog.type;
        lines = info.str.split('\n');
        if (lines.length) {
            for (i = 0, len = lines.length; i < len; i++) {
                line = lines[i];
                info.str = line;
                infos.push(Object.assign({}, info));
                info.sep = '';
                info.icon = '';
            }
        } else {
            infos.push(info);
        }
        return dumpImmediately();
    } catch (error) {
        err = error;
        console.error("kxk.log.fileLog -- ", err.stack);
        return slog.file = false;
    }
};

slog = function(s) {
    var chain, err, f, file, info, kstr, meth, post, ref, slash, sorcery, sorceryInfo, source;
    ref = require('./kxk'), kstr = ref.kstr, post = ref.post, slash = ref.slash;
    try {
        f = stack.capture()[slog.depth];
        sorcery = require('sorcery');
        info = {
            source: slash.tilde(f.getFileName()),
            line: f.getLineNumber()
        };
        try {
            if (chain = sorcery.loadSync(f.getFileName())) {
                sorceryInfo = chain.trace(f.getLineNumber(), 0);
                if (!slash.samePath(f.getScriptNameOrSourceURL(), f.getFileName())) {
                    if (slash.isAbsolute(f.getScriptNameOrSourceURL())) {
                        source = slash.path(f.getScriptNameOrSourceURL());
                    } else {
                        source = slash.resolve(slash.join(slash.dir(f.getFileName()), f.getScriptNameOrSourceURL()));
                    }
                } else {
                    source = f.getFileName();
                }
                sorceryInfo.source = slash.tilde(source);
                info = sorceryInfo;
            } else {

            }
        } catch (error) {
            err = error;
            true;
        }
        file = kstr.lpad(info.source + ":" + info.line, slog.filepad);
        meth = kstr.rpad(f.getFunctionName(), slog.methpad);
        info.str = s;
        s = "" + file + slog.filesep + meth + slog.methsep + s;
        if (post != null) {
            if (typeof post.emit === "function") {
                post.emit('slog', s, info);
            }
        }
        if (slog.file) {
            return fileLog(info);
        }
    } catch (error) {
        err = error;
        console.error(err);
        post.emit('slog', "!" + slog.methsep + s + " " + err);
        if (slog.file) {
            return fileLog({
                str: s + err
            });
        }
    }
};

klog = function() {
    var kstr, post, ref, s;
    ref = require('./kxk'), post = ref.post, kstr = ref.kstr;
    s = ((function() {
        var i, len, ref1, results;
        ref1 = [].slice.call(arguments, 0);
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            s = ref1[i];
            results.push(kstr(s));
        }
        return results;
    }).apply(this, arguments)).join(" ");
    if (post != null) {
        if (typeof post.emit === "function") {
            post.emit('log', s);
        }
    }
    console.log(s);
    return slog(s);
};

slog.file = true;

if (process.platform === 'win32') {
    slog.logFile = '~/AppData/Roaming/klog.txt';
} else if (process.platform === 'darwin') {
    slog.logFile = '~/Library/Application Support/klog.txt';
}

slog.id = '???';

slog.type = process.type === 'renderer' ? 'win' : 'main';

slog.icon = process.type === 'renderer' ? '●' : '◼';

slog.depth = 2;

slog.filesep = ' > ';

slog.methsep = ' >> ';

slog.filepad = 30;

slog.methpad = 15;

klog.slog = slog;

klog.flog = fileLog;

try {
    if (process.type === 'renderer') {
        post = require('./kxk').post;
        slog.id = post.get('appName');
    } else if (process.type === 'browser') {
        slog.id = require('electron').app.getName();
    }
} catch (error) {
    err = error;
    console.warn(err);
}

module.exports = klog;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsibG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGFBQVI7O0FBQ1IsS0FBQSxHQUFRLElBQUksS0FBSixDQUFVO0lBQUEsR0FBQSxFQUFLLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBTDtJQUFvQixTQUFBLEVBQVcsS0FBSyxDQUFDLGFBQU4sQ0FBQSxDQUEvQjtDQUFWOztBQVFSLEtBQUEsR0FBUTs7QUFFUixTQUFBLEdBQVksU0FBQTtBQUVSLFFBQUE7SUFBQSxNQUE0QixPQUFBLENBQVEsT0FBUixDQUE1QixFQUFFLFdBQUYsRUFBTSxlQUFOLEVBQVksZUFBWixFQUFrQjtJQUNsQixNQUFBLEdBQVMsRUFBRSxDQUFDLGlCQUFILENBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBSSxDQUFDLE9BQW5CLENBQXJCLEVBQWtEO1FBQUEsS0FBQSxFQUFNLEdBQU47UUFBVSxRQUFBLEVBQVMsTUFBbkI7S0FBbEQ7QUFDVCxXQUFNLEtBQUssQ0FBQyxNQUFaO1FBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFOLENBQUE7UUFDUCxNQUFNLENBQUMsS0FBUCxDQUFhLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixDQUFBLEdBQXFCLElBQWxDO0lBRko7V0FHQSxNQUFNLENBQUMsR0FBUCxDQUFBO0FBUFE7O0FBU1osZUFBQSxHQUFrQixTQUFBO0FBRWQsUUFBQTtJQUFBLE1BQWdCLE9BQUEsQ0FBUSxPQUFSLENBQWhCLEVBQUUsV0FBRixFQUFNO0lBQ04sSUFBQSxHQUFRO0FBQ1IsV0FBTSxLQUFLLENBQUMsTUFBWjtRQUNJLElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTixDQUFBO1FBQ1AsSUFBQSxJQUFRLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixDQUFBLEdBQXFCO0lBRmpDO1dBR0Es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QURuQjtDQUFBLE1BRUssSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixRQUF2QjtJQUNELElBQUksQ0FBQyxPQUFMLEdBQWUseUNBRGQ7OztBQVNMLElBQUksQ0FBQyxFQUFMLEdBQWU7O0FBQ2YsSUFBSSxDQUFDLElBQUwsR0FBa0IsT0FBTyxDQUFDLElBQVIsS0FBZ0IsVUFBbkIsR0FBbUMsS0FBbkMsR0FBOEM7O0FBQzdELElBQUksQ0FBQyxJQUFMLEdBQWtCLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CLEdBQW1DLEdBQW5DLEdBQTRDOztBQUMzRCxJQUFJLENBQUMsS0FBTCxHQUFlOztBQUNmLElBQUksQ0FBQyxPQUFMLEdBQWU7O0FBQ2YsSUFBSSxDQUFDLE9BQUwsR0FBZTs7QUFDZixJQUFJLENBQUMsT0FBTCxHQUFlOztBQUNmLElBQUksQ0FBQyxPQUFMLEdBQWU7O0FBRWYsSUFBSSxDQUFDLElBQUwsR0FBZTs7QUFDZixJQUFJLENBQUMsSUFBTCxHQUFlOztBQUVmO0lBQ0ksSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixVQUFuQjtRQUNNLE9BQVMsT0FBQSxDQUFRLE9BQVI7UUFDWCxJQUFJLENBQUMsRUFBTCxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBVCxFQUZkO0tBQUEsTUFHSyxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFNBQW5CO1FBQ0QsSUFBSSxDQUFDLEVBQUwsR0FBVSxPQUFBLENBQVEsVUFBUixDQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUF4QixDQUFBLEVBRFQ7S0FKVDtDQUFBLGFBQUE7SUFRTTtJQUNILE9BQUEsQ0FBQyxJQUFELENBQU0sR0FBTixFQVRIOzs7QUFzQkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuIyMjXG5cbnN1dGlsID0gcmVxdWlyZSAnc3RhY2stdXRpbHMnXG5zdGFjayA9IG5ldyBzdXRpbCBjd2Q6IHByb2Nlc3MuY3dkKCksIGludGVybmFsczogc3V0aWwubm9kZUludGVybmFscygpXG5cbiMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbmluZm9zID0gW11cblxuZHVtcEluZm9zID0gLT5cbiAgICBcbiAgICB7IGZzLCBrc3RyLCBwb3N0LCBzbGFzaCB9ID0gcmVxdWlyZSAnLi9reGsnXG4gICAgc3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0gc2xhc2gucmVzb2x2ZShzbG9nLmxvZ0ZpbGUpLCBmbGFnczonYScgZW5jb2Rpbmc6J3V0ZjgnXG4gICAgd2hpbGUgaW5mb3MubGVuZ3RoXG4gICAgICAgIGluZm8gPSBpbmZvcy5zaGlmdCgpXG4gICAgICAgIHN0cmVhbS53cml0ZSBKU09OLnN0cmluZ2lmeShpbmZvKSsnXFxuJ1xuICAgIHN0cmVhbS5lbmQoKVxuXG5kdW1wSW1tZWRpYXRlbHkgPSAtPlxuICAgIFxuICAgIHsgZnMsIHNsYXNoIH0gPSByZXF1aXJlICcuL2t4aydcbiAgICBkYXRhICA9ICcnXG4gICAgd2hpbGUgaW5mb3MubGVuZ3RoXG4gICAgICAgIGluZm8gPSBpbmZvcy5zaGlmdCgpXG4gICAgICAgIGRhdGEgKz0gSlNPTi5zdHJpbmdpZnkoaW5mbykrJ1xcbidcbiAgICBmcy5hcHBlbmRGaWxlU3luYyBzbGFzaC5yZXNvbHZlKHNsb2cubG9nRmlsZSksIGRhdGEsICd1dGY4J1xuICAgIFxuZHVtcFRpbWVyID0gbnVsbFxuICAgIFxuZmlsZUxvZyA9IChpbmZvKSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBpbmZvLmlkICAgPSBzbG9nLmlkXG4gICAgICAgIGluZm8uaWNvbiA9IHNsb2cuaWNvblxuICAgICAgICBpbmZvLnR5cGUgPSBzbG9nLnR5cGVcbiAgICAgICAgbGluZXMgPSBpbmZvLnN0ci5zcGxpdCAnXFxuJ1xuICAgICAgICBpZiBsaW5lcy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICAgICAgaW5mby5zdHIgPSBsaW5lXG4gICAgICAgICAgICAgICAgaW5mb3MucHVzaCBPYmplY3QuYXNzaWduIHt9LCBpbmZvXG4gICAgICAgICAgICAgICAgaW5mby5zZXAgID0gJydcbiAgICAgICAgICAgICAgICBpbmZvLmljb24gPSAnJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpbmZvcy5wdXNoIGluZm9cbiAgICAgICAgICAgIFxuICAgICAgICBkdW1wSW1tZWRpYXRlbHkoKSAjIHNoZWxsIHNjcmlwdHMgbmVlZCBpbW1lZGlhdGUgZHVtcFxuICAgICAgICBcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgZXJyb3IgXCJreGsubG9nLmZpbGVMb2cgLS0gXCIgZXJyLnN0YWNrXG4gICAgICAgIHNsb2cuZmlsZSA9IGZhbHNlXG5cbiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcblxuc2xvZyA9IChzKSAtPlxuICAgIFxuICAgIHsga3N0ciwgcG9zdCwgc2xhc2ggfSA9IHJlcXVpcmUgJy4va3hrJ1xuICAgIFxuICAgIHRyeSAjIGZhbmN5IGxvZyB3aXRoIHNvdXJjZS1tYXBwZWQgZmlsZXMgYW5kIGxpbmUgbnVtYmVyc1xuICAgICAgICBmID0gc3RhY2suY2FwdHVyZSgpW3Nsb2cuZGVwdGhdXG4gICAgICAgIHNvcmNlcnkgPSByZXF1aXJlICdzb3JjZXJ5J1xuICAgICAgICBcbiAgICAgICAgaW5mbyA9IHNvdXJjZTogc2xhc2gudGlsZGUoZi5nZXRGaWxlTmFtZSgpKSwgbGluZTogZi5nZXRMaW5lTnVtYmVyKClcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBpZiBjaGFpbiA9IHNvcmNlcnkubG9hZFN5bmMoZi5nZXRGaWxlTmFtZSgpKVxuICAgICAgICAgICAgICAgIHNvcmNlcnlJbmZvID0gY2hhaW4udHJhY2UoZi5nZXRMaW5lTnVtYmVyKCksIDApXG4gICAgICAgICAgICAgICAgaWYgbm90IHNsYXNoLnNhbWVQYXRoIGYuZ2V0U2NyaXB0TmFtZU9yU291cmNlVVJMKCksIGYuZ2V0RmlsZU5hbWUoKVxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIGYuZ2V0U2NyaXB0TmFtZU9yU291cmNlVVJMKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNsYXNoLnBhdGggZi5nZXRTY3JpcHROYW1lT3JTb3VyY2VVUkwoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2guZGlyKGYuZ2V0RmlsZU5hbWUoKSksIGYuZ2V0U2NyaXB0TmFtZU9yU291cmNlVVJMKClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IGYuZ2V0RmlsZU5hbWUoKVxuICAgICAgICAgICAgICAgIHNvcmNlcnlJbmZvLnNvdXJjZSA9IHNsYXNoLnRpbGRlIHNvdXJjZVxuICAgICAgICAgICAgICAgIGluZm8gPSBzb3JjZXJ5SW5mb1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIHRydWVcblxuICAgICAgICBmaWxlID0ga3N0ci5scGFkIFwiI3tpbmZvLnNvdXJjZX06I3tpbmZvLmxpbmV9XCIsIHNsb2cuZmlsZXBhZFxuICAgICAgICBtZXRoID0ga3N0ci5ycGFkIGYuZ2V0RnVuY3Rpb25OYW1lKCksIHNsb2cubWV0aHBhZFxuICAgICAgICBpbmZvLnN0ciA9IHNcbiAgICAgICAgcyA9IFwiI3tmaWxlfSN7c2xvZy5maWxlc2VwfSN7bWV0aH0je3Nsb2cubWV0aHNlcH0je3N9XCJcbiAgICAgICAgcG9zdD8uZW1pdD8gJ3Nsb2cnIHMsIGluZm9cbiAgICAgICAgaWYgc2xvZy5maWxlXG4gICAgICAgICAgICBmaWxlTG9nIGluZm8gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgIGNhdGNoIGVyclxuICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgcG9zdC5lbWl0ICdzbG9nJyBcIiEje3Nsb2cubWV0aHNlcH0je3N9ICN7ZXJyfVwiXG4gICAgICAgIGlmIHNsb2cuZmlsZVxuICAgICAgICAgICAgZmlsZUxvZyBzdHI6cyArIGVyclxuXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuXG5rbG9nID0gLT5cbiAgICBcbiAgICB7cG9zdCwga3N0cn0gPSByZXF1aXJlICcuL2t4aydcbiAgICBzID0gKGtzdHIocykgZm9yIHMgaW4gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDApLmpvaW4gXCIgXCIgXG4gICAgXG4gICAgcG9zdD8uZW1pdD8gJ2xvZycgc1xuICAgIGNvbnNvbGUubG9nIHNcbiAgICBzbG9nIHNcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwMDAwMCAgICAgXG4gICAgXG5zbG9nLmZpbGUgPSB0cnVlXG5pZiBwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMidcbiAgICBzbG9nLmxvZ0ZpbGUgPSAnfi9BcHBEYXRhL1JvYW1pbmcva2xvZy50eHQnXG5lbHNlIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gJ2RhcndpbidcbiAgICBzbG9nLmxvZ0ZpbGUgPSAnfi9MaWJyYXJ5L0FwcGxpY2F0aW9uIFN1cHBvcnQva2xvZy50eHQnXG4jIGVsc2VcbiAgICAjIHNsYXNoID0gcmVxdWlyZSAna3NsYXNoJ1xuICAgICMgaWYgc2xhc2guaXNGaWxlICd+L0FwcERhdGEvUm9hbWluZy9rbG9nLnR4dCdcbiAgICAgICAgIyBzbG9nLmxvZ0ZpbGUgPSAnfi9BcHBEYXRhL1JvYW1pbmcva2xvZy50eHQnXG4gICAgIyBlbHNlXG4gICAgICAgICMgc2xvZy5maWxlID0gZmFsc2Vcblxuc2xvZy5pZCAgICAgID0gJz8/PydcbnNsb2cudHlwZSAgICA9IGlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInIHRoZW4gJ3dpbicgZWxzZSAnbWFpbidcbnNsb2cuaWNvbiAgICA9IGlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInIHRoZW4gJ+KXjycgZWxzZSAn4pe8J1xuc2xvZy5kZXB0aCAgID0gMlxuc2xvZy5maWxlc2VwID0gJyA+ICdcbnNsb2cubWV0aHNlcCA9ICcgPj4gJ1xuc2xvZy5maWxlcGFkID0gMzBcbnNsb2cubWV0aHBhZCA9IDE1XG5cbmtsb2cuc2xvZyAgICA9IHNsb2dcbmtsb2cuZmxvZyAgICA9IGZpbGVMb2dcblxudHJ5XG4gICAgaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcbiAgICAgICAgeyBwb3N0IH0gPSByZXF1aXJlICcuL2t4aydcbiAgICAgICAgc2xvZy5pZCA9IHBvc3QuZ2V0ICdhcHBOYW1lJ1xuICAgIGVsc2UgaWYgcHJvY2Vzcy50eXBlID09ICdicm93c2VyJ1xuICAgICAgICBzbG9nLmlkID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5hcHAuZ2V0TmFtZSgpXG4gICAgIyBzbGFzaCA9IHJlcXVpcmUgJ2tzbGFzaCdcbiAgICAjIHNsb2cubG9nRmlsZSA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2tsb2cudHh0J1xuY2F0Y2ggZXJyXG4gICAgd2FybiBlcnJcbiAgICAjIHRyeVxuICAgICAgICAjIHNsYXNoID0gcmVxdWlyZSAna3NsYXNoJ1xuICAgICAgICAjIGlmIHByb2Nlc3MuYXJndlswXS5sZW5ndGggYW5kIHNsYXNoLmJhc2UocHJvY2Vzcy5hcmd2WzBdKSBpbiBbJ25vZGUnICdjb2ZmZWUnICdrb2ZmZWUnICdlbGVjdHJvbiddXG4gICAgICAgICAgICAjIGlmIHByb2Nlc3MuYXJndlsxXT8ubGVuZ3RoXG4gICAgICAgICAgICAgICAgIyBzbG9nLmlkID0gc2xhc2guYmFzZSBwcm9jZXNzLmFyZ3ZbMV1cbiAgICAgICAgIyBlbHNlIGlmIHNsYXNoLmV4dChwcm9jZXNzLmFyZ3ZbLTFdKSBpbiBbJ2pzJ11cbiAgICAgICAgICAgICMgc2xvZy5pZCA9IHNsYXNoLmJhc2UgcHJvY2Vzcy5hcmd2Wy0xXVxuICAgICAgICAjIGVsc2VcbiAgICAgICAgICAgICMgd2FybiBcImNhbid0IGZpZ3VyZSBvdXQgc2xvZy5pZCAtLSBwcm9jZXNzLmFyZ3Y6XCIgcHJvY2Vzcy5hcmd2LmpvaW4gJyAnXG4gICAgIyBjYXRjaCBlcnJcbiAgICAgICAgIyBudWxsXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGtsb2dcblxuIl19
//# sourceURL=../coffee/log.coffee