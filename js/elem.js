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
  if ((opt.parent != null) && _.isElement(opt.parent)) {
    opt.parent.appendChild(e);
    delete opt.parent;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIuLi9jb2ZmZWUvZWxlbS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFBQSxJQUFBLENBQUEsRUFBQTs7QUFRQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBRUosSUFBQSxHQUFPLFFBQUEsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFBO0FBRUgsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtFQUFBLElBQUcsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsR0FBaEIsQ0FBSDtJQUNJLEdBQUEsR0FBTTtJQUNOLEdBQUEsR0FBTSxHQUFHLENBQUMsSUFGZDs7O0lBSUEsTUFBTyxDQUFBOzs7SUFDUCxNQUFPOztFQUVQLENBQUEsR0FBSSxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QjtFQUVKLElBQUcsa0JBQUEsSUFBYyxDQUFDLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBQSxJQUF3QixDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQXpCLENBQWpCO0lBQ0ksQ0FBQyxDQUFDLFdBQUYsR0FBZ0IsR0FBRyxDQUFDO0lBQ3BCLE9BQU8sR0FBRyxDQUFDLEtBRmY7O0VBSUEsSUFBRyxrQkFBQSxJQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBakI7SUFDSSxDQUFDLENBQUMsU0FBRixHQUFjLEdBQUcsQ0FBQztJQUNsQixPQUFPLEdBQUcsQ0FBQyxLQUZmOztFQUlBLElBQUcsbUJBQUEsSUFBZSxDQUFDLENBQUMsU0FBRixDQUFZLEdBQUcsQ0FBQyxLQUFoQixDQUFsQjtJQUNJLENBQUMsQ0FBQyxXQUFGLENBQWMsR0FB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LElBQWUsZ0dBQWpDO0FBQUEsV0FBTyxRQUFQOztFQUNBLElBQWtCLDRDQUFBLDRDQUFpQyxDQUFFLFFBQW5CLENBQTRCLEdBQUcsQ0FBQyxLQUFoQyxXQUFsQztBQUFBLFdBQU8sUUFBUDs7U0FDQSxJQUFJLENBQUMsTUFBTCxDQUFZLE9BQU8sQ0FBQyxVQUFwQixFQUFnQyxHQUFoQztBQVBVOztBQVNkLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQUEsQ0FBQyxPQUFELEVBQVUsR0FBVixDQUFBO0FBRVosTUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7RUFBQSxJQUFtQixlQUFuQjtBQUFBLFdBQU8sS0FBUDs7RUFDQSxJQUFrQiwwQ0FBQSxJQUFjLEdBQUcsQ0FBQyxHQUFKLEtBQVcsT0FBTyxDQUFDLE9BQW5EO0FBQUEsV0FBTyxRQUFQOztFQUNBLElBQUcsMkNBQUEsSUFBZSwyQkFBbEI7SUFDSSxJQUFzQiw0Q0FBSixJQUFtQixPQUFRLENBQUEsR0FBRyxDQUFDLElBQUosQ0FBUixLQUFxQixHQUFHLENBQUMsS0FBOUQ7QUFBQSxhQUFPLFFBQVA7S0FESjs7RUFFQSxJQUFHLDJDQUFBLElBQWUsZ0dBQWxCO0lBQ0ksSUFBc0IsNENBQUosSUFBbUIsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsR0FBRyxDQUFDLElBQXpCLENBQUEsS0FBa0MsR0FBRyxDQUFDLEtBQTNFO0FBQUEsYUFBTyxRQUFQO0tBREo7O0FBRUE7RUFBQSxLQUFBLHFDQUFBOztJQUNJLElBQUcsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZCxFQUFxQixHQUFyQixDQUFYO0FBQ0ksYUFBTyxNQURYOztFQURKO0FBUlk7O0FBWWhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwICAgICAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAwIDAwMCAgXG4wMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuZWxlbSA9ICh0eXAsIG9wdCkgLT5cbiAgICBcbiAgICBpZiBfLmlzUGxhaW5PYmplY3QgdHlwXG4gICAgICAgIG9wdCA9IHR5cCBcbiAgICAgICAgdHlwID0gb3B0LnR5cFxuICAgICAgICBcbiAgICBvcHQgPz0ge30gICBcbiAgICB0eXAgPz0gJ2RpdidcblxuICAgIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IHR5cFxuICAgIFxuICAgIGlmIG9wdC50ZXh0PyBhbmQgKF8uaXNTdHJpbmcob3B0LnRleHQpIG9yIF8uaXNOdW1iZXIob3B0LnRleHQpKVxuICAgICAgICBlLnRleHRDb250ZW50ID0gb3B0LnRleHRcbiAgICAgICAgZGVsZXRlIG9wdC50ZXh0XG4gICAgXG4gICAgaWYgb3B0Lmh0bWw/IGFuZCBfLmlzU3RyaW5nIG9wdC5odG1sXG4gICAgICAgIGUuaW5uZXJIVE1MID0gb3B0Lmh0bWxcbiAgICAgICAgZGVsZXRlIG9wdC5odG1sXG4gICAgXG4gICAgaWYgb3B0LmNoaWxkPyBhbmQgXy5pc0VsZW1lbnQgb3B0LmNoaWxkXG4gICAgICAgIGUuYXBwZW5kQ2hpbGQgb3B0LmNoaWxkXG4gICAgICAgIGRlbGV0ZSBvcHQuY2hpbGRcbiAgICAgICAgXG4gICAgaWYgb3B0LmNoaWxkcmVuPyBhbmQgXy5pc0FycmF5IG9wdC5jaGlsZHJlblxuICAgICAgICBmb3IgYyBpbiBvcHQuY2hpbGRyZW5cbiAgICAgICAgICAgIGUuYXBwZW5kQ2hpbGQgYyBpZiBfLmlzRWxlbWVudCBjXG4gICAgICAgIGRlbGV0ZSBvcHQuY2hpbGRyZW5cbiAgICAgICAgXG4gICAgaWYgb3B0LnBhcmVudD8gYW5kIF8uaXNFbGVtZW50IG9wdC5wYXJlbnRcbiAgICAgICAgb3B0LnBhcmVudC5hcHBlbmRDaGlsZCBlXG4gICAgICAgIGRlbGV0ZSBvcHQucGFyZW50XG4gICAgICAgIFxuICAgIGZvciBldmVudCBpbiBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcsICdjbGljaycsICdkYmxjbGljayddXG4gICAgICAgIGlmIG9wdFtldmVudF0gYW5kIF8uaXNGdW5jdGlvbiBvcHRbZXZlbnRdXG4gICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIgZXZlbnQsIG9wdFtldmVudF1cbiAgICAgICAgICAgIGRlbGV0ZSBvcHRbZXZlbnRdXG4gICAgICAgICAgICBcbiAgICBmb3IgayBpbiBPYmplY3Qua2V5cyBvcHRcbiAgICAgICAgZS5zZXRBdHRyaWJ1dGUgaywgb3B0W2tdXG4gICAgZVxuXG5lbGVtLmNvbnRhaW5zUG9zID0gKGRpdiwgcG9zKSAtPlxuICAgIFxuICAgIGJyID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgYnIubGVmdCA8PSBwb3MueCA8PSBici5sZWZ0K2JyLndpZHRoIGFuZCBici50b3AgPD0gcG9zLnkgPD0gYnIudG9wK2JyLmhlaWdodFxuXG5lbGVtLmNoaWxkSW5kZXggPSAoZSkgLT4gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCBlLnBhcmVudE5vZGUuY2hpbGROb2RlcywgZSBcblxuZWxlbS51cEF0dHIgPSAoZWxlbWVudCwgYXR0cikgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICBhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/IGF0dHJcbiAgICByZXR1cm4gYSBpZiBhICE9IG51bGwgYW5kIGEgIT0gJydcbiAgICBlbGVtLnVwQXR0ciBlbGVtZW50LnBhcmVudE5vZGUsIGF0dHJcblxuZWxlbS51cFByb3AgPSAoZWxlbWVudCwgcHJvcCkgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICByZXR1cm4gZWxlbWVudFtwcm9wXSBpZiBlbGVtZW50W3Byb3BdP1xuICAgIGVsZW0udXBQcm9wIGVsZW1lbnQucGFyZW50Tm9kZSwgcHJvcFxuICAgIFxuZWxlbS51cEVsZW0gPSAoZWxlbWVudCwgb3B0KSAtPlxuICAgIFxuICAgIHJldHVybiBudWxsIGlmIG5vdCBlbGVtZW50P1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8udGFnPyBhbmQgb3B0LnRhZyA9PSBlbGVtZW50LnRhZ05hbWVcbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LnByb3A/IGFuZCBlbGVtZW50W29wdC5wcm9wXT9cbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LmF0dHI/IGFuZCBlbGVtZW50LmdldEF0dHJpYnV0ZT8ob3B0LmF0dHIpP1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8uY2xhc3M/IGFuZCBlbGVtZW50LmNsYXNzTGlzdD8uY29udGFpbnMgb3B0LmNsYXNzXG4gICAgZWxlbS51cEVsZW0gZWxlbWVudC5wYXJlbnROb2RlLCBvcHRcblxuZWxlbS5kb3duRWxlbSA9IChlbGVtZW50LCBvcHQpIC0+XG4gICAgXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IGVsZW1lbnQ/XG4gICAgcmV0dXJuIGVsZW1lbnQgaWYgb3B0Py50YWc/IGFuZCBvcHQudGFnID09IGVsZW1lbnQudGFnTmFtZVxuICAgIGlmIG9wdD8ucHJvcD8gYW5kIGVsZW1lbnRbb3B0LnByb3BdP1xuICAgICAgICByZXR1cm4gZWxlbWVudCBpZiBub3Qgb3B0Py52YWx1ZT8gb3IgZWxlbWVudFtvcHQucHJvcF0gPT0gb3B0LnZhbHVlXG4gICAgaWYgb3B0Py5hdHRyPyBhbmQgZWxlbWVudC5nZXRBdHRyaWJ1dGU/KG9wdC5hdHRyKT9cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQgaWYgbm90IG9wdD8udmFsdWU/IG9yIGVsZW1lbnQuZ2V0QXR0cmlidXRlKG9wdC5hdHRyKSA9PSBvcHQudmFsdWVcbiAgICBmb3IgY2hpbGQgaW4gZWxlbWVudC5jaGlsZHJlblxuICAgICAgICBpZiBmb3VuZCA9IGVsZW0uZG93bkVsZW0gY2hpbGQsIG9wdFxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGVsZW1cblxuIl19
//# sourceURL=../coffee/elem.coffee