// koffee 0.43.0

/*
00000000    0000000   00000000   000   000  00000000 
000   000  000   000  000   000  000   000  000   000
00000000   000   000  00000000   000   000  00000000 
000        000   000  000        000   000  000      
000         0000000   000         0000000   000
 */
var Popup, elem, empty, keyinfo, menu, os, post, ref, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), post = ref.post, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, empty = ref.empty, elem = ref.elem, menu = ref.menu, os = ref.os;

Popup = (function() {
    function Popup(opt) {
        this.onKeyDown = bind(this.onKeyDown, this);
        this.onFocusOut = bind(this.onFocusOut, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onClick = bind(this.onClick, this);
        this.onHover = bind(this.onHover, this);
        this.close = bind(this.close, this);
        var br, div, i, item, len, ref1, ref2, ref3, ref4, text;
        this.focusElem = document.activeElement;
        this.items = elem({
            "class": 'popup',
            tabindex: 3
        });
        this.parent = opt.parent;
        this.onClose = opt.onClose;
        if (opt["class"]) {
            this.items.classList.add(opt["class"]);
        }
        ref1 = opt.items;
        for (i = 0, len = ref1.length; i < len; i++) {
            item = ref1[i];
            if (item.hide) {
                continue;
            }
            if (empty(item.text) && empty(item.html)) {
                div = elem('hr', {
                    "class": 'popupItem separator'
                });
            } else {
                div = elem({
                    "class": 'popupItem',
                    text: item.text
                });
                if (!empty(item.html)) {
                    div.innerHTML = item.html;
                }
                div.item = item;
                div.addEventListener('click', this.onClick);
                if ((ref2 = item.combo) != null ? ref2 : item.accel) {
                    text = keyinfo.short(os.platform() === 'darwin' ? (ref3 = item.combo) != null ? ref3 : item.accel : (ref4 = item.accel) != null ? ref4 : item.combo);
                    div.appendChild(elem('span', {
                        "class": 'popupCombo',
                        text: text
                    }));
                } else if (item.menu) {
                    div.appendChild(elem('span', {
                        "class": 'popupCombo',
                        text: '▶'
                    }));
                }
            }
            this.items.appendChild(div);
        }
        document.body.appendChild(this.items);
        this.items.addEventListener('contextmenu', this.onContextMenu);
        this.items.addEventListener('keydown', this.onKeyDown);
        this.items.addEventListener('focusout', this.onFocusOut);
        this.items.addEventListener('mouseover', this.onHover);
        br = this.items.getBoundingClientRect();
        if (opt.x + br.width > document.body.clientWidth) {
            this.items.style.left = (document.body.clientWidth - br.width) + "px";
        } else {
            this.items.style.left = opt.x + "px";
        }
        if (opt.y + br.height > document.body.clientHeight) {
            this.items.style.top = (document.body.clientHeight - br.height) + "px";
        } else {
            this.items.style.top = opt.y + "px";
        }
        if (opt.selectFirstItem !== false) {
            this.select(this.items.firstChild, {
                selectFirstItem: false
            });
        }
        post.emit('popup', 'opened');
    }

    Popup.prototype.close = function(opt) {
        var ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
        if (opt == null) {
            opt = {};
        }
        if (empty(this.parent) || ((ref1 = this.parentMenu()) != null ? (ref2 = ref1.elem) != null ? ref2.classList.contains('menu') : void 0 : void 0)) {
            post.emit('popup', 'closed');
            if (typeof this.onClose === "function") {
                this.onClose();
            }
        }
        if ((ref3 = this.popup) != null) {
            ref3.close({
                focus: false
            });
        }
        delete this.popup;
        if ((ref4 = this.items) != null) {
            ref4.removeEventListener('keydown', this.onKeyDown);
        }
        if ((ref5 = this.items) != null) {
            ref5.removeEventListener('focusout', this.onFocusOut);
        }
        if ((ref6 = this.items) != null) {
            ref6.removeEventListener('mouseover', this.onHover);
        }
        if ((ref7 = this.items) != null) {
            ref7.remove();
        }
        delete this.items;
        if ((ref8 = this.parent) != null) {
            ref8.childClosed(this, opt);
        }
        if (opt.all) {
            if (this.parent != null) {
                this.parent.close(opt);
            }
        }
        if (opt.focus !== false && !this.parent) {
            return (ref9 = this.focusElem) != null ? ref9.focus() : void 0;
        }
    };

    Popup.prototype.childClosed = function(child, opt) {
        if (child === this.popup) {
            delete this.popup;
            if (opt.focus !== false) {
                return this.focus();
            }
        }
    };

    Popup.prototype.select = function(item, opt) {
        var ref1, ref2;
        if (opt == null) {
            opt = {};
        }
        if (item == null) {
            return;
        }
        if (this.popup != null) {
            this.popup.close({
                focus: false
            });
        }
        if ((ref1 = this.selected) != null) {
            ref1.classList.remove('selected');
        }
        this.selected = item;
        this.selected.classList.add('selected');
        if (((ref2 = item.item) != null ? ref2.menu : void 0) && opt.open !== false) {
            delete this.popup;
            this.popupChild(item, opt);
        }
        return this.focus();
    };

    Popup.prototype.popupChild = function(item, opt) {
        var br, items;
        if (opt == null) {
            opt = {};
        }
        if (items = item.item.menu) {
            if (this.popup) {
                return this.closePopup();
            } else {
                br = item.getBoundingClientRect();
                return this.popup = new Popup({
                    items: items,
                    parent: this,
                    x: br.left + br.width,
                    y: br.top,
                    selectFirstItem: opt != null ? opt.selectFirstItem : void 0
                });
            }
        }
    };

    Popup.prototype.closePopup = function() {
        var ref1;
        if ((ref1 = this.popup) != null) {
            ref1.close({
                focus: false
            });
        }
        return delete this.popup;
    };

    Popup.prototype.navigateLeft = function() {
        if (this.popup) {
            return this.closePopup();
        } else if (menu = this.parentMenu()) {
            return menu.navigateLeft();
        } else if (this.parent) {
            return this.close({
                focus: false
            });
        }
    };

    Popup.prototype.activateOrNavigateRight = function() {
        if (this.selected != null) {
            if (!this.selected.item.menu) {
                return this.activate(this.selected);
            } else {
                return this.navigateRight();
            }
        }
    };

    Popup.prototype.navigateRight = function() {
        var ref1;
        if (this.popup) {
            return this.popup.select(this.popup.items.firstChild);
        } else if ((ref1 = this.selected) != null ? ref1.item.menu : void 0) {
            return this.select(this.selected, {
                selectFirstItem: true
            });
        } else if (menu = this.parentMenu()) {
            return menu.navigateRight();
        }
    };

    Popup.prototype.parentMenu = function() {
        if ((this.parent != null) && !this.parent.parent) {
            return this.parent;
        }
    };

    Popup.prototype.nextItem = function() {
        var next, ref1;
        if (next = this.selected) {
            while (next = next.nextSibling) {
                if (!empty((ref1 = next.item) != null ? ref1.text : void 0)) {
                    return next;
                }
            }
        }
    };

    Popup.prototype.prevItem = function() {
        var prev, ref1;
        if (prev = this.selected) {
            while (prev = prev.previousSibling) {
                if (!empty((ref1 = prev.item) != null ? ref1.text : void 0)) {
                    return prev;
                }
            }
        }
    };

    Popup.prototype.activate = function(item) {
        var ref1, ref2, ref3;
        if (((ref1 = item.item) != null ? ref1.cb : void 0) != null) {
            this.close({
                all: true
            });
            return item.item.cb((ref2 = item.item.arg) != null ? ref2 : item.item.text);
        } else if (!item.item.menu) {
            this.close({
                all: true
            });
            return post.emit('menuAction', (ref3 = item.item.action) != null ? ref3 : item.item.text, item.item);
        }
    };

    Popup.prototype.toggle = function(item) {
        if (this.popup) {
            this.popup.close({
                focus: false
            });
            return delete this.popup;
        } else {
            return this.select(item, {
                selectFirstItem: false
            });
        }
    };

    Popup.prototype.onHover = function(event) {
        var item;
        item = elem.upElem(event.target, {
            prop: 'item'
        });
        if (item) {
            return this.select(item, {
                selectFirstItem: false
            });
        }
    };

    Popup.prototype.onClick = function(event) {
        var item;
        stopEvent(event);
        item = elem.upElem(event.target, {
            prop: 'item'
        });
        if (item) {
            if (item.item.menu) {
                return this.toggle(item);
            } else {
                return this.activate(item);
            }
        }
    };

    Popup.prototype.onContextMenu = function(event) {
        return stopEvent(event);
    };

    Popup.prototype.focus = function() {
        var ref1;
        return (ref1 = this.items) != null ? ref1.focus() : void 0;
    };

    Popup.prototype.onFocusOut = function(event) {
        var ref1;
        if (!((ref1 = event.relatedTarget) != null ? ref1.classList.contains('popup') : void 0)) {
            return this.close({
                all: true,
                focus: false
            });
        }
    };

    Popup.prototype.onKeyDown = function(event) {
        var combo, key, mod, ref1;
        ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo;
        switch (combo) {
            case 'end':
            case 'page down':
                return stopEvent(event, this.select(this.items.lastChild, {
                    selectFirstItem: false
                }));
            case 'home':
            case 'page up':
                return stopEvent(event, this.select(this.items.firstChild, {
                    selectFirstItem: false
                }));
            case 'esc':
                return stopEvent(event, this.close());
            case 'down':
                return stopEvent(event, this.select(this.nextItem(), {
                    selectFirstItem: false
                }));
            case 'up':
                return stopEvent(event, this.select(this.prevItem(), {
                    selectFirstItem: false
                }));
            case 'enter':
            case 'space':
                return stopEvent(event, this.activateOrNavigateRight());
            case 'left':
                return stopEvent(event, this.navigateLeft());
            case 'right':
                return stopEvent(event, this.navigateRight());
        }
    };

    return Popup;

})();

module.exports = {
    menu: function(opt) {
        return new Popup(opt);
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJEQUFBO0lBQUE7O0FBUUEsTUFBc0QsT0FBQSxDQUFRLE9BQVIsQ0FBdEQsRUFBRSxlQUFGLEVBQVEseUJBQVIsRUFBbUIscUJBQW5CLEVBQTRCLGlCQUE1QixFQUFtQyxlQUFuQyxFQUF5QyxlQUF6QyxFQUErQzs7QUFFekM7SUFFVyxlQUFDLEdBQUQ7Ozs7Ozs7QUFFVCxZQUFBO1FBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7WUFBZ0IsUUFBQSxFQUFVLENBQTFCO1NBQUw7UUFDYixJQUFDLENBQUEsTUFBRCxHQUFhLEdBQUcsQ0FBQztRQUNqQixJQUFDLENBQUEsT0FBRCxHQUFhLEdBQUcsQ0FBQztRQUVqQixJQUFrQyxHQUFHLEVBQUMsS0FBRCxFQUFyQztZQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLEdBQUcsRUFBQyxLQUFELEVBQXhCLEVBQUE7O0FBRUE7QUFBQSxhQUFBLHNDQUFBOztZQUNJLElBQVksSUFBSSxDQUFDLElBQWpCO0FBQUEseUJBQUE7O1lBQ0EsSUFBRyxLQUFBLENBQU0sSUFBSSxDQUFDLElBQVgsQ0FBQSxJQUFxQixLQUFBLENBQU0sSUFBSSxDQUFDLElBQVgsQ0FBeEI7Z0JBQ0ksR0FBQSxHQUFNLElBQUEsQ0FBSyxJQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtpQkFBWCxFQURWO2FBQUEsTUFBQTtnQkFHSSxHQUFBLEdBQU0sSUFBQSxDQUFLO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sV0FBUDtvQkFBb0IsSUFBQSxFQUFNLElBQUksQ0FBQyxJQUEvQjtpQkFBTDtnQkFD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ZixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFBLElBQUEsRUFBTSxTQUFDLEdBQUQ7ZUFBUyxJQUFJLEtBQUosQ0FBVSxHQUFWO0lBQVQsQ0FBTiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIyNcblxueyBwb3N0LCBzdG9wRXZlbnQsIGtleWluZm8sIGVtcHR5LCBlbGVtLCBtZW51LCBvcyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFBvcHVwXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAZm9jdXNFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgICAgICBAaXRlbXMgICAgID0gZWxlbSBjbGFzczogJ3BvcHVwJywgdGFiaW5kZXg6IDNcbiAgICAgICAgQHBhcmVudCAgICA9IG9wdC5wYXJlbnRcbiAgICAgICAgQG9uQ2xvc2UgICA9IG9wdC5vbkNsb3NlXG4gICAgICAgIFxuICAgICAgICBAaXRlbXMuY2xhc3NMaXN0LmFkZCBvcHQuY2xhc3MgaWYgb3B0LmNsYXNzXG4gICAgICAgIFxuICAgICAgICBmb3IgaXRlbSBpbiBvcHQuaXRlbXNcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGl0ZW0uaGlkZVxuICAgICAgICAgICAgaWYgZW1wdHkoaXRlbS50ZXh0KSBhbmQgZW1wdHkoaXRlbS5odG1sKVxuICAgICAgICAgICAgICAgIGRpdiA9IGVsZW0gJ2hyJywgY2xhc3M6ICdwb3B1cEl0ZW0gc2VwYXJhdG9yJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRpdiA9IGVsZW0gY2xhc3M6ICdwb3B1cEl0ZW0nLCB0ZXh0OiBpdGVtLnRleHRcbiAgICAgICAgICAgICAgICBpZiBub3QgZW1wdHkgaXRlbS5odG1sXG4gICAgICAgICAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSBpdGVtLmh0bWwgXG4gICAgICAgICAgICAgICAgZGl2Lml0ZW0gPSBpdGVtXG4gICAgICAgICAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgQG9uQ2xpY2tcbiAgICAgICAgICAgICAgICBpZiBpdGVtLmNvbWJvID8gaXRlbS5hY2NlbFxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0ga2V5aW5mby5zaG9ydCBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbWJvID8gaXRlbS5hY2NlbFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmFjY2VsID8gaXRlbS5jb21ib1xuICAgICAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQgZWxlbSAnc3BhbicsIGNsYXNzOidwb3B1cENvbWJvJywgdGV4dDp0ZXh0XG4gICAgICAgICAgICAgICAgZWxzZSBpZiBpdGVtLm1lbnUgXG4gICAgICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCBlbGVtICdzcGFuJywgY2xhc3M6J3BvcHVwQ29tYm8nLCB0ZXh0OifilrYnXG4gICAgICAgICAgICBAaXRlbXMuYXBwZW5kQ2hpbGQgZGl2XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBAaXRlbXNcbiAgICAgICAgQGl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgQG9uQ29udGV4dE1lbnVcbiAgICAgICAgQGl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAgICAgQG9uS2V5RG93blxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAnZm9jdXNvdXQnLCAgICBAb25Gb2N1c091dFxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgICBAb25Ib3ZlclxuICAgICAgICBcbiAgICAgICAgYnIgPSBAaXRlbXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC54K2JyLndpZHRoID4gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCBcbiAgICAgICAgICAgIEBpdGVtcy5zdHlsZS5sZWZ0ID0gXCIje2RvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggLSBici53aWR0aH1weFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpdGVtcy5zdHlsZS5sZWZ0ID0gXCIje29wdC54fXB4XCIgXG4gICAgICAgICAgIFxuICAgICAgICBpZiBvcHQueStici5oZWlnaHQgPiBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodFxuICAgICAgICAgICAgQGl0ZW1zLnN0eWxlLnRvcCA9IFwiI3tkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAtIGJyLmhlaWdodH1weFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpdGVtcy5zdHlsZS50b3AgPSBcIiN7b3B0Lnl9cHhcIlxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LnNlbGVjdEZpcnN0SXRlbSAhPSBmYWxzZVxuICAgICAgICAgICAgQHNlbGVjdCBAaXRlbXMuZmlyc3RDaGlsZCwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgcG9zdC5lbWl0ICdwb3B1cCcsICdvcGVuZWQnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY2xvc2U6IChvcHQ9e30pPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5KEBwYXJlbnQpIG9yIEBwYXJlbnRNZW51KCk/LmVsZW0/LmNsYXNzTGlzdC5jb250YWlucyAnbWVudSdcbiAgICAgICAgICAgIHBvc3QuZW1pdCAncG9wdXAnLCAnY2xvc2VkJ1xuICAgICAgICAgICAgQG9uQ2xvc2U/KClcbiAgICAgICAgXG4gICAgICAgIEBwb3B1cD8uY2xvc2UgZm9jdXM6ZmFsc2VcbiAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgICAgICBcbiAgICAgICAgQGl0ZW1zPy5yZW1vdmVFdmVudExpc3RlbmVyICdrZXlkb3duJywgICBAb25LZXlEb3duXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAnZm9jdXNvdXQnLCAgQG9uRm9jdXNPdXRcbiAgICAgICAgQGl0ZW1zPy5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZW92ZXInLCBAb25Ib3ZlclxuICAgICAgICBAaXRlbXM/LnJlbW92ZSgpXG4gICAgICAgIGRlbGV0ZSBAaXRlbXNcbiAgICAgICAgXG4gICAgICAgIEBwYXJlbnQ/LmNoaWxkQ2xvc2VkIEAsIG9wdFxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LmFsbFxuICAgICAgICAgICAgaWYgQHBhcmVudD9cbiAgICAgICAgICAgICAgICBAcGFyZW50LmNsb3NlIG9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgb3B0LmZvY3VzICE9IGZhbHNlIGFuZCBub3QgQHBhcmVudFxuICAgICAgICAgICAgQGZvY3VzRWxlbT8uZm9jdXMoKSBcblxuICAgIGNoaWxkQ2xvc2VkOiAoY2hpbGQsIG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNoaWxkID09IEBwb3B1cFxuICAgICAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgICAgICAgICAgaWYgb3B0LmZvY3VzICE9IGZhbHNlXG4gICAgICAgICAgICAgICAgQGZvY3VzKClcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBzZWxlY3Q6IChpdGVtLCBvcHQ9e30pIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGl0ZW0/XG4gICAgICAgIFxuICAgICAgICBpZiBAcG9wdXA/XG4gICAgICAgICAgICBAcG9wdXAuY2xvc2UgZm9jdXM6ZmFsc2VcbiAgICAgICAgXG4gICAgICAgIEBzZWxlY3RlZD8uY2xhc3NMaXN0LnJlbW92ZSAnc2VsZWN0ZWQnXG4gICAgICAgIEBzZWxlY3RlZCA9IGl0ZW1cbiAgICAgICAgQHNlbGVjdGVkLmNsYXNzTGlzdC5hZGQgJ3NlbGVjdGVkJ1xuICAgICAgICBcbiAgICAgICAgaWYgaXRlbS5pdGVtPy5tZW51IGFuZCBvcHQub3BlbiAhPSBmYWxzZVxuICAgICAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgICAgICAgICAgQHBvcHVwQ2hpbGQgaXRlbSwgb3B0XG4gICAgICAgICAgICBcbiAgICAgICAgQGZvY3VzKClcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBwb3B1cENoaWxkOiAoaXRlbSwgb3B0PXt9KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGl0ZW1zID0gaXRlbS5pdGVtLm1lbnVcbiAgICAgICAgICAgIGlmIEBwb3B1cFxuICAgICAgICAgICAgICAgIEBjbG9zZVBvcHVwKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBiciA9IGl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgICAgICBAcG9wdXAgPSBuZXcgUG9wdXAgaXRlbXM6aXRlbXMsIHBhcmVudDpALCB4OmJyLmxlZnQrYnIud2lkdGgsIHk6YnIudG9wLCBzZWxlY3RGaXJzdEl0ZW06b3B0Py5zZWxlY3RGaXJzdEl0ZW1cblxuICAgIGNsb3NlUG9wdXA6IC0+XG4gICAgICAgIFxuICAgICAgICBAcG9wdXA/LmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgIGRlbGV0ZSBAcG9wdXBcblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBuYXZpZ2F0ZUxlZnQ6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAcG9wdXAgXG4gICAgICAgICAgICBAY2xvc2VQb3B1cCgpXG4gICAgICAgIGVsc2UgaWYgbWVudSA9IEBwYXJlbnRNZW51KClcbiAgICAgICAgICAgIG1lbnUubmF2aWdhdGVMZWZ0KClcbiAgICAgICAgZWxzZSBpZiBAcGFyZW50XG4gICAgICAgICAgICBAY2xvc2UgZm9jdXM6ZmFsc2VcblxuICAgIGFjdGl2YXRlT3JOYXZpZ2F0ZVJpZ2h0OiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQHNlbGVjdGVkP1xuICAgICAgICAgICAgaWYgbm90IEBzZWxlY3RlZC5pdGVtLm1lbnVcbiAgICAgICAgICAgICAgICBAYWN0aXZhdGUgQHNlbGVjdGVkXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG5hdmlnYXRlUmlnaHQoKVxuICAgICAgICAgICAgXG4gICAgbmF2aWdhdGVSaWdodDogLT5cbiAgICAgICAgaWYgQHBvcHVwXG4gICAgICAgICAgICBAcG9wdXAuc2VsZWN0IEBwb3B1cC5pdGVtcy5maXJzdENoaWxkXG4gICAgICAgIGVsc2UgaWYgQHNlbGVjdGVkPy5pdGVtLm1lbnVcbiAgICAgICAgICAgIEBzZWxlY3QgQHNlbGVjdGVkLCBzZWxlY3RGaXJzdEl0ZW06dHJ1ZVxuICAgICAgICBlbHNlIGlmIG1lbnUgPSBAcGFyZW50TWVudSgpXG4gICAgICAgICAgICBtZW51Lm5hdmlnYXRlUmlnaHQoKVxuICAgICAgICAgICAgXG4gICAgcGFyZW50TWVudTogLT4gXG4gICAgICAgIGlmIEBwYXJlbnQ/IGFuZCBub3QgQHBhcmVudC5wYXJlbnRcbiAgICAgICAgICAgIEBwYXJlbnRcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgICAwICAgICAgXG4gICAgXG4gICAgbmV4dEl0ZW06IC0+XG4gICAgICAgIGlmIG5leHQgPSBAc2VsZWN0ZWRcbiAgICAgICAgICAgIHdoaWxlIG5leHQgPSBuZXh0Lm5leHRTaWJsaW5nXG4gICAgICAgICAgICAgICAgaWYgbm90IGVtcHR5IG5leHQuaXRlbT8udGV4dFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dFxuICAgIFxuICAgIHByZXZJdGVtOiAtPlxuICAgICAgICBpZiBwcmV2ID0gQHNlbGVjdGVkXG4gICAgICAgICAgICB3aGlsZSBwcmV2ID0gcHJldi5wcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICBpZiBub3QgZW1wdHkgcHJldi5pdGVtPy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2XG4gICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBhY3RpdmF0ZTogKGl0ZW0pIC0+XG5cbiAgICAgICAgaWYgaXRlbS5pdGVtPy5jYj9cbiAgICAgICAgICAgIEBjbG9zZSBhbGw6dHJ1ZVxuICAgICAgICAgICAgaXRlbS5pdGVtLmNiIGl0ZW0uaXRlbS5hcmcgPyBpdGVtLml0ZW0udGV4dFxuICAgICAgICBlbHNlIGlmIG5vdCBpdGVtLml0ZW0ubWVudVxuICAgICAgICAgICAgQGNsb3NlIGFsbDp0cnVlXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nLCBpdGVtLml0ZW0uYWN0aW9uID8gaXRlbS5pdGVtLnRleHQsIGl0ZW0uaXRlbVxuXG4gICAgdG9nZ2xlOiAoaXRlbSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBwb3B1cFxuICAgICAgICAgICAgQHBvcHVwLmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgICAgICBkZWxldGUgQHBvcHVwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZWxlY3QgaXRlbSwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICBcbiAgICAgICAgICAgIFxuICAgIG9uSG92ZXI6IChldmVudCkgPT4gXG4gICAgXG4gICAgICAgIGl0ZW0gPSBlbGVtLnVwRWxlbSBldmVudC50YXJnZXQsIHByb3A6J2l0ZW0nXG4gICAgICAgIGlmIGl0ZW1cbiAgICAgICAgICAgIEBzZWxlY3QgaXRlbSwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlICAgXG5cbiAgICBvbkNsaWNrOiAoZXZlbnQpID0+IFxuXG4gICAgICAgIHN0b3BFdmVudCBldmVudCBcbiAgICAgICAgXG4gICAgICAgIGl0ZW0gPSBlbGVtLnVwRWxlbSBldmVudC50YXJnZXQsIHByb3A6J2l0ZW0nXG4gICAgICAgIGlmIGl0ZW1cbiAgICAgICAgICAgIGlmIGl0ZW0uaXRlbS5tZW51XG4gICAgICAgICAgICAgICAgQHRvZ2dsZSBpdGVtXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGFjdGl2YXRlIGl0ZW1cbiAgICAgICAgICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+IHN0b3BFdmVudCBldmVudCAjIHByZXZlbnRzIG11bHRpcGxlIHBvcHVwc1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZm9jdXM6IC0+IEBpdGVtcz8uZm9jdXMoKVxuICAgIFxuICAgIG9uRm9jdXNPdXQ6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgZXZlbnQucmVsYXRlZFRhcmdldD8uY2xhc3NMaXN0LmNvbnRhaW5zICdwb3B1cCdcbiAgICAgICAgICAgIEBjbG9zZSBhbGw6dHJ1ZSwgZm9jdXM6ZmFsc2VcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uS2V5RG93bjogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgeyBtb2QsIGtleSwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW5kJywgJ3BhZ2UgZG93bicgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBzZWxlY3QgQGl0ZW1zLmxhc3RDaGlsZCwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlIFxuICAgICAgICAgICAgd2hlbiAnaG9tZScsICdwYWdlIHVwJyAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBzZWxlY3QgQGl0ZW1zLmZpcnN0Q2hpbGQsIHNlbGVjdEZpcnN0SXRlbTpmYWxzZSBcbiAgICAgICAgICAgIHdoZW4gJ2VzYycgICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgICAgICAgICAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBzZWxlY3QgQG5leHRJdGVtKCksIHNlbGVjdEZpcnN0SXRlbTpmYWxzZSBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBwcmV2SXRlbSgpLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2UgXG4gICAgICAgICAgICB3aGVuICdlbnRlcicsICdzcGFjZScgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQGFjdGl2YXRlT3JOYXZpZ2F0ZVJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAbmF2aWdhdGVMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAbmF2aWdhdGVSaWdodCgpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gbWVudTogKG9wdCkgLT4gbmV3IFBvcHVwIG9wdFxuIl19
//# sourceURL=../coffee/popup.coffee