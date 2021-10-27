// koffee 1.14.0

/*
 0000000    0000000   00     00  00000000  00000000    0000000   0000000  
000        000   000  000   000  000       000   000  000   000  000   000
000  0000  000000000  000000000  0000000   00000000   000000000  000   000
000   000  000   000  000 0 000  000       000        000   000  000   000
 0000000   000   000  000   000  00000000  000        000   000  0000000
 */
var Gamepad, events,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

events = require('events');

Gamepad = (function(superClass) {
    extend(Gamepad, superClass);

    function Gamepad(doPoll) {
        if (doPoll == null) {
            doPoll = true;
        }
        this.poll = bind(this.poll, this);
        this.btns = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'LS', 'RS', 'Up', 'Down', 'Left', 'Right', 'Menu'];
        this.state = {
            buttons: {},
            left: {
                x: 0,
                y: 0
            },
            right: {
                x: 0,
                y: 0
            }
        };
        this.deadZone = 0.1;
        this.continuous = false;
        if (doPoll && 'function' === typeof (typeof navigator !== "undefined" && navigator !== null ? navigator.getGamepads : void 0)) {
            this.init();
        }
    }

    Gamepad.prototype.init = function() {
        return window.addEventListener('gamepadconnected', (function(_this) {
            return function(event) {
                if (event.gamepad.index === 0 && event.gamepad.axes.length >= 4) {
                    return window.requestAnimationFrame(_this.poll);
                }
            };
        })(this));
    };

    Gamepad.prototype.axisValue = function(value) {
        if (Math.abs(value) < this.deadZone) {
            return 0;
        }
        return value;
    };

    Gamepad.prototype.getState = function() {
        var button, i, index, pad, ref, state, x, y;
        if (pad = typeof navigator.getGamepads === "function" ? navigator.getGamepads()[0] : void 0) {
            state = {
                buttons: {}
            };
            for (index = i = 0, ref = pad.buttons.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
                button = pad.buttons[index];
                if (button.pressed) {
                    state.buttons[this.btns[index]] = button.value;
                }
            }
            x = this.axisValue(pad.axes[0]);
            y = this.axisValue(-pad.axes[1]);
            state.left = {
                x: x,
                y: y
            };
            x = this.axisValue(pad.axes[2]);
            y = this.axisValue(-pad.axes[3]);
            state.right = {
                x: x,
                y: y
            };
            return state;
        }
    };

    Gamepad.prototype.poll = function() {
        var button, changed, i, index, pad, ref, state, x, y;
        if (pad = typeof navigator.getGamepads === "function" ? navigator.getGamepads()[0] : void 0) {
            state = {};
            changed = false;
            for (index = i = 0, ref = pad.buttons.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
                button = pad.buttons[index];
                if (button.pressed) {
                    state[this.btns[index]] = button.value;
                    if (!this.state.buttons[this.btns[index]]) {
                        this.emit('button', this.btns[index], 1);
                        changed = true;
                    }
                } else if (this.state.buttons[this.btns[index]]) {
                    this.emit('button', this.btns[index], 0);
                    changed = true;
                }
            }
            this.state.buttons = state;
            if (changed) {
                this.emit('buttons', this.state.buttons);
            }
            changed = false;
            x = this.axisValue(pad.axes[0]);
            y = this.axisValue(-pad.axes[1]);
            if (x !== this.state.left.x || y !== this.state.left.y) {
                this.state.left = {
                    x: x,
                    y: y
                };
                changed = true;
            }
            x = this.axisValue(pad.axes[2]);
            y = this.axisValue(-pad.axes[3]);
            if (x !== this.state.right.x || y !== this.state.right.y) {
                this.state.right = {
                    x: x,
                    y: y
                };
                changed = true;
            }
            if (changed || this.continuous) {
                this.emit('axis', this.state);
            }
            return window.requestAnimationFrame(this.poll);
        }
    };

    return Gamepad;

})(events);

