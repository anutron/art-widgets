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
	},

	redraw: function(){
		this.parent();
		if (!this.content) return;
		var style = ART.Sheet.lookupStyle(this.getSelector() + ' content');
		if (style.margin || style.padding) {
			var tmp = new Element('div', {styles: style});
			var w = 0,
					h = 0;
			['margin', 'padding'].each(function(space) {
				['Top', 'Left', 'Bottom', 'Right'].each(function(side, i) {
					if (i%2) w += tmp.getStyle(space+side).toInt();
					else h += tmp.getStyle(space+side).toInt();
				});
			});
			tmp.destroy();
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
			b.addEvent('press', function(){
				if ($(b).hasClass(this.options.closeClass)) this.hide();
			}.bind(this));

			button.properties = button.properties || {};
			if (!button.properties['class']) button.properties['class'] = this.options.closeClass;
			$(b).set(button.properties);

			$(b).inject(this.footer).setStyles(ART.Sheet.lookupStyle(b.getSelector()));
		}, this);
	}

});

ART.alert = function(caption, content, callback, options) {
	return new ART.Alert(
		$extend(options, {
			caption: caption,
			content: content,
			onHide: callback
		})
	);
};


ART.Confirm = new Class({
	
	Extends: ART.Alert,
	
	options: {
		className: 'alert confirm',
		resizable: false,
		windowManagerLayer: 'alerts',
		buttons: [
			{
				text: 'Cancel'
			},
			{
				text: 'Ok',
				onPress: function(){
					this.fireEvent('confirm');
				}
			}
		]
	}
});
ART.confirm = function(caption, content, callback, options) {
	return new ART.Confirm(
		$extend(options, {
			caption: caption,
			content: content,
			onConfirm: callback
		})
	);
};

ART.Prompt = new Class({
	
	Extends: ART.Confirm,

	options: {
		onShow: function(){
			this.input.select();
		},
		defaultValue: '',
		buttons: [
			{
				text: 'Cancel'
			},
			{
				text: 'Ok',
				onPress: function(){
					this.parentWidget.fireEvent('confirm', this.parentWidget.input.get('value'));
				}
			}
		]
	},
	initialize: function(){
		this.parent.apply(this, arguments);
	},
	build: function(){
		this.parent.apply(this, arguments);
		var styles = ART.Sheet.lookupStyle(this.getSelector() + ' input.prompt');
		this.inputContainer = new Element('div', {
			'class': 'inputContainer',
			styles: {
				position: 'relative'
			}
		}).inject(this.content);
		this.input = new Element('input', {
			value: this.options.defaultValue,
			type: 'text',
			styles: styles,
			events: {
				keyup: function(e) {
					if (e.key == 'enter') {
						this.fireEvent('confirm', this.input.get('value'));
						this.hide();
					}
				}.bind(this)
			}
		}).inject(this.inputContainer);
	},
	setContent: function(){
		this.inputContainer.dispose();
		this.parent.apply(this, arguments);
		this.inputContainer.inject(this.content);
		return this;
	}	
});

ART.prompt = function(caption, content, callback, options) {
	return new ART.Prompt(
		$extend(options, {
			caption: caption,
			content: content,
			onConfirm: callback
		})
	);
};

ART.Window.AlertTools = new Class({

	alerts: {},

	alert: function(caption, content, callback, options, type){
		type = type || 'alert';
		if (!this.alertManager) this.alertManager = new ART.WindowManager();
		options = $merge({
			relativeTo: $(this),
			inject: {
				target: $(this),
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
		options.parentWidget = this;
		options.windowManager = this.alertManager;
		
		var alert = ART[type](caption, content, callback, options);
		var shader = function(dragging) {
			$(alert).setStyle('display', dragging ? 'none' : 'block');
		};
		alert.addEvent('destroy', function(){
			this.removeEvent('shade', shader);
		}.bind(this));
		this.addEvent('shade', shader);
		return alert;
	},
	confirm: function() {
		this.alert($A(arguments).push('confirm'));
	},
	prompt: function() {
		this.alert($A(arguments).push('prompt'));
	}
});

ART.Window.implement(new ART.Window.AlertTools);