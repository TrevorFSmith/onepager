/*
	A penrose tiler using D3.js
	http://en.wikipedia.org/wiki/Penrose_tiling
*/

var penrose = penrose || {};
penrose.views = penrose.views || {};

penrose.Phi = (1.0 + Math.sqrt(5.0)) / 2.0; // the golden ratio
penrose.D2R = Math.PI / 180.0;
penrose.DartAngles = [36, 72, 36, 216];
penrose.KiteAngles = [72, 72, 72, 144];

penrose.DefaultColorScheme = [
	'#17c7d2',	// blue Pantone 319U
	'#bbdc00',	// green Pantone 389U
	'#ffdd30',	// yellow Pantone 108U
	'#ff883c',	// orange Pantone 151U
	'#f15fa5'	// pink Pantone 225U
];

penrose.randomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

penrose.Shape = function(){
	/*
	One of the two tile shapes in the P2 penrose tiling.

	Args:
		scale is the length of the longer sides
			this determines the smaller sides, which are scale/penrose.Phi
		x and y are the coordinates of the point connecting the smallest two sides
		direction is the angle (in degrees) from x,y to the sharp tip of the dart
	
	this.P0 through this.P3 are coordinates in clockwise order, starting at x,y
	*/
}
penrose.Shape.prototype.shapeInit = function(scale, x, y, direction){
	this.scale = parseFloat(scale);
	this.shorterLen = scale / penrose.Phi; 
	this.direction = direction;	
}
penrose.Shape.prototype.toString = function(){
	return this.NAME + ': ' + this.scale, x, y, direction;
}
penrose.Shape.prototype.toCoordinates = function(){
	return [this.p0, this.p1, this.p2, this.p3];
}

penrose.Dart = function(scale, x, y, direction){
	penrose.Shape.prototype.shapeInit.apply(this, arguments);
	this.p0 = [x,y];
	this.p1 = [x + this.shorterLen * Math.cos((direction + 72) * penrose.D2R), y + this.shorterLen * Math.sin((direction + 72) * penrose.D2R)];
	this.p2 = [x + scale * Math.cos(direction * penrose.D2R), y + scale * Math.sin(direction * penrose.D2R)];
	this.p3 = [x + this.shorterLen * Math.cos((direction - 72) * penrose.D2R), y + this.shorterLen * Math.sin((direction - 72) * penrose.D2R)];
};
penrose.Dart.prototype.NAME = 'Dart'
_.extend(penrose.Dart.prototype, penrose.Shape.prototype);

penrose.Kite = function(scale, x, y, direction){
	penrose.Shape.prototype.shapeInit.apply(this, arguments);
	this.p0 = [x, y];
	this.p1 = [x + this.shorterLen * Math.cos((direction + 108) * penrose.D2R), y + this.shorterLen * Math.sin((direction + 108) * penrose.D2R)];
	this.p2 = [x + this.shorterLen * Math.cos(direction * penrose.D2R), y + this.shorterLen * Math.sin(direction * penrose.D2R)];
	this.p3 = [x + this.shorterLen * Math.cos((direction - 108) * penrose.D2R), y + this.shorterLen * Math.sin((direction - 108) * penrose.D2R)];
};
penrose.Kite.prototype.NAME = 'Kite'
_.extend(penrose.Kite.prototype, penrose.Shape.prototype);

penrose.views.TileView = Backbone.View.extend({
	tagName: 'svg',
	initialize: function(options){
		this.options = options;
		_.bindAll(this, 'render');
		this.$el.addClass('tileView');
		this.svg = d3.select(this.el);
		this.svg.attr("width", this.options.width)
				.attr("height", this.options.height);



		this.shapes = [
			new penrose.Dart(this.options.scale, 40, 40, 0), 
			new penrose.Kite(this.options.scale, 40, 40, 180),
			new penrose.Dart(this.options.scale, 80, 60, 0), 
			new penrose.Kite(this.options.scale, 80, 60, 180)
		];
		var g = this.svg.selectAll("g").data(this.shapes);
		g.enter().append("g")
			.attr("transform", function(shape, i) {
				return "translate(" + shape.p0[0] + "," + shape.p0[1] + ")"; 
			});

		g.append("path")
			.attr("d", function(shape) { 
				var coordinates = shape.toCoordinates();
				var path = "";
				for(var i=0; i < coordinates.length; i++){
					if(i ==0) {
						path += "M";
					} else {
						path += " L";
					}
					path += " " + coordinates[i][0] + " " + coordinates[i][1];

				}
				path += " z";
				return path;
			})
			.attr('fill', function(){
				return penrose.DefaultColorScheme[penrose.randomInt(0,penrose.DefaultColorScheme.length - 1)]
			})
			.attr('stroke', 'white').attr('stroke-width', '2');

	}
});
