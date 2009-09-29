/*
Script: ART.Widget.js

License:
	MIT-style license.
*/

// Base widget class. Based on » http://gist.github.com/85837
(function(){

var counting;

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
			active: true
		},
		parentWidget: null
	},
	
	initialize: function(options){
		this.latchEvents('adopt');
		this.pseudos = [];
		this.childWidgets = [];
		this.keyboard = new Keyboard();
		this.keyboard.widget = this;
		var parent;
		if (options) {
			if (options.parentWidget) {
				parent = options.parentWidget;
				delete options.parentWidget;
			}
		}
		this.setOptions(options);
		this.keyboard.setOptions(this.options.keyboardOptions).setup();
		this.prefix = this.ns + '-' + this.name;
		this.element = new Element('div', {
			id: this.options.id || this.prefix+new Date().getTime(),
			'class': this.options.className
		}).store(this.prefix, this);
		this.element.addClass(this.ns).addClass(this.prefix);
		this.classes = this.options.classes;
		this.classes = (this.options.className) ? this.options.className.split(' ') : [];
		if (parent) this.setParent(parent);
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
		if (this.parentWidget.disabled) {
			this.disabledByParent = true;
			this.disable();
		} else {
			this.disabled = true;
			this.enable();
		}
		this.render();
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
	
	hide: function(){
		if (!this.hidden){
			this.fireEvent('hide');
			this.element.addClass(this.prefix + '-hidden');
			this.addPseudo('hidden');
			this.render();
			this.hidden = true;
		}
		return this;
	},
	
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
	
	focus: function(){
		if (!this.focused){
			this.focused = true;
			this.fireEvent('focus');
			this.element.addClass(this.prefix + '-focused');
			this.addPseudo('focus');
			if (focused) focused.blur();
			focused = this;
			this.render();
		}
		return this;
	},
	
	disable: function(byParent){
		if (!this.disabled){
			if (byParent) this.disabledByParent = true;
			this.blur();
			this.disabled = true;
			this.fireEvent('disable');
			this.keyboard.deactivate();
			this.childWidgets.each(function(child){
				child.disable(true);
			});
			this.element.addClass(this.prefix + '-disabled');
			this.addPseudo('disabled');
			this.render();
		}
		return this;
	},
	
	// normal states
	
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
	
	blur: function(){
		if (this.focused){
			this.focused = false;
			this.fireEvent('blur');
			this.element.removeClass(this.prefix + '-focused');
			this.removePseudo('focus');
			this.render();
		}
		return this;
	},
	
	enable: function(){
		if (this.disabled){
			this.disabled = false;
			this.keyboard.activate();
			this.childWidgets.each(function(child){
				if (child.disabledByParent) {
					child.enable();
					delete child.disabledByParent;
				}
			});
			this.fireEvent('enable');
			this.element.removeClass(this.prefix + '-disabled');
			this.removePseudo('disabled');
			this.render();
		}
		return this;
	},

	attachKeys: function(events){
		this.keyboard.addEvents(events);
	},

	detachKeys: function(events) {
		this.keyboard.removeEvents(events);
	},

	destroy: function(){
		this.removeParent();
		this.childWidgets.each(function(child) {
			child.destroy();
		});
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
		dbug.log('redraw %s: ', this.name, this._redrawCount, this.element);
	}
	
});

ART._counts = function(){
	counting = !counting;
	if (counting) dbug.log('counting widget renders');
	else dbug.log('disabling widget render counts');
};

})();