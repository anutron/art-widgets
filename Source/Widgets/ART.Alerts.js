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
	'border-color': hsb(0, 0, 80),
	'footer-background-color': hsb(0, 0, 91),
	'footer-reflection-color': hsb(0, 0, 91),
	'content-border-bottom-color': hsb(0, 0, 91)
});

ART.Sheet.defineStyle('window.alert content', {
	'padding': 20,
	'font-size': 14,
	'text-align': 'center'
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
		buttons: [
			{
				text: 'Ok'
			}
		]
	},

	render: function(){
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
			style.width = this.contentSize.w - w; //border is hard coded to 1 on each side
			style.height = this.contentSize.h - h; //border is hard coded to 1 on each side
		}
		this.content.setStyles(style);
	},

	makeButtons: function(){
		this.parent();
		this.options.buttons.each(function(button){
			var b = new ART.Button(button, {
				parentWidget: this
			});
			b.addEvent('activate', function(){
				if ($(b).hasClass(this.options.closeClass)) this.hide();
			}.bind(this));

			button.properties = button.properties || {};
			if (!button.properties['class']) button.properties['class'] = this.options.closeClass;
			$(b).set(button.properties);

			$(b).inject(this.footer).setStyles({
				'float': 'right',
				'padding-right': 10
			});
		}, this);
	}

});