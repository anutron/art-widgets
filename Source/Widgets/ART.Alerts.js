/*
---
name: ART.Alerts
description: Alert popups.
requires: [ART.Window]
provides: [ART.Alert, ART.Confirm, ART.Prompt, ART.Window.AlertTools, ART.Alerts]
...
*/

// Window Widget. Work in progress.

ART.Sheet.define('window.art.alert', {
	'content-background-color': hsb(0, 0, 91),
	'footer-height': 30,
	'height': 140,
	'width': 300,
	'footer-background-color': hsb(0, 0, 91),
	'footer-reflection-color': hsb(0, 0, 91),
	'content-border-bottom-color': hsb(0, 0, 91)
});
ART.Sheet.define('window.art.alert:hidden', {
	'display': 'none'
});
ART.Sheet.define('window.art.alert footer', {
	'float': 'right',
	'width': 'auto'
}, 'css');

ART.Sheet.define('window.art.alert content', {
	'padding': 20,
	'font-size': 14,
	'text-align': 'center'
}, 'css');

ART.Sheet.define('window.art.alert input.prompt', {
	'width': '100%'
}, 'css');

ART.Sheet.define('window.art.alert button.art.confirmations', {
	'padding-right': 15,
	'border':'none',
	'float': 'left'
}, 'css');


