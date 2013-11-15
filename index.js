/**
 * Adapted from this example: 
 *      - http://jbkflex.wordpress.com/2011/07/28/creating-a-svg-pie-chart-html5/
 */

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var delegate = require('delegate');
var bind = require('bind');

/**
 * SVG namespace.
 */

var svgns = "http://www.w3.org/2000/svg";

/**
 * Default values.
 */

var width = 70;
var height = 70;
var colors = [ "#3498db", "#1cceab", "#2ecc71", "#9b59b6", "#34495e", 
  "#e74c3c", "#e67e22", "#f1c40f", "#d35400", "#c0392b", "#95a5a6", 
  "#2c3e50"];

/**
 * Export `Pie`
 */

module.exports = Pie

/**
 * `Pie` constructor.
 *
 * @argument {Array} data The list of data.
 *
 *    Accepted formats:
 *      
 *        - [1, 2, 3]
 *        - [[1, 'label1'], [2, 'label2']]
 *        - [[1, 'label1' , 'red'], [2, 'label2', 'blue']]
 */

function Pie(data) {

  if (!(this instanceof Pie)) {
    return new Pie(data);
  }

  this.binds = {
    onmouseover: bind(this, this.onmouseover)
  };

  this.data(data);
}

/**
 * Load data for the pie and compute total and angles.
 *
 * @api private
 */

Pie.prototype.data = function(data) {
  var val;

  this.datums = data;
  this.values = [];
  this.colors = [];

  // add up the data values so we know how big the pie is
  this.total = 0;
  for(var i = 0; i < data.length; i++) {
    val = data[i];

    // storing color for easier access.
    this.colors.push(val[2]);

    if (!(typeof val === "number")) {
      val = val[0];
    }
    
    this.values.push(val);
    this.total += val;
  }

  // figure out how big each slice of pie is. Angles in radians.
  this.angles = [];
  for(var i = 0; i < data.length; i++) {
    this.angles[i] = this.values[i] / this.total * Math.PI * 2;
  }
}

/**
 * Set the dimensions of the pie chart
 *
 * @api public
 */

Pie.prototype.size = function(width, height) {
  this.width = width;
  this.height = height;

  return this;
}

/**
 * Renders the pie chart
 *
 * @api public
 */

Pie.prototype.render = function() {
  var values = this.values;
  var angles = this.angles;

  var w = this.width || width;    // The width of the chart
  var h = this.height || height;  // The height of the chart
  var cx = w/2;                   // The center on x
  var cy = h/2;                   // The cenger on y
  var r = cy;                     // The radius

  var el = document.createElementNS(svgns, "svg:svg");

  el.setAttribute("width", w);
  el.setAttribute("height", h);
  el.setAttribute("viewBox", "0 0 " + w + " " + h);

  // Loop through each slice of pie.
  var startangle = 0;
  for(var i = 0; i < values.length; i++) {

    // This is where the wedge ends
    var endangle = startangle + angles[i];

    // Compute the two points where our wedge intersects the circle
    // These formulas are chosen so that an angle of 0 is at 12 o'clock
    // and positive angles increase clockwise.
    var x1 = cx + r * Math.sin(startangle);
    var y1 = cy - r * Math.cos(startangle);
    var x2 = cx + r * Math.sin(endangle);
    var y2 = cy - r * Math.cos(endangle);

    // This is a flag for angles larger than than a half circle
    // It is required by the SVG arc drawing component
    var big = 0;
    if (endangle - startangle > Math.PI) big = 1;

    // We describe a wedge with an <svg:path> element
    var path = document.createElementNS(svgns, "path");

    // This string holds the path details
    var d = "M " + cx + "," + cy + // Start at circle center
      " L " + x1 + "," + y1 +      // Draw line to (x1,y1)
      " A " + r + "," + r +        // Draw an arc of radius r
      " 0 " + big + " 1 " +        // Arc details...
      x2 + "," + y2 +              // Arc goes to to (x2,y2)
      " Z";                        // Close path back to (cx,cy)

    // Now set attributes on the <svg:path> element
    path.setAttribute("d", d);
    path.setAttribute("fill", this.colors[i] 
      || colors[i % colors.length]);
    path.setAttribute("stroke", "#FFF");
    path.setAttribute("stroke-width", "1");
    
    // Store index on the path
    path.__idx =  i;

    // Add wedge to chart
    el.appendChild(path);                   

    // The next wedge begins where this one ends
    startangle = endangle;
  }
  
  // Unbind events if it was previously rendered.
  if (this.el) {
    delegate.unbind(el, 'mouseover', 
      this.binds.onmouseover);
  }

  // Bind events
  delegate.bind(el, 'path', 'mouseover', 
    this.binds.onmouseover);

  this.el = el;

  return el;
}

/**
 * Mouseover handler
 *
 * @api private
 */

Pie.prototype.onmouseover = function(e) {
  var i = e.target.__idx;
  var d = this.datums[i];
  var val = this.values[i];
  var col = this.colors[i] || 
    colors[i % colors.length];

  this.emit('hover', i, {
      value: val, 
      label: d[1], 
      color: col,
      share: val * 100 / this.total
    }, e);
}

/**
 * Emitter mixin.
 */

Emitter(Pie.prototype);

