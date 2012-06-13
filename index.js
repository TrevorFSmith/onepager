var onepage = onepage || {};
onepage.views = onepage.views || {};

/*
    <script type="text/javascript">
      function initialize() {
        var myOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"),
            myOptions);
      }
    </script>
  </head>
  <body onload="initialize()">
    <div id="map_canvas" style="width:100%; height:100%"></div>
  </body>
*/
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

onepage.views.HomeView = Backbone.View.extend({
	className: 'routeView',
	id: 'homeView',
	initialize: function(){
		_.bindAll(this, 'render');
	},
	render: function(){
		var mapOptions = {
			center: new google.maps.LatLng(47.66620925,-122.31716518),
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(this.el, mapOptions);

		var signLayer = new google.maps.FusionTablesLayer({
			query: {
				select: 'Latitude',
				from: '1DMT1bhBsnSqyJDPizMM9BZ2tgkDWXHHunfkUi00'
			},
		});
		signLayer.setMap(map);
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
	var mapScriptURL = 'http://maps.googleapis.com/maps/api/js?key=' + settings.googleAPIKey + '&sensor=false&callback=gmap_draw';
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src  = mapScriptURL;

	window.gmap_draw = function(){
		window.pageView = new onepage.views.PageView({el:"#pageView"});
		window.pageView.render();
		Backbone.history.start();
	};
	$("head").append(s);  
});