ART.Popup.DefaultManager.setLayer('alerts', 99);
(function(){

var holder = new Element('div', {
	styles: {
		position: 'absolute',
		visibility: 'hidden',
		zIndex: -1
	}
});
var tmp = new Element('div').inject(holder);

ART.Alert = new Class({
	
	Extends: ART.Window,
	
	name: 'window',
	
	options: {
		close: false,
		minimize: false,
		maximize: false,
		className: 'art alert',
		resizable: false,
		windowManagerLayer: 'alerts',
		destroyOnClose: true,
		autosize: true,
		buttons: [
			{
				text: 'Ok'
			}
		]
	},

	initialize: function(){
		this.parent.apply(this, arguments);

		this.addEvent('show', function(){
			var button = this.alertButtons[0];
			if (button) button.focus();
		}.bind(this));
		
		new ART.Keyboard(this, this.options.keyboardOptions);
		
		this.attachKeys({
			'keyup:esc': function(e) {
				this.hide();
			}.bind(this)
		});
	},

	draw: function(newSheet){
		var cs = this.currentSheet;
		var sheet = this.parent(newSheet);
		
		if (!this.content) return;

		var style = ART.Sheet.lookup(this.toString() + ' content', 'css');
		if (style.margin || style.padding) {
			if (Browser.Engine.trident) holder.inject(document.body);
			tmp.setStyles(style);
			var w = 0,
					h = 0;
			['margin', 'padding'].each(function(space) {
				['Top', 'Left', 'Bottom', 'Right'].each(function(side, i) {
					if (i%2) w += tmp.getStyle(space+side).toInt();
					else h += tmp.getStyle(space+side).toInt();
				});
			});
			
			tmp.style.cssText = '';
			if (Browser.Engine.trident) holder.dispose();
			
			style.width = this.contentSize.x - w; //border is hard coded to 1 on each side
			style.height = this.contentSize.y - h; //border is hard coded to 1 on each side
		}
		this.content.setStyles(style);
		this.footer.setStyles(ART.Sheet.lookup(this.toString() + ' footer', 'css'));
	},

	makeButtons: function(){
		this.parent();
		this.alertButtons = this.options.buttons.map(function(button){
			button.className = ((button.className || '') + ' art confirmations').trim();
			var b = new ART.Button(button);
			b.addEvent('press', function(e){
				if (document.id(b).hasClass(this.options.closeClass)) {
					if (e) e.preventDefault();
					this.hide();
				}
			}.bind(this));

			button.properties = button.properties || {};
			if (!button.properties['class']) button.properties['class'] = this.options.closeClass;

			document.id(b).set(button.properties);

			b.inject(this, this.footer);

			document.id(b).setStyles(ART.Sheet.lookup(b.toString(), 'css'));
			return b;
		}, this);
		var first = this.alertButtons[0];
		if (first) {
			first.enable();
			first.focus();
		}
	}

});

ART.alert = function(caption, content, callback, options) {
	return new ART.Alert(
		$extend(options || {}, {
			caption: caption,
			content: content,
			onHide: callback || $empty
		})
	);
};


ART.Confirm = new Class({
	
	Extends: ART.Alert,
	
	options: {
		className: 'art alert confirm',
		resizable: false,
		buttons: [
			{
				text: 'Cancel'
			},
			{
				text: 'Ok',
				onPress: function(){
					this.parentWidget.fireEvent('confirm');
				}
			}
		]
	}
});
ART.confirm = function(caption, content, callback, options) {
	return new ART.Confirm(
		$extend(options || {}, {
			caption: caption,
			content: content,
			onConfirm: callback || $empty
		})
	);
};

ART.Prompt = new Class({
	
	Extends: ART.Confirm,

	options: {
		onShow: function(){
			var input = this.content.getElement('input, textarea');
			if (input) input.select();
		},
		buttons: [
			{
				text: 'Cancel'
			},
			{
				text: 'Ok',
				onPress: function(){
					this.parentWidget.fireEvent('confirm', this.parentWidget.getPromptValue());
				}
			}
		]
	},
	initialize: function(){
		this.parent.apply(this, arguments);
		this.makePromptInput();
	},
	makePromptInput: function(){
		if (!this.content.getElement('form') && !this.content.getElements('input, textarea, select').length) {
			var styles = ART.Sheet.lookup(this.toString() + ' input.prompt');
			this.inputContainer = new Element('div', {
				'class': 'inputContainer',
				styles: {
					position: 'relative'
				}
			}).inject(this.content);
			this.input = new Element('input', {
				value: this.options.defaultValue || '',
				type: 'text',
				styles: styles,
				events: {
					keydown: function(e) {
						if (e.key == 'enter') {
							this.fireEvent('confirm', this.getPromptValue());
							this.hide();
							Keyboard.stop(e);
						}
					}.bind(this)
				}
			}).inject(this.inputContainer);
		}
	},
	getPromptValue: function(){
		if (this.input) return this.input.get('value');
		var form = this.content.getElement('form');
		return form ? form.toQueryString() : this.content.toQueryString();
	},
	setContent: function(){
		if (this.inputContainer) this.inputContainer.dispose();
		this.parent.apply(this, arguments);
		if (this.inputContainer) this.inputContainer.inject(this.content);
		if (this.options.autosize) this.autosize();
		return this;
	},
	show: function(){
		this.parent.apply(this, arguments);
		this.alertButtons[0].blur();
		var input = this.content.getElement('input, textarea');
		if (input) input.select.delay(5, input);
		return this;
	}
});

ART.prompt = function(caption, content, callback, options) {
	return new ART.Prompt(
		$extend(options || {}, {
			caption: caption,
			content: content,
			onConfirm: callback || $empty
		})
	);
};

ART.Window.AlertTools = new Class({

	Implements: ART.WindowTools,

	alerts: {},

	alert: function(caption, content, callback, options, alerter){
		alerter = alerter || ART.alert;
		var win = this.getWindow();
		var currentKb = win.keyboard.activeKB;
		if (win && !win.alertManager) {
			win.alertManager = new ART.WindowManager(win);
			win.alertManager.setLayer('alerts', 99);
		}
		var winsize = win.getSize();
		options = $merge({
			relativeTo: document.id(win) || document.id(this),
			inject: {
				target: document.id(win) || document.id(this),
				where: 'bottom'
			},
			mask: true,
			maskOptions: {
				inject: {
					target: document.id(this.getWindow().content),
					where: 'after'
				}
			},
			constrainToContainer: true,
			width: (winsize.width * 0.9).toInt(),
			max: {
				height: (winsize.height * 0.9).toInt(),
				width: (winsize.width * 0.9).toInt()
			}
		}, options);
		options.parentWidget = win || this;
		options.windowManager = win ? win.alertManager : null;
		var alert = alerter(caption, content, callback, options);
		var enableKB = function(){
			win.keyboard.activate(win.alertManager.keyboard);
			alert.keyboard.activate();
		};
		enableKB();
		if (win) {
			win.fireEvent('alert', alert);
			var shader = function() {
				alert.setState('hidden', true);
			};
			var unshader = function() {
				alert.setState('hidden', false);
			};
			alert.addEvents({
				destroy: function(){
					win.removeEvents({
						shade: shader,
						unshade: unshader
					});
					win.keyboard.activate(currentKb);
				},
				hide: function(){
					win.keyboard.activate(currentKb);
					win.fireEvent('endAlert');
				},
				show: function(){
					enableKB();
					win.fireEvent('alert');
				}
			});
			win.addEvents({
				shade: shader,
				unshade: unshader
			});
		}
		return alert;
	},
	confirm: function(cap, cont, fn, opt) {
		return this.alert(cap, cont, fn, opt, ART.confirm);
	},
	prompt: function(cap, cont, fn, opt) {
		return this.alert(cap, cont, fn, opt, ART.prompt);
	}
});

ART.Window.implement(new ART.Window.AlertTools);

})();