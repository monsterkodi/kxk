(function() {
  /*
  000   000  00000000  000   000  000  000   000  00000000   0000000   
  000  000   000        000 000   000  0000  000  000       000   000  
  0000000    0000000     00000    000  000 0 000  000000    000   000  
  000  000   000          000     000  000  0000  000       000   000  
  000   000  00000000     000     000  000   000  000        0000000   
  */
  var Keyinfo, ansiKey, keycode,
    indexOf = [].indexOf;

  keycode = require('keycode');

  ansiKey = require('ansi-keycode');

  Keyinfo = (function() {
    class Keyinfo {
      static forEvent(event) {
        var combo;
        combo = Keyinfo.comboForEvent(event);
        return {
          mod: Keyinfo.modifiersForEvent(event),
          key: Keyinfo.keynameForEvent(event),
          char: Keyinfo.characterForEvent(event),
          combo: combo,
          short: Keyinfo.short(combo)
        };
      }

      static forCombo(combo) {
        var c, char, j, key, len, mods, ref;
        mods = [];
        char = null;
        ref = combo.split('+');
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          if (this.isModifier(c)) {
            mods.push(c);
          } else {
            key = c;
            if (c.length === 1) { // does this work?
              char = c;
            }
          }
        }
        return {
          mod: mods.join('+'),
          key: key,
          combo: combo,
          char: char
        };
      }

      static isModifier(keyname) {
        return indexOf.call(this.modifierNames, keyname) >= 0;
      }

      static modifiersForEvent(event) {
        var mods;
        mods = [];
        if (event.metaKey) {
          mods.push('command');
        }
        if (event.altKey) {
          mods.push('alt');
        }
        if (event.ctrlKey) {
          mods.push('ctrl');
        }
        if (event.shiftKey) {
          mods.push('shift');
        }
        return mods.join('+');
      }

      static comboForEvent(event) {
        var join, key;
        join = function() {
          var args;
          args = [].slice.call(arguments, 0);
          args = args.filter(function(e) {
            return e != null ? e.length : void 0;
          });
          return args.join('+');
        };
        key = Keyinfo.keynameForEvent(event);
        if (indexOf.call(Keyinfo.modifierNames, key) < 0) {
          return join(Keyinfo.modifiersForEvent(event), key);
        }
        return "";
      }

      static keynameForEvent(event) {
        var name;
        name = keycode(event);
        if (name == null) {
          switch (event.code) {
            case 'NumpadEqual':
              return 'numpad =';
            case 'Numpad5':
              return 'numpad 5';
          }
        }
        if (name === "left command" || name === "right command" || name === "ctrl" || name === "alt" || name === "shift") {
          return "";
        }
        return name;
      }

      static characterForEvent(event) {
        var ansi, ref;
        ansi = ansiKey(event);
        if (ansi == null) {
          return null;
        }
        if (ansi.length !== 1) {
          return null;
        }
        if ((ref = this.modifiersForEvent(event)) !== "" && ref !== "shift") {
          return null;
        }
        if (/f\d{1,2}/.test(this.keynameForEvent(event))) {
          return null;
        }
        return ansi;
      }

      static short(combo) {
        var i, j, ref;
        combo = combo.toLowerCase();
        for (i = j = 0, ref = this.iconKeyNames.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          // combo = combo.replace @iconKeyNames[i], @iconKeyChars[i]
          combo = combo.replace(new RegExp(this.iconKeyNames[i], 'gi'), this.iconKeyChars[i]);
        }
        combo = combo.replace(/\+/g, '');
        return combo.toUpperCase();
      }

    };

    Keyinfo.modifierNames = ['shift', 'ctrl', 'alt', 'command'];

    Keyinfo.modifierChars = ['⌂', '⌃', '⌥', '⌘'];

    Keyinfo.iconKeyNames = ['shift', 'ctrl', 'alt', 'command', 'backspace', 'delete', 'home', 'end', 'page up', 'page down', 'return', 'enter', 'up', 'down', 'left', 'right', 'tab', 'click'];

    Keyinfo.iconKeyChars = ['⌂', '⌃', '⌥', '⌘', '⌫', '⌦', '↖', '↘', '⇞', '⇟', '↩', '↩', '↑', '↓', '←', '→', '⭲', '🖯'];

    return Keyinfo;

  }).call(this);

  module.exports = Keyinfo;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXMiOlsiY29mZmVlL2tleWluZm8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQTtJQUFBOztFQVFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLGNBQVI7O0VBRUo7SUFBTixNQUFBLFFBQUE7TUFFZSxPQUFWLFFBQVUsQ0FBQyxLQUFELENBQUE7QUFDUCxZQUFBO1FBQUEsS0FBQSxHQUFRLE9BQUMsQ0FBQSxhQUFELENBQWtCLEtBQWxCO2VBQ1I7VUFBQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBQVA7VUFDQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGVBQUQsQ0FBbUIsS0FBbkIsQ0FEUDtVQUVBLElBQUEsRUFBTyxPQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FGUDtVQUdBLEtBQUEsRUFBTyxLQUhQO1VBSUEsS0FBQSxFQUFPLE9BQUMsQ0FBQSxLQUFELENBQU8sS0FBUDtRQUpQO01BRk87O01BY0EsT0FBVixRQUFVLENBQUMsS0FBRCxDQUFBO0FBRVAsWUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtRQUFBLElBQUEsR0FBTztRQUNQLElBQUEsR0FBTztBQUNQO1FBQUEsS0FBQSxxQ0FBQTs7VUFDSSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBWixDQUFIO1lBQ0ksSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFWLEVBREo7V0FBQSxNQUFBO1lBR0ksR0FBQSxHQUFNO1lBQ04sSUFBWSxDQUFDLENBQUMsTUFBRixLQUFZLENBQXhCO2NBQUEsSUFBQSxHQUFPLEVBQVA7YUFKSjs7UUFESjtlQU1BO1VBQUEsR0FBQSxFQUFPLElBQUksQ0FBQyxJ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ICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXHJcbjAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxyXG4wMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcclxuMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXHJcbjAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxyXG4jIyNcclxuXHJcbmtleWNvZGUgPSByZXF1aXJlICdrZXljb2RlJ1xyXG5hbnNpS2V5ID0gcmVxdWlyZSAnYW5zaS1rZXljb2RlJ1xyXG5cclxuY2xhc3MgS2V5aW5mb1xyXG4gICAgXHJcbiAgICBAZm9yRXZlbnQ6IChldmVudCkgPT5cclxuICAgICAgICBjb21ibyA9IEBjb21ib0ZvckV2ZW50ICAgIGV2ZW50XHJcbiAgICAgICAgbW9kOiAgIEBtb2RpZmllcnNGb3JFdmVudCBldmVudFxyXG4gICAgICAgIGtleTogICBAa2V5bmFtZUZvckV2ZW50ICAgZXZlbnRcclxuICAgICAgICBjaGFyOiAgQGNoYXJhY3RlckZvckV2ZW50IGV2ZW50XHJcbiAgICAgICAgY29tYm86IGNvbWJvXHJcbiAgICAgICAgc2hvcnQ6IEBzaG9ydCBjb21ib1xyXG4gICAgXHJcbiAgICBAbW9kaWZpZXJOYW1lcyA9IFsnc2hpZnQnLCAnY3RybCcsICdhbHQnLCAnY29tbWFuZCddIFxyXG4gICAgQG1vZGlmaWVyQ2hhcnMgPSBbJ+KMgicsICfijIMnLCAn4oylJywgJ+KMmCddXHJcbiAgICBcclxuICAgIEBpY29uS2V5TmFtZXMgID0gWydzaGlmdCcsICdjdHJsJywgJ2FsdCcsICdjb21tYW5kJywgJ2JhY2tzcGFjZScsICdkZWxldGUnLCAnaG9tZScsICdlbmQnLCAncGFnZSB1cCcsICdwYWdlIGRvd24nLCAncmV0dXJuJywgJ2VudGVyJywgJ3VwJywgJ2Rvd24nLCAnbGVmdCcsICdyaWdodCcsICd0YWInLCAnY2xpY2snXVxyXG4gICAgQGljb25LZXlDaGFycyAgPSBbJ+KMgicsICfijIMnLCAn4oylJywgJ+KMmCcsICfijKsnLCAn4oymJywgJ+KGlicsICfihpgnLCAn4oeeJywgJ+KHnycsICfihqknLCAn4oapJywgJ+KGkScsICfihpMnLCAn4oaQJywgJ+KGkicsICfirbInLCAn8J+WryddXHJcblxyXG4gICAgQGZvckNvbWJvOiAoY29tYm8pIC0+XHJcbiAgICAgICAgXHJcbiAgICAgICAgbW9kcyA9IFtdXHJcbiAgICAgICAgY2hhciA9IG51bGxcclxuICAgICAgICBmb3IgYyBpbiBjb21iby5zcGxpdCAnKydcclxuICAgICAgICAgICAgaWYgQGlzTW9kaWZpZXIgY1xyXG4gICAgICAgICAgICAgICAgbW9kcy5wdXNoIGMgXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGtleSA9IGNcclxuICAgICAgICAgICAgICAgIGNoYXIgPSBjIGlmIGMubGVuZ3RoID09IDEgIyBkb2VzIHRoaXMgd29yaz9cclxuICAgICAgICBtb2Q6ICAgbW9kcy5qb2luICcrJ1xyXG4gICAgICAgIGtleTogICBrZXlcclxuICAgICAgICBjb21ibzogY29tYm8gXHJcbiAgICAgICAgY2hhcjogIGNoYXJcclxuICAgIFxyXG4gICAgQGlzTW9kaWZpZXI6IChrZXluYW1lKSAtPiBrZXluYW1lIGluIEBtb2RpZmllck5hbWVzXHJcblxyXG4gICAgQG1vZGlmaWVyc0ZvckV2ZW50OiAoZXZlbnQpIC0+IFxyXG4gICAgICAgIFxyXG4gICAgICAgIG1vZHMgPSBbXVxyXG4gICAgICAgIG1vZHMucHVzaCAnY29tbWFuZCcgaWYgZXZlbnQubWV0YUtleVxyXG4gICAgICAgIG1vZHMucHVzaCAnYWx0JyAgICAgaWYgZXZlbnQuYWx0S2V5XHJcbiAgICAgICAgbW9kcy5wdXNoICdjdHJsJyAgICBpZiBldmVudC5jdHJsS2V5IFxyXG4gICAgICAgIG1vZHMucHVzaCAnc2hpZnQnICAgaWYgZXZlbnQuc2hpZnRLZXlcclxuICAgICAgICByZXR1cm4gbW9kcy5qb2luICcrJ1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgQGNvbWJvRm9yRXZlbnQ6IChldmVudCkgPT5cclxuICAgICAgICBcclxuICAgICAgICBqb2luID0gLT4gXHJcbiAgICAgICAgICAgIGFyZ3MgPSBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMFxyXG4gICAgICAgICAgICBhcmdzID0gYXJncy5maWx0ZXIgKGUpIC0+IGU/Lmxlbmd0aFxyXG4gICAgICAgICAgICBhcmdzLmpvaW4gJysnXHJcbiAgICBcclxuICAgICAgICBrZXkgPSBAa2V5bmFtZUZvckV2ZW50IGV2ZW50XHJcbiAgICAgICAgaWYga2V5IG5vdCBpbiBAbW9kaWZpZXJOYW1lc1xyXG4gICAgICAgICAgICByZXR1cm4gam9pbiBAbW9kaWZpZXJzRm9yRXZlbnQoZXZlbnQpLCBrZXlcclxuICAgICAgICByZXR1cm4gXCJcIlxyXG5cclxuICAgIEBrZXluYW1lRm9yRXZlbnQ6IChldmVudCkgLT5cclxuICAgICAgICBcclxuICAgICAgICBuYW1lID0ga2V5Y29kZSBldmVudFxyXG4gICAgICAgIGlmIG5vdCBuYW1lP1xyXG4gICAgICAgICAgICBzd2l0Y2ggZXZlbnQuY29kZVxyXG4gICAgICAgICAgICAgICAgd2hlbiAnTnVtcGFkRXF1YWwnIHRoZW4gcmV0dXJuICdudW1wYWQgPSdcclxuICAgICAgICAgICAgICAgIHdoZW4gJ051bXBhZDUnICAgICB0aGVuIHJldHVybiAnbnVtcGFkIDUnXHJcbiAgICAgICAgcmV0dXJuIFwiXCIgaWYgbmFtZSBpbiBbXCJsZWZ0IGNvbW1hbmRcIiwgXCJyaWdodCBjb21tYW5kXCIsIFwiY3RybFwiLCBcImFsdFwiLCBcInNoaWZ0XCJdXHJcbiAgICAgICAgbmFtZVxyXG5cclxuICAgIEBjaGFyYWN0ZXJGb3JFdmVudDogKGV2ZW50KSAtPlxyXG4gICAgICAgIFxyXG4gICAgICAgIGFuc2kgPSBhbnNpS2V5IGV2ZW50IFxyXG4gICAgICAgIHJldHVybiBudWxsIGlmIG5vdCBhbnNpPyBcclxuICAgICAgICByZXR1cm4gbnVsbCBpZiBhbnNpLmxlbmd0aCAhPSAxIFxyXG4gICAgICAgIHJldHVybiBudWxsIGlmIEBtb2RpZmllcnNGb3JFdmVudChldmVudCkgbm90IGluIFtcIlwiLCBcInNoaWZ0XCJdXHJcbiAgICAgICAgcmV0dXJuIG51bGwgaWYgL2ZcXGR7MSwyfS8udGVzdCBAa2V5bmFtZUZvckV2ZW50IGV2ZW50XHJcbiAgICAgICAgYW5zaVxyXG4gICAgICAgIFxyXG4gICAgQHNob3J0OiAoY29tYm8pIC0+XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29tYm8gPSBjb21iby50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5AaWNvbktleU5hbWVzLmxlbmd0aF1cclxuICAgICAgICAgICAgIyBjb21ibyA9IGNvbWJvLnJlcGxhY2UgQGljb25LZXlOYW1lc1tpXSwgQGljb25LZXlDaGFyc1tpXVxyXG4gICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgbmV3IFJlZ0V4cChAaWNvbktleU5hbWVzW2ldLCAnZ2knKSwgQGljb25LZXlDaGFyc1tpXVxyXG4gICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAvXFwrL2csICcnXHJcbiAgICAgICAgY29tYm8udG9VcHBlckNhc2UoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBLZXlpbmZvXHJcbiJdfQ==
//# sourceURL=C:/Users/t.kohnhorst/s/kxk/coffee/keyinfo.coffee