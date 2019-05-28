// koffee 0.50.0

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
    style: function(selector, rule) {
        var i, j, r, ref;
        for (i = j = 0, ref = document.styleSheets[0].cssRules.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            r = document.styleSheets[0].cssRules[i];
            if ((r != null ? r.selectorText : void 0) === selector) {
                document.styleSheets[0].deleteRule(i);
            }
        }
        document.styleSheets[0].insertRule(selector + " { " + rule + " }", document.styleSheets[0].cssRules.length);
    },
    setStyle: function(selector, key, value, ssid) {
        var j, len, ref, rule;
        if (ssid == null) {
            ssid = 0;
        }
        ref = document.styleSheets[ssid].cssRules;
        for (j = 0, len = ref.length; j < len; j++) {
            rule = ref[j];
            if (rule.selectorText === selector) {
                rule.style[key] = value;
                return;
            }
        }
        document.styleSheets[ssid].insertRule(selector + " { " + key + ": " + value + " }", document.styleSheets[ssid].cssRules.length);
    },
    getStyle: function(selector, key, value, ssid) {
        var j, len, ref, ref1, rule;
        if (ssid == null) {
            ssid = 0;
        }
        ref = document.styleSheets[ssid].cssRules;
        for (j = 0, len = ref.length; j < len; j++) {
            rule = ref[j];
            if (rule.selectorText === selector) {
                if ((ref1 = rule.style[key]) != null ? ref1.length : void 0) {
                    return rule.style[key];
                }
            }
        }
        return value;
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBRUosTUFBTSxDQUFDLE9BQVAsR0FFSTtJQUFBLENBQUEsRUFBRyxTQUFDLGtCQUFELEVBQXFCLGNBQXJCO0FBQ0MsWUFBQTs7WUFEb0IsaUJBQWU7O1FBQ25DLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxrQkFBWCxDQUFIO1lBQ0ksSUFBRyxRQUFBLGtCQUFtQixDQUFBLENBQUEsRUFBbkIsS0FBMEIsR0FBMUIsSUFBQSxHQUFBLEtBQStCLEdBQS9CLENBQUEsSUFBdUMsY0FBQSxLQUFrQixRQUE1RDt1QkFDSSxjQUFjLENBQUMsYUFBZixDQUE2QixrQkFBN0IsRUFESjthQUFBLE1BQUE7dUJBR0ksUUFBUSxDQUFDLGNBQVQsQ0FBd0Isa0JBQXhCLEVBSEo7YUFESjtTQUFBLE1BS0ssSUFBRyxDQUFDLENBQUMsU0FBRixDQUFZLGtCQUFaLENBQUEsSUFBb0MsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxjQUFYLENBQXZDO21CQUNELGtCQUFrQixDQUFDLGFBQW5CLENBQWlDLGNBQWpDLEVBREM7U0FBQSxNQUFBO21CQUdELG1CQUhDOztJQU5OLENBQUg7SUFhQSxVQUFBLEVBQVksU0FBQyxDQUFEO2VBQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBeEIsQ0FBNkIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUExQyxFQUFzRCxDQUF0RDtJQUFQLENBYlo7SUFlQSxFQUFBLEVBQUksU0FBQTtlQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFBcEIsQ0FmSjtJQWdCQSxFQUFBLEVBQUksU0FBQTtlQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFBcEIsQ0FoQko7SUFrQkEsU0FBQSxFQUFXLFNBQUMsS0FBRDtRQUVQLElBQUcsYUFBSDs7Z0JBQ0ksS0FBSyxDQUFDOzs7Z0JBQ04sS0FBSyxDQUFDO2FBRlY7O2VBR0E7SUFMTyxDQWxCWDtJQStCQSxLQUFBLEVBQU8sU0FBQyxRQUFELEVBQVcsSUFBWDtBQUNILFlBQUE7QUFBQSxhQUFTLGdIQUFUO1lBQ0ksQ0FBQSxHQUFJLFFBQVEsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUE7WUFDckMsaUJBQUcsQ0FBQyxDQUFFLHNCQUFILEtBQW1CLFFBQXRCO2dCQUNJLFFBQVEsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBeEIsQ0FBbUMsQ0FBbkMsRUFESjs7QUFGSjtRQUlBLFFBQVEsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBeEIsQ0FBc0MsUUFBRCxHQUFVLEtBQVYsR0FBZSxJQUFmLEdBQW9CLElBQXpELEVBQThELFFBQVEsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUSxDQUFDLE1BQS9GO0lBTEcsQ0EvQlA7SUF1Q0EsUUFBQSxFQUFVLFNBQUMsUUFBRCxFQUFXLEdBQVgsRUFBZ0IsS0FBaEIsRUFBdUIsSUFBdkI7QUFDTixZQUFBOztZQUQ2QixPQUFLOztBQUNsQztBQUFBLGFBQUEscUNBQUE7O1lBQ0ksSUFBRyxJQUFJLENBQUMsWUFBTCxLQUFxQixRQUF4QjtnQkFDSSxJQUFJLENBQUMsS0FBTSxDQUFBLEdBQUEsQ0FBWCxHQUFrQjtBQUNsQix1QkFGSjs7QUFESjtRQUlBLFFBQVEsQ0FBQyxXQUFZLENBQUEsSUFBQSxDQUFLLENBQUMsVUFBM0IsQ0FBeUMsUUFBRCxHQUFVLEtBQVYsR0FBZSxHQUFmLEdBQW1CLElBQW5CLEdBQXVCLEtBQXZCLEdBQTZCLElBQXJFLEVBQTBFLFFBQVEsQ0FBQyxXQUFZLENBQUEsSUFBQSxDQUFLLENBQUMsUUFBUSxDQUFDLE1BQTlHO0lBTE0sQ0F2Q1Y7SUErQ0EsUUFBQSxFQUFVLFNBQUMsUUFBRCxFQUFXLEdBQVgsRUFBZ0IsS0FBaEIsRUFBdUIsSUFBdkI7QUFDTixZQUFBOztZQUQ2QixPQUFLOztBQUNsQztBQUFBLGFBQUEscUNBQUE7O1lBQ0ksSUFBRyxJQUFJLENBQUMsWUFBTCxLQUFxQixRQUF4QjtnQkFDSSwyQ0FBeUMsQ0FBRSxlQUEzQztBQUFBLDJCQUFPLElBQUksQ0FBQyxLQUFNLENBQUEsR0FBQSxFQUFsQjtpQkFESjs7QUFESjtBQUdBLGVBQU87SUFKRCxDQS9DViIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBcbiAgICAkOiAoaWRPclF1ZXJ5T3JFbGVtZW50LCBxdWVyeU9yRWxlbWVudD1kb2N1bWVudCkgLT5cbiAgICAgICAgaWYgXy5pc1N0cmluZyBpZE9yUXVlcnlPckVsZW1lbnRcbiAgICAgICAgICAgIGlmIGlkT3JRdWVyeU9yRWxlbWVudFswXSBpbiBbJy4nLCBcIiNcIl0gb3IgcXVlcnlPckVsZW1lbnQgIT0gZG9jdW1lbnRcbiAgICAgICAgICAgICAgICBxdWVyeU9yRWxlbWVudC5xdWVyeVNlbGVjdG9yIGlkT3JRdWVyeU9yRWxlbWVudFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkIGlkT3JRdWVyeU9yRWxlbWVudFxuICAgICAgICBlbHNlIGlmIF8uaXNFbGVtZW50KGlkT3JRdWVyeU9yRWxlbWVudCkgYW5kIF8uaXNTdHJpbmcgcXVlcnlPckVsZW1lbnRcbiAgICAgICAgICAgIGlkT3JRdWVyeU9yRWxlbWVudC5xdWVyeVNlbGVjdG9yIHF1ZXJ5T3JFbGVtZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlkT3JRdWVyeU9yRWxlbWVudFxuXG4gICAgIyBmb3IgZWxlbSBpbiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsICcuY2xhc3MnXG4gICAgICAgICAgICBcbiAgICBjaGlsZEluZGV4OiAoZSkgLT4gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCBlLnBhcmVudE5vZGUuY2hpbGROb2RlcywgZSBcblxuICAgIHN3OiAoKSAtPiBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoXG4gICAgc2g6ICgpIC0+IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG5cbiAgICBzdG9wRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGV2ZW50P1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQ/KClcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8oKVxuICAgICAgICBldmVudFxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuXG4gICAgc3R5bGU6IChzZWxlY3RvciwgcnVsZSkgLT5cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5kb2N1bWVudC5zdHlsZVNoZWV0c1swXS5jc3NSdWxlcy5sZW5ndGhdXG4gICAgICAgICAgICByID0gZG9jdW1lbnQuc3R5bGVTaGVldHNbMF0uY3NzUnVsZXNbaV1cbiAgICAgICAgICAgIGlmIHI/LnNlbGVjdG9yVGV4dCA9PSBzZWxlY3RvclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnN0eWxlU2hlZXRzWzBdLmRlbGV0ZVJ1bGUgaVxuICAgICAgICBkb2N1bWVudC5zdHlsZVNoZWV0c1swXS5pbnNlcnRSdWxlIFwiI3tzZWxlY3Rvcn0geyAje3J1bGV9IH1cIiwgZG9jdW1lbnQuc3R5bGVTaGVldHNbMF0uY3NzUnVsZXMubGVuZ3RoXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICBzZXRTdHlsZTogKHNlbGVjdG9yLCBrZXksIHZhbHVlLCBzc2lkPTApIC0+XG4gICAgICAgIGZvciBydWxlIGluIGRvY3VtZW50LnN0eWxlU2hlZXRzW3NzaWRdLmNzc1J1bGVzXG4gICAgICAgICAgICBpZiBydWxlLnNlbGVjdG9yVGV4dCA9PSBzZWxlY3RvclxuICAgICAgICAgICAgICAgIHJ1bGUuc3R5bGVba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGRvY3VtZW50LnN0eWxlU2hlZXRzW3NzaWRdLmluc2VydFJ1bGUgXCIje3NlbGVjdG9yfSB7ICN7a2V5fTogI3t2YWx1ZX0gfVwiLCBkb2N1bWVudC5zdHlsZVNoZWV0c1tzc2lkXS5jc3NSdWxlcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuXG5cbiAgICBnZXRTdHlsZTogKHNlbGVjdG9yLCBrZXksIHZhbHVlLCBzc2lkPTApIC0+XG4gICAgICAgIGZvciBydWxlIGluIGRvY3VtZW50LnN0eWxlU2hlZXRzW3NzaWRdLmNzc1J1bGVzXG4gICAgICAgICAgICBpZiBydWxlLnNlbGVjdG9yVGV4dCA9PSBzZWxlY3RvclxuICAgICAgICAgICAgICAgIHJldHVybiBydWxlLnN0eWxlW2tleV0gaWYgcnVsZS5zdHlsZVtrZXldPy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4iXX0=
//# sourceURL=../coffee/dom.coffee