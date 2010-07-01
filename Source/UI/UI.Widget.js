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
var focusedWidgets = {};

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
			styles: {},
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
			if (options.styles) {
				var styles = options.styles;
				delete options.styles;
				this.setStyles(styles);
			}
		}
		
		this.setOptions(options);
		if (this.options.id) this.setID(this.options.id);

		this._classNames = [];
		if (this.options.className) this.options.className.split(' ').each(function(className){
			this.addClass(className);
		}, this);

		if (parent) this.register(parent);
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
	
	setStyles: function(styles){
		var camelCase = {};
		for (name in styles) {
			camelCase[name.camelCase()] = styles[name];
		}
		this.setOptions({
			styles: camelCase
		});
	},
	
	/*
		states
	*/
	
	_states: {
		disabled: false,
		focused: false,
		active: false
	},
	
	setState: function(name, state) {
		this._states[name] = state;
		return this;
	},

	getState: function(name) {
		return this._states[name];
	},
	
	/* enable, disable */
	
	//enabled means you can interact with a widget
	//it can be activated, it can receive focus, it can update itself or animate itself.
	
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
	
	//disabled means you cannot interact with a widget
	//it cannot be activated, it cannot receive focus, it cannot update itself or animate itself.
	
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
	
	//the widget is in the foreground; this is unique among siblings
	//the widget can be activated
	
	focus: function(){
		if (this.getState('disabled') || this.getState('focused')) return false;

		this.setState('focused', true);
		this.fireEvent('focus');
		this._blurredByParent = false;
		
		for (var w in focusedWidgets){
			if (focusedWidgets[w]) var widget = widgets[w];
			if (widget && widget != this && !widget.contains(this) && !this.contains(widget)) widget.blur();
		}
		focusedWidgets[this.uid] = true;
		
		this._childWidgets.each(function(child) {
			if (child._blurredByParent) child.focus();
		});
		
		return true;
	},
	
	//the widget is not in the foreground
	//it cannot be activated
	
	blur: function(){
		if (this.getState('disabled') || !this.getState('focused')) return false;

		this.deactivate();
		this.setState('focused', false);
		this.fireEvent('blur');
		focusedWidgets[this.uid] = false;
		
		this._childWidgets.each(function(child){
			if (child.getState('focused')){
				child._blurredByParent = true;
				child.blur();
			}
		});
		
		return true;
	},
	
	/* activate, deactivate */
	
	//the widget is being interacted with presently
	//the button is depressed, the window is being dragged, the select list is dropped open
	
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
		if (this._disabledByParent) this.enable();
		return this;
	},
	
	unregister: function(){
		if (widgets[this.uid]){
			delete widgets[this.uid];
			if (this.getState('enabled')) {
				this.disable();
				this._disabledByParent = true;
			}
			if (this.parentWidget){
				this.parentWidget._childWidgets.erase(this);
				this.fireEvent('unregister', this.parentWidget);
				this.parentWidget.fireEvent('unregistered', this);
				this.parentWidget = null;
			}
		}
		return this;
	},

	contains: function(widget) {
		if (this._childWidgets.contains(widget)) return true;
		for(var len = this._childWidgets.length - 1; len > 0; len = len - 1) {
			if (this._childWidgets[len].contains(widget)) return true;
		}
		return false;
	},
	
	isDestroyed: function(){
		if (!this.element || !this.element.parentNode) return;
	},
	
	grab: function(){
		for (var i = 0; i < arguments.length; i++){
			var widget = arguments[i];
			if ((widget instanceof Widget)) widget.register(this);
		}
		return this;
	},
	
	/* Sheet integration */
	
	getSheet: function(){
		var sheet = UI.Sheet.lookup(this.toString());
		if (this.options.styles) sheet = $merge(sheet, this.options.styles);
		return sheet;
	},
	
	diffSheet: function(){
		var oldSheet = this._oldSheet;
		if (!oldSheet) return this._oldSheet = this.getSheet();
		var newSheet = this.getSheet();
		var mixSheet = {};
		
		for (var p in newSheet){
			var newValue = newSheet[p],
			    oldValue = oldSheet[p];
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
