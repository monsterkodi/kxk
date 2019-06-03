// koffee 0.56.0

/*
0000000    00000000    0000000    0000000 
000   000  000   000  000   000  000      
000   000  0000000    000000000  000  0000
000   000  000   000  000   000  000   000
0000000    000   000  000   000   0000000
 */
var $, Drag, _, def, kerror, kpos, ref, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('./kxk'), def = ref.def, kpos = ref.kpos, stopEvent = ref.stopEvent, kerror = ref.kerror, $ = ref.$, _ = ref._;

Drag = (function() {
    function Drag(cfg) {
        this.deactivate = bind(this.deactivate, this);
        this.activate = bind(this.activate, this);
        this.dragStop = bind(this.dragStop, this);
        this.dragUp = bind(this.dragUp, this);
        this.dragMove = bind(this.dragMove, this);
        this.dragStart = bind(this.dragStart, this);
        var t;
        _.extend(this, def(cfg, {
            target: null,
            handle: null,
            onStart: null,
            onMove: null,
            onStop: null,
            active: true
        }));
        if (_.isString(this.target)) {
            t = $(this.target);
            if (t == null) {
                return kerror("Drag -- can't find drag target with id", this.target);
            }
            this.target = t;
        }
        if (this.target == null) {
            return kerror("Drag -- can't find drag target");
        }
        if ((this.onStart != null) && !_.isFunction(this.onStart)) {
            kerror("Drag -- onStart not a function?");
        }
        if ((this.onMove != null) && !_.isFunction(this.onMove)) {
            kerror("Drag -- onMove not a function?");
        }
        if ((this.onEnd != null) && !_.isFunction(this.onEnd)) {
            kerror("Drag -- onEnd not a function?");
        }
        this.dragging = false;
        this.listening = false;
        if (_.isString(this.handle)) {
            this.handle = $(this.handle);
        }
        if (this.handle != null) {
            this.handle;
        } else {
            this.handle = this.target;
        }
        if (this.active) {
            this.activate();
        }
    }

    Drag.prototype.start = function(p, event) {
        if (!this.dragging && this.listening) {
            this.dragging = true;
            this.startPos = p;
            this.pos = p;
            if ('skip' === (typeof this.onStart === "function" ? this.onStart(this, event) : void 0)) {
                delete this.startPos;
                this.dragging = false;
                return this;
            }
            this.lastPos = p;
            stopEvent(event);
            document.addEventListener('mousemove', this.dragMove);
            document.addEventListener('mouseup', this.dragUp);
        }
        return this;
    };

    Drag.prototype.dragStart = function(event) {
        return this.start(kpos(event), event);
    };

    Drag.prototype.dragMove = function(event) {
        if (this.dragging) {
            this.pos = kpos(event);
            this.delta = this.lastPos.to(this.pos);
            this.deltaSum = this.startPos.to(this.pos);
            if ((this.constrainKey != null) && event[this.constrainKey]) {
                if (this.constrain != null) {
                    this.constrain;
                } else {
                    this.constrain = Math.abs(this.delta.x) >= Math.abs(this.delta.y) ? kpos(1, 0) : kpos(0, 1);
                }
                this.delta.x *= this.constrain.x;
                this.delta.y *= this.constrain.y;
            } else {
                delete this.constrain;
            }
            if (typeof this.onMove === "function") {
                this.onMove(this, event);
            }
            this.lastPos = this.pos;
        }
        return this;
    };

    Drag.prototype.dragUp = function(event) {
        delete this.constrain;
        return this.dragStop(event);
    };

    Drag.prototype.dragStop = function(event) {
        if (this.dragging) {
            document.removeEventListener('mousemove', this.dragMove);
            document.removeEventListener('mouseup', this.dragUp);
            if ((this.onStop != null) && (event != null)) {
                this.onStop(this, event);
            }
            delete this.lastPos;
            delete this.startPos;
            this.dragging = false;
        }
        return this;
    };

    Drag.prototype.activate = function() {
        if (!this.listening) {
            this.listening = true;
            this.handle.addEventListener('mousedown', this.dragStart);
        }
        return this;
    };

    Drag.prototype.deactivate = function() {
        if (this.listening) {
            this.handle.removeEventListener('mousedown', this.dragStart);
            this.listening = false;
            if (this.dragging) {
                this.dragStop();
            }
        }
        return this;
    };

    return Drag;

})();

