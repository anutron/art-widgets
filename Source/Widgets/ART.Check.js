/*
---
name: ART.Check
description: CheckBox Class
requires: [ART.Sheet, ART.Widget, ART.Glyphs, ART.Box]
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
			border: 0, outline: "none", padding: 0, margin: 0, position: 'absolute', visibility: 'hidden',
			tabIndex: this.options.tabIndex
		}).store('widget', this);
		
		this.checked = this.input.checked;
		
		var self = this;
		
		if (this.checked) this.check();
		else this.uncheck();
		
		this.element.addEvents({

			keydown: function(event){
				if (event.key.match(/space|enter/)) self.activate();
			},
			
			keyup: function(event){
				if (event.key.match(/space|enter/) && self.deactivate()){
					if (self.checked) self.uncheck();
					else self.check();
				}
			}

		});
		
		this.touch = new Touch(this.element);
		
		this.touch.addEvents({
			
			start: function(event){
				self.activate();
			},
			
			end: function(event){
				self.deactivate();
			},
			
			cancel: function(event){
				if (self.checked) self.uncheck();
				else self.check();
				self.deactivate();
			}
		
		});
		
		this.input.inject(this.element);
	},
	
	check: function(){
		if (!this.checked){
			this.input.checked = true;
			this.checked = true;
			this.draw();
		}
		return this;
	},
	
	uncheck: function(){
		if (this.checked){
			this.input.checked = false;
			this.checked = false;
			this.draw();
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
		
		if (this.checked) this.glyphLayer.fill.apply(this.glyphLayer, $splat(cs.glyphColor));
		else this.glyphLayer.fill('rgb(0, 0, 0, 0)');
		
		return this;
	}
	
});
	
})();
