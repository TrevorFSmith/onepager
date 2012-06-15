var onepage = onepage || {};
onepage.views = onepage.views || {};

onepage.bumperCount = 20;
onepage.maxTranslationX = 450;
onepage.maxTranslationY = 200;

onepage.Router = Backbone.Router.extend({
	routes: {
		"":"home",
		"about":"about",
		"animation":"animation",
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

	animation: function() {
		onepage.activateNav('#animation');
		$('.routeView').hide();
		$('#animationView').show();
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
		this.animationView = new onepage.views.AnimationView();
		this.$el.append(this.animationView.render().el);
	},

	render: function(){
		return this;
	},
});

onepage.views.HomeView = Backbone.View.extend({
	className: 'routeView',
	id: 'homeView',
	initialize: function(){
		_.bindAll(this, 'render');
	},
	render: function(){
		for(var i=0; i < onepage.bumperCount; i++){
			var bumper = $('<div id="bumper-"' + i + ' class="bumper" />');
			bumper.css('-webkit-animation', 'spin-' + i + ' 5s alternate infinite');
			bumper.css('-moz-animation', 'spin-' + i + ' 5s alternate infinite');
			bumper.css('-ms-animation', 'spin-' + i + ' 5s alternate infinite');
			this.$el.append(bumper);
		}
		return this;
	},
});

onepage.views.AnimationView = Backbone.View.extend({
	className: 'routeView',
	id: 'animationView',
	initialize: function(){
		_.bindAll(this, 'render');
	},
	render: function(){
		var css = '';
		for(var i=0; i < onepage.bumperCount; i++){
			var translations = [];
			translations[0] = [parseInt(Math.random() * onepage.maxTranslationX), parseInt(Math.random() * onepage.maxTranslationY)];
			translations[1] = [parseInt(Math.random() * onepage.maxTranslationX), parseInt(Math.random() * onepage.maxTranslationY)];
			translations[2] = [parseInt(Math.random() * onepage.maxTranslationX), parseInt(Math.random() * onepage.maxTranslationY)];
			translations[3] = [parseInt(Math.random() * onepage.maxTranslationX), parseInt(Math.random() * onepage.maxTranslationY)];
			css += this.genKeyframe('webkit', i, parseInt(Math.random() * 360), translations);
			css += this.genKeyframe('moz', i, parseInt(Math.random() * 360), translations);
			css += this.genKeyframe('ms', i, parseInt(Math.random() * 360), translations);
		}
		var cssElement = $('<code />').text(css);
		this.$el.append(cssElement);
		return this;
	},

	genKeyframe: function(prefix, index, rotationStart, translations){
		var degDelta = 360 / 4;
		return  '\
	@-' + prefix + '-keyframes spin-' + index + ' {\n\
		0% { -' + prefix + '-transform:   rotate(' + rotationStart + 'deg) translate(' + translations[0][0]+ 'px, ' + translations[0][1]+ 'px); }\n\
		25% { -' + prefix + '-transform:  rotate(' + (rotationStart + (degDelta * 2)) + 'deg) translate(' + translations[1][0]+ 'px, ' + translations[1][1]+ 'px); }\n\
		50% { -' + prefix + '-transform:  rotate(' + (rotationStart + (degDelta * 3)) + 'deg) translate(' + translations[2][0]+ 'px, ' + translations[2][1]+ 'px); }\n\
		75% { -' + prefix + '-transform:  rotate(' + (rotationStart + (degDelta * 4)) + 'deg) translate(' + translations[3][0]+ 'px, ' + translations[3][1]+ 'px); }\n\
		100% { -' + prefix + '-transform:   rotate(' + rotationStart + 'deg) translate(' + translations[0][0]+ 'px, ' + translations[0][1]+ 'px); }\n\
	}\n\
		';
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
	},
});

$(document).ready(function(){
	window.pageView = new onepage.views.PageView({el:"#pageView"});
	window.pageView.render();
	Backbone.history.start();
});
