/*
---
name: ART.Widget
description: ART Widget Class
requires: [UI.Widget, Core/Class, Core/Element.Style, Core/Element.Event, ART/ART.Base]
provides: ART.Widget
...
*/

(function(){
	
var Widget = ART.Widget = new Class({
	Extends: UI.Widget,
	options: {
		className: 'art',
		tabIndex: -1,
		onHide: function(){
			document.id(this).setStyle('display', 'none');
		},
		onShow: function(){
			document.id(this).setStyle('display', 'inline-block');
		}
	},

	initialize: function(options){
		this._createElement(options);
		this.canvas = new ART;
		document.id(this.canvas).setStyles({position: 'absolute', top: 0, left: 0}).inject(this.element);
		
		this.currentSheet = {};
		
		this.parent(options);
		
		this.setTabIndex(this.options.tabIndex);
		
		var self = this;
		
		this.element.addEvents({

			focus: function(){
				if (!self.getState('focus')) self.focus();
			},

			blur: function(){
				if (self.getState('focus')) self.blur();
			}
			
		});

	},
	
	_createElement: function(){
		this.element = this.element || new Element('div').setStyles({display: 'inline-block', position: 'relative', outline: 'none'});
	},
	
	/* tab indices */
	
	setTabIndex: function(index){
		this.element.tabIndex = this.tabIndex = index;
	},
	
	getTabIndex: function(){
		return this.tabIndex;
	},
	
	/* ARTSY Stuff */
	
	resize: function(width, height){
		this.element.setStyles({width: width, height: height});
		this.canvas.resize(width, height);
		return this;
	},

	setSheet: function(newSheet) {
		var sheet = $merge(this.diffSheet(), newSheet || {});
		for (var property in sheet) this.currentSheet[property] = sheet[property];
		return sheet;
	},
	
	draw: function(newSheet){
		for (var i = 0; i < this._childWidgets.length; i++) {
			this._childWidgets[i].draw();
		}
		return this.setSheet(newSheet);
	},
	
	deferDraw: function(){
		if (!this.element.parentNode || this.getState('hidden')) return;
		var self = this;
		clearTimeout(this.drawTimer);
		var args = arguments;
		this.drawTimer = setTimeout(function(){
			self.draw.apply(self, arguments);
		}, 1);
	},
	
	/* ID */
	
	setID: function(id){
		this.parent(id);
		this.element.set('id', id);
		this.deferDraw();
		return this;
	},
	
	/* classNames */
	
	addClass: function(className){
		this.parent(className);
		this.element.addClass(className);
		this.deferDraw();
		return this;
	},
	
	removeClass: function(className){
		this.parent(className);
		this.element.removeClass(className);
		this.deferDraw();
		return this;
	},
	
	/* states */
	
	_states: {
		hidden: false
	},
	
	enable: function(){
		if (!this.parent()) return false;
		this.setTabIndex(this.oldTabIndex);
		this.deferDraw();
		return true;
	},
	
	disable: function(){
		if (!this.parent()) return false;
		this.oldTabIndex = this.tabIndex;
		this.setTabIndex(-1);
		this.deferDraw();
		return true;
	},
	
	focus: function(){
		if (!this.parent()) return false;
		this.element.focus();
		this.deferDraw();
		return true;
	},
	
	blur: function(){
		if (!this.parent()) return false;
		this.element.blur();
		this.deferDraw();
		return true;
	},
	
	activate: function(){
		if (!this.parent()) return false;
		this.deferDraw();
		return true;
	},
	
	deactivate: function(){
		if (!this.parent()) return false;
		this.deferDraw();
		return true;
	},
	
	hide: function(){
		if (!this.getState('hidden')){
			this.setState('hidden', true);
			this.fireEvent('hide');
			this.deferDraw();
		}
		return this;
	},

	show: function(){
		if (this.getState('hidden')){
			this.setState('hidden', false);
			this.fireEvent('hide');
			this.deferDraw();
		}
		return this;
	},
	
	/* DOM + Registration */
	
	inject: function(widget, element){
		element = (element) ? document.id(element) : document.id(widget);

		if (element && this.element.parentNode !== element){
			this.element.inject(element);
			this.register(widget);
		}

		return this;
	},

	register: function(widget) {
		this.parent(widget);
		this.deferDraw();
	},
	
	eject: function(){
		if (this.element.parentNode){ // continue only if the element is in the dom
			this.element.dispose();
			this.unregister();
			// even though deferDraw will not fire when the element is not in the dom, this will cancel any pre-existing draw request.
			clearTimeout(this.drawTimer);
		}
		return this;
	},
	
	/* $ */
	
	toElement: function(){
		return this.element;
	}
	
});
	
})();
