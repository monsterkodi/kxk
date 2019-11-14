// koffee 1.4.0

/*
000   000  00000000  000   000  000  000   000  00000000   0000000   
000  000   000        000 000   000  0000  000  000       000   000  
0000000    0000000     00000    000  000 0 000  000000    000   000  
000  000   000          000     000  000  0000  000       000   000  
000   000  00000000     000     000  000   000  000        0000000
 */
var Keyinfo, ansiKey, keycode, klog, os,
    indexOf = [].indexOf;

keycode = require('keycode');

ansiKey = require('ansi-keycode');

os = require('os');

klog = require('./log');

Keyinfo = (function() {
    function Keyinfo() {}

    Keyinfo.forEvent = function(event) {
        var combo;
        combo = Keyinfo.comboForEvent(event);
        return {
            mod: Keyinfo.modifiersForEvent(event),
            key: Keyinfo.keynameForEvent(event),
            char: Keyinfo.characterForEvent(event),
            combo: combo,
            short: Keyinfo.short(combo)
        };
    };

    Keyinfo.modifierNames = ['shift', 'ctrl', 'alt', 'command'];

    Keyinfo.modifierChars = ['⌂', '⌃', '⌥', '⌘'];

    Keyinfo.iconKeyNames = ['shift', 'ctrl', 'alt', 'command', 'backspace', 'delete', 'home', 'end', 'page up', 'page down', 'return', 'enter', 'up', 'down', 'left', 'right', 'tab', 'space', 'click'];

    Keyinfo.iconKeyChars = ['⌂', '⌃', '⌥', '⌘', '⌫', '⌦', '↖', '↘', '⇞', '⇟', '↩', '↩', '↑', '↓', '←', '→', '⤠', '␣', '⍝'];

    Keyinfo.forCombo = function(combo) {
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
    };

    Keyinfo.characterForEvent = function(event) {
        var ansi, ref;
        switch (event.key) {
            case 'NumLock':
                return null;
            case 'Clear':
                return '=';
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
            case '+':
            case '-':
            case '/':
            case '*':
            case '=':
            case '.':
                return event.key;
        }
        ansi = ansiKey(event);
        klog('ansi', ansi, keycode(event), event.key);
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
    };

    Keyinfo.short = function(combo) {
        var i, j, ref;
        combo = this.convertCmdCtrl(combo.toLowerCase());
        for (i = j = 0, ref = this.iconKeyNames.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            combo = combo.replace(new RegExp(this.iconKeyNames[i], 'gi'), this.iconKeyChars[i]);
        }
        combo = combo.replace(/\+/g, '');
        return combo.toUpperCase();
    };

    return Keyinfo;

})();

