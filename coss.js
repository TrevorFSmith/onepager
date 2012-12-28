var coss = coss || {};

coss.api = coss.api || {};

coss.api.Saint = Backbone.Model.extend({});

coss.api.Saints = Backbone.Collection.extend({
	model:coss.api.Saint,
	url:'coss-data.js',
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
		this.options.saints.on('reset', this.render);
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
		this.$el.append($.el.h2(coss.formatDate(2012, saint.get('month'), saint.get('date'))));
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

coss.formatDate = function(year, month, day){
	var d = new Date();
	d.setUTCFullYear(parseInt(year));
	d.setUTCMonth(parseInt(month) - 1);
	d.setUTCDate(parseInt(day));
	d.setUTCHours(12);
	d.setUTCMinutes(0);
	d.setUTCSeconds(0);
	return d.toLocaleDateString();  
}