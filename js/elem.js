// koffee 0.43.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUVKLElBQUEsR0FBTyxTQUFDLEdBQUQsRUFBTSxHQUFOO0FBRUgsUUFBQTtJQUFBLElBQUcsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsR0FBaEIsQ0FBSDtRQUNJLEdBQUEsR0FBTTtRQUNOLEdBQUEsR0FBTSxHQUFHLENBQUMsSUFGZDs7O1FBSUE7O1FBQUEsTUFBTzs7O1FBQ1A7O1FBQUEsTUFBTzs7SUFFUCxDQUFBLEdBQUksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkI7SUFFSixJQUFHLGtCQUFBLElBQWMsQ0FBQyxDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQUEsSUFBd0IsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUF6QixDQUFqQjtRQUNJLENBQUMsQ0FBQyxXQUFGLEdBQWdCLEdBQUcsQ0FBQztRQUNwQixPQUFPLEdBQUcsQ0FBQyxLQUZmOztJQUlBLElBQUcsa0JBQUEsSUFBYyxDQUFDLENBQUMsUUFBRixDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQWpCO1FBQ0ksQ0FBQyxDQUFDLFNBQUYsR0FBYyxHQUFHLENBQUM7UUFDbEIsT0FBTyxHQUFHLENBQUMsS0FGZjs7SUFJQSxJQUFHLG1CQUFBLElBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxHQUFHLENBQUMsS0FBaEIsQ0FBbEI7UUFDSSxDQUFDLENBQUMsV0FBRixDQUFjLEdBQUcsQ0FBQyxLQUFsQjtRQUNBLE9BQU8sR0FBRyxDQUFDLE1BRmY7O0lBSUEsSUFBRyxzQkFBQSxJQUFrQixDQUFDLENBQUMsT0FBRixDQUFVLEdBQUcsQ0FBQyxRQUFkLENBQXJCO0FBQ0k7QUFBQSxhQUFBLHFDQUFBOztZQUNJLElBQW1CLENBQUMsQ0FBQyxTQUFGLENB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WixRQUFBO0lBQUEsSUFBbUIsZUFBbkI7QUFBQSxlQUFPLEtBQVA7O0lBQ0EsSUFBa0IsMENBQUEsSUFBYyxHQUFHLENBQUMsR0FBSixLQUFXLE9BQU8sQ0FBQyxPQUFuRDtBQUFBLGVBQU8sUUFBUDs7SUFDQSxJQUFHLDJDQUFBLElBQWUsMkJBQWxCO1FBQ0ksSUFBc0IsNENBQUosSUFBbUIsT0FBUSxDQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVIsS0FBcUIsR0FBRyxDQUFDLEtBQTlEO0FBQUEsbUJBQU8sUUFBUDtTQURKOztJQUVBLElBQUcsMkNBQUEsSUFBZSxnR0FBbEI7UUFDSSxJQUFzQiw0Q0FBSixJQUFtQixPQUFPLENBQUMsWUFBUixDQUFxQixHQUFHLENBQUMsSUFBekIsQ0FBQSxLQUFrQyxHQUFHLENBQUMsS0FBM0U7QUFBQSxtQkFBTyxRQUFQO1NBREo7O0FBRUE7QUFBQSxTQUFBLHFDQUFBOztRQUNJLElBQUcsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZCxFQUFxQixHQUFyQixDQUFYO0FBQ0ksbUJBQU8sTUFEWDs7QUFESjtBQVJZOztBQVloQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMCAgICAgMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIFxuMDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmVsZW0gPSAodHlwLCBvcHQpIC0+XG4gICAgXG4gICAgaWYgXy5pc1BsYWluT2JqZWN0IHR5cFxuICAgICAgICBvcHQgPSB0eXAgXG4gICAgICAgIHR5cCA9IG9wdC50eXBcbiAgICAgICAgXG4gICAgb3B0ID89IHt9ICAgXG4gICAgdHlwID89ICdkaXYnXG5cbiAgICBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCB0eXBcbiAgICBcbiAgICBpZiBvcHQudGV4dD8gYW5kIChfLmlzU3RyaW5nKG9wdC50ZXh0KSBvciBfLmlzTnVtYmVyKG9wdC50ZXh0KSlcbiAgICAgICAgZS50ZXh0Q29udGVudCA9IG9wdC50ZXh0XG4gICAgICAgIGRlbGV0ZSBvcHQudGV4dFxuICAgIFxuICAgIGlmIG9wdC5odG1sPyBhbmQgXy5pc1N0cmluZyBvcHQuaHRtbFxuICAgICAgICBlLmlubmVySFRNTCA9IG9wdC5odG1sXG4gICAgICAgIGRlbGV0ZSBvcHQuaHRtbFxuICAgIFxuICAgIGlmIG9wdC5jaGlsZD8gYW5kIF8uaXNFbGVtZW50IG9wdC5jaGlsZFxuICAgICAgICBlLmFwcGVuZENoaWxkIG9wdC5jaGlsZFxuICAgICAgICBkZWxldGUgb3B0LmNoaWxkXG4gICAgICAgIFxuICAgIGlmIG9wdC5jaGlsZHJlbj8gYW5kIF8uaXNBcnJheSBvcHQuY2hpbGRyZW5cbiAgICAgICAgZm9yIGMgaW4gb3B0LmNoaWxkcmVuXG4gICAgICAgICAgICBlLmFwcGVuZENoaWxkIGMgaWYgXy5pc0VsZW1lbnQgY1xuICAgICAgICBkZWxldGUgb3B0LmNoaWxkcmVuXG4gICAgICAgIFxuICAgIGlmIG9wdC5wYXJlbnQ/IGFuZCBfLmlzRWxlbWVudCBvcHQucGFyZW50XG4gICAgICAgIG9wdC5wYXJlbnQuYXBwZW5kQ2hpbGQgZVxuICAgICAgICBkZWxldGUgb3B0LnBhcmVudFxuICAgICAgICBcbiAgICBmb3IgZXZlbnQgaW4gWydtb3VzZWRvd24nLCAnbW91c2Vtb3ZlJywgJ21vdXNldXAnLCAnY2xpY2snLCAnZGJsY2xpY2snXVxuICAgICAgICBpZiBvcHRbZXZlbnRdIGFuZCBfLmlzRnVuY3Rpb24gb3B0W2V2ZW50XVxuICAgICAgICAgICAgZS5hZGRFdmVudExpc3RlbmVyIGV2ZW50LCBvcHRbZXZlbnRdXG4gICAgICAgICAgICBkZWxldGUgb3B0W2V2ZW50XVxuICAgICAgICAgICAgXG4gICAgZm9yIGsgaW4gT2JqZWN0LmtleXMgb3B0XG4gICAgICAgIGUuc2V0QXR0cmlidXRlIGssIG9wdFtrXVxuICAgIGVcblxuZWxlbS5jb250YWluc1BvcyA9IChkaXYsIHBvcykgLT5cbiAgICBcbiAgICBiciA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGJyLmxlZnQgPD0gcG9zLnggPD0gYnIubGVmdCtici53aWR0aCBhbmQgYnIudG9wIDw9IHBvcy55IDw9IGJyLnRvcCtici5oZWlnaHRcblxuZWxlbS5jaGlsZEluZGV4ID0gKGUpIC0+IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwgZS5wYXJlbnROb2RlLmNoaWxkTm9kZXMsIGUgXG5cbmVsZW0udXBBdHRyID0gKGVsZW1lbnQsIGF0dHIpIC0+XG4gICAgXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IGVsZW1lbnQ/XG4gICAgYSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPyBhdHRyXG4gICAgcmV0dXJuIGEgaWYgYSAhPSBudWxsIGFuZCBhICE9ICcnXG4gICAgZWxlbS51cEF0dHIgZWxlbWVudC5wYXJlbnROb2RlLCBhdHRyXG5cbmVsZW0udXBQcm9wID0gKGVsZW1lbnQsIHByb3ApIC0+XG4gICAgXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IGVsZW1lbnQ/XG4gICAgcmV0dXJuIGVsZW1lbnRbcHJvcF0gaWYgZWxlbWVudFtwcm9wXT9cbiAgICBlbGVtLnVwUHJvcCBlbGVtZW50LnBhcmVudE5vZGUsIHByb3BcbiAgICBcbmVsZW0udXBFbGVtID0gKGVsZW1lbnQsIG9wdCkgLT5cbiAgICBcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgZWxlbWVudD9cbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LnRhZz8gYW5kIG9wdC50YWcgPT0gZWxlbWVudC50YWdOYW1lXG4gICAgcmV0dXJuIGVsZW1lbnQgaWYgb3B0Py5wcm9wPyBhbmQgZWxlbWVudFtvcHQucHJvcF0/XG4gICAgcmV0dXJuIGVsZW1lbnQgaWYgb3B0Py5hdHRyPyBhbmQgZWxlbWVudC5nZXRBdHRyaWJ1dGU/KG9wdC5hdHRyKT9cbiAgICByZXR1cm4gZWxlbWVudCBpZiBvcHQ/LmNsYXNzPyBhbmQgZWxlbWVudC5jbGFzc0xpc3Q/LmNvbnRhaW5zIG9wdC5jbGFzc1xuICAgIGVsZW0udXBFbGVtIGVsZW1lbnQucGFyZW50Tm9kZSwgb3B0XG5cbmVsZW0uZG93bkVsZW0gPSAoZWxlbWVudCwgb3B0KSAtPlxuICAgIFxuICAgIHJldHVybiBudWxsIGlmIG5vdCBlbGVtZW50P1xuICAgIHJldHVybiBlbGVtZW50IGlmIG9wdD8udGFnPyBhbmQgb3B0LnRhZyA9PSBlbGVtZW50LnRhZ05hbWVcbiAgICBpZiBvcHQ/LnByb3A/IGFuZCBlbGVtZW50W29wdC5wcm9wXT9cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQgaWYgbm90IG9wdD8udmFsdWU/IG9yIGVsZW1lbnRbb3B0LnByb3BdID09IG9wdC52YWx1ZVxuICAgIGlmIG9wdD8uYXR0cj8gYW5kIGVsZW1lbnQuZ2V0QXR0cmlidXRlPyhvcHQuYXR0cik/XG4gICAgICAgIHJldHVybiBlbGVtZW50IGlmIG5vdCBvcHQ/LnZhbHVlPyBvciBlbGVtZW50LmdldEF0dHJpYnV0ZShvcHQuYXR0cikgPT0gb3B0LnZhbHVlXG4gICAgZm9yIGNoaWxkIGluIGVsZW1lbnQuY2hpbGRyZW5cbiAgICAgICAgaWYgZm91bmQgPSBlbGVtLmRvd25FbGVtIGNoaWxkLCBvcHRcbiAgICAgICAgICAgIHJldHVybiBmb3VuZFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBlbGVtXG5cbiJdfQ==
//# sourceURL=../coffee/elem.coffee