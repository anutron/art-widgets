/*
---
name: ART.Input
description: Base Input Class
requires: [ART.Sheet, ART.Widget, ART/ART.Rectangle, ART.Box]
provides: ART.Input
...
*/

(function(){

ART.Sheet.define('input.art', {
	'width': 150,
	'height': 22,
	'border-color': 'hsb(0, 0, 0, 0.4)',
	'reflection-color': ['hsb(0, 0, 83)', 'hsb(0, 0, 0, 0)'],
	'background-color': 'hsb(0, 0, 100)',
	'shadow-color': 'hsb(0, 0, 0, 0.18)',
	'border-radius': [2, 2, 2, 2],
	'font-family': 'Arial',
	'font-variant': 'normal',
	'font-size': 12,
	'font-color': 'hsb(0, 0, 5)',
	'placeholder-color': 'hsb(0, 0, 60)',
	'padding': [2, 6, 2, 6]
});

ART.Sheet.define('input.art:focused', {
	'border-color': ['hsb(205, 80, 100)', 'hsb(205, 100, 95)']
});

var Input = ART.Input = new Class({
	
	Extends: ART.Box,
	
	name: 'input',
	
	options: {
		placeholder: null,
		tabIndex: null,
		inputElement: null,
		blurOnElementBlur: true,
		useChange: true,
		changeTimeout: 500
	},
	
	initialize: function(options){
		this.parent($merge(options, {useFocus: false}));
		
		this.input = (this.options.inputElement || new Element('input')).setStyles({
			border: 0, outline: "none", padding: 0, margin: 0, position: 'absolute', top: 0, left: 0, background: 'transparent',
			tabIndex: this.options.tabIndex
		}).store('widget', this);
		
		this.input.inject(this.element);
		
		this.lastChange = this.input.value;
		
		if (this.options.placeholder) this._holdPlace();
		
		var self = this;
		
		this.input.addEvents({
			
			focus: function(){
				if (self.holdingPlace) this.value = '';
				self.holdingPlace = false;
			},
			
			blur: function(){
				self._holdPlace();
			}
			
		});
		
		var change = null;
		
		if (this.options.useChange) this.input.addEvent('keydown', function(){
			var input = this;
			if (change != null) clearTimeout(change);
			change = function(){
				if (input.value != self.lastChange){
					self.fireEvent('change', input.value);
					self.lastChange = input.value;
				}
			}.delay(self.options.changeTimeout);
		});
		
		this._setFocusEvents(this.input);
	},
	
	_holdPlace: function(){
		if (this.options.placeholder && (this.input.value == '' || this.holdingPlace)){
			this.input.value = this.options.placeholder;
			this.holdingPlace = true;
		}
	},
	
	updatePlaceholder: function(placeholder){
		this.options.placeholder = placeholder;
		this._holdPlace();
		return this;
	},
	
	draw: function(newSheet){
		var sheet = this.parent(newSheet), cs = this.currentSheet;
		var boxChanged = this.boxChanged;
		
		if (cs.glyph && !this.glyphLayer){
			this.glyphLayer = new ART.Shape(cs.glyph);
			this.canvas.grab(this.glyphLayer);
		} else if (!cs.glyph && this.glyphLayer){
			this.glyphLayer.eject();
			this.glyphLayer = null;
		}
		
		if (boxChanged){
			
			this.input.setStyles({
				width: cs.width - cs.padding[1] - cs.padding[3],
				height: cs.height - cs.padding[0] - cs.padding[2],
				top: cs.padding[0],
				left: cs.padding[3],
				display: 'block'
			});
			if (this.glyphLayer) this.glyphLayer.translate(cs.glyphLeft, cs.glyphTop);
		}
		
		if (sheet.fontFamily) this.input.setStyle('font-family', sheet.fontFamily);
		if (this.holdingPlace) this.input.setStyle('color', new Color(cs.placeholderColor).toHEX());
		else this.input.setStyle('color', new Color(cs.fontColor).toHEX());
		if (sheet.fontSize) this.input.setStyle('font-size', sheet.fontSize + 'px');
		
		if (sheet.glyphColor && this.glyphLayer) this.glyphLayer.fill.apply(this.glyphLayer, $splat(cs.glyphColor));

		return this;
		
	}
	
});

})();
