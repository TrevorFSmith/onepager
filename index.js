var onepage = onepage || {};
onepage.views = onepage.views || {};

onepage.Router = Backbone.Router.extend({
	routes: {
		"":"home",
		"about":"about"
	},
	initialize: function(){
		this.route(/^(.[0-9]?)-(.[0-9]?)$/, "day");
	},
	home: function(){
		onepage.activateNav('#');
		$('.routeView').hide();
		$('#homeView').show();
		window.pageView.homeView.showDay(new Date().getMonth() + 1, new Date().getDate());
	},
	day: function(month, date){
		onepage.activateNav('#');
		$('.routeView').hide();
		$('#homeView').show();
		window.pageView.homeView.showDay(parseInt(month), parseInt(date));
	},
	about: function() {
		onepage.activateNav('#about');
		$('.routeView').hide();
		$('#aboutView').show();
	}
});
window.router = new onepage.Router();

onepage.activateNav = function(hash){
	$('.nav li').attr('class', 'inactive');
	$('a[href=' + hash + ']').parent().attr('class', 'active');
}

onepage.views.PageView = Backbone.View.extend({
	id: 'pageView',

	initialize: function(){
		_.bindAll(this);
		this.saints = new coss.api.Saints();
		this.aboutView = new onepage.views.AboutView();
		this.$el.append(this.aboutView.render().el);
		this.homeView = new onepage.views.HomeView({'saints':this.saints});
		this.$el.append(this.homeView.render().el);
		this.saints.fetch({
			error: function(){ console.log("Error loading saints", arguments); }
		});
	},
	render: function(){
		return this;
	}
});

onepage.views.HomeView = Backbone.View.extend({
	className: 'routeView',
	id: 'homeView',
	initialize: function(){
		_.bindAll(this);
		this.daysFlipView = new coss.views.DaysFlipView({'saints':this.options.saints});
		this.daysFlipView.$el.addClass('span8');
	},
	showDay: function(month, date){
		this.daysFlipView.showDay(month, date);
	},
	render: function(){
		this.$el.empty();
		var topRow = $.el.div({'class':'row-fluid'})
		topRow.append($.el.div({'class':'span2'}));
		this.$el.append(topRow);
		topRow.append(this.daysFlipView.render().el);
		return this;
	}
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
	}
});

$(document).ready(function(){
	window.pageView = new onepage.views.PageView({el:"#pageView"});
	window.pageView.render();
	Backbone.history.start();
});
