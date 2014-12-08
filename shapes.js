(function () {

  // ======
  // Shapes
  // ======

  var sin  = Math.sin;
  var cos  = Math.cos;
  var pi   = Math.PI;
  var sqrt = Math.sqrt;


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

    var radius = this.width * this.zoom / this.width;

    // Place points and path coordinates around the circumference of a circle.
    // http://stackoverflow.com/questions/13672867/how-to-place-svg-shapes-in-a-circle
    var x = function(datum, index) { return sin(index * that.step * (pi / 180)) * radius * (1 - that.inner * (index % 2)) + (that.width / 2); };
    var y = function(datum, index) { return cos(index * that.step * (pi / 180)) * radius * (1 - that.inner * (index % 2)) + (that.height / 2); };

    // Create an array of length {points}.
    var data = d3.range(0, this.points);

    var lineGenerator = d3.svg.line()
      .x(x).y(y)
      .interpolate(this.interpolation);

    // Circles show control points.
    var circles = this.canvas.selectAll('circle')
      .data(d3.range(0, this.points));

    circles.exit().remove();

    circles
      .enter()
      .append('circle')

    circles
      .transition()
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 2);

    this.path
      .transition()
      // .ease('elastic')
      .attr('class', 'path')
      .attr('d', function() { return lineGenerator(data); });
  };


  // Export global.
  window.Shapes = Shapes; 


}())