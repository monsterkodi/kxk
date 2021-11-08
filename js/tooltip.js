// koffee 1.19.0

/*
000000000   0000000    0000000   000      000000000  000  00000000 
   000     000   000  000   000  000         000     000  000   000
   000     000   000  000   000  000         000     000  00000000 
   000     000   000  000   000  000         000     000  000      
   000      0000000    0000000   0000000     000     000  000
 */
var $, Tooltip, _, elem, empty, kerror, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), elem = ref.elem, empty = ref.empty, kerror = ref.kerror, $ = ref.$, _ = ref._;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRvb2x0aXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHVDQUFBO0lBQUE7O0FBUUEsTUFBZ0MsT0FBQSxDQUFRLE9BQVIsQ0FBaEMsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxtQkFBZixFQUF1QixTQUF2QixFQUEwQjs7QUFFcEI7SUFFQyxpQkFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxNQUFEOzs7OztRQUVBLElBQXdDLGtDQUFRLENBQUUsY0FBbEQ7QUFBQSxtQkFBTyxNQUFBLENBQU8sc0JBQVAsRUFBUDs7O2dCQUVJLENBQUM7O2dCQUFELENBQUMsUUFBUzs7O2lCQUNWLENBQUM7O2lCQUFELENBQUMsT0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDOztRQUVuQixJQUFDLENBQUEsSUFBRCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUM7UUFDZCxJQUFzQixDQUFDLENBQUMsUUFBRixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBaEIsQ0FBdEI7WUFBQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQVAsRUFBUDs7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sR0FBZ0I7UUFFaEIsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixZQUF2QixFQUFxQyxJQUFDLENBQUEsT0FBdEM7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLGdCQUF2QixFQUF5QyxJQUFDLENBQUEsR0FBMUM7SUFaRDs7c0JBY0gsR0FBQSxHQUFLLFNBQUMsS0FBRDtRQUVELElBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFmO0FBQUEsbUJBQUE7O1FBQ0EsSUFBYyxpQkFBZDtBQUFBLG1CQUFBOztRQUVBLElBQUcsS0FBQSxDQUFNLEtBQU4s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bnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwMDAwMDAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgXG4gICAwMDAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgXG4jIyNcblxueyBlbGVtLCBlbXB0eSwga2Vycm9yLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgVG9vbHRpcFxuICAgIFxuICAgIEA6IChAb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGtlcnJvciBcIm5vIGVsZW0gZm9yIHRvb2x0aXA/XCIgaWYgbm90IEBvcHQ/LmVsZW1cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGVsYXkgPz0gNzAwXG4gICAgICAgIEBvcHQuaHRtbCAgPz0gQG9wdC50ZXh0XG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9ICBAb3B0LmVsZW1cbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtIGlmIF8uaXNTdHJpbmcgQG9wdC5lbGVtXG4gICAgICAgIEBlbGVtLnRvb2x0aXAgPSBAICAgICAgXG5cbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VlbnRlcicsIEBvbkhvdmVyXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ0RPTU5vZGVSZW1vdmVkJywgQGRlbFxuXG4gICAgZGVsOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEBvcHQua2VlcFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtP1xuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkoZXZlbnQpIG9yIGV2ZW50Py50YXJnZXQgPT0gQGVsZW1cbiAgICAgICAgICAgIGRlbGV0ZSBAZWxlbS50b29sdGlwXG4gICAgICAgICAgICBAb25MZWF2ZSgpXG4gICAgICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICdET01Ob2RlUmVtb3ZlZCcsIEBkZWxcbiAgICAgICAgICAgIEBlbGVtID0gbnVsbFxuXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PlxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQGVsZW0/XG4gICAgICAgIHJldHVybiBpZiBAZGl2P1xuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBwb3B1cCwgQG9wdC5kZWxheVxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VsZWF2ZScsIEBvbkxlYXZlXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICBAb25MZWF2ZVxuXG4gICAgcG9wdXA6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGVsZW0/XG4gICAgICAgIHJldHVybiBpZiBAZGl2P1xuICAgICAgICBAZGl2ID0gZWxlbSBpZDondG9vbHRpcCcsIGNsYXNzOid0b29sdGlwJywgaHRtbDogQG9wdC5odG1sXG4gICAgICAgIGlmIEBvcHQucGFyZW50XG4gICAgICAgICAgICBAb3B0LnBhcmVudC5hcHBlbmRDaGlsZCBAZGl2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgQGRpdlxuICAgICAgICBiciA9IEBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIEBkaXYuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZVkoMSlcIlxuICAgICAgICBAZGl2LnN0eWxlLm9wYWNpdHkgPSAnMSdcbiAgICAgICAgQGRpdi5zdHlsZS5mb250U2l6ZSA9IFwiI3tAb3B0LnRleHRTaXplfXB4XCIgaWYgQG9wdC50ZXh0U2l6ZT9cbiAgICAgICAgQGRpdi5zdHlsZS5sZWZ0ID0gXCIje2JyLmxlZnQgKyBAb3B0Lnh9cHhcIiBpZiBAb3B0Lng/XG4gICAgICAgIEBkaXYuc3R5bGUudG9wID0gXCIje2JyLmJvdHRvbSArIEBvcHQueX1weFwiIGlmIEBvcHQueT9cbiAgICAgICAgXG4gICAgb25MZWF2ZTogKGV2ZW50LCBlKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQGVsZW0/XG4gICAgICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICAnbW91c2VsZWF2ZScsIEBvbkxlYXZlXG4gICAgICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICAnbW91c2Vkb3duJywgIEBvbkxlYXZlXG4gICAgICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBAdGltZXIgPSBudWxsXG4gICAgICAgIEBkaXY/LnJlbW92ZSgpXG4gICAgICAgIEBkaXYgPSBudWxsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUb29sdGlwXG4iXX0=
//# sourceURL=../coffee/tooltip.coffee