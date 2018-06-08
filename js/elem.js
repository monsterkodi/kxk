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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIuLi9jb2ZmZWUvZWxlbS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsQ0FBQSxFQUFBOztFQVFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFFSixJQUFBLEdBQU8sUUFBQSxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQUE7QUFFSCxRQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0lBQUEsSUFBRyxDQUFDLENBQUMsYUFBRixDQUFnQixHQUFoQixDQUFIO01BQ0ksR0FBQSxHQUFNO01BQ04sR0FBQSxHQUFNLEdBQUcsQ0FBQyxJQUZkOzs7TUFJQSxNQUFPLENBQUE7OztNQUNQLE1BQU87O0lBRVAsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO0lBRUosSUFBRyxrQkFBQSxJQUFjLENBQUMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFBLElBQXdCLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBekIsQ0FBakI7TUFDSSxDQUFDLENBQUMsV0FBRixHQUFnQixHQUFHLENBQUM7TUFDcEIsT0FBTyxHQUFHLENBQUMsS0FGZjs7SUFJQSxJQUFHLGtCQUFBLElBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFqQjtNQUNJLENBQUMsQ0FBQyxTQUFGLEdBQWMsR0FBRyxDQUFDO01BQ2xCLE9BQU8sR0FBRyxDQUFDLEtBRmY7O0lBSUEsSUFBRyxtQkFBQSxJQUFlLENBQUMsQ0FBQyxTQUFGLENBQVksR0FBRyxDQUFDLEtBQWhCLENBQWxCO01BQ0ksQ0FBQyxDQUFDLFdBQUYsQ0FB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LENBQVksT0FBTyxDQUFDLFVBQXBCLEVBQWdDLEdBQWhDO0VBUFU7O0VBU2QsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsUUFBQSxDQUFDLE9BQUQsRUFBVSxHQUFWLENBQUE7QUFFWixRQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQTtJQUFBLElBQW1CLGVBQW5CO0FBQUEsYUFBTyxLQUFQOztJQUNBLElBQWtCLDBDQUFBLElBQWMsR0FBRyxDQUFDLEdBQUosS0FBVyxPQUFPLENBQUMsT0FBbkQ7QUFBQSxhQUFPLFFBQVA7O0lBQ0EsSUFBRywyQ0FBQSxJQUFlLDJCQUFsQjtNQUNJLElBQXNCLDRDQUFKLElBQW1CLE9BQVEsQ0FBQSxHQUFHLENBQUMsSUFBSixDQUFSLEtBQXFCLEdBQUcsQ0FBQyxLQUE5RDtBQUFBLGVBQU8sUUFBUDtPQURKOztJQUVBLElBQUcsMkNBQUEsSUFBZSxnR0FBbEI7TUFDSSxJQUFzQiw0Q0FBSixJQUFtQixPQUFPLENBQUMsWUFBUixDQUFxQixHQUFHLENBQUMsSUFBekIsQ0FBQSxLQUFrQyxHQUFHLENBQUMsS0FBM0U7QUFBQSxlQUFPLFFBQVA7T0FESjs7QUFFQTtJQUFBLEtBQUEscUNBQUE7O01BQ0ksSUFBRyxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFkLEVBQXFCLEdBQXJCLENBQVg7QUFDSSxlQUFPLE1BRFg7O0lBREo7RUFSWTs7RUFZaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF4RmpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwICAgICAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAwIDAwMCAgXG4wMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuZWxlbSA9ICh0eXAsIG9wdCkgLT5cbiAgICBcbiAgICBpZiBfLmlzUGxhaW5PYmplY3QgdHlwXG4gICAgICAgIG9wdCA9IHR5cCBcbiAgICAgICAgdHlwID0gb3B0LnR5cFxuICAgICAgICBcbiAgICBvcHQgPz0ge30gICBcbiAgICB0eXAgPz0gJ2RpdidcblxuICAgIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IHR5cFxuICAgIFxuICAgIGlmIG9wdC50ZXh0PyBhbmQgKF8uaXNTdHJpbmcob3B0LnRleHQpIG9yIF8uaXNOdW1iZXIob3B0LnRleHQpKVxuICAgICAgICBlLnRleHRDb250ZW50ID0gb3B0LnRleHRcbiAgICAgICAgZGVsZXRlIG9wdC50ZXh0XG4gICAgXG4gICAgaWYgb3B0Lmh0bWw/IGFuZCBfLmlzU3RyaW5nIG9wdC5odG1sXG4gICAgICAgIGUuaW5uZXJIVE1MID0gb3B0Lmh0bWxcbiAgICAgICAgZGVsZXRlIG9wdC5odG1sXG4gICAgXG4gICAgaWYgb3B0LmNoaWxkPyBhbmQgXy5pc0VsZW1lbnQgb3B0LmNoaWxkXG4gICAgICAgIGUuYXBwZW5kQ2hpbGQgb3B0LmNoaWxkXG4gICAgICAgIGRlbGV0ZSBvcHQuY2hpbGRcbiAgICAgICAgXG4gICAgaWYgb3B0LmNoaWxkcmVuPyBhbmQgXy5pc0FycmF5IG9wdC5jaGlsZHJlblxuICAgICAgICBmb3IgYyBpbiBvcHQuY2hpbGRyZW5cbiAgICAgICAgICAgIGUuYXBwZW5kQ2hpbGQgYyBpZiBfLmlzRWxlbWVudCBjXG4gICAgICAgIGRlbGV0ZSBvcHQuY2hpbGRyZW5cbiAgICAgICAgXG4gICAgZm9yIGV2ZW50IGluIFsnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdtb3VzZXVwJywgJ2NsaWNrJywgJ2RibGNsaWNrJ11cbiAgICAgICAgaWYgb3B0W2V2ZW50XSBhbmQgXy5pc0Z1bmN0aW9uIG9wdFtldmVudF1cbiAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lciBldmVudCwgb3B0W2V2ZW50XVxuICAgICAgICAgICAgZGVsZXRlIG9wdFtldmVudF1cbiAgICAgICAgICAgIFxuICAgIGZvciBrIGluIE9iamVjdC5rZXlzIG9wdFxuICAgICAgICBlLnNldEF0dHJpYnV0ZSBrLCBvcHRba11cbiAgICBlXG5cbmVsZW0uY29udGFpbnNQb3MgPSAoZGl2LCBwb3MpIC0+XG4gICAgXG4gICAgYnIgPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBici5sZWZ0IDw9IHBvcy54IDw9IGJyLmxlZnQrYnIud2lkdGggYW5kIGJyLnRvcCA8PSBwb3MueSA8PSBici50b3ArYnIuaGVpZ2h0XG5cbmVsZW0uY2hpbGRJbmRleCA9IChlKSAtPiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsIGUucGFyZW50Tm9kZS5jaGlsZE5vZGVzLCBlIFxuXG5lbGVtLnVwQXR0ciA9IChlbGVtZW50LCBhdHRyKSAtPlxuICAgIFxuICAgIHJldHVybiBudWxsIGlmIG5vdCBlbGVtZW50P1xuICAgIGEgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8gYXR0clxuICAgIHJldHVybiBhIGlmIGEgIT0gbnVsbCBhbmQgYSAhPSAnJ1xuICAgIGVsZW0udXBBdHRyIGVsZW1lbnQucGFyZW50Tm9kZSwgYXR0clxuXG5lbGVtLnVwUHJvcCA9IChlbGVtZW50LCBwcm9wKSAtPlxuICAgIFxuICAgIHJldHVybiBudWxsIGlmIG5vdCBlbGVtZW50P1xuICAgIHJldHVybiBlbGVtZW50W3Byb3BdIGlmIGVsZW1lbnRbcHJvcF0/XG4gICAgZWxlbS51cFByb3AgZWxlbWVudC5wYXJlbnROb2RlLCBwcm9wXG4gICAgXG5lbGVtLnVwRWxlbSA9IChlbGVtZW50LCBvcHQpIC0+XG4gICAgXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IGVsZW1lbnQ/XG4gICAgcmV0dXJuIGVsZW1lbnQgaWYgb3B0Py50YWc/IGFuZCBvcHQudGFnID09IGVsZW1lbnQudGFnTmFtZVxuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8ucHJvcD8gYW5kIGVsZW1lbnRbb3B0LnByb3BdP1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8uYXR0cj8gYW5kIGVsZW1lbnQuZ2V0QXR0cmlidXRlPyhvcHQuYXR0cik/XG4gICAgcmV0dXJuIGVsZW1lbnQgaWYgb3B0Py5jbGFzcz8gYW5kIGVsZW1lbnQuY2xhc3NMaXN0Py5jb250YWlucyBvcHQuY2xhc3NcbiAgICBlbGVtLnVwRWxlbSBlbGVtZW50LnBhcmVudE5vZGUsIG9wdFxuXG5lbGVtLmRvd25FbGVtID0gKGVsZW1lbnQsIG9wdCkgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LnRhZz8gYW5kIG9wdC50YWcgPT0gZWxlbWVudC50YWdOYW1lXG4gICAgaWYgb3B0Py5wcm9wPyBhbmQgZWxlbWVudFtvcHQucHJvcF0/XG4gICAgICAgIHJldHVybiBlbGVtZW50IGlmIG5vdCBvcHQ/LnZhbHVlPyBvciBlbGVtZW50W29wdC5wcm9wXSA9PSBvcHQudmFsdWVcbiAgICBpZiBvcHQ/LmF0dHI/IGFuZCBlbGVtZW50LmdldEF0dHJpYnV0ZT8ob3B0LmF0dHIpP1xuICAgICAgICByZXR1cm4gZWxlbWVudCBpZiBub3Qgb3B0Py52YWx1ZT8gb3IgZWxlbWVudC5nZXRBdHRyaWJ1dGUob3B0LmF0dHIpID09IG9wdC52YWx1ZVxuICAgIGZvciBjaGlsZCBpbiBlbGVtZW50LmNoaWxkcmVuXG4gICAgICAgIGlmIGZvdW5kID0gZWxlbS5kb3duRWxlbSBjaGlsZCwgb3B0XG4gICAgICAgICAgICByZXR1cm4gZm91bmRcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gZWxlbVxuXG4iXX0=
//# sourceURL=../coffee/elem.coffee