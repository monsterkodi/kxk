// koffee 1.19.0

/*
000   000  00000000  000   000  000  000   000  00000000   0000000   
000  000   000        000 000   000  0000  000  000       000   000  
0000000    0000000     00000    000  000 0 000  000000    000   000  
000  000   000          000     000  000  0000  000       000   000  
000   000  00000000     000     000  000   000  000        0000000
 */
var Keyinfo, empty, os, ref,
    indexOf = [].indexOf;

ref = require('./kxk'), empty = ref.empty, os = ref.os;

Keyinfo = (function() {
    function Keyinfo() {}

    Keyinfo.forEvent = function(event) {
        var combo, info;
        combo = Keyinfo.comboForEvent(event);
        info = {
            mod: Keyinfo.modifiersForEvent(event),
            key: Keyinfo.keynameForEvent(event),
            char: Keyinfo.characterForEvent(event),
            combo: combo,
            short: Keyinfo.short(combo)
        };
        return info;
    };

    Keyinfo.modifierNames = ['shift', 'ctrl', 'alt', 'command'];

    Keyinfo.modifierChars = ['⌂', '⌃', '⌥', '⌘'];

    Keyinfo.iconKeyNames = ['shift', 'ctrl', 'alt', 'command', 'backspace', 'delete', 'home', 'end', 'page up', 'page down', 'return', 'enter', 'up', 'down', 'left', 'right', 'tab', 'space', 'click'];

    Keyinfo.iconKeyChars = ['⌂', '⌃', '⌥', '⌘', '⌫', '⌦', '↖', '↘', '⇞', '⇟', '↩', '↩', '↑', '↓', '←', '→', '⤠', '␣', '⍝'];

    Keyinfo.forCombo = function(combo) {
        var c, char, j, key, len, mods, ref1;
        mods = [];
        char = null;
        ref1 = combo.split('+');
        for (j = 0, len = ref1.length; j < len; j++) {
            c = ref1[j];
            if (this.isModifier(c)) {
                mods.push(c);
            } else {
                key = c;
                if (c.length === 1) {
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
    };

    Keyinfo.isModifier = function(keyname) {
        return indexOf.call(this.modifierNames, keyname) >= 0;
    };

    Keyinfo.modifiersForEvent = function(event) {
        var mods;
        mods = [];
        if (event.metaKey || event.key === 'Meta') {
            mods.push('command');
        }
        if (event.altKey || event.key === 'Alt') {
            mods.push('alt');
        }
        if (event.ctrlKey || event.key === 'Control') {
            mods.push('ctrl');
        }
        if (event.shiftKey || event.key === 'Shift') {
            mods.push('shift');
        }
        return mods.join('+');
    };

    Keyinfo.comboForEvent = function(event) {
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
    };

    Keyinfo.convertCmdCtrl = function(combo) {
        var index;
        index = combo.indexOf('cmdctrl');
        if (index >= 0) {
            if (os.platform() === 'darwin') {
                combo = combo.replace('cmdctrl', 'command');
                combo = combo.replace('alt+command', 'command+alt');
            } else {
                combo = combo.replace('cmdctrl', 'ctrl');
            }
        }
        return combo;
    };

    Keyinfo.keynameForEvent = function(event) {
        var ref1, ref2;
        switch (event.code) {
            case 'IntlBackslash':
            case 'Backslash':
                return '\\';
            case 'Equal':
                return '=';
            case 'Minus':
                return '-';
            case 'Plus':
                return '+';
            case 'Slash':
                return '/';
            case 'Quote':
                return "'";
            case 'Comma':
                return ',';
            case 'Period':
                return '.';
            case 'Space':
                return 'space';
            case 'Escape':
                return 'esc';
            case 'Semicolon':
                return ';';
            case 'BracketLeft':
                return '[';
            case 'BracketRight':
                return ']';
            case 'Backquote':
                return '`';
            default:
                if (event.key == null) {
                    return '';
                } else if (event.key.startsWith('Arrow')) {
                    return event.key.slice(5).toLowerCase();
                } else if (event.code.startsWith('Key')) {
                    return event.code.slice(3).toLowerCase();
                } else if (event.code.startsWith('Digit')) {
                    return event.code.slice(5);
                } else if ((ref1 = event.key) === 'Delete' || ref1 === 'Insert' || ref1 === 'Enter' || ref1 === 'Backspace' || ref1 === 'Home' || ref1 === 'End') {
                    return event.key.toLowerCase();
                } else if (event.key === 'PageUp') {
                    return 'page up';
                } else if (event.key === 'PageDown') {
                    return 'page down';
                } else if (event.key === 'Control') {
                    return 'ctrl';
                } else if (event.key === 'Meta') {
                    return 'command';
                } else if (((ref2 = this.characterForEvent(event)) != null ? ref2.length : void 0) === 1) {
                    return this.characterForEvent(event).toLowerCase();
                } else {
                    return event.key.toLowerCase();
                }
        }
    };

    Keyinfo.characterForEvent = function(event) {
        var ref1;
        if (((ref1 = event.key) != null ? ref1.length : void 0) === 1) {
            return event.key;
        } else if (event.code === 'NumpadEqual') {
            return '=';
        }
    };

    Keyinfo.short = function(combo) {
        var i, j, ref1;
        combo = this.convertCmdCtrl(combo.toLowerCase());
        for (i = j = 0, ref1 = this.iconKeyNames.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            combo = combo.replace(new RegExp(this.iconKeyNames[i], 'gi'), this.iconKeyChars[i]);
        }
        combo = combo.replace(/\+/g, '');
        return combo.toUpperCase();
    };

    return Keyinfo;

})();

module.exports = Keyinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtleWluZm8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHVCQUFBO0lBQUE7O0FBUUEsTUFBZ0IsT0FBQSxDQUFRLE9BQVIsQ0FBaEIsRUFBRSxpQkFBRixFQUFTOztBQUVIOzs7SUFFRixPQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBQSxLQUFBLEdBQVEsT0FBQyxDQUFBLGFBQUQsQ0FBZSxLQUFmO1FBQ1IsSUFBQSxHQUNJO1lBQUEsR0FBQSxFQUFPLE9BQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixDQUFQO1lBQ0EsR0FBQSxFQUFPLE9BQUMsQ0FBQSxlQUFELENBQW1CLEtBQW5CLENBRFA7WUFFQSxJQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBRlA7WUFHQSxLQUFBLEVBQU8sS0FIUDtZQUlBLEtBQUEsRUFBTyxPQUFDLENBQUEsS0FBRCxDQUFPLEtBQVAsQ0FKUDs7ZUFLSjtJQVRPOztJQVdYLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsT0FBRCxFQUFTLE1BQVQsRUFBZ0IsS0FBaEIsRUFBc0IsU0FBdEI7O0lBQ2pCLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsR0FBRCxFQUFLLEdBQUwsRUFBUyxHQUFULEVBQWEsR0FBYjs7SUFFakIsT0FBQyxDQUFBLFlBQUQsR0FBaUIsQ0FBQyxPQUFELEVBQVMsTUFBVCxFQUFnQixLQUFoQixFQUFzQixTQUF0QixFQUFnQyxXQUFoQyxFQUE0QyxRQUE1QyxFQUFxRCxNQUFyRCxFQUE0RCxLQUE1RCxFQUFrRSxTQUFsRSxFQUE0RSxXQUE1RSxFQUF3RixRQUF4RixFQUFpRyxPQUFqRyxFQUF5RyxJQUF6RyxFQUE4RyxNQUE5RyxFQUFxSCxNQUFySCxFQUE0SCxPQUE1SCxFQUFvSSxLQUFwSSxFQUEySSxPQUEzSSxF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SUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBSyxDQUFDLFdBQU4sQ0FBQSxDQUFoQjtBQUNSLGFBQVMsc0dBQVQ7WUFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFJLE1BQUosQ0FBVyxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBekIsRUFBNkIsSUFBN0IsQ0FBZCxFQUFrRCxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBaEU7QUFEWjtRQUVBLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsRUFBcUIsRUFBckI7ZUFDUixLQUFLLENBQUMsV0FBTixDQUFBO0lBTkk7Ozs7OztBQVFaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgZW1wdHksIG9zIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgS2V5aW5mb1xuICAgIFxuICAgIEBmb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjb21ibyA9IEBjb21ib0ZvckV2ZW50IGV2ZW50XG4gICAgICAgIGluZm8gPVxuICAgICAgICAgICAgbW9kOiAgIEBtb2RpZmllcnNGb3JFdmVudCBldmVudFxuICAgICAgICAgICAga2V5OiAgIEBrZXluYW1lRm9yRXZlbnQgICBldmVudFxuICAgICAgICAgICAgY2hhcjogIEBjaGFyYWN0ZXJGb3JFdmVudCBldmVudFxuICAgICAgICAgICAgY29tYm86IGNvbWJvXG4gICAgICAgICAgICBzaG9ydDogQHNob3J0IGNvbWJvXG4gICAgICAgIGluZm9cbiAgICBcbiAgICBAbW9kaWZpZXJOYW1lcyA9IFsnc2hpZnQnICdjdHJsJyAnYWx0JyAnY29tbWFuZCddIFxuICAgIEBtb2RpZmllckNoYXJzID0gWyfijIInICfijIMnICfijKUnICfijJgnXVxuICAgIFxuICAgIEBpY29uS2V5TmFtZXMgID0gWydzaGlmdCcgJ2N0cmwnICdhbHQnICdjb21tYW5kJyAnYmFja3NwYWNlJyAnZGVsZXRlJyAnaG9tZScgJ2VuZCcgJ3BhZ2UgdXAnICdwYWdlIGRvd24nICdyZXR1cm4nICdlbnRlcicgJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCcgJ3RhYicgICdzcGFjZScgJ2NsaWNrJ11cbiAgICBAaWNvbktleUNoYXJzICA9IFsn4oyCJyAn4oyDJyAn4oylJyAn4oyYJyAn4oyrJyAn4oymJyAn4oaWJyAn4oaYJyAn4oeeJyAn4oefJyAn4oapJyAn4oapJyAn4oaRJyAn4oaTJyAn4oaQJyAn4oaSJyAn4qSgJyAn4pCjJyAn4o2dJ10gIyAn4q2yJyAn8J+WrycgXVxuXG4gICAgQGZvckNvbWJvOiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBtb2RzID0gW11cbiAgICAgICAgY2hhciA9IG51bGxcbiAgICAgICAgZm9yIGMgaW4gY29tYm8uc3BsaXQgJysnXG4gICAgICAgICAgICBpZiBAaXNNb2RpZmllciBjXG4gICAgICAgICAgICAgICAgbW9kcy5wdXNoIGMgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2V5ID0gY1xuICAgICAgICAgICAgICAgIGNoYXIgPSBjIGlmIGMubGVuZ3RoID09IDEgIyBkb2VzIHRoaXMgd29yaz9cbiAgICAgICAgbW9kOiAgIG1vZHMuam9pbiAnKydcbiAgICAgICAga2V5OiAgIGtleVxuICAgICAgICBjb21ibzogY29tYm8gXG4gICAgICAgIGNoYXI6ICBjaGFyXG4gICAgXG4gICAgQGlzTW9kaWZpZXI6IChrZXluYW1lKSAtPiBrZXluYW1lIGluIEBtb2RpZmllck5hbWVzXG5cbiAgICBAbW9kaWZpZXJzRm9yRXZlbnQ6IChldmVudCkgLT4gXG5cbiAgICAgICAgbW9kcyA9IFtdXG4gICAgICAgIG1vZHMucHVzaCAnY29tbWFuZCcgaWYgZXZlbnQubWV0YUtleSAgb3IgZXZlbnQua2V5ID09ICdNZXRhJ1xuICAgICAgICBtb2RzLnB1c2ggJ2FsdCcgICAgIGlmIGV2ZW50LmFsdEtleSAgIG9yIGV2ZW50LmtleSA9PSAnQWx0J1xuICAgICAgICBtb2RzLnB1c2ggJ2N0cmwnICAgIGlmIGV2ZW50LmN0cmxLZXkgIG9yIGV2ZW50LmtleSA9PSAnQ29udHJvbCdcbiAgICAgICAgbW9kcy5wdXNoICdzaGlmdCcgICBpZiBldmVudC5zaGlmdEtleSBvciBldmVudC5rZXkgPT0gJ1NoaWZ0J1xuICAgICAgICByZXR1cm4gbW9kcy5qb2luICcrJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICBAY29tYm9Gb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgam9pbiA9IC0+IFxuICAgICAgICAgICAgYXJncyA9IFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgICAgICBhcmdzID0gYXJncy5maWx0ZXIgKGUpIC0+IGU/Lmxlbmd0aFxuICAgICAgICAgICAgYXJncy5qb2luICcrJ1xuICAgIFxuICAgICAgICBrZXkgPSBAa2V5bmFtZUZvckV2ZW50IGV2ZW50XG4gICAgICAgIGlmIGtleSBub3QgaW4gQG1vZGlmaWVyTmFtZXNcbiAgICAgICAgICAgIHJldHVybiBqb2luIEBtb2RpZmllcnNGb3JFdmVudChldmVudCksIGtleVxuICAgICAgICByZXR1cm4gJydcblxuICAgIEBjb252ZXJ0Q21kQ3RybDogKGNvbWJvKSAtPlxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBjb21iby5pbmRleE9mICdjbWRjdHJsJ1xuICAgICAgICBpZiBpbmRleCA+PSAwXG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2FsdCtjb21tYW5kJyAnY29tbWFuZCthbHQnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY3RybCcgICAgICAgICAgICBcbiAgICAgICAgY29tYm9cbiAgICAgICAgICAgICAgICBcbiAgICBAa2V5bmFtZUZvckV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggZXZlbnQuY29kZVxuICAgICAgICAgICAgd2hlbiAnSW50bEJhY2tzbGFzaCcgJ0JhY2tzbGFzaCcgICAgdGhlbiAnXFxcXCdcbiAgICAgICAgICAgIHdoZW4gJ0VxdWFsJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJz0nIFxuICAgICAgICAgICAgd2hlbiAnTWludXMnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnLScgXG4gICAgICAgICAgICB3aGVuICdQbHVzJyAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuICcrJ1xuICAgICAgICAgICAgd2hlbiAnU2xhc2gnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnLydcbiAgICAgICAgICAgIHdoZW4gJ1F1b3RlJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gXCInXCJcbiAgICAgICAgICAgIHdoZW4gJ0NvbW1hJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJywnXG4gICAgICAgICAgICB3aGVuICdQZXJpb2QnICAgICAgICAgICAgICAgICAgICAgICB0aGVuICcuJ1xuICAgICAgICAgICAgd2hlbiAnU3BhY2UnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnc3BhY2UnXG4gICAgICAgICAgICB3aGVuICdFc2NhcGUnICAgICAgICAgICAgICAgICAgICAgICB0aGVuICdlc2MnXG4gICAgICAgICAgICB3aGVuICdTZW1pY29sb24nICAgICAgICAgICAgICAgICAgICB0aGVuICc7J1xuICAgICAgICAgICAgd2hlbiAnQnJhY2tldExlZnQnICAgICAgICAgICAgICAgICAgdGhlbiAnWycgXG4gICAgICAgICAgICB3aGVuICdCcmFja2V0UmlnaHQnICAgICAgICAgICAgICAgICB0aGVuICddJyBcbiAgICAgICAgICAgIHdoZW4gJ0JhY2txdW90ZScgICAgICAgICAgICAgICAgICAgIHRoZW4gJ2AnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbm90IGV2ZW50LmtleT9cbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleS5zdGFydHNXaXRoICdBcnJvdydcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQua2V5LnNsaWNlKDUpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmNvZGUuc3RhcnRzV2l0aCAnS2V5J1xuICAgICAgICAgICAgICAgICAgICBldmVudC5jb2RlLnNsaWNlKDMpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmNvZGUuc3RhcnRzV2l0aCAnRGlnaXQnXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmNvZGUuc2xpY2UoNSlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleSBpbiBbJ0RlbGV0ZScgJ0luc2VydCcgJ0VudGVyJyAnQmFja3NwYWNlJyAnSG9tZScgJ0VuZCddXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmtleS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkgPT0gJ1BhZ2VVcCdcbiAgICAgICAgICAgICAgICAgICAgJ3BhZ2UgdXAnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkgPT0gJ1BhZ2VEb3duJ1xuICAgICAgICAgICAgICAgICAgICAncGFnZSBkb3duJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQua2V5ID09ICdDb250cm9sJ1xuICAgICAgICAgICAgICAgICAgICAnY3RybCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleSA9PSAnTWV0YSdcbiAgICAgICAgICAgICAgICAgICAgJ2NvbW1hbmQnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAY2hhcmFjdGVyRm9yRXZlbnQoZXZlbnQpPy5sZW5ndGggPT0gMSAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEBjaGFyYWN0ZXJGb3JFdmVudChldmVudCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQua2V5LnRvTG93ZXJDYXNlKCkgICAgICAgIFxuXG4gICAgQGNoYXJhY3RlckZvckV2ZW50OiAoZXZlbnQpIC0+XG5cbiAgICAgICAgaWYgZXZlbnQua2V5Py5sZW5ndGggPT0gMSBcbiAgICAgICAgICAgIGV2ZW50LmtleVxuICAgICAgICBlbHNlIGlmIGV2ZW50LmNvZGUgPT0gJ051bXBhZEVxdWFsJyBcbiAgICAgICAgICAgICc9J1xuICAgICAgICBcbiAgICBAc2hvcnQ6IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbWJvID0gQGNvbnZlcnRDbWRDdHJsIGNvbWJvLnRvTG93ZXJDYXNlKClcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5AaWNvbktleU5hbWVzLmxlbmd0aF1cbiAgICAgICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSBuZXcgUmVnRXhwKEBpY29uS2V5TmFtZXNbaV0sICdnaScpLCBAaWNvbktleUNoYXJzW2ldXG4gICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAvXFwrL2csICcnXG4gICAgICAgIGNvbWJvLnRvVXBwZXJDYXNlKClcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlpbmZvXG4iXX0=
//# sourceURL=../coffee/keyinfo.coffee