// koffee 0.43.0

/*
 0000000   0000000  000   000  00000000  00     00  00000000
000       000       000   000  000       000   000  000
0000000   000       000000000  0000000   000000000  0000000
     000  000       000   000  000       000 0 000  000
0000000    0000000  000   000  00000000  000   000  00000000
 */
var $, Scheme, _, elem, post, prefs, ref, slash;

ref = require('./kxk'), prefs = ref.prefs, elem = ref.elem, post = ref.post, slash = ref.slash, $ = ref.$, _ = ref._;

Scheme = (function() {
    function Scheme() {}

    Scheme.toggle = function(schemes) {
        var currentScheme, link, nextScheme, nextSchemeIndex;
        if (schemes == null) {
            schemes = ['dark', 'bright'];
        }
        if (link = $('style-link')) {
            currentScheme = slash.basename(_.last(link.href.split('/')), '.css');
            nextSchemeIndex = (schemes.indexOf(currentScheme) + 1) % schemes.length;
            nextScheme = schemes[nextSchemeIndex];
            return Scheme.set(nextScheme);
        }
    };

    Scheme.set = function(scheme) {
        var href, link, newlink;
        link = $("#style-link");
        if (!link || !link.parentNode) {
            return;
        }
        scheme = slash.basename(scheme, '.css');
        prefs.set('scheme', scheme);
        newlink = elem('link', {
            href: "css/" + scheme + ".css",
            rel: 'stylesheet',
            type: 'text/css',
            id: 'style-link'
        });
        link.parentNode.replaceChild(newlink, link);
        if (link = $("#style-title")) {
            href = slash.join(slash.dir(link.href), scheme + ".css");
            newlink = elem('link', {
                href: href,
                rel: 'stylesheet',
                type: 'text/css',
                id: 'style-title'
            });
            link.parentNode.replaceChild(newlink, link);
        }
        return post.emit('schemeChanged', scheme);
    };

    return Scheme;

})();

