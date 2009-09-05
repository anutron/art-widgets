/*
Script: ART.Button.js

License:
	MIT-style license.
*/

// Button Widget. Work in progress.

ART.Sheet.defineStyle('button', {
	'font': 'moderna',
	'font-size': 11,
	'font-color': hsb(0, 100, 10),
	'padding': [5, 5, 3, 5],
	'cursor': 'pointer',

	'height': false,
	'width': false,

	'glyph': false,
	'glyph-stroke': 2,
	'glyph-color': hsb(0, 0, 0, 0.8),
	'glyph-height': 10,
	'glyph-width': 10,
	'glyph-top': 2,
	'glyph-left': 2,

	'pill': false,

	'corner-radius': 3,
	'fill-color': {0: hsb(0, 0, 100), 1: hsb(0, 0, 70)},
	'border-color': hsb(0, 0, 0, 0.7),
	'shadow-color': hsb(0, 0, 100, 0.6)
});

ART.Sheet.defineStyle('button:active', {
	'fill-color': {0: hsb(0, 0, 70), 1: hsb(0, 0, 30, 0)},
	'border-color': hsb(0, 0, 0, 0.8)
});

ART.Button = new Class({

	Extends: ART.Widget,

	name: 'button',
	
	options: {
	/*
		text: ''
	*/
	},

	initialize: function(options){
		this.parent(options);

		this.paint = new ART.Paint();
		$(this.paint).inject(this.element);

		this.element.addEvents({
			mouseover: function(e) {
				this.focus();
			}.bind(this),
			mouseout: function(){
				this.blur();
			}.bind(this),
			mousedown: function(e) {
				e.stopPropagation();
			}
		});
		
		var click = new Touch(this.element);
		
		click.addEvents({
			start: function(){
				this.activate();
			}.bind(this),
			end: function(){
				this.deactivate();
			}.bind(this),
			cancel: function(){
				this.deactivate();
				this.fireEvent('press');
			}.bind(this)
		});
		
		this.render();
	},

	render: function(){
		this.parent();
		if (!this.paint) return this;
		var style = ART.Sheet.lookupStyle(this.getSelector());
		var font = ART.Paint.lookupFont(style.font);
		if (this.options.text) {
			var fontBounds = font.measure(style.fontSize, this.options.text);
			if (!style.width) style.width = (fontBounds.x + style.padding[1] + style.padding[3] + 2).round();
			if (!style.height) style.height = (fontBounds.y + style.padding[0] + style.padding[2] + 2).round();
		}

		this.paint.resize({x: style.width, y: style.height});

		this.element.setStyles({
			width: style.width, 
			height: style.height,
			cursor: style.cursor
		});

		//make border
		var shape = 'rounded-rectangle';
		this.paint.start({x: 0, y: 0});


		['Top', 'Bottom'].each(function(side, i){
			['Left', 'Right'].each(function(dir, i) {
				if (style['cornerRadius'+side+dir] == null) style['cornerRadius'+side+dir] = style.cornerRadius;
			});
		});
		var rad = [style.cornerRadiusTopLeft, style.cornerRadiusTopRight, style.cornerRadiusBottomRight, style.cornerRadiusBottomLeft];
		

		//make the border
		this.paint.shape(shape, {x: style.width, y: style.height}, rad);
		this.paint.end({'fill': true, 'fill-color': style.borderColor});

		//main button fill
		this.paint.start({x: 1, y: 1});
		this.paint.shape(shape, {x: style.width - 2, y: style.height - 2}, rad);
		this.paint.end({'fill': true, 'fill-color': style.fillColor});

		if (style.glyph) this.makeGlyph();
	
		if (this.options.text) this.makeText(this.options.text);

		return this;

	},

	makeGlyph: function(){
		var style = ART.Sheet.lookupStyle(this.getSelector());
		this.paint.start({x: style.glyphLeft, y: style.glyphTop});
		this.paint.shape(style.glyph, {x: style.glyphWidth, y: style.glyphHeight});
		if (style.glyphStroke) this.paint.end({'stroke': true, 'stroke-width': style.glyphStroke, 'stroke-color': style.glyphColor});
		else if (style.glyphFill) this.paint.end({fill: true, fillColor: style.glyphColor});
		else this.paint.end();
	},
	
	makeText: function(text){
		var style = ART.Sheet.lookupStyle(this.getSelector());
		var font = ART.Paint.lookupFont(style.font);
		this.paint.start({x: style.padding[3] + 1, y: style.padding[0] + 1});
		this.paint.text(font, style.fontSize, this.options.text);
		this.paint.end({'fill': true, 'fill-color': style.fontColor});
	}

});