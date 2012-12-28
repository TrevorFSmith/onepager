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
		this.options.saints.on('reset', this.handleReset);
	},
	handleReset: function(){
		// find the next saint
		this.options.saints.sort();
		this.saintIndex = 0;
		var today = coss.constructDate(new Date().getMonth() + 1, new Date().getDate());
		for(var i =0; i < this.options.saints.length; i++){
			var saintDate = this.options.saints.at(i).getDate();
			if(saintDate.getTime() == today.getTime()){	// if today is a saint's day, use that
				this.saintIndex = i;
				break;
			} else if(saintDate < today){ // if this day is in the past and the next day is in the future, use that
				if(i < this.options.saints.length - 1 && this.options.saints.at(i + 1).getDate() > today){
					this.saintIndex = i + 1;
					break;
				}
			}
			// else, default to the first in the list
		}
		this.render();
	},
	flipLeft: function(){ return this.flip(-1); },
	flipRight: function(){ return this.flip(1); },
	flip: function(delta){
		this.saintIndex += delta;
		if(this.saintIndex < 0){
			this.saintIndex = this.options.saints.length - 1;
		} else if(this.saintIndex >= this.options.saints.length){
			this.saintIndex = 0;
		}
		this.render();
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