// koffee 1.4.0

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
                } else if (event.code.startsWith('Digit')) {
                    return event.code.slice(5);
                } else if ((ref1 = event.key) === 'Delete' || ref1 === 'Insert' || ref1 === 'Enter' || ref1 === 'Backspace' || ref1 === 'Home' || ref1 === 'End') {
                    return event.key.toLowerCase();
                } else if (event.key === 'PageUp') {
                    return 'page up';
                } else if (event.key === 'Control') {
                    return 'ctrl';
                } else if (event.key === 'Meta') {
                    return 'command';
                } else if (event.key === 'PageDown') {
                    return 'page down';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUJBQUE7SUFBQTs7QUFRQSxNQUFnQixPQUFBLENBQVEsT0FBUixDQUFoQixFQUFFLGlCQUFGLEVBQVM7O0FBRUg7OztJQUVGLE9BQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxLQUFEO0FBRVAsWUFBQTtRQUFBLEtBQUEsR0FBUSxPQUFDLENBQUEsYUFBRCxDQUFlLEtBQWY7UUFDUixJQUFBLEdBQ0k7WUFBQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBQVA7WUFDQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGVBQUQsQ0FBbUIsS0FBbkIsQ0FEUDtZQUVBLElBQUEsRUFBTyxPQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FGUDtZQUdBLEtBQUEsRUFBTyxLQUhQO1lBSUEsS0FBQSxFQUFPLE9BQUMsQ0FBQSxLQUFELENBQU8sS0FBUCxDQUpQOztlQUtKO0lBVE87O0lBV1gsT0FBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQyxPQUFELEVBQVMsTUFBVCxFQUFnQixLQUFoQixFQUFzQixTQUF0Qjs7SUFDakIsT0FBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQyxHQUFELEVBQUssR0FBTCxFQUFTLEdBQVQsRUFBYSxHQUFiOztJQUVqQixPQUFDLENBQUEsWUFBRCxHQUFpQixDQUFDLE9BQUQsRUFBUyxNQUFULEVBQWdCLEtBQWhCLEVBQXNCLFNBQXRCLEVBQWdDLFdBQWhDLEVBQTRDLFFBQTVDLEVBQXFELE1BQXJELEVBQTRELEtBQTVELEVBQWtFLFNBQWxFLEVBQTRFLFdBQTVFLEVBQXdGLFFBQXhGLEVBQWlHLE9BQWpHLEVBQXlHLElBQXpHLEVBQThHLE1BQTlHLEVBQXFILE1BQXJILEVBQTRILE9BQTVILEVBQW9JLEtBQXBJLEVBQTJJLE9BQTNJLEVBQW1KLE9BQW5KOztJQUNqQixPQUFD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SUFBN0IsQ0FBZCxFQUFrRCxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBaEU7QUFEWjtRQUVBLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsRUFBcUIsRUFBckI7ZUFDUixLQUFLLENBQUMsV0FBTixDQUFBO0lBTkk7Ozs7OztBQVFaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgZW1wdHksIG9zIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgS2V5aW5mb1xuICAgIFxuICAgIEBmb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjb21ibyA9IEBjb21ib0ZvckV2ZW50IGV2ZW50XG4gICAgICAgIGluZm8gPVxuICAgICAgICAgICAgbW9kOiAgIEBtb2RpZmllcnNGb3JFdmVudCBldmVudFxuICAgICAgICAgICAga2V5OiAgIEBrZXluYW1lRm9yRXZlbnQgICBldmVudFxuICAgICAgICAgICAgY2hhcjogIEBjaGFyYWN0ZXJGb3JFdmVudCBldmVudFxuICAgICAgICAgICAgY29tYm86IGNvbWJvXG4gICAgICAgICAgICBzaG9ydDogQHNob3J0IGNvbWJvXG4gICAgICAgIGluZm9cbiAgICBcbiAgICBAbW9kaWZpZXJOYW1lcyA9IFsnc2hpZnQnICdjdHJsJyAnYWx0JyAnY29tbWFuZCddIFxuICAgIEBtb2RpZmllckNoYXJzID0gWyfijIInICfijIMnICfijKUnICfijJgnXVxuICAgIFxuICAgIEBpY29uS2V5TmFtZXMgID0gWydzaGlmdCcgJ2N0cmwnICdhbHQnICdjb21tYW5kJyAnYmFja3NwYWNlJyAnZGVsZXRlJyAnaG9tZScgJ2VuZCcgJ3BhZ2UgdXAnICdwYWdlIGRvd24nICdyZXR1cm4nICdlbnRlcicgJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCcgJ3RhYicgICdzcGFjZScgJ2NsaWNrJ11cbiAgICBAaWNvbktleUNoYXJzICA9IFsn4oyCJyAn4oyDJyAn4oylJyAn4oyYJyAn4oyrJyAn4oymJyAn4oaWJyAn4oaYJyAn4oeeJyAn4oefJyAn4oapJyAn4oapJyAn4oaRJyAn4oaTJyAn4oaQJyAn4oaSJyAn4qSgJyAn4pCjJyAn4o2dJ10gIyAn4q2yJyAn8J+WrycgXVxuXG4gICAgQGZvckNvbWJvOiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBtb2RzID0gW11cbiAgICAgICAgY2hhciA9IG51bGxcbiAgICAgICAgZm9yIGMgaW4gY29tYm8uc3BsaXQgJysnXG4gICAgICAgICAgICBpZiBAaXNNb2RpZmllciBjXG4gICAgICAgICAgICAgICAgbW9kcy5wdXNoIGMgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2V5ID0gY1xuICAgICAgICAgICAgICAgIGNoYXIgPSBjIGlmIGMubGVuZ3RoID09IDEgIyBkb2VzIHRoaXMgd29yaz9cbiAgICAgICAgbW9kOiAgIG1vZHMuam9pbiAnKydcbiAgICAgICAga2V5OiAgIGtleVxuICAgICAgICBjb21ibzogY29tYm8gXG4gICAgICAgIGNoYXI6ICBjaGFyXG4gICAgXG4gICAgQGlzTW9kaWZpZXI6IChrZXluYW1lKSAtPiBrZXluYW1lIGluIEBtb2RpZmllck5hbWVzXG5cbiAgICBAbW9kaWZpZXJzRm9yRXZlbnQ6IChldmVudCkgLT4gXG5cbiAgICAgICAgbW9kcyA9IFtdXG4gICAgICAgIG1vZHMucHVzaCAnY29tbWFuZCcgaWYgZXZlbnQubWV0YUtleSAgb3IgZXZlbnQua2V5ID09ICdNZXRhJ1xuICAgICAgICBtb2RzLnB1c2ggJ2FsdCcgICAgIGlmIGV2ZW50LmFsdEtleSAgIG9yIGV2ZW50LmtleSA9PSAnQWx0J1xuICAgICAgICBtb2RzLnB1c2ggJ2N0cmwnICAgIGlmIGV2ZW50LmN0cmxLZXkgIG9yIGV2ZW50LmtleSA9PSAnQ29udHJvbCdcbiAgICAgICAgbW9kcy5wdXNoICdzaGlmdCcgICBpZiBldmVudC5zaGlmdEtleSBvciBldmVudC5rZXkgPT0gJ1NoaWZ0J1xuICAgICAgICByZXR1cm4gbW9kcy5qb2luICcrJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICBAY29tYm9Gb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgam9pbiA9IC0+IFxuICAgICAgICAgICAgYXJncyA9IFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgICAgICBhcmdzID0gYXJncy5maWx0ZXIgKGUpIC0+IGU/Lmxlbmd0aFxuICAgICAgICAgICAgYXJncy5qb2luICcrJ1xuICAgIFxuICAgICAgICBrZXkgPSBAa2V5bmFtZUZvckV2ZW50IGV2ZW50XG4gICAgICAgIGlmIGtleSBub3QgaW4gQG1vZGlmaWVyTmFtZXNcbiAgICAgICAgICAgIHJldHVybiBqb2luIEBtb2RpZmllcnNGb3JFdmVudChldmVudCksIGtleVxuICAgICAgICByZXR1cm4gJydcblxuICAgIEBjb252ZXJ0Q21kQ3RybDogKGNvbWJvKSAtPlxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBjb21iby5pbmRleE9mICdjbWRjdHJsJ1xuICAgICAgICBpZiBpbmRleCA+PSAwXG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2FsdCtjb21tYW5kJyAnY29tbWFuZCthbHQnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY3RybCcgICAgICAgICAgICBcbiAgICAgICAgY29tYm9cbiAgICAgICAgICAgICAgICBcbiAgICBAa2V5bmFtZUZvckV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggZXZlbnQuY29kZVxuICAgICAgICAgICAgd2hlbiAnSW50bEJhY2tzbGFzaCcgJ0JhY2tzbGFzaCcgICAgdGhlbiAnXFxcXCdcbiAgICAgICAgICAgIHdoZW4gJ0VxdWFsJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJz0nIFxuICAgICAgICAgICAgd2hlbiAnTWludXMnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnLScgXG4gICAgICAgICAgICB3aGVuICdQbHVzJyAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuICcrJ1xuICAgICAgICAgICAgd2hlbiAnU2xhc2gnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnLydcbiAgICAgICAgICAgIHdoZW4gJ1F1b3RlJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gXCInXCJcbiAgICAgICAgICAgIHdoZW4gJ0NvbW1hJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJywnXG4gICAgICAgICAgICB3aGVuICdQZXJpb2QnICAgICAgICAgICAgICAgICAgICAgICB0aGVuICcuJ1xuICAgICAgICAgICAgd2hlbiAnU3BhY2UnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnc3BhY2UnXG4gICAgICAgICAgICB3aGVuICdFc2NhcGUnICAgICAgICAgICAgICAgICAgICAgICB0aGVuICdlc2MnXG4gICAgICAgICAgICB3aGVuICdTZW1pY29sb24nICAgICAgICAgICAgICAgICAgICB0aGVuICc7J1xuICAgICAgICAgICAgd2hlbiAnQnJhY2tldExlZnQnICAgICAgICAgICAgICAgICAgdGhlbiAnWycgXG4gICAgICAgICAgICB3aGVuICdCcmFja2V0UmlnaHQnICAgICAgICAgICAgICAgICB0aGVuICddJyBcbiAgICAgICAgICAgIHdoZW4gJ0JhY2txdW90ZScgICAgICAgICAgICAgICAgICAgIHRoZW4gJ2AnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbm90IGV2ZW50LmtleT9cbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleS5zdGFydHNXaXRoICdBcnJvdydcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQua2V5LnNsaWNlKDUpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmNvZGUuc3RhcnRzV2l0aCAnRGlnaXQnXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmNvZGUuc2xpY2UoNSlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleSBpbiBbJ0RlbGV0ZScgJ0luc2VydCcgJ0VudGVyJyAnQmFja3NwYWNlJyAnSG9tZScgJ0VuZCddXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmtleS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkgPT0gJ1BhZ2VVcCdcbiAgICAgICAgICAgICAgICAgICAgJ3BhZ2UgdXAnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkgPT0gJ0NvbnRyb2wnXG4gICAgICAgICAgICAgICAgICAgICdjdHJsJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQua2V5ID09ICdNZXRhJ1xuICAgICAgICAgICAgICAgICAgICAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleSA9PSAnUGFnZURvd24nXG4gICAgICAgICAgICAgICAgICAgICdwYWdlIGRvd24nXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAY2hhcmFjdGVyRm9yRXZlbnQoZXZlbnQpPy5sZW5ndGggPT0gMSAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEBjaGFyYWN0ZXJGb3JFdmVudChldmVudCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQua2V5LnRvTG93ZXJDYXNlKCkgICAgICAgIFxuXG4gICAgQGNoYXJhY3RlckZvckV2ZW50OiAoZXZlbnQpIC0+XG5cbiAgICAgICAgaWYgZXZlbnQua2V5Py5sZW5ndGggPT0gMSBcbiAgICAgICAgICAgIGV2ZW50LmtleVxuICAgICAgICBlbHNlIGlmIGV2ZW50LmNvZGUgPT0gJ051bXBhZEVxdWFsJyBcbiAgICAgICAgICAgICc9J1xuICAgICAgICBcbiAgICBAc2hvcnQ6IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbWJvID0gQGNvbnZlcnRDbWRDdHJsIGNvbWJvLnRvTG93ZXJDYXNlKClcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5AaWNvbktleU5hbWVzLmxlbmd0aF1cbiAgICAgICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSBuZXcgUmVnRXhwKEBpY29uS2V5TmFtZXNbaV0sICdnaScpLCBAaWNvbktleUNoYXJzW2ldXG4gICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAvXFwrL2csICcnXG4gICAgICAgIGNvbWJvLnRvVXBwZXJDYXNlKClcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlpbmZvXG4iXX0=
//# sourceURL=../coffee/keyinfo.coffee