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

		getKeyboard: function(){
			if (!this._keyboard) this._keyboardSetup();
			return this._keyboard;
		},
		/*
			Keyboard integration / delegation methods
		*/
		attachKeys: function(events){
			this.getKeyboard().addEvents(events);
			return this;
		},

		detachKeys: function(events) {
			this.getKeyboard().removeEvents(events);
			return this;
		},

		addShortcut: function(name, shortcut) {
			this.getKeyboard().addShortcut(name, shortcut);
			return this;
		},

		addShortcuts: function(obj) {
			this.getKeyboard().addShortcuts(obj);
			return this;
		},

		removeShortcut: function(name) {
			this.getKeyboard().removeShortcut(name);
			return this;
		},

		removeShortcuts: function(names) {
			this.getKeyboard().removeShortcuts(names);
			return this;
		},

		getShortcut: function(name) {
			return this.getKeyboard().getShortcut(name);
		},

		getShortcuts: function() {
			return this.getKeyboard().getShortcuts();
		}

});