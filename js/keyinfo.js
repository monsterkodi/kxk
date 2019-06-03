// koffee 0.56.0

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

    Keyinfo.iconKeyNames = ['shift', 'ctrl', 'alt', 'command', 'backspace', 'delete', 'home', 'end', 'page up', 'page down', 'return', 'enter', 'up', 'down', 'left', 'right', 'tab', 'click'];

    Keyinfo.iconKeyChars = ['⌂', '⌃', '⌥', '⌘', '⌫', '⌦', '↖', '↘', '⇞', '⇟', '↩', '↩', '↑', '↓', '←', '→', '⤠', '⍝'];

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5aW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkJBQUE7SUFBQTs7QUFRQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxjQUFSOztBQUNWLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFFSjs7O0lBRUYsT0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEtBQUQ7QUFDUCxZQUFBO1FBQUEsS0FBQSxHQUFRLE9BQUMsQ0FBQSxhQUFELENBQWtCLEtBQWxCO2VBQ1I7WUFBQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBQVA7WUFDQSxHQUFBLEVBQU8sT0FBQyxDQUFBLGVBQUQsQ0FBbUIsS0FBbkIsQ0FEUDtZQUVBLElBQUEsRUFBTyxPQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FGUDtZQUdBLEtBQUEsRUFBTyxLQUhQO1lBSUEsS0FBQSxFQUFPLE9BQUMsQ0FBQSxLQUFELENBQU8sS0FBUCxDQUpQOztJQUZPOztJQVFYLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsS0FBbEIsRUFBeUIsU0FBekI7O0lBQ2pCLE9BQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCOztJQUVqQixPQUFDLENBQUEsWUFBRCxHQUFpQixDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLEtBQWxCLEVBQXlCLFNBQXpCLEVBQW9DLFdBQXBDLEVBQWlELFFBQWpELEVBQTJELE1BQTNELEVBQW1FLEtBQW5FLEVBQTBFLFNBQTFFLEVBQXFGLFdBQXJGLEVBQWtHLFFBQWxHLEVBQTRHLE9BQTVHLEVBQXFILElBQXJILEVBQTJILE1BQTNILEVBQW1JLE1BQW5JLEVBQTJJLE9BQTNJLEVBQW9KLEtBQXBKLEVB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Q0FBVyxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBekIsRUFBNkIsSUFBN0IsQ0FBZCxFQUFrRCxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBaEU7QUFEWjtRQUVBLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsRUFBcUIsRUFBckI7ZUFDUixLQUFLLENBQUMsV0FBTixDQUFBO0lBTkk7Ozs7OztBQVFaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuIyMjXG5cbmtleWNvZGUgPSByZXF1aXJlICdrZXljb2RlJ1xuYW5zaUtleSA9IHJlcXVpcmUgJ2Fuc2kta2V5Y29kZSdcbm9zICAgICAgPSByZXF1aXJlICdvcydcblxuY2xhc3MgS2V5aW5mb1xuICAgIFxuICAgIEBmb3JFdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBjb21ibyA9IEBjb21ib0ZvckV2ZW50ICAgIGV2ZW50XG4gICAgICAgIG1vZDogICBAbW9kaWZpZXJzRm9yRXZlbnQgZXZlbnRcbiAgICAgICAga2V5OiAgIEBrZXluYW1lRm9yRXZlbnQgICBldmVudFxuICAgICAgICBjaGFyOiAgQGNoYXJhY3RlckZvckV2ZW50IGV2ZW50XG4gICAgICAgIGNvbWJvOiBjb21ib1xuICAgICAgICBzaG9ydDogQHNob3J0IGNvbWJvXG4gICAgXG4gICAgQG1vZGlmaWVyTmFtZXMgPSBbJ3NoaWZ0JywgJ2N0cmwnLCAnYWx0JywgJ2NvbW1hbmQnXSBcbiAgICBAbW9kaWZpZXJDaGFycyA9IFsn4oyCJywgJ+KMgycsICfijKUnLCAn4oyYJ11cbiAgICBcbiAgICBAaWNvbktleU5hbWVzICA9IFsnc2hpZnQnLCAnY3RybCcsICdhbHQnLCAnY29tbWFuZCcsICdiYWNrc3BhY2UnLCAnZGVsZXRlJywgJ2hvbWUnLCAnZW5kJywgJ3BhZ2UgdXAnLCAncGFnZSBkb3duJywgJ3JldHVybicsICdlbnRlcicsICd1cCcsICdkb3duJywgJ2xlZnQnLCAncmlnaHQnLCAndGFiJywgJ2NsaWNrJ11cbiAgICBAaWNvbktleUNoYXJzICA9IFsn4oyCJywgJ+KMgycsICfijKUnLCAn4oyYJywgJ+KMqycsICfijKYnLCAn4oaWJywgJ+KGmCcsICfih54nLCAn4oefJywgJ+KGqScsICfihqknLCAn4oaRJywgJ+KGkycsICfihpAnLCAn4oaSJywgJ+KkoCcsICfijZ0nXSAjICfirbInLCAn8J+WryddXG5cbiAgICBAZm9yQ29tYm86IChjb21ibykgLT5cbiAgICAgICAgXG4gICAgICAgIG1vZHMgPSBbXVxuICAgICAgICBjaGFyID0gbnVsbFxuICAgICAgICBmb3IgYyBpbiBjb21iby5zcGxpdCAnKydcbiAgICAgICAgICAgIGlmIEBpc01vZGlmaWVyIGNcbiAgICAgICAgICAgICAgICBtb2RzLnB1c2ggYyBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrZXkgPSBjXG4gICAgICAgICAgICAgICAgY2hhciA9IGMgaWYgYy5sZW5ndGggPT0gMSAjIGRvZXMgdGhpcyB3b3JrP1xuICAgICAgICBtb2Q6ICAgbW9kcy5qb2luICcrJ1xuICAgICAgICBrZXk6ICAga2V5XG4gICAgICAgIGNvbWJvOiBjb21ibyBcbiAgICAgICAgY2hhcjogIGNoYXJcbiAgICBcbiAgICBAaXNNb2RpZmllcjogKGtleW5hbWUpIC0+IGtleW5hbWUgaW4gQG1vZGlmaWVyTmFtZXNcblxuICAgIEBtb2RpZmllcnNGb3JFdmVudDogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIG1vZHMgPSBbXVxuICAgICAgICBtb2RzLnB1c2ggJ2NvbW1hbmQnIGlmIGV2ZW50Lm1ldGFLZXlcbiAgICAgICAgbW9kcy5wdXNoICdhbHQnICAgICBpZiBldmVudC5hbHRLZXlcbiAgICAgICAgbW9kcy5wdXNoICdjdHJsJyAgICBpZiBldmVudC5jdHJsS2V5IFxuICAgICAgICBtb2RzLnB1c2ggJ3NoaWZ0JyAgIGlmIGV2ZW50LnNoaWZ0S2V5XG4gICAgICAgIHJldHVybiBtb2RzLmpvaW4gJysnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIEBjb21ib0ZvckV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBqb2luID0gLT4gXG4gICAgICAgICAgICBhcmdzID0gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzLmZpbHRlciAoZSkgLT4gZT8ubGVuZ3RoXG4gICAgICAgICAgICBhcmdzLmpvaW4gJysnXG4gICAgXG4gICAgICAgIGtleSA9IEBrZXluYW1lRm9yRXZlbnQgZXZlbnRcbiAgICAgICAgaWYga2V5IG5vdCBpbiBAbW9kaWZpZXJOYW1lc1xuICAgICAgICAgICAgcmV0dXJuIGpvaW4gQG1vZGlmaWVyc0ZvckV2ZW50KGV2ZW50KSwga2V5XG4gICAgICAgIHJldHVybiAnJ1xuXG4gICAgQGNvbnZlcnRDbWRDdHJsOiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBpbmRleCA9IGNvbWJvLmluZGV4T2YgJ2NtZGN0cmwnXG4gICAgICAgIGlmIGluZGV4ID49IDBcbiAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2NtZGN0cmwnLCAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgJ2FsdCtjb21tYW5kJywgJ2NvbW1hbmQrYWx0J1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbWJvID0gY29tYm8ucmVwbGFjZSAnY21kY3RybCcsICdjdHJsJyAgICAgICAgICAgIFxuICAgICAgICBjb21ib1xuICAgICAgICAgICAgICAgIFxuICAgIEBrZXluYW1lRm9yRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIG5hbWUgPSBrZXljb2RlIGV2ZW50XG4gICAgICAgIGlmIG5vdCBuYW1lP1xuICAgICAgICAgICAgc3dpdGNoIGV2ZW50LmNvZGVcbiAgICAgICAgICAgICAgICB3aGVuICdOdW1wYWRFcXVhbCcgdGhlbiByZXR1cm4gJ251bXBhZCA9J1xuICAgICAgICAgICAgICAgIHdoZW4gJ051bXBhZDUnICAgICB0aGVuIHJldHVybiAnbnVtcGFkIDUnXG4gICAgICAgIHJldHVybiAnJyBpZiBuYW1lIGluIFsnbGVmdCBjb21tYW5kJywgJ3JpZ2h0IGNvbW1hbmQnLCAnY3RybCcsICdhbHQnLCAnc2hpZnQnXVxuICAgICAgICBuYW1lXG5cbiAgICBAY2hhcmFjdGVyRm9yRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIGFuc2kgPSBhbnNpS2V5IGV2ZW50IFxuICAgICAgICByZXR1cm4gbnVsbCBpZiBub3QgYW5zaT8gXG4gICAgICAgIHJldHVybiBudWxsIGlmIGFuc2kubGVuZ3RoICE9IDEgXG4gICAgICAgIHJldHVybiBudWxsIGlmIEBtb2RpZmllcnNGb3JFdmVudChldmVudCkgbm90IGluIFsnJywgJ3NoaWZ0J11cbiAgICAgICAgcmV0dXJuIG51bGwgaWYgL2ZcXGR7MSwyfS8udGVzdCBAa2V5bmFtZUZvckV2ZW50IGV2ZW50XG4gICAgICAgIGFuc2lcbiAgICAgICAgXG4gICAgQHNob3J0OiAoY29tYm8pIC0+XG4gICAgICAgIFxuICAgICAgICBjb21ibyA9IEBjb252ZXJ0Q21kQ3RybCBjb21iby50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGZvciBpIGluIFswLi4uQGljb25LZXlOYW1lcy5sZW5ndGhdXG4gICAgICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgbmV3IFJlZ0V4cChAaWNvbktleU5hbWVzW2ldLCAnZ2knKSwgQGljb25LZXlDaGFyc1tpXVxuICAgICAgICBjb21ibyA9IGNvbWJvLnJlcGxhY2UgL1xcKy9nLCAnJ1xuICAgICAgICBjb21iby50b1VwcGVyQ2FzZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5aW5mb1xuIl19
//# sourceURL=../coffee/keyinfo.coffee