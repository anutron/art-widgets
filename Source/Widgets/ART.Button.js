/*
---
name: ART.Button
description: Base Button Class
requires: [ART.Box, Press, ART/ART.Font, Touch/Touch, ART/Moderna]
provides: ART.Button
...
*/

ART.Sheet.define('button.art', {
	'border-color': ['hsb(0, 0, 0, 0.6)', 'hsb(0, 0, 0, 0.7)'],
	'reflection-color': ['hsb(0, 0, 100)', 'hsb(0, 0, 0, 0)'],
	'background-color': ['hsb(0, 0, 90)', 'hsb(0, 0, 70)'],
	'shadow-color': 'hsb(0, 0, 0, 0.18)',
	'border-radius': [4, 4, 4, 4],
	'font-family': 'Moderna',
	'font-variant': 'normal',
	'font-size': 12,
	'font-color': 'hsb(0, 0, 5)',
	'padding': [6, 8, 5, 8],
	'display': 'inline-block',
	'cursor': 'pointer',
	
	'glyph': false,
	'glyph-stroke': 2,
	'glyph-color': hsb(0, 0, 0, 0.8),
	'glyph-height': 10,
	'glyph-width': 10,
	'glyph-top': 2,
	'glyph-left': 2,
	'glyph-bottom': 2,
	'glyph-right': 2
});

ART.Sheet.define('button.art:focused', {
	'background-color': ['hsb(0, 0, 95)', 'hsb(0, 0, 75)'],
	'border-color': ['hsb(205, 80, 100)', 'hsb(205, 100, 95)']
});

ART.Sheet.define('button.art:active', {
	'border-color': ['hsb(0, 0, 0, 0.7)', 'hsb(0, 0, 0, 0.8)'],
	'reflection-color': ['hsb(0, 0, 50)', 'hsb(0, 0, 0, 0)'],
	'background-color': ['hsb(0, 0, 60)', 'hsb(0, 0, 70)']
});

ART.Sheet.define('button.art:disabled', {
	'background-color': ['hsb(0, 0, 95)', 'hsb(0, 0, 75)'],
	'border-color': ['hsb(0, 0, 0, 0.4)', 'hsb(0, 0, 0, 0.5)'],
	'font-color': 'hsb(0, 0, 5, 0.5)',
	'glyph-color': 'hsb(0, 0, 5, 0.5)'
});

ART.Sheet.define('button.art.selected', {
	'font-color': hsb(50, 100, 10),
	'glyph-color': hsb(0, 0, 0, 0.8),
	'background-color': [hsb(210, 30, 100), hsb(210, 40, 80)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-color': hsb(0, 0, 0, 0.8)
});

(function(){
	
var Button = ART.Button = new Class({
	
	Extends: ART.Box,
	
	name: 'button',
	
	options: {
		//text: null,
		//glyph: null,
		tabIndex: null,
		blurOnElementBlur: true
	},
	
	initialize: function(options){
		this.parent(options);
		
		var self = this;
		
		var press = this.press = new Press(this.element);
		
		press.addEvent('down', function(){
			self.activate();
		});
		
		press.addEvent('press', function(){
			self.deactivate();
			self.fireEvent('press');
		});
		
		press.addEvent('cancel', function(){
			self.deactivate();
		});
		
	},
	
	draw: function(newSheet){
		var sheet = this.parent(newSheet);
		var cs = this.currentSheet;
		if (sheet.display) {
			if (cs.display == "none") {
				document.id(this).setStyle('display', 'none');
				return sheet;
			} else {
				document.id(this).setStyle('display', cs.display);
			}
		}
		if (sheet.cursor) document.id(this).setStyle('cursor', cs.cursor);
		var fontChanged = !!(sheet.fontFamily || sheet.fontVariant || sheet.fontSize || sheet.text);
		var boxChanged = !!(sheet.width || sheet.height || sheet.padding || sheet.borderRadius || fontChanged || sheet.pill);

		if (sheet.glyph || ((this.options.glyph || cs.glyph) && !this.glyphLayer)){
			this.options.glyph = sheet.glyph || this.options.glyph || cs.glyph;
			if (!this.glyphLayer) this.glyphLayer = new ART.Shape;
			this.makeGlyph(this.options.glyph, true);
			this.canvas.grab(this.glyphLayer);
			boxChanged = true;
		} else if (this.options.text || sheet.text){
			if (!this.textLayer) {
				this.textLayer = new ART.Font;
				fontChanged = true;
				this.canvas.grab(this.textLayer);
			}
			if (fontChanged) this.setText(sheet.text || this.options.text, true);
		}
		
		if (boxChanged){
			this.resize(cs.width, cs.height + 1);
			this._drawBox(cs);

			if (this.glyphLayer) this.glyphLayer.translate(cs.glyphLeft, cs.glyphTop);
			else if (this.textLayer) this.textLayer.translate(cs.padding[3], cs.padding[0]);
		}
		
		if (sheet.glyphColor && this.glyphLayer) this.glyphLayer.fill.apply(this.glyphLayer, $splat(cs.glyphColor));
		else if (sheet.fontColor && this.textLayer) this.textLayer.fill.apply(this.textLayer, $splat(cs.fontColor));

		return sheet;
		
	},
	
	enable: function(){
		if (!this.parent()) return false;
		this.press.attach();
		return true;
	},
	
	disable: function(){
		if (!this.parent()) return false;
		this.press.detach();
		return true;
	},
	
	makeGlyph: function(glyph, noDraw){
		var cs = this.currentSheet;
		if (!this.glyphLayer) return;
		this.glyphLayer.draw(glyph);
		this.glyphBounds = this.glyphLayer.measure();
		if (!cs.width) cs.width = (this.glyphBounds.right + cs.glyphLeft + cs.glyphRight).round();
		if (!cs.height) cs.height = (this.glyphBounds.bottom + cs.glyphTop + cs.glyphBottom).round();
		if (!noDraw) this.deferDraw();
	},
	
	setText: function(text, noDraw){
		var cs = this.currentSheet;
		if (!this.textLayer || !text) return;
		this.options.text = text;
		this.textLayer.draw(cs.fontFamily, cs.fontVariant, text, cs.fontSize);
		this.textBox = this.textLayer.measure();
		cs.width = Math.round(this.textBox.width) + cs.padding[1] + cs.padding[3];
		cs.height = Math.round(this.textBox.height) + cs.padding[0] + cs.padding[2];
		if (!noDraw) {
			this.setStyles({
				width: cs.width,
				height: cs.height
			});
			this.deferDraw();
		}
	},
	
	getSize: function(){
		return {
			width: this.currentSheet.width,
			height: this.currentSheet.height
		};
	}
	
});
	
})();
