// koffee 1.4.0

/*
000   000  000   0000000  000000000   0000000   00000000   000   000
000   000  000  000          000     000   000  000   000   000 000 
000000000  000  0000000      000     000   000  0000000      00000  
000   000  000       000     000     000   000  000   000     000   
000   000  000  0000000      000      0000000   000   000     000
 */
var History, _, def, last, ref;

ref = require('./kxk'), def = ref.def, last = ref.last, _ = ref._;

History = (function() {
    function History(opt) {
        this.opt = def(opt, {
            list: [],
            maxLength: 100
        });
        this.list = opt.list;
    }

    History.prototype.add = function(i) {
        _.pullAllWith(this.list, [i], _.isEqual);
        this.list.push(i);
        if (this.list.length > this.opt.maxLength) {
            return this.list.shift();
        }
    };

    History.prototype.previous = function() {
        if (this.list.length > 1) {
            return this.list[this.list.length - 2];
        } else {
            return null;
        }
    };

    History.prototype.current = function() {
        return last(this.list);
    };

    return History;

})();

module.exports = History;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBbUIsT0FBQSxDQUFRLE9BQVIsQ0FBbkIsRUFBRSxhQUFGLEVBQU8sZUFBUCxFQUFhOztBQUVQO0lBRVcsaUJBQUMsR0FBRDtRQUVULElBQUMsQ0FBQSxHQUFELEdBQVEsR0FBQSxDQUFJLEdBQUosRUFBUztZQUFBLElBQUEsRUFBTSxFQUFOO1lBQVUsU0FBQSxFQUFXLEdBQXJCO1NBQVQ7UUFDUixJQUFDLENBQUEsSUFBRCxHQUFRLEdBQUcsQ0FBQztJQUhIOztzQkFLYixHQUFBLEdBQUssU0FBQyxDQUFEO1FBRUQsQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFDLENBQUEsSUFBZixFQUFxQixDQUFDLENBQUQsQ0FBckIsRUFBMEIsQ0FBQyxDQUFDLE9BQTVCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBWDtRQUNBLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUF2QjttQkFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQSxFQURKOztJQUxDOztzQkFRTCxRQUFBLEdBQVUsU0FBQTtRQUVOLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7bUJBQXlCLElBQUMsQ0FBQSxJQUFLLENBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWEsQ0FBYixFQUEvQjtTQUFBLE1BQUE7bUJBQ0ssS0FETDs7SUFGTTs7c0JBS1YsT0FBQSxHQUFTLFNBQUE7ZUFBRyxJQUFBLENBQUssSUFBQyxDQUFBLElBQU47SUFBSDs7Ozs7O0FBRWIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwIFxuMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIFxuIyMjXG5cbnsgZGVmLCBsYXN0LCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgSGlzdG9yeVxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAob3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgQG9wdCAgPSBkZWYgb3B0LCBsaXN0OiBbXSwgbWF4TGVuZ3RoOiAxMDBcbiAgICAgICAgQGxpc3QgPSBvcHQubGlzdFxuICAgICAgICBcbiAgICBhZGQ6IChpKSAtPlxuICAgICAgICBcbiAgICAgICAgXy5wdWxsQWxsV2l0aCBAbGlzdCwgW2ldLCBfLmlzRXF1YWxcbiAgICAgICAgXG4gICAgICAgIEBsaXN0LnB1c2ggaVxuICAgICAgICBpZiBAbGlzdC5sZW5ndGggPiBAb3B0Lm1heExlbmd0aFxuICAgICAgICAgICAgQGxpc3Quc2hpZnQoKVxuICAgICAgICBcbiAgICBwcmV2aW91czogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBsaXN0Lmxlbmd0aCA+IDEgdGhlbiBAbGlzdFtAbGlzdC5sZW5ndGgtMl1cbiAgICAgICAgZWxzZSBudWxsXG4gICAgXG4gICAgY3VycmVudDogLT4gbGFzdCBAbGlzdFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEhpc3RvcnlcbiJdfQ==
//# sourceURL=../coffee/history.coffee