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

onepage.views.RailView = Backbone.View.extend({
	/*
	The element at the border of a resizable BoxView (passed as options.parent) which responds to drag events by resizing the BoxView.
	*/
	className: 'boxViewRail',
	initialize: function(){
		_.bindAll(this);
		this.$el.addClass(this.options.position + 'BoxViewRail'); // Add a class like 'topBoxViewRail'
		this.helperView = new onepage.views.DragHelper();
		this.$el.draggable({
			cursor:'move',
			cursorAt: { top: 0, left: 0 },
			helper: _.bind(function(event){ return this.helperView.el; }, this),			
			start:this.dragStart,
			drag:this.dragDrag,
			stop:this.dragStop,
		});
	},
	dragStart: function(event){
		this.startPosition = [event.pageX, event.pageY];
		this.lastDelta = [0,0];
	},
	dragDrag: function(event){
		var mousePosition = [event.pageX, event.pageY];
		var delta = [(this.startPosition[0] - mousePosition[0]), (this.startPosition[1] - mousePosition[1])];
		this.handleDelta([this.lastDelta[0] - delta[0], this.lastDelta[1] - delta[1]]);
		this.lastDelta = delta;
	},
	handleDelta: function(delta){
		if(this.options.position == 'top'){
			var newTop = parseInt(this.options.parent.$el.css('top')) + delta[1];
			var newHeight = parseInt(this.options.parent.$el.css('height')) - delta[1];
			this.options.parent.$el.css({'top': newTop + 'px', 'height':newHeight + 'px'});
		} else if(this.options.position == 'bottom'){
			var newHeight = parseInt(this.options.parent.$el.css('height')) + delta[1];
			this.options.parent.$el.css({'height':newHeight + 'px'});
		} else if(this.options.position == 'right'){
			var newWidth = parseInt(this.options.parent.$el.css('width')) + delta[0];
			this.options.parent.$el.css({'width':newWidth + 'px'});
		} else if(this.options.position == 'left'){
			var newLeft = parseInt(this.options.parent.$el.css('left')) + delta[0];
			var newWidth = parseInt(this.options.parent.$el.css('width')) - delta[0];
			this.options.parent.$el.css({'left':newLeft + 'px', 'width':newWidth + 'px'});
		}
	},
	dragStop: function(event){
	},
	render: function(){
		this.$el.empty();
		return this;
	}
})

onepage.views.BoxView = Backbone.View.extend({
	className: 'boxView',
	initialize: function(){
		_.bindAll(this);
		this.helperView = new onepage.views.DragHelper();
		this.draggableDiv = $.el.div({'class':'boxViewDraggableDiv'});
		this.$el.append(this.draggableDiv);
		$(this.draggableDiv).draggable({
			cursor:'move',
			helper: _.bind(function(event){ return this.helperView.el; }, this),			
			start:this.dragStart,
			drag:this.dragDrag,
			stop:this.dragStop
		});
		this.topRailView = new onepage.views.RailView({position:'top', parent:this});
		this.$el.append(this.topRailView.render().el);
		this.bottomRailView = new onepage.views.RailView({position:'bottom', parent:this});
		this.$el.append(this.bottomRailView.render().el);
		this.rightRailView = new onepage.views.RailView({position:'right', parent:this});
		this.$el.append(this.rightRailView.render().el);
		this.leftRailView = new onepage.views.RailView({position:'left', parent:this});
		this.$el.append(this.leftRailView.render().el);
	},
	dragStart: function(event){
		this.startPosition = [parseInt(this.$el.css('left')), parseInt(this.$el.css('top'))];
		this.startMousePosition = [event.pageX, event.pageY];

	},
	dragDrag: function(event){
		var mousePosition = [event.pageX, event.pageY];
		var delta = [-1 * (this.startMousePosition[0] - mousePosition[0]), -1 * (this.startMousePosition[1] - mousePosition[1])];
		var newTop = this.startPosition[1] + delta[1];
		var newLeft = this.startPosition[0] + delta[0];
		this.$el.css({'top':newTop + 'px', 'left':newLeft + 'px'});
	},
	dragStop: function(event){
	},
	render: function(){
		return this;
	},

})

onepage.views.DragHelper = Backbone.View.extend({
	/*
	An empty view which is used as a drag helper instead of moving the draggable element
	*/
	className:'DragHelper',
	initialize: function(){
		_.bindAll(this);
	},
	render: function(){
		this.$el.empty();
		return this;
	},
	offset: function(parentEl){
		// Returns [x,y] position of this view relative to parentEl
		var position = this.$el.position();
		var parentPosition = $(parentEl).position();
		return [position.left - parentPosition.left, position.top - parentPosition.top]
	}
})

onepage.views.HomeView = Backbone.View.extend({
	className: 'routeView',
	id: 'homeView',
	initialize: function(){
		_.bindAll(this);
		this.startPosition = null;
		this.draggingBoxView = null;
		this.helperView = new onepage.views.DragHelper();

		this.$el.draggable({
			cursor:'move',
			cursorAt: { top: 0, left: 0 },
			helper: _.bind(function(event){ return this.helperView.el; }, this),			
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
		var mouseOffset = this.helperView.offset(this.$el)
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
