#00000000    0000000    0000000
#000   000  000   000  000     
#00000000   000   000  0000000 
#000        000   000       000
#000         0000000   0000000 

{ clamp } = require './kxk'

class Pos

    constructor: (@x, @y) ->
        if @x?.clientX?
            event = @x
            if isNaN window.scrollX
                @x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft
                @y = event.clientY + document.documentElement.scrollTop + document.body.scrollTop
            else
                @x = event.clientX + window.scrollX + 1
                @y = event.clientY + window.scrollY + 1
        else if not @y? and Pos.isPos @x
            @y = @x.y
            @x = @x.x
        
    copy: -> new Pos @x, @y

    plus: (val) ->
        newPos = @copy()
        if val?
            newPos.x += val.x  unless isNaN(val.x)
            newPos.y += val.y  unless isNaN(val.y)
        newPos

    minus: (val) ->
        newPos = @copy()
        if val?
            newPos.x -= val.x  unless isNaN(val.x)
            newPos.y -= val.y  unless isNaN(val.y)
        newPos
        
    times: (val) -> @copy().scale val
        
    clamped: (lower, upper) => @copy().clamp lower, upper
        
    to:  (other) -> other.minus @
    mid: (other) -> @plus(other).scale 0.5

    min: (val) ->
        newPos = @copy()
        return newPos unless val?
        newPos.x = val.x  if not isNaN(val.x) and @x > val.x
        newPos.y = val.y  if not isNaN(val.y) and @y > val.y
        newPos

    max: (val) ->
        newPos = @copy()
        return newPos unless val?
        newPos.x = val.x  if not isNaN(val.x) and @x < val.x
        newPos.y = val.y  if not isNaN(val.y) and @y < val.y
        newPos

    normal:         -> @copy().normalize()
    length:         -> return Math.sqrt @square()
    dot:        (o) -> @x*o.x + @y*o.y
    square:         -> (@x * @x) + (@y * @y)
    distSquare: (o) -> @minus(o).square()
    dist:       (o) -> Math.sqrt @distSquare(o)
    equals:     (o) -> @x == o?.x and @y == o?.y

    deg2rad:    (d) -> Math.PI*d/180.0
    rad2deg:    (r) -> r*180.0/Math.PI
    
    angle: (o=new Pos(0,1)) ->
        @rad2deg Math.acos @normal().dot o.normal()
        
    perp: -> new Pos -@y, @x
    rotation: (o) -> 
        d = o.dot @perp()
        return 0 if d == 0
        s = d > 0 and 1 or -1
        s * @angle o
            
    check: ->
        newPos = @copy()
        newPos.x = 0 if isNaN(newPos.x)
        newPos.y = 0 if isNaN(newPos.y)
        newPos

    _str: -> 
        s  = ("<x:#{@x} " if @x?) or "<NaN "
        s += ("y:#{@y}>" if @y?) or "NaN>"

    @isPos: (o) -> o.x? and o.y? and Number.isFinite(o.x) and Number.isFinite(o.y)
    
    #_________________________________________________________ destructive
    
    scale: (val) ->
        @x *= val
        @y *= val
        @

    mul: (other) ->
        @x *= other.x
        @y *= other.y
        @
        
    add: (other) ->
        @x += other.x
        @y += other.y
        @

    sub: (other) ->
        @x -= other.x
        @y -= other.y
        @

    clamp: (lower, upper) ->        
        if lower? and upper?            
            @x = clamp(lower.x, upper.x, @x)
            @y = clamp(lower.y, upper.y, @y)
        @
        
    normalize: ->
        l = @length()
        if l
            l = 1.0/l
            @x *= l
            @y *= l
        @    

module.exports = (x,y) -> new Pos x,y
