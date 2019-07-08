// koffee 1.3.0

/*
000000000  000  000000000  000      00000000
   000     000     000     000      000     
   000     000     000     000      0000000 
   000     000     000     000      000     
   000     000     000     0000000  00000000
 */
var $, Title, _, elem, empty, keyinfo, kstr, menu, noon, post, prefs, ref, scheme, sds, slash, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('./kxk'), elem = ref.elem, sds = ref.sds, prefs = ref.prefs, slash = ref.slash, scheme = ref.scheme, empty = ref.empty, post = ref.post, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, menu = ref.menu, noon = ref.noon, kstr = ref.kstr, $ = ref.$, _ = ref._;

Title = (function() {
    function Title(opt1) {
        var pkg, ref1;
        this.opt = opt1;
        this.openMenu = bind(this.openMenu, this);
        this.toggleMenu = bind(this.toggleMenu, this);
        this.hideMenu = bind(this.hideMenu, this);
        this.showMenu = bind(this.showMenu, this);
        this.menuVisible = bind(this.menuVisible, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onTitlebar = bind(this.onTitlebar, this);
        if (this.opt != null) {
            this.opt;
        } else {
            this.opt = {};
        }
        pkg = this.opt.pkg;
        this.elem = $((ref1 = this.opt.elem) != null ? ref1 : "#titlebar");
        if (!this.elem) {
            return;
        }
        post.on('titlebar', this.onTitlebar);
        post.on('menuAction', this.onMenuAction);
        this.elem.addEventListener('dblclick', function(event) {
            return stopEvent(event, post.emit('menuAction', 'Maximize'));
        });
        this.winicon = elem({
            "class": 'winicon'
        });
        if (this.opt.icon) {
            this.winicon.appendChild(elem('img', {
                src: slash.fileUrl(slash.join(this.opt.dir, this.opt.icon))
            }));
        }
        this.elem.appendChild(this.winicon);
        this.winicon.addEventListener('click', function() {
            return post.emit('menuAction', 'Open Menu');
        });
        this.title = elem({
            "class": 'titlebar-title'
        });
        this.elem.appendChild(this.title);
        this.setTitle(this.opt);
        this.minimize = elem({
            "class": 'winbutton minimize gray'
        });
        this.minimize.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"-10 -8 30 30\">\n    <line x1=\"-1\" y1=\"5\" x2=\"11\" y2=\"5\"></line>\n</svg>";
        this.elem.appendChild(this.minimize);
        this.minimize.addEventListener('click', function() {
            return post.emit('menuAction', 'Minimize');
        });
        this.maximize = elem({
            "class": 'winbutton maximize gray'
        });
        this.maximize.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"-10 -9 30 30\">\n  <rect width=\"11\" height=\"11\" style=\"fill-opacity: 0;\"></rect>\n</svg>";
        this.elem.appendChild(this.maximize);
        this.maximize.addEventListener('click', function() {
            return post.emit('menuAction', 'Maximize');
        });
        this.close = elem({
            "class": 'winbutton close'
        });
        this.close.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"-10 -9 30 30\">\n    <line x1=\"0\" y1=\"0\" x2=\"10\" y2=\"11\"></line>\n    <line x1=\"10\" y1=\"0\" x2=\"0\" y2=\"11\"></line>\n</svg>";
        this.elem.appendChild(this.close);
        this.close.addEventListener('click', function() {
            return post.emit('menuAction', 'Close');
        });
        this.topframe = elem({
            "class": 'topframe'
        });
        this.elem.appendChild(this.topframe);
        this.initStyle();
        if (this.opt.menu) {
            this.initMenu(this.menuTemplate());
        }
    }

    Title.prototype.pushElem = function(elem) {
        return this.elem.insertBefore(elem, this.minimize);
    };

    Title.prototype.showTitle = function() {
        return this.title.style.display = 'initial';
    };

    Title.prototype.hideTitle = function() {
        return this.title.style.display = 'none';
    };

    Title.prototype.setTitle = function(opt) {
        var html, parts, ref1;
        html = "";
        parts = (ref1 = opt.title) != null ? ref1 : [];
        if (opt.pkg.name && indexOf.call(parts, 'name') >= 0) {
            html += "<span class='titlebar-name'>" + opt.pkg.name + "</span>";
        }
        if (opt.pkg.version && indexOf.call(parts, 'version') >= 0) {
            html += "<span class='titlebar-dot'> ● </span>";
            html += "<span class='titlebar-version'>" + opt.pkg.version + "</span>";
        }
        if (opt.pkg.path && indexOf.call(parts, 'path') >= 0) {
            html += "<span class='titlebar-dot'> ► </span>";
            html += "<span class='titlebar-version'>" + opt.pkg.path + "</span>";
        }
        if (html === "") {
            this.title.style.display = 'none';
        }
        return this.title.innerHTML = html;
    };

    Title.prototype.onTitlebar = function(action) {
        switch (action) {
            case 'showTitle':
                return this.showTitle();
            case 'hideTitle':
                return this.hideTitle();
            case 'showMenu':
                return this.showMenu();
            case 'hideMenu':
                return this.hideMenu();
            case 'toggleMenu':
                return this.toggleMenu();
        }
    };

    Title.prototype.onMenuAction = function(action, args) {
        var electron, maximized, wa, wb, win;
        electron = require('electron');
        win = electron.remote.getCurrentWindow();
        switch (action) {
            case 'Toggle Menu':
                return this.toggleMenu();
            case 'Open Menu':
                return this.openMenu();
            case 'Show Menu':
                return this.showMenu();
            case 'Hide Menu':
                return this.hideMenu();
            case 'Toggle Scheme':
                if (this.opt.scheme !== false) {
                    return scheme.toggle();
                }
                break;
            case 'DevTools':
                return win.webContents.toggleDevTools();
            case 'Reload':
                return win.webContents.reloadIgnoringCache();
            case 'Close':
                return win.close();
            case 'Hide':
                return win.hide();
            case 'Minimize':
                return win.minimize();
            case 'Maximize':
                wa = electron.remote.screen.getPrimaryDisplay().workAreaSize;
                wb = win.getBounds();
                maximized = win.isMaximized() || (wb.width === wa.width && wb.height === wa.height);
                if (maximized) {
                    return win.unmaximize();
                } else {
                    return win.maximize();
                }
        }
    };

    Title.prototype.menuTemplate = function() {
        if (!this.opt.dir || !this.opt.menu) {
            return [];
        }
        if (empty(this.templateCache)) {
            this.templateCache = this.makeTemplate(noon.load(slash.resolve(slash.join(this.opt.dir, this.opt.menu))));
        }
        if (this.opt.menuTemplate != null) {
            return this.opt.menuTemplate(this.templateCache);
        } else {
            return this.templateCache;
        }
    };

    Title.prototype.makeTemplate = function(obj) {
        var item, menuOrAccel, text, tmpl;
        tmpl = [];
        for (text in obj) {
            menuOrAccel = obj[text];
            tmpl.push((function() {
                switch (false) {
                    case !(empty(menuOrAccel) && text.startsWith('-')):
                        return {
                            text: ''
                        };
                    case !_.isNumber(menuOrAccel):
                        return {
                            text: text,
                            accel: kstr(menuOrAccel)
                        };
                    case !_.isString(menuOrAccel):
                        return {
                            text: text,
                            accel: keyinfo.convertCmdCtrl(menuOrAccel)
                        };
                    case !empty(menuOrAccel):
                        return {
                            text: text,
                            accel: ''
                        };
                    default:
                        if ((menuOrAccel.accel != null) || (menuOrAccel.command != null)) {
                            item = _.clone(menuOrAccel);
                            item.text = text;
                            return item;
                        } else {
                            return {
                                text: text,
                                menu: this.makeTemplate(menuOrAccel)
                            };
                        }
                }
            }).call(this));
        }
        return tmpl;
    };

    Title.prototype.initMenu = function(items) {
        this.menu = new menu({
            items: items
        });
        this.elem.insertBefore(this.menu.elem, this.elem.firstChild.nextSibling);
        return this.hideMenu();
    };

    Title.prototype.menuVisible = function() {
        return this.menu.elem.style.display !== 'none';
    };

    Title.prototype.showMenu = function() {
        var ref1;
        this.menu.elem.style.display = 'inline-block';
        if ((ref1 = this.menu) != null) {
            if (typeof ref1.focus === "function") {
                ref1.focus();
            }
        }
        return post.emit('titlebar', 'hideTitle');
    };

    Title.prototype.hideMenu = function() {
        var ref1;
        if ((ref1 = this.menu) != null) {
            ref1.close();
        }
        this.menu.elem.style.display = 'none';
        return post.emit('titlebar', 'showTitle');
    };

    Title.prototype.toggleMenu = function() {
        if (this.menuVisible()) {
            return this.hideMenu();
        } else {
            return this.showMenu();
        }
    };

    Title.prototype.openMenu = function() {
        if (this.menuVisible()) {
            return this.hideMenu();
        } else {
            this.showMenu();
            return this.menu.open();
        }
    };

    Title.prototype.initStyle = function() {
        var href, link, titleStyle;
        if (link = $("#style-link")) {
            href = slash.fileUrl(slash.resolve(slash.join(__dirname, "css/style.css")));
            titleStyle = elem('link', {
                href: href,
                rel: 'stylesheet',
                type: 'text/css'
            });
            link.parentNode.insertBefore(titleStyle, link);
            href = slash.fileUrl(slash.resolve(slash.join(__dirname, "css/" + (prefs.get('scheme', 'dark')) + ".css")));
            titleStyle = elem('link', {
                href: href,
                rel: 'stylesheet',
                type: 'text/css',
                id: 'style-title'
            });
            return link.parentNode.insertBefore(titleStyle, link);
        }
    };

    Title.prototype.handleKey = function(event) {
        var accels, combo, combos, i, item, kepaths, keypath, len, mainMenu, ref1;
        combo = keyinfo.forEvent(event).combo;
        mainMenu = this.menuTemplate();
        accels = sds.find.key(mainMenu, 'accel');
        combos = sds.find.key(mainMenu, 'combo');
        kepaths = combos.concat(accels);
        for (i = 0, len = kepaths.length; i < len; i++) {
            keypath = kepaths[i];
            combos = sds.get(mainMenu, keypath).split(' ');
            combos = combos.map(function(combo) {
                return keyinfo.convertCmdCtrl(combo);
            });
            if (indexOf.call(combos, combo) >= 0) {
                keypath.pop();
                item = sds.get(mainMenu, keypath);
                post.emit('menuAction', (ref1 = item.action) != null ? ref1 : item.text, item);
                return item;
            }
        }
        return 'unhandled';
    };

    return Title;

})();

module.exports = Title;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9HQUFBO0lBQUE7OztBQVFBLE1BQStGLE9BQUEsQ0FBUSxPQUFSLENBQS9GLEVBQUUsZUFBRixFQUFRLGFBQVIsRUFBYSxpQkFBYixFQUFvQixpQkFBcEIsRUFBMkIsbUJBQTNCLEVBQW1DLGlCQUFuQyxFQUEwQyxlQUExQyxFQUFnRCx5QkFBaEQsRUFBMkQscUJBQTNELEVBQW9FLGVBQXBFLEVBQTBFLGVBQTFFLEVBQWdGLGVBQWhGLEVBQXNGLFNBQXRGLEVBQXlGOztBQUVuRjtJQUVXLGVBQUMsSUFBRDtBQUVULFlBQUE7UUFGVSxJQUFDLENBQUEsTUFBRDs7Ozs7Ozs7O1lBRVYsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxNQUFPOztRQUVSLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDO1FBRVgsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLHlDQUFjLFdBQWQ7UUFFUCxJQUFVLENBQUksSUFBQyxDQUFBLElBQWY7QUFBQSxtQkFBQTs7UUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFVBQVIsRUFBc0IsSUFBQyxDQUFBLFVBQXZCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXNCLElBQUMsQ0FBQSxZQUF2QjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsVUFBdkIsRUFBbUMsU0FBQyxLQUFEO21CQUFXLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixVQUF4QixDQUFqQjtRQUFYLENBQW5DO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7U0FBTDtRQUNYLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLElBQUEsQ0FBSyxLQUFMLEVBQVk7Z0JBQUEsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQWhCLEVBQXFCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBMUIsQ0FBZCxDQUFKO2FBQVosQ0FBckIsRUFESjs7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQyxDQUFBLE9BQW5CO1FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxTQUFBO21CQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixXQUF4QjtRQUFILENBQW5DO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO1NBQUw7UUFDVCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQyxDQUFBLEtBQW5CO1FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsR0FBWDtRQUlBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx5QkFBUDtTQUFMO1FBRVosSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLEdBQXNCO1FBTXRCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFDLENBQUEsUUFBbkI7UUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLGdCQUFWLENBQTJCLE9BQTNCLEVBQW9DLFNBQUE7bUJBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxZQUFWLEVBQXdCLFVBQXhCO1FBQUgsQ0FBcEM7UUFFQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8seUJBQVA7U0FBTDtRQUVaLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixHQUFzQjtRQUt0QixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQyxDQUFBLFFBQW5CO1FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxnQkFBVixDQUEyQixPQUEzQixFQUFvQyxTQUFBO21CQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixVQUF4QjtRQUFILENBQXBDO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGlCQUFQO1NBQUw7UUFFVCxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsR0FBbUI7UUFPbkIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUMsQ0FBQSxLQUFuQjtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsZ0JBQVAsQ0FBd0IsT0FBeEIsRUFBaUMsU0FBQTttQkFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBd0IsT0FBeEI7UUFBSCxDQUFqQztRQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFQO1NBQUw7UUFDWixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQyxDQUFBLFFBQW5CO1FBRUEsSUFBQyxDQUFBLFNBQUQsQ0FBQTtRQUVBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBRUksSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsWUFBRCxDQUFBLENBQVYsRUFGSjs7SUFqRVM7O29CQXFFYixRQUFBLEdBQVUsU0FBQyxJQUFEO2VBRU4sSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFOLENBQW1CLElBQW5CLEVBQXlCLElBQUMsQ0FBQSxRQUExQjtJQUZNOztvQkFJVixTQUFBLEdBQVcsU0FBQTtlQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQWIsR0FBdUI7SUFBMUI7O29CQUNYLFNBQUEsR0FBVyxTQUFBO2VBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBYixHQUF1QjtJQUExQjs7b0JBUVgsUUFBQSxHQUFVLFNBQUMsR0FBRDtBQUVOLFlBQUE7UUFBQSxJQUFBLEdBQU87UUFFUCxLQUFBLHVDQUFvQjtRQUVwQixJQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBUixJQUFpQixhQUFVLEtBQVYsRUFBQSxNQUFBLE1BQXBCO1lBQ0ksSUFBQSxJQUFRLDhCQUFBLEdBQStCLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBdkMsR0FBNEMsVUFEeEQ7O1FBR0EsSUFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQVIsSUFBb0IsYUFBYSxLQUFiLEVBQUEsU0FBQSxNQUF2QjtZQUNJLElBQUEsSUFBUTtZQUNSLElBQUEsSUFBUSxpQ0FBQSxHQUFrQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQTFDLEdBQWtELFVBRjlEOztRQUlBLElBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFSLElBQWlCLGFBQVUsS0FBVixFQUFBLE1BQUEsTUFBcEI7WUFDSSxJQUFBLElBQVE7WUFDUixJQUFBLElBQVEsaUNBQUEsR0FBa0MsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUExQyxHQUErQyxVQUYzRDs7UUFJQSxJQUFHLElBQUEsS0FBUSxFQUFYO1lBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBYixHQUF1QixPQUQzQjs7ZUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsR0FBbUI7SUFwQmI7O29CQXNCVixVQUFBLEdBQVksU0FBQyxNQUFEO0FBRVIsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLFdBRFQ7dUJBQzRCLElBQUMsQ0FBQSxTQUFELENBQUE7QUFENUIsaUJBRVMsV0FGVDt1QkFFNEIsSUFBQyxDQUFBLFNBQUQsQ0FBQTtBQUY1QixpQkFHUyxVQUhUO3VCQUc0QixJQUFDLENBQUEsUUFBRCxDQUFBO0FBSDVCLGlCQUlTLFVBSlQ7dUJBSTRCLElBQUMsQ0FBQSxRQUFELENBQUE7QUFKNUIsaUJBS1MsWUFMVDt1QkFLNEIsSUFBQyxDQUFBLFVBQUQsQ0FBQTtBQUw1QjtJQUZROztvQkFlWixZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVDtBQUVWLFlBQUE7UUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7UUFDWCxHQUFBLEdBQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBaEIsQ0FBQTtBQUVOLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxhQURUO3VCQUNpQyxJQUFDLENBQUEsVUFBRCxDQUFBO0FBRGpDLGlCQUVTLFdBRlQ7dUJBRWlDLElBQUMsQ0FBQSxRQUFELENBQUE7QUFGakMsaUJBR1MsV0FIVDt1QkFHaUMsSUFBQyxDQUFBLFFBQUQsQ0FBQTtBQUhqQyxpQkFJUyxXQUpUO3VCQUlpQyxJQUFDLENBQUEsUUFBRCxDQUFBO0FBSmpDLGlCQUtTLGVBTFQ7Z0JBTVEsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsS0FBZSxLQUFsQjsyQkFBNkIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQUE3Qjs7QUFEQztBQUxULGlCQU9TLFVBUFQ7dUJBT2lDLEdBQUcsQ0FBQyxXQUFXLENBQUMsY0FBaEIsQ0FBQTtBQVBqQyxpQkFRUyxRQVJUO3VCQVFpQyxHQUFHLENBQUMsV0FBVyxDQUFDLG1CQUFoQixDQUFBO0FBUmpDLGlCQVNTLE9BVFQ7dUJBU2lDLEdBQUcsQ0FBQyxLQUFKLENBQUE7QUFUakMsaUJBVVMsTUFWVDt1QkFVaUMsR0FBRyxDQUFDLElBQUosQ0FBQTtBQVZqQyxpQkFXUyxVQVhUO3VCQVdpQyxHQUFHLENBQUMsUUFBSixDQUFBO0FBWGpDLGlCQVlTLFVBWlQ7Z0JBYVEsRUFBQSxHQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUF2QixDQUFBLENBQTBDLENBQUM7Z0JBQ2hELEVBQUEsR0FBSyxHQUFHLENBQUMsU0FBSixDQUFBO2dCQUNMLFNBQUEsR0FBWSxHQUFHLENBQUMsV0FBSixDQUFBLENBQUEsSUFBcUIsQ0FBQyxFQUFFLENBQUMsS0FBSCxLQUFZLEVBQUUsQ0FBQyxLQUFmLElBQXlCLEVBQUUsQ0FBQyxNQUFILEtBQWEsRUFBRSxDQUFDLE1BQTFDO2dCQUNqQyxJQUFHLFNBQUg7MkJBQWtCLEdBQUcsQ0FBQyxVQUFKLENBQUEsRUFBbEI7aUJBQUEsTUFBQTsyQkFBd0MsR0FBRyxDQUFDLFFBQUosQ0FBQSxFQUF4Qzs7QUFoQlI7SUFMVTs7b0JBdUJkLFlBQUEsR0FBYyxTQUFBO1FBRVYsSUFBYSxDQUFJLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBVCxJQUFnQixDQUFJLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBdEM7QUFBQSxtQkFBTyxHQUFQOztRQUVBLElBQUcsS0FBQSxDQUFNLElBQUMsQ0FBQSxhQUFQLENBQUg7WUFDSSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsWUFBRCxDQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBaEIsRUFBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUExQixDQUFkLENBQVYsQ0FBZCxFQURyQjs7UUFHQSxJQUFHLDZCQUFIO21CQUNJLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixJQUFDLENBQUEsYUFBbkIsRUFESjtTQUFBLE1BQUE7bUJBR0ksSUFBQyxDQUFBLGNBSEw7O0lBUFU7O29CQVlkLFlBQUEsR0FBYyxTQUFDLEdBQUQ7QUFFVixZQUFBO1FBQUEsSUFBQSxHQUFPO0FBQ1AsYUFBQSxXQUFBOztZQUNJLElBQUksQ0FBQyxJQUFMO0FBQVUsd0JBQUEsS0FBQTtBQUFBLDJCQUNELEtBQUEsQ0FBTSxXQUFOLENBQUEsSUFBdUIsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsRUFEdEI7K0JBRUY7NEJBQUEsSUFBQSxFQUFNLEVBQU47O0FBRkUsMEJBR0QsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxXQUFYLENBSEM7K0JBSUY7NEJBQUEsSUFBQSxFQUFLLElBQUw7NEJBQ0EsS0FBQSxFQUFNLElBQUEsQ0FBSyxXQUFMLENBRE47O0FBSkUsMEJBTUQsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxXQUFYLENBTkM7K0JBT0Y7NEJBQUEsSUFBQSxFQUFLLElBQUw7NEJBQ0EsS0FBQSxFQUFNLE9BQU8sQ0FBQyxjQUFSLENBQXVCLFdBQXZCLENBRE47O0FBUEUsMEJBU0QsS0FBQSxDQUFNLFdBQU4sQ0FUQzsrQkFVRjs0QkFBQSxJQUFBLEVBQUssSUFBTDs0QkFDQSxLQUFBLEVBQU8sRUFEUDs7QUFWRTt3QkFhRixJQUFHLDJCQUFBLElBQXNCLDZCQUF6Qjs0QkFDSSxJQUFBLEdBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxXQUFSOzRCQUNQLElBQUksQ0FBQyxJQUFMLEdBQVk7bUNBQ1osS0FISjt5QkFBQSxNQUFBO21DQUtJO2dDQUFBLElBQUEsRUFBSyxJQUFMO2dDQUNBLElBQUEsRUFBSyxJQUFDLENBQUEsWUFBRCxDQUFjLFdBQWQsQ0FETDs4QkFMSjs7QUFiRTt5QkFBVjtBQURKO2VBcUJBO0lBeEJVOztvQkEwQmQsUUFBQSxHQUFVLFNBQUMsS0FBRDtRQUVOLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxJQUFKLENBQVM7WUFBQSxLQUFBLEVBQU0sS0FBTjtTQUFUO1FBQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFOLENBQW1CLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBekIsRUFBK0IsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBaEQ7ZUFDQSxJQUFDLENBQUEsUUFBRCxDQUFBO0lBSk07O29CQU1WLFdBQUEsR0FBYSxTQUFBO2VBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQWpCLEtBQTRCO0lBQS9COztvQkFDYixRQUFBLEdBQWEsU0FBQTtBQUFHLFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBakIsR0FBMkI7OztvQkFBcUIsQ0FBRTs7O2VBQVUsSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWLEVBQXNCLFdBQXRCO0lBQS9EOztvQkFDYixRQUFBLEdBQWEsU0FBQTtBQUFHLFlBQUE7O2dCQUFLLENBQUUsS0FBUCxDQUFBOztRQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBakIsR0FBMkI7ZUFBUSxJQUFJLENBQUMsSUFBTCxDQUFVLFVBQVYsRUFBc0IsV0FBdEI7SUFBdEQ7O29CQUNiLFVBQUEsR0FBYSxTQUFBO1FBQUcsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7bUJBQXVCLElBQUMsQ0FBQSxRQUFELENBQUEsRUFBdkI7U0FBQSxNQUFBO21CQUF3QyxJQUFDLENBQUEsUUFBRCxDQUFBLEVBQXhDOztJQUFIOztvQkFDYixRQUFBLEdBQWEsU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO21CQUF1QixJQUFDLENBQUEsUUFBRCxDQUFBLEVBQXZCO1NBQUEsTUFBQTtZQUF3QyxJQUFDLENBQUEsUUFBRCxDQUFBO21CQUFhLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFBLEVBQXJEOztJQUFIOztvQkFRYixTQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxJQUFHLElBQUEsR0FBTSxDQUFBLENBQUUsYUFBRixDQUFUO1lBRUksSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsZUFBdEIsQ0FBZCxDQUFkO1lBQ1AsVUFBQSxHQUFhLElBQUEsQ0FBSyxNQUFMLEVBQ1Q7Z0JBQUEsSUFBQSxFQUFNLElBQU47Z0JBQ0EsR0FBQSxFQUFNLFlBRE47Z0JBRUEsSUFBQSxFQUFNLFVBRk47YUFEUztZQUtiLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBaEIsQ0FBNkIsVUFBN0IsRUFBeUMsSUFBekM7WUFFQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixNQUFBLEdBQU0sQ0FBQyxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVYsRUFBb0IsTUFBcEIsQ0FBRCxDQUFOLEdBQWtDLE1BQXhELENBQWQsQ0FBZDtZQUNQLFVBQUEsR0FBYSxJQUFBLENBQUssTUFBTCxFQUNUO2dCQUFBLElBQUEsRUFBTSxJQUFOO2dCQUNBLEdBQUEsRUFBTSxZQUROO2dCQUVBLElBQUEsRUFBTSxVQUZOO2dCQUdBLEVBQUEsRUFBTSxhQUhOO2FBRFM7bUJBTWIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFoQixDQUE2QixVQUE3QixFQUF5QyxJQUF6QyxFQWpCSjs7SUFGTzs7b0JBMkJYLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFFUCxZQUFBO1FBQUUsUUFBVSxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQjtRQUVaLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFBO1FBRVgsTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBVCxDQUFhLFFBQWIsRUFBdUIsT0FBdkI7UUFDVCxNQUFBLEdBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFULENBQWEsUUFBYixFQUF1QixPQUF2QjtRQUVULE9BQUEsR0FBVSxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQWQ7QUFFVixhQUFBLHlDQUFBOztZQUNJLE1BQUEsR0FBUyxHQUFHLENBQUMsR0FBSixDQUFRLFFBQVIsRUFBa0IsT0FBbEIsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyxHQUFqQztZQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQUMsS0FBRDt1QkFBVyxPQUFPLENBQUMsY0FBUixDQUF1QixLQUF2QjtZQUFYLENBQVg7WUFDVCxJQUFHLGFBQVMsTUFBVCxFQUFBLEtBQUEsTUFBSDtnQkFDSSxPQUFPLENBQUMsR0FBUixDQUFBO2dCQUNBLElBQUEsR0FBTyxHQUFHLENBQUMsR0FBSixDQUFRLFFBQVIsRUFBa0IsT0FBbEI7Z0JBQ1AsSUFBSSxDQUFDLElBQUwsQ0FBVSxZQUFWLHdDQUFzQyxJQUFJLENBQUMsSUFBM0MsRUFBaUQsSUFBakQ7QUFDQSx1QkFBTyxLQUpYOztBQUhKO2VBU0E7SUFwQk87Ozs7OztBQXNCZixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIyNcblxueyBlbGVtLCBzZHMsIHByZWZzLCBzbGFzaCwgc2NoZW1lLCBlbXB0eSwgcG9zdCwgc3RvcEV2ZW50LCBrZXlpbmZvLCBtZW51LCBub29uLCBrc3RyLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgVGl0bGVcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIFxuICAgICAgICBwa2cgPSBAb3B0LnBrZ1xuICAgICAgICBcbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtID8gXCIjdGl0bGViYXJcIlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbVxuXG4gICAgICAgIHBvc3Qub24gJ3RpdGxlYmFyJywgICBAb25UaXRsZWJhclxuICAgICAgICBwb3N0Lm9uICdtZW51QWN0aW9uJywgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snLCAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudCwgcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2luaWNvbiA9IGVsZW0gY2xhc3M6ICd3aW5pY29uJ1xuICAgICAgICBpZiBAb3B0Lmljb25cbiAgICAgICAgICAgIEB3aW5pY29uLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQuaWNvblxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAd2luaWNvblxuICAgICAgICBAd2luaWNvbi5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicsICdPcGVuIE1lbnUnICAgXG4gICAgICAgIFxuICAgICAgICBAdGl0bGUgPSBlbGVtIGNsYXNzOiAndGl0bGViYXItdGl0bGUnXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB0aXRsZVxuICAgICAgICBAc2V0VGl0bGUgQG9wdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAjIOKAlCDil7sg8J+eqVxuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtaW5pbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOCAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiLTFcIiB5MT1cIjVcIiB4Mj1cIjExXCIgeTI9XCI1XCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQG1pbmltaXplXG4gICAgICAgIEBtaW5pbWl6ZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicsICdNaW5pbWl6ZSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWF4aW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMVwiIGhlaWdodD1cIjExXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6IDA7XCI+PC9yZWN0PlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWF4aW1pemVcbiAgICAgICAgQG1heGltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuXG4gICAgICAgIEBjbG9zZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gY2xvc2UnXG4gICAgICAgIFxuICAgICAgICBAY2xvc2UuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIxMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY2xvc2VcbiAgICAgICAgQGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ0Nsb3NlJ1xuXG4gICAgICAgIEB0b3BmcmFtZSA9IGVsZW0gY2xhc3M6ICd0b3BmcmFtZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRvcGZyYW1lXG4gICAgICAgIFxuICAgICAgICBAaW5pdFN0eWxlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQubWVudVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW5pdE1lbnUgQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgXG4gICAgcHVzaEVsZW06IChlbGVtKSAtPlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIGVsZW0sIEBtaW5pbWl6ZVxuICAgICAgICAgICAgXG4gICAgc2hvd1RpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdpbml0aWFsJ1xuICAgIGhpZGVUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2V0VGl0bGU6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBodG1sID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgcGFydHMgPSBvcHQudGl0bGUgPyBbXVxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy5uYW1lIGFuZCAnbmFtZScgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItbmFtZSc+I3tvcHQucGtnLm5hbWV9PC9zcGFuPlwiXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLnZlcnNpb24gYW5kICd2ZXJzaW9uJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiDil48gPC9zcGFuPlwiXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLXZlcnNpb24nPiN7b3B0LnBrZy52ZXJzaW9ufTwvc3Bhbj5cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cucGF0aCBhbmQgJ3BhdGgnIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+IOKWuiA8L3NwYW4+XCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItdmVyc2lvbic+I3tvcHQucGtnLnBhdGh9PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgaHRtbCA9PSBcIlwiXG4gICAgICAgICAgICBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgICAgICAgXG4gICAgICAgIEB0aXRsZS5pbm5lckhUTUwgPSBodG1sXG4gICAgXG4gICAgb25UaXRsZWJhcjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3Nob3dUaXRsZScgICB0aGVuIEBzaG93VGl0bGUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZVRpdGxlJyAgIHRoZW4gQGhpZGVUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdzaG93TWVudScgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZU1lbnUnICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ3RvZ2dsZU1lbnUnICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbicgIFxuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdUb2dnbGUgTWVudScgICAgICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ09wZW4gTWVudScgICAgICAgIHRoZW4gQG9wZW5NZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1Nob3cgTWVudScgICAgICAgIHRoZW4gQHNob3dNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUgTWVudScgICAgICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBTY2hlbWUnICAgIFxuICAgICAgICAgICAgICAgIGlmIEBvcHQuc2NoZW1lICE9IGZhbHNlIHRoZW4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgICAgICB3aGVuICdEZXZUb29scycgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy50b2dnbGVEZXZUb29scygpXG4gICAgICAgICAgICB3aGVuICdSZWxvYWQnICAgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgICAgICAgICAgIHRoZW4gd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUnICAgICAgICAgICAgIHRoZW4gd2luLmhpZGUoKVxuICAgICAgICAgICAgd2hlbiAnTWluaW1pemUnICAgICAgICAgdGhlbiB3aW4ubWluaW1pemUoKVxuICAgICAgICAgICAgd2hlbiAnTWF4aW1pemUnIFxuICAgICAgICAgICAgICAgIHdhID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICAgICAgICAgIHdiID0gd2luLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgbWF4aW1pemVkID0gd2luLmlzTWF4aW1pemVkKCkgb3IgKHdiLndpZHRoID09IHdhLndpZHRoIGFuZCB3Yi5oZWlnaHQgPT0gd2EuaGVpZ2h0KVxuICAgICAgICAgICAgICAgIGlmIG1heGltaXplZCB0aGVuIHdpbi51bm1heGltaXplKCkgZWxzZSB3aW4ubWF4aW1pemUoKSAgXG5cbiAgICBtZW51VGVtcGxhdGU6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW10gaWYgbm90IEBvcHQuZGlyIG9yIG5vdCBAb3B0Lm1lbnVcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZSA9IEBtYWtlVGVtcGxhdGUgbm9vbi5sb2FkIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51VGVtcGxhdGU/XG4gICAgICAgICAgICBAb3B0Lm1lbnVUZW1wbGF0ZSBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBcbiAgICBtYWtlVGVtcGxhdGU6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICB0bXBsID0gW11cbiAgICAgICAgZm9yIHRleHQsbWVudU9yQWNjZWwgb2Ygb2JqXG4gICAgICAgICAgICB0bXBsLnB1c2ggc3dpdGNoXG4gICAgICAgICAgICAgICAgd2hlbiBlbXB0eShtZW51T3JBY2NlbCkgYW5kIHRleHQuc3RhcnRzV2l0aCAnLSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNOdW1iZXIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtzdHIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNTdHJpbmcgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtleWluZm8uY29udmVydENtZEN0cmwgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5IG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDogJydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG1lbnVPckFjY2VsLmFjY2VsPyBvciBtZW51T3JBY2NlbC5jb21tYW5kPyAjIG5lZWRzIGJldHRlciB0ZXN0IVxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbSA9IF8uY2xvbmUgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udGV4dCA9IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51OkBtYWtlVGVtcGxhdGUgbWVudU9yQWNjZWxcbiAgICAgICAgdG1wbFxuXG4gICAgaW5pdE1lbnU6IChpdGVtcykgLT5cblxuICAgICAgICBAbWVudSA9IG5ldyBtZW51IGl0ZW1zOml0ZW1zXG4gICAgICAgIEBlbGVtLmluc2VydEJlZm9yZSBAbWVudS5lbGVtLCBAZWxlbS5maXJzdENoaWxkLm5leHRTaWJsaW5nXG4gICAgICAgIEBoaWRlTWVudSgpXG5cbiAgICBtZW51VmlzaWJsZTogPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ICE9ICdub25lJ1xuICAgIHNob3dNZW51OiAgICA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJzsgQG1lbnU/LmZvY3VzPygpOyBwb3N0LmVtaXQgJ3RpdGxlYmFyJywgJ2hpZGVUaXRsZSdcbiAgICBoaWRlTWVudTogICAgPT4gQG1lbnU/LmNsb3NlKCk7IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgcG9zdC5lbWl0ICd0aXRsZWJhcicsICdzaG93VGl0bGUnXG4gICAgdG9nZ2xlTWVudTogID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKVxuICAgIG9wZW5NZW51OiAgICA9PiBpZiBAbWVudVZpc2libGUoKSB0aGVuIEBoaWRlTWVudSgpIGVsc2UgQHNob3dNZW51KCk7IEBtZW51Lm9wZW4oKVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGluaXRTdHlsZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGxpbmsgPSQgXCIjc3R5bGUtbGlua1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzL3N0eWxlLmNzc1wiXG4gICAgICAgICAgICB0aXRsZVN0eWxlID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gc2xhc2guZmlsZVVybCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcImNzcy8je3ByZWZzLmdldCAnc2NoZW1lJywgJ2RhcmsnfS5jc3NcIlxuICAgICAgICAgICAgdGl0bGVTdHlsZSA9IGVsZW0gJ2xpbmsnLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgICAgICAgICByZWw6ICAnc3R5bGVzaGVldCdcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9jc3MnXG4gICAgICAgICAgICAgICAgaWQ6ICAgJ3N0eWxlLXRpdGxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMFxuXG4gICAgaGFuZGxlS2V5OiAoZXZlbnQpIC0+XG5cbiAgICAgICAgeyBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBcbiAgICAgICAgbWFpbk1lbnUgPSBAbWVudVRlbXBsYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBhY2NlbHMgPSBzZHMuZmluZC5rZXkgbWFpbk1lbnUsICdhY2NlbCdcbiAgICAgICAgY29tYm9zID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnY29tYm8nXG4gICAgICAgIFxuICAgICAgICBrZXBhdGhzID0gY29tYm9zLmNvbmNhdCBhY2NlbHMgIyBzd2FwIG9uIHdpbj9cbiAgICAgICAgXG4gICAgICAgIGZvciBrZXlwYXRoIGluIGtlcGF0aHNcbiAgICAgICAgICAgIGNvbWJvcyA9IHNkcy5nZXQobWFpbk1lbnUsIGtleXBhdGgpLnNwbGl0ICcgJ1xuICAgICAgICAgICAgY29tYm9zID0gY29tYm9zLm1hcCAoY29tYm8pIC0+IGtleWluZm8uY29udmVydENtZEN0cmwgY29tYm9cbiAgICAgICAgICAgIGlmIGNvbWJvIGluIGNvbWJvc1xuICAgICAgICAgICAgICAgIGtleXBhdGgucG9wKClcbiAgICAgICAgICAgICAgICBpdGVtID0gc2RzLmdldCBtYWluTWVudSwga2V5cGF0aFxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbWVudUFjdGlvbicsIGl0ZW0uYWN0aW9uID8gaXRlbS50ZXh0LCBpdGVtXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cblxuICAgICAgICAndW5oYW5kbGVkJ1xuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlXG4iXX0=
//# sourceURL=../coffee/title.coffee