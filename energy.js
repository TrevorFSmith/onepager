var energy = energy || {};

energy.schmooPath = "m 0.8026106,92.507016 c 0.0631,33.731374 55.3230224,31.479744 55.1880124,-2.83478 -0.135,-34.31454 -28.457052,-23.06606 -20.309182,-60.9479 8.14786,-37.8818221 -30.6438304,-37.8711921 -19.28409,0.0706 11.35975,37.94178 -15.6578104,29.98072 -15.5947404,63.7121 z"

energy.Layer = Backbone.Model.extend({
	initialize: function(){
		_.bindAll(this, 'initAttribute');
		this.initAttribute('name', 'Unnamed Layer');
		this.initAttribute('size', 1);
		this.initAttribute('color', '#999');
		this.initAttribute('grid', null);
		this.initAttribute('blur', null);
		this.initAttribute('shimmering', false);
		this.initAttribute('colorBlobs', null);
		this.initAttribute('opacity', 1);
		this.initAttribute('path', energy.schmooPath);
	},
	initAttribute: function(name, defaultValue){
		if(this.has(name)) return;
		this.set(name, defaultValue);
	},
});

energy.LayerCollection = Backbone.Collection.extend({
	model: energy.Layer,
});

energy.createDefaultLayerCollection = function(){
	var collection = new energy.LayerCollection();
	collection.add(new energy.Layer({ name:'Layer 7: Ketheric template',
		size:4,
		color:'#DDD',
		opacity: 0.5,
	}));
	collection.add(new energy.Layer({ name:'Layer 6: Celestial',
		size:3,
		color:'#EEE',
		opacity: 0.5,
	}));
	collection.add(new energy.Layer({ name:'Layer 5: Etheric template',
		size:2.2,
		color:'#DDD',
		opacity: 0.5,
		blur: 5,
	}));
	collection.add(new energy.Layer({ name:'Layer 4: Astral',
		size:1.9,
		color:'#F00',
		opacity: 0.5,
		blur: 4,
	}));
	collection.add(new energy.Layer({ name:'Layer 3: Mental',
		size:1.6,
		color:'#FF0',
		opacity: 0.5,
		blur: 3,
	}));
	collection.add(new energy.Layer({ name:'Layer 2: Emotional',
		size:1.25,
		color:'#F50',
		opacity: 0.8,
		blur: 2,
	}));
	collection.add(new energy.Layer({ name:'Layer 1: Etheric',
		size:1,
		color:'#055',
		opacity: 1,
		blur: 1,
	}));

	return collection;
}

energy.LayerCollectionView = Backbone.View.extend({
	class: 'layer-collection',
	initialize: function(){
		_.bindAll(this, 'render');
		this.layerViews = [];
		for(var i=0; i < this.collection.length; i++){
			this.layerViews[this.layerViews.length] = new energy.LayerView({id:'layer-id-' + i, model:this.collection.at(i)});
		}
	},
	render: function(){
		this.$el.empty();
		var svg = this.$el.svg().svg('get');
		//svg.line(svg._width() / 2, 0, svg._width() / 2, svg._height(), {stroke: '#FDD', strokeWidth: 3})
		//svg.line(0, svg._height() / 2, svg._width(), svg._height() / 2, {stroke: '#FDD', strokeWidth: 3})
		for(var i=0; i < this.collection.length; i++){
			this.layerViews[i].render(svg);
		}
		return this;
	},
});

energy.LayerView = Backbone.View.extend({
	class: 'layer-view',
	initialize: function(){
	},
	render: function(svg){ 
		// This is a little different than the usual Backbone render model.
		// Instead of rendering to this.el using the DOM we render SVG into the SVG context passed as a parameter.
		var layerGroup = svg.group(this.id, {opacity: this.model.get('opacity')});

		var defs = svg.defs(layerGroup, this.id + '-defs');
		var layerFilter = svg.filter(defs, this.id + '-filter', null,null,null,null, {'color-interpolation-filters':'sRGB'});
		var gaussianBlur = svg.filters.gaussianBlur(layerFilter, null, null, this.model.get('blur') ? this.model.get('blur') :  0, {id:this.id + '-gblur'});

		var path = svg.path(layerGroup, this.model.get('path'), {fill: '#FFF', 'fill-opacity': 0, stroke:this.model.get('color'), strokeWidth: 3, filter:'url(#' + this.id + '-filter' + ')'});
		var layerBBox = layerGroup.getBBox();
		var midX = svg._width() / 2.0;
		var midY = svg._height() / 2.0;
		var scaledWidth = layerBBox.width * this.model.get('size');
		var scaledHeight = layerBBox.height * this.model.get('size');
		var drawX = midX - (scaledWidth / 2.0);
		var drawY = midY - (scaledHeight / 2.0);
		var transform = 'translate(' + drawX + ', ' + drawY + ') scale(' + this.model.get('size') + ', ' + this.model.get('size') + ')';
		layerGroup.setAttribute('transform',  transform);

		//gaussianFilter.setAttribute('width', scaledWidth + 10);
		//gaussianFilter.setAttribute('height', scaledHeight + 10);
	}	
})