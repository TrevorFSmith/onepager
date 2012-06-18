var onepage = onepage || {};
onepage.views = onepage.views || {};
onepage.models = onepage.models || {};

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

onepage.models.EBook = Backbone.Model.extend({});

onepage.models.EBook.prototype.initialize = function(){
	_.bindAll(this, 'tick', 'start', 'pause');
	this.tokens = []; // individual words (or whatever) to show serially
	this.index = 0; // the index into tokens for the currently displayed word
	this.wordsPerSecond = 1; // the speed which which to show this ebook
	this.paused = true; // whether or not this book is paused
	this.speedDelta = 3;

	// Break up the plain text into tokens
	var lines = this.get('plainText').split('\n');
	for(var i=0; i < lines.length; i++){
		var words = lines[i].split(' ');
		for(var j=0; j < words.length; j++){
			if(words[j].length == 0) continue;
			this.tokens[this.tokens.length] = words[j];
		}
	}
}

onepage.models.EBook.prototype.increaseSpeed = function(){
	this.wordsPerSecond += this.speedDelta;
}

onepage.models.EBook.prototype.decreaseSpeed = function(){
	if(this.wordsPerSecond >=this.speedDelta + 1){
		this.wordsPerSecond -= this.speedDelta;
	} else {
		this.wordsPerSecond = 1;
	}
}

onepage.models.EBook.prototype.tick = function(){
	console.log("Tick");
	if(this.paused) return;
	var nextIndex = this.index + 1;
	if(nextIndex >= this.tokens.length){
		this.pause();
		return;
	}
	this.index = nextIndex;
	console.log("Ticker", this.index);
	this.trigger('rsvp-next-word', this.tokens[this.index]);
	var lastChar = this.tokens[this.index].substr(this.tokens[this.index].length-1)

	var pause = (1.0 / this.wordsPerSecond) * 1000;
	if(lastChar == '.' || lastChar == '!' || lastChar == '?'){
		setTimeout(this.tick, 3 * pause);
	} else if(lastChar == ',' || lastChar == ':' || lastChar == ';'){
		setTimeout(this.tick, 2 * pause);
	} else {
		setTimeout(this.tick, pause);
	}
}

onepage.models.EBook.prototype.toggle = function(){
	if(this.paused){
		this.start();
	} else {
		this.pause();
	}
}

onepage.models.EBook.prototype.start = function(){
	console.log("Starting")
	if(!this.paused) return;
	this.paused = false;
	this.trigger('rsvp-started');
	if(this.index < 0 || this.index >= this.tokens.length - 1) this.index = 0;
	this.trigger('rsvp-next-word', this.tokens[this.index]);
	setTimeout(this.tick, (1.0 / this.wordsPerSecond) * 1000);
}

onepage.models.EBook.prototype.pause = function(){
	console.log("Pause")
	if(this.paused) return;
	this.paused = true;
	this.trigger('rsvp-paused');
}

onepage.views.PageView = Backbone.View.extend({
	id: 'pageView',

	initialize: function(){
		this.aboutView = new onepage.views.AboutView();
		this.$el.append(this.aboutView.render().el);
		this.homeView = new onepage.views.HomeView();
		this.$el.append(this.homeView.render().el);
		var self = this;
		$.ajax({
			url: 'Cory_Doctorow_-_Makers_snip.txt',
		}).done(function(data){
			self.homeView.handleData(data);
		});
	},

	render: function(){
		return this;
	},
});

onepage.views.HomeView = Backbone.View.extend({
	className: 'routeView',
	id: 'homeView',
	initialize: function(){
		_.bindAll(this, 'render', 'handleData', 'handleStarted', 'handlePaused', 'handleNextWord');
		this.model = null;

		var self = this;
		$('body').keypress(function(event){
			if(!self.model) return;
			if(event.keyCode == 32){
				self.model.toggle();
			} else if (event.keyCode == 102){
				self.model.increaseSpeed();
			} else if (event.keyCode == 115){
				self.model.decreaseSpeed();
			} else {
				console.log("key code", event.keyCode);
			}
		});
	},
	handleData: function(data){
		this.model = new onepage.models.EBook({plainText:data});
		this.model.on('rsvp-started', this.handleStarted);
		this.model.on('rsvp-paused', this.handlePaused);
		this.model.on('rsvp-next-word', this.handleNextWord);
	},
	handleStarted: function(){
	},
	handlePaused: function(){
	},
	handleNextWord: function(word){
		console.log("Next word", word);
		this.rsvpPanel.text(word);
	},
	render: function(){
		this.$el.append('<h1>"Makers" by Cory Doctorow</h1>');
		this.rsvpPanel = $('<div id="rsvpPanel" />');
		this.$el.append(this.rsvpPanel);
		this.$el.append($('<div id="instructionsPanel">').text('Press the space bar to start and stop, "f" for faster, "s" for slowers.'));
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
