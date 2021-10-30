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
        switch (action) {
            case 'Preferences':
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsid2luLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0SEFBQTtJQUFBOztBQVFBLE1BQXlHLE9BQUEsQ0FBUSxPQUFSLENBQXpHLEVBQUUsU0FBRixFQUFLLFNBQUwsRUFBUSxpQkFBUixFQUFlLHFCQUFmLEVBQXdCLGVBQXhCLEVBQThCLGVBQTlCLEVBQW9DLGVBQXBDLEVBQTBDLGlCQUExQyxFQUFpRCxlQUFqRCxFQUF1RCxpQkFBdkQsRUFBOEQsbUJBQTlELEVBQXNFLGlCQUF0RSxFQUE2RSx5QkFBN0UsRUFBd0YsaUJBQXhGLEVBQStGOztBQUUvRixJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0lBQ0ksUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLEVBRGY7Q0FBQSxNQUFBO0lBR0csT0FBQSxDQUFDLEtBQUQsQ0FBTyw4REFBQSxHQUErRCxPQUFPLENBQUMsSUFBdkUsR0FBNEUsWUFBNUUsR0FBdUYsNkNBQXFCLENBQUUsaUJBQXZCLENBQXZGLEdBQXVILFdBQXZILEdBQWtJLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBaEosR0FBeUosV0FBekosR0FBb0ssTUFBTSxDQUFDLFFBQWxMLEVBSEg7OztBQUtNO0lBRUMsYUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7UUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWMsSUFBZCxFQUFvQixHQUFwQixFQUF5QixLQUF6QjtBQUViLGdCQUFBO0FBQUE7Z0JBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyxnQkFBUCxFQUF3QixHQUF4QixFQUE2QixNQUE3QixFQUFxQyxJQUFyQyxFQUEyQyxHQUEzQyxFQURIO2FBQUEsY0FBQTtnQkFFTTtnQkFDRixPQUFPLENBQUMsR0FBUixDQUFZLFFBQVosRUFBcUIsR0FB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O1FBRUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCO1FBQ1AsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLENBQUM7UUFFbEIsSUFBSSxDQUFDLEtBQUwsR0FBYTtlQUNiLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFrQixJQUFJLENBQUMsS0FBdkIsRUFBOEIsSUFBOUI7SUFSTzs7a0JBVVgsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakI7ZUFDUCxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksQ0FBQztJQUhiOzs7Ozs7QUFLYixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4wMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57ICQsIF8sIGVtcHR5LCBrZXlpbmZvLCBrbG9nLCBrcG9zLCBvcGVuLCBwb3B1cCwgcG9zdCwgcHJlZnMsIHNjaGVtZSwgc2xhc2gsIHN0b3BFdmVudCwgdGl0bGUsIHZhbGlkIH0gPSByZXF1aXJlICcuL2t4aydcblxuaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcbiAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuZWxzZVxuICAgIGVycm9yIFwidGhpcyBzaG91bGQgYmUgdXNlZCBpbiByZW5kZXJlciBwcm9jZXNzIG9ubHkhIHByb2Nlc3MudHlwZTogI3twcm9jZXNzLnR5cGV9IGdyYW5kcGE6ICN7bW9kdWxlLnBhcmVudC5wYXJlbnQ/LmZpbGVuYW1lfSBwYXJlbnQ6ICN7bW9kdWxlLnBhcmVudC5maWxlbmFtZX0gbW9kdWxlOiAje21vZHVsZS5maWxlbmFtZX1cIlxuXG5jbGFzcyBXaW5cbiAgICBcbiAgICBAOiAoQG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbmVycm9yID0gKG1zZywgc291cmNlLCBsaW5lLCBjb2wsIGVycm9yKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBlcnJvciAnd2luZG93Lm9uZXJyb3InIG1zZywgc291cmNlLCBsaW5lLCBjb2xcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICdkYWZ1az8nIGVyclxuICAgICAgICAgICAgIyBzcmNtYXAubG9nRXJyIGVyclxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgc2VwID0gQG9wdC5wcmVmc1NlcGVyYXRvciA/ICfilrgnXG4gICAgICAgIHByZWZzLmluaXQgc2VwYXJhdG9yOnNlcFxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5pY29uXG4gICAgICAgICAgICBrbG9nLnNsb2cuaWNvbiA9IHNsYXNoLmZpbGVVcmwgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5pY29uXG4gICAgICAgICAgICAgICBcbiAgICAgICAgQGlkID0gd2luZG93LndpbklEID0gZWxlY3Ryb24uaXBjUmVuZGVyZXIuc2VuZFN5bmMgJ2dldFdpbklEJ1xuICAgICAgICB3aW5kb3cud2luID0gQFxuXG4gICAgICAgIEBtb2RpZmllcnMgPSAnJ1xuXG4gICAgICAgIEB1c2VyRGF0YSA9IHBvc3QuZ2V0ICd1c2VyRGF0YSdcbiAgICAgICAgXG4gICAgICAgICMga2xvZyAna3hrLldpbiBpZCcgQGlkLCAndXNlckRhdGEnIEB1c2VyRGF0YVxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnbWVudUFjdGlvbicgQG9uTWVudUFjdGlvblxuICAgICAgICBwb3N0Lm9uICd3aW5Nb3ZlZCcgICBAb25Nb3ZlZFxuICAgICAgICBcbiAgICAgICAgQG9wdC50aXRsZSA/PSBwcm9jZXNzLmFyZ3ZbMF0uZW5kc1dpdGgoJ0VsZWN0cm9uIEhlbHBlcicpIGFuZCBbJ3ZlcnNpb24nXSBvciBbXVxuICAgICAgICBcbiAgICAgICAgd2luZG93LnRpdGxlYmFyID0gbmV3IHRpdGxlIEBvcHRcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuY29udGV4dCAhPSBmYWxzZVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyICdjb250ZXh0bWVudScgQG9uQ29udGV4dE1lbnVcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAb3B0Lm5va2V5c1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicgQG9uS2V5RG93blxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAna2V5dXAnICAgQG9uS2V5VXBcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQuc2NoZW1lICE9IGZhbHNlXG4gICAgICAgICAgICBzY2hlbWUuc2V0IHByZWZzLmdldCAnc2NoZW1lJyAnZGFyaydcbiAgICAgICAgICAgIFxuICAgICAgICAjIGlmIF8uaXNGdW5jdGlvbiBAb3B0Lm9uU2hvd1xuICAgICAgICAgICAgIyBvblNob3cgPSA9PiBAb3B0Lm9uU2hvdygpOyBAd2luLnJlbW92ZUxpc3RlbmVyICdyZWFkeS10by1zaG93JyBvblNob3dcbiAgICAgICAgICAgICMgQHdpbi5vbiAncmVhZHktdG8tc2hvdycgb25TaG93XG4gICAgICAgICMgZWxzZVxuICAgICAgICAgICAgIyBAd2luLm9uICdyZWFkeS10by1zaG93JyA9PiBAd2luLnNob3coKVxuXG4gICAgICAgICMgaWYgXy5pc0Z1bmN0aW9uIEBvcHQub25Mb2FkXG4gICAgICAgICAgICAjIG9uTG9hZCA9ID0+IEBvcHQub25Mb2FkKCk7IEB3aW4ud2ViQ29udGVudHMucmVtb3ZlTGlzdGVuZXIgJ2RpZC1maW5pc2gtbG9hZCcgb25Mb2FkXG4gICAgICAgICAgICAjIEB3aW4ud2ViQ29udGVudHMub24gJ2RpZC1maW5pc2gtbG9hZCcgb25Mb2FkXG4gICAgICAgICAgICBcbiAgICBnZXRCb3VuZHM6ICAgICAtPiBlbGVjdHJvbi5pcGNSZW5kZXJlci5zZW5kU3luYyAnZ2V0V2luQm91bmRzJ1xuICAgIHNldEJvdW5kczogKGIpIC0+IGVsZWN0cm9uLmlwY1JlbmRlcmVyLnNlbmQgJ3NldFdpbkJvdW5kcycgYlxuICAgIG9uTW92ZWQ6ICAgICAgID0+XG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG5cbiAgICAgICAgIyBrbG9nICdreGsud2luLm9uTWVudUFjdGlvbicgYWN0aW9uXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdQcmVmZXJlbmNlcycgdGhlbiByZXR1cm4gb3BlbiBwcmVmcy5zdG9yZS5maWxlXG4gICAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLmlwY1JlbmRlcmVyLnNlbmQgJ21lbnVBY3Rpb24nIGFjdGlvblxuICAgICAgICAndW5oYW5kbGVkJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT5cblxuICAgICAgICBAd2luPy5mb2N1cygpXG4gICAgICAgIFxuICAgICAgICBhYnNQb3MgPSBrcG9zIGV2ZW50XG4gICAgICAgIGlmIG5vdCBhYnNQb3M/XG4gICAgICAgICAgICBhYnNQb3MgPSBrcG9zICQoXCIjbWFpblwiKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0LCAkKFwiI21haW5cIikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgICAgIFxuICAgICAgICBpdGVtcyA9IF8uY2xvbmUgd2luZG93LnRpdGxlYmFyLm1lbnVUZW1wbGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBfLmlzRnVuY3Rpb24gQG9wdC5jb250ZXh0XG4gICAgICAgICAgICBpdGVtcyA9IEBvcHQuY29udGV4dCBpdGVtc1xuICAgICAgICAgICAgaWYgZW1wdHkgaXRlbXMgXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGl0ZW1zLnVuc2hpZnQgdGV4dDonQ2xlYXInIGFjY2VsOidjbWRjdHJsK2snXG4gICAgICAgIFxuICAgICAgICBwb3B1cC5tZW51XG4gICAgICAgICAgICBpdGVtczogICBpdGVtc1xuICAgICAgICAgICAgeDogICAgICAgYWJzUG9zLnhcbiAgICAgICAgICAgIHk6ICAgICAgIGFic1Bvcy55XG4gICAgICAgICAgICBvbkNsb3NlOiAtPiBwb3N0LmVtaXQgJ2NvbnRleHRDbG9zZWQnXG4gICAgXG4gICAgb3BlbkZpbGVEaWFsb2c6ICh0aXRsZTonT3BlbiBGaWxlJywgZGVmYXVsdFBhdGg6LCBwcm9wZXJ0aWVzOiwgY2I6KSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ29wZW5GaWxlRGlhbG9nJyB0aXRsZTp0aXRsZSwgZGVmYXVsdFBhdGg6ZGVmYXVsdFBhdGgsIHByb3BlcnRpZXM6cHJvcGVydGllc1xuICAgICAgICBpZiBfLmlzRnVuY3Rpb24gY2IgdGhlbiBwb3N0Lm9uY2UgJ29wZW5GaWxlRGlhbG9nUmVzdWx0JyAocikgLT4gaWYgbm90IHIuY2FuY2VsbGVkIGFuZCB2YWxpZCByLmZpbGVQYXRocyB0aGVuIGNiIHIuZmlsZVBhdGhzXG4gICAgICAgIFxuICAgIHNhdmVGaWxlRGlhbG9nOiAodGl0bGU6J1NhdmUgRmlsZScsIGRlZmF1bHRQYXRoOiwgY2I6KSAtPiAgICAgIFxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ3NhdmVGaWxlRGlhbG9nJyB0aXRsZTp0aXRsZSwgZGVmYXVsdFBhdGg6ZGVmYXVsdFBhdGhcbiAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIGNiIHRoZW4gcG9zdC5vbmNlICdzYXZlRmlsZURpYWxvZ1Jlc3VsdCcgKHIpIC0+IGtsb2cgJ3InIHI7IGlmIG5vdCByLmNhbmNlbGxlZCBhbmQgdmFsaWQgci5maWxlUGF0aCB0aGVuIGNiIHIuZmlsZVBhdGhcblxuICAgIG1lc3NhZ2VCb3g6IChcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICd3YXJuaW5nJ1xuICAgICAgICAgICAgYnV0dG9uczogICAgWydPayddXG4gICAgICAgICAgICBkZWZhdWx0SWQ6ICAwXG4gICAgICAgICAgICBjYW5jZWxJZDogICAwXG4gICAgICAgICAgICB0aXRsZTogICAgICAnJ1xuICAgICAgICAgICAgbWVzc2FnZTogICAgJ25vIG1lc3NhZ2UhJ1xuICAgICAgICAgICAgZGV0YWlsOiAgICAgJ25vIGRldGFpbHMhJ1xuICAgICAgICAgICAgY2I6IFxuICAgICAgICAgICAgKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMF1cbiAgICAgICAgY2IgPSBvcHRpb25zLmNiXG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLmNiXG4gICAgICAgIHBvc3QudG9NYWluICdtZXNzYWdlQm94JyBvcHRpb25zXG4gICAgICAgIGlmIF8uaXNGdW5jdGlvbiBjYiB0aGVuIHBvc3Qub25jZSAnbWVzc2FnZUJveFJlc3VsdCcgKHIpIC0+IGNiIHJcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzdG9wRXZlbnQoZXZlbnQpIGlmICd1bmhhbmRsZWQnICE9IHdpbmRvdy50aXRsZWJhci5oYW5kbGVLZXkgZXZlbnQsIHRydWVcbiAgICBcbiAgICAgICAgaW5mbyA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgQG1vZGlmaWVycyA9IGluZm8ubW9kXG4gICAgICAgIFxuICAgICAgICBpbmZvLmV2ZW50ID0gZXZlbnRcbiAgICAgICAgcG9zdC5lbWl0ICdjb21ibycgaW5mby5jb21ibywgaW5mb1xuICAgIFxuICAgIG9uS2V5VXA6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGluZm8gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIEBtb2RpZmllcnMgPSBpbmZvLm1vZCBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFdpblxuIl19
//# sourceURL=../coffee/win.coffee