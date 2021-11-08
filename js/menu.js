// koffee 1.19.0

/*
00     00  00000000  000   000  000   000  
000   000  000       0000  000  000   000  
000000000  0000000   000 0 000  000   000  
000 0 000  000       000  0000  000   000  
000   000  00000000  000   000   0000000
 */
var Menu, elem, keyinfo, popup, ref, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), elem = ref.elem, keyinfo = ref.keyinfo, popup = ref.popup, stopEvent = ref.stopEvent;

Menu = (function() {
    function Menu(opt) {
        this.onClick = bind(this.onClick, this);
        this.onKeyDown = bind(this.onKeyDown, this);
        this.close = bind(this.close, this);
        this.onFocusOut = bind(this.onFocusOut, this);
        this.onHover = bind(this.onHover, this);
        this.blur = bind(this.blur, this);
        this.focus = bind(this.focus, this);
        var combo, div, i, item, len, ref1;
        this.elem = elem({
            "class": 'menu',
            tabindex: 3
        });
        ref1 = opt.items;
        for (i = 0, len = ref1.length; i < len; i++) {
            item = ref1[i];
            if (item.hide) {
                continue;
            }
            div = elem({
                "class": 'menuItem',
                text: item.text
            });
            div.item = item;
            div.addEventListener('click', this.onClick);
            if (item.combo != null) {
                combo = elem('span', {
                    "class": 'popupCombo',
                    text: keyinfo.short(item.combo)
                });
                div.appendChild(combo);
            }
            this.elem.appendChild(div);
        }
        this.select(this.elem.firstChild);
        this.elem.addEventListener('keydown', this.onKeyDown);
        this.elem.addEventListener('focusout', this.onFocusOut);
        this.elem.addEventListener('mouseover', this.onHover);
    }

    Menu.prototype.del = function() {
        var ref1;
        this.close();
        if ((ref1 = this.elem) != null) {
            ref1.remove();
        }
        return this.elem = null;
    };

    Menu.prototype.focus = function() {
        this.focusElem = document.activeElement;
        return this.elem.focus();
    };

    Menu.prototype.blur = function() {
        var ref1;
        this.close();
        return (ref1 = this.focusElem) != null ? typeof ref1.focus === "function" ? ref1.focus() : void 0 : void 0;
    };

    Menu.prototype.onHover = function(event) {
        return this.select(event.target, {
            selectFirstItem: false
        });
    };

    Menu.prototype.onFocusOut = function(event) {
        var ref1;
        if (this.popup && !((ref1 = event.relatedTarget) != null ? ref1.classList.contains('popup') : void 0)) {
            this.popup.close({
                focus: false
            });
            return delete this.popup;
        }
    };

    Menu.prototype.open = function() {
        return this.select(this.elem.firstChild, {
            activate: true
        });
    };

    Menu.prototype.close = function(opt) {
        var ref1;
        if (opt == null) {
            opt = {};
        }
        if (this.popup != null) {
            this.popup.close({
                focus: false
            });
            delete this.popup;
            if (opt.focus !== false) {
                return this.elem.focus();
            }
        } else {
            if (opt.focus !== false) {
                return (ref1 = this.focusElem) != null ? typeof ref1.focus === "function" ? ref1.focus() : void 0 : void 0;
            }
        }
    };

    Menu.prototype.childClosed = function(child, opt) {
        if (child === this.popup) {
            delete this.popup;
            if (opt.focus !== false) {
                return this.elem.focus();
            }
        }
    };

    Menu.prototype.select = function(item, opt) {
        var hadPopup, ref1;
        if (opt == null) {
            opt = {};
        }
        if (item == null) {
            return;
        }
        if (this.popup != null) {
            hadPopup = true;
            this.popup.close({
                focus: false
            });
        }
        if ((ref1 = this.selected) != null) {
            ref1.classList.remove('selected');
        }
        this.selected = item;
        this.selected.classList.add('selected');
        if (hadPopup || opt.activate) {
            delete this.popup;
            return this.activate(item, opt);
        }
    };

    Menu.prototype.activate = function(item, opt) {
        var br, items, pr;
        if (opt == null) {
            opt = {};
        }
        items = item.item.menu;
        if (items) {
            if (this.popup) {
                this.popup.close({
                    focus: false
                });
                delete this.popup;
            }
            br = item.getBoundingClientRect();
            pr = item.parentNode.getBoundingClientRect();
            opt.items = items;
            opt.parent = this;
            opt.x = br.left;
            opt.y = pr.top + pr.height;
            opt["class"] = 'titlemenu';
            this.popup = popup.menu(opt);
            if (opt.selectFirstItem === false) {
                return this.elem.focus();
            }
        }
    };

    Menu.prototype.toggle = function(item) {
        if (this.popup) {
            this.popup.close({
                focus: false
            });
            return delete this.popup;
        } else {
            return this.activate(item, {
                selectFirstItem: false
            });
        }
    };

    Menu.prototype.itemSelected = function(item, elem) {};

    Menu.prototype.deactivate = function(item) {};

    Menu.prototype.navigateLeft = function() {
        var ref1;
        return this.select((ref1 = this.selected) != null ? ref1.previousSibling : void 0, {
            activate: true,
            selectFirstItem: false
        });
    };

    Menu.prototype.navigateRight = function() {
        var ref1;
        return this.select((ref1 = this.selected) != null ? ref1.nextSibling : void 0, {
            activate: true,
            selectFirstItem: false
        });
    };

    Menu.prototype.onKeyDown = function(event) {
        var combo, key, mod, ref1;
        ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo;
        switch (combo) {
            case 'end':
            case 'page down':
                return stopEvent(event, this.select(this.elem.lastChild, {
                    activate: true,
                    selectFirstItem: false
                }));
            case 'home':
            case 'page up':
                return stopEvent(event, this.select(this.elem.firstChild, {
                    activate: true,
                    selectFirstItem: false
                }));
            case 'enter':
            case 'down':
            case 'space':
                return stopEvent(event, this.activate(this.selected));
            case 'esc':
                return stopEvent(event, this.close());
            case 'right':
                return stopEvent(event, this.navigateRight());
            case 'left':
                return stopEvent(event, this.navigateLeft());
        }
    };

    Menu.prototype.onClick = function(e) {
        return this.toggle(e.target);
    };

    return Menu;

})();

