// Generated by CoffeeScript 1.12.7

/*
00000000  000      00000000  00     00  
000       000      000       000   000  
0000000   000      0000000   000000000  
000       000      000       000 0 000  
00000000  0000000  00000000  000   000
 */

(function() {
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

}).call(this);
