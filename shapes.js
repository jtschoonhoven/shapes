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
    this.width = parseInt(d3.select('body').style('width'));
    this.height = parseInt(d3.select('body').style('height'));

    // The longest side of the browser window;
    this.w = this.width >= this.height ? this.width : this.height;

    // Draw a path between controll points.
    this.showPath = !d3.select('#showPath:checked').empty();

    // Mark each control point with a circle.
    this.showCircles = !d3.select('#showCircles:checked').empty();

    // Separate each subsequent point by {n} degrees from the prev.
    this.step = parseInt(d3.select('#step').attr('value'));

    // Number of control points when drawing path.
    this.points = parseInt(d3.select('#points').attr('value'));

    // Radius of control points.
    this.radii = parseFloat(d3.select('#radii').attr('value'));

    // How to curve lines between control points.
    this.interpolation = d3.select('#interpolation').attr('value');

    // Technically radius, but we'll call it "zoom".
    this.zoom = parseInt(d3.select('#zoom').attr('value'));

    // Ratio of size of inner shape to outer shape.
    this.inner = parseInt(d3.select('#inner').attr('value'));

    // Base pattern on which control points are aligned.
    this.pattern = d3.select('#pattern').attr('value');

    this.draw();
  };


  // Update an attribute from the menu.
  Shapes.prototype.update = function(attribute, value) {
    this[attribute] = parseInt(value) || value;
    this.draw();
  };


  Shapes.prototype.animate = function(attribute, val, min, max, step) {
    var that = this;

    min  = parseFloat(min);
    max  = parseFloat(max);
    val  = parseFloat(val);
    step = parseFloat(step);

    this.animating[attribute] ? this.animating[attribute] = false : this.animating[attribute] = true;

    function animate() {
      setTimeout(function() {
        if (that.animating[attribute]) {
          if (val + step > max) { step = step * -1; }
          if (val + step < min) { step = step * -1; }
          val = val + step;
          that.update(attribute, val);
          animate();
        }
      }, 200);
    }

    animate();
  };


  // Render SVG.
  Shapes.prototype.draw = function() {

    var that = this;
    var data = new Array(this.points);
    var canvas = d3.select('.canvas');
    this.radius = this.width * this.zoom / this.width;


    if (this.showCircles) {
      var circles = canvas.selectAll('circle')
        .data(d3.range(0, this.points));

      circles.exit().remove();
      circles.enter().append('circle');

      circles
        .transition()
        .attr('cx', function(d, i) { return patterns[that.pattern].x.call(that, i); })
        .attr('cy', function(d, i) { return patterns[that.pattern].y.call(that, i); })
        .attr('r', pow(this.radii, 2));
    } else { canvas.selectAll('circle').remove(); }


    if (this.showPath) {
      var path = canvas.selectAll('path').data([1])
      path.enter().append('path');

      var lineGenerator = d3.svg.line()
        .x(function(d, i) { return patterns[that.pattern].x.call(that, i); })
        .y(function(d, i) { return patterns[that.pattern].y.call(that, i); })
        .interpolate(this.interpolation);

      path.transition()
        .attr('d', function() { return lineGenerator(data); });
    } else { canvas.select('path').remove(); }


  };


  // Scaling functions that accept an index value and return cartesian coordinates of a pattern.
  // Circle: http://stackoverflow.com/questions/13672867/how-to-place-svg-shapes-in-a-circle
  // Fermat: http://en.wikipedia.org/wiki/Fermat%27s_spiral
  var patterns = {
    circle: {
      x: function(i) { return sin(i * this.step * (pi/180)) * this.radius * (1 - this.inner * (i%2)) + (this.width/2); },
      y: function(i) { return cos(i * this.step * (pi/180)) * this.radius * (1 - this.inner * (i%2)) + (this.height/2); }
    },
    fermat: {
      x: function(i) { return (this.zoom/2 * sqrt(i) * cos(i * this.step)) * (1 - this.inner * (i%2)) + (this.width/2); },
      y: function(i) { return (this.zoom/2 * sqrt(i) * sin(i * this.step)) * (1 - this.inner * (i%2)) + (this.height/2); }
    }
  };


  // Export global.
  window.Shapes = Shapes; 


}())