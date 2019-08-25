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
            onMove: this.onDragMove,
            stopEvent: false
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHFIQUFBO0lBQUE7OztBQVFBLE1BQWdILE9BQUEsQ0FBUSxPQUFSLENBQWhILEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLHFCQUFuQixFQUE0QixtQkFBNUIsRUFBb0MsaUJBQXBDLEVBQTJDLGlCQUEzQyxFQUFrRCxpQkFBbEQsRUFBeUQsZUFBekQsRUFBK0QsZUFBL0QsRUFBcUUsZUFBckUsRUFBMkUsZUFBM0UsRUFBaUYsZUFBakYsRUFBdUYsZUFBdkYsRUFBNkYsYUFBN0YsRUFBa0csYUFBbEcsRUFBdUcsU0FBdkcsRUFBMEc7O0FBRXBHO0lBRVcsZUFBQyxJQUFEO0FBRVQsWUFBQTtRQUZVLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7OztZQUVWLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7UUFFUixHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUVYLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSx5Q0FBYyxXQUFkO1FBRVAsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLEVBQXFCLElBQUMsQ0FBQSxVQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFVBQXZCLEVBQWtDLFNBQUMsS0FBRDttQkFBVyxTQUFBLENBQVUsS0FBVixFQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBdUIsVUFBdkIsQ0FBakI7UUFBWCxDQUFsQztRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1NBQUw7UUFDWCxJQUFHLElBQUMs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b0JBMkJYLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFFUCxZQUFBO1FBQUUsUUFBVSxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQjtRQUVaLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFBO1FBRVgsTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBVCxDQUFhLFFBQWIsRUFBdUIsT0FBdkI7UUFDVCxNQUFBLEdBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFULENBQWEsUUFBYixFQUF1QixPQUF2QjtRQUVULE9BQUEsR0FBVSxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQWQ7QUFFVixhQUFBLHlDQUFBOztZQUNJLE1BQUEsR0FBUyxHQUFHLENBQUMsR0FBSixDQUFRLFFBQVIsRUFBa0IsT0FBbEIsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyxHQUFqQztZQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQUMsS0FBRDt1QkFBVyxPQUFPLENBQUMsY0FBUixDQUF1QixLQUF2QjtZQUFYLENBQVg7WUFDVCxJQUFHLGFBQVMsTUFBVCxFQUFBLEtBQUEsTUFBSDtnQkFDSSxPQUFPLENBQUMsR0FBUixDQUFBO2dCQUNBLElBQUEsR0FBTyxHQUFHLENBQUMsR0FBSixDQUFRLFFBQVIsRUFBa0IsT0FBbEI7Z0JBQ1AsSUFBSSxDQUFDLElBQUwsQ0FBVSxZQUFWLHdDQUFxQyxJQUFJLENBQUMsSUFBMUMsRUFBZ0QsSUFBaEQ7QUFDQSx1QkFBTyxLQUpYOztBQUhKO2VBU0E7SUFwQk87Ozs7OztBQXNCZixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIyNcblxueyBwb3N0LCBzdG9wRXZlbnQsIGtleWluZm8sIHNjaGVtZSwgc2xhc2gsIGVtcHR5LCBwcmVmcywgZWxlbSwgZHJhZywga2xvZywgbm9vbiwga3N0ciwgbWVudSwgd2luLCBzZHMsICQsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBUaXRsZVxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQgPz0ge31cbiAgICAgICAgXG4gICAgICAgIHBrZyA9IEBvcHQucGtnXG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9JCBAb3B0LmVsZW0gPyBcIiN0aXRsZWJhclwiXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtXG5cbiAgICAgICAgcG9zdC5vbiAndGl0bGViYXInICAgQG9uVGl0bGViYXJcbiAgICAgICAgcG9zdC5vbiAnbWVudUFjdGlvbicgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snIChldmVudCkgLT4gc3RvcEV2ZW50IGV2ZW50LCBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNYXhpbWl6ZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpbmljb24gPSBlbGVtIGNsYXNzOiAnd2luaWNvbidcbiAgICAgICAgaWYgQG9wdC5pY29uXG4gICAgICAgICAgICBAd2luaWNvbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQuaWNvblxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAd2luaWNvblxuICAgICAgICBAd2luaWNvbi5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnT3BlbiBNZW51JyAgIFxuICAgICAgICBcbiAgICAgICAgQHRpdGxlID0gZWxlbSBjbGFzczogJ3RpdGxlYmFyLXRpdGxlJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdGl0bGVcbiAgICAgICAgXG4gICAgICAgIEBpbml0VGl0bGVEcmFnKClcbiAgICAgICAgQHNldFRpdGxlIEBvcHRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgIyDigJQg4pe7IPCfnqlcbiAgICAgICAgXG4gICAgICAgIEBtaW5pbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWluaW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtaW5pbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTggMzAgMzBcIj5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIi0xXCIgeTE9XCI1XCIgeDI9XCIxMVwiIHkyPVwiNVwiPjwvbGluZT5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBtaW5pbWl6ZVxuICAgICAgICBAbWluaW1pemUuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ01pbmltaXplJ1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtYXhpbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOSAzMCAzMFwiPlxuICAgICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjExXCIgaGVpZ2h0PVwiMTFcIiBzdHlsZT1cImZpbGwtb3BhY2l0eTogMDtcIj48L3JlY3Q+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBtYXhpbWl6ZVxuICAgICAgICBAbWF4aW1pemUuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ01heGltaXplJ1xuXG4gICAgICAgIEBjbG9zZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gY2xvc2UnXG4gICAgICAgIFxuICAgICAgICBAY2xvc2UuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIxMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY2xvc2VcbiAgICAgICAgQGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdDbG9zZSdcblxuICAgICAgICBAdG9wZnJhbWUgPSBlbGVtIGNsYXNzOiAndG9wZnJhbWUnXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB0b3BmcmFtZVxuICAgICAgICBcbiAgICAgICAgQGluaXRTdHlsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm1lbnVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGluaXRNZW51IEBtZW51VGVtcGxhdGUoKVxuICAgICAgIFxuICAgIHB1c2hFbGVtOiAoZWxlbSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmluc2VydEJlZm9yZSBlbGVtLCBAbWluaW1pemVcbiAgICAgICAgICAgIFxuICAgIHNob3dUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnaW5pdGlhbCdcbiAgICBoaWRlVGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaW5pdFRpdGxlRHJhZzogLT5cbiAgICAgICAgXG4gICAgICAgIEB0aXRsZURyYWcgPSBuZXcgZHJhZ1xuICAgICAgICAgICAgdGFyZ2V0OiAgICAgZG9jdW1lbnQuYm9keVxuICAgICAgICAgICAgaGFuZGxlOiAgICAgQGVsZW1cbiAgICAgICAgICAgIG9uU3RhcnQ6ICAgIEBvbkRyYWdTdGFydFxuICAgICAgICAgICAgb25Nb3ZlOiAgICAgQG9uRHJhZ01vdmVcbiAgICAgICAgICAgIHN0b3BFdmVudDogIGZhbHNlXG4gICAgXG4gICAgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT4gXG4gICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gd2luLmdldEJvdW5kcygpICAgIFxuICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIHdpbi5zZXRCb3VuZHMgXG4gICAgICAgICAgICB4OiAgICAgIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54IFxuICAgICAgICAgICAgeTogICAgICBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueSBcbiAgICAgICAgICAgIHdpZHRoOiAgQHN0YXJ0Qm91bmRzLndpZHRoIFxuICAgICAgICAgICAgaGVpZ2h0OiBAc3RhcnRCb3VuZHMuaGVpZ2h0XG4gICAgXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzZXRUaXRsZTogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICBwYXJ0cyA9IG9wdC50aXRsZSA/IFtdXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLm5hbWUgYW5kICduYW1lJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1uYW1lJz4je29wdC5wa2cubmFtZX08L3NwYW4+XCJcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cudmVyc2lvbiBhbmQgJ3ZlcnNpb24nIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+IOKXjyA8L3NwYW4+XCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItdmVyc2lvbic+I3tvcHQucGtnLnZlcnNpb259PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy5wYXRoIGFuZCAncGF0aCcgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4g4pa6IDwvc3Bhbj5cIlxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci12ZXJzaW9uJz4je29wdC5wa2cucGF0aH08L3NwYW4+XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAdGl0bGUuaW5uZXJIVE1MID0gaHRtbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICBvblRpdGxlYmFyOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnc2hvd1RpdGxlJyAgIHRoZW4gQHNob3dUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlVGl0bGUnICAgdGhlbiBAaGlkZVRpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ3Nob3dNZW51JyAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdoaWRlTWVudScgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAndG9nZ2xlTWVudScgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJyAgXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBNZW51JyAgICAgIHRoZW4gQHRvZ2dsZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnT3BlbiBNZW51JyAgICAgICAgdGhlbiBAb3Blbk1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnU2hvdyBNZW51JyAgICAgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZSBNZW51JyAgICAgICAgdGhlbiBAaGlkZU1lbnUoKVxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIFNjaGVtZScgICAgXG4gICAgICAgICAgICAgICAgaWYgQG9wdC5zY2hlbWUgIT0gZmFsc2UgdGhlbiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgICAgIHRoZW4gd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICAgICAgdGhlbiB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnSGlkZScgICAgICAgICAgICAgdGhlbiB3aW4uaGlkZSgpXG4gICAgICAgICAgICB3aGVuICdNaW5pbWl6ZScgICAgICAgICB0aGVuIHdpbi5taW5pbWl6ZSgpXG4gICAgICAgICAgICB3aGVuICdNYXhpbWl6ZScgXG4gICAgICAgICAgICAgICAgd2EgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgICAgICAgICAgd2IgPSB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBtYXhpbWl6ZWQgPSB3aW4uaXNNYXhpbWl6ZWQoKSBvciAod2Iud2lkdGggPT0gd2Eud2lkdGggYW5kIHdiLmhlaWdodCA9PSB3YS5oZWlnaHQpXG4gICAgICAgICAgICAgICAgaWYgbWF4aW1pemVkIHRoZW4gd2luLnVubWF4aW1pemUoKSBlbHNlIHdpbi5tYXhpbWl6ZSgpICBcblxuICAgIG1lbnVUZW1wbGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbXSBpZiBub3QgQG9wdC5kaXIgb3Igbm90IEBvcHQubWVudVxuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlID0gQG1ha2VUZW1wbGF0ZSBub29uLmxvYWQgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIEBvcHQuZGlyLCBAb3B0Lm1lbnVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm1lbnVUZW1wbGF0ZT9cbiAgICAgICAgICAgIEBvcHQubWVudVRlbXBsYXRlIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIFxuICAgIG1ha2VUZW1wbGF0ZTogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGwgPSBbXVxuICAgICAgICBmb3IgdGV4dCxtZW51T3JBY2NlbCBvZiBvYmpcbiAgICAgICAgICAgIHRtcGwucHVzaCBzd2l0Y2hcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5KG1lbnVPckFjY2VsKSBhbmQgdGV4dC5zdGFydHNXaXRoICctJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgIHdoZW4gXy5pc051bWJlciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a3N0ciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gXy5pc1N0cmluZyBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a2V5aW5mby5jb252ZXJ0Q21kQ3RybCBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOiAnJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgbWVudU9yQWNjZWwuYWNjZWw/IG9yIG1lbnVPckFjY2VsLmNvbW1hbmQ/ICMgbmVlZHMgYmV0dGVyIHRlc3QhXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0gXy5jbG9uZSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnU6QG1ha2VUZW1wbGF0ZSBtZW51T3JBY2NlbFxuICAgICAgICB0bXBsXG5cbiAgICBpbml0TWVudTogKGl0ZW1zKSAtPlxuXG4gICAgICAgIEBtZW51ID0gbmV3IG1lbnUgaXRlbXM6aXRlbXNcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIEBtZW51LmVsZW0sIEBlbGVtLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmdcbiAgICAgICAgQGhpZGVNZW51KClcblxuICAgIG1lbnVWaXNpYmxlOiA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgIT0gJ25vbmUnXG4gICAgc2hvd01lbnU6ICAgID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snOyBAbWVudT8uZm9jdXM/KCkjOyBwb3N0LmVtaXQgJ3RpdGxlYmFyJyAnaGlkZVRpdGxlJ1xuICAgIGhpZGVNZW51OiAgICA9PiBAbWVudT8uY2xvc2UoKTsgQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnIzsgcG9zdC5lbWl0ICd0aXRsZWJhcicgJ3Nob3dUaXRsZSdcbiAgICB0b2dnbGVNZW51OiAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpXG4gICAgb3Blbk1lbnU6ICAgID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKTsgQG1lbnUub3BlbigpXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMCAwMDAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaW5pdFN0eWxlOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbGluayA9JCBcIiNzdHlsZS1saW5rXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3Mvc3R5bGUuY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzLyN7cHJlZnMuZ2V0ICdzY2hlbWUnICdkYXJrJ30uY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIGlkOiAgICdzdHlsZS10aXRsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcblxuICAgIGhhbmRsZUtleTogKGV2ZW50KSAtPlxuXG4gICAgICAgIHsgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIG1haW5NZW51ID0gQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgYWNjZWxzID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnYWNjZWwnXG4gICAgICAgIGNvbWJvcyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2NvbWJvJ1xuICAgICAgICBcbiAgICAgICAga2VwYXRocyA9IGNvbWJvcy5jb25jYXQgYWNjZWxzICMgc3dhcCBvbiB3aW4/XG4gICAgICAgIFxuICAgICAgICBmb3Iga2V5cGF0aCBpbiBrZXBhdGhzXG4gICAgICAgICAgICBjb21ib3MgPSBzZHMuZ2V0KG1haW5NZW51LCBrZXlwYXRoKS5zcGxpdCAnICdcbiAgICAgICAgICAgIGNvbWJvcyA9IGNvbWJvcy5tYXAgKGNvbWJvKSAtPiBrZXlpbmZvLmNvbnZlcnRDbWRDdHJsIGNvbWJvXG4gICAgICAgICAgICBpZiBjb21ibyBpbiBjb21ib3NcbiAgICAgICAgICAgICAgICBrZXlwYXRoLnBvcCgpXG4gICAgICAgICAgICAgICAgaXRlbSA9IHNkcy5nZXQgbWFpbk1lbnUsIGtleXBhdGhcbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nIGl0ZW0uYWN0aW9uID8gaXRlbS50ZXh0LCBpdGVtXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cblxuICAgICAgICAndW5oYW5kbGVkJ1xuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlXG4iXX0=
//# sourceURL=../coffee/title.coffee