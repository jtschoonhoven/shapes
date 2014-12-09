(function () {

  // ======
  // Shapes
  // ======

  var sin  = Math.sin;
  var cos  = Math.cos;
  var pi   = Math.PI;
  var sqrt = Math.sqrt;
  var abs  = Math.abs;
  var pow  = Math.pow;


  // Create a constructor with an init function.
  var Shapes = function() { 
    this.animating = {};
    this.initialize(); 
  };


  // Set attributes to values in menu, then draw.
  Shapes.prototype.initialize = function() {

    // Dimensions of browser window.
    this.width = parseFloat(d3.select('body').style('width'));
    this.height = parseFloat(d3.select('body').style('height'));

    // The longest side of the browser window;
    this.w = this.width >= this.height ? this.width : this.height;

    // Draw a path between controll points.
    this.showPath = !d3.select('#showPath:checked').empty();

    // Mark each control point with a circle.
    this.showCircles = !d3.select('#showCircles:checked').empty();

    // Separate each subsequent point by {n} degrees from the prev.
    this.step = parseFloat(d3.select('#step').attr('value'));

    // Number of control points when drawing path.
    this.points = parseFloat(d3.select('#points').attr('value'));

    // Radius of control points.
    this.radii = parseFloat(d3.select('#radii').attr('value'));

    // How to curve lines between control points.
    this.interpolation = d3.select('#interpolation').attr('value');

    // Rotate along center.
    this.rotation = parseFloat(d3.select('#rotation').attr('value'));

    // Rotate every other control point independently of group.
    this.innerRotation = parseFloat(d3.select('#innerRotation').attr('value'));

    // Technically radius, but we'll call it "zoom".
    this.zoom = parseFloat(d3.select('#zoom').attr('value'));

    // Ratio of size of inner shape to outer shape.
    this.innerScale = parseFloat(d3.select('#innerScale').attr('value'));

    // Base pattern on which control points are aligned.
    this.pattern = d3.select('#pattern').attr('value');

    this.draw();
  };


  // Update an attribute from the menu.
  Shapes.prototype.update = function(attribute, value) {
    this[attribute] = parseFloat(value) || value;
    this.draw();
  };


  // Automatically bounce between max and min values on doubleclick.
  Shapes.prototype.animate = function(attribute, val, min, max, step, saw) {
    var that = this;

    min  = parseFloat(min);
    max  = parseFloat(max);
    val  = parseFloat(val);
    step = parseFloat(step);

    this.animating[attribute] ? this.animating[attribute] = false : this.animating[attribute] = true;

    d3.timer(function() {
      if (val + step > max) { step *= -1; }
      if (val + step < min) { step *= -1; }
      that.update(attribute, val += step);
      return !that.animating[attribute];
    });
  };


  // Render SVG.
  Shapes.prototype.draw = function() {
    var that = this;

    var data = new Array(this.points);
    var canvas = d3.select('.canvas');
    this.radius = this.width * this.zoom / this.width;


    // Rotate along center.
    if (this.rotation) {
      canvas.attr('transform', 'rotate('+ this.rotation +','+ this.width/2 +','+ this.height/2 +')');
    }


    // Show a circle on each control point.
    if (this.showCircles) {
      var circles = canvas.selectAll('circle').data(data);

      circles.exit().remove();
      circles.enter().append('circle');

      circles.transition().ease('linear')
        .attr('cx', function(d,i) { return patterns[that.pattern].x.call(that, i); })
        .attr('cy', function(d,i) { return patterns[that.pattern].y.call(that, i); })
        .attr('r', pow(this.radii, 2));
    } else { canvas.selectAll('circle').remove(); }


    // Draw a path between control points.
    if (this.showPath) {
      var path = canvas.selectAll('path').data([1])
      path.enter().append('path');

      var lineGenerator = d3.svg.line()
        .x(function(d,i) { return patterns[that.pattern].x.call(that, i); })
        .y(function(d,i) { return patterns[that.pattern].y.call(that, i); })
        .interpolate(this.interpolation);

      path.transition().ease('linear')
        .attr('d', function() { return lineGenerator(data); });
    } else { canvas.select('path').remove(); }
  };


  // Scaling functions that accept an index value and return cartesian coordinates.
  // Circle: http://stackoverflow.com/questions/13672867/how-to-place-svg-shapes-in-a-circle
  // Fermat: http://en.wikipedia.org/wiki/Fermat%27s_spiral

  var patterns = {
    circle: {
      x: function(i) { return sin(i * this.step * (1 - this.innerRotation/this.points * (i%2)) * (pi/180)) * this.radius * (1 - this.innerScale * (i%2)) + this.width/2; },
      y: function(i) { return cos(i * this.step * (1 - this.innerRotation/this.points * (i%2)) * (pi/180)) * this.radius * (1 - this.innerScale * (i%2)) + this.height/2; }
    },

    fermat: {
      x: function(i) { return (this.zoom/2 * sqrt(i) * cos(i * this.step * (1 - this.innerRotation/pow(this.points,1.7) * (i%2)))) * (1 - this.innerScale * (i%2)) + this.width/2; },
      y: function(i) { return (this.zoom/2 * sqrt(i) * sin(i * this.step * (1 - this.innerRotation/pow(this.points,1.7) * (i%2)))) * (1 - this.innerScale * (i%2)) + this.height/2; }
    }
  };


  // Export global.
  window.Shapes = Shapes; 


}())