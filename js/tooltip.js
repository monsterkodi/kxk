// koffee 0.42.0

/*
000000000   0000000    0000000   000      000000000  000  00000000 
   000     000   000  000   000  000         000     000  000   000
   000     000   000  000   000  000         000     000  00000000 
   000     000   000  000   000  000         000     000  000      
   000      0000000    0000000   0000000     000     000  000
 */
var $, Tooltip, _, elem, empty, kerror, pos, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), elem = ref.elem, pos = ref.pos, empty = ref.empty, kerror = ref.kerror, $ = ref.$, _ = ref._;

Tooltip = (function() {
    function Tooltip(opt) {
        var base, base1, ref1;
        this.opt = opt;
        this.onLeave = bind(this.onLeave, this);
        this.popup = bind(this.popup, this);
        this.onHover = bind(this.onHover, this);
        this.del = bind(this.del, this);
        if (!((ref1 = this.opt) != null ? ref1.elem : void 0)) {
            return kerror("no elem for tooltip?");
        }
        if ((base = this.opt).delay != null) {
            base.delay;
        } else {
            base.delay = 700;
        }
        if ((base1 = this.opt).html != null) {
            base1.html;
        } else {
            base1.html = this.opt.text;
        }
        this.elem = this.opt.elem;
        if (_.isString(this.opt.elem)) {
            this.elem = $(this.opt.elem);
        }
        this.elem.tooltip = this;
        this.elem.addEventListener('mouseenter', this.onHover);
        this.elem.addEventListener('DOMNodeRemoved', this.del);
    }

    Tooltip.prototype.del = function(event) {
        if (this.opt.keep) {
            return;
        }
        if (this.elem == null) {
            return;
        }
        if (empty(event) || (event != null ? event.target : void 0) === this.elem) {
            delete this.elem.tooltip;
            this.onLeave();
            this.elem.removeEventListener('DOMNodeRemoved', this.del);
            return this.elem = null;
        }
    };

    Tooltip.prototype.onHover = function(event) {
        if (this.elem == null) {
            return;
        }
        if (this.div != null) {
            return;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(this.popup, this.opt.delay);
        this.elem.addEventListener('mouseleave', this.onLeave);
        return this.elem.addEventListener('mousedown', this.onLeave);
    };

    Tooltip.prototype.popup = function(event) {
        var br;
        if (this.elem == null) {
            return;
        }
        if (this.div != null) {
            return;
        }
        this.div = elem({
            id: 'tooltip',
            "class": 'tooltip',
            html: this.opt.html
        });
        if (this.opt.parent) {
            this.opt.parent.appendChild(this.div);
        } else {
            document.body.appendChild(this.div);
        }
        br = this.elem.getBoundingClientRect();
        this.div.style.transform = "scaleY(1)";
        this.div.style.opacity = '1';
        if (this.opt.textSize != null) {
            this.div.style.fontSize = this.opt.textSize + "px";
        }
        if (this.opt.x != null) {
            this.div.style.left = (br.left + this.opt.x) + "px";
        }
        if (this.opt.y != null) {
            return this.div.style.top = (br.bottom + this.opt.y) + "px";
        }
    };

    Tooltip.prototype.onLeave = function(event, e) {
        var ref1;
        if (this.elem != null) {
            this.elem.removeEventListener('mouseleave', this.onLeave);
            this.elem.removeEventListener('mousedown', this.onLeave);
        }
        clearTimeout(this.timer);
        this.timer = null;
        if ((ref1 = this.div) != null) {
            ref1.remove();
        }
        return this.div = null;
    };

    return Tooltip;

})();

module.exports = Tooltip;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNENBQUE7SUFBQTs7QUFRQSxNQUFxQyxPQUFBLENBQVEsT0FBUixDQUFyQyxFQUFFLGVBQUYsRUFBUSxhQUFSLEVBQWEsaUJBQWIsRUFBb0IsbUJBQXBCLEVBQTRCLFNBQTVCLEVBQStCOztBQUV6QjtJQUVXLGlCQUFDLEdBQUQ7QUFFVCxZQUFBO1FBRlUsSUFBQyxDQUFBLE1BQUQ7Ozs7O1FBRVYsSUFBd0Msa0NBQVEsQ0FBRSxjQUFsRDtBQUFBLG1CQUFPLE1BQUEsQ0FBTyxzQkFBUCxFQUFQOzs7Z0JBRUksQ0FBQzs7Z0JBQUQsQ0FBQyxRQUFTOzs7aUJBQ1YsQ0FBQzs7aUJBQUQsQ0FBQyxPQUFTLElBQUMsQ0FBQSxHQUFHLENBQUM7O1FBRW5CLElBQUMsQ0FBQSxJQUFELEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUNkLElBQXNCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFoQixDQUF0QjtZQUFBLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBUCxFQUFQOztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixHQUFnQjtRQUVoQixJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFlBQXZCLEVBQXFDLElBQUMsQ0FBQSxPQUF0QztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsZ0JBQXZCLEVBQXlDLElBQUMsQ0FBQSxHQUExQztJQVpTOztzQkFjYixHQUFBLEdBQUssU0FBQyxLQUFEO1FBRUQsSUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWY7QUFBQSxtQkFBQTs7UUFDQSxJQUFjLGlCQUFkO0FBQUEsbUJBQUE7O1FBRUEsSUFBRyxLQUFBLENBQU0sS0FBTixDQUFBLHFCQUFn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bjAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAwMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICBcbiMjI1xuXG57IGVsZW0sIHBvcywgZW1wdHksIGtlcnJvciwgJCwgXyB9ID0gcmVxdWlyZSAnLi9reGsnXG5cbmNsYXNzIFRvb2x0aXBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKEBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ga2Vycm9yIFwibm8gZWxlbSBmb3IgdG9vbHRpcD9cIiBpZiBub3QgQG9wdD8uZWxlbVxuICAgICAgICBcbiAgICAgICAgQG9wdC5kZWxheSA/PSA3MDBcbiAgICAgICAgQG9wdC5odG1sICA/PSBAb3B0LnRleHRcbiAgICAgICAgXG4gICAgICAgIEBlbGVtID0gIEBvcHQuZWxlbVxuICAgICAgICBAZWxlbSA9JCBAb3B0LmVsZW0gaWYgXy5pc1N0cmluZyBAb3B0LmVsZW1cbiAgICAgICAgQGVsZW0udG9vbHRpcCA9IEAgICAgICBcblxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWVudGVyJywgQG9uSG92ZXJcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnRE9NTm9kZVJlbW92ZWQnLCBAZGVsXG5cbiAgICBkZWw6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgQG9wdC5rZWVwXG4gICAgICAgIHJldHVybiBpZiBub3QgQGVsZW0/XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eShldmVudCkgb3IgZXZlbnQ/LnRhcmdldCA9PSBAZWxlbVxuICAgICAgICAgICAgZGVsZXRlIEBlbGVtLnRvb2x0aXBcbiAgICAgICAgICAgIEBvbkxlYXZlKClcbiAgICAgICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ0RPTU5vZGVSZW1vdmVkJywgQGRlbFxuICAgICAgICAgICAgQGVsZW0gPSBudWxsXG5cbiAgICBvbkhvdmVyOiAoZXZlbnQpID0+XG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbT9cbiAgICAgICAgcmV0dXJuIGlmIEBkaXY/XG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHBvcHVwLCBAb3B0LmRlbGF5XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWxlYXZlJywgQG9uTGVhdmVcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgIEBvbkxlYXZlXG5cbiAgICBwb3B1cDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbT9cbiAgICAgICAgcmV0dXJuIGlmIEBkaXY/XG4gICAgICAgIEBkaXYgPSBlbGVtIGlkOid0b29sdGlwJywgY2xhc3M6J3Rvb2x0aXAnLCBodG1sOiBAb3B0Lmh0bWxcbiAgICAgICAgaWYgQG9wdC5wYXJlbnRcbiAgICAgICAgICAgIEBvcHQucGFyZW50LmFwcGVuZENoaWxkIEBkaXZcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBAZGl2XG4gICAgICAgIGJyID0gQGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgQGRpdi5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlWSgxKVwiXG4gICAgICAgIEBkaXYuc3R5bGUub3BhY2l0eSA9ICcxJ1xuICAgICAgICBAZGl2LnN0eWxlLmZvbnRTaXplID0gXCIje0BvcHQudGV4dFNpemV9cHhcIiBpZiBAb3B0LnRleHRTaXplP1xuICAgICAgICBAZGl2LnN0eWxlLmxlZnQgPSBcIiN7YnIubGVmdCArIEBvcHQueH1weFwiIGlmIEBvcHQueD9cbiAgICAgICAgQGRpdi5zdHlsZS50b3AgPSBcIiN7YnIuYm90dG9tICsgQG9wdC55fXB4XCIgaWYgQG9wdC55P1xuICAgICAgICBcbiAgICBvbkxlYXZlOiAoZXZlbnQsIGUpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBAZWxlbT9cbiAgICAgICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdtb3VzZWxlYXZlJywgQG9uTGVhdmVcbiAgICAgICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdtb3VzZWRvd24nLCAgQG9uTGVhdmVcbiAgICAgICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIEB0aW1lciA9IG51bGxcbiAgICAgICAgQGRpdj8ucmVtb3ZlKClcbiAgICAgICAgQGRpdiA9IG51bGxcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2x0aXBcbiJdfQ==
//# sourceURL=../coffee/tooltip.coffee