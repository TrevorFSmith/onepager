var energy = energy || {};

energy.schmooPath = "m 0.8026106,92.507016 c 0.0631,33.731374 55.3230224,31.479744 55.1880124,-2.83478 -0.135,-34.31454 -28.457052,-23.06606 -20.309182,-60.9479 8.14786,-37.8818221 -30.6438304,-37.8711921 -19.28409,0.0706 11.35975,37.94178 -15.6578104,29.98072 -15.5947404,63.7121 z"

energy.Layer = Backbone.Model.extend({
	initialize: function(){
		_.bindAll(this, 'initAttribute');
		this.initAttribute('name', 'Unnamed Layer');
		this.initAttribute('size', 1);
		this.initAttribute('color', '#999');
		this.initAttribute('grid', null);
		this.initAttribute('shimmering', false);
		this.initAttribute('colorBlobs', null);
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
	collection.add(new energy.Layer({ name:'Layer 2: Emotional',
		size:1.32,
		color:'#F50',
	}));
	collection.add(new energy.Layer({ name:'Layer 1: Etheric',
		size:1.16,
		color:'#055',
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
		console.log(this, this.$el.width(), svg);
		var layerGroup = svg.group(svg, this.id);
		layerGroup.setAttribute('transform', 'translate(10, 10) scale(' + this.model.get('size') + ')');
		window.g = layerGroup;
		var path = svg.path(layerGroup, this.model.get('path'), {fill: '#FFF', 'fill-opacity': 0.5, stroke:this.model.get('color'), strokeWidth: 3});
	}	
})