(function() {
  /*
  000000000   0000000    0000000   000      000000000  000  00000000 
     000     000   000  000   000  000         000     000  000   000
     000     000   000  000   000  000         000     000  00000000 
     000     000   000  000   000  000         000     000  000      
     000      0000000    0000000   0000000     000     000  000      
  */
  var $, Tooltip, _, elem, error, log, pos;

  ({elem, pos, error, log, $, _} = require('./kxk'));

  Tooltip = class Tooltip {
    constructor(opt) {
      var base, base1, ref;
      this.del = this.del.bind(this);
      this.onHover = this.onHover.bind(this);
      this.popup = this.popup.bind(this);
      this.onLeave = this.onLeave.bind(this);
      this.opt = opt;
      if (!((ref = this.opt) != null ? ref.elem : void 0)) {
        return error("no elem for tooltip?");
      }
      if ((base = this.opt).delay == null) {
        base.delay = 700;
      }
      if ((base1 = this.opt).html == null) {
        base1.html = this.opt.text;
      }
      this.elem = this.opt.elem;
      if (_.isString(this.opt.elem)) {
        this.elem = $(this.opt.elem);
      }
      this.elem.tooltip = this;
      this.elem.addEventListener('mouseenter', this.onHover);
      this.elem.addEventListener('mouseleave', this.onLeave);
      this.elem.addEventListener('mousedown', this.onLeave);
      this.elem.addEventListener('DOMNodeRemoved', this.del);
    }

    del() {
      if (this.opt.keep) {
        return;
      }
      if (this.elem == null) {
        return;
      }
      delete this.elem.tooltip;
      this.onLeave();
      this.elem.removeEventListener('mousemove', this.onHover);
      this.elem.removeEventListener('mouseleave', this.onLeave);
      this.elem.removeEventListener('mousedown', this.onLeave);
      this.elem.removeEventListener('DOMNodeRemoved', this.del);
      return this.elem = null;
    }

    onHover(event) {
      if (this.elem == null) {
        return;
      }
      if (this.div != null) {
        return;
      }
      clearTimeout(this.timer);
      return this.timer = setTimeout(this.popup, this.opt.delay);
    }

    popup(event) {
      var br;
      if (this.elem == null) {
        return;
      }
      if (this.div != null) {
        return;
      }
      this.div = elem({
        id: 'tooltip',
        class: 'tooltip',
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
        this.div.style.fontSize = `${this.opt.textSize}px`;
      }
      if (this.opt.x != null) {
        this.div.style.left = `${br.left + this.opt.x}px`;
      }
      if (this.opt.y != null) {
        return this.div.style.top = `${br.bottom + this.opt.y}px`;
      }
    }

    onLeave(event, e) {
      var ref;
      if (this.elem == null) {
        return;
      }
      clearTimeout(this.timer);
      this.timer = null;
      if ((ref = this.div) != null) {
        ref.remove();
      }
      return this.div = null;
    }

  };

  module.exports = Tooltip;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIuLi9jb2ZmZWUvdG9vbHRpcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLElBQUYsRUFBUSxHQUFSLEVBQWEsS0FBYixFQUFvQixHQUFwQixFQUF5QixDQUF6QixFQUE0QixDQUE1QixDQUFBLEdBQWtDLE9BQUEsQ0FBUSxPQUFSLENBQWxDOztFQUVNLFVBQU4sTUFBQSxRQUFBO0lBRUksV0FBYSxJQUFBLENBQUE7QUFFVCxVQUFBLElBQUEsRUFBQSxLQUFBLEVBQUE7VUFjSixDQUFBLFVBQUEsQ0FBQTtVQVlBLENBQUEsY0FBQSxDQUFBO1VBT0EsQ0FBQSxZQUFBLENBQUE7VUFnQkEsQ0FBQSxjQUFBLENBQUE7TUFuRGMsSUFBQyxDQUFBO01BRVgsSUFBdUMsZ0NBQVEsQ0FBRSxjQUFqRDtBQUFBLGVBQU8sS0FBQSxDQUFNLHNCQUFOLEVBQVA7OztZQUVJLENBQUMsUUFBUzs7O2FBQ1YsQ0FBQyxPQUFTLElBQUMsQ0FBQSxHQUFHLENBQUM7O01BRW5CLElBQUMsQ0FBQSxJQUFELEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQztNQUNkLElBQXNCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFoQixDQUF0QjtRQUFBLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBUCxFQUFQOztNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixHQUFnQjtNQUVoQixJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFlBQXZCLEVBQXFDLElBQUMsQ0FBQSxPQUF0QztNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FB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LGlCQUFkO0FBQUEsZUFBQTs7TUFDQSxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7TUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTOztXQUNMLENBQUUsTUFBTixDQUFBOzthQUNBLElBQUMsQ0FBQSxHQUFELEdBQU87SUFORjs7RUFyRGI7O0VBNkRBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdkVqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgIDAwMDAwMDAwIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgIFxuIyMjXG5cbnsgZWxlbSwgcG9zLCBlcnJvciwgbG9nLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgVG9vbHRpcFxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBlcnJvciBcIm5vIGVsZW0gZm9yIHRvb2x0aXA/XCIgaWYgbm90IEBvcHQ/LmVsZW1cbiAgICAgICAgXG4gICAgICAgIEBvcHQuZGVsYXkgPz0gNzAwXG4gICAgICAgIEBvcHQuaHRtbCAgPz0gQG9wdC50ZXh0XG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9ICBAb3B0LmVsZW1cbiAgICAgICAgQGVsZW0gPSQgQG9wdC5lbGVtIGlmIF8uaXNTdHJpbmcgQG9wdC5lbGVtXG4gICAgICAgIEBlbGVtLnRvb2x0aXAgPSBAICAgICAgXG5cbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VlbnRlcicsIEBvbkhvdmVyXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbGVhdmUnLCBAb25MZWF2ZVxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgQG9uTGVhdmVcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnRE9NTm9kZVJlbW92ZWQnLCBAZGVsXG5cbiAgICBkZWw6ID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEBvcHQua2VlcFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtP1xuICAgICAgICBkZWxldGUgQGVsZW0udG9vbHRpcFxuICAgICAgICBAb25MZWF2ZSgpXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdtb3VzZW1vdmUnLCAgQG9uSG92ZXJcbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ21vdXNlbGVhdmUnLCBAb25MZWF2ZVxuICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICAnbW91c2Vkb3duJywgIEBvbkxlYXZlXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdET01Ob2RlUmVtb3ZlZCcsIEBkZWxcbiAgICAgICAgQGVsZW0gPSBudWxsXG5cbiAgICBvbkhvdmVyOiAoZXZlbnQpID0+XG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZWxlbT9cbiAgICAgICAgcmV0dXJuIGlmIEBkaXY/XG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAcG9wdXAsIEBvcHQuZGVsYXlcblxuICAgIHBvcHVwOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBlbGVtP1xuICAgICAgICByZXR1cm4gaWYgQGRpdj9cbiAgICAgICAgQGRpdiA9IGVsZW0gaWQ6J3Rvb2x0aXAnLCBjbGFzczondG9vbHRpcCcsIGh0bWw6IEBvcHQuaHRtbFxuICAgICAgICBpZiBAb3B0LnBhcmVudFxuICAgICAgICAgICAgQG9wdC5wYXJlbnQuYXBwZW5kQ2hpbGQgQGRpdlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIEBkaXZcbiAgICAgICAgYnIgPSBAZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBAZGl2LnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGVZKDEpXCJcbiAgICAgICAgQGRpdi5zdHlsZS5vcGFjaXR5ID0gJzEnXG4gICAgICAgIEBkaXYuc3R5bGUuZm9udFNpemUgPSBcIiN7QG9wdC50ZXh0U2l6ZX1weFwiIGlmIEBvcHQudGV4dFNpemU/XG4gICAgICAgIEBkaXYuc3R5bGUubGVmdCA9IFwiI3tici5sZWZ0ICsgQG9wdC54fXB4XCIgaWYgQG9wdC54P1xuICAgICAgICBAZGl2LnN0eWxlLnRvcCA9IFwiI3tici5ib3R0b20gKyBAb3B0Lnl9cHhcIiBpZiBAb3B0Lnk/XG4gICAgICAgIFxuICAgIG9uTGVhdmU6IChldmVudCwgZSkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGVsZW0/XG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgQHRpbWVyID0gbnVsbFxuICAgICAgICBAZGl2Py5yZW1vdmUoKVxuICAgICAgICBAZGl2ID0gbnVsbFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVG9vbHRpcFxuIl19
//# sourceURL=../coffee/tooltip.coffee