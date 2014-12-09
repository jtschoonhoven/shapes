(function () {


  // =========
  // Shapes.JS
  // =========


  // Make Math functions more convenient.
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

    // Separate each subsequent point by {n} degrees from the prev.
    this.step = parseFloat(d3.select('#step').attr('value'));

    // Number of control points when drawing path.
    this.points = parseFloat(d3.select('#points').attr('value'));

    // Rotate along center.
    this.rotation = parseFloat(d3.select('#rotation').attr('value'));

    // Rotate every other control point independently of group.
    this.innerRotation = parseFloat(d3.select('#innerRotation').attr('value'));

    // Technically radius, but we'll call it "zoom".
    this.zoom = parseFloat(d3.select('#zoom').attr('value'));

    // Delay between transitions.
    this.speed = parseFloat(d3.select('#speed').attr('value'));

    // Ratio of size of inner shape to outer shape.
    this.innerScale = parseFloat(d3.select('#innerScale').attr('value'));

    // Base pattern on which control points are aligned.
    this.pattern = d3.select('#pattern').attr('value');

    // How to curve lines between control points.
    this.interpolation = d3.select('#interpolation').attr('value');

    this.draw();
  };


  // ==================
  // Update a parameter
  // ==================

  Shapes.prototype.update = function(attribute, value) {
    this[attribute] = parseFloat(value) || value;
    this.draw();
  };


  // ==================
  // Animate parameters
  // ==================

  Shapes.prototype.animate = function(attribute, val, min, max, step, saw) {
    var that = this;

    min  = parseFloat(min);
    max  = parseFloat(max);
    val  = parseFloat(val);
    step = parseFloat(step);

    this.animating[attribute] ? this.animating[attribute] = false : this.animating[attribute] = true;

    function animate() {
      setTimeout(function() {
        if (that.animating[attribute]) {
          if (val + step > max) { step *= -1; }
          if (val + step < min) { step *= -1; }
          that.update(attribute, val += step);
          animate();
        }
      }, 1000/that.speed);
    }

    animate();
  };


  // ============
  // (re)Draw SVG
  // ============

  Shapes.prototype.draw = function() {
    var that = this;
    var data   = new Array(this.points);
    var svg    = d3.select('svg');
    var canvas = svg.select('.canvas');

    // Fit the circle radius to the window.
    this.radius = this.width * this.zoom / this.width;

    // Define gradient.
    var gradients = svg.append('defs').append('linearGradient').attr('id', 'gradient');
    gradients.append('stop').attr('offset', '10%').attr('stop-color', 'gold');
    gradients.append('stop').attr('offset', '95%').attr('stop-color', 'green');

    // Rotate along center if applicable.
    if (this.rotation) {
      canvas.attr('transform', 'rotate('+ this.rotation +','+ this.width/2 +','+ this.height/2 +')');
    }

    // Attach a <path> if not already present and apply gradient.
    var path = canvas.selectAll('path').data([1])
    path.enter().append('path').attr('stroke', 'url(#gradient)');;

    // Call lineGenerator to apply a pattern to control points.
    var lineGenerator = d3.svg.line()
      .x(function(d,i) { return patterns[that.pattern].x.call(that, i); })
      .y(function(d,i) { return patterns[that.pattern].y.call(that, i); })
      .interpolate(this.interpolation);

    // Transition into (new) control point coordinates.
    path.transition().ease('linear')
      .attr('d', function() { return lineGenerator(data); });
  };


  // =======
  // Paterns
  // =======

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


  // =============
  // Export global
  // =============

  window.Shapes = Shapes; 

}())