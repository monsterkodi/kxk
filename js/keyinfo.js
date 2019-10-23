// koffee 1.4.0

/*
000   000  00000000  000   000  000  000   000  00000000   0000000   
000  000   000        000 000   000  0000  000  000       000   000  
0000000    0000000     00000    000  000 0 000  000000    000   000  
000  000   000          000     000  000  0000  000       000   000  
000   000  00000000     000     000  000   000  000        0000000
 */
var Keyinfo, ansiKey, keycode, os,
    indexOf = [].indexOf;

keycode = require('keycode');

ansiKey = require('ansi-keycode');

os = require('os');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkJBQUE7SUFBQTs7QUFRQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxjQUFSOztBQUNWLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFFSjs7O0lBRUYsT0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEtBQUQ7QUFDUCxZQUFBO1FBQUEsS0FBQSxHQUFRLE9BQUMsQ0FBQSxhQUFELENBQWtCLEtBQWxCO2VBQ1I7WUFBQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBQVA7WUFDQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGVBQUQsQ0FBbUIsS0FBbkIsQ0FEUDtZQUVBLElBQUEsRUFBTyxPQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FGUDtZQUdBLEtBQUEsRUFBTyxLQUhQO1lBSUEsS0FBQSxFQUFPLE9BQUMsQ0FBQSxLQUFELENBQU8sS0FBUCxDQUpQOztJQUZPOztJQVFYLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsT0FBRCxFQUFTLE1BQVQsRUFBZ0IsS0FBaEIsRUFBc0IsU0FBdEI7O0lBQ2pCLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsR0FBRCxFQUFLLEdBQUwsRUFBUyxHQUFULEVBQWEsR0FBYjs7SUFFakIsT0FBQyxDQUFBLFlBQUQsR0FBaUIsQ0FBQyxPQUFELEVBQVMsTUFBVCxFQUFnQixLQUFoQixFQUFzQixTQUF0QixFQUFnQyxXQUFoQyxFQUE0QyxRQUE1QyxFQUFxRCxNQUFyRCxFQUE0RCxLQUE1RCxFQUFrRSxTQUFsRSxFQUE0RSxXQUE1RSxFQUF3RixRQUF4RixFQUFpRyxPQUFqRyxFQUF5RyxJQUF6RyxFQUE4RyxNQUE5RyxFQUFxSCxNQUFySCxFQUE0SCxPQUE1SCxFQUFvSSxLQUFwSSxFQUEy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T0FBTixDQUFjLElBQUksTUFBSixDQUFXLElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQSxDQUF6QixFQUE2QixJQUE3QixDQUFkLEVBQWtELElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQSxDQUFoRTtBQURaO1FBRUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBZCxFQUFxQixFQUFyQjtlQUNSLEtBQUssQ0FBQyxXQUFOLENBQUE7SUFOSTs7Ozs7O0FBUVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbjAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG4jIyNcblxua2V5Y29kZSA9IHJlcXVpcmUgJ2tleWNvZGUnXG5hbnNpS2V5ID0gcmVxdWlyZSAnYW5zaS1rZXljb2RlJ1xub3MgICAgICA9IHJlcXVpcmUgJ29zJ1xuXG5jbGFzcyBLZXlpbmZvXG4gICAgXG4gICAgQGZvckV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIGNvbWJvID0gQGNvbWJvRm9yRXZlbnQgICAgZXZlbnRcbiAgICAgICAgbW9kOiAgIEBtb2RpZmllcnNGb3JFdmVudCBldmVudFxuICAgICAgICBrZXk6ICAgQGtleW5hbWVGb3JFdmVudCAgIGV2ZW50XG4gICAgICAgIGNoYXI6ICBAY2hhcmFjdGVyRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgY29tYm86IGNvbWJvXG4gICAgICAgIHNob3J0OiBAc2hvcnQgY29tYm9cbiAgICBcbiAgICBAbW9kaWZpZXJOYW1lcyA9IFsnc2hpZnQnICdjdHJsJyAnYWx0JyAnY29tbWFuZCddIFxuICAgIEBtb2RpZmllckNoYXJzID0gWyfijIInICfijIMnICfijKUnICfijJgnXVxuICAgIFxuICAgIEBpY29uS2V5TmFtZXMgID0gWydzaGlmdCcgJ2N0cmwnICdhbHQnICdjb21tYW5kJyAnYmFja3NwYWNlJyAnZGVsZXRlJyAnaG9tZScgJ2VuZCcgJ3BhZ2UgdXAnICdwYWdlIGRvd24nICdyZXR1cm4nICdlbnRlcicgJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCcgJ3RhYicgICdzcGFjZScgJ2NsaWNrJ11cbiAgICBAaWNvbktleUNoYXJzICA9IFsn4oyCJyAn4oyDJyAn4oylJyAn4oyYJyAn4oyrJyAn4oymJyAn4oaWJyAn4oaYJyAn4oeeJyAn4oefJyAn4oapJyAn4oapJyAn4oaRJyAn4oaTJyAn4oaQJyAn4oaSJyAn4qSgJyAn4pCjJyAn4o2dJ10gIyAn4q2yJyAn8J+WrycgXVxuXG4gICAgQGZvckNvbWJvOiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBtb2RzID0gW11cbiAgICAgICAgY2hhciA9IG51bGxcbiAgICAgICAgZm9yIGMgaW4gY29tYm8uc3BsaXQgJysnXG4gICAgICAgICAgICBpZiBAaXNNb2RpZmllciBjXG4gICAgICAgICAgICAgICAgbW9kcy5wdXNoIGMgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2V5ID0gY1xuICAgICAgICAgICAgICAgIGNoYXIgPSBjIGlmIGMubGVuZ3RoID09IDEgIyBkb2VzIHRoaXMgd29yaz9cbiAgICAgICAgbW9kOiAgIG1vZHMuam9pbiAnKydcbiAgICAgICAga2V5OiAgIGtleVxuICAgICAgICBjb21ibzogY29tYm8gXG4gICAgICAgIGNoYXI6ICBjaGFyXG4gICAgXG4gICAgQGlzTW9kaWZpZXI6IChrZXluYW1lKSAtPiBrZXluYW1lIGluIEBtb2RpZmllck5hbWVzXG5cbiAgICBAbW9kaWZpZXJzRm9yRXZlbnQ6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBtb2RzID0gW11cbiAgICAgICAgbW9kcy5wdXNoICdjb21tYW5kJyBpZiBldmVudC5tZXRhS2V5XG4gICAgICAgIG1vZHMucHVzaCAnYWx0JyAgICAgaWYgZXZlbnQuYWx0S2V5XG4gICAgICAgIG1vZHMucHVzaCAnY3RybCcgICAgaWYgZXZlbnQuY3RybEtleSBcbiAgICAgICAgbW9kcy5wdXNoICdzaGlmdCcgICBpZiBldmVudC5zaGlmdEtleVxuICAgICAgICByZXR1cm4gbW9kcy5qb2luICcrJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICBAY29tYm9Gb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgam9pbiA9IC0+IFxuICAgICAgICAgICAgYXJncyA9IFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgICAgICBhcmdzID0gYXJncy5maWx0ZXIgKGUpIC0+IGU/Lmxlbmd0aFxuICAgICAgICAgICAgYXJncy5qb2luICcrJ1xuICAgIFxuICAgICAgICBrZXkgPSBAa2V5bmFtZUZvckV2ZW50IGV2ZW50XG4gICAgICAgIGlmIGtleSBub3QgaW4gQG1vZGlmaWVyTmFtZXNcbiAgICAgICAgICAgIHJldHVybiBqb2luIEBtb2RpZmllcnNGb3JFdmVudChldmVudCksIGtleVxuICAgICAgICByZXR1cm4gJydcblxuICAgIEBjb252ZXJ0Q21kQ3RybDogKGNvbWJvKSAtPlxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBjb21iby5pbmRleE9mICdjbWRjdHJsJ1xuICAgICAgICBpZiBpbmRleCA+PSAwXG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2FsdCtjb21tYW5kJyAnY29tbWFuZCthbHQnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29tYm8gPSBjb21iby5yZXBsYWNlICdjbWRjdHJsJyAnY3RybCcgICAgICAgICAgICBcbiAgICAgICAgY29tYm9cbiAgICAgICAgICAgICAgICBcbiAgICBAa2V5bmFtZUZvckV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBuYW1lID0ga2V5Y29kZSBldmVudFxuICAgICAgICBpZiBub3QgbmFtZT9cbiAgICAgICAgICAgIHN3aXRjaCBldmVudC5jb2RlXG4gICAgICAgICAgICAgICAgd2hlbiAnTnVtcGFkRXF1YWwnIHRoZW4gcmV0dXJuICdudW1wYWQgPSdcbiAgICAgICAgICAgICAgICB3aGVuICdOdW1wYWQ1JyAgICAgdGhlbiByZXR1cm4gJ251bXBhZCA1J1xuICAgICAgICByZXR1cm4gJycgaWYgbmFtZSBpbiBbJ2xlZnQgY29tbWFuZCcgJ3JpZ2h0IGNvbW1hbmQnICdjdHJsJyAnYWx0JyAnc2hpZnQnXVxuICAgICAgICBuYW1lXG5cbiAgICBAY2hhcmFjdGVyRm9yRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIGFuc2kgPSBhbnNpS2V5IGV2ZW50IFxuICAgICAgICByZXR1cm4gbnVsbCBpZiBub3QgYW5zaT8gXG4gICAgICAgIHJldHVybiBudWxsIGlmIGFuc2kubGVuZ3RoICE9IDEgXG4gICAgICAgIHJldHVybiBudWxsIGlmIEBtb2RpZmllcnNGb3JFdmVudChldmVudCkgbm90IGluIFsnJyAnc2hpZnQnXVxuICAgICAgICByZXR1cm4gbnVsbCBpZiAvZlxcZHsxLDJ9Ly50ZXN0IEBrZXluYW1lRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgYW5zaVxuICAgICAgICBcbiAgICBAc2hvcnQ6IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbWJvID0gQGNvbnZlcnRDbWRDdHJsIGNvbWJvLnRvTG93ZXJDYXNlKClcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5AaWNvbktleU5hbWVzLmxlbmd0aF1cbiAgICAgICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSBuZXcgUmVnRXhwKEBpY29uS2V5TmFtZXNbaV0sICdnaScpLCBAaWNvbktleUNoYXJzW2ldXG4gICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAvXFwrL2csICcnXG4gICAgICAgIGNvbWJvLnRvVXBwZXJDYXNlKClcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlpbmZvXG4iXX0=
//# sourceURL=../coffee/keyinfo.coffee