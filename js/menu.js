// koffee 1.4.0

/*
00     00  00000000  000   000  000   000  
000   000  000       0000  000  000   000  
000000000  0000000   000 0 000  000   000  
000 0 000  000       000  0000  000   000  
000   000  00000000  000   000   0000000
 */
var Menu, elem, keyinfo, popup, post, ref, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), post = ref.post, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, popup = ref.popup, elem = ref.elem;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0RBQUE7SUFBQTs7QUFRQSxNQUE0QyxPQUFBLENBQVEsT0FBUixDQUE1QyxFQUFFLGVBQUYsRUFBUSx5QkFBUixFQUFtQixxQkFBbkIsRUFBNEIsaUJBQTVCLEVBQW1DOztBQUU3QjtJQUVDLGNBQUMsR0FBRDs7Ozs7Ozs7QUFFQyxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7WUFBZSxRQUFBLEVBQVUsQ0FBekI7U0FBTDtBQUVSO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFZLElBQUksQ0FBQyxJQUFqQjtBQUFBLHlCQUFBOztZQUNBLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFQO2dCQUFtQixJQUFBLEVBQU0sSUFBSSxDQUFDLElBQTlCO2FBQUw7WUFDTixHQUFHLENBQUMsSUFBSixHQUFXO1lBQ1gsR0FBRyxDQUFDLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCLElBQUMsQ0FBQSxPQUEvQjtZQUNBLElBQUcsa0JBQUg7Z0JBQ0ksS0FBQSxHQUFRLElBQUEsQ0FBSyxNQUFMLEVBQWE7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO29CQUFxQixJQUFBLEVBQU0sT0FBTyxDQUFDLEtBQVIsQ0FBYyxJQUFJLENBQUMsS0FBbkIsQ0FBM0I7aUJBQWI7Z0JBQ1IsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsS0FBaEIsRUFGSjs7WUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7QUFSSjtRQVVBLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFkO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixTQUF2QixFQUFv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QUMsQ0FBQSxZQUFELENBQUEsQ0FBakI7QUFQekM7SUFKTzs7bUJBYVgsT0FBQSxHQUFTLFNBQUMsQ0FBRDtlQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBQyxDQUFDLE1BQVY7SUFBUDs7Ozs7O0FBRWIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbjAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiMjI1xuXG57IHBvc3QsIHN0b3BFdmVudCwga2V5aW5mbywgcG9wdXAsIGVsZW0gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBNZW51XG4gICAgXG4gICAgQDogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBlbGVtID0gZWxlbSBjbGFzczogJ21lbnUnLCB0YWJpbmRleDogM1xuICAgICAgICBcbiAgICAgICAgZm9yIGl0ZW0gaW4gb3B0Lml0ZW1zXG4gICAgICAgICAgICBjb250aW51ZSBpZiBpdGVtLmhpZGVcbiAgICAgICAgICAgIGRpdiA9IGVsZW0gY2xhc3M6ICdtZW51SXRlbScsIHRleHQ6IGl0ZW0udGV4dFxuICAgICAgICAgICAgZGl2Lml0ZW0gPSBpdGVtXG4gICAgICAgICAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCBAb25DbGlja1xuICAgICAgICAgICAgaWYgaXRlbS5jb21ibz9cbiAgICAgICAgICAgICAgICBjb21ibyA9IGVsZW0gJ3NwYW4nLCBjbGFzczogJ3BvcHVwQ29tYm8nLCB0ZXh0OiBrZXlpbmZvLnNob3J0IGl0ZW0uY29tYm9cbiAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQgY29tYm9cbiAgICAgICAgICAgIEBlbGVtLmFwcGVuZENoaWxkIGRpdlxuXG4gICAgICAgIEBzZWxlY3QgQGVsZW0uZmlyc3RDaGlsZFxuICAgICAgICAgICAgXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAgIEBvbktleURvd25cbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZm9jdXNvdXQnLCAgQG9uRm9jdXNPdXRcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgQG9uSG92ZXJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZm9jdXM6ID0+IFxuICAgICAgICBcbiAgICAgICAgQGZvY3VzRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgICAgQGVsZW0uZm9jdXMoKVxuICAgICAgICBcbiAgICBibHVyOiA9PiBAY2xvc2UoKTsgQGZvY3VzRWxlbT8uZm9jdXM/KClcbiAgICBcbiAgICBvbkhvdmVyOiAoZXZlbnQpID0+IEBzZWxlY3QgZXZlbnQudGFyZ2V0LCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICBcbiAgICBvbkZvY3VzT3V0OiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgQHBvcHVwIGFuZCBub3QgZXZlbnQucmVsYXRlZFRhcmdldD8uY2xhc3NMaXN0LmNvbnRhaW5zICdwb3B1cCdcbiAgICAgICAgICAgIEBwb3B1cC5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9wZW46IC0+IEBzZWxlY3QgQGVsZW0uZmlyc3RDaGlsZCwgYWN0aXZhdGU6dHJ1ZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjbG9zZTogKG9wdD17fSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBwb3B1cD9cbiAgICAgICAgICAgIEBwb3B1cC5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgICAgICAgICAgaWYgb3B0LmZvY3VzICE9IGZhbHNlXG4gICAgICAgICAgICAgICAgQGVsZW0uZm9jdXMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBvcHQuZm9jdXMgIT0gZmFsc2VcbiAgICAgICAgICAgICAgICBAZm9jdXNFbGVtPy5mb2N1cz8oKVxuICAgICAgICAgICAgXG4gICAgY2hpbGRDbG9zZWQ6IChjaGlsZCwgb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2hpbGQgPT0gQHBvcHVwXG4gICAgICAgICAgICBkZWxldGUgQHBvcHVwXG4gICAgICAgICAgICBpZiBvcHQuZm9jdXMgIT0gZmFsc2VcbiAgICAgICAgICAgICAgICBAZWxlbS5mb2N1cygpXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNlbGVjdDogKGl0ZW0sIG9wdD17fSkgLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGl0ZW0/XG4gICAgICAgIFxuICAgICAgICBpZiBAcG9wdXA/XG4gICAgICAgICAgICBoYWRQb3B1cCA9IHRydWVcbiAgICAgICAgICAgIEBwb3B1cC5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICBcbiAgICAgICAgQHNlbGVjdGVkPy5jbGFzc0xpc3QucmVtb3ZlICdzZWxlY3RlZCdcbiAgICAgICAgQHNlbGVjdGVkID0gaXRlbVxuICAgICAgICBAc2VsZWN0ZWQuY2xhc3NMaXN0LmFkZCAnc2VsZWN0ZWQnXG4gICAgICAgIFxuICAgICAgICBpZiBoYWRQb3B1cCBvciBvcHQuYWN0aXZhdGVcbiAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgICAgIEBhY3RpdmF0ZSBpdGVtLCBvcHRcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBhY3RpdmF0ZTogKGl0ZW0sIG9wdD17fSkgLT4gXG4gICAgICAgIFxuICAgICAgICBpdGVtcyA9IGl0ZW0uaXRlbS5tZW51XG4gICAgICAgIFxuICAgICAgICBpZiBpdGVtc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAcG9wdXBcbiAgICAgICAgICAgICAgICBAcG9wdXAuY2xvc2UgZm9jdXM6ZmFsc2VcbiAgICAgICAgICAgICAgICBkZWxldGUgQHBvcHVwXG5cbiAgICAgICAgICAgIGJyID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgcHIgPSBpdGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIG9wdC5pdGVtcyA9IGl0ZW1zXG4gICAgICAgICAgICBvcHQucGFyZW50ID0gQFxuICAgICAgICAgICAgb3B0LnggPSBici5sZWZ0XG4gICAgICAgICAgICBvcHQueSA9IHByLnRvcCtwci5oZWlnaHRcbiAgICAgICAgICAgIG9wdC5jbGFzcyA9ICd0aXRsZW1lbnUnXG4gICAgICAgICAgICBAcG9wdXAgPSBwb3B1cC5tZW51IG9wdFxuICAgICAgICAgICAgaWYgb3B0LnNlbGVjdEZpcnN0SXRlbSA9PSBmYWxzZVxuICAgICAgICAgICAgICAgIEBlbGVtLmZvY3VzKClcblxuICAgIHRvZ2dsZTogKGl0ZW0pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAcG9wdXBcbiAgICAgICAgICAgIEBwb3B1cC5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYWN0aXZhdGUgaXRlbSwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlXG4gICAgICAgICAgICBcbiAgICBpdGVtU2VsZWN0ZWQ6IChpdGVtLCBlbGVtKSAtPlxuICAgICAgICAgICAgXG4gICAgZGVhY3RpdmF0ZTogKGl0ZW0pIC0+IFxuXG4gICAgbmF2aWdhdGVMZWZ0OiAgLT4gQHNlbGVjdCBAc2VsZWN0ZWQ/LnByZXZpb3VzU2libGluZywgYWN0aXZhdGU6dHJ1ZSwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlXG4gICAgbmF2aWdhdGVSaWdodDogLT4gQHNlbGVjdCBAc2VsZWN0ZWQ/Lm5leHRTaWJsaW5nLCAgICAgYWN0aXZhdGU6dHJ1ZSwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnZW5kJywgJ3BhZ2UgZG93bicgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQHNlbGVjdCBAZWxlbS5sYXN0Q2hpbGQsICBhY3RpdmF0ZTp0cnVlLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2VcbiAgICAgICAgICAgIHdoZW4gJ2hvbWUnLCAncGFnZSB1cCcgICAgICAgICAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBzZWxlY3QgQGVsZW0uZmlyc3RDaGlsZCwgYWN0aXZhdGU6dHJ1ZSwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlXG4gICAgICAgICAgICB3aGVuICdlbnRlcicsICdkb3duJywgJ3NwYWNlJyAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAYWN0aXZhdGUgQHNlbGVjdGVkXG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgICAgICAgICAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQG5hdmlnYXRlUmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgICAgICAgICAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQG5hdmlnYXRlTGVmdCgpXG4gICAgICAgICAgICBcbiAgICBvbkNsaWNrOiAoZSkgPT4gQHRvZ2dsZSBlLnRhcmdldFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gTWVudVxuIl19
//# sourceURL=../coffee/menu.coffee