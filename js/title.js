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
        return this.titleDrag = new drag({
            target: document.body,
            handle: this.elem,
            onStart: this.onDragStart,
            onMove: this.onDragMove
        });
    };

    Title.prototype.onDragStart = function(drag, event) {
        var electron;
        electron = require('electron');
        win = electron.remote.getCurrentWindow();
        return this.startBounds = win.getBounds();
    };

    Title.prototype.onDragMove = function(drag, event) {
        var electron;
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
            html += "<span class='titlebar-dot'> ● </span>";
            html += "<span class='titlebar-version'>" + opt.pkg.version + "</span>";
        }
        if (opt.pkg.path && indexOf.call(parts, 'path') >= 0) {
            html += "<span class='titlebar-dot'> ► </span>";
            html += "<span class='titlebar-version'>" + opt.pkg.path + "</span>";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHFIQUFBO0lBQUE7OztBQVFBLE1BQWdILE9BQUEsQ0FBUSxPQUFSLENBQWhILEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLHFCQUFuQixFQUE0QixtQkFBNUIsRUFBb0MsaUJBQXBDLEVBQTJDLGlCQUEzQyxFQUFrRCxpQkFBbEQsRUFBeUQsZUFBekQsRUFBK0QsZUFBL0QsRUFBcUUsZUFBckUsRUFBMkUsZUFBM0UsRUFBaUYsZUFBakYsRUFBdUYsZUFBdkYsRUFBNkYsYUFBN0YsRUFBa0csYUFBbEcsRUFBdUcsU0FBdkcsRUFBMEc7O0FBRXBHO0lBRVcsZUFBQyxJQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7OztZQUVWLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7UUFFUixHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUVYLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSx5Q0FBYyxXQUFkO1FBRVAsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLEVBQXFCLElBQUMsQ0FBQSxVQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFVBQXZCLEVBQWtDLFNBQUMsS0FBRDttQkFBVyxTQUFBLENBQVUsS0FBVixFQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBdUIsVUFBdkIsQ0FBakI7UUFBWCxDQUFsQztRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1NBQUw7UUFDWCxJQUFHLElBQUMs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QyxLQUFEO0FBRVAsWUFBQTtRQUFFLFFBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakI7UUFFWixRQUFBLEdBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBQTtRQUVYLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCLE9BQXZCO1FBQ1QsTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBVCxDQUFhLFFBQWIsRUFBdUIsT0FBdkI7UUFFVCxPQUFBLEdBQVUsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkO0FBRVYsYUFBQSx5Q0FBQTs7WUFDSSxNQUFBLEdBQVMsR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsR0FBakM7WUFDVCxNQUFBLEdBQVMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEtBQUQ7dUJBQVcsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsS0FBdkI7WUFBWCxDQUFYO1lBQ1QsSUFBRyxhQUFTLE1BQVQsRUFBQSxLQUFBLE1BQUg7Z0JBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBQTtnQkFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCO2dCQUNQLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVix3Q0FBcUMsSUFBSSxDQUFDLElBQTFDLEVBQWdELElBQWhEO0FBQ0EsdUJBQU8sS0FKWDs7QUFISjtlQVNBO0lBcEJPOzs7Ozs7QUFzQmYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgcG9zdCwgc3RvcEV2ZW50LCBrZXlpbmZvLCBzY2hlbWUsIHNsYXNoLCBlbXB0eSwgcHJlZnMsIGVsZW0sIGRyYWcsIGtsb2csIG5vb24sIGtzdHIsIG1lbnUsIHdpbiwgc2RzLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgVGl0bGVcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIFxuICAgICAgICBwa2cgPSBAb3B0LnBrZ1xuICAgICAgICBcbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtID8gXCIjdGl0bGViYXJcIlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbVxuXG4gICAgICAgIHBvc3Qub24gJ3RpdGxlYmFyJyAgIEBvblRpdGxlYmFyXG4gICAgICAgIHBvc3Qub24gJ21lbnVBY3Rpb24nIEBvbk1lbnVBY3Rpb25cbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2RibGNsaWNrJyAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudCwgcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnTWF4aW1pemUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW5pY29uID0gZWxlbSBjbGFzczogJ3dpbmljb24nXG4gICAgICAgIGlmIEBvcHQuaWNvblxuICAgICAgICAgICAgQHdpbmljb24uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lmljb25cbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHdpbmljb25cbiAgICAgICAgQHdpbmljb24uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ09wZW4gTWVudScgICBcbiAgICAgICAgXG4gICAgICAgIEB0aXRsZSA9IGVsZW0gY2xhc3M6ICd0aXRsZWJhci10aXRsZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRpdGxlXG4gICAgICAgIFxuICAgICAgICBAaW5pdFRpdGxlRHJhZygpXG4gICAgICAgIEBzZXRUaXRsZSBAb3B0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICMg4oCUIOKXuyDwn56pXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIG1pbmltaXplIGdyYXknXG4gICAgICAgIFxuICAgICAgICBAbWluaW1pemUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC04IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCItMVwiIHkxPVwiNVwiIHgyPVwiMTFcIiB5Mj1cIjVcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWluaW1pemVcbiAgICAgICAgQG1pbmltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNaW5pbWl6ZSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWF4aW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMVwiIGhlaWdodD1cIjExXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6IDA7XCI+PC9yZWN0PlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWF4aW1pemVcbiAgICAgICAgQG1heGltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNYXhpbWl6ZSdcblxuICAgICAgICBAY2xvc2UgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIGNsb3NlJ1xuICAgICAgICBcbiAgICAgICAgQGNsb3NlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOSAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMTBcIiB5Mj1cIjExXCI+PC9saW5lPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjBcIiB4Mj1cIjBcIiB5Mj1cIjExXCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQGNsb3NlXG4gICAgICAgIEBjbG9zZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnQ2xvc2UnXG5cbiAgICAgICAgQHRvcGZyYW1lID0gZWxlbSBjbGFzczogJ3RvcGZyYW1lJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdG9wZnJhbWVcbiAgICAgICAgXG4gICAgICAgIEBpbml0U3R5bGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBpbml0TWVudSBAbWVudVRlbXBsYXRlKClcbiAgICAgICBcbiAgICBwdXNoRWxlbTogKGVsZW0pIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5pbnNlcnRCZWZvcmUgZWxlbSwgQG1pbmltaXplXG4gICAgICAgICAgICBcbiAgICBzaG93VGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ2luaXRpYWwnXG4gICAgaGlkZVRpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGluaXRUaXRsZURyYWc6IC0+XG4gICAgICAgIFxuICAgICAgICBAdGl0bGVEcmFnID0gbmV3IGRyYWdcbiAgICAgICAgICAgIHRhcmdldDogIGRvY3VtZW50LmJvZHlcbiAgICAgICAgICAgIGhhbmRsZTogIEBlbGVtXG4gICAgICAgICAgICBvblN0YXJ0OiBAb25EcmFnU3RhcnRcbiAgICAgICAgICAgIG9uTW92ZTogIEBvbkRyYWdNb3ZlXG4gICAgXG4gICAgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT4gXG4gICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gd2luLmdldEJvdW5kcygpICAgIFxuICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIHdpbi5zZXRCb3VuZHMgXG4gICAgICAgICAgICB4OiAgICAgIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54IFxuICAgICAgICAgICAgeTogICAgICBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueSBcbiAgICAgICAgICAgIHdpZHRoOiAgQHN0YXJ0Qm91bmRzLndpZHRoIFxuICAgICAgICAgICAgaGVpZ2h0OiBAc3RhcnRCb3VuZHMuaGVpZ2h0XG4gICAgXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzZXRUaXRsZTogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICBwYXJ0cyA9IG9wdC50aXRsZSA/IFtdXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLm5hbWUgYW5kICduYW1lJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1uYW1lJz4je29wdC5wa2cubmFtZX08L3NwYW4+XCJcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cudmVyc2lvbiBhbmQgJ3ZlcnNpb24nIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+IOKXjyA8L3NwYW4+XCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItdmVyc2lvbic+I3tvcHQucGtnLnZlcnNpb259PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy5wYXRoIGFuZCAncGF0aCcgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4g4pa6IDwvc3Bhbj5cIlxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci12ZXJzaW9uJz4je29wdC5wa2cucGF0aH08L3NwYW4+XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAdGl0bGUuaW5uZXJIVE1MID0gaHRtbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICBvblRpdGxlYmFyOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnc2hvd1RpdGxlJyAgIHRoZW4gQHNob3dUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlVGl0bGUnICAgdGhlbiBAaGlkZVRpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ3Nob3dNZW51JyAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlTWVudScgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAndG9nZ2xlTWVudScgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJyAgXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBNZW51JyAgICAgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnT3BlbiBNZW51JyAgICAgICAgdGhlbiBAb3Blbk1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnU2hvdyBNZW51JyAgICAgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZSBNZW51JyAgICAgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIFNjaGVtZScgICAgXG4gICAgICAgICAgICAgICAgaWYgQG9wdC5zY2hlbWUgIT0gZmFsc2UgdGhlbiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICAgICAgdGhlbiB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZScgICAgICAgICAgICAgdGhlbiB3aW4uaGlkZSgpXG4gICAgICAgICAgICB3aGVuICdNaW5pbWl6ZScgICAgICAgICB0aGVuIHdpbi5taW5pbWl6ZSgpXG4gICAgICAgICAgICB3aGVuICdNYXhpbWl6ZScgXG4gICAgICAgICAgICAgICAgd2EgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgICAgICAgICAgd2IgPSB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3aW4uaXNNYXhpbWl6ZWQoKSBvciAod2Iud2lkdGggPT0gd2Eud2lkdGggYW5kIHdiLmhlaWdodCA9PSB3YS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgaWYgbWF4aW1pemVkIHRoZW4gd2luLnVubWF4aW1pemUoKSBlbHNlIHdpbi5tYXhpbWl6ZSgpICBcblxuICAgIG1lbnVUZW1wbGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbXSBpZiBub3QgQG9wdC5kaXIgb3Igbm90IEBvcHQubWVudVxuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlID0gQG1ha2VUZW1wbGF0ZSBub29uLmxvYWQgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lm1lbnVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm1lbnVUZW1wbGF0ZT9cbiAgICAgICAgICAgIEBvcHQubWVudVRlbXBsYXRlIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIFxuICAgIG1ha2VUZW1wbGF0ZTogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGwgPSBbXVxuICAgICAgICBmb3IgdGV4dCxtZW51T3JBY2NlbCBvZiBvYmpcbiAgICAgICAgICAgIHRtcGwucHVzaCBzd2l0Y2hcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5KG1lbnVPckFjY2VsKSBhbmQgdGV4dC5zdGFydHNXaXRoICctJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgIHdoZW4gXy5pc051bWJlciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a3N0ciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gXy5pc1N0cmluZyBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a2V5aW5mby5jb252ZXJ0Q21kQ3RybCBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOiAnJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgbWVudU9yQWNjZWwuYWNjZWw/IG9yIG1lbnVPckFjY2VsLmNvbW1hbmQ/ICMgbmVlZHMgYmV0dGVyIHRlc3QhXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0gXy5jbG9uZSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnU6QG1ha2VUZW1wbGF0ZSBtZW51T3JBY2NlbFxuICAgICAgICB0bXBsXG5cbiAgICBpbml0TWVudTogKGl0ZW1zKSAtPlxuXG4gICAgICAgIEBtZW51ID0gbmV3IG1lbnUgaXRlbXM6aXRlbXNcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIEBtZW51LmVsZW0sIEBlbGVtLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmdcbiAgICAgICAgQGhpZGVNZW51KClcblxuICAgIG1lbnVWaXNpYmxlOiA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgIT0gJ25vbmUnXG4gICAgc2hvd01lbnU6ICAgID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snOyBAbWVudT8uZm9jdXM/KCkjOyBwb3N0LmVtaXQgJ3RpdGxlYmFyJyAnaGlkZVRpdGxlJ1xuICAgIGhpZGVNZW51OiAgICA9PiBAbWVudT8uY2xvc2UoKTsgQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnIzsgcG9zdC5lbWl0ICd0aXRsZWJhcicgJ3Nob3dUaXRsZSdcbiAgICB0b2dnbGVNZW51OiAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpXG4gICAgb3Blbk1lbnU6ICAgID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKTsgQG1lbnUub3BlbigpXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMCAwMDAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaW5pdFN0eWxlOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbGluayA9JCBcIiNzdHlsZS1saW5rXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3Mvc3R5bGUuY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzLyN7cHJlZnMuZ2V0ICdzY2hlbWUnICdkYXJrJ30uY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIGlkOiAgICdzdHlsZS10aXRsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcblxuICAgIGhhbmRsZUtleTogKGV2ZW50KSAtPlxuXG4gICAgICAgIHsgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIG1haW5NZW51ID0gQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgYWNjZWxzID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnYWNjZWwnXG4gICAgICAgIGNvbWJvcyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2NvbWJvJ1xuICAgICAgICBcbiAgICAgICAga2VwYXRocyA9IGNvbWJvcy5jb25jYXQgYWNjZWxzICMgc3dhcCBvbiB3aW4/XG4gICAgICAgIFxuICAgICAgICBmb3Iga2V5cGF0aCBpbiBrZXBhdGhzXG4gICAgICAgICAgICBjb21ib3MgPSBzZHMuZ2V0KG1haW5NZW51LCBrZXlwYXRoKS5zcGxpdCAnICdcbiAgICAgICAgICAgIGNvbWJvcyA9IGNvbWJvcy5tYXAgKGNvbWJvKSAtPiBrZXlpbmZvLmNvbnZlcnRDbWRDdHJsIGNvbWJvXG4gICAgICAgICAgICBpZiBjb21ibyBpbiBjb21ib3NcbiAgICAgICAgICAgICAgICBrZXlwYXRoLnBvcCgpXG4gICAgICAgICAgICAgICAgaXRlbSA9IHNkcy5nZXQgbWFpbk1lbnUsIGtleXBhdGhcbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nIGl0ZW0uYWN0aW9uID8gaXRlbS50ZXh0LCBpdGVtXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cblxuICAgICAgICAndW5oYW5kbGVkJ1xuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlXG4iXX0=
//# sourceURL=../coffee/title.coffee