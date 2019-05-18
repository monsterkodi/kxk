// koffee 0.43.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUNBQUE7SUFBQTs7QUFRQSxNQUFnQyxPQUFBLENBQVEsT0FBUixDQUFoQyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLG1CQUFmLEVBQXVCLFNBQXZCLEVBQTBCOztBQUVwQjtJQUVXLGlCQUFDLEdBQUQ7QUFFVCxZQUFBO1FBRlUsSUFBQyxDQUFBLE1BQUQ7Ozs7O1FBRVYsSUFBd0Msa0NBQVEsQ0FBRSxjQUFsRDtBQUFBLG1CQUFPLE1BQUEsQ0FBTyxzQkFBUCxFQUFQOzs7Z0JBRUksQ0FBQzs7Z0JBQUQsQ0FBQyxRQUFTOzs7aUJBQ1YsQ0FBQzs7aUJBQUQsQ0FBQyxPQUFTLElBQUMsQ0FBQSxHQUFHLENBQUM7O1FBRW5CLElBQUMsQ0FBQSxJQUFELEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUNkLElBQXNCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFoQixDQUF0QjtZQUFBLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBUCxFQUFQOztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixHQUFnQjtRQUVoQixJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFlBQXZCLEVBQXFDLElBQUMsQ0FBQSxPQUF0QztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsZ0JBQXZCLEVBQXlDLElBQUMsQ0FBQSxHQUExQztJQVpTOztzQkFjYixHQUFBLEdBQUssU0FBQyxLQUFEO1FBRUQsSUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQWY7QUFBQSxtQkFBQTs7UUFDQSxJQUFjLGlCQUFkO0FBQUEsbUJBQUE7O1FBRUEsSUFBRyxLQUFBLENBQU0sS0FBTixDQUFBLHFCQUFnQixLQUFLLENBQUUs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IDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAwMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICBcbiMjI1xuXG57IGVsZW0sIGVtcHR5LCBrZXJyb3IsICQsIF8gfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBUb29sdGlwXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChAb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGtlcnJvciBcIm5vIGVsZW0gZm9yIHRvb2x0aXA/XCIgaWYgbm90IEBvcHQ/LmVsZW1cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGVsYXkgPz0gNzAwXG4gICAgICAgIEBvcHQuaHRtbCAgPz0gQG9wdC50ZXh0XG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9ICBAb3B0LmVsZW1cbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtIGlmIF8uaXNTdHJpbmcgQG9wdC5lbGVtXG4gICAgICAgIEBlbGVtLnRvb2x0aXAgPSBAICAgICAgXG5cbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VlbnRlcicsIEBvbkhvdmVyXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ0RPTU5vZGVSZW1vdmVkJywgQGRlbFxuXG4gICAgZGVsOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEBvcHQua2VlcFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtP1xuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkoZXZlbnQpIG9yIGV2ZW50Py50YXJnZXQgPT0gQGVsZW1cbiAgICAgICAgICAgIGRlbGV0ZSBAZWxlbS50b29sdGlwXG4gICAgICAgICAgICBAb25MZWF2ZSgpXG4gICAgICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICdET01Ob2RlUmVtb3ZlZCcsIEBkZWxcbiAgICAgICAgICAgIEBlbGVtID0gbnVsbFxuXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PlxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQGVsZW0/XG4gICAgICAgIHJldHVybiBpZiBAZGl2P1xuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBwb3B1cCwgQG9wdC5kZWxheVxuICAgICAgICBcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VsZWF2ZScsIEBvbkxlYXZlXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICBAb25MZWF2ZVxuXG4gICAgcG9wdXA6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGVsZW0/XG4gICAgICAgIHJldHVybiBpZiBAZGl2P1xuICAgICAgICBAZGl2ID0gZWxlbSBpZDondG9vbHRpcCcsIGNsYXNzOid0b29sdGlwJywgaHRtbDogQG9wdC5odG1sXG4gICAgICAgIGlmIEBvcHQucGFyZW50XG4gICAgICAgICAgICBAb3B0LnBhcmVudC5hcHBlbmRDaGlsZCBAZGl2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgQGRpdlxuICAgICAgICBiciA9IEBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIEBkaXYuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZVkoMSlcIlxuICAgICAgICBAZGl2LnN0eWxlLm9wYWNpdHkgPSAnMSdcbiAgICAgICAgQGRpdi5zdHlsZS5mb250U2l6ZSA9IFwiI3tAb3B0LnRleHRTaXplfXB4XCIgaWYgQG9wdC50ZXh0U2l6ZT9cbiAgICAgICAgQGRpdi5zdHlsZS5sZWZ0ID0gXCIje2JyLmxlZnQgKyBAb3B0Lnh9cHhcIiBpZiBAb3B0Lng/XG4gICAgICAgIEBkaXYuc3R5bGUudG9wID0gXCIje2JyLmJvdHRvbSArIEBvcHQueX1weFwiIGlmIEBvcHQueT9cbiAgICAgICAgXG4gICAgb25MZWF2ZTogKGV2ZW50LCBlKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgQGVsZW0/XG4gICAgICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICAnbW91c2VsZWF2ZScsIEBvbkxlYXZlXG4gICAgICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICAnbW91c2Vkb3duJywgIEBvbkxlYXZlXG4gICAgICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBAdGltZXIgPSBudWxsXG4gICAgICAgIEBkaXY/LnJlbW92ZSgpXG4gICAgICAgIEBkaXYgPSBudWxsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUb29sdGlwXG4iXX0=
//# sourceURL=../coffee/tooltip.coffee