// koffee 1.20.0

/*
000   000  00000000  000   000  000  000   000  00000000   0000000   
000  000   000        000 000   000  0000  000  000       000   000  
0000000    0000000     00000    000  000 0 000  000000    000   000  
000  000   000          000     000  000  0000  000       000   000  
000   000  00000000     000     000  000   000  000        0000000
 */
var Keyinfo, args, os, ref,
    indexOf = [].indexOf;

ref = require('./kxk'), args = ref.args, os = ref.os;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtleWluZm8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHNCQUFBO0lBQUE7O0FBUUEsTUFBZSxPQUFBLENBQVEsT0FBUixDQUFmLEVBQUUsZUFBRixFQUFROztBQUVGOzs7SUFFRixPQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBQSxLQUFBLEdBQVEsT0FBQyxDQUFBLGFBQUQsQ0FBZSxLQUFmO1FBQ1IsSUFBQSxHQUNJO1lBQUEsR0FBQSxFQUFPLE9BQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixDQUFQO1lBQ0EsR0FBQSxFQUFPLE9BQUMsQ0FBQSxlQUFELENBQW1CLEtBQW5CLENBRFA7WUFFQSxJQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBRlA7WUFHQSxLQUFBLEVBQU8sS0FIUDtZQUlBLEtBQUEsRUFBTyxPQUFDLENBQUEsS0FBRCxDQUFPLEtBQVAsQ0FKUDs7ZUFLSjtJQVRPOztJQVdYLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsT0FBRCxFQUFTLE1BQVQsRUFBZ0IsS0FBaEIsRUFBc0IsU0FBdEI7O0lBQ2pCLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsR0FBRCxFQUFLLEdBQUwsRUFBUyxHQUFULEVBQWEsR0FBYjs7SUFFakIsT0FBQyxDQUFBLFlBQUQsR0FBaUIsQ0FBQyxPQUFELEVBQVMsTUFBVCxFQUFnQixLQUFoQixFQUFzQixTQUF0QixFQUFnQyxXQUFoQyxFQUE0QyxRQUE1QyxFQUFxRCxNQUFyRCxFQUE0RCxLQUE1RCxFQUFrRSxTQUFsRSxFQUE0RSxXQUE1RSxFQUF3RixRQUF4RixFQUFpRyxPQUFqRyxFQUF5RyxJQUF6RyxFQUE4RyxNQUE5RyxFQUFxSCxNQUFySCxFQUE0SCxPQUE1SCxFQUFvSSxLQUFwSSxFQUEySSxPQUEzSSxFQUFt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LENBQWdCLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FBaEI7QUFDUixhQUFTLHNHQUFUO1lBQ0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBSSxNQUFKLENBQVcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQXpCLEVBQTZCLElBQTdCLENBQWQsRUFBa0QsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQWhFO0FBRFo7UUFFQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLEVBQXFCLEVBQXJCO2VBQ1IsS0FBSyxDQUFDLFdBQU4sQ0FBQTtJQU5JOzs7Ozs7QUFRWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcbiMjI1xuXG57IGFyZ3MsIG9zIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgS2V5aW5mb1xuICAgIFxuICAgIEBmb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjb21ibyA9IEBjb21ib0ZvckV2ZW50IGV2ZW50XG4gICAgICAgIGluZm8gPVxuICAgICAgICAgICAgbW9kOiAgIEBtb2RpZmllcnNGb3JFdmVudCBldmVudFxuICAgICAgICAgICAga2V5OiAgIEBrZXluYW1lRm9yRXZlbnQgICBldmVudFxuICAgICAgICAgICAgY2hhcjogIEBjaGFyYWN0ZXJGb3JFdmVudCBldmVudFxuICAgICAgICAgICAgY29tYm86IGNvbWJvXG4gICAgICAgICAgICBzaG9ydDogQHNob3J0IGNvbWJvXG4gICAgICAgIGluZm9cbiAgICBcbiAgICBAbW9kaWZpZXJOYW1lcyA9IFsnc2hpZnQnICdjdHJsJyAnYWx0JyAnY29tbWFuZCddIFxuICAgIEBtb2RpZmllckNoYXJzID0gWyfijIInICfijIMnICfijKUnICfijJgnXVxuICAgIFxuICAgIEBpY29uS2V5TmFtZXMgID0gWydzaGlmdCcgJ2N0cmwnICdhbHQnICdjb21tYW5kJyAnYmFja3NwYWNlJyAnZGVsZXRlJyAnaG9tZScgJ2VuZCcgJ3BhZ2UgdXAnICdwYWdlIGRvd24nICdyZXR1cm4nICdlbnRlcicgJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCcgJ3RhYicgICdzcGFjZScgJ2NsaWNrJ11cbiAgICBAaWNvbktleUNoYXJzICA9IFsn4oyCJyAn4oyDJyAn4oylJyAn4oyYJyAn4oyrJyAn4oymJyAn4oaWJyAn4oaYJyAn4oeeJyAn4oefJyAn4oapJyAn4oapJyAn4oaRJyAn4oaTJyAn4oaQJyAn4oaSJyAn4qSgJyAn4pCjJyAn4o2dJ11cblxuICAgIEBmb3JDb21ibzogKGNvbWJvKSAtPlxuICAgICAgICBcbiAgICAgICAgbW9kcyA9IFtdXG4gICAgICAgIGNoYXIgPSBudWxsXG4gICAgICAgIGZvciBjIGluIGNvbWJvLnNwbGl0ICcrJ1xuICAgICAgICAgICAgaWYgQGlzTW9kaWZpZXIgY1xuICAgICAgICAgICAgICAgIG1vZHMucHVzaCBjIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtleSA9IGNcbiAgICAgICAgICAgICAgICBjaGFyID0gYyBpZiBjLmxlbmd0aCA9PSAxICMgZG9lcyB0aGlzIHdvcms/XG4gICAgICAgIG1vZDogICBtb2RzLmpvaW4gJysnXG4gICAgICAgIGtleTogICBrZXlcbiAgICAgICAgY29tYm86IGNvbWJvIFxuICAgICAgICBjaGFyOiAgY2hhclxuICAgIFxuICAgIEBpc01vZGlmaWVyOiAoa2V5bmFtZSkgLT4ga2V5bmFtZSBpbiBAbW9kaWZpZXJOYW1lc1xuXG4gICAgQG1vZGlmaWVyc0ZvckV2ZW50OiAoZXZlbnQpIC0+IFxuXG4gICAgICAgIG1vZHMgPSBbXVxuICAgICAgICBtb2RzLnB1c2ggJ2NvbW1hbmQnIGlmIGV2ZW50Lm1ldGFLZXkgIG9yIGV2ZW50LmtleSA9PSAnTWV0YSdcbiAgICAgICAgbW9kcy5wdXNoICdhbHQnICAgICBpZiBldmVudC5hbHRLZXkgICBvciBldmVudC5rZXkgPT0gJ0FsdCdcbiAgICAgICAgbW9kcy5wdXNoICdjdHJsJyAgICBpZiBldmVudC5jdHJsS2V5ICBvciBldmVudC5rZXkgPT0gJ0NvbnRyb2wnXG4gICAgICAgIG1vZHMucHVzaCAnc2hpZnQnICAgaWYgZXZlbnQuc2hpZnRLZXkgb3IgZXZlbnQua2V5ID09ICdTaGlmdCdcbiAgICAgICAgcmV0dXJuIG1vZHMuam9pbiAnKydcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgQGNvbWJvRm9yRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGpvaW4gPSAtPiBcbiAgICAgICAgICAgIGFyZ3MgPSBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMFxuICAgICAgICAgICAgYXJncyA9IGFyZ3MuZmlsdGVyIChlKSAtPiBlPy5sZW5ndGhcbiAgICAgICAgICAgIGFyZ3Muam9pbiAnKydcbiAgICBcbiAgICAgICAga2V5ID0gQGtleW5hbWVGb3JFdmVudCBldmVudFxuICAgICAgICBpZiBrZXkgbm90IGluIEBtb2RpZmllck5hbWVzXG4gICAgICAgICAgICByZXR1cm4gam9pbiBAbW9kaWZpZXJzRm9yRXZlbnQoZXZlbnQpLCBrZXlcbiAgICAgICAgcmV0dXJuICcnXG5cbiAgICBAY29udmVydENtZEN0cmw6IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIGluZGV4ID0gY29tYm8uaW5kZXhPZiAnY21kY3RybCdcbiAgICAgICAgaWYgaW5kZXggPj0gMFxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICAgICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAnY21kY3RybCcgJ2NvbW1hbmQnXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdhbHQrY29tbWFuZCcgJ2NvbW1hbmQrYWx0J1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAnY21kY3RybCcgJ2N0cmwnICAgICAgICAgICAgXG4gICAgICAgIGNvbWJvXG4gICAgICAgICAgICAgICAgXG4gICAgQGtleW5hbWVGb3JFdmVudDogKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGV2ZW50LmNvZGVcbiAgICAgICAgICAgIHdoZW4gJ0ludGxCYWNrc2xhc2gnICdCYWNrc2xhc2gnICAgIHRoZW4gJ1xcXFwnXG4gICAgICAgICAgICB3aGVuICdFcXVhbCcgICAgICAgICAgICAgICAgICAgICAgICB0aGVuICc9JyBcbiAgICAgICAgICAgIHdoZW4gJ01pbnVzJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJy0nIFxuICAgICAgICAgICAgd2hlbiAnUGx1cycgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnKydcbiAgICAgICAgICAgIHdoZW4gJ1NsYXNoJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJy8nXG4gICAgICAgICAgICB3aGVuICdRdW90ZScgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIFwiJ1wiXG4gICAgICAgICAgICB3aGVuICdDb21tYScgICAgICAgICAgICAgICAgICAgICAgICB0aGVuICcsJ1xuICAgICAgICAgICAgd2hlbiAnUGVyaW9kJyAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnLidcbiAgICAgICAgICAgIHdoZW4gJ1NwYWNlJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJ3NwYWNlJ1xuICAgICAgICAgICAgd2hlbiAnRXNjYXBlJyAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnZXNjJ1xuICAgICAgICAgICAgd2hlbiAnU2VtaWNvbG9uJyAgICAgICAgICAgICAgICAgICAgdGhlbiAnOydcbiAgICAgICAgICAgIHdoZW4gJ0JyYWNrZXRMZWZ0JyAgICAgICAgICAgICAgICAgIHRoZW4gJ1snIFxuICAgICAgICAgICAgd2hlbiAnQnJhY2tldFJpZ2h0JyAgICAgICAgICAgICAgICAgdGhlbiAnXScgXG4gICAgICAgICAgICB3aGVuICdCYWNrcXVvdGUnICAgICAgICAgICAgICAgICAgICB0aGVuICdgJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBldmVudC5rZXk/XG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkuc3RhcnRzV2l0aCAnQXJyb3cnXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmtleS5zbGljZSg1KS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5jb2RlLnN0YXJ0c1dpdGggJ0tleSdcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuY29kZS5zbGljZSgzKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5jb2RlLnN0YXJ0c1dpdGggJ0RpZ2l0J1xuICAgICAgICAgICAgICAgICAgICBldmVudC5jb2RlLnNsaWNlKDUpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkgaW4gWydEZWxldGUnICdJbnNlcnQnICdFbnRlcicgJ0JhY2tzcGFjZScgJ0hvbWUnICdFbmQnXVxuICAgICAgICAgICAgICAgICAgICBldmVudC5rZXkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQua2V5ID09ICdQYWdlVXAnXG4gICAgICAgICAgICAgICAgICAgICdwYWdlIHVwJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQua2V5ID09ICdQYWdlRG93bidcbiAgICAgICAgICAgICAgICAgICAgJ3BhZ2UgZG93bidcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleSA9PSAnQ29udHJvbCdcbiAgICAgICAgICAgICAgICAgICAgJ2N0cmwnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkgPT0gJ01ldGEnXG4gICAgICAgICAgICAgICAgICAgICdjb21tYW5kJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQGNoYXJhY3RlckZvckV2ZW50KGV2ZW50KT8ubGVuZ3RoID09IDEgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBAY2hhcmFjdGVyRm9yRXZlbnQoZXZlbnQpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmtleS50b0xvd2VyQ2FzZSgpICAgICAgICBcblxuICAgIEBjaGFyYWN0ZXJGb3JFdmVudDogKGV2ZW50KSAtPlxuXG4gICAgICAgIGlmIGV2ZW50LmtleT8ubGVuZ3RoID09IDEgXG4gICAgICAgICAgICBldmVudC5rZXlcbiAgICAgICAgZWxzZSBpZiBldmVudC5jb2RlID09ICdOdW1wYWRFcXVhbCcgXG4gICAgICAgICAgICAnPSdcbiAgICAgICAgXG4gICAgQHNob3J0OiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBjb21ibyA9IEBjb252ZXJ0Q21kQ3RybCBjb21iby50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGZvciBpIGluIFswLi4uQGljb25LZXlOYW1lcy5sZW5ndGhdXG4gICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgbmV3IFJlZ0V4cChAaWNvbktleU5hbWVzW2ldLCAnZ2knKSwgQGljb25LZXlDaGFyc1tpXVxuICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgL1xcKy9nLCAnJ1xuICAgICAgICBjb21iby50b1VwcGVyQ2FzZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5aW5mb1xuIl19
//# sourceURL=../coffee/keyinfo.coffee