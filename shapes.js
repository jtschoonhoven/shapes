(function () {

  // ======
  // Shapes
  // ======

  var sin  = Math.sin;
  var cos  = Math.cos;
  var pi   = Math.PI;
  var sqrt = Math.sqrt;
  var abs  = Math.abs;


  // Create a constructor with an init function.
  var Shapes = function() { this.initialize(); };


  // Set attributes to values in menu, then draw.
  Shapes.prototype.initialize = function() {

    // Dimensions of browser window.
    this.width = parseInt(d3.select('body').style('width'));
    this.height = parseInt(d3.select('body').style('height'));

    // The longest side of the browser window;
    this.w = this.width >= this.height ? this.width : this.height;

    // Separate each subsequent point by {n} degrees from the prev.
    this.step = parseInt(d3.select('#step').attr('value'));

    // Number of control points when drawing path.
    this.points = parseInt(d3.select('#points').attr('value'));

    // How to curve lines between control points.
    this.interpolation = d3.select('#interpolation').attr('value');

    // Technically radius, but we'll call it "zoom".
    this.zoom = parseInt(d3.select('#zoom').attr('value'));

    // Ratio of size of inner shape to outer shape.
    this.inner = parseInt(d3.select('#inner').attr('value'));

    // Base pattern on which control points are aligned.
    this.pattern = d3.select('#pattern').attr('value');

    this.canvas = d3.select('.canvas');
    this.path = this.canvas.append('path');

    this.draw();
  };


  // Update an attribute from the menu.
  Shapes.prototype.update = function(attribute, value) {
    this[attribute] = parseInt(value) || value;
    this.draw();
  };


  // Render SVG.
  Shapes.prototype.draw = function() {
    var that = this;

    this.radius = this.width * this.zoom / this.width;

    console.log()

    // Create an array of length {points}.
    var data = new Array(this.points);

    var lineGenerator = d3.svg.line()
      .x(function(d, i) { return patterns[that.pattern].x.call(that, d, i); })
      .y(function(d, i) { return patterns[that.pattern].y.call(that, d, i); })
      .interpolate(this.interpolation);

    // Circles show control points.
    // var circles = this.canvas.selectAll('circle')
    //   .data(d3.range(0, this.points));

    // circles.exit().remove();
    // circles.enter().append('circle');

    // circles
    //   .transition()
    //   .attr('cx', function(d, i) { return patterns[that.pattern].x.call(that, d, i); })
    //   .attr('cy', function(d, i) { return patterns[that.pattern].y.call(that, d, i); })
    //   .attr('r', 2);

    this.path
      .transition()
      .attr('class', 'path')
      .attr('d', function() { return lineGenerator(data); });
  };


  // Scaling functions that accept an index value and return cartesian coordinates of a pattern.
  // Circle: http://stackoverflow.com/questions/13672867/how-to-place-svg-shapes-in-a-circle
  // Fermat: http://en.wikipedia.org/wiki/Fermat%27s_spiral
  var patterns = {
    circle: {
      x: function(d, i) { return sin(i * this.step * (pi/180)) * this.radius * (1 - this.inner * (i%2)) + (this.width/2); },
      y: function(d, i) { return cos(i * this.step * (pi/180)) * this.radius * (1 - this.inner * (i%2)) + (this.height/2); }
    },
    fermat: {
      x: function(d, i) { return (this.zoom/2 * sqrt(abs((i - this.points/2)))) * cos((i - this.points/2) * this.step) * (1 - this.inner * (i%2)) + (this.width/2); },
      y: function(d, i) { return (this.zoom/2 * sqrt(abs((i - this.points/2)))) * sin((i - this.points/2) * this.step) * (1 - this.inner * (i%2)) + (this.height/2); }
    }
  };


  // Export global.
  window.Shapes = Shapes; 


}())