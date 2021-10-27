// koffee 1.14.0

/*
000000000  000  000000000  000      00000000
   000     000     000     000      000     
   000     000     000     000      0000000 
   000     000     000     000      000     
   000     000     000     0000000  00000000
 */
var $, Title, _, args, drag, elem, empty, keyinfo, kstr, menu, noon, post, prefs, ref, scheme, sds, slash, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('./kxk'), $ = ref.$, _ = ref._, args = ref.args, drag = ref.drag, elem = ref.elem, empty = ref.empty, keyinfo = ref.keyinfo, kstr = ref.kstr, menu = ref.menu, noon = ref.noon, post = ref.post, prefs = ref.prefs, scheme = ref.scheme, sds = ref.sds, slash = ref.slash, stopEvent = ref.stopEvent;

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
        if (event.target.nodeName === 'INPUT') {
            return 'skip';
        }
        return this.startBounds = require('electron').ipcRenderer.sendSync('getWinBounds');
    };

    Title.prototype.onDragMove = function(drag, event) {
        return require('electron').ipcRenderer.send('setWinBounds', {
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
            default:
                return require('electron').ipcRenderer.send('menuAction', action, args);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ0aXRsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0hBQUE7SUFBQTs7O0FBUUEsTUFBMkcsT0FBQSxDQUFRLE9BQVIsQ0FBM0csRUFBRSxTQUFGLEVBQUssU0FBTCxFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9CLGVBQXBCLEVBQTBCLGlCQUExQixFQUFpQyxxQkFBakMsRUFBMEMsZUFBMUMsRUFBZ0QsZUFBaEQsRUFBc0QsZUFBdEQsRUFBNEQsZUFBNUQsRUFBa0UsaUJBQWxFLEVBQXlFLG1CQUF6RSxFQUFpRixhQUFqRixFQUFzRixpQkFBdEYsRUFBNkY7O0FBRXZGO0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7Ozs7Ozs7OztZQUVBLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsTUFBTzs7UUFFUixHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUVYLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSx5Q0FBYyxXQUFkO1FBRVAsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLEVBQXFCLElBQUMsQ0FBQSxVQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFVBQXZCLEVBQWtDLFNBQUMsS0FBRDttQkFBVyxTQUFBLENBQVUsS0FBVixFQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBdUIsVUFBdkIsQ0FBakI7UUFBWCxDQUFsQztRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1NBQUw7UUFDWCxJQUFHLElB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QyxDQUFEO3VCQUFPLE9BQU8sQ0FBQyxjQUFSLENBQXVCLENBQXZCO1lBQVAsQ0FBWDtZQUNULElBQUcsYUFBUyxNQUFULEVBQUEsS0FBQSxNQUFIO2dCQUNJLE9BQU8sQ0FBQyxHQUFSLENBQUE7Z0JBQ0EsSUFBQSxHQUFPLEdBQUcsQ0FBQyxHQUFKLENBQVEsUUFBUixFQUFrQixPQUFsQjtnQkFDUCxJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsd0NBQXFDLElBQUksQ0FBQyxJQUExQyxFQUFnRCxJQUFoRDtBQUNBLHVCQUFPLEtBSlg7O0FBSEo7ZUFTQTtJQXZCTzs7Ozs7O0FBeUJmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgXG4gICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMjI1xuXG57ICQsIF8sIGFyZ3MsIGRyYWcsIGVsZW0sIGVtcHR5LCBrZXlpbmZvLCBrc3RyLCBtZW51LCBub29uLCBwb3N0LCBwcmVmcywgc2NoZW1lLCBzZHMsIHNsYXNoLCBzdG9wRXZlbnQgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBUaXRsZVxuICAgIFxuICAgIEA6IChAb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgQG9wdCA/PSB7fVxuICAgICAgICBcbiAgICAgICAgcGtnID0gQG9wdC5wa2dcbiAgICAgICAgXG4gICAgICAgIEBlbGVtID0kIEBvcHQuZWxlbSA/IFwiI3RpdGxlYmFyXCJcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGVsZW1cblxuICAgICAgICBwb3N0Lm9uICd0aXRsZWJhcicgICBAb25UaXRsZWJhclxuICAgICAgICBwb3N0Lm9uICdtZW51QWN0aW9uJyBAb25NZW51QWN0aW9uXG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdkYmxjbGljaycgKGV2ZW50KSAtPiBzdG9wRXZlbnQgZXZlbnQsIHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ01heGltaXplJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2luaWNvbiA9IGVsZW0gY2xhc3M6ICd3aW5pY29uJ1xuICAgICAgICBpZiBAb3B0Lmljb25cbiAgICAgICAgICAgIEB3aW5pY29uLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgc3JjOnNsYXNoLmZpbGVVcmwgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5pY29uXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB3aW5pY29uXG4gICAgICAgIEB3aW5pY29uLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAtPiBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nICdPcGVuIE1lbnUnICAgXG4gICAgICAgIFxuICAgICAgICBAdGl0bGUgPSBlbGVtIGNsYXNzOiAndGl0bGViYXItdGl0bGUnXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEB0aXRsZVxuICAgICAgICBcbiAgICAgICAgQGluaXRUaXRsZURyYWcoKVxuICAgICAgICBAc2V0VGl0bGUgQG9wdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAjIOKAlCDil7sg8J+eqVxuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBtaW5pbWl6ZSBncmF5J1xuICAgICAgICBcbiAgICAgICAgQG1pbmltaXplLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0xMCAtOCAzMCAzMFwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiLTFcIiB5MT1cIjVcIiB4Mj1cIjExXCIgeTI9XCI1XCI+PC9saW5lPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQG1pbmltaXplXG4gICAgICAgIEBtaW5pbWl6ZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnTWluaW1pemUnXG4gICAgICAgIFxuICAgICAgICBAbWF4aW1pemUgPSBlbGVtIGNsYXNzOiAnd2luYnV0dG9uIG1heGltaXplIGdyYXknXG4gICAgICAgIFxuICAgICAgICBAbWF4aW1pemUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiLTEwIC05IDMwIDMwXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMTFcIiBoZWlnaHQ9XCIxMVwiIHN0eWxlPVwiZmlsbC1vcGFjaXR5OiAwO1wiPjwvcmVjdD5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQG1heGltaXplXG4gICAgICAgIEBtYXhpbWl6ZS5hZGRFdmVudExpc3RlbmVyICdjbGljaycgLT4gcG9zdC5lbWl0ICdtZW51QWN0aW9uJyAnTWF4aW1pemUnXG5cbiAgICAgICAgQGNsb3NlID0gZWxlbSBjbGFzczogJ3dpbmJ1dHRvbiBjbG9zZSdcbiAgICAgICAgXG4gICAgICAgIEBjbG9zZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCItMTAgLTkgMzAgMzBcIj5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIjBcIiB5MT1cIjBcIiB4Mj1cIjEwXCIgeTI9XCIxMVwiPjwvbGluZT5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIjEwXCIgeTE9XCIwXCIgeDI9XCIwXCIgeTI9XCIxMVwiPjwvbGluZT5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIEBjbG9zZVxuICAgICAgICBAY2xvc2UuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIC0+IHBvc3QuZW1pdCAnbWVudUFjdGlvbicgJ0Nsb3NlJ1xuXG4gICAgICAgIEB0b3BmcmFtZSA9IGVsZW0gY2xhc3M6ICd0b3BmcmFtZSdcbiAgICAgICAgQGVsZW0uYXBwZW5kQ2hpbGQgQHRvcGZyYW1lXG4gICAgICAgIFxuICAgICAgICBAaW5pdFN0eWxlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvcHQubWVudVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW5pdE1lbnUgQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgXG4gICAgcHVzaEVsZW06IChlbGVtKSAtPlxuICAgICAgICBcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIGVsZW0sIEBtaW5pbWl6ZVxuICAgICAgICAgICAgXG4gICAgc2hvd1RpdGxlOiAtPiBAdGl0bGUuc3R5bGUuZGlzcGxheSA9ICdpbml0aWFsJ1xuICAgIGhpZGVUaXRsZTogLT4gQHRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpbml0VGl0bGVEcmFnOiAtPlxuICAgICAgICBcbiAgICAgICAgQHRpdGxlRHJhZyA9IG5ldyBkcmFnXG4gICAgICAgICAgICB0YXJnZXQ6ICAgICBkb2N1bWVudC5ib2R5XG4gICAgICAgICAgICBoYW5kbGU6ICAgICBAb3B0LmRyYWdFbGVtID8gQGVsZW1cbiAgICAgICAgICAgIG9uU3RhcnQ6ICAgIEBvbkRyYWdTdGFydFxuICAgICAgICAgICAgb25Nb3ZlOiAgICAgQG9uRHJhZ01vdmVcbiAgICAgICAgICAgIHN0b3BFdmVudDogIGZhbHNlXG4gICAgXG4gICAgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT4gXG4gICAgXG4gICAgICAgIGlmIGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PSAnSU5QVVQnXG4gICAgICAgICAgICByZXR1cm4gJ3NraXAnXG4gICAgICAgICAgICBcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5pcGNSZW5kZXJlci5zZW5kU3luYyAnZ2V0V2luQm91bmRzJ1xuICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT4gXG5cbiAgICAgICAgcmVxdWlyZSgnZWxlY3Ryb24nKS5pcGNSZW5kZXJlci5zZW5kICdzZXRXaW5Cb3VuZHMnLCBcbiAgICAgICAgICAgIHg6ICAgICAgQHN0YXJ0Qm91bmRzLnggKyBkcmFnLmRlbHRhU3VtLnggXG4gICAgICAgICAgICB5OiAgICAgIEBzdGFydEJvdW5kcy55ICsgZHJhZy5kZWx0YVN1bS55IFxuICAgICAgICAgICAgd2lkdGg6ICBAc3RhcnRCb3VuZHMud2lkdGggXG4gICAgICAgICAgICBoZWlnaHQ6IEBzdGFydEJvdW5kcy5oZWlnaHRcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNldFRpdGxlOiAob3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcbiAgICAgICAgXG4gICAgICAgIHBhcnRzID0gb3B0LnRpdGxlID8gW11cbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5wa2cubmFtZSBhbmQgJ25hbWUnIGluIHBhcnRzXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLW5hbWUnPiN7b3B0LnBrZy5uYW1lfTwvc3Bhbj5cIlxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LnBrZy52ZXJzaW9uIGFuZCAndmVyc2lvbicgaW4gcGFydHNcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz0ndGl0bGViYXItZG90Jz4je29wdC5wa2cudmVyc2lvbn08L3NwYW4+XCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHQucGtnLnBhdGggYW5kICdwYXRoJyBpbiBwYXJ0c1xuICAgICAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0aXRsZWJhci1kb3QnPiDilrogPC9zcGFuPlwiXG4gICAgICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9J3RpdGxlYmFyLW5hbWUnPiN7b3B0LnBrZy5wYXRofTwvc3Bhbj5cIlxuICAgICAgICAgICAgXG4gICAgICAgIEB0aXRsZS5pbm5lckhUTUwgPSBodG1sXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIG9uVGl0bGViYXI6IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdzaG93VGl0bGUnICAgdGhlbiBAc2hvd1RpdGxlKClcbiAgICAgICAgICAgIHdoZW4gJ2hpZGVUaXRsZScgICB0aGVuIEBoaWRlVGl0bGUoKVxuICAgICAgICAgICAgd2hlbiAnc2hvd01lbnUnICAgIHRoZW4gQHNob3dNZW51KClcbiAgICAgICAgICAgIHdoZW4gJ2hpZGVNZW51JyAgICB0aGVuIEBoaWRlTWVudSgpXG4gICAgICAgICAgICB3aGVuICd0b2dnbGVNZW51JyAgdGhlbiBAdG9nZ2xlTWVudSgpXG4gICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbiwgYXJncykgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIE1lbnUnICAgICAgdGhlbiBAdG9nZ2xlTWVudSgpXG4gICAgICAgICAgICB3aGVuICdPcGVuIE1lbnUnICAgICAgICB0aGVuIEBvcGVuTWVudSgpXG4gICAgICAgICAgICB3aGVuICdTaG93IE1lbnUnICAgICAgICB0aGVuIEBzaG93TWVudSgpXG4gICAgICAgICAgICB3aGVuICdIaWRlIE1lbnUnICAgICAgICB0aGVuIEBoaWRlTWVudSgpXG4gICAgICAgICAgICB3aGVuICdUb2dnbGUgU2NoZW1lJyAgICBcbiAgICAgICAgICAgICAgICBpZiBAb3B0LnNjaGVtZSAhPSBmYWxzZSB0aGVuIHNjaGVtZS50b2dnbGUoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlcXVpcmUoJ2VsZWN0cm9uJykuaXBjUmVuZGVyZXIuc2VuZCAnbWVudUFjdGlvbicgYWN0aW9uLCBhcmdzXG5cbiAgICBtZW51VGVtcGxhdGU6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW10gaWYgbm90IEBvcHQuZGlyIG9yIG5vdCBAb3B0Lm1lbnVcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgICAgICBAdGVtcGxhdGVDYWNoZSA9IEBtYWtlVGVtcGxhdGUgbm9vbi5sb2FkIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBAb3B0LmRpciwgQG9wdC5tZW51XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQG9wdC5tZW51VGVtcGxhdGU/IGFuZCBfLmlzRnVuY3Rpb24gQG9wdC5tZW51VGVtcGxhdGVcbiAgICAgICAgICAgIEBvcHQubWVudVRlbXBsYXRlIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wbGF0ZUNhY2hlXG4gICAgICAgIFxuICAgIG1ha2VUZW1wbGF0ZTogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGwgPSBbXVxuICAgICAgICBmb3IgdGV4dCxtZW51T3JBY2NlbCBvZiBvYmpcbiAgICAgICAgICAgIHRtcGwucHVzaCBzd2l0Y2hcbiAgICAgICAgICAgICAgICB3aGVuIGVtcHR5KG1lbnVPckFjY2VsKSBhbmQgdGV4dC5zdGFydHNXaXRoICctJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgIHdoZW4gXy5pc051bWJlciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a3N0ciBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gXy5pc1N0cmluZyBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgYWNjZWw6a2V5aW5mby5jb252ZXJ0Q21kQ3RybCBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgIHdoZW4gZW1wdHkgbWVudU9yQWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGFjY2VsOiAnJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgbWVudU9yQWNjZWwuYWNjZWw/IG9yIG1lbnVPckFjY2VsLmNvbW1hbmQ/ICMgbmVlZHMgYmV0dGVyIHRlc3QhXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0gXy5jbG9uZSBtZW51T3JBY2NlbFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnU6QG1ha2VUZW1wbGF0ZSBtZW51T3JBY2NlbFxuICAgICAgICB0bXBsXG5cbiAgICBpbml0TWVudTogKGl0ZW1zKSAtPlxuXG4gICAgICAgIEBtZW51ID0gbmV3IG1lbnUgaXRlbXM6aXRlbXNcbiAgICAgICAgQGVsZW0uaW5zZXJ0QmVmb3JlIEBtZW51LmVsZW0sIEBlbGVtLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmdcbiAgICAgICAgQGhpZGVNZW51KClcbiAgICAgICAgXG4gICAgcmVmcmVzaE1lbnU6IC0+XG4gICAgICAgIFxuICAgICAgICBAbWVudS5kZWwoKVxuICAgICAgICBAaW5pdE1lbnUgQG1lbnVUZW1wbGF0ZSgpXG5cbiAgICBtZW51VmlzaWJsZTogPT4gQG1lbnUuZWxlbS5zdHlsZS5kaXNwbGF5ICE9ICdub25lJ1xuICAgIHNob3dNZW51OiAgICA9PiBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJzsgQG1lbnU/LmZvY3VzPygpXG4gICAgaGlkZU1lbnU6ICAgID0+IEBtZW51Py5jbG9zZSgpOyBAbWVudS5lbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB0b2dnbGVNZW51OiAgPT4gaWYgQG1lbnVWaXNpYmxlKCkgdGhlbiBAaGlkZU1lbnUoKSBlbHNlIEBzaG93TWVudSgpXG4gICAgb3Blbk1lbnU6ICAgID0+IGlmIEBtZW51VmlzaWJsZSgpIHRoZW4gQGhpZGVNZW51KCkgZWxzZSBAc2hvd01lbnUoKTsgQG1lbnUub3BlbigpXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMCAwMDAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaW5pdFN0eWxlOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbGluayA9JCBcIiNzdHlsZS1saW5rXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmZpbGVVcmwgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCJjc3Mvc3R5bGUuY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZSB0aXRsZVN0eWxlLCBsaW5rXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSBzbGFzaC5maWxlVXJsIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiY3NzLyN7cHJlZnMuZ2V0ICdzY2hlbWUnICdkYXJrJ30uY3NzXCJcbiAgICAgICAgICAgIHRpdGxlU3R5bGUgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgICAgICAgICAgIGlkOiAgICdzdHlsZS10aXRsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUgdGl0bGVTdHlsZSwgbGlua1xuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcblxuICAgIGhhbmRsZUtleTogKGV2ZW50KSAtPlxuXG4gICAgICAgIHsgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIG1haW5NZW51ID0gQG1lbnVUZW1wbGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgYWNjZWxzID0gc2RzLmZpbmQua2V5IG1haW5NZW51LCAnYWNjZWwnXG4gICAgICAgIGNvbWJvcyA9IHNkcy5maW5kLmtleSBtYWluTWVudSwgJ2NvbWJvJ1xuICAgICAgICBcbiAgICAgICAga2VwYXRocyA9IGNvbWJvcy5jb25jYXQgYWNjZWxzICMgc3dhcCBvbiB3aW4/XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBjb21ib1xuICAgICAgICAgICAgcmV0dXJuICd1bmhhbmRsZWQnXG4gICAgICAgIFxuICAgICAgICBmb3Iga2V5cGF0aCBpbiBrZXBhdGhzXG4gICAgICAgICAgICBjb21ib3MgPSBzZHMuZ2V0KG1haW5NZW51LCBrZXlwYXRoKS5zcGxpdCAnICdcbiAgICAgICAgICAgIGNvbWJvcyA9IGNvbWJvcy5tYXAgKGMpIC0+IGtleWluZm8uY29udmVydENtZEN0cmwgY1xuICAgICAgICAgICAgaWYgY29tYm8gaW4gY29tYm9zXG4gICAgICAgICAgICAgICAga2V5cGF0aC5wb3AoKVxuICAgICAgICAgICAgICAgIGl0ZW0gPSBzZHMuZ2V0IG1haW5NZW51LCBrZXlwYXRoXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdtZW51QWN0aW9uJyBpdGVtLmFjdGlvbiA/IGl0ZW0udGV4dCwgaXRlbVxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtXG5cbiAgICAgICAgJ3VuaGFuZGxlZCdcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUaXRsZVxuIl19
//# sourceURL=../coffee/title.coffee