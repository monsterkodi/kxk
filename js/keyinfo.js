// koffee 1.6.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUJBQUE7SUFBQTs7QUFRQSxNQUFnQixPQUFBLENBQVEsT0FBUixDQUFoQixFQUFFLGlCQUFGLEVBQVM7O0FBRUg7OztJQUVGLE9BQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxLQUFEO0FBRVAsWUFBQTtRQUFBLEtBQUEsR0FBUSxPQUFDLENBQUEsYUFBRCxDQUFlLEtBQWY7UUFDUixJQUFBLEdBQ0k7WUFBQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBQVA7WUFDQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGVBQUQsQ0FBbUIsS0FBbkIsQ0FEUDtZQUVBLElBQUEsRUFBTyxPQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FGUDtZQUdBLEtBQUEsRUFBTyxLQUhQO1lBSUEsS0FBQSxFQUFPLE9BQUMsQ0FBQSxLQUFELENBQU8sS0FBUCxDQUpQOztlQUtKO0lBVE87O0lBV1gsT0FBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQyxPQUFELEVBQVMsTUFBVCxFQUFnQixLQUFoQixFQUFzQixTQUF0Qjs7SUFDakIsT0FBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQyxHQUFELEVBQUssR0FBTCxFQUFTLEdBQVQsRUFBYSxHQUFiOztJQUVqQixPQUFDLENBQUEsWUFBRCxHQUFpQixDQUFDLE9BQUQsRUFBUyxNQUFULEVBQWdCLEtBQWhCLEVBQXNCLFNBQXRCLEVBQWdDLFdBQWhDLEVBQTRDLFFBQTVDLEVBQXFELE1BQXJELEVBQTRELEtBQTVELEVBQWtFLFNBQWxFLEVBQTRFLFdBQTVFLEVBQXdGLFFBQXhGLEVBQWlHLE9BQWpHLEVBQXlHLElBQXpHLEVBQThHLE1BQTlHLEVBQXFILE1BQXJILEVBQTRILE9BQTVILEVBQW9JLEtBQXBJLEVBQTJJLE9BQTNJLEVBQW1KLE9BQW5KOztJQUNqQixPQUFD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QUFLLENBQUMsV0FBTixDQUFBLENBQWhCO0FBQ1IsYUFBUyxzR0FBVDtZQUNJLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLElBQUksTUFBSixDQUFXLElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQSxDQUF6QixFQUE2QixJQUE3QixDQUFkLEVBQWtELElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQSxDQUFoRTtBQURaO1FBRUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBZCxFQUFxQixFQUFyQjtlQUNSLEtBQUssQ0FBQyxXQUFOLENBQUE7SUFOSTs7Ozs7O0FBUVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbjAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG4jIyNcblxueyBlbXB0eSwgb3MgfSA9IHJlcXVpcmUgJy4va3hrJ1xuXG5jbGFzcyBLZXlpbmZvXG4gICAgXG4gICAgQGZvckV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbWJvID0gQGNvbWJvRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgaW5mbyA9XG4gICAgICAgICAgICBtb2Q6ICAgQG1vZGlmaWVyc0ZvckV2ZW50IGV2ZW50XG4gICAgICAgICAgICBrZXk6ICAgQGtleW5hbWVGb3JFdmVudCAgIGV2ZW50XG4gICAgICAgICAgICBjaGFyOiAgQGNoYXJhY3RlckZvckV2ZW50IGV2ZW50XG4gICAgICAgICAgICBjb21ibzogY29tYm9cbiAgICAgICAgICAgIHNob3J0OiBAc2hvcnQgY29tYm9cbiAgICAgICAgaW5mb1xuICAgIFxuICAgIEBtb2RpZmllck5hbWVzID0gWydzaGlmdCcgJ2N0cmwnICdhbHQnICdjb21tYW5kJ10gXG4gICAgQG1vZGlmaWVyQ2hhcnMgPSBbJ+KMgicgJ+KMgycgJ+KMpScgJ+KMmCddXG4gICAgXG4gICAgQGljb25LZXlOYW1lcyAgPSBbJ3NoaWZ0JyAnY3RybCcgJ2FsdCcgJ2NvbW1hbmQnICdiYWNrc3BhY2UnICdkZWxldGUnICdob21lJyAnZW5kJyAncGFnZSB1cCcgJ3BhZ2UgZG93bicgJ3JldHVybicgJ2VudGVyJyAndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0JyAndGFiJyAgJ3NwYWNlJyAnY2xpY2snXVxuICAgIEBpY29uS2V5Q2hhcnMgID0gWyfijIInICfijIMnICfijKUnICfijJgnICfijKsnICfijKYnICfihpYnICfihpgnICfih54nICfih58nICfihqknICfihqknICfihpEnICfihpMnICfihpAnICfihpInICfipKAnICfikKMnICfijZ0nXSAjICfirbInICfwn5avJyBdXG5cbiAgICBAZm9yQ29tYm86IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIG1vZHMgPSBbXVxuICAgICAgICBjaGFyID0gbnVsbFxuICAgICAgICBmb3IgYyBpbiBjb21iby5zcGxpdCAnKydcbiAgICAgICAgICAgIGlmIEBpc01vZGlmaWVyIGNcbiAgICAgICAgICAgICAgICBtb2RzLnB1c2ggYyBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrZXkgPSBjXG4gICAgICAgICAgICAgICAgY2hhciA9IGMgaWYgYy5sZW5ndGggPT0gMSAjIGRvZXMgdGhpcyB3b3JrP1xuICAgICAgICBtb2Q6ICAgbW9kcy5qb2luICcrJ1xuICAgICAgICBrZXk6ICAga2V5XG4gICAgICAgIGNvbWJvOiBjb21ibyBcbiAgICAgICAgY2hhcjogIGNoYXJcbiAgICBcbiAgICBAaXNNb2RpZmllcjogKGtleW5hbWUpIC0+IGtleW5hbWUgaW4gQG1vZGlmaWVyTmFtZXNcblxuICAgIEBtb2RpZmllcnNGb3JFdmVudDogKGV2ZW50KSAtPiBcblxuICAgICAgICBtb2RzID0gW11cbiAgICAgICAgbW9kcy5wdXNoICdjb21tYW5kJyBpZiBldmVudC5tZXRhS2V5ICBvciBldmVudC5rZXkgPT0gJ01ldGEnXG4gICAgICAgIG1vZHMucHVzaCAnYWx0JyAgICAgaWYgZXZlbnQuYWx0S2V5ICAgb3IgZXZlbnQua2V5ID09ICdBbHQnXG4gICAgICAgIG1vZHMucHVzaCAnY3RybCcgICAgaWYgZXZlbnQuY3RybEtleSAgb3IgZXZlbnQua2V5ID09ICdDb250cm9sJ1xuICAgICAgICBtb2RzLnB1c2ggJ3NoaWZ0JyAgIGlmIGV2ZW50LnNoaWZ0S2V5IG9yIGV2ZW50LmtleSA9PSAnU2hpZnQnXG4gICAgICAgIHJldHVybiBtb2RzLmpvaW4gJysnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIEBjb21ib0ZvckV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBqb2luID0gLT4gXG4gICAgICAgICAgICBhcmdzID0gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzLmZpbHRlciAoZSkgLT4gZT8ubGVuZ3RoXG4gICAgICAgICAgICBhcmdzLmpvaW4gJysnXG4gICAgXG4gICAgICAgIGtleSA9IEBrZXluYW1lRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgaWYga2V5IG5vdCBpbiBAbW9kaWZpZXJOYW1lc1xuICAgICAgICAgICAgcmV0dXJuIGpvaW4gQG1vZGlmaWVyc0ZvckV2ZW50KGV2ZW50KSwga2V5XG4gICAgICAgIHJldHVybiAnJ1xuXG4gICAgQGNvbnZlcnRDbWRDdHJsOiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBpbmRleCA9IGNvbWJvLmluZGV4T2YgJ2NtZGN0cmwnXG4gICAgICAgIGlmIGluZGV4ID49IDBcbiAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2NtZGN0cmwnICdjb21tYW5kJ1xuICAgICAgICAgICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAnYWx0K2NvbW1hbmQnICdjb21tYW5kK2FsdCdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2NtZGN0cmwnICdjdHJsJyAgICAgICAgICAgIFxuICAgICAgICBjb21ib1xuICAgICAgICAgICAgICAgIFxuICAgIEBrZXluYW1lRm9yRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBldmVudC5jb2RlXG4gICAgICAgICAgICB3aGVuICdJbnRsQmFja3NsYXNoJyAnQmFja3NsYXNoJyAgICB0aGVuICdcXFxcJ1xuICAgICAgICAgICAgd2hlbiAnRXF1YWwnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnPScgXG4gICAgICAgICAgICB3aGVuICdNaW51cycgICAgICAgICAgICAgICAgICAgICAgICB0aGVuICctJyBcbiAgICAgICAgICAgIHdoZW4gJ1BsdXMnICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJysnXG4gICAgICAgICAgICB3aGVuICdTbGFzaCcgICAgICAgICAgICAgICAgICAgICAgICB0aGVuICcvJ1xuICAgICAgICAgICAgd2hlbiAnUXVvdGUnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBcIidcIlxuICAgICAgICAgICAgd2hlbiAnQ29tbWEnICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiAnLCdcbiAgICAgICAgICAgIHdoZW4gJ1BlcmlvZCcgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJy4nXG4gICAgICAgICAgICB3aGVuICdTcGFjZScgICAgICAgICAgICAgICAgICAgICAgICB0aGVuICdzcGFjZSdcbiAgICAgICAgICAgIHdoZW4gJ0VzY2FwZScgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gJ2VzYydcbiAgICAgICAgICAgIHdoZW4gJ1NlbWljb2xvbicgICAgICAgICAgICAgICAgICAgIHRoZW4gJzsnXG4gICAgICAgICAgICB3aGVuICdCcmFja2V0TGVmdCcgICAgICAgICAgICAgICAgICB0aGVuICdbJyBcbiAgICAgICAgICAgIHdoZW4gJ0JyYWNrZXRSaWdodCcgICAgICAgICAgICAgICAgIHRoZW4gJ10nIFxuICAgICAgICAgICAgd2hlbiAnQmFja3F1b3RlJyAgICAgICAgICAgICAgICAgICAgdGhlbiAnYCdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBub3QgZXZlbnQua2V5P1xuICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQua2V5LnN0YXJ0c1dpdGggJ0Fycm93J1xuICAgICAgICAgICAgICAgICAgICBldmVudC5rZXkuc2xpY2UoNSkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQuY29kZS5zdGFydHNXaXRoICdLZXknXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmNvZGUuc2xpY2UoMykudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQuY29kZS5zdGFydHNXaXRoICdEaWdpdCdcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuY29kZS5zbGljZSg1KVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQua2V5IGluIFsnRGVsZXRlJyAnSW5zZXJ0JyAnRW50ZXInICdCYWNrc3BhY2UnICdIb21lJyAnRW5kJ11cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQua2V5LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleSA9PSAnUGFnZVVwJ1xuICAgICAgICAgICAgICAgICAgICAncGFnZSB1cCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmtleSA9PSAnUGFnZURvd24nXG4gICAgICAgICAgICAgICAgICAgICdwYWdlIGRvd24nXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBldmVudC5rZXkgPT0gJ0NvbnRyb2wnXG4gICAgICAgICAgICAgICAgICAgICdjdHJsJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQua2V5ID09ICdNZXRhJ1xuICAgICAgICAgICAgICAgICAgICAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBjaGFyYWN0ZXJGb3JFdmVudChldmVudCk/Lmxlbmd0aCA9PSAxICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgQGNoYXJhY3RlckZvckV2ZW50KGV2ZW50KS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBldmVudC5rZXkudG9Mb3dlckNhc2UoKSAgICAgICAgXG5cbiAgICBAY2hhcmFjdGVyRm9yRXZlbnQ6IChldmVudCkgLT5cblxuICAgICAgICBpZiBldmVudC5rZXk/Lmxlbmd0aCA9PSAxIFxuICAgICAgICAgICAgZXZlbnQua2V5XG4gICAgICAgIGVsc2UgaWYgZXZlbnQuY29kZSA9PSAnTnVtcGFkRXF1YWwnIFxuICAgICAgICAgICAgJz0nXG4gICAgICAgIFxuICAgIEBzaG9ydDogKGNvbWJvKSAtPlxuICAgICAgICBcbiAgICAgICAgY29tYm8gPSBAY29udmVydENtZEN0cmwgY29tYm8udG9Mb3dlckNhc2UoKVxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBpY29uS2V5TmFtZXMubGVuZ3RoXVxuICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlIG5ldyBSZWdFeHAoQGljb25LZXlOYW1lc1tpXSwgJ2dpJyksIEBpY29uS2V5Q2hhcnNbaV1cbiAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlIC9cXCsvZywgJydcbiAgICAgICAgY29tYm8udG9VcHBlckNhc2UoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWluZm9cbiJdfQ==
//# sourceURL=../coffee/keyinfo.coffee