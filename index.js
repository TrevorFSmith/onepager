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
	className: 'rowFluid',
	initialize: function(){
		this.aboutView = new onepage.views.AboutView();
		this.$el.append(this.aboutView.render().el);
		this.homeView = new onepage.views.HomeView();
		this.$el.append(this.homeView.render().el);
		this.homeView.open();
	},

	render: function(){
		return this;
	},
});

onepage.views.HomeView = Backbone.View.extend({
	id: 'homeView',
	className: 'routeView span12',
	data: {},
	socket: null,

	initialize: function(){
		_.bindAll(this, 'render', 'open', 'onOpen', 'onMessage');
	},

	open: function(){
		try {
			this.socket = new WebSocket("ws://trevor.smith.name:9000/data");
		} catch (e) {
			this.socket = new MozWebSocket("ws://trevor.smith.name:9000/data");
		}
		this.socket.onopen = this.onOpen;
		this.socket.onmessage = this.onMessage;
		this.socket.onclose = this.onClose;

	},

	onOpen: function(){
		this.socket.send('hi');
	},

	onClose: function(){
		$('#holder').html("The WebSocket connection has closed.");
	},

	onMessage: function(e){
		var lines = e.data.split('\n');

		for (var i = 0; i < lines.length - 1; i++) {
			var parts = lines[i].split(' ');
			var d = parts[0], x = parseFloat(parts[1]), y = parseFloat(parts[2]);
			if (!(d in this.data)) this.data[d] = [];
			this.data[d].push([x,y]);
		}

		var plots = [];
		for (var d in this.data){
			plots.push({ 
				data: this.data[d].slice(this.data[d].length - 200) 
			});
		}

		$.plot($('#holder'), plots, {
			series: { lines: { show: true, fill: true },},
			yaxis: { min: 0 },
		});
		this.socket.send('');
	},

	render: function(){
		this.$el.append('<div id="holder">Connecting...</div>');
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
