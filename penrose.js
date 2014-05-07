/*
	A penrose tiler using D3.js
	http://en.wikipedia.org/wiki/Penrose_tiling
*/

var penrose = penrose || {};
penrose.views = penrose.views || {};

penrose.Phi = (1.0 + Math.sqrt(5.0)) / 2.0; // the golden ratio
penrose.D2R = Math.PI / 180.0;
penrose.R2D = 180.0 / Math.PI;
penrose.DartAngles = [216, 36, 72, 36];
penrose.KiteAngles = [144, 72, 72, 72];

/*
	These matches show which sides of each shape match sides on other shapes
	Corners are zero indexed counter-clockwise starting at the largest angle (dart is 216 deg, kite is 144 deg)
	Matching D0,1 to K1,0 means that D0 and K1 are colocated and D1 and K0 are colocated
*/
penrose.DartMatches = [
	[['K',1,0]], 			// Dart 0,1 to Kite 1,0  
	[['K',3,2], ['D',3,2]],	// Dart 1,2 to Kite 3,2 and Dart 3,2
	[['K',2,1], ['D',2,1]],	// Dart 2,3 to Kite 2,1 and Dart 2,1
	[['K',0,3]]				// Dart 3,0 to Kite 0,3
];
penrose.KiteMatches = [
	[['D',1,0], ['K',0,3]],	// Kite 0,1 to Dart 1,0 and Kite 0,3
	[['D',3,2], ['K',3,2]],	// Kite 1,2 to Dart 3,2 and Kite 3,2
	[['D',2,1], ['K',2,1]],	// Kite 2,3 to Dart 2,1 and Kite 2,1
	[['D',0,3], ['K',1,0]]	// Kite 3,0 to Dart 2,1 and Kite 2,1
];

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
	
	this.P0 through this.P3 are coordinates in counter-clockwise order, starting at x,y
	*/
}
penrose.Shape.prototype.shapeInit = function(scale, x, y, direction){
	this.scale = parseFloat(scale);
	this.shorterLen = scale / penrose.Phi; 
	this.direction = direction;

	// this shape's sides in counter-clockwise order, starting at p0 (which is x,y)
	// they are null if that side is empty
	// or they could be references to Shape.s? if the side is filled
	this.sides = [null,null,null,null];
}
penrose.Shape.prototype.positionBySide = function(firstPointIndex, secondPointIndex, targetX0,targetY0, targetX1,targetY1){
	var x0 = this['p' + firstPointIndex][0];
	var y0 = this['p' + firstPointIndex][1];
	var x1 = this['p' + secondPointIndex][0];
	var y1 = this['p' + secondPointIndex][1];

	var angle = penrose.degreesBetween(x0,y0, x1,y1);
	var targetAngle = penrose.degreesBetween(targetX0, targetY0, targetX1, targetY1);
	this.rotate(targetAngle - angle);

	x0 = this['p' + firstPointIndex][0];
	y0 = this['p' + firstPointIndex][1];

	this.translate(targetX0-x0, targetY0-y0);
}
penrose.Shape.prototype.rotate = function(angle){
	/*
	Rotate the points around p0 for `angle` degrees
	*/
	var translationDelta = [this.p0[0], this.p0[1]];
	this.translate(-translationDelta[0], -translationDelta[1]); // translate to origin

	// Rotate all the points
	this.p0 = penrose.rotatePointAroundOrigin(this.p0[0], this.p0[1], angle);
	this.p1 = penrose.rotatePointAroundOrigin(this.p1[0], this.p1[1], angle);
	this.p2 = penrose.rotatePointAroundOrigin(this.p2[0], this.p2[1], angle);
	this.p3 = penrose.rotatePointAroundOrigin(this.p3[0], this.p3[1], angle);

	this.translate(translationDelta[0], translationDelta[1]); // translate back from origin
	this.direction = this.direction + angle;
}
penrose.Shape.prototype.translate = function(dx, dy){
	/*
	Translate the points by dx,dy
	*/
	this.p0 = [this.p0[0]+dx, this.p0[1]+dy];
	this.p1 = [this.p1[0]+dx, this.p1[1]+dy];
	this.p2 = [this.p2[0]+dx, this.p2[1]+dy];
	this.p3 = [this.p3[0]+dx, this.p3[1]+dy];
}
penrose.Shape.prototype.isIn = function(x, y, width, height){
	// Returns true iff any points are inside the rect defined by x,y and width,height
	if(penrose.pointIn(this.p0[0], this.p0[1], x,y, width,height)) return true;
	if(penrose.pointIn(this.p1[0], this.p1[1], x,y, width,height)) return true;
	if(penrose.pointIn(this.p2[0], this.p2[1], x,y, width,height)) return true;
	if(penrose.pointIn(this.p3[0], this.p3[1], x,y, width,height)) return true;
	return false;
}
penrose.Shape.prototype.toString = function(){
	return this.NAME + ': ' + this.scale, x, y, direction;
}
penrose.Shape.prototype.toCoordinates = function(){
	return [this.p0, this.p1, this.p2, this.p3];
}


penrose.rotatePointAroundOrigin = function(x,y, angle){
	/*
	Rotate the point x,y around the origin by `angle` degrees.
	Returns array [x',y']
	*/
	//console.log('rpao', x, Math.cos(angle*penrose.D2R), y, Math.sin(angle * penrose.D2R))
	return [
		(x * Math.cos(angle * penrose.D2R)) - (y * Math.sin(angle * penrose.D2R)),
		(x * Math.sin(angle * penrose.D2R)) + (y * Math.cos(angle * penrose.D2R))
	];
}