module.exports = Gamepad;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZXBhZC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImdhbWVwYWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGVBQUE7SUFBQTs7OztBQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsTUFBRDs7WUFBQyxTQUFPOzs7UUFFUCxJQUFDLENBQUEsSUFBRCxHQUFRLENBQUMsR0FBRCxFQUFJLEdBQUosRUFBTyxHQUFQLEVBQVUsR0FBVixFQUFhLElBQWIsRUFBaUIsSUFBakIsRUFBcUIsSUFBckIsRUFBeUIsSUFBekIsRUFBNkIsTUFBN0IsRUFBbUMsT0FBbkMsRUFBMEMsSUFBMUMsRUFBOEMsSUFBOUMsRUFBa0QsSUFBbEQsRUFBc0QsTUFBdEQsRUFBNEQsTUFBNUQsRUFBa0UsT0FBbEUsRUFBeUUsTUFBekU7UUFDUixJQUFDLENBQUEsS0FBRCxHQUFTO1lBQUEsT0FBQSxFQUFRLEVBQVI7WUFBWSxJQUFBLEVBQUs7Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7YUFBakI7WUFBNEIsS0FBQSxFQUFNO2dCQUFDLENBQUEsRUFBRSxDQUFIO2dCQUFLLENBQUEsRUFBRSxDQUFQO2FBQWxDOztRQUNULElBQUMsQ0FBQSxRQUFELEdBQVk7UUFDWixJQUFDLENBQUEsVUFBRCxHQUFjO1FBRWQsSUFBRyxNQUFBLElBQVcsVUFBQSxLQUFjLGlFQUFPLFNBQVMsQ0FBRSxxQkFBOUM7WUFDSSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBREo7O0lBUEQ7O3NCQWdCSCxJQUFBLEdBQU0sU0FBQTtlQUVGLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixrQkFBeEIsRUFBMkMsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxLQUFEO2dCQUN2QyxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBZCxLQUF1QixDQUF2QixJQUE2QixLQUFLLENB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MDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuIyMjXG5cbmV2ZW50cyA9IHJlcXVpcmUgJ2V2ZW50cydcblxuY2xhc3MgR2FtZXBhZCBleHRlbmRzIGV2ZW50c1xuXG4gICAgQDogKGRvUG9sbD10cnVlKSAtPiBcbiAgICBcbiAgICAgICAgQGJ0bnMgPSBbJ0EnJ0InJ1gnJ1knJ0xCJydSQicnTFQnJ1JUJydCYWNrJydTdGFydCcnTFMnJ1JTJydVcCcnRG93bicnTGVmdCcnUmlnaHQnJ01lbnUnXVxuICAgICAgICBAc3RhdGUgPSBidXR0b25zOnt9LCBsZWZ0Ont4OjAseTowfSwgcmlnaHQ6e3g6MCx5OjB9XG4gICAgICAgIEBkZWFkWm9uZSA9IDAuMVxuICAgICAgICBAY29udGludW91cyA9IGZhbHNlXG5cbiAgICAgICAgaWYgZG9Qb2xsIGFuZCAnZnVuY3Rpb24nID09IHR5cGVvZiBuYXZpZ2F0b3I/LmdldEdhbWVwYWRzXG4gICAgICAgICAgICBAaW5pdCgpXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5pdDogLT5cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnZ2FtZXBhZGNvbm5lY3RlZCcgKGV2ZW50KSA9PlxuICAgICAgICAgICAgaWYgZXZlbnQuZ2FtZXBhZC5pbmRleCA9PSAwIGFuZCBldmVudC5nYW1lcGFkLmF4ZXMubGVuZ3RoID49IDRcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBwb2xsXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGF4aXNWYWx1ZTogKHZhbHVlKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgTWF0aC5hYnModmFsdWUpIDwgQGRlYWRab25lIHRoZW4gcmV0dXJuIDBcbiAgICAgICAgdmFsdWVcbiAgIFxuICAgIGdldFN0YXRlOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgcGFkID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzPygpWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXRlID0gYnV0dG9uczoge31cbiAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnBhZC5idXR0b25zLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBidXR0b24gPSBwYWQuYnV0dG9uc1tpbmRleF1cbiAgICAgICAgICAgICAgICBpZiBidXR0b24ucHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5idXR0b25zW0BidG5zW2luZGV4XV0gPSBidXR0b24udmFsdWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeCA9IEBheGlzVmFsdWUgIHBhZC5heGVzWzBdXG4gICAgICAgICAgICB5ID0gQGF4aXNWYWx1ZSAtcGFkLmF4ZXNbMV1cbiAgICAgICAgICAgIHN0YXRlLmxlZnQgPSB4OngsIHk6eSBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHggPSBAYXhpc1ZhbHVlICBwYWQuYXhlc1syXVxuICAgICAgICAgICAgeSA9IEBheGlzVmFsdWUgLXBhZC5heGVzWzNdXG4gICAgICAgICAgICBzdGF0ZS5yaWdodCA9IHg6eCwgeTp5IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3RhdGVcbiAgICAgICAgXG4gICAgcG9sbDogPT5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBwYWQgPSBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHM/KClbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhdGUgPSB7fVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGFuZ2VkID0gZmFsc2VcbiAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnBhZC5idXR0b25zLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBidXR0b24gPSBwYWQuYnV0dG9uc1tpbmRleF1cbiAgICAgICAgICAgICAgICBpZiBidXR0b24ucHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZVtAYnRuc1tpbmRleF1dID0gYnV0dG9uLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBAc3RhdGUuYnV0dG9uc1tAYnRuc1tpbmRleF1dXG4gICAgICAgICAgICAgICAgICAgICAgICBAZW1pdCAnYnV0dG9uJyBAYnRuc1tpbmRleF0sIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhdGUuYnV0dG9uc1tAYnRuc1tpbmRleF1dXG4gICAgICAgICAgICAgICAgICAgIEBlbWl0ICdidXR0b24nIEBidG5zW2luZGV4XSwgMFxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBzdGF0ZS5idXR0b25zID0gc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaGFuZ2VkIFxuICAgICAgICAgICAgICAgIEBlbWl0ICdidXR0b25zJyBAc3RhdGUuYnV0dG9uc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGFuZ2VkID0gZmFsc2UgXG4gICAgICAgICAgICB4ID0gQGF4aXNWYWx1ZSAgcGFkLmF4ZXNbMF1cbiAgICAgICAgICAgIHkgPSBAYXhpc1ZhbHVlIC1wYWQuYXhlc1sxXVxuICAgICAgICAgICAgaWYgeCAhPSBAc3RhdGUubGVmdC54IG9yIHkgIT0gQHN0YXRlLmxlZnQueVxuICAgICAgICAgICAgICAgIEBzdGF0ZS5sZWZ0ID0geDp4LCB5OnkgXG4gICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHggPSBAYXhpc1ZhbHVlICBwYWQuYXhlc1syXVxuICAgICAgICAgICAgeSA9IEBheGlzVmFsdWUgLXBhZC5heGVzWzNdXG4gICAgICAgICAgICBpZiB4ICE9IEBzdGF0ZS5yaWdodC54IG9yIHkgIT0gQHN0YXRlLnJpZ2h0LnlcbiAgICAgICAgICAgICAgICBAc3RhdGUucmlnaHQgPSB4OngsIHk6eSBcbiAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2hhbmdlZCBvciBAY29udGludW91c1xuICAgICAgICAgICAgICAgIEBlbWl0ICdheGlzJyBAc3RhdGVcblxuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSBAcG9sbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVwYWRcbiJdfQ==
//# sourceURL=../coffee/gamepad.coffee