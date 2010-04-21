/*
---
name: ART.Keyboard
description: ART Widget Keyboard Methods
requires: [ART.Widget, More/Keyboard]
provides: ART.Keyboard
...
*/

ART.Keyboard = new Class({

	initialize: function(widget, keyboardOptions){
		this.widget = widget;
		var keyboard = this._keyboard = new Keyboard(keyboardOptions);
		keyboard.widget = widget;
		var self = this;
		this._widgetEvents = {
			register: function() {
				self.attachToParent();
			},
			unregister: function(parent) {
				Keyboard.manager.manage(keyboard);
			},
			focus: function(){
				keyboard.activate();
			},
			blur: function(){
				keyboard.deactivate();
			}
		};
		self.attachToParent();
		this.attach();
	},

	attachToParent: function(){
		var parent = this.widget.parentWidget;
		var keyboard;
		while (parent && parent.parentWidget && !keyboard) {
			parent = parent.parentWidget;
			if (parent) keyboard = parent.parentWidget.keyboard;
		}
		if (keyboard) keyboard.manage(this.keyboard);
	},

	attach: function(){
		this.widget.addEvents(this._widgetEvents);
		$extend(this.widget, {
			
			keyboard: this._keyboard,
			
			/*
				Keyboard integration / delegation methods
			*/
			attachKeys: function(events){
				keyboard.addEvents(events);
				return this;
			},

			detachKeys: function(events) {
				keyboard.removeEvents(events);
				return this;
			},

			addShortcut: function(name, shortcut) {
				keyboard.addShortcut(name, shortcut);
				return this;
			},

			addShortcuts: function(obj) {
				keyboard.addShortcuts(obj);
				return this;
			},

			removeShortcut: function(name) {
				keyboard.removeShortcut(name);
				return this;
			},

			removeShortcuts: function(names) {
				keyboard.removeShortcuts(names);
				return this;
			},

			getShortcut: function(name) {
				return keyboard.getShortcut(name);
			},

			getShortcuts: function() {
				return keyboard.getShortcuts();
			}
		});
	},

	detach: function(){
		this.widget.removeEvents(this._widgetEvents);
		
		['attachKeys', 'detachKeys', 'addShortcut', 'addShortcuts', 'removeShortcut',
			'removeShortcuts', 'getShortcut', 'getShortcuts'].each(function(method){
			delete this.wigdet[method];
		}, this);
	},

	getKeyboard: function(){
		return this._keyboard;
	}

});