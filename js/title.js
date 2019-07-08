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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9HQUFBO0lBQUE7OztBQVFBLE1BQStGLE9BQUEsQ0FBUSxPQUFSLENBQS9GLEVBQUUsZUFBRixFQUFRLGFBQVIsRUFBYSxpQkFBYixFQUFvQixpQkFBcEIsRUFBMkIsbUJBQTNCLEVBQW1DLGlCQUFuQyxFQUEwQyxlQUExQyxFQUFnRCx5QkFBaEQsRUFBMkQscUJBQTNELEVBQW9FLGVBQXBFLEVBQTBFLGVBQTFFLEVBQWdGLGVBQWhGLEVBQXNGLFNBQXRGLEVBQXlGOztBQUVuRjtJQUVXLGVBQUMsSUFBRDtBQUVULFlBQUE7UUFGVSxJQUFDLENBQUEsTUFBRDs7Ozs7Ozs7O1lBRVYsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxNQUFPOztRQUVSLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDO1FBRVgsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLHlDQUFjLFdBQWQ7UUFFUCxJQUFVLENBQUksSUFBQyxDQUFBLElBQWY7QUFBQSxtQkFBQTs7UUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFVBQVIsRUFBc0IsSUFBQyxDQUFBLFVBQXZCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXNCLElBQUMsQ0FBQSxZQUF2QjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsVUFBdkIsRUFBbUMsU0FBQyxLQUFEO21CQUFXLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixVQUF4QixDQUFqQjtRQUFYLENBQW5DO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7U0FBTDtRQUNYLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFSO1lBQ0ksSUFBQyxDQUFBLE9BQU8s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XG4wMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMjI1xuXG57IGVsZW0sIHNkcywgcHJlZnMsIHNsYXNoLCBzY2hlbWUsIGVtcHR5LCBwb3N0LCBzdG9wRXZlbnQsIGtleWluZm8sIG1lbnUsIG5vb24sIGtzdHIsICQsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBUaXRsZVxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQgPz0ge31cbiAgICAgICAgXG4gICAgICAgIHBrZyA9IEBvcHQucGtnXG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9JCBAb3B0LmVsZW0gPyBcIiN0aXRsZWJhclwiXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtXG5cbiAgICAgICAgcG9zdC5vbiAndGl0bGViYXInLCAgIEBvblRpdGxlYmFyXG4gICAgICAgIHBvc3Qub24gJ21lbnVBY3Rpb24nLCBAb25NZW51QWN0aW9uXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdkYmxjbGljaycsIChldmVudCkgLT4gc3RvcEV2ZW50IGV2ZW50LCBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nLCAnTWF4aW1pemUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW5pY29uID0gZWxlbSBjbGFzczogJ3dpbmljb24nXG4gICAgICAgIGlmIEBvcHQuaWNvblxuICAgICAgICAgICAgQHdpbmljb24uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJywgc3JjOnNsYXNoLmZpbGVVcmwgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5pY29uXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB3aW5pY29uXG4gICAgICAgIEB3aW5pY29uLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ09wZW4gTWVudScgICBcbiAgICAgICAgXG4gICAgICAgIEB0aXRsZSA9IGVsZW0gY2xhc3M6ICd0aXRsZWJhci10aXRsZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRpdGxlXG4gICAgICAgIEBzZXRUaXRsZSBAb3B0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICMg4oCUIOKXuyDwn56pXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIG1pbmltaXplIGdyYXknXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC04IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCItMVwiIHkxPVwiNVwiIHgyPVwiMTFcIiB5Mj1cIjVcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWluaW1pemVcbiAgICAgICAgQG1pbmltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01pbmltaXplJ1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtYXhpbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOSAzMCAzMFwiPlxuICAgICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjExXCIgaGVpZ2h0PVwiMTFcIiBzdHlsZT1cImZpbGwtb3BhY2l0eTogMDtcIj48L3JlY3Q+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBtYXhpbWl6ZVxuICAgICAgICBAbWF4aW1pemUuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nLCAnTWF4aW1pemUnXG5cbiAgICAgICAgQGNsb3NlID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBjbG9zZSdcbiAgICAgICAgXG4gICAgICAgIEBjbG9zZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIjBcIiB5MT1cIjBcIiB4Mj1cIjEwXCIgeTI9XCIxMVwiPjwvbGluZT5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIjEwXCIgeTE9XCIwXCIgeDI9XCIwXCIgeTI9XCIxMVwiPjwvbGluZT5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBjbG9zZVxuICAgICAgICBAY2xvc2UuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nLCAnQ2xvc2UnXG5cbiAgICAgICAgQHRvcGZyYW1lID0gZWxlbSBjbGFzczogJ3RvcGZyYW1lJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdG9wZnJhbWVcbiAgICAgICAgXG4gICAgICAgIEBpbml0U3R5bGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBpbml0TWVudSBAbWVudVRlbXBsYXRlKClcbiAgICAgICBcbiAgICBwdXNoRWxlbTogKGVsZW0pIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5pbnNlcnRCZWZvcmUgZWxlbSwgQG1pbmltaXplXG4gICAgICAgICAgICBcbiAgICBzaG93VGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ2luaXRpYWwnXG4gICAgaGlkZVRpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzZXRUaXRsZTogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICBwYXJ0cyA9IG9wdC50aXRsZSA/IFtdXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLm5hbWUgYW5kICduYW1lJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1uYW1lJz4je29wdC5wa2cubmFtZX08L3NwYW4+XCJcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cudmVyc2lvbiBhbmQgJ3ZlcnNpb24nIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+IOKXjyA8L3NwYW4+XCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItdmVyc2lvbic+I3tvcHQucGtnLnZlcnNpb259PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy5wYXRoIGFuZCAncGF0aCcgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4g4pa6IDwvc3Bhbj5cIlxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci12ZXJzaW9uJz4je29wdC5wa2cucGF0aH08L3NwYW4+XCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBodG1sID09IFwiXCJcbiAgICAgICAgICAgIEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHRpdGxlLmlubmVySFRNTCA9IGh0bWxcbiAgICBcbiAgICBvblRpdGxlYmFyOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnc2hvd1RpdGxlJyAgIHRoZW4gQHNob3dUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlVGl0bGUnICAgdGhlbiBAaGlkZVRpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ3Nob3dNZW51JyAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlTWVudScgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAndG9nZ2xlTWVudScgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJyAgXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBNZW51JyAgICAgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnT3BlbiBNZW51JyAgICAgICAgdGhlbiBAb3Blbk1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnU2hvdyBNZW51JyAgICAgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZSBNZW51JyAgICAgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIFNjaGVtZScgICAgXG4gICAgICAgICAgICAgICAgaWYgQG9wdC5zY2hlbWUgIT0gZmFsc2UgdGhlbiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICAgICAgdGhlbiB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnTWluaW1pemUnICAgICAgICAgdGhlbiB3aW4ubWluaW1pemUoKVxuICAgICAgICAgICAgd2hlbiAnTWF4aW1pemUnIFxuICAgICAgICAgICAgICAgIHdhID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgICAgICAgICAgd2IgPSB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3aW4uaXNNYXhpbWl6ZWQoKSBvciAod2Iud2lkdGggPT0gd2Eud2lkdGggYW5kIHdiLmhlaWdodCA9PSB3YS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgaWYgbWF4aW1pemVkIHRoZW4gd2luLnVubWF4aW1pemUoKSBlbHNlIHdpbi5tYXhpbWl6ZSgpICBcblxuICAgIG1lbnVUZW1wbGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbXSBpZiBub3QgQG9wdC5kaXIgb3Igbm90IEBvcHQubWVudVxuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlID0gQG1ha2VUZW1wbGF0ZSBub29uLmxvYWQgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lm1lbnVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm1lbnVUZW1wbGF0ZT9cbiAgICAgICAgICAgIEBvcHQubWVudVRlbXBsYXRlIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIFxuICAgIG1ha2VUZW1wbGF0ZTogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGwgPSBbXVxuICAgICAgICBmb3IgdGV4dCxtZW51T3JBY2NlbCBvZiBvYmpcbiAgICAgICAgICAgIHRtcGwucHVzaCBzd2l0Y2hcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5KG1lbnVPckFjY2VsKSBhbmQgdGV4dC5zdGFydHNXaXRoICctJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgIHdoZW4gXy5pc051bWJlciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a3N0ciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gXy5pc1N0cmluZyBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a2V5aW5mby5jb252ZXJ0Q21kQ3RybCBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOiAnJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgbWVudU9yQWNjZWwuYWNjZWw/IG9yIG1lbnVPckFjY2VsLmNvbW1hbmQ/ICMgbmVlZHMgYmV0dGVyIHRlc3QhXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0gXy5jbG9uZSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnU6QG1ha2VUZW1wbGF0ZSBtZW51T3JBY2NlbFxuICAgICAgICB0bXBsXG5cbiAgICBpbml0TWVudTogKGl0ZW1zKSAtPlxuXG4gICAgICAgIEBtZW51ID0gbmV3IG1lbnUgaXRlbXM6aXRlbXNcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIEBtZW51LmVsZW0sIEBlbGVtLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmdcbiAgICAgICAgQGhpZGVNZW51KClcblxuICAgIG1lbnVWaXNpYmxlOiA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgIT0gJ25vbmUnXG4gICAgc2hvd01lbnU6ICAgID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snOyBAbWVudT8uZm9jdXM/KCk7IHBvc3QuZW1pdCAndGl0bGViYXInLCAnaGlkZVRpdGxlJ1xuICAgIGhpZGVNZW51OiAgICA9PiBAbWVudT8uY2xvc2UoKTsgQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyBwb3N0LmVtaXQgJ3RpdGxlYmFyJywgJ3Nob3dUaXRsZSdcbiAgICB0b2dnbGVNZW51OiAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpXG4gICAgb3Blbk1lbnU6ICAgID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKTsgQG1lbnUub3BlbigpXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMCAwMDAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaW5pdFN0eWxlOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbGluayA9JCBcIiNzdHlsZS1saW5rXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3Mvc3R5bGUuY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzLyN7cHJlZnMuZ2V0ICdzY2hlbWUnLCAnZGFyayd9LmNzc1wiXG4gICAgICAgICAgICB0aXRsZVN0eWxlID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBpZDogICAnc3R5bGUtdGl0bGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsaW5rLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlIHRpdGxlU3R5bGUsIGxpbmtcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwXG5cbiAgICBoYW5kbGVLZXk6IChldmVudCkgLT5cblxuICAgICAgICB7IGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICAgICBtYWluTWVudSA9IEBtZW51VGVtcGxhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgIGFjY2VscyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2FjY2VsJ1xuICAgICAgICBjb21ib3MgPSBzZHMuZmluZC5rZXkgbWFpbk1lbnUsICdjb21ibydcbiAgICAgICAgXG4gICAgICAgIGtlcGF0aHMgPSBjb21ib3MuY29uY2F0IGFjY2VscyAjIHN3YXAgb24gd2luP1xuICAgICAgICBcbiAgICAgICAgZm9yIGtleXBhdGggaW4ga2VwYXRoc1xuICAgICAgICAgICAgY29tYm9zID0gc2RzLmdldChtYWluTWVudSwga2V5cGF0aCkuc3BsaXQgJyAnXG4gICAgICAgICAgICBjb21ib3MgPSBjb21ib3MubWFwIChjb21ibykgLT4ga2V5aW5mby5jb252ZXJ0Q21kQ3RybCBjb21ib1xuICAgICAgICAgICAgaWYgY29tYm8gaW4gY29tYm9zXG4gICAgICAgICAgICAgICAga2V5cGF0aC5wb3AoKVxuICAgICAgICAgICAgICAgIGl0ZW0gPSBzZHMuZ2V0IG1haW5NZW51LCBrZXlwYXRoXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgaXRlbS5hY3Rpb24gPyBpdGVtLnRleHQsIGl0ZW1cbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVxuXG4gICAgICAgICd1bmhhbmRsZWQnXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVGl0bGVcbiJdfQ==
//# sourceURL=../coffee/title.coffee