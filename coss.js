var coss = coss || {};

coss.api = coss.api || {};

coss.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

coss.api.Saint = Backbone.Model.extend({
	initialize: function(){
		_.bindAll(this);
	},
	getDate: function(){
		return coss.constructDate(this.get('month'), this.get('date'));
	},
	getDateDisplay: function(){
		return coss.monthNames[this.get('month') - 1] + ' ' + this.get('date');
	},
});

coss.api.Saints = Backbone.Collection.extend({
	model:coss.api.Saint,
	url:'coss-data.js',

	// By default, sort the Saints by date
	comparator: function(saint) { return saint.getDate().getTime(); },

	findByDate: function(month, date){
		// Return the *index* of the saint in the collection with a date matching or the closest to the month/date passed in.
		var targetDate = coss.constructDate(month, date);
		for(var i =0; i < this.length; i++){
			var saintDate = this.at(i).getDate();
			if(saintDate.getTime() == targetDate.getTime()){ // if targetDate is a saint's day, use that
				return i;
			} else if(saintDate < targetDate){ // if this day is in the past and the next day is in the future, use that
				if(i < this.length - 1 && this.at(i + 1).getDate() > targetDate){
					return i + 1;
				}
			}
		}
		return 0;
	},
});


coss.views = coss.views || {};

coss.views.DaysFlipView = Backbone.View.extend({
	className: 'days-flip-view',
	events: {
		'click #left-day-arrow':'flipLeft',
		'click #right-day-arrow':'flipRight',
	},
	initialize: function(){
		_.bindAll(this);
		this.saintIndex = 0;
		this.navDate = null;
		this.options.saints.on('reset', this.handleReset);
	},
	navToDay: function(month, date){
		document.location.href = '#' + month + '-' + date;
	},
	showDay: function(month, date){
		if(this.options.saints.length == 0){
			// Save the navDate for when the reset is triggered
			this.navDate = [month, date];
			console.log("Saving nav day", month, date);
			return;
		}

		// Ok, we have saints and a nav date, let's go there
		console.log("Naving", month, date);
		this.saintIndex = this.options.saints.findByDate(month, date);
		var saint = this.options.saints.at(this.saintIndex);
		if(saint.get('month') != month || saint.get('date') != date){
			console.log("Renavving");
			this.navToDay(saint.get('month'), saint.get('date'));
			return;
		}
		this.render();
	},
	handleReset: function(){
		// find the next saint
		console.log("Handling reset", this.navDate);
		if(this.navDate){
			this.showDay(this.navDate[0], this.navDate[1]);
			this.navDate = null;
		} else {
			this.showDay(new Date().getMonth() + 1, new Date().getDate());
		}
	},
	flipLeft: function(){ return this.flip(-1); },
	flipRight: function(){ return this.flip(1); },
	flip: function(delta){
		var targetIndex = this.saintIndex + delta;
		if(targetIndex < 0){
			targetIndex = this.options.saints.length - 1;
		} else if(targetIndex >= this.options.saints.length){
			targetIndex = 0;
		}
		var saint = this.options.saints.at(targetIndex);
		this.navToDay(saint.get('month'), saint.get('date'));
		return false;
	},
	render: function(){
		this.$el.empty();
		if(this.options.saints.length == 0){
			return this;
		}

		var leftAnchor = $('<a id="left-day-arrow" class="day-arrow" href=".">&laquo;</a>');
		this.$el.append(leftAnchor);
		var rightAnchor = $('<a id="right-day-arrow" class="day-arrow" href=".">&raquo;</a>');
		this.$el.append(rightAnchor);

		var saint = this.options.saints.at(this.saintIndex);
		this.$el.append($.el.h2(saint.getDateDisplay()));
		var dayDetailView = new coss.views.DayDetailView({model:saint});
		this.$el.append(dayDetailView.render().el);
		return this;
	},
})

coss.views.DayDetailView = Backbone.View.extend({
	className: 'day-detail-view',
	initialize: function(){
		_.bindAll(this);
	},
	render: function(){
		this.$el.empty();
		this.$el.append($.el.h1('Saint ', this.model.get('name'), ' Day'));

		var deets = $.el.div({'class':'day-detail-deets'});
		this.$el.append(deets);

		var themes = this.model.get('themes');
		var themeList = deets.append($.el.ul());
		themeList.append($.el.h3('Themes'));
		for(var i=0; i < themes.length; i++){
			themeList.append($.el.li(themes[i]));
		}

		var patronage = this.model.get('patronage');
		var patronageList = deets.append($.el.ul());
		patronageList.append($.el.h3('Patronage'));
		for(var i=0; i < patronage.length; i++){
			patronageList.append($.el.li(patronage[i]));
		}

		this.$el.append($.el.div({'class':'day-detail-body'}, this.model.get('body')));
		return this;
	},
})

coss.constructDate = function(month, day){
	var d = new Date();
	d.setMonth(parseInt(month) - 1);
	d.setDate(parseInt(day));
	d.setHours(12);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0)
	return d;	
}

coss.formatDate = function(month, day){
	return coss.constructDate(month, day).toLocaleDateString();
}