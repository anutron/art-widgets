/*
---
name: UI.Widget
description: Base Widget Class
requires: [UI, UI.Sheet, Core/Class, Core/Events, Core/Options]
provides: UI.Widget
...
*/

(function(){
	
var widgets = UI.widgets = {}; UID = 0;

var Widget = UI.Widget = new Class({
	
	Implements: [Events, Options],
	
	name: 'widget',
	
	options: {
		/*
			onFocus: $empty,
			onBlur: $empty,
			onEnable: $empty,
			onDisable: $empty,
			parentWidgte: null,
		*/
		id: '',
		className: ''
	},
	
	initialize: function(options){
		this.uid = ART.uniqueID();
		
		this.parentWidget = null;
		this._childWidgets = [];
		
		var parent;
		if (options) {
			if (options.parentWidget) {
				parent = options.parentWidget;
				delete options.parentWidget;
			}
		}
		
		this.setOptions(options);
		if (this.options.id) this.setID(this.options.id);

		this._classNames = [];
		if (this.options.className) this.options.className.split(' ').each(function(className){
			this.addClass(className);
		}, this);

		if (parent) this.inject(parent);
	},

	/* ID */
	
	setID: function(id){
		this.id = id;
		return this;
	},
	
	/* classNames */
	
	addClass: function(className){
		this._classNames.push(className);
		return this;
	},
	
	removeClass: function(className){
		this._classNames.erase(className);
		return this;
	},
	
	hasClass: function(className){
		return this._classNames.contains(className);
	},
	
	/*
		states
	*/
	
	_states: {
		disabled: false,
		focus: false,
		active: false
	},
	
	setState: function(name, state) {
		this._states[name] = state;
	},

	getState: function(name) {
		return this._states[name];
	},
	
	/* enable, disable */
	
	enable: function(){
		if ((this.parentWidget && this.parentWidget.getState('disabled')) || !this.getState('disabled')) return false;
		this._disabledByParent = false;
		this.setState('disabled', false);
		this.fireEvent('enable');
		
		this._childWidgets.each(function(child){
			if (child._disabledByParent) child.enable();
		});
		
		return true;
	},
	
	disable: function(){
		if (this.getState('disabled')) return false;
		
		this.blur();
					
		this._childWidgets.each(function(child){
			if (!child._states.disabled){
				child._disabledByParent = true;
				child.disable();
			}
		});

		this.setState('disabled', true);;
		this.fireEvent('disable');

		return true;
	},
	
	/* focus, blur */
	
 	focus: function(){
		if (this.getState('disabled') || this.getState('focus')) return false;

		this.setState('focus', true);
		this.fireEvent('focus');
		
		for (var w in widgets){
			var widget = widgets[w];
			if (widget != this && !this._childWidgets.contains(widget)) widget.blur();
		}
		
		return true;
	},
	
	blur: function(){
		if (this.getState('disabled') || !this.getState('focus')) return false;

		this.deactivate();
		this.setState('focus', false);
		this.fireEvent('blur');
		
		this._childWidgets.each(function(child){
			child.blur();
		});
		
		return true;
	},
	
	/* activate, deactivate */
	
	activate: function(){
		if (this.getState('disabled') || this.getState('active')) return false;
		this.focus();
		this.setState('active', true);
		
		this.fireEvent('active');
		
		return true;
	},
	
	deactivate: function(){
		if (this.getState('disabled') || !this.getState('active')) return false;
		this.setState('active', false);
		this.fireEvent('inactive');
		
		return true;
	},

	/* child & parent relationship, registration */
	
	register: function(parentWidget){
		widgets[this.uid] = this;
		if (parentWidget && (parentWidget instanceof Widget) && this.parentWidget !== parentWidget){
			this.parentWidget && this.parentWidget._childWidgets.erase(this);
			this.parentWidget = parentWidget;
			parentWidget._childWidgets.push(this);
			this.fireEvent('register', parentWidget.fireEvent('registered', this));
		}
		return this;
	},
	
	unregister: function(){
		if (widgets[this.uid]){
			delete widgets[this.uid];
			this.blur();
			if (this.parentWidget){
				this.parentWidget._childWidgets.erase(this);
				this.fireEvent('unregister', this.parentWidget);
				this.parentWidget.fireEvent('unregistered', this);
				this.parentWidget = null;
			}
		}
		return this;
	},
	
	grab: function(){
		for (var i = 0; i < arguments.length; i++){
			var widget = arguments[i];
			if ((widget instanceof Widget)) widget.inject(this);
		}
		return this;
	},
	
	/* Sheet integration */
	
	getSheet: function(){
		return UI.Sheet.lookup(this.toString());
	},
	
	diffSheet: function(){
		var oldSheet = this._oldSheet;
		if (!oldSheet) return this._oldSheet = this.getSheet();
		var newSheet = this.getSheet();
		
		var mixSheet = {};
		
		for (var p in newSheet){
			var newValue = newSheet[p], oldValue = oldSheet[p];
			if (String(newValue).toString() != String(oldValue).toString()){
				mixSheet[p] = oldSheet[p] = newValue;
			}
		}
		for (var mp in oldSheet) {
			if (newSheet[mp] == undefined) {
				delete this._oldSheet[mp];
				mixSheet[mp] = null;
			}
		}
		return mixSheet;
	}
	
});

Widget.prototype.toString = function(){
	var string = '';
	if (this.name) string += this.name;
	if (this.id) string += "#" + this.id;
	if (this._classNames.length) string += '.' + this._classNames.join('.');

	for (var s in this._states){
		if (this._states[s]) string += ':' + s;
	}
	
	var parentWidget = this.parentWidget;
	if (parentWidget) string = parentWidget.toString() + ' ' + string;
	
	return string;
};
	
})();