module.exports = Drag;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkNBQUE7SUFBQTs7QUFRQSxNQUF5QyxPQUFBLENBQVEsT0FBUixDQUF6QyxFQUFFLGFBQUYsRUFBTyxlQUFQLEVBQWEseUJBQWIsRUFBd0IsbUJBQXhCLEVBQWdDLFNBQWhDLEVBQW1DOztBQUU3QjtJQUVXLGNBQUMsR0FBRDs7Ozs7OztBQUVULFlBQUE7UUFBQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBWSxHQUFBLENBQUksR0FBSixFQUNKO1lBQUEsTUFBQSxFQUFVLElBQVY7WUFDQSxNQUFBLEVBQVUsSUFEVjtZQUVBLE9BQUEsRUFBVSxJQUZWO1lBR0EsTUFBQSxFQUFVLElBSFY7WUFJQSxNQUFBLEVBQVUsSUFKVjtZQUtBLE1BQUEsRUFBVSxJQUxWO1NBREksQ0FBWjtRQVFBLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFDLENBQUEsTUFBWixDQUFIO1lBQ0ksQ0FBQSxHQUFHLENBQUEsQ0FBRSxJQUFDLENBQUEsTUFBSDtZQUNILElBQU8sU0FBUDtBQUNJLHVCQUFPLE1BQUEsQ0FBTyx3Q0FBUCxFQUFpRCxJQUFDLENBQUEsTUFBbEQsRUFEWDs7WUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBSmQ7O1FBTUEsSUFBTyxtQkFBUDtBQUNJLG1CQUFPLE1BQUEsQ0FBTyxnQ0FBUCxFQURYOztRQUdBLElBQTRDLHNCQUFBLElBQWMsQ0FBSSxDQUFDLENBQUMsVUFBRixDQUFhLElBQUMsQ0FBQSxPQUFkLENBQTlEO1lBQUEsTUFBQSxDQUFPLGlDQUFQLEVBQUE7O1FBQ0EsSUFBMkMscUJBQUEsSUFBYSxDQUFJLENBQUMsQ0FBQyxVQUFGLENBQWEsSUFBQyxDQUFBLE1BQWQsQ0FBNUQ7WUFBQSxNQUFBLENBQU8sZ0NBQVAsRUFBQTs7UUFDQSxJQUEwQyxvQkFBQSxJQUFZLENBQUksQ0FBQyxD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QztZQUNBLFFBQVEsQ0FBQyxtQkFBVCxDQUE2QixTQUE3QixFQUEwQyxJQUFDLENBQUEsTUFBM0M7WUFDQSxJQUFvQixxQkFBQSxJQUFhLGVBQWpDO2dCQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBUixFQUFXLEtBQVgsRUFBQTs7WUFDQSxPQUFPLElBQUMsQ0FBQTtZQUNSLE9BQU8sSUFBQyxDQUFBO1lBQ1IsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQU5oQjs7ZUFPQTtJQVRNOzttQkFpQlYsUUFBQSxHQUFVLFNBQUE7UUFFTixJQUFHLENBQUksSUFBQyxDQUFBLFNBQVI7WUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhO1lBQ2IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixXQUF6QixFQUFzQyxJQUFDLENBQUEsU0FBdkMsRUFGSjs7ZUFHQTtJQUxNOzttQkFPVixVQUFBLEdBQVksU0FBQTtRQUVSLElBQUcsSUFBQyxDQUFBLFNBQUo7WUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLFdBQTVCLEVBQXlDLElBQUMsQ0FBQSxTQUExQztZQUNBLElBQUMsQ0FBQSxTQUFELEdBQWE7WUFDYixJQUFlLElBQUMsQ0FBQSxRQUFoQjtnQkFBQSxJQUFDLENBQUEsUUFBRCxDQUFBLEVBQUE7YUFISjs7ZUFJQTtJQU5ROzs7Ozs7QUFRaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4jIyNcblxueyBkZWYsIGtwb3MsIHN0b3BFdmVudCwga2Vycm9yLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgRHJhZ1xuXG4gICAgY29uc3RydWN0b3I6IChjZmcpIC0+XG4gICAgICAgIFxuICAgICAgICBfLmV4dGVuZCBALCBkZWYgY2ZnLFxuICAgICAgICAgICAgICAgIHRhcmdldCAgOiBudWxsXG4gICAgICAgICAgICAgICAgaGFuZGxlICA6IG51bGxcbiAgICAgICAgICAgICAgICBvblN0YXJ0IDogbnVsbFxuICAgICAgICAgICAgICAgIG9uTW92ZSAgOiBudWxsXG4gICAgICAgICAgICAgICAgb25TdG9wICA6IG51bGxcbiAgICAgICAgICAgICAgICBhY3RpdmUgIDogdHJ1ZVxuXG4gICAgICAgIGlmIF8uaXNTdHJpbmcgQHRhcmdldFxuICAgICAgICAgICAgdCA9JCBAdGFyZ2V0XG4gICAgICAgICAgICBpZiBub3QgdD9cbiAgICAgICAgICAgICAgICByZXR1cm4ga2Vycm9yIFwiRHJhZyAtLSBjYW4ndCBmaW5kIGRyYWcgdGFyZ2V0IHdpdGggaWRcIiwgQHRhcmdldFxuICAgICAgICAgICAgQHRhcmdldCA9IHRcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgQHRhcmdldD9cbiAgICAgICAgICAgIHJldHVybiBrZXJyb3IgXCJEcmFnIC0tIGNhbid0IGZpbmQgZHJhZyB0YXJnZXRcIlxuICAgICAgICBcbiAgICAgICAga2Vycm9yIFwiRHJhZyAtLSBvblN0YXJ0IG5vdCBhIGZ1bmN0aW9uP1wiIGlmIEBvblN0YXJ0PyBhbmQgbm90IF8uaXNGdW5jdGlvbiBAb25TdGFydFxuICAgICAgICBrZXJyb3IgXCJEcmFnIC0tIG9uTW92ZSBub3QgYSBmdW5jdGlvbj9cIiBpZiBAb25Nb3ZlPyBhbmQgbm90IF8uaXNGdW5jdGlvbiBAb25Nb3ZlXG4gICAgICAgIGtlcnJvciBcIkRyYWcgLS0gb25FbmQgbm90IGEgZnVuY3Rpb24/XCIgaWYgQG9uRW5kPyBhbmQgbm90IF8uaXNGdW5jdGlvbiBAb25FbmRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGRyYWdnaW5nICA9IGZhbHNlXG4gICAgICAgIEBsaXN0ZW5pbmcgPSBmYWxzZVxuICAgICAgICBAaGFuZGxlICAgID0gJChAaGFuZGxlKSBpZiBfLmlzU3RyaW5nIEBoYW5kbGVcbiAgICAgICAgQGhhbmRsZSAgID89IEB0YXJnZXRcbiAgICAgICAgQGFjdGl2YXRlKCkgaWYgQGFjdGl2ZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHN0YXJ0OiAocCwgZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQGRyYWdnaW5nIGFuZCBAbGlzdGVuaW5nXG4gICAgICAgICAgICBAZHJhZ2dpbmcgPSB0cnVlXG4gICAgICAgICAgICBAc3RhcnRQb3MgPSBwXG4gICAgICAgICAgICBAcG9zICAgICAgPSBwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICdza2lwJyA9PSBAb25TdGFydD8gQCwgZXZlbnRcbiAgICAgICAgICAgICAgICBkZWxldGUgQHN0YXJ0UG9zXG4gICAgICAgICAgICAgICAgQGRyYWdnaW5nID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gQFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3RQb3MgID0gcFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHN0b3BFdmVudCBldmVudFxuICAgIFxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgQGRyYWdNb3ZlXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgICBAZHJhZ1VwXG4gICAgICAgIEBcbiAgICBcbiAgICBkcmFnU3RhcnQ6IChldmVudCkgPT4gQHN0YXJ0IGtwb3MoZXZlbnQpLCBldmVudFxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBkcmFnTW92ZTogKGV2ZW50KSA9PlxuXG4gICAgICAgIGlmIEBkcmFnZ2luZ1xuICAgICAgICAgICAgQHBvcyAgICAgID0ga3BvcyBldmVudFxuICAgICAgICAgICAgQGRlbHRhICAgID0gQGxhc3RQb3MudG8gQHBvc1xuICAgICAgICAgICAgQGRlbHRhU3VtID0gQHN0YXJ0UG9zLnRvIEBwb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGNvbnN0cmFpbktleT8gYW5kIGV2ZW50W0Bjb25zdHJhaW5LZXldXG4gICAgICAgICAgICAgICAgQGNvbnN0cmFpbiA/PSBpZiBNYXRoLmFicyhAZGVsdGEueCkgPj0gTWF0aC5hYnMoQGRlbHRhLnkpIHRoZW4ga3BvcyAxLDAgZWxzZSBrcG9zIDAsMVxuICAgICAgICAgICAgICAgIEBkZWx0YS54ICo9IEBjb25zdHJhaW4ueFxuICAgICAgICAgICAgICAgIEBkZWx0YS55ICo9IEBjb25zdHJhaW4ueVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBAY29uc3RyYWluXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAb25Nb3ZlPyBALCBldmVudCBcbiAgICAgICAgICAgIEBsYXN0UG9zID0gQHBvc1xuICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgZHJhZ1VwOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgZGVsZXRlIEBjb25zdHJhaW5cbiAgICAgICAgQGRyYWdTdG9wIGV2ZW50XG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBkcmFnU3RvcDogKGV2ZW50KSA9PlxuXG4gICAgICAgIGlmIEBkcmFnZ2luZ1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgQGRyYWdNb3ZlXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXVwJywgICBAZHJhZ1VwXG4gICAgICAgICAgICBAb25TdG9wIEAsIGV2ZW50IGlmIEBvblN0b3A/IGFuZCBldmVudD9cbiAgICAgICAgICAgIGRlbGV0ZSBAbGFzdFBvc1xuICAgICAgICAgICAgZGVsZXRlIEBzdGFydFBvc1xuICAgICAgICAgICAgQGRyYWdnaW5nID0gZmFsc2VcbiAgICAgICAgQFxuXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBhY3RpdmF0ZTogPT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAbGlzdGVuaW5nXG4gICAgICAgICAgICBAbGlzdGVuaW5nID0gdHJ1ZVxuICAgICAgICAgICAgQGhhbmRsZS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCBAZHJhZ1N0YXJ0XG4gICAgICAgIEBcblxuICAgIGRlYWN0aXZhdGU6ID0+XG5cbiAgICAgICAgaWYgQGxpc3RlbmluZ1xuICAgICAgICAgICAgQGhhbmRsZS5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCBAZHJhZ1N0YXJ0XG4gICAgICAgICAgICBAbGlzdGVuaW5nID0gZmFsc2VcbiAgICAgICAgICAgIEBkcmFnU3RvcCgpIGlmIEBkcmFnZ2luZ1xuICAgICAgICBAXG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ1xuIl19
//# sourceURL=../coffee/drag.coffee