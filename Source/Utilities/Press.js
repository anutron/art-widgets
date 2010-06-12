/*
---
name: Press
description: Provides press, down and cancel events for a standard but pretty complex button clicking behavior.
requires: [Core/Class, Core/Events, Core/Element.Event]
provides: Press
...
*/

var Press = new Class({
	
	Implements: Events,
	
	initialize: function(element){
		this.element = document.id(element);
		var self = this;
		
		// mouse events
		
		this.onMouseEnter = function(){
			if (self.isMouseDown) self.fireEvent('down');
		};
		
		this.onMouseLeave = function(){
			if (self.isMouseDown) self.fireEvent('cancel');
		};
		
		this.onMouseDown = function(){
			document.addEvent('mouseup', self.onDocMouseUp);
			self.isMouseDown = true;
			self.fireEvent('down');
		};
		
		this.onMouseUp = function(){
			document.removeEvent('mouseup', self.onDocMouseUp);
			self.isMouseDown = false;
			self.fireEvent('press');
		};
		
		this.onDocMouseUp = function(e){
			document.removeEvent('mouseup', self.onDocMouseUp);
			self.isMouseDown = false;
		};
		
		// keyboard events
		
		this.onKeyDown = function(event){
			if (event.key.match(/space|enter/)) self.fireEvent('down');
		};
		
		this.onKeyUp = function(event){
			if (event.key.match(/space|enter/)) self.fireEvent('press');
		};
		
		this.attach();
	},
	
	attach: function(){
		this.element.addEvents({
			mouseenter: this.onMouseEnter,
			mouseleave: this.onMouseLeave,
			mouseup: this.onMouseUp,
			mousedown: this.onMouseDown,
			keyup: this.onKeyUp,
			keydown: this.onKeyDown
		});
		
		return this;
	},
	
	detach: function(){
		this.element.removeEvents({
			mouseenter: this.onMouseEnter,
			mouseleave: this.onMouseLeave,
			mouseup: this.onMouseUp,
			mousedown: this.onMouseDown,
			keyup: this.onKeyUp,
			keydown: this.onKeyDown
		});
		
		return this;
	}
	
});