module.exports = Keyinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUNBQUE7SUFBQTs7QUFRQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxjQUFSOztBQUNWLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixJQUFBLEdBQVUsT0FBQSxDQUFRLE9BQVI7O0FBRUo7OztJQUVGLE9BQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxLQUFEO0FBRVAsWUFBQTtRQUFBLEtBQUEsR0FBUSxPQUFDLENBQUEsYUFBRCxDQUFrQixLQUFsQjtlQUNSO1lBQUEsR0FBQSxFQUFPLE9BQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixDQUFQO1lBQ0EsR0FBQSxFQUFPLE9BQUMsQ0FBQSxlQUFELENBQW1CLEtBQW5CLENBRFA7WUFFQSxJQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBRlA7WUFHQSxLQUFBLEVBQU8sS0FIUDtZQUlBLEtBQUEsRUFBTyxPQUFDLENBQUEsS0FBRCxDQUFPLEtBQVAsQ0FKUDs7SUFITzs7SUFTWCxPQUFDLENBQUEsYUFBRCxHQUFpQixDQUFDLE9BQUQsRUFBUyxNQUFULEVBQWdCLEtBQWhCLEVBQXNCLFNBQXRCOztJQUNqQixPQUFDLENBQUEsYUFBRCxHQUFpQixDQUFDLEdBQUQsRUFBSyxHQUFMLEVBQVMsR0FBVCxFQUFhLEdBQWI7O0lBRWpCLE9BQUMsQ0FBQSxZQUFELEdBQWlCLENBQUMsT0FBRCxFQUFTLE1BQVQsRUFBZ0IsS0FBaEIsRUFBc0IsU0FBdEIsRUFBZ0MsV0FBaEMsRUFBNEMsUUFBNUMsRUFBcUQsTUFBckQsRUFBNEQsS0FBNUQsRUFBa0UsU0FBbEUsRUFBNEUsV0FBNUUsRUFBd0YsUUFBeEYsRUFBaUcsT0FBakcsRUFBeUcsSUFBekcsRUFBOEcsTUFBOUcsRUFBcUgsTUFB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QUNQLElBQUEsQ0FBSyxNQUFMLEVBQVksSUFBWixFQUFrQixPQUFBLENBQVEsS0FBUixDQUFsQixFQUFrQyxLQUFLLENBQUMsR0FBeEM7UUFDQSxJQUFtQixZQUFuQjtBQUFBLG1CQUFPLEtBQVA7O1FBQ0EsSUFBZSxJQUFJLENBQUMsTUFBTCxLQUFlLENBQTlCO0FBQUEsbUJBQU8sS0FBUDs7UUFDQSxXQUFlLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixFQUFBLEtBQWtDLEVBQWxDLElBQUEsR0FBQSxLQUFxQyxPQUFwRDtBQUFBLG1CQUFPLEtBQVA7O1FBQ0EsSUFBZSxVQUFVLENBQUMsSUFBWCxDQUFnQixJQUFDLENBQUEsZUFBRCxDQUFpQixLQUFqQixDQUFoQixDQUFmO0FBQUEsbUJBQU8sS0FBUDs7ZUFDQTtJQWJnQjs7SUFlcEIsT0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLEtBQUQ7QUFFSixZQUFBO1FBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxjQUFELENBQWdCLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FBaEI7QUFDUixhQUFTLGlHQUFUO1lBQ0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBSSxNQUFKLENBQVcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQXpCLEVBQTZCLElBQTdCLENBQWQsRUFBa0QsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQWhFO0FBRFo7UUFFQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLEVBQXFCLEVBQXJCO2VBQ1IsS0FBSyxDQUFDLFdBQU4sQ0FBQTtJQU5JOzs7Ozs7QUFRWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcbiMjI1xuXG5rZXljb2RlID0gcmVxdWlyZSAna2V5Y29kZSdcbmFuc2lLZXkgPSByZXF1aXJlICdhbnNpLWtleWNvZGUnXG5vcyAgICAgID0gcmVxdWlyZSAnb3MnXG5rbG9nICAgID0gcmVxdWlyZSAnLi9sb2cnXG5cbmNsYXNzIEtleWluZm9cbiAgICBcbiAgICBAZm9yRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGNvbWJvID0gQGNvbWJvRm9yRXZlbnQgICAgZXZlbnRcbiAgICAgICAgbW9kOiAgIEBtb2RpZmllcnNGb3JFdmVudCBldmVudFxuICAgICAgICBrZXk6ICAgQGtleW5hbWVGb3JFdmVudCAgIGV2ZW50XG4gICAgICAgIGNoYXI6ICBAY2hhcmFjdGVyRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgY29tYm86IGNvbWJvXG4gICAgICAgIHNob3J0OiBAc2hvcnQgY29tYm9cbiAgICBcbiAgICBAbW9kaWZpZXJOYW1lcyA9IFsnc2hpZnQnICdjdHJsJyAnYWx0JyAnY29tbWFuZCddIFxuICAgIEBtb2RpZmllckNoYXJzID0gWyfijIInICfijIMnICfijKUnICfijJgnXVxuICAgIFxuICAgIEBpY29uS2V5TmFtZXMgID0gWydzaGlmdCcgJ2N0cmwnICdhbHQnICdjb21tYW5kJyAnYmFja3NwYWNlJyAnZGVsZXRlJyAnaG9tZScgJ2VuZCcgJ3BhZ2UgdXAnICdwYWdlIGRvd24nICdyZXR1cm4nICdlbnRlcicgJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCcgJ3RhYicgICdzcGFjZScgJ2NsaWNrJ11cbiAgICBAaWNvbktleUNoYXJzICA9IFsn4oyCJyAn4oyDJyAn4oylJyAn4oyYJyAn4oyrJyAn4oymJyAn4oaWJyAn4oaYJyAn4oeeJyAn4oefJyAn4oapJyAn4oapJyAn4oaRJyAn4oaTJyAn4oaQJyAn4oaSJyAn4qSgJyAn4pCjJyAn4o2dJ10gIyAn4q2yJyAn8J+WrycgXVxuXG4gICAgQGZvckNvbWJvOiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBtb2RzID0gW11cbiAgICAgICAgY2hhciA9IG51bGxcbiAgICAgICAgZm9yIGMgaW4gY29tYm8uc3BsaXQgJysnXG4gICAgICAgICAgICBpZiBAaXNNb2RpZmllciBjXG4gICAgICAgICAgICAgICAgbW9kcy5wdXNoIGMgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2V5ID0gY1xuICAgICAgICAgICAgICAgIGNoYXIgPSBjIGlmIGMubGVuZ3RoID09IDEgIyBkb2VzIHRoaXMgd29yaz9cbiAgICAgICAgbW9kOiAgIG1vZHMuam9pbiAnKydcbiAgICAgICAga2V5OiAgIGtleVxuICAgICAgICBjb21ibzogY29tYm8gXG4gICAgICAgIGNoYXI6ICBjaGFyXG4gICAgXG4gICAgQGlzTW9kaWZpZXI6IChrZXluYW1lKSAtPiBrZXluYW1lIGluIEBtb2RpZmllck5hbWVzXG5cbiAgICBAbW9kaWZpZXJzRm9yRXZlbnQ6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBtb2RzID0gW11cbiAgICAgICAgbW9kcy5wdXNoICdjb21tYW5kJyBpZiBldmVudC5tZXRhS2V5XG4gICAgICAgIG1vZHMucHVzaCAnYWx0JyAgICAgaWYgZXZlbnQuYWx0S2V5XG4gICAgICAgIG1vZHMucHVzaCAnY3RybCcgICAgaWYgZXZlbnQuY3RybEtleSBcbiAgICAgICAgbW9kcy5wdXNoICdzaGlmdCcgICBpZiBldmVudC5zaGlmdEtleVxuICAgICAgICByZXR1cm4gbW9kcy5qb2luICcrJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICBAY29tYm9Gb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgam9pbiA9IC0+IFxuICAgICAgICAgICAgYXJncyA9IFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgICAgICBhcmdzID0gYXJncy5maWx0ZXIgKGUpIC0+IGU/Lmxlbmd0aFxuICAgICAgICAgICAgYXJncy5qb2luICcrJ1xuICAgIFxuICAgICAgICBrZXkgPSBAa2V5bmFtZUZvckV2ZW50IGV2ZW50XG4gICAgICAgIGlmIGtleSBub3QgaW4gQG1vZGlmaWVyTmFtZXNcbiAgICAgICAgICAgIHJldHVybiBqb2luIEBtb2RpZmllcnNGb3JFdmVudChldmVudCksIGtleVxuICAgICAgICByZXR1cm4gJydcblxuICAgIEBjb252ZXJ0Q21kQ3RybDogKGNvbWJvKSAtPlxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBjb21iby5pbmRleE9mICdjbWRjdHJsJ1xuICAgICAgICBpZiBpbmRleCA+PSAwXG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2FsdCtjb21tYW5kJyAnY29tbWFuZCthbHQnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY3RybCcgICAgICAgICAgICBcbiAgICAgICAgY29tYm9cbiAgICAgICAgICAgICAgICBcbiAgICBAa2V5bmFtZUZvckV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBuYW1lID0ga2V5Y29kZSBldmVudFxuICAgICAgICBpZiBub3QgbmFtZT9cbiAgICAgICAgICAgIHN3aXRjaCBldmVudC5jb2RlXG4gICAgICAgICAgICAgICAgd2hlbiAnTnVtcGFkRXF1YWwnIHRoZW4gcmV0dXJuICdudW1wYWQgPSdcbiAgICAgICAgICAgICAgICB3aGVuICdOdW1wYWQ1JyAgICAgdGhlbiByZXR1cm4gJ251bXBhZCA1J1xuICAgICAgICByZXR1cm4gJycgaWYgbmFtZSBpbiBbJ2xlZnQgY29tbWFuZCcgJ3JpZ2h0IGNvbW1hbmQnICdjdHJsJyAnYWx0JyAnc2hpZnQnXVxuICAgICAgICBuYW1lXG5cbiAgICBAY2hhcmFjdGVyRm9yRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBldmVudC5rZXlcbiAgICAgICAgICAgIHdoZW4gJ051bUxvY2snIHRoZW4gcmV0dXJuIG51bGxcbiAgICAgICAgICAgIHdoZW4gJ0NsZWFyJyAgIHRoZW4gcmV0dXJuICc9J1xuICAgICAgICAgICAgd2hlbiAnMScgJzInICczJyAnNCcgJzUnICc2JyAnNycgJzgnICc5JyAnMCcgJysnICctJyAnLycgJyonICc9JyAnLicgdGhlbiByZXR1cm4gZXZlbnQua2V5XG4gICAgICAgIFxuICAgICAgICBhbnNpID0gYW5zaUtleSBldmVudFxuICAgICAgICBrbG9nICdhbnNpJyBhbnNpLCBrZXljb2RlKGV2ZW50KSwgZXZlbnQua2V5XG4gICAgICAgIHJldHVybiBudWxsIGlmIG5vdCBhbnNpP1xuICAgICAgICByZXR1cm4gbnVsbCBpZiBhbnNpLmxlbmd0aCAhPSAxIFxmXGZcZlxmXGZcZlxmXGZcbiAgICAgICAgcmV0dXJuIG51bGwgaWYgQG1vZGlmaWVyc0ZvckV2ZW50KGV2ZW50KSBub3QgaW4gWycnICdzaGlmdCddXG4gICAgICAgIHJldHVybiBudWxsIGlmIC9mXFxkezEsMn0vLnRlc3QgQGtleW5hbWVGb3JFdmVudCBldmVudFxuICAgICAgICBhbnNpXG4gICAgICAgIFxuICAgIEBzaG9ydDogKGNvbWJvKSAtPlxuICAgICAgICBcbiAgICAgICAgY29tYm8gPSBAY29udmVydENtZEN0cmwgY29tYm8udG9Mb3dlckNhc2UoKVxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBpY29uS2V5TmFtZXMubGVuZ3RoXVxuICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlIG5ldyBSZWdFeHAoQGljb25LZXlOYW1lc1tpXSwgJ2dpJyksIEBpY29uS2V5Q2hhcnNbaV1cbiAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlIC9cXCsvZywgJydcbiAgICAgICAgY29tYm8udG9VcHBlckNhc2UoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWluZm9cbiJdfQ==
//# sourceURL=../coffee/keyinfo.coffee