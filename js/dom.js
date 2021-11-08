// koffee 1.19.0

/*
0000000     0000000   00     00
000   000  000   000  000   000
000   000  000   000  000000000
000   000  000   000  000 0 000
0000000     0000000   000   000
 */
var _;

_ = require('lodash');

module.exports = {
    $: function(idOrQueryOrElement, queryOrElement) {
        var ref;
        if (queryOrElement == null) {
            queryOrElement = document;
        }
        if (_.isString(idOrQueryOrElement)) {
            if (((ref = idOrQueryOrElement[0]) === '.' || ref === "#") || queryOrElement !== document) {
                return queryOrElement.querySelector(idOrQueryOrElement);
            } else {
                return document.getElementById(idOrQueryOrElement);
            }
        } else if (_.isElement(idOrQueryOrElement) && _.isString(queryOrElement)) {
            return idOrQueryOrElement.querySelector(queryOrElement);
        } else {
            return idOrQueryOrElement;
        }
    },
    childIndex: function(e) {
        return Array.prototype.indexOf.call(e.parentNode.childNodes, e);
    },
    sw: function() {
        return document.body.clientWidth;
    },
    sh: function() {
        return document.body.clientHeight;
    },
    stopEvent: function(event) {
        if (event != null) {
            if (typeof event.preventDefault === "function") {
                event.preventDefault();
            }
            if (typeof event.stopPropagation === "function") {
                event.stopPropagation();
            }
        }
        return event;
    },
    setStyle: function(selector, key, value, ssid) {
        var i, len, ref, rule;
        if (ssid == null) {
            ssid = 0;
        }
        ref = document.styleSheets[ssid].cssRules;
        for (i = 0, len = ref.length; i < len; i++) {
            rule = ref[i];
            if (rule.selectorText === selector) {
                rule.style[key] = value;
                return;
            }
        }
        document.styleSheets[ssid].insertRule(selector + " { " + key + ": " + value + " }", document.styleSheets[ssid].cssRules.length);
    },
    getStyle: function(selector, key, value, ssid) {
        var i, len, ref, ref1, rule;
        if (ssid == null) {
            ssid = 0;
        }
        ref = document.styleSheets[ssid].cssRules;
        for (i = 0, len = ref.length; i < len; i++) {
            rule = ref[i];
            if (rule.selectorText === selector) {
                if ((ref1 = rule.style[key]) != null ? ref1.length : void 0) {
                    return rule.style[key];
                }
            }
        }
        return value;
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiZG9tLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBRUosTUFBTSxDQUFDLE9BQVAsR0FFSTtJQUFBLENBQUEsRUFBRyxTQUFDLGtCQUFELEVBQXFCLGNBQXJCO0FBQ0MsWUFBQTs7WUFEb0IsaUJBQWU7O1FBQ25DLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxrQkFBWCxDQUFIO1lBQ0ksSUFBRyxRQUFBLGtCQUFtQixDQUFBLENBQUEsRUFBbkIsS0FBMEIsR0FBMUIsSUFBQSxHQUFBLEtBQThCLEdBQTlCLENBQUEsSUFBc0MsY0FBQSxLQUFrQixRQUEzRDt1QkFDSSxjQUFjLENBQUMsYUFBZixDQUE2QixrQkFBN0IsRUFESjthQUFBLE1BQUE7dUJBR0ksUUFBUSxDQUFDLGNBQVQsQ0FBd0Isa0JBQXhCLEVBSEo7YUFESjtTQUFBLE1BS0ssSUFBRyxDQUFDLENBQUMsU0FBRixDQUFZLGtCQUFaLENBQUEsSUFBb0MsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxjQUFYLENBQXZDO21CQUNELGtCQUFrQixDQUFDLGFBQW5CLENBQWlDLGNBQWpDLEVBREM7U0FBQSxNQUFBO21CQUdELG1CQUhDOztJQU5OLENBQUg7SUFXQSxVQUFBLEVBQVksU0FBQyxDQUFEO2VBQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBeEIsQ0FBNkIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUExQyxFQUFzRCxDQUF0RDtJQUFQLENBWFo7SUFhQSxFQUFBLEVBQUksU0FBQTtlQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFBcEIsQ0FiSjtJQWNBLEVBQUEsRUFBSSxTQUFBO2VBQU0sUUFBUSxDQUFDLElBQUksQ0FBQztJQUFwQixDQWRKO0lBZ0JBLFNBQUEsRUFBVyxTQUFDLEtBQUQ7UUFFUCxJQUFHLGFBQUg7O2dCQUNJLEtBQUssQ0FBQzs7O2dCQUNOLEtBQUssQ0FBQzthQUZWOztlQUdBO0lBTE8sQ0FoQlg7SUE2QkEsUUFBQSxFQUFVLFNBQUMsUUFBRCxFQUFXLEdBQVgsRUFBZ0IsS0FBaEIsRUFBdUIsSUFBdkI7QUFDTixZQUFBOztZQUQ2QixPQUFLOztBQUNsQztBQUFBLGFBQUEscUNBQUE7O1lBQ0ksSUFBRyxJQUFJLENBQUMsWUFBTCxLQUFxQixRQUF4QjtnQkFDSSxJQUFJLENBQUMsS0FBTSxDQUFBLEdBQUEsQ0FBWCxHQUFrQjtBQUNsQix1QkFGSjs7QUFESjtRQUlBLFFBQVEsQ0FBQyxXQUFZLENBQUEsSUFBQSxDQUFLLENBQUMsVUFBM0IsQ0FBeUMsUUFBRCxHQUFVLEtBQVYsR0FBZSxHQUFmLEdBQW1CLElBQW5CLEdBQXVCLEtBQXZCLEdBQTZCLElBQXJFLEVBQTBFLFFBQVEsQ0FBQyxXQUFZLENBQUEsSUFBQSxDQUFLLENBQUMsUUFBUSxDQUFDLE1BQTlHO0lBTE0sQ0E3QlY7SUFxQ0EsUUFBQSxFQUFVLFNBQUMsUUFBRCxFQUFXLEdBQVgsRUFBZ0IsS0FBaEIsRUFBdUIsSUFBdkI7QUFDTixZQUFBOztZQUQ2QixPQUFLOztBQUNsQztBQUFBLGFBQUEscUNBQUE7O1lBQ0ksSUFBRyxJQUFJLENBQUMsWUFBTCxLQUFxQixRQUF4QjtnQkFDSSwyQ0FBeUMsQ0FBRSxlQUEzQztBQUFBLDJCQUFPLElBQUksQ0FBQyxLQUFNLENBQUEsR0FBQSxFQUFsQjtpQkFESjs7QUFESjtBQUdBLGVBQU87SUFKRCxDQXJDViIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBcbiAgICAkOiAoaWRPclF1ZXJ5T3JFbGVtZW50LCBxdWVyeU9yRWxlbWVudD1kb2N1bWVudCkgLT5cbiAgICAgICAgaWYgXy5pc1N0cmluZyBpZE9yUXVlcnlPckVsZW1lbnRcbiAgICAgICAgICAgIGlmIGlkT3JRdWVyeU9yRWxlbWVudFswXSBpbiBbJy4nIFwiI1wiXSBvciBxdWVyeU9yRWxlbWVudCAhPSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIHF1ZXJ5T3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3IgaWRPclF1ZXJ5T3JFbGVtZW50XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgaWRPclF1ZXJ5T3JFbGVtZW50XG4gICAgICAgIGVsc2UgaWYgXy5pc0VsZW1lbnQoaWRPclF1ZXJ5T3JFbGVtZW50KSBhbmQgXy5pc1N0cmluZyBxdWVyeU9yRWxlbWVudFxuICAgICAgICAgICAgaWRPclF1ZXJ5T3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3IgcXVlcnlPckVsZW1lbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWRPclF1ZXJ5T3JFbGVtZW50XG5cbiAgICBjaGlsZEluZGV4OiAoZSkgLT4gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCBlLnBhcmVudE5vZGUuY2hpbGROb2RlcywgZSBcblxuICAgIHN3OiAoKSAtPiBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoXG4gICAgc2g6ICgpIC0+IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG5cbiAgICBzdG9wRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGV2ZW50P1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQ/KClcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8oKVxuICAgICAgICBldmVudFxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuXG4gICAgc2V0U3R5bGU6IChzZWxlY3Rvciwga2V5LCB2YWx1ZSwgc3NpZD0wKSAtPlxuICAgICAgICBmb3IgcnVsZSBpbiBkb2N1bWVudC5zdHlsZVNoZWV0c1tzc2lkXS5jc3NSdWxlc1xuICAgICAgICAgICAgaWYgcnVsZS5zZWxlY3RvclRleHQgPT0gc2VsZWN0b3JcbiAgICAgICAgICAgICAgICBydWxlLnN0eWxlW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBkb2N1bWVudC5zdHlsZVNoZWV0c1tzc2lkXS5pbnNlcnRSdWxlIFwiI3tzZWxlY3Rvcn0geyAje2tleX06ICN7dmFsdWV9IH1cIiwgZG9jdW1lbnQuc3R5bGVTaGVldHNbc3NpZF0uY3NzUnVsZXMubGVuZ3RoXG4gICAgICAgIHJldHVyblxuXG4gICAgZ2V0U3R5bGU6IChzZWxlY3Rvciwga2V5LCB2YWx1ZSwgc3NpZD0wKSAtPlxuICAgICAgICBmb3IgcnVsZSBpbiBkb2N1bWVudC5zdHlsZVNoZWV0c1tzc2lkXS5jc3NSdWxlc1xuICAgICAgICAgICAgaWYgcnVsZS5zZWxlY3RvclRleHQgPT0gc2VsZWN0b3JcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVsZS5zdHlsZVtrZXldIGlmIHJ1bGUuc3R5bGVba2V5XT8ubGVuZ3RoXG4gICAgICAgIHJldHVybiB2YWx1ZVxuIl19
//# sourceURL=../coffee/dom.coffee