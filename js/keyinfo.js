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
        return '';
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
        if (name === 'left command' || name === 'right command' || name === 'ctrl' || name === 'alt' || name === 'shift') {
          return '';
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
        if ((ref = this.modifiersForEvent(event)) !== '' && ref !== 'shift') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIuLi9jb2ZmZWUva2V5aW5mby5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBO0lBQUE7O0VBUUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztFQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsY0FBUjs7RUFFSjtJQUFOLE1BQUEsUUFBQTtNQUVlLE9BQVYsUUFBVSxDQUFDLEtBQUQsQ0FBQTtBQUNQLFlBQUE7UUFBQSxLQUFBLEdBQVEsT0FBQyxDQUFBLGFBQUQsQ0FBa0IsS0FBbEI7ZUFDUjtVQUFBLEdBQUEsRUFBTyxPQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FBUDtVQUNBLEdBQUEsRUFBTyxPQUFDLENBQUEsZUFBRCxDQUFtQixLQUFuQixDQURQO1VBRUEsSUFBQSxFQUFPLE9BQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixDQUZQO1VBR0EsS0FBQSxFQUFPLEtBSFA7VUFJQSxLQUFBLEVBQU8sT0FBQyxDQUFBLEtBQUQsQ0FBTyxLQUFQO1FBSlA7TUFGTzs7TUFjQSxPQUFWLFFBQVUsQ0FBQyxLQUFELENBQUE7QUFFUCxZQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO1FBQUEsSUFBQSxHQUFPO1FBQ1AsSUFBQSxHQUFPO0FBQ1A7UUFBQSxLQUFBLHFDQUFBOztVQUNJLElBQUcsSUFBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLENBQUg7WUFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQVYsRUFESjtXQUFBLE1BQUE7WUFHSSxHQUFBLEdBQU07WUFDTixJQUFZLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBeEI7Y0FBQSxJQUFBLEdBQU8sRUFBUDthQUpKOztRQURKO2VBTUE7VUFBQSxHQUFBLEVBQU8sSUFBSSxDQUFD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IDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcbiMjI1xuXG5rZXljb2RlID0gcmVxdWlyZSAna2V5Y29kZSdcbmFuc2lLZXkgPSByZXF1aXJlICdhbnNpLWtleWNvZGUnXG5cbmNsYXNzIEtleWluZm9cbiAgICBcbiAgICBAZm9yRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgY29tYm8gPSBAY29tYm9Gb3JFdmVudCAgICBldmVudFxuICAgICAgICBtb2Q6ICAgQG1vZGlmaWVyc0ZvckV2ZW50IGV2ZW50XG4gICAgICAgIGtleTogICBAa2V5bmFtZUZvckV2ZW50ICAgZXZlbnRcbiAgICAgICAgY2hhcjogIEBjaGFyYWN0ZXJGb3JFdmVudCBldmVudFxuICAgICAgICBjb21ibzogY29tYm9cbiAgICAgICAgc2hvcnQ6IEBzaG9ydCBjb21ib1xuICAgIFxuICAgIEBtb2RpZmllck5hbWVzID0gWydzaGlmdCcsICdjdHJsJywgJ2FsdCcsICdjb21tYW5kJ10gXG4gICAgQG1vZGlmaWVyQ2hhcnMgPSBbJ+KMgicsICfijIMnLCAn4oylJywgJ+KMmCddXG4gICAgXG4gICAgQGljb25LZXlOYW1lcyAgPSBbJ3NoaWZ0JywgJ2N0cmwnLCAnYWx0JywgJ2NvbW1hbmQnLCAnYmFja3NwYWNlJywgJ2RlbGV0ZScsICdob21lJywgJ2VuZCcsICdwYWdlIHVwJywgJ3BhZ2UgZG93bicsICdyZXR1cm4nLCAnZW50ZXInLCAndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0JywgJ3RhYicsICdjbGljayddXG4gICAgQGljb25LZXlDaGFycyAgPSBbJ+KMgicsICfijIMnLCAn4oylJywgJ+KMmCcsICfijKsnLCAn4oymJywgJ+KGlicsICfihpgnLCAn4oeeJywgJ+KHnycsICfihqknLCAn4oapJywgJ+KGkScsICfihpMnLCAn4oaQJywgJ+KGkicsICfirbInLCAn8J+WryddXG5cbiAgICBAZm9yQ29tYm86IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIG1vZHMgPSBbXVxuICAgICAgICBjaGFyID0gbnVsbFxuICAgICAgICBmb3IgYyBpbiBjb21iby5zcGxpdCAnKydcbiAgICAgICAgICAgIGlmIEBpc01vZGlmaWVyIGNcbiAgICAgICAgICAgICAgICBtb2RzLnB1c2ggYyBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrZXkgPSBjXG4gICAgICAgICAgICAgICAgY2hhciA9IGMgaWYgYy5sZW5ndGggPT0gMSAjIGRvZXMgdGhpcyB3b3JrP1xuICAgICAgICBtb2Q6ICAgbW9kcy5qb2luICcrJ1xuICAgICAgICBrZXk6ICAga2V5XG4gICAgICAgIGNvbWJvOiBjb21ibyBcbiAgICAgICAgY2hhcjogIGNoYXJcbiAgICBcbiAgICBAaXNNb2RpZmllcjogKGtleW5hbWUpIC0+IGtleW5hbWUgaW4gQG1vZGlmaWVyTmFtZXNcblxuICAgIEBtb2RpZmllcnNGb3JFdmVudDogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIG1vZHMgPSBbXVxuICAgICAgICBtb2RzLnB1c2ggJ2NvbW1hbmQnIGlmIGV2ZW50Lm1ldGFLZXlcbiAgICAgICAgbW9kcy5wdXNoICdhbHQnICAgICBpZiBldmVudC5hbHRLZXlcbiAgICAgICAgbW9kcy5wdXNoICdjdHJsJyAgICBpZiBldmVudC5jdHJsS2V5IFxuICAgICAgICBtb2RzLnB1c2ggJ3NoaWZ0JyAgIGlmIGV2ZW50LnNoaWZ0S2V5XG4gICAgICAgIHJldHVybiBtb2RzLmpvaW4gJysnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIEBjb21ib0ZvckV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBqb2luID0gLT4gXG4gICAgICAgICAgICBhcmdzID0gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzLmZpbHRlciAoZSkgLT4gZT8ubGVuZ3RoXG4gICAgICAgICAgICBhcmdzLmpvaW4gJysnXG4gICAgXG4gICAgICAgIGtleSA9IEBrZXluYW1lRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgaWYga2V5IG5vdCBpbiBAbW9kaWZpZXJOYW1lc1xuICAgICAgICAgICAgcmV0dXJuIGpvaW4gQG1vZGlmaWVyc0ZvckV2ZW50KGV2ZW50KSwga2V5XG4gICAgICAgIHJldHVybiAnJ1xuXG4gICAgQGtleW5hbWVGb3JFdmVudDogKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAgbmFtZSA9IGtleWNvZGUgZXZlbnRcbiAgICAgICAgaWYgbm90IG5hbWU/XG4gICAgICAgICAgICBzd2l0Y2ggZXZlbnQuY29kZVxuICAgICAgICAgICAgICAgIHdoZW4gJ051bXBhZEVxdWFsJyB0aGVuIHJldHVybiAnbnVtcGFkID0nXG4gICAgICAgICAgICAgICAgd2hlbiAnTnVtcGFkNScgICAgIHRoZW4gcmV0dXJuICdudW1wYWQgNSdcbiAgICAgICAgcmV0dXJuICcnIGlmIG5hbWUgaW4gWydsZWZ0IGNvbW1hbmQnLCAncmlnaHQgY29tbWFuZCcsICdjdHJsJywgJ2FsdCcsICdzaGlmdCddXG4gICAgICAgIG5hbWVcblxuICAgIEBjaGFyYWN0ZXJGb3JFdmVudDogKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAgYW5zaSA9IGFuc2lLZXkgZXZlbnQgXG4gICAgICAgIHJldHVybiBudWxsIGlmIG5vdCBhbnNpPyBcbiAgICAgICAgcmV0dXJuIG51bGwgaWYgYW5zaS5sZW5ndGggIT0gMSBcbiAgICAgICAgcmV0dXJuIG51bGwgaWYgQG1vZGlmaWVyc0ZvckV2ZW50KGV2ZW50KSBub3QgaW4gWycnLCAnc2hpZnQnXVxuICAgICAgICByZXR1cm4gbnVsbCBpZiAvZlxcZHsxLDJ9Ly50ZXN0IEBrZXluYW1lRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgYW5zaVxuICAgICAgICBcbiAgICBAc2hvcnQ6IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbWJvID0gY29tYm8udG9Mb3dlckNhc2UoKVxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBpY29uS2V5TmFtZXMubGVuZ3RoXVxuICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlIG5ldyBSZWdFeHAoQGljb25LZXlOYW1lc1tpXSwgJ2dpJyksIEBpY29uS2V5Q2hhcnNbaV1cbiAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlIC9cXCsvZywgJydcbiAgICAgICAgY29tYm8udG9VcHBlckNhc2UoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWluZm9cbiJdfQ==
//# sourceURL=../coffee/keyinfo.coffee