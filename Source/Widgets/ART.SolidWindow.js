/*
---
name: ART.SolidWindow
description: A solid window class with only a header and a body.
requires: ART.Window
provides: ART.SolidWindow
...
*/

// Window Widget. Work in progress.

ART.Sheet.define('window.art.solid', {
	'content-overflow': 'hidden',
	'body-background-color': [hsb(0, 0, 95), hsb(0, 0, 80)],
	'body-reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'body-reflection-shape': 'rounded-rectangle'
});

ART.Sheet.define('window.art.solid.smoke', {
	'caption-font-color': hsb(120, 97, 83),
	'body-background-color': [hsb(0, 0, 0, 0.9), hsb(0, 0, 0, 0.8)],
	'body-reflection-color': [hsb(0, 0, 100, 0.05), hsb(0, 0, 100, 0.1)],
	'body-reflection-percent-size': 0.6,
	'content-color': hsb(120, 97, 83),
	'body-reflection-shape': 'funky-glass'
});


ART.Sheet.define('window.art.solid.smoke button.art.wincontrol', {
	'pill': true,
	'height': 14,
	'width': 14,
	'cursor': 'pointer',
	'background-color': hsb(0, 0, 100, 0),
	'reflection-color': hsb(0, 0, 100, 0),
	'shadow-color': hsb(0, 0, 100, 0),
	'border-color': hsb(0, 0, 100, 0),
	'glyph-color': hsb(120, 97, 83)
});

ART.Sheet.define('window.art.solid button.art.wincontrol', {
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 70)],
	'reflection-color': [hsb(0, 0, 95), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.7),
	'border-color': hsb(0, 0, 60),
	'glyph-color': hsb(0, 0, 0, 0.6)
});

ART.Sheet.define('window.art.solid.smoke button.art.wincontrol:disabled', {
	'background-color': hsb(0, 0, 100, 0),
	'reflection-color': hsb(0, 0, 100, 0),
	'shadow-color': hsb(0, 0, 100, 0),
	'border-color': hsb(0, 0, 100, 0),
	'glyph-color': hsb(120, 97, 83)
});

ART.Sheet.define('window.art.solid.smoke button.art.wincontrol:active', {
	'background-color': hsb(0, 0, 100, 0),
	'reflection-color': hsb(0, 0, 100, 0),
	'shadow-color': hsb(0, 0, 100, 0),
	'border-color': hsb(0, 0, 100, 0),
	'glyph-color': hsb(0, 0, 100, 1)
});

ART.SolidWindow = new Class({
	
	Extends: ART.Window,
	
	options: {
		className: 'art solid'
	},
		
	_build: function(){
		this.parent();
		this.vistaReflectionLayer = new ART.FunkyGlass;
		this.canvas.grab(this.vistaReflectionLayer);
	},

	renderContent: function(style){
		var cs = this.currentSheet;
		var sizeChanged = style.width != undefined || style.height != undefined;
		if (sizeChanged) {
			this.contentSize = {
				x: cs.width -2, 
				y: cs.height - cs.footerHeight - cs.headerHeight - 2
			};
		}
		if (cs.contentDisplay == "none") {
			this.content.setStyle('display', 'none');
		} else {
			this.content.setStyles({
				'top': 1,
				'left': 0,
				'height': this.contentSize.y < 0 ? 0 : this.contentSize.y,
				'width': this.contentSize.x < 0 ? 0 : this.contentSize.x,
				'overflow': cs.contentOverflow,
				'color': cs.contentColor,
				'display': 'block'
			});
		}

		// border layer
		
		if (sizeChanged) {
			this.borderLayer.draw(cs.width, cs.height, cs.cornerRadius + 1);
			this.header.setStyles({'width': cs.width - 2, height: cs.headerHeight - 2});
			this.headerBackgroundLayer.translate(1, 2);
			this.headerBackgroundLayer.draw(cs.width - 2, cs.height - 3, cs.cornerRadius);
			this.headerReflectionLayer.translate(1, 1);
			this.headerReflectionLayer.draw(cs.width - 2, cs.headerHeight - 2, cs.cornerRadius);
			cs.bodyReflectionPercentSize = cs.bodyReflectionPercentSize || 1;
			this.vistaReflectionLayer.translate(1,1).draw(cs.width - 2, (cs.bodyReflectionPercentSize * cs.height), cs.cornerRadius);
			this.footer.setStyles({'width': cs.width - 2, 'height': cs.footerHeight});
		}
		var colorChanged = ['border', 'bodyBackground', 'headerRefletction', 'bodyReflection'].every(function(rule) {
			return !!style[rule + 'Color'];
		});
		if (colorChanged || !this._firstDrawn) {
			this._firstDrawn = true;
			this.fill(this.borderLayer, cs.borderColor);
			this.fill(this.headerBackgroundLayer, cs.bodyBackgroundColor);
			this.fill(this.headerReflectionLayer, cs.headerReflectionColor);
			this.fill(this.vistaReflectionLayer, cs.bodyReflectionColor);
		}
	}

});

// ## This is a reflection, glossy windows vista style. Not for the faint of heart.

ART.FunkyGlass = new Class({
	
	Extends: ART.Shape,
	
	initialize: function(width, height, radius){
		this.parent();
		if (width != null && height != null && radius != null) this.deferDraw(width, height, radius);
	},
	
	draw: function(width, height, radius){

		if (radius == null) radius = [5, 5];
		if (typeof radius == 'number') radius = [radius, radius];
		var tl = radius[0], tr = radius[1];
		
		var path = new ART.Path;
		
		path.move(0, tl);
		
		if (width < 0) path.move(width, 0);
		if (height < 0) path.move(0, height);
		
		if (tl > 0) path.arc(tl, -tl);
		path.line(Math.abs(width) - (tr + tl), 0);
		
		if (tr > 0) path.counterArc(tr, tr);
		path.line(0, Math.abs(height * 0.5));

		path.counterArc(-width, height - (height * 0.5));


		path.line(0, - Math.abs(height * 0.5) + tl);
		
		path.move(width, -tl + height);
		
		return this.parent(path);
		
	}
	
});
