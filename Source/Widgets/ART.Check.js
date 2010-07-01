/*
---
name: ART.Check
description: CheckBox Class
requires: [ART.Sheet, ART.Widget, ART.Glyphs, ART.Box, Press]
provides: ART.Check
...
*/

ART.Sheet.define('check.art', {
	'height': 13,
	'width': 13,
	'border-color': ['hsb(0, 0, 0, 0.6)', 'hsb(0, 0, 0, 0.7)'],
	'reflection-color': ['hsb(0, 0, 100)', 'hsb(0, 0, 0, 0)'],
	'background-color': ['hsb(0, 0, 90)', 'hsb(0, 0, 70)'],
	'shadow-color': 'hsb(0, 0, 0, 0.18)',
	
	'border-radius': [2, 2, 2, 2],
	
	'glyph': ART.Glyphs.checkMark,
	'glyph-color': 'hsb(0, 0, 0, 0.7)',
	'inactive-glyph-color': 'rgb(0, 0, 0, 0)',
	'glyph-top': 3,
	'glyph-left': 3
});

ART.Sheet.define('check.art:focused', {
	'background-color': ['hsb(0, 0, 95)', 'hsb(0, 0, 75)'],
	'border-color': ['hsb(205, 80, 100)', 'hsb(205, 100, 95)']
});

ART.Sheet.define('check.art:active', {
	'border-color': ['hsb(0, 0, 0, 0.7)', 'hsb(0, 0, 0, 0.8)'],
	'reflection-color': ['hsb(0, 0, 50)', 'hsb(0, 0, 0, 0)'],
	'background-color': ['hsb(0, 0, 60)', 'hsb(0, 0, 70)']
});

ART.Sheet.define('check.art:disabled', {
	'background-color': ['hsb(0, 0, 95)', 'hsb(0, 0, 75)'],
	'border-color': ['hsb(0, 0, 0, 0.4)', 'hsb(0, 0, 0, 0.5)'],
	'font-color': 'hsb(0, 0, 5, 0.5)',
	'glyph-color': 'hsb(0, 0, 5, 0.5)'
});

(function(){
	
var Check = ART.Check = new Class({
	
	Extends: ART.Box,
	
	name: 'check',
	
	options: {
		inputElement: null
	},
	
	initialize: function(options){
		this.parent(options);
		this.glyphLayer = new ART.Shape;
		this.canvas.grab(this.glyphLayer);
		
		this.input = (this.options.inputElement || new Element('input', {type: 'checkbox'})).setStyles({
			border: 0, outline: "none", padding: 0, margin: 0, position: 'absolute', visibility: 'hidden'
		}).store('widget', this);
		
		var self = this;
		
		var press = new Press(this.element);
		
		press.addEvent('down', function(){
			self.activate();
		});
		
		press.addEvent('press', function(){
			self.deactivate();
			self.toggle();
		});
		
		press.addEvent('cancel', function(){
			self.deactivate();
		});
		
		this.input.inject(this.element);
	},
	
	toggle: function(){
		if (this.input.checked) this.uncheck();
		else this.check();
		return this;
	},
	
	check: function(){
		if (!this.input.checked){
			this.input.checked = true;
			this.draw();
			this.fireEvent('change', true);
		}
		return this;
	},
	
	uncheck: function(){
		if (this.input.checked){
			this.input.checked = false;
			this.draw();
			this.fireEvent('change', false);
		}
		return this;
	},
	
	draw: function(newSheet){
		var sheet = this.parent(newSheet), cs = this.currentSheet;
		
		if (sheet.glyph){
			this.glyphLayer.draw(cs.glyph);
		}
		
		if (this.boxChanged){
			this.glyphLayer.translate(cs.glyphLeft, cs.glyphTop);
		}
		
		this.glyphLayer.fill.apply(this.glyphLayer, $splat((this.input.checked) ? cs.glyphColor : cs.inactiveGlyphColor));
		
		return this;
	}
	
});
	
})();
