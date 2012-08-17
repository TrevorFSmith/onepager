/*
	A set of Bootstrap widgets which map to Backbone.Model fields.
*/
var bootbone = bootbone || {};

bootbone.DropDownView = Backbone.View.extend({
	/*
	A Bootstrap DropDown which is mapped to a Backbone.Model's field.
	To use, create a DropDownView like so:

		var model = new SomeBackboneModel({'binkyField':'Moo'});
		var view = new bootbone.DropDownView({'model':model, 'fieldName':'binkyField', 'values':['Goo', 'Moo', 'Foo', 'Loo']})

	That will create a Backbone.View which changes along with the binkyField and allows user to choose a new value from the 'values' list.
	*/
	className: 'drop-down-view',

	initialize: function(){
		_.bindAll(this, 'render', 'handleChange');
		this.fieldName = this.options.fieldName;
		if(!this.fieldName) console.log("No 'fieldName' in drop down view", this);
		this.values = this.options.values;
		if(!this.values) console.log("No 'values' in drop down view", this);

		this.model.on('change:' + this.fieldName, this.handleChange, this);
	},

	handleChange: function(model, changed){
		var button = this.$el.find('.btn');
		button.empty();
		button.append(this.model.get(this.fieldName) + ' ');
		button.append($.el.span({class:'caret'}));
	},

	render: function(){
		this.$el.empty();
		var buttonGroup = $.el.div({class:'btn-group'});
		this.$el.append(buttonGroup);
		var button = $.el.button({class:'btn dropdown-toggle', 'data-toggle':'dropdown'}, this.model.get(this.fieldName) + ' ', $.el.span({class:'caret'}));
		buttonGroup.append(button);
		var menu = $.el.ul({class:'dropdown-menu'});
		buttonGroup.append(menu);
		for(var i=0; i < this.values.length; i++){
			var item = $.el.li($.el.a(this.values[i]));
			menu.append(item);
			$(item).click(_.bind(function(){
				this.view.model.set(this.view.fieldName, this.val);
			}, { val: this.values[i], view: this }));
		}
		this.$el.append($.el.label(this.fieldName));
		return this;
	},
})