penrose.degreesBetween = function(x1,y1, x2,y2){
	// return the angle in degrees of the line segment represented by x0,y0 and x1,y1
	return (Math.atan((y2 - y1) / (x2 - x1)) * penrose.R2D);
}

penrose.pointIn = function(px,py, x,y, width,height){
	if(px < x || px > x + width) return false;
	if(py < y || py > y + height) return false;
	return true;
}

penrose.Dart = function(scale, x, y, direction){
	/*
	Extends penrose.Shape to create the dart tile shape
	*/
	penrose.Shape.prototype.shapeInit.apply(this, arguments);
	this.p0 = [x,y];
	this.p1 = [x + this.shorterLen * Math.cos((direction + 72) * penrose.D2R), y + this.shorterLen * Math.sin((direction + 72) * penrose.D2R)];
	this.p2 = [x + scale * Math.cos(direction * penrose.D2R), y + scale * Math.sin(direction * penrose.D2R)];
	this.p3 = [x + this.shorterLen * Math.cos((direction - 72) * penrose.D2R), y + this.shorterLen * Math.sin((direction - 72) * penrose.D2R)];
};
penrose.Dart.prototype.NAME = 'Dart'
_.extend(penrose.Dart.prototype, penrose.Shape.prototype);

penrose.Kite = function(scale, x, y, direction){
	/*
	Extends penrose.Shape to create the kite tile shape
	*/
	penrose.Shape.prototype.shapeInit.apply(this, arguments);
	this.p0 = [x, y];
	this.p1 = [x + this.shorterLen * Math.cos((direction + 108) * penrose.D2R), y + this.shorterLen * Math.sin((direction + 108) * penrose.D2R)];
	this.p2 = [x + this.shorterLen * Math.cos(direction * penrose.D2R), y + this.shorterLen * Math.sin(direction * penrose.D2R)];
	this.p3 = [x + this.shorterLen * Math.cos((direction - 108) * penrose.D2R), y + this.shorterLen * Math.sin((direction - 108) * penrose.D2R)];
};
penrose.Kite.prototype.NAME = 'Kite'
_.extend(penrose.Kite.prototype, penrose.Shape.prototype);

penrose.tile = function(scale, startX, startY, width, height){
	/*
	Returns an array of Shapes (Dart or Kite)
	Args:
		scale: the unit length of the long sides of the shapes
		startX, startY: the coordinates of the first shape
		width, height: the size of the rectangle to fill
	*/	
	var results = [
		new penrose.Dart(scale, startX, startY, 0), 
	];

	var keepWorking = true;
	var shapeMatches = null;
	var sideMatches = null;
	var shape = null;
	var isDart = false;
	var newShape = null;
	var p0x = null;
	var p0y = null;
	var p1x = null;
	var p1y = null;
	while(keepWorking){
		keepWorking = false;
		// For each existing shape
		for(var i=0; i < results.length; i++){
			if(i > 1){
				console.log("Breaking for insanity");
				break;
			}
			shape = results[i];
			if(!shape.isIn(0, 0, width, height)){
				continue; // don't work on shapes outside the view
			}

			if(shape.NAME == 'Dart'){
				isDart = true;
				shapeMatches = penrose.DartMatches;
			} else {
				isDart = false;
				shapeMatches = penrose.KiteMatches;
			}

			// For each side
			for(var s=0; s < shape.sides.length; s++){
				if(shape.sides[s] != null) continue; // already matched
				keepWorking = true;

				// The side is empty so attempt a match
				sideMatches = shapeMatches[s];

				// TODO more intelligently pick a match
				match = sideMatches[penrose.randomInt(0,sideMatches.length - 1)];
				// find the endpoints on the original shape
				p0x = shape['p' + s][0];
				p0y = shape['p' + s][1];
				p1x = shape['p' + ((s + 1) % 4)][0];
				p1y = shape['p' + ((s + 1) % 4)][1];

				if(match[0] == 'K'){
					newShape = new penrose.Kite(scale, p0x, p0y, shape.direction);
				} else {
					newShape = new penrose.Dart(scale, p0x, p0y, shape.direction);
				}
				newShape.positionBySide(match[1], match[2], p0x,p0y, p1x,p1y);

				// Set the shape.sides to point to each other
				shape.sides[s] = newShape;
				newShape.sides[Math.min(match[1], match[2])] = shape;

				results[results.length] = newShape;
			}
		}
		break; // TODO do more than one
	}
	return results;
}

penrose.views.TileView = Backbone.View.extend({
	tagName: 'svg',
	initialize: function(options){
		this.options = options;
		_.bindAll(this, 'render');
		this.$el.addClass('tileView');
		this.svg = d3.select(this.el);
		this.svg.attr("width", this.options.width)
				.attr("height", this.options.height);

		this.shapes = penrose.tile(this.options.scale, this.options.width / 2, this.options.height / 2, this.options.width, this.options.height)

		var g = this.svg.selectAll("g").data(this.shapes);

		g.enter().append("g");
		g.exit().remove();

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
			.attr('fill', function(shape, i){
				return penrose.DefaultColorScheme[i % penrose.DefaultColorScheme.length]
			})
			.attr('stroke', 'white').attr('stroke-width', '1');

	}
});
