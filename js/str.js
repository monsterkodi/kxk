(function() {
  /*
   0000000  000000000  00000000 
  000          000     000   000
  0000000      000     0000000  
       000     000     000   000
  0000000      000     000   000
  */
  var entity, noon, str, xmlEntities;

  noon = require('noon');

  entity = require('html-entities');

  xmlEntities = new entity.XmlEntities();

  str = function(o) {
    if (o == null) {
      return 'null';
    }
    if (typeof o === 'object') {
      if (o._str != null) {
        return o._str();
      } else {
        return "\n" + noon.stringify(o, {
          circular: true
        });
      }
    } else {
      return String(o);
    }
  };

  /*
  00000000  000   000   0000000   0000000   0000000    00000000
  000       0000  000  000       000   000  000   000  000     
  0000000   000 0 000  000       000   000  000   000  0000000 
  000       000  0000  000       000   000  000   000  000     
  00000000  000   000   0000000   0000000   0000000    00000000
  */
  str.encode = function(s, spaces = true) {
    var r;
    if (s) {
      r = xmlEntities.encode(s);
      if (spaces) {
        r = r.replace(/\s/g, '&nbsp;');
      }
      return r;
    } else {
      return '';
    }
  };

  module.exports = str;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIi4uL2NvZmZlZS9zdHIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBOztFQVFBLElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7RUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0VBRVQsV0FBQSxHQUFjLElBQUksTUFBTSxDQUFDLFdBQVgsQ0FBQTs7RUFFZCxHQUFBLEdBQU0sUUFBQSxDQUFDLENBQUQsQ0FBQTtJQUNGLElBQXFCLFNBQXJCO0FBQUEsYUFBTyxPQUFQOztJQUNBLElBQUcsT0FBTyxDQUFQLEtBQWEsUUFBaEI7TUFDSSxJQUFHLGNBQUg7ZUFDSSxDQUFDLENBQUMsSUFBRixDQUFBLEVBREo7T0FBQSxNQUFBO2VBR0ksSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZixFQUFrQjtVQUFBLFFBQUEsRUFBVTtRQUFWLENBQWxCLEVBSFg7T0FESjtLQUFBLE1BQUE7YUFNSSxNQUFBLENBQU8sQ0FBUCxFQU5KOztFQUZFLEVBYk47Ozs7Ozs7OztFQStCQSxHQUFHLENBQUMsTUFBSixHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksU0FBTyxJQUFYLENBQUE7QUFDVCxRQUFBO0lBQUEsSUFBRyxDQUFIO01BQ0ksQ0FBQSxHQUFJLFdBQVcsQ0FBQyxNQUFaLENBQW1CLENBQW5CO01BQ0osSUFBRyxNQUFIO1FBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixFQUFpQixRQUFqQixFQURSOzthQUVBLEVBSko7S0FBQSxNQUFBO2FBTUksR0FOSjs7RUFEUzs7RUFTYixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXhDakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIyNcblxubm9vbiAgID0gcmVxdWlyZSAnbm9vbidcbmVudGl0eSA9IHJlcXVpcmUgJ2h0bWwtZW50aXRpZXMnXG5cbnhtbEVudGl0aWVzID0gbmV3IGVudGl0eS5YbWxFbnRpdGllcygpXG5cbnN0ciA9IChvKSAtPlxuICAgIHJldHVybiAnbnVsbCcgaWYgbm90IG8/XG4gICAgaWYgdHlwZW9mKG8pID09ICdvYmplY3QnXG4gICAgICAgIGlmIG8uX3N0cj9cbiAgICAgICAgICAgIG8uX3N0cigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiXFxuXCIgKyBub29uLnN0cmluZ2lmeSBvLCBjaXJjdWxhcjogdHJ1ZVxuICAgIGVsc2VcbiAgICAgICAgU3RyaW5nIG9cblxuIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4wMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIyNcblxuc3RyLmVuY29kZSA9IChzLCBzcGFjZXM9dHJ1ZSkgLT5cbiAgICBpZiBzXG4gICAgICAgIHIgPSB4bWxFbnRpdGllcy5lbmNvZGUgc1xuICAgICAgICBpZiBzcGFjZXNcbiAgICAgICAgICAgIHIgPSByLnJlcGxhY2UgL1xccy9nLCAnJm5ic3A7J1xuICAgICAgICByXG4gICAgZWxzZVxuICAgICAgICAnJ1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gc3RyIl19
//# sourceURL=../coffee/str.coffee