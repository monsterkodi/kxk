(function() {
  /*
  00000000    0000000   00000000   000   000  00000000 
  000   000  000   000  000   000  000   000  000   000
  00000000   000   000  00000000   000   000  00000000 
  000        000   000  000        000   000  000      
  000         0000000   000         0000000   000      
  */
  var Popup, elem, empty, keyinfo, log, post, stopEvent;

  ({empty, stopEvent, keyinfo, post, elem, log} = require('./kxk'));

  Popup = class Popup {
    constructor(opt) {
      var br, div, i, item, len, ref, ref1, ref2;
      
      //  0000000  000       0000000    0000000  00000000  
      // 000       000      000   000  000       000       
      // 000       000      000   000  0000000   0000000   
      // 000       000      000   000       000  000       
      //  0000000  0000000   0000000   0000000   00000000  
      this.close = this.close.bind(this);
      
      // 00     00   0000000   000   000   0000000  00000000    
      // 000   000  000   000  000   000  000       000         
      // 000000000  000   000  000   000  0000000   0000000     
      // 000 0 000  000   000  000   000       000  000         
      // 000   000   0000000    0000000   0000000   00000000    
      this.onHover = this.onHover.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onFocusOut = this.onFocusOut.bind(this);
      
      // 000   000  00000000  000   000  
      // 000  000   000        000 000   
      // 0000000    0000000     00000    
      // 000  000   000          000     
      // 000   000  00000000     000     
      this.onKeyDown = this.onKeyDown.bind(this);
      this.focusElem = document.activeElement;
      this.items = elem({
        class: 'popup',
        tabindex: 3
      });
      this.parent = opt.parent;
      ref = opt.items;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (item.hide) {
          continue;
        }
        if (empty(item.text) && empty(item.html)) {
          div = elem('hr', {
            class: 'popupItem separator'
          });
        } else {
          div = elem({
            class: 'popupItem',
            text: item.text
          });
          if (!empty(item.html)) {
            div.innerHTML = item.html;
          }
          div.item = item;
          div.addEventListener('click', this.onClick);
          if ((ref1 = item.combo) != null ? ref1 : item.accel) {
            div.appendChild(elem('span', {
              class: 'popupCombo',
              text: keyinfo.short((ref2 = item.combo) != null ? ref2 : item.accel)
            }));
          } else if (item.menu) {
            div.appendChild(elem('span', {
              class: 'popupCombo',
              text: '▶'
            }));
          }
        }
        this.items.appendChild(div);
      }
      document.body.appendChild(this.items);
      this.items.addEventListener('keydown', this.onKeyDown);
      this.items.addEventListener('focusout', this.onFocusOut);
      this.items.addEventListener('mouseover', this.onHover);
      br = this.items.getBoundingClientRect();
      if (opt.x + br.width > document.body.clientWidth) {
        this.items.style.left = `${document.body.clientWidth - br.width}px`;
      } else {
        this.items.style.left = `${opt.x}px`;
      }
      if (opt.y + br.height > document.body.clientHeight) {
        this.items.style.top = `${document.body.clientHeight - br.height}px`;
      } else {
        this.items.style.top = `${opt.y}px`;
      }
      if (opt.selectFirstItem !== false) {
        this.select(this.items.firstChild, {
          selectFirstItem: false
        });
      }
    }

    close(opt = {}) {
      var ref, ref1, ref2, ref3, ref4, ref5, ref6;
      if ((ref = this.popup) != null) {
        ref.close({
          focus: false
        });
      }
      delete this.popup;
      if ((ref1 = this.items) != null) {
        ref1.removeEventListener('keydown', this.onKeyDown);
      }
      if ((ref2 = this.items) != null) {
        ref2.removeEventListener('focusout', this.onFocusOut);
      }
      if ((ref3 = this.items) != null) {
        ref3.removeEventListener('mouseover', this.onHover);
      }
      if ((ref4 = this.items) != null) {
        ref4.remove();
      }
      delete this.items;
      if ((ref5 = this.parent) != null) {
        ref5.childClosed(this, opt);
      }
      if (opt.all) {
        if (this.parent != null) {
          this.parent.close(opt);
        }
      }
      if (opt.focus !== false && !this.parent) {
        return (ref6 = this.focusElem) != null ? ref6.focus() : void 0;
      }
    }

    childClosed(child, opt) {
      if (child === this.popup) {
        delete this.popup;
        if (opt.focus !== false) {
          return this.focus();
        }
      }
    }

    
    //  0000000  00000000  000      00000000   0000000  000000000  
    // 000       000       000      000       000          000     
    // 0000000   0000000   000      0000000   000          000     
    //      000  000       000      000       000          000     
    // 0000000   00000000  0000000  00000000   0000000     000     
    select(item, opt = {}) {
      var ref, ref1;
      if (item == null) {
        return;
      }
      if (this.popup != null) {
        this.popup.close({
          focus: false
        });
      }
      if ((ref = this.selected) != null) {
        ref.classList.remove('selected');
      }
      this.selected = item;
      this.selected.classList.add('selected');
      if (((ref1 = item.item) != null ? ref1.menu : void 0) && opt.open !== false) {
        delete this.popup;
        this.popupChild(item, opt);
      }
      return this.focus();
    }

    
    // 00000000    0000000   00000000   000   000  00000000    0000000  000   000  000  000      0000000    
    // 000   000  000   000  000   000  000   000  000   000  000       000   000  000  000      000   000  
    // 00000000   000   000  00000000   000   000  00000000   000       000000000  000  000      000   000  
    // 000        000   000  000        000   000  000        000       000   000  000  000      000   000  
    // 000         0000000   000         0000000   000         0000000  000   000  000  0000000  0000000    
    popupChild(item, opt = {}) {
      var br, items;
      if (items = item.item.menu) {
        if (this.popup) {
          return this.closePopup();
        } else {
          br = item.getBoundingClientRect();
          return this.popup = new Popup({
            items: items,
            parent: this,
            x: br.left + br.width,
            y: br.top,
            selectFirstItem: opt != null ? opt.selectFirstItem : void 0
          });
        }
      }
    }

    closePopup() {
      var ref;
      if ((ref = this.popup) != null) {
        ref.close({
          focus: false
        });
      }
      return delete this.popup;
    }

    // 000   000   0000000   000   000  000   0000000    0000000   000000000  00000000  
    // 0000  000  000   000  000   000  000  000        000   000     000     000       
    // 000 0 000  000000000   000 000   000  000  0000  000000000     000     0000000   
    // 000  0000  000   000     000     000  000   000  000   000     000     000       
    // 000   000  000   000      0      000   0000000   000   000     000     00000000  
    navigateLeft() {
      var menu;
      if (this.popup) {
        return this.closePopup();
      } else if (menu = this.parentMenu()) {
        return menu.navigateLeft();
      } else if (this.parent) {
        return this.close({
          focus: false
        });
      }
    }

    activateOrNavigateRight() {
      if (this.selected != null) {
        if (!this.selected.item.menu) {
          return this.activate(this.selected);
        } else {
          return this.navigateRight();
        }
      }
    }

    navigateRight() {
      var menu, ref;
      if (this.popup) {
        return this.popup.select(this.popup.items.firstChild);
      } else if ((ref = this.selected) != null ? ref.item.menu : void 0) {
        // @activate @selected
        return this.select(this.selected, {
          selectFirstItem: true
        });
      } else if (menu = this.parentMenu()) {
        return menu.navigateRight();
      }
    }

    parentMenu() {
      if ((this.parent != null) && !this.parent.parent) {
        return this.parent;
      }
    }

    
    // 000   000  00000000  000   000  000000000        00000000   00000000   00000000  000   000  
    // 0000  000  000        000 000      000           000   000  000   000  000       000   000  
    // 000 0 000  0000000     00000       000           00000000   0000000    0000000    000 000   
    // 000  0000  000        000 000      000           000        000   000  000          000     
    // 000   000  00000000  000   000     000           000        000   000  00000000      0      
    nextItem() {
      var next, ref;
      if (next = this.selected) {
        while (next = next.nextSibling) {
          if (!empty((ref = next.item) != null ? ref.text : void 0)) {
            return next;
          }
        }
      }
    }

    prevItem() {
      var prev, ref;
      if (prev = this.selected) {
        while (prev = prev.previousSibling) {
          if (!empty((ref = prev.item) != null ? ref.text : void 0)) {
            return prev;
          }
        }
      }
    }

    
    //  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
    // 000   000  000          000     000  000   000  000   000     000     000       
    // 000000000  000          000     000   000 000   000000000     000     0000000   
    // 000   000  000          000     000     000     000   000     000     000       
    // 000   000   0000000     000     000      0      000   000     000     00000000  
    activate(item) {
      var ref, ref1, ref2;
      if (((ref = item.item) != null ? ref.cb : void 0) != null) {
        this.close({
          all: true
        });
        return item.item.cb((ref1 = item.item.arg) != null ? ref1 : item.item.text);
      } else if (!item.item.menu) {
        this.close({
          all: true
        });
        log('popup.activate', item.item);
        // post.emit 'menuAction', item.item.action ? item.item.text, item.item.actarg
        return post.emit('menuAction', (ref2 = item.item.action) != null ? ref2 : item.item.text, item.item);
      }
    }

    toggle(item) {
      if (this.popup) {
        this.popup.close({
          focus: false
        });
        return delete this.popup;
      } else {
        return this.select(item, {
          selectFirstItem: false
        });
      }
    }

    onHover(event) {
      var item;
      item = elem.upElem(event.target, {
        prop: 'item'
      });
      if (item) {
        return this.select(item, {
          selectFirstItem: false
        });
      }
    }

    onClick(event) {
      var item;
      stopEvent(event);
      item = elem.upElem(event.target, {
        prop: 'item'
      });
      if (item) {
        if (item.item.menu) {
          return this.toggle(item);
        } else {
          return this.activate(item);
        }
      }
    }

    // 00000000   0000000    0000000  000   000   0000000  
    // 000       000   000  000       000   000  000       
    // 000000    000   000  000       000   000  0000000   
    // 000       000   000  000       000   000       000  
    // 000        0000000    0000000   0000000   0000000   
    focus() {
      var ref;
      return (ref = this.items) != null ? ref.focus() : void 0;
    }

    onFocusOut(event) {
      var ref;
      if (!((ref = event.relatedTarget) != null ? ref.classList.contains('popup') : void 0)) {
        return this.close({
          all: true,
          focus: false
        });
      }
    }

    onKeyDown(event) {
      var combo, key, mod;
      ({mod, key, combo} = keyinfo.forEvent(event));
      switch (combo) {
        case 'end':
        case 'page down':
          return stopEvent(event, this.select(this.items.lastChild, {
            selectFirstItem: false
          }));
        case 'home':
        case 'page up':
          return stopEvent(event, this.select(this.items.firstChild, {
            selectFirstItem: false
          }));
        case 'esc':
          return stopEvent(event, this.close());
        case 'down':
          return stopEvent(event, this.select(this.nextItem(), {
            selectFirstItem: false
          }));
        case 'up':
          return stopEvent(event, this.select(this.prevItem(), {
            selectFirstItem: false
          }));
        case 'enter':
        case 'space':
          return stopEvent(event, this.activateOrNavigateRight());
        case 'left':
          return stopEvent(event, this.navigateLeft());
        case 'right':
          return stopEvent(event, this.navigateRight());
      }
    }

  };

  module.exports = {
    menu: function(opt) {
      return new Popup(opt);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9wb3B1cC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUE7O0VBUUEsQ0FBQSxDQUFFLEtBQUYsRUFBUyxTQUFULEVBQW9CLE9BQXBCLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLEVBQXlDLEdBQXpDLENBQUEsR0FBaUQsT0FBQSxDQUFRLE9BQVIsQ0FBakQ7O0VBRU0sUUFBTixNQUFBLE1BQUE7SUFFSSxXQUFhLENBQUMsR0FBRCxDQUFBO0FBRVQsVUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQTs7Ozs7OztVQStDSixDQUFBLFlBQUEsQ0FBQSxpQkEvQ0k7Ozs7Ozs7VUEwTUosQ0FBQSxjQUFBLENBQUE7VUFNQSxDQUFBLGNBQUEsQ0FBQTtVQW1CQSxDQUFBLGlCQUFBLENBQUEsc0JBbk9JOzs7Ozs7O1VBOE9KLENBQUEsZ0JBQUEsQ0FBQTtNQTlPSSxJQUFDLENBQUEsU0FBRCxHQUFhLFFBQVEsQ0FBQztNQUN0QixJQUFDLENBQUEsS0FBRCxHQUFVLElBQUEsQ0FBSztRQUFBLEtBQUEsRUFBTyxPQUFQO1FBQWdCLFFBQUEsRUFBVTtNQUExQixDQUFMO01BQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxHQUFHLENBQUM7QUFFZDtNQUFBLEtBQUEscUNBQUE7O1FBQ0ksSUFBWSxJQUFJLENBQUMsSUFBakI7QUFBQSxtQkFBQTs7UUFDQSxJQUFHLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxDQUFBLElBQXFCLEtBQUEsQ0FBTSxJQUFJLENBQUMsSUFBWCxDQUF4QjtVQUNJLEdBQUEsR0FBTSxJQUFBLENBQUssSUFBTCxFQUFXO1lB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QUFBLEVBQU0sUUFBQSxDQUFDLEdBQUQsQ0FBQTthQUFTLElBQUksS0FBSixDQUFVLEdBQVY7SUFBVDtFQUFOO0FBMVFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIyNcblxueyBlbXB0eSwgc3RvcEV2ZW50LCBrZXlpbmZvLCBwb3N0LCBlbGVtLCBsb2cgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBQb3B1cFxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAob3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgQGZvY3VzRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgICAgQGl0ZW1zICA9IGVsZW0gY2xhc3M6ICdwb3B1cCcsIHRhYmluZGV4OiAzXG4gICAgICAgIEBwYXJlbnQgPSBvcHQucGFyZW50XG4gICAgICAgIFxuICAgICAgICBmb3IgaXRlbSBpbiBvcHQuaXRlbXNcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGl0ZW0uaGlkZVxuICAgICAgICAgICAgaWYgZW1wdHkoaXRlbS50ZXh0KSBhbmQgZW1wdHkoaXRlbS5odG1sKVxuICAgICAgICAgICAgICAgIGRpdiA9IGVsZW0gJ2hyJywgY2xhc3M6ICdwb3B1cEl0ZW0gc2VwYXJhdG9yJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRpdiA9IGVsZW0gY2xhc3M6ICdwb3B1cEl0ZW0nLCB0ZXh0OiBpdGVtLnRleHRcbiAgICAgICAgICAgICAgICBpZiBub3QgZW1wdHkgaXRlbS5odG1sXG4gICAgICAgICAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSBpdGVtLmh0bWwgXG4gICAgICAgICAgICAgICAgZGl2Lml0ZW0gPSBpdGVtXG4gICAgICAgICAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgQG9uQ2xpY2tcbiAgICAgICAgICAgICAgICBpZiBpdGVtLmNvbWJvID8gaXRlbS5hY2NlbFxuICAgICAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQgZWxlbSAnc3BhbicsIGNsYXNzOidwb3B1cENvbWJvJywgdGV4dDprZXlpbmZvLnNob3J0IGl0ZW0uY29tYm8gPyBpdGVtLmFjY2VsXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBpdGVtLm1lbnUgXG4gICAgICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCBlbGVtICdzcGFuJywgY2xhc3M6J3BvcHVwQ29tYm8nLCB0ZXh0OifilrYnXG4gICAgICAgICAgICBAaXRlbXMuYXBwZW5kQ2hpbGQgZGl2XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBAaXRlbXNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAgIEBvbktleURvd25cbiAgICAgICAgQGl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIgJ2ZvY3Vzb3V0JywgIEBvbkZvY3VzT3V0XG4gICAgICAgIEBpdGVtcy5hZGRFdmVudExpc3RlbmVyICdtb3VzZW92ZXInLCBAb25Ib3ZlclxuICAgICAgICBcbiAgICAgICAgYnIgPSBAaXRlbXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC54K2JyLndpZHRoID4gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCBcbiAgICAgICAgICAgIEBpdGVtcy5zdHlsZS5sZWZ0ID0gXCIje2RvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggLSBici53aWR0aH1weFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpdGVtcy5zdHlsZS5sZWZ0ID0gXCIje29wdC54fXB4XCIgXG4gICAgICAgICAgIFxuICAgICAgICBpZiBvcHQueStici5oZWlnaHQgPiBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodFxuICAgICAgICAgICAgQGl0ZW1zLnN0eWxlLnRvcCA9IFwiI3tkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAtIGJyLmhlaWdodH1weFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpdGVtcy5zdHlsZS50b3AgID0gXCIje29wdC55fXB4XCJcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5zZWxlY3RGaXJzdEl0ZW0gIT0gZmFsc2VcbiAgICAgICAgICAgIEBzZWxlY3QgQGl0ZW1zLmZpcnN0Q2hpbGQsIHNlbGVjdEZpcnN0SXRlbTpmYWxzZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNsb3NlOiAob3B0PXt9KT0+XG4gICAgICAgIFxuICAgICAgICBAcG9wdXA/LmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgXG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsICAgQG9uS2V5RG93blxuICAgICAgICBAaXRlbXM/LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2ZvY3Vzb3V0JywgIEBvbkZvY3VzT3V0XG4gICAgICAgIEBpdGVtcz8ucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJywgQG9uSG92ZXJcbiAgICAgICAgQGl0ZW1zPy5yZW1vdmUoKVxuICAgICAgICBkZWxldGUgQGl0ZW1zXG4gICAgICAgIFxuICAgICAgICBAcGFyZW50Py5jaGlsZENsb3NlZCBALCBvcHRcbiAgICAgICAgXG4gICAgICAgIGlmIG9wdC5hbGxcbiAgICAgICAgICAgIGlmIEBwYXJlbnQ/XG4gICAgICAgICAgICAgICAgQHBhcmVudC5jbG9zZSBvcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdC5mb2N1cyAhPSBmYWxzZSBhbmQgbm90IEBwYXJlbnRcbiAgICAgICAgICAgIEBmb2N1c0VsZW0/LmZvY3VzKCkgXG5cbiAgICBjaGlsZENsb3NlZDogKGNoaWxkLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaGlsZCA9PSBAcG9wdXBcbiAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgICAgIGlmIG9wdC5mb2N1cyAhPSBmYWxzZVxuICAgICAgICAgICAgICAgIEBmb2N1cygpXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgc2VsZWN0OiAoaXRlbSwgb3B0PXt9KSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpdGVtP1xuICAgICAgICBcbiAgICAgICAgaWYgQHBvcHVwP1xuICAgICAgICAgICAgQHBvcHVwLmNsb3NlIGZvY3VzOmZhbHNlXG4gICAgICAgIFxuICAgICAgICBAc2VsZWN0ZWQ/LmNsYXNzTGlzdC5yZW1vdmUgJ3NlbGVjdGVkJ1xuICAgICAgICBAc2VsZWN0ZWQgPSBpdGVtXG4gICAgICAgIEBzZWxlY3RlZC5jbGFzc0xpc3QuYWRkICdzZWxlY3RlZCdcbiAgICAgICAgXG4gICAgICAgIGlmIGl0ZW0uaXRlbT8ubWVudSBhbmQgb3B0Lm9wZW4gIT0gZmFsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAcG9wdXBcbiAgICAgICAgICAgIEBwb3B1cENoaWxkIGl0ZW0sIG9wdFxuICAgICAgICAgICAgXG4gICAgICAgIEBmb2N1cygpXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgcG9wdXBDaGlsZDogKGl0ZW0sIG9wdD17fSkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBpdGVtcyA9IGl0ZW0uaXRlbS5tZW51XG4gICAgICAgICAgICBpZiBAcG9wdXBcbiAgICAgICAgICAgICAgICBAY2xvc2VQb3B1cCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnIgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgICAgQHBvcHVwID0gbmV3IFBvcHVwIGl0ZW1zOml0ZW1zLCBwYXJlbnQ6QCwgeDpici5sZWZ0K2JyLndpZHRoLCB5OmJyLnRvcCwgc2VsZWN0Rmlyc3RJdGVtOm9wdD8uc2VsZWN0Rmlyc3RJdGVtXG5cbiAgICBjbG9zZVBvcHVwOiAtPlxuICAgICAgICBcbiAgICAgICAgQHBvcHVwPy5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICBkZWxldGUgQHBvcHVwXG5cbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgbmF2aWdhdGVMZWZ0OiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQHBvcHVwIFxuICAgICAgICAgICAgQGNsb3NlUG9wdXAoKVxuICAgICAgICBlbHNlIGlmIG1lbnUgPSBAcGFyZW50TWVudSgpXG4gICAgICAgICAgICBtZW51Lm5hdmlnYXRlTGVmdCgpXG4gICAgICAgIGVsc2UgaWYgQHBhcmVudFxuICAgICAgICAgICAgQGNsb3NlIGZvY3VzOmZhbHNlXG5cbiAgICBhY3RpdmF0ZU9yTmF2aWdhdGVSaWdodDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBzZWxlY3RlZD9cbiAgICAgICAgICAgIGlmIG5vdCBAc2VsZWN0ZWQuaXRlbS5tZW51XG4gICAgICAgICAgICAgICAgQGFjdGl2YXRlIEBzZWxlY3RlZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBuYXZpZ2F0ZVJpZ2h0KClcbiAgICAgICAgICAgIFxuICAgIG5hdmlnYXRlUmlnaHQ6IC0+XG4gICAgICAgIGlmIEBwb3B1cFxuICAgICAgICAgICAgQHBvcHVwLnNlbGVjdCBAcG9wdXAuaXRlbXMuZmlyc3RDaGlsZFxuICAgICAgICBlbHNlIGlmIEBzZWxlY3RlZD8uaXRlbS5tZW51XG4gICAgICAgICAgICAjIEBhY3RpdmF0ZSBAc2VsZWN0ZWRcbiAgICAgICAgICAgIEBzZWxlY3QgQHNlbGVjdGVkLCBzZWxlY3RGaXJzdEl0ZW06dHJ1ZVxuICAgICAgICBlbHNlIGlmIG1lbnUgPSBAcGFyZW50TWVudSgpXG4gICAgICAgICAgICBtZW51Lm5hdmlnYXRlUmlnaHQoKVxuICAgICAgICAgICAgXG4gICAgcGFyZW50TWVudTogLT4gXG4gICAgICAgIGlmIEBwYXJlbnQ/IGFuZCBub3QgQHBhcmVudC5wYXJlbnRcbiAgICAgICAgICAgIEBwYXJlbnRcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgICAwICAgICAgXG4gICAgXG4gICAgbmV4dEl0ZW06IC0+XG4gICAgICAgIGlmIG5leHQgPSBAc2VsZWN0ZWRcbiAgICAgICAgICAgIHdoaWxlIG5leHQgPSBuZXh0Lm5leHRTaWJsaW5nXG4gICAgICAgICAgICAgICAgaWYgbm90IGVtcHR5IG5leHQuaXRlbT8udGV4dFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dFxuICAgIFxuICAgIHByZXZJdGVtOiAtPlxuICAgICAgICBpZiBwcmV2ID0gQHNlbGVjdGVkXG4gICAgICAgICAgICB3aGlsZSBwcmV2ID0gcHJldi5wcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICBpZiBub3QgZW1wdHkgcHJldi5pdGVtPy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2XG4gICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBhY3RpdmF0ZTogKGl0ZW0pIC0+XG5cbiAgICAgICAgaWYgaXRlbS5pdGVtPy5jYj9cbiAgICAgICAgICAgIEBjbG9zZSBhbGw6dHJ1ZVxuICAgICAgICAgICAgaXRlbS5pdGVtLmNiIGl0ZW0uaXRlbS5hcmcgPyBpdGVtLml0ZW0udGV4dFxuICAgICAgICBlbHNlIGlmIG5vdCBpdGVtLml0ZW0ubWVudVxuICAgICAgICAgICAgQGNsb3NlIGFsbDp0cnVlXG4gICAgICAgICAgICBsb2cgJ3BvcHVwLmFjdGl2YXRlJywgaXRlbS5pdGVtXG4gICAgICAgICAgICAjIHBvc3QuZW1pdCAnbWVudUFjdGlvbicsIGl0ZW0uaXRlbS5hY3Rpb24gPyBpdGVtLml0ZW0udGV4dCwgaXRlbS5pdGVtLmFjdGFyZ1xuICAgICAgICAgICAgcG9zdC5lbWl0ICdtZW51QWN0aW9uJywgaXRlbS5pdGVtLmFjdGlvbiA/IGl0ZW0uaXRlbS50ZXh0LCBpdGVtLml0ZW1cblxuICAgIHRvZ2dsZTogKGl0ZW0pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAcG9wdXBcbiAgICAgICAgICAgIEBwb3B1cC5jbG9zZSBmb2N1czpmYWxzZVxuICAgICAgICAgICAgZGVsZXRlIEBwb3B1cFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2VsZWN0IGl0ZW0sIHNlbGVjdEZpcnN0SXRlbTpmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgXG4gICAgICAgICAgICBcbiAgICBvbkhvdmVyOiAoZXZlbnQpID0+IFxuICAgIFxuICAgICAgICBpdGVtID0gZWxlbS51cEVsZW0gZXZlbnQudGFyZ2V0LCBwcm9wOidpdGVtJ1xuICAgICAgICBpZiBpdGVtXG4gICAgICAgICAgICBAc2VsZWN0IGl0ZW0sIHNlbGVjdEZpcnN0SXRlbTpmYWxzZSAgIFxuXG4gICAgb25DbGljazogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHN0b3BFdmVudCBldmVudCBcbiAgICAgICAgXG4gICAgICAgIGl0ZW0gPSBlbGVtLnVwRWxlbSBldmVudC50YXJnZXQsIHByb3A6J2l0ZW0nXG4gICAgICAgIGlmIGl0ZW1cbiAgICAgICAgICAgIGlmIGl0ZW0uaXRlbS5tZW51XG4gICAgICAgICAgICAgICAgQHRvZ2dsZSBpdGVtXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGFjdGl2YXRlIGl0ZW1cblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGZvY3VzOiAtPiBAaXRlbXM/LmZvY3VzKClcbiAgICBcbiAgICBvbkZvY3VzT3V0OiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGV2ZW50LnJlbGF0ZWRUYXJnZXQ/LmNsYXNzTGlzdC5jb250YWlucyAncG9wdXAnXG4gICAgICAgICAgICBAY2xvc2UgYWxsOnRydWUsIGZvY3VzOmZhbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VuZCcsICdwYWdlIGRvd24nIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBpdGVtcy5sYXN0Q2hpbGQsIHNlbGVjdEZpcnN0SXRlbTpmYWxzZSBcbiAgICAgICAgICAgIHdoZW4gJ2hvbWUnLCAncGFnZSB1cCcgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBpdGVtcy5maXJzdENoaWxkLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2UgXG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQGNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICAgICAgICAgIHRoZW4gc3RvcEV2ZW50IGV2ZW50LCBAc2VsZWN0IEBuZXh0SXRlbSgpLCBzZWxlY3RGaXJzdEl0ZW06ZmFsc2UgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQHNlbGVjdCBAcHJldkl0ZW0oKSwgc2VsZWN0Rmlyc3RJdGVtOmZhbHNlIFxuICAgICAgICAgICAgd2hlbiAnZW50ZXInLCAnc3BhY2UnICAgdGhlbiBzdG9wRXZlbnQgZXZlbnQsIEBhY3RpdmF0ZU9yTmF2aWdhdGVSaWdodCgpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQG5hdmlnYXRlTGVmdCgpXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgICAgICAgICB0aGVuIHN0b3BFdmVudCBldmVudCwgQG5hdmlnYXRlUmlnaHQoKVxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IG1lbnU6IChvcHQpIC0+IG5ldyBQb3B1cCBvcHRcbiJdfQ==
//# sourceURL=C:/Users/kodi/s/kxk/coffee/popup.coffee