module.exports = Menu;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbIm1lbnUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBDQUFBO0lBQUE7O0FBUUEsTUFBc0MsT0FBQSxDQUFRLE9BQVIsQ0FBdEMsRUFBRSxlQUFGLEVBQVEscUJBQVIsRUFBaUIsaUJBQWpCLEVBQXdCOztBQUVsQjtJQUVDLGNBQUMsR0FBRDs7Ozs7Ozs7QUFFQyxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLE1BQU47WUFBYSxRQUFBLEVBQVMsQ0FBdEI7U0FBTDtBQUVSO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFZLElBQUksQ0FBQyxJQUFqQjtBQUFBLHlCQUFBOztZQUNBLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFQO2dCQUFrQixJQUFBLEVBQU0sSUFBSSxDQUFDLElBQTdCO2FBQUw7WUFDTixHQUFHLENBQUMsSUFBSixHQUFXO1lBQ1gsR0FBRyxDQUFDLGdCQUFKLENBQXFCLE9BQXJCLEVBQTZCLElBQUMsQ0FBQSxPQUE5QjtZQUNBLElBQUcsa0JBQUg7Z0JBQ0ksS0FBQSxHQUFRLElBQUEsQ0FBSyxNQUFMLEVBQVk7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixJQUFBLEVBQU0sT0FBTyxDQUFDLEtBQVIsQ0FBYyxJQUFJLENBQUMsS0FBbkIsQ0FBekI7aUJBQVo7Z0JBQ1IsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsS0FBaEIsRUFGSjs7WUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7QUFSSjtRQVVBLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFkO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixTQUF2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THpDLGlCQU1TLE9BTlQ7dUJBTXlDLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBakI7QUFOekMsaUJBT1MsTUFQVDt1QkFPeUMsU0FBQSxDQUFVLEtBQVYsRUFBaUIsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFqQjtBQVB6QztJQUpPOzttQkFhWCxPQUFBLEdBQVMsU0FBQyxDQUFEO2VBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFDLENBQUMsTUFBVjtJQUFQOzs7Ozs7QUFFYixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgZWxlbSwga2V5aW5mbywgcG9wdXAsIHN0b3BFdmVudCB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIE1lbnVcbiAgICBcbiAgICBAOiAob3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgQGVsZW0gPSBlbGVtIGNsYXNzOidtZW51JyB0YWJpbmRleDozXG4gICAgICAgIFxuICAgICAgICBmb3IgaXRlbSBpbiBvcHQuaXRlbXNcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGl0ZW0uaGlkZVxuICAgICAgICAgICAgZGl2ID0gZWxlbSBjbGFzczogJ21lbnVJdGVtJyB0ZXh0OiBpdGVtLnRleHRcbiAgICAgICAgICAgIGRpdi5pdGVtID0gaXRlbVxuICAgICAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyBAb25DbGlja1xuICAgICAgICAgICAgaWYgaXRlbS5jb21ibz9cbiAgICAgICAgICAgICAgICBjb21ibyA9IGVsZW0gJ3NwYW4nIGNsYXNzOidwb3B1cENvbWJvJyB0ZXh0OiBrZXlpbmZvLnNob3J0IGl0ZW0uY29tYm9cbiAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQgY29tYm9cbiAgICAgICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIGRpdlxuXG4gICAgICAgIEBzZWxlY3QgQGVsZW0uZmlyc3RDaGlsZFxuICAgICAgICAgICAgXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nICAgQG9uS2V5RG93blxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdmb2N1c291dCcgIEBvbkZvY3VzT3V0XG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlb3ZlcicgQG9uSG92ZXJcbiAgICAgICAgXG4gICAgZGVsOiAtPlxuICAgICAgICBcbiAgICAgICAgQGNsb3NlKClcbiAgICAgICAgQGVsZW0/LnJlbW92ZSgpXG4gICAgICAgIEBlbGVtID0gbnVsbFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBmb2N1czogPT4gXG4gICAgICAgIFxuICAgICAgICBAZm9jdXNFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgICAgICBAZWxlbS5mb2N1cygpXG4gICAgICAgIFxuICAgIGJsdXI6ID0+IEBjbG9zZSgpOyBAZm9jdXNFbGVtPy5mb2N1cz8oKVxuICAgIFxuICAgIG9uSG92ZXI6IChldmVudCkgPT4gQHNlbGVjdCBldmVudC50YXJnZXQsIHNlbGVjdEZpcnN0SXRlbTpmYWxzZVxuICAgIFxuICAgIG9uRm9jdXNPdXQ6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAcG9wdXAgYW5kIG5vdCBldmVudC5yZWxhdGVkVGFyZ2V0Py5jbGFzc0xpc3QuY29udGFpbnMgJ3BvcHVwJ1xuICAgICAgICAgICAgQHBvcHVwLmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgICAgICBkZWxldGUgQHBvcHVwXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbjogLT4gQHNlbGVjdCBAZWxlbS5maXJzdENoaWxkLCBhY3RpdmF0ZTp0cnVlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNsb3NlOiAob3B0PXt9KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQHBvcHVwP1xuICAgICAgICAgICAgQHBvcHVwLmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgICAgICBkZWxldGUgQHBvcHVwXG4gICAgICAgICAgICBpZiBvcHQuZm9jdXMgIT0gZmFsc2VcbiAgICAgICAgICAgICAgICBAZWxlbS5mb2N1cygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIG9wdC5mb2N1cyAhPSBmYWxzZVxuICAgICAgICAgICAgICAgIEBmb2N1c0VsZW0/LmZvY3VzPygpXG4gICAgICAgICAgICBcbiAgICBjaGlsZENsb3NlZDogKGNoaWxkLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaGlsZCA9PSBAcG9wdXBcbiAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgICAgIGlmIG9wdC5mb2N1cyAhPSBmYWxzZVxuICAgICAgICAgICAgICAgIEBlbGVtLmZvY3VzKClcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2VsZWN0OiAoaXRlbSwgb3B0PXt9KSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaXRlbT9cbiAgICAgICAgXG4gICAgICAgIGlmIEBwb3B1cD9cbiAgICAgICAgICAgIGhhZFBvcHVwID0gdHJ1ZVxuICAgICAgICAgICAgQHBvcHVwLmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgIFxuICAgICAgICBAc2VsZWN0ZWQ/LmNsYXNzTGlzdC5yZW1vdmUgJ3NlbGVjdGVkJ1xuICAgICAgICBAc2VsZWN0ZWQgPSBpdGVtXG4gICAgICAgIEBzZWxlY3RlZC5jbGFzc0xpc3QuYWRkICdzZWxlY3RlZCdcbiAgICAgICAgXG4gICAgICAgIGlmIGhhZFBvcHVwIG9yIG9wdC5hY3RpdmF0ZVxuICAgICAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgICAgICAgICAgQGFjdGl2YXRlIGl0ZW0sIG9wdFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGFjdGl2YXRlOiAoaXRlbSwgb3B0PXt9KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGl0ZW1zID0gaXRlbS5pdGVtLm1lbnVcbiAgICAgICAgXG4gICAgICAgIGlmIGl0ZW1zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBwb3B1cFxuICAgICAgICAgICAgICAgIEBwb3B1cC5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcblxuICAgICAgICAgICAgYnIgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBwciA9IGl0ZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgb3B0Lml0ZW1zID0gaXRlbXNcbiAgICAgICAgICAgIG9wdC5wYXJlbnQgPSBAXG4gICAgICAgICAgICBvcHQueCA9IGJyLmxlZnRcbiAgICAgICAgICAgIG9wdC55ID0gcHIudG9wK3ByLmhlaWdodFxuICAgICAgICAgICAgb3B0LmNsYXNzID0gJ3RpdGxlbWVudSdcbiAgICAgICAgICAgIEBwb3B1cCA9IHBvcHVwLm1lbnUgb3B0XG4gICAgICAgICAgICBpZiBvcHQuc2VsZWN0Rmlyc3RJdGVtID09IGZhbHNlXG4gICAgICAgICAgICAgICAgQGVsZW0uZm9jdXMoKVxuXG4gICAgdG9nZ2xlOiAoaXRlbSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBwb3B1cFxuICAgICAgICAgICAgQHBvcHVwLmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgICAgICBkZWxldGUgQHBvcHVwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBhY3RpdmF0ZSBpdGVtLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICAgICAgICAgIFxuICAgIGl0ZW1TZWxlY3RlZDogKGl0ZW0sIGVsZW0pIC0+XG4gICAgICAgICAgICBcbiAgICBkZWFjdGl2YXRlOiAoaXRlbSkgLT4gXG5cbiAgICBuYXZpZ2F0ZUxlZnQ6ICAtPiBAc2VsZWN0IEBzZWxlY3RlZD8ucHJldmlvdXNTaWJsaW5nLCBhY3RpdmF0ZTp0cnVlLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICBuYXZpZ2F0ZVJpZ2h0OiAtPiBAc2VsZWN0IEBzZWxlY3RlZD8ubmV4dFNpYmxpbmcsICAgICBhY3RpdmF0ZTp0cnVlLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uS2V5RG93bjogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgeyBtb2QsIGtleSwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdlbmQnLCAncGFnZSBkb3duJyAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBlbGVtLmxhc3RDaGlsZCwgIGFjdGl2YXRlOnRydWUsIHNlbGVjdEZpcnN0SXRlbTpmYWxzZVxuICAgICAgICAgICAgd2hlbiAnaG9tZScsICdwYWdlIHVwJyAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQHNlbGVjdCBAZWxlbS5maXJzdENoaWxkLCBhY3RpdmF0ZTp0cnVlLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJywgJ2Rvd24nLCAnc3BhY2UnICAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBhY3RpdmF0ZSBAc2VsZWN0ZWRcbiAgICAgICAgICAgIHdoZW4gJ2VzYycgICAgICAgICAgICAgICAgICAgICAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBjbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgICAgICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAbmF2aWdhdGVSaWdodCgpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgICAgICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAbmF2aWdhdGVMZWZ0KClcbiAgICAgICAgICAgIFxuICAgIG9uQ2xpY2s6IChlKSA9PiBAdG9nZ2xlIGUudGFyZ2V0XG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBNZW51XG4iXX0=
//# sourceURL=../coffee/menu.coffee