/*
Script: ART.Button.js

License:
	MIT-style license.
*/

// Button Widget. Work in progress.

ART.Sheet.defineStyle('button', {
	'font-family': 'Moderna',
	'font-variant': 'normal',
	'font-size': 11,
	'font-color': hsb(0, 100, 10),
	'padding': [5, 5, 5, 5],
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
	'glyph-bottom': 2,
	'glyph-right': 2,

	'pill': false,

	'corner-radius': 5,
	'background-color': [hsb(0, 0, 90), hsb(0, 0, 70)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 0, 0.8)
});
ART.Sheet.defineStyle('button:focus', {
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 0, 0.8)
});
ART.Sheet.defineStyle('button:active', {
	'background-color': hsb(0, 0, 40),
	'reflection-color': [hsb(0, 0, 30, 1), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 0, 0.8)
});

ART.Sheet.defineStyle('button:disabled', {
	'background-color': [hsb(0, 0, 90), hsb(0, 0, 80)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 0, 0.5),
	'glyph-color': hsb(0, 0, 0, 0.3)
});

ART.Button = new Class({

	Extends: ART.Widget,

	name: 'button',
	
	options: {
		text: null,
		glyph: null,
		tabIndex: 0
	},

	initialize: function(options){
		this.requireToRender('button:paint');
		this.parent(options);

		this.paint = new ART;

		this.borderLayer = new ART.Rectangle;
		this.fillLayer = new ART.Rectangle;
		this.backgroundLayer = new ART.Rectangle;
		
		this.paint.push(this.borderLayer, this.fillLayer, this.backgroundLayer);
		
		var style = ART.Sheet.lookupStyle(this.getSelector());
		if (style.glyph) this.options.glyph = style.glyph;
		
		if (this.options.glyph){
			this.glyphLayer = new ART.Shape;
			this.makeGlyph(this.options.glyph, true);
			this.glyphLayer.inject(this.paint);
		} else if (this.options.text){
			this.textLayer = new ART.Font(style.fontFamily, style.fontVariant);
			this.makeText(this.options.text, style.fontSize, true);
			this.textLayer.inject(this.paint);
		}
		
		$(this.paint).inject(this.element);
		
		this.readyToRender('button:paint');

		this.element.addEvents({
			focus: function(e) {
				this.enable().focus();
			}.bind(this),
			blur: function(){
				this.blur();
			}.bind(this),
			mousedown: function(e) {
				if (e) e.stopPropagation();
				this.enable().focus();
			}.bind(this)
		});
		
		var click = new Touch(this.element);
		
		click.addEvents({
			start: function(){
				this.activate();
			}.bind(this),
			end: function(){
				this.deactivate();
			}.bind(this),
			cancel: function(e){
				this.deactivate();
				this.fireEvent('press', new Event(e));
			}.bind(this)
		});
		this.attachKeys({
			'keydown:space': function(){
				this.activate();
			}.bind(this),
			'keyup:space': function(e){
				this.deactivate();
				this.fireEvent('press', e);
			}.bind(this)
		});
		this.render(this.options);
	},

	setTabIndex: function(index){
		index = $pick(index, this.tabIndex, this.options.tabIndex);
		if (index != undefined) {
			this.tabIndex = index;
			this.element.set('tabindex', index).setStyles({
			  outline: 'none'
			});
		}
	},

	enable: function(){
		this.parent.apply(this, arguments);
		this.setTabIndex();
		return this;
	},

	disable: function(){
		this.parent.apply(this, arguments);
		this.element.set('tabindex', null);
		return this;
	},

	redraw: function(options){
		this.parent();
		if (options) this.setOptions(options);
		if (!this.paint) return this;
		var style = ART.Sheet.lookupStyle(this.getSelector());
		if (this.options.width) style.width = this.options.width;
		if (this.options.height) style.height = this.options.height;
		if (this.options.styles) $extend(style, this.options.styles);

		if (this.options.text){
			if (!style.width) style.width = (this.fontBounds.right + style.padding[1] + style.padding[3]).round();
			if (!style.height) style.height = (this.fontBounds.bottom + style.padding[0] + style.padding[2]).round();
		} else if (this.options.glyph){
			if (!style.width) style.width = (this.glyphBounds.right + style.glyphLeft + style.glyphRight).round();
			if (!style.height) style.height = (this.glyphBounds.bottom + style.glyphTop + style.glyphBottom).round();
		}

		this.paint.resize(style.width, style.height);

		this.element.setStyles({
			width: style.width, 
			height: style.height,
			cursor: style.cursor
		});

		//calculate border radius
		
		['Top', 'Bottom'].each(function(side, i){
			['Left', 'Right'].each(function(dir, i) {
				if (style['cornerRadius'+side+dir] == null) style['cornerRadius'+side+dir] = style.cornerRadius;
			});
		});
		var rad0 = [style.cornerRadiusTopLeft, style.cornerRadiusTopRight, style.cornerRadiusBottomRight, style.cornerRadiusBottomLeft];
		var radM1 = [style.cornerRadiusTopLeft - 1, style.cornerRadiusTopRight - 1, style.cornerRadiusBottomRight - 1, style.cornerRadiusBottomLeft - 1];

		//make the border
		this.borderLayer.draw(style.width, style.height, rad0);
		this.borderLayer.fill.apply(this.borderLayer, $splat(style.borderColor));

		//reflection
		this.fillLayer.draw(style.width - 2, style.height - 2, radM1);
		this.fillLayer.fill.apply(this.fillLayer, $splat(style.reflectionColor));
		this.fillLayer.translate(1, 1);
		
		//background
		this.backgroundLayer.draw(style.width - 2, style.height - 3, radM1);
		this.backgroundLayer.fill.apply(this.backgroundLayer, $splat(style.backgroundColor));
		this.backgroundLayer.translate(1, 2);
		
		if (this.options.glyph){
			this.glyphLayer.fill.apply(this.glyphLayer, $splat(style.glyphColor));
			this.glyphLayer.translate(style.glyphLeft, style.glyphTop);
		} else if (this.options.text){
			this.textLayer.fill.apply(this.textLayer, $splat(style.fontColor));
			this.textLayer.translate(style.padding[3], style.padding[0]);
		}
		return this;

	},

	makeGlyph: function(glyph, nrd){
		if (!this.glyphLayer) return;
		this.glyphLayer.draw(glyph);
		this.glyphBounds = this.glyphLayer.measure();
		if (!nrd) this.render();
	},
	
	makeText: function(text, size, nrd){
		if (!this.textLayer) return;
		this.textLayer.draw(text, size);
		this.fontBounds = this.textLayer.measure();
		if (!nrd) this.render();
	}

});