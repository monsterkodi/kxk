// koffee 0.43.0

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
        post.on('titlebar', this.onTitlebar);
        post.on('menuAction', this.onMenuAction);
        if (this.opt != null) {
            this.opt;
        } else {
            this.opt = {};
        }
        pkg = this.opt.pkg;
        this.elem = $((ref1 = this.opt.elem) != null ? ref1 : "#titlebar");
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
            case 'Minimize':
                return win.minimize();
            case 'Maximize':
                wa = electron.screen.getPrimaryDisplay().workAreaSize;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9HQUFBO0lBQUE7OztBQVFBLE1BQStGLE9BQUEsQ0FBUSxPQUFSLENBQS9GLEVBQUUsZUFBRixFQUFRLGFBQVIsRUFBYSxpQkFBYixFQUFvQixpQkFBcEIsRUFBMkIsbUJBQTNCLEVBQW1DLGlCQUFuQyxFQUEwQyxlQUExQyxFQUFnRCx5QkFBaEQsRUFBMkQscUJBQTNELEVBQW9FLGVBQXBFLEVBQTBFLGVBQTFFLEVBQWdGLGVBQWhGLEVBQXNGLFNBQXRGLEVBQXlGOztBQUVuRjtJQUVXLGVBQUMsSUFBRDtBQUVULFlBQUE7UUFGVSxJQUFDLENBQUEsTUFBRDs7Ozs7Ozs7UUFFVixJQUFJLENBQUMsRUFBTCxDQUFRLFVBQVIsRUFBc0IsSUFBQyxDQUFBLFVBQXZCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXNCLElBQUMsQ0FBQSxZQUF2Qjs7WUFFQSxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE1BQU87O1FBRVIsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFHLENBQUM7UUFFWCxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEseUNBQWMsV0FBZDtRQUNQLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsVUFBdkIsRUFBbUMsU0FBQyxLQUFEO21CQUFXLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixVQUF4QixDQUFqQjtRQUFYLENBQW5DO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7U0FBTDtRQUNYLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLElBQUEsQ0FBSyxLQUFMLEVBQVk7Z0JBQUEs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Q0FBNkIsVUFBN0IsRUFBeUMsSUFBekMsRUFqQko7O0lBRk87O29CQTJCWCxTQUFBLEdBQVcsU0FBQyxLQUFEO0FBRVAsWUFBQTtRQUFFLFFBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakI7UUFFWixRQUFBLEdBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBQTtRQUVYLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCLE9BQXZCO1FBQ1QsTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBVCxDQUFhLFFBQWIsRUFBdUIsT0FBdkI7UUFFVCxPQUFBLEdBQVUsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkO0FBRVYsYUFBQSx5Q0FBQTs7WUFDSSxNQUFBLEdBQVMsR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsR0FBakM7WUFDVCxNQUFBLEdBQVMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEtBQUQ7dUJBQVcsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsS0FBdkI7WUFBWCxDQUFYO1lBQ1QsSUFBRyxhQUFTLE1BQVQsRUFBQSxLQUFBLE1BQUg7Z0JBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBQTtnQkFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCO2dCQUNQLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVix3Q0FBc0MsSUFBSSxDQUFDLElBQTNDLEVBQWlELElBQWpEO0FBQ0EsdUJBQU8sS0FKWDs7QUFISjtlQVNBO0lBcEJPOzs7Ozs7QUFzQmYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgZWxlbSwgc2RzLCBwcmVmcywgc2xhc2gsIHNjaGVtZSwgZW1wdHksIHBvc3QsIHN0b3BFdmVudCwga2V5aW5mbywgbWVudSwgbm9vbiwga3N0ciwgJCwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFRpdGxlXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuXG4gICAgICAgIHBvc3Qub24gJ3RpdGxlYmFyJywgICBAb25UaXRsZWJhclxuICAgICAgICBwb3N0Lm9uICdtZW51QWN0aW9uJywgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBcbiAgICAgICAgcGtnID0gQG9wdC5wa2dcbiAgICAgICAgXG4gICAgICAgIEBlbGVtID0kIEBvcHQuZWxlbSA/IFwiI3RpdGxlYmFyXCJcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snLCAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudCwgcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2luaWNvbiA9IGVsZW0gY2xhc3M6ICd3aW5pY29uJ1xuICAgICAgICBpZiBAb3B0Lmljb25cbiAgICAgICAgICAgIEB3aW5pY29uLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQuaWNvblxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAd2luaWNvblxuICAgICAgICBAd2luaWNvbi5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicsICdPcGVuIE1lbnUnICAgXG4gICAgICAgIFxuICAgICAgICBAdGl0bGUgPSBlbGVtIGNsYXNzOiAndGl0bGViYXItdGl0bGUnXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB0aXRsZVxuICAgICAgICBAc2V0VGl0bGUgQG9wdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAjIOKAlCDil7sg8J+eqVxuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtaW5pbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOCAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiLTFcIiB5MT1cIjVcIiB4Mj1cIjExXCIgeTI9XCI1XCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQG1pbmltaXplXG4gICAgICAgIEBtaW5pbWl6ZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicsICdNaW5pbWl6ZSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWF4aW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMVwiIGhlaWdodD1cIjExXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6IDA7XCI+PC9yZWN0PlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWF4aW1pemVcbiAgICAgICAgQG1heGltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuXG4gICAgICAgIEBjbG9zZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gY2xvc2UnXG4gICAgICAgIFxuICAgICAgICBAY2xvc2UuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIxMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY2xvc2VcbiAgICAgICAgQGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ0Nsb3NlJ1xuXG4gICAgICAgIEB0b3BmcmFtZSA9IGVsZW0gY2xhc3M6ICd0b3BmcmFtZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRvcGZyYW1lXG4gICAgICAgIFxuICAgICAgICBAaW5pdFN0eWxlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQubWVudVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW5pdE1lbnUgQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgXG4gICAgcHVzaEVsZW06IChlbGVtKSAtPlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIGVsZW0sIEBtaW5pbWl6ZVxuICAgICAgICAgICAgXG4gICAgc2hvd1RpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdpbml0aWFsJ1xuICAgIGhpZGVUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2V0VGl0bGU6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBodG1sID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgcGFydHMgPSBvcHQudGl0bGUgPyBbXVxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy5uYW1lIGFuZCAnbmFtZScgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItbmFtZSc+I3tvcHQucGtnLm5hbWV9PC9zcGFuPlwiXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLnZlcnNpb24gYW5kICd2ZXJzaW9uJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiDil48gPC9zcGFuPlwiXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLXZlcnNpb24nPiN7b3B0LnBrZy52ZXJzaW9ufTwvc3Bhbj5cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cucGF0aCBhbmQgJ3BhdGgnIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+IOKWuiA8L3NwYW4+XCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItdmVyc2lvbic+I3tvcHQucGtnLnBhdGh9PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgaHRtbCA9PSBcIlwiXG4gICAgICAgICAgICBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgICAgICAgXG4gICAgICAgIEB0aXRsZS5pbm5lckhUTUwgPSBodG1sXG4gICAgXG4gICAgb25UaXRsZWJhcjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3Nob3dUaXRsZScgICB0aGVuIEBzaG93VGl0bGUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZVRpdGxlJyAgIHRoZW4gQGhpZGVUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdzaG93TWVudScgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZU1lbnUnICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ3RvZ2dsZU1lbnUnICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbicgIFxuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdUb2dnbGUgTWVudScgICAgICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ09wZW4gTWVudScgICAgICAgIHRoZW4gQG9wZW5NZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1Nob3cgTWVudScgICAgICAgIHRoZW4gQHNob3dNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUgTWVudScgICAgICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBTY2hlbWUnICAgIFxuICAgICAgICAgICAgICAgIGlmIEBvcHQuc2NoZW1lICE9IGZhbHNlIHRoZW4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgICAgICB3aGVuICdEZXZUb29scycgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy50b2dnbGVEZXZUb29scygpXG4gICAgICAgICAgICB3aGVuICdSZWxvYWQnICAgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgICAgICAgICAgIHRoZW4gd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ01pbmltaXplJyAgICAgICAgIHRoZW4gd2luLm1pbmltaXplKClcbiAgICAgICAgICAgIHdoZW4gJ01heGltaXplJyBcbiAgICAgICAgICAgICAgICB3YSA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICAgICAgICAgIHdiID0gd2luLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgbWF4aW1pemVkID0gd2luLmlzTWF4aW1pemVkKCkgb3IgKHdiLndpZHRoID09IHdhLndpZHRoIGFuZCB3Yi5oZWlnaHQgPT0gd2EuaGVpZ2h0KVxuICAgICAgICAgICAgICAgIGlmIG1heGltaXplZCB0aGVuIHdpbi51bm1heGltaXplKCkgZWxzZSB3aW4ubWF4aW1pemUoKSAgXG5cbiAgICBtZW51VGVtcGxhdGU6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAdGVtcGxhdGVDYWNoZVxuICAgICAgICAgICAgQHRlbXBsYXRlQ2FjaGUgPSBAbWFrZVRlbXBsYXRlIG5vb24ubG9hZCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQubWVudVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQubWVudVRlbXBsYXRlP1xuICAgICAgICAgICAgQG9wdC5tZW51VGVtcGxhdGUgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgXG4gICAgbWFrZVRlbXBsYXRlOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgdG1wbCA9IFtdXG4gICAgICAgIGZvciB0ZXh0LG1lbnVPckFjY2VsIG9mIG9ialxuICAgICAgICAgICAgdG1wbC5wdXNoIHN3aXRjaFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkobWVudU9yQWNjZWwpIGFuZCB0ZXh0LnN0YXJ0c1dpdGggJy0nXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgICAgICAgd2hlbiBfLmlzTnVtYmVyIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDprc3RyIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgd2hlbiBfLmlzU3RyaW5nIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDprZXlpbmZvLmNvbnZlcnRDbWRDdHJsIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgd2hlbiBlbXB0eSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6ICcnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBtZW51T3JBY2NlbC5hY2NlbD8gb3IgbWVudU9yQWNjZWwuY29tbWFuZD8gIyBuZWVkcyBiZXR0ZXIgdGVzdCFcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBfLmNsb25lIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRleHQgPSB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVudTpAbWFrZVRlbXBsYXRlIG1lbnVPckFjY2VsXG4gICAgICAgIHRtcGxcblxuICAgIGluaXRNZW51OiAoaXRlbXMpIC0+XG5cbiAgICAgICAgQG1lbnUgPSBuZXcgbWVudSBpdGVtczppdGVtc1xuICAgICAgICBAZWxlbS5pbnNlcnRCZWZvcmUgQG1lbnUuZWxlbSwgQGVsZW0uZmlyc3RDaGlsZC5uZXh0U2libGluZ1xuICAgICAgICBAaGlkZU1lbnUoKVxuXG4gICAgbWVudVZpc2libGU6ID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSAhPSAnbm9uZSdcbiAgICBzaG93TWVudTogICAgPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7IEBtZW51Py5mb2N1cz8oKTsgcG9zdC5lbWl0ICd0aXRsZWJhcicsICdoaWRlVGl0bGUnXG4gICAgaGlkZU1lbnU6ICAgID0+IEBtZW51Py5jbG9zZSgpOyBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IHBvc3QuZW1pdCAndGl0bGViYXInLCAnc2hvd1RpdGxlJ1xuICAgIHRvZ2dsZU1lbnU6ICA9PiBpZiBAbWVudVZpc2libGUoKSB0aGVuIEBoaWRlTWVudSgpIGVsc2UgQHNob3dNZW51KClcbiAgICBvcGVuTWVudTogICAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpOyBAbWVudS5vcGVuKClcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpbml0U3R5bGU6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBsaW5rID0kIFwiI3N0eWxlLWxpbmtcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gc2xhc2guZmlsZVVybCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcImNzcy9zdHlsZS5jc3NcIlxuICAgICAgICAgICAgdGl0bGVTdHlsZSA9IGVsZW0gJ2xpbmsnLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgICAgICAgICByZWw6ICAnc3R5bGVzaGVldCdcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9jc3MnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsaW5rLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlIHRpdGxlU3R5bGUsIGxpbmtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3MvI3twcmVmcy5nZXQgJ3NjaGVtZScsICdkYXJrJ30uY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIGlkOiAgICdzdHlsZS10aXRsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcblxuICAgIGhhbmRsZUtleTogKGV2ZW50KSAtPlxuXG4gICAgICAgIHsgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIG1haW5NZW51ID0gQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgYWNjZWxzID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnYWNjZWwnXG4gICAgICAgIGNvbWJvcyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2NvbWJvJ1xuICAgICAgICBcbiAgICAgICAga2VwYXRocyA9IGNvbWJvcy5jb25jYXQgYWNjZWxzICMgc3dhcCBvbiB3aW4/XG4gICAgICAgIFxuICAgICAgICBmb3Iga2V5cGF0aCBpbiBrZXBhdGhzXG4gICAgICAgICAgICBjb21ib3MgPSBzZHMuZ2V0KG1haW5NZW51LCBrZXlwYXRoKS5zcGxpdCAnICdcbiAgICAgICAgICAgIGNvbWJvcyA9IGNvbWJvcy5tYXAgKGNvbWJvKSAtPiBrZXlpbmZvLmNvbnZlcnRDbWRDdHJsIGNvbWJvXG4gICAgICAgICAgICBpZiBjb21ibyBpbiBjb21ib3NcbiAgICAgICAgICAgICAgICBrZXlwYXRoLnBvcCgpXG4gICAgICAgICAgICAgICAgaXRlbSA9IHNkcy5nZXQgbWFpbk1lbnUsIGtleXBhdGhcbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nLCBpdGVtLmFjdGlvbiA/IGl0ZW0udGV4dCwgaXRlbVxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtXG5cbiAgICAgICAgJ3VuaGFuZGxlZCdcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUaXRsZVxuIl19
//# sourceURL=../coffee/title.coffee