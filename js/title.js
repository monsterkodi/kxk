// koffee 1.4.0

/*
000000000  000  000000000  000      00000000
   000     000     000     000      000     
   000     000     000     000      0000000 
   000     000     000     000      000     
   000     000     000     0000000  00000000
 */
var $, Title, _, drag, electron, elem, empty, keyinfo, klog, kstr, menu, noon, post, prefs, ref, scheme, sds, slash, stopEvent, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('./kxk'), post = ref.post, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, scheme = ref.scheme, slash = ref.slash, empty = ref.empty, prefs = ref.prefs, elem = ref.elem, drag = ref.drag, klog = ref.klog, noon = ref.noon, kstr = ref.kstr, menu = ref.menu, win = ref.win, sds = ref.sds, $ = ref.$, _ = ref._;

electron = require('electron');

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
        this.onDragStop = bind(this.onDragStop, this);
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
        this.title.innerHTML = html;
        return this.titleDrag = new drag({
            target: document.body,
            handle: this.title,
            onStart: this.onDragStart,
            onMove: this.onDragMove,
            onStop: this.onDragStop
        });
    };

    Title.prototype.onDragStop = function(drag, event) {
        return klog('dargStop', drag);
    };

    Title.prototype.onDragStart = function(drag, event) {
        win = electron.remote.getCurrentWindow();
        return this.startBounds = win.getBounds();
    };

    Title.prototype.onDragMove = function(drag, event) {
        win = electron.remote.getCurrentWindow();
        return win.setBounds({
            x: this.startBounds.x + drag.deltaSum.x,
            y: this.startBounds.y + drag.deltaSum.y,
            width: this.startBounds.width,
            height: this.startBounds.height
        });
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
        var maximized, wa, wb;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtIQUFBO0lBQUE7OztBQVFBLE1BQWdILE9BQUEsQ0FBUSxPQUFSLENBQWhILEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLHFCQUFuQixFQUE0QixtQkFBNUIsRUFBb0MsaUJBQXBDLEVBQTJDLGlCQUEzQyxFQUFrRCxpQkFBbEQsRUFBeUQsZUFBekQsRUFBK0QsZUFBL0QsRUFBcUUsZUFBckUsRUFBMkUsZUFBM0UsRUFBaUYsZUFBakYsRUFBdUYsZUFBdkYsRUFBNkYsYUFBN0YsRUFBa0csYUFBbEcsRUFBdUcsU0FBdkcsRUFBMEc7O0FBRTFHLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtJQUVXLGVBQUMsSUFBRDtBQUVULFlBQUE7UUFGVSxJQUFDLENBQUEsTUFBRDs7Ozs7Ozs7Ozs7O1lBRVYsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxNQUFPOztRQUVSLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDO1FBRVgsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLHlDQUFjLFdBQWQ7UUFFUCxJQUFVLENBQUksSUFBQyxDQUFBLElBQWY7QUFBQSxtQkFBQTs7UUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFVBQVIsRUFBc0IsSUFBQyxDQUFBLFVBQXZCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXNCLElBQUMsQ0FBQSxZQUF2QjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsVUFBdkIsRUFBbUMsU0FBQyxLQUFEO21CQUFXLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixVQUF4QixDQUFqQjtRQUFYLENBQW5DO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FB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QVcsU0FBQyxLQUFEO0FBRVAsWUFBQTtRQUFFLFFBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakI7UUFFWixRQUFBLEdBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBQTtRQUVYLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCLE9BQXZCO1FBQ1QsTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBVCxDQUFhLFFBQWIsRUFBdUIsT0FBdkI7UUFFVCxPQUFBLEdBQVUsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkO0FBRVYsYUFBQSx5Q0FBQTs7WUFDSSxNQUFBLEdBQVMsR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsR0FBakM7WUFDVCxNQUFBLEdBQVMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEtBQUQ7dUJBQVcsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsS0FBdkI7WUFBWCxDQUFYO1lBQ1QsSUFBRyxhQUFTLE1BQVQsRUFBQSxLQUFBLE1BQUg7Z0JBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBQTtnQkFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCLE9BQWxCO2dCQUNQLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVix3Q0FBc0MsSUFBSSxDQUFDLElBQTNDLEVBQWlELElBQWpEO0FBQ0EsdUJBQU8sS0FKWDs7QUFISjtlQVNBO0lBcEJPOzs7Ozs7QUFzQmYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgcG9zdCwgc3RvcEV2ZW50LCBrZXlpbmZvLCBzY2hlbWUsIHNsYXNoLCBlbXB0eSwgcHJlZnMsIGVsZW0sIGRyYWcsIGtsb2csIG5vb24sIGtzdHIsIG1lbnUsIHdpbiwgc2RzLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgVGl0bGVcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAb3B0ID89IHt9XG4gICAgICAgIFxuICAgICAgICBwa2cgPSBAb3B0LnBrZ1xuICAgICAgICBcbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtID8gXCIjdGl0bGViYXJcIlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbVxuXG4gICAgICAgIHBvc3Qub24gJ3RpdGxlYmFyJywgICBAb25UaXRsZWJhclxuICAgICAgICBwb3N0Lm9uICdtZW51QWN0aW9uJywgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snLCAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudCwgcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2luaWNvbiA9IGVsZW0gY2xhc3M6ICd3aW5pY29uJ1xuICAgICAgICBpZiBAb3B0Lmljb25cbiAgICAgICAgICAgIEB3aW5pY29uLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gQG9wdC5kaXIsIEBvcHQuaWNvblxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAd2luaWNvblxuICAgICAgICBAd2luaWNvbi5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicsICdPcGVuIE1lbnUnICAgXG4gICAgICAgIFxuICAgICAgICBAdGl0bGUgPSBlbGVtIGNsYXNzOiAndGl0bGViYXItdGl0bGUnXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB0aXRsZVxuICAgICAgICBAc2V0VGl0bGUgQG9wdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAjIOKAlCDil7sg8J+eqVxuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtaW5pbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOCAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiLTFcIiB5MT1cIjVcIiB4Mj1cIjExXCIgeTI9XCI1XCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQG1pbmltaXplXG4gICAgICAgIEBtaW5pbWl6ZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicsICdNaW5pbWl6ZSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gbWF4aW1pemUgZ3JheSdcbiAgICAgICAgXG4gICAgICAgIEBtYXhpbWl6ZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMVwiIGhlaWdodD1cIjExXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6IDA7XCI+PC9yZWN0PlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAbWF4aW1pemVcbiAgICAgICAgQG1heGltaXplLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ01heGltaXplJ1xuXG4gICAgICAgIEBjbG9zZSA9IGVsZW0gY2xhc3M6ICd3aW5idXR0b24gY2xvc2UnXG4gICAgICAgIFxuICAgICAgICBAY2xvc2UuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIxMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMTFcIj48L2xpbmU+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY2xvc2VcbiAgICAgICAgQGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgJ0Nsb3NlJ1xuXG4gICAgICAgIEB0b3BmcmFtZSA9IGVsZW0gY2xhc3M6ICd0b3BmcmFtZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRvcGZyYW1lXG4gICAgICAgIFxuICAgICAgICBAaW5pdFN0eWxlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQubWVudVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW5pdE1lbnUgQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgXG4gICAgcHVzaEVsZW06IChlbGVtKSAtPlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIGVsZW0sIEBtaW5pbWl6ZVxuICAgICAgICAgICAgXG4gICAgc2hvd1RpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdpbml0aWFsJ1xuICAgIGhpZGVUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2V0VGl0bGU6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBodG1sID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgcGFydHMgPSBvcHQudGl0bGUgPyBbXVxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy5uYW1lIGFuZCAnbmFtZScgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItbmFtZSc+I3tvcHQucGtnLm5hbWV9PC9zcGFuPlwiXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLnZlcnNpb24gYW5kICd2ZXJzaW9uJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiDil48gPC9zcGFuPlwiXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLXZlcnNpb24nPiN7b3B0LnBrZy52ZXJzaW9ufTwvc3Bhbj5cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cucGF0aCBhbmQgJ3BhdGgnIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLWRvdCc+IOKWuiA8L3NwYW4+XCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItdmVyc2lvbic+I3tvcHQucGtnLnBhdGh9PC9zcGFuPlwiXG4gICAgICAgICAgICBcbiAgICAgICAgQHRpdGxlLmlubmVySFRNTCA9IGh0bWxcbiAgICAgICAgXG4gICAgICAgIEB0aXRsZURyYWcgPSBuZXcgZHJhZ1xuICAgICAgICAgICAgdGFyZ2V0OiAgZG9jdW1lbnQuYm9keVxuICAgICAgICAgICAgaGFuZGxlOiAgQHRpdGxlXG4gICAgICAgICAgICBvblN0YXJ0OiBAb25EcmFnU3RhcnRcbiAgICAgICAgICAgIG9uTW92ZTogIEBvbkRyYWdNb3ZlXG4gICAgICAgICAgICBvblN0b3A6ICBAb25EcmFnU3RvcFxuICAgIFxuICAgIG9uRHJhZ1N0b3A6IChkcmFnLCBldmVudCkgPT4ga2xvZyAnZGFyZ1N0b3AnIGRyYWdcbiAgICBvbkRyYWdTdGFydDogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICBcbiAgICAgICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICBAc3RhcnRCb3VuZHMgPSB3aW4uZ2V0Qm91bmRzKCkgICAgXG4gICAgXG4gICAgb25EcmFnTW92ZTogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICAgICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICB3aW4uc2V0Qm91bmRzIFxuICAgICAgICAgICAgeDogICAgICBAc3RhcnRCb3VuZHMueCArIGRyYWcuZGVsdGFTdW0ueCBcbiAgICAgICAgICAgIHk6ICAgICAgQHN0YXJ0Qm91bmRzLnkgKyBkcmFnLmRlbHRhU3VtLnkgXG4gICAgICAgICAgICB3aWR0aDogIEBzdGFydEJvdW5kcy53aWR0aCBcbiAgICAgICAgICAgIGhlaWdodDogQHN0YXJ0Qm91bmRzLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgb25UaXRsZWJhcjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3Nob3dUaXRsZScgICB0aGVuIEBzaG93VGl0bGUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZVRpdGxlJyAgIHRoZW4gQGhpZGVUaXRsZSgpXG4gICAgICAgICAgICB3aGVuICdzaG93TWVudScgICAgdGhlbiBAc2hvd01lbnUoKVxuICAgICAgICAgICAgd2hlbiAnaGlkZU1lbnUnICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ3RvZ2dsZU1lbnUnICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbicgIFxuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdUb2dnbGUgTWVudScgICAgICB0aGVuIEB0b2dnbGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ09wZW4gTWVudScgICAgICAgIHRoZW4gQG9wZW5NZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1Nob3cgTWVudScgICAgICAgIHRoZW4gQHNob3dNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUgTWVudScgICAgICAgIHRoZW4gQGhpZGVNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ1RvZ2dsZSBTY2hlbWUnICAgIFxuICAgICAgICAgICAgICAgIGlmIEBvcHQuc2NoZW1lICE9IGZhbHNlIHRoZW4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgICAgICB3aGVuICdEZXZUb29scycgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy50b2dnbGVEZXZUb29scygpXG4gICAgICAgICAgICB3aGVuICdSZWxvYWQnICAgICAgICAgICB0aGVuIHdpbi53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgICAgICAgICAgIHRoZW4gd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUnICAgICAgICAgICAgIHRoZW4gd2luLmhpZGUoKVxuICAgICAgICAgICAgd2hlbiAnTWluaW1pemUnICAgICAgICAgdGhlbiB3aW4ubWluaW1pemUoKVxuICAgICAgICAgICAgd2hlbiAnTWF4aW1pemUnIFxuICAgICAgICAgICAgICAgIHdhID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICAgICAgICAgIHdiID0gd2luLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgbWF4aW1pemVkID0gd2luLmlzTWF4aW1pemVkKCkgb3IgKHdiLndpZHRoID09IHdhLndpZHRoIGFuZCB3Yi5oZWlnaHQgPT0gd2EuaGVpZ2h0KVxuICAgICAgICAgICAgICAgIGlmIG1heGltaXplZCB0aGVuIHdpbi51bm1heGltaXplKCkgZWxzZSB3aW4ubWF4aW1pemUoKSAgXG5cbiAgICBtZW51VGVtcGxhdGU6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW10gaWYgbm90IEBvcHQuZGlyIG9yIG5vdCBAb3B0Lm1lbnVcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZSA9IEBtYWtlVGVtcGxhdGUgbm9vbi5sb2FkIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51VGVtcGxhdGU/XG4gICAgICAgICAgICBAb3B0Lm1lbnVUZW1wbGF0ZSBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZVxuICAgICAgICBcbiAgICBtYWtlVGVtcGxhdGU6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICB0bXBsID0gW11cbiAgICAgICAgZm9yIHRleHQsbWVudU9yQWNjZWwgb2Ygb2JqXG4gICAgICAgICAgICB0bXBsLnB1c2ggc3dpdGNoXG4gICAgICAgICAgICAgICAgd2hlbiBlbXB0eShtZW51T3JBY2NlbCkgYW5kIHRleHQuc3RhcnRzV2l0aCAnLSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNOdW1iZXIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtzdHIgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIF8uaXNTdHJpbmcgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOmtleWluZm8uY29udmVydENtZEN0cmwgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5IG1lbnVPckFjY2VsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6dGV4dFxuICAgICAgICAgICAgICAgICAgICBhY2NlbDogJydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG1lbnVPckFjY2VsLmFjY2VsPyBvciBtZW51T3JBY2NlbC5jb21tYW5kPyAjIG5lZWRzIGJldHRlciB0ZXN0IVxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbSA9IF8uY2xvbmUgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udGV4dCA9IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51OkBtYWtlVGVtcGxhdGUgbWVudU9yQWNjZWxcbiAgICAgICAgdG1wbFxuXG4gICAgaW5pdE1lbnU6IChpdGVtcykgLT5cblxuICAgICAgICBAbWVudSA9IG5ldyBtZW51IGl0ZW1zOml0ZW1zXG4gICAgICAgIEBlbGVtLmluc2VydEJlZm9yZSBAbWVudS5lbGVtLCBAZWxlbS5maXJzdENoaWxkLm5leHRTaWJsaW5nXG4gICAgICAgIEBoaWRlTWVudSgpXG5cbiAgICBtZW51VmlzaWJsZTogPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ICE9ICdub25lJ1xuICAgIHNob3dNZW51OiAgICA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJzsgQG1lbnU/LmZvY3VzPygpIzsgcG9zdC5lbWl0ICd0aXRsZWJhcicgJ2hpZGVUaXRsZSdcbiAgICBoaWRlTWVudTogICAgPT4gQG1lbnU/LmNsb3NlKCk7IEBtZW51LmVsZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJyM7IHBvc3QuZW1pdCAndGl0bGViYXInICdzaG93VGl0bGUnXG4gICAgdG9nZ2xlTWVudTogID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKVxuICAgIG9wZW5NZW51OiAgICA9PiBpZiBAbWVudVZpc2libGUoKSB0aGVuIEBoaWRlTWVudSgpIGVsc2UgQHNob3dNZW51KCk7IEBtZW51Lm9wZW4oKVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGluaXRTdHlsZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGxpbmsgPSQgXCIjc3R5bGUtbGlua1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzL3N0eWxlLmNzc1wiXG4gICAgICAgICAgICB0aXRsZVN0eWxlID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gc2xhc2guZmlsZVVybCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcImNzcy8je3ByZWZzLmdldCAnc2NoZW1lJywgJ2RhcmsnfS5jc3NcIlxuICAgICAgICAgICAgdGl0bGVTdHlsZSA9IGVsZW0gJ2xpbmsnLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgICAgICAgICByZWw6ICAnc3R5bGVzaGVldCdcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9jc3MnXG4gICAgICAgICAgICAgICAgaWQ6ICAgJ3N0eWxlLXRpdGxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMFxuXG4gICAgaGFuZGxlS2V5OiAoZXZlbnQpIC0+XG5cbiAgICAgICAgeyBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBcbiAgICAgICAgbWFpbk1lbnUgPSBAbWVudVRlbXBsYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBhY2NlbHMgPSBzZHMuZmluZC5rZXkgbWFpbk1lbnUsICdhY2NlbCdcbiAgICAgICAgY29tYm9zID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnY29tYm8nXG4gICAgICAgIFxuICAgICAgICBrZXBhdGhzID0gY29tYm9zLmNvbmNhdCBhY2NlbHMgIyBzd2FwIG9uIHdpbj9cbiAgICAgICAgXG4gICAgICAgIGZvciBrZXlwYXRoIGluIGtlcGF0aHNcbiAgICAgICAgICAgIGNvbWJvcyA9IHNkcy5nZXQobWFpbk1lbnUsIGtleXBhdGgpLnNwbGl0ICcgJ1xuICAgICAgICAgICAgY29tYm9zID0gY29tYm9zLm1hcCAoY29tYm8pIC0+IGtleWluZm8uY29udmVydENtZEN0cmwgY29tYm9cbiAgICAgICAgICAgIGlmIGNvbWJvIGluIGNvbWJvc1xuICAgICAgICAgICAgICAgIGtleXBhdGgucG9wKClcbiAgICAgICAgICAgICAgICBpdGVtID0gc2RzLmdldCBtYWluTWVudSwga2V5cGF0aFxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbWVudUFjdGlvbicsIGl0ZW0uYWN0aW9uID8gaXRlbS50ZXh0LCBpdGVtXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cblxuICAgICAgICAndW5oYW5kbGVkJ1xuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlXG4iXX0=
//# sourceURL=../coffee/title.coffee