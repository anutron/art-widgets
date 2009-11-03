/*
Script: ART.Alerts.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.

ART.Sheet.defineStyle('window.alert', {
	'content-background-color': hsb(0, 0, 91),
	'footer-height': 30,
	'height': 140,
	'width': 300,
	'footer-background-color': hsb(0, 0, 91),
	'footer-reflection-color': hsb(0, 0, 91),
	'content-border-bottom-color': hsb(0, 0, 91)
});

ART.Sheet.defineStyle('window.alert footer', {
	'float': 'right',
	'width': 'auto'
});

ART.Sheet.defineStyle('window.alert content', {
	'padding': 20,
	'font-size': 14,
	'text-align': 'center'
});

ART.Sheet.defineStyle('window.alert input.prompt', {
	'width': '100%'
});

ART.Sheet.defineStyle('window.alert button.confirmations', {
	'padding-right': 10,
	'border':'none',
	'float': 'left'
});


ART.StickyWin.DefaultManager.setLayer('alerts', 99);
(function(){

var tmp = new Element('div');

ART.Alert = new Class({
	
	Extends: ART.Window,
	
	name: 'window',
	
	options: {
		close: false,
		minimize: false,
		maximize: false,
		className: 'alert',
		resizable: false,
		windowManagerLayer: 'alerts',
		destroyOnClose: true,
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
		this.attachKeys({
			'keyup:esc': function(e) {
				this.hide();
			}.bind(this)
		});
	},

	redraw: function(){
		this.parent.apply(this, arguments);
		if (!this.content) return;
		var style = ART.Sheet.lookupStyle(this.getSelector() + ' content');
		if (style.margin || style.padding) {
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
			
			style.width = this.contentSize.w - w; //border is hard coded to 1 on each side
			style.height = this.contentSize.h - h; //border is hard coded to 1 on each side
		}
		this.content.setStyles(style);
		this.footer.setStyles(ART.Sheet.lookupStyle(this.getSelector() + ' footer'));
	},

	makeButtons: function(){
		this.parent();
		this.alertButtons = this.options.buttons.map(function(button){
			button.className = ((button.className || '') + ' confirmations').trim();
			button.parentWidget = this;
			var b = new ART.Button(button);
			b.addEvent('press', function(e){
				if ($(b).hasClass(this.options.closeClass)) {
					if (e) e.preventDefault();
					this.hide();
				}
			}.bind(this));

			button.properties = button.properties || {};
			if (!button.properties['class']) button.properties['class'] = this.options.closeClass;
			$(b).set(button.properties);

			$(b).inject(this.footer).setStyles(ART.Sheet.lookupStyle(b.getSelector()));
			return b;
		}, this);
		if (this.alertButtons[0]) this.alertButtons[0].enable().focus();
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
		className: 'alert confirm',
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
			var styles = ART.Sheet.lookupStyle(this.getSelector() + ' input.prompt');
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
					keyup: function(e) {
						if (e.key == 'enter') {
							this.fireEvent('confirm', this.getPromptValue());
							this.hide();
						}
					}.bind(this)
				}
			}).inject(this.inputContainer);
		}
	},
	getPromptValue: function(){
		var form = this.content.getElement('form');
		return form ? form.toQueryString() : this.content.toQueryString();
	},
	setContent: function(){
		if (this.inputContainer) this.inputContainer.dispose();
		this.parent.apply(this, arguments);
		if (this.inputContainer) this.inputContainer.inject(this.content);
		return this;
	},
	show: function(){
		this.parent.apply(this, arguments);
		this.alertButtons[0].disable().blur();
		var input = this.content.getElement('input, textarea');
		if (input) input.select();
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

	alert: function(caption, content, callback, options, type){
		type = type || 'alert';
		var win = this.getWindow();
		if (win && !win.alertManager) win.alertManager = new ART.WindowManager();
		win.alertManager.setLayer('alerts', 99);
		options = $merge({
			relativeTo: $(win) || $(this),
			inject: {
				target: $(win) || $(this),
				where: 'bottom'
			},
			mask: true,
			maskOptions: {
				inject: {
					target: $(this.content),
					where: 'after'
				}
			},
			constrainToContainer: true
		}, options);
		options.parentWidget = win || this;
		options.windowManager = win ? win.alertManager : null;
		var alert = ART[type](caption, content, callback, options);
		if (win) {
			var shader = function(dragging) {
				$(alert).setStyle('display', dragging ? 'none' : 'block');
			};
			alert.addEvent('destroy', function(){
				win.removeEvent('shade', shader);
			}.bind(this));
			win.addEvent('shade', shader);
		}
		return alert;
	},
	confirm: function(cap, cont, fn, opt) {
		return this.alert(cap, cont, fn, opt, 'confirm');
	},
	prompt: function(cap, cont, fn, opt) {
		return this.alert(cap, cont, fn, opt, 'prompt');
	}
});

ART.Window.implement(new ART.Window.AlertTools);

})();