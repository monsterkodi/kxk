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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHFIQUFBO0lBQUE7OztBQVFBLE1BQWdILE9BQUEsQ0FBUSxPQUFSLENBQWhILEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLHFCQUFuQixFQUE0QixtQkFBNUIsRUFBb0MsaUJBQXBDLEVBQTJDLGlCQUEzQyxFQUFrRCxpQkFBbEQsRUFBeUQsZUFBekQsRUFBK0QsZUFBL0QsRUFBcUUsZUFBckUsRUFBMkUsZUFBM0UsRUFBaUYsZUFBakYsRUFBdUYsZUFBdkYsRUFBNkYsYUFBN0YsRUFBa0csYUFBbEcsRUFBdUcsU0FBdkcsRUFBMEc7O0FBRXBHO0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7OztZQUVBLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7UUFFUixHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUVYLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSx5Q0FBYyxXQUFkO1FBRVAsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLEVBQXFCLElBQUMsQ0FBQSxVQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFVBQXZCLEVBQWtDLFNBQUMsS0FBRDttQkFBVyxTQUFBLENBQVUsS0FBVixFQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBdUIsVUFBdkIsQ0FBakI7UUFBWCxDQUFsQztRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1NBQUw7UUFDWCxJQUFHLElBQUMs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Z0JBRUEsSUFBQSxFQUFNLFVBRk47Z0JBR0EsRUFBQSxFQUFNLGFBSE47YUFEUzttQkFNYixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQWhCLENBQTZCLFVBQTdCLEVBQXlDLElBQXpDLEVBakJKOztJQUZPOztvQkEyQlgsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBRSxRQUFVLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCO1FBRVosUUFBQSxHQUFXLElBQUMsQ0FBQSxZQUFELENBQUE7UUFFWCxNQUFBLEdBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFULENBQWEsUUFBYixFQUF1QixPQUF2QjtRQUNULE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCLE9BQXZCO1FBRVQsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZDtBQUVWLGFBQUEseUNBQUE7O1lBQ0ksTUFBQSxHQUFTLEdBQUcsQ0FBQyxHQUFKLENBQVEsUUFBUixFQUFrQixPQUFsQixDQUEwQixDQUFDLEtBQTNCLENBQWlDLEdBQWpDO1lBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBQyxDQUFEO3VCQUFPLE9BQU8sQ0FBQyxjQUFSLENBQXVCLENBQXZCO1lBQVAsQ0FBWDtZQUNULElBQUcsYUFBUyxNQUFULEVBQUEsS0FBQSxNQUFIO2dCQUNJLE9BQU8sQ0FBQyxHQUFSLENBQUE7Z0JBQ0EsSUFBQSxHQUFPLEdBQUcsQ0FBQyxHQUFKLENBQVEsUUFBUixFQUFrQixPQUFsQjtnQkFDUCxJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsd0NBQXFDLElBQUksQ0FBQyxJQUExQyxFQUFnRCxJQUFoRDtBQUNBLHVCQUFPLEtBSlg7O0FBSEo7ZUFTQTtJQXBCTzs7Ozs7O0FBc0JmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMjI1xuXG57IHBvc3QsIHN0b3BFdmVudCwga2V5aW5mbywgc2NoZW1lLCBzbGFzaCwgZW1wdHksIHByZWZzLCBlbGVtLCBkcmFnLCBrbG9nLCBub29uLCBrc3RyLCBtZW51LCB3aW4sIHNkcywgJCwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFRpdGxlXG4gICAgXG4gICAgQDogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIFxuICAgICAgICBwa2cgPSBAb3B0LnBrZ1xuICAgICAgICBcbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtID8gXCIjdGl0bGViYXJcIlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbVxuXG4gICAgICAgIHBvc3Qub24gJ3RpdGxlYmFyJyAgIEBvblRpdGxlYmFyXG4gICAgICAgIHBvc3Qub24gJ21lbnVBY3Rpb24nIEBvbk1lbnVBY3Rpb25cbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2RibGNsaWNrJyAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudCwgcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnTWF4aW1pemUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW5pY29uID0gZWxlbSBjbGFzczogJ3dpbmljb24nXG4gICAgICAgIGlmIEBvcHQuaWNvblxuICAgICAgICAgICAgQHdpbmljb24uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lmljb25cbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHdpbmljb25cbiAgICAgICAgQHdpbmljb24uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ09wZW4gTWVudScgICBcbiAgICAgICAgXG4gICAgICAgIEB0aXRsZSA9IGVsZW0gY2xhc3M6ICd0aXRsZWJhci10aXRsZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRpdGxlXG4gICAgICAgIFxuICAgICAgICBAaW5pdFRpdGxlRHJhZygpXG4gICAgICAgIEBzZXRUaXRsZSBAb3B0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICMg4oCUIOKXuyDwn56pXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIG1pbmltaXplIGdyYXknXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC04IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCItMVwiIHkxPVwiNVwiIHgyPVwiMTFcIiB5Mj1cIjVcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWluaW1pemVcbiAgICAgICAgQG1pbmltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNaW5pbWl6ZSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWF4aW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMVwiIGhlaWdodD1cIjExXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6IDA7XCI+PC9yZWN0PlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWF4aW1pemVcbiAgICAgICAgQG1heGltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNYXhpbWl6ZSdcblxuICAgICAgICBAY2xvc2UgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIGNsb3NlJ1xuICAgICAgICBcbiAgICAgICAgQGNsb3NlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOSAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMTBcIiB5Mj1cIjExXCI+PC9saW5lPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjBcIiB4Mj1cIjBcIiB5Mj1cIjExXCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQGNsb3NlXG4gICAgICAgIEBjbG9zZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnQ2xvc2UnXG5cbiAgICAgICAgQHRvcGZyYW1lID0gZWxlbSBjbGFzczogJ3RvcGZyYW1lJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdG9wZnJhbWVcbiAgICAgICAgXG4gICAgICAgIEBpbml0U3R5bGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBpbml0TWVudSBAbWVudVRlbXBsYXRlKClcbiAgICAgICBcbiAgICBwdXNoRWxlbTogKGVsZW0pIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5pbnNlcnRCZWZvcmUgZWxlbSwgQG1pbmltaXplXG4gICAgICAgICAgICBcbiAgICBzaG93VGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ2luaXRpYWwnXG4gICAgaGlkZVRpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGluaXRUaXRsZURyYWc6IC0+XG4gICAgICAgIFxuICAgICAgICBAdGl0bGVEcmFnID0gbmV3IGRyYWdcbiAgICAgICAgICAgIHRhcmdldDogICAgIGRvY3VtZW50LmJvZHlcbiAgICAgICAgICAgIGhhbmRsZTogICAgIEBvcHQuZHJhZ0VsZW0gPyBAZWxlbVxuICAgICAgICAgICAgb25TdGFydDogICAgQG9uRHJhZ1N0YXJ0XG4gICAgICAgICAgICBvbk1vdmU6ICAgICBAb25EcmFnTW92ZVxuICAgICAgICAgICAgc3RvcEV2ZW50OiAgZmFsc2VcbiAgICBcbiAgICBvbkRyYWdTdGFydDogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICBcbiAgICAgICAgaWYgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCdcbiAgICAgICAgICAgIHJldHVybiAnc2tpcCdcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICB3aW4udGl0bGVEcmFnID0gZmFsc2VcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gd2luLmdldEJvdW5kcygpICAgIFxuICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICB3aW4udGl0bGVEcmFnID0gdHJ1ZVxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIHdpbi5zZXRCb3VuZHMgXG4gICAgICAgICAgICB4OiAgICAgIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54IFxuICAgICAgICAgICAgeTogICAgICBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueSBcbiAgICAgICAgICAgIHdpZHRoOiAgQHN0YXJ0Qm91bmRzLndpZHRoIFxuICAgICAgICAgICAgaGVpZ2h0OiBAc3RhcnRCb3VuZHMuaGVpZ2h0XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzZXRUaXRsZTogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICBwYXJ0cyA9IG9wdC50aXRsZSA/IFtdXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLm5hbWUgYW5kICduYW1lJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1uYW1lJz4je29wdC5wa2cubmFtZX08L3NwYW4+XCJcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cudmVyc2lvbiBhbmQgJ3ZlcnNpb24nIGluIHBhcnRzXG4gICAgICAgICAgICAjIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4g4pePIDwvc3Bhbj5cIlxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiN7b3B0LnBrZy52ZXJzaW9ufTwvc3Bhbj5cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cucGF0aCBhbmQgJ3BhdGgnIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+IOKWuiA8L3NwYW4+XCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItbmFtZSc+I3tvcHQucGtnLnBhdGh9PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgQHRpdGxlLmlubmVySFRNTCA9IGh0bWxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgb25UaXRsZWJhcjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3Nob3dUaXRsZScgICB0aGVuIEBzaG93VGl0bGUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZVRpdGxlJyAgIHRoZW4gQGhpZGVUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdzaG93TWVudScgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZU1lbnUnICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ3RvZ2dsZU1lbnUnICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbicgIFxuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdUb2dnbGUgTWVudScgICAgICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ09wZW4gTWVudScgICAgICAgIHRoZW4gQG9wZW5NZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1Nob3cgTWVudScgICAgICAgIHRoZW4gQHNob3dNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUgTWVudScgICAgICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBTY2hlbWUnICAgIFxuICAgICAgICAgICAgICAgIGlmIEBvcHQuc2NoZW1lICE9IGZhbHNlIHRoZW4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgICAgICB3aGVuICdEZXZUb29scycgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy50b2dnbGVEZXZUb29scygpXG4gICAgICAgICAgICB3aGVuICdSZWxvYWQnICAgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgICAgICAgICAgIHRoZW4gd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUnICAgICAgICAgICAgIHRoZW4gd2luLmhpZGUoKVxuICAgICAgICAgICAgd2hlbiAnTWluaW1pemUnICAgICAgICAgdGhlbiB3aW4ubWluaW1pemUoKVxuICAgICAgICAgICAgd2hlbiAnTWF4aW1pemUnIFxuICAgICAgICAgICAgICAgIHdhID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICAgICAgICAgIHdiID0gd2luLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgbWF4aW1pemVkID0gd2luLmlzTWF4aW1pemVkKCkgb3IgKHdiLndpZHRoID09IHdhLndpZHRoIGFuZCB3Yi5oZWlnaHQgPT0gd2EuaGVpZ2h0KVxuICAgICAgICAgICAgICAgIGlmIG1heGltaXplZCB0aGVuIHdpbi51bm1heGltaXplKCkgZWxzZSB3aW4ubWF4aW1pemUoKSAgXG5cbiAgICBtZW51VGVtcGxhdGU6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW10gaWYgbm90IEBvcHQuZGlyIG9yIG5vdCBAb3B0Lm1lbnVcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZSA9IEBtYWtlVGVtcGxhdGUgbm9vbi5sb2FkIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51VGVtcGxhdGU/XG4gICAgICAgICAgICBAb3B0Lm1lbnVUZW1wbGF0ZSBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBcbiAgICBtYWtlVGVtcGxhdGU6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICB0bXBsID0gW11cbiAgICAgICAgZm9yIHRleHQsbWVudU9yQWNjZWwgb2Ygb2JqXG4gICAgICAgICAgICB0bXBsLnB1c2ggc3dpdGNoXG4gICAgICAgICAgICAgICAgd2hlbiBlbXB0eShtZW51T3JBY2NlbCkgYW5kIHRleHQuc3RhcnRzV2l0aCAnLSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNOdW1iZXIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtzdHIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNTdHJpbmcgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtleWluZm8uY29udmVydENtZEN0cmwgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5IG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDogJydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG1lbnVPckFjY2VsLmFjY2VsPyBvciBtZW51T3JBY2NlbC5jb21tYW5kPyAjIG5lZWRzIGJldHRlciB0ZXN0IVxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbSA9IF8uY2xvbmUgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udGV4dCA9IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51OkBtYWtlVGVtcGxhdGUgbWVudU9yQWNjZWxcbiAgICAgICAgdG1wbFxuXG4gICAgaW5pdE1lbnU6IChpdGVtcykgLT5cblxuICAgICAgICBAbWVudSA9IG5ldyBtZW51IGl0ZW1zOml0ZW1zXG4gICAgICAgIEBlbGVtLmluc2VydEJlZm9yZSBAbWVudS5lbGVtLCBAZWxlbS5maXJzdENoaWxkLm5leHRTaWJsaW5nXG4gICAgICAgIEBoaWRlTWVudSgpXG5cbiAgICBtZW51VmlzaWJsZTogPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ICE9ICdub25lJ1xuICAgIHNob3dNZW51OiAgICA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJzsgQG1lbnU/LmZvY3VzPygpIzsgcG9zdC5lbWl0ICd0aXRsZWJhcicgJ2hpZGVUaXRsZSdcbiAgICBoaWRlTWVudTogICAgPT4gQG1lbnU/LmNsb3NlKCk7IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJyM7IHBvc3QuZW1pdCAndGl0bGViYXInICdzaG93VGl0bGUnXG4gICAgdG9nZ2xlTWVudTogID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKVxuICAgIG9wZW5NZW51OiAgICA9PiBpZiBAbWVudVZpc2libGUoKSB0aGVuIEBoaWRlTWVudSgpIGVsc2UgQHNob3dNZW51KCk7IEBtZW51Lm9wZW4oKVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGluaXRTdHlsZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGxpbmsgPSQgXCIjc3R5bGUtbGlua1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzL3N0eWxlLmNzc1wiXG4gICAgICAgICAgICB0aXRsZVN0eWxlID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gc2xhc2guZmlsZVVybCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcImNzcy8je3ByZWZzLmdldCAnc2NoZW1lJyAnZGFyayd9LmNzc1wiXG4gICAgICAgICAgICB0aXRsZVN0eWxlID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBpZDogICAnc3R5bGUtdGl0bGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsaW5rLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlIHRpdGxlU3R5bGUsIGxpbmtcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwXG5cbiAgICBoYW5kbGVLZXk6IChldmVudCkgLT5cblxuICAgICAgICB7IGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICAgICBtYWluTWVudSA9IEBtZW51VGVtcGxhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgIGFjY2VscyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2FjY2VsJ1xuICAgICAgICBjb21ib3MgPSBzZHMuZmluZC5rZXkgbWFpbk1lbnUsICdjb21ibydcbiAgICAgICAgXG4gICAgICAgIGtlcGF0aHMgPSBjb21ib3MuY29uY2F0IGFjY2VscyAjIHN3YXAgb24gd2luP1xuICAgICAgICBcbiAgICAgICAgZm9yIGtleXBhdGggaW4ga2VwYXRoc1xuICAgICAgICAgICAgY29tYm9zID0gc2RzLmdldChtYWluTWVudSwga2V5cGF0aCkuc3BsaXQgJyAnXG4gICAgICAgICAgICBjb21ib3MgPSBjb21ib3MubWFwIChjKSAtPiBrZXlpbmZvLmNvbnZlcnRDbWRDdHJsIGNcbiAgICAgICAgICAgIGlmIGNvbWJvIGluIGNvbWJvc1xuICAgICAgICAgICAgICAgIGtleXBhdGgucG9wKClcbiAgICAgICAgICAgICAgICBpdGVtID0gc2RzLmdldCBtYWluTWVudSwga2V5cGF0aFxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbWVudUFjdGlvbicgaXRlbS5hY3Rpb24gPyBpdGVtLnRleHQsIGl0ZW1cbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVxuXG4gICAgICAgICd1bmhhbmRsZWQnXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVGl0bGVcbiJdfQ==
//# sourceURL=../coffee/title.coffee