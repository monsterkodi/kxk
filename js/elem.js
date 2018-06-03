(function() {
  /*
  00000000  000      00000000  00     00  
  000       000      000       000   000  
  0000000   000      0000000   000000000  
  000       000      000       000 0 000  
  00000000  0000000  00000000  000   000  
  */
  var _, elem;

  _ = require('lodash');

  elem = function(typ, opt) {
    var c, e, event, i, j, k, l, len, len1, len2, ref, ref1, ref2;
    if (_.isPlainObject(typ)) {
      opt = typ;
      typ = opt.typ;
    }
    if (opt == null) {
      opt = {};
    }
    if (typ == null) {
      typ = 'div';
    }
    e = document.createElement(typ);
    if ((opt.text != null) && (_.isString(opt.text) || _.isNumber(opt.text))) {
      e.textContent = opt.text;
      delete opt.text;
    }
    if ((opt.html != null) && _.isString(opt.html)) {
      e.innerHTML = opt.html;
      delete opt.html;
    }
    if ((opt.child != null) && _.isElement(opt.child)) {
      e.appendChild(opt.child);
      delete opt.child;
    }
    if ((opt.children != null) && _.isArray(opt.children)) {
      ref = opt.children;
      for (i = 0, len = ref.length; i < len; i++) {
        c = ref[i];
        if (_.isElement(c)) {
          e.appendChild(c);
        }
      }
      delete opt.children;
    }
    ref1 = ['mousedown', 'mousemove', 'mouseup', 'click', 'dblclick'];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      event = ref1[j];
      if (opt[event] && _.isFunction(opt[event])) {
        e.addEventListener(event, opt[event]);
        delete opt[event];
      }
    }
    ref2 = Object.keys(opt);
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      k = ref2[l];
      e.setAttribute(k, opt[k]);
    }
    return e;
  };

  elem.containsPos = function(div, pos) {
    var br, ref, ref1;
    br = div.getBoundingClientRect();
    return (br.left <= (ref = pos.x) && ref <= br.left + br.width) && (br.top <= (ref1 = pos.y) && ref1 <= br.top + br.height);
  };

  elem.childIndex = function(e) {
    return Array.prototype.indexOf.call(e.parentNode.childNodes, e);
  };

  elem.upAttr = function(element, attr) {
    var a;
    if (element == null) {
      return null;
    }
    a = typeof element.getAttribute === "function" ? element.getAttribute(attr) : void 0;
    if (a !== null && a !== '') {
      return a;
    }
    return elem.upAttr(element.parentNode, attr);
  };

  elem.upProp = function(element, prop) {
    if (element == null) {
      return null;
    }
    if (element[prop] != null) {
      return element[prop];
    }
    return elem.upProp(element.parentNode, prop);
  };

  elem.upElem = function(element, opt) {
    var ref;
    if (element == null) {
      return null;
    }
    if (((opt != null ? opt.tag : void 0) != null) && opt.tag === element.tagName) {
      return element;
    }
    if (((opt != null ? opt.prop : void 0) != null) && (element[opt.prop] != null)) {
      return element;
    }
    if (((opt != null ? opt.attr : void 0) != null) && ((typeof element.getAttribute === "function" ? element.getAttribute(opt.attr) : void 0) != null)) {
      return element;
    }
    if (((opt != null ? opt.class : void 0) != null) && ((ref = element.classList) != null ? ref.contains(opt.class) : void 0)) {
      return element;
    }
    return elem.upElem(element.parentNode, opt);
  };

  elem.downElem = function(element, opt) {
    var child, found, i, len, ref;
    if (element == null) {
      return null;
    }
    if (((opt != null ? opt.tag : void 0) != null) && opt.tag === element.tagName) {
      return element;
    }
    if (((opt != null ? opt.prop : void 0) != null) && (element[opt.prop] != null)) {
      if (((opt != null ? opt.value : void 0) == null) || element[opt.prop] === opt.value) {
        return element;
      }
    }
    if (((opt != null ? opt.attr : void 0) != null) && ((typeof element.getAttribute === "function" ? element.getAttribute(opt.attr) : void 0) != null)) {
      if (((opt != null ? opt.value : void 0) == null) || element.getAttribute(opt.attr) === opt.value) {
        return element;
      }
    }
    ref = element.children;
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      if (found = elem.downElem(child, opt)) {
        return found;
      }
    }
  };

  module.exports = elem;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbS5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXMiOlsiY29mZmVlL2VsZW0uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLENBQUEsRUFBQTs7RUFRQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBRUosSUFBQSxHQUFPLFFBQUEsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFBO0FBRUgsUUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtJQUFBLElBQUcsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsR0FBaEIsQ0FBSDtNQUNJLEdBQUEsR0FBTTtNQUNOLEdBQUEsR0FBTSxHQUFHLENBQUMsSUFGZDs7O01BSUEsTUFBTyxDQUFBOzs7TUFDUCxNQUFPOztJQUVQLENBQUEsR0FBSSxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QjtJQUVKLElBQUcsa0JBQUEsSUFBYyxDQUFDLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBQSxJQUF3QixDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQXpCLENBQWpCO01BQ0ksQ0FBQyxDQUFDLFdBQUYsR0FBZ0IsR0FBRyxDQUFDO01BQ3BCLE9BQU8sR0FBRyxDQUFDLEtBRmY7O0lBSUEsSUFBRyxrQkFBQSxJQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBakI7TUFDSSxDQUFDLENBQUMsU0FBRixHQUFjLEdBQUcsQ0FBQztNQUNsQixPQUFPLEdBQUcsQ0FBQyxLQUZmOztJQUlBLElBQUcsbUJBQUEsSUFBZSxDQUFDLENBQUMsU0FBRixDQUFZLEdBQUcsQ0FBQyxLQUFoQixDQUFsQjtNQUNJLENBQUMsQ0FBQyxXQUFGLENBQWMs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QUFZLE9BQU8sQ0FBQyxVQUFwQixFQUFnQyxHQUFoQztFQVBVOztFQVNkLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQUEsQ0FBQyxPQUFELEVBQVUsR0FBVixDQUFBO0FBRVosUUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7SUFBQSxJQUFtQixlQUFuQjtBQUFBLGFBQU8sS0FBUDs7SUFDQSxJQUFrQiwwQ0FBQSxJQUFjLEdBQUcsQ0FBQyxHQUFKLEtBQVcsT0FBTyxDQUFDLE9BQW5EO0FBQUEsYUFBTyxRQUFQOztJQUNBLElBQUcsMkNBQUEsSUFBZSwyQkFBbEI7TUFDSSxJQUFzQiw0Q0FBSixJQUFtQixPQUFRLENBQUEsR0FBRyxDQUFDLElBQUosQ0FBUixLQUFxQixHQUFHLENBQUMsS0FBOUQ7QUFBQSxlQUFPLFFBQVA7T0FESjs7SUFFQSxJQUFHLDJDQUFBLElBQWUsZ0dBQWxCO01BQ0ksSUFBc0IsNENBQUosSUFBbUIsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsR0FBRyxDQUFDLElBQXpCLENBQUEsS0FBa0MsR0FBRyxDQUFDLEtBQTNFO0FBQUEsZUFBTyxRQUFQO09BREo7O0FBRUE7SUFBQSxLQUFBLHFDQUFBOztNQUNJLElBQUcsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZCxFQUFxQixHQUFyQixDQUFYO0FBQ0ksZUFBTyxNQURYOztJQURKO0VBUlk7O0VBWWhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBeEZqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMCAgICAgMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIFxuMDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmVsZW0gPSAodHlwLCBvcHQpIC0+XG4gICAgXG4gICAgaWYgXy5pc1BsYWluT2JqZWN0IHR5cFxuICAgICAgICBvcHQgPSB0eXAgXG4gICAgICAgIHR5cCA9IG9wdC50eXBcbiAgICAgICAgXG4gICAgb3B0ID89IHt9ICAgXG4gICAgdHlwID89ICdkaXYnXG5cbiAgICBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCB0eXBcbiAgICBcbiAgICBpZiBvcHQudGV4dD8gYW5kIChfLmlzU3RyaW5nKG9wdC50ZXh0KSBvciBfLmlzTnVtYmVyKG9wdC50ZXh0KSlcbiAgICAgICAgZS50ZXh0Q29udGVudCA9IG9wdC50ZXh0XG4gICAgICAgIGRlbGV0ZSBvcHQudGV4dFxuICAgIFxuICAgIGlmIG9wdC5odG1sPyBhbmQgXy5pc1N0cmluZyBvcHQuaHRtbFxuICAgICAgICBlLmlubmVySFRNTCA9IG9wdC5odG1sXG4gICAgICAgIGRlbGV0ZSBvcHQuaHRtbFxuICAgIFxuICAgIGlmIG9wdC5jaGlsZD8gYW5kIF8uaXNFbGVtZW50IG9wdC5jaGlsZFxuICAgICAgICBlLmFwcGVuZENoaWxkIG9wdC5jaGlsZFxuICAgICAgICBkZWxldGUgb3B0LmNoaWxkXG4gICAgICAgIFxuICAgIGlmIG9wdC5jaGlsZHJlbj8gYW5kIF8uaXNBcnJheSBvcHQuY2hpbGRyZW5cbiAgICAgICAgZm9yIGMgaW4gb3B0LmNoaWxkcmVuXG4gICAgICAgICAgICBlLmFwcGVuZENoaWxkIGMgaWYgXy5pc0VsZW1lbnQgY1xuICAgICAgICBkZWxldGUgb3B0LmNoaWxkcmVuXG4gICAgICAgIFxuICAgIGZvciBldmVudCBpbiBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcsICdjbGljaycsICdkYmxjbGljayddXG4gICAgICAgIGlmIG9wdFtldmVudF0gYW5kIF8uaXNGdW5jdGlvbiBvcHRbZXZlbnRdXG4gICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIgZXZlbnQsIG9wdFtldmVudF1cbiAgICAgICAgICAgIGRlbGV0ZSBvcHRbZXZlbnRdXG4gICAgICAgICAgICBcbiAgICBmb3IgayBpbiBPYmplY3Qua2V5cyBvcHRcbiAgICAgICAgZS5zZXRBdHRyaWJ1dGUgaywgb3B0W2tdXG4gICAgZVxuXG5lbGVtLmNvbnRhaW5zUG9zID0gKGRpdiwgcG9zKSAtPlxuICAgIFxuICAgIGJyID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgYnIubGVmdCA8PSBwb3MueCA8PSBici5sZWZ0K2JyLndpZHRoIGFuZCBici50b3AgPD0gcG9zLnkgPD0gYnIudG9wK2JyLmhlaWdodFxuXG5lbGVtLmNoaWxkSW5kZXggPSAoZSkgLT4gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCBlLnBhcmVudE5vZGUuY2hpbGROb2RlcywgZSBcblxuZWxlbS51cEF0dHIgPSAoZWxlbWVudCwgYXR0cikgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICBhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/IGF0dHJcbiAgICByZXR1cm4gYSBpZiBhICE9IG51bGwgYW5kIGEgIT0gJydcbiAgICBlbGVtLnVwQXR0ciBlbGVtZW50LnBhcmVudE5vZGUsIGF0dHJcblxuZWxlbS51cFByb3AgPSAoZWxlbWVudCwgcHJvcCkgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICByZXR1cm4gZWxlbWVudFtwcm9wXSBpZiBlbGVtZW50W3Byb3BdP1xuICAgIGVsZW0udXBQcm9wIGVsZW1lbnQucGFyZW50Tm9kZSwgcHJvcFxuICAgIFxuZWxlbS51cEVsZW0gPSAoZWxlbWVudCwgb3B0KSAtPlxuICAgIFxuICAgIHJldHVybiBudWxsIGlmIG5vdCBlbGVtZW50P1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8udGFnPyBhbmQgb3B0LnRhZyA9PSBlbGVtZW50LnRhZ05hbWVcbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LnByb3A/IGFuZCBlbGVtZW50W29wdC5wcm9wXT9cbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LmF0dHI/IGFuZCBlbGVtZW50LmdldEF0dHJpYnV0ZT8ob3B0LmF0dHIpP1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8uY2xhc3M/IGFuZCBlbGVtZW50LmNsYXNzTGlzdD8uY29udGFpbnMgb3B0LmNsYXNzXG4gICAgZWxlbS51cEVsZW0gZWxlbWVudC5wYXJlbnROb2RlLCBvcHRcblxuZWxlbS5kb3duRWxlbSA9IChlbGVtZW50LCBvcHQpIC0+XG4gICAgXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IGVsZW1lbnQ/XG4gICAgcmV0dXJuIGVsZW1lbnQgaWYgb3B0Py50YWc/IGFuZCBvcHQudGFnID09IGVsZW1lbnQudGFnTmFtZVxuICAgIGlmIG9wdD8ucHJvcD8gYW5kIGVsZW1lbnRbb3B0LnByb3BdP1xuICAgICAgICByZXR1cm4gZWxlbWVudCBpZiBub3Qgb3B0Py52YWx1ZT8gb3IgZWxlbWVudFtvcHQucHJvcF0gPT0gb3B0LnZhbHVlXG4gICAgaWYgb3B0Py5hdHRyPyBhbmQgZWxlbWVudC5nZXRBdHRyaWJ1dGU/KG9wdC5hdHRyKT9cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQgaWYgbm90IG9wdD8udmFsdWU/IG9yIGVsZW1lbnQuZ2V0QXR0cmlidXRlKG9wdC5hdHRyKSA9PSBvcHQudmFsdWVcbiAgICBmb3IgY2hpbGQgaW4gZWxlbWVudC5jaGlsZHJlblxuICAgICAgICBpZiBmb3VuZCA9IGVsZW0uZG93bkVsZW0gY2hpbGQsIG9wdFxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGVsZW1cblxuIl19
//# sourceURL=C:/Users/kodi/s/kxk/coffee/elem.coffee