// koffee 1.14.0

/*
00000000    0000000   00000000   000   000  00000000 
000   000  000   000  000   000  000   000  000   000
00000000   000   000  00000000   000   000  00000000 
000        000   000  000        000   000  000      
000         0000000   000         0000000   000
 */
var Popup, elem, empty, keyinfo, os, post, ref, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), elem = ref.elem, empty = ref.empty, keyinfo = ref.keyinfo, os = ref.os, post = ref.post, stopEvent = ref.stopEvent;

Popup = (function() {
    function Popup(opt) {
        this.onKeyDown = bind(this.onKeyDown, this);
        this.onFocusOut = bind(this.onFocusOut, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onClick = bind(this.onClick, this);
        this.onHover = bind(this.onHover, this);
        this.activate = bind(this.activate, this);
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
        var m;
        if (this.popup) {
            return this.closePopup();
        } else if (m = this.parentMenu()) {
            return m.navigateLeft();
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
        var ref1, ref2;
        if (this.popup) {
            return this.popup.select(this.popup.items.firstChild);
        } else if ((ref1 = this.selected) != null ? ref1.item.menu : void 0) {
            return this.select(this.selected, {
                selectFirstItem: true
            });
        } else {
            return (ref2 = this.parentMenu()) != null ? ref2.navigateRight() : void 0;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwb3B1cC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscURBQUE7SUFBQTs7QUFRQSxNQUFnRCxPQUFBLENBQVEsT0FBUixDQUFoRCxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLHFCQUFmLEVBQXdCLFdBQXhCLEVBQTRCLGVBQTVCLEVBQWtDOztBQUU1QjtJQUVDLGVBQUMsR0FBRDs7Ozs7Ozs7QUFFQyxZQUFBO1FBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLE9BQU47WUFBYyxRQUFBLEVBQVMsQ0FBdkI7U0FBTDtRQUNiLElBQUMsQ0FBQSxNQUFELEdBQWEsR0FBRyxDQUFDO1FBQ2pCLElBQUMsQ0FBQSxPQUFELEdBQWEsR0FBRyxDQUFDO1FBRWpCLElBQWtDLEdBQUcsRUFBQyxLQUFELEVBQXJDO1lBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBakIsQ0FBcUIsR0FBRyxFQUFDLEtBQUQsRUFBeEIsRUFBQTs7QUFFQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBWSxJQUFJLENBQUMsSUFBakI7QUFBQSx5QkFBQTs7WUFDQSxJQUFHLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxDQUFBLElBQXFCLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxDQUF4QjtnQkFDSSxHQUFBLEdBQU0sSUFBQSxDQUFLLElBQUwsRUFBVTtvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2lCQUFWLEVBRFY7YUFBQSxNQUFBO2dCQUdJLEdBQUEsR0FBTSxJQUFBLENBQUs7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO29CQUFrQixJQUFBLEVBQUssSUFBSSxDQUFDLElBQTVCO2lCQUFM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LEVBQU0sU0FBQyxHQUFEO2VBQVMsSUFBSSxLQUFKLENBQVUsR0FBVjtJQUFULENBQU4iLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyMjXG5cbnsgZWxlbSwgZW1wdHksIGtleWluZm8sIG9zLCBwb3N0LCBzdG9wRXZlbnQgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBQb3B1cFxuICAgIFxuICAgIEA6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAZm9jdXNFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgICAgICBAaXRlbXMgICAgID0gZWxlbSBjbGFzczoncG9wdXAnIHRhYmluZGV4OjNcbiAgICAgICAgQHBhcmVudCAgICA9IG9wdC5wYXJlbnRcbiAgICAgICAgQG9uQ2xvc2UgICA9IG9wdC5vbkNsb3NlXG4gICAgICAgIFxuICAgICAgICBAaXRlbXMuY2xhc3NMaXN0LmFkZCBvcHQuY2xhc3MgaWYgb3B0LmNsYXNzXG4gICAgICAgIFxuICAgICAgICBmb3IgaXRlbSBpbiBvcHQuaXRlbXNcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGl0ZW0uaGlkZVxuICAgICAgICAgICAgaWYgZW1wdHkoaXRlbS50ZXh0KSBhbmQgZW1wdHkoaXRlbS5odG1sKVxuICAgICAgICAgICAgICAgIGRpdiA9IGVsZW0gJ2hyJyBjbGFzczogJ3BvcHVwSXRlbSBzZXBhcmF0b3InXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZGl2ID0gZWxlbSBjbGFzczoncG9wdXBJdGVtJyB0ZXh0Oml0ZW0udGV4dFxuICAgICAgICAgICAgICAgIGlmIG5vdCBlbXB0eSBpdGVtLmh0bWxcbiAgICAgICAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IGl0ZW0uaHRtbCBcbiAgICAgICAgICAgICAgICBkaXYuaXRlbSA9IGl0ZW1cbiAgICAgICAgICAgICAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snIEBvbkNsaWNrXG4gICAgICAgICAgICAgICAgaWYgaXRlbS5jb21ibyA/IGl0ZW0uYWNjZWxcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IGtleWluZm8uc2hvcnQgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb21ibyA/IGl0ZW0uYWNjZWxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5hY2NlbCA/IGl0ZW0uY29tYm9cbiAgICAgICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkIGVsZW0gJ3NwYW4nIGNsYXNzOidwb3B1cENvbWJvJyB0ZXh0OnRleHRcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGl0ZW0ubWVudSBcbiAgICAgICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkIGVsZW0gJ3NwYW4nIGNsYXNzOidwb3B1cENvbWJvJyB0ZXh0OifilrYnXG4gICAgICAgICAgICBAaXRlbXMuYXBwZW5kQ2hpbGQgZGl2XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBAaXRlbXNcbiAgICAgICAgQGl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JyBAb25Db250ZXh0TWVudVxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicgICAgIEBvbktleURvd25cbiAgICAgICAgQGl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIgJ2ZvY3Vzb3V0JyAgICBAb25Gb2N1c091dFxuICAgICAgICBAaXRlbXMuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJyAgIEBvbkhvdmVyXG4gICAgICAgIFxuICAgICAgICBiciA9IEBpdGVtcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBcbiAgICAgICAgaWYgb3B0LngrYnIud2lkdGggPiBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoIFxuICAgICAgICAgICAgQGl0ZW1zLnN0eWxlLmxlZnQgPSBcIiN7ZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAtIGJyLndpZHRofXB4XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGl0ZW1zLnN0eWxlLmxlZnQgPSBcIiN7b3B0Lnh9cHhcIiBcbiAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdC55K2JyLmhlaWdodCA+IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgICBAaXRlbXMuc3R5bGUudG9wID0gXCIje2RvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC0gYnIuaGVpZ2h0fXB4XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGl0ZW1zLnN0eWxlLnRvcCA9IFwiI3tvcHQueX1weFwiXG4gICAgICAgIFxuICAgICAgICBpZiBvcHQuc2VsZWN0Rmlyc3RJdGVtICE9IGZhbHNlXG4gICAgICAgICAgICBAc2VsZWN0IEBpdGVtcy5maXJzdENoaWxkLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBwb3N0LmVtaXQgJ3BvcHVwJyAnb3BlbmVkJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNsb3NlOiAob3B0PXt9KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkoQHBhcmVudCkgb3IgQHBhcmVudE1lbnUoKT8uZWxlbT8uY2xhc3NMaXN0LmNvbnRhaW5zICdtZW51J1xuICAgICAgICAgICAgcG9zdC5lbWl0ICdwb3B1cCcgJ2Nsb3NlZCdcbiAgICAgICAgICAgIEBvbkNsb3NlPygpXG4gICAgICAgIFxuICAgICAgICBAcG9wdXA/LmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAna2V5ZG93bicgICBAb25LZXlEb3duXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAnZm9jdXNvdXQnICBAb25Gb2N1c091dFxuICAgICAgICBAaXRlbXM/LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNlb3ZlcicgQG9uSG92ZXJcbiAgICAgICAgQGl0ZW1zPy5yZW1vdmUoKVxuICAgICAgICBkZWxldGUgQGl0ZW1zXG4gICAgICAgIFxuICAgICAgICBAcGFyZW50Py5jaGlsZENsb3NlZCBALCBvcHRcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5hbGxcbiAgICAgICAgICAgIGlmIEBwYXJlbnQ/XG4gICAgICAgICAgICAgICAgQHBhcmVudC5jbG9zZSBvcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdC5mb2N1cyAhPSBmYWxzZSBhbmQgbm90IEBwYXJlbnRcbiAgICAgICAgICAgIEBmb2N1c0VsZW0/LmZvY3VzKCkgXG5cbiAgICBjaGlsZENsb3NlZDogKGNoaWxkLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaGlsZCA9PSBAcG9wdXBcbiAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgICAgIGlmIG9wdC5mb2N1cyAhPSBmYWxzZVxuICAgICAgICAgICAgICAgIEBmb2N1cygpXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2VsZWN0OiAoaXRlbSwgb3B0PXt9KSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpdGVtP1xuICAgICAgICBcbiAgICAgICAgaWYgQHBvcHVwP1xuICAgICAgICAgICAgQHBvcHVwLmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgIFxuICAgICAgICBAc2VsZWN0ZWQ/LmNsYXNzTGlzdC5yZW1vdmUgJ3NlbGVjdGVkJ1xuICAgICAgICBAc2VsZWN0ZWQgPSBpdGVtXG4gICAgICAgIEBzZWxlY3RlZC5jbGFzc0xpc3QuYWRkICdzZWxlY3RlZCdcbiAgICAgICAgXG4gICAgICAgIGlmIGl0ZW0uaXRlbT8ubWVudSBhbmQgb3B0Lm9wZW4gIT0gZmFsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgICAgIEBwb3B1cENoaWxkIGl0ZW0sIG9wdFxuICAgICAgICAgICAgXG4gICAgICAgIEBmb2N1cygpXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgcG9wdXBDaGlsZDogKGl0ZW0sIG9wdD17fSkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBpdGVtcyA9IGl0ZW0uaXRlbS5tZW51XG4gICAgICAgICAgICBpZiBAcG9wdXBcbiAgICAgICAgICAgICAgICBAY2xvc2VQb3B1cCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnIgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgICAgQHBvcHVwID0gbmV3IFBvcHVwIGl0ZW1zOml0ZW1zLCBwYXJlbnQ6QCwgeDpici5sZWZ0K2JyLndpZHRoLCB5OmJyLnRvcCwgc2VsZWN0Rmlyc3RJdGVtOm9wdD8uc2VsZWN0Rmlyc3RJdGVtXG5cbiAgICBjbG9zZVBvcHVwOiAtPlxuICAgICAgICBcbiAgICAgICAgQHBvcHVwPy5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICBkZWxldGUgQHBvcHVwXG5cbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgbmF2aWdhdGVMZWZ0OiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQHBvcHVwIFxuICAgICAgICAgICAgQGNsb3NlUG9wdXAoKVxuICAgICAgICBlbHNlIGlmIG0gPSBAcGFyZW50TWVudSgpXG4gICAgICAgICAgICBtLm5hdmlnYXRlTGVmdCgpXG4gICAgICAgIGVsc2UgaWYgQHBhcmVudFxuICAgICAgICAgICAgQGNsb3NlIGZvY3VzOmZhbHNlXG5cbiAgICBhY3RpdmF0ZU9yTmF2aWdhdGVSaWdodDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBzZWxlY3RlZD9cbiAgICAgICAgICAgIGlmIG5vdCBAc2VsZWN0ZWQuaXRlbS5tZW51XG4gICAgICAgICAgICAgICAgQGFjdGl2YXRlIEBzZWxlY3RlZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBuYXZpZ2F0ZVJpZ2h0KClcbiAgICAgICAgICAgIFxuICAgIG5hdmlnYXRlUmlnaHQ6IC0+XG4gICAgICAgIGlmIEBwb3B1cFxuICAgICAgICAgICAgQHBvcHVwLnNlbGVjdCBAcG9wdXAuaXRlbXMuZmlyc3RDaGlsZFxuICAgICAgICBlbHNlIGlmIEBzZWxlY3RlZD8uaXRlbS5tZW51XG4gICAgICAgICAgICBAc2VsZWN0IEBzZWxlY3RlZCwgc2VsZWN0Rmlyc3RJdGVtOnRydWVcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIEBwYXJlbnRNZW51KCk/Lm5hdmlnYXRlUmlnaHQoKVxuICAgICAgICAgICAgXG4gICAgcGFyZW50TWVudTogLT4gXG4gICAgICAgIGlmIEBwYXJlbnQ/IGFuZCBub3QgQHBhcmVudC5wYXJlbnRcbiAgICAgICAgICAgIEBwYXJlbnRcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgICAwICAgICAgXG4gICAgXG4gICAgbmV4dEl0ZW06IC0+XG4gICAgICAgIGlmIG5leHQgPSBAc2VsZWN0ZWRcbiAgICAgICAgICAgIHdoaWxlIG5leHQgPSBuZXh0Lm5leHRTaWJsaW5nXG4gICAgICAgICAgICAgICAgaWYgbm90IGVtcHR5IG5leHQuaXRlbT8udGV4dFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dFxuICAgIFxuICAgIHByZXZJdGVtOiAtPlxuICAgICAgICBpZiBwcmV2ID0gQHNlbGVjdGVkXG4gICAgICAgICAgICB3aGlsZSBwcmV2ID0gcHJldi5wcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICBpZiBub3QgZW1wdHkgcHJldi5pdGVtPy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2XG4gICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBhY3RpdmF0ZTogKGl0ZW0pID0+XG5cbiAgICAgICAgaWYgaXRlbS5pdGVtPy5jYj9cbiAgICAgICAgICAgIEBjbG9zZSBhbGw6dHJ1ZVxuICAgICAgICAgICAgaXRlbS5pdGVtLmNiIGl0ZW0uaXRlbS5hcmcgPyBpdGVtLml0ZW0udGV4dFxuICAgICAgICBlbHNlIGlmIG5vdCBpdGVtLml0ZW0ubWVudVxuICAgICAgICAgICAgQGNsb3NlIGFsbDp0cnVlXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ21lbnVBY3Rpb24nIGl0ZW0uaXRlbS5hY3Rpb24gPyBpdGVtLml0ZW0udGV4dCwgaXRlbS5pdGVtXG5cbiAgICB0b2dnbGU6IChpdGVtKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQHBvcHVwXG4gICAgICAgICAgICBAcG9wdXAuY2xvc2UgZm9jdXM6ZmFsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbGVjdCBpdGVtLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIFxuICAgICAgICAgICAgXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PiBcbiAgICBcbiAgICAgICAgaXRlbSA9IGVsZW0udXBFbGVtIGV2ZW50LnRhcmdldCwgcHJvcDonaXRlbSdcbiAgICAgICAgaWYgaXRlbVxuICAgICAgICAgICAgQHNlbGVjdCBpdGVtLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2UgICBcblxuICAgIG9uQ2xpY2s6IChldmVudCkgPT4gXG5cbiAgICAgICAgc3RvcEV2ZW50IGV2ZW50IFxuICAgICAgICBcbiAgICAgICAgaXRlbSA9IGVsZW0udXBFbGVtIGV2ZW50LnRhcmdldCwgcHJvcDonaXRlbSdcbiAgICAgICAgaWYgaXRlbVxuICAgICAgICAgICAgaWYgaXRlbS5pdGVtLm1lbnVcbiAgICAgICAgICAgICAgICBAdG9nZ2xlIGl0ZW1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAYWN0aXZhdGUgaXRlbVxuICAgICAgICAgICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gc3RvcEV2ZW50IGV2ZW50ICMgcHJldmVudHMgbXVsdGlwbGUgcG9wdXBzXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBmb2N1czogLT4gQGl0ZW1zPy5mb2N1cygpXG4gICAgXG4gICAgb25Gb2N1c091dDogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBldmVudC5yZWxhdGVkVGFyZ2V0Py5jbGFzc0xpc3QuY29udGFpbnMgJ3BvcHVwJ1xuICAgICAgICAgICAgQGNsb3NlIGFsbDp0cnVlLCBmb2N1czpmYWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25LZXlEb3duOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdlbmQnICdwYWdlIGRvd24nIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBpdGVtcy5sYXN0Q2hpbGQsIHNlbGVjdEZpcnN0SXRlbTpmYWxzZSBcbiAgICAgICAgICAgIHdoZW4gJ2hvbWUnICdwYWdlIHVwJyAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBzZWxlY3QgQGl0ZW1zLmZpcnN0Q2hpbGQsIHNlbGVjdEZpcnN0SXRlbTpmYWxzZSBcbiAgICAgICAgICAgIHdoZW4gJ2VzYycgICAgICAgICAgICAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBjbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBuZXh0SXRlbSgpLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2UgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBwcmV2SXRlbSgpLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2UgXG4gICAgICAgICAgICB3aGVuICdlbnRlcicgJ3NwYWNlJyAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAYWN0aXZhdGVPck5hdmlnYXRlUmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQG5hdmlnYXRlTGVmdCgpXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAbmF2aWdhdGVSaWdodCgpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gbWVudTogKG9wdCkgLT4gbmV3IFBvcHVwIG9wdFxuIl19
//# sourceURL=../coffee/popup.coffee