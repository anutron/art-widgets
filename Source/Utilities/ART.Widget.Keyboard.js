/*
---
name: ART.Widget.Keyboard
description: ART Widget Keyboard Methods
requires: [ART.Widget, More/Keyboard]
provides: ART.Widget.Keyboard
...
*/

ART.Widget.Keyboard = new Class({

		options: {
			keyboardOptions: {}
		},

		keyboardSetup: function(options){
			//create a keyboard instance for the widget
			var keyboard = this._keyboard = new Keyboard($merge(this.options.keyboardOptions, (options && options.keyboardOptions) || {}));
			keyboard.widget = this;
			this.addEvents({
				register: function(parent) {
					if (parent.keyboard) parent.keyboard.manage(keyboard);
				},
				unregister: function(parent) {
					if (parent.keyboard && pareng.keyboard == keyboard.manager) Keyboard.manager.manage(keyboard);
				},
				focus: function(){
					keyboard.activate();
				},
				blur: function(){
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