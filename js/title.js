// koffee 1.12.0

/*
000000000  000  000000000  000      00000000
   000     000     000     000      000     
   000     000     000     000      0000000 
   000     000     000     000      000     
   000     000     000     0000000  00000000
 */
var $, Title, _, drag, elem, empty, keyinfo, kstr, menu, noon, post, prefs, ref, scheme, sds, slash, stopEvent, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('./kxk'), $ = ref.$, _ = ref._, drag = ref.drag, elem = ref.elem, empty = ref.empty, keyinfo = ref.keyinfo, kstr = ref.kstr, menu = ref.menu, noon = ref.noon, post = ref.post, prefs = ref.prefs, scheme = ref.scheme, sds = ref.sds, slash = ref.slash, stopEvent = ref.stopEvent, win = ref.win;

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
        if ((this.opt.menuTemplate != null) && _.isFunction(this.opt.menuTemplate)) {
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

    Title.prototype.refreshMenu = function() {
        this.menu.del();
        return this.initMenu(this.menuTemplate());
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
        if (empty(combo)) {
            return 'unhandled';
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ0aXRsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsK0dBQUE7SUFBQTs7O0FBUUEsTUFBMEcsT0FBQSxDQUFRLE9BQVIsQ0FBMUcsRUFBRSxTQUFGLEVBQUssU0FBTCxFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9CLGlCQUFwQixFQUEyQixxQkFBM0IsRUFBb0MsZUFBcEMsRUFBMEMsZUFBMUMsRUFBZ0QsZUFBaEQsRUFBc0QsZUFBdEQsRUFBNEQsaUJBQTVELEVBQW1FLG1CQUFuRSxFQUEyRSxhQUEzRSxFQUFnRixpQkFBaEYsRUFBdUYseUJBQXZGLEVBQWtHOztBQUU1RjtJQUVDLGVBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsTUFBRDs7Ozs7Ozs7Ozs7WUFFQSxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE1BQU87O1FBRVIsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFHLENBQUM7UUFFWCxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEseUNBQWMsV0FBZDtRQUVQLElBQVUsQ0FBSSxJQUFDLENBQUEsSUFBZjtBQUFBLG1CQUFBOztRQUVBLElBQUksQ0FBQyxFQUFMLENBQVEsVUFBUixFQUFxQixJQUFDLENBQUEsVUFBdEI7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLFlBQXRCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixVQUF2QixFQUFrQyxTQUFDLEtBQUQ7bUJBQVcsU0FBQSxDQUFVLEtBQVYsRUFBaUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxZQUFWLEVBQXVCLFVBQXZCLENBQWpCO1FBQVgsQ0FBbEM7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtTQUFMO1FBQ1gsSUFBRyxJ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QWtCLE9BQWxCO2dCQUNQLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVix3Q0FBcUMsSUFBSSxDQUFDLElBQTFDLEVBQWdELElBQWhEO0FBQ0EsdUJBQU8sS0FKWDs7QUFISjtlQVNBO0lBdkJPOzs7Ozs7QUF5QmYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgJCwgXywgZHJhZywgZWxlbSwgZW1wdHksIGtleWluZm8sIGtzdHIsIG1lbnUsIG5vb24sIHBvc3QsIHByZWZzLCBzY2hlbWUsIHNkcywgc2xhc2gsIHN0b3BFdmVudCwgd2luIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgVGl0bGVcbiAgICBcbiAgICBAOiAoQG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBvcHQgPz0ge31cbiAgICAgICAgXG4gICAgICAgIHBrZyA9IEBvcHQucGtnXG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9JCBAb3B0LmVsZW0gPyBcIiN0aXRsZWJhclwiXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtXG5cbiAgICAgICAgcG9zdC5vbiAndGl0bGViYXInICAgQG9uVGl0bGViYXJcbiAgICAgICAgcG9zdC5vbiAnbWVudUFjdGlvbicgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snIChldmVudCkgLT4gc3RvcEV2ZW50IGV2ZW50LCBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdNYXhpbWl6ZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpbmljb24gPSBlbGVtIGNsYXNzOiAnd2luaWNvbidcbiAgICAgICAgaWYgQG9wdC5pY29uXG4gICAgICAgICAgICBAd2luaWNvbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQuaWNvblxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAd2luaWNvblxuICAgICAgICBAd2luaWNvbi5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnT3BlbiBNZW51JyAgIFxuICAgICAgICBcbiAgICAgICAgQHRpdGxlID0gZWxlbSBjbGFzczogJ3RpdGxlYmFyLXRpdGxlJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAdGl0bGVcbiAgICAgICAgXG4gICAgICAgIEBpbml0VGl0bGVEcmFnKClcbiAgICAgICAgQHNldFRpdGxlIEBvcHRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgIyDigJQg4pe7IPCfnqlcbiAgICAgICAgXG4gICAgICAgIEBtaW5pbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWluaW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtaW5pbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTggMzAgMzBcIj5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIi0xXCIgeTE9XCI1XCIgeDI9XCIxMVwiIHkyPVwiNVwiPjwvbGluZT5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBtaW5pbWl6ZVxuICAgICAgICBAbWluaW1pemUuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ01pbmltaXplJ1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtYXhpbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1heGltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOSAzMCAzMFwiPlxuICAgICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjExXCIgaGVpZ2h0PVwiMTFcIiBzdHlsZT1cImZpbGwtb3BhY2l0eTogMDtcIj48L3JlY3Q+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBtYXhpbWl6ZVxuICAgICAgICBAbWF4aW1pemUuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ01heGltaXplJ1xuXG4gICAgICAgIEBjbG9zZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gY2xvc2UnXG4gICAgICAgIFxuICAgICAgICBAY2xvc2UuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIxMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY2xvc2VcbiAgICAgICAgQGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdDbG9zZSdcblxuICAgICAgICBAdG9wZnJhbWUgPSBlbGVtIGNsYXNzOiAndG9wZnJhbWUnXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB0b3BmcmFtZVxuICAgICAgICBcbiAgICAgICAgQGluaXRTdHlsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAb3B0Lm1lbnVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGluaXRNZW51IEBtZW51VGVtcGxhdGUoKVxuICAgICAgIFxuICAgIHB1c2hFbGVtOiAoZWxlbSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmluc2VydEJlZm9yZSBlbGVtLCBAbWluaW1pemVcbiAgICAgICAgICAgIFxuICAgIHNob3dUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnaW5pdGlhbCdcbiAgICBoaWRlVGl0bGU6IC0+IEB0aXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaW5pdFRpdGxlRHJhZzogLT5cbiAgICAgICAgXG4gICAgICAgIEB0aXRsZURyYWcgPSBuZXcgZHJhZ1xuICAgICAgICAgICAgdGFyZ2V0OiAgICAgZG9jdW1lbnQuYm9keVxuICAgICAgICAgICAgaGFuZGxlOiAgICAgQG9wdC5kcmFnRWxlbSA/IEBlbGVtXG4gICAgICAgICAgICBvblN0YXJ0OiAgICBAb25EcmFnU3RhcnRcbiAgICAgICAgICAgIG9uTW92ZTogICAgIEBvbkRyYWdNb3ZlXG4gICAgICAgICAgICBzdG9wRXZlbnQ6ICBmYWxzZVxuICAgIFxuICAgIG9uRHJhZ1N0YXJ0OiAoZHJhZywgZXZlbnQpID0+IFxuICAgIFxuICAgICAgICBpZiBldmVudC50YXJnZXQubm9kZU5hbWUgPT0gJ0lOUFVUJ1xuICAgICAgICAgICAgcmV0dXJuICdza2lwJ1xuICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIHdpbi50aXRsZURyYWcgPSBmYWxzZVxuICAgICAgICBAc3RhcnRCb3VuZHMgPSB3aW4uZ2V0Qm91bmRzKCkgICAgXG4gICAgXG4gICAgb25EcmFnTW92ZTogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHdpbi50aXRsZURyYWcgPSB0cnVlXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgd2luLnNldEJvdW5kcyBcbiAgICAgICAgICAgIHg6ICAgICAgQHN0YXJ0Qm91bmRzLnggKyBkcmFnLmRlbHRhU3VtLnggXG4gICAgICAgICAgICB5OiAgICAgIEBzdGFydEJvdW5kcy55ICsgZHJhZy5kZWx0YVN1bS55IFxuICAgICAgICAgICAgd2lkdGg6ICBAc3RhcnRCb3VuZHMud2lkdGggXG4gICAgICAgICAgICBoZWlnaHQ6IEBzdGFydEJvdW5kcy5oZWlnaHRcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNldFRpdGxlOiAob3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcbiAgICAgICAgXG4gICAgICAgIHBhcnRzID0gb3B0LnRpdGxlID8gW11cbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cubmFtZSBhbmQgJ25hbWUnIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLW5hbWUnPiN7b3B0LnBrZy5uYW1lfTwvc3Bhbj5cIlxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy52ZXJzaW9uIGFuZCAndmVyc2lvbicgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4je29wdC5wa2cudmVyc2lvbn08L3NwYW4+XCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLnBhdGggYW5kICdwYXRoJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiDilrogPC9zcGFuPlwiXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLW5hbWUnPiN7b3B0LnBrZy5wYXRofTwvc3Bhbj5cIlxuICAgICAgICAgICAgXG4gICAgICAgIEB0aXRsZS5pbm5lckhUTUwgPSBodG1sXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIG9uVGl0bGViYXI6IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdzaG93VGl0bGUnICAgdGhlbiBAc2hvd1RpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ2hpZGVUaXRsZScgICB0aGVuIEBoaWRlVGl0bGUoKVxuICAgICAgICAgICAgd2hlbiAnc2hvd01lbnUnICAgIHRoZW4gQHNob3dNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ2hpZGVNZW51JyAgICB0aGVuIEBoaWRlTWVudSgpXG4gICAgICAgICAgICB3aGVuICd0b2dnbGVNZW51JyAgdGhlbiBAdG9nZ2xlTWVudSgpXG4gICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbiwgYXJncykgPT5cbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nICBcbiAgICAgICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIE1lbnUnICAgICAgdGhlbiBAdG9nZ2xlTWVudSgpXG4gICAgICAgICAgICB3aGVuICdPcGVuIE1lbnUnICAgICAgICB0aGVuIEBvcGVuTWVudSgpXG4gICAgICAgICAgICB3aGVuICdTaG93IE1lbnUnICAgICAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdIaWRlIE1lbnUnICAgICAgICB0aGVuIEBoaWRlTWVudSgpXG4gICAgICAgICAgICB3aGVuICdUb2dnbGUgU2NoZW1lJyAgICBcbiAgICAgICAgICAgICAgICBpZiBAb3B0LnNjaGVtZSAhPSBmYWxzZSB0aGVuIHNjaGVtZS50b2dnbGUoKVxuICAgICAgICAgICAgd2hlbiAnRGV2VG9vbHMnICAgICAgICAgdGhlbiB3aW4ud2ViQ29udGVudHMudG9nZ2xlRGV2VG9vbHMoKVxuICAgICAgICAgICAgd2hlbiAnUmVsb2FkJyAgICAgICAgICAgdGhlbiB3aW4ud2ViQ29udGVudHMucmVsb2FkSWdub3JpbmdDYWNoZSgpXG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICAgICAgICAgICB0aGVuIHdpbi5jbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdIaWRlJyAgICAgICAgICAgICB0aGVuIHdpbi5oaWRlKClcbiAgICAgICAgICAgIHdoZW4gJ01pbmltaXplJyAgICAgICAgIHRoZW4gd2luLm1pbmltaXplKClcbiAgICAgICAgICAgIHdoZW4gJ01heGltaXplJyBcbiAgICAgICAgICAgICAgICB3YSA9IGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICAgICAgICAgICAgICB3YiA9IHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgIG1heGltaXplZCA9IHdpbi5pc01heGltaXplZCgpIG9yICh3Yi53aWR0aCA9PSB3YS53aWR0aCBhbmQgd2IuaGVpZ2h0ID09IHdhLmhlaWdodClcbiAgICAgICAgICAgICAgICBpZiBtYXhpbWl6ZWQgdGhlbiB3aW4udW5tYXhpbWl6ZSgpIGVsc2Ugd2luLm1heGltaXplKCkgIFxuXG4gICAgbWVudVRlbXBsYXRlOiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFtdIGlmIG5vdCBAb3B0LmRpciBvciBub3QgQG9wdC5tZW51XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAdGVtcGxhdGVDYWNoZVxuICAgICAgICAgICAgQHRlbXBsYXRlQ2FjaGUgPSBAbWFrZVRlbXBsYXRlIG5vb24ubG9hZCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQubWVudVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvcHQubWVudVRlbXBsYXRlPyBhbmQgXy5pc0Z1bmN0aW9uIEBvcHQubWVudVRlbXBsYXRlXG4gICAgICAgICAgICBAb3B0Lm1lbnVUZW1wbGF0ZSBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBcbiAgICBtYWtlVGVtcGxhdGU6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICB0bXBsID0gW11cbiAgICAgICAgZm9yIHRleHQsbWVudU9yQWNjZWwgb2Ygb2JqXG4gICAgICAgICAgICB0bXBsLnB1c2ggc3dpdGNoXG4gICAgICAgICAgICAgICAgd2hlbiBlbXB0eShtZW51T3JBY2NlbCkgYW5kIHRleHQuc3RhcnRzV2l0aCAnLSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNOdW1iZXIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtzdHIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNTdHJpbmcgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtleWluZm8uY29udmVydENtZEN0cmwgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5IG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDogJydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG1lbnVPckFjY2VsLmFjY2VsPyBvciBtZW51T3JBY2NlbC5jb21tYW5kPyAjIG5lZWRzIGJldHRlciB0ZXN0IVxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbSA9IF8uY2xvbmUgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udGV4dCA9IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51OkBtYWtlVGVtcGxhdGUgbWVudU9yQWNjZWxcbiAgICAgICAgdG1wbFxuXG4gICAgaW5pdE1lbnU6IChpdGVtcykgLT5cblxuICAgICAgICBAbWVudSA9IG5ldyBtZW51IGl0ZW1zOml0ZW1zXG4gICAgICAgIEBlbGVtLmluc2VydEJlZm9yZSBAbWVudS5lbGVtLCBAZWxlbS5maXJzdENoaWxkLm5leHRTaWJsaW5nXG4gICAgICAgIEBoaWRlTWVudSgpXG4gICAgICAgIFxuICAgIHJlZnJlc2hNZW51OiAtPlxuICAgICAgICBcbiAgICAgICAgQG1lbnUuZGVsKClcbiAgICAgICAgQGluaXRNZW51IEBtZW51VGVtcGxhdGUoKVxuXG4gICAgbWVudVZpc2libGU6ID0+IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSAhPSAnbm9uZSdcbiAgICBzaG93TWVudTogICAgPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7IEBtZW51Py5mb2N1cz8oKVxuICAgIGhpZGVNZW51OiAgICA9PiBAbWVudT8uY2xvc2UoKTsgQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgdG9nZ2xlTWVudTogID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKVxuICAgIG9wZW5NZW51OiAgICA9PiBpZiBAbWVudVZpc2libGUoKSB0aGVuIEBoaWRlTWVudSgpIGVsc2UgQHNob3dNZW51KCk7IEBtZW51Lm9wZW4oKVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGluaXRTdHlsZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGxpbmsgPSQgXCIjc3R5bGUtbGlua1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzL3N0eWxlLmNzc1wiXG4gICAgICAgICAgICB0aXRsZVN0eWxlID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gc2xhc2guZmlsZVVybCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcImNzcy8je3ByZWZzLmdldCAnc2NoZW1lJyAnZGFyayd9LmNzc1wiXG4gICAgICAgICAgICB0aXRsZVN0eWxlID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBpZDogICAnc3R5bGUtdGl0bGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsaW5rLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlIHRpdGxlU3R5bGUsIGxpbmtcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwXG5cbiAgICBoYW5kbGVLZXk6IChldmVudCkgLT5cblxuICAgICAgICB7IGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICAgICBtYWluTWVudSA9IEBtZW51VGVtcGxhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgIGFjY2VscyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2FjY2VsJ1xuICAgICAgICBjb21ib3MgPSBzZHMuZmluZC5rZXkgbWFpbk1lbnUsICdjb21ibydcbiAgICAgICAgXG4gICAgICAgIGtlcGF0aHMgPSBjb21ib3MuY29uY2F0IGFjY2VscyAjIHN3YXAgb24gd2luP1xuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgY29tYm9cbiAgICAgICAgICAgIHJldHVybiAndW5oYW5kbGVkJ1xuICAgICAgICBcbiAgICAgICAgZm9yIGtleXBhdGggaW4ga2VwYXRoc1xuICAgICAgICAgICAgY29tYm9zID0gc2RzLmdldChtYWluTWVudSwga2V5cGF0aCkuc3BsaXQgJyAnXG4gICAgICAgICAgICBjb21ib3MgPSBjb21ib3MubWFwIChjKSAtPiBrZXlpbmZvLmNvbnZlcnRDbWRDdHJsIGNcbiAgICAgICAgICAgIGlmIGNvbWJvIGluIGNvbWJvc1xuICAgICAgICAgICAgICAgIGtleXBhdGgucG9wKClcbiAgICAgICAgICAgICAgICBpdGVtID0gc2RzLmdldCBtYWluTWVudSwga2V5cGF0aFxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbWVudUFjdGlvbicgaXRlbS5hY3Rpb24gPyBpdGVtLnRleHQsIGl0ZW1cbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVxuXG4gICAgICAgICd1bmhhbmRsZWQnXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVGl0bGVcbiJdfQ==
//# sourceURL=../coffee/title.coffee