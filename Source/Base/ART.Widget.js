/*
Script: ART.Widget.js

License:
	MIT-style license.
*/

// Base widget class. Based on » http://gist.github.com/85837
(function(){

var counting, focused;

ART.Widget = new Class({
	
	Implements: [Options, Events],
	
	ns: 'art',
	name: 'widget',
	
	options: {
		// onShow: $empty,
		// onHide: $empty,
		// onFocus: $empty,
		// onBlur: $empty,
		// onEnable: $empty,
		// onDisable: $empty,
		// onDestroy: $empty,
		// onAdoption: $empty(parentWidget),
		// onOrphan: $empty(previousParent),
		// id: null,
		// style: null,
		renderWhileHidden: false,
		className: '',
		keyboardOptions: {
			active: false
		},
		parentWidget: null,
		element: null
	},
	
	initialize: function(options){
		this.latchEvents('adoption');
		this.pseudos = [];
		this.childWidgets = [];
		var parent, kbManager;
		if (options) {
			if (options.parentWidget) {
				parent = options.parentWidget;
				delete options.parentWidget;
			}
			if (options.keyboardOptions && options.keyboardOptions.manager) {
				kbManager = options.keyboardOptions.manager;
				delete options.keyboardOptions.manager;
			}
		}
		this.setOptions(options);
		this.prefix = this.ns + '-' + this.name;
		this.element = this.options.element || new Element('div');
		this.element.set({
			id: this.element.get('id') || this.options.id || this.prefix+new Date().getTime()
		}).store(this.prefix, this).store('widget', this);
		this.element.addClass([this.ns, this.prefix, this.options.className].join(' '));
		this.classes = this.options.classes;
		this.classes = (this.options.className) ? this.options.className.split(' ') : [];

		var kbOptions = $merge(this.options.keyboardOptions, options ? options.keyboardOptions || {} : {});
		kbOptions.manager = kbManager || (parent ? parent.keyboard : null);
		this.keyboard = new Keyboard(kbOptions);
		this.keyboard.widget = this;
		this.keyboard.addEvent('deactivate', this.blur.bind(this));

		if (parent) this.setParent(parent);
	},

	addClass: function(className){
		this.classes.include(className);
		return this;
	},

	removeClass: function(className) {
		this.classes.erase(className);
		return this;
	},

	getSelector: function(){
		var selector = (this.parentWidget) ? this.parentWidget.getSelector() + ' ' : '';
		selector += this.name;
		if (this.classes.length) selector += '.' + this.classes.join('.');
		if (this.pseudos.length) selector += ':' + this.pseudos.join(':');
		return selector;
	},

	addPseudo: function(pseudo){
		this.pseudos.include(pseudo);
	},

	removePseudo: function(pseudo){
		this.pseudos.erase(pseudo);
	},

	setParent: function(widget, initing){
		if (!initing) this.removeParent();
		this.parentWidget = widget;
		widget.childWidgets.include(this);
		this.parentWidget.keyboard.manage(this.keyboard);
		this.enable();
		this.fireEvent('adoption', widget);
		return this;
	},

	removeParent: function(){
		this.prevParent = this.parentWidget || this.prevParent;
		if (!this.prevParent) return;
		if (this.parentWidget) {
			this.parentWidget.childWidgets.erase(this);
			Keyboard.manager.manage(this.keyboard);
			this.parentWidget = null;
		}
		this.fireEvent('orphan', this.prevParent);
	},

	// render

	requireToRender: function(){
		this.requiredToRender = this.requiredToRender || [];
		$A(arguments).each(function(requirement) {
			this.requiredToRender.push(requirement);
		}, this);
	},

	readyToRender: function() {
		if (!this.requiredToRender || !this.requiredToRender.length) return;
		$A(arguments).each(function(requirement) {
			this.requiredToRender.erase(requirement);
		}, this);
	},

	redraw: function(){
		if (counting) this._counters();
		this.childWidgets.each(function(child) {
			child.render();
		});
		return this;
	},

	isReadyToRender: function(){
		var isReady = (!this.requiredToRender || !this.requiredToRender.length) && !this.destroyed && (this.options.renderWhileHidden || !this.hidden);
		if (isReady && this.parentWidget) isReady = this.parentWidget.isReadyToRender();
		return isReady;
	},

	render: function(override){
		if (this.isReadyToRender()) this.redraw(override);
		return this;
	},

	// special states
	
	//not visible
	hide: function(){
		if (!this.hidden){
			this.hidden = true;
			this.fireEvent('hide');
			this.element.addClass(this.prefix + '-hidden');
			this.addPseudo('hidden');
			this.render();
		}
		return this;
	},
	
	//engaged; the button is down, the select list is expanded, the mouse is clicking this thing
	activate: function(){
		if (!this.active){
			this.active = true;
			this.fireEvent('activate');
			this.element.addClass(this.prefix + '-active');
			this.addPseudo('active');
			this.render();
		}
		return this;
	},
	
	//has keyboard control
	focus: function(){
		if (!this.keyboard.isActive()){
			this.keyboard.activate();
			this.focused = true;
			this.fireEvent('focus');
			this.element.addClass(this.prefix + '-focused');
			this.addPseudo('focus');
			focused = this;
			this.render();
		}
		return this;
	},
	
	//non-interactive
	disable: function(byParent){
		this.disabledByParent = false;
		if (!this.disabled){
			if (byParent) this.disabledByParent = true;
			this.blur();
			this.fireEvent('disable');
			this.keyboard.deactivate();
			this.childWidgets.each(function(child){
				child.disable(true);
			});
			this.element.addClass(this.prefix + '-disabled');
			this.addPseudo('disabled');
			this.disabled = true;
			this.render();
		}
		return this;
	},
	
	// normal states
	//visible
	show: function(){
		if (this.hidden){
			this.hidden = false;
			this.fireEvent('show');
			this.element.removeClass(this.prefix + '-hidden');
			this.removePseudo('hidden');
			this.render();
		}
		return this;
	},
	//the button is released, the select list is contracted, the mouse is up
	deactivate: function(){
		if (this.active){
			this.active = false;
			this.fireEvent('deactivate');
			this.element.removeClass(this.prefix + '-active');
			this.removePseudo('active');
			this.render();
		}
		return this;
	},
	
	//focus has shifted to another widget
	blur: function(){
		if (this.focused){
			this.focused = false;
			this.fireEvent('blur');
			this.keyboard.deactivate();
			this.element.removeClass(this.prefix + '-focused');
			this.removePseudo('focus');
			this.render();
		}
		return this;
	},
	//the widget is interactable
	enable: function(){
		if (this.parentWidget && this.parentWidget.disabled) {
			this.disabledByParent = true;
			return this;
		};
		delete this.disabledByParent;
		if (this.disabled){
			this.disabled = false;
			this.fireEvent('enable');
			this.element.removeClass(this.prefix + '-disabled');
			this.removePseudo('disabled');
			this.render();
		}
		this.childWidgets.each(function(child){
			if (child.disabledByParent) {
				child.enable();
				delete child.disabledByParent;
			}
		});
		return this;
	},

	attachKeys: function(events){
		this.keyboard.addEvents(events);
	},

	detachKeys: function(events) {
		this.keyboard.removeEvents(events);
	},

	addShortcut: function(name, shortcut) {
		this.keyboard.addShortcut(name, shortcut);
	},

	addShortcuts: function(obj) {
		this.keyboard.addShortcuts(obj);
	},

	removeShortcut: function(name) {
		this.keyboard.removeShortcut(name);
	},

	removeShortcuts: function(names) {
		this.keyboard.removeShortcuts(names);
	},

	getShortcut: function(name) {
		return this.keyboard.getShortcut(name);
	},

	getShortcuts: function() {
		return this.keyboard.getShortcuts();
	},

	destroy: function(){
		this.removeParent();
		$A(this.childWidgets).each(function(widget) {
			widget.destroy();
		});
		if (this.childWidgets.length && window.console && console.warn) {
			this.childWidgets.each(function(widget) {
				console.warn("warning: %s called the destroy method of %s but it failed. Ensure that destroy method calls this.parent", this.prefix, widget.prefix);
			}, this);
		}
		this.element.destroy();
		this.destroyed = true;
		return this.fireEvent('destroy');
	},

	// toElement
	
	toElement: function(){
		return this.element;
	},
	
	_redrawCount: 0,
	_counters: function(){
		this._redrawCount++;
		$clear(this._countTimer);
		this._countTimer = (function(){
			this._redrawCount = 0;
		}).delay(1000, this);
		console.log('redraw %s: ', this.name, this._redrawCount, this.element);
	}
	
});

ART._counts = function(){
	counting = !counting;
	if (counting) console.log('counting widget renders');
	else console.log('disabling widget render counts');
};

})();