module.exports = Scheme;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1lLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFxQyxPQUFBLENBQVEsT0FBUixDQUFyQyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsaUJBQXJCLEVBQTRCLFNBQTVCLEVBQStCOztBQUV6Qjs7O0lBRUYsTUFBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE9BQUQ7QUFFTCxZQUFBOztZQUZNLFVBQVUsQ0FBQyxNQUFELEVBQVMsUUFBVDs7UUFFaEIsSUFBRyxJQUFBLEdBQU0sQ0FBQSxDQUFFLFlBQUYsQ0FBVDtZQUNJLGFBQUEsR0FBZ0IsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBVixDQUFnQixHQUFoQixDQUFQLENBQWYsRUFBNkMsTUFBN0M7WUFDaEIsZUFBQSxHQUFrQixDQUFFLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGFBQWhCLENBQUEsR0FBaUMsQ0FBbkMsQ0FBQSxHQUF3QyxPQUFPLENBQUM7WUFDbEUsVUFBQSxHQUFhLE9BQVEsQ0FBQSxlQUFBO21CQUNyQixNQUFNLENBQUMsR0FBUCxDQUFXLFVBQVgsRUFKSjs7SUFGSzs7SUFRVCxNQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsTUFBRDtBQUVGLFlBQUE7UUFBQSxJQUFBLEdBQU0sQ0FBQSxDQUFFLGFBQUY7UUFFTixJQUFVLENBQUksSUFBSixJQUFZLENBQUksSUFBSSxDQUFDLFVBQS9CO0FBQUEsbUJBQUE7O1FBRUEsTUFBQSxHQUFTLEtBQUssQ0FBQyxRQUFOLENBQWUsTUFBZixFQUF1QixNQUF2QjtRQUNULEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixFQUFvQixNQUFwQjtRQUVBLE9BQUEsR0FBVSxJQUFBLENBQUssTUFBTCxFQUNOO1lBQUEsSUFBQSxFQUFNLE1BQUEsR0FBTyxNQUFQLEdBQWMsTUFBcEI7WUFDQSxHQUFBLEVBQU0sWUFETjtZQUVBLElBQUEsRUFBTSxVQUZOO1lBR0EsRUFBQSxFQUFNLFlBSE47U0FETTtRQUtWLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBaEIsQ0FBNkIsT0FBN0IsRUFBc0MsSUFBdEM7UUFFQSxJQUFHLElBQUEsR0FBTSxDQUFBLENBQUUsY0FBRixDQUFUO1lBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFJLENBQUMsSUFBZixDQUFYLEVBQW9DLE1BQUQsR0FBUSxNQUEzQztZQUNQLE9BQUEsR0FBVSxJQUFBLENBQUssTUFBTCxFQUNOO2dCQUFBLElBQUEsRUFBTSxJQUFOO2dCQUNBLEdBQUEsRUFBTSxZQUROO2dCQUVBLElBQUEsRUFBTSxVQUZOO2dCQUdBLEVBQUEsRUFBTSxhQUhOO2FBRE07WUFLVixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQWhCLENBQTZCLE9BQTdCLEVBQXNDLElBQXRDLEVBUEo7O2VBU0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxlQUFWLEVBQTJCLE1BQTNCO0lBekJFOzs7Ozs7QUEyQlYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDBcbiAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgcHJlZnMsIGVsZW0sIHBvc3QsIHNsYXNoLCAkLCBfIH0gPSByZXF1aXJlICcuL2t4aydcblxuY2xhc3MgU2NoZW1lXG5cbiAgICBAdG9nZ2xlOiAoc2NoZW1lcyA9IFsnZGFyaycsICdicmlnaHQnXSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGxpbmsgPSQgJ3N0eWxlLWxpbmsnXG4gICAgICAgICAgICBjdXJyZW50U2NoZW1lID0gc2xhc2guYmFzZW5hbWUgXy5sYXN0KGxpbmsuaHJlZi5zcGxpdCgnLycpKSwgJy5jc3MnXG4gICAgICAgICAgICBuZXh0U2NoZW1lSW5kZXggPSAoIHNjaGVtZXMuaW5kZXhPZihjdXJyZW50U2NoZW1lKSArIDEpICUgc2NoZW1lcy5sZW5ndGhcbiAgICAgICAgICAgIG5leHRTY2hlbWUgPSBzY2hlbWVzW25leHRTY2hlbWVJbmRleF1cbiAgICAgICAgICAgIFNjaGVtZS5zZXQgbmV4dFNjaGVtZVxuXG4gICAgQHNldDogKHNjaGVtZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGxpbmsgPSQgXCIjc3R5bGUtbGlua1wiXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGxpbmsgb3Igbm90IGxpbmsucGFyZW50Tm9kZVxuICAgICAgICBcbiAgICAgICAgc2NoZW1lID0gc2xhc2guYmFzZW5hbWUgc2NoZW1lLCAnLmNzcydcbiAgICAgICAgcHJlZnMuc2V0ICdzY2hlbWUnLCBzY2hlbWVcbiAgICAgICAgXG4gICAgICAgIG5ld2xpbmsgPSBlbGVtICdsaW5rJyxcbiAgICAgICAgICAgIGhyZWY6IFwiY3NzLyN7c2NoZW1lfS5jc3NcIlxuICAgICAgICAgICAgcmVsOiAgJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgICB0eXBlOiAndGV4dC9jc3MnXG4gICAgICAgICAgICBpZDogICAnc3R5bGUtbGluaycgICAgICAgICAgIFxuICAgICAgICBsaW5rLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkIG5ld2xpbmssIGxpbmtcbiAgICAgICAgXG4gICAgICAgIGlmIGxpbmsgPSQgXCIjc3R5bGUtdGl0bGVcIlxuICAgICAgICAgICAgaHJlZiA9IHNsYXNoLmpvaW4gc2xhc2guZGlyKGxpbmsuaHJlZiksIFwiI3tzY2hlbWV9LmNzc1wiXG4gICAgICAgICAgICBuZXdsaW5rID0gZWxlbSAnbGluaycsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgICAgIHJlbDogICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgICBpZDogICAnc3R5bGUtdGl0bGUnICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmsucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQgbmV3bGluaywgbGlua1xuICAgICAgICBcbiAgICAgICAgcG9zdC5lbWl0ICdzY2hlbWVDaGFuZ2VkJywgc2NoZW1lXG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZW1lXG4iXX0=
//# sourceURL=../coffee/scheme.coffee