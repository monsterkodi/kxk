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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHFIQUFBO0lBQUE7OztBQVFBLE1BQWdILE9BQUEsQ0FBUSxPQUFSLENBQWhILEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLHFCQUFuQixFQUE0QixtQkFBNUIsRUFBb0MsaUJBQXBDLEVBQTJDLGlCQUEzQyxFQUFrRCxpQkFBbEQsRUFBeUQsZUFBekQsRUFBK0QsZUFBL0QsRUFBcUUsZUFBckUsRUFBMkUsZUFBM0UsRUFBaUYsZUFBakYsRUFBdUYsZUFBdkYsRUFBNkYsYUFBN0YsRUFBa0csYUFBbEcsRUFBdUcsU0FBdkcsRUFBMEc7O0FBRXBHO0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7OztZQUVBLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7UUFFUixHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUVYLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSx5Q0FBYyxXQUFkO1FBRVAsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLEVBQXFCLElBQUMsQ0FBQSxVQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFVBQXZCLEVBQWtDLFNBQUMsS0FBRDttQkFBVyxTQUFBLENBQVUsS0FBVixFQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBdUIsVUFBdkIsQ0FBakI7UUFBWCxDQUFsQztRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1NBQUw7UUFDWCxJQUFHLElBQUMs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QU1iLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBaEIsQ0FBNkIsVUFBN0IsRUFBeUMsSUFBekMsRUFqQko7O0lBRk87O29CQTJCWCxTQUFBLEdBQVcsU0FBQyxLQUFEO0FBRVAsWUFBQTtRQUFFLFFBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakI7UUFFWixRQUFBLEdBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBQTtRQUVYLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCLE9BQXZCO1FBQ1QsTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBVCxDQUFhLFFBQWIsRUFBdUIsT0FBdkI7UUFFVCxPQUFBLEdBQVUsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkO0FBRVYsYUFBQSx5Q0FBQTs7WUFDSSxNQUFBLEdBQVMsR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsR0FBakM7WUFDVCxNQUFBLEdBQVMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLENBQUQ7dUJBQU8sT0FBTyxDQUFDLGNBQVIsQ0FBdUIsQ0FBdkI7WUFBUCxDQUFYO1lBQ1QsSUFBRyxhQUFTLE1BQVQsRUFBQSxLQUFBLE1BQUg7Z0JBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBQTtnQkFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCO2dCQUNQLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVix3Q0FBcUMsSUFBSSxDQUFDLElBQTFDLEVBQWdELElBQWhEO0FBQ0EsdUJBQU8sS0FKWDs7QUFISjtlQVNBO0lBcEJPOzs7Ozs7QUFzQmYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgcG9zdCwgc3RvcEV2ZW50LCBrZXlpbmZvLCBzY2hlbWUsIHNsYXNoLCBlbXB0eSwgcHJlZnMsIGVsZW0sIGRyYWcsIGtsb2csIG5vb24sIGtzdHIsIG1lbnUsIHdpbiwgc2RzLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgVGl0bGVcbiAgICBcbiAgICBAOiAoQG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQgPz0ge31cbiAgICAgICAgXG4gICAgICAgIHBrZyA9IEBvcHQucGtnXG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9JCBAb3B0LmVsZW0gPyBcIiN0aXRsZWJhclwiXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtXG5cbiAgICAgICAgcG9zdC5vbiAndGl0bGViYXInICAgQG9uVGl0bGViYXJcbiAgICAgICAgcG9zdC5vbiAnbWVudUFjdGlvbicgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snIChldmVudCkgLT4gc3RvcEV2ZW50IGV2ZW50LCBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNYXhpbWl6ZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpbmljb24gPSBlbGVtIGNsYXNzOiAnd2luaWNvbidcbiAgICAgICAgaWYgQG9wdC5pY29uXG4gICAgICAgICAgICBAd2luaWNvbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQuaWNvblxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAd2luaWNvblxuICAgICAgICBAd2luaWNvbi5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnT3BlbiBNZW51JyAgIFxuICAgICAgICBcbiAgICAgICAgQHRpdGxlID0gZWxlbSBjbGFzczogJ3RpdGxlYmFyLXRpdGxlJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdGl0bGVcbiAgICAgICAgXG4gICAgICAgIEBpbml0VGl0bGVEcmFnKClcbiAgICAgICAgQHNldFRpdGxlIEBvcHRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgIyDigJQg4pe7IPCfnqlcbiAgICAgICAgXG4gICAgICAgIEBtaW5pbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWluaW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtaW5pbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTggMzAgMzBcIj5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIi0xXCIgeTE9XCI1XCIgeDI9XCIxMVwiIHkyPVwiNVwiPjwvbGluZT5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBtaW5pbWl6ZVxuICAgICAgICBAbWluaW1pemUuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ01pbmltaXplJ1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtYXhpbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOSAzMCAzMFwiPlxuICAgICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjExXCIgaGVpZ2h0PVwiMTFcIiBzdHlsZT1cImZpbGwtb3BhY2l0eTogMDtcIj48L3JlY3Q+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBtYXhpbWl6ZVxuICAgICAgICBAbWF4aW1pemUuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ01heGltaXplJ1xuXG4gICAgICAgIEBjbG9zZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gY2xvc2UnXG4gICAgICAgIFxuICAgICAgICBAY2xvc2UuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIxMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY2xvc2VcbiAgICAgICAgQGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdDbG9zZSdcblxuICAgICAgICBAdG9wZnJhbWUgPSBlbGVtIGNsYXNzOiAndG9wZnJhbWUnXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB0b3BmcmFtZVxuICAgICAgICBcbiAgICAgICAgQGluaXRTdHlsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm1lbnVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGluaXRNZW51IEBtZW51VGVtcGxhdGUoKVxuICAgICAgIFxuICAgIHB1c2hFbGVtOiAoZWxlbSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmluc2VydEJlZm9yZSBlbGVtLCBAbWluaW1pemVcbiAgICAgICAgICAgIFxuICAgIHNob3dUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnaW5pdGlhbCdcbiAgICBoaWRlVGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaW5pdFRpdGxlRHJhZzogLT5cbiAgICAgICAgXG4gICAgICAgIEB0aXRsZURyYWcgPSBuZXcgZHJhZ1xuICAgICAgICAgICAgdGFyZ2V0OiAgICAgZG9jdW1lbnQuYm9keVxuICAgICAgICAgICAgaGFuZGxlOiAgICAgQG9wdC5kcmFnRWxlbSA/IEBlbGVtXG4gICAgICAgICAgICBvblN0YXJ0OiAgICBAb25EcmFnU3RhcnRcbiAgICAgICAgICAgIG9uTW92ZTogICAgIEBvbkRyYWdNb3ZlXG4gICAgICAgICAgICBzdG9wRXZlbnQ6ICBmYWxzZVxuICAgIFxuICAgIG9uRHJhZ1N0YXJ0OiAoZHJhZywgZXZlbnQpID0+IFxuICAgIFxuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIHdpbi50aXRsZURyYWcgPSBmYWxzZVxuICAgICAgICBAc3RhcnRCb3VuZHMgPSB3aW4uZ2V0Qm91bmRzKCkgICAgXG4gICAgXG4gICAgb25EcmFnTW92ZTogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHdpbi50aXRsZURyYWcgPSB0cnVlXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgd2luLnNldEJvdW5kcyBcbiAgICAgICAgICAgIHg6ICAgICAgQHN0YXJ0Qm91bmRzLnggKyBkcmFnLmRlbHRhU3VtLnggXG4gICAgICAgICAgICB5OiAgICAgIEBzdGFydEJvdW5kcy55ICsgZHJhZy5kZWx0YVN1bS55IFxuICAgICAgICAgICAgd2lkdGg6ICBAc3RhcnRCb3VuZHMud2lkdGggXG4gICAgICAgICAgICBoZWlnaHQ6IEBzdGFydEJvdW5kcy5oZWlnaHRcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNldFRpdGxlOiAob3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcbiAgICAgICAgXG4gICAgICAgIHBhcnRzID0gb3B0LnRpdGxlID8gW11cbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cubmFtZSBhbmQgJ25hbWUnIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLW5hbWUnPiN7b3B0LnBrZy5uYW1lfTwvc3Bhbj5cIlxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy52ZXJzaW9uIGFuZCAndmVyc2lvbicgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4g4pePIDwvc3Bhbj5cIlxuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci12ZXJzaW9uJz4je29wdC5wa2cudmVyc2lvbn08L3NwYW4+XCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLnBhdGggYW5kICdwYXRoJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiDilrogPC9zcGFuPlwiXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLXZlcnNpb24nPiN7b3B0LnBrZy5wYXRofTwvc3Bhbj5cIlxuICAgICAgICAgICAgXG4gICAgICAgIEB0aXRsZS5pbm5lckhUTUwgPSBodG1sXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIG9uVGl0bGViYXI6IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdzaG93VGl0bGUnICAgdGhlbiBAc2hvd1RpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ2hpZGVUaXRsZScgICB0aGVuIEBoaWRlVGl0bGUoKVxuICAgICAgICAgICAgd2hlbiAnc2hvd01lbnUnICAgIHRoZW4gQHNob3dNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ2hpZGVNZW51JyAgICB0aGVuIEBoaWRlTWVudSgpXG4gICAgICAgICAgICB3aGVuICd0b2dnbGVNZW51JyAgdGhlbiBAdG9nZ2xlTWVudSgpXG4gICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbiwgYXJncykgPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nICBcbiAgICAgICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIE1lbnUnICAgICAgdGhlbiBAdG9nZ2xlTWVudSgpXG4gICAgICAgICAgICB3aGVuICdPcGVuIE1lbnUnICAgICAgICB0aGVuIEBvcGVuTWVudSgpXG4gICAgICAgICAgICB3aGVuICdTaG93IE1lbnUnICAgICAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdIaWRlIE1lbnUnICAgICAgICB0aGVuIEBoaWRlTWVudSgpXG4gICAgICAgICAgICB3aGVuICdUb2dnbGUgU2NoZW1lJyAgICBcbiAgICAgICAgICAgICAgICBpZiBAb3B0LnNjaGVtZSAhPSBmYWxzZSB0aGVuIHNjaGVtZS50b2dnbGUoKVxuICAgICAgICAgICAgd2hlbiAnRGV2VG9vbHMnICAgICAgICAgdGhlbiB3aW4ud2ViQ29udGVudHMudG9nZ2xlRGV2VG9vbHMoKVxuICAgICAgICAgICAgd2hlbiAnUmVsb2FkJyAgICAgICAgICAgdGhlbiB3aW4ud2ViQ29udGVudHMucmVsb2FkSWdub3JpbmdDYWNoZSgpXG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICAgICAgICAgICB0aGVuIHdpbi5jbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdIaWRlJyAgICAgICAgICAgICB0aGVuIHdpbi5oaWRlKClcbiAgICAgICAgICAgIHdoZW4gJ01pbmltaXplJyAgICAgICAgIHRoZW4gd2luLm1pbmltaXplKClcbiAgICAgICAgICAgIHdoZW4gJ01heGltaXplJyBcbiAgICAgICAgICAgICAgICB3YSA9IGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICAgICAgICAgICAgICB3YiA9IHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgIG1heGltaXplZCA9IHdpbi5pc01heGltaXplZCgpIG9yICh3Yi53aWR0aCA9PSB3YS53aWR0aCBhbmQgd2IuaGVpZ2h0ID09IHdhLmhlaWdodClcbiAgICAgICAgICAgICAgICBpZiBtYXhpbWl6ZWQgdGhlbiB3aW4udW5tYXhpbWl6ZSgpIGVsc2Ugd2luLm1heGltaXplKCkgIFxuXG4gICAgbWVudVRlbXBsYXRlOiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFtdIGlmIG5vdCBAb3B0LmRpciBvciBub3QgQG9wdC5tZW51XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAdGVtcGxhdGVDYWNoZVxuICAgICAgICAgICAgQHRlbXBsYXRlQ2FjaGUgPSBAbWFrZVRlbXBsYXRlIG5vb24ubG9hZCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQubWVudVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQubWVudVRlbXBsYXRlP1xuICAgICAgICAgICAgQG9wdC5tZW51VGVtcGxhdGUgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRlbXBsYXRlQ2FjaGVcbiAgICAgICAgXG4gICAgbWFrZVRlbXBsYXRlOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgdG1wbCA9IFtdXG4gICAgICAgIGZvciB0ZXh0LG1lbnVPckFjY2VsIG9mIG9ialxuICAgICAgICAgICAgdG1wbC5wdXNoIHN3aXRjaFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkobWVudU9yQWNjZWwpIGFuZCB0ZXh0LnN0YXJ0c1dpdGggJy0nXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgICAgICAgd2hlbiBfLmlzTnVtYmVyIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDprc3RyIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgd2hlbiBfLmlzU3RyaW5nIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDprZXlpbmZvLmNvbnZlcnRDbWRDdHJsIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgd2hlbiBlbXB0eSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6ICcnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBtZW51T3JBY2NlbC5hY2NlbD8gb3IgbWVudU9yQWNjZWwuY29tbWFuZD8gIyBuZWVkcyBiZXR0ZXIgdGVzdCFcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBfLmNsb25lIG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRleHQgPSB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVudTpAbWFrZVRlbXBsYXRlIG1lbnVPckFjY2VsXG4gICAgICAgIHRtcGxcblxuICAgIGluaXRNZW51OiAoaXRlbXMpIC0+XG5cbiAgICAgICAgQG1lbnUgPSBuZXcgbWVudSBpdGVtczppdGVtc1xuICAgICAgICBAZWxlbS5pbnNlcnRCZWZvcmUgQG1lbnUuZWxlbSwgQGVsZW0uZmlyc3RDaGlsZC5uZXh0U2libGluZ1xuICAgICAgICBAaGlkZU1lbnUoKVxuXG4gICAgbWVudVZpc2libGU6ID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSAhPSAnbm9uZSdcbiAgICBzaG93TWVudTogICAgPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7IEBtZW51Py5mb2N1cz8oKSM7IHBvc3QuZW1pdCAndGl0bGViYXInICdoaWRlVGl0bGUnXG4gICAgaGlkZU1lbnU6ICAgID0+IEBtZW51Py5jbG9zZSgpOyBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZScjOyBwb3N0LmVtaXQgJ3RpdGxlYmFyJyAnc2hvd1RpdGxlJ1xuICAgIHRvZ2dsZU1lbnU6ICA9PiBpZiBAbWVudVZpc2libGUoKSB0aGVuIEBoaWRlTWVudSgpIGVsc2UgQHNob3dNZW51KClcbiAgICBvcGVuTWVudTogICAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpOyBAbWVudS5vcGVuKClcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpbml0U3R5bGU6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBsaW5rID0kIFwiI3N0eWxlLWxpbmtcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gc2xhc2guZmlsZVVybCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcImNzcy9zdHlsZS5jc3NcIlxuICAgICAgICAgICAgdGl0bGVTdHlsZSA9IGVsZW0gJ2xpbmsnLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgICAgICAgICByZWw6ICAnc3R5bGVzaGVldCdcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9jc3MnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsaW5rLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlIHRpdGxlU3R5bGUsIGxpbmtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3MvI3twcmVmcy5nZXQgJ3NjaGVtZScgJ2RhcmsnfS5jc3NcIlxuICAgICAgICAgICAgdGl0bGVTdHlsZSA9IGVsZW0gJ2xpbmsnLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgICAgICAgICByZWw6ICAnc3R5bGVzaGVldCdcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9jc3MnXG4gICAgICAgICAgICAgICAgaWQ6ICAgJ3N0eWxlLXRpdGxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMFxuXG4gICAgaGFuZGxlS2V5OiAoZXZlbnQpIC0+XG5cbiAgICAgICAgeyBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBcbiAgICAgICAgbWFpbk1lbnUgPSBAbWVudVRlbXBsYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBhY2NlbHMgPSBzZHMuZmluZC5rZXkgbWFpbk1lbnUsICdhY2NlbCdcbiAgICAgICAgY29tYm9zID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnY29tYm8nXG4gICAgICAgIFxuICAgICAgICBrZXBhdGhzID0gY29tYm9zLmNvbmNhdCBhY2NlbHMgIyBzd2FwIG9uIHdpbj9cbiAgICAgICAgXG4gICAgICAgIGZvciBrZXlwYXRoIGluIGtlcGF0aHNcbiAgICAgICAgICAgIGNvbWJvcyA9IHNkcy5nZXQobWFpbk1lbnUsIGtleXBhdGgpLnNwbGl0ICcgJ1xuICAgICAgICAgICAgY29tYm9zID0gY29tYm9zLm1hcCAoYykgLT4ga2V5aW5mby5jb252ZXJ0Q21kQ3RybCBjXG4gICAgICAgICAgICBpZiBjb21ibyBpbiBjb21ib3NcbiAgICAgICAgICAgICAgICBrZXlwYXRoLnBvcCgpXG4gICAgICAgICAgICAgICAgaXRlbSA9IHNkcy5nZXQgbWFpbk1lbnUsIGtleXBhdGhcbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nIGl0ZW0uYWN0aW9uID8gaXRlbS50ZXh0LCBpdGVtXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cblxuICAgICAgICAndW5oYW5kbGVkJ1xuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlXG4iXX0=
//# sourceURL=../coffee/title.coffee