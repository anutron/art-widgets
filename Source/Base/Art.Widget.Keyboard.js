/*
---
name: ART.Widget.Keyboard
description: ART Widget Keyboard Methods
requires: [ART.Widget, More/Keyboard]
provides: ART.Widget.Keyboard
...
*/

ART.Widget.Keyboard = new Class({

		_keyboardSetup: function(options){
			var kbManager;
			if (options && options.keyboardOptions && options.keyboardOptions.manager) {
				kbManager = options.keyboardOptions.manager;
				delete options.keyboardOptions.manager;
			}
			
			//create a keyboard instance for the widget
			var kbOptions = $merge(this.options.keyboardOptions, options ? options.keyboardOptions || {} : {});
			kbOptions.manager = kbManager || (parent ? parent.keyboard : null);
			var keyboard = this._keyboard = new Keyboard(kbOptions);
			keyboard.widget = this;
			this.addEvents({
				inject: function(parent) {
					if (parent.keyboard) parent.keyboard.manage(keyboard);
				},
				eject: function(parent) {
					if (parent.keyboard) Keyboard.manager.manage(keyboard);
				},
				focus: function(){
					keyboard.activate();
				},
				blur: function(){
					keyboard.deactivate();
				},
				desroy: function(){
					keyboard.deactivate();
				}
			});
			
		},

		/*
			Keyboard integration / delegation methods
		*/
		attachKeys: function(events){
			this._keyboard.addEvents(events);
		},

		detachKeys: function(events) {
			this._keyboard.removeEvents(events);
		},

		addShortcut: function(name, shortcut) {
			this._keyboard.addShortcut(name, shortcut);
		},

		addShortcuts: function(obj) {
			this._keyboard.addShortcuts(obj);
		},

		removeShortcut: function(name) {
			this._keyboard.removeShortcut(name);
		},

		removeShortcuts: function(names) {
			this._keyboard.removeShortcuts(names);
		},

		getShortcut: function(name) {
			return this._keyboard.getShortcut(name);
		},

		getShortcuts: function() {
			return this._keyboard.getShortcuts();
		}

});