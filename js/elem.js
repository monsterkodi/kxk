// koffee 1.12.0

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
    if (typ && typeof typ === 'object') {
        opt = typ;
        typ = opt.typ;
    }
    if (opt != null) {
        opt;
    } else {
        opt = {};
    }
    if (typ != null) {
        typ;
    } else {
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
    if (((opt != null ? opt["class"] : void 0) != null) && ((ref = element.classList) != null ? ref.contains(opt["class"]) : void 0)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImVsZW0uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFFSixJQUFBLEdBQU8sU0FBQyxHQUFELEVBQU0sR0FBTjtBQUVILFFBQUE7SUFBQSxJQUFHLEdBQUEsSUFBUSxPQUFPLEdBQVAsS0FBZSxRQUExQjtRQUNJLEdBQUEsR0FBTTtRQUNOLEdBQUEsR0FBTSxHQUFHLENBQUMsSUFGZDs7O1FBSUE7O1FBQUEsTUFBTzs7O1FBQ1A7O1FBQUEsTUFBTzs7SUFFUCxDQUFBLEdBQUksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkI7SUFFSixJQUFHLGtCQUFBLElBQWMsQ0FBQyxDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQUEsSUFBd0IsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUF6QixDQUFqQjtRQUNJLENBQUMsQ0FBQyxXQUFGLEdBQWdCLEdBQUcsQ0FBQztRQUNwQixPQUFPLEdBQUcsQ0FBQyxLQUZmOztJQUlBLElBQUcsa0JBQUEsSUFBYyxDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQWpCO1FBQ0ksQ0FBQyxDQUFDLFNBQUYsR0FBYyxHQUFHLENBQUM7UUFDbEIsT0FBTyxHQUFHLENBQUMsS0FGZjs7SUFJQSxJQUFHLG1CQUFBLElBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxHQUFHLENBQUMsS0FBaEIsQ0FBbEI7UUFDSSxDQUFDLENBQUMsV0FBRixDQUFjLEdBQUcsQ0FBQyxLQUFsQjtRQUNBLE9BQU8sR0FBRyxDQUFDLE1BRmY7O0lBSUEsSUFBRyxzQkFBQSxJQUFrQixDQUFDLENBQUMsT0FBRixDQUFVLEdBQUcsQ0FBQyxRQUFkLENBQXJCO0FBQ0k7QUFBQSxhQUFBLHFDQUFBOztZQUNJLElBQW1C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T0FBRCxFQUFVLEdBQVY7QUFFWixRQUFBO0lBQUEsSUFBbUIsZUFBbkI7QUFBQSxlQUFPLEtBQVA7O0lBQ0EsSUFBa0IsMENBQUEsSUFBYyxHQUFHLENBQUMsR0FBSixLQUFXLE9BQU8sQ0FBQyxPQUFuRDtBQUFBLGVBQU8sUUFBUDs7SUFDQSxJQUFHLDJDQUFBLElBQWUsMkJBQWxCO1FBQ0ksSUFBc0IsNENBQUosSUFBbUIsT0FBUSxDQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVIsS0FBcUIsR0FBRyxDQUFDLEtBQTlEO0FBQUEsbUJBQU8sUUFBUDtTQURKOztJQUVBLElBQUcsMkNBQUEsSUFBZSxnR0FBbEI7UUFDSSxJQUFzQiw0Q0FBSixJQUFtQixPQUFPLENBQUMsWUFBUixDQUFxQixHQUFHLENBQUMsSUFBekIsQ0FBQSxLQUFrQyxHQUFHLENBQUMsS0FBM0U7QUFBQSxtQkFBTyxRQUFQO1NBREo7O0FBRUE7QUFBQSxTQUFBLHFDQUFBOztRQUNJLElBQUcsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZCxFQUFxQixHQUFyQixDQUFYO0FBQ0ksbUJBQU8sTUFEWDs7QUFESjtBQVJZOztBQVloQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMCAgICAgMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIFxuMDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmVsZW0gPSAodHlwLCBvcHQpIC0+XG4gICAgXG4gICAgaWYgdHlwIGFuZCB0eXBlb2YodHlwKSA9PSAnb2JqZWN0J1xuICAgICAgICBvcHQgPSB0eXAgXG4gICAgICAgIHR5cCA9IG9wdC50eXBcbiAgICAgICAgXG4gICAgb3B0ID89IHt9ICAgXG4gICAgdHlwID89ICdkaXYnXG5cbiAgICBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCB0eXBcbiAgICBcbiAgICBpZiBvcHQudGV4dD8gYW5kIChfLmlzU3RyaW5nKG9wdC50ZXh0KSBvciBfLmlzTnVtYmVyKG9wdC50ZXh0KSlcbiAgICAgICAgZS50ZXh0Q29udGVudCA9IG9wdC50ZXh0XG4gICAgICAgIGRlbGV0ZSBvcHQudGV4dFxuICAgIFxuICAgIGlmIG9wdC5odG1sPyBhbmQgXy5pc1N0cmluZyBvcHQuaHRtbFxuICAgICAgICBlLmlubmVySFRNTCA9IG9wdC5odG1sXG4gICAgICAgIGRlbGV0ZSBvcHQuaHRtbFxuICAgIFxuICAgIGlmIG9wdC5jaGlsZD8gYW5kIF8uaXNFbGVtZW50IG9wdC5jaGlsZFxuICAgICAgICBlLmFwcGVuZENoaWxkIG9wdC5jaGlsZFxuICAgICAgICBkZWxldGUgb3B0LmNoaWxkXG4gICAgICAgIFxuICAgIGlmIG9wdC5jaGlsZHJlbj8gYW5kIF8uaXNBcnJheSBvcHQuY2hpbGRyZW5cbiAgICAgICAgZm9yIGMgaW4gb3B0LmNoaWxkcmVuXG4gICAgICAgICAgICBlLmFwcGVuZENoaWxkIGMgaWYgXy5pc0VsZW1lbnQgY1xuICAgICAgICBkZWxldGUgb3B0LmNoaWxkcmVuXG4gICAgICAgIFxuICAgIGlmIG9wdC5wYXJlbnQ/IGFuZCBfLmlzRWxlbWVudCBvcHQucGFyZW50XG4gICAgICAgIG9wdC5wYXJlbnQuYXBwZW5kQ2hpbGQgZVxuICAgICAgICBkZWxldGUgb3B0LnBhcmVudFxuICAgICAgICBcbiAgICBmb3IgZXZlbnQgaW4gWydtb3VzZWRvd24nICdtb3VzZW1vdmUnICdtb3VzZXVwJyAnY2xpY2snICdkYmxjbGljayddXG4gICAgICAgIGlmIG9wdFtldmVudF0gYW5kIF8uaXNGdW5jdGlvbiBvcHRbZXZlbnRdXG4gICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIgZXZlbnQsIG9wdFtldmVudF1cbiAgICAgICAgICAgIGRlbGV0ZSBvcHRbZXZlbnRdXG4gICAgICAgICAgICBcbiAgICBmb3IgayBpbiBPYmplY3Qua2V5cyBvcHRcbiAgICAgICAgZS5zZXRBdHRyaWJ1dGUgaywgb3B0W2tdXG4gICAgZVxuXG5lbGVtLmNvbnRhaW5zUG9zID0gKGRpdiwgcG9zKSAtPlxuICAgIFxuICAgIGJyID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgYnIubGVmdCA8PSBwb3MueCA8PSBici5sZWZ0K2JyLndpZHRoIGFuZCBici50b3AgPD0gcG9zLnkgPD0gYnIudG9wK2JyLmhlaWdodFxuXG5lbGVtLmNoaWxkSW5kZXggPSAoZSkgLT4gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCBlLnBhcmVudE5vZGUuY2hpbGROb2RlcywgZSBcblxuZWxlbS51cEF0dHIgPSAoZWxlbWVudCwgYXR0cikgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICBhID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/IGF0dHJcbiAgICByZXR1cm4gYSBpZiBhICE9IG51bGwgYW5kIGEgIT0gJydcbiAgICBlbGVtLnVwQXR0ciBlbGVtZW50LnBhcmVudE5vZGUsIGF0dHJcblxuZWxlbS51cFByb3AgPSAoZWxlbWVudCwgcHJvcCkgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICByZXR1cm4gZWxlbWVudFtwcm9wXSBpZiBlbGVtZW50W3Byb3BdP1xuICAgIGVsZW0udXBQcm9wIGVsZW1lbnQucGFyZW50Tm9kZSwgcHJvcFxuICAgIFxuZWxlbS51cEVsZW0gPSAoZWxlbWVudCwgb3B0KSAtPlxuICAgIFxuICAgIHJldHVybiBudWxsIGlmIG5vdCBlbGVtZW50P1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8udGFnPyBhbmQgb3B0LnRhZyA9PSBlbGVtZW50LnRhZ05hbWVcbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LnByb3A/IGFuZCBlbGVtZW50W29wdC5wcm9wXT9cbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LmF0dHI/IGFuZCBlbGVtZW50LmdldEF0dHJpYnV0ZT8ob3B0LmF0dHIpP1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8uY2xhc3M/IGFuZCBlbGVtZW50LmNsYXNzTGlzdD8uY29udGFpbnMgb3B0LmNsYXNzXG4gICAgZWxlbS51cEVsZW0gZWxlbWVudC5wYXJlbnROb2RlLCBvcHRcblxuZWxlbS5kb3duRWxlbSA9IChlbGVtZW50LCBvcHQpIC0+XG4gICAgXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IGVsZW1lbnQ/XG4gICAgcmV0dXJuIGVsZW1lbnQgaWYgb3B0Py50YWc/IGFuZCBvcHQudGFnID09IGVsZW1lbnQudGFnTmFtZVxuICAgIGlmIG9wdD8ucHJvcD8gYW5kIGVsZW1lbnRbb3B0LnByb3BdP1xuICAgICAgICByZXR1cm4gZWxlbWVudCBpZiBub3Qgb3B0Py52YWx1ZT8gb3IgZWxlbWVudFtvcHQucHJvcF0gPT0gb3B0LnZhbHVlXG4gICAgaWYgb3B0Py5hdHRyPyBhbmQgZWxlbWVudC5nZXRBdHRyaWJ1dGU/KG9wdC5hdHRyKT9cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQgaWYgbm90IG9wdD8udmFsdWU/IG9yIGVsZW1lbnQuZ2V0QXR0cmlidXRlKG9wdC5hdHRyKSA9PSBvcHQudmFsdWVcbiAgICBmb3IgY2hpbGQgaW4gZWxlbWVudC5jaGlsZHJlblxuICAgICAgICBpZiBmb3VuZCA9IGVsZW0uZG93bkVsZW0gY2hpbGQsIG9wdFxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGVsZW1cblxuIl19
//# sourceURL=../coffee/elem.coffee