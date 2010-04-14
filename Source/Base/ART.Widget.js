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
		//the adoption event latches; i.e. once it has fired, 
		//any new onAdoption events added to the instance will 
		//be immediately called; kind of like DomReady.
		this.latchEvents('adoption');
		this.pseudos = [];
		this.childWidgets = [];
		var parent, kbManager;
		//due to an issue with $merge (which setOptions uses)
		//we have to remove any Class instance references from the optoins object
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
		//all widgets have a namespace and a name - 'namespace-name' becomes the prefix
		this.prefix = this.ns + '-' + this.name;
		this.element = this.options.element || new Element('div');
		//give an id if there isn't one
		//store a pointer on teh element to this instance
		this.element.set({
			id: this.element.get('id') || this.options.id || this.prefix+new Date().getTime()
		}).store(this.prefix, this).store('widget', this);
		//add the namespace, prefix, and className as classes to the element
		this.element.addClass([this.ns, this.prefix, this.options.className].join(' '));
		this.classes = (this.options.className) ? this.options.className.split(' ') : [];

		//create a keyboard instance for the widget
		var kbOptions = $merge(this.options.keyboardOptions, options ? options.keyboardOptions || {} : {});
		kbOptions.manager = kbManager || (parent ? parent.keyboard : null);
		this.keyboard = new Keyboard(kbOptions);
		this.keyboard.widget = this;
		this.keyboard.addEvent('deactivate', this.blur.bind(this));

		//if there's a parent set in the options, add it
		if (parent) this.setParent(parent);
	},

	//adds a class to the widget and redraws it
	addClass: function(className){
		this.classes.include(className);
		this.redraw();
		return this;
	},

	//removes a class from the widget and redraws it
	removeClass: function(className) {
		this.classes.erase(className);
		this.redraw();
		return this;
	},

	//gets the selector for this widget; includes the selectors of any ancestors
	getSelector: function(){
		var selector = (this.parentWidget) ? this.parentWidget.getSelector() + ' ' : '';
		selector += this.name;
		if (this.classes.length) selector += '.' + this.classes.join('.');
		if (this.pseudos.length) selector += ':' + this.pseudos.join(':');
		return selector;
	},

	//adds a psuedo to the instance and redraws
	addPseudo: function(pseudo){
		this.pseudos.include(pseudo);
		this.redraw();
		return this;
	},

	//removes a psuedo from the instance and redraws
	removePseudo: function(pseudo){
		this.pseudos.erase(pseudo);
		this.redraw();
		return this;
	},

	//assigns another widget as the parent of this one
	//used for art.sheet selector states as well as bubbling
	//of certain behaviors and events
	setParent: function(widget, initing){
		if (!initing) this.removeParent();
		this.parentWidget = widget;
		widget.childWidgets.include(this);
		this.parentWidget.keyboard.manage(this.keyboard);
		this.enable();
		this.fireEvent('adoption', widget);
		return this;
	},

	//deletes the reference to a parent widget
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

	//takes the arguments passed (strings) and pushes them onto a
	//stack that acts as a reference counter. So long as items are
	//in that stack, the render functionality is paused.
	requireToRender: function(){
		this.requiredToRender = this.requiredToRender || [];
		$A(arguments).each(function(requirement) {
			this.requiredToRender.push(requirement);
		}, this);
	},

	//takes the arguments passed (strings) and removes them from 
	//the requiredToRender stack (see requireToRender method).
	readyToRender: function() {
		if (!this.requiredToRender || !this.requiredToRender.length) return;
		$A(arguments).each(function(requirement) {
			this.requiredToRender.erase(requirement);
		}, this);
	},

	//re-draws this widget and all its children. intended extension point for
	//subclasses
	redraw: function(){
		if (counting) this._counters();
		this.childWidgets.each(function(child) {
			child.render();
		});
		return this;
	},

	//returns true if the requiredToRender array is empty and this instance
	//is not destroyed, (optionally) not hidden, and its parent widget is
	//also ready to render
	isReadyToRender: function(){
		var isReady = (!this.requiredToRender || !this.requiredToRender.length) && !this.destroyed && (this.options.renderWhileHidden || !this.hidden);
		if (isReady && this.parentWidget) isReady = this.parentWidget.isReadyToRender();
		return isReady;
	},

	//checks to see if this instance is ready to render and, if so, calls its 
	//redraw method. intended to be called (the redraw method is not).
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
		//if the parent widget is disabled, then this one is, too
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

	/*
		Keyboard integration / delegation methods
	*/
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

	//destroys a widget and its child widgets.
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
	
	/*
		Counters used for optimization.
	*/
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

//toggles logging of render calls
ART._counts = function(){
	counting = !counting;
	if (counting) console.log('counting widget renders');
	else console.log('disabling widget render counts');
};

})();