// koffee 1.4.0

/*
000000000  000  000000000  000      00000000
   000     000     000     000      000     
   000     000     000     000      0000000 
   000     000     000     000      000     
   000     000     000     0000000  00000000
 */
var $, Title, _, drag, elem, empty, keyinfo, klog, kstr, menu, noon, post, prefs, ref, scheme, sds, slash, stopEvent, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('./kxk'), post = ref.post, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, scheme = ref.scheme, slash = ref.slash, empty = ref.empty, prefs = ref.prefs, elem = ref.elem, drag = ref.drag, klog = ref.klog, noon = ref.noon, kstr = ref.kstr, menu = ref.menu, win = ref.win, sds = ref.sds, $ = ref.$, _ = ref._;

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
        this.onDragMove = bind(this.onDragMove, this);
        this.onDragStart = bind(this.onDragStart, this);
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
        this.initTitleDrag();
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

    Title.prototype.initTitleDrag = function() {
        var ref1;
        return this.titleDrag = new drag({
            target: document.body,
            handle: (ref1 = this.opt.dragElem) != null ? ref1 : this.elem,
            onStart: this.onDragStart,
            onMove: this.onDragMove,
            stopEvent: false
        });
    };

    Title.prototype.onDragStart = function(drag, event) {
        var electron;
        if (event.target.nodeName === 'INPUT') {
            return 'skip';
        }
        electron = require('electron');
        win = electron.remote.getCurrentWindow();
        win.titleDrag = false;
        return this.startBounds = win.getBounds();
    };

    Title.prototype.onDragMove = function(drag, event) {
        var electron;
        win.titleDrag = true;
        electron = require('electron');
        win = electron.remote.getCurrentWindow();
        return win.setBounds({
            x: this.startBounds.x + drag.deltaSum.x,
            y: this.startBounds.y + drag.deltaSum.y,
            width: this.startBounds.width,
            height: this.startBounds.height
        });
    };

    Title.prototype.setTitle = function(opt) {
        var html, parts, ref1;
        html = "";
        parts = (ref1 = opt.title) != null ? ref1 : [];
        if (opt.pkg.name && indexOf.call(parts, 'name') >= 0) {
            html += "<span class='titlebar-name'>" + opt.pkg.name + "</span>";
        }
        if (opt.pkg.version && indexOf.call(parts, 'version') >= 0) {
            html += "<span class='titlebar-dot'>" + opt.pkg.version + "</span>";
        }
        if (opt.pkg.path && indexOf.call(parts, 'path') >= 0) {
            html += "<span class='titlebar-dot'> ► </span>";
            html += "<span class='titlebar-name'>" + opt.pkg.path + "</span>";
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
        var electron, maximized, wa, wb;
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
        return (ref1 = this.menu) != null ? typeof ref1.focus === "function" ? ref1.focus() : void 0 : void 0;
    };

    Title.prototype.hideMenu = function() {
        var ref1;
        if ((ref1 = this.menu) != null) {
            ref1.close();
        }
        return this.menu.elem.style.display = 'none';
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
            combos = combos.map(function(c) {
                return keyinfo.convertCmdCtrl(c);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHFIQUFBO0lBQUE7OztBQVFBLE1BQWdILE9BQUEsQ0FBUSxPQUFSLENBQWhILEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLHFCQUFuQixFQUE0QixtQkFBNUIsRUFBb0MsaUJBQXBDLEVBQTJDLGlCQUEzQyxFQUFrRCxpQkFBbEQsRUFBeUQsZUFBekQsRUFBK0QsZUFBL0QsRUFBcUUsZUFBckUsRUFBMkUsZUFBM0UsRUFBaUYsZUFBakYsRUFBdUYsZUFBdkYsRUFBNkYsYUFBN0YsRUFBa0csYUFBbEcsRUFBdUcsU0FBdkcsRUFBMEc7O0FBRXBHO0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7OztZQUVBLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7UUFFUixHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUVYLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSx5Q0FBYyxXQUFkO1FBRVAsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLEVBQXFCLElBQUMsQ0FBQSxVQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFVBQXZCLEVBQWtDLFNBQUMsS0FBRDttQkFBVyxTQUFBLENBQVUsS0FBVixFQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBdUIsVUFBdkIsQ0FBakI7UUFBWCxDQUFsQztRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1NBQUw7UUFDWCxJQUFHLElBQUMs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Z0JBRUEsSUFBQSxFQUFNLFVBRk47Z0JBR0EsRUFBQSxFQUFNLGFBSE47YUFEUzttQkFNYixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQWhCLENBQTZCLFVBQTdCLEVBQXlDLElBQXpDLEVBakJKOztJQUZPOztvQkEyQlgsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBRSxRQUFVLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCO1FBRVosUUFBQSxHQUFXLElBQUMsQ0FBQSxZQUFELENBQUE7UUFFWCxNQUFBLEdBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFULENBQWEsUUFBYixFQUF1QixPQUF2QjtRQUNULE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCLE9BQXZCO1FBRVQsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZDtBQUVWLGFBQUEseUNBQUE7O1lBQ0ksTUFBQSxHQUFTLEdBQUcsQ0FBQyxHQUFKLENBQVEsUUFBUixFQUFrQixPQUFsQixDQUEwQixDQUFDLEtBQTNCLENBQWlDLEdBQWpDO1lBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBQyxDQUFEO3VCQUFPLE9BQU8sQ0FBQyxjQUFSLENBQXVCLENBQXZCO1lBQVAsQ0FBWDtZQUNULElBQUcsYUFBUyxNQUFULEVBQUEsS0FBQSxNQUFIO2dCQUNJLE9BQU8sQ0FBQyxHQUFSLENBQUE7Z0JBQ0EsSUFBQSxHQUFPLEdBQUcsQ0FBQyxHQUFKLENBQVEsUUFBUixFQUFrQixPQUFsQjtnQkFDUCxJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsd0NBQXFDLElBQUksQ0FBQyxJQUExQyxFQUFnRCxJQUFoRDtBQUNBLHVCQUFPLEtBSlg7O0FBSEo7ZUFTQTtJQXBCTzs7Ozs7O0FBc0JmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMjI1xuXG57IHBvc3QsIHN0b3BFdmVudCwga2V5aW5mbywgc2NoZW1lLCBzbGFzaCwgZW1wdHksIHByZWZzLCBlbGVtLCBkcmFnLCBrbG9nLCBub29uLCBrc3RyLCBtZW51LCB3aW4sIHNkcywgJCwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFRpdGxlXG4gICAgXG4gICAgQDogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIFxuICAgICAgICBwa2cgPSBAb3B0LnBrZ1xuICAgICAgICBcbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtID8gXCIjdGl0bGViYXJcIlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbVxuXG4gICAgICAgIHBvc3Qub24gJ3RpdGxlYmFyJyAgIEBvblRpdGxlYmFyXG4gICAgICAgIHBvc3Qub24gJ21lbnVBY3Rpb24nIEBvbk1lbnVBY3Rpb25cbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2RibGNsaWNrJyAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudCwgcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnTWF4aW1pemUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW5pY29uID0gZWxlbSBjbGFzczogJ3dpbmljb24nXG4gICAgICAgIGlmIEBvcHQuaWNvblxuICAgICAgICAgICAgQHdpbmljb24uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lmljb25cbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHdpbmljb25cbiAgICAgICAgQHdpbmljb24uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ09wZW4gTWVudScgICBcbiAgICAgICAgXG4gICAgICAgIEB0aXRsZSA9IGVsZW0gY2xhc3M6ICd0aXRsZWJhci10aXRsZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRpdGxlXG4gICAgICAgIFxuICAgICAgICBAaW5pdFRpdGxlRHJhZygpXG4gICAgICAgIEBzZXRUaXRsZSBAb3B0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICMg4oCUIOKXuyDwn56pXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIG1pbmltaXplIGdyYXknXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC04IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCItMVwiIHkxPVwiNVwiIHgyPVwiMTFcIiB5Mj1cIjVcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWluaW1pemVcbiAgICAgICAgQG1pbmltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNaW5pbWl6ZSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWF4aW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMVwiIGhlaWdodD1cIjExXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6IDA7XCI+PC9yZWN0PlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWF4aW1pemVcbiAgICAgICAgQG1heGltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNYXhpbWl6ZSdcblxuICAgICAgICBAY2xvc2UgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIGNsb3NlJ1xuICAgICAgICBcbiAgICAgICAgQGNsb3NlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOSAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMTBcIiB5Mj1cIjExXCI+PC9saW5lPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjBcIiB4Mj1cIjBcIiB5Mj1cIjExXCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQGNsb3NlXG4gICAgICAgIEBjbG9zZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnQ2xvc2UnXG5cbiAgICAgICAgQHRvcGZyYW1lID0gZWxlbSBjbGFzczogJ3RvcGZyYW1lJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdG9wZnJhbWVcbiAgICAgICAgXG4gICAgICAgIEBpbml0U3R5bGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBpbml0TWVudSBAbWVudVRlbXBsYXRlKClcbiAgICAgICBcbiAgICBwdXNoRWxlbTogKGVsZW0pIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5pbnNlcnRCZWZvcmUgZWxlbSwgQG1pbmltaXplXG4gICAgICAgICAgICBcbiAgICBzaG93VGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ2luaXRpYWwnXG4gICAgaGlkZVRpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGluaXRUaXRsZURyYWc6IC0+XG4gICAgICAgIFxuICAgICAgICBAdGl0bGVEcmFnID0gbmV3IGRyYWdcbiAgICAgICAgICAgIHRhcmdldDogICAgIGRvY3VtZW50LmJvZHlcbiAgICAgICAgICAgIGhhbmRsZTogICAgIEBvcHQuZHJhZ0VsZW0gPyBAZWxlbVxuICAgICAgICAgICAgb25TdGFydDogICAgQG9uRHJhZ1N0YXJ0XG4gICAgICAgICAgICBvbk1vdmU6ICAgICBAb25EcmFnTW92ZVxuICAgICAgICAgICAgc3RvcEV2ZW50OiAgZmFsc2VcbiAgICBcbiAgICBvbkRyYWdTdGFydDogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICBcbiAgICAgICAgaWYgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCdcbiAgICAgICAgICAgIHJldHVybiAnc2tpcCdcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICB3aW4udGl0bGVEcmFnID0gZmFsc2VcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gd2luLmdldEJvdW5kcygpICAgIFxuICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICB3aW4udGl0bGVEcmFnID0gdHJ1ZVxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIHdpbi5zZXRCb3VuZHMgXG4gICAgICAgICAgICB4OiAgICAgIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54IFxuICAgICAgICAgICAgeTogICAgICBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueSBcbiAgICAgICAgICAgIHdpZHRoOiAgQHN0YXJ0Qm91bmRzLndpZHRoIFxuICAgICAgICAgICAgaGVpZ2h0OiBAc3RhcnRCb3VuZHMuaGVpZ2h0XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzZXRUaXRsZTogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICBwYXJ0cyA9IG9wdC50aXRsZSA/IFtdXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLm5hbWUgYW5kICduYW1lJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1uYW1lJz4je29wdC5wa2cubmFtZX08L3NwYW4+XCJcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cudmVyc2lvbiBhbmQgJ3ZlcnNpb24nIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+I3tvcHQucGtnLnZlcnNpb259PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy5wYXRoIGFuZCAncGF0aCcgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4g4pa6IDwvc3Bhbj5cIlxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1uYW1lJz4je29wdC5wa2cucGF0aH08L3NwYW4+XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAdGl0bGUuaW5uZXJIVE1MID0gaHRtbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICBvblRpdGxlYmFyOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnc2hvd1RpdGxlJyAgIHRoZW4gQHNob3dUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlVGl0bGUnICAgdGhlbiBAaGlkZVRpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ3Nob3dNZW51JyAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlTWVudScgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAndG9nZ2xlTWVudScgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJyAgXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBNZW51JyAgICAgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnT3BlbiBNZW51JyAgICAgICAgdGhlbiBAb3Blbk1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnU2hvdyBNZW51JyAgICAgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZSBNZW51JyAgICAgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIFNjaGVtZScgICAgXG4gICAgICAgICAgICAgICAgaWYgQG9wdC5zY2hlbWUgIT0gZmFsc2UgdGhlbiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICAgICAgdGhlbiB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZScgICAgICAgICAgICAgdGhlbiB3aW4uaGlkZSgpXG4gICAgICAgICAgICB3aGVuICdNaW5pbWl6ZScgICAgICAgICB0aGVuIHdpbi5taW5pbWl6ZSgpXG4gICAgICAgICAgICB3aGVuICdNYXhpbWl6ZScgXG4gICAgICAgICAgICAgICAgd2EgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgICAgICAgICAgd2IgPSB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3aW4uaXNNYXhpbWl6ZWQoKSBvciAod2Iud2lkdGggPT0gd2Eud2lkdGggYW5kIHdiLmhlaWdodCA9PSB3YS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgaWYgbWF4aW1pemVkIHRoZW4gd2luLnVubWF4aW1pemUoKSBlbHNlIHdpbi5tYXhpbWl6ZSgpICBcblxuICAgIG1lbnVUZW1wbGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbXSBpZiBub3QgQG9wdC5kaXIgb3Igbm90IEBvcHQubWVudVxuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlID0gQG1ha2VUZW1wbGF0ZSBub29uLmxvYWQgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lm1lbnVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm1lbnVUZW1wbGF0ZT9cbiAgICAgICAgICAgIEBvcHQubWVudVRlbXBsYXRlIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIFxuICAgIG1ha2VUZW1wbGF0ZTogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGwgPSBbXVxuICAgICAgICBmb3IgdGV4dCxtZW51T3JBY2NlbCBvZiBvYmpcbiAgICAgICAgICAgIHRtcGwucHVzaCBzd2l0Y2hcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5KG1lbnVPckFjY2VsKSBhbmQgdGV4dC5zdGFydHNXaXRoICctJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgIHdoZW4gXy5pc051bWJlciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a3N0ciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gXy5pc1N0cmluZyBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a2V5aW5mby5jb252ZXJ0Q21kQ3RybCBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOiAnJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgbWVudU9yQWNjZWwuYWNjZWw/IG9yIG1lbnVPckFjY2VsLmNvbW1hbmQ/ICMgbmVlZHMgYmV0dGVyIHRlc3QhXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0gXy5jbG9uZSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnU6QG1ha2VUZW1wbGF0ZSBtZW51T3JBY2NlbFxuICAgICAgICB0bXBsXG5cbiAgICBpbml0TWVudTogKGl0ZW1zKSAtPlxuXG4gICAgICAgIEBtZW51ID0gbmV3IG1lbnUgaXRlbXM6aXRlbXNcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIEBtZW51LmVsZW0sIEBlbGVtLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmdcbiAgICAgICAgQGhpZGVNZW51KClcblxuICAgIG1lbnVWaXNpYmxlOiA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgIT0gJ25vbmUnXG4gICAgc2hvd01lbnU6ICAgID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snOyBAbWVudT8uZm9jdXM/KCkjOyBwb3N0LmVtaXQgJ3RpdGxlYmFyJyAnaGlkZVRpdGxlJ1xuICAgIGhpZGVNZW51OiAgICA9PiBAbWVudT8uY2xvc2UoKTsgQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnIzsgcG9zdC5lbWl0ICd0aXRsZWJhcicgJ3Nob3dUaXRsZSdcbiAgICB0b2dnbGVNZW51OiAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpXG4gICAgb3Blbk1lbnU6ICAgID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKTsgQG1lbnUub3BlbigpXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMCAwMDAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaW5pdFN0eWxlOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbGluayA9JCBcIiNzdHlsZS1saW5rXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3Mvc3R5bGUuY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzLyN7cHJlZnMuZ2V0ICdzY2hlbWUnICdkYXJrJ30uY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIGlkOiAgICdzdHlsZS10aXRsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcblxuICAgIGhhbmRsZUtleTogKGV2ZW50KSAtPlxuXG4gICAgICAgIHsgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIG1haW5NZW51ID0gQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgYWNjZWxzID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnYWNjZWwnXG4gICAgICAgIGNvbWJvcyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2NvbWJvJ1xuICAgICAgICBcbiAgICAgICAga2VwYXRocyA9IGNvbWJvcy5jb25jYXQgYWNjZWxzICMgc3dhcCBvbiB3aW4/XG4gICAgICAgIFxuICAgICAgICBmb3Iga2V5cGF0aCBpbiBrZXBhdGhzXG4gICAgICAgICAgICBjb21ib3MgPSBzZHMuZ2V0KG1haW5NZW51LCBrZXlwYXRoKS5zcGxpdCAnICdcbiAgICAgICAgICAgIGNvbWJvcyA9IGNvbWJvcy5tYXAgKGMpIC0+IGtleWluZm8uY29udmVydENtZEN0cmwgY1xuICAgICAgICAgICAgaWYgY29tYm8gaW4gY29tYm9zXG4gICAgICAgICAgICAgICAga2V5cGF0aC5wb3AoKVxuICAgICAgICAgICAgICAgIGl0ZW0gPSBzZHMuZ2V0IG1haW5NZW51LCBrZXlwYXRoXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdtZW51QWN0aW9uJyBpdGVtLmFjdGlvbiA/IGl0ZW0udGV4dCwgaXRlbVxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtXG5cbiAgICAgICAgJ3VuaGFuZGxlZCdcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUaXRsZVxuIl19
//# sourceURL=../coffee/title.coffee