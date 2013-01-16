var onepage = onepage || {};
onepage.views = onepage.views || {};

onepage.Router = Backbone.Router.extend({
	routes: {
		"":"home",
		"about":"about",
	},
	home: function(){
		onepage.activateNav('#');
		$('.routeView').hide();
		$('#homeView').show();
	},

	about: function() {
		onepage.activateNav('#about');
		$('.routeView').hide();
		$('#aboutView').show();
	},
});
window.router = new onepage.Router();

onepage.activateNav = function(hash){
	$('.nav li').attr('class', 'inactive');
	$('a[href=' + hash + ']').parent().attr('class', 'active');
}

onepage.views.PageView = Backbone.View.extend({
	id: 'pageView',

	initialize: function(){
		this.aboutView = new onepage.views.AboutView();
		this.$el.append(this.aboutView.render().el);
		this.homeView = new onepage.views.HomeView();
		this.$el.append(this.homeView.render().el);
	},

	render: function(){
		return this;
	},
});

onepage.views.BoxView = Backbone.View.extend({
	className: 'boxView',
	initialize: function(){
		_.bindAll(this);
		this.$el.draggable({
			cursor:'move',
			create:this.dragCreate,
			start:this.dragStart,
			drag:this.dragDrag,
			stop:this.dragStop,
		});
	},
	render: function(){
		this.$el.empty();
		return this;
	},
	dragCreate: function(event){
	},
	dragStart: function(event){
	},
	dragDrag: function(event){
	},
	dragStop: function(event){
	},
})

onepage.views.DragCreateHelper = Backbone.View.extend({
	className:'dragCreateHelper',
	initialize: function(){
		_.bindAll(this);
	},
	render: function(){
		this.$el.empty();
		return this;
	},
})

onepage.views.HomeView = Backbone.View.extend({
	className: 'routeView',
	id: 'homeView',
	initialize: function(){
		_.bindAll(this);
		this.startPosition = null;
		this.draggingBoxView = null;
		this.helperView = new onepage.views.DragCreateHelper();

		this.$el.draggable({
			cursor:'move',
			cursorAt: { top: 0, left: 0 },
			helper: _.bind(function(event){
				// Return an empty helper so that we don't move this view but render no helper
				return this.helperView.el;
			}, this),
			start:this.dragStart,
			drag:this.dragDrag,
			stop:this.dragStop,
		});
	},
	dragStart: function(event){
		this.startPosition = [event.offsetX, event.offsetY];
		this.draggingBoxView = new onepage.views.BoxView();
		this.draggingBoxView.$el.css({position: 'absolute', top:event.offsetY + 'px', left:event.offsetX + 'px'});
		this.$el.append(this.draggingBoxView.render().el);
	},
	dragDrag: function(event){
		var mousePosition = this.helperView.$el.position();
		var viewPosition = this.$el.position();
		var mouseOffset = [mousePosition.left - viewPosition.left, mousePosition.top - viewPosition.top];
		var width = Math.abs(this.startPosition[0] - mouseOffset[0]);
		var height = Math.abs(this.startPosition[1] - mouseOffset[1]);
		var left = this.startPosition[0];
		if(this.startPosition[0] - mouseOffset[0] > 0) left = this.startPosition[0] - width;
		var top = this.startPosition[1];
		if(this.startPosition[1] - mouseOffset[1] > 0) top = this.startPosition[1] - height;
		this.draggingBoxView.$el.css({'top':top, 'left':left, 'width':width, 'height':height});
	},
	dragStop: function(event){
	},
	render: function(){
		this.$el.empty()
		return this;
	},
});

onepage.views.AboutView = Backbone.View.extend({
	className: 'routeView',
	id: 'aboutView',
	initialize: function(){
		_.bindAll(this, 'render');
		this.template = $("#aboutTemplate").html();
	},
	render: function(){
		this.$el.html(_.template(this.template, {}));
		return this;
	},
});

$(document).ready(function(){
	window.pageView = new onepage.views.PageView({el:"#pageView"});
	window.pageView.render();
	Backbone.history.start();
});
