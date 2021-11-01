// koffee 1.14.0

/*
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000
 */
var $, Win, _, electron, empty, keyinfo, klog, kpos, open, popup, post, prefs, ref, ref1, scheme, slash, stopEvent, title, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), $ = ref.$, _ = ref._, empty = ref.empty, keyinfo = ref.keyinfo, klog = ref.klog, kpos = ref.kpos, open = ref.open, popup = ref.popup, post = ref.post, prefs = ref.prefs, scheme = ref.scheme, slash = ref.slash, stopEvent = ref.stopEvent, title = ref.title, valid = ref.valid;

if (process.type === 'renderer') {
    electron = require('electron');
} else {
    console.error("this should be used in renderer process only! process.type: " + process.type + " grandpa: " + ((ref1 = module.parent.parent) != null ? ref1.filename : void 0) + " parent: " + module.parent.filename + " module: " + module.filename);
}

Win = (function() {
    function Win(opt) {
        var base, ref2, sep;
        this.opt = opt;
        this.onKeyUp = bind(this.onKeyUp, this);
        this.onKeyDown = bind(this.onKeyDown, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onMoved = bind(this.onMoved, this);
        window.onerror = function(msg, source, line, col, error) {
            var err;
            try {
                console.error('window.onerror', msg, source, line, col);
            } catch (error1) {
                err = error1;
                console.log('dafuk?', err);
            }
            return true;
        };
        sep = (ref2 = this.opt.prefsSeperator) != null ? ref2 : '▸';
        prefs.init({
            separator: sep
        });
        if (this.opt.icon) {
            klog.slog.icon = slash.fileUrl(slash.join(this.opt.dir, this.opt.icon));
        }
        this.id = window.winID = electron.ipcRenderer.sendSync('getWinID');
        window.win = this;
        this.modifiers = '';
        this.userData = post.get('userData');
        post.on('menuAction', this.onMenuAction);
        post.on('winMoved', this.onMoved);
        if ((base = this.opt).title != null) {
            base.title;
        } else {
            base.title = process.argv[0].endsWith('Electron Helper') && ['version'] || [];
        }
        window.titlebar = new title(this.opt);
        if (this.opt.context !== false) {
            document.body.addEventListener('contextmenu', this.onContextMenu);
        }
        if (!this.opt.nokeys) {
            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
        }
        if (this.opt.scheme !== false) {
            scheme.set(prefs.get('scheme', 'dark'));
        }
    }

    Win.prototype.getBounds = function() {
        return electron.ipcRenderer.sendSync('getWinBounds');
    };

    Win.prototype.setBounds = function(b) {
        return electron.ipcRenderer.send('setWinBounds', b);
    };

    Win.prototype.onMoved = function() {};

    Win.prototype.onMenuAction = function(action, args) {
        switch (action.toLowerCase()) {
            case 'preferences':
                return open(prefs.store.file);
        }
        electron.ipcRenderer.send('menuAction', action);
        return 'unhandled';
    };

    Win.prototype.onContextMenu = function(event) {
        var absPos, items, ref2;
        if ((ref2 = this.win) != null) {
            ref2.focus();
        }
        absPos = kpos(event);
        if (absPos == null) {
            absPos = kpos($("#main").getBoundingClientRect().left, $("#main").getBoundingClientRect().top);
        }
        items = _.clone(window.titlebar.menuTemplate());
        if (_.isFunction(this.opt.context)) {
            items = this.opt.context(items);
            if (empty(items)) {
                return;
            }
        } else {
            items.unshift({
                text: 'Clear',
                accel: 'cmdctrl+k'
            });
        }
        return popup.menu({
            items: items,
            x: absPos.x,
            y: absPos.y,
            onClose: function() {
                return post.emit('contextClosed');
            }
        });
    };

    Win.prototype.openFileDialog = function(arg) {
        var cb, defaultPath, properties, ref2, ref3, ref4, ref5, title;
        title = (ref2 = arg.title) != null ? ref2 : 'Open File', defaultPath = (ref3 = arg.defaultPath) != null ? ref3 : null, properties = (ref4 = arg.properties) != null ? ref4 : null, cb = (ref5 = arg.cb) != null ? ref5 : null;
        post.toMain('openFileDialog', {
            title: title,
            defaultPath: defaultPath,
            properties: properties
        });
        if (_.isFunction(cb)) {
            return post.once('openFileDialogResult', function(r) {
                if (!r.cancelled && valid(r.filePaths)) {
                    return cb(r.filePaths);
                }
            });
        }
    };

    Win.prototype.saveFileDialog = function(arg) {
        var cb, defaultPath, ref2, ref3, ref4, title;
        title = (ref2 = arg.title) != null ? ref2 : 'Save File', defaultPath = (ref3 = arg.defaultPath) != null ? ref3 : null, cb = (ref4 = arg.cb) != null ? ref4 : null;
        post.toMain('saveFileDialog', {
            title: title,
            defaultPath: defaultPath
        });
        if (_.isFunction(cb)) {
            return post.once('saveFileDialogResult', function(r) {
                klog('r', r);
                if (!r.cancelled && valid(r.filePath)) {
                    return cb(r.filePath);
                }
            });
        }
    };

    Win.prototype.messageBox = function(arg) {
        var buttons, cancelId, cb, defaultId, detail, message, options, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, title, type;
        type = (ref2 = arg.type) != null ? ref2 : 'warning', buttons = (ref3 = arg.buttons) != null ? ref3 : ['Ok'], defaultId = (ref4 = arg.defaultId) != null ? ref4 : 0, cancelId = (ref5 = arg.cancelId) != null ? ref5 : 0, title = (ref6 = arg.title) != null ? ref6 : '', message = (ref7 = arg.message) != null ? ref7 : 'no message!', detail = (ref8 = arg.detail) != null ? ref8 : 'no details!', cb = (ref9 = arg.cb) != null ? ref9 : null;
        options = arguments[0];
        cb = options.cb;
        delete options.cb;
        post.toMain('messageBox', options);
        if (_.isFunction(cb)) {
            return post.once('messageBoxResult', function(r) {
                return cb(r);
            });
        }
    };

    Win.prototype.onKeyDown = function(event) {
        var info;
        if ('unhandled' !== window.titlebar.handleKey(event, true)) {
            return stopEvent(event);
        }
        info = keyinfo.forEvent(event);
        this.modifiers = info.mod;
        info.event = event;
        return post.emit('combo', info.combo, info);
    };

    Win.prototype.onKeyUp = function(event) {
        var info;
        info = keyinfo.forEvent(event);
        return this.modifiers = info.mod;
    };

    return Win;

})();

module.exports = Win;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsid2luLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0SEFBQTtJQUFBOztBQVFBLE1BQXlHLE9BQUEsQ0FBUSxPQUFSLENBQXpHLEVBQUUsU0FBRixFQUFLLFNBQUwsRUFBUSxpQkFBUixFQUFlLHFCQUFmLEVBQXdCLGVBQXhCLEVBQThCLGVBQTlCLEVBQW9DLGVBQXBDLEVBQTBDLGlCQUExQyxFQUFpRCxlQUFqRCxFQUF1RCxpQkFBdkQsRUFBOEQsbUJBQTlELEVBQXNFLGlCQUF0RSxFQUE2RSx5QkFBN0UsRUFBd0YsaUJBQXhGLEVBQStGOztBQUUvRixJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0lBQ0ksUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLEVBRGY7Q0FBQSxNQUFBO0lBR0csT0FBQSxDQUFDLEtBQUQsQ0FBTyw4REFBQSxHQUErRCxPQUFPLENBQUMsSUFBdkUsR0FBNEUsWUFBNUUsR0FBdUYsNkNBQXFCLENBQUUsaUJBQXZCLENBQXZGLEdBQXVILFdBQXZILEdBQWtJLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBaEosR0FBeUosV0FBekosR0FBb0ssTUFBTSxDQUFDLFFBQWxMLEVBSEg7OztBQUtNO0lBRUMsYUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7UUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWMsSUFBZCxFQUFvQixHQUFwQixFQUF5QixLQUF6QjtBQUViLGdCQUFBO0FBQUE7Z0JBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyxnQkFBUCxFQUF3QixHQUF4QixFQUE2QixNQUE3QixFQUFxQyxJQUFyQyxFQUEyQyxHQUEzQyxFQURIO2FBQUEsY0FBQTtnQkFFTTtnQkFDRixPQUFPLENBQUMsR0FBUixDQUFZLFFBQVosRUFBcUIsR0FB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QUFBLENBQVUsS0FBVixFQUFQOztRQUVBLElBQUEsR0FBTyxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQjtRQUNQLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDO1FBRWxCLElBQUksQ0FBQyxLQUFMLEdBQWE7ZUFDYixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBa0IsSUFBSSxDQUFDLEtBQXZCLEVBQThCLElBQTlCO0lBUk87O2tCQVVYLE9BQUEsR0FBUyxTQUFDLEtBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCO2VBQ1AsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLENBQUM7SUFIYjs7Ozs7O0FBS2IsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyAkLCBfLCBlbXB0eSwga2V5aW5mbywga2xvZywga3Bvcywgb3BlbiwgcG9wdXAsIHBvc3QsIHByZWZzLCBzY2hlbWUsIHNsYXNoLCBzdG9wRXZlbnQsIHRpdGxlLCB2YWxpZCB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG4gICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbmVsc2VcbiAgICBlcnJvciBcInRoaXMgc2hvdWxkIGJlIHVzZWQgaW4gcmVuZGVyZXIgcHJvY2VzcyBvbmx5ISBwcm9jZXNzLnR5cGU6ICN7cHJvY2Vzcy50eXBlfSBncmFuZHBhOiAje21vZHVsZS5wYXJlbnQucGFyZW50Py5maWxlbmFtZX0gcGFyZW50OiAje21vZHVsZS5wYXJlbnQuZmlsZW5hbWV9IG1vZHVsZTogI3ttb2R1bGUuZmlsZW5hbWV9XCJcblxuY2xhc3MgV2luXG4gICAgXG4gICAgQDogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cub25lcnJvciA9IChtc2csIHNvdXJjZSwgbGluZSwgY29sLCBlcnJvcikgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZXJyb3IgJ3dpbmRvdy5vbmVycm9yJyBtc2csIHNvdXJjZSwgbGluZSwgY29sXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAnZGFmdWs/JyBlcnJcbiAgICAgICAgICAgICMgc3JjbWFwLmxvZ0VyciBlcnJcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXG4gICAgICAgIHNlcCA9IEBvcHQucHJlZnNTZXBlcmF0b3IgPyAn4pa4J1xuICAgICAgICBwcmVmcy5pbml0IHNlcGFyYXRvcjpzZXBcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuaWNvblxuICAgICAgICAgICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQuaWNvblxuICAgICAgICAgICAgICAgXG4gICAgICAgIEBpZCA9IHdpbmRvdy53aW5JRCA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyLnNlbmRTeW5jICdnZXRXaW5JRCdcbiAgICAgICAgd2luZG93LndpbiA9IEBcblxuICAgICAgICBAbW9kaWZpZXJzID0gJydcblxuICAgICAgICBAdXNlckRhdGEgPSBwb3N0LmdldCAndXNlckRhdGEnXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2t4ay5XaW4gaWQnIEBpZCwgJ3VzZXJEYXRhJyBAdXNlckRhdGFcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ21lbnVBY3Rpb24nIEBvbk1lbnVBY3Rpb25cbiAgICAgICAgcG9zdC5vbiAnd2luTW92ZWQnICAgQG9uTW92ZWRcbiAgICAgICAgXG4gICAgICAgIEBvcHQudGl0bGUgPz0gcHJvY2Vzcy5hcmd2WzBdLmVuZHNXaXRoKCdFbGVjdHJvbiBIZWxwZXInKSBhbmQgWyd2ZXJzaW9uJ10gb3IgW11cbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy50aXRsZWJhciA9IG5ldyB0aXRsZSBAb3B0XG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LmNvbnRleHQgIT0gZmFsc2VcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lciAnY29udGV4dG1lbnUnIEBvbkNvbnRleHRNZW51XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQG9wdC5ub2tleXNcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nIEBvbktleURvd25cbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2tleXVwJyAgIEBvbktleVVwXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0LnNjaGVtZSAhPSBmYWxzZVxuICAgICAgICAgICAgc2NoZW1lLnNldCBwcmVmcy5nZXQgJ3NjaGVtZScgJ2RhcmsnXG4gICAgICAgICAgICBcbiAgICAgICAgIyBpZiBfLmlzRnVuY3Rpb24gQG9wdC5vblNob3dcbiAgICAgICAgICAgICMgb25TaG93ID0gPT4gQG9wdC5vblNob3coKTsgQHdpbi5yZW1vdmVMaXN0ZW5lciAncmVhZHktdG8tc2hvdycgb25TaG93XG4gICAgICAgICAgICAjIEB3aW4ub24gJ3JlYWR5LXRvLXNob3cnIG9uU2hvd1xuICAgICAgICAjIGVsc2VcbiAgICAgICAgICAgICMgQHdpbi5vbiAncmVhZHktdG8tc2hvdycgPT4gQHdpbi5zaG93KClcblxuICAgICAgICAjIGlmIF8uaXNGdW5jdGlvbiBAb3B0Lm9uTG9hZFxuICAgICAgICAgICAgIyBvbkxvYWQgPSA9PiBAb3B0Lm9uTG9hZCgpOyBAd2luLndlYkNvbnRlbnRzLnJlbW92ZUxpc3RlbmVyICdkaWQtZmluaXNoLWxvYWQnIG9uTG9hZFxuICAgICAgICAgICAgIyBAd2luLndlYkNvbnRlbnRzLm9uICdkaWQtZmluaXNoLWxvYWQnIG9uTG9hZFxuICAgICAgICAgICAgXG4gICAgZ2V0Qm91bmRzOiAgICAgLT4gZWxlY3Ryb24uaXBjUmVuZGVyZXIuc2VuZFN5bmMgJ2dldFdpbkJvdW5kcydcbiAgICBzZXRCb3VuZHM6IChiKSAtPiBlbGVjdHJvbi5pcGNSZW5kZXJlci5zZW5kICdzZXRXaW5Cb3VuZHMnIGJcbiAgICBvbk1vdmVkOiAgICAgICA9PlxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuXG4gICAgICAgIHN3aXRjaCBhY3Rpb24udG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgd2hlbiAncHJlZmVyZW5jZXMnIHRoZW4gcmV0dXJuIG9wZW4gcHJlZnMuc3RvcmUuZmlsZVxuICAgICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5zZW5kICdtZW51QWN0aW9uJyBhY3Rpb25cbiAgICAgICAgJ3VuaGFuZGxlZCdcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+XG5cbiAgICAgICAgQHdpbj8uZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgYWJzUG9zID0ga3BvcyBldmVudFxuICAgICAgICBpZiBub3QgYWJzUG9zP1xuICAgICAgICAgICAgYWJzUG9zID0ga3BvcyAkKFwiI21haW5cIikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCwgJChcIiNtYWluXCIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgICAgICBcbiAgICAgICAgaXRlbXMgPSBfLmNsb25lIHdpbmRvdy50aXRsZWJhci5tZW51VGVtcGxhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIEBvcHQuY29udGV4dFxuICAgICAgICAgICAgaXRlbXMgPSBAb3B0LmNvbnRleHQgaXRlbXNcbiAgICAgICAgICAgIGlmIGVtcHR5IGl0ZW1zIFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpdGVtcy51bnNoaWZ0IHRleHQ6J0NsZWFyJyBhY2NlbDonY21kY3RybCtrJ1xuICAgICAgICBcbiAgICAgICAgcG9wdXAubWVudVxuICAgICAgICAgICAgaXRlbXM6ICAgaXRlbXNcbiAgICAgICAgICAgIHg6ICAgICAgIGFic1Bvcy54XG4gICAgICAgICAgICB5OiAgICAgICBhYnNQb3MueVxuICAgICAgICAgICAgb25DbG9zZTogLT4gcG9zdC5lbWl0ICdjb250ZXh0Q2xvc2VkJ1xuICAgIFxuICAgIG9wZW5GaWxlRGlhbG9nOiAodGl0bGU6J09wZW4gRmlsZScsIGRlZmF1bHRQYXRoOiwgcHJvcGVydGllczosIGNiOikgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdvcGVuRmlsZURpYWxvZycgdGl0bGU6dGl0bGUsIGRlZmF1bHRQYXRoOmRlZmF1bHRQYXRoLCBwcm9wZXJ0aWVzOnByb3BlcnRpZXNcbiAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIGNiIHRoZW4gcG9zdC5vbmNlICdvcGVuRmlsZURpYWxvZ1Jlc3VsdCcgKHIpIC0+IGlmIG5vdCByLmNhbmNlbGxlZCBhbmQgdmFsaWQgci5maWxlUGF0aHMgdGhlbiBjYiByLmZpbGVQYXRoc1xuICAgICAgICBcbiAgICBzYXZlRmlsZURpYWxvZzogKHRpdGxlOidTYXZlIEZpbGUnLCBkZWZhdWx0UGF0aDosIGNiOikgLT4gICAgICBcbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdzYXZlRmlsZURpYWxvZycgdGl0bGU6dGl0bGUsIGRlZmF1bHRQYXRoOmRlZmF1bHRQYXRoXG4gICAgICAgIGlmIF8uaXNGdW5jdGlvbiBjYiB0aGVuIHBvc3Qub25jZSAnc2F2ZUZpbGVEaWFsb2dSZXN1bHQnIChyKSAtPiBrbG9nICdyJyByOyBpZiBub3Qgci5jYW5jZWxsZWQgYW5kIHZhbGlkIHIuZmlsZVBhdGggdGhlbiBjYiByLmZpbGVQYXRoXG5cbiAgICBtZXNzYWdlQm94OiAoXG4gICAgICAgICAgICB0eXBlOiAgICAgICAnd2FybmluZydcbiAgICAgICAgICAgIGJ1dHRvbnM6ICAgIFsnT2snXVxuICAgICAgICAgICAgZGVmYXVsdElkOiAgMFxuICAgICAgICAgICAgY2FuY2VsSWQ6ICAgMFxuICAgICAgICAgICAgdGl0bGU6ICAgICAgJydcbiAgICAgICAgICAgIG1lc3NhZ2U6ICAgICdubyBtZXNzYWdlISdcbiAgICAgICAgICAgIGRldGFpbDogICAgICdubyBkZXRhaWxzISdcbiAgICAgICAgICAgIGNiOiBcbiAgICAgICAgICAgICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzWzBdXG4gICAgICAgIGNiID0gb3B0aW9ucy5jYlxuICAgICAgICBkZWxldGUgb3B0aW9ucy5jYlxuICAgICAgICBwb3N0LnRvTWFpbiAnbWVzc2FnZUJveCcgb3B0aW9uc1xuICAgICAgICBpZiBfLmlzRnVuY3Rpb24gY2IgdGhlbiBwb3N0Lm9uY2UgJ21lc3NhZ2VCb3hSZXN1bHQnIChyKSAtPiBjYiByXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwXG4gICAgXG4gICAgb25LZXlEb3duOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc3RvcEV2ZW50KGV2ZW50KSBpZiAndW5oYW5kbGVkJyAhPSB3aW5kb3cudGl0bGViYXIuaGFuZGxlS2V5IGV2ZW50LCB0cnVlXG4gICAgXG4gICAgICAgIGluZm8gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIEBtb2RpZmllcnMgPSBpbmZvLm1vZFxuICAgICAgICBcbiAgICAgICAgaW5mby5ldmVudCA9IGV2ZW50XG4gICAgICAgIHBvc3QuZW1pdCAnY29tYm8nIGluZm8uY29tYm8sIGluZm9cbiAgICBcbiAgICBvbktleVVwOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBpbmZvID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBAbW9kaWZpZXJzID0gaW5mby5tb2QgXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXaW5cbiJdfQ==
//# sourceURL=../coffee/win.coffee